const CACHE_NAME = "story-app-cache-v2";
const urlsToCache = [
  "./",
  "./index.html",
  "./app.bundle.js",
  "./app.css",
  "./manifest.json",
  "./favicon.png",
  "./images/2b3e1faf89f94a483539.png",
  "./images/8f2c4d11474275fbc161.png",
  "./images/416d91365b44e4b4f477.png",
  "./images/680f69f3c2e6b90c1812.png",
  "./images/a0c6cc1401c107b501ef.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }).catch((error) => {
      console.error("Failed to cache during install:", error);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.method === "GET" &&
    !event.request.url.startsWith("chrome-extension") &&
    event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
    );
  }
});
