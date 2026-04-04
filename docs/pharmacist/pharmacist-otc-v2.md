# Pharmacist OTC — Functional Specification (UI)

**Module:** Nhà thuốc (Pharmacy) — Tab Bán OTC
**Role:** Dược sĩ (Pharmacist)
**Route:** `/dashboard` (role = pharmacist, tab = otc)
**Version:** 1.2
**Ngày:** 2026-04-04

---

## 1. Tổng quan

Tab "Bán OTC" cho phép dược sĩ bán thuốc không kê đơn (OTC) cho khách vãng lai trực tiếp tại quầy thuốc. Dược sĩ tự thu tiền, không qua thu ngân.

**Sản phẩm OTC bao gồm:** nước mắt nhân tạo, Omega-3, thực phẩm chức năng, thuốc nhỏ mắt OTC, băng chườm ấm mắt, các sản phẩm chăm sóc mắt không kê đơn.

---

## 2. Flow tổng thể

```
Chọn/tạo khách hàng → Thêm sản phẩm → Chọn phương thức thanh toán → Click Thanh toán → Popup xác nhận → Xác nhận → Thành công → In hóa đơn / In nhãn thuốc
```

Dược sĩ xử lý toàn bộ flow, không cần bác sĩ hay thu ngân.

---

## 3. Màn hình chính: Bán OTC

Layout 2 cột dạng POS.

### 3.1 Cột trái — Khách hàng + sản phẩm

#### 3.1.1 Card Khách hàng

| Thành phần | Mô tả |
|---|---|
| Search box | Placeholder: "Tìm theo tên hoặc SĐT...". Tìm kiếm realtime trong danh sách khách hàng đã có. |
| Kết quả chọn | Hiển thị card: tên (font-weight 500) + SĐT. Nút "Đổi" để chọn khách khác. |
| Tạo khách mới | Link "+ Tạo khách hàng mới" → mở modal Tạo khách hàng (xem mục 4). |

Khách hàng là bắt buộc — không cho thanh toán nếu chưa chọn khách.

#### 3.1.2 Card Chọn sản phẩm

| Thành phần | Mô tả |
|---|---|
| Search box | Placeholder: "Tìm thuốc OTC...". Tìm kiếm trong danh mục sản phẩm OTC. |
| Danh sách sản phẩm | Hiển thị phẳng, không phân nhóm. Mỗi item gồm: tên thuốc (font-weight 500), nhà sản xuất + quy cách (sub-label), giá bán (căn phải), tồn kho (căn phải). |
| Click sản phẩm | Thêm 1 đơn vị vào đơn hàng ở cột phải. Nếu đã có → tăng số lượng lên 1. |
| Sản phẩm hết hàng | Tên màu tertiary, tồn kho hiển thị đỏ "Hết hàng". Không cho click thêm. |

### 3.2 Cột phải — Đơn hàng (sticky)

| Thành phần | Mô tả |
|---|---|
| Title | "Đơn hàng" + badge "[N] sản phẩm" |
| Danh sách item | Mỗi item: tên thuốc, nút −/+ điều chỉnh số lượng, đơn giá, thành tiền, nút "Xóa" |
| Tổng cộng | Dòng tổng cộng (font-size 15px, font-weight 500) |
| Phương thức thanh toán | 4 pills: Tiền mặt (mặc định), Chuyển khoản, QR code, Thẻ. Chọn 1. |
| Nút thanh toán | "Thanh toán [số tiền]" — Primary button, full width |
| Link lịch sử | "Xem lịch sử bán OTC hôm nay" → chuyển sang view Lịch sử (xem mục 6) |

#### Đơn hàng trống:

Khi chưa có sản phẩm nào, hiển thị text placeholder: "Chọn sản phẩm từ danh sách bên trái". Nút thanh toán disabled.

#### Validation trước khi thanh toán:
- Đã chọn khách hàng
- Có ít nhất 1 sản phẩm trong đơn
- Đã chọn phương thức thanh toán
- Tất cả sản phẩm trong đơn có đủ tồn kho

#### Sau khi click "Thanh toán":
- Mở modal Xác nhận thanh toán (xem mục 5)
- Chưa trừ tồn kho, chưa ghi nhận đơn — chỉ xác nhận mới xử lý

---

## 4. Modal: Xác nhận thanh toán

Popup xác nhận trước khi hoàn tất thanh toán. Dược sĩ kiểm tra lần cuối.

### 4.1 Header modal

