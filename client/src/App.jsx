import React, { useState, useEffect } from 'react';
import { CloudSun, Sun, Moon, Activity, CheckCircle2, AlertCircle, Terminal, ShieldCheck } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    loading: true,
    connected: false,
    data: null,
    error: null
  });

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check connection to backend through Vite proxy
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        setBackendStatus({
          loading: false,
          connected: true,
          data,
          error: null
        });
      })
      .catch((err) => {
        setBackendStatus({
          loading: false,
          connected: false,
          data: null,
          error: err.message
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 md:p-12 transition-colors duration-300">
      <main className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-orange-200/50 dark:border-slate-800">
          <div>
            <p className="text-xs uppercase tracking-widest font-extrabold text-orange-600 dark:text-orange-400">
              Phase 1 Milestone • Modern Stack Initialized
            </p>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mt-1">
              Commute<span className="text-orange-600 dark:text-orange-500">Cast</span>
              <CloudSun className="w-9 h-9 sm:w-12 h-12 text-orange-500 animate-pulse" />
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
              Weather-based commute intelligence application.
            </p>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold glass-card text-slate-700 dark:text-slate-200 hover:scale-105 transition-all shadow-sm"
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </header>

        {/* Phase 1 Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Status */}
          <div className="glass-card p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Frontend Tier
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vite + React Active
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Client Architecture Ready
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Configured with Tailwind CSS, custom design tokens, dark mode toggle, and Vite proxy forwarding for all <code className="text-xs bg-orange-100 dark:bg-slate-800 px-1 py-0.5 rounded text-orange-700 dark:text-orange-300">/api</code> requests.
            </p>
          </div>

          {/* Backend Status */}
          <div className="glass-card p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Backend Tier
              </span>
              {backendStatus.loading ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                  <Activity className="w-3.5 h-3.5 animate-spin" />
                  Testing /api/health...
                </span>
              ) : backendStatus.connected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  API Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Waiting for Server
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Express Server Status
            </h2>
            {backendStatus.connected && backendStatus.data ? (
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl text-xs font-mono space-y-1">
                <div>status: "{backendStatus.data.status}"</div>
                <div>app: "{backendStatus.data.app}"</div>
                <div>version: "{backendStatus.data.version}"</div>
                <div className="text-slate-400">timestamp: "{backendStatus.data.timestamp}"</div>
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Start the backend in another terminal with <code className="text-xs bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">npm run dev</code> inside <code className="text-xs bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">server/</code>.
              </p>
            )}
          </div>
        </div>

        {/* Phase Summary Checklist */}
        <div className="glass-card p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Phase 1 Scaffolding Checklist
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">Git Tag & Branch Saved</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Branch: <code>backup-legacy-vanilla</code>, Tag: <code>v1.0.0-vanilla</code></span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">Legacy Code Preserved</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Archived in <code>legacy/</code> folder</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">Vite + React Client</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Tailwind CSS + Dark/Light Theme Support</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-slate-800 dark:text-slate-200">Express REST Server</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">CORS enabled + <code>/api/health</code> endpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <footer className="text-center text-xs text-slate-500 dark:text-slate-400 pt-4">
          Ready for Phase 2: MongoDB, Mongoose, JWT Authentication, and User Profiles.
        </footer>

      </main>
    </div>
  );
}
