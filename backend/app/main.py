from fastapi import FastAPI
from app.routers import predictions_router, matches_router, leaderboard_router, ai_insights_router

app = FastAPI(title="World Cup Predictor 2026", version="0.1.0")

app.include_router(predictions_router)
app.include_router(matches_router)
app.include_router(leaderboard_router)
app.include_router(ai_insights_router)


@app.get("/health")
def health():
    return {"status": "ok"}
