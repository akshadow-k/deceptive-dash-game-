// Define a unique name for your cache.
// Change 'v1' if you make significant updates to cached files in the future
// to ensure users get the new version.
const CACHE_NAME = 'deceptive-dash-cache-v1';

// List the files you want to cache when the service worker is installed.
// These are the core files needed for your game to run offline.
const urlsToCache = [
  '.',                  // This caches the root URL (often your index.html)
  'index.html',         // Explicitly cache index.html for clarity
  'manifest.json',      // Cache the manifest file
  // Add paths to your icon files (these should match what's in manifest.json)
  'icon-192x192.png',
  'icon-512x512.png',

  // IMPORTANT: Add any other CRITICAL CSS, JavaScript, image, or sound files
  // that are absolutely necessary for the game to start and be playable offline.
  //
  // For example, if you had a separate stylesheet:
  // 'style.css',
  // Or a separate JavaScript file:
  // 'game.js',
  // Or a critical background image:
  // 'images/background.png',
  // Or an essential sound effect:
  // 'sounds/jump.mp3'
  //
  // Since your current game has CSS and JS embedded in index.html,
  // caching 'index.html' and '.' should cover them.
  // If you later extract them, add them here.
];

// Event: 'install'
// This event fires when the service worker is first registered and installed.
// We use it to open our cache and add the essential files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Opened cache and caching core assets');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache core assets during install:', error);
      })
  );
});

// Event: 'fetch'
// This event fires every time your web page requests a resource (HTML, CSS, JS, image, etc.).
// We intercept these requests and try to serve them from the cache first.
// If not in cache, we fetch from the network (and can optionally cache it then).
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // If the request is found in the cache, return the cached response.
        if (cachedResponse) {
          // console.log('Service Worker: Serving from cache:', event.request.url);
          return cachedResponse;
        }

        // If the request is not in the cache, fetch it from the network.
        // console.log('Service Worker: Fetching from network:', event.request.url);
        return fetch(event.request).then(
          networkResponse => {
            // OPTIONAL: You could clone and cache the network response here if you want
            // to dynamically cache new assets as they are requested.
            // For example:
            // if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            //   const responseToCache = networkResponse.clone();
            //   caches.open(CACHE_NAME)
            //     .then(cache => {
            //       cache.put(event.request, responseToCache);
            //     });
            // }
            return networkResponse;
          }
        ).catch(error => {
          console.error('Service Worker: Fetching from network failed:', event.request.url, error);
          // Optionally, you could return a generic offline fallback page here
          // if (event.request.mode === 'navigate') {
          //   return caches.match('offline.html'); // You'd need to create and cache 'offline.html'
          // }
        });
      })
  );
});

// Event: 'activate'
// This event fires after the new service worker has been installed and the old one (if any) is gone.
// We use it to clean up old caches that are no longer needed.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME]; // Only our current cache should remain

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If a cache is not in our whitelist, delete it.
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
