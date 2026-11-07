const cacheName = 'trasay-offline-v2';
const home = new URL('./', self.registration.scope).href;
const assets = ['app.js', 'styles.css', 'assets/sayso-mark.png', 'assets/apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const response = await fetch(home, {cache: 'reload'});
    if (!response.ok) throw new Error('Could not cache the TraSay home page');
    const html = await response.clone().text();
    const shell = assets.map(path => {
      const versionedPath = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
        .map(match => match[1]).find(link => link.split('?')[0] === path);
      return new Request(new URL(versionedPath || path, home), {cache: 'reload'});
    });
    const cache = await caches.open(cacheName);
    await cache.addAll(shell);
    await cache.put(home, response);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith('trasay-offline-') && name !== cacheName)
      .map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || !url.href.startsWith(home)) return;
  const path = url.href.slice(home.length).split(/[?#]/)[0];
  const isHome = request.mode === 'navigate' && (path === '' || path === 'index.html');
  if (!isHome && !assets.includes(path)) return;

  event.respondWith((async () => {
    const cache = await caches.open(cacheName);
    const key = isHome ? home : request;
    const saved = await cache.match(key);
    // Versioned assets can be served immediately once downloaded.
    if (!isHome && saved) return saved;
    const controller = new AbortController();
    const timeout = saved ? setTimeout(() => controller.abort(), 1200) : null;
    try {
      const response = await fetch(request, {signal: controller.signal});
      if (response.ok) {
        await cache.put(key, response.clone());
        return response;
      }
      return saved || response;
    } catch {
      return saved || Response.error();
    } finally {
      clearTimeout(timeout);
    }
  })());
});
