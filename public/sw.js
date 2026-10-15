/*
 * CMC Lab service worker —— 离线缓存
 *
 * 策略：
 * - 安装时预缓存应用壳（index.html），保证首屏离线可用
 * - 导航请求（页面跳转）：network-first，失败回退到缓存的 index.html（SPA 离线兜底）
 * - 静态资源（JS/CSS/字体/图标，Vite 产物带 hash）：stale-while-revalidate，
 *   首次在线访问后即进缓存，之后离线也能加载
 *
 * 部署新版本时把 CACHE 升一版号即可让旧缓存失效（activate 阶段自动清理）。
 */
const CACHE = 'cmc-lab-v1';
const SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // 只处理同源请求；跨域（如第三方字体/分析）交给浏览器默认行为
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // 页面导航：先联网，断网则回退到缓存壳
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }

  // 静态资源：stale-while-revalidate（先用缓存，后台更新）
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
