/* VERSION and SHELL are injected from the actual production build. */
const PREFIX = `focus-frog-shell:${new URL(self.registration.scope).pathname}:`;
const CACHE = PREFIX + VERSION;
const absolute = path => new URL(path, self.registration.scope).href;

self.addEventListener('install', event => {
  // An incomplete download fails installation; the old worker stays usable.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL.map(absolute))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Keep the previous version for already-open documents using older assets.
    const previous = (await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE);
    await Promise.all(previous.slice(0, -1).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === 'navigate') return (await cache.match(absolute('index.html'))) || fetch(event.request);
    const current = await cache.match(event.request);
    if (current) return current;
    for (const key of (await caches.keys()).filter(key => key.startsWith(PREFIX))) {
      const old = await (await caches.open(key)).match(event.request);
      if (old) return old;
    }
    return fetch(event.request);
  })());
});

function clientIsIdle(client) {
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const done = idle => { clearTimeout(timer); channel.port1.close(); resolve(idle); };
    const timer = setTimeout(() => done(false), 1500);
    channel.port1.onmessage = event => done(event.data?.busy === false);
    client.postMessage({ type: 'FOCUS_FROG_CHECK_BUSY' }, [channel.port2]);
  });
}
self.addEventListener('message', event => {
  if (event.data?.type !== 'FOCUS_FROG_ACTIVATE') return;
  event.waitUntil((async () => {
    const clients = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .filter(client => client.url.startsWith(self.registration.scope));
    const idle = await Promise.all(clients.map(clientIsIdle));
    if (idle.every(Boolean)) {
      event.ports[0]?.postMessage({ ok: true });
      await self.skipWaiting();
    } else event.ports[0]?.postMessage({ ok: false });
  })());
});
