# Cashier Dashboard — Functional Specification

**Module:** Cashier (Thu ngân)
**Route:** `/dashboard` (role = Cashier)
**Version:** 1.0
**Last updated:** 2026-04-04

---

## 1. Tổng quan

Dashboard chính cho vai trò Thu ngân. Màn hình này là điểm làm việc trung tâm của thu ngân trong suốt ca làm việc, cho phép:

- Theo dõi tổng quan doanh thu và số giao dịch trong ngày
- Quản lý hàng đợi bệnh nhân chờ thanh toán
- Xem lại lịch sử giao dịch đã hoàn thành
- Truy cập nhanh vào chức năng chốt ca

**Vai trò truy cập:** Cashier (role riêng, tách biệt với Reception)

---

## 2. Cấu trúc trang

```
┌─────────────────────────────────────────────────────┐
│ HEADER                                              │
│ Tiêu đề + Ngày | Thông tin ca + Nút [Chốt ca]      │
├─────────────────────────────────────────────────────┤
│ METRIC CARDS (4 thẻ)                                │
│ [Doanh thu] [Tiền mặt] [CK/QR] [Thẻ]              │
├─────────────────────────────────────────────────────┤
│ TABS                                                │
│ [Chờ thanh toán (n)] | [Giao dịch hôm nay (n)]     │
├─────────────────────────────────────────────────────┤
│ TABLE CONTENT (theo tab đang active)                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Header

### 3.1 Phần trái

| Thành phần | Mô tả |
|---|---|
| Tiêu đề trang | "Thu ngân" — `h1`, 20px, font-weight 500 |
| Ngày hiện tại | Hiển thị đầy đủ: "Thứ Bảy, 05/04/2026" — 13px, color secondary |

### 3.2 Phần phải

| Thành phần | Mô tả |
|---|---|
| Thông tin ca | Badge dạng pill: chấm xanh + text "Ca chiều · 13:00–20:00". Background secondary, font-size 12px |
| Nút Chốt ca | Button outline. Chỉ hiển thị khi đang trong ca hoặc ca vừa kết thúc. Click → mở màn hình Chốt ca |

### 3.3 Logic hiển thị ca

Hệ thống xác định ca hiện tại dựa trên giờ đăng nhập và cấu hình ca làm việc từ Admin. Nếu thu ngân chưa mở ca, hiển thị nút **"Mở ca"** thay vì thông tin ca.

**Trạng thái ca:**

| Trạng thái | Hiển thị | Nút |
|---|---|---|
| Chưa mở ca | "Chưa mở ca" (text warning) | [Mở ca] |
| Đang trong ca | "Ca chiều · 13:00–20:00" (chấm xanh) | [Chốt ca] |
| Ca đã chốt | "Ca chiều · Đã chốt 20:15" (chấm xám) | — |

---

## 4. Metric Cards

Hiển thị dưới dạng grid 4 cột, gap 12px. Mỗi thẻ có background secondary, border-radius md, padding 14px 16px.

### 4.1 Danh sách thẻ

| # | Label | Giá trị | Sub-text |
|---|---|---|---|
| 1 | Doanh thu hôm nay | Tổng doanh thu tất cả giao dịch đã thanh toán trong ngày | "{n} giao dịch" |
| 2 | Tiền mặt | Tổng thu bằng tiền mặt | "{n} giao dịch" |
| 3 | Chuyển khoản / QR | Tổng thu bằng chuyển khoản + QR code (VNPay, MoMo, ZaloPay) | "{n} giao dịch" |
| 4 | Thẻ | Tổng thu bằng thẻ Visa/Mastercard | "{n} giao dịch" |

### 4.2 Quy tắc

- Giá trị hiển thị định dạng tiền Việt: `18.450.000đ` (dấu chấm phân cách hàng nghìn, hậu tố "đ")
- Metric cards chỉ tính các giao dịch **đã thanh toán thành công** (không tính đang chờ hoặc đã hoàn)
- Dữ liệu phạm vi: toàn bộ ngày hiện tại (00:00–23:59), không phân biệt ca
- Cập nhật real-time khi có giao dịch mới hoàn thành
- Nếu ca chưa có giao dịch nào: hiển thị `0đ` và `0 giao dịch`

---

## 5. Tab: Chờ thanh toán

### 5.1 Mô tả

Danh sách bệnh nhân đang chờ thu ngân xử lý thanh toán. Bệnh nhân xuất hiện trong hàng đợi này khi một bộ phận khác hoàn tất công việc và chuyển BN sang trạng thái chờ thanh toán.

### 5.2 Legend

Hiển thị dòng legend phía trên bảng với 4 badge màu để giải thích ý nghĩa:

| Badge | Màu nền | Màu chữ | Ý nghĩa |
|---|---|---|---|
| Khám | `#E6F1FB` | `#0C447C` | Phí khám bệnh |
| Thuốc | `#E1F5EE` | `#085041` | Thuốc theo đơn / thuốc mua lẻ |
| Kính | `#EEEDFE` | `#3C3489` | Gọng, tròng, combo kính |
| Liệu trình | `#FAEEDA` | `#633806` | Gói IPL, LLLT, chăm sóc mi |

