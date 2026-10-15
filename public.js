/* public.js : หน้าสถิติสาธารณะ (ไม่ต้องเข้าสู่ระบบ ไม่มีชื่อนักเรียน)
 * เขียนแบบ ES5
 * พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3
 */
(function () {
  'use strict';
  var C = window.APP_CONFIG || {};
  var FOOT = 'พัฒนาโดย นายชิติพัทธ์ นิลวรรณ ตำแหน่ง ครู โรงเรียนบ้านละลม สพป.ศรีสะเกษ เขต 3';
  var LOGO_KEY = 'followup_logo';
  var charts = [];
  var DATA = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function svg(path) {
    return '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }
  var IC = {
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.3c2.1.7 3.5 2.8 3.5 5.7"/>',
    seal: '<circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>'
  };
  function logo() {
    var src = '';
    try { var lg = JSON.parse(localStorage.getItem(LOGO_KEY) || 'null'); if (lg && lg.data) src = lg.data; } catch (e) {}
    src = src || C.LOGO_URL || '';
    return '<div class="emblem">' + svg(IC.cap) + (src ? '<img src="' + esc(src) + '" alt="" onerror="this.parentNode.removeChild(this)">' : '') + '</div>';
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function pct(a, b) { return b ? Math.round(a * 100 / b) : 0; }

  function syncLogo(ver) {
    var cur = '';
    try { var lg = JSON.parse(localStorage.getItem(LOGO_KEY) || 'null'); cur = lg ? String(lg.ver) : ''; } catch (e) {}
    if (!ver || String(ver) === cur) return;
    API.call('getLogo').then(function (d) {
      try { localStorage.setItem(LOGO_KEY, JSON.stringify({ data: d.data, ver: d.ver })); } catch (e) {}
      render();
    }).catch(function () {});
  }

  function hero(d) {
    var hasLogin = false;
    try { hasLogin = !!localStorage.getItem('followup_token'); } catch (e) {}
    var loginLabel = hasLogin ? 'เข้าระบบของฉัน' : 'เข้าสู่ระบบ';
    return '<header class="pub-hero"><div class="pub-top"><button data-act="reload" aria-label="รีเฟรช">' + svg('<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>') + '</button>' +
      '<button class="pub-dev" data-act="dev">' + svg(IC.user) + '<span>ประวัติผู้พัฒนา</span></button></div>' + logo() +
      '<h1>สถิติการติดตามการแก้ผลการเรียน 0 ร มส</h1><p>' + esc(d ? d.school + ' ' + d.area : (C.SCHOOL || '')) + '</p>' +
      (d ? '<p>ปีการศึกษา ' + esc(d.year) + ' ภาคเรียนปัจจุบัน ' + esc(d.semester) + '</p>' : '') +
      '<div class="pub-cta"><a class="rb-btn" href="app.html"><span class="rb-glow" aria-hidden="true"></span><span class="rb-ring" aria-hidden="true"></span>' +
      '<span class="rb-in">' + svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5M15 12H3"/>') + '<b>' + loginLabel + '</b></span></a>' +
      '<span>นักเรียน ครู และงานวัดผล เข้าใช้งานระบบติดตาม</span></div></header>';
  }

  /* ---------- ประวัติผู้พัฒนา ---------- */
  var DEV_KEY = 'followup_dev';
  var DEV = null;
  (function () { try { DEV = JSON.parse(localStorage.getItem(DEV_KEY) || 'null'); } catch (e) { DEV = null; } })();
  function linkBtn(href, icon, label, cls) {
    return '<a class="dv-link ' + (cls || '') + '" href="' + esc(href) + '" target="_blank" rel="noopener">' + svg(icon) + '<span>' + esc(label) + '</span></a>';
  }
  function devHtml() {
    if (!DEV) return '<div class="dv-load"><span class="dv-spin"></span>กำลังโหลดข้อมูลผู้พัฒนา</div>';
    var p = DEV.profile || {}, ph = DEV.photo;
    var initials = String(p.name || '?').replace(/^(นาย|นางสาว|นาง|ดร\.|Mr\.|Ms\.)\s*/, '').slice(0, 1);
    var h = '<div class="dv-head"><div class="dv-photo">' + (ph ? '<img src="' + esc(ph) + '" alt="">' : '<span>' + esc(initials) + '</span>') + '</div>' +
      '<div class="dv-tag">ผู้พัฒนาระบบ</div><h2>' + esc(p.name) + '</h2>' +
      (p.position ? '<div class="dv-pos">' + esc(p.position) + '</div>' : '') + (p.org ? '<div class="dv-org">' + esc(p.org) + '</div>' : '') + '</div>';
    if (p.bio) h += '<div class="dv-sec"><h3>เกี่ยวกับ</h3><p>' + esc(p.bio).replace(/\n/g, '<br>') + '</p></div>';
    var skills = String(p.skills || '').split(/[,\n]/).map(function (x) { return x.trim(); }).filter(function (x) { return x; });
    if (skills.length) h += '<div class="dv-sec"><h3>ความเชี่ยวชาญ</h3><div class="dv-chips">' + skills.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join('') + '</div></div>';
    var works = String(p.works || '').split('\n').map(function (x) { return x.replace(/^[-•*\d.)\s]+/, '').trim(); }).filter(function (x) { return x; });
    if (works.length) h += '<div class="dv-sec"><h3>ผลงาน</h3><ul class="dv-works">' + works.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div>';
    var links = '';
    if (p.phone) links += '<a class="dv-link" href="tel:' + esc(String(p.phone).replace(/[^\d+]/g, '')) + '">' + svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>') + '<span>' + esc(p.phone) + '</span></a>';
    if (p.email) links += '<a class="dv-link" href="mailto:' + esc(p.email) + '">' + svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>') + '<span>' + esc(p.email) + '</span></a>';
    if (p.line) links += linkBtn('https://line.me/ti/p/~' + encodeURIComponent(String(p.line).replace(/^@/, '')), '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.3 9.6 9.6 0 0 1-3.4-.6L3 21l1.9-4.6A8 8 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z"/>', 'LINE ' + p.line, 'ln');
    if (p.facebook) links += linkBtn(p.facebook, '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>', 'Facebook', 'fb');
    if (p.website) links += linkBtn(p.website, '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>', 'เว็บไซต์');
    if (links) h += '<div class="dv-sec"><h3>ติดต่อ</h3><div class="dv-links">' + links + '</div></div>';
    h += '<p class="dv-foot">ระบบติดตามการแก้ 0 ร มส ' + esc(C.SCHOOL || 'โรงเรียนบ้านละลม') + '</p>';
    return h;
  }
  function openDev() {
    var m = $('devModal');
    if (!m) { m = document.createElement('div'); m.id = 'devModal'; document.body.appendChild(m); }
    m.className = 'dv-bg';
    m.innerHTML = '<div class="dv-card" role="dialog" aria-modal="true" aria-label="ประวัติผู้พัฒนา"><button class="dv-x" data-act="dev-close" aria-label="ปิด">' + svg('<path d="M18 6 6 18M6 6l12 12"/>') + '</button><div id="devBody">' + devHtml() + '</div></div>';
    document.body.style.overflow = 'hidden';
    var want = DATA && DATA.devVer !== undefined ? String(DATA.devVer) : null;
    if (DEV && want !== null && String(DEV.ver) === want) return;
    API.call('getDevProfile').then(function (d) {
      DEV = d;
      try { localStorage.setItem(DEV_KEY, JSON.stringify(d)); } catch (e) {}
      var b = $('devBody'); if (b) b.innerHTML = devHtml();
    }).catch(function (e) { var b = $('devBody'); if (b && !DEV) b.innerHTML = '<div class="dv-load">' + esc(e.message || 'โหลดไม่สำเร็จ') + '</div>'; });
  }
  function closeDev() {
    var m = $('devModal'); if (!m) return;
    m.className = 'dv-bg out'; document.body.style.overflow = '';
    setTimeout(function () { if (m.className.indexOf('out') >= 0) m.innerHTML = ''; m.className = ''; }, 220);
  }

  function render() {
    var root = $('pub');
    charts.forEach(function (c) { try { c.destroy(); } catch (e) {} });
    charts = [];
    if (!DATA) {
      root.innerHTML = hero(null) + '<div class="kpis">' + [1, 2, 3, 4].map(function () {
        return '<div class="kpi"><div class="sk" style="height:38px;width:38px;border-radius:12px"></div><div class="sk sk-l" style="height:26px;width:50%;margin-top:10px"></div><div class="sk sk-l" style="width:70%"></div></div>';
      }).join('') + '</div><div class="charts"><div class="chart-card"><div class="sk" style="height:260px"></div></div><div class="chart-card"><div class="sk" style="height:260px"></div></div></div>';
      return;
    }
    var d = DATA, st = d.status;
    var h = hero(d);
    h += '<section class="kpis">' +
      kpi('c1', IC.users, d.tracked, 'นักเรียนที่อยู่ในการติดตาม', 'จากนักเรียนทั้งหมด ' + d.students + ' คน') +
      kpi('c2', IC.seal, pct(st.done, d.total) + '%', 'แก้ผลการเรียนสำเร็จ', st.done + ' จาก ' + d.total + ' รายการ') +
      kpi('c3', IC.clock, st.doing + st.review, 'กำลังดำเนินการ', 'รอตรวจหรืออนุมัติ ' + st.review + ' รายการ') +
      kpi('c4', IC.alert, d.overdue, 'เลยกำหนด', 'ต้องเรียนซ้ำ ' + st.repeat + ' รายการ') + '</section>';
    if (!d.total) {
      root.innerHTML = h + '<div class="pub-empty">ยังไม่มีข้อมูลในปีการศึกษานี้</div>' + foot(d);
      return;
    }
    h += '<section class="charts">' +
      card('สถานะการแก้ทั้งหมด', 'สัดส่วนรายการทั้งหมด ' + d.total + ' รายการ', 'cStatus') +
      card('แยกตามประเภท', 'จำนวนทั้งหมดและที่แก้สำเร็จ', 'cType') +
      card('แนวโน้มรายเดือน', 'รายการใหม่เทียบกับที่แก้สำเร็จในแต่ละเดือน', 'cMonth', 'wide') +
      card('แยกตามระดับชั้น', 'จำนวนรายการและที่แก้สำเร็จ', 'cLevel') +
      card('รายวิชาที่พบมากที่สุด', 'จำนวนรายการ 0 ร มส ต่อรายวิชา', 'cSubject') +
      card('ความคืบหน้ารายห้อง', 'ร้อยละที่แก้สำเร็จของแต่ละห้อง', 'cClass', 'wide', true) + '</section>';
    root.innerHTML = h + foot(d);
    if (!window.Chart) return;
    drawCharts(d);
  }
  function kpi(cls, icon, n, label, sub) {
    return '<div class="kpi ' + cls + '"><div class="ic">' + svg(icon) + '</div><div class="n">' + esc(n) + '</div><div class="l"><b>' + esc(label) + '</b><br>' + esc(sub) + '</div></div>';
  }
  function card(title, sub, id, cls, tall) {
    return '<div class="chart-card ' + (cls || '') + '"><h3>' + esc(title) + '</h3><div class="sub">' + esc(sub) + '</div><div class="cbox' + (tall ? ' tall' : '') + '"><canvas id="' + id + '"></canvas></div></div>';
  }
  function foot(d) {
    var t = new Date(d.updatedAt);
    return '<p class="pub-note">ข้อมูลภาพรวมไม่ระบุตัวบุคคล ปรับปรุงทุก 5 นาที (ล่าสุด ' + t.getHours() + ':' + ('0' + t.getMinutes()).slice(-2) + ' น.)<br>' + FOOT + '</p>';
  }

  function drawCharts(d) {
    var Chart = window.Chart;
    var ink = css('--ink'), muted = css('--muted'), line = css('--line');
    var brand = css('--brand') || '#5B5BD6', violet = '#8A4FBF', ok = css('--ok'), zero = css('--zero'), ror = css('--ror'), ms = css('--ms');
    Chart.defaults.font.family = '"IBM Plex Sans Thai","Noto Sans Thai",Tahoma,sans-serif';
    Chart.defaults.color = muted;
    Chart.defaults.borderColor = line;
    var legend = { position: 'bottom', labels: { color: ink, usePointStyle: true, padding: 14 } };
    var base = { responsive: true, maintainAspectRatio: false, plugins: { legend: legend } };
    var scales = function (stacked) {
      return { x: { stacked: !!stacked, grid: { display: false } }, y: { stacked: !!stacked, beginAtZero: true, ticks: { precision: 0 } } };
    };
    var st = d.status;

    charts.push(new Chart($('cStatus'), {
      type: 'doughnut',
      data: { labels: ['กำลังแก้', 'รอตรวจ/อนุมัติ', 'แก้สำเร็จ', 'เรียนซ้ำ', 'แขวนการติดตาม'], datasets: [{ data: [st.doing, st.review, st.done, st.repeat, st.hold || 0], backgroundColor: [ror, brand, ok, zero, '#9AA0B8'], borderWidth: 0, hoverOffset: 8 }] },
      options: Object.assign({}, base, { cutout: '62%' })
    }));

    var types = ['0', 'ร', 'มส'];
    charts.push(new Chart($('cType'), {
      type: 'bar',
      data: {
        labels: ['ผลการเรียน 0', 'ร', 'มส'],
        datasets: [
          { label: 'ทั้งหมด', data: types.map(function (k) { return d.byType[k].total; }), backgroundColor: [zero, ror, ms].map(function (c) { return c + '55'; }), borderColor: [zero, ror, ms], borderWidth: 2, borderRadius: 10 },
          { label: 'แก้สำเร็จ', data: types.map(function (k) { return d.byType[k].done; }), backgroundColor: ok, borderRadius: 10 }
        ]
      },
      options: Object.assign({}, base, { scales: scales(false) })
    }));

    var ctx = $('cMonth').getContext('2d');
    var g1 = ctx.createLinearGradient(0, 0, 0, 260); g1.addColorStop(0, 'rgba(91,91,214,.35)'); g1.addColorStop(1, 'rgba(91,91,214,0)');
    var g2 = ctx.createLinearGradient(0, 0, 0, 260); g2.addColorStop(0, 'rgba(31,128,73,.30)'); g2.addColorStop(1, 'rgba(31,128,73,0)');
    charts.push(new Chart(ctx, {
      type: 'line',
      data: {
        labels: d.months.map(function (m) { return m.label; }),
        datasets: [
          { label: 'รายการใหม่', data: d.months.map(function (m) { return m.created; }), borderColor: brand, backgroundColor: g1, fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: brand },
          { label: 'แก้สำเร็จ', data: d.months.map(function (m) { return m.done; }), borderColor: ok, backgroundColor: g2, fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: ok }
        ]
      },
      options: Object.assign({}, base, { scales: scales(false), interaction: { mode: 'index', intersect: false } })
    }));

    charts.push(new Chart($('cLevel'), {
      type: 'bar',
      data: {
        labels: d.byLevel.map(function (x) { return x.label; }),
        datasets: [
          { label: 'แก้สำเร็จ', data: d.byLevel.map(function (x) { return x.done; }), backgroundColor: ok, borderRadius: 8 },
          { label: 'ยังไม่เสร็จ', data: d.byLevel.map(function (x) { return x.total - x.done; }), backgroundColor: violet + '88', borderRadius: 8 }
        ]
      },
      options: Object.assign({}, base, { scales: scales(true) })
    }));

    charts.push(new Chart($('cSubject'), {
      type: 'bar',
      data: { labels: d.subjects.map(function (x) { return x.label; }), datasets: [{ label: 'จำนวนรายการ', data: d.subjects.map(function (x) { return x.total; }), backgroundColor: brand, borderRadius: 8 }] },
      options: Object.assign({}, base, { indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { precision: 0 } }, y: { grid: { display: false } } } })
    }));

    charts.push(new Chart($('cClass'), {
      type: 'bar',
      data: {
        labels: d.byClass.map(function (x) { return x.label; }),
        datasets: [{ label: 'แก้สำเร็จ (%)', data: d.byClass.map(function (x) { return pct(x.done, x.total); }), backgroundColor: d.byClass.map(function (x) { var p = pct(x.done, x.total); return p >= 80 ? ok : (p >= 50 ? ror : zero); }), borderRadius: 8 }]
      },
      options: Object.assign({}, base, {
        plugins: { legend: { display: false }, tooltip: { callbacks: { afterLabel: function (it) { var x = d.byClass[it.dataIndex]; return x.done + ' จาก ' + x.total + ' รายการ'; } } } },
        scales: { x: { grid: { display: false } }, y: { beginAtZero: true, max: 100, ticks: { callback: function (v) { return v + '%'; } } } }
      })
    }));
  }

  function load() {
    API.call('publicStats').then(function (d) {
      if (window.Theme && d.themeColor !== undefined) window.Theme.setSchool(d.themeColor, true);
      DATA = d; render(); syncLogo(d.logoVer);
    }).catch(function (e) {
      $('pub').innerHTML = hero(null) + '<div class="pub-empty">' + esc(e.message || 'โหลดข้อมูลไม่สำเร็จ') + '</div>';
    });
  }

  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    if (e.target.id === 'devModal') { shakeDev(); return; } // ล็อก: ปิดได้ด้วยปุ่ม ✕ เท่านั้น
    var el = e.target.closest('[data-act]');
    if (!el) return;
    var a = el.getAttribute('data-act');
    if (a === 'reload') { DATA = null; render(); load(); }
    else if (a === 'dev') openDev();
    else if (a === 'dev-close') closeDev();
  });
  function shakeDev() {
    var c = document.querySelector('.dv-card'); if (!c) return;
    c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('devModal') && $('devModal').innerHTML) shakeDev(); });
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  try { var th = localStorage.getItem('followup_theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (DATA) render(); });

  render();
  load();
})();
