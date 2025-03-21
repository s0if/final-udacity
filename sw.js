// Cache names
const CACHE_NAMES = {
  APP: 'travel-planner-v1',
  API: 'travel-planner-api-v1',
  IMAGES: 'travel-planner-images-v1',
};

// Assets to cache immediately
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/main.js',
  '/main.css',
  '/js/app.js',
];

// Install event - cache core assets
const handleInstall = (event) => {
  console.log('Service Worker: Installing...');
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAMES.APP)
      .then(cache => {
        console.log('Service Worker: Caching Core Assets');
        return cache.addAll(CORE_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache core assets', error);
      })
  );
};

// Activate event - clean up old caches
const handleActivate = (event) => {
  console.log('Service Worker: Activated');
  self.clients.claim();

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (!Object.values(CACHE_NAMES).includes(cache)) {
            console.log(`Service Worker: Deleting Old Cache - ${cache}`);
            return caches.delete(cache);
          }
        })
      );
    })
  );
};

// Fetch event - handle network requests
const handleFetch = (event) => {
  const { request } = event;

  // Handle API requests
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle image requests
  else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
  }
  // Handle other requests (HTML, CSS, JS)
  else {
    event.respondWith(handleAppRequest(request));
  }
};

// Check if the request is for an API
const isApiRequest = (request) => {
  return request.url.includes('/tripData') ||
         request.url.includes('api.geonames.org') ||
         request.url.includes('api.weatherbit.io');
};

// Handle API requests
const handleApiRequest = (request) => {
  return caches.open(CACHE_NAMES.API).then(cache => {
    return fetch(request)
      .then(response => {
        // Cache a copy of the response
        cache.put(request, response.clone());
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(request);
      });
  });
};

// Check if the request is for an image
const isImageRequest = (request) => {
  return request.url.includes('pixabay.com') || request.destination === 'image';
};

// Handle image requests
const handleImageRequest = (request) => {
  return caches.open(CACHE_NAMES.IMAGES).then(cache => {
    return caches.match(request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(request).then(networkResponse => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
  });
};

// Handle app requests (HTML, CSS, JS)
const handleAppRequest = (request) => {
  return caches.match(request)
    .then(cachedResponse => {
      // Return cached response if available
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise fetch from network
      return fetch(request).then(response => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAMES.APP).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
    .catch(() => {
      // Return the offline page for navigation requests
      if (request.destination === 'document') {
        return caches.match('/index.html');
      }
    });
};

// Register event listeners
self.addEventListener('install', handleInstall);
self.addEventListener('activate', handleActivate);
self.addEventListener('fetch', handleFetch);