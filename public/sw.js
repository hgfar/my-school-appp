// sw.js (Stale-while-revalidate)

const CACHE_NAME = 'school-schedule-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// On fetch, use stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the request is for a resource we want to cache (e.g. not an API call)
          // and the response is valid, update the cache.
           if (networkResponse && networkResponse.status === 200) {
              // We don't cache API calls to Gemini
              if (!event.request.url.includes('generativelanguage')) {
                 cache.put(event.request, networkResponse.clone());
              }
           }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed; returning from cache if available.', err);
        });

        // Return the cached response immediately if available, then update the cache in the background.
        return response || fetchPromise;
      });
    })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    })
  );
});