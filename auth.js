/* ═══════════════════════════════════════════════════════
   Dashboard Khối Kho Vận & Logistics — cổng đăng nhập
   ───────────────────────────────────────────────────────
   LƯU Ý QUAN TRỌNG VỀ MỨC BẢO VỆ:
   Đây là CỔNG CHẶN phía trình duyệt, KHÔNG PHẢI KHOÁ THẬT.
   Toàn bộ số liệu nằm ngay trong tệp HTML. Người có link
   vẫn có thể xem mã nguồn trang để đọc số mà không cần
   đăng nhập. Muốn bảo vệ thật thì phải chặn ở phía máy chủ
   (SharePoint, IIS, Nginx...) hoặc mã hoá nội dung trang.
   Mật khẩu ở đây lưu dạng BĂM (SHA-256, 5.000 vòng, có muối)
   nên không đọc ngược ra được, nhưng cổng vẫn vượt qua được.

   ĐỔI MẬT KHẨU: xem hướng dẫn trong tệp DOI-MAT-KHAU.md
   ═══════════════════════════════════════════════════════ */
(function (root) {
  'use strict';

  /* ── Cấu hình ─────────────────────────────────────── */
  var SALT   = 'NTSF-KVL-2026::';
  var ROUNDS = 5000;
  var HASH   = 'af64b8c47783a4b4afd4b6db3922e9144b041d3426dc27fad94410a9715a2b6f';
  var KEY    = 'ntsf_kvl_session';
  var TTL_H  = 8;      // phiên hết hạn sau 8 giờ
  var LOGIN  = 'login.html';

  /* ── SHA-256 thuần JavaScript ─────────────────────────
     Không dùng crypto.subtle vì hàm đó không chạy khi mở
     trang bằng file:// (nháy đúp tệp trên ổ đĩa).        */
  var K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];

  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  function toUtf8(s) {
    var out = '', i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (c < 0x80) out += String.fromCharCode(c);
      else if (c < 0x800) out += String.fromCharCode(0xC0 | (c >> 6), 0x80 | (c & 63));
      else out += String.fromCharCode(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function sha256(msg) {
    var m = toUtf8(msg), bits = m.length * 8, i, j;
    m += '\x80';
    while (m.length % 64 !== 56) m += '\x00';

    var nw = m.length / 4, words = new Array(nw + 2);
    for (i = 0; i < nw; i++) words[i] = 0;
    for (i = 0; i < m.length; i++) words[i >> 2] |= m.charCodeAt(i) << (24 - (i % 4) * 8);
    words[nw]     = Math.floor(bits / 4294967296);
    words[nw + 1] = bits >>> 0;

    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var w = new Array(64), a, b, c, d, e, f, g, h, s0, s1, ch, mj, t1, t2;

    for (j = 0; j < words.length; j += 16) {
      for (i = 0; i < 16; i++) w[i] = words[j + i] | 0;
      for (i = 16; i < 64; i++) {
        s0 = rotr(w[i-15], 7) ^ rotr(w[i-15], 18) ^ (w[i-15] >>> 3);
        s1 = rotr(w[i-2], 17) ^ rotr(w[i-2], 19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
      }
      a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];
      for (i = 0; i < 64; i++) {
        s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        ch = (e & f) ^ (~e & g);
        t1 = (h + s1 + ch + K[i] + w[i]) | 0;
        s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        mj = (a & b) ^ (a & c) ^ (b & c);
        t2 = (s0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0]+a)|0; H[1] = (H[1]+b)|0; H[2] = (H[2]+c)|0; H[3] = (H[3]+d)|0;
      H[4] = (H[4]+e)|0; H[5] = (H[5]+f)|0; H[6] = (H[6]+g)|0; H[7] = (H[7]+h)|0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  function derive(pw) {
    var x = sha256(SALT + pw);
    for (var i = 1; i < ROUNDS; i++) x = sha256(x);
    return x;
  }

  /* ── Lưu phiên ────────────────────────────────────── */
  function store(remember) {
    return remember ? root.localStorage : root.sessionStorage;
  }

  function read() {
    var raw = null;
    try { raw = root.sessionStorage.getItem(KEY) || root.localStorage.getItem(KEY); } catch (e) { return null; }
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
  }

  function valid() {
    var s = read();
    return !!(s && s.v === HASH && s.e > Date.now());
  }

  function grant(remember) {
    var payload = JSON.stringify({ v: HASH, e: Date.now() + TTL_H * 3600 * 1000 });
    try { store(remember).setItem(KEY, payload); } catch (e) { return false; }
    return true;
  }

  function clear() {
    try { root.sessionStorage.removeItem(KEY); root.localStorage.removeItem(KEY); } catch (e) {}
  }

  /* ── API ──────────────────────────────────────────── */
  root.NTSF_AUTH = {
    /* Kiểm tra mật khẩu. Trả về true/false. */
    check: function (pw) { return derive(String(pw || '')) === HASH; },

    /* Ghi nhận phiên đăng nhập. */
    grant: grant,

    /* Còn phiên hợp lệ hay không. */
    valid: valid,

    /* Số giờ còn lại của phiên. */
    ttl: function () {
      var s = read();
      return s && s.e > Date.now() ? (s.e - Date.now()) / 3600000 : 0;
    },

    /* Đặt ở <head> mỗi trang: chưa đăng nhập thì đá về trang đăng nhập. */
    guard: function () {
      if (valid()) return true;
      var here = root.location.pathname.split('/').pop() || 'index.html';
      root.location.replace(LOGIN + '?next=' + encodeURIComponent(here));
      return false;
    },

    /* Thoát và quay về trang đăng nhập. */
    logout: function () {
      clear();
      root.location.replace(LOGIN);
    },

    /* Dùng khi cần tính lại mã băm cho mật khẩu mới. */
    derive: derive
  };
})(window);
