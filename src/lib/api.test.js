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

test('api.get - sends auth headers when token is present', async () => {
  const token = 'fake-token';
  localStorageMock.getItem.mock.mockImplementation((key) => {
    if (key === 'facilityops_token') return token;
    return null;
  });

  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: true, data: {} }),
  }));

  await api.get('tickets');

  const fetchCall = fetchMock.mock.calls[0];
  assert.strictEqual(fetchCall.arguments[1].headers.Authorization, `Bearer ${token}`);
});

test('api.get - handles 401 Unauthorized', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    status: 401,
  }));

  await assert.rejects(api.get('tickets'), {
    message: 'Session expired'
  });

  assert.strictEqual(windowMock.location.reload.mock.callCount(), 1);
  // signOut removes 2 items from localStorage
  assert.strictEqual(localStorageMock.removeItem.mock.callCount(), 2);
});

test('api.get - handles non-ok status', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: false,
    status: 500,
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

test('api.get - handles success: false in JSON with default error message', async () => {
  fetchMock.mock.mockImplementationOnce(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ success: false }),
  }));

  await assert.rejects(api.get('tickets'), {
    message: 'API tickets failed'
  });
});
