# Dashboard Khối Kho Vận & Logistics — NTSF

Dashboard quản trị cho Giám đốc Khối Kho vận & Logistics, Nha Trang Seafoods.
Dữ liệu lấy từ **SAP S/4HANA** (plant P100, kho EWM 520 — NTSF Cần Thơ),
kỳ **03/01/2026 → 16/09/2026**, trích ngày 16/09/2026.

Chạy thật: <https://levanhau05031995-dev.github.io/dashboard-kho-van-ntsf/>

## Sáu màn hình — ba cấp quyết định cộng ba màn quản trị

Cấu trúc dựng lại ngày 30/09/2026 theo **ba cấp quyết định**. Mỗi cấp trả lời một
câu hỏi khác nhau và có nhịp đọc khác nhau, nên không gộp chung màn được.

| Cấp | Tệp | Ai đọc · nhịp | Câu hỏi nó trả lời |
|---|---|---|---|
| ① Chiến lược | `chien-luoc.html` | Ban điều hành · quý và năm | Có nên đầu tư, có nên cam kết gì |
| ② Quản lý | `index.html` | Giám đốc Khối · tháng và tuần | Tháng này lệch ở đâu, sửa cái nào |
| ③ Vận hành | `van-hanh.html` | Trưởng phòng · ngày và ca | Hôm nay làm gì trước |

| Màn quản trị | Tệp | Nội dung |
|---|---|---|
| Tình trạng dữ liệu KPI | `du-lieu.html` | 23 chỉ tiêu Kho vận, rào cản từng chỉ tiêu, lộ trình mở khoá |
| Mô hình & dữ liệu | `mo-hinh-du-lieu.html` | Sơ đồ bảng dữ liệu, bấm tiêu đề bảng để bung dữ liệu chi tiết |
| Định nghĩa chỉ số | `dinh-nghia.html` | Công thức, nguồn, quy tắc chọn biểu đồ, và những gì chưa đo được |

`login.html` là cổng đăng nhập. Đây **chỉ là cổng chặn phía trình duyệt**, không
phải lớp bảo mật — toàn bộ dữ liệu nằm sẵn trong tệp HTML.

## Bộ chỉ tiêu

Mã chỉ tiêu theo **IGROUP KPI Library v1.1**, phần Kho vận có 23 chỉ tiêu.
Mỗi thẻ trên dashboard ghi rõ đang tính chỉ tiêu nào, bốn dạng nhãn:

| Nhãn | Nghĩa |
|---|---|
| `KPI-150` | đo đủ theo công thức chính thức |
| `KPI-154 · phần` | mới đo được một phần, phần thiếu ghi ở màn Định nghĩa chỉ số |
| `KPI-065 · chưa đo` | chỉ tiêu có thật nhưng chưa có dữ liệu |
| `Ngoài bộ KPI` | chỉ số vận hành, không có trong thư viện 23 chỉ tiêu |

Mỗi chỉ tiêu và mỗi biểu đồ còn gắn một **quyết định** — bấm nút *⟶ Quyết định*
cạnh tiêu đề để xem câu hỏi cần trả lời, ngưỡng hành động và ai là người quyết.

## Quy tắc biểu đồ

Màn *Định nghĩa chỉ số* có bảng **12 quy tắc chọn biểu đồ**: dạng dữ liệu quyết
định dạng biểu đồ, không phải chỗ trống trên màn quyết định. Tra bảng đó trước
khi thêm biểu đồ mới.

## Cách chạy

Trang **tự chứa hoàn toàn** — mọi CSS, JavaScript và logo đã gộp thẳng vào từng
tệp HTML. Không cần cài đặt, không cần máy chủ, không phụ thuộc thư viện ngoài.
Mở thẳng tệp `.html` bằng trình duyệt là chạy.

Muốn xem thử tại chỗ bằng máy chủ nhỏ: `.claude/serve.ps1`, cổng mặc định 8810.

## Dựng lại từ nguồn

`styles.css`, `app.js`, `auth.js`, `logo.js` là **tệp nguồn**. Script dựng sẽ nhồi
chúng vào từng trang HTML qua các mốc `<script data-src="…">`, nên sửa tệp nguồn
rồi dựng lại là mọi màn đều cập nhật theo. Riêng `mo-hinh-du-lieu.html` còn nhồi
thêm `bang-du-lieu.js` (~3,6 MB dữ liệu bảng) — tệp đó không để trong repo này.

## Giới hạn dữ liệu cần biết trước khi đọc số

- **Giá trị tồn kho là ƯỚC TÍNH.** SAP trả `current_stock_value = 0` ở toàn bộ
  12.626 dòng tồn, nên con số tiền được suy ra từ đơn giá bình quân từng mã.
- **KPI-152 và KPI-100 để trống** — công thức chính thức chia cho giá vốn hàng
  bán, Khối chưa có số này từ Kế toán.
- **Dữ liệu đứng yên tại 16/09/2026**, trích thủ công một lần. Màn Vận hành phục
  vụ nhịp ngày nhưng số liệu là ảnh chụp — màn đó có băng cảnh báo riêng.
- Phạm vi chỉ gồm **20 kho do Khối quản lý** (11 Kho Thành Phẩm + 9 Kho Vật Tư),
  đã loại trại nuôi, kho nguyên liệu, nhiên liệu, phụ phẩm, kho xưởng, ký gửi.
