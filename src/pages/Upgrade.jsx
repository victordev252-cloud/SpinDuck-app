import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Check, Sparkles, ShieldCheck } from 'lucide-react';

export default function Upgrade() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const paymentId = searchParams.get('payment_id');
  const simulated = searchParams.get('simulated');

  const handleSimulatePayment = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, status: 'COMPLETED' })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Payment successful! 1 Additional Spin Credit added to your account.');
      }
    } catch {
      setMessage('Failed to process payment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments/create', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setMessage('Failed to initiate gateway.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-center py-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" /> Instant Account Upgrade
      </div>

      <h1 className="text-3xl font-black text-white">Need another Spin?</h1>
      <p className="text-slate-400 text-sm">
        Unlock 1 additional Spin creation credit with zero monthly commitments.
      </p>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {message}
        </div>
      )}

      {/* Pricing Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl relative">
        <div className="space-y-2">
          <span className="text-5xl font-black text-white">$0.50</span>
          <p className="text-xs text-slate-400">One-time payment per spin wheel</p>
        </div>

        <ul className="text-left text-xs space-y-3 border-t border-b border-slate-800 py-4 text-slate-300">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> 1 Additional Custom Spin Creation
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> Up to 100 choices per wheel
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-amber-500 flex-shrink-0" /> Permanent audit history storage
          </li>
        </ul>

        {simulated ? (
          <button
            onClick={handleSimulatePayment}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Verify & Authorize $0.50
          </button>
        ) : (
          <button
            onClick={handleCreateCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" /> Upgrade for $0.50
          </button>
        )}
      </div>
    </div>
  );
}
