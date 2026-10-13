/* ═══════════════════════════════════════════════════════
   Dashboard Khối Kho Vận & Logistics — thành phần dùng chung
   Sidebar · logo · điều hướng · giao diện sáng-tối
   ═══════════════════════════════════════════════════════ */
/* ═══ KHUNG BIỂU ĐỒ DÙNG CHUNG ═══
   Mọi SVG phải vẽ theo ĐÚNG bề rộng pixel của thẻ chứa nó, tức viewBox = pixel,
   để tỷ lệ luôn là 1:1.

   Trước đây mỗi hàm vẽ tự đặt viewBox cố định — 470, 640 hoặc 900 — rồi để SVG
   kéo giãn theo bề rộng thẻ. Hậu quả: cùng một cỡ chữ 11,5 đơn vị lại hiện ra
   ~11px trong thẻ nửa màn (viewBox 640 → 612px) nhưng ~16px trong thẻ toàn màn
   (viewBox 900 → 1.271px). Nhìn vào thấy biểu đồ chỗ to chỗ nhỏ, chữ chỗ đậm
   chỗ mảnh, dù cùng một bộ mã vẽ.

   CAO  = chiều cao chuẩn của biểu đồ theo thời gian (cột, đường) — mọi màn dùng chung.
   DONG = chiều cao một dòng của biểu đồ thanh ngang.
   Vì vẽ 1:1 nên hai hằng số này là PIXEL THẬT, không còn là đơn vị co giãn. */
