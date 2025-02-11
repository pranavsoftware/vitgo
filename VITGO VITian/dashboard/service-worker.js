// Service Worker setup for caching assets

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');

    // Pre-cache some files
    event.waitUntil(
        caches.open('v1').then((cache) => {
            const filesToCache = [
                '/',  // Root path
                '../dashboard/index.html',
                '../dashboard/style.css',
                '../dashboard/script.js',
                // Add any other assets you want to cache here
            ];

            // Log URLs being cached for debugging
            console.log('Caching files:', filesToCache);

            // Cache resources one by one to avoid the entire process failing
            return Promise.all(filesToCache.map((url) => {
                return fetch(url)
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(`Failed to fetch ${url}`);
                        }
                        // Cache the response if successful
                        return cache.put(url, response);
                    })
                    .catch((error) => {
                        // Log the error but continue caching other files
                        console.error('Failed to cache resource:', url, error);
                    });
            }));
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    // Optional: Clean up old caches if needed
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Remove old caches
                    if (cacheName !== 'v1') {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Cache first, network fallback
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Return the cached response if available, otherwise fetch from network
            return cachedResponse || fetch(event.request).catch((error) => {
                console.error('Network fetch failed for:', event.request, error);
                // Optionally, return a fallback page here
            });
        })
    );
});

// Optionally, listen for message events to allow the main script to send commands to the service worker
self.addEventListener('message', (event) => {
    if (event.data && event.data.action === 'skipWaiting') {
        self.skipWaiting(); // Force the service worker to activate immediately
    }
});
