from datetime import datetime
from pydantic import BaseModel


class AIInsightResponse(BaseModel):
    id: int
    match_id: int
    insight_text: str
    confidence_score: float | None
    model_version: str | None
    generated_at: datetime
    from_cache: bool = False

    model_config = {"from_attributes": True}
