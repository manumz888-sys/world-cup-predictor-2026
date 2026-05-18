"""
Database integration tests for World Cup Predictor 2026.
All tests run against the wcp_test_db on port 5433.
"""
import pytest
from datetime import datetime
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.models import Base, User, Team, Match, Prediction, AIInsight
from app.config import settings

TEST_ENGINE = create_engine(settings.TEST_DATABASE_URL, pool_pre_ping=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)

EXPECTED_TABLES = {"users", "teams", "matches", "predictions", "ai_insights"}


@pytest.fixture(scope="module", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=TEST_ENGINE)
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)


@pytest.fixture
def db():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


def test_database_connection():
    with TEST_ENGINE.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        assert result.scalar() == 1


def test_all_tables_exist():
    inspector = inspect(TEST_ENGINE)
    existing = set(inspector.get_table_names())
    missing = EXPECTED_TABLES - existing
    assert not missing, f"Missing tables: {missing}"


def test_insert_with_relations(db):
    user = User(
        username="predictor_juan",
        email="juan@example.com",
        password_hash="hashed_pw_abc123",
    )
    db.add(user)
    db.flush()

    home_team = Team(name="Argentina", country_code="ARG", group_name="A")
    away_team = Team(name="Brazil", country_code="BRA", group_name="B")
    db.add_all([home_team, away_team])
    db.flush()

    match = Match(
        home_team_id=home_team.id,
        away_team_id=away_team.id,
        match_date=datetime(2026, 6, 15, 18, 0),
        venue="MetLife Stadium",
        stage="group",
        status="scheduled",
    )
    db.add(match)
    db.flush()

    prediction = Prediction(
        user_id=user.id,
        match_id=match.id,
        predicted_home_score=2,
        predicted_away_score=1,
    )
    db.add(prediction)
    db.flush()

    insight = AIInsight(
        match_id=match.id,
        insight_text="Argentina historically dominates Brazil in World Cup group stages.",
        confidence_score=0.72,
        model_version="claude-sonnet-4-6",
    )
    db.add(insight)
    db.commit()

    assert user.id is not None
    assert match.home_team_id == home_team.id
    assert prediction.user_id == user.id
    assert insight.match_id == match.id


def test_unique_constraint_prediction(db):
    user = User(
        username="predictor_maria",
        email="maria@example.com",
        password_hash="hashed_pw_xyz789",
    )
    db.add(user)
    db.flush()

    home_team = Team(name="France", country_code="FRA", group_name="C")
    away_team = Team(name="Germany", country_code="GER", group_name="C")
    db.add_all([home_team, away_team])
    db.flush()

    match = Match(
        home_team_id=home_team.id,
        away_team_id=away_team.id,
        match_date=datetime(2026, 6, 20, 21, 0),
        stage="group",
        status="scheduled",
    )
    db.add(match)
    db.flush()

    first = Prediction(
        user_id=user.id,
        match_id=match.id,
        predicted_home_score=1,
        predicted_away_score=1,
    )
    db.add(first)
    db.commit()

    duplicate = Prediction(
        user_id=user.id,
        match_id=match.id,
        predicted_home_score=3,
        predicted_away_score=0,
    )
    db.add(duplicate)
    with pytest.raises(IntegrityError):
        db.flush()
