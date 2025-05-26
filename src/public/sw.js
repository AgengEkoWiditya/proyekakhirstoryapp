const CACHE_NAME = 'story-app-v1';
const urlsToCache = [
  '/proyekakhirstoryapp/',
  '/proyekakhirstoryapp/index.html',
  '/proyekakhirstoryapp/app.bundle.js',
  '/proyekakhirstoryapp/app.css',
  '/proyekakhirstoryapp/manifest.json',
  '/proyekakhirstoryapp/images/logo.png',
];

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
  // Jika request bukan GET atau bukan origin kita, abaikan
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Jangan cache API request ke /v1/stories, biarkan lewat jaringan supaya di-handle fallback di frontend
  if (event.request.url.includes('/v1/stories')) {
    return;
  }

  // Cache first strategy untuk file statis
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).then((networkResponse) => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      });
    })
  );
});

// Push notification tetap sama
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
