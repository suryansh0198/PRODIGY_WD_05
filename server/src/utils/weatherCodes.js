export const weatherCodes = {
  0: { label: 'Clear sky', icon: '☀️', category: 'clear', isPrecipitation: false },
  1: { label: 'Mainly clear', icon: '🌤️', category: 'clear', isPrecipitation: false },
  2: { label: 'Partly cloudy', icon: '⛅', category: 'cloudy', isPrecipitation: false },
  3: { label: 'Overcast', icon: '☁️', category: 'cloudy', isPrecipitation: false },
  45: { label: 'Foggy', icon: '🌫️', category: 'fog', isPrecipitation: false },
  48: { label: 'Depositing rime fog', icon: '🌫️', category: 'fog', isPrecipitation: false },
  51: { label: 'Light drizzle', icon: '🌦️', category: 'rain', isPrecipitation: true },
  53: { label: 'Moderate drizzle', icon: '🌦️', category: 'rain', isPrecipitation: true },
  55: { label: 'Dense drizzle', icon: '🌧️', category: 'rain', isPrecipitation: true },
  56: { label: 'Light freezing drizzle', icon: '🌧️', category: 'rain', isPrecipitation: true },
  57: { label: 'Dense freezing drizzle', icon: '🌧️', category: 'rain', isPrecipitation: true },
  61: { label: 'Slight rain', icon: '🌦️', category: 'rain', isPrecipitation: true },
  63: { label: 'Moderate rain', icon: '🌧️', category: 'rain', isPrecipitation: true },
  65: { label: 'Heavy rain', icon: '🌧️', category: 'rain', isPrecipitation: true },
  66: { label: 'Light freezing rain', icon: '🌧️', category: 'rain', isPrecipitation: true },
  67: { label: 'Heavy freezing rain', icon: '🌧️', category: 'rain', isPrecipitation: true },
  71: { label: 'Slight snow fall', icon: '🌨️', category: 'snow', isPrecipitation: true },
  73: { label: 'Moderate snow fall', icon: '❄️', category: 'snow', isPrecipitation: true },
  75: { label: 'Heavy snow fall', icon: '❄️', category: 'snow', isPrecipitation: true },
  77: { label: 'Snow grains', icon: '🌨️', category: 'snow', isPrecipitation: true },
  80: { label: 'Slight rain showers', icon: '🌦️', category: 'rain', isPrecipitation: true },
  81: { label: 'Moderate rain showers', icon: '🌧️', category: 'rain', isPrecipitation: true },
  82: { label: 'Violent rain showers', icon: '⛈️', category: 'rain', isPrecipitation: true },
  85: { label: 'Slight snow showers', icon: '🌨️', category: 'snow', isPrecipitation: true },
  86: { label: 'Heavy snow showers', icon: '❄️', category: 'snow', isPrecipitation: true },
  95: { label: 'Thunderstorm', icon: '⛈️', category: 'thunderstorm', isPrecipitation: true },
  96: { label: 'Thunderstorm with slight hail', icon: '⛈️', category: 'thunderstorm', isPrecipitation: true },
  99: { label: 'Thunderstorm with heavy hail', icon: '⛈️', category: 'thunderstorm', isPrecipitation: true },
};

export function getWeatherInfo(code) {
  return (
    weatherCodes[code] || {
      label: 'Unknown weather',
      icon: '🌍',
      category: 'unknown',
      isPrecipitation: false,
    }
  );
}
