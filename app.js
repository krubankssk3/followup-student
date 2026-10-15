/* app.js : v1.0 (ปรับโฉม, SweetAlert2, โลโก้, รูปแบบรายงาน, สีโรงเรียน, ฉลอง, Excel, ลายเซ็นดิจิทัล)
 * - นักเรียน: หน้าหลัก รายวิชาที่ต้องแก้ รับทราบ ติ๊กสิ่งที่ทำแล้ว ข้อความถึงครู
 * - ครู: งานของฉัน รายชื่อนักเรียน บันทึก 0 ร มส เลื่อนกำหนด แจ้งเตือนนักเรียน
 * - งานวัดผล: ภาพรวม รายงานรายห้องและพิมพ์รายบุคคล
 * เขียนแบบ ES5 ทั้งไฟล์
 * พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3
 */
(function () {
  'use strict';

  var C = window.APP_CONFIG || {};
  var FOOT = 'พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3';
  var THEME_KEY = 'followup_theme';
  var CACHE_KEY = 'followup_cache_';
  var DAY = 86400000;
  var TH_M = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  var STEPS = ['รับทราบ', 'ทำงาน', 'ส่งหลักฐาน', 'ครูตรวจ', 'อนุมัติ'];
  var TYPES = ['0', 'ร', 'มส'];
  var TASKS = {
    '0': ['รับใบงานซ่อมเสริมจากครู', 'ทำใบงานซ่อมเสริมให้ครบ', 'สอบแก้ตัวตามวันที่ครูนัด'],
    'ร': ['ส่งงานที่ค้างให้ครบ', 'สอบในส่วนที่ขาดสอบ'],
    'มส': ['เรียนเพิ่มเติมให้ครบเวลา', 'ทำงานชดเชยตามที่ครูมอบหมาย', 'สอบหลังเรียนครบเวลา']
  };
  var TDESC = { '0': 'ไม่ผ่านเกณฑ์', 'ร': 'ค้างงาน หรือขาดสอบ', 'มส': 'เวลาเรียนไม่ถึง 80%' };
  var CAUSE_PH = { '0': 'เช่น คะแนนรวม 38/100 ไม่ถึงเกณฑ์', 'ร': 'เช่น ค้างใบงานที่ 3 และขาดสอบกลางภาค', 'มส': 'เช่น ขาดเรียนบ่อยช่วงเดือน ส.ค.' };

  var S = {
    user: null, settings: null, tab: 'home', stack: [], hist: 0, skipPop: false, sheet: null,
    cases: [], notifs: [], subjects: [], students: null, studentsAt: 0, logs: {}, ev: {}, uploading: {}, pendingCase: null,
    adm: { users: null, students: null, subjects: null, settings: null }, aq: '', acls: 'all',
    filter: 'all', q: '', cls: null, loaded: false, syncing: false, lastSync: 0, loadErr: null
  };

  /* ---------- icons ---------- */
  var IC = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    camera: '<path d="M14.5 4h-5L7.5 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    back: '<path d="m15 18-6-6 6-6"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v-4M12 15V7M17 15v-6"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    seal: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.6 9.6 0 0 1-3.4-.6L3 21l1.9-4.6A8 8 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    palette: '<path d="M12 22a10 10 0 1 1 10-10c0 2.2-1.8 3.5-4 3.5h-1.6a1.9 1.9 0 0 0-1.4 3.2A1.9 1.9 0 0 1 12 22z"/><circle cx="7.5" cy="10.5" r="1.2"/><circle cx="12" cy="7.5" r="1.2"/><circle cx="16.5" cy="10.5" r="1.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    trash: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/>',
    checksq: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m8 12 3 3 5-6"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.3 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'
  };
  function ic(n, s) {
    s = s || 22;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || IC.bell) + '</svg>';
  }

  /* ---------- utils ---------- */
  function $(id) { return document.getElementById(id); }
  function now() { return Date.now(); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function thDate(t) { if (!t) return '-'; var d = new Date(t); return d.getDate() + ' ' + TH_M[d.getMonth()] + ' ' + String(d.getFullYear() + 543).slice(2); }
  function thTime(t) { var d = new Date(t); return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function ago(t) {
    var m = Math.round((now() - t) / 60000);
    if (m < 1) return 'เมื่อสักครู่';
    if (m < 60) return m + ' นาทีที่แล้ว';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' ชั่วโมงที่แล้ว';
    var d = Math.round(h / 24);
    if (d < 7) return d + ' วันที่แล้ว';
    return thDate(t);
  }
  function daysLeft(t) { return Math.ceil((t - now()) / DAY); }
  function ymd(t) { var d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseYmd(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 16, 30).getTime(); }
  function level(cls) { var m = String(cls || '').match(/(\d)/); return m ? +m[1] : 0; }
  function initials(name) { return String(name || '?').replace(/^(ด\.ช\.|ด\.ญ\.|นางสาว|นาย|นาง)/, '').slice(0, 2); }
  function setting(k, d) { var st = S.settings || {}; return st[k] === undefined || st[k] === '' ? d : st[k]; }
  function term() { return S.settings && S.settings.academicYear ? 'ปีการศึกษา ' + S.settings.academicYear + ' ภาคเรียนที่ ' + S.settings.semester : ''; }
  function greet() { var h = new Date().getHours(); return h < 12 ? 'สวัสดีตอนเช้า' : (h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'); }
  function roleName(r) { return { student: 'นักเรียน', teacher: 'ครูผู้สอน', measure: 'งานวัดผล', admin: 'ผู้ดูแลระบบ' }[r] || r; }
  function haptic() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} }

  var toastT = null;
  function toast(msg, icon) {
    if (window.Swal && !(window.Swal.isVisible() && !document.querySelector('.swal2-toast'))) {
      var bad = /ไม่สำเร็จ|ไม่ได้|ไม่พบ|ไม่ถูกต้อง|ผิด|เกิน|ก่อน|หมดเวลา|ไม่มี/.test(msg);
      swalFire({ toast: true, position: 'top', timer: 2600, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'sw-toast' }, icon: icon || (bad ? 'warning' : 'success'), title: msg });
      return;
    }
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast show';
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.className = 'toast'; }, 3000);
  }
  function setBusy(btn, busy, text) {
    if (!btn) return;
    if (busy) {
      btn.setAttribute('data-label', btn.innerHTML);
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(text || 'กำลังบันทึก');
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.getAttribute('data-label') || btn.innerHTML;
      btn.disabled = false;
    }
  }

  /* ---------- SweetAlert2 + โลโก้ ---------- */
  var LOGO_KEY = 'followup_logo';
  (function () {
    try { var lg = JSON.parse(localStorage.getItem(LOGO_KEY) || 'null'); if (lg && lg.data) { S.logo = lg.data; S.logoVer = lg.ver; } } catch (e) {}
  })();
  function logoSrc() { return S.logo || C.LOGO_URL || ''; }
  function applyFavicon() {
    var src = logoSrc(); if (!src) return;
    var links = document.querySelectorAll('link[rel="icon"],link[rel="apple-touch-icon"]');
    for (var i = 0; i < links.length; i++) links[i].href = src;
  }
  function syncLogo(ver) {
    ver = String(ver || '');
    if (ver === String(S.logoVer || '')) return;
    if (!ver) { S.logo = null; S.logoVer = ''; try { localStorage.removeItem(LOGO_KEY); } catch (e) {} render(); return; }
    API.call('getLogo').then(function (d) {
      S.logo = d.data || null; S.logoVer = d.ver || '';
      try { localStorage.setItem(LOGO_KEY, JSON.stringify({ data: S.logo, ver: S.logoVer })); } catch (e) {}
      applyFavicon(); render();
    }).catch(function () {});
  }
  function hasSwal() { return !!window.Swal; }
  /** ทุกป๊อปอัปผ่านฟังก์ชันนี้ ให้มีเอฟเฟคเฟดเข้าออกแบบเดียวกัน */
  function swalFire(o) {
    var userOpen = o.didOpen;
    o.didOpen = function (popup) {
      if (!o.toast && popup && !popup.querySelector('.ai-corners')) {
        var cn = document.createElement('div'); cn.className = 'ai-corners'; cn.innerHTML = '<i></i><i></i><i></i><i></i>';
        popup.appendChild(cn);
      }
      if (userOpen) userOpen(popup);
    };
    if (!o.toast) {
      // ล็อกหน้าต่าง: ปิดได้เฉพาะปุ่มในหน้าต่าง (ยกเลิก / ตกลง / ✕) ไม่ปิดเมื่อกดพื้นหลังหรือกด Esc
      if (o.allowOutsideClick === undefined) o.allowOutsideClick = false;
      if (o.allowEscapeKey === undefined) o.allowEscapeKey = false;
      if (o.showCloseButton === undefined && (o.showCancelButton || o.input)) o.showCloseButton = true;
      if (o.closeButtonAriaLabel === undefined) o.closeButtonAriaLabel = 'ปิด';
    }
    o.showClass = o.toast ? { popup: 'sw-tin' } : { popup: 'sw-in' };
    o.hideClass = o.toast ? { popup: 'sw-tout' } : { popup: 'sw-out' };
    return window.Swal.fire(o);
  }
  var AI_CODES = ['◆ ESTABLISHING SECURE LINK', '◆ SYNCING DATA NODES', '◆ ANALYZING RECORDS', '◆ OPTIMIZING RESULT', '◆ ALMOST READY'];
  var aiTimer = null;
  function loaderHtml(text, sub) {
    var src = logoSrc();
    return '<div class="ai-load"><div class="ai-orbit o1"><span class="sat"></span></div><div class="ai-orbit o2"><span class="sat"></span></div><div class="ai-orbit o3"></div>' +
      '<div class="ai-core">' + (src ? '<img src="' + esc(src) + '" alt="" onerror="this.style.display=\'none\'">' : ic('cap', 36)) + '</div></div>' +
      '<div class="ai-text">' + esc(text || 'กำลังโหลด') + '<span class="cur"></span></div>' + (sub ? '<div class="ai-sub">' + esc(sub) + '</div>' : '') +
      '<div class="ai-bar"><i></i></div><div class="ai-code" id="aiCode">' + AI_CODES[0] + '</div>';
  }
  function startAiCodes() {
    clearInterval(aiTimer);
    var i = 0;
    aiTimer = setInterval(function () {
      var el = document.getElementById('aiCode');
      if (!el) { clearInterval(aiTimer); return; }
      i = (i + 1) % AI_CODES.length; el.textContent = AI_CODES[i];
    }, 700);
  }
  function loading(text, sub) {
    if (!hasSwal()) return;
    swalFire({ html: loaderHtml(text, sub), showConfirmButton: false, allowOutsideClick: false, allowEscapeKey: false, customClass: { popup: 'sw-pop' }, didOpen: startAiCodes });
  }
  function loaded() { if (hasSwal() && window.Swal.isVisible() && !document.querySelector('.swal2-toast')) window.Swal.close(); }
  function confirmBox(o) {
    if (!hasSwal()) return Promise.resolve(window.confirm(o.title + (o.text ? '\n' + o.text : '')));
    return swalFire({
      title: o.title, text: o.text || '', icon: o.icon || (o.danger ? 'warning' : 'question'), showCancelButton: true,
      confirmButtonText: o.ok || 'ยืนยัน', cancelButtonText: 'ยกเลิก', reverseButtons: true, focusCancel: !!o.danger,
      customClass: { popup: 'sw-pop', confirmButton: o.danger ? 'sw-danger' : '' }
    }).then(function (r) { return r.isConfirmed; });
  }
  function successBox(title, text) {
    if (!hasSwal()) { toast(title); return; }
    swalFire({ icon: 'success', title: title, text: text || '', timer: 1900, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'sw-pop' } });
  }
  /* ---------- หน้าโหลด (Tailwind) ---------- */
  var SHIMMER = '<span class="tw-pointer-events-none tw-absolute tw-inset-0 tw--translate-x-full tw-animate-shimmer tw-bg-gradient-to-r tw-from-transparent tw-via-white/50 tw-to-transparent"></span>';
  function skeleton(n) {
    var h = '<div class="tw-mb-3 tw-flex tw-items-center tw-gap-2 tw-text-[13px] tw-text-[var(--muted)]"><span class="tw-relative tw-flex tw-h-2.5 tw-w-2.5"><span class="tw-absolute tw-inline-flex tw-h-full tw-w-full tw-animate-ping tw-rounded-full tw-bg-[var(--brand)] tw-opacity-60"></span><span class="tw-relative tw-inline-flex tw-h-2.5 tw-w-2.5 tw-rounded-full tw-bg-[var(--brand)]"></span></span>กำลังโหลดข้อมูลล่าสุด</div><div class="group">';
    for (var i = 0; i < (n || 4); i++) {
      h += '<div class="sk-row tw-relative tw-overflow-hidden" style="animation:fade .4s ' + (i * 0.08) + 's both"><div class="sk sk-c tw-rounded-2xl"></div><div style="flex:1"><div class="sk sk-l" style="width:' + (55 + (i * 13) % 35) + '%"></div><div class="sk sk-l" style="width:' + (30 + (i * 17) % 30) + '%"></div></div>' +
        '<div class="sk tw-h-7 tw-w-14 tw-rounded-full"></div>' + SHIMMER + '</div>';
    }
    return h + '</div>';
  }
  /** ตัวโหลดแบบวงโคจร ใช้ในหน้าต่างและส่วนย่อย */
  function twLoad(text) {
    return '<div class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-gap-3 tw-py-10 tw-text-[var(--muted)]">' +
      '<div class="tw-relative tw-h-14 tw-w-14"><div class="tw-absolute tw-inset-0 tw-rounded-full tw-border-4 tw-border-[var(--brand-soft)]"></div>' +
      '<div class="tw-absolute tw-inset-0 tw-rounded-full tw-border-4 tw-border-transparent tw-border-t-[var(--brand)] tw-animate-spin"></div>' +
      '<div class="tw-absolute tw-inset-[14px] tw-rounded-full tw-bg-[var(--brand)] tw-opacity-80 tw-animate-ping"></div></div>' +
      '<span class="tw-text-[14px] tw-font-medium">' + esc(text || 'กำลังโหลด') + '</span></div>';
  }
  /** ไอคอนของหน้าว่าง: กล่องไล่สีลอยเบาๆ */
  function emptyIc(name, size) {
    return '<span class="tw-relative tw-mb-1 tw-grid tw-h-20 tw-w-20 tw-place-items-center tw-overflow-hidden tw-rounded-[26px] tw-bg-[var(--brand-soft)] tw-text-[var(--brand)] tw-shadow-[0_12px_30px_var(--glow)] tw-animate-floaty">' +
      '<span class="tw-absolute tw-inset-0 tw-bg-gradient-to-br tw-from-white/60 tw-to-transparent"></span><span class="tw-relative">' + ic(name, size || 34) + '</span></span>';
  }
  /** แถบโหลดบางๆ ด้านบนจอ ระหว่างซิงก์ข้อมูล */
  function topBar() {
    return S.syncing ? '<div class="tw-fixed tw-inset-x-0 tw-top-0 tw-z-[1400] tw-h-[3px] tw-overflow-hidden tw-bg-[var(--brand-soft)] no-print"><div class="tw-h-full tw-w-1/3 tw-animate-loadbar tw-rounded-full tw-bg-gradient-to-r tw-from-transparent tw-via-[var(--brand)] tw-to-transparent tw-shadow-[0_0_12px_var(--brand)]"></div></div>' : '';
  }

  /* ---------- cache ---------- */
  function saveCache() {
    if (!S.user) return;
    try {
      localStorage.setItem(CACHE_KEY + S.user.id, JSON.stringify({
        cases: S.cases, notifs: S.notifs, subjects: S.subjects, settings: S.settings, at: S.lastSync
      }));
    } catch (e) {}
  }
  function loadCache() {
    if (!S.user) return;
    try {
      var raw = localStorage.getItem(CACHE_KEY + S.user.id);
      if (!raw) return;
      var c = JSON.parse(raw);
      S.cases = c.cases || []; S.notifs = c.notifs || []; S.subjects = c.subjects || [];
      S.settings = c.settings || S.settings; S.lastSync = c.at || 0; S.loaded = true;
    } catch (e) {}
  }
  function clearCache() {
    try {
      var keys = [];
      for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(CACHE_KEY) === 0) keys.push(k); }
      keys.forEach(function (k) { localStorage.removeItem(k); });
    } catch (e) {}
  }

  /* ---------- theme ---------- */
  function applyTheme() { try { var t = localStorage.getItem(THEME_KEY); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {} }
  function isDark() {
    var th = document.documentElement.getAttribute('data-theme');
    if (th) return th === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* ---------- case helpers ---------- */
  function caseById(id) { for (var i = 0; i < S.cases.length; i++) { if (S.cases[i].id === id) return S.cases[i]; } return null; }
  function upsertCase(item) {
    for (var i = 0; i < S.cases.length; i++) { if (S.cases[i].id === item.id) { S.cases[i] = item; return; } }
    S.cases.unshift(item);
  }
  function isOpen(c) { return c.status !== 'APPROVED' && c.status !== 'REPEAT' && c.status !== 'HOLD'; }
  var HOLD_LABEL = { SUSPENDED: 'แขวนการติดตาม', WITHDRAWN: 'ถอนชื่อ' };
  function isOverdue(c) { return (c.status === 'OPEN' || c.status === 'DOING') && c.due && c.due < now(); }
  function allDone(c) { for (var i = 0; i < c.tasks.length; i++) { if (!c.tasks[i].done) return false; } return c.tasks.length > 0; }
  function capOf(c) { return c.type === '0' ? +setting('capZero', 1) : (c.type === 'มส' ? +setting('capMs', 1) : 4); }
  function tcls(t) { return t === '0' ? 't0' : (t === 'ร' ? 'tr' : 'tm'); }
  function typeName(t) { return t === '0' ? 'ผลการเรียน 0' : (t === 'ร' ? 'ร รอการตัดสิน' : 'มส ไม่มีสิทธิ์สอบ'); }
  function urgency(c) {
    if (c.status === 'APPROVED') return 9e15 - (c.upd || 0);
    if (c.status === 'REPEAT') return 8e15;
    if (c.status === 'HOLD') return 8.5e15;
    if (c.status === 'SUBMITTED' || c.status === 'PASSED') return 4e15 + (c.due || 0);
    return c.due || 0;
  }
  function byUrg(a, b) { return urgency(a) - urgency(b); }
  function isOwner(c) { return S.user.role === 'admin' || (S.user.role === 'teacher' && c.teacher === S.user.id); }
  function tally(cs) { var t = { '0': 0, 'ร': 0, 'มส': 0 }; cs.forEach(function (c) { if (isOpen(c) && t[c.type] !== undefined) t[c.type]++; }); return t; }
  function unread() { return S.notifs.filter(function (n) { return !n.read; }).length; }

  /* ---------- components ---------- */
  function stamp(c, lg) {
    var cls, txt;
    if (c.status === 'APPROVED') { cls = 'tok'; txt = '<span class="st-in"><small>ได้</small>' + esc(c.grade) + '</span>'; }
    else if (c.status === 'REPEAT') { cls = 'trep'; txt = 'ซ้ำ'; }
    else if (c.status === 'HOLD') { cls = 'trep'; txt = 'แขวน'; }
    else { cls = tcls(c.type); txt = esc(c.type); }
    return '<span class="stamp ' + cls + (lg ? ' lg' : '') + '">' + txt + '</span>';
  }
  function typeStamp(t, lg) { return '<span class="stamp ' + tcls(t) + (lg ? ' lg' : '') + '">' + t + '</span>'; }
  function chip(c) {
    var m = {
      OPEN: ['รอรับทราบ', 'warn'], DOING: [c.rejectNote ? 'ครูขอให้แก้' : 'กำลังแก้', 'warn'], SUBMITTED: ['รอครูตรวจ', 'info'],
      PASSED: ['รออนุมัติ', 'info'], APPROVED: ['แก้เสร็จ', 'ok'], REPEAT: ['เรียนซ้ำ', 'bad'], HOLD: [HOLD_LABEL[c.hold] || 'แขวน', 'hold']
    }[c.status] || [c.status, ''];
    if (isOverdue(c)) m = ['เลยกำหนด', 'bad'];
    return '<span class="chip ch-' + m[1] + '">' + m[0] + '</span>';
  }
  function dueInfo(c) {
    if (c.status === 'APPROVED') return { t: 'แก้เสร็จ ' + thDate(c.upd), k: 'ok' };
    if (c.status === 'REPEAT') return { t: 'ต้องลงทะเบียนเรียนซ้ำ', k: 'bad' };
    if (c.status === 'HOLD') return { t: 'หยุดติดตามชั่วคราว', k: 'muted' };
    if (c.status === 'SUBMITTED') return { t: 'ส่งแล้ว รอครูตรวจ', k: 'info' };
    if (c.status === 'PASSED') return { t: 'ผ่านแล้ว รองานวัดผลอนุมัติ', k: 'info' };
    if (!c.due) return { t: 'ไม่ได้กำหนดวันส่ง', k: 'muted' };
    var d = daysLeft(c.due);
    if (d < 0) return { t: 'เลยกำหนด ' + (-d) + ' วัน', k: 'bad' };
    if (d === 0) return { t: 'ครบกำหนดวันนี้', k: 'bad' };
    return { t: 'ภายใน ' + thDate(c.due) + ' (อีก ' + d + ' วัน)', k: d <= 3 ? 'warn' : 'muted' };
  }
  function stepIdx(c) {
    switch (c.status) {
      case 'OPEN': return 0;
      case 'DOING': return allDone(c) ? 2 : 1;
      case 'SUBMITTED': return 3;
      case 'PASSED': return 4;
      case 'APPROVED': return 5;
      default: return -1;
    }
  }
  function stepsHtml(c) {
    var k = stepIdx(c);
    if (k < 0) return '';
    return '<ol class="steps" aria-label="ขั้นตอนการแก้">' + STEPS.map(function (s, i) {
      return '<li class="stp' + (i < k ? ' done' : (i === k ? ' cur' : '')) + '"' + (i === k ? ' aria-current="step"' : '') + '><i></i>' + s + '</li>';
    }).join('') + '</ol>';
  }
  function caseRow(c, who) {
    var di = dueInfo(c);
    var title = who ? c.studentName : c.subjectName;
    var sub = who ? c.subjectName + ' ' + c.classroom : c.subject + ' ' + c.teacherName;
    var line = chip(c);
    if (c.status === 'OPEN' || c.status === 'DOING') line += '<span class="t-' + di.k + '">' + di.t + '</span>';
    else if (c.status === 'PASSED') line += '<span>ได้ระดับ ' + esc(c.grade) + '</span>';
    return '<button class="row" data-act="open-case" data-id="' + esc(c.id) + '">' + stamp(c) +
      '<span class="row-main"><span class="row-t">' + esc(title) + '</span><span class="row-s">' + esc(sub) + '</span><span class="row-s">' + line + '</span></span>' +
      '<span class="chev">' + ic('chev', 20) + '</span></button>';
  }
  function avatarHtml(key, name, pv, cls) {
    var n = 0; key = String(key);
    for (var i = 0; i < key.length; i++) n = (n + key.charCodeAt(i)) % 5;
    var img = photoOf(key, pv);
    return '<span class="avatar av' + n + (img ? ' has-ph' : '') + (cls ? ' ' + cls : '') + '"' + (pv ? ' data-ph="' + esc(key) + '"' : '') + '>' +
      (img ? '<img src="' + esc(img) + '" alt="">' : esc(initials(name))) + '</span>';
  }

  /* ---------- รูปนักเรียน: โหลดเมื่อจำเป็น เก็บสำเนาในเครื่อง ---------- */
  var PH_KEY = 'followup_ph', PH_MAX = 160;
  var PH = (function () { try { var o = JSON.parse(localStorage.getItem(PH_KEY) || '{}'); return o && typeof o === 'object' ? o : {}; } catch (e) { return {}; } })();
  var phWant = {}, phBusy = {}, phT = null;
  function phSave() {
    var keys = Object.keys(PH);
    if (keys.length > PH_MAX) keys.sort(function (a, b) { return (PH[a].t || 0) - (PH[b].t || 0); }).slice(0, keys.length - PH_MAX).forEach(function (k) { delete PH[k]; });
    try { localStorage.setItem(PH_KEY, JSON.stringify(PH)); }
    catch (e) { keys = Object.keys(PH).sort(function (a, b) { return (PH[a].t || 0) - (PH[b].t || 0); }); keys.slice(0, Math.ceil(keys.length / 2)).forEach(function (k) { delete PH[k]; }); try { localStorage.setItem(PH_KEY, JSON.stringify(PH)); } catch (e2) {} }
  }
  /** คืนรูปถ้ามีในเครื่องและเป็นเวอร์ชันล่าสุด ไม่มีก็สั่งโหลดแล้วคืนค่าว่าง */
  function photoOf(id, pv) {
    if (!pv || !S.user) return '';
    var p = PH[id];
    if (p && String(p.v) === String(pv)) return p.d || '';
    if (!phBusy[id]) { phWant[id] = pv; clearTimeout(phT); phT = setTimeout(phFetch, 60); }
    return p && p.d ? p.d : '';
  }
  function phFetch() {
    var ids = Object.keys(phWant).slice(0, 60);
    if (!ids.length || !S.user) return;
    ids.forEach(function (id) { phBusy[id] = true; delete phWant[id]; });
    API.call('getPhotos', { ids: ids }).then(function (d) {
      var got = d.photos || {}, t = now();
      Object.keys(got).forEach(function (id) {
        if (got[id].d) PH[id] = { v: got[id].v, d: got[id].d, t: t }; else delete PH[id];
        phPatch(id);
      });
      phSave();
    }).catch(function () {}).then(function () {
      ids.forEach(function (id) { delete phBusy[id]; });
      if (Object.keys(phWant).length) phT = setTimeout(phFetch, 60);
    });
  }
  /** ใส่รูปลงในจุดที่แสดงอยู่ โดยไม่ต้องวาดหน้าใหม่ทั้งหน้า */
  function phPatch(id) {
    var p = PH[id], els = document.querySelectorAll('[data-ph="' + String(id).replace(/"/g, '') + '"]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (p && p.d) { el.innerHTML = '<img src="' + esc(p.d) + '" alt="">'; if (el.className.indexOf('has-ph') < 0) el.className += ' has-ph'; }
    }
  }
  function phSet(id, data, ver) {
    if (data) PH[id] = { v: ver, d: data, t: now() }; else delete PH[id];
    phSave();
  }
  function processStudentPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) return reject({ message: 'เลือกไฟล์รูปภาพ' });
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var n = 260, q = 0.85, out = null, cv = document.createElement('canvas'), g = cv.getContext('2d');
        var W = img.naturalWidth, H = img.naturalHeight, side = Math.min(W, H);
        var sx = (W - side) / 2, sy = H > W ? (H - side) * 0.2 : 0; // รูปแนวตั้ง เน้นช่วงใบหน้าด้านบน
        for (var i = 0; i < 8 && !out; i++) {
          cv.width = n; cv.height = n; g.fillStyle = '#fff'; g.fillRect(0, 0, n, n);
          g.drawImage(img, sx, sy, side, side, 0, 0, n, n);
          var j = cv.toDataURL('image/jpeg', q);
          if (j.length <= 36000) out = j; else if (q > 0.6) q -= 0.08; else n = Math.round(n * 0.85);
        }
        URL.revokeObjectURL(url);
        out ? resolve(out) : reject({ message: 'ย่อรูปไม่สำเร็จ ลองใช้รูปอื่น' });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject({ message: 'เปิดรูปนี้ไม่ได้' }); };
      img.src = url;
    });
  }
  function canPhoto(st) {
    var u = S.user;
    if (st && st.role) return isAdmin() || st.id === u.id; // รูปครู: ผู้ดูแลระบบ หรือเจ้าของบัญชี
    return u.role === 'admin' || u.role === 'measure' || (u.role === 'teacher' && u.advisorClass && st && String(st.classroom) === String(u.advisorClass));
  }
  function photoBlock(st) {
    var img = photoOf(st.id, st.photoVer);
    return '<div class="stu-ph"><div class="stu-ph-i"' + (st.photoVer ? ' data-ph="' + esc(st.id) + '"' : '') + '>' + (img ? '<img src="' + esc(img) + '" alt="">' : ic('user', 40)) + '</div>' +
      '<div class="stu-ph-b"><b>' + (st.role ? 'รูปประจำตัว' : 'รูปนักเรียน') + '</b><small class="t-muted">' + (st.role ? 'แสดงในรายชื่อครูและแถบเมนู' : 'ใช้ในรายชื่อ หน้านักเรียน และรายงาน') + ' ระบบครอปและย่อให้อัตโนมัติ</small>' +
      (canPhoto(st) ? '<div class="stu-ph-a"><button class="btn btn-ghost" data-act="ph-pick" data-id="' + esc(st.id) + '">' + ic('camera', 18) + (st.photoVer ? 'เปลี่ยนรูป' : 'ใส่รูป') + '</button>' +
        (st.photoVer ? '<button class="btn btn-ghost" data-act="ph-remove" data-id="' + esc(st.id) + '" style="color:var(--zero)">ลบรูป</button>' : '') + '</div>' : '') + '</div></div>';
  }
  function savePhoto(id, data) {
    loading(data ? 'กำลังบันทึกรูป' : 'กำลังลบรูป');
    API.call('savePhoto', { id: id, data: data }).then(function (d) {
      loaded(); haptic();
      phSet(id, data, d.ver);
      (S.adm.students || []).forEach(function (x) { if (x.id === id) x.photoVer = d.ver; });
      (S.adm.users || []).forEach(function (x) { if (x.id === id) x.photoVer = d.ver; });
      if (S.user.id === id) { S.user.photoVer = d.ver; try { API.setSession(null, S.user); } catch (e) {} }
      if (S.sheet && S.sheet.kind === 'form' && S.sheet.form === 'user' && S.sheet.values && S.sheet.values.id === id) {
        var uu = (S.adm.users || []).filter(function (x) { return x.id === id; })[0];
        if (uu) S.sheet.top = photoBlock({ id: uu.id, photoVer: uu.photoVer, role: uu.role });
        renderSheet();
      }
      (S.students || []).forEach(function (x) { if (x.id === id) x.pv = d.ver; });
      S.cases.forEach(function (c) { if (c.sid === id) c.pv = d.ver; });
      saveCache();
      if (S.sheet && S.sheet.kind === 'form' && S.sheet.form === 'student' && S.sheet.values && S.sheet.values.studentId === id) {
        var st = (S.adm.students || []).filter(function (x) { return x.id === id; })[0];
        if (st) { S.sheet.top = photoBlock(st); S.sheet.extra = studentExtra(st); }
        renderSheet();
      }
      render();
      toast(data ? 'บันทึกรูปแล้ว' : 'ลบรูปแล้ว');
    }).catch(function (e) { loaded(); toast(e.message || 'บันทึกรูปไม่สำเร็จ'); });
  }
  function emblem() {
    var src = logoSrc();
    return '<div class="emblem">' + ic('cap', 30) + (src ? '<img src="' + esc(src) + '" alt="" onerror="this.parentNode.removeChild(this)">' : '') + '</div>';
  }
  function ring(done, total) {
    var r = 34, Cc = 2 * Math.PI * r, p = total ? done / total : 1;
    return '<div class="ring" role="img" aria-label="แก้เสร็จ ' + done + ' จาก ' + total + '"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="8"/><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (Cc * p).toFixed(1) + ' ' + Cc.toFixed(1) + '"/></svg><div class="ring-t"><span>' + done + '/' + total + '<small>แก้เสร็จ</small></span></div></div>';
  }
  function refreshBtn(cls) {
    return '<button class="ib ' + (cls || '') + '" data-act="refresh" aria-label="โหลดข้อมูลใหม่">' + (S.syncing ? '<span class="spin"></span>' : ic('refresh', 20)) + '</button>';
  }
  /* ---------- แถบเครื่องมือมุมขวาบน: ธีม · แจ้งเตือน · รีเฟรช ---------- */
  function toolsHtml() {
    var un = unread();
    return '<div class="hdr-tools no-print">' +
      (canSearch() ? '<button class="tb" data-act="pop-search" aria-label="ค้นหา (Ctrl+K)" title="ค้นหา (Ctrl+K)" aria-expanded="' + (S.pop === 'search') + '">' + ic('search', 20) + '</button>' : '') +
      '<button class="tb" data-act="pop-theme" aria-label="ปรับธีม" aria-expanded="' + (S.pop === 'theme') + '">' + ic(isDark() ? 'moon' : 'palette', 20) + '</button>' +
      '<button class="tb' + (un ? ' ring-bell' : '') + '" data-act="pop-notif" aria-label="การแจ้งเตือน ' + un + ' รายการใหม่" aria-expanded="' + (S.pop === 'notif') + '">' + ic('bell', 20) +
        (un ? '<span class="tb-badge">' + (un > 9 ? '9+' : un) + '</span>' : '') + '</button>' +
      '<button class="tb" data-act="refresh" aria-label="โหลดข้อมูลใหม่">' + (S.syncing ? '<span class="spin"></span>' : ic('refresh', 20)) + '</button></div>';
  }
  function popNotif() {
    var list = S.notifs.slice().sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    if (S.popTab === 'unread') list = list.filter(function (n) { return !n.read; });
    var un = unread(), hasTab = tabsFor(S.user.role).some(function (t) { return t[0] === 'notif'; });
    var h = '<div class="pop-h"><b>การแจ้งเตือน</b>' + (un ? '<button class="link" data-act="pop-readall">อ่านทั้งหมด</button>' : '') + '</div>' +
      '<div class="pop-tabs"><button data-act="pop-tab" data-v="all" aria-pressed="' + (S.popTab !== 'unread') + '">ทั้งหมด</button>' +
      '<button data-act="pop-tab" data-v="unread" aria-pressed="' + (S.popTab === 'unread') + '">ยังไม่อ่าน' + (un ? ' ' + un : '') + '</button></div>';
    if (!list.length) return h + '<div class="pop-empty">' + ic('bell', 36) + '<span>' + (S.popTab === 'unread' ? 'อ่านครบทุกรายการแล้ว' : 'ยังไม่มีการแจ้งเตือน') + '</span></div>';
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var newer = list.filter(function (n) { return (n.at || 0) >= today.getTime(); }), older = list.filter(function (n) { return (n.at || 0) < today.getTime(); });
    var item = function (n) {
      var ni = notifIcon(n.type);
      return '<button class="pn' + (n.read ? '' : ' unread') + '" data-act="pop-open" data-id="' + esc(n.id) + '"><span class="pn-ic ' + ni[1] + '">' + ic(ni[0], 22) + '</span>' +
        '<span class="pn-b"><b>' + esc(n.title) + '</b><span>' + esc(n.body) + '</span><time>' + ago(n.at) + '</time></span>' + (n.read ? '' : '<i class="pn-dot"></i>') + '</button>';
    };
    h += '<div class="pop-list">' + (newer.length ? '<div class="pop-sec">วันนี้</div>' + newer.slice(0, 30).map(item).join('') : '') +
      (older.length ? '<div class="pop-sec">ก่อนหน้านี้</div>' + older.slice(0, 40).map(item).join('') : '') + '</div>';
    if (hasTab) h += '<button class="pop-foot" data-act="pop-all">ดูการแจ้งเตือนทั้งหมด</button>';
    return h;
  }
  function popTheme() {
    var T = window.Theme, cur = T ? T.get() : { hex: '#6E4BC9', fx: true };
    var mode = document.documentElement.getAttribute('data-theme') || 'auto';
    var seg = [['light', 'sun', 'สว่าง'], ['dark', 'moon', 'มืด'], ['auto', 'monitor', 'ตามเครื่อง']];
    return '<div class="pop-h"><b>ธีมและสี</b></div><div class="mode-seg">' + seg.map(function (m) {
      return '<button data-act="mode-set" data-v="' + m[0] + '" aria-pressed="' + (mode === m[0]) + '">' + ic(m[1], 18) + '<span>' + m[2] + '</span></button>';
    }).join('') + '</div>' +
      '<div class="pop-lbl">สีธีม</div><div class="swatches pop-sw">' + (T ? T.presets.map(function (p) {
        return '<button class="swatch" style="background:' + p.hex + '" data-act="theme-pick" data-v="' + p.hex + '" aria-pressed="' + (p.hex.toLowerCase() === cur.hex.toLowerCase()) + '" title="' + esc(p.name) + '"></button>';
      }).join('') : '') + '</div>' +
      '<label class="color-row" style="margin:0 0 10px"><input type="color" id="themeColor" value="' + esc(cur.hex) + '"><span><b>เลือกสีเอง</b><br><small class="t-muted">' + esc(cur.hex.toUpperCase()) + (cur.school ? ' (สีของโรงเรียน)' : '') + '</small></span></label>' +
      '<button class="toggle" data-act="theme-fx" style="min-height:52px;margin-bottom:8px"><span><b>เอฟเฟคแสงสี</b></span><span class="sw' + (cur.fx ? ' on' : '') + '"></span></button>' +
      (cur.school ? '' : '<button class="btn btn-ghost btn-block" data-act="theme-reset" style="min-height:44px;font-size:14px">ใช้สีของโรงเรียน</button>');
  }
  /* ---------- ค้นหารวม (นักเรียน + รายการ 0 ร มส) ---------- */
  var GS_KEY = 'followup_recent_search';
  function canSearch() { return !!(S.user && S.user.role !== 'student'); }
  function gsRecent() { try { var r = JSON.parse(localStorage.getItem(GS_KEY) || '[]'); return r instanceof Array ? r.slice(0, 6) : []; } catch (e) { return []; } }
  function gsRemember(q) {
    q = String(q || '').trim(); if (q.length < 2) return;
    var r = gsRecent().filter(function (x) { return x !== q; }); r.unshift(q);
    try { localStorage.setItem(GS_KEY, JSON.stringify(r.slice(0, 6))); } catch (e) {}
  }
  function gsNorm(s) { return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' '); }
  function gsHit(text, toks) {
    var t = gsNorm(text);
    for (var i = 0; i < toks.length; i++) if (t.indexOf(toks[i]) < 0) return false;
    return true;
  }
  function gsMark(text, toks) {
    var out = esc(text);
    toks.forEach(function (k) {
      var ek = esc(k).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (ek) out = out.replace(new RegExp('(' + ek + ')(?![^<]*>)', 'gi'), '<mark>$1</mark>');
    });
    return out;
  }
  function gsStudents() {
    var map = {}, list = [];
    S.cases.forEach(function (c) {
      var m = map[c.sid];
      if (!m) { m = map[c.sid] = { sid: c.sid, name: c.studentName, cls: c.classroom || '', no: c.number || '', open: 0, total: 0, hold: !!c.hold, pv: c.pv }; list.push(m); }
      m.total++;
      if (c.status !== 'APPROVED') m.open++;
    });
    (S.students || []).forEach(function (s) {
      if (map[s.id]) return;
      map[s.id] = { sid: s.id, name: s.name, cls: s.cls, no: s.no, open: 0, total: 0, pv: s.pv }; list.push(map[s.id]);
    });
    return list;
  }
  function gsResults(q) {
    var toks = gsNorm(q).trim().split(' ').filter(function (x) { return x; });
    if (!toks.length) {
      var rc = gsRecent();
      return '<div class="gs-hint">' + ic('search', 30) + '<span>พิมพ์ชื่อนักเรียน เลขประจำตัว ห้อง หรือรายวิชา<br><small>ใช้หลายคำได้ เช่น <b>ม.2/1 คณิต</b></small></span></div>' +
        (rc.length ? '<div class="pop-sec">ค้นหาล่าสุด</div><div class="gs-chips">' + rc.map(function (x) { return '<button class="gs-chip" data-act="gs-q" data-v="' + esc(x) + '">' + ic('clock', 15) + esc(x) + '</button>'; }).join('') +
          '<button class="gs-chip gs-clear" data-act="gs-clear">ล้าง</button></div>' : '');
    }
    var stu = gsStudents().filter(function (s) { return gsHit(s.name + ' ' + s.sid + ' ' + s.cls, toks); })
      .sort(function (a, b) { return b.open - a.open || (a.cls < b.cls ? -1 : a.cls > b.cls ? 1 : (+a.no || 0) - (+b.no || 0)); });
    var cs = S.cases.filter(function (c) {
      return gsHit([c.studentName, c.sid, c.classroom, c.subjectName, c.subject, c.teacherName, c.type, chip(c).replace(/<[^>]+>/g, '')].join(' '), toks);
    }).sort(byUrg);
    if (!stu.length && !cs.length) return '<div class="pop-empty">' + ic('search', 36) + '<span>ไม่พบ "' + esc(q.trim()) + '"</span>' + (!S.students ? '<small class="t-muted">กำลังโหลดรายชื่อนักเรียนทั้งหมด</small>' : '') + '</div>';
    var h = '';
    if (stu.length) {
      h += '<div class="pop-sec">นักเรียน <small>' + stu.length + '</small></div>' + stu.slice(0, 6).map(function (s) {
        var sub = gsMark(s.cls, toks) + (s.no ? ' เลขที่ ' + esc(s.no) : '') + ' · ' + gsMark(s.sid, toks);
        var tag = s.hold ? '<span class="chip ch-hold">แขวน</span>' : (s.open ? '<span class="chip ch-warn">ค้าง ' + s.open + '</span>' : (s.total ? '<span class="chip ch-ok">แก้ครบ</span>' : ''));
        return '<button class="pn gs-r" data-k="s' + esc(s.sid) + '" data-act="gs-stu" data-v="' + esc(s.sid) + '">' + avatarHtml(s.sid, s.name, s.pv) +
          '<span class="pn-b"><b>' + gsMark(s.name, toks) + '</b><span>' + sub + '</span></span>' + tag + '</button>';
      }).join('') + (stu.length > 6 ? '<div class="gs-more">และอีก ' + (stu.length - 6) + ' คน พิมพ์ให้เจาะจงขึ้น</div>' : '');
    }
    if (cs.length) {
      h += '<div class="pop-sec">รายการ 0 ร มส <small>' + cs.length + '</small></div>' + cs.slice(0, 8).map(function (c) {
        return '<button class="pn gs-r" data-k="c' + esc(c.id) + '" data-act="gs-case" data-id="' + esc(c.id) + '"><span class="gs-stamp">' + typeStamp(c.type) + '</span>' +
          '<span class="pn-b"><b>' + gsMark(c.subjectName, toks) + ' · ' + gsMark(c.studentName, toks) + '</b><span>' + gsMark(c.classroom || '', toks) + ' · ' + gsMark(c.teacherName || '', toks) + '</span></span>' + chip(c) + '</button>';
      }).join('') + (cs.length > 8 ? '<div class="gs-more">และอีก ' + (cs.length - 8) + ' รายการ</div>' : '');
    }
    return h;
  }
  function popSearch() {
    return '<div class="gs-box">' + ic('search', 20) + '<input id="gsq" type="search" placeholder="ค้นหานักเรียน ห้อง รายวิชา" autocomplete="off" enterkeyhint="search" value="' + esc(S.gsq || '') + '">' +
      '<kbd class="gs-kbd">Esc</kbd></div><div id="gsres" class="gs-res">' + gsResults(S.gsq || '') + '</div>';
  }
  function openSearch() {
    if (!canSearch()) return;
    S.pop = 'search'; S.gsq = ''; renderMain(); renderPop(); loadStudents();
  }

  function renderPop() {
    var el = $('pop');
    if (!el) { el = document.createElement('div'); el.id = 'pop'; document.body.appendChild(el); }
    if (!S.pop || !S.user) { el.innerHTML = ''; el.className = ''; return; }
    var btn = document.querySelector('[data-act="pop-' + S.pop + '"]');
    if (!btn && S.pop !== 'search') { S.pop = null; el.innerHTML = ''; return; }
    var W = window.innerWidth, r = btn ? btn.getBoundingClientRect() : { bottom: 6, right: W / 2 + 190, width: 0 };
    var pos = W < 600 ? 'left:10px;right:10px;' : 'right:' + Math.max(10, W - r.right) + 'px;width:380px;';
    el.className = 'pop-on locked';
    el.innerHTML = '<div class="pop pop-' + S.pop + '" role="dialog" style="top:' + Math.round(r.bottom + 10) + 'px;' + pos + '">' +
      '<i class="pop-arrow" style="right:' + (W < 600 ? Math.max(14, W - r.right + r.width / 2 - 18) : r.width / 2 - 8) + 'px"></i>' + '<button class="pop-x" data-act="pop-close" aria-label="ปิด" title="ปิด">' + ic('x', 18) + '</button>' + (S.pop === 'notif' ? popNotif() : (S.pop === 'search' ? popSearch() : popTheme())) + '</div>';
    if (S.pop === 'search') { var gi = $('gsq'); if (gi && document.activeElement !== gi) { try { gi.focus(); } catch (e) {} } }
  }
  function heroHeader(title, sub, extra) {
    return '<header class="top hero">' + toolsHtml() + '<div class="top-t"><div class="greet">' + greet() + '</div><div class="top-h" style="font-size:22px">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + (extra || '') + '</div></header>';
  }
  function header(title, sub, right, back) {
    return '<header class="top">' + (back ? '<button class="ib" data-act="back" aria-label="ย้อนกลับ">' + ic('back') + '</button>' : '') +
      '<div class="top-t"><div class="top-h">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + '</div>' + (right || '') + '</header>';
  }
  function syncNote() {
    if (S.loadErr) return '<div class="banner bad" style="margin-bottom:14px">' + ic('alert') + '<div><b>โหลดข้อมูลล่าสุดไม่สำเร็จ</b><p>' + esc(S.loadErr) + ' ข้อมูลที่เห็นอาจไม่เป็นปัจจุบัน</p></div></div>';
    return '';
  }
  function loadingHtml() { return skeleton(4); }
  function actbar(btns, hint) {
    if (!btns) return '';
    return '<div class="actbar no-print">' + (hint ? '<div class="actbar-hint">' + hint + '</div>' : '') + '<div class="actbar-in">' + btns + '</div></div>';
  }
  function tallyHtml(cs, clickable) {
    var t = tally(cs);
    return '<div class="tally">' + TYPES.map(function (k) {
      var inner = typeStamp(k, true) + '<span class="tally-n">' + t[k] + '</span><span class="tally-l">' + TDESC[k] + '<br>ยังไม่แก้เสร็จ</span>';
      return clickable ? '<button class="tally-i tw-transition tw-duration-200 hover:tw--translate-y-1 hover:tw-shadow-[0_14px_30px_var(--glow)]" data-act="goto-filter" data-v="' + k + '">' + inner + '</button>' : '<div class="tally-i tw-transition tw-duration-200 hover:tw--translate-y-1">' + inner + '</div>';
    }).join('') + '</div>';
  }

  /* ---------- login & password ---------- */
  function pwField(name, label, auto, hint) {
    return '<label class="field"><span class="lbl">' + label + '</span><span class="pw-wrap"><input class="inp" type="password" name="' + name + '" autocomplete="' + auto + '" required>' +
      '<button type="button" class="pw-eye" data-act="eye" aria-label="แสดงรหัสผ่าน">' + ic('eye', 20) + '</button></span></label>' + (hint ? '<p class="hint">' + hint + '</p>' : '');
  }
  function vLogin() {
    return '<div class="login tw-relative tw-isolate">' + loginDeco() + '<div class="login-top">' + emblem() +
      '<div class="lg-school">' + esc(C.SCHOOL || 'โรงเรียนบ้านละลม') + '</div><h1 class="lg-h">' + esc(C.APP_NAME || 'ติดตามการแก้ 0 ร มส') + '</h1></div>' +
      '<div class="login-card"><div class="lg-stamps" aria-hidden="true">' + typeStamp('0') + typeStamp('ร') + typeStamp('มส') + '</div>' +
      '<form id="loginForm" novalidate>' +
      '<label class="field"><span class="lbl">เลขประจำตัวนักเรียน หรือชื่อผู้ใช้ครู</span><input class="inp" name="u" autocapitalize="off" autocorrect="off" autocomplete="username" required></label>' +
      pwField('p', 'รหัสผ่าน', 'current-password', '') +
      '<div id="lgErr" class="err" role="alert"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="lgBtn">เข้าสู่ระบบ</button></form>' +
      '<p class="demo-tag">ลืมรหัสผ่าน นักเรียนติดต่อครูที่ปรึกษา ครูติดต่องานวัดผล</p>' +
      '<a class="pub-link" href="./">' + ic('chart', 20) + 'กลับหน้าหลัก สถิติของโรงเรียน</a></div>' +
      '<p class="foot">' + FOOT + '</p></div>';
  }
  function loginDeco() {
    return '<div class="tw-pointer-events-none tw-absolute tw-inset-0 tw--z-10 tw-overflow-hidden" aria-hidden="true">' +
      '<div class="tw-absolute tw--left-20 tw-top-10 tw-h-64 tw-w-64 tw-rounded-full tw-bg-[var(--glow)] tw-blur-3xl tw-animate-blob"></div>' +
      '<div class="tw-absolute tw--right-16 tw-top-1/3 tw-h-72 tw-w-72 tw-rounded-full tw-bg-[var(--glow-2)] tw-blur-3xl tw-animate-blob" style="animation-delay:-5s"></div>' +
      '<div class="tw-absolute tw-bottom-0 tw-left-1/4 tw-h-56 tw-w-56 tw-rounded-full tw-bg-[var(--glow-3)] tw-blur-3xl tw-animate-blob" style="animation-delay:-9s"></div></div>';
  }
  function pwFormHtml(id) {
    return '<form id="' + id + '" novalidate>' +
      pwField('old', S.user && S.user.mustChangePw ? 'รหัสผ่านชั่วคราวที่ได้รับ' : 'รหัสผ่านเดิม', 'current-password', '') +
      pwField('n1', 'รหัสผ่านใหม่', 'new-password', 'อย่างน้อย 6 ตัวอักษร ห้ามเหมือนเลขประจำตัว') +
      pwField('n2', 'พิมพ์รหัสผ่านใหม่อีกครั้ง', 'new-password', '') +
      '<div class="err" role="alert" data-err></div>' +
      '<button class="btn btn-primary btn-block" type="submit">บันทึกรหัสผ่านใหม่</button></form>';
  }
  function vMustChange() {
    return '<div class="login"><div class="login-top">' + emblem() + '<div class="lg-school">' + esc(S.user.displayName) + '</div><h1 class="lg-h">ตั้งรหัสผ่านใหม่</h1></div>' +
      '<div class="login-card"><p class="sh-s">เพื่อความปลอดภัย ตั้งรหัสผ่านของตัวเองก่อนเริ่มใช้งาน ทำแค่ครั้งนี้ครั้งเดียว</p>' + pwFormHtml('mustForm') +
      '<button class="btn btn-ghost btn-block" data-act="logout" style="margin-top:10px">ออกจากระบบ</button></div><p class="foot">' + FOOT + '</p></div>';
  }

  /* ---------- student ---------- */
  function vStudentHome() {
    var u = S.user, all = S.cases.slice().sort(byUrg);
    var held = all.filter(function (c) { return c.status === 'HOLD'; });
    var cs = all.filter(function (c) { return c.status !== 'HOLD'; });
    var open = cs.filter(isOpen), done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length;
    var msg = !cs.length ? ['ไม่มีวิชาที่ต้องแก้', 'เยี่ยมมาก รักษาผลการเรียนแบบนี้ไว้'] : (!open.length ? ['แก้ครบทุกวิชาแล้ว', 'เยี่ยมมาก รักษาผลการเรียนแบบนี้ไว้'] : (done === 0 ? ['เริ่มทีละวิชา เดี๋ยวก็ครบ', 'เหลือ ' + open.length + ' วิชา ทำวิชาที่ใกล้ครบกำหนดก่อน'] : ['อีกนิดเดียว สู้ ๆ', 'เหลืออีก ' + open.length + ' วิชา']));
    var h = heroHeader(esc(u.firstName), esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' ' + term(),
      S.loaded ? '<div class="hero-row">' + ring(done, cs.length) + '<div class="hero-msg"><b>' + msg[0] + '</b><span>' + msg[1] + '</span></div></div>' : '');
    h += '<main class="main">' + syncNote();
    if (!S.loaded) return h + loadingHtml() + '</main>';
    if (held.length) h += '<div class="banner info" style="margin:0 0 14px">' + ic('clock') + '<div><b>' + (HOLD_LABEL[held[0].hold] || 'แขวนการติดตาม') + ' ' + held.length + ' วิชา</b><p>' + esc(held[0].holdNote || 'ติดต่อครูที่ปรึกษาหากมีข้อสงสัย') + '</p></div></div>';
    var next = null;
    for (var i = 0; i < cs.length; i++) { if (cs[i].status === 'OPEN' || cs[i].status === 'DOING') { next = cs[i]; break; } }
    if (next) h += focusCard(next);
    else if (open.length) h += '<div class="banner info">' + ic('clock') + '<div><b>ส่งครบทุกวิชาแล้ว</b><p>รอครูตรวจและงานวัดผลอนุมัติ ระบบจะแจ้งเตือนเมื่อมีผล</p></div></div>';
    else h += '<div class="banner ok">' + ic('seal') + '<div><b>ไม่มีวิชาที่ต้องแก้</b><p>เยี่ยมมาก รักษาผลการเรียนแบบนี้ต่อไป</p></div></div>';
    if (cs.length) h += '<div class="sec"><h2>ทุกวิชาที่ต้องแก้</h2></div><div class="group">' + cs.map(function (c) { return caseRow(c, false); }).join('') + '</div>';
    return h + '</main>';
  }
  function focusCard(c) {
    var di = dueInfo(c), doneN = c.tasks.filter(function (x) { return x.done; }).length;
    var btn = c.status === 'OPEN'
      ? '<button class="btn btn-primary btn-block" data-act="ack" data-id="' + esc(c.id) + '">' + ic('check') + 'รับทราบและเริ่มแก้</button>'
      : '<button class="btn btn-primary btn-block" data-act="open-case" data-id="' + esc(c.id) + '">' + (c.rejectNote ? 'แก้หลักฐานตามที่ครูขอ' : 'ทำต่อ') + '</button>';
    return '<section class="focus" style="margin-top:0" aria-label="วิชาที่ควรทำก่อน"><div class="focus-k">ควรทำวิชานี้ก่อน</div>' +
      '<div class="focus-head">' + stamp(c, true) + '<div><div class="focus-sub">' + esc(c.subjectName) + '</div><div class="focus-meta">' + esc(c.subject) + ' ' + esc(c.teacherName) + '</div></div></div>' +
      '<div class="due t-' + di.k + '">' + ic('clock', 20) + di.t + '</div>' + stepsHtml(c) +
      '<div class="focus-meta" style="margin-top:12px">ทำแล้ว ' + doneN + ' จาก ' + c.tasks.length + ' ข้อ</div>' + btn + '</section>';
  }

  /* ---------- case detail (all roles) ---------- */
  function vCase(c) {
    if (!c) return header('ไม่พบรายการ', '', '', true) + '<main class="main"><div class="empty">รายการนี้ถูกลบหรือไม่มีสิทธิ์ดู</div></main>';
    var role = S.user.role, di = dueInfo(c);
    var stuEdit = role === 'student' && (c.status === 'DOING' || c.status === 'OPEN');
    var h = header(esc(c.subjectName), role === 'student' ? esc(c.subject) + ' ' + esc(c.teacherName) : esc(c.studentName) + ' ' + esc(c.classroom), refreshBtn(''), true);
    h += '<main class="main">';
    h += '<div class="hero">' + stamp(c, true) + '<div><div class="hero-t">' + typeName(c.type) + '</div><div class="hero-s">' + esc(c.cause || '-') + '</div>' +
      '<div class="hero-s">' + (c.type !== 'ร' ? 'แก้ครั้งที่ ' + c.attempt + ' จาก ' + setting('maxAttempts', 2) + ' ครั้ง ' : '') + 'ผลหลังแก้สูงสุด ' + capOf(c) + '</div></div></div>';
    if (c.rejectNote && c.status === 'DOING') h += '<div class="banner bad">' + ic('alert') + '<div><b>ครูขอให้แก้หลักฐาน</b><p>' + esc(c.rejectNote) + '</p></div></div>';
    if (c.status === 'HOLD') h += '<div class="banner info">' + ic('clock') + '<div><b>' + (HOLD_LABEL[c.hold] || 'แขวนการติดตาม') + '</b><p>' + esc(c.holdNote || 'งานวัดผลหยุดการติดตามรายการนี้ไว้') + '</p></div></div>';
    if (c.status === 'REPEAT') h += '<div class="banner bad">' + ic('alert') + '<div><b>ต้องลงทะเบียนเรียนซ้ำ</b><p>' + (c.type === 'มส' && c.ms !== null ? 'เวลาเรียน ' + esc(c.ms) + '% ต่ำกว่าเกณฑ์' : 'แก้ครบจำนวนครั้งแล้วยังไม่ผ่าน') + ' ติดต่องานวัดผลเพื่อวางแผนเรียนซ้ำ</p></div></div>';
    if (c.status === 'APPROVED') h += '<div class="banner ok">' + ic('seal') + '<div><b>แก้เสร็จแล้ว ได้ระดับผลการเรียน ' + esc(c.grade) + '</b><p>งานวัดผลบันทึกผลแล้ว</p></div></div>';

    h += '<div class="sec"><h2>สถานะ</h2><span class="t-' + di.k + '" style="font-size:14px;font-weight:600">' + di.t + '</span></div>';
    h += '<div class="group" style="padding:16px">' + (stepsHtml(c) || '<div class="t-muted" style="font-size:14px">ปิดรายการแล้ว</div>') + '</div>';

    var doneN = c.tasks.filter(function (x) { return x.done; }).length;
    h += '<div class="sec"><h2>สิ่งที่ต้องทำ</h2><span class="t-muted" style="font-size:14px">' + doneN + '/' + c.tasks.length + '</span></div><div class="group">';
    c.tasks.forEach(function (tk, i) {
      h += '<button class="task' + (tk.done ? ' on' : '') + '" data-act="task" data-id="' + esc(c.id) + '" data-i="' + i + '"' + (stuEdit ? '' : ' disabled') + ' aria-pressed="' + !!tk.done + '"><span class="box">' + ic('check', 18) + '</span><span class="tt">' + esc(tk.t) + '</span></button>';
    });
    h += '</div>';

    h += evidenceHtml(c, stuEdit);
      '<span>' + (role === 'student' ? 'การถ่ายรูปและแนบไฟล์หลักฐานจะเปิดใช้ในขั้นถัดไป ระหว่างนี้ทำตามรายการด้านบนได้เลย' : 'นักเรียนจะแนบหลักฐานได้ในขั้นถัดไป') + '</span></div></div>';

    if (stuEdit) h += '<div class="sec"><h2>ข้อความถึงครู</h2><span class="t-muted" style="font-size:13px" id="noteState"></span></div><textarea class="note" data-note="' + esc(c.id) + '" maxlength="500" placeholder="ไม่บังคับ เช่น ส่งใบงานครบ 2 บทแล้วครับ">' + esc(c.note) + '</textarea>';
    else if (c.note) h += '<div class="sec"><h2>ข้อความจากนักเรียน</h2></div><div class="group" style="padding:14px 16px">' + esc(c.note) + '</div>';

    if (role !== 'student') {
      h += '<div class="sec"><h2>ข้อมูลนักเรียน</h2><button class="link" data-act="open-student" data-v="' + esc(c.sid) + '">ดูทุกวิชา</button></div>';
      h += '<div class="group"><dl class="kv"><dt>เลขประจำตัว</dt><dd>' + esc(c.sid) + '</dd><dt>ชั้น เลขที่</dt><dd>' + esc(c.classroom) + ' เลขที่ ' + esc(c.number) + '</dd><dt>ผู้ปกครอง</dt><dd>' + esc(c.parentName || '-') + '</dd><dt>LINE ผู้ปกครอง</dt><dd>' + (c.parentLine ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</dd><dt>ครูผู้สอน</dt><dd>' + esc(c.teacherName) + '</dd>' + (c.ms !== null ? '<dt>เวลาเรียน</dt><dd>' + esc(c.ms) + '%</dd>' : '') + '</dl></div>';
    }

    h += '<div class="sec"><h2>ประวัติ</h2></div><div class="group">';
    var log = S.logs[c.id];
    if (!log) h += '<div class="soon" style="padding:18px"><span class="spin"></span></div>';
    else if (!log.length) h += '<div class="empty">ยังไม่มีประวัติ</div>';
    else h += '<ul class="log">' + log.slice(0, 10).map(function (l) {
      return '<li><time>' + thDate(l.at) + '<br>' + thTime(l.at) + '</time><span>' + esc(l.text) + '<small>' + esc(l.by) + '</small></span></li>';
    }).join('') + '</ul>';
    h += '</div></main>';
    return h + caseActions(c);
  }
  function curEvidence(c) {
    return (S.ev[c.id] || []).filter(function (e) { return e.attempt === c.attempt; });
  }
  function evidenceHtml(c, editable) {
    var list = S.ev[c.id], up = S.uploading[c.id] || 0;
    var maxMB = setting('maxUploadMB', 10);
    var h = '<div class="sec"><h2>หลักฐาน</h2><span class="t-muted" style="font-size:13px">รูปภาพ หรือ PDF ไม่เกิน ' + esc(maxMB) + ' MB</span></div>';
    if (!list) return h + '<div class="group"><div class="soon" style="padding:18px"><span class="spin"></span></div></div>';
    var cur = curEvidence(c), old = list.filter(function (e) { return e.attempt !== c.attempt; });
    if (!cur.length && !up) {
      h += '<div class="group"><div class="empty">' + (S.user.role === 'student' ? (editable ? 'ยังไม่ได้แนบ ถ่ายรูปงานหรือเลือกไฟล์จากเครื่องได้เลย' : 'ไม่มีไฟล์ในครั้งนี้') : 'นักเรียนยังไม่ได้แนบหลักฐาน') + '</div></div>';
    } else {
      h += '<div class="ev">' + cur.map(function (e) { return evTile(e, editable && e.status !== 'ACCEPTED'); }).join('');
      for (var i = 0; i < up; i++) h += '<div class="ev-item"><div class="ev-open" style="display:grid;place-items:center;position:absolute;inset:0"><span class="spin"></span></div><span class="ev-cap">กำลังอัปโหลด</span></div>';
      h += '</div>';
    }
    if (editable) h += '<div class="ev-add"><button class="btn btn-ghost" data-act="add-cam" data-id="' + esc(c.id) + '">' + ic('camera') + 'ถ่ายรูป</button><button class="btn btn-ghost" data-act="add-pick" data-id="' + esc(c.id) + '">' + ic('image') + 'เลือกไฟล์</button></div>';
    if (old.length) h += '<details class="old-ev"><summary>ไฟล์ของการแก้ครั้งก่อน ' + old.length + ' ไฟล์</summary><div class="ev" style="margin-top:10px">' + old.map(function (e) { return evTile(e, false); }).join('') + '</div></details>';
    return h;
  }
  function evTile(e, removable) {
    var inner = e.thumb ? '<img src="' + e.thumb + '" alt="' + esc(e.name) + '">' : '<span>' + ic(e.mime === 'application/pdf' ? 'file' : 'image', 30) + '<br>' + (e.mime === 'application/pdf' ? 'PDF' : 'รูปภาพ') + '</span>';
    var badge = e.status === 'ACCEPTED' ? '<span class="ev-badge ok">' + ic('check', 14) + '</span>' : (e.status === 'RETURNED' || e.status === 'REJECTED' ? '<span class="ev-badge bad">' + ic('x', 14) + '</span>' : '');
    return '<div class="ev-item"><button class="ev-open" data-act="ev-view" data-e="' + esc(e.id) + '" data-n="' + esc(e.name) + '" aria-label="เปิดดู ' + esc(e.name) + '">' + inner + '</button>' + badge + '<span class="ev-cap">' + esc(e.name) + '</span>' +
      (removable ? '<button class="ev-rm" data-act="ev-rm" data-e="' + esc(e.id) + '" data-id="' + esc(e.caseId) + '" aria-label="ลบ ' + esc(e.name) + '">' + ic('x', 16) + '</button>' : '') + '</div>';
  }
  function caseActions(c) {
    var role = S.user.role, id = esc(c.id);
    if (c.status === 'HOLD') return role === 'student' ? '' : actbar('<button class="btn btn-ghost" data-act="open-report" data-v="' + esc(c.sid) + '">' + ic('printer', 20) + 'พิมพ์รายงานนักเรียน</button>');
    if (role === 'student') {
      if (c.status === 'OPEN') return actbar('<button class="btn btn-primary" data-act="ack" data-id="' + id + '">' + ic('check') + 'รับทราบและเริ่มแก้</button>');
      if (c.status === 'DOING') {
        var n = curEvidence(c).length, busy = (S.uploading[c.id] || 0) > 0;
        return actbar('<button class="btn btn-primary" data-act="submit" data-id="' + id + '"' + (n && !busy ? '' : ' disabled') + '>' + ic('send') + 'ส่งให้ครูตรวจ' + (n ? ' (' + n + ' ไฟล์)' : '') + '</button>', busy ? 'รออัปโหลดให้เสร็จก่อน' : (n ? '' : 'แนบหลักฐานอย่างน้อย 1 ไฟล์ก่อนส่ง'));
      }
      if (c.status === 'SUBMITTED') return actbar('<button class="btn btn-ghost" disabled>ส่งแล้ว ครูจะตรวจภายใน 1–2 วันทำการ</button>');
      if (c.status === 'PASSED') return actbar('<button class="btn btn-ghost" disabled>ผ่านแล้ว รองานวัดผลอนุมัติ</button>');
      return '';
    }
    var active = c.status === 'OPEN' || c.status === 'DOING';
    if (isOwner(c) && c.status === 'SUBMITTED') return actbar('<button class="btn btn-ghost" data-act="reject-open" data-id="' + id + '">ส่งกลับให้แก้</button><button class="btn btn-primary" data-act="grade-open" data-id="' + id + '">ให้ผลการแก้</button>');
    if ((role === 'measure' || role === 'admin') && c.status === 'PASSED') return actbar('<button class="btn btn-primary" data-act="approve" data-id="' + id + '">' + ic('seal') + 'อนุมัติผล ได้ระดับ ' + esc(c.grade) + '</button>');
    if (isOwner(c) && active) return actbar('<button class="btn btn-ghost" data-act="extend" data-id="' + id + '">' + ic('calendar', 20) + 'เลื่อน 7 วัน</button><button class="btn btn-ok" data-act="remind" data-id="' + id + '">' + ic('bell', 20) + 'แจ้งเตือน</button>');
    if (active) return actbar('<button class="btn btn-ok" data-act="remind" data-id="' + id + '">' + ic('bell', 20) + 'แจ้งเตือนนักเรียน</button>', role === 'teacher' ? 'คุณเป็นครูที่ปรึกษา ผลการแก้ให้ครูผู้สอนเป็นผู้บันทึก' : '');
    return actbar('<button class="btn btn-ghost" data-act="open-report" data-v="' + esc(c.sid) + '">' + ic('printer', 20) + 'พิมพ์รายงานนักเรียน</button>');
  }

  /* ---------- teacher ---------- */
  function vTeacherHome() {
    var u = S.user, cs = S.cases;
    var review = cs.filter(function (c) { return c.status === 'SUBMITTED' && isOwner(c); });
    var hot = cs.filter(function (c) { return (c.status === 'OPEN' || c.status === 'DOING') && c.due && daysLeft(c.due) <= 3; }).sort(byUrg);
    var lateN = cs.filter(isOverdue).length;
    var summary = !S.loaded ? 'กำลังโหลดข้อมูล' : (review.length || lateN ? 'มีงานรอตรวจ ' + review.length + ' ชิ้น' + (lateN ? ' เลยกำหนด ' + lateN + ' รายการ' : '') : 'วันนี้ไม่มีงานค้าง');
    var h = heroHeader(esc(u.displayName), esc(u.department || 'ครูผู้สอน') + (u.advisorClass ? ' ที่ปรึกษา ' + esc(u.advisorClass) : ''), '<div class="hero-msg" style="margin-top:12px"><b>' + summary + '</b></div>');
    h += '<main class="main">' + syncNote();
    if (!S.loaded) return h + loadingHtml() + '</main>';
    if (!S.subjects.length && u.role === 'teacher') h += '<div class="banner info" style="margin-bottom:14px">' + ic('alert') + '<div><b>ยังไม่มีรายวิชาที่คุณสอน</b><p>แจ้งงานวัดผลให้เพิ่มรายวิชาในชีต Subjects โดยใส่ชื่อผู้ใช้ ' + esc(u.username) + ' ในช่อง teacherId</p></div></div>';
    h += tallyHtml(cs, true);
    h += '<div class="sec"><h2>รอตรวจหลักฐาน ' + review.length + '</h2></div><div class="group">' + (review.length ? review.map(function (c) { return caseRow(c, true); }).join('') : '<div class="empty">ไม่มีงานรอตรวจ</div>') + '</div>';
    h += '<div class="sec"><h2>เลยกำหนดและใกล้ครบ</h2></div><div class="group">';
    if (hot.length) h += hot.map(function (c) { return '<div class="row-split">' + caseRow(c, true) + '<button class="mini" data-act="remind" data-id="' + esc(c.id) + '">' + ic('bell', 18) + 'เตือน</button></div>'; }).join('');
    else h += '<div class="empty">ไม่มีรายการใกล้ครบกำหนด</div>';
    h += '</div></main>';
    if (S.subjects.length) h += '<button class="fab no-print" data-act="new-case">' + ic('plus') + 'บันทึก 0 ร มส</button>';
    return h;
  }
  function passFilter(c, f) {
    if (f === 'all') return true;
    if (f === 'adv') return !!S.user.advisorClass && c.classroom === S.user.advisorClass;
    if (f === 'mine') return c.teacher === S.user.id;
    if (f === 'm1' || f === 'm2' || f === 'm3') return level(c.classroom) === +f.charAt(1);
    if (f === '0' || f === 'ร' || f === 'มส') return isOpen(c) && c.type === f;
    if (f === 'late') return isOverdue(c);
    if (f === 'review') return c.status === 'SUBMITTED';
    if (f === 'hold') return c.status === 'HOLD';
    return true;
  }
  function studentListHtml() {
    var q = S.q.trim().toLowerCase(), groups = {}, order = [];
    S.cases.forEach(function (c) {
      if (!passFilter(c, S.filter)) return;
      if (q && (c.studentName + ' ' + c.sid + ' ' + c.classroom + ' ' + c.subjectName).toLowerCase().indexOf(q) < 0) return;
      if (!groups[c.sid]) { groups[c.sid] = []; order.push(c.sid); }
      groups[c.sid].push(c);
    });
    order.sort(function (a, b) {
      var A = groups[a][0], B = groups[b][0];
      return A.classroom === B.classroom ? (+A.number || 0) - (+B.number || 0) : (A.classroom < B.classroom ? -1 : 1);
    });
    if (!order.length) return '<div class="group"><div class="empty">' + (S.cases.length ? 'ไม่พบนักเรียนตามเงื่อนไขนี้ ลองเลือก ทั้งหมด หรือพิมพ์ชื่อใหม่' : 'ยังไม่มีนักเรียนที่ติด 0 ร มส กดปุ่มบันทึกด้านล่างเพื่อเริ่ม') + '</div></div>';
    return '<div class="group cols">' + order.map(function (sid) {
      var list = groups[sid], s = list[0], open = list.filter(isOpen), late = list.filter(isOverdue).length;
      return '<button class="row" data-k="' + esc(sid) + '" data-act="open-student" data-v="' + esc(sid) + '">' + avatarHtml(sid, s.firstName || s.studentName, s.pv) + '<span class="row-main"><span class="row-t">' + esc(s.studentName) + '</span>' +
        '<span class="row-s">' + esc(s.classroom) + ' เลขที่ ' + esc(s.number) + '</span><span class="row-s">' + (open.length ? '<span class="chip ch-warn">ค้าง ' + open.length + ' วิชา</span>' : '<span class="chip ch-ok">แก้ครบแล้ว</span>') + (late ? '<span class="chip ch-bad">เลยกำหนด ' + late + '</span>' : '') + '</span></span>' +
        '<span class="stack">' + open.slice(0, 3).map(function (c) { return stamp(c); }).join('') + '</span></button>';
    }).join('') + '</div>';
  }
  function vTeacherStudents() {
    var u = S.user;
    var f = [['all', 'ทั้งหมด']];
    if (u.role === 'teacher') f.push(['mine', 'วิชาที่ฉันสอน']);
    if (u.advisorClass) f.push(['adv', 'ห้องที่ปรึกษา ' + u.advisorClass]);
    f = f.concat([['late', 'เลยกำหนด'], ['review', 'รอตรวจ'], ['hold', 'แขวน/ถอนชื่อ'], ['0', 'ติด 0'], ['ร', 'ติด ร'], ['มส', 'ติด มส'], ['m1', 'ม.1'], ['m2', 'ม.2'], ['m3', 'ม.3']]);
    var h = '<header class="top col"><div style="display:flex;align-items:center;gap:10px"><div class="top-h" style="flex:1">' + (u.role === 'teacher' ? 'นักเรียน' : 'ติดตามนักเรียน') + '</div><button class="ib" style="width:auto;padding:0 12px;font-size:14px;font-weight:600;display:flex;align-items:center;gap:6px" data-act="export-xlsx" data-v="filter" aria-label="ส่งออก Excel">' + ic('file', 18) + 'Excel</button>' + refreshBtn('') + '</div><label class="search">' + ic('search', 20) + '<input id="q" type="search" placeholder="ค้นหาชื่อ เลขประจำตัว ห้อง หรือวิชา" value="' + esc(S.q) + '" aria-label="ค้นหานักเรียน"></label></header>';
    h += '<main class="main" style="padding-top:4px">' + (u.role === 'teacher' && u.advisorClass ? '<button class="banner info adv-sum" data-act="sum-open" data-v="class">' + ic('printer') + '<div><b>รายงานสรุปห้อง ' + esc(u.advisorClass) + '</b><p>สรุปนักเรียนที่ติด 0 ร มส วิชาที่ค้าง และสถานะ พร้อมพิมพ์</p></div>' + ic('chev', 20) + '</button>' : '') + '<div class="chips" role="group" aria-label="ตัวกรอง">' + f.map(function (x) {
      return '<button class="fchip" data-act="filter" data-v="' + esc(x[0]) + '" aria-pressed="' + (S.filter === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div><div id="slist" style="margin-top:14px">' + (S.loaded ? studentListHtml() : loadingHtml()) + '</div></main>';
    if (S.subjects.length) h += '<button class="fab no-print" data-act="new-case">' + ic('plus') + 'บันทึก 0 ร มส</button>';
    return h;
  }
  function vStudent(sid) {
    var cs = S.cases.filter(function (c) { return c.sid === sid; }).sort(byUrg);
    var s = cs[0] || {};
    var h = header(esc(s.studentName || sid), esc(s.classroom || '') + ' เลขที่ ' + esc(s.number || '-') + ' เลขประจำตัว ' + esc(sid), '', true);
    h += '<main class="main"><div class="group stu-card">' + avatarHtml(sid, s.firstName || s.studentName || sid, s.pv, 'av-xl') + '<div><b>' + esc(s.studentName || sid) + '</b><span>' + esc(s.classroom || '') + ' เลขที่ ' + esc(s.number || '-') + '</span><br><span>ครูที่ปรึกษา ' + esc(s.advisorName || '-') + '</span></div></div>' +
      '<div class="group"><dl class="kv"><dt>ผู้ปกครอง</dt><dd>' + esc(s.parentName || '-') + '</dd><dt>LINE ผู้ปกครอง</dt><dd>' + (s.parentLine ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</dd></dl></div>';
    h += '<div class="sec"><h2>รายวิชา ' + cs.length + '</h2></div><div class="group">' + (cs.length ? cs.map(function (c) { return caseRow(c, false); }).join('') : '<div class="empty">ไม่มีรายการ</div>') + '</div></main>';
    var btns = '<button class="btn btn-ghost" data-act="open-report" data-v="' + esc(sid) + '">' + ic('printer', 20) + 'พิมพ์รายงาน</button>';
    if (S.subjects.length) btns += '<button class="btn btn-primary" data-act="new-case" data-v="' + esc(sid) + '">' + ic('plus', 20) + 'บันทึกเพิ่ม</button>';
    return h + actbar(btns);
  }

  /* ---------- measure ---------- */
  function vMeasureHome() {
    var cs = S.cases, done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length;
    var pend = cs.filter(function (c) { return c.status === 'PASSED'; }).length;
    var late = cs.filter(isOverdue).sort(byUrg);
    var h = heroHeader('ภาพรวมทั้งโรงเรียน', term(), S.loaded ? '<div class="hero-row">' + ring(done, cs.length) + '<div class="hero-msg"><b>' + (pend ? 'รออนุมัติ ' + pend + ' รายการ' : 'ไม่มีรายการรออนุมัติ') + '</b><span>' + (late.length ? 'เลยกำหนด ' + late.length + ' รายการ' : 'ไม่มีรายการเลยกำหนด') + '</span></div></div>' : '');
    h += '<main class="main">' + syncNote();
    if (!S.loaded) return h + loadingHtml() + '</main>';
    if (pend) h += '<button class="banner info" style="width:100%;border:0;text-align:left;margin:0 0 14px" data-act="tab" data-v="approve">' + ic('seal') + '<div><b>มีผลรออนุมัติ ' + pend + ' รายการ</b><p>แตะเพื่อตรวจและอนุมัติ</p></div></button>';
    h += tallyHtml(cs, false);
    h += '<div class="sec"><h2>ความคืบหน้ารายระดับชั้น</h2><span class="t-muted" style="font-size:14px">แก้เสร็จ ' + done + '/' + cs.length + '</span></div><div class="group bars">';
    [1, 2, 3].forEach(function (lv) {
      var a = cs.filter(function (c) { return level(c.classroom) === lv; });
      var d = a.filter(function (c) { return c.status === 'APPROVED'; }).length;
      var pct = a.length ? Math.round(d * 100 / a.length) : 0;
      h += '<div class="lvl"><span>ม.' + lv + '</span><div class="bar" role="img" aria-label="แก้เสร็จ ' + pct + '%"><i style="width:' + pct + '%"></i></div><b>' + d + '/' + a.length + '</b></div>';
    });
    h += '</div><div class="sec"><h2>เลยกำหนด ' + late.length + '</h2></div><div class="group">' + (late.length ? late.map(function (c) {
      return '<div class="row-split">' + caseRow(c, true) + '<button class="mini" data-act="remind" data-id="' + esc(c.id) + '">' + ic('bell', 18) + 'เตือน</button></div>';
    }).join('') : '<div class="empty">ไม่มีรายการเลยกำหนด</div>') + '</div></main>';
    return h;
  }
  function vApprove() {
    var list = S.cases.filter(function (c) { return c.status === 'PASSED'; }).sort(function (a, b) { return (a.upd || 0) - (b.upd || 0); });
    var h = header('อนุมัติผลการแก้', 'ครูผู้สอนให้ผ่านแล้ว รอบันทึกผล', refreshBtn(''));
    h += '<main class="main">' + syncNote();
    if (!S.loaded) return h + loadingHtml() + '</main>';
    if (!list.length) return h + '<div class="group"><div class="soon">' + emptyIc('seal', 32) + '<b>ไม่มีรายการรออนุมัติ</b><span>เมื่อครูตรวจหลักฐานและให้ผ่านแล้วจะขึ้นที่นี่</span></div></div></main>';
    h += '<button class="btn btn-primary btn-block" data-act="approve-all" style="margin-bottom:14px">' + ic('seal') + 'อนุมัติทั้งหมด ' + list.length + ' รายการ</button><div class="group">';
    h += list.map(function (c) { return '<div class="row-split">' + caseRow(c, true) + '<button class="mini" data-act="approve" data-id="' + esc(c.id) + '">' + ic('check', 18) + 'อนุมัติ</button></div>'; }).join('');
    return h + '</div></main>';
  }
  function classesOf(cs) {
    var out = [];
    cs.forEach(function (c) { if (c.classroom && out.indexOf(c.classroom) < 0) out.push(c.classroom); });
    return out.sort();
  }

  /* ---------- รายงานสรุป: ภาพรวมโรงเรียน / รายห้อง ---------- */
  function sumStat(cs) {
    var o = { total: cs.length, done: 0, review: 0, doing: 0, repeat: 0, hold: 0, late: 0, stu: 0, stuDone: 0, t: { '0': [0, 0], 'ร': [0, 0], 'มส': [0, 0] } };
    var by = {};
    cs.forEach(function (c) {
      var st = c.status;
      if (st === 'APPROVED') o.done++; else if (st === 'REPEAT') o.repeat++; else if (st === 'HOLD') o.hold++;
      else if (st === 'SUBMITTED' || st === 'PASSED') o.review++; else o.doing++;
      if (isOverdue(c)) o.late++;
      if (o.t[c.type]) { o.t[c.type][0]++; if (st === 'APPROVED') o.t[c.type][1]++; }
      by[c.sid] = by[c.sid] || { n: 0, open: 0 }; by[c.sid].n++; if (isOpen(c)) by[c.sid].open++;
    });
    Object.keys(by).forEach(function (k) { o.stu++; if (!by[k].open) o.stuDone++; });
    o.pct = o.total ? Math.round(o.done * 100 / o.total) : 0;
    return o;
  }
  function pctBar(p) { return '<div class="sm-pb"><i style="width:' + p + '%"></i><span>' + p + '%</span></div>'; }
  function sumHead(title, sub) {
    var src = logoSrc();
    return '<div class="p-head">' + (src ? '<img class="p-logo" src="' + esc(src) + '" alt="">' : emblem()) + '<h3>' + esc(title) + '</h3>' +
      (sub ? '<p><b>' + esc(sub) + '</b></p>' : '') + '<p>' + esc(setting('schoolName', 'โรงเรียนบ้านละลม')) + ' ' + esc(setting('areaName', '')) + '</p><p>' + term() + '</p></div>';
  }
  function sumKpi(o, roster) {
    var k = [
      ['นักเรียนที่ติด 0 ร มส', o.stu + ' คน', roster ? 'จาก ' + roster + ' คน (' + Math.round(o.stu * 100 / roster) + '%)' : 'แก้ครบแล้ว ' + o.stuDone + ' คน', ''],
      ['รายการทั้งหมด', o.total + ' รายการ', '0: ' + o.t['0'][0] + '  ร: ' + o.t['ร'][0] + '  มส: ' + o.t['มส'][0], ''],
      ['แก้เสร็จแล้ว', o.done + ' รายการ', 'คิดเป็น ' + o.pct + '%', 'ok'],
      ['กำลังแก้', o.doing + ' รายการ', 'รอตรวจ/อนุมัติ ' + o.review + ' รายการ', 'warn'],
      ['เลยกำหนด', o.late + ' รายการ', 'ต้องติดตามเร่งด่วน', o.late ? 'bad' : ''],
      ['เรียนซ้ำ / แขวน', o.repeat + ' / ' + o.hold, 'ไม่นับเป็นค้างแก้', '']
    ];
    return '<div class="sm-kpi">' + k.map(function (x) { return '<div class="sm-k ' + x[3] + '"><small>' + x[0] + '</small><b>' + x[1] + '</b><span>' + esc(x[2]) + '</span></div>'; }).join('') + '</div>' +
      '<div class="sm-big"><span>ความสำเร็จในการแก้ผลการเรียน</span>' + pctBar(o.pct) + '</div>';
  }
  function sumTypeTbl(o) {
    var rows = [['0', 'ไม่ผ่านเกณฑ์'], ['ร', 'รอผลการเรียน (ค้างงาน/ขาดสอบ)'], ['มส', 'ไม่มีสิทธิ์สอบ (เวลาเรียนไม่ถึง 80%)']];
    return '<h4 class="sm-h">1. แยกตามประเภทผลการเรียน</h4><div class="tbl-wrap"><table class="p-tbl sm-tbl"><thead><tr><th>ประเภท</th><th>ความหมาย</th><th>ทั้งหมด</th><th>แก้เสร็จ</th><th>ยังไม่เสร็จ</th><th style="width:28%">ร้อยละที่แก้เสร็จ</th></tr></thead><tbody>' +
      rows.map(function (r) { var a = o.t[r[0]]; return '<tr><td><b>' + r[0] + '</b></td><td class="l">' + r[1] + '</td><td>' + a[0] + '</td><td>' + a[1] + '</td><td>' + (a[0] - a[1]) + '</td><td>' + pctBar(a[0] ? Math.round(a[1] * 100 / a[0]) : 0) + '</td></tr>'; }).join('') +
      '<tr class="sm-tot"><td colspan="2">รวม</td><td>' + o.total + '</td><td>' + o.done + '</td><td>' + (o.total - o.done) + '</td><td>' + pctBar(o.pct) + '</td></tr></tbody></table></div>';
  }
  function sumGroupTbl(no, title, head, groups) {
    var h = '<h4 class="sm-h">' + no + '. ' + title + '</h4><div class="tbl-wrap"><table class="p-tbl sm-tbl"><thead><tr><th>' + head + '</th><th>นักเรียน</th><th>0</th><th>ร</th><th>มส</th><th>รวม</th><th>แก้เสร็จ</th><th>ค้าง</th><th>เลยกำหนด</th><th style="width:22%">ร้อยละ</th></tr></thead><tbody>';
    var T = sumStat([]);
    groups.forEach(function (g) {
      var o = sumStat(g.cs);
      h += '<tr><td class="l"><b>' + esc(g.label) + '</b>' + (g.sub ? '<br><small>' + esc(g.sub) + '</small>' : '') + '</td><td>' + o.stu + '</td><td>' + o.t['0'][0] + '</td><td>' + o.t['ร'][0] + '</td><td>' + o.t['มส'][0] + '</td><td>' + o.total + '</td><td>' + o.done + '</td><td>' + (o.total - o.done) + '</td><td' + (o.late ? ' class="sm-late"' : '') + '>' + o.late + '</td><td>' + pctBar(o.pct) + '</td></tr>';
    });
    var all = []; groups.forEach(function (g) { all = all.concat(g.cs); }); T = sumStat(all);
    return h + '<tr class="sm-tot"><td>รวม</td><td>' + T.stu + '</td><td>' + T.t['0'][0] + '</td><td>' + T.t['ร'][0] + '</td><td>' + T.t['มส'][0] + '</td><td>' + T.total + '</td><td>' + T.done + '</td><td>' + (T.total - T.done) + '</td><td>' + T.late + '</td><td>' + pctBar(T.pct) + '</td></tr></tbody></table></div>';
  }
  function groupBy(cs, keyFn, labelFn) {
    var m = {}, keys = [];
    cs.forEach(function (c) { var k = keyFn(c); if (!m[k]) { m[k] = []; keys.push(k); } m[k].push(c); });
    return keys.map(function (k) { var l = labelFn ? labelFn(k, m[k]) : { label: k }; l.cs = m[k]; l.key = k; return l; });
  }
  function sumSubjectTbl(no, cs) {
    var g = groupBy(cs, function (c) { return c.subject; }).sort(function (a, b) { return b.cs.length - a.cs.length || (a.key < b.key ? -1 : 1); });
    var h = '<h4 class="sm-h">' + no + '. แยกตามรายวิชา</h4><div class="tbl-wrap"><table class="p-tbl sm-tbl"><thead><tr><th>รหัสวิชา</th><th>รายวิชา</th><th>ครูผู้สอน</th><th>0</th><th>ร</th><th>มส</th><th>รวม</th><th>แก้เสร็จ</th><th style="width:20%">ร้อยละ</th></tr></thead><tbody>';
    g.forEach(function (x) {
      var o = sumStat(x.cs), c = x.cs[0];
      h += '<tr><td>' + esc(c.subject) + '</td><td class="l">' + esc(c.subjectName) + '</td><td class="l">' + esc(c.teacherName || '-') + '</td><td>' + o.t['0'][0] + '</td><td>' + o.t['ร'][0] + '</td><td>' + o.t['มส'][0] + '</td><td>' + o.total + '</td><td>' + o.done + '</td><td>' + pctBar(o.pct) + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }
  function sumTeacherTbl(no, cs) {
    var g = groupBy(cs, function (c) { return c.teacherName || '-'; }).sort(function (a, b) { return b.cs.length - a.cs.length; });
    var h = '<h4 class="sm-h">' + no + '. แยกตามครูผู้สอน</h4><div class="tbl-wrap"><table class="p-tbl sm-tbl"><thead><tr><th>ครูผู้สอน</th><th>รายการ</th><th>แก้เสร็จ</th><th>รอตรวจ/อนุมัติ</th><th>กำลังแก้</th><th>เลยกำหนด</th><th style="width:22%">ร้อยละ</th></tr></thead><tbody>';
    g.forEach(function (x) {
      var o = sumStat(x.cs);
      h += '<tr><td class="l">' + esc(x.key) + '</td><td>' + o.total + '</td><td>' + o.done + '</td><td>' + o.review + '</td><td>' + o.doing + '</td><td' + (o.late ? ' class="sm-late"' : '') + '>' + o.late + '</td><td>' + pctBar(o.pct) + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }
  function sumStudentTbl(no, cs) {
    var g = groupBy(cs, function (c) { return c.sid; }).sort(function (a, b) { return (+a.cs[0].number || 0) - (+b.cs[0].number || 0); });
    var h = '<h4 class="sm-h">' + no + '. รายชื่อนักเรียนที่ติด 0 ร มส</h4><div class="tbl-wrap"><table class="p-tbl sm-tbl"><thead><tr><th>เลขที่</th><th>ชื่อ-สกุล</th><th>0</th><th>ร</th><th>มส</th><th>รวม</th><th>แก้เสร็จ</th><th>ค้าง</th><th>รายวิชาที่ยังค้าง</th><th>สถานะ</th></tr></thead><tbody>';
    g.forEach(function (x) {
      var o = sumStat(x.cs), c = x.cs[0], open = x.cs.filter(isOpen);
      var st = c.hold ? '<span class="sm-st hold">' + (c.hold === 'WITHDRAWN' ? 'ถอนชื่อ' : 'แขวน') + '</span>' : (!open.length ? '<span class="sm-st ok">แก้ครบ</span>' : (x.cs.some(isOverdue) ? '<span class="sm-st bad">เลยกำหนด</span>' : '<span class="sm-st warn">กำลังแก้</span>'));
      h += '<tr><td>' + esc(c.number || '-') + '</td><td class="l">' + esc(c.studentName) + '</td><td>' + o.t['0'][0] + '</td><td>' + o.t['ร'][0] + '</td><td>' + o.t['มส'][0] + '</td><td>' + o.total + '</td><td>' + o.done + '</td><td>' + open.length + '</td><td class="l sm-subj">' +
        (open.length ? open.map(function (z) { return esc(z.subjectName) + ' (' + esc(z.type) + ')'; }).join(', ') : '-') + '</td><td>' + st + '</td></tr>';
    });
    return h + '</tbody></table></div>';
  }
  function sumNotes(cs, scope) {
    var n = [], o = sumStat(cs);
    if (!cs.length) return '';
    if (scope === 'all') {
      var byCls = groupBy(cs, function (c) { return c.classroom; }).map(function (g) { return { k: g.key, open: g.cs.filter(isOpen).length }; }).sort(function (a, b) { return b.open - a.open; });
      if (byCls[0] && byCls[0].open) n.push('ห้องที่มีรายการค้างมากที่สุด คือ ' + byCls[0].k + ' (' + byCls[0].open + ' รายการ)');
    }
    var bySub = groupBy(cs, function (c) { return c.subjectName; }).sort(function (a, b) { return b.cs.length - a.cs.length; });
    if (bySub[0]) n.push('รายวิชาที่พบมากที่สุด คือ ' + bySub[0].key + ' (' + bySub[0].cs.length + ' รายการ)');
    var top = ['0', 'ร', 'มส'].sort(function (a, b) { return o.t[b][0] - o.t[a][0]; })[0];
    if (o.t[top][0]) n.push('ประเภทที่พบมากที่สุด คือ ' + top + ' (' + o.t[top][0] + ' รายการ คิดเป็น ' + Math.round(o.t[top][0] * 100 / o.total) + '% ของทั้งหมด)');
    n.push(o.late ? 'มีรายการเลยกำหนด ' + o.late + ' รายการ ควรเร่งติดตาม' : 'ไม่มีรายการเลยกำหนด');
    n.push('แก้เสร็จแล้ว ' + o.done + ' จาก ' + o.total + ' รายการ (' + o.pct + '%) นักเรียนแก้ครบทุกวิชาแล้ว ' + o.stuDone + ' จาก ' + o.stu + ' คน');
    return '<div class="sm-note"><b>ข้อสังเกต</b><ul>' + n.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
  }
  function sumSigns(first) {
    var cfg = reportCfg(), dots = '......................................', sigs = first ? [first] : [];
    cfg.signers.forEach(function (g) {
      if (g.on === false || g.auto) return;
      sigs.push({ name: g.name || '', role: g.label, img: cfg.printSig !== false && g.id ? (S.sigs || {})[g.id] : '' });
    });
    var d = new Date();
    return '<div class="p-sign">' + sigs.map(function (g) {
      return '<div class="sig">' + (g.img ? '<img class="sig-img" src="' + esc(g.img) + '" alt="">' : '') + 'ลงชื่อ ' + dots + '<br>(' + esc(g.name || dots) + ')<br><span class="role">' + esc(g.role) + '</span></div>';
    }).join('') + '</div><div class="p-give">วันที่ ' + d.getDate() + ' ' + TH_FULL[d.getMonth()] + ' พ.ศ. ' + (d.getFullYear() + 543) + '</div>';
  }
  function rosterOf(cls) {
    if (!S.students) return 0;
    return S.students.filter(function (x) { return !cls || x.cls === cls; }).length;
  }
  function sumAllPaper() {
    var cs = S.cases, o = sumStat(cs);
    var h = '<div class="paper sum">' + sumHead('รายงานสรุปผลการติดตามการแก้ผลการเรียน 0 ร มส', 'ภาพรวมทั้งโรงเรียน') + sumKpi(o, rosterOf(''));
    if (!cs.length) return h + '<p class="p-sum">ยังไม่มีรายการ 0 ร มส ในภาคเรียนนี้</p>' + sumSigns({ name: S.user.displayName, role: 'ผู้รายงาน' }) + '</div>';
    h += sumTypeTbl(o);
    var lv = groupBy(cs, function (c) { return level(c.classroom) || 0; }).sort(function (a, b) { return a.key - b.key; });
    lv.forEach(function (g) { g.label = g.key ? 'มัธยมศึกษาปีที่ ' + g.key : 'ไม่ระบุชั้น'; });
    h += sumGroupTbl(2, 'แยกตามระดับชั้น', 'ระดับชั้น', lv);
    var cl = groupBy(cs, function (c) { return c.classroom || 'ไม่ระบุ'; }, function (k, a) { return { label: k, sub: a[0].advisorName ? 'ครูที่ปรึกษา ' + a[0].advisorName : '' }; }).sort(function (a, b) { return a.key < b.key ? -1 : 1; });
    h += sumGroupTbl(3, 'แยกตามห้องเรียน', 'ห้อง', cl);
    h += sumSubjectTbl(4, cs) + sumTeacherTbl(5, cs) + sumNotes(cs, 'all');
    return h + sumSigns({ name: S.user.displayName, role: 'ผู้รายงาน (' + roleName(S.user.role) + ')' }) + '</div>';
  }
  function sumClassPaper(cls) {
    var cs = S.cases.filter(function (c) { return c.classroom === cls; }), o = sumStat(cs), adv = cs[0] ? cs[0].advisorName : '';
    if (!adv && S.user.role === 'teacher' && S.user.advisorClass === cls) adv = S.user.displayName;
    var h = '<div class="paper sum">' + sumHead('รายงานสรุปผลการติดตามการแก้ผลการเรียน 0 ร มส', 'ชั้น ' + cls + (adv ? '  ครูที่ปรึกษา ' + adv : '')) + sumKpi(o, rosterOf(cls));
    if (!cs.length) return h + '<p class="p-sum">ห้องนี้ไม่มีนักเรียนติด 0 ร มส</p>' + sumSigns({ name: adv, role: 'ครูที่ปรึกษา' }) + '</div>';
    h += sumTypeTbl(o) + sumStudentTbl(2, cs) + sumSubjectTbl(3, cs) + sumNotes(cs, 'class');
    return h + sumSigns({ name: adv, role: 'ครูที่ปรึกษาชั้น ' + cls }) + '</div>';
  }
  function sumClasses() {
    if (S.user.role === 'teacher') return S.user.advisorClass ? [S.user.advisorClass] : [];
    return classesOf(S.cases);
  }
  function vSum(top) {
    var classes = sumClasses(), body, title, sub;
    if (top.scope === 'all') { title = 'รายงานสรุปภาพรวม'; sub = 'ทั้งโรงเรียน'; body = sumAllPaper(); }
    else if (top.scope === 'classes') {
      title = 'สรุปรายห้องทุกห้อง'; sub = classes.length + ' ห้อง (พิมพ์ห้องละหน้า)';
      body = '<div class="papers">' + classes.map(sumClassPaper).join('') + '</div>';
    } else {
      var cls = top.cls || classes[0];
      title = 'รายงานสรุปรายห้อง'; sub = 'ชั้น ' + (cls || '-');
      body = (classes.length > 1 ? '<div class="chips no-print" style="padding-top:0;margin-bottom:12px">' + classes.map(function (c) {
        return '<button class="fchip" data-act="sum-cls" data-v="' + esc(c) + '" aria-pressed="' + (c === cls) + '">' + esc(c) + '</button>';
      }).join('') + '</div>' : '') + (cls ? sumClassPaper(cls) : '<div class="group"><div class="empty">ยังไม่มีข้อมูลรายห้อง</div></div>');
    }
    return header(title, esc(sub), '', true) + '<main class="main">' + (S.loaded ? body : loadingHtml()) + '</main>' +
      actbar('<button class="btn btn-ghost" data-act="export-xlsx" data-v="' + (top.scope === 'class' ? 'sum:' + esc(top.cls || classes[0] || '') : (top.scope === 'classes' ? 'sum:*' : '')) + '">' + ic('file', 20) + 'Excel</button><button class="btn btn-primary" data-act="print">' + ic('printer', 20) + 'พิมพ์ หรือบันทึกเป็น PDF</button>');
  }
  function sumCards() {
    var classes = sumClasses(), mgr = isManager();
    if (!classes.length && !mgr) return '';
    var h = '<div class="sec" style="margin-top:4px"><h2>รายงานสรุป</h2></div><div class="sum-cards">';
    if (mgr) h += '<button class="sum-c tw-relative tw-overflow-hidden" data-act="sum-open" data-v="all"><span class="sum-ic">' + ic('chart', 24) + '</span><b>สรุปภาพรวมทั้งโรงเรียน</b><span>ประเภท ระดับชั้น ห้อง รายวิชา ครูผู้สอน พร้อมข้อสังเกต</span></button>';
    if (classes.length) h += '<button class="sum-c tw-relative tw-overflow-hidden" data-act="sum-open" data-v="class"><span class="sum-ic c2">' + ic('users', 24) + '</span><b>' + (mgr ? 'สรุปรายห้อง' : 'สรุปห้อง ' + esc(classes[0])) + '</b><span>รายชื่อนักเรียน วิชาที่ค้าง สถานะ สำหรับครูที่ปรึกษา</span></button>';
    if (mgr && classes.length > 1) h += '<button class="sum-c tw-relative tw-overflow-hidden" data-act="sum-open" data-v="classes"><span class="sum-ic c3">' + ic('printer', 24) + '</span><b>สรุปทุกห้อง</b><span>พิมพ์รายงานสรุปของทุกห้องต่อกัน ห้องละหน้า (' + classes.length + ' ห้อง)</span></button>';
    return h + '</div>';
  }
  function vReportTab() {
    var cs = S.cases, classes = classesOf(cs);
    if (!S.cls || classes.indexOf(S.cls) < 0) S.cls = classes[0] || null;
    var h = header('รายงาน', term(), '<button class="ib" style="width:auto;padding:0 12px;font-size:14px;font-weight:600;gap:6px;display:flex;align-items:center" data-act="export-xlsx">' + ic('file', 18) + 'Excel</button>' + refreshBtn(''));
    h += '<main class="main">';
    if (!S.loaded) return h + loadingHtml() + '</main>';
    h += sumCards();
    if (!classes.length) return h + '<div class="group"><div class="soon">' + emptyIc('printer', 32) + '<b>ยังไม่มีข้อมูลสำหรับรายงาน</b><span>เมื่อครูบันทึกนักเรียนที่ติด 0 ร มส แล้วรายงานจะขึ้นที่นี่</span></div></div></main>';
    h += '<div class="sec"><h2>ตารางสรุปรายห้อง</h2></div><div class="group"><div class="tbl-wrap"><table class="p-tbl" style="min-width:0;font-size:14px"><thead><tr><th>ห้อง</th><th>0</th><th>ร</th><th>มส</th><th>แก้เสร็จ</th></tr></thead><tbody>';
    classes.forEach(function (cl) {
      var a = cs.filter(function (c) { return c.classroom === cl; }), t = tally(a);
      var d = a.filter(function (c) { return c.status === 'APPROVED'; }).length;
      h += '<tr><td>' + esc(cl) + '</td><td>' + t['0'] + '</td><td>' + t['ร'] + '</td><td>' + t['มส'] + '</td><td>' + d + '/' + a.length + '</td></tr>';
    });
    h += '</tbody></table></div></div><div class="sec"><h2>พิมพ์รายงาน</h2>' + (isManager() ? '<button class="link" data-act="adm-open" data-v="report">รูปแบบรายงาน</button>' : '') + '</div><div class="chips" style="padding-top:0">' + classes.map(function (cl) {
      return '<button class="fchip" data-act="cls" data-v="' + esc(cl) + '" aria-pressed="' + (S.cls === cl) + '">' + esc(cl) + '</button>';
    }).join('') + '</div><button class="btn btn-ghost btn-block" data-act="open-report-class" data-v="' + esc(S.cls) + '" style="margin-top:12px">' + ic('printer', 20) + 'พิมพ์ทั้งห้อง ' + esc(S.cls) + '</button><div class="group" style="margin-top:12px">';
    var seen = {}, rows = [];
    cs.forEach(function (c) { if (c.classroom === S.cls && !seen[c.sid]) { seen[c.sid] = true; rows.push(c); } });
    rows.sort(function (a, b) { return (+a.number || 0) - (+b.number || 0); }).forEach(function (s) {
      var a = cs.filter(function (c) { return c.sid === s.sid; }), open = a.filter(isOpen).length;
      h += '<button class="row" data-act="open-report" data-v="' + esc(s.sid) + '"><span class="avatar">' + esc(s.number) + '</span><span class="row-main"><span class="row-t">' + esc(s.studentName) + '</span><span class="row-s">' + a.length + ' วิชา ค้าง ' + open + '</span></span>' + ic('printer', 20) + '</button>';
    });
    return h + '</div></main>';
  }
  function vReport(sid) {
    var cs = S.cases.filter(function (c) { return c.sid === sid; }).sort(function (a, b) { return (a.created || 0) - (b.created || 0); });
    var s0 = cs[0] || {};
    return header('รายงานรายบุคคล', esc(s0.studentName || sid), '', true) + '<main class="main">' + paperHtml(sid, cs) + '</main>' +
      actbar('<button class="btn btn-primary" data-act="print">' + ic('printer', 20) + 'พิมพ์ หรือบันทึกเป็น PDF</button>');
  }

  /* ---------- shared ---------- */
  function notifIcon(type) {
    var m = { 'new': ['bell', 'warn'], alert: ['alert', 'bad'], bell: ['bell', 'warn'], remind: ['bell', 'warn'], auto: ['clock', 'warn'], autolate: ['alert', 'bad'], line: ['chat', 'ok'], calendar: ['calendar', ''], check: ['check', 'ok'], seal: ['seal', 'ok'], image: ['image', ''] };
    return m[type] || ['bell', ''];
  }
  function vNotif() {
    var un = unread();
    var h = header('แจ้งเตือน', un ? 'ยังไม่อ่าน ' + un + ' รายการ' : 'อ่านครบแล้ว', un ? '<button class="ib" style="width:auto;padding:0 12px;font-size:14px;font-weight:600" data-act="read-all">อ่านทั้งหมด</button>' : refreshBtn(''));
    h += '<main class="main">' + syncNote() + '<div class="group">' + (!S.loaded ? twLoad('กำลังโหลด') : (S.notifs.length ? S.notifs.map(function (n) {
      var ni = notifIcon(n.type);
      return '<button class="nf' + (n.read ? '' : ' unread') + '" data-act="open-notif" data-id="' + esc(n.id) + '"><span class="nf-ic ' + ni[1] + '">' + ic(ni[0], 20) + '</span><span><b>' + esc(n.title) + '</b><span>' + esc(n.body) + '</span><time>' + ago(n.at) + '</time></span></button>';
    }).join('') : '<div class="empty">ยังไม่มีแจ้งเตือน</div>')) + '</div></main>';
    return h;
  }
  function vMe() {
    var u = S.user;
    var h = header('ฉัน', roleName(u.role));
    h += '<main class="main"><div class="me">' + avatarHtml(u.id, u.firstName || u.displayName, u.photoVer) + '<div><div class="me-n">' + esc(u.displayName) + '</div><div class="me-s">' +
      (u.role === 'student' ? esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' เลขประจำตัว ' + esc(u.username) : esc(u.department || '') + ' ชื่อผู้ใช้ ' + esc(u.username)) + '</div></div></div>';
    if (u.role !== 'student') h += photoBlock({ id: u.id, photoVer: u.photoVer, role: u.role });
    h += '<div class="sec"><h2>บัญชีและการตั้งค่า</h2></div><div class="group">';
    h += '<button class="row" data-act="pw-open"><span class="nf-ic">' + ic('lock', 20) + '</span><span class="row-main"><span class="row-t">เปลี่ยนรหัสผ่าน</span><span class="row-s">แนะนำให้เปลี่ยนทุกภาคเรียน</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    h += '<button class="row" data-act="line-open"><span class="nf-ic ok">' + ic('chat', 20) + '</span><span class="row-main"><span class="row-t">' + (u.role === 'student' ? 'LINE ผู้ปกครอง' : 'LINE ส่วนตัว') + '</span><span class="row-s">' + (u.lineLinked ? 'รับแจ้งเตือนผ่าน LINE OA โรงเรียน' : (u.role === 'student' ? 'ให้ผู้ปกครองสแกน QR เพื่อรับแจ้งเตือน' : 'รับแจ้งเตือนงานทาง LINE')) + '</span></span>' + (u.lineLinked ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</button>';
    h += '<button class="row" data-act="theme-open"><span class="nf-ic">' + ic('moon', 20) + '</span><span class="row-main"><span class="row-t">สีธีมและเอฟเฟค</span><span class="row-s">เปลี่ยนสี โหมดมืด เอฟเฟคแสง</span></span><span class="theme-swatch-dot"></span></button>';
    h += '<button class="row" data-act="howto"><span class="nf-ic">' + ic('phone', 20) + '</span><span class="row-main"><span class="row-t">' + (S.installEvt ? 'ติดตั้งเป็นแอปบนเครื่องนี้' : 'เพิ่มไว้ที่หน้าจอโทรศัพท์') + '</span><span class="row-s">เปิดได้เหมือนแอป ไม่ต้องพิมพ์ลิงก์ เปิดได้แม้เน็ตหลุด</span></span>' + (S.installEvt ? '<span class="chip ch-info">ติดตั้ง</span>' : '<span class="chev">' + ic('chev', 20) + '</span>') + '</button>';
    h += '</div>' + manageSection() + '<button class="btn btn-bad btn-block" data-act="logout" style="margin-top:20px">' + ic('logout', 20) + 'ออกจากระบบ</button>';
    h += '<p class="foot">' + FOOT + '<br>เวอร์ชัน ' + esc(C.VERSION || '') + (S.lastSync ? ' / ข้อมูลล่าสุด ' + thTime(S.lastSync) + ' น.' : '') + '</p></main>';
    return h;
  }

  function tabsFor(role) {
    if (role === 'student') return [['home', 'หน้าหลัก', 'home'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    if (role === 'teacher') return [['home', 'งานของฉัน', 'home'], ['students', 'นักเรียน', 'users'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    if (role === 'admin') return [['home', 'ภาพรวม', 'chart'], ['students', 'ติดตาม', 'users'], ['approve', 'อนุมัติ', 'seal'], ['report', 'รายงาน', 'printer'], ['manage', 'จัดการ', 'settings'], ['me', 'ฉัน', 'user']];
    return [['home', 'ภาพรวม', 'chart'], ['students', 'นักเรียน', 'users'], ['approve', 'อนุมัติ', 'seal'], ['report', 'รายงาน', 'printer'], ['me', 'ฉัน', 'user']];
  }
  function navHtml() {
    var un = unread();
    var pend = S.cases.filter(function (c) { return c.status === 'PASSED'; }).length;
    var src = logoSrc();
    return '<nav class="nav no-print" aria-label="เมนูหลัก"><div class="nav-brand">' + (src ? '<img src="' + esc(src) + '" alt="">' : '<span class="nb-ic">' + ic('cap', 22) + '</span>') +
      '<span><b>' + esc(C.APP_NAME || 'ติดตามการแก้ 0 ร มส') + '</b><small>' + esc(setting('schoolName', C.SCHOOL || '')) + '</small></span></div><div class="nav-in">' + tabsFor(S.user.role).map(function (t) {
      var b = t[0] === 'notif' ? un : (t[0] === 'approve' ? pend : 0);
      return '<button data-act="tab" data-v="' + t[0] + '"' + (S.tab === t[0] ? ' aria-current="page"' : '') + '><span class="pill">' + ic(t[2]) + '</span>' + t[1] + (b ? '<span class="badge">' + b + '</span>' : '') + '</button>';
    }).join('') + '</div>' + navExtra() + '<div class="nav-user">' + avatarHtml(S.user.id, S.user.firstName || S.user.displayName, S.user.photoVer) + '<span><b>' + esc(S.user.displayName) + '</b><small>' + roleName(S.user.role) + '</small></span></div></nav>';
  }
  /* ส่วนเสริมแถบเมนูซ้าย (จอคอม): ทางลัด สรุปย่อ ออกจากระบบ */
  function navExtra() {
    var u = S.user, cs = S.cases, links = [];
    var nxb = function (act, icon, label, extra, attrs) {
      return '<button class="nx-btn" data-act="' + act + '"' + (attrs || '') + '><span class="nx-ic">' + ic(icon, 18) + '</span><span class="nx-l">' + label + '</span>' + (extra || '') + '</button>';
    };
    if (canSearch()) links.push(nxb('pop-search', 'search', 'ค้นหา', '<kbd>Ctrl K</kbd>'));
    if ((u.role === 'teacher' || u.role === 'admin') && S.subjects.length) links.push(nxb('new-case', 'plus', 'บันทึก 0 ร มส'));
    if (u.role !== 'student' && !tabsFor(u.role).some(function (t) { return t[0] === 'notif'; })) {
      var un = unread();
      links.push(nxb('tab-notif', 'bell', 'การแจ้งเตือน', un ? '<span class="nx-badge">' + un + '</span>' : ''));
    }
    if (u.role === 'teacher' && u.advisorClass) links.push(nxb('sum-open', 'printer', 'สรุปห้อง ' + esc(u.advisorClass), '', ' data-v="class"'));
    if (isManager()) links.push(nxb('sum-open', 'printer', 'รายงานสรุปภาพรวม', '', ' data-v="all"'));
    links.push(nxb('theme', isDark() ? 'sun' : 'moon', isDark() ? 'โหมดสว่าง' : 'โหมดมืด', '<span class="sw sm' + (isDark() ? ' on' : '') + '"></span>'));
    links.push(nxb('theme-open', 'palette', 'สีธีมและเอฟเฟค'));
    links.push(nxb('pw-open', 'lock', 'เปลี่ยนรหัสผ่าน'));
    links.push('<a class="nx-btn" href="./" target="_blank" rel="noopener"><span class="nx-ic">' + ic('chart', 18) + '</span><span class="nx-l">หน้าสถิติสาธารณะ</span></a>');
    links.push(nxb('howto', 'phone', S.installEvt ? 'ติดตั้งเป็นแอป' : 'เพิ่มไว้ที่หน้าจอ'));

    var done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length, total = cs.length;
    var late = cs.filter(isOverdue).length, pct = total ? Math.round(done * 100 / total) : 0;
    var card = '<div class="nx-card"><div class="nx-ct"><b>' + (u.role === 'student' ? 'ความคืบหน้าของฉัน' : (u.role === 'teacher' ? 'งานของฉัน' : 'ภาพรวมทั้งโรงเรียน')) + '</b><span>' + pct + '%</span></div>' +
      '<div class="nx-bar"><i style="width:' + pct + '%"></i></div>' +
      '<div class="nx-cs"><span>แก้เสร็จ ' + done + '/' + total + '</span>' + (late ? '<span class="t-bad">เลยกำหนด ' + late + '</span>' : '<span>ไม่มีเลยกำหนด</span>') + '</div>' +
      '<button class="nx-sync" data-act="refresh">' + (S.syncing ? '<span class="spin"></span>กำลังโหลด' : ic('refresh', 14) + (S.lastSync ? 'อัปเดต ' + thTime(S.lastSync) + ' น.' : 'โหลดข้อมูล')) + '</button></div>';

    return '<div class="nav-extra"><div class="nx-sec">ทางลัด</div>' + links.join('') + card + '</div>' +
      '<button class="nx-logout" data-act="logout">' + ic('logout', 18) + 'ออกจากระบบ</button>';
  }
  function vTab() {
    var role = S.user.role, tabs = tabsFor(role).map(function (t) { return t[0]; });
    if (tabs.indexOf(S.tab) < 0) S.tab = 'home';
    var t = S.tab, h;
    if (t === 'notif') h = vNotif();
    else if (t === 'me') h = vMe();
    else if (role === 'student') h = vStudentHome();
    else if (role === 'teacher') h = t === 'students' ? vTeacherStudents() : vTeacherHome();
    else if (t === 'manage') h = vManage();
    else h = t === 'students' ? vTeacherStudents() : (t === 'approve' ? vApprove() : (t === 'report' ? vReportTab() : vMeasureHome()));
    return h + navHtml();
  }

  function render() { renderMain(); renderPop(); }
  function renderMain() {
    var app = $('app');
    app.className = 'app' + (S.user && !S.user.mustChangePw ? ' has-nav' : '');
    if (!S.user) { app.innerHTML = vLogin(); return; }
    if (S.user.mustChangePw) { app.innerHTML = vMustChange(); return; }
    var top = S.stack.length ? S.stack[S.stack.length - 1] : null;
    if (!top) app.innerHTML = vTab();
    else if (top.v === 'case') app.innerHTML = vCase(caseById(top.id));
    else if (top.v === 'student') app.innerHTML = vStudent(top.sid);
    else if (top.v === 'adm-users') app.innerHTML = vAdmUsers();
    else if (top.v === 'adm-students') app.innerHTML = vAdmStudents();
    else if (top.v === 'adm-subjects') app.innerHTML = vAdmSubjects();
    else if (top.v === 'report-class') app.innerHTML = vReportClass(top.cls);
    else if (top.v === 'report') app.innerHTML = vReport(top.sid);
    else if (top.v === 'sum') app.innerHTML = vSum(top);
    if (S.syncing) app.insertAdjacentHTML('afterbegin', topBar());
    var key = top ? top.v + ':' + (top.id || top.sid || top.cls || top.scope || '') : 'tab:' + S.tab;
    if (key !== S.viewKey) {
      S.viewKey = key;
      var mn = app.querySelector('.main');
      if (mn) mn.className += ' enter';
    }
  }

  /* ---------- sheets ---------- */
  function openSheet(o) { S.sheet = o; renderSheet(); }
  function closeSheet() { S.sheet = null; renderSheet(); }
  function renderSheet() {
    var el = $('sheet');
    if (!S.sheet) { el.innerHTML = ''; document.body.style.overflow = ''; return; }
    var k = S.sheet.kind, inner = '';
    if (k === 'pw') inner = '<h3 class="sh-t">เปลี่ยนรหัสผ่าน</h3><p class="sh-s">หลังเปลี่ยนแล้วใช้รหัสใหม่ได้ทันที</p>' + pwFormHtml('pwForm');
    else if (k === 'howto') inner = '<h3 class="sh-t">เพิ่มไว้ที่หน้าจอโทรศัพท์</h3><p class="sh-s">ทำครั้งเดียว ต่อไปแตะไอคอนเปิดได้เลย</p><b>Android (Chrome)</b><ol class="howto"><li>แตะเมนู ⋮ มุมขวาบน</li><li>เลือก เพิ่มลงในหน้าจอหลัก</li></ol><b>iPhone (Safari)</b><ol class="howto"><li>แตะปุ่มแชร์ด้านล่าง</li><li>เลือก เพิ่มไปยังหน้าจอโฮม</li></ol><button class="btn btn-primary btn-block" data-act="close-sheet" style="margin-top:10px">เข้าใจแล้ว</button>';
    else if (k === 'new') inner = shNew();
    else if (k === 'grade') inner = shGrade();
    else if (k === 'form') inner = shForm();
    else if (k === 'temp') inner = shTemp();
    else if (k === 'import') inner = shImport();
    else if (k === 'line') inner = shLine();
    else if (k === 'linestatus') inner = shLineStatus();
    else if (k === 'backup') inner = shBackup();
    else if (k === 'defpw') inner = shDefPw();
    else if (k === 'phbulk') inner = shPhBulk();
    else if (k === 'dev') inner = shDev();
    else if (k === 'report-config') inner = shReportCfg();
    else if (k === 'logo') inner = shLogo();
    else if (k === 'themepick') inner = shTheme();
    else if (k === 'reset-data') inner = shResetData();
    else if (k === 'sig') inner = shSig();
    else if (k === 'setup-real') inner = shSetupReal();
    else if (k === 'reject') inner = shReject();
    else if (k === 'img') inner = shImg();
    else if (k === 'done') inner = '<div class="done-ic">' + ic(S.sheet.icon || 'check', 44) + '</div><h3 class="done-t">' + esc(S.sheet.title) + '</h3><p class="done-s">' + esc(S.sheet.sub) + '</p>' + (S.sheet.next ? '<ol class="next">' + S.sheet.next.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '') +
      '<div class="actbar-in">' + (S.sheet.home ? '<button class="btn btn-primary" data-act="done-home">กลับหน้าแรก</button>' : '') + (S.sheet.again ? '<button class="btn btn-ghost" data-act="new-case">บันทึกคนต่อไป</button>' : '') + (S.sheet.home ? '' : '<button class="btn btn-primary" data-act="close-sheet">' + esc(S.sheet.btn || 'ตกลง') + '</button>') + '</div>';
    el.innerHTML = '<div class="sheet-bg" data-act="sheet-locked"><div class="sheet" data-act="noop" role="dialog" aria-modal="true"><div class="grab"></div>' +
      '<button class="sh-x" data-act="close-sheet" aria-label="ปิดหน้าต่าง" title="ปิด">' + ic('x', 20) + '</button>' + inner + '</div></div>';
    document.body.style.overflow = 'hidden';
    if (k === 'line' && S.sheet.code) drawQR();
    if (k === 'sig' && S.sheet.mode === 'draw') initSigPad();
  }

  function gradeOptions(cap) {
    var out = [];
    for (var g = 1; g <= cap; g += 0.5) out.push(g);
    return out;
  }
  function shGrade() {
    var c = caseById(S.sheet.cid);
    if (!c) return '<div class="empty">ไม่พบรายการ</div>';
    var cap = capOf(c), g = gradeOptions(cap), maxA = +setting('maxAttempts', 2), failText;
    if (c.type === 'ร') failText = 'ผลจริงได้ 0 ระบบจะเปลี่ยนเป็นการแก้ 0 ครั้งที่ 1';
    else if (c.attempt >= maxA) failText = 'แก้ครบ ' + maxA + ' ครั้งแล้ว ระบบจะบันทึกเป็น ต้องเรียนซ้ำ';
    else failText = 'ให้นักเรียนแก้ครั้งที่ ' + (c.attempt + 1) + ' กำหนดใหม่อีก ' + setting('defaultDays', 14) + ' วัน';
    return '<h3 class="sh-t">ให้ผลการแก้</h3><p class="sh-s">' + esc(c.studentName) + ' ' + esc(c.subjectName) + ' (' + esc(c.type) + ')</p>' +
      '<span class="lbl">ผ่าน ได้ระดับผลการเรียน</span><div class="grades" style="grid-template-columns:repeat(' + Math.min(4, g.length) + ',1fr)">' + g.map(function (x) {
        return '<button data-act="grade-pass" data-id="' + esc(c.id) + '" data-v="' + x + '">' + x + '</button>';
      }).join('') + '</div>' + (cap < 4 ? '<p class="sh-s" style="margin-top:8px">ผล ' + esc(c.type) + ' เมื่อแก้แล้วได้ไม่เกิน ' + cap + ' ตามระเบียบวัดผล</p>' : '') +
      '<div class="or">หรือ</div><button class="btn btn-bad btn-block" data-act="grade-fail" data-id="' + esc(c.id) + '">ไม่ผ่าน</button><p class="sh-s" style="margin-top:8px;text-align:center">' + failText + '</p>';
  }
  function shReject() {
    var c = caseById(S.sheet.cid), q = ['รูปไม่ชัด ถ่ายใหม่ให้เห็นทั้งหน้า', 'งานยังไม่ครบ ขาดบางชิ้น', 'ส่งผิดวิชา ตรวจสอบอีกครั้ง'];
    return '<h3 class="sh-t">ส่งกลับให้แก้</h3><p class="sh-s">' + esc(c ? c.studentName : '') + ' จะเห็นข้อความนี้และแนบหลักฐานใหม่ได้</p>' +
      '<div class="opts" style="margin-bottom:10px">' + q.map(function (x) { return '<button class="fchip" data-act="quick-note" data-v="' + esc(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>' +
      '<textarea class="inp" data-k="note" maxlength="300" placeholder="บอกนักเรียนว่าต้องแก้อะไร">' + esc(S.sheet.note) + '</textarea><div id="rejErr" class="err" role="alert"></div>' +
      '<button class="btn btn-primary btn-block" data-act="reject-send" data-id="' + esc(S.sheet.cid) + '" style="margin-top:8px">ส่งกลับให้แก้</button>';
  }
  function shImg() {
    var s = S.sheet, body;
    if (s.err) body = '<div class="group"><div class="empty">' + esc(s.err) + '</div></div>';
    else if (!s.src) body = twLoad('กำลังเปิดไฟล์');
    else if (s.pdf) body = '<div class="group"><div class="soon">' + emptyIc('file', 40) + '<b>ไฟล์ PDF</b><a class="btn btn-primary" href="' + s.src + '" target="_blank" rel="noopener" download="' + esc(s.name) + '">เปิดไฟล์ PDF</a></div></div>';
    else body = '<div class="viewer"><img src="' + s.src + '" alt="' + esc(s.name) + '"></div>';
    return '<h3 class="sh-t">' + esc(s.name) + '</h3><p class="sh-s">หลักฐานที่นักเรียนแนบ</p>' + body + '<button class="btn btn-ghost btn-block" data-act="close-sheet" style="margin-top:14px">ปิด</button>';
  }
  function b64ToBlobUrl(data, mime) {
    var bin = atob(data), arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([arr], { type: mime }));
  }

  /* ---------- upload ---------- */
  function scaleImg(img, max, q) {
    var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h));
    var cv = document.createElement('canvas');
    cv.width = Math.round(w * k); cv.height = Math.round(h * k);
    var g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height);
    g.drawImage(img, 0, 0, cv.width, cv.height);
    return cv.toDataURL('image/jpeg', q);
  }
  function prepareFile(f) {
    return new Promise(function (resolve, reject) {
      var maxMB = +setting('maxUploadMB', 10);
      if (f.size > maxMB * 1024 * 1024) return reject({ message: 'ไฟล์ ' + f.name + ' ใหญ่เกิน ' + maxMB + ' MB' });
      if (f.type === 'application/pdf') {
        var r = new FileReader();
        r.onload = function () { resolve({ mime: 'application/pdf', data: String(r.result).split(',')[1], thumb: '' }); };
        r.onerror = function () { reject({ message: 'อ่านไฟล์ ' + f.name + ' ไม่ได้' }); };
        r.readAsDataURL(f);
        return;
      }
      if (String(f.type).indexOf('image/') !== 0) return reject({ message: 'รองรับเฉพาะรูปภาพ และไฟล์ PDF' });
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        try {
          var big = scaleImg(img, 1280, 0.78), thumb = scaleImg(img, 200, 0.65);
          URL.revokeObjectURL(url);
          resolve({ mime: 'image/jpeg', data: big.split(',')[1], thumb: thumb });
        } catch (e) { reject({ message: 'ย่อรูปไม่สำเร็จ ลองเลือกรูปอื่น' }); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject({ message: 'เปิดรูป ' + f.name + ' ไม่ได้ ลองถ่ายใหม่หรือใช้ไฟล์ JPG' }); };
      img.src = url;
    });
  }
  function uploadFiles(id, files) {
    var i = 0, ok = 0;
    S.uploading[id] = (S.uploading[id] || 0) + files.length;
    render();
    (function next() {
      if (i >= files.length) {
        if (ok) { haptic(); toast('แนบหลักฐานแล้ว ' + ok + ' ไฟล์'); }
        return;
      }
      var f = files[i++];
      prepareFile(f).then(function (p) {
        return API.call('uploadEvidence', { caseId: id, name: f.name || 'รูปถ่าย.jpg', mime: p.mime, data: p.data, thumb: p.thumb });
      }).then(function (d) {
        (S.ev[id] = S.ev[id] || []).push(d.evidence);
        upsertCase(d.item); saveCache(); ok++;
      }).catch(function (err) {
        toast(err.message || 'อัปโหลดไม่สำเร็จ');
      }).then(function () {
        S.uploading[id] = Math.max(0, (S.uploading[id] || 1) - 1);
        delete S.logs[id];
        render();
        if (!S.uploading[id]) loadLog(id);
        next();
      });
    })();
  }
  function removeEvidence(id, eid, btn) {
    setBusy(btn, true, '');
    API.call('deleteEvidence', { id: eid }).then(function () {
      S.ev[id] = (S.ev[id] || []).filter(function (x) { return x.id !== eid; });
      delete S.logs[id]; render(); loadLog(id); toast('ลบไฟล์แล้ว');
    }).catch(function (err) { setBusy(btn, false); toast(err.message || 'ลบไม่สำเร็จ'); });
  }
  function onFiles(e) {
    var files = [].slice.call(e.target.files || []), id = S.pendingCase;
    if (!id || !files.length) return;
    uploadFiles(id, files);
  }
  function fileInputs() {
    var a = document.createElement('input');
    a.type = 'file'; a.id = 'fCam'; a.accept = 'image/*'; a.setAttribute('capture', 'environment'); a.hidden = true;
    var b = document.createElement('input');
    b.type = 'file'; b.id = 'fPick'; b.accept = 'image/*,application/pdf'; b.multiple = true; b.hidden = true;
    a.addEventListener('change', onFiles); b.addEventListener('change', onFiles);
    document.body.appendChild(a); document.body.appendChild(b);
    var lg = document.createElement('input');
    lg.type = 'file'; lg.id = 'fLogo'; lg.accept = 'image/png,image/jpeg,image/webp'; lg.hidden = true;
    lg.addEventListener('change', function () {
      var f = lg.files && lg.files[0];
      if (!f || !S.sheet || S.sheet.kind !== 'logo') return;
      processLogo(f).then(function (d) { S.sheet.newData = d; renderSheet(); }).catch(function (e) { toast(e.message); });
    });
    document.body.appendChild(lg);
    var pb = document.createElement('input');
    pb.type = 'file'; pb.id = 'fPhb'; pb.accept = 'image/*'; pb.multiple = true; pb.hidden = true;
    pb.addEventListener('change', function () { phbAddFiles(pb.files); });
    document.body.appendChild(pb);
    var fi = document.createElement('input');
    fi.type = 'file'; fi.id = 'fImp'; fi.hidden = true;
    fi.addEventListener('change', function () { impFile(fi.files && fi.files[0]); });
    document.body.appendChild(fi);
    document.addEventListener('dragover', function (e) { if (S.sheet && S.sheet.kind === 'phbulk') { e.preventDefault(); return; } if (S.sheet && S.sheet.kind === 'import') { e.preventDefault(); var d = $('impDrop'); if (d) d.className = 'imp-drop over'; } });
    document.addEventListener('dragleave', function (e) { var d = $('impDrop'); if (d && e.target === d) d.className = 'imp-drop'; });
    document.addEventListener('drop', function (e) {
      if (S.sheet && S.sheet.kind === 'phbulk') { e.preventDefault(); phbAddFiles(e.dataTransfer && e.dataTransfer.files); return; }
      if (!S.sheet || S.sheet.kind !== 'import') return;
      e.preventDefault(); var d = $('impDrop'); if (d) d.className = 'imp-drop';
      impFile(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
    });
    var sp = document.createElement('input');
    sp.type = 'file'; sp.id = 'fStuPh'; sp.accept = 'image/*'; sp.hidden = true;
    sp.addEventListener('change', function () {
      var f = sp.files && sp.files[0], id = sp.getAttribute('data-id');
      if (!f || !id) return;
      processStudentPhoto(f).then(function (d) { savePhoto(id, d); }).catch(function (e) { toast(e.message); });
    });
    document.body.appendChild(sp);
    var dv = document.createElement('input');
    dv.type = 'file'; dv.id = 'fDev'; dv.accept = 'image/*'; dv.hidden = true;
    dv.addEventListener('change', function () {
      var f = dv.files && dv.files[0];
      if (!f || !S.sheet || S.sheet.kind !== 'dev') return;
      processPhoto(f).then(function (d) { S.sheet.photo = d; renderSheet(); }).catch(function (e) { toast(e.message); });
    });
    document.body.appendChild(dv);
    var sg = document.createElement('input');
    sg.type = 'file'; sg.id = 'fSig'; sg.accept = 'image/*'; sg.hidden = true;
    sg.addEventListener('change', function () {
      var f = sg.files && sg.files[0];
      if (!f || !S.sheet || S.sheet.kind !== 'sig') return;
      var url = URL.createObjectURL(f), im = new Image();
      im.onload = function () {
        var k = Math.min(1, 1000 / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas');
        cv.width = Math.round(im.naturalWidth * k); cv.height = Math.round(im.naturalHeight * k);
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
        URL.revokeObjectURL(url);
        var out = trimSignature(cv, true, 140);
        if (!out) { toast('หาลายเซ็นในรูปไม่เจอ ลองถ่ายบนกระดาษขาวให้ชัดขึ้น'); return; }
        S.sheet.data = out; renderSheet();
      };
      im.onerror = function () { toast('เปิดรูปไม่ได้'); };
      im.src = url;
    });
    document.body.appendChild(sg);
  }

  function subjectsFor(sid) {
    var st = (S.students || []).filter(function (x) { return x.id === sid; })[0];
    var lv = st ? level(st.cls) : 0;
    var list = S.subjects.filter(function (s) { return !lv || !s.level || s.level === lv; });
    return list.length ? list : S.subjects;
  }
  /* ---------- แสดงผลแบบลื่นไหล: รายการที่ค้นหาค่อยๆ เลื่อนเข้าที่ (FLIP) ---------- */
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flipRender(el, html) {
    if (!el) return;
    var canAnim = !RM && typeof el.animate === 'function', old = {};
    if (canAnim) {
      var a = el.querySelectorAll('[data-k]');
      for (var i = 0; i < a.length; i++) old[a[i].getAttribute('data-k')] = a[i].getBoundingClientRect();
    }
    el.innerHTML = html;
    if (!canAnim) return;
    var b = el.querySelectorAll('[data-k]'), vh = window.innerHeight, n = 0;
    for (var j = 0; j < b.length; j++) {
      var e = b[j], k = e.getAttribute('data-k'), nr = e.getBoundingClientRect();
      if (nr.top > vh + 80 || nr.bottom < -80) continue; // นอกจอไม่ต้องเล่นเอฟเฟค
      var o = old[k];
      if (o) {
        var dx = o.left - nr.left, dy = o.top - nr.top;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) e.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else {
        e.animate([{ opacity: 0, transform: 'translateY(16px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: Math.min(n++ * 28, 320), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
      }
    }
  }

  /* ---------- เลือกนักเรียน: แสดงทุกคน แยกตามห้อง พิมพ์แล้วคนที่ตรงเลื่อนขึ้นมา ---------- */
  function stuClasses() {
    var out = [];
    (S.students || []).forEach(function (x) { if (out.indexOf(x.cls) < 0) out.push(x.cls); });
    var adv = S.user.advisorClass;
    return out.sort(function (a, b) { return a === adv ? -1 : (b === adv ? 1 : (a < b ? -1 : 1)); });
  }
  function stuChips() {
    var s = S.sheet, cur = s.scls || 'all', cls = stuClasses(), adv = S.user.advisorClass;
    if (cls.length < 2) return '';
    return [['all', 'ทุกห้อง (' + (S.students || []).length + ')']].concat(cls.map(function (c) {
      return [c, c + (c === adv ? ' ★' : '')];
    })).map(function (x) {
      return '<button class="fchip" data-act="stu-cls" data-v="' + esc(x[0]) + '" aria-pressed="' + (cur === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join('');
  }
  function stuRow(x, toks) {
    return '<button class="row stu-pick" data-k="' + esc(x.id) + '" data-act="new-pick-stu" data-v="' + esc(x.id) + '">' + avatarHtml(x.id, x.firstName || x.name, x.pv) +
      '<span class="row-main"><span class="row-t">' + (toks ? gsMark(x.name, toks) : esc(x.name)) + '</span><span class="row-s">' + (toks ? gsMark(x.cls, toks) : esc(x.cls)) + ' เลขที่ ' + esc(x.no) + ' · ' + (toks ? gsMark(x.id, toks) : esc(x.id)) + '</span></span>' +
      '<span class="pick-ic">' + ic('plus', 18) + '</span></button>';
  }
  function stuResults(q) {
    if (!S.students) return twLoad('กำลังโหลดรายชื่อนักเรียน');
    var s = S.sheet || {}, cur = s.scls || 'all', adv = S.user.advisorClass;
    var toks = gsNorm(q || '').trim().split(' ').filter(function (x) { return x; });
    var base = S.students.filter(function (x) { return cur === 'all' || x.cls === cur; });
    if (toks.length) {
      var hits = base.filter(function (x) { return gsHit(x.name + ' ' + x.id + ' ' + x.cls + ' เลขที่' + x.no, toks); });
      var t0 = toks[0];
      var score = function (x) {
        var nm = gsNorm(x.name).replace(/^(ด\.ช\.|ด\.ญ\.|นางสาว|นาย|นาง)/, '');
        return (nm.indexOf(t0) === 0 ? 0 : (String(x.id).indexOf(t0) === 0 ? 1 : 2)) * 10 + (x.cls === adv ? 0 : 1);
      };
      hits.sort(function (a, b) { return score(a) - score(b) || (a.cls < b.cls ? -1 : (a.cls > b.cls ? 1 : (+a.no || 0) - (+b.no || 0))); });
      if (!hits.length) return '<div class="empty" data-k="none">ไม่พบ "' + esc(q.trim()) + '"' + (cur !== 'all' ? ' ในห้อง ' + esc(cur) + ' ลองเลือก ทุกห้อง' : ' ลองพิมพ์ชื่อจริง เลขประจำตัว หรือห้อง') + '</div>';
      return '<div class="stu-head" data-k="h:found">พบ ' + hits.length + ' คน<span>เรียงคนที่ตรงที่สุดไว้บนสุด</span></div>' + hits.slice(0, 200).map(function (x) { return stuRow(x, toks); }).join('') +
        (hits.length > 200 ? '<div class="row-s" style="padding:10px 14px">แสดง 200 คนแรก พิมพ์ให้เจาะจงขึ้น</div>' : '');
    }
    var groups = {}, order = stuClasses().filter(function (c) { return cur === 'all' || c === cur; });
    base.forEach(function (x) { (groups[x.cls] = groups[x.cls] || []).push(x); });
    var h = '';
    order.forEach(function (c) {
      var g = (groups[c] || []).sort(function (a, b) { return (+a.no || 0) - (+b.no || 0); });
      if (!g.length) return;
      h += '<div class="stu-head" data-k="h:' + esc(c) + '">' + esc(c) + (c === adv ? ' · ห้องที่ปรึกษา' : '') + '<span>' + g.length + ' คน</span></div>' + g.map(function (x) { return stuRow(x, null); }).join('');
    });
    return h || '<div class="empty">ยังไม่มีรายชื่อนักเรียน</div>';
  }
  function msWarn(v) {
    var n = parseFloat(v);
    if (isNaN(n)) return '';
    if (n >= 80) return '<div class="warnbox">เวลาเรียนตั้งแต่ 80% ขึ้นไปมีสิทธิ์สอบ ไม่ต้องบันทึก มส</div>';
    if (n < +setting('msMinPct', 60)) return '<div class="warnbox">ต่ำกว่า ' + setting('msMinPct', 60) + '% ระบบจะบันทึกเป็น ต้องเรียนซ้ำ</div>';
    return '';
  }
  function shNew() {
    var s = S.sheet, h = '<h3 class="sh-t">บันทึกนักเรียนติด 0 ร มส</h3><p class="sh-s">' + term() + '</p>';
    h += '<div class="field"><span class="lbl">นักเรียน</span>';
    if (s.sid && S.students) {
      var st = S.students.filter(function (x) { return x.id === s.sid; })[0] || { name: s.sid, cls: '', no: '' };
      h += '<div class="picked"><span>' + esc(st.name) + '<small>' + esc(st.cls) + ' เลขที่ ' + esc(st.no) + '</small></span><button class="link" data-act="new-clear-stu">เปลี่ยน</button></div></div>';
      var subs = subjectsFor(s.sid);
      if (!s.subj && subs.length === 1) s.subj = subs[0].code;
      h += '<div class="field"><span class="lbl">รายวิชา</span><div class="opts">' + subs.map(function (x) {
        return '<button class="fchip" data-act="new-subj" data-v="' + esc(x.code) + '" aria-pressed="' + (s.subj === x.code) + '">' + esc(x.code) + ' ' + esc(x.name) + '</button>';
      }).join('') + '</div></div>';
      h += '<div class="field"><span class="lbl">ผลการเรียน</span><div class="seg">' + TYPES.map(function (t) {
        return '<button class="' + (t === '0' ? 's0' : (t === 'ร' ? 'sr' : 'sm')) + '" data-act="new-type" data-v="' + t + '" aria-pressed="' + (s.type === t) + '"><b>' + t + '</b><span>' + TDESC[t] + '</span></button>';
      }).join('') + '</div></div>';
      if (s.type === 'มส') h += '<label class="field"><span class="lbl">เวลาเรียน (%)</span><input class="inp" type="number" inputmode="decimal" min="0" max="100" data-k="ms" value="' + esc(s.ms) + '" placeholder="เช่น 72"><div id="msw">' + msWarn(s.ms) + '</div></label>';
      h += '<label class="field"><span class="lbl">สาเหตุ</span><input class="inp" data-k="cause" maxlength="300" value="' + esc(s.cause) + '" placeholder="' + CAUSE_PH[s.type] + '"></label>';
      h += '<label class="field"><span class="lbl">สิ่งที่นักเรียนต้องทำ (บรรทัดละ 1 ข้อ)</span><textarea class="inp" data-k="tasks">' + esc(s.tasks) + '</textarea></label>';
      h += '<label class="field"><span class="lbl">ต้องแก้ให้เสร็จภายใน</span><input class="inp" type="date" data-k="due" min="' + ymd(now()) + '" value="' + esc(s.due) + '"></label>';
      h += '<div id="newErr" class="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="new-save">บันทึกและแจ้งนักเรียน</button>';
    } else {
      h += '<label class="search stu-search">' + ic('search', 20) + '<input id="sq" type="search" placeholder="พิมพ์ชื่อ เลขประจำตัว หรือห้อง เพื่อกรอง" autocomplete="off" value="' + esc(s.sq || '') + '"></label>' +
        '<div id="scls" class="chips stu-chips">' + (S.students ? stuChips() : '') + '</div><div id="sres" class="sres">' + stuResults(s.sq) + '</div></div>';
    }
    return h;
  }
  function loadStudents() {
    if (S.students && now() - S.studentsAt < 300000) return;
    API.call('listStudents').then(function (list) {
      S.students = list; S.studentsAt = now();
      if (S.sheet && S.sheet.kind === 'new' && !S.sheet.sid) { var sc = $('scls'); if (sc) sc.innerHTML = stuChips(); flipRender($('sres'), stuResults(S.sheet.sq)); }
      else if (S.sheet && S.sheet.kind === 'new') renderSheet();
      if (S.pop === 'search' && $('gsres')) $('gsres').innerHTML = gsResults(S.gsq || '');
      var tv = S.stack[S.stack.length - 1]; if (tv && tv.v === 'sum') renderMain();
    }).catch(function (e) { toast(e.message || 'โหลดรายชื่อนักเรียนไม่สำเร็จ'); });
  }

  /* ---------- report config ---------- */
  var DEFAULT_REPORT = {
    title: 'แบบรายงานการติดตามการแก้ผลการเรียน 0 ร มส', remark: true, remarkLabel: 'ความเห็นครูที่ปรึกษา',
    signers: [
      { id: 'student', label: 'นักเรียน', auto: 'student', on: true },
      { id: 'parent', label: 'ผู้ปกครอง', auto: 'parent', on: true },
      { id: 'advisor', label: 'ครูที่ปรึกษา', auto: 'advisor', on: true },
      { id: 'teacher', label: 'ครูผู้สอน', auto: 'teacher', on: false },
      { id: 'measure', label: 'หัวหน้างานวัดผล', name: '', on: true },
      { id: 'deputy', label: 'รองผู้อำนวยการฝ่ายวิชาการ', name: '', on: false },
      { id: 'director', label: 'ผู้อำนวยการโรงเรียน', name: '', on: true }
    ]
  };
  var AUTO_LABEL = { student: 'ใช้ชื่อนักเรียนอัตโนมัติ', parent: 'ใช้ชื่อผู้ปกครองอัตโนมัติ', advisor: 'ใช้ชื่อครูที่ปรึกษาของห้องอัตโนมัติ', teacher: 'ใช้ชื่อครูผู้สอนแต่ละวิชาอัตโนมัติ' };
  var TH_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  function reportCfg() {
    var raw = setting('reportConfig', '');
    try { var c = raw ? JSON.parse(raw) : null; if (c && c.signers && c.signers.length) return c; } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_REPORT));
  }
  function paperHtml(sid, cs) {
    var cfg = reportCfg(), s = cs[0] || {}, done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length;
    var st = { OPEN: 'รอรับทราบ', DOING: 'กำลังแก้', SUBMITTED: 'รอครูตรวจ', PASSED: 'รออนุมัติ', APPROVED: 'แก้เสร็จ', REPEAT: 'เรียนซ้ำ', HOLD: 'แขวนการติดตาม' };
    var dots = '......................................';
    var src = logoSrc(), d = new Date();
    var h = '<div class="paper"><div class="p-head">' + (src ? '<img class="p-logo" src="' + esc(src) + '" alt="">' : emblem()) +
      '<h3>' + esc(cfg.title || DEFAULT_REPORT.title) + '</h3><p>' + esc(setting('schoolName', 'โรงเรียนบ้านละลม')) + ' ' + esc(setting('areaName', '')) + '</p><p>' + term() + '</p></div>';
    var pimg = s.pv ? photoOf(sid, s.pv) : '';
    if (s.pv) h += '<div class="p-photo" data-ph="' + esc(sid) + '">' + (pimg ? '<img src="' + esc(pimg) + '" alt="">' : '') + '</div>';
    h += '<div class="p-info"><div>ชื่อ-สกุล <b>' + esc(s.studentName || '-') + '</b></div><div>เลขประจำตัว <b>' + esc(sid) + '</b></div><div>ชั้น <b>' + esc(s.classroom || '-') + '</b> เลขที่ <b>' + esc(s.number || '-') + '</b></div><div>ครูที่ปรึกษา <b>' + esc(s.advisorName || '-') + '</b></div></div>';
    h += '<div class="tbl-wrap"><table class="p-tbl"><thead><tr><th>ที่</th><th>รหัสวิชา</th><th>รายวิชา</th><th>ผลเดิม</th><th>ครั้งที่</th><th>สถานะ</th><th>ผลหลังแก้</th><th>ครูผู้สอน</th></tr></thead><tbody>';
    if (cs.length) cs.forEach(function (c, i) {
      h += '<tr><td>' + (i + 1) + '</td><td>' + esc(c.subject) + '</td><td class="l">' + esc(c.subjectName) + '</td><td>' + esc(c.type) + '</td><td>' + c.attempt + '</td><td>' + (st[c.status] || c.status) + '</td><td>' + (c.status === 'APPROVED' ? esc(c.grade) : '-') + '</td><td class="l">' + esc(c.teacherName) + '</td></tr>';
    });
    else h += '<tr><td colspan="8">ไม่มีรายวิชาที่ติด 0 ร มส</td></tr>';
    h += '</tbody></table></div><p class="p-sum">รวม ' + cs.length + ' รายวิชา แก้เสร็จ ' + done + ' รายวิชา ค้าง ' + (cs.length - done) + ' รายวิชา</p>';
    if (cfg.remark) h += '<div class="p-remark"><b>' + esc(cfg.remarkLabel || 'ความเห็นครูที่ปรึกษา') + '</b><div class="ln"></div><div class="ln"></div></div>';
    var sigs = [];
    cfg.signers.forEach(function (g) {
      if (g.on === false) return;
      if (g.auto === 'teacher') {
        var seen = {};
        cs.forEach(function (c) { if (c.teacherName && !seen[c.teacherName]) { seen[c.teacherName] = 1; sigs.push({ name: c.teacherName, role: g.label + ' ' + c.subjectName }); } });
        if (!cs.length) sigs.push({ name: '', role: g.label });
        return;
      }
      var name = g.auto === 'student' ? s.studentName : (g.auto === 'parent' ? s.parentName : (g.auto === 'advisor' ? s.advisorName : g.name));
      sigs.push({ name: name || '', role: g.label, img: !g.auto && cfg.printSig !== false && g.id ? (S.sigs || {})[g.id] : '' });
    });
    h += '<div class="p-sign">' + sigs.map(function (g) {
      return '<div class="sig">' + (g.img ? '<img class="sig-img" src="' + esc(g.img) + '" alt="">' : '') + 'ลงชื่อ ' + dots + '<br>(' + esc(g.name || dots) + ')<br><span class="role">' + esc(g.role) + '</span></div>';
    }).join('') + '</div>';
    h += '<div class="p-give">วันที่ ' + d.getDate() + ' ' + TH_FULL[d.getMonth()] + ' พ.ศ. ' + (d.getFullYear() + 543) + '</div></div>';
    return h;
  }
  function vReportClass(cls) {
    var sids = [], seen = {};
    S.cases.filter(function (c) { return c.classroom === cls; }).sort(function (a, b) { return (+a.number || 0) - (+b.number || 0); })
      .forEach(function (c) { if (!seen[c.sid]) { seen[c.sid] = 1; sids.push(c.sid); } });
    var h = header('รายงานทั้งห้อง ' + esc(cls), sids.length + ' คน', '', true) + '<main class="main"><div class="papers">';
    sids.forEach(function (sid) {
      h += paperHtml(sid, S.cases.filter(function (c) { return c.sid === sid; }).sort(function (a, b) { return (a.created || 0) - (b.created || 0); }));
    });
    return h + '</div></main>' + actbar('<button class="btn btn-primary" data-act="print">' + ic('printer', 20) + 'พิมพ์ทั้งห้อง หรือบันทึกเป็น PDF</button>');
  }
  function shReportCfg() {
    var c = S.sheet.cfg;
    var h = '<h3 class="sh-t">รูปแบบรายงาน</h3><p class="sh-s">กำหนดหัวรายงานและผู้ลงนาม ใช้กับรายงานทุกฉบับ</p>';
    h += '<label class="field"><span class="lbl">ชื่อรายงาน</span><input class="inp" data-rk="title" value="' + esc(c.title) + '"></label>';
    h += '<button class="toggle" data-act="rc-remark" style="margin-bottom:10px"><span><b>ช่องความเห็น</b><small>เว้นบรรทัดให้เขียนความเห็นก่อนลงนาม</small></span><span class="sw' + (c.remark ? ' on' : '') + '"></span></button>';
    if (c.remark) h += '<label class="field"><span class="lbl">หัวข้อช่องความเห็น</span><input class="inp" data-rk="remarkLabel" value="' + esc(c.remarkLabel || '') + '" placeholder="ความเห็นครูที่ปรึกษา"></label>';
    h += '<button class="toggle" data-act="rc-printsig" style="margin-bottom:12px"><span><b>พิมพ์ลายเซ็นดิจิทัล</b><small>แสดงลายเซ็นที่บันทึกไว้บนรายงาน ปิดเมื่อต้องการเซ็นด้วยมือ</small></span><span class="sw' + (c.printSig === false ? '' : ' on') + '"></span></button>';
    h += '<span class="lbl">ผู้ลงนาม (เรียงตามลำดับในรายงาน)</span><div class="group" style="padding:0 14px;margin-bottom:12px">';
    c.signers.forEach(function (g, i) {
      h += '<div class="sg-row' + (g.on === false ? ' off' : '') + '"><button class="sw' + (g.on === false ? '' : ' on') + '" data-act="rc-toggle" data-i="' + i + '" aria-label="แสดงผู้ลงนามนี้" style="border:0;margin-top:6px"></button>' +
        '<div class="sg-main"><input class="inp" data-ri="' + i + '" data-rf="label" value="' + esc(g.label) + '" placeholder="ตำแหน่ง เช่น ผู้อำนวยการ">' +
        (g.auto ? '<div class="sg-auto">' + AUTO_LABEL[g.auto] + '</div>' : '<input class="inp" data-ri="' + i + '" data-rf="name" value="' + esc(g.name || '') + '" placeholder="ชื่อ-สกุล (เว้นว่างให้เขียนด้วยมือ)">' +
          (g.id ? '<button type="button" class="sig-btn" data-act="sig-open" data-i="' + i + '">' + ((S.sigs || {})[g.id] ? '<img src="' + esc(S.sigs[g.id]) + '" alt=""><span>แก้ลายเซ็น</span>' : ic('send', 16) + '<span>เพิ่มลายเซ็นดิจิทัล</span>') + '</button>' : '')) + '</div>' +
        '<div class="sg-tools"><button data-act="rc-up" data-i="' + i + '" aria-label="เลื่อนขึ้น">▲</button><button data-act="rc-down" data-i="' + i + '" aria-label="เลื่อนลง">▼</button>' +
        (g.auto ? '' : '<button data-act="rc-del" data-i="' + i + '" aria-label="ลบ" style="color:var(--zero)">✕</button>') + '</div></div>';
    });
    h += '</div><button class="btn btn-ghost btn-block" data-act="rc-add" style="margin-bottom:10px">' + ic('plus', 20) + 'เพิ่มผู้ลงนาม</button>';
    h += '<div class="actbar-in"><button class="btn btn-ghost" data-act="rc-reset">ค่าเริ่มต้น</button><button class="btn btn-primary" data-act="rc-save">บันทึก</button></div>';
    return h;
  }
  function processLogo(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) return reject({ message: 'เลือกไฟล์รูปภาพ' });
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var sizes = [256, 200, 160, 128], out = null;
        for (var i = 0; i < sizes.length && !out; i++) {
          var n = sizes[i], cv = document.createElement('canvas');
          cv.width = n; cv.height = n;
          var k = Math.min(n / img.naturalWidth, n / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
          cv.getContext('2d').drawImage(img, (n - w) / 2, (n - h) / 2, w, h);
          var png = cv.toDataURL('image/png');
          if (png.length <= 46000) out = png;
          else { var wp = cv.toDataURL('image/webp', 0.92); if (wp.indexOf('data:image/webp') === 0 && wp.length <= 46000) out = wp; }
        }
        URL.revokeObjectURL(url);
        out ? resolve(out) : reject({ message: 'รูปมีรายละเอียดมากเกินไป ลองใช้ไฟล์ PNG พื้นใสที่เรียบง่ายขึ้น' });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject({ message: 'เปิดรูปนี้ไม่ได้' }); };
      img.src = url;
    });
  }
  var RESET_OPTS = [
    ['cases', 'รายการ 0 ร มส ทั้งหมด', 'รวมประวัติ ไฟล์หลักฐาน และการแจ้งเตือน (ไฟล์ย้ายไปถังขยะ Drive กู้คืนได้ 30 วัน)'],
    ['students', 'รายชื่อนักเรียนทั้งหมด', 'รวมการเชื่อม LINE ผู้ปกครอง (ต้องล้างรายการ 0 ร มส ด้วย)'],
    ['subjects', 'รายวิชาทั้งหมด', ''],
    ['users', 'ครูและเจ้าหน้าที่', 'ยกเว้นบัญชีผู้ดูแลระบบ (admin) ทุกบัญชี']
  ];
  function shResetData() {
    var s = S.sheet;
    var h = '<h3 class="sh-t">ล้างข้อมูลทดลอง</h3><p class="sh-s">ใช้ครั้งเดียวก่อนเริ่มใช้งานจริง ระบบจะ<b>สำรอง Google Sheet ทั้งไฟล์</b>ลง Drive ให้อัตโนมัติก่อนล้าง</p>';
    h += '<div class="group" style="margin-bottom:14px">' + RESET_OPTS.map(function (o) {
      var on = !!s.opt[o[0]], forced = o[0] === 'cases' && s.opt.students;
      return '<button class="task' + (on ? ' on' : '') + '" data-act="reset-opt" data-v="' + o[0] + '"' + (forced ? ' disabled' : '') + ' style="text-decoration:none"><span class="box">' + ic('check', 18) + '</span><span><b style="display:block">' + o[1] + '</b>' + (o[2] ? '<small class="t-muted">' + o[2] + '</small>' : '') + '</span></button>';
    }).join('') + '</div>';
    h += '<div class="banner ok" style="margin:0 0 14px">' + ic('seal') + '<div><b>ไม่ถูกลบ</b><p>บัญชีผู้ดูแลระบบ การตั้งค่า ปีการศึกษา โลโก้ รูปแบบรายงาน การตั้งค่า LINE และบันทึกการใช้งาน</p></div></div>';
    h += '<label class="field"><span class="lbl">พิมพ์คำว่า <b class="t-bad">ล้างข้อมูล</b> เพื่อยืนยัน</span><input class="inp" id="resetConfirm" autocomplete="off" value="' + esc(s.confirm) + '"></label>';
    h += '<button class="btn btn-bad btn-block" data-act="reset-run"' + (s.confirm.trim() === 'ล้างข้อมูล' ? '' : ' disabled') + '>' + ic('refresh', 20) + 'สำรองข้อมูลแล้วล้าง</button>';
    return h;
  }
  function shSetupReal() {
    var r = S.sheet.result || {};
    var steps = [
      ['settings', 'lock', 'ตั้งค่าปีการศึกษาและภาคเรียน', 'ตรวจชื่อโรงเรียน เกณฑ์การแก้ และวันแจ้งเตือน'],
      ['users', 'users', 'เพิ่มครูและเจ้าหน้าที่', 'ระบบสร้างรหัสชั่วคราวให้แต่ละคน'],
      ['subjects', 'file', 'เพิ่มรายวิชา', 'รหัสวิชา ระดับชั้น และครูผู้สอน'],
      ['students', 'user', 'นำเข้านักเรียนจาก Excel', 'คัดลอกวางได้ทั้งโรงเรียนในครั้งเดียว']
    ];
    return '<div class="done-ic">' + ic('check', 44) + '</div><h3 class="done-t">ล้างข้อมูลเรียบร้อย</h3>' +
      '<p class="done-s">ลบรายการ ' + (r.cases || 0) + ' นักเรียน ' + (r.students || 0) + ' รายวิชา ' + (r.subjects || 0) + ' บัญชีครู ' + (r.users || 0) + '</p>' +
      (r.backup ? '<a class="pub-link" href="' + esc(r.backup.url) + '" target="_blank" rel="noopener" style="margin:0 0 16px">' + ic('file', 20) + 'เปิดไฟล์สำรอง</a>' : '') +
      '<span class="lbl">เริ่มกรอกข้อมูลจริงตามลำดับนี้</span><div class="group" style="margin-bottom:14px">' + steps.map(function (x, i) {
        return '<button class="row" data-act="setup-go" data-v="' + x[0] + '"><span class="avatar">' + (i + 1) + '</span><span class="row-main"><span class="row-t">' + x[2] + '</span><span class="row-s">' + x[3] + '</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
      }).join('') + '</div><button class="btn btn-ghost btn-block" data-act="close-sheet">ไว้ทีหลัง</button>';
  }
  function shTheme() {
    var T = window.Theme, cur = T ? T.get() : { hex: '#6E4BC9', fx: true };
    if (!T) return '<div class="empty">ไม่พบไฟล์ theme.js</div>';
    var known = T.presets.some(function (p) { return p.hex.toLowerCase() === cur.hex.toLowerCase(); });
    return '<h3 class="sh-t">สีธีมและเอฟเฟค</h3><p class="sh-s">เลือกแล้วเปลี่ยนทันที ใช้กับเครื่องนี้</p>' +
      '<div class="theme-prev">' + esc((T.presets.filter(function (p) { return p.hex.toLowerCase() === cur.hex.toLowerCase(); })[0] || { name: 'สีที่เลือกเอง' }).name) + '</div>' +
      '<div class="swatches">' + T.presets.map(function (p) {
        return '<button class="swatch" style="background:' + p.hex + '" data-act="theme-pick" data-v="' + p.hex + '" aria-pressed="' + (p.hex.toLowerCase() === cur.hex.toLowerCase()) + '" aria-label="' + esc(p.name) + '" title="' + esc(p.name) + '"></button>';
      }).join('') + '</div>' +
      '<label class="color-row"><input type="color" id="themeColor" value="' + esc(cur.hex) + '"><span><b>เลือกสีเอง</b><br><small class="t-muted">' + (known ? 'แตะเพื่อเลือกสีใดก็ได้' : 'กำลังใช้ ' + esc(cur.hex.toUpperCase())) + '</small></span></label>' +
      '<button class="toggle" data-act="theme-fx" style="margin-bottom:10px"><span><b>เอฟเฟคแสงสี</b><small>แสงเรือง เฟด และประกายวิ่ง ปิดได้ถ้าเครื่องช้า</small></span><span class="sw' + (cur.fx ? ' on' : '') + '"></span></button>' +
      '<button class="toggle" data-act="theme" style="margin-bottom:14px"><span><b>โหมดมืด</b><small>ถนอมสายตาตอนกลางคืน</small></span><span class="sw' + (isDark() ? ' on' : '') + '"></span></button>' +
      '<div class="actbar-in"><button class="btn btn-ghost" data-act="theme-reset">ใช้สีของโรงเรียน</button><button class="btn btn-primary" data-act="close-sheet">เสร็จแล้ว</button></div>';
  }
  function shLogo() {
    var s = S.sheet, src = s.newData !== undefined ? s.newData : logoSrc();
    return '<h3 class="sh-t">โลโก้โรงเรียน</h3><p class="sh-s">ใช้ที่หน้าเข้าสู่ระบบ หน้าโหลด ไอคอนแอป และหัวรายงาน แนะนำไฟล์ PNG พื้นใส</p>' +
      '<div class="logo-prev">' + (src ? '<img src="' + esc(src) + '" alt="โลโก้">' : ic('image', 40)) + '</div>' +
      '<div class="ev-add" style="margin-top:0"><button class="btn btn-ghost" data-act="logo-pick">' + ic('image', 20) + 'เลือกรูป</button><button class="btn btn-ghost" data-act="logo-remove">ใช้รูปเริ่มต้น</button></div>' +
      '<button class="btn btn-primary btn-block" data-act="logo-save" style="margin-top:12px"' + (s.newData === undefined ? ' disabled' : '') + '>บันทึกโลโก้</button>';
  }

  /* ---------- เอฟเฟคฉลอง (กระดาษสีโปรย) ---------- */
  function confetti(ms) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    var cv = document.createElement('canvas'), g = cv.getContext && cv.getContext('2d');
    if (!g) return;
    cv.className = 'confetti';
    var W = cv.width = window.innerWidth, H = cv.height = window.innerHeight;
    document.body.appendChild(cv);
    var css = getComputedStyle(document.documentElement);
    var colors = [css.getPropertyValue('--brand').trim() || '#6E4BC9', '#FFD43B', '#00E5FF', '#FF6B9A', '#51CF66', '#FF922B', '#B46CFF'];
    var P = [], i;
    for (i = 0; i < 160; i++) {
      P.push({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 15 - 5,
        w: 6 + Math.random() * 6, h: 8 + Math.random() * 8, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[i % colors.length] });
    }
    var t0 = Date.now(), dur = ms || 2800;
    (function frame() {
      var t = Date.now() - t0;
      g.clearRect(0, 0, W, H);
      g.globalAlpha = t > dur - 600 ? Math.max(0, (dur - t) / 600) : 1;
      P.forEach(function (p) {
        p.vy += 0.38; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.c;
        g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2))); g.restore();
      });
      if (t < dur) requestAnimationFrame(frame); else if (cv.parentNode) cv.parentNode.removeChild(cv);
    })();
  }
  function celebrate(title, sub) {
    haptic();
    try { if (navigator.vibrate) navigator.vibrate([20, 60, 20]); } catch (e) {}
    confetti();
    if (hasSwal()) swalFire({ icon: 'success', title: title, html: '<div style="font-size:15px">' + esc(sub || '') + '</div>', timer: 3600, timerProgressBar: true, showConfirmButton: false, customClass: { popup: 'sw-pop' } });
    else toast(title);
  }
  /** นักเรียน: ฉลองเมื่อมีวิชาที่เพิ่งได้รับอนุมัติ (จำว่าฉลองไปแล้ว ไม่ซ้ำ) */
  function checkCelebrate() {
    if (!S.user || S.user.role !== 'student') return;
    var key = 'followup_seen_ok_' + S.user.id, seen = null;
    try { seen = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    var ok = S.cases.filter(function (c) { return c.status === 'APPROVED'; }).map(function (c) { return c.id; });
    var fresh = seen ? ok.filter(function (id) { return seen.indexOf(id) < 0; }) : [];
    try { localStorage.setItem(key, JSON.stringify(ok)); } catch (e) {}
    if (!fresh.length) return;
    var c = caseById(fresh[0]);
    setTimeout(function () {
      celebrate('ยินดีด้วย แก้ผ่านแล้ว!', fresh.length > 1 ? 'ได้รับอนุมัติ ' + fresh.length + ' วิชา' : c.subjectName + ' ได้ระดับผลการเรียน ' + c.grade);
    }, 500);
  }

  /* ---------- ส่งออก Excel ---------- */
  var ST_TH = { OPEN: 'รอรับทราบ', DOING: 'กำลังแก้', SUBMITTED: 'รอครูตรวจ', PASSED: 'รออนุมัติ', APPROVED: 'แก้เสร็จ', REPEAT: 'เรียนซ้ำ', HOLD: 'แขวนการติดตาม' };
  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var sc = document.createElement('script');
      sc.src = src; sc.onload = resolve; sc.onerror = reject;
      document.head.appendChild(sc);
    });
  }
  function exportRows(cs) {
    var head = ['ที่', 'เลขประจำตัว', 'ชื่อ-สกุล', 'ชั้น', 'เลขที่', 'รหัสวิชา', 'รายวิชา', 'ผลเดิม', 'ครั้งที่แก้', 'สถานะ', 'ผลหลังแก้', 'ครูผู้สอน', 'กำหนดส่ง', 'สาเหตุ'];
    var rows = cs.slice().sort(function (a, b) {
      return a.classroom === b.classroom ? ((+a.number || 0) - (+b.number || 0) || (a.subject < b.subject ? -1 : 1)) : (a.classroom < b.classroom ? -1 : 1);
    }).map(function (c, i) {
      return [i + 1, c.sid, c.studentName, c.classroom, +c.number || '', c.subject, c.subjectName, c.type, c.attempt, ST_TH[c.status] || c.status,
        c.status === 'APPROVED' ? c.grade : '', c.teacherName, c.due ? thDate(c.due) : '', c.cause || ''];
    });
    return [head].concat(rows);
  }
  function summaryRows(cs, keyFn, label) {
    var g = {}, order = [];
    cs.forEach(function (c) {
      var k = keyFn(c);
      if (!g[k]) { g[k] = { '0': 0, 'ร': 0, 'มส': 0, done: 0, hold: 0, repeat: 0, total: 0 }; order.push(k); }
      var x = g[k]; x.total++;
      if (c.status === 'APPROVED') x.done++; else if (c.status === 'HOLD') x.hold++; else if (c.status === 'REPEAT') x.repeat++; else if (x[c.type] !== undefined) x[c.type]++;
    });
    order.sort();
    var out = [[label, 'ค้าง 0', 'ค้าง ร', 'ค้าง มส', 'แก้เสร็จ', 'เรียนซ้ำ', 'แขวน', 'ทั้งหมด', 'ร้อยละแก้เสร็จ']];
    order.forEach(function (k) { var x = g[k]; out.push([k, x['0'], x['ร'], x['มส'], x.done, x.repeat, x.hold, x.total, x.total ? Math.round(x.done * 1000 / x.total) / 10 : 0]); });
    return out;
  }
  function exportExcel(scopeCases, label) {
    var cs = scopeCases || S.cases;
    if (!cs.length) { toast('ยังไม่มีข้อมูลให้ส่งออก'); return; }
    var name = 'ติดตามแก้0รมส_' + (label ? label.replace(/[\\/:*?"<>|\s]/g, '-') + '_' : '') + (setting('academicYear', '') + '-' + setting('semester', '')) + '.xlsx';
    loading('กำลังสร้างไฟล์ Excel', cs.length + ' รายการ');
    var go = function () {
      var X = window.XLSX, wb = X.utils.book_new();
      var add = function (rows, title, widths) {
        var ws = X.utils.aoa_to_sheet(rows);
        ws['!cols'] = widths.map(function (w) { return { wch: w }; });
        X.utils.book_append_sheet(wb, ws, title);
      };
      add(exportRows(cs), 'รายการทั้งหมด', [5, 12, 26, 8, 6, 10, 22, 7, 9, 13, 9, 24, 12, 30]);
      add(summaryRows(cs, function (c) { return c.classroom || '-'; }, 'ห้อง'), 'สรุปรายห้อง', [10, 8, 8, 8, 9, 9, 8, 9, 14]);
      add(summaryRows(cs, function (c) { return c.subject + ' ' + c.subjectName; }, 'รายวิชา'), 'สรุปรายวิชา', [28, 8, 8, 8, 9, 9, 8, 9, 14]);
      add(summaryRows(cs, function (c) { return c.teacherName || '-'; }, 'ครูผู้สอน'), 'สรุปรายครู', [26, 8, 8, 8, 9, 9, 8, 9, 14]);
      X.writeFile(wb, name);
      loaded(); successBox('ส่งออก Excel แล้ว', name);
    };
    if (window.XLSX) { go(); return; }
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').then(go).catch(function () {
      // สำรอง: CSV (เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน)
      var csv = exportRows(cs).map(function (r) { return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
      a.download = name.replace('.xlsx', '.csv'); document.body.appendChild(a); a.click(); a.parentNode.removeChild(a);
      loaded(); toast('ส่งออกเป็นไฟล์ CSV แล้ว (เปิดด้วย Excel ได้)');
    });
  }

  /* ---------- ลายเซ็นดิจิทัล ---------- */
  var SIG_KEY = 'followup_sigs';
  (function () { try { var x = JSON.parse(localStorage.getItem(SIG_KEY) || 'null'); if (x) { S.sigs = x.sigs || {}; S.sigVer = x.ver || ''; } } catch (e) {} })();
  function loadSigs(force) {
    if (!S.user || S.user.role === 'student') return;
    var want = String(setting('sigVer', '') || '');
    if (!force && S.sigs && want === String(S.sigVer || '')) return;
    API.call('getSignatures').then(function (d) {
      S.sigs = d.sigs || {}; S.sigVer = d.ver || '';
      try { localStorage.setItem(SIG_KEY, JSON.stringify({ sigs: S.sigs, ver: S.sigVer })); } catch (e) {}
      render(); if (S.sheet && S.sheet.kind === 'report-config') renderSheet();
    }).catch(function () {});
  }
  /** ตัดขอบว่าง + ทำพื้นหลังโปร่งใส + ย่อให้สูงไม่เกิน maxH แล้วคืนค่าเป็น PNG */
  function trimSignature(src, whiten, maxH) {
    var w = src.width, h = src.height, g = src.getContext('2d'), img = g.getImageData(0, 0, w, h), d = img.data;
    var x0 = w, y0 = h, x1 = -1, y1 = -1, x, y, i;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      i = (y * w + x) * 4;
      if (whiten) {
        var lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114);
        if (lum > 165) d[i + 3] = 0;
        else { d[i] = Math.min(d[i], 40); d[i + 1] = Math.min(d[i + 1], 45); d[i + 2] = Math.max(d[i + 2], 90); d[i + 3] = 255; }
      }
      if (d[i + 3] > 20) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
    }
    if (x1 < 0) return '';
    g.putImageData(img, 0, 0);
    var pad = 6, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2;
    var k = Math.min(1, (maxH || 140) / ch, 520 / cw);
    var out = document.createElement('canvas');
    out.width = Math.max(1, Math.round(cw * k)); out.height = Math.max(1, Math.round(ch * k));
    out.getContext('2d').drawImage(src, x0 - pad, y0 - pad, cw, ch, 0, 0, out.width, out.height);
    return out.toDataURL('image/png');
  }
  function shSig() {
    var s = S.sheet, cur = s.data !== undefined ? s.data : (S.sigs || {})[s.id];
    return '<h3 class="sh-t">ลายเซ็น ' + esc(s.label) + '</h3><p class="sh-s">' + esc(s.name || 'ไม่ได้ระบุชื่อ') + ' ใช้พิมพ์ลงรายงานทุกฉบับ</p>' +
      (s.mode === 'draw'
        ? '<div class="sig-pad-wrap"><canvas id="sigPad" class="sig-pad"></canvas><span class="sig-line">ลงชื่อบนเส้นนี้</span></div>' +
          '<div class="actbar-in" style="margin:10px 0 14px"><button class="btn btn-ghost" data-act="sig-clear">ล้าง</button><button class="btn btn-primary" data-act="sig-use">ใช้ลายเซ็นนี้</button></div>'
        : '<div class="sig-prev">' + (cur ? '<img src="' + esc(cur) + '" alt="ลายเซ็น">' : '<span class="t-muted">ยังไม่มีลายเซ็น</span>') + '</div>' +
          '<div class="ev-add" style="margin-top:0"><button class="btn btn-ghost" data-act="sig-draw">' + ic('send', 20) + 'เซ็นบนจอ</button><button class="btn btn-ghost" data-act="sig-upload">' + ic('camera', 20) + 'ถ่าย/อัปโหลดรูป</button></div>' +
          '<p class="hint" style="margin:8px 2px 12px">ถ่ายรูปลายเซ็นบนกระดาษขาว ระบบจะลบพื้นหลังให้อัตโนมัติ</p>' +
          '<div class="actbar-in"><button class="btn btn-bad" data-act="sig-remove"' + (cur ? '' : ' disabled') + '>ลบลายเซ็น</button><button class="btn btn-primary" data-act="sig-save"' + (s.data === undefined ? ' disabled' : '') + '>บันทึก</button></div>' +
          '<button class="btn btn-ghost btn-block" data-act="sig-back" style="margin-top:10px">กลับไปรูปแบบรายงาน</button>');
  }
  function initSigPad() {
    var cv = $('sigPad'); if (!cv) return;
    var r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    cv.width = Math.round((r.width || 520) * dpr); cv.height = Math.round((r.height || 200) * dpr);
    var g = cv.getContext('2d');
    g.scale(dpr, dpr); g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = '#1A2A7A'; g.lineWidth = 2.6;
    var drawing = false, last = null;
    var pt = function (e) { var b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    cv.addEventListener('pointerdown', function (e) { drawing = true; last = pt(e); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); e.preventDefault(); });
    cv.addEventListener('pointermove', function (e) {
      if (!drawing) return;
      var p = pt(e); g.beginPath(); g.moveTo(last.x, last.y); g.lineTo(p.x, p.y); g.stroke(); last = p; S.sheet.drawn = true; e.preventDefault();
    });
    var end = function () { drawing = false; };
    cv.addEventListener('pointerup', end); cv.addEventListener('pointerleave', end); cv.addEventListener('pointercancel', end);
  }

  /* ---------- LINE ---------- */
  function loadQR(cb) {
    if (window.QRCode) return cb();
    var sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
    sc.onload = function () { cb(); };
    sc.onerror = function () { cb(true); };
    document.head.appendChild(sc);
  }
  function drawQR() {
    var s = S.sheet, box = $('qrBox');
    if (!s || !box || !s.link) return;
    loadQR(function (err) {
      var b = $('qrBox');
      if (!b || err || !window.QRCode) { if (b) b.innerHTML = ''; return; }
      b.innerHTML = '';
      new window.QRCode(b, { text: s.link, width: 196, height: 196, correctLevel: window.QRCode.CorrectLevel.M });
    });
  }
  function openLine(target, sid, name) {
    openSheet({ kind: 'line', target: target, sid: sid || null, name: name || '' });
  }
  function shLine() {
    var s = S.sheet, u = S.user, isStu = s.target === 'student' || u.role === 'student';
    var title = s.target === 'student' ? 'LINE ผู้ปกครองของ ' + s.name : (u.role === 'student' ? 'LINE ผู้ปกครอง' : 'LINE ส่วนตัว');
    var linked = s.target === 'student' ? s.linked : u.lineLinked;
    var lineOn = setting('lineEnabled', false) === true || String(setting('lineEnabled', '')).toUpperCase() === 'TRUE';
    var h = '<h3 class="sh-t">' + esc(title) + '</h3>';
    h += '<p class="sh-s">' + (isStu ? 'ผู้ปกครองจะได้รับแจ้งเตือนทาง LINE เมื่อมีรายการ 0 ร มส ผลการแก้ และก่อนครบกำหนด' : 'รับแจ้งเตือนทาง LINE เมื่อมีนักเรียนส่งหลักฐาน และสรุปงานทุกเช้า') + '</p>';
    if (!lineOn) return h + '<div class="banner info" style="margin-top:0">' + ic('alert') + '<div><b>ระบบยังไม่เปิดใช้ LINE</b><p>ผู้ดูแลระบบต้องตั้งค่า LINE OA ก่อน</p></div></div><button class="btn btn-ghost btn-block" data-act="close-sheet" style="margin-top:14px">ปิด</button>';
    if (linked) h += '<div class="banner ok" style="margin:0 0 14px">' + ic('check') + '<div><b>เชื่อมแล้ว</b><p>' + (isStu ? 'เชื่อมผู้ปกครองได้สูงสุด 3 บัญชี สร้าง QR ใหม่เพื่อเพิ่มอีกคนได้' : 'บัญชี LINE นี้จะได้รับแจ้งเตือน') + '</p></div></div>';
    if (s.err) h += '<div class="err">' + esc(s.err) + '</div>';
    if (!s.code) {
      h += '<button class="btn btn-primary btn-block" data-act="line-code">' + (s.loading ? '<span class="spin"></span>กำลังสร้าง' : ic('chat', 20) + (linked && isStu ? 'สร้าง QR เชื่อมผู้ปกครองอีกคน' : 'สร้าง QR สำหรับเชื่อม')) + '</button>';
    } else {
      var oa = s.oaId;
      h += '<div class="qr-wrap">' + (s.link ? '<div id="qrBox" class="qr"><span class="spin"></span></div>' : '') +
        '<div class="temp-pw" style="margin-top:12px">' + esc(s.code) + '</div><p class="sh-s" style="text-align:center">รหัสใช้ได้ 30 นาที ใช้ได้ครั้งเดียว</p></div>';
      h += '<ol class="next">' + (s.link
        ? (isStu ? '<li>ผู้ปกครองเปิด LINE แล้วสแกน QR นี้ (หรือส่งภาพหน้าจอให้ผู้ปกครอง)</li>' : '<li>สแกน QR นี้ หรือกดปุ่มเปิด LINE ด้านล่าง</li>') + '<li>กดส่งข้อความ ผูก ' + esc(s.code) + ' ที่ขึ้นมาในแชท</li><li>รอข้อความตอบกลับ เชื่อมสำเร็จ</li>'
        : '<li>เพิ่มเพื่อน LINE OA ของโรงเรียน</li><li>พิมพ์ ผูก ' + esc(s.code) + ' ในแชท</li>') + '</ol>';
      h += '<div class="actbar-in">' + (s.link ? '<a class="btn btn-ok" href="' + esc(s.link) + '" target="_blank" rel="noopener">' + ic('chat', 20) + 'เปิด LINE</a>' : '') +
        '<button class="btn btn-ghost" data-act="line-check">ตรวจสอบสถานะ</button></div>';
      if (oa && s.addFriend) h += '<p class="hint" style="text-align:center;margin-top:10px">ยังไม่ได้เพิ่มเพื่อน? <a href="' + esc(s.addFriend) + '" target="_blank" rel="noopener">เพิ่มเพื่อน ' + esc(oa) + '</a></p>';
    }
    if (linked) h += '<button class="btn btn-bad btn-block" data-act="line-unlink" style="margin-top:14px">ยกเลิกการเชื่อม LINE ' + (isStu ? 'ผู้ปกครองทั้งหมด' : '') + '</button>';
    return h + '<button class="btn btn-ghost btn-block" data-act="close-sheet" style="margin-top:10px">ปิด</button>';
  }
  function shLineStatus() {
    var d = S.sheet.data;
    var h = '<h3 class="sh-t">LINE OA ของโรงเรียน</h3>';
    if (!d) return h + twLoad('กำลังโหลด');
    h += '<div class="group" style="margin-bottom:14px"><dl class="kv">' +
      '<dt>สถานะ</dt><dd>' + (d.enabled && d.hasToken ? '<span class="chip ch-ok">เปิดใช้งาน</span>' : '<span class="chip ch-bad">ยังไม่เปิด</span>') + '</dd>' +
      '<dt>บัญชี</dt><dd>' + (d.bot ? esc(d.bot.name + ' ' + d.bot.basicId) : '-') + '</dd>' +
      '<dt>ข้อความ push เดือนนี้</dt><dd>' + (d.used === null ? '-' : esc(d.used)) + (d.quota ? ' / ' + esc(d.quota) : '') + '</dd>' +
      '<dt>ผู้ปกครองที่เชื่อม</dt><dd>' + d.parents + ' บัญชี (' + d.students + ' นักเรียน)</dd>' +
      '<dt>ครูที่เชื่อม</dt><dd>' + d.staff + ' คน</dd></dl></div>';
    if (d.error) h += '<div class="warnbox" style="margin-bottom:14px">' + esc(d.error) + '</div>';
    if (d.quota && d.used !== null && d.used >= d.quota * 0.8) h += '<div class="warnbox" style="margin-bottom:14px">ใช้โควตาไปแล้วเกิน 80% พิจารณาปิดการแจ้งเตือนบางประเภทในหน้าตั้งค่า</div>';
    h += '<span class="lbl">Webhook URL (ใส่ใน LINE Developers ห้ามเปิดเผย)</span><div class="cols-hint" style="word-break:break-all;user-select:all">' + esc(d.webhook || 'Deploy เป็น Web app ก่อน') + '</div>';
    h += '<div class="actbar-in"><button class="btn btn-ghost" data-act="copy-text" data-v="' + esc(d.webhook) + '">คัดลอก URL</button><button class="btn btn-ghost" data-act="line-test">ทดสอบส่ง</button></div>';
    h += '<button class="btn btn-primary btn-block" data-act="adm-open" data-v="settings" style="margin-top:10px">ตั้งค่า LINE</button>';
    return h;
  }

  function shBackup() {
    var d = S.sheet.data, h = '<h3 class="sh-t">สำรองข้อมูลอัตโนมัติ</h3><p class="sh-s">คัดลอก Google Sheet ทั้งไฟล์ไว้ใน Drive ทุกวันอาทิตย์ ตี 2</p>';
    if (!d) return h + twLoad('กำลังโหลด');
    var on = d.enabled && d.scheduled;
    h += '<button class="toggle" data-act="bk-toggle" style="margin-bottom:10px"' + (S.sheet.busy ? ' disabled' : '') + '><span><b>สำรองทุกสัปดาห์</b><br><small class="t-muted">' +
      (on ? 'เปิดอยู่ ครั้งต่อไปวันอาทิตย์ 02:00 น.' : (d.enabled && !d.scheduled ? 'ยังไม่ได้ตั้งเวลา แตะเพื่อเปิดใหม่' : 'ปิดอยู่')) + '</small></span><span class="sw' + (on ? ' on' : '') + '"></span></button>';
    h += '<div class="group" style="margin-bottom:12px"><dl class="kv"><dt>สำรองล่าสุด</dt><dd>' + (d.last ? thDate(d.last) + ' ' + thTime(d.last) + ' น.' : 'ยังไม่เคย') + '</dd>' +
      '<dt>เก็บไว้ล่าสุด</dt><dd><span class="bk-keep">' + [4, 8, 12, 26].map(function (n) {
        return '<button class="chip' + (d.keep === n ? ' ch-info' : '') + '" data-act="bk-keep" data-v="' + n + '">' + n + ' ชุด</button>';
      }).join('') + '</span></dd></dl></div>';
    h += '<div class="sec" style="margin-top:4px"><h2>ไฟล์สำรอง ' + d.list.length + '</h2>' + (d.folderUrl ? '<a class="link" href="' + esc(d.folderUrl) + '" target="_blank" rel="noopener">เปิดโฟลเดอร์</a>' : '') + '</div>';
    h += '<div class="group bk-list">' + (d.list.length ? d.list.map(function (f) {
      return '<a class="row" href="' + esc(f.url) + '" target="_blank" rel="noopener"><span class="nf-ic ok">' + ic('file', 20) + '</span><span class="row-main"><span class="row-t">' + esc(f.name.replace(/ \d{4}-\d{2}-\d{2} \d{4}$/, '')) + '</span><span class="row-s">' + thDate(f.at) + ' ' + thTime(f.at) + ' น. · ' + ago(f.at) + '</span></span><span class="chev">' + ic('chev', 20) + '</span></a>';
    }).join('') : '<div class="empty">ยังไม่มีไฟล์สำรอง กดสำรองตอนนี้เพื่อสร้างชุดแรก</div>') + '</div>';
    h += '<p class="hint" style="margin:10px 2px">กู้คืน: เปิดไฟล์สำรอง แล้วคัดลอกแผ่นงานที่ต้องการกลับไปวางในไฟล์หลัก หรือแจ้งผู้ดูแลระบบ</p>';
    h += '<button class="btn btn-primary btn-block" data-act="bk-now"' + (S.sheet.busy ? ' disabled' : '') + '>' + (S.sheet.busy === 'now' ? '<span class="spin"></span>กำลังสำรอง' : ic('refresh', 20) + 'สำรองตอนนี้') + '</button>';
    return h;
  }
  var DEV_FORM = [
    ['name', 'ชื่อ-นามสกุล', 'input', 'เช่น นายชิติพัทธ์ นิลวรรณ'], ['position', 'ตำแหน่ง', 'input', 'เช่น ครู วิทยฐานะครูชำนาญการ'],
    ['org', 'หน่วยงาน', 'input', 'เช่น โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3'],
    ['bio', 'เกี่ยวกับผู้พัฒนา', 'area', 'แนะนำตัวสั้นๆ ประสบการณ์ แรงบันดาลใจในการพัฒนาระบบ'],
    ['skills', 'ความเชี่ยวชาญ (คั่นด้วยจุลภาค)', 'input', 'เช่น คณิตศาสตร์, Google Apps Script, ออกแบบเว็บ'],
    ['works', 'ผลงาน (บรรทัดละ 1 รายการ)', 'area', 'เช่น ระบบติดตามการแก้ 0 ร มส\nระบบเช็กชื่อนักเรียนด้วย QR'],
    ['phone', 'เบอร์โทร', 'input', '08x-xxx-xxxx'], ['email', 'อีเมล', 'input', 'name@example.com'],
    ['line', 'LINE ID', 'input', 'เช่น krubank'], ['facebook', 'ลิงก์ Facebook', 'input', 'https://facebook.com/...'],
    ['website', 'เว็บไซต์', 'input', 'https://...']
  ];
  function shDev() {
    var s = S.sheet, d = s.data, h = '<h3 class="sh-t">ประวัติผู้พัฒนา</h3><p class="sh-s">แสดงเมื่อกดปุ่ม ประวัติผู้พัฒนา ที่หน้าแรก ช่องไหนว่างจะไม่แสดง</p>';
    if (!d) return h + twLoad('กำลังโหลด');
    var p = s.form || (s.form = JSON.parse(JSON.stringify(d.profile || {})));
    var ph = s.photo !== undefined ? s.photo : d.photo;
    h += '<div class="dev-ph"><div class="dev-ph-i">' + (ph ? '<img src="' + esc(ph) + '" alt="">' : ic('user', 44)) + '</div><div class="dev-ph-b">' +
      '<button class="btn btn-ghost" data-act="dev-pick">' + ic('camera', 20) + (ph ? 'เปลี่ยนรูป' : 'ใส่รูป') + '</button>' +
      (ph ? '<button class="btn btn-ghost" data-act="dev-nophoto">ลบรูป</button>' : '') + '<small class="t-muted">ระบบครอปเป็นวงกลมและย่อให้อัตโนมัติ</small></div></div>';
    h += DEV_FORM.map(function (f) {
      var val = esc(p[f[0]] || '');
      return '<label class="field"><span class="lbl">' + f[1] + '</span>' + (f[2] === 'area'
        ? '<textarea class="inp" data-dev="' + f[0] + '" rows="4" placeholder="' + esc(f[3]).replace(/\n/g, '&#10;') + '">' + val + '</textarea>'
        : '<input class="inp" data-dev="' + f[0] + '" value="' + val + '" placeholder="' + esc(f[3]) + '"' + (f[0] === 'email' ? ' type="email" inputmode="email"' : (f[0] === 'phone' ? ' inputmode="tel"' : '')) + '>') + '</label>';
    }).join('');
    h += '<button class="btn btn-primary btn-block" data-act="dev-save" style="margin-top:6px">' + ic('check', 20) + 'บันทึกประวัติผู้พัฒนา</button>';
    h += '<a class="btn btn-ghost btn-block" href="./" target="_blank" rel="noopener" style="margin-top:8px">' + ic('eye', 20) + 'ดูหน้าแรก</a>';
    return h;
  }
  function processPhoto(file) {
    return new Promise(function (resolve, reject) {
      if (!/^image\//.test(file.type)) return reject({ message: 'เลือกไฟล์รูปภาพ' });
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var n = 320, cv = document.createElement('canvas'), g = cv.getContext('2d');
        var side = Math.min(img.naturalWidth, img.naturalHeight), sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) * 0.35;
        var out = null, q = 0.88;
        for (var i = 0; i < 8 && !out; i++) {
          cv.width = n; cv.height = n;
          g.fillStyle = '#fff'; g.fillRect(0, 0, n, n);
          g.drawImage(img, sx, sy, side, side, 0, 0, n, n);
          var j = cv.toDataURL('image/jpeg', q);
          if (j.length <= 46000) out = j;
          else if (q > 0.6) q -= 0.1; else n = Math.round(n * 0.8);
        }
        URL.revokeObjectURL(url);
        out ? resolve(out) : reject({ message: 'ย่อรูปไม่สำเร็จ ลองใช้รูปอื่น' });
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject({ message: 'เปิดรูปนี้ไม่ได้' }); };
      img.src = url;
    });
  }
  function shDefPw() {
    var s = S.sheet, d = s.data, h = '<h3 class="sh-t">รหัสผ่านเริ่มต้น</h3><p class="sh-s">กำหนดรหัสเดียวกันให้ทุกคน ใช้เป็นรหัสผ่านหลักได้เลย ใครอยากเปลี่ยนก็เปลี่ยนเองได้ที่เมนู ฉัน → เปลี่ยนรหัสผ่าน</p>';
    if (!d) return h + twLoad('กำลังโหลด');
    var f = s.form, st = d.stats, show = !!s.show;
    var inp = function (k, label, ph, hint) {
      return '<label class="field"><span class="lbl">' + label + '</span><span class="pw-wrap"><input class="inp" data-dp="' + k + '" type="' + (show ? 'text' : 'password') + '" autocomplete="off" maxlength="30" value="' + esc(f[k] || '') + '" placeholder="' + esc(ph) + '">' +
        '<button type="button" class="pw-eye" data-act="dp-eye" aria-label="แสดงรหัส">' + ic(show ? 'eyeoff' : 'eye', 20) + '</button></span></label>' + (hint ? '<p class="hint" style="margin:-6px 2px 12px">' + hint + '</p>' : '');
    };
    h += '<div class="dp-stats"><div><b>' + st.students + '</b><span>นักเรียน</span><small>ใช้รหัสเริ่มต้นอยู่ ' + st.studentsUnset + '</small></div><div><b>' + st.staff + '</b><span>ครูและเจ้าหน้าที่</span><small>ใช้รหัสเริ่มต้นอยู่ ' + st.staffUnset + '</small></div></div>';
    h += inp('student', 'รหัสเริ่มต้นของนักเรียน', 'เว้นว่าง = ใช้เลขประจำตัวของแต่ละคน', 'ว่างไว้ = นักเรียนใช้เลขประจำตัวเป็นรหัสครั้งแรก (แบบเดิม)');
    h += '<button class="toggle" data-act="dp-force" data-v="forceStudent" style="margin:-4px 0 14px"><span><b>บังคับนักเรียนเปลี่ยนรหัสตอนเข้าครั้งแรก</b><br><small class="t-muted">' + (f.forceStudent ? 'เปิด: เข้าครั้งแรกต้องตั้งรหัสใหม่ก่อนใช้งาน' : 'ปิด: ใช้รหัสนี้เป็นรหัสหลักได้เลย เปลี่ยนเองได้ทีหลัง') + '</small></span><span class="sw' + (f.forceStudent ? ' on' : '') + '"></span></button>';
    h += inp('staff', 'รหัสเริ่มต้นของครูและเจ้าหน้าที่', 'เช่น kru2569', 'ไม่รวมบัญชีผู้ดูแลระบบ');
    h += '<button class="toggle" data-act="dp-force" data-v="forceStaff" style="margin:-4px 0 14px"><span><b>บังคับครูเปลี่ยนรหัสตอนเข้าครั้งแรก</b><br><small class="t-muted">' + (f.forceStaff ? 'เปิด: เข้าครั้งแรกต้องตั้งรหัสใหม่ก่อนใช้งาน' : 'ปิด: ใช้รหัสนี้เป็นรหัสหลักได้เลย เปลี่ยนเองได้ทีหลัง') + '</small></span><span class="sw' + (f.forceStaff ? ' on' : '') + '"></span></button>';
    h += '<span class="lbl">ใช้กับบัญชีที่มีอยู่แล้ว</span><div class="dp-opts">' + [
      ['none', 'เก็บค่าไว้อย่างเดียว', 'ใช้กับบัญชีใหม่ การนำเข้า และการรีเซ็ตรหัสครั้งต่อไป'],
      ['unset', 'เฉพาะคนที่ยังไม่ตั้งรหัสเอง', 'คนที่ตั้งรหัสของตัวเองแล้วไม่ถูกเปลี่ยน (แนะนำ)'],
      ['all', 'รีเซ็ตทุกคน', 'ทุกคนกลับมาใช้รหัสเริ่มต้นนี้ รหัสที่ตั้งเองไว้จะใช้ไม่ได้']
    ].map(function (o) {
      return '<button class="dp-o' + (o[0] === 'all' ? ' bad' : '') + '" data-act="dp-apply" data-v="' + o[0] + '" aria-pressed="' + (f.apply === o[0]) + '"><i></i><span><b>' + o[1] + '</b><small>' + o[2] + '</small></span></button>';
    }).join('') + '</div>';
    if (f.apply !== 'none') h += '<span class="lbl">กลุ่มที่ใช้</span><div class="opts" style="margin-bottom:14px">' + [['both', 'นักเรียนและครู'], ['students', 'เฉพาะนักเรียน'], ['staff', 'เฉพาะครู']].map(function (o) {
      return '<button class="fchip" data-act="dp-target" data-v="' + o[0] + '" aria-pressed="' + (f.target === o[0]) + '">' + o[1] + '</button>';
    }).join('') + '</div>';
    h += '<div id="formErr" class="err" role="alert"></div><button class="btn ' + (f.apply === 'all' ? 'btn-bad' : 'btn-primary') + ' btn-block" data-act="dp-save">' + ic('lock', 20) + (f.apply === 'none' ? 'บันทึกรหัสเริ่มต้น' : (f.apply === 'all' ? 'บันทึกและรีเซ็ตรหัสทุกคน' : 'บันทึกและใช้กับคนที่ยังไม่ตั้งรหัส')) + '</button>';
    h += '<p class="hint" style="margin-top:10px">รหัสเริ่มต้นเก็บในชีต Settings ของ Google Sheet (เฉพาะผู้ดูแลระบบเห็น) แจ้งรหัสนี้ให้ครูและนักเรียนทราบเอง</p>';
    return h;
  }
  function bkCall(action, payload, busy, ok) {
    var sh = S.sheet; if (!sh || sh.busy) return;
    sh.busy = busy; renderSheet();
    API.call(action, payload).then(function (d) {
      if (S.sheet !== sh) return;
      sh.busy = null; sh.data = d.info || d; renderSheet(); haptic(); toast(ok);
    }).catch(function (err) { if (S.sheet === sh) { sh.busy = null; renderSheet(); } toast(err.message || 'ทำรายการไม่สำเร็จ'); });
  }

  /* ---------- อัปโหลดรูปหลายคนพร้อมกัน ---------- */
  function phPeople(kind) {
    if (kind === 'user') return (S.adm.users || []).map(function (u) { return { id: u.id, name: u.name, first: u.firstName || '', last: u.lastName || '', key: u.username, sub: u.username + ' · ' + roleName(u.role), cls: '', no: '', pv: u.photoVer }; });
    var list = S.adm.students || [];
    if (S.user.role === 'teacher') list = list.filter(function (s) { return s.classroom === S.user.advisorClass; });
    return list.map(function (s) { return { id: s.id, name: s.name, first: s.firstName || '', last: s.lastName || '', key: s.id, sub: s.classroom + ' เลขที่ ' + s.number + ' · ' + s.id, cls: s.classroom, no: s.number, pv: s.photoVer }; });
  }
  /** จับคู่ชื่อไฟล์กับคน: เลขประจำตัว/ชื่อผู้ใช้ในชื่อไฟล์ ก่อน แล้วจึงลองชื่อ-นามสกุล */
  function phMatch(fname, people, kind) {
    var base = String(fname).replace(/\.[a-z0-9]+$/i, ''), low = base.toLowerCase(), nums = base.match(/\d{3,12}/g) || [];
    var i, p;
    for (i = 0; i < people.length; i++) {
      p = people[i];
      if (kind === 'user') { if (low.replace(/[^a-z0-9._-]/g, ' ').split(/\s+/).indexOf(String(p.key).toLowerCase()) >= 0) return p.id; }
      else if (nums.indexOf(String(p.key)) >= 0) return p.id;
    }
    var t = base.replace(/[_\-.]+/g, ' ');
    var best = null;
    for (i = 0; i < people.length; i++) {
      p = people[i];
      if (p.first && t.indexOf(p.first) >= 0 && (!p.last || t.indexOf(p.last) >= 0)) return p.id;
      if (!best && p.first && p.first.length >= 3 && t.indexOf(p.first) >= 0) best = p.id;
    }
    return best;
  }
  function natCmp(a, b) {
    var ax = String(a).match(/\d+|\D+/g) || [], bx = String(b).match(/\d+|\D+/g) || [];
    for (var i = 0; i < Math.min(ax.length, bx.length); i++) {
      var x = ax[i], y = bx[i];
      if (x === y) continue;
      if (/^\d/.test(x) && /^\d/.test(y)) return (+x) - (+y);
      return x < y ? -1 : 1;
    }
    return ax.length - bx.length;
  }
  function phRematch() {
    var s = S.sheet, people = phPeople(s.who), used = {};
    if (s.mode === 'order') {
      var cls = s.cls, list = people.filter(function (p) { return !cls || p.cls === cls; }).sort(function (a, b) { return (+a.no || 0) - (+b.no || 0); });
      var auto = s.items.filter(function (it) { return !it.manual; }), taken = {};
      s.items.forEach(function (it) { if (it.manual && it.to) taken[it.to] = true; });
      list = list.filter(function (p) { return !taken[p.id]; });
      auto.sort(function (a, b) { return natCmp(a.name, b.name); }).forEach(function (it, i) { it.to = list[i] ? list[i].id : ''; it.auto = !!it.to; });
    } else {
      s.items.forEach(function (it) { if (!it.manual) { it.to = phMatch(it.name, people, s.who) || ''; it.auto = !!it.to; } });
    }
    s.items.forEach(function (it) { if (it.to) { if (used[it.to]) it.dup = true; else { it.dup = false; used[it.to] = true; } } });
  }
  function shPhBulk() {
    var s = S.sheet, people = phPeople(s.who), byId = {};
    people.forEach(function (p) { byId[p.id] = p; });
    var h = '<h3 class="sh-t">อัปโหลดรูป' + (s.who === 'user' ? 'ครูและเจ้าหน้าที่' : 'นักเรียน') + 'หลายคน</h3><p class="sh-s">เลือกรูปทีละหลายไฟล์ ระบบจับคู่ให้อัตโนมัติ ครอปและย่อรูปให้เอง แล้วอัปโหลดรวดเดียว</p>';
    if (s.busy) {
      var pct = s.total ? Math.round(s.done * 100 / s.total) : 0;
      return h + '<div class="phb-prog"><div class="phb-bar"><i style="width:' + pct + '%"></i></div><b>' + esc(s.busy) + '</b><span>' + s.done + ' / ' + s.total + ' รูป (' + pct + '%)</span></div>';
    }
    h += '<div class="seg phb-mode"><button data-act="phb-mode" data-v="name" aria-pressed="' + (s.mode !== 'order') + '"><b>จับคู่จากชื่อไฟล์</b><span>' + (s.who === 'user' ? 'ชื่อไฟล์มีชื่อผู้ใช้ หรือชื่อ-นามสกุล เช่น krubank.jpg' : 'ชื่อไฟล์มีเลขประจำตัว หรือชื่อ-นามสกุล เช่น 12345.jpg') + '</span></button>' +
      (s.who === 'user' ? '' : '<button data-act="phb-mode" data-v="order" aria-pressed="' + (s.mode === 'order') + '"><b>เรียงตามเลขที่</b><span>เรียงไฟล์ตามชื่อ แล้วใส่ให้เลขที่ 1, 2, 3 ... ของห้องที่เลือก</span></button>') + '</div>';
    if (s.mode === 'order') {
      var cl = []; people.forEach(function (p) { if (cl.indexOf(p.cls) < 0) cl.push(p.cls); }); cl.sort();
      if (!s.cls && cl.length) s.cls = cl[0];
      h += '<div class="chips" style="padding:0 0 10px">' + cl.map(function (c) { return '<button class="fchip" data-act="phb-cls" data-v="' + esc(c) + '" aria-pressed="' + (s.cls === c) + '">' + esc(c) + '</button>'; }).join('') + '</div>';
    }
    h += '<div class="imp-drop" id="phbDrop"><button class="btn btn-primary" data-act="phb-pick">' + ic('image', 20) + (s.items.length ? 'เพิ่มรูปอีก' : 'เลือกรูปหลายไฟล์') + '</button><small>หรือลากรูปหลายไฟล์มาวางตรงนี้ · รองรับ JPG PNG WEBP HEIC ที่เบราว์เซอร์เปิดได้</small></div>';
    if (s.reading) h += twLoad(s.reading);
    if (s.items.length) {
      var ok = s.items.filter(function (it) { return it.to && !it.dup; }).length;
      h += '<div class="imp-sum" style="margin-top:12px"><div><b>' + s.items.length + '</b><span>รูปที่เลือก</span></div><div><b>' + ok + '</b><span>จับคู่ได้</span></div><div><b>' + (s.items.length - ok) + '</b><span>ยังไม่มีเจ้าของ</span></div></div>';
      var opts = people.slice().sort(function (a, b) { return a.cls === b.cls ? (+a.no || 0) - (+b.no || 0) : (a.cls < b.cls ? -1 : 1); });
      h += '<div class="phb-grid">' + s.items.map(function (it, i) {
        var p = byId[it.to], st = !it.to ? 'bad' : (it.dup ? 'warn' : 'ok');
        return '<div class="phb-i ' + st + '"><div class="phb-img"><img src="' + esc(it.data) + '" alt=""><button class="phb-x" data-act="phb-del" data-i="' + i + '" aria-label="เอารูปนี้ออก">' + ic('x', 14) + '</button></div>' +
          '<div class="phb-n" title="' + esc(it.name) + '">' + esc(it.name) + '</div>' +
          '<select class="phb-sel" data-phb="' + i + '"><option value="">— เลือกเจ้าของรูป —</option>' + opts.map(function (o) {
            return '<option value="' + esc(o.id) + '"' + (o.id === it.to ? ' selected' : '') + '>' + esc((o.cls ? o.cls + ' ' + (o.no || '') + ' ' : '') + o.name) + '</option>';
          }).join('') + '</select>' +
          '<div class="phb-st">' + (st === 'ok' ? ic('check', 14) + (p.pv ? 'แทนรูปเดิม' : 'พร้อม') : (st === 'warn' ? ic('alert', 14) + 'ซ้ำกับรูปอื่น' : ic('alert', 14) + 'ยังไม่ได้จับคู่')) + '</div></div>';
      }).join('') + '</div>';
      h += '<div id="formErr" class="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="phb-run"' + (ok ? '' : ' disabled') + '>' + ic('send', 20) + 'อัปโหลด ' + ok + ' รูป</button>';
      h += '<button class="btn btn-ghost btn-block" data-act="phb-clear" style="margin-top:8px">ล้างรายการ</button>';
    }
    return h;
  }
  function phbAddFiles(files) {
    var s = S.sheet; if (!s || s.kind !== 'phbulk' || !files || !files.length) return;
    var list = []; for (var i = 0; i < files.length; i++) if (/^image\//.test(files[i].type) || /\.(jpe?g|png|webp|heic)$/i.test(files[i].name)) list.push(files[i]);
    if (!list.length) { toast('เลือกไฟล์รูปภาพ', 'warning'); return; }
    if (s.items.length + list.length > 300) { toast('ครั้งละไม่เกิน 300 รูป', 'warning'); list = list.slice(0, 300 - s.items.length); }
    var k = 0, bad = 0;
    var next = function () {
      if (S.sheet !== s) return;
      if (k >= list.length) {
        s.reading = null; phRematch(); renderSheet();
        if (bad) toast('เปิดไม่ได้ ' + bad + ' ไฟล์', 'warning');
        return;
      }
      var f = list[k++];
      s.reading = 'กำลังย่อรูป ' + k + ' / ' + list.length; var rd = document.querySelector('.sheet .tw-py-10 span'); if (rd) rd.textContent = s.reading; else renderSheet();
      processStudentPhoto(f).then(function (d) { s.items.push({ name: f.name, data: d, to: '', manual: false }); })
        .catch(function () { bad++; }).then(function () { setTimeout(next, 0); });
    };
    next();
  }
  function phbRun() {
    var s = S.sheet, todo = s.items.filter(function (it) { return it.to && !it.dup; });
    if (!todo.length) return;
    s.busy = 'กำลังอัปโหลดรูป'; s.done = 0; s.total = todo.length; renderSheet();
    var i = 0, fails = 0, BATCH = 8;
    var step = function () {
      if (i >= todo.length) {
        s.busy = null; haptic();
        s.items = s.items.filter(function (it) { return todo.indexOf(it) < 0 || it.fail; });
        renderSheet(); render();
        successBox('อัปโหลดรูปแล้ว ' + (todo.length - fails) + ' รูป', fails ? 'ไม่สำเร็จ ' + fails + ' รูป ลองกดอัปโหลดอีกครั้ง' : 'รูปจะแสดงในรายชื่อทันที');
        return;
      }
      var part = todo.slice(i, i + BATCH); i += BATCH;
      API.call('savePhotos', { items: part.map(function (it) { return { id: it.to, data: it.data }; }) }).then(function (d) {
        var vers = d.vers || {};
        part.forEach(function (it) {
          var v = vers[it.to]; if (v === undefined) return;
          phSet(it.to, it.data, v); it.fail = false;
          (S.adm.students || []).forEach(function (x) { if (x.id === it.to) x.photoVer = v; });
          (S.adm.users || []).forEach(function (x) { if (x.id === it.to) x.photoVer = v; });
          (S.students || []).forEach(function (x) { if (x.id === it.to) x.pv = v; });
          S.cases.forEach(function (c) { if (c.sid === it.to) c.pv = v; });
          if (S.user.id === it.to) S.user.photoVer = v;
        });
        saveCache();
      }).catch(function (e) { fails += part.length; part.forEach(function (it) { it.fail = true; }); var fe = $('formErr'); if (fe) fe.textContent = e.message || ''; })
        .then(function () { s.done = Math.min(i, todo.length); renderSheet(); step(); });
    };
    step();
  }

  /* ---------- admin ---------- */
  var PREFIX_STAFF = [['นาย', 'นาย'], ['นาง', 'นาง'], ['นางสาว', 'นางสาว']];
  var PREFIX_STU = [['ด.ช.', 'ด.ช.'], ['ด.ญ.', 'ด.ญ.'], ['นาย', 'นาย'], ['นางสาว', 'นางสาว']];
  var ROLE_OPTS = [['teacher', 'ครูผู้สอน'], ['measure', 'งานวัดผล'], ['admin', 'ผู้ดูแลระบบ']];
  var SETTING_FIELDS = [
    { k: 'academicYear', label: 'ปีการศึกษา', type: 'number' },
    { k: 'semester', label: 'ภาคเรียน', type: 'chips', options: [['1', 'ภาคเรียนที่ 1'], ['2', 'ภาคเรียนที่ 2']] },
    { k: 'maxAttempts', label: 'แก้ 0 และ มส ได้สูงสุด (ครั้ง)', type: 'number' },
    { k: 'capZero', label: 'เกรดสูงสุดหลังแก้ 0', type: 'number' },
    { k: 'capMs', label: 'เกรดสูงสุดหลังแก้ มส', type: 'number' },
    { k: 'msMinPct', label: 'เวลาเรียนขั้นต่ำที่ยังแก้ มส ได้ (%)', type: 'number', hint: 'ต่ำกว่านี้ระบบบันทึกเป็นเรียนซ้ำ' },
    { k: 'defaultDays', label: 'จำนวนวันที่ให้แก้ตั้งต้น', type: 'number' },
    { k: 'remindDaysBefore', label: 'แจ้งเตือนก่อนครบกำหนด (วัน)', type: 'number' },
    { k: 'maxUploadMB', label: 'ขนาดไฟล์หลักฐานสูงสุด (MB)', type: 'number' },
    { k: 'themeColor', label: 'สีธีมประจำโรงเรียน', type: 'color', hint: 'ทุกคนจะเห็นสีนี้ ยกเว้นคนที่เลือกสีเองในเครื่อง' },
    { k: 'themeFx', label: 'เปิดเอฟเฟคแสงสีเป็นค่าเริ่มต้น', type: 'switch' },
    { k: 'schoolName', label: 'ชื่อโรงเรียน', type: 'text' },
    { k: 'areaName', label: 'สังกัด', type: 'text' },
    { k: 'publicStatsEnabled', label: 'เปิดหน้าสถิติสาธารณะ', type: 'switch', hint: 'แสดงเฉพาะตัวเลขรวม ไม่มีชื่อนักเรียน' },
    { k: 'lineEnabled', label: 'เปิดใช้ LINE แจ้งเตือน', type: 'switch', hint: 'ต้องใส่ Channel access token ด้านล่างด้วย' },
    { k: 'lineChannelToken', label: 'Channel access token (long-lived)', type: 'text', hint: 'จาก LINE Developers > Messaging API ถ้าเห็น •••••• แปลว่าใส่แล้ว' },
    { k: 'lineOaId', label: 'LINE OA Basic ID', ph: 'เช่น @banlalom', hint: 'ใช้สร้าง QR ให้ผู้ปกครองสแกน' },
    { k: 'appUrl', label: 'ลิงก์เว็บระบบ', ph: 'https://followup-student.vercel.app/app', hint: 'แนบท้ายข้อความ LINE ลงท้ายด้วย /app ผู้ปกครองกดแล้วเข้าหน้าเข้าสู่ระบบทันที' },
    { k: 'lineNotifyNew', label: 'ส่ง LINE เมื่อครูบันทึก 0 ร มส', type: 'switch' },
    { k: 'lineNotifyResult', label: 'ส่ง LINE เมื่อมีผลการแก้ ส่งกลับ หรือครูเตือน', type: 'switch' },
    { k: 'lineNotifyRemind', label: 'ส่ง LINE เตือนอัตโนมัติก่อนและหลังครบกำหนด', type: 'switch', hint: 'ใช้โควตามากที่สุด ปิดได้ถ้าโควตาไม่พอ' }
  ];
  function boolish(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
  function isAdmin() { return S.user.role === 'admin'; }
  function isManager() { return S.user.role === 'admin' || S.user.role === 'measure'; }

  function loadAdm(kind, force) {
    if (S.adm[kind] && !force) return;
    var action = { users: 'adminUsers', students: 'adminStudents', subjects: 'adminSubjects', settings: 'getSettings' }[kind];
    API.call(action).then(function (d) {
      if (kind === 'settings') { var m = {}; d.forEach(function (r) { m[r.key] = r.value; }); S.adm.settings = m; }
      else S.adm[kind] = d;
      render();
      if (S.sheet && S.sheet.kind === 'form') {
        if (kind === 'settings' && S.sheet.form === 'settings') { settingsForm(); return; }
        if (kind === 'users' && S.sheet.form === 'subject') {
          S.sheet.fields.forEach(function (f) {
            if (f.k === 'teacherId') { f.options = teacherOptions(); f.hint = ''; }
          });
        }
        renderSheet();
      }
    }).catch(function (e) { toast(e.message || 'โหลดข้อมูลไม่สำเร็จ'); });
  }

  function formField(f, val, ro) {
    var k = f.k, hint = f.hint ? '<p class="hint" style="margin:6px 0 0">' + f.hint + '</p>' : '';
    if (f.type === 'chips') {
      return '<div class="field"><span class="lbl">' + f.label + '</span><div class="opts">' + f.options.map(function (o) {
        return '<button class="fchip" data-act="form-chip" data-k="' + k + '" data-v="' + esc(o[0]) + '" aria-pressed="' + (String(val) === String(o[0])) + '"' + (ro || f.ro ? ' disabled' : '') + '>' + esc(o[1]) + '</button>';
      }).join('') + '</div>' + hint + '</div>';
    }
    if (f.type === 'switch') {
      return '<button class="toggle" data-act="form-sw" data-k="' + k + '" style="margin-bottom:14px"' + (ro ? ' disabled' : '') + '><span><b>' + f.label + '</b>' + (f.hint ? '<small>' + f.hint + '</small>' : '') + '</span><span class="sw' + (val ? ' on' : '') + '"></span></button>';
    }
    if (f.type === 'color') {
      var presets = window.Theme ? window.Theme.presets : [];
      return '<div class="field"><span class="lbl">' + f.label + '</span><div class="swatches" style="grid-template-columns:repeat(10,1fr);gap:8px;margin:2px 0 10px">' + presets.map(function (p) {
        return '<button type="button" class="swatch" style="background:' + p.hex + '" data-act="form-color" data-k="' + k + '" data-v="' + p.hex + '" aria-pressed="' + (String(val).toLowerCase() === p.hex.toLowerCase()) + '" title="' + esc(p.name) + '"' + (ro ? ' disabled' : '') + '></button>';
      }).join('') + '</div><label class="color-row"><input type="color" data-fk="' + k + '" value="' + esc(val || '#6E4BC9') + '"' + (ro ? ' disabled' : '') + '><span>เลือกสีเอง <small class="t-muted">' + esc(String(val || '').toUpperCase()) + '</small></span></label>' + hint + '</div>';
    }
    if (f.type === 'select') {
      return '<label class="field"><span class="lbl">' + f.label + '</span><select class="inp" data-fk="' + k + '"' + (ro ? ' disabled' : '') + '><option value="">เลือก</option>' + f.options.map(function (o) {
        return '<option value="' + esc(o[0]) + '"' + (String(val) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>';
      }).join('') + '</select>' + hint + '</label>';
    }
    return '<label class="field"><span class="lbl">' + f.label + '</span><input class="inp" ' + (f.type === 'number' ? 'type="number" inputmode="decimal"' : 'type="text"') +
      ' data-fk="' + k + '" value="' + esc(val === null || val === undefined ? '' : val) + '"' + (f.ph ? ' placeholder="' + esc(f.ph) + '"' : '') + (ro || f.ro ? ' readonly' : '') + '>' + hint + '</label>';
  }
  function shForm() {
    var s = S.sheet;
    return '<h3 class="sh-t">' + esc(s.title) + '</h3>' + (s.sub ? '<p class="sh-s">' + esc(s.sub) + '</p>' : '') + (s.top || '') +
      s.fields.map(function (f) { return formField(f, s.values[f.k], s.readonly); }).join('') +
      '<div id="formErr" class="err" role="alert"></div>' + (s.extra || '') +
      (s.readonly ? '<button class="btn btn-ghost btn-block" data-act="close-sheet">ปิด</button>' : '<button class="btn btn-primary btn-block" data-act="form-save">' + esc(s.saveLabel || 'บันทึก') + '</button>');
  }
  function shTemp() {
    var s = S.sheet;
    return '<div class="done-ic">' + ic('lock', 40) + '</div><h3 class="done-t">' + esc(s.title) + '</h3><p class="done-s">' + esc(s.sub) + '</p>' +
      '<div class="temp-pw" id="tempPw">' + esc(s.pw) + '</div><p class="sh-s" style="text-align:center">ระบบจะให้ตั้งรหัสใหม่ตอนเข้าใช้ครั้งแรก</p>' +
      '<div class="actbar-in"><button class="btn btn-ghost" data-act="copy-temp">คัดลอก</button><button class="btn btn-primary" data-act="close-sheet">เสร็จแล้ว</button></div>';
  }

  function userForm(u) {
    var teacherOpts = ROLE_OPTS;
    openSheet({
      kind: 'form', form: 'user', title: u ? 'แก้ไขบัญชี' : 'เพิ่มครูหรือเจ้าหน้าที่', sub: u ? u.username : 'ระบบสร้างรหัสผ่านชั่วคราวให้หลังบันทึก',
      readonly: !isAdmin(),
      top: u ? photoBlock({ id: u.id, photoVer: u.photoVer, role: u.role }) : '',
      values: u ? { id: u.id, username: u.username, role: u.role, prefix: u.prefix, firstName: u.firstName, lastName: u.lastName, department: u.department, advisorClass: u.advisorClass, active: u.active }
        : { role: 'teacher', prefix: 'นาย', active: true },
      fields: [
        { k: 'username', label: 'ชื่อผู้ใช้ (ใช้เข้าสู่ระบบ)', ph: 'เช่น krubank', ro: !!u, hint: u ? '' : 'ตัวอักษรภาษาอังกฤษตัวเล็ก ตัวเลข . _ -' },
        { k: 'role', label: 'บทบาท', type: 'chips', options: teacherOpts },
        { k: 'prefix', label: 'คำนำหน้า', type: 'chips', options: PREFIX_STAFF },
        { k: 'firstName', label: 'ชื่อ' }, { k: 'lastName', label: 'นามสกุล' },
        { k: 'department', label: 'กลุ่มสาระ หรือฝ่าย', ph: 'เช่น กลุ่มสาระคณิตศาสตร์' },
        { k: 'advisorClass', label: 'ครูที่ปรึกษาห้อง', ph: 'เช่น ม.2/1 เว้นว่างถ้าไม่ได้เป็นที่ปรึกษา' },
        { k: 'active', label: 'เปิดใช้งาน', type: 'switch', hint: 'ปิดเมื่อครูย้ายหรือไม่ได้ใช้แล้ว' }
      ],
      extra: u && isAdmin() ? '<button class="btn btn-ghost btn-block" data-act="adm-reset" data-kind="user" data-id="' + esc(u.id) + '" style="margin-bottom:10px">' + ic('lock', 20) + 'รีเซ็ตรหัสผ่าน</button>' +
        (u.id !== S.user.id ? '<button class="btn btn-bad btn-block" data-act="user-delete" data-id="' + esc(u.id) + '" style="margin-bottom:10px">' + ic('x', 20) + 'ลบบัญชีนี้</button>' : '') : ''
    });
  }
  function studentForm(st) {
    var canEdit = isManager();
    openSheet({
      kind: 'form', form: 'student', title: st ? st.name : 'เพิ่มนักเรียน', sub: st ? st.classroom + ' เลขที่ ' + st.number : 'ใช้รหัสผ่านเริ่มต้นของโรงเรียน (ไม่ได้กำหนด = เลขประจำตัว)',
      readonly: !canEdit,
      values: st ? { isNew: false, studentId: st.id, prefix: st.prefix, firstName: st.firstName, lastName: st.lastName, classroom: st.classroom, number: st.number, parentName: st.parentName, parentPhone: st.parentPhone, active: st.active }
        : { isNew: true, prefix: 'ด.ช.', active: true, classroom: S.acls !== 'all' ? S.acls : '' },
      fields: [
        { k: 'studentId', label: 'เลขประจำตัว', type: 'number', ro: !!st },
        { k: 'prefix', label: 'คำนำหน้า', type: 'chips', options: PREFIX_STU },
        { k: 'firstName', label: 'ชื่อ' }, { k: 'lastName', label: 'นามสกุล' },
        { k: 'classroom', label: 'ห้อง', ph: 'เช่น ม.2/1' }, { k: 'number', label: 'เลขที่', type: 'number' },
        { k: 'parentName', label: 'ชื่อผู้ปกครอง' }, { k: 'parentPhone', label: 'เบอร์โทรผู้ปกครอง' }
      ],
      top: st ? photoBlock(st) : '',
      extra: st ? studentExtra(st) : ''
    });
  }
  function studentExtra(st) {
    return '<button class="btn btn-ghost btn-block" data-act="adm-reset" data-kind="student" data-id="' + esc(st.id) + '" style="margin-bottom:10px">' + ic('lock', 20) + 'รีเซ็ตรหัสผ่านนักเรียน</button>' +
      '<button class="btn btn-ghost btn-block" data-act="line-student" data-id="' + esc(st.id) + '" style="margin-bottom:10px">' + ic('chat', 20) + 'QR เชื่อม LINE ผู้ปกครอง' + (st.lineLinked ? ' (เชื่อมแล้ว)' : '') + '</button>' +
      statusButtons(st);
  }
  function statusButtons(st) {
    var h = '<div class="sec" style="margin:14px 2px 10px"><h2>สถานะการติดตาม</h2></div>';
    if (st.trackStatus) {
      h += '<div class="banner ' + (st.trackStatus === 'WITHDRAWN' ? 'bad' : 'info') + '" style="margin:0 0 10px">' + ic(st.trackStatus === 'WITHDRAWN' ? 'logout' : 'clock') + '<div><b>' + HOLD_LABEL[st.trackStatus] + (st.trackAt ? ' เมื่อ ' + thDate(st.trackAt) : '') + '</b><p>' + esc(st.trackNote || '-') + '</p></div></div>';
    } else {
      h += '<p class="hint" style="margin:-4px 2px 10px">กำลังติดตามตามปกติ</p>';
    }
    if (!isManager()) return h;
    if (st.trackStatus) h += '<button class="btn btn-primary btn-block" data-act="stu-status" data-v="ACTIVE" data-id="' + esc(st.id) + '" style="margin-bottom:10px">' + ic('refresh', 20) + 'กลับมาติดตามตามปกติ</button>';
    if (st.trackStatus !== 'SUSPENDED') h += '<button class="btn btn-warn btn-block" data-act="stu-status" data-v="SUSPENDED" data-id="' + esc(st.id) + '" style="margin-bottom:10px">' + ic('clock', 20) + 'แขวนการติดตาม</button>';
    if (st.trackStatus !== 'WITHDRAWN') h += '<button class="btn btn-bad btn-block" data-act="stu-status" data-v="WITHDRAWN" data-id="' + esc(st.id) + '" style="margin-bottom:10px">' + ic('logout', 20) + 'ถอนชื่อ (ย้าย ลาออก พ้นสภาพ)</button>';
    if (isAdmin()) h += '<button class="btn btn-ghost btn-block" data-act="stu-delete" data-id="' + esc(st.id) + '" style="margin-bottom:10px;color:var(--zero)">' + ic('x', 20) + 'ลบนักเรียนคนนี้</button>';
    return h;
  }
  function askReason(o) {
    if (!hasSwal()) { var r = window.prompt(o.title + '\n' + (o.text || ''), ''); return Promise.resolve(r === null ? null : r); }
    return swalFire({
      title: o.title, html: '<div style="font-size:14.5px">' + esc(o.text || '') + '</div>' + (o.quick ? '<div class="opts" style="justify-content:center;margin-top:12px">' + o.quick.map(function (q) {
        return '<button type="button" class="fchip" onclick="var t=document.querySelector(\'.swal2-textarea\');t.value=this.textContent;t.focus()">' + esc(q) + '</button>';
      }).join('') + '</div>' : ''),
      input: 'textarea', inputPlaceholder: 'ระบุเหตุผล', icon: o.icon || 'question', showCancelButton: true,
      confirmButtonText: o.ok || 'ยืนยัน', cancelButtonText: 'ยกเลิก', reverseButtons: true,
      customClass: { popup: 'sw-pop', confirmButton: o.danger ? 'sw-danger' : '' },
      inputValidator: function (v) { if (o.required && !String(v || '').trim()) return 'กรุณาระบุเหตุผล'; }
    }).then(function (r) { return r.isConfirmed ? String(r.value || '').trim() : null; });
  }
  function setStudentStatus(id, status) {
    var st = (S.adm.students || []).filter(function (x) { return x.id === id; })[0] || { name: id };
    var ask = status === 'ACTIVE'
      ? confirmBox({ title: 'กลับมาติดตาม ' + st.name + '?', text: 'รายการที่ค้างอยู่จะกลับมาติดตามและแจ้งเตือนตามปกติ', ok: 'กลับมาติดตาม' }).then(function (ok) { return ok ? '' : null; })
      : askReason(status === 'SUSPENDED'
        ? { title: 'แขวนการติดตาม', text: st.name + ' จะไม่ถูกติดตาม ไม่แจ้งเตือน และไม่นับในสถิติ ยกเลิกได้ภายหลัง', ok: 'แขวนการติดตาม', required: true, icon: 'warning',
          quick: ['ติดตามหลายครั้งแล้วไม่สำเร็จ', 'ขาดเรียนต่อเนื่อง ติดต่อไม่ได้', 'รอผลการพิจารณาของฝ่ายบริหาร'] }
        : { title: 'ถอนชื่อนักเรียน', text: st.name + ' จะหยุดการติดตามและเข้าสู่ระบบไม่ได้ ประวัติยังเก็บไว้ครบ', ok: 'ถอนชื่อ', required: true, danger: true, icon: 'warning',
          quick: ['ย้ายสถานศึกษา', 'ลาออก', 'พ้นสภาพนักเรียน'] });
    ask.then(function (note) {
      if (note === null) return;
      loading('กำลังบันทึกสถานะ');
      API.call('adminSetStudentStatus', { id: id, status: status, note: note }).then(function (d) {
        loaded(); haptic();
        var lst = S.adm.students || [];
        for (var i = 0; i < lst.length; i++) if (lst[i].id === id) lst[i] = d.student;
        closeSheet(); render(); S.lastSync = 0; refresh(true);
        successBox(status === 'ACTIVE' ? 'กลับมาติดตามแล้ว' : (HOLD_LABEL[status] + 'แล้ว'), d.student.name);
      }).catch(function (e) { loaded(); toast(e.message || 'บันทึกไม่สำเร็จ'); });
    });
  }
  function afterDelete(kind, filterFn, title, sub) {
    loaded(); haptic();
    S.adm[kind] = (S.adm[kind] || []).filter(filterFn);
    S.students = null; closeSheet(); render(); S.lastSync = 0; refresh(true);
    successBox(title, sub);
  }
  function deleteStudent(id) {
    var st = (S.adm.students || []).filter(function (x) { return x.id === id; })[0] || { name: id };
    var run = function (force) {
      loading('กำลังลบ');
      API.call('adminDeleteStudent', { id: id, force: !!force }).then(function (d) {
        afterDelete('students', function (x) { return x.id !== id; }, 'ลบนักเรียนแล้ว', st.name + (d.cases ? ' พร้อมรายการ ' + d.cases + ' รายการ' : ''));
      }).catch(function (e) {
        loaded();
        if (e.error !== 'HAS_CASES') { toast(e.message || 'ลบไม่สำเร็จ'); return; }
        confirmBox({ title: 'ลบพร้อมประวัติทั้งหมด?', text: e.message + ' ถ้าต้องการเก็บประวัติไว้ ให้ใช้ ถอนชื่อ แทน', ok: 'ลบทั้งหมด', danger: true })
          .then(function (ok) { if (ok) run(true); });
      });
    };
    confirmBox({ title: 'ลบ ' + st.name + '?', text: 'ลบออกจากระบบถาวร', ok: 'ลบ', danger: true }).then(function (ok) { if (ok) run(false); });
  }
  function pickTeacher(excludeId, title, text) {
    var opts = {};
    (S.adm.users || []).forEach(function (u) { if (u.id !== excludeId && u.active) opts[u.id] = u.name + ' (' + roleName(u.role) + ')'; });
    if (!hasSwal()) return Promise.resolve(null);
    return swalFire({ title: title, text: text, icon: 'warning', input: 'select', inputOptions: opts, inputPlaceholder: 'เลือกครูที่รับโอน',
      showCancelButton: true, confirmButtonText: 'โอนแล้วลบ', cancelButtonText: 'ยกเลิก', reverseButtons: true,
      customClass: { popup: 'sw-pop', confirmButton: 'sw-danger' },
      inputValidator: function (v) { if (!v) return 'เลือกครูที่จะรับโอนก่อน'; }
    }).then(function (r) { return r.isConfirmed ? r.value : null; });
  }
  function deleteUser(id) {
    var u = (S.adm.users || []).filter(function (x) { return x.id === id; })[0] || { name: id };
    var run = function (to) {
      loading('กำลังลบบัญชี');
      API.call('adminDeleteUser', { id: id, transferTo: to || '' }).then(function (d) {
        afterDelete('users', function (x) { return x.id !== id; }, 'ลบบัญชีแล้ว', u.name + (to ? ' โอนรายวิชา ' + d.subjects + ' และรายการ ' + d.cases + ' แล้ว' : ''));
        S.adm.subjects = null;
      }).catch(function (e) {
        loaded();
        if (e.error !== 'HAS_REFS') { toast(e.message || 'ลบไม่สำเร็จ'); return; }
        pickTeacher(id, 'โอนงานก่อนลบ', e.message).then(function (t) { if (t) run(t); });
      });
    };
    confirmBox({ title: 'ลบบัญชี ' + u.name + '?', text: 'เข้าสู่ระบบไม่ได้อีก ถ้าเพียงย้ายออกชั่วคราว ให้ปิด เปิดใช้งาน แทน', ok: 'ลบบัญชี', danger: true })
      .then(function (ok) { if (ok) run(''); });
  }
  function deleteSubject(code) {
    var sj = (S.adm.subjects || []).filter(function (x) { return x.code === code; })[0] || { code: code, name: '' };
    var run = function (force) {
      loading('กำลังลบรายวิชา');
      API.call('adminDeleteSubject', { code: code, force: !!force }).then(function (d) {
        afterDelete('subjects', function (x) { return x.code !== code; }, 'ลบรายวิชาแล้ว', sj.code + ' ' + sj.name + (d.cases ? ' พร้อมรายการ ' + d.cases + ' รายการ' : ''));
      }).catch(function (e) {
        loaded();
        if (e.error !== 'HAS_CASES') { toast(e.message || 'ลบไม่สำเร็จ'); return; }
        confirmBox({ title: 'ลบพร้อมรายการทั้งหมด?', text: e.message + ' ถ้าแค่ไม่ใช้แล้ว ให้ปิด เปิดใช้งาน แทนเพื่อเก็บประวัติ', ok: 'ลบทั้งหมด', danger: true })
          .then(function (ok) { if (ok) run(true); });
      });
    };
    confirmBox({ title: 'ลบรายวิชา ' + sj.code + '?', text: sj.name, ok: 'ลบ', danger: true }).then(function (ok) { if (ok) run(false); });
  }
  function teacherOptions() {
    return (S.adm.users || []).filter(function (u) { return u.active && u.role !== 'admin'; }).map(function (u) { return [u.id, u.name]; });
  }
  function subjectForm(sj) {
    var users = teacherOptions();
    openSheet({
      kind: 'form', form: 'subject', title: sj ? sj.code + ' ' + sj.name : 'เพิ่มรายวิชา', sub: term(),
      values: sj ? { isNew: false, code: sj.code, name: sj.name, level: String(sj.level), type: sj.type, credit: sj.credit, teacherId: sj.teacherId, active: sj.active }
        : { isNew: true, level: '1', type: 'พื้นฐาน', active: true },
      fields: [
        { k: 'code', label: 'รหัสวิชา', ph: 'เช่น ค21101', ro: !!sj }, { k: 'name', label: 'ชื่อวิชา', ph: 'เช่น คณิตศาสตร์ 1' },
        { k: 'level', label: 'ระดับชั้น', type: 'chips', options: [['1', 'ม.1'], ['2', 'ม.2'], ['3', 'ม.3']] },
        { k: 'type', label: 'ประเภท', type: 'chips', options: [['พื้นฐาน', 'พื้นฐาน'], ['เพิ่มเติม', 'เพิ่มเติม']] },
        { k: 'credit', label: 'หน่วยกิต', type: 'number' },
        { k: 'teacherId', label: 'ครูผู้สอน', type: 'select', options: users, hint: users.length ? '' : 'กำลังโหลดรายชื่อครู' },
        { k: 'active', label: 'เปิดใช้งาน', type: 'switch' }
      ],
      extra: sj && isAdmin() ? '<button class="btn btn-bad btn-block" data-act="subj-delete" data-id="' + esc(sj.code) + '" style="margin-bottom:10px">' + ic('x', 20) + 'ลบรายวิชานี้</button>' : ''
    });
    loadAdm('users');
  }
  function settingsForm() {
    var v = S.adm.settings;
    if (!v) { openSheet({ kind: 'form', form: 'settings', title: 'ตั้งค่าระบบ', sub: 'กำลังโหลด', values: {}, fields: [], readonly: true }); loadAdm('settings'); return; }
    var vals = {};
    SETTING_FIELDS.forEach(function (f) {
      if (f.type === 'switch') vals[f.k] = v[f.k] === undefined || v[f.k] === '' ? (f.k !== 'lineEnabled') : boolish(v[f.k]);
      else vals[f.k] = v[f.k] === undefined ? '' : String(v[f.k]);
    });
    if (!vals.themeColor) vals.themeColor = '#6E4BC9';
    if (!vals.appUrl) vals.appUrl = location.origin + '/app';
    openSheet({ kind: 'form', form: 'settings', title: 'ตั้งค่าระบบ', sub: isAdmin() ? 'มีผลกับทุกคนทันทีหลังบันทึก' : 'ดูได้อย่างเดียว แก้ไขได้เฉพาะผู้ดูแลระบบ', readonly: !isAdmin(), values: vals, fields: SETTING_FIELDS });
  }

  function saveForm(btn) {
    var s = S.sheet, v = s.values, err = $('formErr');
    var fail = function (m) { if (err) err.textContent = m; };
    var action, payload;
    if (s.form === 'user') { action = 'adminSaveUser'; payload = { item: v }; }
    else if (s.form === 'student') {
      if (!v.studentId) return fail('กรอกเลขประจำตัว');
      action = 'adminSaveStudent'; payload = { item: v };
    } else if (s.form === 'subject') {
      if (!v.teacherId) return fail('เลือกครูผู้สอน');
      action = 'adminSaveSubject'; payload = { item: v };
    } else {
      var changes = {}, cur = S.adm.settings || {};
      SETTING_FIELDS.forEach(function (f) {
        if (f.type === 'switch') { if (boolish(cur[f.k]) !== !!v[f.k] || cur[f.k] === undefined || cur[f.k] === '') changes[f.k] = !!v[f.k]; }
        else if (String(cur[f.k] === undefined ? '' : cur[f.k]) !== String(v[f.k])) changes[f.k] = v[f.k];
      });
      if (!Object.keys(changes).length) { closeSheet(); return; }
      action = 'saveSettings'; payload = { changes: changes };
    }
    setBusy(btn, true, 'กำลังบันทึก');
    loading('กำลังบันทึก');
    API.call(action, payload).then(function (d) {
      loaded(); haptic();
      if (s.form === 'settings') { S.adm.settings = null; closeSheet(); toast('บันทึกการตั้งค่าแล้ว'); refresh(true); return; }
      var kind = { user: 'users', student: 'students', subject: 'subjects' }[s.form];
      S.adm[kind] = null; loadAdm(kind, true);
      if (s.form === 'subject') S.lastSync = 0;
      if (d && d.tempPassword) {
        openSheet({ kind: 'temp', title: 'บันทึกแล้ว', sub: 'แจ้งข้อมูลนี้ให้เจ้าของบัญชี ชื่อผู้ใช้ ' + (s.form === 'user' ? d.user.username : d.student.id), pw: d.tempPassword });
      } else { closeSheet(); toast('บันทึกแล้ว'); }
    }).catch(function (e) { loaded(); setBusy(btn, false); fail(e.message || 'บันทึกไม่สำเร็จ'); });
  }

  /* import : วางข้อความ หรือเลือกไฟล์ Excel / CSV / PDF ระบบจับคอลัมน์ให้อัตโนมัติ */
  var IMP_PREFIX = /^(เด็กชาย|เด็กหญิง|ด\.\s?ช\.?|ด\.\s?ญ\.?|นางสาว|น\.\s?ส\.?|นาย|นาง|Mr\.?|Miss|Mrs\.?)\s*/;
  var IMP_PREFIX_NORM = { 'เด็กชาย': 'ด.ช.', 'เด็กหญิง': 'ด.ญ.', 'ด.ช': 'ด.ช.', 'ด.ญ': 'ด.ญ.', 'น.ส.': 'นางสาว', 'น.ส': 'นางสาว' };
  function impPrefix(p) { p = String(p || '').replace(/\s+/g, ''); return IMP_PREFIX_NORM[p] || p; }
  function impSplitName(full) {
    var t = String(full || '').replace(/\s+/g, ' ').trim(), m = t.match(IMP_PREFIX), pre = '';
    if (m) { pre = impPrefix(m[1]); t = t.slice(m[0].length).trim(); }
    var parts = t.split(' ');
    return { prefix: pre, firstName: parts.shift() || '', lastName: parts.join(' ') };
  }
  /** แปลงชื่อห้องเป็นรูปแบบเดียวกัน เช่น "2/1" "ม. 2/1" "มัธยมศึกษาปีที่ 2/1" "ม.2-1" → ม.2/1 */
  function impClass(v) {
    var t = String(v || '').trim(), m = t.match(/(?:ม\.?|มัธยมศึกษาปีที่|มัธยม|ชั้น|M\.?)?\s*([1-6])\s*[\/\-_.]\s*(\d{1,2})/i);
    return m ? 'ม.' + m[1] + '/' + (+m[2]) : t;
  }
  function impFindClass(text) {
    var m = String(text || '').match(/(?:ม\.|มัธยมศึกษาปีที่|ชั้นมัธยมศึกษาปีที่|ชั้น\s*ม\.)\s*([1-6])\s*\/\s*(\d{1,2})/);
    return m ? 'ม.' + m[1] + '/' + (+m[2]) : '';
  }
  var IMP_HEAD = [
    ['id', /เลขประจำตัว|เลขประจําตัว|รหัสนักเรียน|เลขประจำตัวนักเรียน|student\s*id|^id$/i],
    ['phone', /โทร|เบอร์|phone|tel/i],
    ['parent', /ผู้ปกครอง|parent/i],
    ['full', /ชื่อ\s*[-–]?\s*(นาม)?สกุล|ชื่อ.{0,3}สกุล|^name$|full\s*name/i],
    ['prefix', /คำนำหน้า|คํานําหน้า|prefix|title/i],
    ['last', /นามสกุล|^สกุล$|last\s*name|surname/i],
    ['first', /^ชื่อ$|ชื่อจริง|first\s*name/i],
    ['cls', /ห้อง|ชั้น|class|room/i],
    ['no', /^เลขที่$|^ที่$|^no\.?$|^ลำดับ$|^ลําดับ$/i]
  ];
  function impHeader(row) {
    var map = {}, hits = 0;
    row.forEach(function (c, j) {
      var t = String(c == null ? '' : c).trim();
      if (!t || t.length > 40) return;
      for (var k = 0; k < IMP_HEAD.length; k++) {
        var key = IMP_HEAD[k][0];
        if (map[key] === undefined && IMP_HEAD[k][1].test(t)) { map[key] = j; hits++; return; }
      }
    });
    return map.id !== undefined && hits >= 2 ? map : null;
  }
  /** ตารางข้อมูล (แถว x คอลัมน์) → รายชื่อนักเรียน  ใช้ได้ทั้งข้อความที่วาง ไฟล์ Excel และข้อความจาก PDF */
  function impFromGrid(grid, ctxCls) {
    var rows = [], bad = 0, map = null, cls = ctxCls || '';
    grid.forEach(function (raw) {
      var r = raw.map(function (x) { return String(x == null ? '' : x).replace(/\s+/g, ' ').trim(); });
      if (!r.some(function (x) { return x; })) return;
      if (r[0] === '#SHEET') { map = null; cls = r[1] || ctxCls || ''; return; }
      var h = impHeader(r);
      if (h) { map = h; return; }
      var joined = r.join(' '), fc = impFindClass(joined);
      var it = null;
      if (map) {
        var g = function (k) { return map[k] !== undefined ? r[map[k]] || '' : ''; };
        var id = g('id').replace(/\D/g, '');
        if (!/^\d{3,12}$/.test(id)) { if (fc && !/\d{4,}/.test(joined)) cls = fc; else if (joined.length > 3) bad++; return; }
        it = { studentId: id, prefix: impPrefix(g('prefix')), firstName: g('first'), lastName: g('last'), classroom: impClass(g('cls')), number: g('no').replace(/\D/g, ''), parentName: g('parent'), parentPhone: g('phone').replace(/[^\d]/g, '') };
        if (g('full')) {
          var sp = impSplitName((g('prefix') ? g('prefix') + ' ' : '') + g('full')); it.prefix = it.prefix || sp.prefix; it.firstName = it.firstName || sp.firstName; it.lastName = it.lastName || sp.lastName;
          // PDF มักแยกชื่อกับนามสกุลเป็นคนละช่อง: ช่องถัดไปที่ไม่มีหัวคอลัมน์และเป็นตัวอักษรล้วน ถือเป็นนามสกุล
          var nx = map.full + 1, used = false;
          for (var mk in map) if (map[mk] === nx) used = true;
          if (!it.lastName && r[nx] && !used && !/\d/.test(r[nx]) && /[ก-๙a-z]/i.test(r[nx]) && r[nx].length < 40) it.lastName = r[nx];
        }
        else if (it.firstName && !it.prefix) { var sp2 = impSplitName(it.firstName + (it.lastName ? ' ' + it.lastName : '')); if (sp2.prefix) { it.prefix = sp2.prefix; it.firstName = sp2.firstName; it.lastName = it.lastName ? it.lastName : sp2.lastName; } }
      } else {
        // ไม่มีหัวตาราง: หาเลขประจำตัว (ตัวเลข 4-12 หลัก) แล้วอ่านคอลัมน์ถัดไปตามลำดับ
        var k = -1;
        for (var i = 0; i < r.length; i++) if (/^\d{4,12}$/.test(r[i].replace(/\s/g, ''))) { k = i; break; }
        if (k < 0) { if (fc) cls = fc; else if (/\d/.test(joined) && joined.length > 3) bad++; return; }
        var rest = r.slice(k + 1).filter(function (x) { return x !== ''; });
        it = { studentId: r[k].replace(/\s/g, ''), prefix: '', firstName: '', lastName: '', classroom: '', number: '', parentName: '', parentPhone: '' };
        if (k > 0 && /^\d{1,3}$/.test(r[k - 1])) it.number = r[k - 1];
        var nameDone = false, q = 0;
        if (rest.length && IMP_PREFIX.test(rest[0]) && rest[0].replace(IMP_PREFIX, '').trim() === '') { it.prefix = impPrefix(rest[0]); q = 1; }
        if (!nameDone && rest[q]) {
          var sp3 = impSplitName((it.prefix ? it.prefix + ' ' : '') + rest[q]);
          it.prefix = sp3.prefix || it.prefix; it.firstName = sp3.firstName; it.lastName = sp3.lastName; q++;
          if (!it.lastName && rest[q] && !/\d/.test(rest[q]) && !/[\/]/.test(rest[q])) { it.lastName = rest[q]; q++; }
        }
        for (; q < rest.length; q++) {
          var x = rest[q];
          if (!it.classroom && /^(ม\.?\s*)?[1-6]\s*[\/\-]\s*\d{1,2}$|มัธยม/.test(x)) it.classroom = impClass(x);
          else if (!it.number && /^\d{1,3}$/.test(x)) it.number = x;
          else if (!it.parentPhone && /^0[\d\-\s]{8,11}$/.test(x)) it.parentPhone = x.replace(/\D/g, '');
          else if (!it.parentName && /[ก-๙a-z]/i.test(x)) it.parentName = x;
        }
      }
      if (fc && !it.classroom && map) cls = cls || fc;
      if (!it.classroom) it.classroom = cls;
      rows.push(it);
    });
    // เลขประจำตัวซ้ำในไฟล์: ใช้แถวล่าสุด
    var seen = {}, out = [];
    rows.forEach(function (x) { seen[x.studentId] = x; });
    rows.forEach(function (x) { if (seen[x.studentId] === x) out.push(x); });
    return { rows: out, bad: bad, dup: rows.length - out.length };
  }
  function parseImport(txt) {
    var grid = String(txt || '').split(/\r?\n/).map(function (line) {
      if (line.indexOf('\t') >= 0) return line.split('\t');
      if (line.indexOf(',') >= 0) return line.split(',');
      var c = line.trim().split(/\s{2,}/);
      return c.length > 1 ? c : line.trim().split(/\s+/);
    });
    var p = impFromGrid(grid, '');
    var def = impClass(S.sheet && S.sheet.defCls || '');
    if (def) p.rows.forEach(function (r) { if (!r.classroom) r.classroom = def; });
    return p;
  }
  function impToText(rows) {
    return rows.map(function (r) { return [r.studentId, r.prefix, r.firstName, r.lastName, r.classroom, r.number, r.parentName, r.parentPhone].join('\t'); }).join('\n');
  }
  function importPreview() {
    var sh = S.sheet;
    if (sh.reading) return twLoad(sh.reading);
    var p = parseImport(sh.txt);
    if (!p.rows.length) return '<div class="hint" style="margin:8px 0 14px">' + (sh.txt && sh.txt.trim() ? 'ยังหาเลขประจำตัวนักเรียนในข้อมูลไม่เจอ ตรวจว่ามีคอลัมน์เลขประจำตัว (ตัวเลข 4-12 หลัก)' : 'ยังไม่มีข้อมูล') + '</div>';
    var noCls = p.rows.filter(function (r) { return !r.classroom; }).length, noName = p.rows.filter(function (r) { return !r.firstName; }).length;
    var byCls = {};
    p.rows.forEach(function (r) { var k = r.classroom || 'ไม่ระบุห้อง'; byCls[k] = (byCls[k] || 0) + 1; });
    var exist = {}; (S.adm.students || []).forEach(function (x) { exist[x.id] = true; });
    var upd = p.rows.filter(function (r) { return exist[r.studentId]; }).length;
    var h = '<div class="imp-sum"><div><b>' + p.rows.length + '</b><span>คนพร้อมนำเข้า</span></div><div><b>' + (p.rows.length - upd) + '</b><span>เพิ่มใหม่</span></div><div><b>' + upd + '</b><span>อัปเดตข้อมูล</span></div></div>';
    h += '<div class="imp-cls">' + Object.keys(byCls).sort().map(function (k) { return '<span class="chip' + (k === 'ไม่ระบุห้อง' ? ' ch-bad' : ' ch-info') + '">' + esc(k) + ' ' + byCls[k] + ' คน</span>'; }).join('') + '</div>';
    h += '<div class="tbl-wrap imp-tbl"><table class="p-tbl"><thead><tr><th>เลขประจำตัว</th><th>ชื่อ-สกุล</th><th>ห้อง</th><th>เลขที่</th><th>ผู้ปกครอง</th></tr></thead><tbody>' +
      p.rows.slice(0, 6).map(function (r) {
        return '<tr><td>' + esc(r.studentId) + '</td><td class="l">' + esc(r.prefix + r.firstName + ' ' + r.lastName) + '</td><td' + (r.classroom ? '' : ' class="t-bad"') + '>' + esc(r.classroom || 'ไม่มี') + '</td><td>' + esc(r.number || '-') + '</td><td class="l">' + esc(r.parentName || '-') + '</td></tr>';
      }).join('') + (p.rows.length > 6 ? '<tr><td colspan="5" class="t-muted">และอีก ' + (p.rows.length - 6) + ' คน</td></tr>' : '') + '</tbody></table></div>';
    var warn = [];
    if (noCls) warn.push(noCls + ' คนยังไม่มีห้อง ใส่ "ห้องเริ่มต้น" ด้านบน หรือแก้ในช่องข้อความ');
    if (noName) warn.push(noName + ' คนไม่มีชื่อ');
    if (p.dup) warn.push('มีเลขประจำตัวซ้ำในไฟล์ ' + p.dup + ' แถว ใช้แถวล่าสุด');
    if (p.bad) warn.push('ข้าม ' + p.bad + ' แถวที่ไม่ใช่ข้อมูลนักเรียน');
    if (warn.length) h += '<div class="imp-warn">' + warn.map(function (w) { return '<div>' + ic('alert', 16) + esc(w) + '</div>'; }).join('') + '</div>';
    return h;
  }
  function shImport() {
    var sh = S.sheet;
    return '<h3 class="sh-t">นำเข้านักเรียน</h3><p class="sh-s">เลือกไฟล์ Excel, CSV หรือ PDF รายชื่อนักเรียน หรือคัดลอกจากตารางมาวาง ระบบจับคอลัมน์ให้อัตโนมัติ</p>' +
      '<div class="imp-drop" id="impDrop"><div class="imp-btns"><button class="btn btn-primary" data-act="imp-file" data-v="xlsx">' + ic('file', 20) + 'Excel / CSV</button>' +
      '<button class="btn btn-ghost imp-pdf" data-act="imp-file" data-v="pdf">' + ic('file', 20) + 'PDF</button></div>' +
      '<small>หรือลากไฟล์มาวางตรงนี้' + (sh.fileName ? ' · ไฟล์ล่าสุด: <b>' + esc(sh.fileName) + '</b>' : '') + '</small></div>' +
      '<label class="field" style="margin-top:12px"><span class="lbl">ห้องเริ่มต้น (ใช้กับคนที่ในไฟล์ไม่มีห้อง)</span><input class="inp" id="impCls" placeholder="เช่น ม.2/1" value="' + esc(sh.defCls || '') + '"></label>' +
      '<details class="imp-raw"' + (sh.txt ? '' : ' open') + '><summary>ข้อมูลที่จะนำเข้า (แก้ไขได้)</summary><div class="cols-hint">เลขประจำตัว | คำนำหน้า | ชื่อ | นามสกุล | ห้อง | เลขที่ | ชื่อผู้ปกครอง | เบอร์โทร</div>' +
      '<textarea class="inp" id="importTxt" style="min-height:140px;font-size:13.5px" placeholder="วางจาก Excel ได้ทั้งแบบมีหัวตารางหรือไม่มี เช่น&#10;เลขที่	เลขประจำตัว	ชื่อ-สกุล&#10;1	12345	ด.ช.ภูมิ ใจกล้า">' + esc(sh.txt || '') + '</textarea></details>' +
      '<div id="importPrev">' + importPreview() + '</div><p class="hint">คนที่มีเลขประจำตัวอยู่แล้วจะอัปเดตข้อมูล ไม่เปลี่ยนรหัสผ่าน คนใหม่ใช้รหัสผ่านเริ่มต้นของโรงเรียน (ถ้ายังไม่ได้กำหนด = เลขประจำตัว)</p>' +
      '<div id="formErr" class="err" role="alert"></div><button class="btn btn-primary btn-block" data-act="import-run"' + (sh.reading ? ' disabled' : '') + '>นำเข้า</button>';
  }
  function impRefresh() { var ip = $('importPrev'); if (ip) ip.innerHTML = importPreview(); }
  function impSetGrid(grid, ctxCls, name) {
    var p = impFromGrid(grid, ctxCls || '');
    var sh = S.sheet; if (!sh || sh.kind !== 'import') return;
    sh.reading = null; sh.fileName = name;
    if (!p.rows.length) { renderSheet(); toast('ไม่พบเลขประจำตัวนักเรียนในไฟล์นี้', 'warning'); return; }
    sh.txt = impToText(p.rows); renderSheet(); haptic();
    toast('อ่านไฟล์แล้ว พบ ' + p.rows.length + ' คน');
  }
  function impReadExcel(file) {
    var go = function () {
      var fr = new FileReader();
      fr.onload = function () {
        try {
          var wb = window.XLSX.read(new Uint8Array(fr.result), { type: 'array' }), grid = [];
          wb.SheetNames.forEach(function (n) {
            var g = window.XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '' });
            // แผ่นงานที่ตั้งชื่อเป็นห้อง (ม.2-1, 2_1, ม.2/1) ใช้เป็นห้องของทุกแถวในแผ่นนั้น
            var hint = /^(ม\.?\s*|มัธยม(ศึกษาปีที่)?\s*)?[1-6]\s*[\/\-_.]\s*\d{1,2}$/.test(n.trim()) ? impClass(n) : '';
            grid.push(['#SHEET', hint]);
            grid = grid.concat(g);
          });
          impSetGrid(grid, '', file.name);
        } catch (e) { S.sheet.reading = null; renderSheet(); toast('อ่านไฟล์ Excel ไม่ได้', 'warning'); }
      };
      fr.readAsArrayBuffer(file);
    };
    if (/\.csv$/i.test(file.name)) {
      // CSV: อ่านเป็นข้อความ UTF-8 (ภาษาไทยไม่เพี้ยน) แล้วแยกคอลัมน์เอง
      var fr2 = new FileReader();
      fr2.onload = function () {
        var txt = String(fr2.result || '').replace(/^\uFEFF/, '');
        var grid = txt.split(/\r?\n/).map(function (line) {
          var out = [], cur = '', q = false;
          for (var i = 0; i < line.length; i++) {
            var ch = line.charAt(i);
            if (ch === '"') { if (q && line.charAt(i + 1) === '"') { cur += '"'; i++; } else q = !q; }
            else if ((ch === ',' || ch === ';') && !q) { out.push(cur); cur = ''; }
            else cur += ch;
          }
          out.push(cur); return out;
        });
        impSetGrid(grid, '', file.name);
      };
      fr2.readAsText(file, 'UTF-8');
      return;
    }
    if (window.XLSX) go();
    else loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').then(go).catch(function () { S.sheet.reading = null; renderSheet(); toast('โหลดตัวอ่าน Excel ไม่สำเร็จ ตรวจอินเทอร์เน็ต', 'warning'); });
  }
  var PDFJS = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
  function impReadPdf(file) {
    var go = function () {
      var lib = window.pdfjsLib;
      lib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js';
      new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(new Uint8Array(fr.result)); }; fr.onerror = rej; fr.readAsArrayBuffer(file); })
        .then(function (buf) { return lib.getDocument({ data: buf }).promise; }).then(function (pdf) {
        var grid = [], n = pdf.numPages, chain = Promise.resolve();
        for (var i = 1; i <= Math.min(n, 60); i++) (function (pno) {
          chain = chain.then(function () {
            if (S.sheet) { S.sheet.reading = 'กำลังอ่าน PDF หน้า ' + pno + ' / ' + n; impRefresh(); }
            return pdf.getPage(pno).then(function (pg) { return pg.getTextContent(); }).then(function (tc) {
              var lines = [];
              tc.items.forEach(function (it) {
                if (!it.str || !it.str.trim()) return;
                var x = it.transform[4], y = it.transform[5], w = it.width || 0, L = null;
                for (var k = 0; k < lines.length; k++) if (Math.abs(lines[k].y - y) < 3.5) { L = lines[k]; break; }
                if (!L) { L = { y: y, items: [] }; lines.push(L); }
                L.items.push({ x: x, w: w, s: it.str, h: Math.abs(it.transform[3]) || 10 });
              });
              lines.sort(function (a, b) { return b.y - a.y; });
              lines.forEach(function (L) {
                L.items.sort(function (a, b) { return a.x - b.x; });
                var cells = [], cur = null, endX = -1e9;
                L.items.forEach(function (it) {
                  var gap = it.x - endX;
                  if (cur !== null && gap < it.h * 0.9) cur += (gap > it.h * 0.15 ? ' ' : '') + it.s;
                  else { if (cur !== null) cells.push(cur); cur = it.s; }
                  endX = it.x + it.w;
                });
                if (cur !== null) cells.push(cur);
                grid.push(cells);
              });
            });
          });
        })(i);
        return chain.then(function () { impSetGrid(grid, '', file.name); if (n > 60) toast('อ่าน 60 หน้าแรกเท่านั้น', 'info'); });
      }).catch(function () { if (S.sheet) { S.sheet.reading = null; renderSheet(); } toast('อ่าน PDF ไม่ได้ ไฟล์อาจเป็นภาพสแกนหรือมีรหัสผ่าน', 'warning'); });
    };
    if (window.pdfjsLib) go();
    else loadScript(PDFJS + 'pdf.min.js').then(go).catch(function () { S.sheet.reading = null; renderSheet(); toast('โหลดตัวอ่าน PDF ไม่สำเร็จ ตรวจอินเทอร์เน็ต', 'warning'); });
  }
  function impFile(file) {
    if (!file || !S.sheet || S.sheet.kind !== 'import') return;
    var n = file.name.toLowerCase();
    if (file.size > 15 * 1024 * 1024) { toast('ไฟล์ใหญ่เกิน 15 MB', 'warning'); return; }
    if (/\.pdf$/.test(n) || file.type === 'application/pdf') { S.sheet.reading = 'กำลังเปิดไฟล์ PDF'; impRefresh(); impReadPdf(file); }
    else if (/\.(xlsx|xls|xlsm|csv|ods)$/.test(n)) { S.sheet.reading = 'กำลังอ่านไฟล์ ' + file.name; impRefresh(); impReadExcel(file); }
    else toast('รองรับไฟล์ Excel, CSV และ PDF', 'warning');
  }

  /* views */
  function vAdmUsers() {
    var list = S.adm.users;
    var h = header('ครูและเจ้าหน้าที่', list ? list.length + ' บัญชี' : '', '', true) + '<main class="main">';
    if (!list) return h + loadingHtml() + '</main>';
    h += '<div class="group">' + (list.length ? list.map(function (u) {
      return '<button class="row" data-act="adm-user-edit" data-id="' + esc(u.id) + '">' + avatarHtml(u.id, u.firstName, u.photoVer) + '<span class="row-main"><span class="row-t">' + esc(u.name) + '</span>' +
        '<span class="row-s">' + esc(u.username) + (u.advisorClass ? ' ที่ปรึกษา ' + esc(u.advisorClass) : '') + '</span><span class="row-s"><span class="chip ch-info">' + roleName(u.role) + '</span>' +
        (u.active ? '' : '<span class="chip ch-bad">ปิดใช้งาน</span>') + (u.usesDefault ? '<span class="chip ch-info">ใช้รหัสเริ่มต้น</span>' : (u.mustChangePw ? '<span class="chip ch-warn">ยังไม่ตั้งรหัส</span>' : '')) + '</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    }).join('') : '<div class="empty">ยังไม่มีบัญชี</div>') + '</div></main>';
    if (isAdmin()) h += '<button class="fab no-print" data-act="adm-user-new">' + ic('plus') + 'เพิ่มครู</button>';
    if (isAdmin() && list.length) h = h.replace('<main class="main">', '<main class="main"><div class="ev-add" style="margin:0 0 12px"><button class="btn btn-ghost" data-act="phb-open" data-v="user">' + ic('camera', 20) + 'อัปโหลดรูปครูหลายคน</button></div>');
    return h;
  }
  function admFiltered() {
    var list = S.adm.students || [], q = S.aq.trim().toLowerCase();
    return list.filter(function (s) {
      if (S.acls !== 'all' && s.classroom !== S.acls) return false;
      if (S.astat === 'normal' && s.trackStatus) return false;
      if ((S.astat === 'SUSPENDED' || S.astat === 'WITHDRAWN') && s.trackStatus !== S.astat) return false;
      return !q || (s.name + ' ' + s.id + ' ' + s.classroom).toLowerCase().indexOf(q) >= 0;
    });
  }
  function bulkBar(f) {
    if (!isAdmin() || !(S.adm.students || []).length) return '';
    var sel = S.asel;
    if (!sel) {
      return '<div class="bulk"><button class="bk-b" data-act="asel-on">' + ic('checksq', 18) + 'เลือกหลายคน</button>' +
        (f.length ? '<button class="bk-b bk-bad" data-act="adel-all">' + ic('trash', 18) + 'ลบทั้งหมด' + (f.length < (S.adm.students || []).length ? 'ที่แสดง' : '') + ' (' + f.length + ')</button>' : '') + '</div>';
    }
    var n = Object.keys(sel).length, allOn = f.length && f.every(function (x) { return sel[x.id]; });
    return '<div class="bulk on"><span class="bk-n">เลือกแล้ว <b>' + n + '</b> คน</span>' +
      '<button class="bk-b" data-act="asel-all">' + (allOn ? 'ไม่เลือกที่แสดง' : 'เลือกทั้งหมดที่แสดง (' + f.length + ')') + '</button>' +
      (n ? '<button class="bk-b" data-act="asel-clear">ล้างการเลือก</button>' : '') +
      '<span class="bk-sp"></span><button class="bk-b bk-bad" data-act="adel-sel"' + (n ? '' : ' disabled') + '>' + ic('trash', 18) + 'ลบที่เลือก' + (n ? ' (' + n + ')' : '') + '</button>' +
      '<button class="bk-b bk-done" data-act="asel-off">เสร็จ</button></div>';
  }
  function admStudentRows() {
    var list = S.adm.students || [], f = admFiltered(), sel = S.asel, adm = isAdmin();
    var bar = bulkBar(f);
    if (!f.length) return bar + '<div class="group"><div class="empty">' + (list.length ? 'ไม่พบนักเรียนตามเงื่อนไขนี้' : 'ยังไม่มีรายชื่อนักเรียน กดนำเข้าจาก Excel เพื่อเริ่ม') + '</div></div>';
    return bar + '<div class="group cols">' + f.slice(0, 300).map(function (s) {
      var on = sel && sel[s.id];
      var inner = (sel ? '<span class="ck' + (on ? ' on' : '') + '">' + (on ? ic('check', 16) : '') + '</span>' : '') + avatarHtml(s.id, s.firstName, s.photoVer) + '<span class="row-main"><span class="row-t">' + esc(s.name) + '</span>' +
        '<span class="row-s">' + esc(s.classroom) + ' เลขที่ ' + esc(s.number) + ' เลขประจำตัว ' + esc(s.id) + '</span><span class="row-s">' +
        (s.trackStatus === 'SUSPENDED' ? '<span class="chip ch-hold">แขวนการติดตาม</span>' : (s.trackStatus === 'WITHDRAWN' ? '<span class="chip ch-bad">ถอนชื่อ</span>' : (s.active ? '' : '<span class="chip ch-bad">ปิดบัญชี</span>'))) + (s.usesDefault ? '<span class="chip ch-info">ใช้รหัสเริ่มต้น</span>' : (s.mustChangePw ? '<span class="chip ch-warn">ยังไม่ตั้งรหัส</span>' : '<span class="chip ch-ok">ตั้งรหัสเองแล้ว</span>')) +
        (s.lineLinked ? '<span class="chip ch-ok">LINE</span>' : '') + '</span></span>';
      if (sel) return '<button class="row' + (on ? ' sel' : '') + '" data-k="' + esc(s.id) + '" data-act="asel-t" data-id="' + esc(s.id) + '" aria-pressed="' + !!on + '">' + inner + '</button>';
      var row = '<button class="row"' + (adm ? '' : ' data-k="' + esc(s.id) + '"') + ' data-act="adm-stu-edit" data-id="' + esc(s.id) + '">' + inner + '<span class="chev">' + ic('chev', 20) + '</span></button>';
      return adm ? '<div class="row-split" data-k="' + esc(s.id) + '">' + row + '<button class="del-ic" data-act="stu-delete" data-id="' + esc(s.id) + '" aria-label="ลบ ' + esc(s.name) + '" title="ลบนักเรียนคนนี้">' + ic('trash', 18) + '</button></div>' : row;
    }).join('') + '</div>' + (f.length > 300 ? '<p class="hint" style="margin-top:8px">แสดง 300 คนแรก ค้นหาเพื่อดูคนอื่น (การเลือกทั้งหมดและลบทั้งหมดรวมทุกคนตามตัวกรอง ' + f.length + ' คน)</p>' : '');
  }
  function deleteMany(ids, label) {
    if (!ids.length) return;
    var typed = ids.length >= 5;
    var ask = !typed ? confirmBox({ title: 'ลบ ' + label + '?', text: 'ลบออกจากระบบถาวร พร้อมรูปและการแจ้งเตือนของนักเรียนเหล่านี้', ok: 'ลบ ' + ids.length + ' คน', danger: true })
      : (hasSwal() ? swalFire({
        title: 'ลบ ' + label + '?', icon: 'warning',
        html: '<div style="font-size:14.5px">ลบนักเรียน <b>' + ids.length + ' คน</b> ออกจากระบบถาวร<br>ถ้าต้องการเก็บประวัติไว้ ให้ใช้ <b>ถอนชื่อ</b> แทน<br><br>พิมพ์คำว่า <b style="color:var(--zero)">ลบทั้งหมด</b> เพื่อยืนยัน</div>',
        input: 'text', inputPlaceholder: 'ลบทั้งหมด', showCancelButton: true, confirmButtonText: 'ลบ ' + ids.length + ' คน', cancelButtonText: 'ยกเลิก', reverseButtons: true,
        customClass: { popup: 'sw-pop', confirmButton: 'sw-danger' },
        inputValidator: function (v) { if (String(v || '').trim() !== 'ลบทั้งหมด') return 'พิมพ์คำว่า ลบทั้งหมด ให้ถูกต้อง'; }
      }).then(function (r) { return r.isConfirmed; }) : Promise.resolve(window.prompt('พิมพ์คำว่า ลบทั้งหมด เพื่อยืนยันการลบ ' + ids.length + ' คน') === 'ลบทั้งหมด'));
    var run = function (force) {
      loading('กำลังลบ ' + ids.length + ' คน', 'อาจใช้เวลาสักครู่');
      API.call('adminDeleteStudents', { ids: ids, force: !!force }).then(function (d) {
        var gone = {}; (d.ids || ids).forEach(function (x) { gone[x] = true; });
        S.asel = null;
        afterDelete('students', function (x) { return !gone[x.id]; }, 'ลบนักเรียนแล้ว ' + d.deleted + ' คน', d.cases ? 'พร้อมรายการ 0 ร มส ' + d.cases + ' รายการ' : '');
      }).catch(function (e) {
        loaded();
        if (e.error !== 'HAS_CASES') { toast(e.message || 'ลบไม่สำเร็จ'); return; }
        confirmBox({ title: 'ลบพร้อมประวัติด้วย?', text: e.message + ' ถ้าลบ ประวัติและไฟล์หลักฐานของคนเหล่านี้จะถูกลบด้วย', ok: 'ลบพร้อมประวัติ', danger: true })
          .then(function (ok) { if (ok) run(true); });
      });
    };
    ask.then(function (ok) { if (ok) run(false); });
  }
  function vAdmStudents() {
    var list = S.adm.students, classes = [];
    (list || []).forEach(function (s) { if (classes.indexOf(s.classroom) < 0) classes.push(s.classroom); });
    classes.sort();
    var title = S.user.role === 'teacher' ? 'นักเรียนห้อง ' + esc(S.user.advisorClass) : 'นักเรียน';
    var h = '<header class="top col"><div style="display:flex;align-items:center;gap:10px"><button class="ib" data-act="back" aria-label="ย้อนกลับ">' + ic('back') + '</button><div class="top-h" style="flex:1">' + title + '</div>' +
      (list ? '<span class="top-s">' + list.length + ' คน</span>' : '') + '</div><label class="search">' + ic('search', 20) + '<input id="aq" type="search" placeholder="ค้นหาชื่อ เลขประจำตัว หรือห้อง" value="' + esc(S.aq) + '"></label></header>';
    h += '<main class="main" style="padding-top:4px">';
    if (!list) return h + loadingHtml() + '</main>';
    if (classes.length > 1) h += '<div class="chips">' + [['all', 'ทุกห้อง']].concat(classes.map(function (c) { return [c, c]; })).map(function (x) {
      return '<button class="fchip" data-act="acls" data-v="' + esc(x[0]) + '" aria-pressed="' + (S.acls === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div>';
    var cnt = { SUSPENDED: 0, WITHDRAWN: 0 };
    list.forEach(function (s) { if (cnt[s.trackStatus] !== undefined) cnt[s.trackStatus]++; });
    h += '<div class="chips" style="padding-top:6px">' + [['all', 'ทุกสถานะ'], ['normal', 'ติดตามปกติ'], ['SUSPENDED', 'แขวน ' + cnt.SUSPENDED], ['WITHDRAWN', 'ถอนชื่อ ' + cnt.WITHDRAWN]].map(function (x) {
      return '<button class="fchip" data-act="astat" data-v="' + x[0] + '" aria-pressed="' + ((S.astat || 'all') === x[0]) + '">' + x[1] + '</button>';
    }).join('') + '</div>';
    if (isManager()) h += '<div class="ev-add ev-3" style="margin-top:12px"><button class="btn btn-ghost" data-act="adm-stu-new">' + ic('plus', 20) + 'เพิ่มทีละคน</button><button class="btn btn-ghost" data-act="adm-import">' + ic('file', 20) + 'นำเข้า Excel / PDF</button><button class="btn btn-ghost" data-act="phb-open" data-v="stu">' + ic('camera', 20) + 'อัปโหลดรูปหลายคน</button></div>';
    else if (S.user.role === 'teacher' && S.user.advisorClass) h += '<div class="ev-add" style="margin-top:12px"><button class="btn btn-ghost" data-act="phb-open" data-v="stu">' + ic('camera', 20) + 'อัปโหลดรูปนักเรียนทั้งห้อง</button></div>';
    else h += '<p class="hint" style="margin:12px 2px 0">แตะชื่อนักเรียนเพื่อรีเซ็ตรหัสผ่านเมื่อนักเรียนลืม</p>';
    return h + '<div id="alist" style="margin-top:14px">' + admStudentRows() + '</div></main>';
  }
  function vAdmSubjects() {
    var list = S.adm.subjects;
    var h = header('รายวิชา', term(), '', true) + '<main class="main">';
    if (!list) return h + loadingHtml() + '</main>';
    [1, 2, 3, 4, 5, 6].forEach(function (lv) {
      var a = list.filter(function (s) { return s.level === lv; });
      if (!a.length) return;
      h += '<div class="sec"><h2>ม.' + lv + '</h2><span class="t-muted" style="font-size:14px">' + a.length + ' วิชา</span></div><div class="group">' + a.map(function (s) {
        return '<button class="row" data-act="adm-subj-edit" data-id="' + esc(s.code) + '"><span class="avatar" style="font-size:12px">' + esc(s.code.charAt(0)) + '</span><span class="row-main"><span class="row-t">' + esc(s.code) + ' ' + esc(s.name) + '</span>' +
          '<span class="row-s">' + esc(s.teacherName || 'ยังไม่ระบุครู') + ' ' + esc(s.type) + (s.credit !== '' ? ' ' + esc(s.credit) + ' หน่วยกิต' : '') + '</span>' + (s.active ? '' : '<span class="row-s"><span class="chip ch-bad">ปิดใช้งาน</span></span>') + '</span><span class="chev">' + ic('chev', 20) + '</span></button>';
      }).join('') + '</div>';
    });
    if (!list.length) h += '<div class="group"><div class="empty">ยังไม่มีรายวิชา กดเพิ่มรายวิชาด้านล่าง</div></div>';
    return h + '</main><button class="fab no-print" data-act="adm-subj-new">' + ic('plus') + 'เพิ่มรายวิชา</button>';
  }
  function vManage() {
    ['users', 'students', 'subjects'].forEach(function (k) { if (!S.adm[k] && !S['ld_' + k]) { S['ld_' + k] = 1; loadAdm(k, true); } });
    var n = function (k) { return S.adm[k] ? S.adm[k].length : '…'; };
    var stu = S.adm.students || [];
    var held = stu.filter(function (x) { return x.trackStatus; }).length;
    var card = function (k, icon, title, sub, btns) {
      return '<div class="mg-card"><button class="mg-head" data-act="adm-open" data-v="' + k + '"><span class="mg-ic">' + ic(icon, 24) + '</span><span class="mg-t"><b>' + title + '</b><small>' + sub + '</small></span><span class="mg-n">' + n(k) + '</span></button>' +
        '<div class="mg-act">' + btns + '</div></div>';
    };
    var h = header('จัดการข้อมูล', 'ผู้ดูแลระบบ เพิ่ม แก้ไข และลบข้อมูลทั้งหมด', refreshBtn(''));
    h += '<main class="main"><div class="mg-grid">' +
      card('users', 'users', 'ครูและเจ้าหน้าที่', 'บทบาท ห้องที่ปรึกษา รหัสผ่าน',
        '<button class="btn btn-primary" data-act="mg-add" data-v="users">' + ic('plus', 18) + 'เพิ่มครู</button><button class="btn btn-ghost" data-act="adm-open" data-v="users">แก้ไข / ลบ</button>') +
      card('students', 'user', 'นักเรียน', held ? 'แขวนหรือถอนชื่อ ' + held + ' คน' : 'ข้อมูลนักเรียนและผู้ปกครอง',
        '<button class="btn btn-primary" data-act="mg-add" data-v="students">' + ic('plus', 18) + 'เพิ่ม</button><button class="btn btn-ghost" data-act="mg-import">' + ic('file', 18) + 'นำเข้า Excel</button><button class="btn btn-ghost" data-act="adm-open" data-v="students">แก้ไข / ลบ</button>') +
      card('subjects', 'file', 'รายวิชา', 'รหัสวิชา ระดับชั้น ครูผู้สอน',
        '<button class="btn btn-primary" data-act="mg-add" data-v="subjects">' + ic('plus', 18) + 'เพิ่มรายวิชา</button><button class="btn btn-ghost" data-act="adm-open" data-v="subjects">แก้ไข / ลบ</button>') +
      '</div>' + manageSection(true) + '</main>';
    return h;
  }
  function manageSection(skipData) {
    var u = S.user, rows = [];
    if (isManager()) {
      rows.push(['users', 'users', 'ครูและเจ้าหน้าที่', isAdmin() ? 'เพิ่มครู กำหนดบทบาท รีเซ็ตรหัส' : 'ดูรายชื่อครู']);
      rows.push(['students', 'user', 'นักเรียน', 'นำเข้าจาก Excel แก้ไขข้อมูล รีเซ็ตรหัส']);
      rows.push(['subjects', 'file', 'รายวิชา', 'รหัสวิชาและครูผู้สอน']);
      if (isAdmin()) rows.push(['line', 'chat', 'LINE OA', 'สถานะ โควตาข้อความ Webhook ทดสอบส่ง']);
      if (isAdmin()) rows.push(['dev', 'user', 'ประวัติผู้พัฒนา', 'รูป ชื่อ ผลงาน ช่องทางติดต่อ แสดงที่หน้าแรก']);
      if (isAdmin()) rows.push(['logo', 'image', 'โลโก้โรงเรียน', 'อัปโหลดรูปโลโก้ใช้ทั้งระบบ']);
      rows.push(['report', 'printer', 'รูปแบบรายงาน', 'หัวรายงานและผู้ลงนาม']);
      if (isAdmin()) rows.push(['defpw', 'lock', 'รหัสผ่านเริ่มต้น', 'กำหนดรหัสเริ่มต้นของนักเรียนและครูทุกคนให้เหมือนกัน']);
      if (isAdmin()) rows.push(['backup', 'calendar', 'สำรองข้อมูลอัตโนมัติ', 'สำรอง Google Sheet ทุกวันอาทิตย์ กู้คืนได้จาก Drive']);
      if (isAdmin()) rows.push(['reset', 'refresh', 'ล้างข้อมูลทดลอง', 'เริ่มใช้งานจริง สำรองข้อมูลให้อัตโนมัติก่อนล้าง']);
      rows.push(['settings', 'lock', 'ตั้งค่าระบบ', isAdmin() ? 'ปีการศึกษา เกณฑ์การแก้ การแจ้งเตือน' : 'ดูเกณฑ์ที่ใช้อยู่']);
    } else if (u.role === 'teacher' && u.advisorClass) {
      rows.push(['students', 'user', 'นักเรียนห้อง ' + u.advisorClass, 'รีเซ็ตรหัสเมื่อนักเรียนลืม']);
    }
    if (skipData) rows = rows.filter(function (r) { return ['users', 'students', 'subjects'].indexOf(r[0]) < 0; });
    if (!rows.length) return '';
    return '<div class="sec"><h2>' + (skipData ? 'ตั้งค่าและเครื่องมือ' : 'จัดการระบบ') + '</h2></div><div class="group">' + rows.map(function (r) {
      return '<button class="row" data-act="adm-open" data-v="' + r[0] + '"><span class="nf-ic">' + ic(r[1], 20) + '</span><span class="row-main"><span class="row-t">' + esc(r[2]) + '</span><span class="row-s">' + esc(r[3]) + '</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    }).join('') + '</div>';
  }

  /* ---------- server ---------- */
  function refresh(silent) {
    if (!S.user || S.syncing) return;
    S.syncing = true;
    if (!silent) render();
    API.call('getHome').then(function (d) {
      S.syncing = false; S.loadErr = null; S.loaded = true; S.lastSync = now();
      if (d.user) { S.user = d.user; API.setSession(null, d.user); }
      S.settings = d.settings || S.settings;
      S.cases = d.cases || []; S.notifs = d.notifs || []; S.subjects = d.subjects || [];
      if (S.bootOverlay) { S.bootOverlay = false; loaded(); }
      saveCache(); render();
      syncLogo(S.settings && S.settings.logoVer);
      if (window.Theme && S.settings) window.Theme.setSchool(S.settings.themeColor, S.settings.themeFx === undefined || S.settings.themeFx === '' ? true : (S.settings.themeFx === true || String(S.settings.themeFx).toUpperCase() === 'TRUE'));
      checkCelebrate();
      if (S.settings && S.settings.sigVer && String(S.settings.sigVer) !== String(S.sigVer || '')) loadSigs();
      var top = S.stack[S.stack.length - 1];
      if (top && top.v === 'case') loadLog(top.id);
    }).catch(function (e) {
      S.syncing = false;
      if (S.bootOverlay) { S.bootOverlay = false; loaded(); }
      if (e.error === 'AUTH_EXPIRED' || e.error === 'MUST_CHANGE_PW') return;
      S.loadErr = e.message || 'เชื่อมต่อไม่สำเร็จ';
      render();
    });
  }
  function loadLog(id) {
    API.call('getCase', { id: id }).then(function (d) {
      S.logs[id] = d.log || [];
      S.ev[id] = d.evidence || [];
      if (d.item) upsertCase(d.item);
      saveCache();
      var top = S.stack[S.stack.length - 1];
      if (top && top.v === 'case' && top.id === id) render();
    }).catch(function () { S.logs[id] = []; });
  }
  function viewingCase() { var top = S.stack[S.stack.length - 1]; return top && top.v === 'case' ? top.id : null; }
  function applyDetail(d) {
    if (d && d.item) {
      upsertCase(d.item);
      if (d.log) { S.logs[d.item.id] = d.log; S.ev[d.item.id] = d.evidence || []; } else delete S.logs[d.item.id];
    }
    if (d && d.items) d.items.forEach(function (it) { upsertCase(it); delete S.logs[it.id]; });
  }
  function mutate(action, payload, btn, busyText, onOk) {
    setBusy(btn, true, busyText);
    loading(busyText || 'กำลังบันทึก');
    if (payload && payload.id && viewingCase() === payload.id) payload.detail = true;
    return API.call(action, payload).then(function (d) {
      loaded();
      applyDetail(d);
      saveCache(); haptic();
      if (onOk) onOk(d);
      render();
      var vc = viewingCase();
      if (vc && !S.logs[vc]) loadLog(vc);
    }).catch(function (e) {
      loaded();
      setBusy(btn, false);
      toast(e.message || 'ทำรายการไม่สำเร็จ');
    });
  }

  /** ทำให้หน้าจอเปลี่ยนทันที แล้วค่อยบันทึกเบื้องหลัง ถ้าไม่สำเร็จจะย้อนกลับ */
  function optimistic(action, payload, apply, undo, okMsg) {
    var snap = apply();
    haptic(); render(); if (okMsg) toast(okMsg);
    if (payload && payload.id && viewingCase() === payload.id) payload.detail = true;
    return API.call(action, payload).then(function (d) {
      applyDetail(d); saveCache(); render();
      return d;
    }).catch(function (e) {
      undo(snap); render();
      toast(e.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
      throw e;
    });
  }
  function snapCase(id) { var c = caseById(id); return c ? JSON.parse(JSON.stringify(c)) : null; }
  function restoreCase(snap) { if (snap) upsertCase(snap); }

  /* ---------- ล็อกหน้าต่าง: ปิดได้ด้วยปุ่ม ✕ เท่านั้น ---------- */
  var lockT = 0;
  function lockedHint(sel) {
    var box = document.querySelector(sel);
    if (box) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); var x = box.querySelector('.sh-x,.pop-x'); if (x) { x.classList.remove('pulse'); void x.offsetWidth; x.classList.add('pulse'); } }
    haptic();
    if (now() - lockT > 2500) { lockT = now(); toast('กดปุ่ม ✕ มุมขวาบนเพื่อปิดหน้าต่างนี้', 'info'); }
  }
  // กันปิดแท็บ/รีเฟรช/ออกจากหน้าเว็บ ขณะยังเปิดหน้าต่างค้างไว้
  window.addEventListener('beforeunload', function (e) {
    if (S.sheet && S.sheet.kind !== 'done') { e.preventDefault(); e.returnValue = ''; return ''; }
  });

  /* ---------- navigation ---------- */
  function push(v) {
    S.pop = null;
    S.stack.push(v);
    try { history.pushState({ d: S.stack.length }, ''); S.hist++; } catch (e) {}
    window.scrollTo(0, 0);
    render();
    if (v.v === 'case' && !S.logs[v.id] && !v.noload) loadLog(v.id);
  }
  function goBack() {
    if (S.hist > 0) { try { history.back(); return; } catch (e) {} }
    S.stack.pop(); window.scrollTo(0, 0); render();
  }
  window.addEventListener('popstate', function () {
    if (S.skipPop) { S.skipPop = false; return; }
    if (S.sheet || S.pop) {
      // กดย้อนกลับขณะเปิดหน้าต่าง: คงหน้าเดิมไว้ ต้องกดปุ่ม ✕ ก่อน
      try { history.pushState({ lock: 1 }, ''); } catch (e) {}
      lockedHint(S.sheet ? '.sheet' : '.pop');
      return;
    }
    if (!S.stack.length && S.hist === 0 && S.guard) {
      // อยู่หน้าแรกแล้ว ย้อนกลับอีกครั้งเพื่อออกจากระบบตามปกติ
      S.guard = false;
      try { history.back(); } catch (e) {}
      return;
    }
    if (S.hist > 0) S.hist--;
    if (S.sheet) closeSheet();
    if (S.stack.length) { S.stack.pop(); window.scrollTo(0, 0); render(); }
  });
  function resetNav() {
    if (S.hist > 0) { S.skipPop = true; try { history.go(-S.hist); } catch (e) { S.skipPop = false; } S.hist = 0; }
    S.stack = [];
  }

  /* ---------- auth flows ---------- */
  function afterLogin(d) {
    S.user = d.user; S.settings = d.settings || null;
    API.setSession(d.token, d.user);
    S.tab = 'home'; S.loaded = false; S.cases = []; S.notifs = []; S.subjects = []; S.logs = {}; S.ev = {}; S.students = null;
    loadCache(); render();
    if (!S.user.mustChangePw) refresh(true);
  }
  function doLogin(form) {
    var u = form.elements.u.value.trim(), p = form.elements.p.value, err = $('lgErr'), btn = $('lgBtn');
    err.textContent = '';
    if (!u || !p) { err.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ'; return; }
    setBusy(btn, true, 'กำลังเข้าสู่ระบบ');
    loading('กำลังเข้าสู่ระบบ');
    API.call('login', { username: u, password: p }).then(function (d) {
      haptic();
      if (!d.user.mustChangePw) { S.bootOverlay = true; loading('กำลังโหลดข้อมูล', 'ยินดีต้อนรับ ' + (d.user.firstName || '')); } else loaded();
      afterLogin(d);
    }).catch(function (e) {
      loaded();
      setBusy(btn, false);
      err.textContent = e.message || 'เข้าสู่ระบบไม่สำเร็จ';
      form.elements.p.value = '';
      form.elements.p.focus();
    });
  }
  function doChangePw(form) {
    var errEl = form.querySelector('[data-err]'), btn = form.querySelector('[type=submit]');
    var oldPw = form.elements.old.value, n1 = form.elements.n1.value, n2 = form.elements.n2.value;
    errEl.textContent = '';
    if (!oldPw || !n1) { errEl.textContent = 'กรอกให้ครบทุกช่อง'; return; }
    if (n1.length < 6) { errEl.textContent = 'รหัสผ่านใหม่ต้องยาวอย่างน้อย 6 ตัวอักษร'; return; }
    if (n1 !== n2) { errEl.textContent = 'รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน'; return; }
    setBusy(btn, true, 'กำลังบันทึก');
    loading('กำลังบันทึกรหัสผ่าน');
    API.call('changePassword', { oldPassword: oldPw, newPassword: n1 }).then(function (d) {
      loaded(); haptic();
      var forced = S.user.mustChangePw;
      S.user = d.user; API.setSession(null, d.user);
      closeSheet(); render(); toast('เปลี่ยนรหัสผ่านแล้ว');
      if (forced) refresh(true);
    }).catch(function (e) { loaded(); setBusy(btn, false); errEl.textContent = e.message || 'บันทึกไม่สำเร็จ'; });
  }
  function logout() {
    if (API.getToken()) API.call('logout').catch(function () {});
    API.clear(); clearCache(); resetNav();
    S.user = null; S.cases = []; S.notifs = []; S.subjects = []; S.students = null; S.logs = {}; S.ev = {}; S.loaded = false; S.tab = 'home';
    S.adm = { users: null, students: null, subjects: null, settings: null };
    closeSheet(); render();
    API.call('ping').catch(function () {});
  }

  function saveNewCase(btn) {
    var s = S.sheet, err = $('newErr');
    var fail = function (m) { if (err) err.textContent = m; };
    if (!s.sid) return fail('เลือกนักเรียนก่อน');
    if (!s.subj) return fail('เลือกรายวิชาก่อน');
    var tasks = String(s.tasks).split('\n').map(function (x) { return x.trim(); }).filter(function (x) { return x; });
    if (!tasks.length) return fail('ใส่สิ่งที่นักเรียนต้องทำอย่างน้อย 1 ข้อ');
    if (s.type === 'มส') {
      var ms = parseFloat(s.ms);
      if (isNaN(ms) || ms < 0 || ms > 100) return fail('กรอกเวลาเรียนเป็นเปอร์เซ็นต์ 0 ถึง 100');
      if (ms >= 80) return fail('เวลาเรียนถึง 80% แล้ว ไม่ต้องบันทึก มส');
    }
    var payload = { studentId: s.sid, subjectCode: s.subj, type: s.type, cause: s.cause, ms: s.type === 'มส' ? s.ms : '', tasks: tasks, due: s.due ? parseYmd(s.due) : '' };
    setBusy(btn, true, 'กำลังบันทึก');
    loading('กำลังบันทึก', 'และแจ้งนักเรียน');
    API.call('createCase', payload).then(function (d) {
      loaded();
      upsertCase(d.item); saveCache(); haptic(); render();
      var it = d.item;
      openSheet({
        kind: 'done', icon: it.status === 'REPEAT' ? 'alert' : 'check', again: true, btn: 'เสร็จแล้ว',
        title: 'บันทึกแล้ว', sub: it.studentName + ' ' + it.subjectName + ' (' + it.type + ')',
        next: it.status === 'REPEAT' ? ['ระบบบันทึกเป็น ต้องเรียนซ้ำ', 'แจ้งนักเรียนในแอปแล้ว'] : ['แจ้งนักเรียนในแอปแล้ว', 'นักเรียนกดรับทราบแล้วเริ่มทำตามรายการ', 'ติดตามได้ที่หน้า งานของฉัน']
      });
    }).catch(function (e) { loaded(); setBusy(btn, false); fail(e.message || 'บันทึกไม่สำเร็จ'); });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    // กดนอกกล่องแจ้งเตือน/ธีม = ปิด (กดปุ่มอื่นในแถบเครื่องมือได้ทันที)
    // กล่องแจ้งเตือน/ธีม/ค้นหา ล็อกไว้ ปิดได้ด้วยปุ่ม ✕ หรือกดปุ่มเดิมบนแถบเครื่องมือเท่านั้น
    if (S.pop && e.target.closest && !e.target.closest('.pop') && !e.target.closest('[data-act^="pop-"]')) {
      e.preventDefault(); e.stopPropagation(); lockedHint('.pop');
      return;
    }
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    var c = id ? caseById(id) : null, s = S.sheet;
    if (a === 'noop') return;
    switch (a) {
      case 'close-sheet': closeSheet(); break;
      case 'sheet-locked': lockedHint('.sheet'); break;
      case 'pop-locked': lockedHint('.pop'); break;
      case 'tab': S.pop = null; S.tab = v; resetNav(); window.scrollTo(0, 0); render(); break;
      case 'back': goBack(); break;
      case 'refresh': refresh(false); break;
      case 'open-case': push({ v: 'case', id: id }); break;
      case 'open-student': push({ v: 'student', sid: v }); break;
      case 'open-report': loadSigs(); push({ v: 'report', sid: v }); break;
      case 'goto-filter': S.tab = 'students'; S.filter = v; S.q = ''; window.scrollTo(0, 0); render(); break;
      case 'filter': S.filter = v; render(); break;
      case 'cls': S.cls = v; render(); break;
      case 'print': window.print(); break;
      case 'logout':
        confirmBox({ title: 'ออกจากระบบ?', text: 'ข้อมูลที่เก็บไว้ในเครื่องนี้จะถูกล้าง', ok: 'ออกจากระบบ', danger: true }).then(function (ok) { if (ok) logout(); });
        break;
      case 'pw-open': openSheet({ kind: 'pw' }); break;
      case 'howto':
        if (S.installEvt) {
          var ie = S.installEvt; S.installEvt = null;
          ie.prompt();
          if (ie.userChoice) ie.userChoice.then(function (r) { if (r && r.outcome === 'accepted') toast('ติดตั้งแอปแล้ว เปิดได้จากหน้าจอโทรศัพท์'); render(); });
        } else openSheet({ kind: 'howto' });
        break;
      case 'theme':
        var nt = isDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nt);
        try { localStorage.setItem(THEME_KEY, nt); } catch (err) {}
        render();
        if (S.sheet && S.sheet.kind === 'themepick') renderSheet();
        break;
      case 'eye':
        var inp = el.parentNode.querySelector('input'), show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        el.innerHTML = ic(show ? 'eyeoff' : 'eye', 20);
        break;

      case 'ack':
        if (!c) return;
        if (viewingCase() !== id) push({ v: 'case', id: id, noload: true });
        optimistic('ackCase', { id: id }, function () { var sn = snapCase(id); c.status = 'DOING'; return sn; }, restoreCase, 'รับทราบแล้ว ทำตามรายการได้เลย').catch(function () {});
        break;
      case 'task':
        if (!c || (c.status !== 'DOING' && c.status !== 'OPEN')) return;
        var i = +el.getAttribute('data-i'), val = !c.tasks[i].done;
        c.tasks[i].done = val;
        if (c.status === 'OPEN') c.status = 'DOING';
        haptic(); render();
        API.call('toggleTask', { id: id, index: i, done: val }).then(function (d) {
          upsertCase(d.item); saveCache();
          if (allDone(d.item)) toast('ครบทุกข้อแล้ว');
        }).catch(function (err) {
          var cc = caseById(id); if (cc) cc.tasks[i].done = !val;
          render(); toast(err.message || 'บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง');
        });
        break;
      case 'extend':
        if (!c) return;
        optimistic('extendCase', { id: id, days: 7 }, function () { var sn = snapCase(id); c.due = Math.max(c.due || 0, now()) + 7 * DAY; return sn; }, restoreCase,
          'เลื่อนกำหนดเป็น ' + thDate(Math.max(c.due || 0, now()) + 7 * DAY)).catch(function () {});
        break;
      case 'remind':
        haptic(); toast('ส่งแจ้งเตือนถึงนักเรียนแล้ว');
        el.disabled = true;
        API.call('remindCase', { id: id }).then(function () {
          if (viewingCase() === id) loadLog(id); else delete S.logs[id];
        }).catch(function (err) { el.disabled = false; toast(err.message || 'ส่งแจ้งเตือนไม่สำเร็จ'); });
        break;

      case 'tab-notif':
        S.pop = null; S.tab = 'home'; resetNav(); window.scrollTo(0, 0); render();
        setTimeout(function () { S.pop = 'notif'; S.popTab = S.popTab || 'all'; renderMain(); renderPop(); }, 0);
        break;
      case 'pop-search':
        if (S.pop === 'search') { S.pop = null; renderMain(); renderPop(); } else openSearch();
        break;
      case 'gs-q': S.gsq = v; var gq = $('gsq'); if (gq) { gq.value = v; gq.focus(); } $('gsres').innerHTML = gsResults(v); break;
      case 'gs-clear': try { localStorage.removeItem(GS_KEY); } catch (err) {} $('gsres').innerHTML = gsResults(''); break;
      case 'gs-case': gsRemember(S.gsq); S.pop = null; push({ v: 'case', id: id }); break;
      case 'gs-stu':
        gsRemember(S.gsq); S.pop = null;
        if (S.cases.some(function (x) { return x.sid === v; })) push({ v: 'student', sid: v });
        else if (S.subjects.length) {
          render();
          openSheet({ kind: 'new', sid: v, subj: null, type: '0', ms: '', cause: '', tasks: TASKS['0'].join('\n'), tasksEdited: false, due: ymd(now() + (+setting('defaultDays', 14)) * DAY), sq: '' });
          loadStudents();
        } else { render(); toast('นักเรียนคนนี้ยังไม่มีรายการ 0 ร มส', 'info'); }
        break;
      case 'pop-notif': case 'pop-theme':
        var which = a.slice(4); S.pop = S.pop === which ? null : which; S.popTab = S.popTab || 'all'; renderMain(); renderPop();
        break;
      case 'pop-close': S.pop = null; renderMain(); renderPop(); break;
      case 'pop-tab': S.popTab = v; renderPop(); break;
      case 'pop-readall':
        S.notifs.forEach(function (x) { x.read = true; }); saveCache(); renderMain(); renderPop();
        API.call('markRead', {}).catch(function () {});
        break;
      case 'pop-all': S.pop = null; S.tab = 'notif'; resetNav(); window.scrollTo(0, 0); render(); break;
      case 'pop-open':
        S.pop = null;
        var pn = S.notifs.filter(function (x) { return x.id === id; })[0];
        if (!pn) { render(); return; }
        if (!pn.read) { pn.read = true; saveCache(); API.call('markRead', { ids: [pn.id] }).catch(function () {}); }
        if (pn.caseId && caseById(pn.caseId)) push({ v: 'case', id: pn.caseId }); else render();
        break;
      case 'mode-set':
        if (v === 'auto') { document.documentElement.removeAttribute('data-theme'); try { localStorage.removeItem(THEME_KEY); } catch (err) {} }
        else { document.documentElement.setAttribute('data-theme', v); try { localStorage.setItem(THEME_KEY, v); } catch (err) {} }
        if (window.Theme) window.Theme.apply();
        renderMain(); renderPop();
        break;
      case 'open-notif':
        var n = S.notifs.filter(function (x) { return x.id === id; })[0];
        if (!n) return;
        if (!n.read) { n.read = true; saveCache(); API.call('markRead', { ids: [n.id] }).catch(function () {}); }
        if (n.caseId && caseById(n.caseId)) push({ v: 'case', id: n.caseId }); else render();
        break;
      case 'read-all':
        S.notifs.forEach(function (x) { x.read = true; }); saveCache(); render();
        API.call('markRead', {}).catch(function () {});
        break;

      case 'new-case':
        openSheet({ kind: 'new', sid: v || null, subj: null, type: '0', ms: '', cause: '', tasks: TASKS['0'].join('\n'), tasksEdited: false, due: ymd(now() + (+setting('defaultDays', 14)) * DAY), sq: '' });
        loadStudents();
        break;
      case 'new-pick-stu': s.sid = v; s.subj = null; renderSheet(); break;
      case 'stu-cls': s.scls = v; $('scls').innerHTML = stuChips(); flipRender($('sres'), stuResults(s.sq)); var sr = $('sres'); if (sr) sr.scrollTop = 0; break;
      case 'new-clear-stu': s.sid = null; s.subj = null; renderSheet(); break;
      case 'new-subj': s.subj = v; renderSheet(); break;
      case 'new-type': s.type = v; if (!s.tasksEdited) s.tasks = TASKS[v].join('\n'); renderSheet(); break;
      case 'new-save': saveNewCase(el); break;

      case 'adm-open':
        if (v === 'settings') { settingsForm(); break; }
        if (v === 'report') { loadSigs(); openSheet({ kind: 'report-config', cfg: reportCfg() }); break; }
        if (v === 'logo') { openSheet({ kind: 'logo' }); break; }
        if (v === 'dev') {
          openSheet({ kind: 'dev', data: null });
          API.call('getDevProfile').then(function (d) { if (S.sheet && S.sheet.kind === 'dev') { S.sheet.data = d; renderSheet(); } })
            .catch(function (err) { closeSheet(); toast(err.message || 'โหลดประวัติผู้พัฒนาไม่สำเร็จ'); });
          break;
        }
        if (v === 'defpw') {
          openSheet({ kind: 'defpw', data: null });
          API.call('adminDefaultPw').then(function (d) {
            if (S.sheet && S.sheet.kind === 'defpw') { S.sheet.data = d; S.sheet.form = { student: d.student, staff: d.staff, forceStudent: !!d.forceStudent, forceStaff: !!d.forceStaff, apply: 'unset', target: 'both' }; renderSheet(); }
          }).catch(function (err) { closeSheet(); toast(err.message || 'โหลดไม่สำเร็จ'); });
          break;
        }
        if (v === 'backup') {
          openSheet({ kind: 'backup', data: null });
          API.call('adminBackupInfo').then(function (d) { if (S.sheet && S.sheet.kind === 'backup') { S.sheet.data = d; renderSheet(); } })
            .catch(function (err) { closeSheet(); toast(err.message || 'โหลดข้อมูลการสำรองไม่สำเร็จ'); });
          break;
        }
        if (v === 'reset') { openSheet({ kind: 'reset-data', opt: { cases: true, students: true, subjects: true, users: true }, confirm: '' }); break; }
        if (v === 'line') {
          openSheet({ kind: 'linestatus', data: null });
          API.call('lineStatus').then(function (d) { if (S.sheet && S.sheet.kind === 'linestatus') { S.sheet.data = d; renderSheet(); } })
            .catch(function (err) { closeSheet(); toast(err.message || 'โหลดสถานะ LINE ไม่สำเร็จ'); });
          break;
        }
        S.aq = ''; S.acls = 'all'; S.asel = null;
        push({ v: 'adm-' + v }); loadAdm(v, true);
        if (v === 'subjects') loadAdm('users');
        break;
      case 'ph-pick': var fsp = $('fStuPh'); fsp.value = ''; fsp.setAttribute('data-id', id); fsp.click(); break;
      case 'ph-remove':
        confirmBox({ title: 'ลบรูปนักเรียน?', text: 'ลบรูปออกจากระบบ ใส่ใหม่ได้ภายหลัง', ok: 'ลบรูป', danger: true }).then(function (ok) { if (ok) savePhoto(id, ''); });
        break;
      case 'dev-pick': $('fDev').value = ''; $('fDev').click(); break;
      case 'dev-nophoto': s.photo = ''; renderSheet(); break;
      case 'dev-save':
        if (!s || !s.form) break;
        if (!String(s.form.name || '').trim()) { toast('ใส่ชื่อผู้พัฒนา'); break; }
        loading('กำลังบันทึกประวัติผู้พัฒนา');
        var dvp = { profile: s.form };
        if (s.photo !== undefined) dvp.photo = s.photo;
        API.call('saveDevProfile', dvp).then(function () {
          loaded(); closeSheet(); successBox('บันทึกประวัติผู้พัฒนาแล้ว', 'ผู้เข้าชมหน้าแรกจะเห็นข้อมูลใหม่ภายใน 5 นาที');
        }).catch(function (err) { loaded(); toast(err.message || 'บันทึกไม่สำเร็จ'); });
        break;
      case 'phb-open':
        openSheet({ kind: 'phbulk', who: v === 'user' ? 'user' : 'stu', mode: 'name', cls: S.acls !== 'all' ? S.acls : '', items: [] });
        if (v === 'user' && !S.adm.users) loadAdm('users', true);
        if (v !== 'user' && !S.adm.students) loadAdm('students', true);
        break;
      case 'phb-mode': s.mode = v; s.items.forEach(function (it) { it.manual = false; }); phRematch(); renderSheet(); break;
      case 'phb-cls': s.cls = v; phRematch(); renderSheet(); break;
      case 'phb-pick': var fpb = $('fPhb'); fpb.value = ''; fpb.click(); break;
      case 'phb-del': s.items.splice(+el.getAttribute('data-i'), 1); phRematch(); renderSheet(); break;
      case 'phb-clear': s.items = []; renderSheet(); break;
      case 'phb-run': phbRun(); break;
      case 'dp-eye': s.show = !s.show; renderSheet(); break;
      case 'dp-force': s.form[v] = !s.form[v]; renderSheet(); break;
      case 'dp-apply': s.form.apply = v; renderSheet(); break;
      case 'dp-target': s.form.target = v; renderSheet(); break;
      case 'dp-save':
        var fm = s.form, de = $('formErr');
        var who = fm.target === 'students' ? 'นักเรียนทุกคน' : (fm.target === 'staff' ? 'ครูทุกคน' : 'นักเรียนและครูทุกคน');
        var go2 = function () {
          loading('กำลังบันทึกรหัสเริ่มต้น', fm.apply !== 'none' ? 'กำลังปรับบัญชีทั้งหมด' : '');
          API.call('adminSetDefaultPw', fm).then(function (d) {
            loaded(); haptic(); S.adm.students = null; S.adm.users = null;
            s.data = d.info; renderSheet();
            successBox('บันทึกรหัสเริ่มต้นแล้ว', fm.apply === 'none' ? 'ใช้กับบัญชีใหม่และการรีเซ็ตครั้งต่อไป' : 'ปรับแล้ว นักเรียน ' + d.students + ' คน ครู ' + d.staff + ' คน');
          }).catch(function (err) { loaded(); if (de) de.textContent = err.message || 'บันทึกไม่สำเร็จ'; });
        };
        if (fm.apply === 'all') confirmBox({ title: 'รีเซ็ตรหัสผ่าน' + who + '?', text: 'ทุกคนจะกลับมาใช้รหัสเริ่มต้นนี้ รหัสที่ตั้งเองไว้จะใช้ไม่ได้ (ไม่รวมผู้ดูแลระบบ)', ok: 'รีเซ็ตทั้งหมด', danger: true }).then(function (ok) { if (ok) go2(); });
        else go2();
        break;
      case 'bk-toggle':
        if (!s || !s.data) break;
        var bon = !(s.data.enabled && s.data.scheduled);
        bkCall('adminBackupSet', { enabled: bon }, 'set', bon ? 'เปิดสำรองข้อมูลทุกสัปดาห์แล้ว' : 'ปิดสำรองข้อมูลอัตโนมัติแล้ว');
        break;
      case 'bk-keep': if (s && s.data) bkCall('adminBackupSet', { enabled: s.data.enabled, keep: +v }, 'set', 'เก็บไฟล์สำรองล่าสุด ' + v + ' ชุด'); break;
      case 'bk-now': bkCall('adminBackupNow', {}, 'now', 'สำรองข้อมูลเรียบร้อย'); break;
      case 'adm-user-new': userForm(null); break;
      case 'adm-user-edit': userForm((S.adm.users || []).filter(function (x) { return x.id === id; })[0]); break;
      case 'adm-stu-new': studentForm(null); break;
      case 'adm-stu-edit': studentForm((S.adm.students || []).filter(function (x) { return x.id === id; })[0]); break;
      case 'adm-subj-new': subjectForm(null); break;
      case 'adm-subj-edit': subjectForm((S.adm.subjects || []).filter(function (x) { return x.code === id; })[0]); break;
      case 'adm-import': openSheet({ kind: 'import', txt: '' }); break;
      case 'acls': S.acls = v; render(); break;
      case 'astat': S.astat = v; render(); break;
      case 'stu-status': setStudentStatus(id, v); break;
      case 'stu-delete': deleteStudent(id); break;
      case 'sum-open': push({ v: 'sum', scope: v }); if (S.user.role !== 'student') loadStudents(); break;
      case 'sum-cls': var tp = S.stack[S.stack.length - 1]; if (tp && tp.v === 'sum') { tp.cls = v; render(); } break;
      case 'asel-on': S.asel = {}; render(); break;
      case 'asel-off': S.asel = null; render(); break;
      case 'asel-clear': S.asel = {}; render(); break;
      case 'asel-t': if (S.asel) { if (S.asel[id]) delete S.asel[id]; else S.asel[id] = true; haptic(); var al0 = $('alist'); if (al0) al0.innerHTML = admStudentRows(); } break;
      case 'asel-all':
        if (!S.asel) break;
        var fl = admFiltered(), allOn = fl.length && fl.every(function (x) { return S.asel[x.id]; });
        fl.forEach(function (x) { if (allOn) delete S.asel[x.id]; else S.asel[x.id] = true; });
        var al1 = $('alist'); if (al1) al1.innerHTML = admStudentRows();
        break;
      case 'adel-sel': if (S.asel) deleteMany(Object.keys(S.asel), 'นักเรียนที่เลือก ' + Object.keys(S.asel).length + ' คน'); break;
      case 'adel-all':
        var fa = admFiltered();
        deleteMany(fa.map(function (x) { return x.id; }), fa.length === (S.adm.students || []).length ? 'นักเรียนทั้งหมด ' + fa.length + ' คน' : 'นักเรียนที่แสดงอยู่ ' + fa.length + ' คน' + (S.acls !== 'all' ? ' (ห้อง ' + S.acls + ')' : ''));
        break;
      case 'user-delete': deleteUser(id); break;
      case 'subj-delete': deleteSubject(id); break;
      case 'mg-add':
        if (v === 'users') userForm(null);
        else if (v === 'students') studentForm(null);
        else { loadAdm('users'); subjectForm(null); }
        break;
      case 'mg-import': openSheet({ kind: 'import', txt: '' }); break;
      case 'export-xlsx':
        if (v && v.indexOf('sum:') === 0) {
          var sc = v.slice(4), scls = sumClasses();
          exportExcel(S.cases.filter(function (c) { return sc === '*' ? scls.indexOf(c.classroom) >= 0 : c.classroom === sc; }), sc === '*' ? '' : sc);
        } else if (v === 'filter') {
          var q2 = S.q.trim().toLowerCase();
          exportExcel(S.cases.filter(function (c) {
            return passFilter(c, S.filter) && (!q2 || (c.studentName + ' ' + c.sid + ' ' + c.classroom + ' ' + c.subjectName).toLowerCase().indexOf(q2) >= 0);
          }), S.filter !== 'all' ? S.filter : '');
        } else exportExcel(S.cases, '');
        break;
      case 'sig-open':
        var sgi = s.cfg.signers[+el.getAttribute('data-i')];
        S.sigReturn = s.cfg;
        openSheet({ kind: 'sig', id: sgi.id, label: sgi.label, name: sgi.name || '' });
        break;
      case 'sig-back': openSheet({ kind: 'report-config', cfg: S.sigReturn || reportCfg() }); break;
      case 'sig-draw': s.mode = 'draw'; s.drawn = false; renderSheet(); break;
      case 'sig-clear': renderSheet(); s.drawn = false; break;
      case 'sig-use':
        if (!s.drawn) { toast('เซ็นชื่อบนกรอบก่อน'); return; }
        var pad = $('sigPad'), tmp = document.createElement('canvas');
        tmp.width = pad.width; tmp.height = pad.height; tmp.getContext('2d').drawImage(pad, 0, 0);
        s.data = trimSignature(tmp, false, 140); s.mode = ''; renderSheet();
        break;
      case 'sig-upload': $('fSig').value = ''; $('fSig').click(); break;
      case 'sig-remove': s.data = ''; renderSheet(); break;
      case 'sig-save':
        loading('กำลังบันทึกลายเซ็น');
        API.call('saveSignature', { id: s.id, data: s.data }).then(function (d) {
          loaded(); S.sigs = S.sigs || {};
          if (s.data) S.sigs[s.id] = s.data; else delete S.sigs[s.id];
          S.sigVer = d.ver; S.settings = S.settings || {}; S.settings.sigVer = d.ver;
          try { localStorage.setItem(SIG_KEY, JSON.stringify({ sigs: S.sigs, ver: S.sigVer })); } catch (err) {}
          successBox(s.data ? 'บันทึกลายเซ็นแล้ว' : 'ลบลายเซ็นแล้ว');
          openSheet({ kind: 'report-config', cfg: S.sigReturn || reportCfg() });
        }).catch(function (err) { loaded(); toast(err.message || 'บันทึกไม่สำเร็จ'); });
        break;
      case 'rc-printsig': s.cfg.printSig = s.cfg.printSig === false; renderSheet(); break;
      case 'form-chip': s.values[el.getAttribute('data-k')] = v; renderSheet(); break;
      case 'form-color': s.values[el.getAttribute('data-k')] = v; renderSheet(); break;
      case 'form-sw': var fk = el.getAttribute('data-k'); s.values[fk] = !s.values[fk]; renderSheet(); break;
      case 'form-save': saveForm(el); break;
      case 'adm-reset':
        if (!el.getAttribute('data-ok')) {
          var rsBtn = el;
          confirmBox({ title: 'รีเซ็ตรหัสผ่าน?', text: 'รหัสเดิมจะใช้ไม่ได้ทันที', ok: 'รีเซ็ต' }).then(function (ok) {
            if (ok) { rsBtn.setAttribute('data-ok', '1'); rsBtn.click(); }
          });
          return;
        }
        var kind = el.getAttribute('data-kind');
        setBusy(el, true, 'กำลังรีเซ็ต');
        API.call('adminResetPassword', { kind: kind, id: id }).then(function (d) {
          haptic();
          var lst = S.adm[kind === 'user' ? 'users' : 'students'];
          if (lst) lst.forEach(function (x) { if (x.id === id) x.mustChangePw = true; });
          render();
          openSheet({ kind: 'temp', title: 'รีเซ็ตรหัสผ่านแล้ว', sub: 'แจ้งรหัสนี้ให้เจ้าของบัญชี ชื่อผู้ใช้ ' + d.username, pw: d.tempPassword });
        }).catch(function (err) { setBusy(el, false); toast(err.message || 'รีเซ็ตไม่สำเร็จ'); });
        break;
      case 'copy-temp':
        try {
          navigator.clipboard.writeText(S.sheet.pw).then(function () { toast('คัดลอกแล้ว'); }, function () { toast('คัดลอกไม่ได้ จดรหัสไว้แทน'); });
        } catch (err) { toast('คัดลอกไม่ได้ จดรหัสไว้แทน'); }
        break;
      case 'imp-file':
        var fim = $('fImp'); fim.value = '';
        fim.accept = v === 'pdf' ? 'application/pdf,.pdf' : '.xlsx,.xls,.xlsm,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv';
        fim.click();
        break;
      case 'import-run':
        var parsed = parseImport(s.txt), ie = $('formErr');
        if (!parsed.rows.length) { if (ie) ie.textContent = 'วางข้อมูลจาก Excel ก่อน'; return; }
        setBusy(el, true, 'กำลังนำเข้า ' + parsed.rows.length + ' คน');
        loading('กำลังนำเข้า ' + parsed.rows.length + ' คน', 'อาจใช้เวลาสักครู่');
        API.call('adminImportStudents', { rows: parsed.rows }).then(function (d) {
          loaded(); haptic(); S.adm.students = null; loadAdm('students', true); S.students = null;
          openSheet({ kind: 'done', icon: 'check', title: 'นำเข้าแล้ว', sub: 'เพิ่มใหม่ ' + d.created + ' คน อัปเดต ' + d.updated + ' คน', next: d.created ? ['นักเรียนใหม่ใช้รหัสผ่านเริ่มต้นของโรงเรียน (ไม่ได้กำหนด = เลขประจำตัว)', 'เปลี่ยนรหัสเองได้ที่เมนู ฉัน'] : null });
        }).catch(function (err) { loaded(); setBusy(el, false); if (ie) ie.textContent = err.message || 'นำเข้าไม่สำเร็จ'; });
        break;

      case 'open-report-class': loadSigs(); push({ v: 'report-class', cls: v }); break;
      case 'rc-remark': s.cfg.remark = !s.cfg.remark; renderSheet(); break;
      case 'rc-toggle': var ti = +el.getAttribute('data-i'); s.cfg.signers[ti].on = s.cfg.signers[ti].on === false; renderSheet(); break;
      case 'rc-up': case 'rc-down':
        var mi = +el.getAttribute('data-i'), mj = a === 'rc-up' ? mi - 1 : mi + 1, sg = s.cfg.signers;
        if (mj < 0 || mj >= sg.length) return;
        var tmp = sg[mi]; sg[mi] = sg[mj]; sg[mj] = tmp; renderSheet();
        break;
      case 'rc-del': s.cfg.signers.splice(+el.getAttribute('data-i'), 1); renderSheet(); break;
      case 'rc-add': s.cfg.signers.push({ id: 'c' + now(), label: '', name: '', on: true }); renderSheet(); break;
      case 'rc-reset':
        confirmBox({ title: 'กลับไปใช้ค่าเริ่มต้น?', text: 'ผู้ลงนามและชื่อที่ตั้งไว้จะถูกแทนที่', ok: 'ใช้ค่าเริ่มต้น' }).then(function (ok) {
          if (ok && S.sheet) { S.sheet.cfg = JSON.parse(JSON.stringify(DEFAULT_REPORT)); renderSheet(); }
        });
        break;
      case 'rc-save':
        var cfgOut = s.cfg;
        cfgOut.signers = cfgOut.signers.filter(function (g) { return String(g.label || '').trim(); });
        loading('กำลังบันทึกรูปแบบรายงาน');
        API.call('saveReportConfig', { config: cfgOut }).then(function (d) {
          loaded();
          S.settings = S.settings || {}; S.settings.reportConfig = JSON.stringify(d.config); saveCache();
          closeSheet(); render(); successBox('บันทึกรูปแบบรายงานแล้ว');
        }).catch(function (err) { loaded(); toast(err.message || 'บันทึกไม่สำเร็จ'); });
        break;
      case 'logo-pick': $('fLogo').value = ''; $('fLogo').click(); break;
      case 'logo-remove': s.newData = ''; renderSheet(); break;
      case 'logo-save':
        loading('กำลังบันทึกโลโก้');
        API.call('saveLogo', { data: s.newData }).then(function (d) {
          loaded();
          S.logo = s.newData || null; S.logoVer = d.ver;
          try { if (S.logo) localStorage.setItem(LOGO_KEY, JSON.stringify({ data: S.logo, ver: d.ver })); else localStorage.removeItem(LOGO_KEY); } catch (err) {}
          applyFavicon(); closeSheet(); render(); successBox('บันทึกโลโก้แล้ว', 'ทุกคนจะเห็นโลโก้ใหม่เมื่อเปิดระบบครั้งถัดไป');
        }).catch(function (err) { loaded(); toast(err.message || 'บันทึกไม่สำเร็จ'); });
        break;

      case 'theme-open': openSheet({ kind: 'themepick' }); break;
      case 'reset-opt':
        s.opt[v] = !s.opt[v];
        if (v === 'students' && s.opt.students) s.opt.cases = true;
        renderSheet();
        break;
      case 'reset-run':
        var ro = s.opt, rc = s.confirm.trim();
        confirmBox({ title: 'ยืนยันล้างข้อมูล?', text: 'ข้อมูลที่เลือกจะถูกลบออกจากระบบ (มีไฟล์สำรองให้ใน Drive)', ok: 'ล้างข้อมูล', danger: true }).then(function (ok) {
          if (!ok) return;
          loading('กำลังสำรองและล้างข้อมูล', 'อาจใช้เวลาสักครู่ อย่าปิดหน้านี้');
          API.call('adminResetData', { confirm: rc, options: ro }).then(function (d) {
            loaded(); haptic();
            S.cases = []; S.notifs = []; S.logs = {}; S.ev = {}; S.students = null;
            S.adm = { users: null, students: null, subjects: null, settings: null };
            saveCache(); render(); refresh(true);
            openSheet({ kind: 'setup-real', result: d });
          }).catch(function (e) { loaded(); toast(e.message || 'ล้างข้อมูลไม่สำเร็จ'); });
        });
        break;
      case 'setup-go':
        closeSheet();
        if (S.tab !== 'me') { S.tab = 'me'; resetNav(); }
        render();
        setTimeout(function () { var b = document.querySelector('[data-act=adm-open][data-v="' + v + '"]'); if (b) b.click(); }, 0);
        break;
      case 'theme-pick': if (window.Theme) { window.Theme.set(v); haptic(); renderSheet(); renderPop(); } break;
      case 'theme-fx': if (window.Theme) { window.Theme.setFx(!window.Theme.get().fx); render(); renderSheet(); } break;
      case 'theme-reset': if (window.Theme) { window.Theme.reset(); render(); renderSheet(); } break;
      case 'line-open': openLine('self'); break;
      case 'line-student':
        var lst = (S.adm.students || []).filter(function (x) { return x.id === id; })[0];
        openSheet({ kind: 'line', target: 'student', sid: id, name: lst ? lst.name : id, linked: lst ? lst.lineLinked : false });
        break;
      case 'line-code':
        s.loading = true; s.err = ''; renderSheet();
        API.call('lineLinkCode', s.sid ? { studentId: s.sid } : {}).then(function (d) {
          if (!S.sheet || S.sheet.kind !== 'line') return;
          S.sheet.loading = false; S.sheet.code = d.code; S.sheet.link = d.link; S.sheet.oaId = d.oaId; S.sheet.addFriend = d.addFriend;
          if (!d.lineOn) S.sheet.err = 'ระบบ LINE ยังไม่เปิดใช้งาน ผู้ปกครองจะยังไม่ได้รับข้อความ';
          renderSheet();
        }).catch(function (err) { if (S.sheet) { S.sheet.loading = false; S.sheet.err = err.message || 'สร้างรหัสไม่สำเร็จ'; renderSheet(); } });
        break;
      case 'line-check':
        if (s.target === 'student') {
          S.adm.students = null;
          API.call('adminStudents').then(function (list) {
            S.adm.students = list; render();
            var x = list.filter(function (y) { return y.id === s.sid; })[0];
            if (S.sheet && S.sheet.kind === 'line') { S.sheet.linked = !!(x && x.lineLinked); S.sheet.code = null; renderSheet(); }
            toast(x && x.lineLinked ? 'เชื่อม LINE ผู้ปกครองแล้ว' : 'ยังไม่พบการเชื่อม ลองอีกครั้งหลังผู้ปกครองส่งข้อความ');
          }).catch(function () {});
        } else {
          API.call('me').then(function (d) {
            S.user = d.user; API.setSession(null, d.user); render();
            if (S.sheet && S.sheet.kind === 'line') { if (d.user.lineLinked) S.sheet.code = null; renderSheet(); }
            toast(d.user.lineLinked ? 'เชื่อม LINE แล้ว' : 'ยังไม่พบการเชื่อม ลองอีกครั้งหลังส่งข้อความในแชท');
          }).catch(function () {});
        }
        break;
      case 'line-unlink':
        if (!el.getAttribute('data-ok')) {
          var unBtn = el;
          confirmBox({ title: 'ยกเลิกการเชื่อม LINE?', text: 'จะไม่ได้รับแจ้งเตือนทาง LINE อีก', ok: 'ยกเลิกการเชื่อม', danger: true }).then(function (ok) {
            if (ok) { unBtn.setAttribute('data-ok', '1'); unBtn.click(); }
          });
          return;
        }
        setBusy(el, true, 'กำลังยกเลิก');
        API.call('lineUnlink', s.target === 'student' ? { studentId: s.sid } : {}).then(function () {
          if (s.target === 'student') { s.linked = false; S.adm.students = null; loadAdm('students', true); }
          else { S.user.lineLinked = false; API.setSession(null, S.user); }
          closeSheet(); render(); toast('ยกเลิกการเชื่อม LINE แล้ว');
        }).catch(function (err) { setBusy(el, false); toast(err.message || 'ยกเลิกไม่สำเร็จ'); });
        break;
      case 'line-test':
        setBusy(el, true, 'กำลังส่ง');
        API.call('lineTest').then(function () { setBusy(el, false); toast('ส่งข้อความทดสอบแล้ว ดูใน LINE ของคุณ'); })
          .catch(function (err) { setBusy(el, false); toast(err.message || 'ส่งไม่สำเร็จ'); });
        break;
      case 'copy-text':
        try { navigator.clipboard.writeText(v).then(function () { toast('คัดลอกแล้ว'); }, function () { toast('คัดลอกไม่ได้'); }); } catch (err) { toast('คัดลอกไม่ได้'); }
        break;

      case 'add-cam': case 'add-pick':
        S.pendingCase = id;
        var fi = $(a === 'add-cam' ? 'fCam' : 'fPick');
        fi.value = ''; fi.click();
        break;
      case 'ev-rm':
        var eid = el.getAttribute('data-e'), rmBtn = el;
        confirmBox({ title: 'ลบไฟล์นี้?', ok: 'ลบ', danger: true }).then(function (ok) { if (ok) removeEvidence(id, eid, rmBtn); });
        break;
      case 'ev-view':
        var evId = el.getAttribute('data-e'), evName = el.getAttribute('data-n');
        openSheet({ kind: 'img', eid: evId, name: evName });
        API.call('getEvidenceFile', { id: evId }).then(function (d) {
          if (!S.sheet || S.sheet.eid !== evId) return;
          S.sheet.pdf = d.mime === 'application/pdf';
          S.sheet.src = S.sheet.pdf ? b64ToBlobUrl(d.data, d.mime) : 'data:' + d.mime + ';base64,' + d.data;
          renderSheet();
        }).catch(function (err) {
          if (!S.sheet || S.sheet.eid !== evId) return;
          S.sheet.err = err.message || 'เปิดไฟล์ไม่สำเร็จ'; renderSheet();
        });
        break;
      case 'submit':
        mutate('submitCase', { id: id }, el, 'กำลังส่ง', function (d) {
          openSheet({ kind: 'done', icon: 'send', home: true, title: 'ส่งให้ครูแล้ว', sub: d.item.subjectName + ' แนบหลักฐาน ' + curEvidence(d.item).length + ' ไฟล์',
            next: ['ครูตรวจหลักฐานภายใน 1–2 วันทำการ', 'ถ้าผ่าน งานวัดผลจะอนุมัติและบันทึกเกรดใหม่', 'ระบบแจ้งผลที่หน้าแจ้งเตือน'] });
        });
        break;
      case 'done-home': closeSheet(); resetNav(); S.tab = 'home'; window.scrollTo(0, 0); render(); break;
      case 'grade-open': openSheet({ kind: 'grade', cid: id }); break;
      case 'grade-pass':
        mutate('gradeCase', { id: id, result: 'pass', grade: +v }, el, '', function () { closeSheet(); toast('บันทึกผลแล้ว ส่งต่องานวัดผลอนุมัติ'); });
        break;
      case 'grade-fail':
        var gfBtn = el;
        confirmBox({ title: 'ยืนยันผล ไม่ผ่าน?', text: c ? c.studentName + ' ' + c.subjectName : '', ok: 'ไม่ผ่าน', danger: true }).then(function (ok) {
          if (!ok) return;
          mutate('gradeCase', { id: id, result: 'fail' }, gfBtn, 'กำลังบันทึก', function (d) {
          closeSheet();
          toast(d.item.status === 'REPEAT' ? 'บันทึกแล้ว นักเรียนต้องเรียนซ้ำ' : 'บันทึกแล้ว แจ้งนักเรียนให้แก้ต่อ');
          });
        });
        break;
      case 'reject-open': openSheet({ kind: 'reject', cid: id, note: '' }); break;
      case 'quick-note': s.note = v; renderSheet(); break;
      case 'reject-send':
        if (!s.note || !s.note.trim()) { var re = $('rejErr'); if (re) re.textContent = 'พิมพ์หรือเลือกข้อความบอกนักเรียนก่อน'; return; }
        mutate('returnCase', { id: id, note: s.note.trim() }, el, 'กำลังส่ง', function () { closeSheet(); toast('ส่งกลับให้นักเรียนแก้แล้ว'); });
        break;
      case 'approve':
        if (!c) return;
        optimistic('approveCases', { ids: [id] }, function () { var sn = snapCase(id); c.status = 'APPROVED'; c.upd = now(); return sn; }, restoreCase).catch(function () {});
        confetti(1800); toast('อนุมัติแล้ว');
        break;
      case 'approve-all':
        var ids = S.cases.filter(function (x) { return x.status === 'PASSED'; }).map(function (x) { return x.id; });
        if (!ids.length) return;
        if (!el.getAttribute('data-ok')) {
          var apBtn = el;
          confirmBox({ title: 'อนุมัติทั้งหมด ' + ids.length + ' รายการ?', text: 'ผลจะถูกบันทึกและแจ้งนักเรียนทันที', ok: 'อนุมัติทั้งหมด' }).then(function (ok) {
            if (ok) { apBtn.setAttribute('data-ok', '1'); apBtn.click(); }
          });
          return;
        }
        optimistic('approveCases', { ids: ids }, function () {
          var sn = ids.map(snapCase);
          ids.forEach(function (x) { var cc = caseById(x); if (cc) { cc.status = 'APPROVED'; cc.upd = now(); } });
          return sn;
        }, function (sn) { sn.forEach(restoreCase); }).catch(function () {});
        openSheet({ kind: 'done', icon: 'seal', title: 'อนุมัติแล้ว ' + ids.length + ' รายการ', sub: 'ระบบกำลังแจ้งนักเรียนและครูผู้สอน' });
        confetti();
        break;
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.getAttribute && t.getAttribute('data-dev') && S.sheet && S.sheet.kind === 'dev' && S.sheet.form) { S.sheet.form[t.getAttribute('data-dev')] = t.value; return; }
    if (t.getAttribute && t.getAttribute('data-phb') !== null && S.sheet && S.sheet.kind === 'phbulk') {
      var pit = S.sheet.items[+t.getAttribute('data-phb')];
      if (pit) { pit.to = t.value; pit.manual = true; phRematch(); renderSheet(); }
      return;
    }
    if (t.getAttribute && t.getAttribute('data-dp') && S.sheet && S.sheet.kind === 'defpw') { S.sheet.form[t.getAttribute('data-dp')] = t.value; return; }
    if (t.id === 'gsq') { S.gsq = t.value; flipRender($('gsres'), gsResults(t.value)); return; }
    if (t.id === 'q') { S.q = t.value; flipRender($('slist'), studentListHtml()); return; }
    if (t.id === 'sq' && S.sheet) { S.sheet.sq = t.value; var srs = $('sres'); flipRender(srs, stuResults(t.value)); if (srs) srs.scrollTop = 0; return; }
    if (t.id === 'aq') { S.aq = t.value; flipRender($('alist'), admStudentRows()); return; }
    if (t.id === 'importTxt' && S.sheet) { S.sheet.txt = t.value; impRefresh(); return; }
    if (t.id === 'impCls' && S.sheet) { S.sheet.defCls = t.value; impRefresh(); return; }
    if (t.id === 'themeColor' && window.Theme) { window.Theme.set(t.value); return; } // พรีวิวสด ไม่วาดใหม่ระหว่างลาก
    if (t.id === 'resetConfirm' && S.sheet) {
      S.sheet.confirm = t.value;
      var rb = document.querySelector('[data-act=reset-run]');
      if (rb) rb.disabled = t.value.trim() !== 'ล้างข้อมูล';
      return;
    }
    var rk = t.getAttribute('data-rk');
    if (rk && S.sheet && S.sheet.cfg) { S.sheet.cfg[rk] = t.value; return; }
    var ri = t.getAttribute('data-ri');
    if (ri !== null && ri !== undefined && S.sheet && S.sheet.cfg) { S.sheet.cfg.signers[+ri][t.getAttribute('data-rf')] = t.value; return; }
    var fk2 = t.getAttribute('data-fk');
    if (fk2 && S.sheet && S.sheet.values) { S.sheet.values[fk2] = t.value; return; }
    var k = t.getAttribute('data-k');
    if (k && S.sheet) {
      S.sheet[k] = t.value;
      if (k === 'tasks') S.sheet.tasksEdited = true;
      if (k === 'ms') { var w = $('msw'); if (w) w.innerHTML = msWarn(t.value); }
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'themeColor' && window.Theme) { window.Theme.set(t.value); renderSheet(); renderPop(); return; }
    var nid = t.getAttribute && t.getAttribute('data-note');
    if (!nid) return;
    var c = caseById(nid);
    if (!c || c.note === t.value) return;
    var state = $('noteState');
    if (state) state.textContent = 'กำลังบันทึก';
    API.call('saveNote', { id: nid, note: t.value }).then(function (d) {
      upsertCase(d.item); saveCache();
      var st = $('noteState'); if (st) st.textContent = 'บันทึกแล้ว';
    }).catch(function (err) {
      var st = $('noteState'); if (st) st.textContent = '';
      toast(err.message || 'บันทึกข้อความไม่สำเร็จ');
    });
  });

  document.addEventListener('submit', function (e) {
    var id = e.target.id;
    if (id === 'loginForm') { e.preventDefault(); doLogin(e.target); }
    else if (id === 'mustForm' || id === 'pwForm') { e.preventDefault(); doChangePw(e.target); }
  });
  document.addEventListener('keydown', function (e) {
    var tg = e.target, typing = tg && (tg.tagName === 'INPUT' || tg.tagName === 'TEXTAREA' || tg.isContentEditable);
    if (((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) || (e.key === '/' && !typing && !S.sheet)) {
      if (canSearch() && !(S.user && S.user.mustChangePw)) { e.preventDefault(); if (S.pop !== 'search') openSearch(); }
      return;
    }
    if (tg && tg.id === 'gsq' && (e.key === 'Enter' || e.key === 'ArrowDown')) {
      var first = document.querySelector('#gsres .gs-r');
      if (first) { e.preventDefault(); if (e.key === 'Enter') first.click(); else first.focus(); }
      return;
    }
    if (tg && tg.classList && tg.classList.contains('gs-r') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      var all = [].slice.call(document.querySelectorAll('#gsres .gs-r')), i = all.indexOf(tg);
      e.preventDefault();
      if (e.key === 'ArrowDown' && all[i + 1]) all[i + 1].focus();
      else if (e.key === 'ArrowUp') { if (i > 0) all[i - 1].focus(); else { var gi = $('gsq'); if (gi) gi.focus(); } }
      return;
    }
    if (e.key !== 'Escape') return;
    // ล็อกหน้าต่าง: Esc ไม่ปิด ต้องกดปุ่ม ✕
    if (S.sheet) { e.preventDefault(); lockedHint('.sheet'); return; }
    if (S.pop) { e.preventDefault(); lockedHint('.pop'); }
  });
  window.addEventListener('resize', function () { if (S.pop) renderPop(); });

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && S.user && !S.user.mustChangePw && now() - S.lastSync > 60000) refresh(true);
  });
  function offlineBar(on) {
    var bar = $('offlineBar');
    if (on && !bar) {
      bar = document.createElement('div'); bar.id = 'offlineBar'; bar.className = 'offline';
      bar.textContent = 'ไม่มีอินเทอร์เน็ต ข้อมูลที่แสดงอาจไม่เป็นปัจจุบัน';
      document.body.appendChild(bar);
    } else if (!on && bar) bar.parentNode.removeChild(bar);
  }
  window.addEventListener('offline', function () { offlineBar(true); });
  // ปุ่มติดตั้งแอป (Android/Chrome/Edge): เก็บไว้ใช้ตอนกด "เพิ่มไว้ที่หน้าจอโทรศัพท์"
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); S.installEvt = e; if (S.user && S.tab === 'me' && !S.stack.length) renderMain(); });
  window.addEventListener('appinstalled', function () { S.installEvt = null; });
  window.addEventListener('online', function () { offlineBar(false); if (S.user) refresh(true); });

  API.onExpired = function () {
    if (!S.user) return;
    clearCache(); resetNav();
    S.user = null; S.sheet = null; S.loaded = false;
    renderSheet(); render();
    toast('หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่');
  };
  API.onMustChange = function () { if (S.user) { S.user.mustChangePw = true; render(); } };

  /* ---------- boot ---------- */
  function boot() {
    try { history.pushState({ guard: 1 }, ''); S.guard = true; } catch (e) {}
    applyTheme();
    applyFavicon();
    if (typeof window.hideSplash === 'function') window.hideSplash();
    else {
      var sp = document.getElementById('splash');
      if (sp) { sp.className += ' out'; setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 450); }
    }
    fileInputs();
    if (navigator.onLine === false) offlineBar(true);
    if (!API.getToken()) {
      render();
      API.call('ping').then(function (d) { syncLogo(d.logoVer); if (window.Theme) window.Theme.setSchool(d.themeColor, d.themeFx); }).catch(function () {}); // ปลุกเซิร์ฟเวอร์ + เช็กโลโก้และสีโรงเรียน
      return;
    }
    S.user = API.cachedUser();
    if (!S.user) { API.clear(); render(); return; }
    loadCache();
    render();
    refresh(true);
  }
  boot();
})();
