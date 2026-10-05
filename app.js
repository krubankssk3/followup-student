/* app.js : Step 1 (เข้าสู่ระบบ, ตั้งรหัสผ่านใหม่, โครงหน้าแอปตามบทบาท, หน้าฉัน)
 * เขียนแบบ ES5 ทั้งไฟล์
 * พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3
 */
(function () {
  'use strict';

  var C = window.APP_CONFIG || {};
  var FOOT = 'พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3';
  var THEME_KEY = 'fix0_theme';
  var S = { user: null, settings: null, tab: 'home', sheet: null, server: null, serverErr: null, booting: true };

  var IC = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 15v-4M12 15V7M17 15v-6"/>',
    printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    seal: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    chev: '<path d="m9 18 6-6-6-6"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.3 4.2M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.6 9.6 0 0 1-3.4-.6L3 21l1.9-4.6A8 8 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
  };
  function ic(n, s) {
    s = s || 22;
    return '<svg class="ic" width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + IC[n] + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function $(id) { return document.getElementById(id); }

  /* ---------- small helpers ---------- */
  var toastT = null;
  function toast(msg) {
    var el = $('toast');
    el.textContent = msg;
    el.className = 'toast show';
    clearTimeout(toastT);
    toastT = setTimeout(function () { el.className = 'toast'; }, 3000);
  }
  function haptic() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} }
  function greet() { var h = new Date().getHours(); return h < 12 ? 'สวัสดีตอนเช้า' : (h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'); }
  function roleName(r) { return { student: 'นักเรียน', teacher: 'ครูผู้สอน', measure: 'งานวัดผล', admin: 'ผู้ดูแลระบบ' }[r] || r; }
  function setBusy(btn, busy, text) {
    if (!btn) return;
    if (busy) {
      btn.setAttribute('data-label', btn.innerHTML);
      btn.innerHTML = '<span class="spin" aria-hidden="true"></span>' + esc(text || 'กำลังทำงาน');
      btn.disabled = true;
    } else {
      btn.innerHTML = btn.getAttribute('data-label') || btn.innerHTML;
      btn.disabled = false;
    }
  }
  function emblem() {
    return '<div class="emblem">' + ic('cap', 30) + (C.LOGO_URL ? '<img src="' + esc(C.LOGO_URL) + '" alt="" onerror="this.parentNode.removeChild(this)">' : '') + '</div>';
  }
  function term() {
    var st = S.settings || {};
    return st.academicYear ? 'ปีการศึกษา ' + st.academicYear + ' ภาคเรียนที่ ' + st.semester : '';
  }
  function initials(u) { return String(u.firstName || u.displayName || '?').slice(0, 2); }
  function thTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '-';
    var m = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return d.getDate() + ' ' + m[d.getMonth()] + ' ' + String(d.getFullYear() + 543).slice(2) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ' น.';
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    try { var t = localStorage.getItem(THEME_KEY); if (t) document.documentElement.setAttribute('data-theme', t); } catch (e) {}
  }
  function isDark() {
    var th = document.documentElement.getAttribute('data-theme');
    if (th) return th === 'dark';
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  /* ---------- views ---------- */
  function pwField(name, label, auto, hint) {
    return '<label class="field"><span class="lbl">' + label + '</span><span class="pw-wrap"><input class="inp" type="password" name="' + name + '" autocomplete="' + auto + '" required>' +
      '<button type="button" class="pw-eye" data-act="eye" aria-label="แสดงรหัสผ่าน">' + ic('eye', 20) + '</button></span></label>' + (hint ? '<p class="hint">' + hint + '</p>' : '');
  }

  function vLogin() {
    return '<div class="login"><div class="login-top">' + emblem() +
      '<div class="lg-school">' + esc(C.SCHOOL || 'โรงเรียนบ้านละลม') + '</div><h1 class="lg-h">' + esc(C.APP_NAME || 'ติดตามการแก้ 0 ร มส') + '</h1></div>' +
      '<div class="login-card">' +
      '<div class="lg-stamps" aria-hidden="true"><span class="stamp t0">0</span><span class="stamp tr">ร</span><span class="stamp tm">มส</span></div>' +
      '<form id="loginForm" novalidate>' +
      '<label class="field"><span class="lbl">เลขประจำตัวนักเรียน หรือชื่อผู้ใช้ครู</span><input class="inp" name="u" autocapitalize="off" autocorrect="off" autocomplete="username" required></label>' +
      pwField('p', 'รหัสผ่าน', 'current-password', '') +
      '<div id="lgErr" class="err" role="alert"></div>' +
      '<button class="btn btn-primary btn-block" type="submit" id="lgBtn">เข้าสู่ระบบ</button></form>' +
      '<p class="demo-tag">ลืมรหัสผ่าน นักเรียนติดต่อครูที่ปรึกษา ครูติดต่องานวัดผล</p></div>' +
      '<p class="foot">' + FOOT + '</p></div>';
  }

  function vMustChange() {
    var u = S.user;
    return '<div class="login"><div class="login-top">' + emblem() +
      '<div class="lg-school">' + esc(u.displayName) + '</div><h1 class="lg-h">ตั้งรหัสผ่านใหม่</h1></div>' +
      '<div class="login-card"><p class="sh-s">เพื่อความปลอดภัย ตั้งรหัสผ่านของตัวเองก่อนเริ่มใช้งาน ใช้แค่ครั้งนี้ครั้งเดียว</p>' +
      pwFormHtml('mustForm') + '<button class="btn btn-ghost btn-block" data-act="logout" style="margin-top:10px">ออกจากระบบ</button></div>' +
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

  function ring(done, total) {
    var r = 34, Cc = 2 * Math.PI * r, p = total ? done / total : 1;
    return '<div class="ring" role="img" aria-label="แก้เสร็จ ' + done + ' จาก ' + total + '"><svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="8"/><circle cx="42" cy="42" r="' + r + '" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (Cc * p).toFixed(1) + ' ' + Cc.toFixed(1) + '"/></svg><div class="ring-t"><span>' + done + '/' + total + '<small>แก้เสร็จ</small></span></div></div>';
  }

  function heroHeader(title, sub, extra) {
    return '<header class="top hero"><div class="top-t"><div class="greet">' + greet() + '</div><div class="top-h" style="font-size:22px">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + (extra || '') + '</div></header>';
  }
  function header(title, sub, right) {
    return '<header class="top"><div class="top-t"><div class="top-h">' + title + '</div>' + (sub ? '<div class="top-s">' + sub + '</div>' : '') + '</div>' + (right || '') + '</header>';
  }

  function userSub(u) {
    if (u.role === 'student') return esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' ' + term();
    return esc(u.department || roleName(u.role)) + (u.advisorClass ? ' ที่ปรึกษา ' + esc(u.advisorClass) : '');
  }

  function vHome() {
    var u = S.user;
    var extra = u.role === 'student'
      ? '<div class="hero-row">' + ring(0, 0) + '<div class="hero-msg"><b>เข้าสู่ระบบเรียบร้อย</b><span>รายวิชาที่ต้องแก้จะแสดงที่นี่ในขั้นที่ 2</span></div></div>'
      : '<div class="hero-msg" style="margin-top:12px"><b>เข้าสู่ระบบเรียบร้อย</b><span>' + term() + '</span></div>';
    var h = heroHeader(esc(u.firstName || u.displayName), userSub(u), extra);
    h += '<main class="main">';
    var sv = S.server;
    h += '<div class="sec" style="margin-top:4px"><h2>สถานะการเชื่อมต่อ</h2><button class="link" data-act="ping">ตรวจอีกครั้ง</button></div>';
    h += '<div class="group"><ul class="conn">' +
      '<li><span class="ok">' + ic('check', 20) + '</span><span>เข้าสู่ระบบในฐานะ ' + roleName(u.role) + '</span></li>' +
      (sv ? '<li><span class="ok">' + ic('check', 20) + '</span><span>เซิร์ฟเวอร์ Apps Script <small>เวอร์ชัน ' + esc(sv.version) + '</small></span></li>' +
        '<li><span class="ok">' + ic('clock', 20) + '</span><span>เวลาเซิร์ฟเวอร์ <small>' + thTime(sv.time) + '</small></span></li>' +
        '<li><span class="ok">' + ic('seal', 20) + '</span><span>' + (sv.academicYear ? 'ปีการศึกษา ' + esc(sv.academicYear) + ' ภาคเรียนที่ ' + esc(sv.semester) : 'ยังไม่ได้ตั้งปีการศึกษา') + '</span></li>'
        : (S.serverErr ? '<li><span class="t-bad">' + ic('refresh', 20) + '</span><span>' + esc(S.serverErr) + '</span></li>' : '<li><span class="wait"><span class="spin"></span></span><span>กำลังตรวจสอบเซิร์ฟเวอร์</span></li>')) +
      '</ul></div>';
    h += '<div class="sec"><h2>ขั้นถัดไป</h2></div><div class="group"><div class="soon">' + ic('clock', 32) + '<b>' + nextText(u.role) + '</b><span>ระบบพร้อมเชื่อมต่อแล้ว ส่วนนี้จะเปิดในขั้นที่ 2</span></div></div>';
    return h + '</main>';
  }
  function nextText(role) {
    if (role === 'student') return 'รายวิชาที่ต้องแก้ ส่งหลักฐาน และติดตามสถานะ';
    if (role === 'teacher') return 'บันทึก 0 ร มส ตรวจหลักฐาน และให้ผลการแก้';
    return 'อนุมัติผล ภาพรวมทั้งโรงเรียน และพิมพ์รายงาน';
  }

  function vSoon(title) {
    return header(title, term()) + '<main class="main"><div class="group"><div class="soon">' + ic('clock', 32) + '<b>ส่วนนี้จะเปิดในขั้นถัดไป</b><span>ตอนนี้ใช้หน้าแรกและหน้าฉันได้แล้ว</span></div></div></main>';
  }

  function vMe() {
    var u = S.user;
    var h = header('ฉัน', roleName(u.role));
    h += '<main class="main"><div class="me"><span class="avatar">' + esc(initials(u)) + '</span><div><div class="me-n">' + esc(u.displayName) + '</div><div class="me-s">' +
      (u.role === 'student' ? esc(u.classroom) + ' เลขที่ ' + esc(u.number) + ' เลขประจำตัว ' + esc(u.username) : esc(u.department || '') + ' ชื่อผู้ใช้ ' + esc(u.username)) + '</div></div></div>';
    h += '<div class="sec"><h2>บัญชีและการตั้งค่า</h2></div><div class="group">';
    h += '<button class="row" data-act="pw-open"><span class="nf-ic">' + ic('lock', 20) + '</span><span class="row-main"><span class="row-t">เปลี่ยนรหัสผ่าน</span><span class="row-s">แนะนำให้เปลี่ยนทุกภาคเรียน</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    h += '<div class="row"><span class="nf-ic ok">' + ic('chat', 20) + '</span><span class="row-main"><span class="row-t">' + (u.role === 'student' ? 'LINE ผู้ปกครอง' : 'LINE ส่วนตัว') + '</span><span class="row-s">' + (u.lineLinked ? 'รับแจ้งเตือนผ่าน LINE OA โรงเรียน' : 'เชื่อมได้ในขั้นที่ 5') + '</span></span>' + (u.lineLinked ? '<span class="chip ch-ok">เชื่อมแล้ว</span>' : '<span class="chip">ยังไม่เชื่อม</span>') + '</div>';
    h += '<button class="row" data-act="theme"><span class="nf-ic">' + ic('moon', 20) + '</span><span class="row-main"><span class="row-t">โหมดมืด</span><span class="row-s">ถนอมสายตาตอนกลางคืน</span></span><span class="sw' + (isDark() ? ' on' : '') + '" role="switch" aria-checked="' + isDark() + '"></span></button>';
    h += '<button class="row" data-act="howto"><span class="nf-ic">' + ic('phone', 20) + '</span><span class="row-main"><span class="row-t">เพิ่มไว้ที่หน้าจอโทรศัพท์</span><span class="row-s">เปิดได้เหมือนแอป ไม่ต้องพิมพ์ลิงก์</span></span><span class="chev">' + ic('chev', 20) + '</span></button>';
    h += '</div>';
    h += '<button class="btn btn-bad btn-block" data-act="logout" style="margin-top:20px">' + ic('logout', 20) + 'ออกจากระบบ</button>';
    h += '<p class="foot">' + FOOT + '<br>เวอร์ชัน ' + esc(C.VERSION || '') + (S.server ? ' / เซิร์ฟเวอร์ ' + esc(S.server.version) : '') + '</p></main>';
    return h;
  }

  function tabsFor(role) {
    if (role === 'student') return [['home', 'หน้าหลัก', 'home'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    if (role === 'teacher') return [['home', 'งานของฉัน', 'home'], ['students', 'นักเรียน', 'users'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
    return [['home', 'ภาพรวม', 'chart'], ['approve', 'อนุมัติ', 'seal'], ['report', 'รายงาน', 'printer'], ['notif', 'แจ้งเตือน', 'bell'], ['me', 'ฉัน', 'user']];
  }
  function navHtml() {
    return '<nav class="nav" aria-label="เมนูหลัก"><div class="nav-in">' + tabsFor(S.user.role).map(function (t) {
      return '<button data-act="tab" data-v="' + t[0] + '"' + (S.tab === t[0] ? ' aria-current="page"' : '') + '><span class="pill">' + ic(t[2]) + '</span>' + t[1] + '</button>';
    }).join('') + '</div></nav>';
  }

  function render() {
    var app = $('app');
    if (!S.user) { app.innerHTML = vLogin(); return; }
    if (S.user.mustChangePw) { app.innerHTML = vMustChange(); return; }
    var tabs = tabsFor(S.user.role), cur = null, i;
    for (i = 0; i < tabs.length; i++) { if (tabs[i][0] === S.tab) cur = tabs[i]; }
    if (!cur) { S.tab = 'home'; cur = tabs[0]; }
    var body = S.tab === 'home' ? vHome() : (S.tab === 'me' ? vMe() : vSoon(cur[1]));
    app.innerHTML = body + navHtml();
  }

  /* ---------- sheet ---------- */
  function openSheet(kind) { S.sheet = kind; renderSheet(); }
  function closeSheet() { S.sheet = null; renderSheet(); }
  function renderSheet() {
    var el = $('sheet');
    if (!S.sheet) { el.innerHTML = ''; document.body.style.overflow = ''; return; }
    var inner = '';
    if (S.sheet === 'pw') inner = '<h3 class="sh-t">เปลี่ยนรหัสผ่าน</h3><p class="sh-s">หลังเปลี่ยนแล้วใช้รหัสใหม่ได้ทันที</p>' + pwFormHtml('pwForm');
    if (S.sheet === 'howto') inner = '<h3 class="sh-t">เพิ่มไว้ที่หน้าจอโทรศัพท์</h3><p class="sh-s">ทำครั้งเดียว ต่อไปแตะไอคอนเปิดได้เลย</p><b>Android (Chrome)</b><ol class="howto"><li>แตะเมนู ⋮ มุมขวาบน</li><li>เลือก เพิ่มลงในหน้าจอหลัก</li></ol><b>iPhone (Safari)</b><ol class="howto"><li>แตะปุ่มแชร์ด้านล่าง</li><li>เลือก เพิ่มไปยังหน้าจอโฮม</li></ol><button class="btn btn-primary btn-block" data-act="close-sheet" style="margin-top:10px">เข้าใจแล้ว</button>';
    el.innerHTML = '<div class="sheet-bg" data-act="close-sheet"><div class="sheet" data-act="noop" role="dialog" aria-modal="true"><div class="grab"></div>' + inner + '</div></div>';
    document.body.style.overflow = 'hidden';
  }

  /* ---------- server calls ---------- */
  function ping() {
    S.server = null; S.serverErr = null;
    if (S.tab === 'home') render();
    API.call('ping').then(function (d) {
      S.server = d; render();
    }).catch(function (err) {
      S.serverErr = err.message || 'ตรวจสอบเซิร์ฟเวอร์ไม่ได้'; render();
    });
  }

  function afterAuth(data) {
    S.user = data.user;
    S.settings = data.settings || S.settings;
    API.setSession(data.token || null, data.user);
    S.tab = 'home';
    render();
    if (!S.user.mustChangePw) ping();
  }

  function doLogin(form) {
    var u = form.elements.u.value.trim(), p = form.elements.p.value, err = $('lgErr'), btn = $('lgBtn');
    err.textContent = '';
    if (!u || !p) { err.textContent = 'กรอกชื่อผู้ใช้และรหัสผ่านให้ครบ'; return; }
    setBusy(btn, true, 'กำลังเข้าสู่ระบบ');
    API.call('login', { username: u, password: p }).then(function (d) {
      haptic();
      afterAuth(d);
      if (!d.user.mustChangePw) toast(greet() + ' ' + (d.user.firstName || ''));
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
      S.user = d.user;
      API.setSession(null, d.user);
      closeSheet();
      render();
      toast('เปลี่ยนรหัสผ่านแล้ว');
      if (forced) ping();
    }).catch(function (e) {
      setBusy(btn, false);
      errEl.textContent = e.message || 'บันทึกไม่สำเร็จ';
    });
  }

  function logout() {
    var hasToken = !!API.getToken();
    if (hasToken) API.call('logout').catch(function () {});
    API.clear();
    S.user = null; S.server = null; S.tab = 'home';
    closeSheet();
    render();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!el) return;
    var a = el.getAttribute('data-act');
    if (a === 'noop') return;
    switch (a) {
      case 'close-sheet': closeSheet(); break;
      case 'tab': S.tab = el.getAttribute('data-v'); window.scrollTo(0, 0); render(); break;
      case 'ping': ping(); break;
      case 'logout': logout(); break;
      case 'pw-open': openSheet('pw'); break;
      case 'howto': openSheet('howto'); break;
      case 'theme':
        var nt = isDark() ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nt);
        try { localStorage.setItem(THEME_KEY, nt); } catch (err) {}
        render();
        break;
      case 'eye':
        var inp = el.parentNode.querySelector('input');
        var show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        el.innerHTML = ic(show ? 'eyeoff' : 'eye', 20);
        el.setAttribute('aria-label', show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน');
        break;
    }
  });

  document.addEventListener('submit', function (e) {
    var id = e.target.id;
    if (id === 'loginForm') { e.preventDefault(); doLogin(e.target); }
    else if (id === 'mustForm' || id === 'pwForm') { e.preventDefault(); doChangePw(e.target); }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && S.sheet) closeSheet(); });

  function offlineBar(on) {
    var bar = $('offlineBar');
    if (on && !bar) {
      bar = document.createElement('div');
      bar.id = 'offlineBar'; bar.className = 'offline';
      bar.textContent = 'ไม่มีอินเทอร์เน็ต ข้อมูลที่แสดงอาจไม่เป็นปัจจุบัน';
      document.body.appendChild(bar);
    } else if (!on && bar) {
      bar.parentNode.removeChild(bar);
    }
  }
  window.addEventListener('offline', function () { offlineBar(true); });
  window.addEventListener('online', function () { offlineBar(false); toast('กลับมาออนไลน์แล้ว'); });

  API.onExpired = function () {
    if (!S.user) return;
    S.user = null; S.sheet = null;
    renderSheet(); render();
    toast('หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบใหม่');
  };
  API.onMustChange = function () {
    if (S.user) { S.user.mustChangePw = true; render(); }
  };

  /* ---------- boot ---------- */
  function boot() {
    applyTheme();
    if (navigator.onLine === false) offlineBar(true);
    if (!API.getToken()) { render(); return; }
    S.user = API.cachedUser();
    render();
    API.call('me').then(function (d) {
      afterAuth(d);
    }).catch(function (e) {
      if (e.error !== 'AUTH_EXPIRED') {
        if (!S.user) { API.clear(); render(); }
        toast(e.message || 'ตรวจสอบบัญชีไม่สำเร็จ');
      }
    });
  }
  boot();
})();
