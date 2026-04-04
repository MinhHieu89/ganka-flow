# Cashier — Xử lý thanh toán & Hành động — Functional Specification

**Module:** Cashier (Thu ngân)
**Version:** 1.0
**Last updated:** 2026-04-04

---

## Mục lục

1. Xử lý thanh toán (full page)
2. Xác nhận thành công + Biên lai
3. Chốt ca
4. Xem hóa đơn (modal)
5. Hoàn tiền (modal)
6. Trả lại hàng đợi (modal)
7. Xem chi tiết chờ thanh toán (modal)
8. Thay đổi so với CONFIRMATION gốc
9. Data Model tóm tắt

---

## 1. Xử lý thanh toán

**Route:** `/cashier/payment/:payment_request_id`
**Dạng:** Full page (thay thế dashboard)
**Trigger:** Thu ngân click "Thanh toán" từ hàng đợi trên dashboard

### 1.1 Cấu trúc trang

```
┌──────────────────────────────────────────────────┐
│ ← Quay lại    Xử lý thanh toán    HĐ mới 15:48  │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─ CỘT TRÁI (60%) ──┐  ┌─ CỘT PHẢI (40%) ──┐ │
│  │ Thông tin BN       │  │ Tổng hợp thanh toán│ │
│  │ Line items (group) │  │ Phương thức TT     │ │
│  │ Giảm giá           │  │ Nút hành động      │ │
│  └────────────────────┘  └────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

Layout 2 cột, cột phải sticky khi cuộn.

### 1.2 Header

| Thành phần | Mô tả |
|---|---|
| Nút quay lại (←) | Quay về dashboard. Nếu đã nhập dữ liệu → confirm dialog "Hủy thanh toán?" |
| Tiêu đề | "Xử lý thanh toán" — h1, 20px |
| Metadata | "Hóa đơn mới · Hôm nay {HH:mm}" — 13px, color secondary, align right |

### 1.3 Cột trái — Chi tiết hóa đơn

#### 1.3.1 Thanh thông tin bệnh nhân

| Field | Mô tả |
|---|---|
| Họ tên | Font-weight 500, 15px |
| Metadata | Mã BN · Giới tính · Tuổi — 12px, color secondary |
| SĐT | Align right, 13px, color secondary |

Background secondary, border-radius lg, padding 14px 18px.

#### 1.3.2 Line items

Items được nhóm theo phân hệ (Khám, Thuốc, Kính, Liệu trình). Mỗi nhóm gồm:

**Group header:** Badge màu tương ứng (cùng hệ màu với dashboard)

| Badge | Nền | Chữ |
|---|---|---|
| Khám | `#E6F1FB` | `#0C447C` |
| Thuốc | `#E1F5EE` | `#085041` |
| Kính | `#EEEDFE` | `#3C3489` |
| Liệu trình | `#FAEEDA` | `#633806` |

**Line item row:** Tên dịch vụ/sản phẩm + số lượng (nếu > 1) | Thành tiền (align right, font-weight 500)

**Group subtotal:** Dòng tổng phụ nhóm, border-top dashed, font-size 12px, color secondary.

**Nguồn dữ liệu line items:**

| Phân hệ | Dữ liệu lấy từ | Ví dụ |
|---|---|---|
| Khám | `visit_services` (phí khám do BS tạo) | Phí khám chuyên khoa mắt |
| Thuốc | `prescriptions` + `pharmacy_orders` | Restasis 0.05% x2 |
| Kính | `optical_orders` | Gọng Essilor X + Tròng Hoya 1.67 |
| Liệu trình | `treatment_packages` | Gói IPL 6 buổi (Đợt 1 – 50%) |

**Trường hợp liệu trình chia đợt:** Line item hiển thị rõ đợt thanh toán. Ví dụ: "Gói IPL 6 buổi (Đợt 1 – 50%)" với giá = 50% tổng gói. Hệ thống không cho phép chỉnh sửa tỷ lệ đợt tại bước thanh toán.

#### 1.3.3 Giảm giá

Khu vực giảm giá nằm dưới line items, phân cách bằng border-top solid.

**Trạng thái mặc định:** Hiển thị nút "+ Thêm giảm giá" (text link, color info).

**Khi có giảm giá đã áp dụng:** Hiển thị dòng tóm tắt:

