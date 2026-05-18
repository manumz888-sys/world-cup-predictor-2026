"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Match, LeaderboardEntry } from "@/types";

/* ── helpers ───────────────────────────────────────────────────── */
const FLAG: Record<string, string> = {
  ARG:"🇦🇷",BRA:"🇧🇷",FRA:"🇫🇷",GER:"🇩🇪",ESP:"🇪🇸",
  POR:"🇵🇹",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",NED:"🇳🇱",USA:"🇺🇸",MEX:"🇲🇽",
  JPN:"🇯🇵",MOR:"🇲🇦",ITA:"🇮🇹",SEN:"🇸🇳",KOR:"🇰🇷",
};
const f = (c = "") => FLAG[c] ?? "🏳";

const STAGE_ORDER = ["group","round_of_16","quarter_final","semi_final","final"];
const STAGE_LABEL: Record<string,string> = {
  group:"Group Stage", round_of_16:"Round of 16",
  quarter_final:"Quarterfinals", semi_final:"Semifinals", final:"Final",
};

const FORM = ["W","W","W","L","W"];
const PLAYER_A = ["Vinicius Jr.","Messi","Mbappé","Kane","Modrić"];
const PLAYER_B = ["Mbappé","Mbappe","Griezmann","Müller","Kroos"];

/* ── sub-components ───────────────────────────────────────────── */

function TeamBadge({ code, name, size = "lg" }: { code:string; name:string; size?:"sm"|"lg" }) {
  const sz = size === "lg" ? "text-4xl" : "text-2xl";
  const tz = size === "lg" ? "text-sm" : "text-xs";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sz} drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]`}>{f(code)}</div>
      <span className={`font-exo font-bold uppercase tracking-wider text-slate-200 ${tz}`}>{name}</span>
      {size === "lg" && <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{code}</span>}
    </div>
  );
}

function WinProbBar({ homeCode, awayCode, homeProb }: { homeCode:string; awayCode:string; homeProb:number }) {
  const awayProb = 100 - homeProb;
  return (
    <div className="space-y-2">
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">AI Win Probability</p>
      <div className="flex h-7 w-full overflow-hidden rounded-lg">
        <div
          className="flex items-center justify-start pl-3 font-exo text-xs font-bold text-white prob-bar"
          style={{ width: `${homeProb}%`, background: "linear-gradient(90deg,#0284c7,#06b6d4)" }}
        >
          {homeCode} {homeProb}%
        </div>
        <div
          className="flex items-center justify-end pr-3 font-exo text-xs font-bold text-white prob-bar"
          style={{ width: `${awayProb}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }}
        >
          {awayProb}% {awayCode}
        </div>
      </div>
    </div>
  );
}

function RecentForm() {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-slate-500">Recent Form</p>
      <div className="flex gap-1.5">
        {FORM.map((r, i) => (
          <div key={i} className={[
            "flex h-6 w-6 items-center justify-center rounded-full font-exo text-[10px] font-bold",
            r === "W" ? "bg-cyber-green/20 text-cyber-green border border-cyber-green/40"
                      : "bg-cyber-red/10 text-cyber-red/60 border border-slate-700"
          ].join(" ")}>{r}</div>
        ))}
      </div>
    </div>
  );
}

function StrengthBar({ label, value, color }: { label:string; value:number; color:string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 font-mono text-[9px] text-slate-500">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/5">
        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width:`${value}%`, background:color }} />
      </div>
      <span className="w-6 font-mono text-[9px] text-slate-400 text-right">{value}</span>
    </div>
  );
}

