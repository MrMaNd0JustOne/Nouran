const CACHE_NAME = 'noor-v2';

  self.addEventListener('install', (event) => {
  const scopeUrl = self.registration.scope;
  const precacheUrls = [
    scopeUrl,
    new URL('./manifest.webmanifest', scopeUrl).href,
    new URL('./icon-192.png', scopeUrl).href,
    new URL('./icon-512.png', scopeUrl).href,
  ];

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(precacheUrls.map((u) => cache.add(u)))
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // Never cache prayer times (AlAdhan) or reverse geocoding (Nominatim)
  if (
    url.hostname.includes('aladhan.com') ||
    url.hostname.includes('nominatim.openstreetmap.org')
  ) {
    return;
  }

  // Never cache the Service Worker file itself
  if (url.origin === self.location.origin && url.pathname.endsWith('/sw.js')) {
    return;
  }

  // Navigation requests: Network First, fallback to cached app shell
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.ok &&
            networkResponse.status === 200
          ) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(self.registration.scope, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedShell =
            (await cache.match(self.registration.scope)) ||
            (await cache.match(request));
          return cachedShell || Response.error();
        })
    );
    return;
  }

  // Google Fonts: Cache First
  if (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        const networkResponse = await fetch(request);
        if (
          networkResponse &&
          (networkResponse.ok || networkResponse.type === 'opaque')
        ) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
    );
    return;
  }

  // AlQuran Cloud API: Stale-While-Revalidate (cache successful responses only)
  if (url.origin === 'https://api.alquran.cloud') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.ok &&
              networkResponse.status === 200
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => undefined);

        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

        const fresh = await fetchPromise;
        return fresh || Response.error();
      })
    );
    return;
  }

  // Same-origin app assets (JS, CSS, images, fonts): Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (
              networkResponse &&
              networkResponse.ok &&
              networkResponse.status === 200
            ) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => undefined);

        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }

        const fresh = await fetchPromise;
        return fresh || Response.error();
      })
    );
  }
});