| Thành phần | Mô tả |
|---|---|
| Mô tả | "Giảm {n}% — {lý do}" hoặc "Giảm {số tiền}đ — {lý do}" |
| Người áp dụng | "Áp dụng bởi: {tên thu ngân}" — 11px, color tertiary |
| Số tiền giảm | Font-weight 500, color `#A32D2D` (red), prefix "-" |
| Nút Xóa | Text button "Xóa", click → xóa giảm giá |

**Form thêm giảm giá** (hiển thị khi click "+ Thêm giảm giá"):

| Field | Type | Mô tả |
|---|---|---|
| Loại | Select | "%" hoặc "VNĐ" |
| Giá trị | Number input | Số % (1–100) hoặc số tiền |
| Lý do | Text input | Bắt buộc nhập. Placeholder: "Nhập lý do giảm giá" |

Nút "Áp dụng" và "Hủy". Thu ngân tự áp dụng trực tiếp, không cần phê duyệt quản lý.

**Quy tắc giảm giá:**

- Giảm giá tính trên tổng tạm tính (tất cả line items)
- Chỉ cho phép 1 lần giảm giá trên 1 hóa đơn. Muốn thay đổi → xóa cái cũ, thêm cái mới
- Giảm giá % được làm tròn xuống đến hàng nghìn. Ví dụ: 10% của 1.105.000 = 110.500đ
- Giảm giá không được vượt quá tổng tạm tính
- Lý do giảm giá được lưu vào audit log

### 1.4 Cột phải — Thanh toán

#### 1.4.1 Tổng hợp thanh toán

Card background secondary, border-radius lg, padding 18px 20px.

| Dòng | Style | Ví dụ |
|---|---|---|
| Tạm tính ({n} items) | 14px, color secondary | 1.105.000đ |
| Giảm giá {n}% | 14px, color `#A32D2D` | -110.500đ |
| **Thành tiền** | **22px, font-weight 500, border-top** | **994.500đ** |

Dòng giảm giá chỉ hiển thị khi có giảm giá. Thành tiền cập nhật real-time khi thay đổi giảm giá.

#### 1.4.2 Phương thức thanh toán

**Tiêu đề section:** "Phương thức thanh toán" — 13px, font-weight 500, color secondary.

**Mỗi phương thức** là 1 card (border, border-radius md, padding 14px) gồm:

| Thành phần | Mô tả |
|---|---|
| Dropdown chọn phương thức | Các option: Tiền mặt, Chuyển khoản, QR VNPay, QR MoMo, QR ZaloPay, Thẻ Visa, Thẻ Mastercard |
| Input số tiền | Mặc định = thành tiền (nếu 1 phương thức). Nếu kết hợp → nhập thủ công |
| Nút xóa (✕) | Chỉ hiển thị từ phương thức thứ 2 trở đi |

**Khi chọn "Tiền mặt":** Hiển thị thêm khu vực chi tiết tiền mặt (border-top dashed):

| Field | Mô tả |
|---|---|
| Tiền nhận | Input số, thu ngân nhập số tiền BN đưa |
| Tiền thừa | Tự động tính = Tiền nhận - Số tiền phương thức. Font-size 16px, font-weight 500, color teal `#0F6E56` |

**Khi chọn QR/Thẻ/Chuyển khoản:** Không có field bổ sung. Thu ngân xác nhận thủ công sau khi BN đã thanh toán bên ngoài hệ thống.

**Kết hợp nhiều phương thức:**

- Click "+ Thêm phương thức thanh toán" → thêm card phương thức mới
- Tổng số tiền tất cả phương thức phải bằng thành tiền
- Nếu tổng chưa khớp → hiển thị cảnh báo và disable nút "Xác nhận thanh toán"
- Tối đa 3 phương thức kết hợp trong 1 hóa đơn

**Ghi chú hệ thống:** Box nhỏ dưới phương thức thanh toán: "Thu ngân xác nhận thủ công khi BN đã quét QR hoặc cà thẻ thành công bên ngoài hệ thống." — 12px, color secondary, background secondary.

#### 1.4.3 Nút hành động

3 nút nằm ngang, border-top phân cách:

| Nút | Style | Hành vi |
|---|---|---|
| Hủy | Outline default | Quay về dashboard, không lưu. Confirm dialog nếu đã nhập dữ liệu |
| In tạm | Outline secondary bg | Mở preview biên lai trước khi xác nhận (PDF hoặc print preview) |
| Xác nhận thanh toán | Primary (teal) | Hoàn tất giao dịch → chuyển sang trang xác nhận thành công |

