# Optical Staff Dashboard — Functional Specification

**Module:** Trung tâm kính (Optical Center)
**Role:** Optical Staff (Nhân viên kính)
**Route:** `/dashboard` — render khi user có role `optical_staff`
**Version:** 1.0
**Ngày tạo:** 2026-04-04

---

## 1. Tổng quan

Dashboard dành cho nhân viên kính, quản lý toàn bộ quy trình từ khi bác sĩ chỉ định làm kính đến khi giao kính cho bệnh nhân. Giao diện chia thành 3 tab chính: **Tư vấn kính**, **Đơn hàng kính**, và **Kho kính**.

### 1.1. Workflow tổng thể

```
BS kê đơn kính (EMR) → BN xuất hiện trong hàng đợi "Tư vấn kính"
→ NV kính nhận BN → Tư vấn chọn gọng + tròng → Tạo đơn kính
→ BN thanh toán tại thu ngân → Đơn chuyển trạng thái "Đã đặt"
→ Gia công mài lắp → Sẵn sàng giao → Giao kính cho BN
```

### 1.2. Phạm vi v1

Bao gồm:
- Hàng đợi tư vấn kính (nhận BN từ BS)
- Tạo và theo dõi đơn hàng kính (4 trạng thái)
- Quản lý kho gọng kính và tròng kính (xem, sửa, lịch sử)

Không bao gồm (defer):
- Gia công ngoài (tracking xưởng bên ngoài)
- Bán vãng lai (khách mua gọng/kính mát không qua khám)
- Quản lý bảo hành
- Nhập kho (chức năng tạo phiếu nhập hàng mới)

---

## 2. Layout chung

### 2.1. Header

| Thành phần | Mô tả |
|---|---|
| Tiêu đề | "Trung tâm kính" |
| Ngày | Hiển thị ngày hiện tại, format: `Thứ X, DD/MM/YYYY` |
| User badge | Hiển thị `Nhân viên kính: {tên_user}` — background secondary, border-radius |

### 2.2. Tab bar

3 tab nằm ngang, dưới header, có border-bottom. Tab active có `font-weight: 500` và `border-bottom` highlight.

| Tab | Label | Badge |
|---|---|---|
| 1 | Tư vấn kính | Số BN đang chờ + đang tư vấn |
| 2 | Đơn hàng kính | Số đơn chưa hoàn thành (Đã đặt + Đang gia công + Sẵn sàng giao) |
| 3 | Kho kính | Không có badge |

---

## 3. Tab 1: Tư vấn kính

### 3.1. Mục đích

Hiển thị danh sách bệnh nhân được bác sĩ chỉ định làm kính, đang chờ nhân viên kính tư vấn chọn gọng và tròng.

### 3.2. Nguồn dữ liệu

Bệnh nhân xuất hiện trong tab này khi bác sĩ tạo **đơn kính (Optical Rx)** trong module EMR. Đơn kính bao gồm thông số khúc xạ (SPH, CYL, AXIS, ADD, PD) và loại kính chỉ định.

### 3.3. Summary cards

4 cards, grid 4 cột:

| Card | Giá trị | Highlight |
|---|---|---|
| Chờ tư vấn | Đếm BN có trạng thái `waiting_consultation` | Highlight cam nếu > 0 |
| Đang tư vấn | Đếm BN có trạng thái `in_consultation` | — |
| Đã tạo đơn hôm nay | Đếm đơn kính tạo trong ngày | — |
| Đã giao hôm nay | Đếm đơn kính chuyển `delivered` trong ngày | — |

### 3.4. Toolbar

| Thành phần | Mô tả |
|---|---|
| Search | Placeholder: "Tìm theo tên, mã BN, SĐT..." — tìm real-time, max-width 280px |
| Filter buttons | `Tất cả` (default active), `Chờ tư vấn`, `Đang tư vấn` |

### 3.5. Bảng hàng đợi

