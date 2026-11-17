import axios from 'axios';
import { cache } from '../utils/cache.js';
import { getWeatherInfo } from '../utils/weatherCodes.js';

export async function fetchWeatherData(lat, lon) {
  // Round coordinates to 3 decimals (~110m accuracy) for optimal cache hit ratio
  const roundedLat = parseFloat(lat).toFixed(3);
  const roundedLon = parseFloat(lon).toFixed(3);
  const cacheKey = `weather:${roundedLat}:${roundedLon}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const url = 'https://api.open-meteo.com/v1/forecast';
  const response = await axios.get(url, {
    params: {
      latitude: roundedLat,
      longitude: roundedLon,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'wind_gusts_10m',
      ].join(','),
      hourly: [
        'temperature_2m',
        'precipitation_probability',
        'weather_code',
        'wind_speed_10m',
      ].join(','),
      daily: [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'sunrise',
        'sunset',
        'precipitation_sum',
      ].join(','),
      timezone: 'auto',
    },
    timeout: 8000,
  });

  const data = response.data;
  const current = data.current;
  const currentInfo = getWeatherInfo(current.weather_code);

  // Format 24-hour commuter forecast
  const now = new Date();
  const hourly = [];
  if (data.hourly && data.hourly.time) {
    const totalHours = Math.min(24, data.hourly.time.length);
    for (let i = 0; i < totalHours; i++) {
      const info = getWeatherInfo(data.hourly.weather_code[i]);
      hourly.push({
        time: data.hourly.time[i],
        temperature: Math.round(data.hourly.temperature_2m[i] * 10) / 10,
        rainProbability: data.hourly.precipitation_probability[i] ?? 0,
        windSpeed: Math.round(data.hourly.wind_speed_10m[i] * 10) / 10,
        weatherCode: data.hourly.weather_code[i],
        condition: info.label,
        icon: info.icon,
      });
    }
  }

  // Format 7-day daily forecast
  const daily = [];
  if (data.daily && data.daily.time) {
    for (let i = 0; i < data.daily.time.length; i++) {
      const info = getWeatherInfo(data.daily.weather_code[i]);
      daily.push({
        date: data.daily.time[i],
        maxTemp: Math.round(data.daily.temperature_2m_max[i]),
        minTemp: Math.round(data.daily.temperature_2m_min[i]),
        rainSum: data.daily.precipitation_sum[i] ?? 0,
        sunrise: data.daily.sunrise[i],
        sunset: data.daily.sunset[i],
        weatherCode: data.daily.weather_code[i],
        condition: info.label,
        icon: info.icon,
      });
    }
  }

  const result = {
    latitude: data.latitude,
    longitude: data.longitude,
    elevation: data.elevation,
    timezone: data.timezone,
    current: {
      temperature: Math.round(current.temperature_2m * 10) / 10,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      windGusts: Math.round(current.wind_gusts_10m * 10) / 10,
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      condition: currentInfo.label,
      icon: currentInfo.icon,
      category: currentInfo.category,
      isPrecipitation: currentInfo.isPrecipitation,
    },
    sun: {
      sunrise: data.daily.sunrise[0],
      sunset: data.daily.sunset[0],
    },
    hourly,
    daily,
    cached: false,
  };

  // Cache for 10 minutes (600 seconds)
  cache.set(cacheKey, result, 600);
  return result;
}
