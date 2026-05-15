import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#050a14",
          blue: "#00d4ff",
          gold: "#ffd700",
          green: "#00ff88",
          red: "#ff4466",
          surface: "#0a1628",
          border: "#1a2d4a",
        },
      },
      fontFamily: {
        exo: ["var(--font-exo2)", "sans-serif"],
        mono: ["var(--font-share-tech-mono)", "monospace"],
      },
      boxShadow: {
        "glow-blue": "0 0 12px rgba(0, 212, 255, 0.5)",
        "glow-gold": "0 0 12px rgba(255, 215, 0, 0.5)",
        "glow-green": "0 0 12px rgba(0, 255, 136, 0.5)",
        "glow-red": "0 0 12px rgba(255, 68, 102, 0.5)",
      },
      animation: {
        shimmer: "shimmer 1.8s infinite",
        pulse_slow: "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
