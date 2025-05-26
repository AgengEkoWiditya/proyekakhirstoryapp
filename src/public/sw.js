const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/proyekakhirstoryapp/',
  '/proyekakhirstoryapp/index.html',
  '/proyekakhirstoryapp/app.bundle.js',
  '/proyekakhirstoryapp/app.css',
  '/proyekakhirstoryapp/manifest.json',
  '/proyekakhirstoryapp/images/logo.png',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => {
        console.error('Failed to cache during install:', err);
      })
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serve from cache, then network fallback
self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension')
  ) {
    return;
  }

  // Tambahan: cache tile dari OpenStreetMap
  const isOSMTile = event.request.url.includes('https://{s}.tile.openstreetmap.org') ||
                    event.request.url.includes('https://tile.openstreetmap.org') ||
                    event.request.url.match(/https:\/\/[abc]\.tile\.openstreetmap\.org/);

  if (isOSMTile) {
    event.respondWith(
      caches.open('osm-tiles').then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // Optional fallback image/tile
          });
        });
      })
    );
    return;
  }

  // Default fetch for app resources
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, cloned);
        });

        return networkResponse;
      });
    })
  );
});

// Push notification support
self.addEventListener('push', (event) => {
  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Push data is not JSON:', e);
    }
  }

  const title = data.title || 'Notifikasi Baru!';
  const options = {
    body: data.body || 'Ada informasi baru dari Story App.',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
