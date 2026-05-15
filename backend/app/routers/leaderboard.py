from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LeaderboardEntry

router = APIRouter(prefix="/api/leaderboard", tags=["leaderboard"])


@router.get("/", response_model=list[LeaderboardEntry])
def get_leaderboard(limit: int = 50, db: Session = Depends(get_db)):
    users = (
        db.query(User)
        .filter(User.is_active == True)
        .order_by(User.total_points.desc())
        .limit(limit)
        .all()
    )
    return [
        LeaderboardEntry(
            rank=i + 1,
            user_id=u.id,
            username=u.username,
            total_points=u.total_points,
            avatar_url=u.avatar_url,
        )
        for i, u in enumerate(users)
    ]
