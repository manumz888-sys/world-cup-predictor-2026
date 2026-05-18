interface Props {
  brand?: string;
  prize?: string;
  href?: string;
}

export default function LeaderboardSponsor({
  brand = "SAMSUNG",
  prize = "Galaxy S26 Ultra",
  href = "#",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group flex items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-3 transition-all hover:border-cyan-500/20 hover:bg-cyan-500/5"
      aria-label={`Sponsor: ${brand}`}
    >
      <div>
        <p className="font-mono text-[8px] uppercase tracking-widest text-slate-600">
          Presentado por
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-cyan-500/10 text-[10px]">
            🏆
          </div>
          <span className="font-exo text-sm font-black tracking-wider text-cyan-400">
            {brand}
          </span>
        </div>
      </div>

      <div className="text-right">
        <p className="font-mono text-[8px] uppercase tracking-widest text-slate-600">
          Premio top 1
        </p>
        <p className="font-exo text-xs font-bold text-cyber-gold mt-0.5">{prize}</p>
        <p className="font-mono text-[8px] text-slate-600 group-hover:text-cyan-500 transition-colors mt-0.5">
          Ver bases ›
        </p>
      </div>
    </a>
  );
}
