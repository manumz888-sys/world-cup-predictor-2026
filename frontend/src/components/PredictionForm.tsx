"use client";

import { useState } from "react";
import { createPrediction } from "@/lib/api";

interface Props {
  matchId: number;
  userId: number;
  onSuccess?: (prediction: { predicted_home_score: number; predicted_away_score: number }) => void;
}

export default function PredictionForm({ matchId, userId, onSuccess }: Props) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const homeScore = parseInt(home, 10);
    const awayScore = parseInt(away, 10);
    if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
      setError("Enter valid non-negative scores.");
      return;
    }
    setLoading(true);
    try {
      await createPrediction({
        user_id: userId,
        match_id: matchId,
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
      });
      setSaved(true);
      onSuccess?.({ predicted_home_score: homeScore, predicted_away_score: awayScore });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <p className="font-mono text-xs text-cyber-green">
        ✓ Prediction saved: {home} – {away}
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2"
      data-testid="prediction-form"
    >
      <input
        type="number"
        min="0"
        max="99"
        value={home}
        onChange={(e) => setHome(e.target.value)}
        placeholder="0"
        aria-label="Home score"
        data-testid="input-home"
        className="w-12 rounded border border-cyber-border bg-cyber-bg text-center font-mono text-sm text-cyber-blue focus:border-cyber-blue focus:outline-none focus:shadow-glow-blue"
      />
      <span className="font-mono text-slate-500">–</span>
      <input
        type="number"
        min="0"
        max="99"
        value={away}
        onChange={(e) => setAway(e.target.value)}
        placeholder="0"
        aria-label="Away score"
        data-testid="input-away"
        className="w-12 rounded border border-cyber-border bg-cyber-bg text-center font-mono text-sm text-cyber-blue focus:border-cyber-blue focus:outline-none focus:shadow-glow-blue"
      />
      <button
        type="submit"
        disabled={loading}
        data-testid="btn-submit-prediction"
        className="rounded border border-cyber-blue/50 bg-cyber-blue/10 px-3 py-1 font-mono text-xs text-cyber-blue transition-all hover:bg-cyber-blue/20 hover:shadow-glow-blue disabled:opacity-50"
      >
        {loading ? "..." : "Predict"}
      </button>
      {error && (
        <span className="font-mono text-xs text-cyber-red" data-testid="prediction-error">
          {error}
        </span>
      )}
    </form>
  );
}
