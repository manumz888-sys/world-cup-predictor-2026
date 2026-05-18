from datetime import datetime
from pydantic import BaseModel, Field


class TeamInMatch(BaseModel):
    id: int
    name: str
    country_code: str
    group_name: str | None
    flag_url: str | None
    model_config = {"from_attributes": True}


class MatchResponse(BaseModel):
    id: int
    home_team_id: int
    away_team_id: int
    home_team: TeamInMatch | None
    away_team: TeamInMatch | None
    match_date: datetime
    venue: str | None
    stage: str
    home_score: int | None
    away_score: int | None
    status: str
    model_config = {"from_attributes": True}


class MatchClose(BaseModel):
    home_score: int = Field(ge=0)
    away_score: int = Field(ge=0)


class MatchPredictionItem(BaseModel):
    prediction_id: int
    user_id: int
    username: str
    predicted_home_score: int
    predicted_away_score: int
    points_earned: int | None

    model_config = {"from_attributes": True}


class MatchPredictionsResponse(BaseModel):
    match_id: int
    predictions: list[MatchPredictionItem]
