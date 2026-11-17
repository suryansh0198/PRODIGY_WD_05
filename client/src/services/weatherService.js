import api from './api.js';

export async function getWeatherOverview(lat, lon) {
  const response = await api.get('/weather/overview', {
    params: { lat, lon },
  });
  return response.data;
}

export async function searchCities(query) {
  if (!query || query.trim().length === 0) return [];
  const response = await api.get('/weather/geocode', {
    params: { query: query.trim() },
  });
  return response.data.results || [];
}

export async function reverseGeocode(lat, lon) {
  const response = await api.get('/weather/reverse-geocode', {
    params: { lat, lon },
  });
  return response.data.location;
}