window.NTSF_CH = {
  CAO: 250,
  DONG: 34,
  /* Bề rộng vẽ = bề rộng trong lòng thẻ. Chặn dưới 320 để không vỡ trên điện thoại. */
  rong: function (hop) {
    var box = (typeof hop === 'string') ? document.getElementById(hop) : hop;
    if (!box) return 640;
    var w = box.clientWidth || box.getBoundingClientRect().width;
    return Math.max(320, Math.round(w));
  },
  /* Lề trái/phải của biểu đồ thanh ngang không được nuốt hết chỗ vẽ thanh:
     giữ tối thiểu 26% bề rộng cho phần thanh. */
  le: function (W, trai, phai) {
    var l = Math.min(trai, Math.round(W * 0.40));
    var r = Math.min(phai, Math.round(W * 0.34));
    if (W - l - r < W * 0.26) { var du = (W * 0.26) - (W - l - r); l -= du * 0.6; r -= du * 0.4; }
    return { l: Math.max(48, Math.round(l)), r: Math.max(40, Math.round(r)) };
  },
  /* Cắt bớt nhãn theo bề rộng lề thật, thay vì cắt cứng ở 28 ký tự */
  catNhan: function (chu, rongLe, cx) {
    var n = Math.max(8, Math.floor((rongLe - 14) / (cx || 6.1)));
    return chu.length > n ? chu.slice(0, n - 1) + '…' : chu;
  },

  /* Cho bấm vào cả khung biểu đồ để mở bảng phân tích sâu.
     Dùng cho biểu đồ chưa có chỗ bấm riêng trên từng cột hay từng thanh.
     Chỉ gắn thuộc tính data-drill — bộ xử lý click sẵn có của trang sẽ mở đúng bảng,
     nên hành vi giống hệt khi bấm vào thẻ KPI, không phát sinh đường đi thứ hai.
     ⚠️ Đừng gắn cho biểu đồ đã có click trên từng phần tử: sự kiện nổi bọt lên
     khung sẽ mở thêm một bảng nữa. */
  bamThe: function (id, khoa) {
    var box = document.getElementById(id);
    if (!box) return;
    box.setAttribute('data-drill', khoa);
    box.style.cursor = 'pointer';
    var card = box.closest('.card');
    var how = card ? card.querySelector('.how') : null;
    if (how && how.dataset.goiY !== '1') {
      how.dataset.goiY = '1';
      how.insertAdjacentHTML('beforeend', ' · <b>▸ bấm để xem phân tích sâu</b>');
    }
  },

  /* ── VÀNH KHUYÊN — CƠ CẤU 100% ──
     Quy tắc 3 của bảng Quy tắc biểu đồ: cơ cấu của MỘT tổng, từ 2 đến 5 phần, các
     phần chênh nhau đủ rõ thì vẽ vành khuyên. Quá 5 phần hoặc các phần xấp xỉ nhau
     thì quay về thanh ngang — mắt người so ĐỘ DÀI chính xác hơn so GÓC nhiều.

     Lỗ giữa luôn ghi tổng, nên người đọc không bao giờ mất mẫu số — đây chính là
     lỗi thường gặp nhất của biểu đồ tròn: thấy "75%" mà không biết 75% của bao nhiêu.

     ⚠️ KHÔNG CÓ KHỐI CHÚ GIẢI RIÊNG. Nhãn gắn thẳng quanh vành, mỗi nhãn nối về
     đúng lát của nó bằng một đường dẫn mang màu lát đó. Hai bản trước đều đặt chú
     giải thành một khối bên cạnh và đều bị trả lại (11 và 12/10/2026):
       "quá xấu, đọc vào không hiểu gì" → "làm lại các nhãn thể hiện trên biểu đồ
        luôn, không cần các thẻ ghi chú ở ngoài, và các con số phải to rõ".
     Lý do kỹ thuật đằng sau yêu cầu đó: khối chú giải tách rời bắt mắt đi hai
     chặng — nhìn ô màu, tìm lát cùng màu, rồi mới đọc số. Nhãn gắn tại chỗ bỏ hẳn
     chặng giữa. Đừng dựng lại khối chú giải.

     Nhãn tự dãn ra khi chồng nhau (`DAY_NHAN`), và bán kính vành tự co theo bề
     rộng thẻ để hai cột chữ hai bên luôn còn chỗ — thẻ nửa màn chỉ rộng ~354px.

     parts: [{ k:'tên', v:số, c:'--biến-màu', lbl:'giá trị tuyệt đối' }]
     opt:   { tong:'chuỗi giữa vòng', donVi:'nhãn nhỏ dưới tổng',
              ghiChu:'một dòng kết luận ở đáy' } */
  donut: function (id, parts, opt) {
    var box = (typeof id === 'string') ? document.getElementById(id) : id;
    if (!box) return;
    opt = opt || {};
    box.innerHTML = '';
    var tu = this;
    var NS = 'http://www.w3.org/2000/svg';
    function e(t, a) {
      var n = document.createElementNS(NS, t);
      for (var k in a) n.setAttribute(k, a[k]);
      return n;
    }
    function mau(v) { return getComputedStyle(document.documentElement).getPropertyValue(v || '--c1').trim(); }

    /* Vành phải chừa chỗ cho hai cột chữ hai bên. Bán kính tính NGƯỢC từ bề rộng
       thẻ chứ không đặt cứng, nếu không thẻ nửa màn sẽ đẩy chữ tràn ra ngoài. */
    var W = this.rong(box);
    var hep = W < 470;
    var khe = hep ? 13 : 26;                      /* vành → chữ */
    var leMin = hep ? 100 : 112;                  /* bề rộng tối thiểu cột chữ */
    var ngoaiMax = (W - 2 * khe - 2 * leMin) / 2;
    var Rng = Math.min(hep ? 76 : 134, Math.max(44, ngoaiMax));
    var R = Rng / 1.19, day = Math.max(13, R * 0.38);
    var leW = (W - 2 * Rng - 2 * khe) / 2;

    var cp = hep ? 9 : 10;                        /* cỡ chữ phụ */
    var cs = hep ? 15 : 18;                       /* cỡ chữ phần trăm */
    var DAY_NHAN = hep ? 40 : 46;                 /* chiều cao tối thiểu một nhãn */
    var chuH = opt.ghiChu ? 26 : 8;

    var tong = parts.reduce(function (s, p) { return s + (p.v || 0); }, 0) || 1;

    /* Góc bắt đầu KHÔNG phải 12 giờ. Khi một lát chiếm ba phần tư vòng — đúng
       trường hợp phân loại giá trị tồn kho — thì bắt đầu ở 12 giờ sẽ dồn hết nhãn
       nhỏ lên một góc và để trống hẳn nửa kia. Nên xoay sao cho GIỮA lát lớn nhất
       nằm ngang bên phải: nhãn lớn ra giữa phải, các nhãn nhỏ trải đều bên trái. */
    var iMax = 0;
    parts.forEach(function (p, i) { if ((p.v || 0) > (parts[iMax].v || 0)) iMax = i; });
    var tongTruoc = 0;
    for (var j = 0; j < iMax; j++) tongTruoc += parts[j].v || 0;
    var batDau = -((tongTruoc + (parts[iMax].v || 0) / 2) / (parts.reduce(function (s, p) { return s + (p.v || 0); }, 0) || 1)) * Math.PI * 2;

    /* Dựng trước danh sách nhãn để biết mỗi bên có mấy cái — chiều cao khung phải
       đủ cho bên đông nhãn nhất, nếu không nhãn bị đẩy ra ngoài khung. */
    var ds = [], a = batDau;
    parts.forEach(function (p) {
      var goc = (p.v || 0) / tong * Math.PI * 2;
      if (goc > 0) ds.push({ p: p, d0: a, goc: goc, giua: a + goc / 2 });
      a += goc;
    });
    var nP = 0, nT = 0;
    ds.forEach(function (n) {
      n.ben = Math.cos(n.giua) >= 0 ? 1 : -1;
      if (n.ben > 0) nP++; else nT++;
    });
    var H = Math.max(2 * Rng + 46, Math.max(nP, nT) * DAY_NHAN + 20) + chuH;
    var cx = W / 2, cy = (H - chuH) / 2;

    var svg = e('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img' });

    ds.forEach(function (n) {
      /* cung gần trọn vòng vẽ hụt một chút, vì cung 360° có điểm đầu trùng điểm
         cuối nên trình duyệt vẽ ra đường rỗng */
      var buoc = Math.min(n.goc, Math.PI * 1.999);
      var x0 = cx + R * Math.cos(n.d0), y0 = cy + R * Math.sin(n.d0);
      var x1 = cx + R * Math.cos(n.d0 + buoc), y1 = cy + R * Math.sin(n.d0 + buoc);
      svg.appendChild(e('path', {
        d: 'M ' + x0 + ' ' + y0 + ' A ' + R + ' ' + R + ' 0 ' + (buoc > Math.PI ? 1 : 0) + ' 1 ' + x1 + ' ' + y1,
        fill: 'none', stroke: mau(n.p.c), 'stroke-width': day
      }));
    });

    if (opt.tong) {
      /* Chữ trong lỗ vành bị giới hạn bởi ĐƯỜNG KÍNH TRONG, không phải bề rộng thẻ.
         Nhãn đơn vị dài hơn chỗ đó thì ngắt làm hai dòng ở dấu · — cắt cụt thành
         "tỷ đồng · tổn…" là mất luôn ý nghĩa của con số ở giữa. */
      var trongD = 2 * (R - day / 2) - 8;
      var cs2 = hep ? 8.5 : 9.5;
      var dong = [];
      if (opt.donVi) {
        if (String(opt.donVi).length * cs2 * 0.49 > trongD && opt.donVi.indexOf('·') > 0) {
          dong = opt.donVi.split('·').map(function (s) { return s.trim(); });
        } else { dong = [opt.donVi]; }
      }
      var day1 = dong.length > 1 ? -4 : (dong.length ? 2 : 8);
      var t1 = e('text', { x: cx, y: cy + day1, 'text-anchor': 'middle',
        'font-size': hep ? 20 : 26, 'font-weight': 800, fill: mau('--ink'), 'font-family': 'Roboto,sans-serif' });
      t1.textContent = opt.tong; svg.appendChild(t1);
      dong.forEach(function (s, i) {
        var t2 = e('text', { x: cx, y: cy + day1 + (hep ? 13 : 16) + i * (cs2 + 2), 'text-anchor': 'middle',
          'font-size': cs2, fill: mau('--ink-3'), 'font-family': 'Roboto,sans-serif' });
        t2.textContent = tu.catNhan(s, trongD, cs2 * 0.49); svg.appendChild(t2);
      });
    }

    /* Vị trí mong muốn của mỗi nhãn là ngang với giữa lát của nó. Lát nhỏ nằm sát
       nhau thì hai nhãn chồng lên nhau, nên sau khi xếp phải dãn chúng ra theo
       DAY_NHAN rồi kéo cả cụm về trong khung. */
    [1, -1].forEach(function (ben) {
      var g = ds.filter(function (n) { return n.ben === ben; });
      g.forEach(function (n) { n.y = cy + (Rng + 8) * Math.sin(n.giua); });
      g.sort(function (x, y) { return x.y - y.y; });
      for (var i = 1; i < g.length; i++) {
        if (g[i].y - g[i - 1].y < DAY_NHAN) g[i].y = g[i - 1].y + DAY_NHAN;
      }
      if (g.length) {
        var tran = (H - chuH) - 14, duoi = g[g.length - 1].y - tran;
        if (duoi > 0) g.forEach(function (n) { n.y -= duoi; });
        var tren = 16 - g[0].y;
        if (tren > 0) g.forEach(function (n) { n.y += tren; });
      }
    });

    ds.forEach(function (n) {
      var ben = n.ben, c = mau(n.p.c);
      var xA = cx + (Rng + 2) * Math.cos(n.giua), yA = cy + (Rng + 2) * Math.sin(n.giua);
      var xB = cx + ben * (Rng + khe * 0.42);
      var xRay = cx + ben * (Rng + khe);
      svg.appendChild(e('polyline', {
        points: xA + ',' + yA + ' ' + xB + ',' + n.y + ' ' + xRay + ',' + n.y,
        fill: 'none', stroke: c, 'stroke-width': 1.6, 'stroke-linejoin': 'round'
      }));
      svg.appendChild(e('circle', { cx: xA, cy: yA, r: 2.6, fill: c }));

      var xT = xRay + ben * 6, neo = ben > 0 ? 'start' : 'end';
      var pct = (n.p.v || 0) / tong * 100;

      var l1 = e('text', { x: xT, y: n.y - 4, 'text-anchor': neo, 'font-size': cs,
        'font-weight': 800, fill: mau('--ink'), 'font-family': 'Roboto,sans-serif' });
      l1.textContent = pct.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
      svg.appendChild(l1);

      var l2 = e('text', { x: xT, y: n.y + (hep ? 9 : 10), 'text-anchor': neo, 'font-size': cp,
        'font-weight': 700, fill: mau('--ink-2'), 'font-family': 'Roboto,sans-serif' });
      l2.textContent = tu.catNhan(n.p.k, leW - 8, cp * 0.55); svg.appendChild(l2);

      if (n.p.lbl) {
        var l3 = e('text', { x: xT, y: n.y + (hep ? 20 : 22), 'text-anchor': neo, 'font-size': cp - 0.5,
          'font-weight': 600, fill: mau('--ink-3'), 'font-family': 'Roboto,sans-serif' });
        l3.textContent = tu.catNhan(n.p.lbl, leW - 8, cp * 0.55); svg.appendChild(l3);
      }
    });

    if (opt.ghiChu) {
      var gc = e('text', { x: W / 2, y: H - 7, 'text-anchor': 'middle', 'font-size': 10.5,
        'font-weight': 700, fill: mau('--c2'), 'font-family': 'Roboto,sans-serif' });
      gc.textContent = opt.ghiChu; svg.appendChild(gc);
    }

    box.appendChild(svg);
  },

  /* Chạy SAU khi vẽ xong: kéo mọi nhãn bị tràn khỏi khung về lại bên trong.
     Chỉ xảy ra ở màn hẹp, khi nhãn giá trị dài hơn phần lề chừa sẵn. Đo bằng
     getBBox nên phải gọi lúc SVG đã nằm trong DOM, không gọi lúc đang dựng. */
  gonNhan: function () {
    document.querySelectorAll('.chart svg').forEach(function (s) {
      var vb = s.viewBox.baseVal;
      if (!vb || !vb.width) return;
      s.querySelectorAll('text').forEach(function (tx) {
        var b;
        try { b = tx.getBBox(); } catch (e) { return; }
        if (!b.width) return;
        /* nhãn dài hơn cả khung thì thu nhỏ cỡ chữ trước, rồi mới ép về mép */
        if (b.width > vb.width - 8) {
          var cu = parseFloat(tx.getAttribute('font-size')) || 11;
          tx.setAttribute('font-size', Math.max(7.5, cu * (vb.width - 8) / b.width).toFixed(1));
          try { b = tx.getBBox(); } catch (e) { return; }
        }
        if (b.x + b.width > vb.width - 2) {
          tx.setAttribute('text-anchor', 'end');
          tx.setAttribute('x', vb.width - 4);
        } else if (b.x < 0) {
          tx.setAttribute('text-anchor', 'start');
          tx.setAttribute('x', 2);
        }
      });
    });
  }
};