| Cột | Nội dung | Ghi chú |
|---|---|---|
| STT | Số thứ tự hiển thị | Width 40px |
| Bệnh nhân | Tên (font-weight 500) + Mã BN (font-size 12px, secondary color) | Mã BN format `BN-YYYYMMDD-XXXX` |
| BS chỉ định | Tên bác sĩ đã kê đơn kính | Prefix "BS." |
| Đơn kính BS | Tóm tắt Rx: OD và OS trên 2 dòng, format `SPH / CYL x AXIS` hoặc `SPH ADD +X.XX` | Font-size 12px, secondary color |
| Trạng thái | Badge trạng thái | Xem mục 3.6 |
| Thời gian chờ | Tính từ lúc BN vào hàng đợi | Format "X phút", font-size 12px |
| Hành động | Three-dot menu (⋯) | Xem mục 3.7 |

### 3.6. Trạng thái tư vấn

| Trạng thái | Code | Màu badge | Trigger |
|---|---|---|---|
| Chờ tư vấn | `waiting_consultation` | Warning (amber bg, dark amber text) | BS tạo đơn kính trong EMR |
| Đang tư vấn | `in_consultation` | Info (blue bg, dark blue text) | NV kính nhấn "Nhận BN" |

Sau khi NV kính tạo đơn kính, BN rời khỏi tab Tư vấn và đơn hàng xuất hiện ở tab Đơn hàng kính.

### 3.7. Actions (Three-dot dropdown menu)

Actions thay đổi theo trạng thái hiện tại:

**Khi trạng thái = Chờ tư vấn:**

| Action | Mô tả |
|---|---|
| Nhận BN | Chuyển trạng thái sang `in_consultation`. Gán NV kính hiện tại làm người phụ trách. |
| Xem đơn kính BS | Mở popup/drawer hiển thị đầy đủ thông tin Rx từ bác sĩ (SPH, CYL, AXIS, ADD, PD, VA, ghi chú BS) |

**Khi trạng thái = Đang tư vấn:**

| Action | Mô tả |
|---|---|
| Tạo đơn kính | Mở form tạo đơn kính mới (xem spec riêng: `optical-order-form.md`) |
| Xem đơn kính BS | Như trên |
| --- | *(separator)* |
| Trả lại hàng đợi | Chuyển trạng thái về `waiting_consultation`. Bỏ gán NV kính. Dùng khi NV kính không thể tiếp tục tư vấn. |

### 3.8. Sắp xếp mặc định

Bảng sắp xếp theo thời gian chờ giảm dần (BN chờ lâu nhất ở trên). BN đang tư vấn luôn ở trên cùng.

---

## 4. Tab 2: Đơn hàng kính

### 4.1. Mục đích

Theo dõi toàn bộ đơn hàng kính qua 4 trạng thái, từ khi đặt đến khi giao cho bệnh nhân.

### 4.2. Pipeline trạng thái

```
Đã đặt → Đang gia công → Sẵn sàng giao → Đã giao
```

| Trạng thái | Code | Màu badge | Trigger chuyển trạng thái |
|---|---|---|---|
| Đã đặt | `ordered` | Green (green bg, dark green text) | Đơn kính được tạo VÀ BN đã thanh toán tại thu ngân |
| Đang gia công | `fabricating` | Info (blue bg, dark blue text) | NV kính nhấn "Bắt đầu gia công" |
| Sẵn sàng giao | `ready_delivery` | Teal (teal bg, dark teal text) | NV kính nhấn "Hoàn thành gia công" |
| Đã giao | `delivered` | Secondary (gray bg, secondary text) | NV kính nhấn "Xác nhận giao kính" |

**Lưu ý về thanh toán:** Theo quy định PK, bệnh nhân thanh toán trước khi mài lắp, không thu cọc (CONFIRMATION_2, Q4). Do đó đơn kính chỉ chuyển sang trạng thái `ordered` sau khi thu ngân xác nhận thanh toán.

### 4.3. Summary cards

4 cards, grid 4 cột:

| Card | Giá trị | Highlight |
|---|---|---|
| Đã đặt | Đếm đơn có status `ordered` | — |
| Đang gia công | Đếm đơn có status `fabricating` | Highlight cam nếu > 0 |
| Sẵn sàng giao | Đếm đơn có status `ready_delivery` | — |
| Đã giao hôm nay | Đếm đơn chuyển `delivered` trong ngày | — |