### 5.3 Cấu trúc bảng

| Cột | Width | Mô tả |
|---|---|---|
| STT | 36px | Số thứ tự trong hàng đợi, tính từ 1. Sắp xếp theo thời gian vào hàng đợi (FIFO) |
| Bệnh nhân | auto | **Dòng 1:** Họ tên — font-weight 500, 13px. **Dòng 2:** Mã BN (`BN-YYYYMMDD-XXXX`) — 11px, color secondary |
| SĐT | auto | Số điện thoại, định dạng `0912 345 678` (có khoảng trắng). Font-size 12px, color secondary |
| Loại thanh toán | auto | Một hoặc nhiều badge màu tương ứng với các phân hệ có item chờ thanh toán |
| Tạm tính | auto, right-align | Tổng tạm tính trước giảm giá. Font-weight 500. Định dạng tiền Việt |
| Chờ | auto | Thời gian chờ tính từ lúc BN vào hàng đợi. Format: "{n} phút". Nếu ≥ 10 phút → đổi màu đỏ (`#A32D2D`) |
| Actions | 48px | Icon three-dot menu |

### 5.4 Nguồn dữ liệu — Khi nào BN xuất hiện trong hàng đợi?

Một bệnh nhân có thể xuất hiện **nhiều lần** trong hàng đợi trong cùng một lần khám (visit), do mô hình nhiều payment events:

| Trigger | Loại badge | Mô tả |
|---|---|---|
| Bác sĩ hoàn tất khám + kê đơn | Khám + Thuốc | BS click "Hoàn tất" trong EMR → hệ thống tạo payment request gộp phí khám + thuốc kê đơn |
| Trung tâm kính hoàn tất đơn kính | Kính | Nhân viên kính xác nhận đơn kính (gọng + tròng + giá) → tạo payment request |
| BS chỉ định liệu trình mới | Liệu trình | BS tạo gói liệu trình → tạo payment request |
| Liệu trình đến kỳ thanh toán đợt 2 | Liệu trình | Hệ thống tự động tạo payment request khi BN đến buổi giữa liệu trình |
| Khách vãng lai mua thuốc | Thuốc | Nhân viên nhà thuốc tạo đơn bán lẻ → tạo payment request |

### 5.5 Quy tắc sắp xếp

Mặc định sắp xếp theo FIFO (BN chờ lâu nhất ở trên). Không hỗ trợ sắp xếp thủ công ở v1.

### 5.6 Empty state

Khi không có BN chờ thanh toán, hiển thị message ở giữa bảng: "Không có bệnh nhân chờ thanh toán" — 13px, color secondary, padding 48px.

---

## 6. Tab: Giao dịch hôm nay

### 6.1 Mô tả

Lịch sử tất cả giao dịch đã hoàn thành trong ngày, sắp xếp theo thời gian mới nhất trước (DESC).

### 6.2 Cấu trúc bảng

| Cột | Width | Mô tả |
|---|---|---|
| STT | 36px | Số thứ tự giao dịch trong ngày (tính tăng dần theo thời gian) |
| Bệnh nhân | auto | **Dòng 1:** Họ tên. **Dòng 2:** Mã BN |
| SĐT | auto | Số điện thoại, cùng format với tab Chờ thanh toán |
| Loại | auto | Badge(s) loại thanh toán |
| Phương thức | auto | Phương thức thanh toán đã sử dụng. Font-size 12px, color secondary |
| Thành tiền | auto, right-align | Số tiền thực thu (sau giảm giá). Font-weight 500 |
| Giờ | auto | Giờ hoàn tất giao dịch, format `HH:mm`. Font-size 12px, color secondary |
| Trạng thái | auto | Trạng thái giao dịch (xem 6.3) |
| Actions | 48px | Icon three-dot menu |

