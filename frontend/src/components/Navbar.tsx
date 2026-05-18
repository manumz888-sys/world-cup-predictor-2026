"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import HeaderSponsor from "@/components/ads/HeaderSponsor";

const LINKS = [
  { href: "/dashboard",   label: "DASHBOARD"   },
  { href: "/dashboard",   label: "BRACKET"     },
  { href: "/dashboard",   label: "ANALYTICS"   },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/dashboard",   label: "PROFILE"     },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <header
      className="fixed left-14 right-0 top-0 z-40 flex h-12 items-center justify-between border-b border-white/5 bg-[#040810]/90 px-6 backdrop-blur-xl"
      data-testid="navbar"
    >
      {/* Brand */}
      <div className="flex items-center gap-2">
        <span className="font-exo text-xs font-bold tracking-[0.2em] text-slate-400">
          WORLD CUP PREDICTOR 2026
        </span>
      </div>

      {/* Header sponsor */}
      <HeaderSponsor />

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {LINKS.map(({ href, label }) => {
          const key = label.toLowerCase();
          const active = (label === "DASHBOARD" && path === "/dashboard") ||
                         (label === "LEADERBOARD" && path === "/leaderboard");
          return (
            <Link
              key={label}
              href={href}
              data-testid={`nav-link-${key}`}
              className={[
                "rounded-full px-3 py-1 font-mono text-[10px] tracking-widest transition-all duration-150",
                active
                  ? "border border-cyan-400/60 text-cyan-400"
                  : "text-slate-500 hover:text-slate-300",
              ].join(" ")}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
        <span className="hidden sm:inline">🔔</span>
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] text-cyan-400">
            A
          </div>
          <span className="hidden sm:inline">Alex B. <span className="text-slate-600">#142</span></span>
        </div>
      </div>
    </header>
  );
}