### 4.4. Toolbar

| Thành phần | Mô tả |
|---|---|
| Search | Placeholder: "Tìm theo mã đơn, tên BN..." — tìm real-time |
| Filter buttons | `Tất cả` (default), `Đã đặt`, `Đang gia công`, `Sẵn sàng giao`, `Đã giao` |

### 4.5. Bảng đơn hàng

| Cột | Nội dung | Ghi chú |
|---|---|---|
| Mã đơn | Format `DK-YYYYMMDD-XXX` | Font mono, font-size 12px |
| Bệnh nhân | Tên (font-weight 500) + Mã BN (font-size 12px, secondary) | — |
| Loại kính | Phân loại: Kính cận, Kính lão, Kính đa tròng, Kính mát có độ | Giá trị từ đơn kính BS |
| Gọng | Tên model gọng + Màu sắc (dòng 2, secondary color) | Font-size 12px |
| Tròng | Tên tròng + Chiết suất/Loại (dòng 2, secondary color) | Font-size 12px |
| Ngày đặt | Format DD/MM | — |
| Trạng thái | Badge trạng thái | Xem mục 4.2 |
| Hành động | Three-dot menu (⋯) | Xem mục 4.6 |

### 4.6. Actions (Three-dot dropdown menu)

Actions thay đổi theo trạng thái:

**Khi trạng thái = Đã đặt (`ordered`):**

| Action | Mô tả |
|---|---|
| Xem chi tiết | Mở drawer/page chi tiết đơn kính (Rx, gọng, tròng, giá, BN info) |
| Bắt đầu gia công | Chuyển trạng thái sang `fabricating` |
| In đơn kính | Xuất đơn kính ra PDF để in (bao gồm Rx, gọng, tròng, thông tin BN) |

**Khi trạng thái = Đang gia công (`fabricating`):**

| Action | Mô tả |
|---|---|
| Xem chi tiết | Như trên |
| Hoàn thành gia công | Chuyển trạng thái sang `ready_delivery` |
| In đơn kính | Như trên |

**Khi trạng thái = Sẵn sàng giao (`ready_delivery`):**

| Action | Mô tả |
|---|---|
| Xem chi tiết | Như trên |
| Xác nhận giao kính | Chuyển trạng thái sang `delivered`. Ghi nhận ngày giao, hình thức giao (nhận tại PK / ship). |
| In đơn kính | Như trên |
| --- | *(separator)* |
| Liên hệ BN | Hiển thị SĐT bệnh nhân, cho phép gọi hoặc nhắn Zalo |

**Khi trạng thái = Đã giao (`delivered`):**

| Action | Mô tả |
|---|---|
| Xem chi tiết | Như trên |
| In đơn kính | Như trên |

### 4.7. Sắp xếp mặc định

Sắp xếp theo ngày đặt tăng dần (đơn cũ nhất ở trên — ưu tiên xử lý trước). Đơn `delivered` luôn ở dưới cùng.

### 4.8. Mã đơn kính

- Format: `DK-YYYYMMDD-XXX`
- `DK` = prefix cố định (Đơn Kính)
- `YYYYMMDD` = ngày tạo đơn
- `XXX` = số thứ tự trong ngày, auto-increment, bắt đầu từ 001
- Ví dụ: `DK-20260405-001`, `DK-20260405-002`

---

## 5. Tab 3: Kho kính

### 5.1. Mục đích

Quản lý tồn kho gọng kính và tròng kính. Cả nhân viên kính và admin đều có quyền truy cập.

### 5.2. Summary cards

3 cards, grid 3 cột:

| Card | Giá trị | Highlight |
|---|---|---|
| Tổng gọng kính | Tổng số SKU gọng đang quản lý | — |
| Tổng tròng kính | Tổng số SKU tròng đang quản lý | — |
| Sắp hết hàng | Đếm SKU có tồn kho ≤ ngưỡng cảnh báo (admin cấu hình) | Highlight cam nếu > 0 |

### 5.3. Sub-tabs

2 sub-tab dạng button group: **Gọng kính** (default) và **Tròng kính**.