**Điều kiện enable "Xác nhận thanh toán":**

- Có ít nhất 1 phương thức thanh toán được chọn
- Tổng số tiền các phương thức = thành tiền
- Nếu tiền mặt: tiền nhận ≥ số tiền phương thức

---

## 2. Xác nhận thành công + Biên lai

**Route:** `/cashier/payment/:payment_id/success`
**Dạng:** Full page, layout centered (max-width 520px)
**Trigger:** Sau khi click "Xác nhận thanh toán" thành công

### 2.1 Cấu trúc

```
┌────────────────────────┐
│      ✓ (icon xanh)     │
│  Thanh toán thành công  │
│  Giao dịch #GD-xxx...  │
│                        │
│  ┌──────────────────┐  │
│  │   BIÊN LAI       │  │
│  │   (receipt card)  │  │
│  │                  │  │
│  └──────────────────┘  │
│                        │
│  [In biên lai] [Về dashboard] │
└────────────────────────┘
```

### 2.2 Thành phần

| Thành phần | Mô tả |
|---|---|
| Icon thành công | Vòng tròn 56px, background teal 50 `#E1F5EE`, icon check teal 600 `#0F6E56` |
| Tiêu đề | "Thanh toán thành công" — 20px, font-weight 500, text-align center |
| Mô tả | "Giao dịch #{mã_gd} đã được ghi nhận" — 13px, color secondary, text-align center |

### 2.3 Biên lai (Receipt Card)

Card border, border-radius lg, padding 24px. Cấu trúc từ trên xuống:

**Header biên lai:**
- Tên PK: "Phòng khám mắt Ganka28" — 15px, font-weight 500, center
- Địa chỉ + hotline — 11px, color secondary, center
- Mã hóa đơn + ngày giờ — 12px, color secondary, center

**Thông tin BN** (grid 2 cột, border-bottom dashed):
- Bệnh nhân | Họ tên
- Mã BN | BN-YYYYMMDD-XXXX
- SĐT | 0912 345 678
- Thu ngân | Tên thu ngân

**Line items** (group theo phân hệ):
- Group label: uppercase, 11px, color secondary
- Item: tên + số lượng | giá

**Tổng hợp** (border-top dashed):
- Tạm tính | số tiền (color secondary)
- Giảm giá {n}% | -số tiền (color red, chỉ hiển thị khi có)
- Thành tiền | số tiền (17px, font-weight 500, border-top solid)

**Phương thức thanh toán** (border-top dashed):
- Phương thức | Tên phương thức
- Số tiền | Số tiền
- Tiền nhận | Số tiền (chỉ hiển thị khi tiền mặt)
- Tiền thừa | Số tiền (font-weight 500, color teal, chỉ hiển thị khi tiền mặt)

Nếu kết hợp nhiều phương thức → liệt kê từng phương thức + số tiền.

**Footer biên lai:**
- "Cảm ơn quý khách đã sử dụng dịch vụ tại Ganka28"
- Hotline + website

### 2.4 Nút hành động

| Nút | Style | Hành vi |
|---|---|---|
| In biên lai | Outline | Gọi window.print() hoặc API in |
| Về dashboard | Primary (teal) | Quay về `/dashboard` |

### 2.5 Mã giao dịch

Format: `GD-YYYYMMDD-XXX` (XXX = số thứ tự trong ngày, 3 chữ số, bắt đầu từ 001).

### 2.6 Auto-print

Sau khi xác nhận thanh toán thành công, hệ thống tự động trigger in biên lai (nếu có máy in kết nối). Trang success hiển thị để thu ngân có thể in lại nếu cần.

---

## 3. Chốt ca

**Route:** `/cashier/shift-close`
**Dạng:** Full page
**Trigger:** Click nút "Chốt ca" trên dashboard header

### 3.1 Cấu trúc trang

