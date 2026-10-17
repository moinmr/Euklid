// Service Worker: holt alles frisch vom Server und legt es für offline ab.
// Welche Dateien es gibt, steht in kern/dateien.js, bereiche/liste.js und den reihenfolge.js der Bereiche.
// Ändert sich eine dieser Listen, installiert sich der Service Worker von selbst neu.
importScripts('kern/dateien.js', 'bereiche/liste.js');
importScripts.apply(self, self.App.bereiche.map(function (b) { return 'bereiche/' + b + '/reihenfolge.js'; }));

const CACHE = 'mathe-v3';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(self.App.alleDateien().map(u =>
    fetch(new Request(u, { cache: 'reload' })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {})
  ))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m =>
      m || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