### 6.3 Trạng thái giao dịch

| Trạng thái | Màu | Mô tả |
|---|---|---|
| Đã thanh toán | `#0F6E56` (teal 600) | Giao dịch hoàn thành, đã thu tiền |
| Đã hoàn tiền | `#A32D2D` (red 600) | Giao dịch đã được hoàn tiền (sau khi quản lý phê duyệt) |
| Chờ hoàn tiền | `#854F0B` (amber 600) | Yêu cầu hoàn tiền đang chờ quản lý phê duyệt |

### 6.4 Giá trị cột Phương thức

| Giá trị hiển thị | Mô tả |
|---|---|
| Tiền mặt | Thanh toán bằng tiền mặt |
| Chuyển khoản | Chuyển khoản ngân hàng |
| QR VNPay | Quét QR qua VNPay |
| QR MoMo | Quét QR qua MoMo |
| QR ZaloPay | Quét QR qua ZaloPay |
| Thẻ Visa | Thanh toán thẻ Visa |
| Thẻ Mastercard | Thanh toán thẻ Mastercard |
| Kết hợp | Thanh toán bằng nhiều phương thức (xem chi tiết trong hóa đơn) |

---

## 7. Row Actions — Three-dot Menu

### 7.1 Tab "Chờ thanh toán"

| # | Label | Icon | Mô tả |
|---|---|---|---|
| 1 | Thanh toán | ➕ (rect + plus) | Mở màn hình xử lý thanh toán cho BN này. **Action chính.** |
| 2 | Xem chi tiết | 🕐 (circle + clock) | Mở popup/panel xem chi tiết các line items chờ thanh toán mà không bắt đầu xử lý |
| — | *separator* | | |
| 3 | Trả lại hàng đợi | ✕ (X mark) | Trả BN về bộ phận trước đó (ví dụ: nếu đơn kính chưa đúng, cần quay lại trung tâm kính chỉnh sửa). Yêu cầu chọn lý do |

**Lý do "Trả lại hàng đợi":**

| Lý do | Mô tả |
|---|---|
| Đơn thuốc chưa đúng | Trả về BS để chỉnh sửa đơn thuốc |
| Đơn kính chưa đúng | Trả về trung tâm kính để chỉnh sửa |
| BN chưa sẵn sàng | BN yêu cầu chờ hoặc rời PK tạm thời |
| Khác | Nhập lý do tự do |

### 7.2 Tab "Giao dịch hôm nay"

| # | Label | Icon | Mô tả |
|---|---|---|---|
| 1 | Xem hóa đơn | 🕐 (circle + clock) | Mở chi tiết hóa đơn đầy đủ (line items, giảm giá, phương thức thanh toán) |
| 2 | In lại | 🖨 (printer) | In lại biên lai/hóa đơn |
| — | *separator* | | |
| 3 | Yêu cầu hoàn tiền | ➕ (plus) | Tạo yêu cầu hoàn tiền → gửi phê duyệt cho quản lý/chủ PK. Thu ngân KHÔNG tự thực hiện hoàn tiền |

**Quy tắc hoàn tiền:**

- Thu ngân chỉ được **tạo yêu cầu**, không được tự phê duyệt
- Yêu cầu hoàn tiền gửi tới quản lý/chủ PK qua notification
- Khi quản lý phê duyệt → trạng thái giao dịch chuyển thành "Đã hoàn tiền"
- Khi quản lý từ chối → trạng thái giữ nguyên "Đã thanh toán", thu ngân nhận notification từ chối
- Giao dịch đã hoàn tiền: ẩn action "Yêu cầu hoàn tiền", chỉ giữ "Xem hóa đơn" và "In lại"
- Giao dịch đang chờ hoàn tiền: ẩn action "Yêu cầu hoàn tiền", hiển thị thêm "Hủy yêu cầu hoàn tiền"

---

## 8. Mô hình thanh toán — Nhiều payment events trong 1 visit

### 8.1 Nguyên tắc

