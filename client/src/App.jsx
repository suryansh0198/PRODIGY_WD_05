import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import { WeatherProvider, useWeather } from './context/WeatherContext.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import CurrentWeatherCard from './components/weather/CurrentWeatherCard.jsx';
import HourlyForecastStrip from './components/weather/HourlyForecastStrip.jsx';
import AirQualityCard from './components/weather/AirQualityCard.jsx';
import AuthModal from './components/auth/AuthModal.jsx';
import { AlertCircle, Loader2 } from 'lucide-react';

function Dashboard() {
  const { weather, loading, error, activeLocation } = useWeather();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dark mode state persisted in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('commutecast_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('commutecast_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('commutecast_theme', 'light');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 p-4 sm:p-8 md:p-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Search */}
        <Navbar
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onOpenAuth={() => setIsAuthOpen(true)}
        />

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs sm:text-sm font-semibold text-rose-700 dark:text-rose-300 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Content Area */}
        {loading && !weather ? (
          <div className="glass-card rounded-3xl p-16 flex flex-col items-center justify-center gap-3 text-center shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600 dark:text-orange-400" />
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Gathering commuter weather & air quality data...
            </p>
          </div>
        ) : weather ? (
          <main className="space-y-6 animate-fade-in">
            {/* Current Conditions & Commute Heuristics */}
            <CurrentWeatherCard weather={weather} location={activeLocation} />

            {/* 24-Hour Commuter Hourly Forecast Timeline */}
            <HourlyForecastStrip hourly={weather.hourlyForecast} />

            {/* Dual Standard AQI & Respiratory Guidance */}
            <AirQualityCard airQuality={weather.airQuality} />
          </main>
        ) : (
          <div className="glass-card rounded-3xl p-12 text-center text-sm text-slate-500 shadow-sm">
            Search for a city or use your location to view commute conditions.
          </div>
        )}

        {/* Footer */}
        <Footer />

        {/* Authentication Modal */}
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <Dashboard />
      </WeatherProvider>
    </AuthProvider>
  );
}
