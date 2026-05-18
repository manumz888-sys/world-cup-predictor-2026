"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchAIInsight } from "@/lib/api";
import type { AIInsight, Match } from "@/types";

const FLAG: Record<string, string> = {
  ARG:"🇦🇷", BRA:"🇧🇷", FRA:"🇫🇷", GER:"🇩🇪", ESP:"🇪🇸",
  POR:"🇵🇹", ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", NED:"🇳🇱", USA:"🇺🇸", MEX:"🇲🇽",
  JPN:"🇯🇵", MOR:"🇲🇦", ITA:"🇮🇹", KOR:"🇰🇷", SEN:"🇸🇳",
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color =
    pct >= 70 ? "bg-cyber-green shadow-glow-green" :
    pct >= 40 ? "bg-cyber-gold shadow-glow-gold" :
                "bg-cyber-red shadow-glow-red";
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between font-mono text-xs text-slate-400">
        <span>Confidence</span>
        <span className={pct >= 70 ? "text-cyber-green" : pct >= 40 ? "text-cyber-gold" : "text-cyber-red"}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-cyber-border">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export default function MatchAnalysisPage() {
  const params = useParams();
  const matchId = Number(params.id);

  const [match, setMatch] = useState<Match | null>(null);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/matches/${matchId}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.statusText))
      .then(setMatch)
      .catch(() => null);
  }, [matchId]);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAIInsight(matchId);
      setInsight(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const homeName = match?.home_team?.name ?? "Home Team";
  const awayName = match?.away_team?.name ?? "Away Team";
  const homeFlag = FLAG[match?.home_team?.country_code ?? ""] ?? "🏳";
  const awayFlag = FLAG[match?.away_team?.country_code ?? ""] ?? "🏳";

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <h1 className="font-exo text-3xl font-black tracking-widest text-cyber-blue drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">
          MATCH ANALYSIS
        </h1>
        {match && (
          <p className="mt-1 font-mono text-xs text-slate-500">
            {match.stage.toUpperCase().replace("_", " ")} ·{" "}
            {new Date(match.match_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        )}
      </header>

      {/* Teams */}
      <div className="flex items-center justify-center gap-6 rounded-xl border border-cyber-border bg-cyber-surface p-6">
        <div className="flex-1 text-center">
          <span className="text-5xl">{homeFlag}</span>
          <p className="mt-2 font-exo text-sm font-bold text-slate-200">{homeName}</p>
          <p className="font-mono text-[10px] text-slate-500">HOME</p>
        </div>
        <div className="font-exo text-2xl font-black text-slate-600">VS</div>
        <div className="flex-1 text-center">
          <span className="text-5xl">{awayFlag}</span>
          <p className="mt-2 font-exo text-sm font-bold text-slate-200">{awayName}</p>
          <p className="font-mono text-[10px] text-slate-500">AWAY</p>
        </div>
      </div>

      {/* Generate button */}
      <div className="text-center">
        <button
          onClick={handleGenerate}
          disabled={loading}
          data-testid="btn-generate-insight"
          className="rounded-lg border border-cyber-blue/50 bg-cyber-blue/10 px-8 py-3 font-exo font-bold tracking-widest text-cyber-blue transition-all duration-200 hover:bg-cyber-blue/20 hover:shadow-glow-blue disabled:opacity-50"
        >
          {loading ? "🔄 Analizando..." : "🤖 Generar Análisis IA"}
        </button>
      </div>

      {loading && (
        <div className="rounded-xl border border-cyber-blue/30 bg-cyber-surface p-6 text-center" data-testid="loading-insight">
          <div className="font-mono text-2xl tracking-widest text-cyber-blue animate-pulse">
            ⬛ ⬛ ⬛
          </div>
          <p className="mt-3 font-mono text-sm text-slate-400">AI is analyzing tactical data…</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-cyber-red/40 bg-cyber-red/10 p-4 font-mono text-sm text-cyber-red">
          ⚠ {error}
        </div>
      )}

      {insight && !loading && (
        <div data-testid="insight-card" className="rounded-xl border border-cyber-blue/40 bg-cyber-surface p-6 shadow-glow-blue">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-exo text-sm font-bold tracking-widest text-cyber-blue">🤖 AI INSIGHT</h2>
            <div className="flex items-center gap-2">
              {insight.from_cache && (
                <span className="rounded border border-cyber-gold/30 px-2 py-0.5 font-mono text-[10px] text-cyber-gold">CACHED</span>
              )}
              <span className="font-mono text-[10px] text-slate-500">{insight.model_version}</span>
            </div>
          </div>
          <p className="font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">{insight.insight_text}</p>
          {insight.confidence_score != null && <ConfidenceBar score={insight.confidence_score} />}
        </div>
      )}
    </div>
  );
}
