/* ═══════════════════════════════════════════════════════════
   Service Worker - Sistema Solare 3D
   Strategia: Cache-First per assets statici, Network-First per navigazioni
   Versioning via CACHE_NAME per invalidazione controllata
═══════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `solar-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `solar-runtime-${CACHE_VERSION}`;
const TEXTURE_CACHE = `solar-textures-${CACHE_VERSION}`;

// Asset critici da precachare all'install
const PRECACHE_URLS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './solar-system-icon.svg'
];

// ════════════════════ INSTALL ════════════════════
self.addEventListener('install', (event) => {
  console.log('[SW] Installing version', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ════════════════════ ACTIVATE ════════════════════
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating version', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.endsWith(CACHE_VERSION))
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ════════════════════ FETCH ════════════════════
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (eccetto CDN texture)
  const isTextureRequest = /\.(jpg|jpeg|png|webp|avif|hdr)$/i.test(url.pathname);

  if (isTextureRequest) {
    // Cache-First per texture
    event.respondWith(cacheFirst(request, TEXTURE_CACHE));
  } else if (url.origin === location.origin) {
    // Stale-While-Revalidate per asset statici
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

// ════════════════════ STRATEGIES ════════════════════

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Fallback: ritorna un placeholder se in cache non c'è nulla
    console.warn('[SW] Fetch failed for:', request.url);
    return new Response('Offline - asset not in cache', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ════════════════════ MESSAGES ════════════════════
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    caches.keys().then((names) => names.forEach((n) => caches.delete(n)));
  }
});
