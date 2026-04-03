# Pharmacist Dashboard — Functional Specification (UI)

**Module:** Nhà thuốc (Pharmacy)
**Role:** Dược sĩ (Pharmacist)
**Route:** `/dashboard` (role = pharmacist)
**Version:** 1.0
**Ngày:** 2026-04-03

---

## 1. Tổng quan

Màn hình chính của Dược sĩ sau khi đăng nhập. Cho phép:

- Nhận và phát thuốc theo đơn từ bác sĩ (đã thanh toán)
- Bán thuốc OTC cho khách vãng lai (không cần đơn BS)
- Quản lý tồn kho thuốc (nhập/xuất/tồn, cảnh báo)

**Không thuộc scope Dược sĩ:** Đơn kính (eyeglass prescription) — do bộ phận quang học riêng xử lý.

---

## 2. Flow tổng thể

```
BS kê đơn → Thu ngân thu tiền → Đơn thuốc xuất hiện trong hàng đợi Dược sĩ → Dược sĩ phát thuốc
```

Khi đơn thuốc đến dược sĩ, bệnh nhân **đã thanh toán xong**. Dược sĩ chỉ thực hiện phát thuốc, không thu tiền.

---

## 3. Layout tổng thể

### 3.1 Header

| Thành phần | Mô tả |
|---|---|
| Tiêu đề | "Nhà thuốc" — căn trái, font-size 20px, font-weight 500 |
| Badge role | "Dược sĩ: [Tên nhân viên]" — căn phải, badge info style |

### 3.2 Tab navigation

Ba tab ngang, nằm ngay dưới header, phân cách bằng border-bottom:

| Tab | Label | Badge | Mặc định |
|---|---|---|---|
| 1 | Hàng đợi đơn thuốc | Số đơn chờ phát (đỏ) | **Active** |
| 2 | Bán OTC | — | — |
| 3 | Tồn kho | — | — |

Tab active: font-weight 500, border-bottom 2px solid accent color.

---

## 4. Tab 1: Hàng đợi đơn thuốc

### 4.1 Metric cards

Grid 3 cột, hiển thị trên đầu tab:

| Metric | Giá trị | Màu giá trị | Ghi chú |
|---|---|---|---|
| Chờ phát thuốc | Số đơn đang chờ | Vàng (warn) | Đếm realtime từ queue |
| Đã phát hôm nay | Tổng đơn đã phát trong ngày | Mặc định | Reset mỗi ngày |
| Cảnh báo tồn kho | Số thuốc dưới mức tối thiểu | Đỏ (danger) | Link sang tab Tồn kho khi click |

### 4.2 Filter bar

Gồm 2 phần trên cùng 1 hàng:

**Bên trái — Search box:**
- Placeholder: "Tìm theo tên, mã BN, BS kê đơn..."
- Tìm kiếm realtime (debounce 300ms)
- Scope: tìm trong tất cả đơn thuốc trong ngày

**Bên phải — Filter pills:**

| Pill | Logic lọc |
|---|---|
| Tất cả | Hiển thị tất cả đơn (mặc định, active) |
| Chờ phát | Chỉ đơn có trạng thái "Chờ phát" |
| Đã phát | Chỉ đơn có trạng thái "Đã phát" |

Chỉ 1 pill active tại 1 thời điểm. Click pill khác → chuyển active.

### 4.3 Bảng đơn thuốc

#### Cấu trúc cột:

| Cột | Nội dung | Width |
|---|---|---|
| Bệnh nhân | Tên (font-weight 500) + mã BN (font-size 11px, tertiary) | auto |
| BS kê đơn | Tên bác sĩ | auto |
| Thời gian | Giờ kê đơn + elapsed time (vd: "18 phút trước") | auto |
| Số thuốc | Badge dạng pill (vd: "4 thuốc") | auto |
| Trạng thái | Status badge | auto |
| Actions | Three-dot menu | 40px |