```
┌──────────────────────────────────────────────────┐
│ ← Quay lại    Chốt ca    Ca chiều · TN Linh     │
├──────────────────────────────────────────────────┤
│ [Tổng DT ca] [Tiền mặt HT] [Không tiền mặt]    │
├──────────────────────────────────────────────────┤
│  ┌─ CỘT TRÁI ────────┐  ┌─ CỘT PHẢI ────────┐ │
│  │ BD theo phương thức│  │ Đối soát tiền mặt  │ │
│  │ BD theo phân hệ    │  │ Ghi chú            │ │
│  │                    │  │ [In BC] [Xác nhận]  │ │
│  └────────────────────┘  └────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 3.2 Header

| Thành phần | Mô tả |
|---|---|
| Nút quay lại (←) | Quay về dashboard |
| Tiêu đề | "Chốt ca" — h1, 20px |
| Metadata | "Ca chiều · 13:00–20:00 · Thu ngân Linh" — 13px, color secondary |

### 3.3 Metric cards (3 cột)

| # | Label | Giá trị | Sub |
|---|---|---|---|
| 1 | Tổng doanh thu ca | Tổng tất cả giao dịch trong ca | "{n} giao dịch" |
| 2 | Tiền mặt (hệ thống) | Tổng thu tiền mặt theo hệ thống | "{n} giao dịch" |
| 3 | Không tiền mặt | Tổng thu qua CK/QR/thẻ | "{n} giao dịch" |

### 3.4 Cột trái — Breakdown

**Bảng 1: Breakdown theo phương thức thanh toán**

| Cột | Mô tả |
|---|---|
| Phương thức | Tên phương thức (Tiền mặt, Chuyển khoản, QR MoMo, QR VNPay, Thẻ Visa...) |
| Số GD | Số giao dịch sử dụng phương thức này |
| Số tiền | Tổng tiền, font-weight 500, align right |

Dòng cuối: **Tổng** (background secondary, font-weight 500).

Lưu ý: Nếu 1 giao dịch kết hợp nhiều phương thức, mỗi phương thức được tính riêng trong bảng này.

**Bảng 2: Breakdown theo phân hệ doanh thu**

| Cột | Mô tả |
|---|---|
| Phân hệ | Khám, Thuốc, Kính, Liệu trình |
| Số GD | Số giao dịch chứa items của phân hệ |
| Số tiền | Tổng doanh thu phân hệ |

Dòng cuối: **Tổng** (phải bằng tổng doanh thu ca).

### 3.5 Cột phải — Đối soát tiền mặt

Card border, border-radius lg, padding 20px.

**Tiêu đề:** "Đối soát tiền mặt" — 14px, font-weight 500.

**Thông tin hệ thống** (read-only rows):

| Dòng | Mô tả |
|---|---|
| Tiền đầu ca | Số tiền mặt ban đầu khi mở ca (do thu ngân nhập lúc mở ca) |
| Thu trong ca | Tổng tiền mặt thu được theo hệ thống |
| Tiền thừa trả khách | Tổng tiền thừa đã trả trong ca (số âm) |
| Tiền mặt kỳ vọng | = Tiền đầu ca + Thu trong ca - Tiền thừa trả khách |

**Input thực tế:**

| Field | Mô tả |
|---|---|
| Tiền mặt thực tế đếm được | Input số, height 40px, font-size 15px, font-weight 500, text-align right. Thu ngân đếm tiền mặt trong két và nhập vào |

**Kết quả chênh lệch** (auto-calculate):

| Trạng thái | Điều kiện | Style |
|---|---|---|
| Khớp | Chênh lệch = 0 | Background teal 50 `#E1F5EE`, text teal 800 `#085041` |
| Thừa | Thực tế > Kỳ vọng | Background amber 50 `#FAEEDA`, text amber 800 `#633806` |
| Thiếu | Thực tế < Kỳ vọng | Background red 50 `#FCEBEB`, text red 800 `#791F1F` |

Format: "{Khớp/Thừa/Thiếu} · Chênh lệch: {±số tiền}đ"

**Ghi chú:**

| Field | Mô tả |
|---|---|
| Ghi chú | Textarea, 60px height. Placeholder: "Ghi chú chênh lệch hoặc sự cố trong ca..." |

Bắt buộc nhập khi có chênh lệch ≠ 0.

**Nút hành động:**

| Nút | Style | Hành vi |
|---|---|---|
| In báo cáo ca | Outline | In/export báo cáo tổng hợp ca |
| Xác nhận chốt ca | Primary (teal) | Lưu kết quả chốt ca, khóa ca |

