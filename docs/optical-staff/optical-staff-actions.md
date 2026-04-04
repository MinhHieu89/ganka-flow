# Optical Staff — Action Screens Specification

**Module:** Trung tâm kính (Optical Center)
**Role:** Optical Staff (Nhân viên kính)
**Parent spec:** `optical-staff-dashboard.md`
**Version:** 1.0
**Ngày tạo:** 2026-04-04

---

## 1. Xem đơn kính bác sĩ

### 1.1. Trigger

Nhấn "Xem đơn kính BS" từ three-dot menu tại tab Tư vấn kính (cả trạng thái `waiting_consultation` và `in_consultation`).

### 1.2. Dạng hiển thị

Popup modal, max-width 560px, có overlay nền tối.

### 1.3. Header

| Thành phần | Mô tả |
|---|---|
| Tiêu đề | "Đơn kính bác sĩ" |
| Nút đóng | Icon `x` góc phải |

### 1.4. Thông tin bệnh nhân

Hiển thị ngay dưới header:

| Thành phần | Mô tả |
|---|---|
| Avatar | Hình tròn 40px, background info, hiển thị 2 ký tự viết tắt tên |
| Tên BN | Font-weight 500, font-size 14px |
| Dòng phụ | Mã BN + Giới tính + Tuổi, font-size 12px, secondary color |

### 1.5. Bảng thông số khúc xạ

Bảng 6 cột, 2 dòng (OD / OS):

| Cột | Mô tả |
|---|---|
| (trống) | Label mắt: "OD (mắt phải)" / "OS (mắt trái)", font-weight 500 |
| SPH | Giá trị cầu, format số thập phân có dấu (+/-) |
| CYL | Giá trị trụ |
| AXIS | Giá trị trục (số nguyên 0–180) |
| ADD | Giá trị cộng thêm, hiển thị "—" nếu không có |
| PD | Khoảng cách đồng tử, rowspan 2 dòng, hiển thị ở giữa, font-weight 500 |

### 1.6. Bảng thị lực

Bảng 3 cột, 2 dòng (OD / OS):

| Cột | Mô tả |
|---|---|
| (trống) | Label mắt |
| Không kính (UCVA) | Giá trị thị lực không kính, format Snellen (20/XX) |
| Có kính (BCVA) | Giá trị thị lực có kính |

### 1.7. Thông tin chỉ định

Danh sách key-value dạng info-row:

| Field | Mô tả |
|---|---|
| Loại kính | Kính cận / Kính lão / Kính đa tròng / Kính mát có độ |
| Mục đích sử dụng | Đeo thường xuyên / Đọc sách / Lái xe / Văn phòng... |
| BS chỉ định | Tên bác sĩ, prefix "BS." |
| Ngày kê | Format DD/MM/YYYY, HH:mm |

### 1.8. Ghi chú bác sĩ

Block text trên nền secondary, border-radius, font-size 13px. Hiển thị nội dung ghi chú từ bác sĩ khi kê đơn kính. Ẩn block nếu không có ghi chú.

### 1.9. Footer actions

| Nút | Loại | Mô tả |
|---|---|---|
| Đóng | Secondary | Đóng popup |
| Tạo đơn kính | Primary | Đóng popup, mở form "Tạo đơn kính" (xem section 2). Chỉ hiển thị khi BN đang ở trạng thái `in_consultation` (đã nhận BN). |

---

## 2. Tạo đơn kính

### 2.1. Trigger

- Nhấn "Tạo đơn kính" từ three-dot menu tại tab Tư vấn kính (trạng thái `in_consultation`).
- Nhấn "Tạo đơn kính" từ footer popup "Xem đơn kính bác sĩ".

### 2.2. Dạng hiển thị

Popup modal, max-width 640px, có overlay nền tối.

### 2.3. Header

Tiêu đề: "Tạo đơn kính — {Tên BN}". Nút đóng `x` góc phải.

### 2.4. Tóm tắt Rx

Block nền secondary ngay dưới header, font-size 12px, hiển thị tóm tắt 1 dòng:

```
Rx: OD {SPH} / {CYL} x {AXIS} | OS {SPH} / {CYL} x {AXIS} | PD {PD}
```

