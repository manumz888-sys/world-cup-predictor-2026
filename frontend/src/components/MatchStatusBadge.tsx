interface Props {
  status: "scheduled" | "live" | "finished";
}

const STATUS_CONFIG = {
  scheduled: {
    label: "SCHEDULED",
    className: "border-cyber-blue/40 bg-cyber-blue/10 text-cyber-blue",
  },
  live: {
    label: "● LIVE",
    className:
      "animate-pulse border-cyber-green/60 bg-cyber-green/10 text-cyber-green shadow-glow-green",
  },
  finished: {
    label: "FINISHED",
    className: "border-slate-500/40 bg-slate-800/50 text-slate-400",
  },
} as const;

export default function MatchStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.scheduled;
  return (
    <span
      data-testid="match-status-badge"
      className={`rounded border px-2 py-0.5 font-mono text-[10px] tracking-widest ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
