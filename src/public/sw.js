const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/proyekakhirstoryapp/',
  '/proyekakhirstoryapp/index.html',
  '/proyekakhirstoryapp/app.bundle.js',
  '/proyekakhirstoryapp/app.css',
  '/proyekakhirstoryapp/manifest.json',
  '/proyekakhirstoryapp/images/logo.png',
];

// Tile peta yang sering dipakai (OpenStreetMap)
// Bisa tambahkan lagi tile URL lain yang kamu gunakan
const tileUrlPattern = /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/;

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .catch((err) => console.error('Failed to cache during install:', err))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => (cache !== CACHE_NAME ? caches.delete(cache) : null))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Abaikan kalau bukan GET
  if (event.request.method !== 'GET') return;

  const requestUrl = event.request.url;

  // Cache falling back to network untuk API stories
  if (requestUrl.includes('/v1/stories')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        fetch(event.request)
          .then((response) => {
            // Cache hasil response agar bisa fallback saat offline
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // Cache falling back to network untuk tile peta
  if (tileUrlPattern.test(requestUrl)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(event.request).then((cachedResponse) => {
          return (
            cachedResponse ||
            fetch(event.request).then((networkResponse) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            })
          );
        })
      )
    );
    return;
  }

  // Cache first untuk file statis dari origin sendiri
  if (requestUrl.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(event.request).then((networkResponse) => {
            if (
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
        );
      })
    );
  }
});

// Push notification (tetap sama)
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

  event.waitUntil(self.registration.showNotification(title, options));
});
