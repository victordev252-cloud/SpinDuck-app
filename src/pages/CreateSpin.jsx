import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Disc, AlertCircle } from 'lucide-react';

export default function CreateSpin() {
  const [title, setTitle] = useState('');
  const [optionInput, setOptionInput] = useState('');
  const [options, setOptions] = useState([
    'Ahmed', 'Mohamed', 'Ali', 'Hassan'
  ]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddOption = (e) => {
    e.preventDefault();
    if (!optionInput.trim()) return;
    if (options.length >= 100) {
      setError('Maximum 100 options limit reached.');
      return;
    }
    setOptions([...options, optionInput.trim()]);
    setOptionInput('');
    setError('');
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError('A spin wheel must have at least 2 options.');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
    setError('');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please provide a title for your Spin.');
      return;
    }
    if (options.length < 2) {
      setError('At least 2 options are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/spins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, options })
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          navigate('/upgrade');
          return;
        }
        throw new Error(data.error || 'Failed to create spin');
      }

      navigate(`/spins/${data.spin.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Create New Spin Wheel</h1>
        <p className="text-slate-400 text-sm">Design your custom wheel options and generate it instantly.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Spin Wheel Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Friday Team Giveaway"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Add Options ({options.length}/100)
          </label>
          <form onSubmit={handleAddOption} className="flex gap-2">
            <input
              type="text"
              value={optionInput}
              onChange={(e) => setOptionInput(e.target.value)}
              placeholder="Enter a name or option"
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 text-sm"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm flex items-center gap-1 border border-slate-700"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </form>
        </div>

        {/* Options List */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-400 mb-2">Wheel Segments:</label>
          <div className="flex flex-wrap gap-2">
            {options.map((opt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium"
              >
                {opt}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(i)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition-colors flex items-center justify-center gap-2 mt-4"
        >
          <Disc className="w-4 h-4" />
          {loading ? 'Generating Wheel...' : 'Generate Spin Wheel'}
        </button>
      </div>
    </div>
  );
}
