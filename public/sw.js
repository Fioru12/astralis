/**
 * Astralis PWA Service Worker
 * Offline caching strategy for static assets, textures, and scripts.
 */
// Sostituito dalla build con un nome legato al contenuto (vite.config.js):
// ogni deploy usa una cache nuova e activate elimina le precedenti.
const CACHE_NAME = 'astralis-dev';
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
      // cache: 'reload' salta la cache HTTP (GitHub Pages: max-age 600 s),
      // altrimenti il precache potrebbe salvare di nuovo l'index.html vecchio.
      .then((cache) =>
        cache.addAll(ASSETS_TO_CACHE.map((url) => new Request(url, { cache: 'reload' })))
      )
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
  // Rete prima (con timeout), così chi è online riceve subito l'ultima
  // versione; offline o con rete lenta si ripiega sulla index.html in cache.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const network = await Promise.race([
            fetch(event.request, { cache: 'no-cache' }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
          ]);
          if (network.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put('./index.html', network.clone());
            return network;
          }
          throw new Error('HTTP ' + network.status);
        } catch {
          return (await caches.match('./index.html')) || new Response('offline', { status: 504 });
        }
      })()
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
