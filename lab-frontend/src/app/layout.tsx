import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { LayoutDashboard, Settings, Bot, ShieldCheck } from 'lucide-react';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Lab | Autonomous Control",
  description: "Bento-style IoT Automation Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hide">
      <body className={`${inter.className} animated-bg selection:bg-blue-500/30`}>
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 glass-card rounded-full px-6 py-2 flex items-center gap-2">
          <Link href="/" className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
            <LayoutDashboard size={18} />
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <Link href="/system" className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all">
            <ShieldCheck size={18} />
          </Link>
          <Link href="/ai" className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all">
            <Bot size={18} />
          </Link>
          <div className="h-4 w-px bg-white/10 mx-2"></div>
          <button className="p-3 rounded-full hover:bg-white/5 text-slate-400 hover:text-blue-400 transition-all">
            <Settings size={18} />
          </button>
        </nav>
        <main className="pt-24 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