### 5.4. Sub-tab: Gọng kính

#### Toolbar

| Thành phần | Mô tả |
|---|---|
| Search | Placeholder: "Tìm theo tên, mã barcode, thương hiệu..." |
| Filter buttons | `Tất cả` (default), `Còn hàng`, `Sắp hết`, `Hết hàng` |

#### Bảng gọng kính

| Cột | Nội dung | Ghi chú |
|---|---|---|
| Barcode | Mã barcode, format `GK-FR-XXXXX` | Font mono, font-size 12px |
| Tên gọng | Tên model gọng | — |
| Thương hiệu | Tên thương hiệu (Rayban, Oakley, Việt Pháp...) | — |
| Màu sắc | Màu gọng | — |
| Giá bán | Giá bán lẻ, format số có dấu phẩy ngăn hàng nghìn | VNĐ, không hiển thị ký hiệu tiền tệ |
| Tồn kho | Số lượng tồn | Đỏ + font-weight 500 nếu ≤ ngưỡng cảnh báo; Xanh lá nếu bình thường |
| Hành động | Three-dot menu (⋯) | — |

#### Actions gọng kính

| Action | Mô tả |
|---|---|
| Xem chi tiết | Mở drawer hiển thị đầy đủ thông tin gọng (ảnh, kích thước, chất liệu, giá nhập, giá bán, lịch sử tồn) |
| Chỉnh sửa | Cho phép sửa giá bán, thông tin mô tả. Không cho sửa barcode. |
| Lịch sử xuất/nhập | Hiển thị log xuất/nhập kho của SKU này |

### 5.5. Sub-tab: Tròng kính

#### Toolbar

| Thành phần | Mô tả |
|---|---|
| Search | Placeholder: "Tìm theo tên tròng, thương hiệu, chiết suất..." |
| Filter buttons | `Tất cả` (default), filter theo thương hiệu: `Essilor`, `Hoya`, `Việt Pháp` (lấy từ master data) |

#### Bảng tròng kính

| Cột | Nội dung | Ghi chú |
|---|---|---|
| Mã tròng | Mã nội bộ, format `GK-LN-XXX` | Font mono, font-size 12px |
| Tên tròng | Tên sản phẩm tròng (Crizal Alizé UV, BlueControl...) | — |
| Thương hiệu | Essilor, Hoya, Việt Pháp... | — |
| Chiết suất | 1.50, 1.56, 1.60, 1.67, 1.74 | — |
| Loại | Đơn tròng / Đa tròng (Progressive) | — |
| Giá bán | Format số có dấu phẩy | VNĐ |
| Tồn kho | Số lượng tồn | Đỏ nếu ≤ ngưỡng cảnh báo |
| Hành động | Three-dot menu (⋯) | — |

#### Actions tròng kính

| Action | Mô tả |
|---|---|
| Xem chi tiết | Mở drawer hiển thị đầy đủ thông tin tròng (specs, coating, giá nhập, giá bán) |
| Chỉnh sửa | Cho phép sửa giá bán, thông tin mô tả |

---

## 6. Quy tắc hiển thị chung

### 6.1. Three-dot dropdown menu

- Icon: `⋯` (horizontal ellipsis)
- Border: 0.5px solid, border-radius theo design system
- Click mở dropdown bên dưới, align phải
- Click ngoài hoặc click action → đóng dropdown
- Separator (đường kẻ ngang) dùng để tách nhóm actions phụ (ví dụ: "Trả lại hàng đợi", "Liên hệ BN")

### 6.2. Filter buttons

- Dạng button group, gap 8px
- Active state: background secondary, font-weight 500, border đậm hơn
- Chỉ 1 filter active tại một thời điểm (single-select)
- Filter "Tất cả" luôn ở đầu tiên

### 6.3. Search

- Real-time search (debounce 300ms)
- Tìm trên tất cả các cột text trong bảng hiện tại
- Case-insensitive, diacritics-insensitive (tìm "nguyen" ra "Nguyễn")

### 6.4. Trạng thái tồn kho

