const API_BASE = "/api";

export async function fetchMatches() {
  const res = await fetch(`${API_BASE}/matches`);
  if (!res.ok) throw new Error("Failed to fetch matches");
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE}/leaderboard/`);
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchAIInsight(matchId: number) {
  const res = await fetch(`${API_BASE}/matches/${matchId}/ai-insight`);
  if (!res.ok) throw new Error("Failed to fetch AI insight");
  return res.json();
}

export async function createPrediction(payload: {
  user_id: number;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
}) {
  const res = await fetch(`${API_BASE}/predictions/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to create prediction");
  }
  return res.json();
}