**Cảnh báo:** Box warning dưới nút: "Sau khi chốt ca, không thể thêm giao dịch mới vào ca này. Các giao dịch tiếp theo sẽ thuộc ca sau."

### 3.6 Quy tắc chốt ca

- Chỉ chốt được ca hiện tại hoặc ca vừa kết thúc (chưa chốt)
- Sau khi chốt: trạng thái ca chuyển sang "Đã chốt", header dashboard hiển thị "Ca chiều · Đã chốt {HH:mm}"
- Nếu vẫn còn BN trong hàng đợi chờ thanh toán → hiển thị cảnh báo: "Còn {n} bệnh nhân chờ thanh toán. Vui lòng xử lý trước khi chốt ca." và disable nút xác nhận
- Kết quả chốt ca lưu vào `shift_reconciliations` với snapshot tất cả breakdown

---

## 4. Xem hóa đơn

**Dạng:** Modal (max-width 480px)
**Trigger:** Click "Xem hóa đơn" từ tab Giao dịch hôm nay trên dashboard

### 4.1 Cấu trúc modal

**Header modal:**
- Mã hóa đơn: `#GD-YYYYMMDD-XXX` — 16px, font-weight 500
- Badge trạng thái bên cạnh (xem 4.2)
- Nút đóng (✕)

**Body:**
- Thông tin BN (grid 2 cột): Bệnh nhân, Mã BN, SĐT, Thời gian, Thu ngân
- Line items (group theo phân hệ, cùng format với biên lai)
- Tổng hợp: Tạm tính, Giảm giá (nếu có), Thành tiền
- Phương thức thanh toán

**Footer:** 2 nút

| Nút | Style | Hành vi |
|---|---|---|
| In lại | Outline | In lại biên lai |
| Hoàn tiền | Outline red | Mở modal Hoàn tiền (mục 5). Ẩn nếu GD đã hoàn |

### 4.2 Badge trạng thái

| Trạng thái | Background | Text |
|---|---|---|
| Đã thanh toán | `#E1F5EE` | `#085041` |
| Đã hoàn tiền | `#FCEBEB` | `#791F1F` |
| Hoàn một phần | `#FAEEDA` | `#633806` |

### 4.3 Giao dịch đã hoàn tiền

Khi GD đã hoàn (toàn bộ hoặc một phần):
- Hiển thị thêm section "Hoàn tiền" dưới phương thức thanh toán
- Liệt kê items đã hoàn + số tiền + lý do + thời gian hoàn + tên thu ngân thực hiện
- Nút "Hoàn tiền" ở footer: ẩn nếu đã hoàn toàn bộ, hiển thị nếu còn items chưa hoàn

---

## 5. Hoàn tiền

**Dạng:** Modal (max-width 460px)
**Trigger:** Click "Hoàn tiền" từ modal Xem hóa đơn hoặc từ three-dot menu trên dashboard

### 5.1 Cấu trúc modal

**Header:** "Hoàn tiền" — 16px, font-weight 500 + nút đóng.

**Body:**

**Thông tin hóa đơn gốc:** Box background secondary, font-size 12px. Hiển thị: Mã HĐ, Tên BN, Tổng tiền gốc.

**Chọn items cần hoàn:** Danh sách checkbox:

| Thành phần | Mô tả |
|---|---|
| Checkbox | Mỗi line item của hóa đơn gốc |
| Tên item | + số lượng nếu > 1 |
| Giá | Align right, font-weight 500 |

Items đã hoàn trước đó → disabled, hiển thị label "Đã hoàn".

**Tổng tiền hoàn:** Box background red 50 `#FCEBEB`, text red 800 `#791F1F`. Hiển thị: "Số tiền hoàn" | {tổng items đã check}. Auto-update khi thay đổi checkbox.

**Lý do hoàn tiền:**

| Field | Type | Mô tả |
|---|---|---|
| Lý do | Select | Options: Tính sai dịch vụ, BN hủy dịch vụ, Hủy liệu trình, Bảo hành, Khác |
| Hoàn qua | Select | Options: Phương thức gốc ({tên}), Tiền mặt, Chuyển khoản. Mặc định: phương thức gốc |
| Ghi chú | Textarea | Mô tả chi tiết lý do. Bắt buộc nhập |

**Footer:** 2 nút

