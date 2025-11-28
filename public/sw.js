
// sw.js (Stale-while-revalidate)

const CACHE_NAME = 'school-schedule-pwa-cache-v3003-NUKE';
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

// On install, cache the app shell and force activation
self.addEventListener('install', event => {
  // Skip waiting means this SW takes over immediately, kicking out the old one
  self.skipWaiting(); 
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
  if (event.request.method !== 'GET') {
    return;
  }
  
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
           if (networkResponse && networkResponse.status === 200) {
              // Don't cache API calls
              if (!event.request.url.includes('generativelanguage')) {
                 cache.put(event.request, networkResponse.clone());
              }
           }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed; returning from cache if available.', err);
        });

        return response || fetchPromise;
      });
    })
  );
});

// On activate, clean up old caches and claim clients immediately
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // Claim clients so the page is controlled by the new SW immediately
      self.clients.claim(),
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          console.log('Deleting old cache:', cacheToDelete);
          return caches.delete(cacheToDelete);
        }));
      })
    ])
  );
});