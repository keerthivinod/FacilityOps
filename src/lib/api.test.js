import { test, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Mock localStorage
const localStorageMock = {
  getItem: mock.fn(),
  setItem: mock.fn(),
  removeItem: mock.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock window
const windowMock = {
  location: {
    reload: mock.fn(),
  },
};
globalThis.window = windowMock;

// Mock fetch
const fetchMock = mock.fn();
globalThis.fetch = fetchMock;

import { api } from './api.js';

beforeEach(() => {
  fetchMock.mock.resetCalls();
  localStorageMock.getItem.mock.resetCalls();
  localStorageMock.setItem.mock.resetCalls();
  localStorageMock.removeItem.mock.resetCalls();
  windowMock.location.reload.mock.resetCalls();
});

test('api.get - successful request with resource name', async () => {
  const mockData = { id: 1, name: 'Test Ticket' };
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: mockData }),
  }));

  const result = await api.get('tickets');

  assert.deepStrictEqual(result, mockData);
  const fetchCall = fetchMock.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[0], '/.netlify/functions/tickets');
});

test('api.get - successful request with direct URL', async () => {
  const mockData = { foo: 'bar' };
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: mockData }),
  }));

  const result = await api.get('/custom/url');

  assert.deepStrictEqual(result, mockData);
  const fetchCall = fetchMock.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[0], '/custom/url');
});

test('api.get - does not send explicit auth headers', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
  }));

  await api.get('tickets');

  const fetchCall = fetchMock.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[1], undefined); // Fetch is called without explicit headers for GET
});

test('api.get - handles 401 Unauthorized', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    status: 401,
    json: async () => ({}),
  }));

  await assert.rejects(api.get('tickets'), {
    message: 'Session expired'
  });

  // signOut is async now. But wait, handleResponse does not await signOut!
  // It calls signOut() synchronously and then throws.
  assert.strictEqual(windowMock.location.reload.mock.callCount(), 1);
  // signOut removes 1 item from localStorage (AUTH_KEY)
  assert.strictEqual(localStorageMock.removeItem.mock.callCount(), 1);
});

test('api.get - handles non-ok status', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    status: 500,
    json: async () => ({}), // Add dummy json just in case
  }));

  await assert.rejects(api.get('tickets'), {
    message: 'API tickets 500'
  });
});

test('api.get - handles success: false in JSON', async () => {
  const errorMsg = 'Something went wrong';
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: false, error: errorMsg }),
  }));

  await assert.rejects(api.get('tickets'), {
    message: errorMsg
  });
});