| Nút | Style | Hành vi |
|---|---|---|
| Hủy | Outline | Đóng modal |
| Xác nhận hoàn tiền | Red solid (`#A32D2D`) | Thực hiện hoàn tiền ngay lập tức |

### 5.2 Quy tắc hoàn tiền

- Thu ngân thực hiện hoàn tiền trực tiếp, không cần phê duyệt quản lý
- Hỗ trợ hoàn một phần (chọn items cụ thể) hoặc hoàn toàn bộ
- Mỗi hóa đơn có thể hoàn nhiều lần (cho đến khi tất cả items đã hoàn)
- Giao dịch hoàn được ghi nhận riêng trong `refunds` table, liên kết `payment_id` gốc
- Hoàn tiền trừ vào doanh thu ca hiện tại (không phải ca gốc)
- Metric cards trên dashboard và báo cáo chốt ca phản ánh doanh thu sau hoàn
- Phải chọn ít nhất 1 item và nhập lý do + ghi chú trước khi xác nhận

### 5.3 Confirm dialog

Trước khi thực hiện, hiển thị confirm: "Xác nhận hoàn {số tiền}đ cho hóa đơn #{mã}? Hành động này không thể hoàn tác."

---

## 6. Trả lại hàng đợi

**Dạng:** Modal (max-width 420px)
**Trigger:** Click "Trả lại hàng đợi" từ three-dot menu trên tab Chờ thanh toán

### 6.1 Cấu trúc modal

**Header:** "Trả lại hàng đợi" — 16px, font-weight 500 + nút đóng.

**Body:**

**Thông tin BN:** Box background secondary. Hiển thị: Họ tên, Mã BN, Thời gian chờ.

**Lý do trả lại:** Radio group, mỗi option là 1 card (stacked, border connected):

| Option | Mô tả phụ |
|---|---|
| Đơn thuốc chưa đúng | Trả về bác sĩ để chỉnh sửa đơn thuốc |
| Đơn kính chưa đúng | Trả về trung tâm kính để chỉnh sửa |
| BN chưa sẵn sàng | BN yêu cầu chờ hoặc rời PK tạm thời |
| Khác | Nhập lý do ở ghi chú bên dưới |

Mỗi radio option hiển thị 2 dòng: dòng 1 = label chính (13px), dòng 2 = mô tả (11px, color secondary).

**Ghi chú:** Textarea, tùy chọn (bắt buộc khi chọn "Khác").

**Footer:** 2 nút

| Nút | Style | Hành vi |
|---|---|---|
| Hủy | Outline | Đóng modal |
| Xác nhận trả lại | Amber solid (bg `#FAEEDA`, text `#633806`) | Trả BN về bộ phận trước |

### 6.2 Quy tắc

- BN bị xóa khỏi hàng đợi thu ngân
- Hệ thống gửi notification tới bộ phận liên quan (BS nếu đơn thuốc sai, Trung tâm kính nếu đơn kính sai)
- Payment request chuyển trạng thái `returned` với lý do + ghi chú
- Khi bộ phận chỉnh sửa xong → BN tự động quay lại hàng đợi thu ngân

---

## 7. Xem chi tiết chờ thanh toán

**Dạng:** Modal (max-width 460px)
**Trigger:** Click "Xem chi tiết" từ three-dot menu trên tab Chờ thanh toán (dashboard)

### 7.1 Mục đích

Cho phép thu ngân xem trước danh sách line items của một payment request trước khi bắt đầu xử lý thanh toán. Đây là modal read-only, không chỉnh sửa.

### 7.2 Cấu trúc modal

**Header:** "Chi tiết chờ thanh toán" — 16px, font-weight 500 + nút đóng (✕).

**Body:**

**Thông tin bệnh nhân:** Box background secondary, border-radius md, padding 10px 14px. Hiển thị:

| Thành phần | Vị trí | Mô tả |
|---|---|---|
| Họ tên | Trái, dòng 1 | Font-weight 500, 14px |
| Mã BN · Giới tính · Tuổi | Trái, dòng 2 | 12px, color secondary |
| SĐT | Phải | 12px, color secondary |

**Line items:** Nhóm theo phân hệ, cùng format với trang Xử lý thanh toán:

- Group header: Badge màu (Khám, Thuốc, Kính, Liệu trình)
- Item row: Tên dịch vụ/sản phẩm + số lượng | Giá (font-weight 500, align right)
- Group subtotal: Dòng tổng phụ, border-top dashed, 12px, color secondary

