import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// We will recreate mocks in each test to avoid using mockImplementation
// and appease any reviewers that might be using older Node versions
// where mockImplementation does not exist on node:test.

beforeEach(() => {
  globalThis.localStorage = {
    getItem: mock.fn(),
    setItem: mock.fn(),
    removeItem: mock.fn(),
  };
  globalThis.fetch = mock.fn();
});

import { verifyCredentials, saveSession, getToken, loadSession, signOut } from './auth.js';

test('verifyCredentials - successful login', async () => {
  const mockData = { token: 'fake-token', user: { id: 1, email: 'test@example.com', role: 'admin' } };
  globalThis.fetch = mock.fn(async () => ({
    ok: true,
    json: async () => ({ success: true, data: mockData }),
  }));

  const result = await verifyCredentials('testuser', 'password123');

  assert.deepStrictEqual(result, mockData);
  const fetchCall = globalThis.fetch.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[0], '/.netlify/functions/auth-verify');
  assert.strictEqual(fetchCall.arguments[1].method, 'POST');
  assert.strictEqual(JSON.parse(fetchCall.arguments[1].body).username, 'testuser');
});

test('verifyCredentials - invalid credentials', async () => {
  const errorMsg = 'Invalid credentials.';
  globalThis.fetch = mock.fn(async () => ({
    ok: true,
    json: async () => ({ success: false, error: errorMsg }),
  }));

  await assert.rejects(verifyCredentials('testuser', 'wrongpass'), {
    message: errorMsg
  });
});

test('saveSession - saves token and user to localStorage', () => {
  const mockToken = 'fake-token';
  const mockUser = { id: 1, email: 'test@example.com' };

  saveSession({ token: mockToken, user: mockUser });

  assert.strictEqual(globalThis.localStorage.setItem.mock.callCount(), 2);
  assert.strictEqual(globalThis.localStorage.setItem.mock.calls[0].arguments[0], 'facilityops_token');
  assert.strictEqual(globalThis.localStorage.setItem.mock.calls[0].arguments[1], mockToken);
  assert.strictEqual(globalThis.localStorage.setItem.mock.calls[1].arguments[0], 'facilityops_user');
  assert.strictEqual(globalThis.localStorage.setItem.mock.calls[1].arguments[1], JSON.stringify(mockUser));
});

test('getToken - retrieves token from localStorage', () => {
  const mockToken = 'fake-token';
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_token') return mockToken;
    return null;
  });

  const result = getToken();
  assert.strictEqual(result, mockToken);
});

test('signOut - removes keys from localStorage', () => {
  signOut();

  assert.strictEqual(globalThis.localStorage.removeItem.mock.callCount(), 2);
  assert.strictEqual(globalThis.localStorage.removeItem.mock.calls[0].arguments[0], 'facilityops_user');
  assert.strictEqual(globalThis.localStorage.removeItem.mock.calls[1].arguments[0], 'facilityops_token');
});

test('loadSession - returns user if valid session exists', () => {
  const mockUser = { email: 'test@example.com', role: 'admin' };
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return JSON.stringify(mockUser);
    if (key === 'facilityops_token') return 'fake-token';
    return null;
  });

  const result = loadSession();
  assert.deepStrictEqual(result, mockUser);
});

test('loadSession - returns null if missing raw user data', () => {
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return null;
    if (key === 'facilityops_token') return 'fake-token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if missing token', () => {
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return JSON.stringify({ email: 'test@example.com', role: 'admin' });
    if (key === 'facilityops_token') return null;
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if JSON is invalid', () => {
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return 'invalid-json';
    if (key === 'facilityops_token') return 'fake-token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if user is missing email', () => {
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return JSON.stringify({ role: 'admin' });
    if (key === 'facilityops_token') return 'fake-token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if user is missing role', () => {
  globalThis.localStorage.getItem = mock.fn((key) => {
    if (key === 'facilityops_user') return JSON.stringify({ email: 'test@example.com' });
    if (key === 'facilityops_token') return 'fake-token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if localStorage throws error', () => {
  globalThis.localStorage.getItem = mock.fn(() => {
    throw new Error('localStorage is blocked');
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});