- Tiêu đề: "Xác nhận thanh toán"
- Nút đóng (×) ở góc phải

### 4.2 Nội dung

**Thông tin khách hàng:**

| Dòng | Nội dung |
|---|---|
| Khách hàng | Tên khách (font-weight 500) |
| SĐT | Số điện thoại |
| Phương thức | Phương thức thanh toán đã chọn |

**Danh sách sản phẩm:**

Mỗi dòng hiển thị: tên sản phẩm (font-weight 500) + "× [số lượng]" (secondary) → thành tiền (căn phải).

**Tổng cộng:**

Dòng tổng cộng, font-size 16px, font-weight 500, border-top phân cách.

### 4.3 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Quay lại | Secondary (outline) | Đóng popup, quay lại màn chính để chỉnh sửa |
| Xác nhận thanh toán | Primary (filled) | Hoàn tất thanh toán: trừ tồn kho, ghi nhận đơn, mở modal Thành công |

**Sau khi xác nhận:**
- Trừ tồn kho tương ứng
- Ghi nhận đơn hàng OTC (mã đơn, khách hàng, sản phẩm, dược sĩ, thời gian, phương thức)
- Mở modal Thanh toán thành công (xem mục 6)

---

## 5. Modal: Tạo khách hàng mới

Mở khi dược sĩ click "+ Tạo khách hàng mới".

### 5.1 Header modal

- Tiêu đề: "Tạo khách hàng mới"
- Nút đóng (×) ở góc phải

### 5.2 Form

Grid 2 cột:

| Field | Bắt buộc | Placeholder |
|---|---|---|
| Họ tên | Có (*) | "Nhập họ tên..." |
| Số điện thoại | Có (*) | "0xxx.xxx.xxx" |
| Ngày sinh | Không | "DD/MM/YYYY" |
| Giới tính | Không | "Chọn..." (dropdown: Nam / Nữ) |

Ghi chú dưới form: "Chỉ bắt buộc Họ tên + SĐT. Các trường khác có thể bổ sung sau."

**Validation:**
- Họ tên không được để trống
- SĐT không được để trống, kiểm tra format (10 chữ số, bắt đầu bằng 0)
- SĐT không được trùng khách hàng đã có → nếu trùng, hiển thị thông báo và link đến khách hàng đã có

### 5.3 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary (outline) | Đóng modal |
| Tạo khách hàng | Primary (filled) | Tạo khách hàng, tự động chọn vào card Khách hàng ở màn chính |

Đây là hồ sơ khách hàng tối thiểu, không phải hồ sơ bệnh án.

---

## 6. Modal: Thanh toán thành công

Hiển thị ngay sau khi xác nhận thanh toán (từ mục 4).

### 6.1 Header modal

- Tiêu đề: "Thanh toán thành công"
- Nút đóng (×) ở góc phải

### 6.2 Nội dung

**Phần trên — Thông tin thanh toán** (căn giữa):

| Thành phần | Mô tả |
|---|---|
| Icon | Vòng tròn xanh lá (52px) + ✓ |
| Số tiền | Font-size 28px, font-weight 500 |
| Phương thức + khách | "[Phương thức] — [Tên khách]" (font-size 13px, secondary) |
| Metadata | "DD/MM/YYYY, HH:mm — Mã đơn: OTC-YYYYMMDD-XXXX" (font-size 12px, tertiary) |

**Phần giữa — Tóm tắt sản phẩm:**

Phân cách bằng divider trên và dưới. Mỗi dòng hiển thị: tên sản phẩm + "× [SL]" (secondary, căn trái) → thành tiền (font-weight 500, căn phải).

### 6.3 Actions

2 hàng nút:

| Hàng | Nút | Loại | Layout | Mô tả |
|---|---|---|---|---|
| 1 | In hóa đơn | Secondary (outline) | Grid 2 cột (50/50) | Mở modal In hóa đơn (xem mục 8) |
| 1 | In nhãn thuốc | Secondary (outline) | Grid 2 cột (50/50) | Mở modal In nhãn thuốc OTC (xem mục 9) |
| 2 | Đơn hàng mới | Primary (filled) | Full width | Reset màn hình bán OTC, sẵn sàng đơn mới |

"In hóa đơn" và "In nhãn thuốc" nằm ngang cạnh nhau. "Đơn hàng mới" nằm dưới, full width, là action chính.

---

## 7. View: Lịch sử bán OTC hôm nay

