/* ═══════════════════════════════════════════════════════
   Dashboard Khối Kho Vận & Logistics — thành phần dùng chung
   Sidebar · logo · điều hướng · giao diện sáng-tối
   ═══════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var NAV = [
    { group: 'Điều hành' },
    { id: 'tong-quan',  href: 'index.html',      ico: '◪', label: 'Tổng quan' },
    { id: 'giao-hang',  href: 'giao-hang.html',  ico: '◰', label: 'Giao hàng & Khách hàng' },
    { id: 'ton-kho',    href: 'ton-kho.html',    ico: '▦', label: 'Tồn kho' },
    { id: 'nang-suat',  href: 'nang-suat.html',  ico: '◱', label: 'Năng suất kho' },
    { group: 'Quản trị', dim: true },
    { id: 'du-lieu',    href: 'du-lieu.html',    ico: '◈', label: 'Tình trạng dữ liệu KPI' },
    { id: 'dinh-nghia', href: 'dinh-nghia.html', ico: '◇', label: 'Định nghĩa chỉ số' }
  ];

  var FOOT = [
    'SAP S/4HANA · plant P100 · kho EWM 520',
    '45.861 tác nghiệp · 12.149 dòng lệnh xuất',
    '03/01/2026 → 16/09/2026 · trích 16/09/2026'
  ];

  function buildSidebar() {
    var side = document.getElementById('side');
    if (!side) return;
    var page = document.body.dataset.page || 'tong-quan';

    var html = ''
      + '<div class="side-top">'
      +   '<span class="side-badge"><img id="brandLogo" alt="Nha Trang Seafoods"></span>'
      +   '<div>'
      +     '<div class="side-name">Dashboard Khối<br>Kho Vận &amp; Logistics</div>'
      +     '<div class="side-sub">NTSF · CẦN THƠ</div>'
      +   '</div>'
      + '</div><nav class="nav">';

    NAV.forEach(function (n) {
      if (n.group) {
        html += '<div class="nav-label' + (n.dim ? ' dim' : '') + '">' + n.group + '</div>';
        return;
      }
      var on = n.id === page;
      var dead = n.href === '#';
      html += '<a class="nav-item" href="' + n.href + '"'
            + (on ? ' aria-current="page"' : '')
            + (dead ? ' aria-disabled="true"' : '') + '>'
            + '<span class="nav-ico">' + n.ico + '</span>' + n.label
            + (n.tag ? '<span class="soon">' + n.tag + '</span>' : '')
            + '</a>';
    });

    html += '</nav><div class="side-foot"><h4>Nguồn dữ liệu</h4>'
          + FOOT.map(function (p) { return '<p>' + p + '</p>'; }).join('')
          + '</div>';

    side.innerHTML = html;

    var img = document.getElementById('brandLogo');
    if (img && window.NTSF_LOGO) img.src = window.NTSF_LOGO;
  }

  function wireChrome() {
    var menu = document.getElementById('menuBtn');
    var side = document.getElementById('side');
    if (menu && side) menu.addEventListener('click', function () { side.classList.toggle('open'); });

    var t = document.getElementById('themeBtn');
    if (t) t.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      var next = cur === 'dark' ? 'light'
               : cur === 'light' ? 'dark'
               : (matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark');
      document.documentElement.setAttribute('data-theme', next);
      /* Ghi nhớ để giữ nguyên giao diện khi chuyển sang trang khác.
         auth.js đọc lại giá trị này ngay đầu <head> của mỗi trang. */
      try { localStorage.setItem('ntsf_theme', next); } catch (e) {}
      if (typeof window.drawAll === 'function') window.drawAll();
    });
  }

  /* Nút thoát — đặt cạnh nút "Giám đốc Khối" trên thanh trên cùng.
     Chỉ hiện khi trang có cổng đăng nhập (auth.js đã nạp). */
  function wireLogout() {
    if (!window.NTSF_AUTH) return;
    var bar = document.querySelector('.topbar');
    if (!bar || bar.querySelector('.logout-btn')) return;

    var b = document.createElement('button');
    b.className = 'btn logout-btn';
    b.type = 'button';
    b.title = 'Thoát khỏi dashboard';
    b.textContent = '⇥ Thoát';
    b.addEventListener('click', function () {
      if (confirm('Thoát khỏi dashboard?')) window.NTSF_AUTH.logout();
    });

    var last = bar.querySelector('.btn.primary');
    if (last) bar.insertBefore(b, last); else bar.appendChild(b);
  }

  function start() { buildSidebar(); wireChrome(); wireLogout(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();


/* ═══════════════════════════════════════════════════════
   Bộ lọc phạm vi thời gian — dùng chung cho mọi màn
   Trang gọi NTSF_RANGE.init({ onChange: fn }) rồi vẽ lại
   theo cửa sổ thời gian nhận được.
   ═══════════════════════════════════════════════════════ */
window.NTSF_RANGE = (function () {
  'use strict';

  var BASE = new Date(2026, 0, 1);    // mốc 0 của offset ngày
  var END  = new Date(2026, 8, 16);   // ngày chốt số liệu 16/09/2026
  var THANG = ['01','02','03','04','05','06','07','08','09','10','11','12'];

  function off(d) { return Math.round((d - BASE) / 86400000); }
  function dateOf(o) { var d = new Date(BASE); d.setDate(d.getDate() + o); return d; }
  function dd(d) { return ('0' + d.getDate()).slice(-2); }
  function mm(d) { return ('0' + (d.getMonth() + 1)).slice(-2); }
  function vn(d) { return dd(d) + '/' + mm(d) + '/' + d.getFullYear(); }
  function vnNgan(d) { return dd(d) + '/' + mm(d); }

  var END_OFF = off(END);

  /* Thứ Hai đầu tuần chứa ngày d */
  function thuHai(d) {
    var k = (d.getDay() + 6) % 7;      // 0 = thứ Hai
    var r = new Date(d); r.setDate(d.getDate() - k); r.setHours(0, 0, 0, 0);
    return r;
  }

  var PRESETS = [
    { id: 'w', label: 'Tuần này',  bucket: 'day',   ten: 'tuần hiện tại' },
    { id: 'm', label: 'Tháng này', bucket: 'day',   ten: 'tháng hiện tại' },
    { id: '3', label: '3 tháng',   bucket: 'week',  ten: '3 tháng gần nhất' },
    { id: '6', label: '6 tháng',   bucket: 'month', ten: '6 tháng gần nhất' },
    { id: 'y', label: 'Năm 2026',  bucket: 'month', ten: 'cả năm 2026' }
  ];

  function cuaSo(id) {
    var p = null, i;
    for (i = 0; i < PRESETS.length; i++) if (PRESETS[i].id === id) p = PRESETS[i];
    if (!p) p = PRESETS[PRESETS.length - 1];

    var from;
    if (id === 'w')      from = thuHai(END);
    else if (id === 'm') from = new Date(2026, END.getMonth(), 1);
    else if (id === '3') from = new Date(2026, END.getMonth() - 2, 1);
    else if (id === '6') from = new Date(2026, END.getMonth() - 5, 1);
    else                 from = new Date(BASE);
    if (from < BASE) from = new Date(BASE);

    var fo = off(from);
    return {
      id: p.id, label: p.label, ten: p.ten, bucket: p.bucket,
      from: from, to: END, fromOff: fo, toOff: END_OFF,
      soNgay: END_OFF - fo + 1,
      nhan: vn(from) + ' → ' + vn(END),
      toanKy: p.id === 'y'
    };
  }

  /* Giải nén chuỗi "off,tk,pk,tr,tn,ct,cn,oo,ot;…" thành mảng bản ghi ngày */
  function parse(packed) {
    return packed.split(';').map(function (s) {
      var v = s.split(',');
      return {
        o: +v[0], d: dateOf(+v[0]),
        tk: +v[1], pk: +v[2], tr: +v[3], tn: +v[4],
        ct: +v[5], cn: +v[6], oo: +v[7], ot: +v[8]
      };
    });
  }

  function loc(rows, r) {
    return rows.filter(function (x) { return x.o >= r.fromOff && x.o <= r.toOff; });
  }

  /* Gom nhóm theo ngày / tuần / tháng. Trả về [{nhan, phu, rows}] */
  function gom(rows, r) {
    var out = [], key = {}, i, x, k, lb, sub;
    for (i = 0; i < rows.length; i++) {
      x = rows[i];
      if (r.bucket === 'day') { k = x.o; lb = vnNgan(x.d); sub = ''; }
      else if (r.bucket === 'week') {
        var h = thuHai(x.d); k = 'w' + off(h);
        lb = vnNgan(h); sub = 'tuần';
      } else { k = 'm' + x.d.getMonth(); lb = 'T' + THANG[x.d.getMonth()]; sub = ''; }
      if (!key[k]) { key[k] = { nhan: lb, phu: sub, rows: [] }; out.push(key[k]); }
      key[k].rows.push(x);
    }
    out.forEach(function (b) {
      b.tk = 0; b.pk = 0; b.tr = 0; b.tn = 0; b.ct = 0; b.cn = 0; b.oo = 0; b.ot = 0;
      b.rows.forEach(function (x) {
        b.tk += x.tk; b.pk += x.pk; b.tr += x.tr; b.tn += x.tn;
        b.ct += x.ct; b.cn += x.cn; b.oo += x.oo; b.ot += x.ot;
      });
      b.tn = Math.round(b.tn * 10) / 10;
      b.cn = Math.round(b.cn * 10) / 10;
      b.soNgayCo = b.rows.filter(function (x) { return x.tk > 0; }).length;
    });
    return out;
  }

  /* Số tháng trọn vẹn mà cửa sổ chạm tới — để cắt các mảng theo tháng sẵn có */
  function thangTrongKy(r) {
    var a = r.from.getMonth(), b = r.to.getMonth(), out = [];
    for (var i = a; i <= b; i++) out.push(i);
    return out;
  }

  var current = null, cb = null;

  function render(host, activeId) {
    host.innerHTML = PRESETS.map(function (p) {
      return '<button class="chip" data-r="' + p.id + '"'
           + (p.id === activeId ? ' aria-pressed="true"' : '') + '>' + p.label + '</button>';
    }).join('');
  }

  function init(opt) {
    opt = opt || {};
    var host = document.getElementById(opt.host || 'rangeChips');
    if (!host) return null;
    cb = opt.onChange || null;
    var def = opt.def || 'y';

    render(host, def);
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.chip');
      if (!b) return;
      var kids = host.children, i;
      for (i = 0; i < kids.length; i++) kids[i].setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-pressed', 'true');
      current = cuaSo(b.dataset.r);
      if (cb) cb(current);
    });

    current = cuaSo(def);
    if (cb) cb(current);
    return current;
  }

  return {
    init: init, parse: parse, loc: loc, gom: gom,
    cuaSo: cuaSo, thangTrongKy: thangTrongKy,
    vn: vn, vnNgan: vnNgan, THANG: THANG,
    get hienTai() { return current; },
    DATA_END: END
  };
})();
