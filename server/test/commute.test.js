import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';
import { getCommuteRecommendation } from '../src/services/commuteService.js';

describe('Commute Recommendation Engine Suite', () => {
  let server;
  let baseUrl;

  before(async () => {
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
  });

  test('GET /api/commute/recommendation returns viable score and factors', async () => {
    const res = await fetch(`${baseUrl}/api/commute/recommendation?lat=51.507&lon=-0.127&mode=cycling`);
    assert.strictEqual(res.status, 200);

    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.mode, 'cycling');
    assert.ok(typeof body.score === 'number');
    assert.ok(body.score >= 0 && body.score <= 100);
    assert.ok(body.verdict);
    assert.ok(body.color);
    assert.ok(Array.isArray(body.factors));
    assert.ok(body.weatherSummary);
  });

  test('GET /api/commute/recommendation rejects invalid mode with 400', async () => {
    const res = await fetch(`${baseUrl}/api/commute/recommendation?lat=51.507&lon=-0.127&mode=submarine`);
    assert.strictEqual(res.status, 400);

    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('Allowed modes'));
  });

  test('GET /api/commute/recommendation rejects missing coordinates with 400', async () => {
    const res = await fetch(`${baseUrl}/api/commute/recommendation?mode=walking`);
    assert.strictEqual(res.status, 400);
  });

  test('Service logic: all 5 modes generate valid scores between 10 and 100', async () => {
    const modes = ['transit', 'cycling', 'two_wheeler', 'walking', 'driving'];
    for (const mode of modes) {
      const result = await getCommuteRecommendation(51.507, -0.127, mode);
      assert.ok(result.score >= 10 && result.score <= 100, `Score for ${mode} should be bounded`);
      assert.strictEqual(result.mode, mode);
      assert.ok(result.verdict);
    }
  });
});