Thay thế nội dung tab OTC (không phải modal). Có nút quay lại màn bán hàng.

### 7.1 Header

- Tiêu đề: "Lịch sử bán OTC hôm nay"
- Nút "← Quay lại bán hàng" căn phải

### 7.2 Metric cards

Grid 3 cột:

| Metric | Giá trị | Ghi chú |
|---|---|---|
| Số đơn hôm nay | Tổng đơn OTC trong ngày | |
| Doanh thu OTC | Tổng tiền đã thu trong ngày | Format: X.XXX.XXXđ |
| Sản phẩm đã bán | Tổng số lượng sản phẩm đã bán | |

### 7.3 Bảng lịch sử

| Cột | Nội dung |
|---|---|
| Mã đơn | OTC-YYYYMMDD-XXXX (font-size 12px, tertiary) |
| Khách hàng | Tên (font-weight 500) + SĐT (sub-label) |
| Thời gian | HH:mm |
| Sản phẩm | "[N] sản phẩm" |
| Tổng tiền | Số tiền (font-weight 500) |
| Thanh toán | Phương thức thanh toán |
| Actions | Three-dot menu |

Sắp xếp: thời gian giảm dần (đơn mới nhất lên đầu).

### 7.4 Three-dot dropdown

| Action | Mô tả |
|---|---|
| Xem chi tiết | Mở modal chi tiết đơn OTC (read-only, tương tự hóa đơn) |
| In hóa đơn | Mở modal In hóa đơn (xem mục 8) |
| In nhãn thuốc | Mở modal In nhãn thuốc OTC (xem mục 9) |

---

## 8. Modal: In hóa đơn

Preview hóa đơn bán hàng OTC trước khi in.

### 8.1 Header modal

- Tiêu đề: "In hóa đơn — [Tên khách hàng]"
- Nút đóng (×) ở góc phải

### 8.2 Mô tả

"Xem trước hóa đơn bán hàng OTC." — font-size 12px, secondary.

### 8.3 Vùng preview hóa đơn

Card border mô phỏng giấy in.

**Header hóa đơn** (căn giữa):

| Dòng | Nội dung |
|---|---|
| 1 | "PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28" |
| 2 | Địa chỉ + SĐT phòng khám |
| 3 | "HÓA ĐƠN BÁN HÀNG" |
| 4 | "Số: OTC-YYYYMMDD-XXXX" |

**Thông tin khách** (grid 2 cột):

| Field | Nội dung |
|---|---|
| Khách hàng | Tên khách |
| SĐT | Số điện thoại (mask 4 số cuối) |
| Ngày | DD/MM/YYYY, HH:mm |
| Thu ngân | "DS. [Tên dược sĩ]" |

**Bảng sản phẩm:**

| Cột | Nội dung |
|---|---|
| STT | Số thứ tự |
| Sản phẩm | Tên sản phẩm (font-weight 500) |
| ĐVT | Đơn vị tính (lọ, hộp, tuýp...) |
| SL | Số lượng |
| Đơn giá | Giá bán (căn phải) |
| Thành tiền | SL × đơn giá (căn phải, font-weight 500) |

**Tổng cộng:** Căn phải, font-size 14px, font-weight 500. Dòng dưới: phương thức thanh toán.

**Chân hóa đơn:** "Cảm ơn quý khách!" (trái) + "PK Ganka28" (phải).

### 8.4 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Tải PDF | Secondary (outline) | Tải hóa đơn dạng PDF |
| In hóa đơn | Primary (filled) | Gửi lệnh in |

---

## 9. Modal: In nhãn thuốc OTC

Preview nhãn dán cho sản phẩm OTC. Tương tự nhãn đơn thuốc kê đơn nhưng có vài khác biệt.

### 9.1 Header modal

- Tiêu đề: "In nhãn thuốc — [Tên khách hàng]"
- Nút đóng (×) ở góc phải

### 9.2 Mô tả

"Xem trước nhãn dán. Mỗi nhãn in trên giấy nhãn dán khổ nhỏ (70 × 35mm)."

### 9.3 Preview nhãn

Mỗi sản phẩm tạo 1 nhãn dạng card viền dashed:

| Vùng | Nội dung |
|---|---|
| Header trái | Tên sản phẩm (font-weight 500) |
| Header phải | "PK Ganka28" + ngày bán |
| Body dòng 1 | "KH: **[Tên khách]**" |
| Body dòng 2 | "Cách dùng: [hướng dẫn sử dụng]" |
| Footer trái | "DS. [Tên dược sĩ]" |
| Footer phải | "SL: [số lượng + đơn vị]" |

