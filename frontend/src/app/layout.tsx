import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "WCP 2026 – World Cup Predictor",
  description: "AI-powered World Cup 2026 prediction platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#050a14] text-slate-200 antialiased">
        <Sidebar />
        <Navbar />
        {/* offset sidebar (56px) + topbar (48px) */}
        <main className="relative z-10 ml-14 mt-12 min-h-[calc(100vh-48px)] p-4 lg:p-5">
          {children}
        </main>
      </body>
    </html>
  );
}
