"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/types";
import LeaderboardSponsor from "@/components/ads/LeaderboardSponsor";

const DEMO_USER_ID = 1;
const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard/")
      .then(r => r.ok ? r.json() : [])
      .then((data: LeaderboardEntry[]) => {
        setEntries([...data].sort((a, b) => b.total_points - a.total_points));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-exo text-2xl font-black uppercase tracking-[0.15em] text-cyber-gold drop-shadow-[0_0_16px_rgba(255,215,0,0.4)]">
            Leaderboard
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500 mt-0.5">
            Top Predictors · FIFA World Cup 2026
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-2 text-right">
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Season</p>
          <p className="font-exo text-sm font-bold text-cyan-400">2026</p>
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-2">
          {[entries[1], entries[0], entries[2]].map((e, col) => {
            const heights = ["h-20", "h-28", "h-16"];
            const borders = [
              "border-slate-400/30 bg-slate-400/5",
              "border-cyber-gold/40 bg-cyber-gold/5 shadow-glow-gold",
              "border-amber-700/30 bg-amber-900/10",
            ];
            return (
              <div key={e.user_id} className={`flex flex-col items-center justify-end rounded-xl border ${borders[col]} ${heights[col]} pb-3 pt-2 px-2 transition-all`}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 font-exo text-sm font-bold text-slate-300 mb-1">
                  {e.username[0].toUpperCase()}
                </div>
                <p className="font-exo text-[10px] font-semibold text-slate-300 truncate max-w-full">{e.username}</p>
                <p className={`font-exo text-base font-black ${col === 1 ? "text-cyber-gold" : "text-slate-300"}`}>
                  {e.total_points}
                </p>
                <span className="text-lg">{MEDAL[e.rank] ?? `#${e.rank}`}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Leaderboard sponsor */}
      <LeaderboardSponsor />

      {/* Full table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-1.5" data-testid="leaderboard-table">
          {entries.map(e => {
            const isMe = e.user_id === DEMO_USER_ID;
            return (
              <div
                key={e.user_id}
                data-testid="leaderboard-row"
                className={[
                  "flex items-center justify-between rounded-xl border px-4 py-3 transition-all duration-200",
                  isMe
                    ? "border-cyan-500/30 bg-cyan-500/5 shadow-glow-blue"
                    : e.rank <= 3
                    ? "border-cyber-gold/15 bg-cyber-gold/5"
                    : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                ].join(" ")}
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center text-base">
                    {MEDAL[e.rank] ?? <span className="font-mono text-xs text-slate-500">#{e.rank}</span>}
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 font-exo text-xs font-bold text-slate-300">
                    {e.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-exo text-sm font-semibold ${isMe ? "text-cyan-400" : "text-slate-200"}`}>
                      {e.username}
                      {isMe && <span className="ml-1.5 font-mono text-[9px] text-cyan-500/60">(you)</span>}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block h-1.5 w-24 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (e.total_points / (entries[0]?.total_points || 1)) * 100)}%`,
                        background: isMe ? "#22d3ee" : e.rank === 1 ? "#ffd700" : "#475569",
                      }}
                    />
                  </div>
                  <div className="text-right">
                    <p className={`font-exo text-lg font-black tabular-nums ${e.rank === 1 ? "text-cyber-gold" : isMe ? "text-cyan-400" : "text-slate-300"}`}>
                      {e.total_points}
                    </p>
                    <p className="font-mono text-[8px] uppercase tracking-widest text-slate-600">pts</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
