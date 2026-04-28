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

    if (data.badge_color) {
      options.badgeColor = data.badge_color;
    }

    // Toon de OS-notificatie + stuur tegelijk een postMessage naar alle open
    // app-windows. Zo kan een client-component een in-app toast tonen ZONDER
    // dat de gebruiker eerst de OS-notificatie hoeft aan te tikken — handig
    // wanneer hij de app al open heeft staan op een andere pagina.
    event.waitUntil(
      Promise.all([
        self.registration.showNotification(data.title || 'Change Masters', options),
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
          for (const client of clientList) {
            client.postMessage({
              type: 'push-melding',
              title: data.title || 'Change Masters',
              body: options.body,
              url: options.data.url,
              tag: options.tag,
              timestamp: options.data.timestamp,
            });
          }
        }),
      ])
    );
  } catch (error) {
    console.error('Push parsing error:', error);
  }
});

// NOTIFICATION CLICK EVENT
// Bij tap op een melding: navigeer naar de URL uit de payload. Als er al een
// app-window open is, focussen we die en navigeren we hem naar de doel-URL
// (i.p.v. een tweede tab te openen). Niet-ingelogd? Dan vangt de middleware
// het op met ?next= zodat we na login alsnog op de juiste plek belanden.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/dashboard';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Zoek een open window van deze app.
        for (const client of clientList) {
          try {
            const url = new URL(client.url);
            const targetAbs = new URL(targetUrl, self.location.origin);
            if (url.origin === self.location.origin) {
              // Focus + navigeer dat venster naar de doel-URL.
              return client.focus().then((focused) => {
                if (focused && 'navigate' in focused) {
                  return focused.navigate(targetAbs.toString());
                }
              });
            }
          } catch (e) {
            // ongeldige URL — sla over
          }
        }
        // Geen open window → maak nieuwe.
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
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
