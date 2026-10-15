/* theme.js : สีธีมและเอฟเฟคแสง (ใช้ร่วมกันทุกหน้า โหลดใน <head> ก่อน app.js)
 * เก็บค่าที่เลือกไว้ในเครื่องผู้ใช้ (localStorage) เขียนแบบ ES5
 */
(function () {
  'use strict';
  var KEY = 'followup_theme_color';          // สีที่ผู้ใช้เลือกเอง (มีผลเหนือกว่า)
  var SCHOOL_KEY = 'followup_school_theme';  // สีประจำโรงเรียนที่ admin ตั้ง
  var PRESETS = [
    { hex: '#6E4BC9', name: 'ม่วงลาเวนเดอร์' },
    { hex: '#3B6FE0', name: 'ฟ้าน้ำทะเล' },
    { hex: '#0E9F8E', name: 'เขียวมรกต' },
    { hex: '#2F9E44', name: 'เขียวใบไม้' },
    { hex: '#E8590C', name: 'ส้มพระอาทิตย์' },
    { hex: '#D6336C', name: 'ชมพูซากุระ' },
    { hex: '#C92A2A', name: 'แดงเลือดหมู' },
    { hex: '#1C3D8C', name: 'น้ำเงินกรมท่า' },
    { hex: '#B7791F', name: 'ทองโบราณ' },
    { hex: '#495057', name: 'เทาเรียบหรู' }
  ];

  function school() {
    try {
      var t = JSON.parse(localStorage.getItem(SCHOOL_KEY) || 'null');
      if (t && /^#[0-9a-f]{6}$/i.test(t.hex)) return { hex: t.hex, fx: t.fx !== false, school: true };
    } catch (e) {}
    return { hex: PRESETS[0].hex, fx: true, school: true };
  }
  function load() {
    try {
      var t = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (t && /^#[0-9a-f]{6}$/i.test(t.hex)) return { hex: t.hex, fx: t.fx !== false, school: false };
    } catch (e) {}
    return school();
  }
  function save(t) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {} }

  function hexToHsl(hex) {
    var r = parseInt(hex.substr(1, 2), 16) / 255, g = parseInt(hex.substr(3, 2), 16) / 255, b = parseInt(hex.substr(5, 2), 16) / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
  function hsl(h, s, l, a) {
    h = ((h % 360) + 360) % 360;
    s = Math.max(0, Math.min(100, s)); l = Math.max(0, Math.min(100, l));
    return a === undefined ? 'hsl(' + h + ',' + s + '%,' + l + '%)' : 'hsla(' + h + ',' + s + '%,' + l + '%,' + a + ')';
  }

  function vars(hex, dark) {
    var c = hexToHsl(hex), h = c.h, s = Math.max(c.s, 12);
    var gs = Math.min(s, 78);
    if (!dark) {
      return {
        '--brand': hsl(h, Math.min(s, 72), Math.min(Math.max(c.l, 38), 50)),
        '--brand-2': hsl(h, Math.min(s, 72), 36),
        '--brand-soft': hsl(h, Math.min(s, 70), 95),
        '--on-brand': '#FFFFFF',
        '--grad': 'linear-gradient(135deg,' + hsl(h - 12, gs, 58) + ' 0%,' + hsl(h, gs, 50) + ' 55%,' + hsl(h + 22, gs - 6, 48) + ' 100%)',
        '--grad-soft': 'linear-gradient(135deg,' + hsl(h - 12, gs, 58, 0.12) + ',' + hsl(h + 22, gs, 50, 0.12) + ')',
        '--glow': hsl(h, gs, 55, 0.35),
        '--glow-2': hsl(h + 40, gs, 60, 0.28),
        '--glow-3': hsl(h - 40, gs, 60, 0.22)
      };
    }
    return {
      '--brand': hsl(h, Math.min(s, 80), 72),
      '--brand-2': hsl(h, Math.min(s, 60), 30),
      '--brand-soft': hsl(h, Math.min(s, 40), 22),
      '--on-brand': '#11132A',
      '--grad': 'linear-gradient(135deg,' + hsl(h - 12, gs - 10, 42) + ' 0%,' + hsl(h, gs - 10, 36) + ' 55%,' + hsl(h + 22, gs - 14, 34) + ' 100%)',
      '--grad-soft': 'linear-gradient(135deg,' + hsl(h - 12, gs, 60, 0.14) + ',' + hsl(h + 22, gs, 55, 0.14) + ')',
      '--glow': hsl(h, gs, 60, 0.30),
      '--glow-2': hsl(h + 40, gs, 60, 0.22),
      '--glow-3': hsl(h - 40, gs, 60, 0.18)
    };
  }
  function block(sel, v) {
    var out = sel + '{';
    for (var k in v) out += k + ':' + v[k] + ';';
    return out + '}';
  }

  function apply(t) {
    t = t || load();
    var css = block(':root', vars(t.hex, false)) +
      '@media (prefers-color-scheme:dark){' + block(':root:not([data-theme="light"])', vars(t.hex, true)) + '}' +
      block(':root[data-theme="dark"]', vars(t.hex, true));
    var el = document.getElementById('themeVars');
    if (!el) { el = document.createElement('style'); el.id = 'themeVars'; }
    el.textContent = css;
    document.head.appendChild(el); // ย้ายไปท้าย head เสมอ ให้ชนะ app.css
    var root = document.documentElement;
    root.className = root.className.replace(/\s*\bfx\b/g, '') + (t.fx ? ' fx' : '');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', vars(t.hex, false)['--brand']);
    return t;
  }

  window.Theme = {
    presets: PRESETS,
    get: load,
    set: function (hex) { var t = load(); t.hex = hex; save(t); return apply(t); },
    setFx: function (on) { var t = load(); t.fx = !!on; save(t); return apply(t); },
    reset: function () { try { localStorage.removeItem(KEY); } catch (e) {} return apply(); },
    school: school,
    /** รับสีประจำโรงเรียนจากเซิร์ฟเวอร์ ถ้าผู้ใช้ยังไม่ได้เลือกสีเองจะเปลี่ยนตามทันที */
    setSchool: function (hex, fx) {
      if (hex && !/^#[0-9a-f]{6}$/i.test(hex)) return;
      var cur = school(), next = { hex: hex || PRESETS[0].hex, fx: fx !== false };
      if (cur.hex.toLowerCase() === next.hex.toLowerCase() && cur.fx === next.fx) return;
      try { localStorage.setItem(SCHOOL_KEY, JSON.stringify(next)); } catch (e) {}
      if (load().school) apply();
    },
    apply: apply
  };

  apply();
  // app.css อาจโหลดเสร็จทีหลัง ย้ายสีธีมไปท้ายสุดอีกครั้ง
  document.addEventListener('DOMContentLoaded', function () { apply(); });
})();

/* counter.js : ตัวเลขวิ่งนับขึ้น (count-up) ทุกจุดที่แสดงตัวเลข
 * - ทำงานอัตโนมัติ: เฝ้าดูหน้าเว็บ เมื่อมีตัวเลขใหม่ในตำแหน่งที่กำหนด จะวิ่งจาก 0 (ครั้งแรก) หรือจากค่าเดิม (เมื่อข้อมูลเปลี่ยน)
 * - ถ้าค่าไม่เปลี่ยน (เช่นโหลดข้อมูลซ้ำ) จะไม่วิ่งใหม่ ไม่รบกวนสายตา
 * - วิ่งเมื่อเลื่อนมาเห็นตัวเลขนั้นจริง และปิดเองถ้าเครื่องตั้ง "ลดการเคลื่อนไหว"
 * - ใส่ class="cnt" ให้ตัวเลขในประโยคเพื่อให้วิ่งได้ด้วย
 */
(function () {
  'use strict';
  var SEL = '.cnt,[data-cnt],.kpi .n,.tally-n,.mg-n,.imp-sum b,.dp-stats b,.ring-t span,.nx-ct span,.sm-k b,.adv-k b,.lvl b,.pop-h .badge,.nav .badge,.su-n,.al-n';
  // ข้อความที่ถือว่าเป็น "ตัวเลข": ตัวเลข / เศษส่วน / ร้อยละ และหน่วยสั้นๆ ต่อท้าย
  var NUMERIC = /^\s*[+-]?\d[\d,]*(\.\d+)?\s*(\/\s*\d[\d,]*\s*)?%?\s*(คน|รายการ|วิชา|ห้อง|ชิ้น|ครั้ง|วัน|รูป)?\s*$/;
  var DUR = 900, MEM = {}, running = [], raf = 0;
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function keyOf(el) {
    var p = [], n = el, i;
    while (n && n !== document.body && p.length < 12) {
      i = 0; var s = n;
      while ((s = s.previousElementSibling)) i++;
      p.push(n.tagName + (n.id ? '#' + n.id + (n.getAttribute('data-view') || '') : '') + ':' + i);
      if (n.id) break;
      n = n.parentElement;
    }
    return p.join('<');
  }
  function textNodes(el) {
    var out = [], w = document.createTreeWalker(el, 4, null, false), t;
    while ((t = w.nextNode())) if (NUMERIC.test(t.nodeValue)) out.push(t);
    return out;
  }
  function parse(s) {
    var parts = s.split(/(\d[\d,]*(?:\.\d+)?)/), nums = [];
    for (var i = 1; i < parts.length; i += 2) {
      var raw = parts[i];
      nums.push({ i: i, v: parseFloat(raw.replace(/,/g, '')), dec: (raw.split('.')[1] || '').length, comma: raw.indexOf(',') >= 0 || parseFloat(raw.replace(/,/g, '')) >= 10000 });
    }
    return { parts: parts, nums: nums };
  }
  function fmt(v, n) {
    var s = v.toFixed(n.dec);
    if (n.comma) { var a = s.split('.'); a[0] = a[0].replace(/\B(?=(\d{3})+(?!\d))/g, ','); s = a.join('.'); }
    return s;
  }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function tick(now) {
    raf = 0;
    for (var k = running.length - 1; k >= 0; k--) {
      var r = running[k];
      if (!r.node.parentNode) { running.splice(k, 1); continue; }
      if (!r.t0) r.t0 = now;
      var t = Math.min(1, (now - r.t0) / r.dur), e = ease(t), parts = r.to.parts.slice();
      for (var j = 0; j < r.to.nums.length; j++) {
        var n = r.to.nums[j], from = r.from[j] || 0;
        parts[n.i] = fmt(t >= 1 ? n.v : from + (n.v - from) * e, n);
      }
      r.node.nodeValue = t >= 1 ? r.final : parts.join('');
      if (t >= 1) { running.splice(k, 1); if (r.el.classList) r.el.classList.remove('cnt-run'); }
    }
    if (running.length) raf = requestAnimationFrame(tick);
  }
  function start(r) {
    for (var k = 0; k < running.length; k++) if (running[k].node === r.node) running.splice(k--, 1);
    running.push(r);
    if (r.el.classList) r.el.classList.add('cnt-run');
    if (!raf) raf = requestAnimationFrame(tick);
  }

  var io = null, waiting = [];
  if (window.IntersectionObserver) {
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var list = en.target.__cntQ || []; en.target.__cntQ = null;
        list.forEach(start);
      });
    }, { threshold: 0.2 });
  }

  function setup(el) {
    if (el.__cntDone) return;
    el.__cntDone = 1;
    var nodes = textNodes(el);
    if (!nodes.length) return;
    var base = keyOf(el);
    nodes.forEach(function (node, idx) {
      var key = base + '#' + idx, txt = node.nodeValue, to = parse(txt);
      if (!to.nums.length) return;
      var prev = MEM[key];
      MEM[key] = to.nums.map(function (n) { return n.v; });
      var from = prev || to.nums.map(function () { return 0; });
      var same = prev && prev.length === to.nums.length && prev.every(function (v, i) { return v === to.nums[i].v; });
      if (reduce || same) return;
      if (to.nums.every(function (n, i) { return n.v === 0 && !from[i]; })) return;
      var big = Math.max.apply(null, to.nums.map(function (n, i) { return Math.abs(n.v - (from[i] || 0)); }));
      var r = { el: el, node: node, from: from, to: to, final: txt, dur: big < 4 ? 450 : (big < 20 ? 700 : DUR) };
      // แสดงค่าเริ่มต้นทันที แล้วค่อยวิ่ง
      var p0 = to.parts.slice();
      to.nums.forEach(function (n, i) { p0[n.i] = fmt(from[i] || 0, n); });
      node.nodeValue = p0.join('');
      if (io && !prev) { (el.__cntQ = el.__cntQ || []).push(r); io.observe(el); }
      else start(r);
    });
  }

  var pend = 0;
  function scan() {
    pend = 0;
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) setup(list[i]);
  }
  function queue() { if (!pend) pend = (window.requestAnimationFrame || setTimeout)(scan); }

  function boot() {
    scan();
    if (window.MutationObserver) new MutationObserver(queue).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

  window.Counter = { scan: scan, reset: function () { MEM = {}; } };
})();
