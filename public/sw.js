const CACHE_NAME = 'facilityops-v3';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// ── Install: cache core shell ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Silently fail — some assets may not exist yet
      })
    )
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// ── Offline mutation queue (IndexedDB) ────────────────────────────────────────
// Mutations that fail while offline are stored in IndexedDB as
// { url, method, headers, body } and replayed on the next background-sync.

const DB_NAME = 'facilityops-offline';
const DB_STORE = 'queue';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(DB_STORE, { autoIncrement: true });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror   = (e) => reject(e.target.error);
  });
}

async function enqueue(entry) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).add(entry);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

async function dequeueAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    const store = tx.objectStore(DB_STORE);
    const items = [];
    store.openCursor().onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        items.push({ key: cursor.key, value: cursor.value });
        cursor.continue();
      } else {
        resolve(items);
      }
    };
    tx.onerror = (e) => reject(e.target.error);
  });
}

async function deleteKey(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).delete(key);
    tx.oncomplete = resolve;
    tx.onerror    = (e) => reject(e.target.error);
  });
}

// ── Background sync: replay queued mutations ──────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(replayQueue());
  }
});

async function replayQueue() {
  const items = await dequeueAll();
  for (const { key, value } of items) {
    try {
      const response = await fetch(value.url, {
        method:  value.method,
        headers: value.headers,
        body:    value.body,
      });
      if (response.ok) {
        await deleteKey(key);
        console.log('[SW] Synced queued mutation:', value.url);
      }
    } catch {
      console.log('[SW] Sync failed (will retry):', value.url);
    }
  }
}

// ── Push notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || 'New facility update available',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
      url: data.url || '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    requireInteraction: true,
    silent: false,
    tag: data.tag || 'facility-update'
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'FacilityOps',
      options
    )
  );
});

// ── Notification click handler ────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there's already a window/tab open with the target URL
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ── Push subscription change handler ──────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[SW] Push subscription changed:', event);

  // Re-subscribe to push notifications
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send new subscription to your server
        console.log('[SW] New push subscription:', subscription);
        // TODO: Send subscription to server
      })
  );
});

// ── Fetch handler ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-HTTP schemes (chrome-extension:, samsungapps:, etc.)
  if (!request.url.startsWith('http')) return;

  // ── Mutations (POST / PUT / DELETE) ─────────────────────────────────────────
  if (request.method !== 'GET') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          // Network unavailable — queue for later replay
          try {
            const body = await request.clone().text();
            await enqueue({
              url:     request.url,
              method:  request.method,
              headers: Object.fromEntries(request.headers.entries()),
              body:    body || null,
            });
          } catch (qErr) {
            console.error('[SW] Failed to queue mutation:', qErr);
          }
          return new Response(
            JSON.stringify({ status: 'offline', message: 'Saved locally — will sync when online' }),
            { status: 202, headers: { 'Content-Type': 'application/json' } }
          );
        }
      })()
    );
    return;
  }

  // ── GET requests: network-first with cache fallback ──────────────────────────
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline.html');
          return offlinePage || new Response('Offline - Please check your connection', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        }

        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
