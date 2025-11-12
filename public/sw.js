// Minimal service worker with skipWaiting and clients.claim
const CACHE_NAME = 'pfo-static-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', event => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => {
      if (k !== CACHE_NAME) return caches.delete(k);
    })))
  );
});

self.addEventListener('fetch', event => {
  // network-first for HTML, cache-first for others
  const req = event.request;
  if (req.method !== 'GET') return;
  const accept = req.headers.get('accept') || '';
  if (accept.includes('text/html')){
    event.respondWith(fetch(req).catch(()=> caches.match('/index.html')));
    return;
  }
  event.respondWith(caches.match(req).then(res => res || fetch(req).then(r=>{
    // not caching opaque responses
    if (r && r.ok){
      const clone = r.clone();
      caches.open(CACHE_NAME).then(c=> c.put(req, clone)).catch(()=>{});
    }
    return r;
  }).catch(()=>{})));
});

// Listen for skipWaiting message
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING'){
    self.skipWaiting();
  }
});