#### Sắp xếp mặc định:
- Đơn "Chờ phát" lên trước, sắp theo thời gian tăng dần (đơn cũ nhất lên đầu — FIFO)
- Đơn "Đã phát" xuống dưới, sắp theo thời gian giảm dần (phát gần nhất lên đầu)

#### Trạng thái đơn thuốc:

| Trạng thái | Label | Màu | Trigger chuyển trạng thái |
|---|---|---|---|
| Chờ phát | Chờ phát | Vàng (amber) | Thu ngân xác nhận thanh toán → đơn xuất hiện |
| Đã phát | Đã phát | Xanh lá (green) | Dược sĩ click "Xác nhận phát thuốc" |

Chỉ có **2 trạng thái**, không có trạng thái trung gian "Đang phát".

#### Dòng cảnh báo dị ứng:
- Nếu bệnh nhân có tiền sử dị ứng thuốc → hiển thị icon ⚠ màu vàng ngay sau tên
- Dòng có background highlight nhẹ (amber tint) để dược sĩ chú ý

#### Elapsed time logic:
- < 60 phút: hiển thị "X phút trước"
- 60–120 phút: hiển thị "1hXX phút trước"
- > 120 phút: hiển thị "Xh trước"
- Đơn "Đã phát": chỉ hiển thị giờ, không hiển thị elapsed

### 4.4 Three-dot dropdown — Actions theo trạng thái

**Khi trạng thái = "Chờ phát":**

| Action | Loại | Mô tả |
|---|---|---|
| Phát thuốc | Primary (accent color) | Mở modal Phát thuốc |
| Xem đơn thuốc | Normal | Mở modal xem chi tiết đơn (read-only) |
| — | Separator | — |
| In đơn thuốc | Normal | In đơn thuốc ra giấy |

**Khi trạng thái = "Đã phát":**

| Action | Loại | Mô tả |
|---|---|---|
| Xem đơn thuốc | Normal | Xem đơn thuốc gốc từ BS |
| Xem chi tiết phát thuốc | Normal | Xem chi tiết thuốc đã phát (bao gồm thay thế nếu có) |
| — | Separator | — |
| In đơn thuốc | Normal | In đơn thuốc |
| In nhãn thuốc | Normal | In nhãn dán cho từng thuốc |

---

## 5. Modal: Phát thuốc

Mở khi dược sĩ click action "Phát thuốc" từ dropdown. Đây là màn hình chính để dược sĩ soạn và xác nhận phát thuốc.

### 5.1 Header modal

- Tiêu đề: "Phát thuốc — [Tên bệnh nhân]"
- Nút đóng (×) ở góc phải

### 5.2 Banner dị ứng (conditional)

Chỉ hiển thị khi bệnh nhân có tiền sử dị ứng thuốc.

- Background đỏ nhạt, icon ⚠, text đỏ
- Nội dung: "Dị ứng: **[tên thành phần]** — Hệ thống sẽ cảnh báo nếu đơn thuốc chứa thành phần này"
- Nếu thuốc trong đơn chứa thành phần dị ứng → highlight dòng thuốc đó + không cho phát thuốc cho đến khi thay thế

### 5.3 Thông tin đơn thuốc

Grid 2 cột, 4 fields:

| Field | Nội dung | Ghi chú |
|---|---|---|
| Mã bệnh nhân | BN-YYYYMMDD-XXXX | Format chuẩn |
| BS kê đơn | Tên bác sĩ | |
| Chẩn đoán | Tên chẩn đoán + mã ICD (nếu có) | |
| Hạn đơn thuốc | DD/MM/YYYY (còn X ngày) | Đỏ nếu còn ≤ 2 ngày, không cho phát nếu quá hạn |

### 5.4 Ghi chú BS (conditional)

Hiển thị nếu BS có ghi chú đặc biệt trên đơn thuốc. Background secondary, font-size 12px.

### 5.5 Bảng thuốc trong đơn

#### Cấu trúc cột:

| Cột | Nội dung | Width |
|---|---|---|
| Tên thuốc | Tên + nhóm thuốc (sub-label) | 30% |
| Liều dùng | Cách dùng chi tiết | auto |
| Số lượng | Số lượng + đơn vị | auto |
| Tồn kho | Trạng thái tồn kho | auto |
| Thao tác | Nút thay thế (nếu cần) | 90px |

#### Trạng thái tồn kho mỗi dòng thuốc:

| Trạng thái | Hiển thị | Màu | Điều kiện |
|---|---|---|---|
| Đủ hàng | ✓ [số lượng] [đơn vị] | Xanh lá | Tồn kho ≥ số lượng cần |
| Sắp hết | ⚠ [số lượng] [đơn vị] | Vàng | Tồn kho < mức tối thiểu nhưng vẫn ≥ số lượng cần |
| Hết hàng | ✗ Hết hàng | Đỏ | Tồn kho = 0 hoặc < số lượng cần |

#### Thay thế thuốc:

Khi dược sĩ cần thay thuốc tương đương (do hết hàng hoặc lý do khác):

- Thuốc gốc (BS kê): hiển thị với text gạch ngang, màu tertiary
- Thuốc thay thế: hiển thị bên dưới thuốc gốc, font-weight 500, accent color, prefix "→"
- Sub-label: "Thay thế tương đương"
- Cột tồn kho: hiển thị trạng thái thuốc gốc (Hết hàng) → trạng thái thuốc thay thế
- Cột thao tác: nút "✎ Sửa" — cho phép chỉnh sửa thuốc thay thế

**Flow thay thế thuốc:**
1. Dược sĩ click nút "Thay thế" trên dòng thuốc hết hàng
2. Popup chọn thuốc thay thế: tìm kiếm từ danh mục thuốc cùng nhóm
3. Chọn thuốc → cập nhật dòng thuốc trên bảng
4. Bắt buộc nhập lý do thay thế

### 5.6 Lý do thay thế thuốc (conditional)

Chỉ hiển thị khi có ít nhất 1 thuốc được thay thế.

- Text area có sẵn nội dung mặc định (dược sĩ có thể sửa)
- Bắt buộc nhập khi có thuốc thay thế — không cho xác nhận phát thuốc nếu để trống

### 5.7 Footer modal

3 nút căn phải:

| Nút | Loại | Mô tả |
|---|---|---|
| In nhãn thuốc | Secondary (outline) | In nhãn dán cho từng thuốc trong đơn |
| In đơn thuốc | Secondary (outline) | In đơn thuốc (bao gồm thuốc thay thế nếu có) |
| Xác nhận phát thuốc | Primary (filled) | Chuyển trạng thái đơn → "Đã phát", trừ tồn kho |

**Validation trước khi xác nhận:**
- Đơn thuốc chưa quá hạn (≤ 7 ngày)
- Tất cả thuốc trong đơn đều có đủ tồn kho (hoặc đã thay thế bằng thuốc có tồn kho)
- Nếu có thuốc thay thế → lý do thay thế không được để trống
- Nếu có thuốc chứa thành phần dị ứng → phải thay thế trước khi xác nhận

**Sau khi xác nhận:**
- Trạng thái đơn → "Đã phát"
- Tồn kho thuốc bị trừ tương ứng
- Ghi nhận thời gian phát, dược sĩ phát, chi tiết thuốc (bao gồm thay thế)
- Dòng đơn trong bảng cập nhật trạng thái
- Modal đóng, quay về bảng hàng đợi

---

## 6. Tab 2: Bán OTC

*(Thiết kế chi tiết ở spec riêng — `pharmacist-otc.md`)*

**Scope:** Bán thuốc không kê đơn (OTC) cho khách vãng lai. Bao gồm: nước mắt nhân tạo, Omega-3, thực phẩm chức năng, thuốc nhỏ mắt OTC.