Mục đích: nhân viên kính luôn nhìn thấy Rx khi chọn sản phẩm, không cần quay lại popup trước.

### 2.5. Chọn gọng kính

#### Trạng thái ban đầu (chưa chọn)

Hiển thị ô search input:

| Thành phần | Mô tả |
|---|---|
| Input | Placeholder: "Tìm gọng theo tên, thương hiệu, barcode..." |
| Dropdown kết quả | Hiển thị khi user gõ ký tự, ẩn khi input rỗng hoặc click ngoài |

#### Dropdown kết quả search

Mỗi item trong dropdown gồm 3 dòng:

| Dòng | Nội dung | Style |
|---|---|---|
| Tên gọng | Tên model, ví dụ "Rayban RB5228" | Font-weight 500, font-size 13px |
| Mô tả | Màu sắc + Barcode + Tồn kho | Font-size 12px, secondary color |
| Giá bán | Format số có dấu chấm ngăn hàng nghìn | Font-size 12px, font-weight 500 |

Search logic: tìm trên tên gọng, thương hiệu, barcode. Case-insensitive, diacritics-insensitive. Kết quả real-time (debounce 300ms). Không hiển thị gọng có tồn kho = 0.

#### Trạng thái đã chọn

Khi user click một item trong dropdown:
- Ẩn ô search input và dropdown.
- Hiển thị **selected card** gồm:

| Thành phần | Vị trí | Mô tả |
|---|---|---|
| Tên gọng | Trái, dòng 1 | Font-weight 500, font-size 13px |
| Mô tả | Trái, dòng 2 | Màu sắc + Barcode + Tồn kho, font-size 12px, secondary |
| Giá bán | Phải | Font-weight 500, font-size 13px |
| Nút "Đổi" | Phải, sau giá | Button small, click → xóa selection, quay lại ô search |

### 2.6. Chọn tròng kính

Logic giống hệt phần chọn gọng kính (search → dropdown → selected card).

#### Dropdown kết quả search tròng

Mỗi item gồm:

| Dòng | Nội dung | Ví dụ |
|---|---|---|
| Tên tròng | Tên + chiết suất + loại | "Essilor Crizal Alizé UV — 1.67 AS" |
| Mô tả | Loại tròng + tính năng | "Đơn tròng \| Chống xước, chống phản quang, lọc UV" |
| Giá bán | Format số | "2.500.000" |

Search logic: tìm trên tên tròng, thương hiệu, chiết suất. Không hiển thị tròng có tồn kho = 0.

#### Selected card tròng

Cấu trúc giống selected card gọng: tên + mô tả + giá + nút "Đổi".

### 2.7. Tổng kết đơn kính

Hiển thị luôn ở dưới cùng, tự động cập nhật khi chọn/đổi sản phẩm:

| Dòng | Label | Giá trị | Ghi chú |
|---|---|---|---|
| Gọng | "Gọng: {tên gọng}" hoặc "Gọng: chưa chọn" | Giá bán hoặc "—" | Info-row style |
| Tròng | "Tròng: {tên tròng}" hoặc "Tròng: chưa chọn" | Giá bán hoặc "—" | Info-row style |
| Tổng cộng | "Tổng cộng" | Tổng giá gọng + tròng | Total-row style (font-size 15px, font-weight 500, border-top đậm). Hiển thị "—" nếu chưa chọn đủ cả hai. |

Phép tính: `Tổng cộng = Giá gọng + Giá tròng`. Giá tròng là giá cho 1 cặp (2 mắt), không cần nhân 2 — giá trong hệ thống đã là giá cặp.

### 2.8. Ghi chú đơn kính

Textarea, placeholder "Ghi chú thêm cho đơn kính (tùy chọn)...". Không bắt buộc.

### 2.9. Footer actions

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary | Đóng popup, không lưu. Hiển thị confirmation nếu đã chọn sản phẩm. |
| Tạo đơn kính | Primary | Validate → tạo đơn kính → gửi sang thu ngân. Disable nếu chưa chọn đủ gọng và tròng. |

### 2.10. Validation