/* ═══ NHÃN CHỈ TIÊU TRÊN TIÊU ĐỀ ═══
   Trước ngày 11/10/2026 mỗi phần tử trên màn mang một mã riêng của dashboard —
   QL2-B07, CL1-K01, VH3-P03. ĐÃ BỎ HẲN. Lý do người dùng nêu: mã màn bắt người đọc
   nhớ hai hệ mã cho cùng một con số, mà nó không trả lời được câu hỏi duy nhất đáng
   hỏi khi nhìn một biểu đồ — "cái này là chỉ tiêu nào trong bộ KPI của công ty".

   Nay mỗi tiêu đề chỉ còn ĐÚNG MỘT nhãn, là mã trong thư viện KPI IGROUP v1.1:
     KPI-150            đo đủ theo công thức chính thức
     KPI-154 · phần     đo được một phần — phần thiếu ghi ở màn Định nghĩa chỉ số
     Hỗ trợ phân tích   biểu đồ dựng để tìm nguyên nhân, không thuộc bộ KPI

   Bảng tra là biến KPI_MAP của từng trang, khoá là id biểu đồ hoặc id bảng. Tiêu đề
   nào đã ghi sẵn nhãn trong HTML thì giữ nguyên, không chồng thêm nhãn thứ hai. */
window.NTSF_MA = {
  MAN: {
    'chien-luoc':  { ma: 'CL1', ten: 'Chiến lược',             tang: 1, href: 'chien-luoc.html' },
    'quan-ly':     { ma: 'QL2', ten: 'Quản lý',                tang: 2, href: 'index.html' },
    'van-hanh':    { ma: 'VH3', ten: 'Vận hành',               tang: 3, href: 'van-hanh.html' },
    /* Ba màn chuyên đề TQ1 · GH2 · TK2 · NS2 đã gộp vào ba màn cấp trên ngày 30/09/2026.
       Mã cũ không dùng lại cho màn khác, để tra cứu tài liệu cũ không bị nhầm. */
    'du-lieu':     { ma: 'DL0', ten: 'Tình trạng dữ liệu KPI', tang: 0, href: 'du-lieu.html' },
    'mo-hinh-du-lieu':  { ma: 'MH0', ten: 'Mô hình & dữ liệu', tang: 0, href: 'mo-hinh-du-lieu.html' },
    'dinh-nghia':  { ma: 'DN0', ten: 'Định nghĩa chỉ số',      tang: 0, href: 'dinh-nghia.html' }
  },
  TANG: { 0: 'Quản trị', 1: 'Tầng 1 — Chiến lược', 2: 'Tầng 2 — Quản lý', 3: 'Tầng 3 — Vận hành' },

  /* 23 chỉ tiêu Kho vận trong thư viện KPI IGROUP v1.1 — chỉ dùng cho chú thích
     khi rê chuột lên nhãn. Định nghĩa và công thức đầy đủ ở màn Định nghĩa chỉ số. */
  TEN: {
    'KPI-150': 'Số lượng tồn kho',
    'KPI-151': 'Mức tồn kho an toàn so với thực tế',
    'KPI-152': 'Số ngày tồn kho thành phẩm',
    'KPI-153': 'Tỷ lệ hàng chậm luân chuyển',
    'KPI-154': 'Hiệu suất sử dụng kho lạnh',
    'KPI-155': 'Số ngày tồn kho khả dụng',
    'KPI-156': 'Tỷ lệ hàng hết hạn sử dụng',
    'KPI-157': 'Trung bình thời gian nhập hàng',
    'KPI-158': 'Trung bình thời gian xuất hàng',
    'KPI-159': 'Tổng số lệnh nhập hàng',
    'KPI-160': 'Khối lượng trung bình nhập hàng',
    'KPI-161': 'Tổng số lệnh xuất hàng',
    'KPI-162': 'Khối lượng trung bình xuất hàng',
    'KPI-163': 'Tỷ lệ đơn hàng nhỏ lẻ',
    'KPI-072': 'Thời gian từ nhận đơn đến xuất hàng',
    'KPI-073': 'Giao hàng đúng hạn và đủ lượng',
    'KPI-074': 'Tỷ lệ đáp ứng đơn hàng',
    'KPI-075': 'Đơn hàng bị khoá hoặc vướng',
    'KPI-052': 'Hàng sản xuất lưu kho quá 2 tháng',
    'KPI-039': 'Tỷ lệ hàng cô lập',
    'KPI-038': 'Tỷ lệ hàng hư hỏng trong quá trình lưu kho',
    'KPI-100': 'Số ngày tồn kho toàn bộ',
    'KPI-065': 'Chi phí logistics trên mỗi kg'
  },

  maMan: function () {
    var k = document.body.dataset.page || '';
    return this.MAN[k] ? this.MAN[k].ma : '??';
  },

  /* Gắn nhãn chỉ tiêu cạnh tiêu đề. Gọi lại sau mỗi lần vẽ vì trang có thể dựng
     lại thẻ. Tiêu đề đã có sẵn một nhãn nào đó thì bỏ qua, không chồng nhãn. */
  gan: function () {
    var map = window.KPI_MAP; if (!map) return;
    var tu = this;
    Object.keys(map).forEach(function (id) {
      var e = document.getElementById(id); if (!e) return;
      var o = e.closest('article, .card, .insight'); if (!o) return;
      var h = o.querySelector('h3, h4'); if (!h) return;
      if (h.querySelector('.tag')) return;

      var ma = map[id];
      var s = document.createElement('span');
      s.className = 'tag ' + (!ma ? 'ops' : ma.indexOf('·') >= 0 ? 'kpi-part' : 'kpi-code');
      if (ma) {
        s.textContent = ma;
        var g = ma.split(' ')[0];
        s.title = (tu.TEN[g] || g) + ' · thư viện KPI IGROUP v1.1'
                + (ma.indexOf('·') >= 0 ? ' · mới đo được một phần' : '');
      } else {
        s.textContent = 'Hỗ trợ phân tích';
        s.title = 'Biểu đồ dựng để tìm nguyên nhân — không thuộc bộ KPI chính thức';
      }
      /* Thứ tự đọc: tên → chỉ tiêu nào → quyết định gì → nút ghi chú.
         Nhãn chèn trước phần tử nào đến trước trong hai nút kia. */
      var sau = h.querySelector('.qd-ma, .note-pin');
      if (sau) h.insertBefore(s, sau); else h.appendChild(s);
    });
  }
};

