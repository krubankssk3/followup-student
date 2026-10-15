/* sw.js : ทำให้เปิดระบบได้แม้เน็ตหลุด (PWA)
 * - ไฟล์ของระบบ: ดึงจากเน็ตก่อนเสมอ (ได้เวอร์ชันใหม่ทันทีหลังอัปเดต GitHub) ถ้าไม่มีเน็ตใช้สำเนาในเครื่อง
 * - ไลบรารีจาก CDN และฟอนต์: ใช้สำเนาในเครื่องก่อน แล้วอัปเดตเบื้องหลัง
 * - ไม่แตะคำขอไปยัง Google Apps Script (ข้อมูลจริงยังมาจากเซิร์ฟเวอร์เสมอ)
 * อัปเดตไฟล์นี้เมื่อไร ให้เปลี่ยนเลข VERSION
 */
var VERSION = 'v4';
var SHELL = 'followup-shell-' + VERSION;
var CDN = 'followup-cdn-' + VERSION;
var CORE = ['/', '/app', '/app.css', '/app.js', '/theme.js', '/counter.js', '/tw.css', '/config.js', '/api.js', '/public.css', '/public.js', '/icon.svg', '/manifest.webmanifest'];
var CDN_HOSTS = ['cdn.jsdelivr.net', 'cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SHELL).then(function (c) {
    // เก็บทีละไฟล์ ไฟล์ไหนโหลดไม่ได้ก็ข้าม ไม่ให้การติดตั้งล้มทั้งหมด
    return Promise.all(CORE.map(function (u) {
      return fetch(u, { cache: 'no-cache' }).then(function (r) { if (r.ok) return c.put(u, r); }).catch(function () {});
    }));
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('followup-') === 0 && k !== SHELL && k !== CDN; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function fromNet(req, key) {
  return fetch(req).then(function (r) {
    if (r && r.ok && r.type !== 'opaqueredirect') {
      var copy = r.clone();
      caches.open(SHELL).then(function (c) { c.put(key || req, copy); });
    }
    return r;
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.hostname.indexOf('script.google') >= 0 || url.hostname.indexOf('googleusercontent') >= 0) return;

  // ไลบรารีภายนอก: ใช้ในเครื่องก่อน + อัปเดตเบื้องหลัง
  if (CDN_HOSTS.indexOf(url.hostname) >= 0) {
    e.respondWith(caches.open(CDN).then(function (c) {
      return c.match(req).then(function (hit) {
        var net = fetch(req).then(function (r) { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(function () { return hit; });
        return hit || net;
      });
    }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // หน้าเว็บ: เน็ตก่อน ไม่มีเน็ตใช้หน้าที่เก็บไว้
  if (req.mode === 'navigate') {
    var page = url.pathname.indexOf('/app') === 0 ? '/app' : '/';
    e.respondWith(fromNet(req, page).catch(function () {
      return caches.match(page).then(function (r) { return r || caches.match('/app'); });
    }));
    return;
  }
  // ไฟล์ของระบบ: เน็ตก่อน ไม่มีเน็ตใช้สำเนา
  e.respondWith(fromNet(req, url.pathname).catch(function () {
    return caches.match(url.pathname).then(function (r) { return r || caches.match(req); });
  }));
});