| Rule | Thông báo lỗi |
|---|---|
| Chưa chọn gọng | "Vui lòng chọn gọng kính" |
| Chưa chọn tròng | "Vui lòng chọn tròng kính" |
| Gọng đã hết hàng (race condition) | "Gọng kính đã hết hàng, vui lòng chọn gọng khác" |
| Tròng đã hết hàng (race condition) | "Tròng kính đã hết hàng, vui lòng chọn tròng khác" |

### 2.11. Sau khi tạo thành công

- Đơn kính được tạo với trạng thái chờ thanh toán.
- BN được chuyển sang thu ngân.
- BN rời khỏi tab Tư vấn kính.
- Sau khi thu ngân xác nhận thanh toán → đơn kính xuất hiện trong tab Đơn hàng kính với trạng thái `ordered`.
- Tồn kho gọng trừ 1 đơn vị ngay khi tạo đơn (hold stock).

---

## 3. Chi tiết đơn hàng kính

### 3.1. Trigger

Nhấn "Xem chi tiết" từ three-dot menu tại tab Đơn hàng kính (mọi trạng thái).

### 3.2. Dạng hiển thị

Popup modal, max-width 640px, có overlay nền tối.

### 3.3. Header

Tiêu đề: "Chi tiết đơn kính — {Mã đơn}". Nút đóng `x` góc phải.

### 3.4. Thông tin bệnh nhân + Trạng thái

Layout flex, space-between:

| Bên trái | Bên phải |
|---|---|
| Tên BN (font-weight 500, 14px) | Badge trạng thái hiện tại |
| Mã BN + Giới tính + Tuổi + SĐT (12px, secondary) | |

### 3.5. Bảng Rx bác sĩ

Section label: "Thông số khúc xạ (Rx bác sĩ)". Bảng SPH/CYL/AXIS/ADD/PD — cấu trúc giống section 1.5.

### 3.6. Sản phẩm

Section label: "Sản phẩm". Danh sách info-row:

| Field | Giá trị |
|---|---|
| Gọng | Tên model + Màu sắc |
| Barcode gọng | Mã barcode, font mono, font-size 12px |
| Tròng | Tên tròng + Chiết suất + Loại |
| Loại kính | Loại kính + Loại tròng (ví dụ: "Kính cận — Đơn tròng") |

### 3.7. Thanh toán

Section label: "Thanh toán". Gồm:

| Dòng | Mô tả |
|---|---|
| Gọng | Giá gọng |
| Tròng (x2) | Giá tròng |
| Tổng cộng | Total-row style, font-size 15px, font-weight 500 |
| Trạng thái thanh toán | "Đã thanh toán" (xanh lá) hoặc "Chờ thanh toán" (amber) |

### 3.8. Lịch sử trạng thái (Timeline)

Section label: "Lịch sử trạng thái". Hiển thị 4 bước pipeline dưới dạng timeline dọc:

| Bước | Dot style | Nội dung |
|---|---|---|
| Bước đã hoàn thành | Dot nền success, border success | Tên trạng thái (font-weight 500) + ngày giờ + tên NV thực hiện |
| Bước hiện tại | Dot nền info, border info | Tên trạng thái + ngày giờ + tên NV |
| Bước chưa đến | Dot rỗng, border secondary | Tên trạng thái (secondary color) + "—" |

Giữa các dot có đường kẻ dọc 1px, màu border-tertiary. Đường kẻ nối từ dot trước đến dot sau.

### 3.9. Ghi chú

Block text trên nền secondary. Ẩn nếu không có ghi chú.

### 3.10. Footer actions

Footer thay đổi theo trạng thái hiện tại của đơn:

**Khi `ordered`:**

| Nút | Loại | Mô tả |
|---|---|---|
| In đơn kính | Secondary | Xuất PDF |
| Bắt đầu gia công | Primary | Mở popup chuyển trạng thái (section 5) |

**Khi `fabricating`:**

| Nút | Loại | Mô tả |
|---|---|---|
| In đơn kính | Secondary | Xuất PDF |
| Hoàn thành gia công | Primary | Mở popup chuyển trạng thái |

**Khi `ready_delivery`:**

