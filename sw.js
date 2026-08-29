// ── LineUp Maker Service Worker ──────────────────────────────────
// Two jobs:
//  1. Cache the app shell (HTML/CSS/JS + the CDN libraries it loads)
//     so the app itself can boot without a network connection.
//  2. Cache GET /api/playlists/:shareId responses so a playlist you've
//     already opened — including its chord/lyric text and any photo/PDF
//     attachments (embedded as base64 right in that response) — can be
//     reopened and scrolled/swiped through with no internet at all.
//
// Nothing here ever intercepts a write (POST/PUT/DELETE) — those always
// go straight to the network, since caching them wouldn't make sense.

const SHELL_CACHE = "lineupmaker-shell-v1";
const PLAYLIST_CACHE = "lineupmaker-playlists-v1";

const SHELL_URLS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css",
  "https://unpkg.com/vue@3/dist/vue.global.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        Promise.all(
          SHELL_URLS.map((url) =>
            cache.add(new Request(url, { mode: "no-cors" })).catch(() => {
              // A handful of cross-origin sub-resources (e.g. font files
              // referenced inside a CSS file) may fail to precache here —
              // that's fine, the shell still works without every glyph.
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== PLAYLIST_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isPlaylistApiRequest(request) {
  return request.method === "GET" && request.url.includes("/api/playlists/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  if (isPlaylistApiRequest(request)) {
    // Network-first: always prefer a live, up-to-date playlist when
    // online, but fall back to the last cached copy when there's no
    // connection.
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PLAYLIST_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  const isShellRequest =
    request.url.startsWith(self.location.origin) ||
    SHELL_URLS.some((u) => u.startsWith("http") && request.url === u);

  if (isShellRequest) {
    // Cache-first, refreshing in the background — the app shell rarely
    // needs to be bang up to date the instant you deploy, and this way
    // it still opens instantly (and works offline) every time.
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
