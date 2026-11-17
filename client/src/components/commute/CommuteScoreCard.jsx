import React, { useState, useEffect } from 'react';
import {
  Compass,
  Bus,
  Bike,
  Footprints,
  Car,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { calculateCommuteScore } from '../../utils/commuteScorer.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function CommuteScoreCard({ weather, airQuality }) {
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState('transit');

  // Sync with user's preferred transport mode if logged in
  useEffect(() => {
    if (user?.preferredTransport) {
      setSelectedMode(user.preferredTransport);
    }
  }, [user]);

  if (!weather || !weather.current) return null;

  const result = calculateCommuteScore(weather, airQuality, selectedMode);

  const modes = [
    { id: 'transit', label: 'Transit', icon: Bus },
    { id: 'cycling', label: 'Bicycle', icon: Bike },
    { id: 'two_wheeler', label: 'Motorbike', icon: Bike },
    { id: 'walking', label: 'Walking', icon: Footprints },
    { id: 'driving', label: 'Car', icon: Car },
  ];

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Personalized Commute Score
          </h3>
        </div>

        {/* Mode Selector Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Score Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Score Ring / Number */}
        <div className="p-5 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Commute Viability
          </span>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className="text-5xl sm:text-6xl font-black tracking-tight"
              style={{ color: result.color }}
            >
              {result.score}
            </span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: result.color }}
          >
            {result.verdict}
          </span>
        </div>

        {/* Factors Breakdown */}
        <div className="md:col-span-2 p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Impact Factors for {modes.find((m) => m.id === selectedMode)?.label}
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {result.factors.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/60 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80"
              >
                <div className="flex items-center gap-2">
                  {f.impact < 0 ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{f.name}</span>
                  <span className="text-slate-400 hidden sm:inline">— {f.detail}</span>
                </div>
                {f.impact !== 0 && (
                  <span className="font-mono font-bold text-rose-500 text-[11px]">
                    {f.impact} pts
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Departure Advisory Banner */}
      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-900/50 text-xs text-slate-700 dark:text-slate-300">
        <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block text-slate-900 dark:text-slate-100 font-bold mb-0.5">
            Recommended Departure Window
          </strong>
          <p className="leading-relaxed">{result.departureAdvisory}</p>
        </div>
      </div>
    </div>
  );
}
