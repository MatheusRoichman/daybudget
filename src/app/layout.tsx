import type { Metadata } from "next";
import { Sora, DM_Mono } from "next/font/google";
import Link from "next/link";
import { Bell } from "lucide-react";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "DayBudget",
  description: "Gerenciador de finanças com limite diário acumulativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${sora.variable} ${dmMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface-dim text-on-background selection:bg-ds-primary/30">
        {/* Top Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-[#111318]/80 backdrop-blur-xl border-b border-outline-variant/15 flex justify-between items-center px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tighter text-ds-primary font-sora"
          >
            DayBudget
          </Link>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container-high flex items-center justify-center">
              <span className="text-xs font-mono text-on-surface-variant">U</span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 pb-32 px-6 max-w-7xl mx-auto w-full flex-1">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
