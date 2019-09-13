var cacheName = 'hellow-pwa';
var filesToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js'
];

/* Start the service worker and cache all content: */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);  // breaks if it fails on one file
        })
    );
});

/* serve cached content when offline */
self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});
