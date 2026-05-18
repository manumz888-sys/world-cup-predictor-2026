"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard",    icon: "⊞",  label: "Dashboard"   },
  { href: "/leaderboard",  icon: "🏆",  label: "Leaderboard" },
  { href: "/dashboard",    icon: "📊",  label: "Analytics"   },
  { href: "/dashboard",    icon: "📅",  label: "Schedule"    },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-14 flex-col items-center border-r border-white/5 bg-[#040810]/95 py-4 backdrop-blur-xl">
      {/* Logo */}
      <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-lg">
        ⚽
      </div>

      {/* Nav icons */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {NAV.map(({ href, icon, label }) => {
          const active = path === href;
          return (
            <Link
              key={label}
              href={href}
              title={label}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg text-base transition-all duration-150",
                active
                  ? "bg-cyan-500/15 text-cyan-400 shadow-[0_0_12px_rgba(0,212,255,0.3)]"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-300",
              ].join(" ")}
            >
              {icon}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <button title="Logout" className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:text-cyber-red transition-colors">
        ⏻
      </button>
    </aside>
  );
}
