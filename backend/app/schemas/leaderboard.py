from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    total_points: int
    avatar_url: str | None

    model_config = {"from_attributes": True}
