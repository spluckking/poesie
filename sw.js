/*
 * sw.js — Service worker : toute l'appli en cache pour le hors-ligne.
 * Cache d'abord, mise à jour en arrière-plan ; poesie.txt : réseau d'abord.
 * Les voix (audio/voix/) sont mises en cache au premier usage (préchargées au démarrage).
 * Changer VERSION force un recache complet.
 */
const VERSION = 'poesie-v3';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './poesie.txt',
  './css/style.css',
  './js/audiokey.js',
  './js/consignes.js',
  './js/poem.js',
  './js/cues.js',
  './js/levels.js',
  './js/planner.js',
  './js/session.js',
  './js/store.js',
  './js/speech.js',
  './js/app.js',
  './fonts/andika-400.woff2',
  './fonts/andika-700.woff2',
  './fonts/playwrite-fr-moderne.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/icon-180.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION)
      .then((cache) => cache.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNav = req.mode === 'navigate';
  const key = isNav ? new URL('./index.html', self.registration.scope).href : req;

  if (url.pathname.endsWith('/poesie.txt')) {
    event.respondWith(
      caches.open(VERSION).then((cache) => fetch(req).then((res) => {
        if (res.ok) cache.put(new URL('./poesie.txt', self.registration.scope).href, res.clone());
        return res;
      }).catch(() => cache.match(new URL('./poesie.txt', self.registration.scope).href)
        .then((r) => r || new Response('', { status: 404 }))))
    );
    return;
  }

  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') cache.put(key, res.clone());
        return res;
      }).catch(() => null);
      if (cached) {
        event.waitUntil(network);
        return cached;
      }
      const res = await network;
      return res || new Response('Hors ligne', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    })
  );
});
