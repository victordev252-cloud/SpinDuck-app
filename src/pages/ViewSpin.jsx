import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Wheel from '../components/Wheel';
import { Play, Trophy, History, RefreshCw } from 'lucide-react';

export default function ViewSpin() {
  const { id } = useParams();
  const [spin, setSpin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState('');

  const fetchSpin = async () => {
    try {
      const res = await fetch(`/api/spins/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSpin(data.spin);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpin();
  }, [id]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    try {
      const res = await fetch(`/api/spins/${id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Simulate 4.5 seconds wheel rotation animation time before revealing winner
      setTimeout(() => {
        setWinner(data.result.selectedOption);
        setSpinning(false);
        fetchSpin(); // Refresh results list
      }, 4500);
    } catch (err) {
      setError(err.message);
      setSpinning(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading wheel...</div>;
  }

  if (error || !spin) {
    return <div className="p-8 text-center text-rose-400">{error || 'Spin wheel not found'}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-white">{spin.title}</h1>
        <p className="text-xs text-slate-400">Total Spins Executed: {spin.spinCount}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        {/* Wheel View */}
        <div className="flex flex-col items-center space-y-6">
          <Wheel options={spin.options} isSpinning={spinning} />
          
          <button
            onClick={handleSpin}
            disabled={spinning}
            className="w-full max-w-xs py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black text-base transition-transform active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            {spinning ? 'Spinning...' : 'Start Spin'}
          </button>
        </div>

        {/* Options & Winners History */}
        <div className="space-y-6">
          {winner && (
            <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2 animate-bounce">
              <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">🎉 Winner Selected</p>
              <h2 className="text-2xl font-black text-white">{winner}</h2>
            </div>
          )}

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" /> Recent Winners
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {spin.results && spin.results.length > 0 ? (
                spin.results.map((res, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-950 text-xs border border-slate-800">
                    <span className="font-semibold text-slate-200">{res.selectedOption}</span>
                    <span className="text-slate-500">{new Date(res.createdAt).toLocaleTimeString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No spins recorded yet. Hit Start Spin above!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
