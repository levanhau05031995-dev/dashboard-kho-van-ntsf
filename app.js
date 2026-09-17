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
