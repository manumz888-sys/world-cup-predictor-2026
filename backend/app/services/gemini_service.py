import httpx
from app.config import settings

BASE_URL = "https://generativelanguage.googleapis.com"
MODEL = "gemini-1.5-pro"


class GeminiService:
    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or getattr(settings, "GEMINI_API_KEY", "")

    def _endpoint(self) -> str:
        return f"{BASE_URL}/v1beta/models/{MODEL}:generateContent"

    def generate_match_insight(
        self,
        home_team: str,
        away_team: str,
        home_stats: dict,
        away_stats: dict,
    ) -> str:
        prompt = (
            f"Analyze the upcoming 2026 FIFA World Cup match between "
            f"{home_team} (home) and {away_team} (away).\n\n"
            f"{home_team} stats: {home_stats}\n"
            f"{away_team} stats: {away_stats}\n\n"
            "Provide:\n"
            "1. Tactical analysis of both teams\n"
            "2. Win probability for each side and for a draw\n"
            "3. Predicted final scoreline with reasoning\n"
            "Keep the response concise (under 200 words)."
        )

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 512},
        }

        with httpx.Client() as client:
            resp = client.post(
                self._endpoint(),
                json=payload,
                params={"key": self._api_key},
                headers={"Content-Type": "application/json"},
                timeout=30,
            )
            resp.raise_for_status()
            data = resp.json()

        return (
            data["candidates"][0]["content"]["parts"][0]["text"]
        )