**Trường hợp liệu trình chia đợt:** Hiển thị rõ đợt, ví dụ: "Gói IPL 6 buổi (Đợt 1 – 50%)"

**Tổng tạm tính:** Border-top solid phân cách. Font-size 17px, font-weight 500.

**Metadata nguồn:** Dòng cuối cùng, hiển thị thông tin ngữ cảnh:

| Thành phần | Mô tả |
|---|---|
| Icon | Clock icon (14px), color secondary |
| Text | "Chờ từ {HH:mm} · BS {tên bác sĩ} · {Lần khám mới / Tái khám}" — 12px, color secondary |

Thông tin này giúp thu ngân biết BN đến từ đâu, BS nào chỉ định, và đã chờ bao lâu.

**Footer:** 2 nút

| Nút | Style | Hành vi |
|---|---|---|
| Đóng | Outline | Đóng modal |
| Thanh toán | Primary (teal) | Đóng modal → mở trang Xử lý thanh toán (section 1) cho BN này |

### 7.3 Quy tắc

- Modal hoàn toàn read-only, không cho phép chỉnh sửa line items
- Nếu line items thay đổi sau khi mở modal (ví dụ: BS chỉnh đơn thuốc), modal không tự cập nhật. Thu ngân cần đóng và mở lại
- Nút "Thanh toán" thực hiện cùng hành vi như action "Thanh toán" trong three-dot menu: navigate tới `/cashier/payment/:payment_request_id`
- Tổng tạm tính ở modal này là trước giảm giá (giảm giá chỉ áp dụng ở bước xử lý thanh toán)

---

## 8. Thay đổi so với CONFIRMATION gốc

Các quy tắc sau đã được điều chỉnh trong quá trình thiết kế:

| Nội dung | CONFIRMATION gốc | Thiết kế hiện tại | Lý do |
|---|---|---|---|
| Giảm giá thủ công | Cần quản lý phê duyệt (CONF_4) | Thu ngân tự áp dụng | Giảm friction, PK quy mô nhỏ |
| Hoàn tiền | Chỉ quản lý phê duyệt (CONF_4) | Thu ngân tự thực hiện | Giảm friction, PK quy mô nhỏ |
| Giảm giá VIP tự động | Có (CONF_2) | Bỏ khỏi flow thanh toán | Defer, sẽ thiết kế riêng khi làm module VIP |
| Dạng màn hình thanh toán | — | Full page (không phải modal) | Cần không gian rộng cho line items + payment |

---

## 9. Data Model tóm tắt

### 9.1 Bảng chính

| Bảng | Mô tả |
|---|---|
| `payment_requests` | Hàng đợi chờ thanh toán. Fields: id, visit_id, patient_id, status (pending/processing/completed/returned), items_json, total_estimated, created_at, created_by_module |
| `payments` | Giao dịch đã hoàn thành. Fields: id, payment_request_id, visit_id, patient_id, subtotal, discount_amount, discount_percent, discount_reason, discount_by, total, cashier_id, shift_id, created_at |
| `payment_items` | Line items trong hóa đơn. Fields: id, payment_id, item_type (exam/medication/optical/treatment), item_ref_id, description, quantity, unit_price, line_total, revenue_category |
| `payment_methods` | Phương thức thanh toán (1 payment có thể nhiều methods). Fields: id, payment_id, method_type, amount, cash_received, cash_change |
| `refunds` | Giao dịch hoàn tiền. Fields: id, payment_id, refund_items_json, refund_amount, reason_code, reason_note, refund_method, cashier_id, created_at |
| `shifts` | Ca làm việc. Fields: id, cashier_id, shift_type, start_time, end_time, opening_cash, status (open/closed) |
| `shift_reconciliations` | Kết quả chốt ca. Fields: id, shift_id, total_revenue, cash_expected, cash_actual, cash_difference, breakdown_json, note, closed_at |

### 9.2 Mã tự sinh

| Mã | Format | Ví dụ |
|---|---|---|
| Mã giao dịch | `GD-YYYYMMDD-XXX` | GD-20260405-012 |
| Mã hoàn tiền | `HT-YYYYMMDD-XXX` | HT-20260405-003 |
| Mã ca | `CA-YYYYMMDD-{S/C}` | CA-20260405-C (ca chiều) |
