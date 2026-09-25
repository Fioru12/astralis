/**
 * Astralis PWA Service Worker
 * Offline caching strategy for static assets, textures, and scripts.
 */
const CACHE_NAME = 'astralis-v2.0.0';
// Asset con hash (JS/CSS) e texture iniettati dalla build (vite.config.js):
// senza di essi i chunk richiesti prima del clients.claim() non
// entrerebbero mai in cache e l'offline fallirebbe. In dev restano [].
const BUILD_ASSETS = [];
const TEXTURE_ASSETS = [];
// Solo asset garantiti in dist/ (build): un URL mancante fa fallire
// l'intero cache.addAll e impedisce l'installazione del SW.
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './solar-system-icon.svg',
  './milky_way_topdown.webp',
  ...BUILD_ASSETS,
  ...TEXTURE_ASSETS,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Navigazioni SPA (anche con query, es. ?lang=it): la cache matcha per URL
  // esatto, quindi le query mancherebbero il precache e il reload offline
  // fallirebbe. Servi sempre index.html precaricata.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches
        .match('./index.html')
        .then((cached) => cached || fetch(event.request))
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    (async () => {
      // Match per stringa URL oltre che per Request: più robusto in caso di
      // redirect/Vary o worker riavviato a freddo.
      const direct = (await caches.match(event.request)) || (await caches.match(event.request.url));
      if (direct) {
        // Stale-while-revalidate in background, senza mai rompere la risposta.
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {});
        return direct;
      }
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch {
        // Offline e miss: ultimo tentativo in cache prima di arrenderti con
        // un 504 esplicito invece di una rejection non gestita.
        const retry =
          (await caches.match(event.request)) || (await caches.match(event.request.url));
        if (retry) return retry;
        return new Response('offline', { status: 504 });
      }
    })()
  );
});
