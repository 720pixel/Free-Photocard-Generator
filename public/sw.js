/* Free Photocard Generate service worker.
   App shell precache + runtime caches. Bump VERSION to invalidate. */
const VERSION = "pc-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const FONT_CACHE = `${VERSION}-fonts`;
const PAGE_CACHE = `${VERSION}-pages`;

const SHELL = [
  "/",
  "/editor",
  "/templates",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL).catch(() => undefined))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isFontRequest(url) {
  return (
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com"
  );
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Never cache API traffic.
  if (url.origin === self.location.origin && url.pathname.startsWith("/unavailable/")) {
    return;
  }

  // Cache-first for immutable build assets.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static")) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  // Cache-first for Google Fonts (stylesheet + font files).
  if (isFontRequest(url)) {
    event.respondWith(cacheFirst(req, FONT_CACHE));
    return;
  }

  // Network-first for navigations / pages, fall back to cache then shell.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(networkFirst(req, PAGE_CACHE));
    return;
  }

  // Same-origin static files (icons, images): cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
  }
});

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
    return res;
  } catch (err) {
    return hit || Response.error();
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    const shell = await caches.match("/");
    return shell || Response.error();
  }
}
