import React, { useState, useEffect, useRef } from 'react';
import {
  CloudSun,
  Search,
  MapPin,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Bike,
  Footprints,
  Car,
  Bus,
  Loader2,
} from 'lucide-react';
import { useWeather } from '../../context/WeatherContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { searchCities } from '../../services/weatherService.js';

export default function Navbar({ darkMode, setDarkMode, onOpenAuth }) {
  const { loadByCity, loadWeather, loadCurrentLocation, loading } = useWeather();
  const { user, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchCities(searchQuery);
        setSuggestions(results.slice(0, 5));
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.warn('Autocomplete lookup error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectSuggestion(city) {
    const displayName = [city.name, city.region, city.country].filter(Boolean).join(', ');
    loadWeather(city.latitude, city.longitude, displayName);
    setSearchQuery('');
    setShowDropdown(false);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadByCity(searchQuery);
      setShowDropdown(false);
    }
  }

  // Get transport mode icon
  function getTransportIcon(mode) {
    switch (mode) {
      case 'cycling':
      case 'two_wheeler':
        return <Bike className="w-4 h-4 text-orange-500" />;
      case 'walking':
        return <Footprints className="w-4 h-4 text-emerald-500" />;
      case 'driving':
        return <Car className="w-4 h-4 text-blue-500" />;
      case 'transit':
      default:
        return <Bus className="w-4 h-4 text-purple-500" />;
    }
  }

  return (
    <header className="space-y-4 pb-4 border-b border-orange-200/50 dark:border-slate-800">
      {/* Top Bar: Brand, Theme Toggle, User Profile */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-widest font-black text-orange-600 dark:text-orange-400">
            Smart Weather & Commute Companion
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 mt-0.5">
            Commute<span className="text-orange-600 dark:text-orange-500">Cast</span>
            <CloudSun className="w-8 h-8 text-orange-500" />
          </h1>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl glass-card text-slate-700 dark:text-slate-200 hover:scale-105 transition-all shadow-sm"
            aria-label="Toggle Theme"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* User Account / Auth Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl glass-card text-xs font-semibold text-slate-800 dark:text-slate-100">
              <span className="flex items-center gap-1.5">
                {getTransportIcon(user.preferredTransport)}
                <span className="hidden sm:inline font-bold">{user.name.split(' ')[0]}</span>
              </span>
              <button
                onClick={logout}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white shadow-sm transition-all hover:scale-105"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar & Location Button */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        {/* Search input with live geocoding dropdown */}
        <div ref={searchContainerRef} className="relative flex-1">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city (e.g. London, Mumbai, Tokyo, New York)..."
              className="w-full pl-11 pr-24 py-3 rounded-2xl glass-card text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all"
            >
              Search
            </button>
          </form>

          {/* Autocomplete Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 py-2 glass-card rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((item) => (
                <button
                  key={`${item.latitude}-${item.longitude}-${item.name}`}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-4 py-2.5 text-xs hover:bg-orange-50 dark:hover:bg-slate-800/80 flex items-center justify-between text-slate-700 dark:text-slate-200 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                  <span className="text-[11px] text-slate-400">
                    {[item.region, item.country].filter(Boolean).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* GPS Location Button */}
        <button
          onClick={loadCurrentLocation}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold glass-card text-slate-800 dark:text-slate-100 hover:bg-orange-50 dark:hover:bg-slate-800/80 transition-all shadow-sm shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          ) : (
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          )}
          <span>Use My Location</span>
        </button>
      </div>
    </header>
  );
}
