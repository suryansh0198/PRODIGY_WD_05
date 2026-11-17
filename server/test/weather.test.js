import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { SimpleCache, cache } from '../src/utils/cache.js';
import {
  categorizeUsAqi,
  categorizeEuropeanAqi,
  generateAqiCommuteAdvice,
} from '../src/services/airQualityService.js';
import { getWeatherInfo } from '../src/utils/weatherCodes.js';

describe('Weather, AQI & Geocoding Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
    cache.clear();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    cache.clear();
  });

  // 1. In-memory Cache Unit Tests
  describe('In-Memory Cache Engine', () => {
    test('Stores, retrieves and expires cached entries', async () => {
      const testCache = new SimpleCache(1); // 1-second TTL
      testCache.set('tempKey', { temp: 22 });

      assert.deepStrictEqual(testCache.get('tempKey'), { temp: 22 });
      assert.strictEqual(testCache.has('tempKey'), true);
      assert.strictEqual(testCache.get('nonExistentKey'), null);

      // Wait 1.1s for expiration
      await new Promise((r) => setTimeout(r, 1100));
      assert.strictEqual(testCache.get('tempKey'), null, 'Key should expire after TTL');
    });

    test('Manual deletion and cache clear', () => {
      const testCache = new SimpleCache(60);
      testCache.set('k1', 'val1');
      testCache.set('k2', 'val2');

      testCache.del('k1');
      assert.strictEqual(testCache.get('k1'), null);
      assert.strictEqual(testCache.get('k2'), 'val2');

      testCache.clear();
      assert.strictEqual(testCache.get('k2'), null);
    });
  });

  // 2. Weather Code Mapping Tests
  describe('WMO Weather Code Dictionary', () => {
    test('Maps codes accurately to conditions, icons, and precipitation flags', () => {
      const clear = getWeatherInfo(0);
      assert.strictEqual(clear.label, 'Clear sky');
      assert.strictEqual(clear.icon, '☀️');
      assert.strictEqual(clear.isPrecipitation, false);

      const rain = getWeatherInfo(61);
      assert.strictEqual(rain.label, 'Slight rain');
      assert.strictEqual(rain.isPrecipitation, true);

      const storm = getWeatherInfo(95);
      assert.strictEqual(storm.label, 'Thunderstorm');
      assert.strictEqual(storm.isPrecipitation, true);

      const unknown = getWeatherInfo(9999);
      assert.strictEqual(unknown.label, 'Unknown weather');
    });
  });

  // 3. AQI Standards Distinction Tests
  describe('AQI Categorization (US vs European)', () => {
    test('US AQI 0-500 scale categories', () => {
      assert.strictEqual(categorizeUsAqi(25).severity, 'good');
      assert.strictEqual(categorizeUsAqi(75).severity, 'moderate');
      assert.strictEqual(categorizeUsAqi(125).severity, 'sensitive');
      assert.strictEqual(categorizeUsAqi(175).severity, 'unhealthy');
      assert.strictEqual(categorizeUsAqi(250).severity, 'very_unhealthy');
      assert.strictEqual(categorizeUsAqi(350).severity, 'hazardous');
      assert.strictEqual(categorizeUsAqi(null).severity, 'unknown');
    });

    test('European AQI 1-5 scale categories', () => {
      assert.strictEqual(categorizeEuropeanAqi(1).severity, 'good');
      assert.strictEqual(categorizeEuropeanAqi(2).severity, 'fair');
      assert.strictEqual(categorizeEuropeanAqi(3).severity, 'moderate');
      assert.strictEqual(categorizeEuropeanAqi(4).severity, 'poor');
      assert.strictEqual(categorizeEuropeanAqi(5).severity, 'very_poor');
      assert.strictEqual(categorizeEuropeanAqi(null).severity, 'unknown');
    });

    test('Generates commute-tailored advice according to pollution', () => {
      const goodAdvice = generateAqiCommuteAdvice(30, 8);
      assert.ok(goodAdvice.includes('pristine'));

      const poorAdvice = generateAqiCommuteAdvice(180, 95);
      assert.ok(poorAdvice.includes('unhealthy'));
      assert.ok(poorAdvice.includes('mask'));
    });
  });

  // 4. Coordinate Validation Tests
  describe('Coordinate Validation Middleware', () => {
    test('Rejects missing lat/lon parameters with 400', async () => {
      const res = await fetch(`${baseUrl}/api/weather/current`);
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.strictEqual(body.success, false);
      assert.ok(body.error.includes('parameters are required'));
    });

    test('Rejects non-numeric latitude/longitude with 400', async () => {
      const res = await fetch(`${baseUrl}/api/weather/current?lat=abc&lon=12.5`);
      assert.strictEqual(res.status, 400);
      const body = await res.json();
      assert.ok(body.error.includes('numeric value'));
    });

    test('Rejects out-of-range coordinates with 400', async () => {
      const resLat = await fetch(`${baseUrl}/api/weather/current?lat=95.0&lon=20.0`);
      assert.strictEqual(resLat.status, 400);

      const resLon = await fetch(`${baseUrl}/api/weather/current?lat=20.0&lon=195.0`);
      assert.strictEqual(resLon.status, 400);
    });
  });

  // 5. Geocoding API Endpoints
  describe('Geocoding Endpoints', () => {
    test('GET /api/weather/geocode searches cities by name', async () => {
      const res = await fetch(`${baseUrl}/api/weather/geocode?query=Paris`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(Array.isArray(body.results));
      assert.ok(body.results.length > 0);
      assert.strictEqual(body.results[0].name, 'Paris');
      assert.ok(typeof body.results[0].latitude === 'number');
    });

    test('GET /api/weather/geocode rejects empty query with 400', async () => {
      const res = await fetch(`${baseUrl}/api/weather/geocode?query=`);
      assert.strictEqual(res.status, 400);
    });

    test('GET /api/weather/reverse-geocode returns human-readable place name', async () => {
      // Coordinates for London
      const res = await fetch(`${baseUrl}/api/weather/reverse-geocode?lat=51.507&lon=-0.127`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.location);
      assert.ok(body.location.displayName);
    });
  });

  // 6. Live Weather & Overview Endpoints
  describe('Weather & Overview Endpoints', () => {
    test('GET /api/weather/current returns real-time weather and 24h forecast', async () => {
      const res = await fetch(`${baseUrl}/api/weather/current?lat=51.507&lon=-0.127`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(typeof body.current.temperature === 'number');
      assert.ok(typeof body.current.humidity === 'number');
      assert.ok(typeof body.current.windSpeed === 'number');
      assert.ok(body.current.condition);
      assert.ok(body.current.icon);
      assert.ok(Array.isArray(body.hourly));
      assert.ok(body.hourly.length > 0);
      assert.ok(body.sun.sunrise);
    });

    test('GET /api/weather/air-quality returns US AQI and European AQI', async () => {
      const res = await fetch(`${baseUrl}/api/weather/air-quality?lat=51.507&lon=-0.127`);
      assert.strictEqual(res.status, 200);
      const body = await res.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.usAqi.label);
      assert.ok(body.europeanAqi.label);
      assert.ok(body.healthAdvice);
      assert.ok(body.pollutants);
    });

    test('GET /api/weather/overview aggregates weather, AQI, and location into a single call', async () => {
      // First call (cache miss)
      const res1 = await fetch(`${baseUrl}/api/weather/overview?lat=40.712&lon=-74.006`);
      assert.strictEqual(res1.status, 200);
      const body1 = await res1.json();
      assert.strictEqual(body1.success, true);
      assert.ok(body1.current);
      assert.ok(body1.airQuality);
      assert.ok(body1.location);

      // Second call (cache hit)
      const res2 = await fetch(`${baseUrl}/api/weather/overview?lat=40.712&lon=-74.006`);
      assert.strictEqual(res2.status, 200);
      const body2 = await res2.json();
      assert.strictEqual(body2.cached, true, 'Second call should be served from memory cache');
    });
  });
});
