"use client";

interface OddsWidgetProps {
  homeCode: string;
  awayCode: string;
  homeProb: number; // 0-100
  brand?: string;
  href?: string;
}

function calcOdds(prob: number): string {
  // Convert probability to decimal odds with bookmaker margin (~5%)
  const raw = 100 / Math.max(prob, 1);
  return (raw * 0.95).toFixed(2);
}

const FLAG: Record<string, string> = {
  ARG:"🇦🇷",BRA:"🇧🇷",FRA:"🇫🇷",GER:"🇩🇪",ESP:"🇪🇸",
  POR:"🇵🇹",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",NED:"🇳🇱",USA:"🇺🇸",MEX:"🇲🇽",
  JPN:"🇯🇵",MOR:"🇲🇦",ITA:"🇮🇹",SEN:"🇸🇳",
};

export default function OddsWidget({
  homeCode,
  awayCode,
  homeProb,
  brand = "BetMaster",
  href = "#",
}: OddsWidgetProps) {
  const awayProb = Math.max(5, 100 - homeProb - 18); // reserve ~18% for draw
  const drawProb = 100 - homeProb - awayProb;

  return (
    <div className="rounded-lg border border-cyber-gold/20 bg-cyber-gold/5 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">
            Live Odds
          </span>
          <span className="rounded border border-cyber-gold/30 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-cyber-gold">
            Ad
          </span>
        </div>
        <span className="font-exo text-[10px] font-bold tracking-wider text-cyber-gold">
          ⚡ {brand}
        </span>
      </div>

      {/* Odds row */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: homeCode, flag: FLAG[homeCode] ?? "🏳", prob: homeProb, color: "text-cyan-400" },
          { label: "DRAW",   flag: "➖",                    prob: drawProb, color: "text-slate-400" },
          { label: awayCode, flag: FLAG[awayCode] ?? "🏳", prob: awayProb, color: "text-violet-400" },
        ].map(({ label, flag, prob, color }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-lg border border-white/5 bg-white/[0.03] py-2 hover:border-cyber-gold/30 cursor-pointer transition-all hover:bg-cyber-gold/5"
          >
            <span className="text-base">{flag}</span>
            <span className="font-mono text-[8px] text-slate-500 mt-0.5">{label}</span>
            <span className={`font-exo text-sm font-black mt-0.5 ${color}`}>
              {calcOdds(prob)}
            </span>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-center gap-2 rounded-lg border border-cyber-gold/40 bg-cyber-gold/10 py-2 font-exo text-[10px] font-bold tracking-widest text-cyber-gold transition-all hover:bg-cyber-gold/20 hover:shadow-glow-gold"
      >
        🎯 Validar pronóstico en {brand}
        <span className="text-slate-500">›</span>
      </a>

      <p className="mt-1.5 text-center font-mono text-[7px] text-slate-600">
        18+ · Jugar con responsabilidad · Términos aplican
      </p>
    </div>
  );
}
