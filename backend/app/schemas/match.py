from pydantic import BaseModel, Field


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
