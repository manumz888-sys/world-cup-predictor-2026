from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Match, Prediction, User
from app.schemas import MatchClose, MatchPredictionsResponse, MatchResponse
from app.schemas.match import MatchPredictionItem
from app.services.scoring import calculate_points

router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.get("/", response_model=list[MatchResponse])
def list_matches(status: str | None = None, db: Session = Depends(get_db)):
    from app.models import Team
    q = db.query(Match)
    if status:
        q = q.filter(Match.status == status)
    matches = q.order_by(Match.match_date).all()
    result = []
    for m in matches:
        home_team = db.get(Team, m.home_team_id)
        away_team = db.get(Team, m.away_team_id)
        m.home_team = home_team
        m.away_team = away_team
        result.append(m)
    return result


@router.get("/{match_id}", response_model=MatchResponse)
def get_match(match_id: int, db: Session = Depends(get_db)):
    from app.models import Team
    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    match.home_team = db.get(Team, match.home_team_id)
    match.away_team = db.get(Team, match.away_team_id)
    return match


@router.post("/{match_id}/close")
def close_match(match_id: int, payload: MatchClose, db: Session = Depends(get_db)):
    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != "scheduled":
        raise HTTPException(status_code=400, detail=f"Match is already '{match.status}'")

    match.home_score = payload.home_score
    match.away_score = payload.away_score
    match.status = "finished"

    predictions = db.query(Prediction).filter(Prediction.match_id == match_id).all()
    for pred in predictions:
        pts = calculate_points(
            pred.predicted_home_score,
            pred.predicted_away_score,
            payload.home_score,
            payload.away_score,
        )
        pred.points_earned = pts
        user = db.get(User, pred.user_id)
        if user:
            user.total_points += pts

    db.commit()
    return {"match_id": match_id, "status": "finished", "predictions_scored": len(predictions)}


@router.get("/{match_id}/predictions", response_model=MatchPredictionsResponse)
def get_match_predictions(match_id: int, db: Session = Depends(get_db)):
    if not db.get(Match, match_id):
        raise HTTPException(status_code=404, detail="Match not found")

    rows = (
        db.query(Prediction, User.username)
        .join(User, Prediction.user_id == User.id)
        .filter(Prediction.match_id == match_id)
        .all()
    )

    items = [
        MatchPredictionItem(
            prediction_id=pred.id,
            user_id=pred.user_id,
            username=username,
            predicted_home_score=pred.predicted_home_score,
            predicted_away_score=pred.predicted_away_score,
            points_earned=pred.points_earned,
        )
        for pred, username in rows
    ]
    return MatchPredictionsResponse(match_id=match_id, predictions=items)
