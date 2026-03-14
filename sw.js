/* ═══════════════════════════════════════════════════════════════
   POKÉDEX FIELD GUIDE — sw.js
   Service Worker · Cache strategies · Offline support
   ═══════════════════════════════════════════════════════════════ */

const VERSION      = 'v1.0.0';
const CACHE_STATIC = `pokedex-static-${VERSION}`;
const CACHE_API    = `pokedex-api-${VERSION}`;
const CACHE_IMG    = `pokedex-img-${VERSION}`;

/* Assets to pre-cache on install */
const STATIC_ASSETS = [
  '/PokeData/',
  '/PokeData/index.html',
  '/PokeData/style.css',
  '/PokeData/app.js',
  '/PokeData/manifest.json',
  '/PokeData/icons/icon-192.png',
  '/PokeData/icons/icon-512.png',
];

/* Offline fallback page (inline) */
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Pokédex — Offline</title>
  <style>
    :root { --bg:#f5f0e8; --text:#1a1612; --text3:#9e8e7e; --accent:#e53935; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'DM Sans',sans-serif; background:var(--bg); color:var(--text);
           display:flex; align-items:center; justify-content:center;
           min-height:100vh; text-align:center; padding:2rem; }
    .wrap { max-width:340px; }
    .ball { width:80px; height:80px; border-radius:50%; overflow:hidden;
            border:3px solid var(--text); margin:0 auto 2rem;
            animation:float 3s ease-in-out infinite; }
    .ball-top { height:50%; background:#e53935; }
    .ball-mid { height:5px; background:var(--text); position:relative; }
    .ball-mid::after { content:''; position:absolute; top:50%; left:50%;
      transform:translate(-50%,-50%); width:18px; height:18px;
      border-radius:50%; background:#fff; border:2px solid var(--text); }
    .ball-bot { height:50%; background:#fff; }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
    h1 { font-family:Georgia,serif; font-size:1.8rem; font-weight:900;
         letter-spacing:-.03em; margin-bottom:.5rem; }
    p  { color:var(--text3); font-size:.9rem; line-height:1.6; margin-bottom:1.5rem; }
    button { padding:.6rem 1.5rem; border-radius:999px; border:none;
             background:var(--accent); color:#fff; font-size:.875rem;
             font-weight:500; cursor:pointer; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="ball">
      <div class="ball-top"></div>
      <div class="ball-mid"></div>
      <div class="ball-bot"></div>
    </div>
    <h1>No Signal</h1>
    <p>Your Pokédex lost connection to Professor Oak's server.<br>
       Check your network and try again.</p>
    <button onclick="location.reload()">Try Again</button>
  </div>
</body>
</html>`;

/* ─── INSTALL ─── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] Install cache partial:', err))
  );
});

/* ─── ACTIVATE ─── */
self.addEventListener('activate', event => {
  const keep = [CACHE_STATIC, CACHE_API, CACHE_IMG];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !keep.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ─── FETCH ─── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  /* Skip non-GET and chrome-extension */
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  /* 1. PokéAPI data — Network first, fallback to cache */
  if (url.hostname === 'pokeapi.co') {
    event.respondWith(networkFirst(request, CACHE_API));
    return;
  }

  /* 2. Pokémon artwork / sprites / audio — Cache first */
  if (
    url.hostname === 'raw.githubusercontent.com' ||
    url.hostname.includes('pokeapi') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.gif') ||
    url.pathname.endsWith('.ogg') ||
    url.pathname.endsWith('.mp3')
  ) {
    event.respondWith(cacheFirst(request, CACHE_IMG));
    return;
  }

  /* 3. Google Fonts — Cache first */
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, CACHE_STATIC));
    return;
  }

  /* 4. Static app shell — Cache first, offline fallback */
  event.respondWith(
    cacheFirst(request, CACHE_STATIC).catch(() => offlineFallback(request))
  );
});

/* ─── STRATEGIES ─── */

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || Promise.reject('offline');
  }
}

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function offlineFallback(request) {
  /* Return offline HTML for navigation requests */
  if (request.mode === 'navigate') {
    return new Response(OFFLINE_HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }
  return new Response('', { status: 408, statusText: 'Offline' });
}

/* ─── MESSAGE: skip waiting on demand ─── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