Mỗi lần khám (visit) của bệnh nhân có thể phát sinh **nhiều hóa đơn** (payment events) tại các thời điểm khác nhau. Mỗi hóa đơn gộp tất cả line items có sẵn tại thời điểm thanh toán.

### 8.2 Ví dụ luồng điển hình

```
Visit BN-20260405-0008 (Nguyễn Thị Mai)
│
├── Payment Event #1 (sau khám BS)
│   ├── Phí khám: 300.000đ (phân hệ: HIS)
│   ├── Thuốc nhỏ mắt A: 150.000đ (phân hệ: Nhà thuốc)
│   └── Thuốc nhỏ mắt B: 200.000đ (phân hệ: Nhà thuốc)
│   → Tổng hóa đơn #1: 650.000đ
│
├── (BN đi chọn kính tại trung tâm kính)
│
└── Payment Event #2 (sau tư vấn kính)
    ├── Gọng Essilor Model X: 1.500.000đ (phân hệ: Trung tâm kính)
    └── Tròng Hoya 1.67: 2.000.000đ (phân hệ: Trung tâm kính)
    → Tổng hóa đơn #2: 3.500.000đ
```

### 8.3 Quy tắc

- Mỗi payment event tạo một bản ghi `payment` riêng trong database
- Tất cả payment events trong cùng 1 visit liên kết qua `visit_id`
- Hệ thống track doanh thu nội bộ theo `revenue_category`: HIS, Nhà thuốc, Trung tâm kính, Liệu trình
- Trong hàng đợi: cùng 1 BN có thể xuất hiện ở nhiều dòng khác nhau nếu có nhiều payment events chưa thanh toán
- Trong lịch sử giao dịch: mỗi payment event hiển thị là 1 dòng riêng

---

## 9. Thanh toán liệu trình — Chia đợt

### 9.1 Toàn bộ trước buổi đầu

BN thanh toán 100% giá gói trước khi bắt đầu liệu trình. Tạo 1 payment event duy nhất.

### 9.2 Chia 2 đợt (50/50)

| Đợt | Thời điểm | Số tiền |
|---|---|---|
| Đợt 1 | Trước buổi đầu tiên | 50% giá gói |
| Đợt 2 | Trước buổi giữa liệu trình | 50% còn lại |

**Quy tắc buổi giữa:**

| Tổng số buổi | Đợt 2 trước buổi | Ví dụ |
|---|---|---|
| 3 buổi | Buổi 2 | Gói 3 buổi → đợt 2 thanh toán trước buổi 2 |
| 4 buổi | Buổi 3 | Gói 4 buổi → đợt 2 thanh toán trước buổi 3 |
| 5 buổi | Buổi 3 | Gói 5 buổi → đợt 2 thanh toán trước buổi 3 |
| 6 buổi | Buổi 4 | Gói 6 buổi → đợt 2 thanh toán trước buổi 4 |

**Công thức:** `buổi_giữa = ceil(tổng_buổi / 2) + 1`

Khi BN đến buổi giữa mà chưa thanh toán đợt 2, hệ thống tự động tạo payment request trong hàng đợi thu ngân.

---

## 10. Giảm giá

### 10.1 VIP tự động

Hệ thống tự động áp dụng giảm giá VIP tại bước xử lý thanh toán (không hiển thị trên dashboard). Quy tắc VIP theo CONFIRMATION_2:

| Loại | Giảm giá |
|---|---|
| Phí khám tái khám | 10% |
| Phí dịch vụ (cấu hình theo nhóm) | 5–7% |
| Người thân VIP (tối đa 2 người) | 10% phí khám |

**Không áp dụng cho:** Thuốc kê đơn, sản phẩm giá cố định.

### 10.2 Giảm giá thủ công

Thu ngân có thể nhập giảm giá thủ công nhưng **bắt buộc cần quản lý phê duyệt**. Quy trình:

1. Thu ngân nhập % hoặc số tiền giảm + lý do
2. Hệ thống gửi yêu cầu phê duyệt tới quản lý
3. Quản lý phê duyệt → giảm giá được áp dụng vào hóa đơn
4. Quản lý từ chối → thu ngân nhận thông báo, hóa đơn không giảm

---

## 11. Chốt ca

Nút "Chốt ca" ở header mở màn hình riêng (spec sẽ viết riêng). Tóm tắt chức năng:

