/* Service Worker — Project99 Agencia IA */
const CACHE = "p99-v1";
const OFFLINE_PAGE = "/";

const PRECACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/lib/manifest.js",
  "/lib/gsap.min.js",
  "/lib/ScrollTrigger.min.js"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => cached || caches.match(OFFLINE_PAGE));
      return cached || fetchPromise;
    })
  );
});
