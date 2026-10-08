// オフライン用キャッシュ。画面(index.html)を直したら、この数字を1つ上げる。評価表の更新時はencrypt.pyが自動で上げる。
const CACHE_VERSION = 3;
const CACHE = "jitsugi-v" + CACHE_VERSION;
const FILES = ["./", "./index.html", "./sheets.enc.js", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// ネットがあれば最新を取りに行き、なければ保存済みのものを使う
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
