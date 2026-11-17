import axios from 'axios';
import { cache } from '../utils/cache.js';

// Forward Geocoding: Search cities by name
export async function searchCity(query) {
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return [];
  }

  const cleanQuery = query.trim().toLowerCase();
  const cacheKey = `geocode:${cleanQuery}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const url = 'https://geocoding-api.open-meteo.com/v1/search';
  const response = await axios.get(url, {
    params: {
      name: cleanQuery,
      count: 5,
      language: 'en',
      format: 'json',
    },
    timeout: 7000,
  });

  const results = [];
  if (response.data && response.data.results) {
    for (const place of response.data.results) {
      results.push({
        id: place.id,
        name: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        country: place.country || '',
        countryCode: place.country_code || '',
        region: place.admin1 || '',
        timezone: place.timezone || 'auto',
      });
    }
  }

  // Cache for 1 hour (3600 seconds)
  cache.set(cacheKey, results, 3600);
  return results;
}

// Reverse Geocoding: Convert GPS coordinates to human-readable place name
export async function reverseGeocode(lat, lon) {
  const roundedLat = parseFloat(lat).toFixed(3);
  const roundedLon = parseFloat(lon).toFixed(3);
  const cacheKey = `reverse:${roundedLat}:${roundedLon}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const url = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
    const response = await axios.get(url, {
      params: {
        latitude: roundedLat,
        longitude: roundedLon,
        localityLanguage: 'en',
      },
      timeout: 7000,
    });

    const data = response.data || {};
    const city =
      data.city ||
      data.locality ||
      data.principalSubdivision ||
      'Current Location';
    const region = data.principalSubdivision || '';
    const country = data.countryName || '';

    // Build friendly display string (e.g. "Bandra, Mumbai, India")
    const parts = [data.locality, city, region, country].filter(
      (p, idx, arr) => p && arr.indexOf(p) === idx
    );
    const displayName = parts.length > 0 ? parts.slice(0, 3).join(', ') : city;

    const result = {
      city,
      locality: data.locality || city,
      region,
      country,
      displayName,
      latitude: parseFloat(roundedLat),
      longitude: parseFloat(roundedLon),
    };

    cache.set(cacheKey, result, 3600);
    return result;
  } catch (error) {
    console.warn('[Reverse Geocode Warning]:', error.message);
    // Graceful fallback if reverse geocoding service is unreachable
    return {
      city: 'Current Location',
      locality: 'Current Location',
      region: '',
      country: '',
      displayName: `Lat: ${roundedLat}, Lon: ${roundedLon}`,
      latitude: parseFloat(roundedLat),
      longitude: parseFloat(roundedLon),
    };
  }
}