**Khác biệt so với nhãn đơn thuốc kê đơn:**

| Yếu tố | Đơn kê đơn | OTC |
|---|---|---|
| Prefix khách | "BN:" (bệnh nhân) | "KH:" (khách hàng) |
| Mã định danh | Mã BN (BN-YYYYMMDD-XXXX) | Không hiển thị mã |
| Người phụ trách | "BS. [tên]" (bác sĩ) | "DS. [tên]" (dược sĩ) |
| Cách dùng | Theo đơn BS | Theo hướng dẫn chung của sản phẩm |

### 9.4 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Chọn nhãn cần in | Secondary (outline) | Chọn in một số nhãn |
| In tất cả nhãn | Primary (filled) | In nhãn cho tất cả sản phẩm |

---

## 10. Mã đơn hàng OTC

Format: `OTC-YYYYMMDD-XXXX`

- OTC: prefix cố định
- YYYYMMDD: ngày bán
- XXXX: số thứ tự auto-increment trong ngày

---

## 11. Dữ liệu ghi nhận khi bán OTC

Mỗi đơn hàng OTC, hệ thống ghi nhận:

| Trường | Mô tả |
|---|---|
| otc_order_id | Mã đơn OTC (OTC-YYYYMMDD-XXXX) |
| customer_id | ID khách hàng |
| sold_by | ID dược sĩ bán hàng |
| sold_at | Timestamp bán hàng |
| payment_method | Phương thức thanh toán (cash / transfer / qr / card) |
| total_amount | Tổng tiền |
| items[] | Danh sách sản phẩm |
| items[].product_id | ID sản phẩm |
| items[].product_name | Tên sản phẩm |
| items[].quantity | Số lượng |
| items[].unit_price | Đơn giá |
| items[].subtotal | Thành tiền |

---

## 12. Quy tắc nghiệp vụ

| # | Quy tắc | Xử lý |
|---|---|---|
| R1 | Khách hàng bắt buộc | Không cho thanh toán nếu chưa chọn/tạo khách hàng. |
| R2 | Thông tin khách tối thiểu | Họ tên + SĐT. Không cần tạo hồ sơ bệnh án. |
| R3 | SĐT không trùng | Khi tạo khách mới, nếu SĐT đã tồn tại → hiển thị khách đã có, không tạo trùng. |
| R4 | Dược sĩ tự thu tiền | Không qua thu ngân. Dược sĩ xử lý toàn bộ flow. |
| R5 | Sản phẩm hết hàng | Không cho thêm vào đơn. Hiển thị greyed out + "Hết hàng" đỏ. |
| R6 | Bán OTC trừ tồn kho | Xác nhận thanh toán → tự động trừ tồn kho tương ứng. |
| R7 | Không cần đơn BS | Sản phẩm OTC không cần đơn bác sĩ. |
| R8 | Nhãn thuốc OTC | Ghi "KH:" thay "BN:", ghi "DS." thay "BS.", không hiển thị mã BN. |
| R9 | SĐT mask trên bản in | Mask 4 số cuối khi in hóa đơn (vd: 0987.xxx.xxx). |
| R10 | Xác nhận trước khi thanh toán | Click "Thanh toán" → popup xác nhận → click "Xác nhận thanh toán" mới hoàn tất. Tránh thanh toán nhầm. |

---

## 13. Tổng hợp các view

| # | View / Modal | Trigger | Loại |
|---|---|---|---|
| 1 | Màn hình bán OTC | Tab "Bán OTC" | Full page (2 cột POS) |
| 2 | Xác nhận thanh toán | Nút "Thanh toán [số tiền]" | Modal, confirmation |
| 3 | Tạo khách hàng mới | Link "+ Tạo khách hàng mới" | Modal, editable |
| 4 | Thanh toán thành công | Sau khi xác nhận thanh toán | Modal, confirmation |
| 5 | Lịch sử bán OTC hôm nay | Link "Xem lịch sử bán OTC hôm nay" | Full page (thay nội dung tab) |
| 6 | In hóa đơn | Nút "In hóa đơn" (từ modal TT thành công hoặc lịch sử) | Modal, preview + print |
| 7 | In nhãn thuốc OTC | Nút "In nhãn thuốc" (từ modal TT thành công hoặc lịch sử) | Modal, preview + print |
