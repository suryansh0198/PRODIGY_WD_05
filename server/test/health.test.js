import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/app.js';

describe('Server Health and Basic Routes', () => {
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

  test('GET /api/health returns 200 with ok status', async () => {
    const response = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(response.status, 200);

    const body = await response.json();
    assert.strictEqual(body.status, 'ok');
    assert.strictEqual(body.app, 'CommuteCast API');
    assert.strictEqual(body.version, '1.0.0');
    assert.ok(body.timestamp, 'timestamp should be present');
  });

  test('GET / returns 200 welcome message', async () => {
    const response = await fetch(`${baseUrl}/`);
    assert.strictEqual(response.status, 200);

    const body = await response.json();
    assert.ok(body.message.includes('Welcome to CommuteCast API'));
  });

  test('GET /api/unknown-route returns 404', async () => {
    const response = await fetch(`${baseUrl}/api/unknown-route`);
    assert.strictEqual(response.status, 404);

    const body = await response.json();
    assert.strictEqual(body.error, 'Route not found');
  });
});