(function () {
  'use strict';

  var NAV = [
    { group: 'Ba cấp quyết định' },
    { id: 'chien-luoc', href: 'chien-luoc.html', ico: '◉', label: '① Chiến lược · Ban điều hành' },
    { id: 'quan-ly',    href: 'index.html',      ico: '◪', label: '② Quản lý · Giám đốc Khối' },
    { id: 'van-hanh',   href: 'van-hanh.html',   ico: '◱', label: '③ Vận hành · Trưởng phòng' },
    { group: 'Quản trị', dim: true },
    { id: 'du-lieu',    href: 'du-lieu.html',    ico: '◈', label: 'Tình trạng dữ liệu KPI' },
    { id: 'mo-hinh-du-lieu',  href: 'mo-hinh-du-lieu.html',  ico: '◫', label: 'Mô hình & dữ liệu' },
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
          /* Bỏ nhãn tag, nút quyết định và chính nút ✎ ra khỏi tên vị trí, nếu không
             chuỗi sẽ dính thêm chữ như "Toàn kỳ" hay "KPI-154". */
          var c = h.cloneNode(true);
          Array.prototype.forEach.call(c.querySelectorAll('.tag, .note-pin, .qd-ma'), function (x) { x.remove(); });
          /* Ghi theo TÊN mục chứ không theo mã màn — mã màn đã bỏ ngày 11/10/2026,
             người nhận ghi chú không còn chỗ nào để tra nó nữa. */
          moPanel(c.textContent.replace('✎', '').replace(/\s+/g, ' ').trim());
        });
        h.appendChild(b);
      });
    }
    /* Gắn nhãn chỉ tiêu một lần khi trang dựng xong; màn có biểu đồ sẽ gọi lại
       NTSF_MA.gan() sau mỗi lần vẽ. */
    try { window.NTSF_MA.gan(); } catch (e) { }
    setTimeout(function () { try { window.NTSF_MA.gan(); ganNut(); } catch (e) { } }, 300);

    ganNut();
    /* Biểu đồ vẽ lại không đụng tới tiêu đề, nhưng trang có thể dựng thẻ động */
    setTimeout(ganNut, 1200);

    /* Mã riêng cho bảng phân tích sâu (QL2-P03 và đuôi -CT) đã bỏ ngày 11/10/2026
       cùng với cả hệ mã màn — tiêu đề bảng đã nói rõ đang xem lát cắt nào. */

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
/* ═══════════════════════════════════════════════════════
   NTSF_QD — SỔ QUYẾT ĐỊNH
   Dựng sau workshop 01–02/10/2026. Khung IIBA: một phân tích chỉ có
   giá trị khi nó thay đổi một quyết định. Vì vậy mỗi biểu đồ trên
   dashboard phải gắn được vào ít nhất một quyết định có người quyết,
   có nhịp, và có NGƯỠNG HÀNH ĐỘNG thống nhất TRƯỚC khi có kết quả.

   Nguồn nội dung: cột "Quyết định phục vụ" trong Sổ đăng ký chỉ tiêu
   (25/09/2026), đã phân sẵn cấp đọc và loại Dẫn dắt / Kết quả.

   ⚠️ Mọi ngưỡng dưới đây là ĐỀ XUẤT của Khối, chưa được duyệt.
   Duyệt xong thì đổi `duyet: false` thành `true` và ghi ngày.
   ═══════════════════════════════════════════════════════ */
