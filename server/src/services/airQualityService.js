import axios from 'axios';
import { cache } from '../utils/cache.js';

// US AQI (0 to 500) Categorization according to EPA standard
export function categorizeUsAqi(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: null, label: 'Unknown', color: '#64748b', severity: 'unknown' };
  }
  const aqi = Math.round(value);

  if (aqi <= 50) {
    return { value: aqi, label: 'Good', color: '#22c55e', severity: 'good' };
  }
  if (aqi <= 100) {
    return { value: aqi, label: 'Moderate', color: '#eab308', severity: 'moderate' };
  }
  if (aqi <= 150) {
    return { value: aqi, label: 'Unhealthy for Sensitive Groups', color: '#f97316', severity: 'sensitive' };
  }
  if (aqi <= 200) {
    return { value: aqi, label: 'Unhealthy', color: '#ef4444', severity: 'unhealthy' };
  }
  if (aqi <= 300) {
    return { value: aqi, label: 'Very Unhealthy', color: '#a855f7', severity: 'very_unhealthy' };
  }
  return { value: aqi, label: 'Hazardous', color: '#881337', severity: 'hazardous' };
}

// European AQI (1 to 5) Categorization according to EAQI standard
export function categorizeEuropeanAqi(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return { value: null, label: 'Unknown', color: '#64748b', severity: 'unknown' };
  }
  const eaqi = Math.round(value);

  switch (eaqi) {
    case 1:
      return { value: 1, label: 'Good', color: '#3b82f6', severity: 'good' };
    case 2:
      return { value: 2, label: 'Fair', color: '#10b981', severity: 'fair' };
    case 3:
      return { value: 3, label: 'Moderate', color: '#eab308', severity: 'moderate' };
    case 4:
      return { value: 4, label: 'Poor', color: '#ef4444', severity: 'poor' };
    case 5:
    case 6:
      return { value: 5, label: 'Very Poor', color: '#7f1d1d', severity: 'very_poor' };
    default:
      return { value: eaqi, label: 'Moderate', color: '#eab308', severity: 'moderate' };
  }
}

// Generate commuter-specific health advisory based on pollution levels
export function generateAqiCommuteAdvice(usAqiValue, pm25Value) {
  if (usAqiValue <= 50) {
    return 'Air quality is pristine. Perfect conditions for cycling, walking, or any outdoor commute.';
  }
  if (usAqiValue <= 100) {
    return 'Air quality is acceptable. Very sensitive individuals should consider taking it easy on strenuous bike rides.';
  }
  if (usAqiValue <= 150) {
    return 'Sensitive groups (asthma, respiratory conditions) should limit prolonged outdoor exertion. Consider an N95 mask or public transit.';
  }
  if (usAqiValue <= 200) {
    return 'Air quality is unhealthy. Cyclists, runners, and pedestrians should wear a particulate mask. Closed-vehicle or metro transit recommended.';
  }
  if (usAqiValue <= 300) {
    return 'Health alert: Very unhealthy air. Avoid active outdoor commuting; keep car windows closed or take enclosed transit with air filtration.';
  }
  return 'Hazardous emergency air quality warning. Everyone should avoid outdoor physical exertion. Stay indoors or use high-grade respiratory protection.';
}

export async function fetchAirQualityData(lat, lon) {
  const roundedLat = parseFloat(lat).toFixed(3);
  const roundedLon = parseFloat(lon).toFixed(3);
  const cacheKey = `aqi:${roundedLat}:${roundedLon}`;

  const cached = cache.get(cacheKey);
  if (cached) {
    return { ...cached, cached: true };
  }

  const url = 'https://air-quality-api.open-meteo.com/v1/air-quality';
  const response = await axios.get(url, {
    params: {
      latitude: roundedLat,
      longitude: roundedLon,
      current: [
        'european_aqi',
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
      ].join(','),
      timezone: 'auto',
    },
    timeout: 8000,
  });

  const current = response.data.current || {};
  const usAqi = categorizeUsAqi(current.us_aqi);
  const europeanAqi = categorizeEuropeanAqi(current.european_aqi);
  const healthAdvice = generateAqiCommuteAdvice(usAqi.value || 0, current.pm2_5 || 0);

  const result = {
    usAqi,
    europeanAqi,
    pollutants: {
      pm2_5: current.pm2_5 !== undefined ? Math.round(current.pm2_5 * 10) / 10 : null,
      pm10: current.pm10 !== undefined ? Math.round(current.pm10 * 10) / 10 : null,
      ozone: current.ozone !== undefined ? Math.round(current.ozone * 10) / 10 : null,
      nitrogenDioxide: current.nitrogen_dioxide !== undefined ? Math.round(current.nitrogen_dioxide * 10) / 10 : null,
      carbonMonoxide: current.carbon_monoxide !== undefined ? Math.round(current.carbon_monoxide * 10) / 10 : null,
      sulphurDioxide: current.sulphur_dioxide !== undefined ? Math.round(current.sulphur_dioxide * 10) / 10 : null,
    },
    healthAdvice,
    cached: false,
  };

  // Cache for 15 minutes (900 seconds)
  cache.set(cacheKey, result, 900);
  return result;
}
