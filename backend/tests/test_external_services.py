"""
Phase 3 tests: external service integrations using mocks.
No real HTTP calls are made.
"""
import json
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import settings
from app.database import get_db
from app.main import app
from app.models import AIInsight, Base, Match, Team
from app.routers.ai_insights import _get_gemini
from app.services.football_api import FootballAPIService
from app.services.gemini_service import GeminiService

# ── Test DB ────────────────────────────────────────────────────────────────────

TEST_ENGINE = create_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=TEST_ENGINE)
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


# ── Shared fixture: one match seeded per module ───────────────────────────────

@pytest.fixture(scope="module")
def seeded_match():
    db = TestingSession()
    try:
        home = Team(name="Spain", country_code="ESP", group_name="E")
        away = Team(name="Portugal", country_code="POR", group_name="E")
        db.add_all([home, away])
        db.flush()

        match = Match(
            home_team_id=home.id,
            away_team_id=away.id,
            match_date=datetime(2026, 7, 1, 20, 0),
            stage="round_of_16",
            status="scheduled",
        )
        db.add(match)
        db.commit()
        return {"match_id": match.id, "home_name": home.name, "away_name": away.name}
    finally:
        db.close()


# ── API-Football mock response builders ───────────────────────────────────────

def _make_fixture_response(fixtures: list[dict]) -> MagicMock:
    mock_resp = MagicMock()
    mock_resp.raise_for_status = MagicMock()
    mock_resp.json.return_value = {"response": fixtures}
    return mock_resp


def _live_fixture(fid: int, home: str, away: str, home_g: int, away_g: int) -> dict:
    return {
        "fixture": {
            "id": fid,
            "status": {"short": "2H", "elapsed": 67},
            "venue": {"name": "Estadio Azteca"},
        },
        "teams": {"home": {"name": home}, "away": {"name": away}},
        "goals": {"home": home_g, "away": away_g},
    }


# ── Test 1: FootballAPIService parses live matches correctly ──────────────────

def test_football_api_mock():
    raw_fixtures = [
        _live_fixture(1001, "Argentina", "Brazil", 1, 0),
        _live_fixture(1002, "France", "Germany", 2, 2),
    ]

    with patch("app.services.football_api.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_client.get.return_value = _make_fixture_response(raw_fixtures)

        service = FootballAPIService(api_key="fake-key")
        result = service.get_live_matches()

    assert len(result) == 2

    arg1 = result[0]
    assert arg1["api_football_id"] == 1001
    assert arg1["home_team"] == "Argentina"
    assert arg1["away_team"] == "Brazil"
    assert arg1["home_score"] == 1
    assert arg1["away_score"] == 0
    assert arg1["status"] == "2H"
    assert arg1["elapsed"] == 67

    arg2 = result[1]
    assert arg2["api_football_id"] == 1002
    assert arg2["home_score"] == 2
    assert arg2["away_score"] == 2

    # verify correct endpoint was called
    mock_client.get.assert_called_once()
    call_kwargs = mock_client.get.call_args
    assert "fixtures" in call_kwargs.args[0]
    assert call_kwargs.kwargs["headers"]["X-RapidAPI-Key"] == "fake-key"


# ── Test 2: GeminiService parses response correctly ───────────────────────────

def test_gemini_mock():
    expected_text = (
        "Spain vs Portugal: A tactical battle expected. "
        "Spain 55% win probability. Predicted score: 2-1."
    )
    gemini_response = {
        "candidates": [
            {"content": {"parts": [{"text": expected_text}]}}
        ]
    }

    with patch("app.services.gemini_service.httpx.Client") as mock_client_cls:
        mock_client = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_client
        mock_resp = MagicMock()
        mock_resp.raise_for_status = MagicMock()
        mock_resp.json.return_value = gemini_response
        mock_client.post.return_value = mock_resp

        service = GeminiService(api_key="fake-gemini-key")
        result = service.generate_match_insight(
            home_team="Spain",
            away_team="Portugal",
            home_stats={"played": 10, "wins": 7},
            away_stats={"played": 10, "wins": 6},
        )

    assert result == expected_text

    # verify correct endpoint and payload
    mock_client.post.assert_called_once()
    call_args = mock_client.post.call_args
    assert "gemini-1.5-pro" in call_args.args[0]
    sent_payload = call_args.kwargs["json"]
    prompt_text = sent_payload["contents"][0]["parts"][0]["text"]
    assert "Spain" in prompt_text
    assert "Portugal" in prompt_text
    assert "tactical" in prompt_text.lower()


# ── Test 3: AI insight endpoint — generates and caches ────────────────────────

def test_ai_insight_endpoint_mock(client, seeded_match):
    insight_text = "Spain dominates possession. Predict 2-0 Spain win."
    gemini_mock = MagicMock(spec=GeminiService)
    gemini_mock.generate_match_insight.return_value = insight_text

    app.dependency_overrides[_get_gemini] = lambda: gemini_mock

    try:
        # First call: Gemini should be invoked
        resp1 = client.get(f"/api/matches/{seeded_match['match_id']}/ai-insight")
        assert resp1.status_code == 200
        body1 = resp1.json()
        assert body1["insight_text"] == insight_text
        assert body1["from_cache"] is False
        assert body1["match_id"] == seeded_match["match_id"]
        gemini_mock.generate_match_insight.assert_called_once()

        # Second call: served from cache, Gemini NOT called again
        resp2 = client.get(f"/api/matches/{seeded_match['match_id']}/ai-insight")
        assert resp2.status_code == 200
        body2 = resp2.json()
        assert body2["insight_text"] == insight_text
        assert body2["from_cache"] is True
        gemini_mock.generate_match_insight.assert_called_once()  # still once
    finally:
        app.dependency_overrides.pop(_get_gemini, None)


# ── Test 4: Cache expired → Gemini is called again ────────────────────────────

@pytest.fixture
def match_with_stale_insight():
    """Creates an isolated match + a 2-hour-old insight for the cache-expiry test."""
    db = TestingSession()
    try:
        home = Team(name="Italy", country_code="ITA", group_name="F")
        away = Team(name="Netherlands", country_code="NED", group_name="F")
        db.add_all([home, away])
        db.flush()

        match = Match(
            home_team_id=home.id,
            away_team_id=away.id,
            match_date=datetime(2026, 7, 5, 18, 0),
            stage="quarter_final",
            status="scheduled",
        )
        db.add(match)
        db.flush()

        stale = AIInsight(
            match_id=match.id,
            insight_text="Old stale insight from 2 hours ago.",
            model_version="gemini-1.5-pro",
            generated_at=datetime.utcnow() - timedelta(hours=2),
        )
        db.add(stale)
        db.commit()
        return match.id
    finally:
        db.close()


def test_ai_insight_cache_expired(client, match_with_stale_insight):
    fresh_text = "Fresh insight after cache expired."
    gemini_mock = MagicMock(spec=GeminiService)
    gemini_mock.generate_match_insight.return_value = fresh_text

    app.dependency_overrides[_get_gemini] = lambda: gemini_mock

    try:
        resp = client.get(f"/api/matches/{match_with_stale_insight}/ai-insight")
        assert resp.status_code == 200
        body = resp.json()
        # Only stale insight exists → endpoint must call Gemini for a fresh one
        assert body["insight_text"] == fresh_text
        assert body["from_cache"] is False
        gemini_mock.generate_match_insight.assert_called_once()
    finally:
        app.dependency_overrides.pop(_get_gemini, None)