window.NTSF_QD = (function () {
  'use strict';

  /* tt: 'du' = đủ dữ liệu quyết được · 'phan' = quyết được một phần
         'chua' = chưa quyết được vì thiếu dữ liệu */
  var DS = [
    /* ── ① CHIẾN LƯỢC ─────────────────────────────────────── */
    { ma:'QĐ-01', man:'chien-luoc', ten:'Có đầu tư mở rộng kho lạnh không?',
      ai:'Ban điều hành · đề xuất từ Giám đốc Khối', nhip:'Quý và năm',
      hoi:'Sức chứa hiện có còn đủ cho nhu cầu 3–5 năm tới, hay phải mở rộng?',
      kq:['KPI-154 Hiệu suất sử dụng kho lạnh'],
      dan:['KPI-150 Số lượng tồn kho','KPI-155 Số ngày tồn khả dụng'],
      nguong:'Hiệu suất kho lạnh vượt <b>90% ba tháng liên tiếp</b> → lập hồ sơ đầu tư. '
           + 'Dưới <b>60%</b> → rà lại hợp đồng thuê kho ngoài thay vì mở rộng.',
      tt:'phan',
      thieu:'Đang đo theo <b>tấn</b>, công thức chính thức đo theo thể tích hoặc pallet. '
          + '11 trên 20 kho chưa khai sức chứa trong hồ sơ layout.' },

    { ma:'QĐ-02', man:'chien-luoc', ten:'Cam kết mức phục vụ nào với từng thị trường?',
      ai:'Ban điều hành · CSO chủ trì', nhip:'Quý',
      hoi:'Thị trường nào Khối đủ sức cam kết SLA, thị trường nào chưa?',
      kq:['KPI-073 Giao đúng hạn và đủ lượng'],
      dan:['KPI-072 Thời gian từ nhận đơn đến xuất hàng','KPI-074 Tỷ lệ đáp ứng đơn hàng'],
      nguong:'Chỉ cam kết SLA cho thị trường có OTD <b>ba tháng liên tiếp ≥ mức cam kết + 5 điểm %</b>. '
           + 'Dưới mức đó thì cam kết khoảng thời gian rộng hơn, không hạ chất lượng để chạy theo con số.',
      tt:'phan',
      thieu:'Mới đo được vế <b>đúng hạn</b>, chưa có vế <b>đủ lượng</b> vì view thiếu lượng đặt. '
          + 'Chưa khách hàng nào có SLA khai trong hệ thống.' },

    { ma:'QĐ-03', man:'chien-luoc', ten:'Có chấp nhận mức vốn đang kẹt trong kho không?',
      ai:'Ban điều hành · CFO đồng duyệt', nhip:'Quý',
      hoi:'Vốn nằm trong hàng bao lâu mới quay vòng, và phần nào đang có nguy cơ thành hàng chết?',
      kq:['KPI-152 Số ngày tồn kho thành phẩm','KPI-100 Số ngày tồn kho toàn bộ'],
      dan:['KPI-153 Tỷ lệ hàng chậm luân chuyển','KPI-052 Hàng lưu kho quá 2 tháng'],
      nguong:'Vốn đọng vượt <b>10% tồn bình quân hai quý liên tiếp</b> → Ban điều hành duyệt phương án xả hàng '
           + 'kèm mức giảm giá tối đa. Không xả bằng giảm giá khi chưa có mức trần được duyệt.',
      tt:'chua',
      thieu:'<b>KPI-152 và KPI-100 để trống</b> theo quyết định 30/09/2026 — chờ giá vốn hàng bán từ Kế toán. '
          + 'Hiện chỉ quyết được bằng chỉ số dẫn dắt.' },

    { ma:'QĐ-04', man:'chien-luoc', ten:'Có đầu tư để nhìn thấy tiền đang MẤT và TỐN không?',
      ai:'Ban điều hành', nhip:'Năm · theo kỳ ngân sách',
      hoi:'Khối đang mất và tốn bao nhiêu tiền mỗi kỳ mà không nhìn thấy được?',
      kq:['Chưa có chỉ tiêu nào đo được'],
      dan:['KPI-156 Hàng hết hạn','KPI-038 Hàng hư hỏng','KPI-065 Chi phí logistics/kg'],
      nguong:'Nếu sau <b>31/12/2026</b> vẫn chưa có giá vốn hàng bán và chi phí vận hành kho theo tháng '
           + '→ đưa hai khoản này vào <b>phạm vi bắt buộc</b> của dự án ERP thay vì chờ.',
      tt:'chua',
      thieu:'Cả ba chỉ tiêu đều chưa đo được. Hai thẻ <i>Tiền đã MẤT</i> và <i>Tiền đang TỐN</i> '
          + 'trên màn Chiến lược để trống chính là bằng chứng cho quyết định này.' },

    /* ── ② QUẢN LÝ ───────────────────────────────────────── */
    { ma:'QĐ-05', man:'quan-ly', ten:'Tháng này siết nhóm hàng nào?',
      ai:'Giám đốc Khối', nhip:'Tháng',
      hoi:'Nhóm hàng nào đang giữ nhiều vốn nhất mà quay vòng chậm nhất?',
      kq:['KPI-153 Tỷ lệ hàng chậm luân chuyển'],
      dan:['KPI-052 Hàng lưu kho quá 2 tháng','Số ngày tồn theo nhóm hàng','Phân loại giá trị tồn kho'],
      nguong:'Nhóm có số ngày tồn <b>trên 90 ngày</b> hoặc giữ <b>trên 5% giá trị tồn</b> mà vòng quay <b>dưới 1</b> '
           + '→ đưa vào danh sách siết của tháng sau, có tên người theo dõi.',
      tt:'phan',
      thieu:'Mới đo được vế <b>chậm luân chuyển</b>; vế <b>cận date</b> thiếu hạn sử dụng thật của mã hàng.' },

    { ma:'QĐ-06', man:'quan-ly', ten:'Có dám nhận thêm đơn không?',
      ai:'Giám đốc Khối · cùng Kinh doanh', nhip:'Tuần',
      hoi:'Với mức tồn hiện tại, Khối còn đủ hàng để nhận thêm đơn trong bao lâu?',
      kq:['KPI-074 Tỷ lệ đáp ứng đơn hàng'],
      dan:['KPI-151 Mức tồn an toàn','KPI-155 Số ngày tồn khả dụng','KPI-150 Số lượng tồn kho'],
      nguong:'Số ngày tồn khả dụng của nhóm hàng trong đơn <b>dưới 15 ngày</b> → không nhận thêm, '
           + 'hoặc nhận kèm điều kiện thời gian giao rộng hơn.',
      tt:'chua',
      thieu:'<b>KPI-151</b> có trường nhưng giá trị bằng 0 ở toàn bộ mã — Kế hoạch chưa khai mức tồn an toàn. '
          + '<b>KPI-074</b> thiếu lượng đặt trong view.' },

    { ma:'QĐ-07', man:'quan-ly', ten:'Có thuê kho ngoài hay san tải nội bộ?',
      ai:'Giám đốc Khối', nhip:'Tháng · trước mùa cao điểm',
      hoi:'Kho nào đang quá tải, và còn chỗ trống ở kho nào để san sang?',
      kq:['KPI-154 Hiệu suất sử dụng kho lạnh — từng kho'],
      dan:['Tồn kho cuối kỳ theo tháng','Lệch tải giữa chín kho tự có'],
      nguong:'Kho nào vượt <b>100%</b> → san tải nội bộ trước. '
           + 'Chỉ thuê kho ngoài khi <b>tổng chín kho tự có vượt 90%</b> và không còn chỗ san.',
      tt:'phan',
      thieu:'Sức chứa thiết kế lấy từ <b>hồ sơ layout của Khối</b>, không lấy từ SAP — '
          + 'SAP có trường sức chứa trên ô kệ nhưng 3.444/3.445 ô bị gắn cờ rỗng.' },

    { ma:'QĐ-08', man:'quan-ly', ten:'Khách nào cần làm việc lại về mức phục vụ?',
      ai:'Giám đốc Khối · cùng Kinh doanh', nhip:'Tháng',
      hoi:'Khách nào đang nhận mức phục vụ thấp hơn hẳn mức chung, và có đáng để đàm phán lại?',
      kq:['KPI-073 Giao đúng hạn — từng khách'],
      dan:['Lệch trung vị theo khách','Phân bố mức độ trễ'],
      nguong:'Khách có OTD <b>dưới mức chung hai tháng liên tiếp</b> và sản lượng <b>trên 500 tấn mỗi kỳ</b> '
           + '→ đưa vào danh sách làm việc lại về thời gian giao.',
      tt:'phan',
      thieu:'Chưa có SLA riêng của từng khách trong hệ thống nên mốc so sánh là <b>mức chung</b>, không phải cam kết thật.' },

    { ma:'QĐ-09', man:'quan-ly', ten:'Có đổi chính sách đơn nhỏ lẻ không?',
      ai:'Giám đốc Khối · CSO quyết phần thương mại', nhip:'Quý',
      hoi:'Đơn nhỏ lẻ đang ăn mòn năng suất kho bao nhiêu, và có đáng đặt phụ phí không?',
      kq:['KPI-163 Tỷ lệ đơn hàng nhỏ lẻ'],
      dan:['KPI-162 Khối lượng trung bình mỗi lệnh xuất'],
      nguong:'⚠️ <b>Chưa chốt được ngưỡng thế nào là đơn nhỏ lẻ</b> — thư viện KPI ghi thẳng <i>"cần thống nhất"</i>. '
           + 'Đề xuất lấy <b>dưới 5 tấn một lệnh</b>; vượt 15% tổng số lệnh thì bàn phụ phí.',
      tt:'chua',
      thieu:'Dữ liệu đã đủ để tính ngay khi Khối chốt ngưỡng. Đây là <b>quyết định bị chặn bởi định nghĩa</b>, '
          + 'không phải bởi dữ liệu.' },

    /* ── ③ VẬN HÀNH ──────────────────────────────────────── */
    { ma:'QĐ-10', man:'van-hanh', ten:'Hôm nay chuyển hàng khỏi kho nào?',
      ai:'Trưởng phòng Quản lý Kho', nhip:'Ngày',
      hoi:'Kho nào đã vượt sức chứa, và chuyển sang kho nào thì còn chỗ?',
      kq:['Số kho vượt trần'],
      dan:['Mức lấp đầy từng kho','Lượng cần chuyển đi so với chỗ trống nhận được'],
      nguong:'Kho vượt <b>100%</b> → chuyển ngay trong ngày. Kho <b>80–100%</b> → ngừng nhận thêm hàng mới. '
           + 'Ưu tiên chuyển các lô cũ nhất để giải quyết cùng lúc KPI-052.',
      tt:'phan',
      thieu:'Bảng kho là <b>ảnh chụp 16/09/2026</b>, chưa nối tự động — phải đối chiếu SAP trước khi điều việc.' },

    { ma:'QĐ-11', man:'van-hanh', ten:'Lô nào đẩy trước?',
      ai:'Trưởng phòng Quản lý Kho', nhip:'Tuần',
      hoi:'Lô nào già nhất và nằm ở kho đang quá tải?',
      kq:['KPI-052 Hàng lưu kho quá 2 tháng'],
      dan:['Tuổi tồn theo dải','Số lô quá 180 ngày'],
      nguong:'Lô quá <b>180 ngày</b> → đẩy trong tháng. Lô quá <b>60 ngày</b> và nằm ở kho vượt trần → ưu tiên trước. '
           + 'Lô mang ngày chuyển số dư đầu kỳ phải xác minh với Ban dự án ERP trước khi coi là hàng tồn lâu.',
      tt:'phan',
      thieu:'Đây là <b>tuổi lô</b>, không phải hạn sử dụng — chỉ 24 trên 17.407 lô có ghi hạn dùng.' },

    { ma:'QĐ-12', man:'van-hanh', ten:'Đơn nào gỡ vướng trong ngày?',
      ai:'Trưởng phòng Điều phối Vận chuyển', nhip:'Ngày',
      hoi:'Đơn nào đang đứng im, vì lý do gì, và đơn nào thực ra đã chết cần đóng?',
      kq:['KPI-075 Đơn hàng bị khoá hoặc vướng'],
      dan:['Khối lượng và số dòng còn treo theo khách','Ngày kế hoạch cũ nhất còn treo'],
      nguong:'Đơn có ngày kế hoạch <b>quá 30 ngày</b> → phân loại <i>còn hiệu lực</i> hay <i>đơn chết cần đóng</i> '
           + 'trong tuần. Không để đơn treo quá một quý mà chưa phân loại.',
      tt:'phan',
      thieu:'Đếm được số đơn nhưng <b>chưa biết lý do khoá</b> — cần IT cấp bảng giải mã trạng thái đơn.' },

    { ma:'QĐ-13', man:'van-hanh', ten:'Bố trí người và xe ngày nào?',
      ai:'Trưởng phòng Quản lý Kho · cùng Điều phối', nhip:'Tuần',
      hoi:'Khối lượng việc rơi vào những ngày nào và giờ nào trong tuần?',
      kq:['Sản lượng xử lý bình quân mỗi ngày'],
      dan:['Nhịp tác nghiệp theo giờ','Nhịp theo thứ trong tuần','Nhịp xuất container theo thứ'],
      nguong:'Thứ có sản lượng vượt <b>1,5 lần bình quân</b> → tăng ca bốc xếp. '
           + 'Dưới <b>0,5 lần</b> → rút người sang việc khác. Đỉnh người và đỉnh xe phải trùng nhau.',
      tt:'du',
      thieu:'' }
  ];

  var NHAN_TT = { du:'Quyết được', phan:'Quyết được một phần', chua:'Chưa quyết được' };

  /* Dẫn dắt (lead) báo sớm, can thiệp được · Kết quả (lag) báo muộn, chỉ để nghiệm thu.
     Lấy từ cột "Loại" trong Sổ đăng ký chỉ tiêu 25/09/2026. */
  var LOAI = {
    'KPI-150':'lead','KPI-151':'lead','KPI-152':'lead','KPI-153':'lead','KPI-154':'lead',
    'KPI-155':'lead','KPI-100':'lead','KPI-052':'lead','KPI-039':'lead',
    'KPI-072':'lead','KPI-073':'lead','KPI-074':'lead','KPI-075':'lead',
    'KPI-156':'lag','KPI-038':'lag','KPI-157':'lag','KPI-158':'lag','KPI-159':'lag',
    'KPI-160':'lag','KPI-161':'lag','KPI-162':'lag','KPI-163':'lag','KPI-065':'lag'
  };
  var NHAN_LOAI = { lead:'Dẫn dắt', lag:'Kết quả' };

  /* Trả về thẻ nhãn Dẫn dắt / Kết quả cho một chuỗi có chứa mã KPI. */
  function nhanLoai(s) {
    var m = /KPI-\d{3}/.exec(s || ''); if (!m) return '';
    var l = LOAI[m[0]]; if (!l) return '';
    return '<span class="tag ' + l + '">' + NHAN_LOAI[l] + '</span>';
  }

  /* ⚠️ Khối "thẻ người dùng" (ai đọc · quyết định gì · nhịp xem · so với gì · đào
     sâu tới) ĐÃ BỎ ngày 13/10/2026 theo yêu cầu người dùng. Workshop 01–02/10 gọi
     đây là "thẻ người dùng dashboard", nhưng trên màn nó chỉ là năm ô chữ đứng
     chắn giữa tiêu đề và con số. Mỗi chỉ tiêu nay đã tự mang quyết định của nó
     (dòng ⟶ trên mặt thẻ và nút Quyết định cạnh biểu đồ) nên khối này thừa.
     Đừng dựng lại. Dữ liệu người đọc/nhịp xem của từng màn vẫn còn trong tài liệu. */

  function cua(man) {
    return DS.filter(function (x) { return x.man === man; });
  }
  function tim(ma) {
    for (var i = 0; i < DS.length; i++) if (DS[i].ma === ma) return DS[i];
    return null;
  }

  /* ── Dòng quyết định in ngay trên mặt thẻ chỉ tiêu ──
     Thay cho dòng công thức: nhìn thẻ là biết con số này quyết được việc gì. */
  function dong(ma) {
    var q = tim(ma); if (!q) return '';
    return '<span class="qd-dong qd-v-' + q.tt + '">⟶ ' + q.ten + '</span>';
  }

  /* ── Khối quyết định chèn lên ĐẦU bảng phân tích sâu của chính chỉ tiêu đó ── */
  function khoi(ma) {
    var q = tim(ma); if (!q) return '';
    return '<div class="qd-khoi">'
      + '<div class="qd-khoi-top"><span class="qd-tt qd-' + q.tt + '">' + NHAN_TT[q.tt] + '</span>'
      + '<b>' + q.ten + '</b></div>'
      + '<div class="qd-khoi-luoi">'
      + '<div><h5>Câu hỏi cần trả lời</h5><p>' + q.hoi + '</p></div>'
      + '<div><h5>Ngưỡng hành động <i>· đề xuất, chưa duyệt</i></h5><p>' + q.nguong + '</p></div>'
      + '<div><h5>Ai quyết · nhịp</h5><p>' + q.ai + '<br>' + q.nhip + '</p></div>'
      + '</div>'
      + (q.thieu ? '<p class="qd-khoi-thieu">⚠️ <b>Còn thiếu để quyết cho chắc:</b> ' + q.thieu + '</p>' : '')
      + '</div>';
  }
  /* ── Nút quyết định cạnh tiêu đề biểu đồ ──
     Trong HTML chỉ cần ghi data-qd="QĐ-07" lên thẻ <article class="card">.
     Nút ghi chữ "Quyết định" chứ KHÔNG ghi mã QĐ-07: mã quyết định là cách đánh
     số nội bộ, người đọc không tra ở đâu được — câu hỏi thật nằm trong chú thích
     và trong hộp mở ra khi bấm. Bỏ mã hiển thị ngày 11/10/2026. */
  function gan() {
    var ds = document.querySelectorAll('[data-qd]');
    Array.prototype.forEach.call(ds, function (el) {
      if (el.tagName === 'BUTTON') return;                 /* nút trong bảng đã có sẵn */
      var ma = el.dataset.qd, q = tim(ma); if (!q) return;
      var h = el.querySelector('h3'); if (!h) return;
      if (h.querySelector('.qd-ma')) return;
      var b = document.createElement('button');
      b.className = 'qd-ma'; b.type = 'button';
      b.dataset.qd = ma; b.title = q.ten + ' · bấm để xem câu hỏi và ngưỡng hành động';
      b.textContent = '⟶ Quyết định';
      h.appendChild(b);
    });
  }

  /* ── Bảng phân tích quyết định ── */
  var scrim = null;
  function hop() {
    if (scrim) return scrim;
    scrim = document.createElement('div');
    scrim.className = 'scrim qd-scrim';
    scrim.innerHTML =
      '<div class="modal"><div class="modal-head">'
      + '<div><div class="eyebrow" id="qdEye">—</div><h2 id="qdTitle">—</h2></div>'
      + '<div class="grow" style="flex:1"></div>'
      + '<button class="btn" onclick="window.print()">⎙ In / PDF</button>'
      + '<button class="close" id="qdClose" aria-label="Đóng">✕</button>'
      + '</div><div class="modal-body" id="qdBody"></div></div>';
    document.body.appendChild(scrim);
    scrim.addEventListener('click', function (e) {
      if (e.target === scrim || e.target.closest('#qdClose')) dongHop();
    });
    return scrim;
  }
  function dongHop() {
    if (!scrim) return;
    scrim.classList.remove('on');
    document.body.style.overflow = '';
  }
  function mo(ma) {
    var q = tim(ma); if (!q) return;
    var s = hop();
    document.getElementById('qdEye').textContent =
      'Quyết định · cấp ' + (NTSF_MA.MAN[q.man] ? NTSF_MA.MAN[q.man].ten : q.man);
    document.getElementById('qdTitle').innerHTML = q.ten;
    document.getElementById('qdBody').innerHTML = than(q);
    s.classList.add('on');
    document.body.style.overflow = 'hidden';
    var c = document.getElementById('qdClose'); if (c) c.focus();
  }

  function than(q) {
    var h = '';
    h += '<div class="attrs">'
       + at('Người quyết', q.ai)
       + at('Nhịp xem', q.nhip) + at('Trạng thái', NHAN_TT[q.tt])
       + '</div>';

    h += '<div class="card"><h3>Câu hỏi cần trả lời</h3><p class="qd-lon">' + q.hoi + '</p></div>';

    h += '<div class="card"><h3>Chỉ số đi kèm</h3>'
       + '<p class="how">Chỉ số <b>kết quả</b> cho biết đã đạt chưa nhưng đến muộn · chỉ số <b>dẫn dắt</b> '
       + 'cho phép can thiệp sớm. Workshop 02/10 gọi đây là cây chỉ số.</p>'
       + '<div class="qd-cs"><div><h5>Kết quả · lag</h5><ul>'
       + q.kq.map(function (x) { return '<li>' + x + '</li>'; }).join('')
       + '</ul></div><div><h5>Dẫn dắt · lead</h5><ul>'
       + q.dan.map(function (x) { return '<li>' + x + '</li>'; }).join('')
       + '</ul></div></div></div>';

    h += '<div class="card qd-ng"><h3>Ngưỡng hành động</h3>'
       + '<p class="how">Workshop nhấn mạnh: ngưỡng phải thống nhất <b>TRƯỚC</b> khi có kết quả, '
       + 'nếu không sẽ diễn giải theo ý muốn.</p>'
       + '<p class="qd-lon">' + q.nguong + '</p>'
       + '<p class="qd-duyet">⚠️ <b>Đây là ngưỡng do Khối đề xuất, chưa được duyệt.</b> '
       + 'Cần Giám đốc Khối chốt và ghi ngày hiệu lực trước khi dùng để ra quyết định thật.</p></div>';

    if (q.thieu) {
      h += '<div class="insight"><h4>Còn thiếu gì để quyết cho chắc</h4><p>' + q.thieu + '</p></div>';
    }
    return h;
  }
  function at(k, v) {
    return '<div class="attr"><div class="k">' + k + '</div><div class="v num">' + v + '</div></div>';
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-qd]');
    if (!b || b.tagName !== 'BUTTON') return;
    e.preventDefault(); e.stopPropagation();
    mo(b.dataset.qd);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && scrim && scrim.classList.contains('on')) dongHop();
  });

  return { DS: DS, LOAI: LOAI, cua: cua, tim: tim,
           gan: gan, mo: mo,
           nhanLoai: nhanLoai, dong: dong, khoi: khoi };
})();

