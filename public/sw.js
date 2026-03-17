// MatchPulse Push Notification Service Worker

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
