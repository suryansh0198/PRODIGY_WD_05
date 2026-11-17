import { fetchWeatherData } from '../services/weatherService.js';
import { fetchAirQualityData } from '../services/airQualityService.js';
import { searchCity, reverseGeocode } from '../services/geocodingService.js';

// @desc    Get current weather & forecast
// @route   GET /api/weather/current?lat={lat}&lon={lon}
// @access  Public
export async function getCurrentWeather(req, res) {
  try {
    const { lat, lon } = req.validCoords;
    const weather = await fetchWeatherData(lat, lon);
    res.status(200).json({
      success: true,
      ...weather,
    });
  } catch (error) {
    console.error('[Weather Controller Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Unable to fetch weather data from upstream weather provider.',
    });
  }
}

// @desc    Get air quality data (US AQI & European AQI)
// @route   GET /api/weather/air-quality?lat={lat}&lon={lon}
// @access  Public
export async function getAirQuality(req, res) {
  try {
    const { lat, lon } = req.validCoords;
    const airQuality = await fetchAirQualityData(lat, lon);
    res.status(200).json({
      success: true,
      ...airQuality,
    });
  } catch (error) {
    console.error('[Air Quality Controller Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Unable to fetch air quality data from upstream provider.',
    });
  }
}

// @desc    Search places by city name (forward geocoding)
// @route   GET /api/weather/geocode?query={cityName}
// @access  Public
export async function searchLocations(req, res) {
  try {
    const query = req.query.query;
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "query" is required.',
      });
    }

    const results = await searchCity(query);
    res.status(200).json({
      success: true,
      query: query.trim(),
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('[Geocode Controller Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Unable to resolve city name from geocoding provider.',
    });
  }
}

// @desc    Reverse geocode coordinates into a readable city name
// @route   GET /api/weather/reverse-geocode?lat={lat}&lon={lon}
// @access  Public
export async function getReverseGeocode(req, res) {
  try {
    const { lat, lon } = req.validCoords;
    const location = await reverseGeocode(lat, lon);
    res.status(200).json({
      success: true,
      location,
    });
  } catch (error) {
    console.error('[Reverse Geocode Controller Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Unable to reverse geocode coordinates.',
    });
  }
}

// @desc    Consolidated commuter overview (Weather + AQI + Location in one call)
// @route   GET /api/weather/overview?lat={lat}&lon={lon}
// @access  Public
export async function getWeatherOverview(req, res) {
  try {
    const { lat, lon } = req.validCoords;

    // Fetch weather, AQI, and location in parallel for maximum speed
    const [weather, airQuality, location] = await Promise.all([
      fetchWeatherData(lat, lon),
      fetchAirQualityData(lat, lon),
      reverseGeocode(lat, lon),
    ]);

    res.status(200).json({
      success: true,
      cached: weather.cached && airQuality.cached,
      location,
      current: weather.current,
      sun: weather.sun,
      hourlyForecast: weather.hourly,
      dailyForecast: weather.daily,
      airQuality,
    });
  } catch (error) {
    console.error('[Weather Overview Error]:', error.message);
    res.status(502).json({
      success: false,
      error: 'Failed to aggregate commute weather overview.',
    });
  }
}
