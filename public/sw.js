// MatchPulse Service Worker — Push Notifications + Offline Caching

const CACHE_NAME = 'matchpulse-v1';
const OFFLINE_URL = '/offline';

// Static assets to pre-cache for offline shell
const PRECACHE_URLS = [
  '/',
  '/offline',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/badge-72.png',
];

// Install: pre-cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Non-critical: offline will still partially work
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first with offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests and socket connections
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api') || url.hostname !== self.location.hostname) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful page navigations
        if (response.ok && event.request.mode === 'navigate') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // Offline: try cache first
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // For navigation requests, show offline page
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL) || new Response(
              '<html><body style="font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><h1>You\'re offline</h1><p>Check your connection and try again.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          return new Response('', { status: 503 });
        });
      })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  let data = { title: 'MatchPulse', body: 'New update available' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    // If parsing fails, use the text as body
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || '',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: [],
    tag: data.data?.matchId ? `match-${data.data.matchId}` : 'general',
    renotify: true,
  };

  // Add action buttons based on notification type
  if (data.data?.matchId) {
    options.actions = [
      { action: 'view', title: 'View Match' },
    ];
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MatchPulse', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let url = '/';

  if (data.matchId) {
    url = `/match/${data.matchId}`;
  } else if (data.tournamentId) {
    url = `/tournament/${data.tournamentId}`;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url);
    })
  );
});

// Handle notification close (for analytics)
self.addEventListener('notificationclose', (event) => {
  // Could send analytics here
});
