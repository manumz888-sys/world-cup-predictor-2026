"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MatchStatusBadge from "@/components/MatchStatusBadge";
import PredictionForm from "@/components/PredictionForm";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { Match } from "@/types";

const DEMO_USER_ID = 1;
const DEMO_USER_POINTS = 42;

function countryFlag(code: string): string {
  const map: Record<string, string> = {
    ARG: "🇦🇷", BRA: "🇧🇷", FRA: "🇫🇷", GER: "🇩🇪", ESP: "🇪🇸",
    POR: "🇵🇹", ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", ITA: "🇮🇹", NED: "🇳🇱", USA: "🇺🇸",
    MEX: "🇲🇽", JPN: "🇯🇵", KOR: "🇰🇷", MOR: "🇲🇦", SEN: "🇸🇳",
  };
  return map[code?.toUpperCase()] ?? "🏳";
}

export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/matches")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        setMatches(Array.isArray(data) ? data : data.matches ?? []);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-exo text-3xl font-black tracking-widest text-cyber-blue drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]">
            DASHBOARD
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-500">
            Make your predictions before kickoff
          </p>
        </div>
        <div className="rounded-lg border border-cyber-gold/30 bg-cyber-gold/5 px-5 py-3 shadow-glow-gold">
          <p className="font-mono text-xs text-slate-400">YOUR POINTS</p>
          <p className="font-exo text-2xl font-bold text-cyber-gold">
            {DEMO_USER_POINTS}
          </p>
        </div>
      </header>

      {/* Match list */}
      {loading && <LoadingSkeleton rows={4} />}
      {error && (
        <div className="rounded-lg border border-cyber-red/40 bg-cyber-red/10 p-4 font-mono text-sm text-cyber-red">
          ⚠ Could not load matches: {error}
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div className="rounded-lg border border-cyber-border bg-cyber-surface p-8 text-center font-mono text-slate-500">
          No matches found.
        </div>
      )}

      <div className="space-y-3" data-testid="match-list">
        {matches.map((match) => {
          const homeCode = match.home_team?.country_code ?? "";
          const awayCode = match.away_team?.country_code ?? "";
          const homeName = match.home_team?.name ?? `Team ${match.home_team_id}`;
          const awayName = match.away_team?.name ?? `Team ${match.away_team_id}`;

          return (
            <article
              key={match.id}
              data-testid="match-card"
              className="rounded-xl border border-cyber-border bg-cyber-surface p-5 transition-all duration-200 hover:border-cyber-blue/50 hover:shadow-glow-blue"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Teams */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-3xl">{countryFlag(homeCode)}</span>
                    <p className="mt-1 font-exo text-sm font-semibold text-slate-200">
                      {homeName}
                    </p>
                  </div>
                  <div className="font-exo text-xl font-black text-slate-500">VS</div>
                  <div className="text-center">
                    <span className="text-3xl">{countryFlag(awayCode)}</span>
                    <p className="mt-1 font-exo text-sm font-semibold text-slate-200">
                      {awayName}
                    </p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <MatchStatusBadge status={match.status} />
                  <p className="font-mono text-xs text-slate-500">
                    {new Date(match.match_date).toLocaleString("en-US", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                  {match.venue && (
                    <p className="font-mono text-[10px] text-slate-600">📍 {match.venue}</p>
                  )}
                </div>
              </div>

              {/* Result or Prediction form */}
              <div className="mt-4 border-t border-cyber-border pt-3">
                {match.status === "finished" ? (
                  <div className="flex items-center gap-6">
                    <div className="font-mono text-sm">
                      <span className="text-slate-500">Result: </span>
                      <span className="text-cyber-gold font-bold">
                        {match.home_score} – {match.away_score}
                      </span>
                    </div>
                    <Link
                      href={`/match/${match.id}`}
                      className="font-mono text-xs text-cyber-blue hover:underline"
                    >
                      View AI Analysis →
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <PredictionForm
                      matchId={match.id}
                      userId={DEMO_USER_ID}
                    />
                    <Link
                      href={`/match/${match.id}`}
                      className="font-mono text-xs text-slate-500 hover:text-cyber-blue"
                    >
                      🤖 AI Analysis →
                    </Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
