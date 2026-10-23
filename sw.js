// Офлайн-режим для веб-версии «Финансы»
const C = 'fin-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './privacy.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x))))); self.clients.claim(); });
// Сначала пробуем сеть 4 секунды (чтобы приходили обновления).
// Если сеть не отвечает или режется, открываем сохранённую версию.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const cached = await caches.match(e.request, { ignoreSearch: true }) || (e.request.mode === 'navigate' ? await caches.match('./index.html') : null);
    const net = fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; });
    if (!cached) return net.catch(() => caches.match('./index.html'));
    const timeout = new Promise(ok => setTimeout(() => ok(cached), 4000));
    return Promise.race([net.catch(() => cached), timeout]);
  })());
});
