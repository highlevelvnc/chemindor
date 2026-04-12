const CACHE_NAME = 'chemindor-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/logo.jpg',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;0,800;1,400;1,700&family=Manrope:wght@300;400;500;600;700;800&display=swap'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then((cached) => {
            const fetchPromise = fetch(e.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                }
                return response;
            }).catch(() => cached);
            return cached || fetchPromise;
        })
    );
});
