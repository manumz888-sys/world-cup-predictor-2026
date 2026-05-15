"""
Integration test: full prediction engine flow.
Covers creation, scoring, and leaderboard ordering.
"""
import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import get_db
from app.models import Base, User, Team, Match
from app.config import settings

# ── Test DB setup ──────────────────────────────────────────────────────────────

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


@pytest.fixture(scope="module")
def seeded_data():
    """Insert two users, two teams and one match; return their IDs."""
    db = TestingSession()
    try:
        user_a = User(username="user_a", email="a@test.com", password_hash="hash_a")
        user_b = User(username="user_b", email="b@test.com", password_hash="hash_b")
        db.add_all([user_a, user_b])
        db.flush()

        home = Team(name="Argentina", country_code="AR2", group_name="A")
        away = Team(name="Brazil", country_code="BR2", group_name="B")
        db.add_all([home, away])
        db.flush()

        match = Match(
            home_team_id=home.id,
            away_team_id=away.id,
            match_date=datetime(2026, 6, 15, 18, 0),
            stage="group",
            status="scheduled",
        )
        db.add(match)
        db.commit()

        return {
            "user_a_id": user_a.id,
            "user_b_id": user_b.id,
            "match_id": match.id,
        }
    finally:
        db.close()


# ── Tests ──────────────────────────────────────────────────────────────────────

def test_user_a_predicts_2_1(client, seeded_data):
    resp = client.post("/api/predictions/", json={
        "user_id": seeded_data["user_a_id"],
        "match_id": seeded_data["match_id"],
        "predicted_home_score": 2,
        "predicted_away_score": 1,
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["predicted_home_score"] == 2
    assert data["predicted_away_score"] == 1
    assert data["points_earned"] is None
    seeded_data["pred_a_id"] = data["id"]


def test_user_b_predicts_2_0(client, seeded_data):
    # 2-0 vs actual 2-1: correct winner (home), wrong goal diff → 3 pts
    resp = client.post("/api/predictions/", json={
        "user_id": seeded_data["user_b_id"],
        "match_id": seeded_data["match_id"],
        "predicted_home_score": 2,
        "predicted_away_score": 0,
    })
    assert resp.status_code == 201
    seeded_data["pred_b_id"] = resp.json()["id"]


def test_duplicate_prediction_rejected(client, seeded_data):
    resp = client.post("/api/predictions/", json={
        "user_id": seeded_data["user_a_id"],
        "match_id": seeded_data["match_id"],
        "predicted_home_score": 3,
        "predicted_away_score": 0,
    })
    assert resp.status_code == 409


def test_close_match_scores_correctly(client, seeded_data):
    resp = client.post(f"/api/matches/{seeded_data['match_id']}/close", json={
        "home_score": 2,
        "away_score": 1,
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "finished"
    assert body["predictions_scored"] == 2


def test_user_a_received_10_points(client, seeded_data):
    resp = client.get(f"/api/matches/{seeded_data['match_id']}/predictions")
    assert resp.status_code == 200
    preds = {p["user_id"]: p for p in resp.json()["predictions"]}

    assert preds[seeded_data["user_a_id"]]["points_earned"] == 10
    assert preds[seeded_data["user_b_id"]]["points_earned"] == 3


def test_leaderboard_shows_user_a_first(client, seeded_data):
    resp = client.get("/api/leaderboard/")
    assert resp.status_code == 200
    board = resp.json()
    assert board[0]["username"] == "user_a"
    assert board[0]["total_points"] == 10
    assert board[0]["rank"] == 1
    assert board[1]["username"] == "user_b"
    assert board[1]["total_points"] == 3
    assert board[1]["rank"] == 2
