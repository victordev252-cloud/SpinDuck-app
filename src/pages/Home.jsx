import React from 'react';
import { Link } from 'react-router-dom';
import { Disc, Zap, Shield, Sparkles, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Wheel Platform
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Create your Spin. <br />
          <span className="text-amber-500">Let the wheel decide.</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg leading-relaxed">
          Build custom spinning wheels for giveaways, decisions, games, and team pickers in seconds. Secured on the server with real-time fair results.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link
            to="/register"
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base transition-transform active:scale-95 shadow-lg shadow-amber-500/10"
          >
            Start Spinning Free
          </Link>
          <Link
            to="/pricing"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-base"
          >
            Explore Pricing
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Instant Wheel Creation</h3>
          <p className="text-slate-400 text-sm">Add up to 100 choices, customize colors, and generate your wheel in under 10 seconds.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Server-Verified Fairness</h3>
          <p className="text-slate-400 text-sm">No client-side manipulation. Every spin calculation is cryptographically validated server-side.</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Disc className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Spin History & Analytics</h3>
          <p className="text-slate-400 text-sm">Keep full logs of every outcome, winner, and historical decision for audit transparency.</p>
        </div>
      </section>

      {/* Transparent Pricing Callout */}
      <section className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-center space-y-4">
        <h2 className="text-2xl font-black text-white">Simple & Fair Pricing</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Start with 2 FREE Spin Wheels right away. Need more? Add individual wheels on demand for just $0.50 each. No hidden subscriptions.
        </p>
        <div className="pt-2">
          <span className="text-4xl font-black text-amber-500">$0.50</span>
          <span className="text-slate-500 text-sm"> / additional spin</span>
        </div>
      </section>
    </div>
  );
}
