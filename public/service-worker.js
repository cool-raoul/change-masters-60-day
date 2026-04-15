// Service Worker voor Change Masters PWA
// Dit bestand handelt push notifications en offline support af

const CACHE_VERSION = 'cm-v1';
const CACHE_URLS = [
  '/',
  '/dashboard',
  '/offline.html'
];

// Installeer service worker en cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll(CACHE_URLS).catch(() => {
        // Niet kritiek als caching fails
        console.log('Caching some assets failed');
      });
    })
  );
  self.skipWaiting();
});

// Verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// PUSH NOTIFICATION EVENT
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push ontvangen zonder data');
    return;
  }

  try {
    const data = event.data.json();
    const options = {
      body: data.body || 'Nieuw bericht van Change Masters',
      icon: '/logo-192.png',
      badge: '/logo-192.png',
      tag: data.tag || 'notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: {
        url: data.url || '/dashboard',
        timestamp: new Date().toISOString(),
        ...data.data
      }
    };

    // Voeg goud kleur toe als beschikbaar
    if (data.badge_color) {
      options.badgeColor = data.badge_color;
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Change Masters', options)
    );
  } catch (error) {
    console.error('Push parsing error:', error);
  }
});

// NOTIFICATION CLICK EVENT
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check of het window al open is
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Anders, open een nieuwe window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// NOTIFICATION ACTION CLICK
self.addEventListener('notificationclose', (event) => {
  console.log('Notification gesloten:', event.notification.data);
});

// FETCH EVENT (voor offline support later)
self.addEventListener('fetch', (event) => {
  // Voor nu, laat alle requests naar het netwerk gaan
  // We kunnen dit later uitbreiden voor offline support
});
