const CACHE_NAME = 'sustansya-1-0-v9';
const APP_SHELL = './index.html';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './storage.js',
  './foods.js',
  './restaurants.js',
  './app.js',
  './dashboard.js',
  './food.js',
  './scanner.js',
  './weight.js',
  './fasting.js',
  './recipes.js',
  './settings.js',
  './ui.js',
  './manifest.json',
  './icons/icon-72.png',
  './icons/icon-96.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-152.png',
  './icons/icon-192.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png'
];

function appShellRequests() {
  return [
    APP_SHELL,
    './',
    new URL('./index.html', self.registration.scope).href,
    new URL('./', self.registration.scope).href
  ];
}

async function cacheAppShell(cache, response) {
  if (!response || !response.ok) return;
  await Promise.all(appShellRequests().map(key => cache.put(key, response.clone()).catch(() => null)));
}

async function cachedAppShell() {
  const cache = await caches.open(CACHE_NAME);
  for (const key of appShellRequests()) {
    const match = await cache.match(key);
    if (match) return match;
  }
  return cache.match(APP_SHELL);
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(ASSETS.map(asset => fetch(asset).then(response => {
        if (response.ok) return cache.put(asset, response);
      }).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isAppShell = event.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/');

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          caches.open(CACHE_NAME).then(cache => cacheAppShell(cache, response));
          return response;
        })
        .catch(() => cachedAppShell())
    );
    return;
  }

  // Never intercept cross-origin API calls (Open Food Facts, Anthropic) beyond simple pass-through caching of GET lookups.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const update = fetch(event.request)
        .then(response => {
          if (url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || update;
    })
  );
});
