"use client";

interface Props {
  brand?: string;
  copy?: string;
  sub?: string;
  href?: string;
}

export default function BracketAd({
  brand = "EA SPORTS FC 26",
  copy = "Juega el Mundial",
  sub = "Disponible ahora",
  href = "#",
}: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group hidden lg:flex flex-col items-center justify-between rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-2 py-4 transition-all hover:border-violet-500/25 hover:bg-violet-500/5 cursor-pointer"
      style={{ minWidth: 72, writingMode: "vertical-rl" }}
      title={`Ad: ${brand}`}
    >
      {/* Top label */}
      <span className="font-mono text-[7px] uppercase tracking-widest text-slate-700 rotate-180">
        Publicidad
      </span>

      {/* Brand */}
      <div className="flex flex-col items-center gap-2 rotate-180">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-base transition-all group-hover:bg-violet-500/20">
          🎮
        </div>
        <span className="font-exo text-[9px] font-black uppercase tracking-widest text-violet-400 group-hover:text-violet-300 transition-colors"
              style={{ writingMode: "vertical-rl" }}>
          {brand}
        </span>
        <span className="font-mono text-[8px] text-slate-600 group-hover:text-slate-400 transition-colors text-center"
              style={{ writingMode: "vertical-rl" }}>
          {copy}
        </span>
      </div>

      {/* Bottom CTA */}
      <span className="font-mono text-[7px] uppercase tracking-widest text-violet-500/60 group-hover:text-violet-400 transition-colors rotate-180">
        {sub} ›
      </span>
    </a>
  );
}
