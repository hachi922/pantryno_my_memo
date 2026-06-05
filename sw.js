const CACHE = 'pantryno-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Pacifico&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // FirebaseやGoogleの通信はキャッシュしない
  if(url.includes('firestore.googleapis.com') ||
     url.includes('firebase') ||
     url.includes('googleapis.com') ||
     url.includes('gstatic.com/firebasejs') ||
     url.includes('accounts.google.com') ||
     e.request.method !== 'GET' ||
     url.startsWith('chrome-extension')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
