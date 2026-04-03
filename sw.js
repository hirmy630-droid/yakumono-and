const CACHE_NAME = 'yakumono-horizontal-lock-v20260403-3';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

const EXTERNAL_CORE = [
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);

    // ローカル資産は通常プリキャッシュ
    await cache.addAll(LOCAL_ASSETS);

    // 外部資産は opaque response を許容して手動保存
    await Promise.all(EXTERNAL_CORE.map(async (url) => {
      try {
        const req = new Request(url, { mode: 'no-cors', credentials: 'omit', cache: 'no-store' });
        const res = await fetch(req);
        await cache.put(url, res);
      } catch (e) {
        // 初回インストール時に外部CDNが取れなくてもインストール自体は継続
      }
    }));

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : Promise.resolve()));
    await self.clients.claim();
  })());
});

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === 'opaque')) {
        cache.put(request, response.clone()).catch(() => {});
      }
      return response;
    })
    .catch(() => null);

  return cached || networkPromise || Promise.reject(new Error('no response'));
}

async function networkFirst(request, fallbackKey) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (e) {
    return (await cache.match(request)) || (fallbackKey ? await cache.match(fallbackKey) : null);
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isFontsGstatic = url.origin === 'https://fonts.gstatic.com';
  const isGoogleFontsCss = url.origin === 'https://fonts.googleapis.com';
  const isExternalCore = EXTERNAL_CORE.includes(event.request.url);

  // HTML は更新を拾いやすいよう network-first
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, './index.html'));
    return;
  }

  // manifest と local html も network-first
  if (isSameOrigin && (url.pathname.endsWith('/index.html') || url.pathname.endsWith('/manifest.json') || url.pathname === '/' || url.pathname.endsWith('/'))) {
    event.respondWith(networkFirst(event.request, './index.html'));
    return;
  }

  // CDN / Fonts は cache優先 + 背後更新
  if (isExternalCore || isGoogleFontsCss || isFontsGstatic) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // 同一オリジン静的資産は cache優先 + 背後更新
  if (isSameOrigin) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});
