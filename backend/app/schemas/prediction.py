from datetime import datetime
from pydantic import BaseModel, Field


class PredictionCreate(BaseModel):
    user_id: int
    match_id: int
    predicted_home_score: int = Field(ge=0)
    predicted_away_score: int = Field(ge=0)


class PredictionUpdate(BaseModel):
    predicted_home_score: int = Field(ge=0)
    predicted_away_score: int = Field(ge=0)


class PredictionResponse(BaseModel):
    id: int
    user_id: int
    match_id: int
    predicted_home_score: int
    predicted_away_score: int
    points_earned: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
