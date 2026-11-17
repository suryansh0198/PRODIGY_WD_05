import express from 'express';
import {
  getCurrentWeather,
  getAirQuality,
  searchLocations,
  getReverseGeocode,
  getWeatherOverview,
} from '../controllers/weatherController.js';
import { validateCoordinates } from '../middleware/validateCoordinates.js';

const router = express.Router();

// Consolidated overview for commuter dashboard
router.get('/overview', validateCoordinates, getWeatherOverview);

// Granular endpoints
router.get('/current', validateCoordinates, getCurrentWeather);
router.get('/air-quality', validateCoordinates, getAirQuality);
router.get('/geocode', searchLocations);
router.get('/reverse-geocode', validateCoordinates, getReverseGeocode);

export default router;