| Nút | Loại | Mô tả |
|---|---|---|
| In đơn kính | Secondary | Xuất PDF |
| Xác nhận giao kính | Primary | Mở form xác nhận giao (section 4) |

**Khi `delivered`:**

| Nút | Loại | Mô tả |
|---|---|---|
| In đơn kính | Secondary | Xuất PDF |

---

## 4. Xác nhận giao kính

### 4.1. Trigger

- Nhấn "Xác nhận giao kính" từ three-dot menu tại tab Đơn hàng kính (trạng thái `ready_delivery`).
- Nhấn "Xác nhận giao kính" từ footer popup Chi tiết đơn hàng.

### 4.2. Dạng hiển thị

Popup modal, max-width 560px.

### 4.3. Header

Tiêu đề: "Xác nhận giao kính". Nút đóng `x`.

### 4.4. Thông tin đơn

Hiển thị trên border-bottom separator:

| Thành phần | Mô tả |
|---|---|
| Tên BN | Font-weight 500, 14px |
| Dòng phụ | Mã đơn + Tên gọng + Tên tròng, font-size 12px, secondary |

### 4.5. Hình thức giao

Section label: "Hình thức giao". Radio group dọc, 2 option:

| Option | Mô tả |
|---|---|
| Nhận tại phòng khám | Default selected |
| Giao hàng (ship) | Khi chọn → hiển thị thêm fields bổ sung |

Radio item style: border card, padding 10px 14px, border-radius. Selected state: border info, background info nhạt, radio circle filled.

### 4.6. Fields bổ sung khi chọn "Giao hàng (ship)"

Hiển thị conditional, ẩn khi chọn "Nhận tại phòng khám":

| Field | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| Địa chỉ giao hàng | Text input | Có | Placeholder: "Nhập địa chỉ giao hàng..." |
| Đơn vị vận chuyển | Select dropdown | Có | Options: Grab, GHTK, GHN, Bee / Xanh SM, Tự giao |

### 4.7. Fields chung

| Field | Loại | Bắt buộc | Mô tả |
|---|---|---|---|
| Người nhận | Text input | Có | Pre-fill tên BN, cho phép sửa (trường hợp người nhà nhận thay) |
| Ghi chú giao hàng | Textarea | Không | Placeholder: "Ghi chú thêm (tùy chọn)..." |

### 4.8. Footer actions

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary | Đóng popup |
| Xác nhận giao kính | Primary | Validate → chuyển trạng thái sang `delivered`, ghi nhận thông tin giao hàng |

### 4.9. Validation

| Rule | Thông báo lỗi |
|---|---|
| Chọn "Giao hàng" nhưng chưa nhập địa chỉ | "Vui lòng nhập địa chỉ giao hàng" |
| Chọn "Giao hàng" nhưng chưa chọn đơn vị vận chuyển | "Vui lòng chọn đơn vị vận chuyển" |
| Chưa nhập người nhận | "Vui lòng nhập tên người nhận" |

### 4.10. Sau khi xác nhận thành công

- Đơn kính chuyển trạng thái `delivered`.
- Ghi nhận: ngày giao, hình thức giao, người nhận, NV xác nhận.
- Gửi thông báo Zalo cho BN (nếu hình thức = "Nhận tại phòng khám" → "Kính của bạn đã sẵn sàng, mời bạn đến nhận tại phòng khám").
- Nếu ship → ghi nhận thêm địa chỉ, đơn vị vận chuyển.

---

## 5. Chuyển trạng thái (Confirmation dialog)

### 5.1. Trigger

- Nhấn "Bắt đầu gia công" từ three-dot menu hoặc footer Chi tiết đơn hàng (trạng thái `ordered`).
- Nhấn "Hoàn thành gia công" từ three-dot menu hoặc footer Chi tiết đơn hàng (trạng thái `fabricating`).

### 5.2. Dạng hiển thị

Popup modal nhỏ, max-width 420px, nội dung căn giữa.

### 5.3. Nội dung

| Thành phần | Mô tả |
|---|---|
| Icon | Hình tròn 48px, nền info, icon checkmark SVG màu info đậm |
| Mã đơn | Font-size 14px, mã đơn font-weight 500 |
| Thông tin đơn | Tên BN + Tên gọng + Tên tròng, font-size 12px, secondary |

