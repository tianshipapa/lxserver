const CACHE_NAME = 'lx-music-web-v1';
const ASSETS_TO_CACHE = [
    '/music/',
    '/music/index.html',
    '/music/style.css',
    '/music/app.js',
    '/music/js/lyric-parser.js',
    '/music/js/lyric-utils.js',
    '/music/js/quality.js',
    '/music/js/user_sync.js',
    '/music/js/batch_pagination.js',
    '/music/js/single_song_ops.js',
    '/music/js/pwa.js',
    '/music/assets/logo.svg',
    '/music/assets/tailwindcss.js',
    '/music/assets/fontawesome/css/all.min.css',
    '/music/js/crypto-js.min.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // 采用 Network First 策略，确保在线时获取最新版本，离线时使用缓存
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 如果请求成功，更新缓存并返回
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return response;
            })
            .catch(() => {
                // 网络不可用时，尝试从缓存获取
                return caches.match(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});
