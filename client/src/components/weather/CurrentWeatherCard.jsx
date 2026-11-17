import React from 'react';
import {
  Umbrella,
  Shirt,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  CloudRain,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';

export default function CurrentWeatherCard({ weather, location }) {
  if (!weather || !weather.current) return null;

  const { current, sun, hourlyForecast } = weather;
  const currentRainProb = hourlyForecast?.[0]?.rainProbability ?? 0;

  // Commute heuristics
  const isRainy = current.isPrecipitation || currentRainProb >= 50;
  const isHighWind = current.windSpeed >= 35 || current.windGusts >= 45;

  // Umbrella advice
  const umbrellaText = isRainy ? 'Carry one ☔' : 'Not needed ☀️';

  // Clothing advice
  let clothingText = 'Comfortable clothes';
  if (current.temperature < 15) {
    clothingText = 'Wear a warm jacket 🧥';
  } else if (current.temperature < 22) {
    clothingText = 'Light jacket or sweater';
  } else if (current.temperature >= 35) {
    clothingText = 'Wear light, breathable clothes';
  }

  // Commute banner advice
  let commuteHeadline = 'Good travel conditions';
  let commuteSubtext = 'The weather is comfortable for your daily journey.';
  let isAlert = false;

  if (isRainy && isHighWind) {
    commuteHeadline = 'Hazardous commute: Rain & high wind';
    commuteSubtext = 'Allow plenty of extra travel time. Two-wheelers should consider taking public transit or car.';
    isAlert = true;
  } else if (isRainy) {
    commuteHeadline = 'Rain may affect your journey';
    commuteSubtext = 'Carry an umbrella, watch for wet road surfaces, and allow 10-15 extra minutes.';
    isAlert = true;
  } else if (isHighWind) {
    commuteHeadline = 'Windy conditions today';
    commuteSubtext = 'Gusts may destabilize bicycles and motorbikes. Exercise caution on elevated roads.';
    isAlert = true;
  }

  function formatTime(isoString) {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-4">
      {/* Hero Weather Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gradient-to-br from-orange-300/20 via-amber-200/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          {/* Temperature & Location Info */}
          <div className="space-y-2">
            <div>
              <p className="text-xs uppercase tracking-wider font-extrabold text-orange-600 dark:text-orange-400">
                CURRENT CONDITIONS
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {location?.displayName || location?.city || 'Selected Location'}
              </h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">
                {current.condition}
              </p>
            </div>

            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-6xl sm:text-7xl font-black text-orange-600 dark:text-orange-500 tracking-tighter">
                {Math.round(current.temperature)}°C
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Feels like {Math.round(current.feelsLike)}°C
              </span>
            </div>
          </div>

          {/* Condition Icon */}
          <div className="text-7xl sm:text-8xl select-none filter drop-shadow-md animate-bounce-slow">
            {current.icon}
          </div>
        </div>
      </div>

      {/* Commute Advice Alert Banner */}
      <div
        className={`glass-card p-5 sm:p-6 rounded-2xl border-l-4 shadow-sm flex items-start gap-3.5 ${
          isAlert
            ? 'border-l-amber-500 bg-amber-50/70 dark:bg-amber-950/20'
            : 'border-l-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20'
        }`}
      >
        {isAlert ? (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {commuteHeadline}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {commuteSubtext}
          </p>
        </div>
      </div>

      {/* 4-Item Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Umbrella */}
        <div className="glass-card p-4 rounded-2xl shadow-sm space-y-1.5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Umbrella className="w-4 h-4 text-orange-500" />
            <span>Umbrella</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {umbrellaText}
          </p>
        </div>

        {/* Clothing */}
        <div className="glass-card p-4 rounded-2xl shadow-sm space-y-1.5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Shirt className="w-4 h-4 text-orange-500" />
            <span>Clothing</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
            {clothingText}
          </p>
        </div>

        {/* Wind */}
        <div className="glass-card p-4 rounded-2xl shadow-sm space-y-1.5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Wind className="w-4 h-4 text-orange-500" />
            <span>Wind Speed</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {current.windSpeed} km/h
            {current.windGusts > current.windSpeed && (
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 ml-1">
                (gusts {current.windGusts})
              </span>
            )}
          </p>
        </div>

        {/* Humidity */}
        <div className="glass-card p-4 rounded-2xl shadow-sm space-y-1.5 hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Droplets className="w-4 h-4 text-orange-500" />
            <span>Humidity</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {current.humidity}%
          </p>
        </div>
      </div>

      {/* Sun Schedule & Rain Probability */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass-card p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-sm">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <Sunrise className="w-4 h-4 text-amber-500" /> Sunrise
          </span>
          <strong className="text-slate-800 dark:text-slate-100 font-bold">
            {formatTime(sun?.sunrise)}
          </strong>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-sm">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <Sunset className="w-4 h-4 text-orange-500" /> Sunset
          </span>
          <strong className="text-slate-800 dark:text-slate-100 font-bold">
            {formatTime(sun?.sunset)}
          </strong>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex items-center justify-between text-xs shadow-sm">
          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <CloudRain className="w-4 h-4 text-blue-500" /> Rain Probability
          </span>
          <strong className="text-slate-800 dark:text-slate-100 font-bold">
            {currentRainProb}%
          </strong>
        </div>
      </div>
    </div>
  );
}
