import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';

describe('Authentication & User Management Suite', () => {
  let server;
  let baseUrl;
  const TEST_MONGO_URI = 'mongodb://127.0.0.1:27017/commutecast_test';

  before(async () => {
    // Connect to dedicated test database
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    await mongoose.connect(TEST_MONGO_URI);

    // Spin up ephemeral test server
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Drop test database and close connections
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
    }
    await new Promise((resolve) => server.close(resolve));
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  test('POST /api/auth/register creates user and returns token & sanitized user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Commuter',
        email: 'alex@example.com',
        password: 'securepassword123',
        preferredTransport: 'cycling',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.name, 'Alex Commuter');
    assert.strictEqual(body.user.email, 'alex@example.com');
    assert.strictEqual(body.user.preferredTransport, 'cycling');
    assert.strictEqual(typeof body.token, 'string');
    assert.strictEqual(body.user.password, undefined, 'Password must never be exposed');
  });

  test('POST /api/auth/register prevents duplicate email registration', async () => {
    // First registration
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'password123',
      }),
    });

    // Duplicate attempt
    const duplicateRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second User',
        email: 'duplicate@example.com',
        password: 'password456',
      }),
    });

    assert.strictEqual(duplicateRes.status, 409);
    const body = await duplicateRes.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'An account with this email already exists');
  });

  test('POST /api/auth/register rejects short passwords (< 6 chars)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('at least 6 characters'));
  });

  test('POST /api/auth/register rejects invalid email format', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'not-an-email',
        password: 'password123',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('valid email'));
  });

  test('POST /api/auth/register rejects invalid transport mode', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        preferredTransport: 'airplane',
      }),
    });

    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.ok(body.error.includes('Invalid transport mode'));
  });

  test('POST /api/auth/login authenticates valid credentials', async () => {
    // Register
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Login Tester',
        email: 'logintester@example.com',
        password: 'mysecretpassword',
      }),
    });

    // Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'logintester@example.com',
        password: 'mysecretpassword',
      }),
    });

    assert.strictEqual(loginRes.status, 200);
    const body = await loginRes.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.message, 'Login successful');
    assert.strictEqual(typeof body.token, 'string');
    assert.strictEqual(body.user.email, 'logintester@example.com');
  });

  test('POST /api/auth/login rejects incorrect password', async () => {
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pass Tester',
        email: 'pass@example.com',
        password: 'correctpassword',
      }),
    });

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'pass@example.com',
        password: 'wrongpassword',
      }),
    });

    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Invalid email or password');
  });

  test('GET /api/auth/me returns profile for valid JWT token', async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Me Tester',
        email: 'me@example.com',
        password: 'password123',
        preferredTransport: 'two_wheeler',
      }),
    });
    const { token } = await regRes.json();

    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(meRes.status, 200);
    const body = await meRes.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.name, 'Me Tester');
    assert.strictEqual(body.user.preferredTransport, 'two_wheeler');
  });

  test('GET /api/auth/me rejects request with missing token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Access denied. No authentication token provided.');
  });

  test('GET /api/auth/me rejects forged/tampered token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid.tampered.token',
      },
    });
    assert.strictEqual(res.status, 401);
    const body = await res.json();
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error, 'Invalid authentication token.');
  });

  test('PUT /api/auth/preferences updates user transport mode', async () => {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pref Tester',
        email: 'pref@example.com',
        password: 'password123',
        preferredTransport: 'transit',
      }),
    });
    const { token } = await regRes.json();

    const updateRes = await fetch(`${baseUrl}/api/auth/preferences`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        preferredTransport: 'walking',
      }),
    });

    assert.strictEqual(updateRes.status, 200);
    const body = await updateRes.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.preferredTransport, 'walking');
  });

  test('Database verification: stored password is a valid bcrypt hash and not plaintext', async () => {
    await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Hash Tester',
        email: 'hash@example.com',
        password: 'plaintextSecretPassword',
      }),
    });

    const rawUser = await User.findOne({ email: 'hash@example.com' }).select('+password');
    assert.notStrictEqual(rawUser.password, 'plaintextSecretPassword', 'Password must NOT be stored in plaintext');
    assert.match(rawUser.password, /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/, 'Password must match bcrypt hash pattern');
  });
});
