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
      .catch((err) => {
        console.error('Failed to cache during install:', err);
      })
  );
});

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

self.addEventListener('fetch', (event) => {
  if (
    event.request.method !== 'GET' ||
    event.request.url.startsWith('chrome-extension') ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

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
