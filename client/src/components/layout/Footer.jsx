import React from 'react';

export default function Footer() {
  return (
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 py-6 border-t border-orange-200/40 dark:border-slate-800 space-y-1">
      <p>
        CommuteCast • Powered by Open-Meteo, Express & React
      </p>
      <p className="text-[11px] text-slate-400 dark:text-slate-500">
        Engineered for students, professionals, and daily commuters.
      </p>
    </footer>
  );
}