**Yêu cầu chính:**
- Tra cứu / tạo nhanh hồ sơ khách hàng (tối thiểu: Họ tên + SĐT) — phục vụ loyalty & VIP
- Chọn sản phẩm từ danh mục thuốc OTC
- Tính tiền và xác nhận thanh toán
- Trừ tồn kho
- In hóa đơn

---

## 7. Tab 3: Tồn kho

*(Thiết kế chi tiết ở spec riêng — `pharmacist-inventory.md`)*

**Scope:** Quản lý nhập/xuất/tồn kho thuốc.

**Yêu cầu chính:**
- Danh sách thuốc với tồn kho hiện tại, mức tối thiểu, hạn sử dụng
- Cảnh báo: thuốc dưới mức tối thiểu, thuốc sắp hết hạn
- Nhập kho: từ hóa đơn nhà cung cấp (scan/nhập tay) hoặc import Excel
- Lịch sử xuất/nhập kho
- Thiết lập mức tồn kho tối thiểu cho từng thuốc

---

## 8. Dữ liệu ghi nhận khi phát thuốc

Mỗi lần phát thuốc, hệ thống ghi nhận:

| Trường | Mô tả |
|---|---|
| prescription_id | ID đơn thuốc từ BS |
| patient_id | Mã bệnh nhân |
| dispensed_by | ID dược sĩ phát thuốc |
| dispensed_at | Timestamp phát thuốc |
| items[] | Danh sách thuốc đã phát |
| items[].original_medication | Thuốc gốc BS kê |
| items[].dispensed_medication | Thuốc thực tế phát (= gốc hoặc thay thế) |
| items[].quantity | Số lượng phát |
| items[].is_substituted | Boolean — có thay thế không |
| substitution_reason | Lý do thay thế (nếu có) |

---

## 9. Quy tắc nghiệp vụ

| # | Quy tắc | Xử lý |
|---|---|---|
| R1 | Đơn thuốc có hạn 7 ngày | Hiển thị cảnh báo khi còn ≤ 2 ngày. Không cho phát khi quá hạn. |
| R2 | Dược sĩ được thay thuốc tương đương | Bắt buộc ghi nhận thuốc gốc + thuốc thay thế + lý do. |
| R3 | Cảnh báo dị ứng | Nếu bệnh nhân dị ứng thành phần có trong đơn → block phát thuốc cho đến khi thay thế. |
| R4 | Bệnh nhân đã thanh toán trước khi phát thuốc | Đơn chỉ xuất hiện trong hàng đợi sau khi thu ngân xác nhận thanh toán. |
| R5 | Khách vãng lai mua OTC | Cần đăng ký tối thiểu (Họ tên + SĐT) — phục vụ loyalty & VIP. Không cần tạo hồ sơ bệnh án. |
| R6 | Tồn kho tối thiểu | Thiết lập cho từng thuốc. Khi tồn kho < mức tối thiểu → cảnh báo trên metric card + highlight trong danh sách. |
| R7 | Phát thuốc trừ tồn kho | Xác nhận phát thuốc → tự động trừ tồn kho tương ứng. |

---

## 10. Print templates

| Template | Trigger | Nội dung |
|---|---|---|
| Đơn thuốc | Nút "In đơn thuốc" | Thông tin BN, BS, chẩn đoán, danh sách thuốc (bao gồm thay thế nếu có), liều dùng, ghi chú |
| Nhãn thuốc | Nút "In nhãn thuốc" | In nhãn dán cho từng thuốc: tên thuốc, liều dùng, tên BN, ngày phát |

---

## 11. Spec files liên quan

| File | Mô tả | Trạng thái |
|---|---|---|
| `pharmacist-dashboard.md` | Màn hình chính + modal phát thuốc | ✅ File này |
| `pharmacist-otc.md` | Tab Bán OTC — chi tiết | 🔲 Chưa thiết kế |
| `pharmacist-inventory.md` | Tab Tồn kho — chi tiết | 🔲 Chưa thiết kế |
