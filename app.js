/* app.js : Step 2
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
    cases: [], notifs: [], subjects: [], students: null, studentsAt: 0, logs: {},
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
  function toast(msg) {
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
  function isOpen(c) { return c.status !== 'APPROVED' && c.status !== 'REPEAT'; }
  function isOverdue(c) { return (c.status === 'OPEN' || c.status === 'DOING') && c.due && c.due < now(); }
  function allDone(c) { for (var i = 0; i < c.tasks.length; i++) { if (!c.tasks[i].done) return false; } return c.tasks.length > 0; }
  function capOf(c) { return c.type === '0' ? +setting('capZero', 1) : (c.type === 'มส' ? +setting('capMs', 1) : 4); }
  function tcls(t) { return t === '0' ? 't0' : (t === 'ร' ? 'tr' : 'tm'); }
  function typeName(t) { return t === '0' ? 'ผลการเรียน 0' : (t === 'ร' ? 'ร รอการตัดสิน' : 'มส ไม่มีสิทธิ์สอบ'); }
  function urgency(c) {
    if (c.status === 'APPROVED') return 9e15 - (c.upd || 0);
    if (c.status === 'REPEAT') return 8e15;
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
    else { cls = tcls(c.type); txt = esc(c.type); }
    return '<span class="stamp ' + cls + (lg ? ' lg' : '') + '">' + txt + '</span>';
  }
  function typeStamp(t, lg) { return '<span class="stamp ' + tcls(t) + (lg ? ' lg' : '') + '">' + t + '</span>'; }
  function chip(c) {
    var m = {
      OPEN: ['รอรับทราบ', 'warn'], DOING: [c.rejectNote ? 'ครูขอให้แก้' : 'กำลังแก้', 'warn'], SUBMITTED: ['รอครูตรวจ', 'info'],
      PASSED: ['รออนุมัติ', 'info'], APPROVED: ['แก้เสร็จ', 'ok'], REPEAT: ['เรียนซ้ำ', 'bad']
    }[c.status] || [c.status, ''];
    if (isOverdue(c)) m = ['เลยกำหนด', 'bad'];
    return '<span class="chip ch-' + m[1] + '">' + m[0] + '</span>';
  }
  function dueInfo(c) {
    if (c.status === 'APPROVED') return { t: 'แก้เสร็จ ' + thDate(c.upd), k: 'ok' };
    if (c.status === 'REPEAT') return { t: 'ต้องลงทะเบียนเรียนซ้ำ', k: 'bad' };
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
  function avatarHtml(key, name) {
    var n = 0; key = String(key);
    for (var i = 0; i < key.length; i++) n = (n + key.charCodeAt(i)) % 5;
    return '<span class="avatar av' + n + '">' + esc(initials(name)) + '</span>';
  }
  function emblem() {
    return '<div class="emblem">' + ic('cap', 30) + (C.LOGO_URL ? '<img src="' + esc(C.LOGO_URL) + '" alt="" onerror="this.parentNode.removeChild(this)">' : '') + '</div>';
  }
  function ring(done, total) {
    var r = 34, Cc = 2 * Math.PI * r, p = total ? done / total : 1;
    return '<div class="ring" role="img" aria-label="แก้เสร็จ ' + done + ' จาก ' + total + '"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="8"/><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (Cc * p).toFixed(1) + ' ' + Cc.toFixed(1) + '"/></svg><div class="ring-t"><span>' + done + '/' + total + '<small>แก้เสร็จ</small></span></div></div>';
  }
  function refreshBtn(cls) {
    return '<button class="ib ' + (cls || '') + '" data-act="refresh" aria-label="โหลดข้อมูลใหม่">' + (S.syncing ? '<span class="spin"></span>' : ic('refresh', 20)) + '</button>';
  }
  function heroHeader(title, sub, extra) {
    return '<header class="top hero">' + refreshBtn('hero-ref') + '<div class="top-t"><div class="greet">' + greet() + '</div><div class="top-h" style="font-size:22px">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + (extra || '') + '</div></header>';
  }
  function header(title, sub, right, back) {
    return '<header class="top">' + (back ? '<button class="ib" data-act="back" aria-label="ย้อนกลับ">' + ic('back') + '</button>' : '') +
      '<div class="top-t"><div class="top-h">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + '</div>' + (right || '') + '</header>';
  }
  function syncNote() {
    if (S.loadErr) return '<div class="banner bad" style="margin-bottom:14px">' + ic('alert') + '<div><b>โหลดข้อมูลล่าสุดไม่สำเร็จ</b><p>' + esc(S.loadErr) + ' ข้อมูลที่เห็นอาจไม่เป็นปัจจุบัน</p></div></div>';
    return '';
  }
  function loadingHtml() {
    return '<div class="group"><div class="soon"><span class="spin"></span><b>กำลังโหลดข้อมูล</b><span>ครั้งแรกอาจใช้เวลาไม่กี่วินาที</span></div></div>';
  }
  function actbar(btns, hint) {
    if (!btns) return '';
    return '<div class="actbar no-print">' + (hint ? '<div class="actbar-hint">' + hint + '</div>' : '') + '<div class="actbar-in">' + btns + '</div></div>';
  }
  function tallyHtml(cs, clickable) {
    var t = tally(cs);
    return '<div class="tally">' + TYPES.map(function (k) {
      var inner = typeStamp(k, true) + '<span class="tally-n">' + t[k] + '</span><span class="tally-l">' + TDESC[k] + '<br>ยังไม่แก้เสร็จ</span>';
      return clickable ? '<button class="tally-i" data-act="goto-filter" data-v="' + k + '">' + inner + '</button>' : '<div class="tally-i">' + inner + '</div>';
    }).join('') + '</div>';
  }

  /* ---------- login & password ---------- */
  function pwField(name, label, auto, hint) {
    return '<label class="field"><span class="lbl">' + label + '</span><span class="pw-wrap"><input class="inp" type="password" name="' + name + '" autocomplete="' + auto + '" required>' +
      '<button type="button" class="pw-eye" data-act="eye" aria-label="แสดงรหัสผ่าน">' + ic('eye', 20) + '</button></span></label>' + (hint ? '<p class="hint">' + hint + '</p>' : '');
  }
  function vLogin() {
    return '<div class="login"><div class="login-top">' + emblem() +
      '<div class="lg-school">' + esc(C.SCHOOL || 'โรงเรียนบ้านละลม') + '</div><h1 class="lg-h">' + esc(C.APP_NAME || 'ติดตามการแก้ 0 ร มส') + '</h1></div>' +
      '<div class="login-card"><div class="lg-stamps" aria-hidden="true">' + typeStamp('0') + typeStamp('ร') + typeStamp('มส') + '</div>' +
      '<form id="loginForm" novalidate>' +
      '<label class="field"><span class="lbl">เลขประจำตัวนักเรียน หรือชื่อผู้ใช้ครู</span><input class="inp" name="u" autocapitalize="off" autocorrect="off" autocomplete="username" required></label>' +
      pwField('p', 'รหัสผ่าน', 'current-password', '') +
      '<div id="lgErr" class="err" role="alert"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="lgBtn">เข้าสู่ระบบ</button></form>' +
      '<p class="demo-tag">ลืมรหัสผ่าน นักเรียนติดต่อครูที่ปรึกษา ครูติดต่องานวัดผล</p></div>' +
      '<p class="foot">' + FOOT + '</p></div>';
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
    var u = S.user, cs = S.cases.slice().sort(byUrg);
    var open = cs.filter(isOpen), done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length;
    var msg = !cs.length ? ['ไม่มีวิชาที่ต้องแก้', 'เยี่ยมมาก รักษาผลการเรียนแบบนี้ไว้'] : (!open.length ? ['แก้ครบทุกวิชาแล้ว', 'เยี่ยมมาก รักษาผลการเรียนแบบนี้ไว้'] : (done === 0 ? ['เริ่มทีละวิชา เดี๋ยวก็ครบ', 'เหลือ ' + open.length + ' วิชา ทำวิชาที่ใกล้ครบกำหนดก่อน'] : ['อีกนิดเดียว สู้ ๆ', 'เหลืออีก ' + open.length + ' วิชา']));
    var h = heroHeader(esc(u.firstName), esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' ' + term(),
      S.loaded ? '<div class="hero-row">' + ring(done, cs.length) + '<div class="hero-msg"><b>' + msg[0] + '</b><span>' + msg[1] + '</span></div></div>' : '');
    h += '<main class="main">' + syncNote();
    if (!S.loaded) return h + loadingHtml() + '</main>';
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
    var h = header(esc(c.subjectName), role === 'student' ? esc(c.subject) + ' ' + esc(c.teacherName) : esc(c.studentName) + ' ' + esc(c.classroom), '', true);
    h += '<main class="main">';
    h += '<div class="hero">' + stamp(c, true) + '<div><div class="hero-t">' + typeName(c.type) + '</div><div class="hero-s">' + esc(c.cause || '-') + '</div>' +
      '<div class="hero-s">' + (c.type !== 'ร' ? 'แก้ครั้งที่ ' + c.attempt + ' จาก ' + setting('maxAttempts', 2) + ' ครั้ง ' : '') + 'ผลหลังแก้สูงสุด ' + capOf(c) + '</div></div></div>';
    if (c.rejectNote && c.status === 'DOING') h += '<div class="banner bad">' + ic('alert') + '<div><b>ครูขอให้แก้หลักฐาน</b><p>' + esc(c.rejectNote) + '</p></div></div>';
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

    h += '<div class="sec"><h2>หลักฐาน</h2></div><div class="group"><div class="soon" style="padding:22px 16px">' + ic('camera', 28) +
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
  function caseActions(c) {
    var role = S.user.role, id = esc(c.id);
    if (role === 'student') {
      if (c.status === 'OPEN') return actbar('<button class="btn btn-primary" data-act="ack" data-id="' + id + '">' + ic('check') + 'รับทราบและเริ่มแก้</button>');
      if (c.status === 'DOING') return actbar('<button class="btn btn-ghost" disabled>' + ic('send') + 'ส่งให้ครูตรวจ</button>', 'ปุ่มส่งหลักฐานจะเปิดใช้ในขั้นถัดไป');
      if (c.status === 'SUBMITTED') return actbar('<button class="btn btn-ghost" disabled>ส่งแล้ว ครูจะตรวจภายใน 1–2 วันทำการ</button>');
      if (c.status === 'PASSED') return actbar('<button class="btn btn-ghost" disabled>ผ่านแล้ว รองานวัดผลอนุมัติ</button>');
      return '';
    }
    var active = c.status === 'OPEN' || c.status === 'DOING';
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
    return '<div class="group">' + order.map(function (sid) {
      var list = groups[sid], s = list[0], open = list.filter(isOpen), late = list.filter(isOverdue).length;
      return '<button class="row" data-act="open-student" data-v="' + esc(sid) + '">' + avatarHtml(sid, s.firstName || s.studentName) + '<span class="row-main"><span class="row-t">' + esc(s.studentName) + '</span>' +
        '<span class="row-s">' + esc(s.classroom) + ' เลขที่ ' + esc(s.number) + '</span><span class="row-s">' + (open.length ? '<span class="chip ch-warn">ค้าง ' + open.length + ' วิชา</span>' : '<span class="chip ch-ok">แก้ครบแล้ว</span>') + (late ? '<span class="chip ch-bad">เลยกำหนด ' + late + '</span>' : '') + '</span></span>' +
        '<span class="stack">' + open.slice(0, 3).map(function (c) { return stamp(c); }).join('') + '</span></button>';
    }).join('') + '</div>';
  }
  function vTeacherStudents() {
    var u = S.user;
    var f = [['all', 'ทั้งหมด']];
    if (u.role === 'teacher') f.push(['mine', 'วิชาที่ฉันสอน']);
    if (u.advisorClass) f.push(['adv', 'ห้องที่ปรึกษา ' + u.advisorClass]);
    f = f.concat([['late', 'เลยกำหนด'], ['review', 'รอตรวจ'], ['0', 'ติด 0'], ['ร', 'ติด ร'], ['มส', 'ติด มส'], ['m1', 'ม.1'], ['m2', 'ม.2'], ['m3', 'ม.3']]);
    var h = '<header class="top col"><div style="display:flex;align-items:center;gap:10px"><div class="top-h" style="flex:1">นักเรียน</div>' + refreshBtn('') + '</div><label class="search">' + ic('search', 20) + '<input id="q" type="search" placeholder="ค้นหาชื่อ เลขประจำตัว ห้อง หรือวิชา" value="' + esc(S.q) + '" aria-label="ค้นหานักเรียน"></label></header>';
    h += '<main class="main" style="padding-top:4px"><div class="chips" role="group" aria-label="ตัวกรอง">' + f.map(function (x) {
      return '<button class="fchip" data-act="filter" data-v="' + esc(x[0]) + '" aria-pressed="' + (S.filter === x[0]) + '">' + esc(x[1]) + '</button>';
    }).join('') + '</div><div id="slist" style="margin-top:14px">' + (S.loaded ? studentListHtml() : loadingHtml()) + '</div></main>';
    if (S.subjects.length) h += '<button class="fab no-print" data-act="new-case">' + ic('plus') + 'บันทึก 0 ร มส</button>';
    return h;
  }
  function vStudent(sid) {
    var cs = S.cases.filter(function (c) { return c.sid === sid; }).sort(byUrg);
    var s = cs[0] || {};
    var h = header(esc(s.studentName || sid), esc(s.classroom || '') + ' เลขที่ ' + esc(s.number || '-') + ' เลขประจำตัว ' + esc(sid), '', true);
    h += '<main class="main"><div class="group"><dl class="kv"><dt>ผู้ปกครอง</dt><dd>' + esc(s.parentName || '-') + '</dd><dt>LINE ผู้ปกครอง</dt><dd>' + (s.parentLine ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</dd></dl></div>';
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
    var list = S.cases.filter(function (c) { return c.status === 'PASSED'; });
    var h = header('อนุมัติผลการแก้', 'ครูผู้สอนให้ผ่านแล้ว รอบันทึกผล', refreshBtn(''));
    h += '<main class="main">' + (list.length ? '<div class="group">' + list.map(function (c) { return caseRow(c, true); }).join('') + '</div>' :
      '<div class="group"><div class="soon">' + ic('seal', 32) + '<b>ยังไม่มีรายการรออนุมัติ</b><span>เมื่อครูตรวจหลักฐานและให้ผ่านแล้วจะขึ้นที่นี่ ปุ่มอนุมัติจะเปิดใช้ในขั้นถัดไป</span></div></div>');
    return h + '</main>';
  }
  function classesOf(cs) {
    var out = [];
    cs.forEach(function (c) { if (c.classroom && out.indexOf(c.classroom) < 0) out.push(c.classroom); });
    return out.sort();
  }
  function vReportTab() {
    var cs = S.cases, classes = classesOf(cs);
    if (!S.cls || classes.indexOf(S.cls) < 0) S.cls = classes[0] || null;
    var h = header('รายงาน', term(), refreshBtn(''));
    h += '<main class="main">';
    if (!S.loaded) return h + loadingHtml() + '</main>';
    if (!classes.length) return h + '<div class="group"><div class="soon">' + ic('printer', 32) + '<b>ยังไม่มีข้อมูลสำหรับรายงาน</b><span>เมื่อครูบันทึกนักเรียนที่ติด 0 ร มส แล้วรายงานจะขึ้นที่นี่</span></div></div></main>';
    h += '<div class="sec" style="margin-top:4px"><h2>สรุปรายห้อง</h2></div><div class="group"><div class="tbl-wrap"><table class="p-tbl" style="min-width:0;font-size:14px"><thead><tr><th>ห้อง</th><th>0</th><th>ร</th><th>มส</th><th>แก้เสร็จ</th></tr></thead><tbody>';
    classes.forEach(function (cl) {
      var a = cs.filter(function (c) { return c.classroom === cl; }), t = tally(a);
      var d = a.filter(function (c) { return c.status === 'APPROVED'; }).length;
      h += '<tr><td>' + esc(cl) + '</td><td>' + t['0'] + '</td><td>' + t['ร'] + '</td><td>' + t['มส'] + '</td><td>' + d + '/' + a.length + '</td></tr>';
    });
    h += '</tbody></table></div></div><div class="sec"><h2>พิมพ์รายบุคคล</h2></div><div class="chips" style="padding-top:0">' + classes.map(function (cl) {
      return '<button class="fchip" data-act="cls" data-v="' + esc(cl) + '" aria-pressed="' + (S.cls === cl) + '">' + esc(cl) + '</button>';
    }).join('') + '</div><div class="group" style="margin-top:12px">';
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
    var s = cs[0] || {}, done = cs.filter(function (c) { return c.status === 'APPROVED'; }).length;
    var st = { OPEN: 'รอรับทราบ', DOING: 'กำลังแก้', SUBMITTED: 'รอครูตรวจ', PASSED: 'รออนุมัติ', APPROVED: 'แก้เสร็จ', REPEAT: 'เรียนซ้ำ' };
    var dots = '..................................';
    var h = header('รายงานรายบุคคล', esc(s.studentName || sid), '', true);
    h += '<main class="main"><div class="paper"><div class="p-head">' + emblem() + '<h3>แบบรายงานการติดตามการแก้ผลการเรียน 0 ร มส</h3><p>' + esc(setting('schoolName', 'โรงเรียนบ้านละลม')) + ' ' + esc(setting('areaName', '')) + '</p><p>' + term() + '</p></div>';
    h += '<div class="p-info"><div>ชื่อ-สกุล <b>' + esc(s.studentName || '-') + '</b></div><div>เลขประจำตัว <b>' + esc(sid) + '</b></div><div>ชั้น <b>' + esc(s.classroom || '-') + '</b> เลขที่ <b>' + esc(s.number || '-') + '</b></div><div>ผู้ปกครอง <b>' + esc(s.parentName || '-') + '</b></div></div>';
    h += '<div class="tbl-wrap"><table class="p-tbl"><thead><tr><th>ที่</th><th>รหัสวิชา</th><th>รายวิชา</th><th>ผลเดิม</th><th>ครั้งที่</th><th>สถานะ</th><th>ผลหลังแก้</th><th>ครูผู้สอน</th></tr></thead><tbody>';
    if (cs.length) cs.forEach(function (c, i) {
      h += '<tr><td>' + (i + 1) + '</td><td>' + esc(c.subject) + '</td><td class="l">' + esc(c.subjectName) + '</td><td>' + esc(c.type) + '</td><td>' + c.attempt + '</td><td>' + (st[c.status] || c.status) + '</td><td>' + (c.status === 'APPROVED' ? esc(c.grade) : '-') + '</td><td class="l">' + esc(c.teacherName) + '</td></tr>';
    });
    else h += '<tr><td colspan="8">ไม่มีรายวิชาที่ติด 0 ร มส</td></tr>';
    h += '</tbody></table></div><p class="p-sum">รวม ' + cs.length + ' รายวิชา แก้เสร็จ ' + done + ' รายวิชา ค้าง ' + (cs.length - done) + ' รายวิชา</p>';
    h += '<div class="p-sign"><div>ลงชื่อ ' + dots + '<br>(' + esc(s.studentName || dots) + ')<br>นักเรียน</div><div>ลงชื่อ ' + dots + '<br>(' + esc(s.parentName || dots) + ')<br>ผู้ปกครอง</div>' +
      '<div>ลงชื่อ ' + dots + '<br>(' + dots + ')<br>ครูที่ปรึกษา</div><div>ลงชื่อ ' + dots + '<br>(' + (S.user.role === 'measure' ? esc(S.user.displayName) : dots) + ')<br>หัวหน้างานวัดผล</div></div>';
    h += '<div class="p-date">พิมพ์เมื่อ ' + thDate(now()) + ' ' + thTime(now()) + ' น.</div></div></main>';
    return h + actbar('<button class="btn btn-primary" data-act="print">' + ic('printer', 20) + 'พิมพ์ หรือบันทึกเป็น PDF</button>');
  }

  /* ---------- shared ---------- */
  function notifIcon(type) {
    var m = { 'new': ['bell', 'warn'], alert: ['alert', 'bad'], bell: ['bell', 'warn'], calendar: ['calendar', ''], check: ['check', 'ok'], seal: ['seal', 'ok'], image: ['image', ''] };
    return m[type] || ['bell', ''];
  }
  function vNotif() {
    var un = unread();
    var h = header('แจ้งเตือน', un ? 'ยังไม่อ่าน ' + un + ' รายการ' : 'อ่านครบแล้ว', un ? '<button class="ib" style="width:auto;padding:0 12px;font-size:14px;font-weight:600" data-act="read-all">อ่านทั้งหมด</button>' : refreshBtn(''));
    h += '<main class="main">' + syncNote() + '<div class="group">' + (!S.loaded ? '<div class="soon"><span class="spin"></span></div>' : (S.notifs.length ? S.notifs.map(function (n) {
      var ni = notifIcon(n.type);
      return '<button class="nf' + (n.read ? '' : ' unread') + '" data-act="open-notif" data-id="' + esc(n.id) + '"><span class="nf-ic ' + ni[1] + '">' + ic(ni[0], 20) + '</span><span><b>' + esc(n.title) + '</b><span>' + esc(n.body) + '</span><time>' + ago(n.at) + '</time></span></button>';
    }).join('') : '<div class="empty">ยังไม่มีแจ้งเตือน</div>')) + '</div></main>';
    return h;
  }
  function vMe() {
    var u = S.user;
    var h = header('ฉัน', roleName(u.role));
    h += '<main class="main"><div class="me">' + avatarHtml(u.id, u.firstName || u.displayName) + '<div><div class="me-n">' + esc(u.displayName) + '</div><div class="me-s">' +
      (u.role === 'student' ? esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' เลขประจำตัว ' + esc(u.username) : esc(u.department || '') + ' ชื่อผู้ใช้ ' + esc(u.username)) + '</div></div></div>';
    h += '<div class="sec"><h2>บัญชีและการตั้งค่า</h2></div><div class="group">';
    h += '<button class="row" data-act="pw-open"><span class="nf-ic">' + ic('lock', 20) + '</span><span class="row-main"><span class="row-t">เปลี่ยนรหัสผ่าน</span><span class="row-s">แนะนำให้เปลี่ยนทุกภาคเรียน</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    h += '<div class="row"><span class="nf-ic ok">' + ic('chat', 20) + '</span><span class="row-main"><span class="row-t">' + (u.role === 'student' ? 'LINE ผู้ปกครอง' : 'LINE ส่วนตัว') + '</span><span class="row-s">' + (u.lineLinked ? 'รับแจ้งเตือนผ่าน LINE OA โรงเรียน' : 'การเชื่อม LINE จะเปิดใช้ในขั้นถัดไป') + '</span></span>' + (u.lineLinked ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</div>';
    h += '<button class="row" data-act="theme"><span class="nf-ic">' + ic('moon', 20) + '</span><span class="row-main"><span class="row-t">โหมดมืด</span><span class="row-s">ถนอมสายตาตอนกลางคืน</span></span><span class="sw' + (isDark() ? ' on' : '') + '" role="switch" aria-checked="' + isDark() + '"></span></button>';
    h += '<button class="row" data-act="howto"><span class="nf-ic">' + ic('phone', 20) + '</span><span class="row-main"><span class="row-t">เพิ่มไว้ที่หน้าจอโทรศัพท์</span><span class="row-s">เปิดได้เหมือนแอป ไม่ต้องพิมพ์ลิงก์</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    h += '</div><button class="btn btn-bad btn-block" data-act="logout" style="margin-top:20px">' + ic('logout', 20) + 'ออกจากระบบ</button>';
    h += '<p class="foot">' + FOOT + '<br>เวอร์ชัน ' + esc(C.VERSION || '') + (S.lastSync ? ' / ข้อมูลล่าสุด ' + thTime(S.lastSync) + ' น.' : '') + '</p></main>';
    return h;
  }

  function tabsFor(role) {
    if (role === 'student') return [['home', 'หน้าหลัก', 'home'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    if (role === 'teacher') return [['home', 'งานของฉัน', 'home'], ['students', 'นักเรียน', 'users'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    return [['home', 'ภาพรวม', 'chart'], ['students', 'นักเรียน', 'users'], ['approve', 'อนุมัติ', 'seal'], ['report', 'รายงาน', 'printer'], ['me', 'ฉัน', 'user']];
  }
  function navHtml() {
    var un = unread();
    var pend = S.cases.filter(function (c) { return c.status === 'PASSED'; }).length;
    return '<nav class="nav no-print" aria-label="เมนูหลัก"><div class="nav-in">' + tabsFor(S.user.role).map(function (t) {
      var b = t[0] === 'notif' ? un : (t[0] === 'approve' ? pend : 0);
      return '<button data-act="tab" data-v="' + t[0] + '"' + (S.tab === t[0] ? ' aria-current="page"' : '') + '><span class="pill">' + ic(t[2]) + '</span>' + t[1] + (b ? '<span class="badge">' + b + '</span>' : '') + '</button>';
    }).join('') + '</div></nav>';
  }
  function vTab() {
    var role = S.user.role, tabs = tabsFor(role).map(function (t) { return t[0]; });
    if (tabs.indexOf(S.tab) < 0) S.tab = 'home';
    var t = S.tab, h;
    if (t === 'notif') h = vNotif();
    else if (t === 'me') h = vMe();
    else if (role === 'student') h = vStudentHome();
    else if (role === 'teacher') h = t === 'students' ? vTeacherStudents() : vTeacherHome();
    else h = t === 'students' ? vTeacherStudents() : (t === 'approve' ? vApprove() : (t === 'report' ? vReportTab() : vMeasureHome()));
    return h + navHtml();
  }

  function render() {
    var app = $('app');
    if (!S.user) { app.innerHTML = vLogin(); return; }
    if (S.user.mustChangePw) { app.innerHTML = vMustChange(); return; }
    var top = S.stack.length ? S.stack[S.stack.length - 1] : null;
    if (!top) app.innerHTML = vTab();
    else if (top.v === 'case') app.innerHTML = vCase(caseById(top.id));
    else if (top.v === 'student') app.innerHTML = vStudent(top.sid);
    else app.innerHTML = vReport(top.sid);
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
    else if (k === 'done') inner = '<div class="done-ic">' + ic(S.sheet.icon || 'check', 44) + '</div><h3 class="done-t">' + esc(S.sheet.title) + '</h3><p class="done-s">' + esc(S.sheet.sub) + '</p>' + (S.sheet.next ? '<ol class="next">' + S.sheet.next.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol>' : '') +
      '<div class="actbar-in">' + (S.sheet.again ? '<button class="btn btn-ghost" data-act="new-case">บันทึกคนต่อไป</button>' : '') + '<button class="btn btn-primary" data-act="close-sheet">' + esc(S.sheet.btn || 'ตกลง') + '</button></div>';
    el.innerHTML = '<div class="sheet-bg" data-act="close-sheet"><div class="sheet" data-act="noop" role="dialog" aria-modal="true"><div class="grab"></div>' + inner + '</div></div>';
    document.body.style.overflow = 'hidden';
  }

  function subjectsFor(sid) {
    var st = (S.students || []).filter(function (x) { return x.id === sid; })[0];
    var lv = st ? level(st.cls) : 0;
    var list = S.subjects.filter(function (s) { return !lv || !s.level || s.level === lv; });
    return list.length ? list : S.subjects;
  }
  function stuResults(q) {
    if (!S.students) return '<div class="soon" style="padding:18px"><span class="spin"></span><span>กำลังโหลดรายชื่อนักเรียน</span></div>';
    q = (q || '').trim().toLowerCase();
    var adv = S.user.advisorClass;
    var list = S.students.filter(function (s) {
      if (!q) return adv ? s.cls === adv : false;
      return (s.name + ' ' + s.id + ' ' + s.cls).toLowerCase().indexOf(q) >= 0;
    }).slice(0, 8);
    if (!list.length) return '<div class="empty">' + (q ? 'ไม่พบนักเรียน ลองพิมพ์ชื่อจริง เลขประจำตัว หรือห้อง เช่น ม.2/1' : 'พิมพ์ชื่อ เลขประจำตัว หรือห้องเพื่อค้นหา') + '</div>';
    return (!q && adv ? '<div class="row-s" style="padding:8px 14px 0">นักเรียนห้องที่ปรึกษา ' + esc(adv) + '</div>' : '') + list.map(function (s) {
      return '<button class="row" data-act="new-pick-stu" data-v="' + esc(s.id) + '"><span class="row-main"><span class="row-t">' + esc(s.name) + '</span><span class="row-s">' + esc(s.cls) + ' เลขที่ ' + esc(s.no) + ' เลขประจำตัว ' + esc(s.id) + '</span></span>' + ic('plus', 20) + '</button>';
    }).join('');
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
      h += '<input class="inp" id="sq" placeholder="พิมพ์ชื่อ เลขประจำตัว หรือห้อง" autocomplete="off" value="' + esc(s.sq || '') + '"><div id="sres" class="sres">' + stuResults(s.sq) + '</div></div>';
    }
    return h;
  }
  function loadStudents() {
    if (S.students && now() - S.studentsAt < 300000) return;
    API.call('listStudents').then(function (list) {
      S.students = list; S.studentsAt = now();
      if (S.sheet && S.sheet.kind === 'new') renderSheet();
    }).catch(function (e) { toast(e.message || 'โหลดรายชื่อนักเรียนไม่สำเร็จ'); });
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
      saveCache(); render();
    }).catch(function (e) {
      S.syncing = false;
      if (e.error === 'AUTH_EXPIRED' || e.error === 'MUST_CHANGE_PW') return;
      S.loadErr = e.message || 'เชื่อมต่อไม่สำเร็จ';
      render();
    });
  }
  function loadLog(id) {
    API.call('getCase', { id: id }).then(function (d) {
      S.logs[id] = d.log || [];
      if (d.item) upsertCase(d.item);
      saveCache();
      var top = S.stack[S.stack.length - 1];
      if (top && top.v === 'case' && top.id === id) render();
    }).catch(function () { S.logs[id] = []; });
  }
  function mutate(action, payload, btn, busyText, onOk) {
    setBusy(btn, true, busyText);
    return API.call(action, payload).then(function (d) {
      if (d && d.item) { upsertCase(d.item); delete S.logs[d.item.id]; }
      saveCache(); haptic();
      if (onOk) onOk(d);
      render();
      var top = S.stack[S.stack.length - 1];
      if (d && d.item && top && top.v === 'case' && top.id === d.item.id) loadLog(d.item.id);
    }).catch(function (e) {
      setBusy(btn, false);
      toast(e.message || 'ทำรายการไม่สำเร็จ');
    });
  }

  /* ---------- navigation ---------- */
  function push(v) {
    S.stack.push(v);
    try { history.pushState({ d: S.stack.length }, ''); S.hist++; } catch (e) {}
    window.scrollTo(0, 0);
    render();
    if (v.v === 'case' && !S.logs[v.id]) loadLog(v.id);
  }
  function goBack() {
    if (S.hist > 0) { try { history.back(); return; } catch (e) {} }
    S.stack.pop(); window.scrollTo(0, 0); render();
  }
  window.addEventListener('popstate', function () {
    if (S.skipPop) { S.skipPop = false; return; }
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
    S.tab = 'home'; S.loaded = false; S.cases = []; S.notifs = []; S.subjects = []; S.logs = {}; S.students = null;
    loadCache(); render();
    if (!S.user.mustChangePw) refresh(true);
  }
  function doLogin(form) {
    var u = form.elements.u.value.trim(), p = form.elements.p.value, err = $('lgErr'), btn = $('lgBtn');
    err.textContent = '';
    if (!u || !p) { err.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ'; return; }
    setBusy(btn, true, 'กำลังเข้าสู่ระบบ');
    API.call('login', { username: u, password: p }).then(function (d) {
      haptic(); afterLogin(d);
    }).catch(function (e) {
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
    API.call('changePassword', { oldPassword: oldPw, newPassword: n1 }).then(function (d) {
      haptic();
      var forced = S.user.mustChangePw;
      S.user = d.user; API.setSession(null, d.user);
      closeSheet(); render(); toast('เปลี่ยนรหัสผ่านแล้ว');
      if (forced) refresh(true);
    }).catch(function (e) { setBusy(btn, false); errEl.textContent = e.message || 'บันทึกไม่สำเร็จ'; });
  }
  function logout() {
    if (API.getToken()) API.call('logout').catch(function () {});
    API.clear(); clearCache(); resetNav();
    S.user = null; S.cases = []; S.notifs = []; S.subjects = []; S.students = null; S.logs = {}; S.loaded = false; S.tab = 'home';
    closeSheet(); render();
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
    API.call('createCase', payload).then(function (d) {
      upsertCase(d.item); saveCache(); haptic(); render();
      var it = d.item;
      openSheet({
        kind: 'done', icon: it.status === 'REPEAT' ? 'alert' : 'check', again: true, btn: 'เสร็จแล้ว',
        title: 'บันทึกแล้ว', sub: it.studentName + ' ' + it.subjectName + ' (' + it.type + ')',
        next: it.status === 'REPEAT' ? ['ระบบบันทึกเป็น ต้องเรียนซ้ำ', 'แจ้งนักเรียนในแอปแล้ว'] : ['แจ้งนักเรียนในแอปแล้ว', 'นักเรียนกดรับทราบแล้วเริ่มทำตามรายการ', 'ติดตามได้ที่หน้า งานของฉัน']
      });
    }).catch(function (e) { setBusy(btn, false); fail(e.message || 'บันทึกไม่สำเร็จ'); });
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var a = el.getAttribute('data-act'), id = el.getAttribute('data-id'), v = el.getAttribute('data-v');
    var c = id ? caseById(id) : null, s = S.sheet;
    if (a === 'noop') return;
    switch (a) {
      case 'close-sheet': closeSheet(); break;
      case 'tab': S.tab = v; resetNav(); window.scrollTo(0, 0); render(); break;
      case 'back': goBack(); break;
      case 'refresh': refresh(false); break;
      case 'open-case': push({ v: 'case', id: id }); break;
      case 'open-student': push({ v: 'student', sid: v }); break;
      case 'open-report': push({ v: 'report', sid: v }); break;
      case 'goto-filter': S.tab = 'students'; S.filter = v; S.q = ''; window.scrollTo(0, 0); render(); break;
      case 'filter': S.filter = v; render(); break;
      case 'cls': S.cls = v; render(); break;
      case 'print': window.print(); break;
      case 'logout': logout(); break;
      case 'pw-open': openSheet({ kind: 'pw' }); break;
      case 'howto': openSheet({ kind: 'howto' }); break;
      case 'theme':
        var nt = isDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nt);
        try { localStorage.setItem(THEME_KEY, nt); } catch (err) {}
        render();
        break;
      case 'eye':
        var inp = el.parentNode.querySelector('input'), show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        el.innerHTML = ic(show ? 'eyeoff' : 'eye', 20);
        break;

      case 'ack':
        mutate('ackCase', { id: id }, el, 'กำลังบันทึก', function () {
          toast('รับทราบแล้ว ทำตามรายการได้เลย');
          var top = S.stack[S.stack.length - 1];
          if (!top || top.v !== 'case') setTimeout(function () { push({ v: 'case', id: id }); }, 0);
        });
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
      case 'extend': mutate('extendCase', { id: id, days: 7 }, el, 'กำลังเลื่อน', function (d) { toast('เลื่อนกำหนดเป็น ' + thDate(d.item.due)); }); break;
      case 'remind':
        setBusy(el, true, 'กำลังส่ง');
        API.call('remindCase', { id: id }).then(function () {
          haptic(); setBusy(el, false); toast('ส่งแจ้งเตือนถึงนักเรียนแล้ว');
          delete S.logs[id];
          var top = S.stack[S.stack.length - 1];
          if (top && top.v === 'case' && top.id === id) loadLog(id);
        }).catch(function (err) { setBusy(el, false); toast(err.message || 'ส่งไม่สำเร็จ'); });
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
      case 'new-clear-stu': s.sid = null; s.subj = null; renderSheet(); break;
      case 'new-subj': s.subj = v; renderSheet(); break;
      case 'new-type': s.type = v; if (!s.tasksEdited) s.tasks = TASKS[v].join('\n'); renderSheet(); break;
      case 'new-save': saveNewCase(el); break;
    }
  });

  document.addEventListener('input', function (e) {
    var t = e.target;
    if (t.id === 'q') { S.q = t.value; var sl = $('slist'); if (sl) sl.innerHTML = studentListHtml(); return; }
    if (t.id === 'sq' && S.sheet) { S.sheet.sq = t.value; $('sres').innerHTML = stuResults(t.value); return; }
    var k = t.getAttribute('data-k');
    if (k && S.sheet) {
      S.sheet[k] = t.value;
      if (k === 'tasks') S.sheet.tasksEdited = true;
      if (k === 'ms') { var w = $('msw'); if (w) w.innerHTML = msWarn(t.value); }
    }
  });

  document.addEventListener('change', function (e) {
    var t = e.target, nid = t.getAttribute && t.getAttribute('data-note');
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet) closeSheet(); });

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
    applyTheme();
    if (navigator.onLine === false) offlineBar(true);
    if (!API.getToken()) { render(); return; }
    S.user = API.cachedUser();
    if (!S.user) { API.clear(); render(); return; }
    loadCache();
    render();
    refresh(true);
  }
  boot();
})();
