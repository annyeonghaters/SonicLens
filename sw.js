const CACHE_NAME = 'soniclens-v5';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {}));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    if (req.url.includes('generativelanguage.googleapis.com')) return;
    event.respondWith(
        caches.match(req).then((cached) => {
            const netFetch = fetch(req).then((res) => {
                if (res && res.status === 200 && res.type === 'basic') {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(req, clone)).catch(() => {});
                }
                return res;
            }).catch(() => cached);
            return cached || netFetch;
        })
    );
});