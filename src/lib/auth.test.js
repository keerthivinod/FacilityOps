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

import { saveSession } from './auth.js';

beforeEach(() => {
  fetchMock.mock.resetCalls();
  localStorageMock.getItem.mock.resetCalls();
  localStorageMock.setItem.mock.resetCalls();
  localStorageMock.removeItem.mock.resetCalls();
});

test('saveSession - stores tokens correctly', () => {
  const token = 'test-token-123';
  const user = { id: 1, name: 'Test User', email: 'test@example.com', role: 'admin' };

  saveSession({ token, user });

  assert.strictEqual(localStorageMock.setItem.mock.callCount(), 2);

  const call1 = localStorageMock.setItem.mock.calls[0];
  assert.strictEqual(call1.arguments[0], 'facilityops_token');
  assert.strictEqual(call1.arguments[1], token);

  const call2 = localStorageMock.setItem.mock.calls[1];
  assert.strictEqual(call2.arguments[0], 'facilityops_user');
  assert.strictEqual(call2.arguments[1], JSON.stringify(user));
});
