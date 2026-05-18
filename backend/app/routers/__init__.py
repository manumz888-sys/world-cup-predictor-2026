from .predictions import router as predictions_router
from .matches import router as matches_router
from .leaderboard import router as leaderboard_router
from .ai_insights import router as ai_insights_router

__all__ = ["predictions_router", "matches_router", "leaderboard_router", "ai_insights_router"]
