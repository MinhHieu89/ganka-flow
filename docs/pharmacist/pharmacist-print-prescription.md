# Modal: In đơn thuốc — Functional Specification (UI)

**Module:** Nhà thuốc (Pharmacy)
**Thuộc màn hình:** Pharmacist Dashboard
**Version:** 1.0
**Ngày:** 2026-04-04

---

## 1. Tổng quan

Modal preview đơn thuốc trước khi in. Hiển thị đơn thuốc dạng giấy A5, cho phép dược sĩ xem trước nội dung và in hoặc tải PDF.

---

## 2. Trigger mở modal

| Trigger | Từ đâu |
|---|---|
| Dropdown → "In đơn thuốc" | Bảng hàng đợi (cả trạng thái Chờ phát và Đã phát) |
| Nút "In đơn thuốc" | Footer modal Phát thuốc (mục 5) |
| Nút "In đơn thuốc" | Footer modal Xem đơn thuốc (mục 6) |
| Nút "In đơn thuốc" | Footer modal Chi tiết phát thuốc (mục 7) |

---

## 3. Header modal

- Tiêu đề: "In đơn thuốc — [Tên bệnh nhân]"
- Nút đóng (×) ở góc phải

---

## 4. Mô tả

Text phía trên vùng preview: "Xem trước đơn thuốc. Đơn sẽ in trên giấy A5."

Font-size 12px, màu secondary.

---

## 5. Vùng preview đơn thuốc

Toàn bộ đơn thuốc nằm trong 1 card có border, padding 28px 32px, mô phỏng tờ giấy A5.

### 5.1 Header đơn thuốc

Căn giữa, gồm:

| Dòng | Nội dung | Style |
|---|---|---|
| 1 | "PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28" | font-size 16px, font-weight 500 |
| 2 | Địa chỉ + số điện thoại PK | font-size 11px, tertiary |
| 3 | "ĐƠN THUỐC" | font-size 18px, font-weight 500, letter-spacing 1px |
| 4 | "Số: DT-YYYYMMDD-XXXX" | font-size 11px, tertiary |

Phân cách với phần dưới bằng border-bottom 1px.

### 5.2 Thông tin bệnh nhân

Grid 2 cột, 6 fields:

| Field | Nội dung |
|---|---|
| Họ tên | Tên bệnh nhân (font-weight 500) |
| Mã BN | BN-YYYYMMDD-XXXX |
| Năm sinh | Năm sinh (chỉ năm, không full ngày tháng) |
| Giới tính | Nam / Nữ |
| Ngày khám | DD/MM/YYYY |
| SĐT | Số điện thoại (mask: 0912.xxx.xxx) |

### 5.3 Chẩn đoán

Background secondary, border-radius, padding 8px 12px.

Nội dung: "Chẩn đoán: **[Tên chẩn đoán] ([mã ICD])**"

### 5.4 Bảng thuốc

| Cột | Nội dung | Width |
|---|---|---|
| STT | Số thứ tự (1, 2, 3...) | 30px, căn giữa |
| Tên thuốc | Chỉ tên thuốc (font-weight 500) | auto |
| Cách dùng | Liều dùng chi tiết | auto |
| SL | Số lượng + đơn vị | auto |

**Nguyên tắc hiển thị thuốc thay thế:** Trên đơn thuốc in ra, thuốc thay thế hiển thị như thuốc bình thường — chỉ hiện tên thuốc thực tế phát, không ghi chú thuốc gốc hay lý do thay thế. Đơn thuốc in ra là cho bệnh nhân, không cần thông tin nội bộ.

### 5.5 Lời dặn (conditional)

Chỉ hiển thị nếu BS có ghi chú trên đơn thuốc.

Background secondary, border-radius, font-size 12px. Nội dung: "Lời dặn: [ghi chú BS]"

### 5.6 Chân đơn thuốc

Chia 2 phần trên cùng 1 hàng:

| Bên trái | Bên phải |
|---|---|
| "Ngày DD tháng MM năm YYYY" | Label: "Bác sĩ kê đơn" |
| Font-size 12px, tertiary | Tên BS (font-weight 500) |

Không có ô chữ ký, không có cột dược sĩ. Chỉ hiển thị tên BS kê đơn.

### 5.7 Hạn đơn thuốc

Dòng cuối cùng, căn giữa, font-size 11px, tertiary.

Nội dung: "Đơn thuốc có giá trị 7 ngày kể từ ngày kê — Hết hạn: DD/MM/YYYY"

---

## 6. Footer modal

2 nút căn phải:

| Nút | Loại | Mô tả |
|---|---|---|
| Tải PDF | Secondary (outline) | Tải đơn thuốc dạng file PDF |
| In đơn thuốc | Primary (filled) | Gửi lệnh in trực tiếp |

---

## 7. Mã đơn thuốc

Format: `DT-YYYYMMDD-XXXX`

- DT: prefix cố định (Đơn Thuốc)
- YYYYMMDD: ngày kê đơn
- XXXX: số thứ tự auto-increment trong ngày

Mã đơn thuốc khác mã bệnh nhân (BN-YYYYMMDD-XXXX).

---

## 8. Quy tắc hiển thị

| Quy tắc | Mô tả |
|---|---|
| SĐT bệnh nhân | Mask 4 số cuối khi hiển thị trên đơn in (vd: 0912.xxx.xxx). Bảo vệ thông tin cá nhân. |
| Thuốc thay thế | Hiển thị tên thuốc thực tế phát, không ghi chú thuốc gốc. |
| Lời dặn | Chỉ hiện khi BS có ghi chú. Không hiển thị section trống. |
| Chân đơn | Chỉ tên BS, không ô chữ ký. |
| Hạn đơn | Luôn hiển thị, tính từ ngày kê + 7 ngày. |
