import React from 'react';
import { Activity, HeartPulse } from 'lucide-react';

export default function AirQualityCard({ airQuality }) {
  if (!airQuality || !airQuality.usAqi) return null;

  const { usAqi, europeanAqi, pollutants, healthAdvice } = airQuality;
  const euBand = europeanAqi.band || (europeanAqi.value <= 5 ? europeanAqi.value : 3);

  return (
    <div className="glass-card rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Title & Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Air Quality & Health (AQI)
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">Dual Standard View</span>
      </div>

      {/* Dual Standard Visual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* US AQI Card */}
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              US AQI (EPA Standard)
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
              style={{ backgroundColor: usAqi.color }}
            >
              {usAqi.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              {usAqi.value ?? '--'}
            </span>
            <span className="text-xs text-slate-400">/ 500 scale</span>
          </div>

          {/* Scale Progress Meter */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, ((usAqi.value || 0) / 300) * 100)}%`,
                backgroundColor: usAqi.color,
              }}
            />
          </div>
        </div>

        {/* European AQI Card */}
        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              European AQI (EAQI)
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
              style={{ backgroundColor: europeanAqi.color }}
            >
              {europeanAqi.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white">
              Band {euBand}
            </span>
            <span className="text-xs text-slate-400">/ 5 (Index: {europeanAqi.value})</span>
          </div>

          {/* Stepped Scale Progress Meter */}
          <div className="grid grid-cols-5 gap-1 h-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className="rounded-full transition-colors"
                style={{
                  backgroundColor: step <= euBand ? europeanAqi.color : undefined,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Particulate Pollutants Breakdown */}
      {pollutants && (
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PM2.5</span>
            <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {pollutants.pm2_5 !== null ? `${pollutants.pm2_5} µg/m³` : '--'}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">PM10</span>
            <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {pollutants.pm10 !== null ? `${pollutants.pm10} µg/m³` : '--'}
            </strong>
          </div>

          <div className="p-2.5 rounded-xl bg-white/40 dark:bg-slate-900/40 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Ozone (O₃)</span>
            <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
              {pollutants.ozone !== null ? `${pollutants.ozone} µg/m³` : '--'}
            </strong>
          </div>
        </div>
      )}

      {/* Respiratory Commute Health Advice */}
      {healthAdvice && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/70 text-xs text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-800">
          <HeartPulse className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{healthAdvice}</p>
        </div>
      )}
    </div>
  );
}
