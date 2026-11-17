import React from 'react';
import { Clock, Droplets, Wind } from 'lucide-react';

export default function HourlyForecastStrip({ hourly }) {
  if (!hourly || hourly.length === 0) return null;

  function formatHour(timeString) {
    if (!timeString) return '';
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            24-Hour Commute Forecast
          </h3>
        </div>
        <span className="text-xs text-slate-400">Scroll horizontally →</span>
      </div>

      {/* Horizontal Scroll Strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar scroll-smooth">
        {hourly.map((hour, index) => {
          const isRaining = hour.rainProbability >= 40;
          return (
            <div
              key={hour.time || index}
              className={`shrink-0 w-24 p-3 rounded-2xl flex flex-col items-center justify-between gap-2 text-center transition-all border ${
                index === 0
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-white/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {index === 0 ? 'Now' : formatHour(hour.time)}
              </span>

              <span className="text-2xl select-none" title={hour.condition}>
                {hour.icon}
              </span>

              <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {Math.round(hour.temperature)}°
              </span>

              {/* Rain Probability Pill */}
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isRaining
                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                    : 'text-slate-400'
                }`}
              >
                <Droplets className="w-2.5 h-2.5" />
                <span>{hour.rainProbability}%</span>
              </div>

              {/* Wind Speed */}
              <div className="flex items-center gap-0.5 text-[10px] text-slate-400">
                <Wind className="w-2.5 h-2.5" />
                <span>{hour.windSpeed}k</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