- **Hết hàng:** tồn kho = 0
- **Sắp hết:** tồn kho > 0 AND ≤ ngưỡng cảnh báo (admin cấu hình per SKU, default = 3)
- **Còn hàng:** tồn kho > ngưỡng cảnh báo

### 6.5. Format tiền tệ

- Sử dụng dấu phẩy ngăn hàng nghìn: `2,800,000`
- Không hiển thị ký hiệu tiền tệ (VNĐ/đ) trong bảng
- Đơn vị hiểu ngầm là VNĐ

---

## 7. Mối liên kết với các module khác

### 7.1. EMR (Doctor) → Optical Staff

- Bác sĩ tạo đơn kính (Optical Rx) trong module EMR
- Đơn kính bao gồm: SPH, CYL, AXIS, ADD, PD cho OD và OS; loại kính chỉ định; ghi chú
- Khi đơn kính được tạo, BN tự động xuất hiện trong tab "Tư vấn kính" của Optical Staff dashboard

### 7.2. Optical Staff → Thu ngân (Cashier)

- Sau khi NV kính tạo đơn kính (chọn gọng + tròng + giá), đơn được gửi sang thu ngân
- Thu ngân thanh toán → đơn kính chuyển trạng thái `ordered`
- BN thanh toán trước khi mài lắp, không thu cọc

### 7.3. Optical Staff → Bệnh nhân

- Khi đơn ở trạng thái `ready_delivery`, hệ thống gửi thông báo Zalo cho BN: "Kính của bạn đã sẵn sàng"
- Giao hàng: nhận tại PK hoặc ship (CONFIRMATION_2, Q6)

### 7.4. Kho kính ↔ Admin

- Cả Optical Staff và Admin đều có quyền xem và chỉnh sửa thông tin kho
- Chức năng nhập kho (tạo phiếu nhập hàng mới) — defer, chưa thiết kế ở v1

---

## 8. Các màn hình con (chưa thiết kế — defer)

Các màn hình sau được reference trong spec nhưng cần spec riêng:

| Màn hình | Mô tả | Ưu tiên |
|---|---|---|
| `optical-order-form.md` | Form tạo đơn kính: chọn gọng, chọn tròng, combo, tính giá, liên kết Rx từ BS | Cao — cần cho workflow chính |
| `optical-order-detail.md` | Drawer/page chi tiết đơn kính: thông tin đầy đủ Rx, gọng, tròng, giá, lịch sử trạng thái | Cao |
| `optical-inventory-detail.md` | Drawer chi tiết SKU: ảnh, specs, giá nhập/bán, lịch sử xuất/nhập | Trung bình |
| `optical-inventory-import.md` | Form nhập kho gọng/tròng | Defer |
| `optical-warranty.md` | Quản lý bảo hành kính (gọng 12 tháng, tròng 12 tháng) | Defer |

---

## 9. Barcode scheme

### 9.1. Gọng kính

- Format: `GK-FR-XXXXX`
- `GK` = Ganka28
- `FR` = Frame
- `XXXXX` = số thứ tự 5 chữ số, auto-increment
- Barcode cần thiết lập từ đầu (CONFIRMATION_1, Q30)

### 9.2. Tròng kính

- Format: `GK-LN-XXX`
- `LN` = Lens
- `XXX` = số thứ tự 3 chữ số
- Tròng kính quản lý theo SKU (thương hiệu + model + chiết suất), không theo từng cặp tròng

---

## 10. Permissions

| Chức năng | Optical Staff | Admin |
|---|---|---|
| Xem tab Tư vấn kính | ✅ | ✅ |
| Nhận BN / Tư vấn | ✅ | ❌ |
| Tạo đơn kính | ✅ | ❌ |
| Xem tab Đơn hàng kính | ✅ | ✅ |
| Cập nhật trạng thái đơn | ✅ | ✅ |
| Xem tab Kho kính | ✅ | ✅ |
| Chỉnh sửa thông tin kho | ✅ | ✅ |
| Nhập kho (tạo phiếu nhập) | ❌ (defer) | ❌ (defer) |
| Cấu hình ngưỡng cảnh báo tồn kho | ❌ | ✅ |
