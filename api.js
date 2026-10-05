/* api.js : ตัวเรียก Google Apps Script Web App
 * ส่งเป็น POST แบบ text/plain เพื่อไม่ให้เกิด CORS preflight ที่ GAS ไม่รองรับ
 */
(function () {
  'use strict';

  var TOKEN_KEY = 'fix0_token';
  var USER_KEY = 'fix0_user';
  var TIMEOUT_MS = 30000;

  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }
  function setSession(token, user) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {}
  }
  function clear() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch (e) {}
  }
  function cachedUser() {
    try { var raw = localStorage.getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }

  function call(action, payload) {
    var cfg = window.APP_CONFIG || {};
    var url = cfg.API_URL || '';
    if (!url || url.indexOf('XXXX') >= 0) {
      return Promise.reject({ error: 'NO_CONFIG', message: 'ยังไม่ได้ใส่ API_URL ในไฟล์ assets/config.js' });
    }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: action, token: getToken(), payload: payload || {} }),
      redirect: 'follow',
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      clearTimeout(timer);
      if (!r.ok) throw { error: 'HTTP_' + r.status, message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ (รหัส ' + r.status + ')' };
      return r.json();
    }).then(function (res) {
      if (!res || !res.ok) {
        var err = res || { error: 'BAD_RESPONSE', message: 'เซิร์ฟเวอร์ตอบกลับผิดรูปแบบ' };
        if (err.error === 'AUTH_EXPIRED') {
          clear();
          if (typeof API.onExpired === 'function') API.onExpired(err);
        }
        if (err.error === 'MUST_CHANGE_PW' && typeof API.onMustChange === 'function') API.onMustChange(err);
        throw err;
      }
      return res.data;
    }, function (err) {
      clearTimeout(timer);
      if (err && err.error) throw err;
      if (err && err.name === 'AbortError') throw { error: 'TIMEOUT', message: 'เซิร์ฟเวอร์ตอบช้าเกินไป ลองใหม่อีกครั้ง' };
      throw {
        error: 'NETWORK',
        message: navigator.onLine === false ? 'ไม่มีอินเทอร์เน็ต ตรวจสอบการเชื่อมต่อแล้วลองใหม่' : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ ลองใหม่อีกครั้ง'
      };
    });
  }

  var API = {
    call: call,
    getToken: getToken,
    setSession: setSession,
    clear: clear,
    cachedUser: cachedUser,
    onExpired: null,
    onMustChange: null
  };
  window.API = API;
})();
