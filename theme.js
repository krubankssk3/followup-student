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
