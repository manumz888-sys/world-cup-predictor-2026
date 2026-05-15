"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-0 z-50 border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-md"
      data-testid="navbar"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="font-exo text-xl font-bold tracking-widest text-cyber-blue drop-shadow-[0_0_8px_rgba(0,212,255,0.7)]"
        >
          ⚽ WCP 2026
        </Link>

        <div className="flex gap-6">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                data-testid={`nav-link-${label.toLowerCase()}`}
                className={[
                  "font-mono text-sm tracking-widest transition-all duration-200",
                  active
                    ? "text-cyber-blue drop-shadow-[0_0_6px_rgba(0,212,255,0.8)]"
                    : "text-slate-400 hover:text-cyber-blue",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
