const CACHE_NAME = 'story-app-v1';
const TILE_CACHE = 'osm-tiles-cache-v1';

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
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key !== CACHE_NAME && key !== TILE_CACHE) return caches.delete(key);
      })
    ))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Caching tile peta OpenStreetMap
  if (url.match(/^https:\/\/[abc]\.tile\.openstreetmap\.org\//)) {
    event.respondWith(
      caches.open(TILE_CACHE).then((cache) =>
        cache.match(event.request).then((response) => {
          if (response) {
            return response; // pakai dari cache
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            // fallback jika perlu (misal gambar kosong atau lainnya)
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
        })
      )
    );
    return;
  }

  // Cache-first untuk file aplikasi
  if (
    event.request.method === 'GET' &&
    url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        });
      })
    );
  }
});
