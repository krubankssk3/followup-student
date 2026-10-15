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
