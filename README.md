# Dashboard Khối Kho Vận & Logistics — NTSF

Dashboard quản trị cho Giám đốc Khối Kho vận & Logistics, Nha Trang Seafoods.
Dữ liệu lấy từ **SAP S/4HANA** (plant P100, kho EWM 520 — NTSF Cần Thơ),
kỳ **03/01/2026 → 16/09/2026**, trích ngày 16/09/2026.

## Sáu màn hình

| Màn | Tệp | Nội dung |
|---|---|---|
| 1 | `index.html` | Tổng quan điều hành — 9 thẻ KPI, tồn kho, luân chuyển, OTD, container, bản đồ điểm đến |
| 2 | `giao-hang.html` | Giao hàng & Khách hàng — OTD, phân bố độ trễ, top khách, Incoterms, cảng |
| 3 | `ton-kho.html` | Tồn kho — giá trị, biến động ròng, nhóm hàng, tuổi tồn, phân loại ABC |
| 4 | `nang-suat.html` | Năng suất kho — sản lượng ngày, nhịp theo giờ và theo thứ, luồng di chuyển |
| 5 | `du-lieu.html` | Tình trạng dữ liệu KPI — 14 chỉ tiêu, rào cản, lộ trình mở khoá |
| 6 | `dinh-nghia.html` | Định nghĩa chỉ số — công thức, nguồn, và những gì chưa đo được |

Mỗi màn có tính năng **đào sâu**: bấm vào một chỉ số hoặc một cột sẽ mở màn
phân tích chi tiết kèm bảng số liệu và hộp kết luận.

## Cách chạy

Trang **tự chứa hoàn toàn** — mọi CSS, JavaScript và logo đã gộp thẳng vào từng
tệp HTML. Không cần cài đặt, không cần máy chủ, không phụ thuộc thư viện ngoài.

- **Trên GitHub Pages:** mở đường dẫn Pages của repo
- **Trên máy:** nháy đúp `index.html`
- **Qua máy chủ cục bộ:** trỏ bất kỳ static server nào vào thư mục này

Cần mật khẩu để mở. Mật khẩu do Khối Kho vận cấp riêng, không đặt trong repo.

## Tệp nguồn và cách sửa

| Tệp | Vai trò |
|---|---|
| `styles.css` | Toàn bộ token màu, bo góc, thang chữ |
| `app.js` | Dựng thanh điều hướng bên trái, đổi giao diện sáng/tối, nút thoát |
| `auth.js` | Băm mật khẩu, giữ phiên, cổng chặn |
| `logo.js` | Logo thương hiệu dạng base64 |

> **Quan trọng:** sau khi sửa bất kỳ tệp nào ở trên phải chạy lại script `Build.ps1`
> để gộp chúng vào từng trang HTML. Không chạy lại thì các trang vẫn dùng bản cũ.

Biểu đồ đều **tự vẽ bằng SVG**, không dùng thư viện. Không có biểu đồ hai trục tung.

## Phạm vi và giới hạn

- Chỉ có số liệu của **NTSF Cần Thơ**. Các nhà máy khác chưa triển khai SAP.
- Số liệu là **bản trích thủ công** ngày 16/09/2026, chưa nối tự động.
- Bộ KPI của Khối có 14 chỉ tiêu, hiện **theo dõi được 4**. Mười chỉ tiêu còn lại
  thiếu dữ liệu nguồn chứ không phải thiếu biểu đồ — chi tiết ở màn 5.
- Một số con số cần đọc kèm chú thích (mức lấp đầy kho, độ chính xác soạn hàng,
  hàng cận date). Màn 6 ghi rõ từng trường hợp.

## ⚠️ Về bảo mật

Repo này ở chế độ **công khai** theo yêu cầu của chủ sở hữu dữ liệu.

Trang đăng nhập chỉ là **cổng chặn phía trình duyệt, không phải khoá**. Toàn bộ số
liệu nằm ngay trong mã nguồn tệp HTML, nên bất kỳ ai xem mã nguồn cũng đọc được
mà không cần mật khẩu. Đừng nhầm cổng này với bảo vệ thật.

Muốn bảo vệ thật thì phải chặn ở phía máy chủ (phân quyền SharePoint, IIS, Nginx)
hoặc mã hoá nội dung trang.

---

Nha Trang Seafoods · Khối Kho vận & Logistics · 2026