### 5.4. Block chuyển trạng thái

Block nền secondary, border-radius, hiển thị:

| Thành phần | Mô tả |
|---|---|
| Badge trạng thái cũ | Badge style tương ứng |
| Mũi tên | → (arrow), secondary color |
| Badge trạng thái mới | Badge style tương ứng |
| Mô tả | "Trạng thái sẽ chuyển từ '{cũ}' sang '{mới}'", font-size 12px, secondary |

Các cặp chuyển trạng thái hợp lệ:

| Từ | Sang | Action label |
|---|---|---|
| Đã đặt | Đang gia công | "Bắt đầu gia công" |
| Đang gia công | Sẵn sàng giao | "Hoàn thành gia công" |

### 5.5. Ghi chú

Field textarea, label "Ghi chú (tùy chọn)", placeholder "Ghi chú khi chuyển trạng thái...". Không bắt buộc.

### 5.6. Footer actions

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary | Đóng popup |
| Xác nhận | Primary | Thực hiện chuyển trạng thái, ghi nhận ngày giờ + NV thực hiện + ghi chú |

### 5.7. Sau khi xác nhận

- Cập nhật trạng thái đơn.
- Cập nhật timeline trong Chi tiết đơn hàng.
- Cập nhật summary cards và bảng tại tab Đơn hàng kính.
- Khi chuyển sang `ready_delivery` → gửi thông báo Zalo cho BN: "Kính của bạn đã sẵn sàng, mời bạn đến nhận tại phòng khám Ganka28."

---

## 6. Chi tiết kho (Drawer)

### 6.1. Trigger

Nhấn "Xem chi tiết" từ three-dot menu tại tab Kho kính (cả sub-tab Gọng và Tròng).

### 6.2. Dạng hiển thị

Drawer slide-in từ bên phải, max-width 480px, overlay nền tối bên trái. Phần nền tối có thể click để đóng drawer.

### 6.3. Header

Tiêu đề: "Chi tiết gọng kính" hoặc "Chi tiết tròng kính" (tùy sub-tab). Nút đóng `x`.

### 6.4. Hình ảnh sản phẩm

Placeholder block, height 140px, nền secondary, border-radius, text "Hình ảnh gọng kính" / "Hình ảnh tròng kính" căn giữa. V1 chưa hỗ trợ upload ảnh — hiển thị placeholder.

### 6.5. Thông tin chính

| Thành phần | Style |
|---|---|
| Tên sản phẩm | Font-weight 500, font-size 16px |
| Mô tả | Màu sắc + Chất liệu (gọng) hoặc Loại + Chiết suất (tròng), font-size 13px, secondary |
| Barcode / Mã tròng | Font mono, font-size 12px, secondary |

### 6.6. Specs grid

Grid 2 cột, mỗi item là card nhỏ nền secondary:

**Đối với gọng kính:**

| Field | Ví dụ |
|---|---|
| Thương hiệu | Rayban |
| Màu sắc | Đen nhám |
| Chất liệu | Nhựa Acetate |
| Kích thước | 53-17-140 (lens width - bridge - temple) |
| Giới tính | Unisex / Nam / Nữ |
| Xuất xứ | Italy |

**Đối với tròng kính:**

| Field | Ví dụ |
|---|---|
| Thương hiệu | Essilor |
| Chiết suất | 1.67 |
| Loại | Đơn tròng / Đa tròng |
| Lớp phủ | Chống xước, lọc UV |
| Thiết kế | Aspherical (AS) |
| Xuất xứ | France |

### 6.7. Giá & tồn kho

Section label: "Giá & tồn kho". Danh sách info-row:

| Field | Mô tả |
|---|---|
| Giá nhập | Format số, VNĐ |
| Giá bán | Format số, VNĐ |
| Lãi gộp | Giá bán - Giá nhập, hiển thị số tiền + phần trăm, màu xanh lá. Ví dụ: "1.120.000 (40%)" |
| Tồn kho | Số lượng. Xanh lá nếu > ngưỡng cảnh báo, đỏ nếu ≤ ngưỡng |
| Ngưỡng cảnh báo | Số ngưỡng cảnh báo tồn kho (admin cấu hình) |

