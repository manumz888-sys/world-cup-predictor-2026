from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AIInsight, Match, Team
from app.schemas import AIInsightResponse
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/api/matches", tags=["ai-insights"])

CACHE_TTL_HOURS = 1


def _get_gemini() -> GeminiService:
    return GeminiService()


@router.get("/{match_id}/ai-insight", response_model=AIInsightResponse)
def get_ai_insight(
    match_id: int,
    db: Session = Depends(get_db),
    gemini: GeminiService = Depends(_get_gemini),
):
    match = db.get(Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    cutoff = datetime.now(timezone.utc) - timedelta(hours=CACHE_TTL_HOURS)

    recent = (
        db.query(AIInsight)
        .filter(
            AIInsight.match_id == match_id,
            AIInsight.generated_at >= cutoff.replace(tzinfo=None),
        )
        .order_by(AIInsight.generated_at.desc())
        .first()
    )

    if recent:
        return AIInsightResponse(
            id=recent.id,
            match_id=recent.match_id,
            insight_text=recent.insight_text,
            confidence_score=recent.confidence_score,
            model_version=recent.model_version,
            generated_at=recent.generated_at,
            from_cache=True,
        )

    home_team = db.get(Team, match.home_team_id)
    away_team = db.get(Team, match.away_team_id)
    home_name = home_team.name if home_team else f"Team {match.home_team_id}"
    away_name = away_team.name if away_team else f"Team {match.away_team_id}"

    insight_text = gemini.generate_match_insight(
        home_team=home_name,
        away_team=away_name,
        home_stats={"name": home_name},
        away_stats={"name": away_name},
    )

    insight = AIInsight(
        match_id=match_id,
        insight_text=insight_text,
        confidence_score=None,
        model_version="gemini-1.5-pro",
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)

    return AIInsightResponse(
        id=insight.id,
        match_id=insight.match_id,
        insight_text=insight.insight_text,
        confidence_score=insight.confidence_score,
        model_version=insight.model_version,
        generated_at=insight.generated_at,
        from_cache=False,
    )
