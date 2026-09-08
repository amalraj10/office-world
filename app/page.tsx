import Link from 'next/link';
import { Building2, Users, MessageSquare, Sparkles, ShieldCheck, Zap, ChevronRight, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Office<span className="text-blue-400">World</span>
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-sm font-semibold text-slate-300 hover:text-white px-4 py-2 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center space-x-2"
          >
            <span>Get Started</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-24 text-center max-w-6xl mx-auto space-y-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 text-xs font-semibold shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen 2D Multiplayer Virtual Office</span>
        </div>

        <div className="space-y-6 max-w-3xl">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Your office, <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
              but alive.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed">
            A living 2D virtual workplace where employees have characters, walk around the office, sit at their desks, see coworkers, communicate, and share office moments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 pt-2">
          <Link
            href="/signup"
            className="w-full sm:w-auto text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-2xl shadow-xl shadow-blue-600/25 transition flex items-center justify-center space-x-2 group"
          >
            <span>Enter Virtual Office</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto text-base font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-8 py-4 rounded-2xl transition"
          >
            Sign In with Email
          </Link>
        </div>

        {/* 2D Visual Preview Card */}
        <div className="w-full max-w-4xl mt-12 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />
          
          <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800/80 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 pl-2">OfficeWorld Top-Down 2D Workplace</span>
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1" />
                🟢 8 Coworkers Active
              </span>
            </div>

            {/* Simulated 2D Layout Map Graphic */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">🛎️ RECEPTION</span>
                  <span className="text-[10px] text-slate-500">Zone A</span>
                </div>
                <p className="text-xs text-slate-400">Welcome lobby & front desk area for guest arrivals.</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">💻 WORK BAY</span>
                  <span className="text-[10px] text-slate-500">Zone B</span>
                </div>
                <p className="text-xs text-slate-400">Desks, dual monitors, ergonomical chairs & presence dots.</p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">☕ PANTRY & LOUNGE</span>
                  <span className="text-[10px] text-slate-500">Zone C</span>
                </div>
                <p className="text-xs text-slate-400">Coffee breaks, sofas, and casual proximity chat spaces.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full pt-12">
          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Top-Down Character Controls</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Navigate around walls, furniture, meeting rooms, and pantries using WASD or arrow keys.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Proximity Text Chat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Walk up close to any coworker to trigger direct messaging and spontaneous conversations.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Office Snap Moments</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Share coffee updates, pizza alerts, design wins, and react with team emoji responses.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 px-8 text-center text-xs text-slate-500">
        <p>© 2026 OfficeWorld Inc. All rights reserved. Desktop-first 2D virtual office platform.</p>
      </footer>
    </div>
  );
}
