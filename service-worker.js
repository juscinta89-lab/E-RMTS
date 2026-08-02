/* Service Worker — RMT Attendance SK Belukar
   Strategi: network-first untuk dokumen, cache-first untuk aset statik.
   Naikkan CACHE_VER setiap kali fail dikemas kini supaya auto-update. */
const CACHE_VER = 'rmt-skb-v12';
const SHELL = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/firebase-config.js',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Jangan cache trafik Firebase / API luar
  if (url.hostname.includes('firebase') || url.hostname.includes('googleapis') || url.hostname.includes('gstatic')) {
    return; // biar pergi ke rangkaian terus
  }

  // Dokumen HTML: network-first (dapat versi terkini), fallback cache
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone(); caches.open(CACHE_VER).then(c => c.put(req, copy)); return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Aset statik: cache-first
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_VER).then(c => c.put(req, copy)); return res;
    }).catch(() => cached))
  );
});