- Tổng hợp tất cả giao dịch trong ca
- Breakdown theo phương thức thanh toán
- Thu ngân nhập số tiền mặt thực tế đếm được
- Hệ thống tính chênh lệch (thừa/thiếu)
- Lưu kết quả chốt ca, có thể in báo cáo ca

---

## 12. Quy tắc chung

### 12.1 Refresh & real-time

- Hàng đợi "Chờ thanh toán" cập nhật real-time (polling 10s hoặc WebSocket)
- Metric cards cập nhật mỗi khi có giao dịch hoàn thành
- Tab "Giao dịch hôm nay" cập nhật khi thu ngân chuyển tab

### 12.2 Định dạng tiền

- Sử dụng dấu chấm phân cách hàng nghìn: `1.500.000đ`
- Hậu tố "đ" (không khoảng trắng)
- Không hiển thị số thập phân

### 12.3 Định dạng SĐT

- Hiển thị có khoảng trắng: `0912 345 678`
- Format: `XXXX XXX XXX` (4-3-3)

### 12.4 Thời gian chờ

- Tính từ timestamp BN vào hàng đợi
- Cập nhật mỗi phút
- Format: "{n} phút"
- Ngưỡng cảnh báo: ≥ 10 phút → text đổi màu đỏ `#A32D2D`

### 12.5 Hover & interaction

- Table rows: hover background secondary
- Three-dot button: hover background secondary
- Dropdown menu: xuất hiện phía dưới-phải icon, click outside đóng menu
- Chỉ 1 dropdown mở tại một thời điểm

---

## 13. Responsive

| Breakpoint | Hành vi |
|---|---|
| ≥ 1280px | Hiển thị đầy đủ như mockup |
| 1024–1279px | Metric cards giữ 4 cột, bảng cho phép horizontal scroll |
| 768–1023px | Metric cards chuyển 2×2 grid, bảng horizontal scroll |
| < 768px | Metric cards stack 1 cột, bảng horizontal scroll với cột cố định (Bệnh nhân) |

---

## 14. Permissions

| Action | Cashier | Admin/Manager |
|---|---|---|
| Xem dashboard | ✅ | ✅ |
| Xử lý thanh toán | ✅ | ✅ |
| Trả BN lại hàng đợi | ✅ | ✅ |
| In lại hóa đơn | ✅ | ✅ |
| Tạo yêu cầu hoàn tiền | ✅ | ✅ |
| Phê duyệt hoàn tiền | ❌ | ✅ |
| Áp dụng giảm giá thủ công | Yêu cầu → chờ duyệt | ✅ Tự phê duyệt |
| Chốt ca | ✅ (ca của mình) | ✅ (tất cả các ca) |
| Xem doanh thu ngày khác | ❌ | ✅ |

---

## 15. Data Dependencies

### 15.1 Bảng cần đọc

| Bảng | Mục đích |
|---|---|
| `payments` | Danh sách giao dịch, trạng thái, phương thức thanh toán |
| `payment_items` | Line items chi tiết trong mỗi hóa đơn |
| `payment_requests` | Hàng đợi chờ thanh toán (trigger từ các bộ phận khác) |
| `patients` | Thông tin BN: họ tên, mã BN, SĐT |
| `visits` | Liên kết payment events với lần khám |
| `vip_members` | Trạng thái VIP của BN (dùng ở bước xử lý thanh toán) |
| `shifts` | Thông tin ca làm việc |

### 15.2 Bảng cần ghi

| Bảng | Mục đích |
|---|---|
| `payments` | Tạo bản ghi thanh toán khi hoàn tất |
| `payment_requests` | Cập nhật trạng thái (đã xử lý / trả lại) |
| `refund_requests` | Tạo yêu cầu hoàn tiền |
| `shift_reconciliations` | Lưu kết quả chốt ca |

---

## 16. Màn hình liên quan

| Màn hình | Trạng thái | Mô tả |
|---|---|---|
| Xử lý thanh toán | Chưa thiết kế | Màn hình chi tiết khi click "Thanh toán" từ hàng đợi |
| Chốt ca | Chưa thiết kế | Đối soát cuối ca |
| Chi tiết hóa đơn | Chưa thiết kế | Popup/panel xem lại hóa đơn đã thanh toán |
