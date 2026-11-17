import React, { useState } from 'react';
import { X, Lock, Mail, User, Bike, Footprints, Bus, Car, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredTransport, setPreferredTransport] = useState('transit');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        await register(name, email, password, preferredTransport);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Authentication failed.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  const transportOptions = [
    { id: 'transit', label: 'Transit', icon: Bus },
    { id: 'cycling', label: 'Bicycle', icon: Bike },
    { id: 'two_wheeler', label: 'Motorbike', icon: Bike },
    { id: 'walking', label: 'Walking', icon: Footprints },
    { id: 'driving', label: 'Car', icon: Car },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-card shadow-2xl space-y-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {isRegister
              ? 'Save your commutes and personalize travel recommendations.'
              : 'Log in to access your saved routes and custom commuter advice.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Your Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Commuter"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Transport Mode Selection (Registration only) */}
          {isRegister && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Commute Mode
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {transportOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = preferredTransport === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredTransport(opt.id)}
                      className={`p-2 rounded-xl flex flex-col items-center gap-1 border transition-all text-center ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-semibold">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Switch Mode Footer */}
        <div className="text-center pt-2 text-xs text-slate-500 dark:text-slate-400">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="font-bold text-orange-600 dark:text-orange-400 hover:underline ml-1"
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
}
