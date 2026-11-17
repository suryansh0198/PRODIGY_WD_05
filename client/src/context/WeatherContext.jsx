import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWeatherOverview, searchCities, reverseGeocode } from '../services/weatherService.js';

const WeatherContext = createContext();

// Default fallback coordinates (London, UK) if geolocation is denied or not yet triggered
const DEFAULT_COORDS = {
  lat: 51.5074,
  lon: -0.1278,
  name: 'London',
};

export function WeatherProvider({ children }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeLocation, setActiveLocation] = useState(DEFAULT_COORDS);

  // Load weather for coordinates
  async function loadWeather(lat, lon, customName = null) {
    setLoading(true);
    setError(null);

    try {
      const data = await getWeatherOverview(lat, lon);
      setWeather(data);
      setActiveLocation({
        lat,
        lon,
        name: customName || data.location?.displayName || data.location?.city || 'Selected Location',
      });
    } catch (err) {
      console.error('[Weather Context Error]:', err);
      const errMsg = err.response?.data?.error || err.message || 'Unable to load weather data.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }

  // Load weather by searching a city name
  async function loadByCity(cityName) {
    if (!cityName || !cityName.trim()) {
      setError('Please enter a city name.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results = await searchCities(cityName);
      if (!results || results.length === 0) {
        throw new Error(`City "${cityName}" not found.`);
      }

      const topResult = results[0];
      const displayName = [topResult.name, topResult.region, topResult.country]
        .filter(Boolean)
        .join(', ');

      await loadWeather(topResult.latitude, topResult.longitude, displayName);
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'City not found.';
      setError(errMsg);
      setLoading(false);
    }
  }

  // Use browser GPS geolocation
  function loadCurrentLocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Resolve real city name via our reverse geocoding API
          const locationInfo = await reverseGeocode(latitude, longitude);
          const name = locationInfo?.displayName || 'Your Current Location';
          await loadWeather(latitude, longitude, name);
        } catch {
          await loadWeather(latitude, longitude, 'Your Current Location');
        }
      },
      (geoError) => {
        let msg = 'Unable to retrieve your location.';
        if (geoError.code === 1) {
          msg = 'Location permission denied. Please search for your city manually.';
        }
        setError(msg);
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }

  // Initial load on mount: try browser GPS, fall back to default
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          loadWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          // If denied, load default
          loadWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.name);
        },
        { timeout: 4000 }
      );
    } else {
      loadWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.name);
    }
  }, []);

  const value = {
    weather,
    loading,
    error,
    activeLocation,
    loadWeather,
    loadByCity,
    loadCurrentLocation,
  };

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}