function FeaturedMatchCard({ match }: { match: Match }) {
  const homeCode = match.home_team?.country_code ?? "";
  const awayCode = match.away_team?.country_code ?? "";
  const homeName = match.home_team?.name ?? "Home";
  const awayName = match.away_team?.name ?? "Away";
  const homeProb = 58;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-[#080f1e]/80 p-4 backdrop-blur-sm h-full">
      {/* Card header */}
      <div className="flex items-center justify-between">
        <h2 className="font-exo text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          AI Match Analysis
        </h2>
        <span className={[
          "rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-widest",
          match.status === "live"
            ? "border-cyber-green/50 text-cyber-green animate-pulse"
            : match.status === "finished"
            ? "border-slate-600 text-slate-500"
            : "border-cyan-500/40 text-cyan-400"
        ].join(" ")}>
          {match.status === "live" ? "● LIVE" : match.status === "finished" ? "FINISHED" : "UPCOMING"}
        </span>
      </div>

      {/* Hero: teams + field glow */}
      <div className="relative flex items-center justify-between rounded-xl overflow-hidden"
           style={{ background:"linear-gradient(135deg,#0a2010 0%,#091420 50%,#0a1020 100%)", padding:"20px 16px" }}>
        {/* green field reflection */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-2xl opacity-20"
             style={{ background:"#00ff88" }} />
        <TeamBadge code={homeCode} name={homeName} />
        <div className="flex flex-col items-center gap-1">
          <span className="font-exo text-[10px] uppercase tracking-widest text-slate-500">
            {new Date(match.match_date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}
          </span>
          <span className="font-exo text-xl font-black text-slate-600">VS</span>
          {match.status === "finished" && (
            <span className="font-exo text-lg font-black text-cyber-gold">
              {match.home_score} – {match.away_score}
            </span>
          )}
        </div>
        <TeamBadge code={awayCode} name={awayName} />
      </div>

      {/* Win probability */}
      <WinProbBar homeCode={homeCode} awayCode={awayCode} homeProb={homeProb} />

      {/* Predicted score */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-1">Predicted Score</p>
          <p className="font-exo text-lg font-black">
            <span className="text-cyan-400">{homeCode}</span>
            <span className="text-slate-400 mx-2">2 – 1</span>
            <span className="text-violet-400">{awayCode}</span>
          </p>
        </div>
        <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <RecentForm />
        </div>
      </div>

      {/* Key matchup */}
      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-2">Key Matchup</p>
        <div className="flex items-center justify-between font-exo text-xs font-semibold text-slate-300">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 text-sm">{f(homeCode)}</div>
            {PLAYER_A[0]}
          </div>
          <span className="text-slate-600">vs</span>
          <div className="flex items-center gap-2">
            {PLAYER_B[0]}
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-sm">{f(awayCode)}</div>
          </div>
        </div>
      </div>

      {/* Team strength */}
      <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3 space-y-2">
        <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Team Strength</p>
        <StrengthBar label="Offense"  value={78} color="linear-gradient(90deg,#06b6d4,#0284c7)" />
        <StrengthBar label="Defense"  value={65} color="linear-gradient(90deg,#7c3aed,#a855f7)" />
        <StrengthBar label="Midfield" value={82} color="linear-gradient(90deg,#00ff88,#06b6d4)" />
      </div>

      {/* AI Insight */}
      <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="font-mono text-[9px] uppercase tracking-widest text-cyan-400">AI Insight</p>
          <span className="text-slate-500 text-xs">✦</span>
        </div>
        <p className="font-mono text-[10px] leading-relaxed text-slate-400 line-clamp-3">
          {homeName} shows strong possession metrics averaging 63% in recent fixtures.
          {awayName}'s counter-attack pace could exploit high defensive lines.
          Expect an open, high-tempo match with goals in both halves.
        </p>
      </div>

      <Link
        href={`/match/${match.id}`}
        className="mt-auto rounded-lg border border-cyan-500/30 bg-cyan-500/5 py-2 text-center font-mono text-[10px] tracking-widest text-cyan-400 transition-all hover:bg-cyan-500/10 hover:shadow-glow-blue"
      >
        🤖 FULL AI ANALYSIS →
      </Link>
    </div>
  );
}

function BracketMatch({ match }: { match: Match }) {
  const hc = match.home_team?.country_code ?? "";
  const ac = match.away_team?.country_code ?? "";
  const hName = match.home_team?.name?.slice(0,3).toUpperCase() ?? "---";
  const aName = match.away_team?.name?.slice(0,3).toUpperCase() ?? "---";
  return (
    <div className={[
      "rounded-lg border p-2 text-xs font-mono transition-all",
      match.status === "live"
        ? "border-cyber-green/40 bg-cyber-green/5"
        : match.status === "finished"
        ? "border-white/5 bg-white/[0.02]"
        : "border-white/5 bg-white/[0.02] opacity-60"
    ].join(" ")} data-testid="match-card">
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          <span>{f(hc)}</span>
          <span className="text-slate-300">{hName}</span>
        </div>
        <span className="text-cyber-gold font-bold tabular-nums">
          {match.home_score ?? "–"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span>{f(ac)}</span>
          <span className="text-slate-300">{aName}</span>
        </div>
        <span className="text-cyber-gold font-bold tabular-nums">
          {match.away_score ?? "–"}
        </span>
      </div>
    </div>
  );
}

function TournamentBracket({ matches }: { matches: Match[] }) {
  const byStage = STAGE_ORDER.reduce<Record<string, Match[]>>((acc, s) => {
    acc[s] = matches.filter(m => m.stage === s);
    return acc;
  }, {});
  const stages = STAGE_ORDER.filter(s => byStage[s].length > 0);
  const [active, setActive] = useState(stages[0] ?? "group");

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-[#080f1e]/80 p-4 backdrop-blur-sm h-full">
      <div className="flex items-center justify-between">
        <h2 className="font-exo text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
          Tournament Bracket
        </h2>
        <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">FIFA World Cup 2026</span>
      </div>

      {/* Stage tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {stages.map(s => (
          <button key={s} onClick={() => setActive(s)}
            className={[
              "shrink-0 rounded-full border px-3 py-1 font-mono text-[9px] uppercase tracking-widest transition-all whitespace-nowrap",
              active === s
                ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-400"
                : "border-white/10 text-slate-500 hover:text-slate-300"
            ].join(" ")}>
            {STAGE_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Matches grid */}
      <div className="grid grid-cols-1 gap-2 overflow-y-auto" style={{ maxHeight: 320 }}>
        {(byStage[active] ?? []).map(m => (
          <BracketMatch key={m.id} match={m} />
        ))}
      </div>

      {/* Projected winner */}
      {active !== "group" && (
        <div className="mt-auto rounded-xl border border-cyber-gold/20 bg-cyber-gold/5 p-3 flex items-center justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-500">Projected Winner</p>
            <p className="font-exo text-sm font-bold text-cyber-gold mt-0.5">Argentina 🇦🇷</p>
          </div>
          <div className="relative flex h-14 w-14 items-center justify-center">
            <svg className="absolute inset-0" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="#1a2d4a" strokeWidth="4"/>
              <circle cx="28" cy="28" r="24" fill="none" stroke="#ffd700" strokeWidth="4"
                strokeDasharray={`${0.54 * 150.8} 150.8`} strokeLinecap="round"
                transform="rotate(-90 28 28)" strokeDashoffset="0"/>
            </svg>
            <span className="font-exo text-xs font-bold text-cyber-gold">54%</span>
          </div>
        </div>
      )}
    </div>
  );
}

function LiveFeed({ matches }: { matches: Match[] }) {
  const live = matches.filter(m => m.status === "live");
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#080f1e]/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-exo text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Feed</h2>
        <span className="font-mono text-[9px] text-cyber-green animate-pulse">● {live.length} LIVE</span>
      </div>
      <div className="space-y-2">
        {live.length === 0 && (
          <p className="font-mono text-[10px] text-slate-600">No live matches right now</p>
        )}
        {live.map(m => (
          <div key={m.id} className="flex items-start gap-2 rounded-lg border border-cyber-green/10 bg-cyber-green/5 p-2">
            <span className="text-sm mt-0.5">{f(m.home_team?.country_code)}</span>
            <div>
              <p className="font-exo text-[10px] font-semibold text-slate-200">
                {m.home_team?.name} vs {m.away_team?.name}
              </p>
              <p className="font-mono text-[9px] text-slate-500 mt-0.5">
                {m.venue ?? "Stadium"} · {m.stage.replace("_"," ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopPredictors({ entries }: { entries: LeaderboardEntry[] }) {
  const MEDAL = ["🥇","🥈","🥉"];
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#080f1e]/80 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-exo text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Top Predictors</h2>
      </div>
      <div className="space-y-2" data-testid="leaderboard-table">
        {entries.slice(0, 5).map((e, i) => (
          <div key={e.user_id}
               data-testid="leaderboard-row"
               className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{MEDAL[i] ?? `#${e.rank}`}</span>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/10 font-exo text-[10px] font-bold text-cyan-400">
                {e.username[0].toUpperCase()}
              </div>
              <span className="font-exo text-xs font-semibold text-slate-300">{e.username}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-exo text-sm font-bold text-cyber-gold">{e.total_points}</span>
              <span className="font-mono text-[9px] text-slate-600">pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/matches").then(r => r.ok ? r.json() : []),
      fetch("/api/leaderboard/").then(r => r.ok ? r.json() : []),
    ]).then(([m, l]) => {
      setMatches(Array.isArray(m) ? m : []);
      setLeaders(Array.isArray(l) ? l : []);
      setLoading(false);
    });
  }, []);

  // Pick the best featured match: live > next scheduled > first finished
  const featured =
    matches.find(m => m.status === "live") ??
    matches.find(m => m.status === "scheduled") ??
    matches[0];

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="space-y-2 text-center">
          <div className="font-exo text-2xl font-black tracking-widest text-cyan-400 animate-pulse">WCP 2026</div>
          <div className="font-mono text-xs text-slate-500">Loading match data…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main two-column grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5fr_6fr]" style={{ minHeight: 520 }}>
        {featured ? (
          <FeaturedMatchCard match={featured} />
        ) : (
          <div className="flex items-center justify-center rounded-2xl border border-white/5 text-slate-600 font-mono text-sm">
            No matches available
          </div>
        )}
        <TournamentBracket matches={matches} />
      </div>

      {/* Bottom two-column grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LiveFeed matches={matches} />
        <TopPredictors entries={leaders} />
      </div>
    </div>
  );
}
