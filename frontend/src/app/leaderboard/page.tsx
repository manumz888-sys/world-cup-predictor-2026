"use client";

import { useEffect, useState } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { LeaderboardEntry } from "@/types";

const DEMO_USER_ID = 1;

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };
const RANK_BG: Record<number, string> = {
  1: "border-cyber-gold/50 bg-cyber-gold/10 shadow-glow-gold",
  2: "border-slate-400/40 bg-slate-400/5",
  3: "border-amber-600/40 bg-amber-900/10",
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard/")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((data) => {
        // Sort descending by total_points (API should already do this, but be safe)
        const sorted = [...(Array.isArray(data) ? data : [])].sort(
          (a, b) => b.total_points - a.total_points
        );
        setEntries(sorted);
        setLoading(false);
      })
      .catch((e) => {
        setError(String(e));
        setLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="text-center">
        <h1 className="font-exo text-3xl font-black tracking-widest text-cyber-gold drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]">
          LEADERBOARD
        </h1>
        <p className="mt-1 font-mono text-xs text-slate-500">
          Top predictors of WCP 2026
        </p>
      </header>

      {loading && <LoadingSkeleton rows={5} />}
      {error && (
        <div className="rounded-lg border border-cyber-red/40 bg-cyber-red/10 p-4 font-mono text-sm text-cyber-red">
          ⚠ {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-2" data-testid="leaderboard-table">
          {entries.map((entry) => {
            const isCurrentUser = entry.user_id === DEMO_USER_ID;
            const isTop3 = entry.rank <= 3;
            const rowBg = isCurrentUser
              ? "border-cyber-blue/50 bg-cyber-blue/10 shadow-glow-blue"
              : isTop3
              ? RANK_BG[entry.rank]
              : "border-cyber-border bg-cyber-surface";

            return (
              <div
                key={entry.user_id}
                data-testid="leaderboard-row"
                className={`flex items-center justify-between rounded-xl border p-4 transition-all duration-200 ${rowBg}`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 text-center font-exo text-lg font-black">
                    {RANK_ICONS[entry.rank] ?? (
                      <span className="font-mono text-sm text-slate-500">
                        #{entry.rank}
                      </span>
                    )}
                  </span>
                  <div>
                    <p
                      className={`font-exo font-semibold ${
                        isCurrentUser ? "text-cyber-blue" : "text-slate-200"
                      }`}
                    >
                      {entry.username}
                      {isCurrentUser && (
                        <span className="ml-2 font-mono text-[10px] text-cyber-blue/70">
                          (you)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-exo text-xl font-black ${
                      entry.rank === 1 ? "text-cyber-gold" :
                      isCurrentUser ? "text-cyber-blue" :
                      "text-slate-300"
                    }`}
                  >
                    {entry.total_points}
                  </p>
                  <p className="font-mono text-[10px] text-slate-600">pts</p>
                </div>
              </div>
            );
          })}

          {entries.length === 0 && (
            <div className="py-12 text-center font-mono text-slate-500">
              No players yet. Be the first!
            </div>
          )}
        </div>
      )}
    </div>
  );
}