window.NTSF_RANGE = (function () {
  'use strict';

  /* ═══ THANH LỌC PHẠM VI ═══
     Từ tháng → Đến tháng · So sánh với · các chiều lọc do từng màn khai báo · Tìm kiếm.
     Bỏ cây phân cấp Năm→Quý→Tháng→Tuần→Ngày ngày 30/09/2026 vì quá nhiều bước bấm.
     Lựa chọn ghi vào localStorage nên ba màn dùng chung một phạm vi. */

  var BASE = new Date(2026, 0, 1);     // mốc 0 của offset ngày
  var END  = new Date(2026, 8, 16);    // ngày chốt số liệu 16/09/2026
  var HET  = 8;                        // tháng cuối có dữ liệu (0 = tháng 1)
  var THANG = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  var KHOA  = 'ntsf-pham-vi-v3';

  function off(d) { return Math.round((d - BASE) / 86400000); }
  function dateOf(o) { var d = new Date(BASE); d.setDate(d.getDate() + o); return d; }
  function dd(d) { return ('0' + d.getDate()).slice(-2); }
  function mm(d) { return ('0' + (d.getMonth() + 1)).slice(-2); }
  function vn(d) { return dd(d) + '/' + mm(d) + '/' + d.getFullYear(); }
  function vnNgan(d) { return dd(d) + '/' + mm(d); }
  var END_OFF = off(END);

  function thuHai(d) {
    var k = (d.getDay() + 6) % 7;
    var r = new Date(d); r.setDate(d.getDate() - k); r.setHours(0,0,0,0);
    return r;
  }
  function dauThang(i) { var d = new Date(2026, i, 1); return d < BASE ? new Date(BASE) : d; }
  function cuoiThang(i) { var d = new Date(2026, i + 1, 0); return d > END ? new Date(END) : d; }
  function nhanThang(i) { return '2026.' + THANG[i]; }

  var PRESET = [
    { id:'1T',  nhan:'1T',      tu:function(){ return HET; } },
    { id:'3T',  nhan:'3T',      tu:function(){ return Math.max(0, HET - 2); } },
    { id:'6T',  nhan:'6T',      tu:function(){ return Math.max(0, HET - 5); } },
    { id:'ytd', nhan:'YTD 26',  tu:function(){ return 0; } }
  ];

  /* ═══ TRẠNG THÁI ═══ */
  var tu = 0, den = HET, ss = 'truoc', dim = {}, q = '';
  var DIMS = [], GOI_Y = '', cur = null, cb = null, hostEl = null, mo = true;

  function doc() {
    try {
      var s = JSON.parse(localStorage.getItem(KHOA) || 'null');
      if (!s) return;
      if (s.tu != null)  tu  = Math.min(Math.max(s.tu, 0), HET);
      if (s.den != null) den = Math.min(Math.max(s.den, 0), HET);
      if (tu > den) { var t = tu; tu = den; den = t; }
      if (s.ss) ss = s.ss;
      if (s.dim) dim = s.dim;
      if (s.q != null) q = s.q;
      if (s.mo != null) mo = !!s.mo;
    } catch (e) { /* trình duyệt chặn localStorage thì dùng mặc định */ }
  }
  function luu() {
    try { localStorage.setItem(KHOA, JSON.stringify({ tu:tu, den:den, ss:ss, dim:dim, q:q, mo:mo })); }
    catch (e) { }
  }

  function cuaSo(a, b) {
    var f = dauThang(a), t = cuoiThang(b), n = b - a + 1;
    return {
      tu:a, den:b, soThang:n,
      from:f, to:t, fromOff:off(f), toOff:off(t),
      soNgay: off(t) - off(f) + 1,
      nhan: vn(f) + ' → ' + vn(t),
      tenDay: n === 1 ? 'Tháng ' + (a + 1) : 'Tháng ' + (a + 1) + ' → Tháng ' + (b + 1),
      tron: (b < HET)           /* tháng 9 mới có 16 ngày nên kỳ chạm tháng 9 là kỳ cụt */
    };
  }

  function dungR() {
    var n = den - tu + 1;
    var w = cuaSo(tu, den);
    var truoc = null, lyDo = '';

    if (ss === 'truoc') {
      if (tu - n >= 0) truoc = cuaSo(tu - n, tu - 1);
      else if (tu > 0) { truoc = cuaSo(0, tu - 1); lyDo = 'Kỳ trước chỉ còn ' + tu + ' tháng dữ liệu, ngắn hơn kỳ đang xem.'; }
      else lyDo = 'Kỳ đang xem đã bắt đầu từ tháng 1, không có kỳ nào trước nữa.';
    } else if (ss === 'nam') {
      lyDo = 'Bản trích chỉ có từ 03/01/2026 nên chưa có cùng kỳ năm trước. '
           + 'Muốn so cùng kỳ thì phải kéo thêm dữ liệu năm 2025 từ SAP.';
    }

    var lech = truoc ? Math.abs(w.soNgay - truoc.soNgay) / Math.max(w.soNgay, truoc.soNgay) : 0;

    cur = {
      /* hợp đồng cũ — các màn đang dùng, không đổi tên */
      id:'pv', label: w.tenDay, ten: w.tenDay.toLowerCase(),
      bucket: n === 1 ? 'day' : (n <= 3 ? 'week' : 'month'),
      from: w.from, to: w.to, fromOff: w.fromOff, toOff: w.toOff,
      soNgay: w.soNgay, nhan: w.nhan, toanKy: (tu === 0 && den === HET),
      /* phần mới */
      tu: tu, den: den, soThang: n, tenDay: w.tenDay, tron: w.tron,
      soSanh: ss, truoc: truoc, lyDoSoSanh: lyDo,
      binhQuan: lech > 0.10, lechNgay: lech,
      dim: dim, q: q
    };
    return cur;
  }

  /* ═══ GIAO DIỆN ═══ */
  function opt(v, ten, chon) {
    return '<option value="' + v + '"' + (String(chon) === String(v) ? ' selected' : '') + '>' + ten + '</option>';
  }
  function huyHieu() {
    if (cur.toanKy && !q && khongLoc()) return 'Toàn bộ';
    var s = cur.soThang === 9 ? 'Toàn kỳ' : cur.tenDay;
    if (!khongLoc()) s += ' · đã lọc';
    if (q) s += ' · tìm “' + q + '”';
    return s;
  }
  function khongLoc() {
    for (var i = 0; i < DIMS.length; i++) if (dim[DIMS[i].id] && dim[DIMS[i].id] !== 'all') return false;
    return true;
  }

  function ve() {
    if (!hostEl) return;
    var h = '', i, j;

    h += '<div class="pv-top">'
       + '<button class="pv-tog" type="button" data-tog="1" aria-expanded="' + mo + '">'
       + '<span class="pv-mui">' + (mo ? '▾' : '▸') + '</span> Phạm vi phân tích</button>'
       + '<span class="pv-badge">' + huyHieu() + '</span>'
       + '<span class="pv-grow"></span><div class="chips">';
    for (i = 0; i < PRESET.length; i++) {
      var p = PRESET[i], khop = (tu === p.tu() && den === HET);
      h += '<button class="chip" type="button" data-p="' + p.id + '"'
         + (khop ? ' aria-pressed="true"' : '') + '>' + p.nhan + '</button>';
    }
    h += '</div><button class="chip pv-reset" type="button" data-reset="1">↺ Đặt lại</button></div>';

    h += '<div class="pv-body"' + (mo ? '' : ' hidden') + '>';

    h += truong('Từ tháng', '<select data-f="tu">' + dsThang(tu) + '</select>');
    h += truong('Đến tháng', '<select data-f="den">' + dsThang(den) + '</select>');
    h += truong('So sánh với',
          '<select data-f="ss">'
        + opt('none', 'Không so sánh', ss)
        + opt('truoc', 'Kỳ liền trước', ss)
        + opt('nam', 'Cùng kỳ năm trước', ss)
        + '</select>');

    for (i = 0; i < DIMS.length; i++) {
      var d = DIMS[i], o = '';
      for (j = 0; j < d.opts.length; j++) o += opt(d.opts[j][0], d.opts[j][1], dim[d.id] || 'all');
      h += truong(d.nhan, '<select data-d="' + d.id + '">' + o + '</select>');
    }

    if (GOI_Y) {
      h += '<label class="pv-f pv-q"><span>Tìm kiếm</span>'
         + '<span class="pv-ip"><i>⌕</i><input type="search" data-f="q" value="' + esc(q)
         + '" placeholder="' + esc(GOI_Y) + '" autocomplete="off"></span></label>';
    }
    h += '</div>';

    h += '<p class="rb-note' + ((!cur.tron || cur.lyDoSoSanh || cur.binhQuan) ? ' rb-warn' : '')
       + '"' + (mo ? '' : ' hidden') + '>' + chuTrangThai() + '</p>';

    hostEl.innerHTML = h;
    hostEl.className = 'pv';
  }
  function truong(nhan, dk) { return '<label class="pv-f"><span>' + nhan + '</span>' + dk + '</label>'; }
  function dsThang(chon) {
    var s = '', i;
    for (i = 0; i <= HET; i++) s += opt(i, nhanThang(i), chon);
    return s;
  }
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

  function chuTrangThai() {
    var s = 'Đang xem <b>' + cur.tenDay + '</b> · ' + cur.nhan + ' · <b>' + cur.soNgay + '</b> ngày theo lịch';
    if (!cur.tron) s += ' · ⚠️ kỳ có <b>tháng 9 mới 16 ngày</b>, đừng so tổng với kỳ đủ tháng';
    s += '.';
    if (cur.truoc) {
      s += ' So với <b>' + cur.truoc.tenDay + '</b> (' + cur.truoc.soNgay + ' ngày)';
      s += cur.binhQuan
        ? ' — hai kỳ lệch <b>' + Math.round(cur.lechNgay * 100) + '%</b> số ngày nên bảng so sánh '
          + '<b>tự quy về bình quân mỗi ngày</b>.'
        : '.';
    } else if (cur.lyDoSoSanh) {
      s += ' <b>Chưa so sánh được:</b> ' + cur.lyDoSoSanh;
    }
    return s;
  }

  var hoTim = null;
  function batSuKien() {
    hostEl.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.tog)        { mo = !mo; luu(); ve(); return; }
      else if (b.dataset.p)     { var p = timPreset(b.dataset.p); tu = p.tu(); den = HET; }
      else if (b.dataset.reset) { tu = 0; den = HET; ss = 'truoc'; dim = {}; q = ''; }
      else return;
      xong();
    });
    hostEl.addEventListener('change', function (e) {
      var s = e.target;
      if (s.dataset.d) { dim[s.dataset.d] = s.value; }
      else if (s.dataset.f === 'tu')  { tu = +s.value;  if (tu > den) den = tu; }
      else if (s.dataset.f === 'den') { den = +s.value; if (den < tu) tu = den; }
      else if (s.dataset.f === 'ss')  { ss = s.value; }
      else return;
      xong();
    });
    /* Ô tìm kiếm gõ tới đâu lọc tới đó, chờ 220ms cho khỏi vẽ lại liên tục */
    hostEl.addEventListener('input', function (e) {
      if (e.target.dataset.f !== 'q') return;
      q = e.target.value.trim();
      clearTimeout(hoTim);
      hoTim = setTimeout(function () {
        var oNoi = document.activeElement === e.target;
        luu(); dungR(); ve();
        if (oNoi) { var ip = hostEl.querySelector('[data-f="q"]'); if (ip) { ip.focus(); ip.setSelectionRange(q.length, q.length); } }
        if (cb) cb(cur);
      }, 220);
    });
  }
  function timPreset(id) { for (var i = 0; i < PRESET.length; i++) if (PRESET[i].id === id) return PRESET[i]; return PRESET[3]; }
  function xong() { luu(); dungR(); ve(); if (cb) cb(cur); }

  function init(opt2) {
    opt2 = opt2 || {};
    hostEl = document.getElementById(opt2.host || 'rangeChips');
    if (!hostEl) return null;
    cb = opt2.onChange || null;
    DIMS = opt2.dims || [];
    GOI_Y = opt2.timKiem || '';
    doc();
    /* đọc localStorage trước rồi mới điền mặc định, nếu không chiều lọc riêng
       của màn này sẽ bị bộ dim dùng chung của màn khác xoá mất */
    for (var i = 0; i < DIMS.length; i++) if (dim[DIMS[i].id] == null) dim[DIMS[i].id] = 'all';
    dungR(); ve(); batSuKien();
    if (cb) cb(cur);
    return cur;
  }

  /* ═══ TIỆN ÍCH CHO CÁC MÀN ═══ */
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
  function thangTrongKy(r) {
    var out = [], i;
    for (i = r.tu; i <= r.den; i++) out.push(i);
    return out;
  }
  /* Khớp một chuỗi bất kỳ với ô Tìm kiếm — bỏ dấu để gõ không dấu vẫn ra */
  function khop(s) {
    if (!q) return true;
    return boDau(String(s)).indexOf(boDau(q)) >= 0;
  }
  function boDau(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
  }

  return {
    init: init, parse: parse, loc: loc, gom: gom,
    thangTrongKy: thangTrongKy, khop: khop, boDau: boDau,
    vn: vn, vnNgan: vnNgan, THANG: THANG,
    get hienTai() { return cur; },
    DATA_END: END
  };
})();