Phép tính lãi gộp: `Lãi gộp % = (Giá bán - Giá nhập) / Giá bán * 100`, làm tròn đến số nguyên.

### 6.8. Lịch sử xuất/nhập gần đây

Section label: "Lịch sử xuất/nhập gần đây". Bảng 4 cột, hiển thị tối đa 5 dòng gần nhất:

| Cột | Mô tả |
|---|---|
| Ngày | Format DD/MM |
| Loại | "Nhập" (màu xanh lá, font-weight 500) hoặc "Xuất" (màu đỏ, font-weight 500) |
| SL | Số lượng có dấu: "+10" (nhập) hoặc "-1" (xuất) |
| Ghi chú | Lý do nhập hoặc mã đơn kính liên kết (DK-XXXXXXXX-XXX), font-size 12px, secondary |

### 6.9. Footer actions

| Nút | Loại | Mô tả |
|---|---|---|
| Đóng | Secondary | Đóng drawer |
| Chỉnh sửa | Primary | Chuyển drawer sang edit mode (xem section 6.10) |

### 6.10. Edit mode

Khi nhấn "Chỉnh sửa", drawer chuyển sang edit mode:

**Các field cho phép sửa:**

| Field | Loại input | Ghi chú |
|---|---|---|
| Giá bán | Number input | Bắt buộc, > 0 |
| Màu sắc (gọng) / Lớp phủ (tròng) | Text input | |
| Chất liệu (gọng) / Thiết kế (tròng) | Text input | |
| Xuất xứ | Text input | |
| Ngưỡng cảnh báo | Number input | Bắt buộc, ≥ 0 |

**Không cho phép sửa:** Barcode/Mã tròng, Thương hiệu, Tên sản phẩm, Giá nhập, Tồn kho (tồn kho chỉ thay đổi qua nhập/xuất kho).

**Footer edit mode:**

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary | Quay lại view mode, không lưu |
| Lưu thay đổi | Primary | Validate → lưu → quay lại view mode |

---

## 7. Quy tắc chung cho tất cả action screens

### 7.1. Modal behavior

- Overlay nền tối: `rgba(0,0,0,0.35)`
- Click overlay → đóng modal (trừ khi có unsaved changes → hiển thị confirmation)
- Phím Escape → đóng modal
- Modal không scroll toàn trang — body modal scroll nội bộ nếu nội dung dài

### 7.2. Format tiền tệ

- Sử dụng dấu chấm ngăn hàng nghìn: `2.800.000` (theo chuẩn Việt Nam)
- Không hiển thị ký hiệu tiền tệ
- Đơn vị hiểu ngầm là VNĐ

### 7.3. Confirmation khi có unsaved changes

Nếu user đã nhập/thay đổi dữ liệu trong form và nhấn Hủy/Đóng/Escape/Click overlay → hiển thị confirmation: "Bạn có chắc muốn đóng? Dữ liệu chưa lưu sẽ bị mất." với 2 nút: "Tiếp tục chỉnh sửa" (secondary) và "Đóng không lưu" (primary).

### 7.4. Loading state

Khi thực hiện action (tạo đơn, chuyển trạng thái, lưu chỉnh sửa):
- Nút primary → disable + hiển thị text "Đang xử lý..."
- Sau khi thành công → đóng modal + hiển thị toast notification
- Sau khi lỗi → hiển thị error message trong modal, nút primary trở lại enabled

### 7.5. Toast notification

Sau khi action thành công, hiển thị toast ở góc trên phải, tự ẩn sau 3 giây:

| Action | Message |
|---|---|
| Tạo đơn kính | "Đã tạo đơn kính thành công" |
| Bắt đầu gia công | "Đã chuyển trạng thái sang Đang gia công" |
| Hoàn thành gia công | "Đã chuyển trạng thái sang Sẵn sàng giao" |
| Xác nhận giao kính | "Đã xác nhận giao kính thành công" |
| Lưu chỉnh sửa kho | "Đã lưu thay đổi" |
