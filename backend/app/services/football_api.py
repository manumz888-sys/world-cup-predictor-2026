import httpx
from app.config import settings


BASE_URL = "https://v3.football.api-sports.io"


class FootballAPIService:
    def __init__(self, api_key: str | None = None):
        self._api_key = api_key or getattr(settings, "API_FOOTBALL_KEY", "")

    def _headers(self) -> dict:
        return {"X-RapidAPI-Key": self._api_key}

    def get_live_matches(self) -> list[dict]:
        with httpx.Client() as client:
            resp = client.get(
                f"{BASE_URL}/fixtures",
                headers=self._headers(),
                params={"live": "all"},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        return [
            {
                "api_football_id": f["fixture"]["id"],
                "home_team": f["teams"]["home"]["name"],
                "away_team": f["teams"]["away"]["name"],
                "home_score": f["goals"]["home"],
                "away_score": f["goals"]["away"],
                "status": f["fixture"]["status"]["short"],
                "venue": f["fixture"]["venue"]["name"],
                "elapsed": f["fixture"]["status"]["elapsed"],
            }
            for f in data.get("response", [])
        ]

    def get_match_result(self, api_football_id: int) -> dict | None:
        with httpx.Client() as client:
            resp = client.get(
                f"{BASE_URL}/fixtures",
                headers=self._headers(),
                params={"id": api_football_id},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        items = data.get("response", [])
        if not items:
            return None

        f = items[0]
        return {
            "api_football_id": f["fixture"]["id"],
            "home_score": f["goals"]["home"],
            "away_score": f["goals"]["away"],
            "status": f["fixture"]["status"]["short"],
        }

    def get_team_stats(self, team_id: int) -> dict:
        with httpx.Client() as client:
            resp = client.get(
                f"{BASE_URL}/teams/statistics",
                headers=self._headers(),
                params={"team": team_id, "season": 2026},
                timeout=10,
            )
            resp.raise_for_status()
            data = resp.json()

        raw = data.get("response", {})
        return {
            "team_id": team_id,
            "team_name": raw.get("team", {}).get("name", ""),
            "played": raw.get("fixtures", {}).get("played", {}).get("total", 0),
            "wins": raw.get("fixtures", {}).get("wins", {}).get("total", 0),
            "draws": raw.get("fixtures", {}).get("draws", {}).get("total", 0),
            "losses": raw.get("fixtures", {}).get("loses", {}).get("total", 0),
            "goals_for": raw.get("goals", {}).get("for", {}).get("total", {}).get("total", 0),
            "goals_against": raw.get("goals", {}).get("against", {}).get("total", {}).get("total", 0),
        }
