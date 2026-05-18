interface Props {
  brand?: string;
  tagline?: string;
  href?: string;
}

export default function HeaderSponsor({
  brand = "BETMASTER",
  tagline = "Official Betting Partner",
  href = "#",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group hidden sm:flex items-center gap-2 rounded-full border border-cyber-gold/20 bg-cyber-gold/5 px-3 py-1 transition-all hover:border-cyber-gold/40 hover:bg-cyber-gold/10"
      aria-label={`Sponsored by ${brand}`}
    >
      <span className="font-mono text-[8px] uppercase tracking-widest text-slate-600">
        Powered by
      </span>
      <div className="flex items-center gap-1.5">
        <div className="flex h-4 w-4 items-center justify-center rounded bg-cyber-gold/20 text-[8px]">
          ⚡
        </div>
        <span className="font-exo text-[10px] font-bold tracking-wider text-cyber-gold">
          {brand}
        </span>
      </div>
      <span className="font-mono text-[8px] text-slate-600 group-hover:text-slate-400 transition-colors">
        {tagline} ›
      </span>
    </a>
  );
}
