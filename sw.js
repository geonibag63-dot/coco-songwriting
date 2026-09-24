/* 오프라인 캐시 — 앱 셸과 콘텐츠를 저장. 배포할 때 VERSION을 올리면 새 파일을 받습니다. */
const VERSION = 'coco-v1';
const SHELL = ['./', './index.html', './css/app.css', './js/app.js', './js/store.js', './js/notation.js', './js/audio/engine.js',
  './js/labs/groove.js', './js/labs/melody.js', './data/staffs.js', './data/toc.js', './vendor/vexflow.js', './manifest.json', './assets/icon.svg',
  './content/guide.html', './content/ch1.html', './content/ch2.html', './content/ch3.html', './content/ch4.html', './content/ch5.html',
  './content/answers1.html', './content/answers2.html', './content/answers3.html', './content/answers4.html', './content/answers5.html'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // 폰트 등 외부는 브라우저에 맡김
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => { if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone())); return res; }).catch(() => hit);
    return hit || net;
  }));
});
