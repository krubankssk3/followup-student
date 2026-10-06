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
    cap: '<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>'
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
    return '<header class="pub-hero"><div class="pub-top"><button data-act="reload">รีเฟรช</button><a href="./">เข้าสู่ระบบ</a></div>' + logo() +
      '<h1>สถิติการติดตามการแก้ผลการเรียน 0 ร มส</h1><p>' + esc(d ? d.school + ' ' + d.area : (C.SCHOOL || '')) + '</p>' +
      (d ? '<p>ปีการศึกษา ' + esc(d.year) + ' ภาคเรียนปัจจุบัน ' + esc(d.semester) + '</p>' : '') + '</header>';
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
    var brand = '#5B5BD6', violet = '#8A4FBF', ok = css('--ok'), zero = css('--zero'), ror = css('--ror'), ms = css('--ms');
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
      data: { labels: ['กำลังแก้', 'รอตรวจ/อนุมัติ', 'แก้สำเร็จ', 'เรียนซ้ำ'], datasets: [{ data: [st.doing, st.review, st.done, st.repeat], backgroundColor: [ror, brand, ok, zero], borderWidth: 0, hoverOffset: 8 }] },
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
      DATA = d; render(); syncLogo(d.logoVer);
    }).catch(function (e) {
      $('pub').innerHTML = hero(null) + '<div class="pub-empty">' + esc(e.message || 'โหลดข้อมูลไม่สำเร็จ') + '</div>';
    });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-act="reload"]') : null;
    if (el) { DATA = null; render(); load(); }
  });
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  try { var th = localStorage.getItem('followup_theme'); if (th) document.documentElement.setAttribute('data-theme', th); } catch (e) {}
  if (mq && mq.addEventListener) mq.addEventListener('change', function () { if (DATA) render(); });

  render();
  load();
})();
