// public/service-worker.js
const CACHE_NAME = 'notts-alliance-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/assets/background.jpg',
  '/src/assets/Logo.png',
  '/assets/fonts/weathericons-regular-webfont.ttf',
  // Add other critical assets
];
const EXCLUDED_DOMAINS = [
  'posthog.com',
  'i.posthog.com',
  'eu.i.posthog.com',
  'eu-assets.i.posthog.com'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Check if this is an excluded domain or API request
  const isExcludedDomain = EXCLUDED_DOMAINS.some(domain => url.hostname.includes(domain));

  // Don't cache API requests or POST requests at all
  const isApiRequest = url.pathname.includes('/api/');
  const isPostRequest = event.request.method === 'POST';

  // Skip caching and pass through the request for excluded domains and API requests
  if (isExcludedDomain || isApiRequest || isPostRequest) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response from the cached version
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Don't cache if not a GET or if response is not valid
            if (!event.request.url.startsWith('http') ||
              event.request.method !== 'GET' ||
              !networkResponse ||
              networkResponse.status !== 200 ||
              networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response - one to return, one to cache
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Only cache assets like images and fonts - not API responses
                if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|woff|woff2|ttf)$/i)) {
                  cache.put(event.request, responseToCache);
                }
              });

            return networkResponse;
          });
      })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});