import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageMock = {
  getItem: mock.fn(),
  setItem: mock.fn(),
  removeItem: mock.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock fetch
const fetchMock = mock.fn();
globalThis.fetch = fetchMock;

import { verifyCredentials, saveSession, getToken, loadSession, signOut } from './auth.js';

beforeEach(() => {
  fetchMock.mock.resetCalls();
  localStorageMock.getItem.mock.resetCalls();
  localStorageMock.setItem.mock.resetCalls();
  localStorageMock.removeItem.mock.resetCalls();
});

test('verifyCredentials - successful request', async () => {
  const mockData = { token: '123', user: { id: 1, email: 'test@example.com' } };
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    json: async () => ({ success: true, data: mockData }),
  }));

  const result = await verifyCredentials('testuser', 'password123');

  assert.deepStrictEqual(result, mockData);
  const fetchCall = fetchMock.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[0], '/.netlify/functions/auth-verify');
  assert.strictEqual(fetchCall.arguments[1].method, 'POST');
  assert.strictEqual(fetchCall.arguments[1].body, JSON.stringify({ username: 'testuser', password: 'password123' }));
});

test('verifyCredentials - handles response not ok with custom error', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    json: async () => ({ success: false, error: 'Custom server error' }),
  }));

  await assert.rejects(verifyCredentials('testuser', 'password123'), {
    message: 'Custom server error'
  });
});

test('verifyCredentials - handles ok response but success is false', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    json: async () => ({ success: false, error: 'User disabled' }),
  }));

  await assert.rejects(verifyCredentials('testuser', 'password123'), {
    message: 'User disabled'
  });
});

test('verifyCredentials - uses default error message if error is omitted', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    json: async () => ({ success: false }),
  }));

  await assert.rejects(verifyCredentials('testuser', 'password123'), {
    message: 'Invalid credentials.'
  });
});

test('verifyCredentials - network error (fetch rejects)', async () => {
  fetchMock.mock.mockImplementationOnce(async () => {
    throw new Error('Network failure');
  });

  await assert.rejects(verifyCredentials('testuser', 'password123'), {
    message: 'Network failure'
  });
});

test('saveSession - stores token and user in localStorage', () => {
  const mockData = { token: 'tok_123', user: { id: 1, role: 'admin' } };
  saveSession(mockData);

  assert.strictEqual(localStorageMock.setItem.mock.callCount(), 2);
  const calls = localStorageMock.setItem.mock.calls;
  assert.strictEqual(calls[0].arguments[0], 'facilityops_token');
  assert.strictEqual(calls[0].arguments[1], 'tok_123');
  assert.strictEqual(calls[1].arguments[0], 'facilityops_user');
  assert.strictEqual(calls[1].arguments[1], JSON.stringify(mockData.user));
});

test('getToken - retrieves token from localStorage', () => {
  localStorageMock.getItem.mock.mockImplementationOnce(() => 'tok_abc');

  const result = getToken();
  assert.strictEqual(result, 'tok_abc');
  assert.strictEqual(localStorageMock.getItem.mock.calls[0].arguments[0], 'facilityops_token');
});

test('loadSession - returns valid user data', () => {
  const mockUser = { email: 'admin@example.com', role: 'admin' };
  localStorageMock.getItem.mock.mockImplementation((key) => {
    if (key === 'facilityops_user') return JSON.stringify(mockUser);
    if (key === 'facilityops_token') return 'some_token';
    return null;
  });

  const result = loadSession();
  assert.deepStrictEqual(result, mockUser);
});

test('loadSession - returns null if raw user or token is missing', () => {
  localStorageMock.getItem.mock.mockImplementation(() => null);

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if json parse fails', () => {
  localStorageMock.getItem.mock.mockImplementation((key) => {
    if (key === 'facilityops_user') return 'invalid-json';
    if (key === 'facilityops_token') return 'some_token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('loadSession - returns null if missing email or role', () => {
  const invalidUser = { id: 1, name: 'John' }; // missing email and role
  localStorageMock.getItem.mock.mockImplementation((key) => {
    if (key === 'facilityops_user') return JSON.stringify(invalidUser);
    if (key === 'facilityops_token') return 'some_token';
    return null;
  });

  const result = loadSession();
  assert.strictEqual(result, null);
});

test('signOut - removes keys from localStorage', () => {
  signOut();
  assert.strictEqual(localStorageMock.removeItem.mock.callCount(), 2);
  const calls = localStorageMock.removeItem.mock.calls;
  assert.strictEqual(calls[0].arguments[0], 'facilityops_user');
  assert.strictEqual(calls[1].arguments[0], 'facilityops_token');
});
