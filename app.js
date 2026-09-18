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

  /* ═══════════════════════════════════════════════════════
     GHI CHÚ TẠI CHỖ
     Gắn nút ✎ vào tiêu đề mọi thẻ. Bấm vào thì mở khung nhập,
     ghi chú gắn sẵn tên màn và tên biểu đồ đang xem.
     Lưu ở localStorage, đồng thời gửi về máy chủ cục bộ để ghi
     ra thư mục ghi nhận. Chạy trên GitHub Pages thì không có
     máy chủ, ghi chú vẫn giữ trong máy và tải về được.
     ═══════════════════════════════════════════════════════ */
  var NOTE_KEY = 'ntsf_ghi_chu';
  var LOAI = ['Câu hỏi', 'Sửa số liệu', 'Thêm chỉ số', 'Góp ý giao diện', 'Việc cần làm'];

  function docGhiChu() {
    try { return JSON.parse(localStorage.getItem(NOTE_KEY)) || []; } catch (e) { return []; }
  }
  function luuGhiChu(list) {
    try { localStorage.setItem(NOTE_KEY, JSON.stringify(list)); return true; } catch (e) { return false; }
  }
  function tenMan() {
    var h = document.querySelector('.topbar h1');
    return h ? h.textContent.trim() : (document.body.dataset.page || 'Không rõ');
  }
  function guiVeMayChu(note) {
    /* Chỉ thử khi mở qua máy chủ cục bộ. Thất bại thì im lặng — ghi chú đã nằm trong máy rồi. */
    if (location.protocol !== 'http:') return Promise.resolve(false);
    return fetch('/__ghi-chu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    }).then(function (r) { return r.ok; }).catch(function () { return false; });
  }

  function buildNoteUi() {
    if (document.getElementById('ghiChuPanel')) return;

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<button class="note-fab" id="noteFab" type="button" title="Ghi chú">✎<span class="note-count" id="noteCount"></span></button>'
      + '<div class="note-veil" id="noteVeil"></div>'
      + '<div class="note-panel" id="ghiChuPanel" role="dialog" aria-modal="true" aria-label="Ghi chú">'
      +   '<div class="note-head"><b>Ghi chú khi xem báo cáo</b>'
      +     '<button class="note-x" id="noteClose" type="button" aria-label="Đóng">✕</button></div>'
      +   '<div class="note-form">'
      +     '<label class="note-lb">Vị trí</label>'
      +     '<div class="note-at" id="noteAt">—</div>'
      +     '<label class="note-lb" for="noteLoai">Loại</label>'
      +     '<select id="noteLoai">' + LOAI.map(function (x) { return '<option>' + x + '</option>'; }).join('') + '</select>'
      +     '<label class="note-lb" for="noteText">Nội dung</label>'
      +     '<textarea id="noteText" rows="4" placeholder="Ví dụ: biểu đồ này nên tách riêng nhóm Z401, và cho tôi xem cả số tháng trước."></textarea>'
      +     '<button class="note-save" id="noteSave" type="button">Lưu ghi chú</button>'
      +     '<p class="note-msg" id="noteMsg"></p>'
      +   '</div>'
      +   '<div class="note-list-head"><b>Đã ghi</b>'
      +     '<span><button class="note-mini" id="noteExport" type="button">⤓ Tải về (.md)</button>'
      +     '<button class="note-mini" id="noteClear" type="button">Xoá hết</button></span></div>'
      +   '<div class="note-list" id="noteList"></div>'
      + '</div>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    var panel = document.getElementById('ghiChuPanel');
    var atEl = document.getElementById('noteAt');
    var msg = document.getElementById('noteMsg');
    var viTri = 'Toàn trang';

    var veil = document.getElementById('noteVeil');
    function moPanel(muc) {
      viTri = muc || 'Toàn trang';
      atEl.textContent = tenMan() + ' › ' + viTri;
      panel.classList.add('on'); veil.classList.add('on');
      msg.textContent = '';
      document.getElementById('noteText').focus();
    }
    function dongPanel() { panel.classList.remove('on'); veil.classList.remove('on'); }
    veil.addEventListener('click', dongPanel);

    function veDanhSach() {
      var list = docGhiChu();
      document.getElementById('noteCount').textContent = list.length ? list.length : '';
      document.getElementById('noteList').innerHTML = list.length
        ? list.slice().reverse().map(function (n, i) {
            var idx = list.length - 1 - i;
            return '<div class="note-item"><div class="note-item-top">'
              + '<span class="note-tag">' + n.loai + '</span>'
              + '<span class="note-when">' + n.luc + '</span>'
              + '<button class="note-del" data-i="' + idx + '" type="button" aria-label="Xoá">✕</button></div>'
              + '<div class="note-where">' + n.man + ' › ' + n.muc + '</div>'
              + '<div class="note-body">' + n.noiDung.replace(/[<>&]/g, function (c) {
                  return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }) + '</div></div>';
          }).join('')
        : '<p class="note-empty">Chưa có ghi chú nào. Bấm nút ✎ cạnh tiêu đề bất kỳ biểu đồ nào để ghi.</p>';
    }

    /* Gắn nút ✎ vào tiêu đề các thẻ */
    function ganNut() {
      var tieuDe = document.querySelectorAll('.card > h3, .insight > h4, .banner > h2');
      Array.prototype.forEach.call(tieuDe, function (h) {
        if (h.querySelector('.note-pin')) return;
        var b = document.createElement('button');
        b.className = 'note-pin'; b.type = 'button';
        b.title = 'Ghi chú cho mục này'; b.textContent = '✎';
        b.addEventListener('click', function (e) {
          e.stopPropagation();
          /* Bỏ nhãn tag và chính nút ✎ ra khỏi tên vị trí, nếu không
             chuỗi sẽ dính thêm chữ như "Toàn kỳ" hay "CC-04". */
          var c = h.cloneNode(true);
          Array.prototype.forEach.call(c.querySelectorAll('.tag, .note-pin'), function (x) { x.remove(); });
          moPanel(c.textContent.replace('✎', '').replace(/\s+/g, ' ').trim());
        });
        h.appendChild(b);
      });
    }
    ganNut();
    /* Biểu đồ vẽ lại không đụng tới tiêu đề, nhưng trang có thể dựng thẻ động */
    setTimeout(ganNut, 1200);

    document.getElementById('noteFab').addEventListener('click', function () {
      if (panel.classList.contains('on')) dongPanel(); else moPanel('Toàn trang');
    });
    document.getElementById('noteClose').addEventListener('click', dongPanel);

    document.getElementById('noteSave').addEventListener('click', function () {
      var txt = document.getElementById('noteText').value.trim();
      if (!txt) { msg.textContent = 'Chưa nhập nội dung.'; msg.className = 'note-msg bad'; return; }
      var n = {
        luc: new Date().toLocaleString('vi-VN'),
        man: tenMan(),
        muc: viTri,
        loai: document.getElementById('noteLoai').value,
        noiDung: txt,
        trang: location.pathname.split('/').pop() || 'index.html'
      };
      var list = docGhiChu(); list.push(n);
      if (!luuGhiChu(list)) {
        msg.textContent = 'Trình duyệt chặn bộ nhớ cục bộ nên không lưu được.';
        msg.className = 'note-msg bad'; return;
      }
      document.getElementById('noteText').value = '';
      veDanhSach();
      msg.textContent = 'Đã lưu trong máy.'; msg.className = 'note-msg ok';
      guiVeMayChu(n).then(function (ok) {
        if (ok) { msg.textContent = 'Đã lưu và ghi vào thư mục ghi nhận.'; msg.className = 'note-msg ok'; }
      });
    });

    document.getElementById('noteList').addEventListener('click', function (e) {
      var b = e.target.closest('.note-del'); if (!b) return;
      var list = docGhiChu(); list.splice(+b.dataset.i, 1); luuGhiChu(list); veDanhSach();
    });

    document.getElementById('noteClear').addEventListener('click', function () {
      if (!docGhiChu().length) return;
      if (confirm('Xoá toàn bộ ghi chú đang lưu trong máy?')) { luuGhiChu([]); veDanhSach(); }
    });

    document.getElementById('noteExport').addEventListener('click', function () {
      var list = docGhiChu();
      if (!list.length) { msg.textContent = 'Chưa có ghi chú nào để tải.'; msg.className = 'note-msg bad'; return; }
      var md = '# Ghi nhận từ Dashboard Kho vận & Logistics\n\n'
        + 'Xuất lúc ' + new Date().toLocaleString('vi-VN') + ' · ' + list.length + ' ghi chú\n\n';
      list.forEach(function (n, i) {
        md += '## ' + (i + 1) + '. [' + n.loai + '] ' + n.man + ' › ' + n.muc + '\n\n'
           + '- Thời điểm: ' + n.luc + '\n- Trang: `' + n.trang + '`\n\n' + n.noiDung + '\n\n';
      });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown;charset=utf-8' }));
      a.download = 'ghi-nhan-dashboard-' + new Date().toISOString().slice(0, 10) + '.md';
      a.click(); URL.revokeObjectURL(a.href);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('on')) dongPanel();
    });

    veDanhSach();
  }

  function start() { buildSidebar(); wireChrome(); wireLogout(); buildNoteUi(); }

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
