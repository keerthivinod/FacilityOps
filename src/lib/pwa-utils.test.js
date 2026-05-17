import test from 'node:test';
import assert from 'node:assert';
import { checkIsPWAInstalled, checkIsInstallDismissed, handleInstallPrompt } from './pwa-utils.js';

test('checkIsPWAInstalled', async (t) => {
  await t.test('returns false when window is undefined', () => {
    const globalWindow = global.window;
    global.window = undefined;

    const result = checkIsPWAInstalled();
    assert.strictEqual(result, false);

    global.window = globalWindow;
  });

  await t.test('returns true when display-mode is standalone', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {
      matchMedia: (query) => ({
        matches: query === '(display-mode: standalone)'
      }),
      navigator: {}
    };
    global.localStorage = { getItem: () => null };

    const result = checkIsPWAInstalled();
    assert.strictEqual(result, true);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns true when navigator.standalone is true (iOS)', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {
      matchMedia: () => ({ matches: false }),
      navigator: { standalone: true }
    };
    global.localStorage = { getItem: () => null };

    const result = checkIsPWAInstalled();
    assert.strictEqual(result, true);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns true when localStorage indicates installation', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {
      matchMedia: () => ({ matches: false }),
      navigator: { standalone: false }
    };
    global.localStorage = { getItem: (key) => key === 'pwa-installed' ? 'true' : null };

    const result = checkIsPWAInstalled();
    assert.strictEqual(result, true);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns false when not installed', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {
      matchMedia: () => ({ matches: false }),
      navigator: { standalone: false }
    };
    global.localStorage = { getItem: () => null };

    const result = checkIsPWAInstalled();
    assert.strictEqual(result, false);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });
});

test('checkIsInstallDismissed', async (t) => {
  await t.test('returns false when window is undefined', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = undefined;
    global.localStorage = { getItem: () => 'true' };

    const result = checkIsInstallDismissed();
    assert.strictEqual(result, false);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns false when localStorage is undefined', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {};
    global.localStorage = undefined;

    const result = checkIsInstallDismissed();
    assert.strictEqual(result, false);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns true when localStorage indicates dismissed', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {};
    global.localStorage = { getItem: (key) => key === 'pwa-install-dismissed' ? 'true' : null };

    const result = checkIsInstallDismissed();
    assert.strictEqual(result, true);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });

  await t.test('returns false when localStorage does not indicate dismissed', () => {
    const globalWindow = global.window;
    const globalLocalStorage = global.localStorage;

    global.window = {};
    global.localStorage = { getItem: () => null };

    const result = checkIsInstallDismissed();
    assert.strictEqual(result, false);

    global.window = globalWindow;
    global.localStorage = globalLocalStorage;
  });
});

test('handleInstallPrompt', async (t) => {
  await t.test('calls prompt on deferredPrompt and returns choice', async () => {
    let promptCalled = false;
    const mockChoiceResult = { outcome: 'accepted' };
    const deferredPrompt = {
      prompt: () => { promptCalled = true; },
      userChoice: Promise.resolve(mockChoiceResult)
    };

    const result = await handleInstallPrompt(deferredPrompt);

    assert.strictEqual(promptCalled, true);
    assert.deepStrictEqual(result, mockChoiceResult);
  });

  await t.test('shows alert when deferredPrompt is not available and window.alert exists', async () => {
    const globalWindow = global.window;
    let alertCalled = false;
    let alertMessage = '';

    global.window = {
      alert: (msg) => {
        alertCalled = true;
        alertMessage = msg;
      }
    };

    const result = await handleInstallPrompt(null);

    assert.strictEqual(result, null);
    assert.strictEqual(alertCalled, true);
    assert.ok(alertMessage.includes('Chrome/Edge'));
    assert.ok(alertMessage.includes('Samsung Internet'));
    assert.ok(alertMessage.includes('Safari (iOS)'));

    global.window = globalWindow;
  });

  await t.test('does nothing when neither deferredPrompt nor window.alert is available', async () => {
    const globalWindow = global.window;
    global.window = {};

    const result = await handleInstallPrompt(null);

    assert.strictEqual(result, null);

    global.window = globalWindow;
  });
});
