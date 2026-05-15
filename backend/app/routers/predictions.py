from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Match, Prediction, User
from app.schemas import PredictionCreate, PredictionResponse, PredictionUpdate

router = APIRouter(prefix="/api/predictions", tags=["predictions"])


def _get_scheduled_match(match_id: int, db: Session) -> Match:
    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != "scheduled":
        raise HTTPException(
            status_code=400,
            detail=f"Match is '{match.status}', predictions only allowed for scheduled matches",
        )
    return match


@router.post("/", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def create_prediction(payload: PredictionCreate, db: Session = Depends(get_db)):
    if not db.get(User, payload.user_id):
        raise HTTPException(status_code=404, detail="User not found")

    _get_scheduled_match(payload.match_id, db)

    existing = (
        db.query(Prediction)
        .filter(Prediction.user_id == payload.user_id, Prediction.match_id == payload.match_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="Prediction already exists for this user and match")

    prediction = Prediction(
        user_id=payload.user_id,
        match_id=payload.match_id,
        predicted_home_score=payload.predicted_home_score,
        predicted_away_score=payload.predicted_away_score,
        points_earned=None,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction


@router.put("/{prediction_id}", response_model=PredictionResponse)
def update_prediction(prediction_id: int, payload: PredictionUpdate, db: Session = Depends(get_db)):
    prediction = db.get(Prediction, prediction_id)
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")

    _get_scheduled_match(prediction.match_id, db)

    prediction.predicted_home_score = payload.predicted_home_score
    prediction.predicted_away_score = payload.predicted_away_score
    db.commit()
    db.refresh(prediction)
    return prediction
