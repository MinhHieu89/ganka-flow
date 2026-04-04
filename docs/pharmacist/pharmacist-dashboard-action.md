# Pharmacist Dashboard — Functional Specification (UI)

**Module:** Nhà thuốc (Pharmacy)
**Role:** Dược sĩ (Pharmacist)
**Route:** `/dashboard` (role = pharmacist)
**Version:** 2.0
**Ngày:** 2026-04-04

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

Chỉ có **2 trạng thái**, không có trạng thái trung gian.

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
| Phát thuốc | Primary (accent color) | Mở modal Phát thuốc (xem mục 5) |
| Xem đơn thuốc | Normal | Mở modal xem đơn thuốc read-only (xem mục 6) |
| — | Separator | — |
| In đơn thuốc | Normal | In đơn thuốc ra giấy |

**Khi trạng thái = "Đã phát":**

| Action | Loại | Mô tả |
|---|---|---|
| Xem đơn thuốc | Normal | Xem đơn thuốc gốc từ BS (xem mục 6) |
| Xem chi tiết phát thuốc | Normal | Xem chi tiết thuốc đã phát (xem mục 7) |
| — | Separator | — |
| In đơn thuốc | Normal | In đơn thuốc |
| In nhãn thuốc | Normal | Mở modal preview nhãn thuốc (xem mục 9) |

---

## 5. Modal: Phát thuốc

Mở khi dược sĩ click action "Phát thuốc" từ dropdown. Đây là màn hình chính để dược sĩ soạn và xác nhận phát thuốc.

### 5.1 Header modal

- Tiêu đề: "Phát thuốc — [Tên bệnh nhân]"
- Nút đóng (×) ở góc phải

### 5.2 Banner dị ứng (conditional)

Chỉ hiển thị khi bệnh nhân có tiền sử dị ứng thuốc.

- Background đỏ nhạt, icon ⚠, text đỏ
- Nội dung: "Dị ứng: **[tên thành phần]**"
- Không hiển thị text giải thích thêm — dược sĩ tự biết cách xử lý
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
| Tên thuốc | Chỉ tên thuốc (không hiển thị nhóm thuốc) | 30% |
| Liều dùng | Cách dùng chi tiết | auto |
| SL | Số lượng + đơn vị | auto |
| Thao tác | Nút "✎ Sửa" (chỉ khi có thay thế) | 80px |

**Không có cột Tồn kho.** Chỉ hiển thị indicator inline dưới tên thuốc khi có vấn đề:

| Trường hợp | Hiển thị |
|---|---|
| Đủ hàng | Không hiển thị gì |
| Hết hàng hoặc không đủ SL | Badge đỏ "✗ Hết hàng" inline dưới tên thuốc gốc |

Không hiển thị cảnh báo "Tồn kho thấp" — chỉ cảnh báo khi thực sự không phát được.

#### Thay thế thuốc:

Khi dược sĩ cần thay thuốc tương đương (do hết hàng hoặc lý do khác):

- Thuốc gốc (BS kê): text gạch ngang, màu tertiary
- Badge "✗ Hết hàng" ngay dưới tên thuốc gốc
- Thuốc thay thế: dòng tiếp theo, font-weight 500, accent color, prefix "→ [tên thuốc thay thế]"
- Sub-label: "Thay thế tương đương" (accent color, font-size 11px)
- Cột thao tác: nút "✎ Sửa" — mở modal Thay thế thuốc (xem mục 8)

### 5.6 Lý do thay thế thuốc (conditional)

Chỉ hiển thị khi có ít nhất 1 thuốc được thay thế.

- Text area có sẵn nội dung mặc định (dược sĩ có thể sửa)
- Bắt buộc nhập khi có thuốc thay thế — không cho xác nhận phát thuốc nếu để trống

### 5.7 Footer modal

3 nút căn phải:

| Nút | Loại | Mô tả |
|---|---|---|
| In nhãn thuốc | Secondary (outline) | Mở modal In nhãn thuốc (xem mục 9) |
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

## 6. Modal: Xem đơn thuốc (read-only)

Mở khi dược sĩ click action "Xem đơn thuốc". Hiển thị đơn thuốc gốc từ BS, không cho chỉnh sửa.

### 6.1 Header modal

- Tiêu đề: "Xem đơn thuốc"
- Tag trạng thái bên cạnh tiêu đề: "Chờ phát" (vàng) hoặc "Đã phát" (xanh lá)
- Nút đóng (×) ở góc phải

### 6.2 Thông tin đơn thuốc

Grid 2 cột, 6 fields:

| Field | Nội dung |
|---|---|
| Bệnh nhân | Tên bệnh nhân |
| Mã BN | BN-YYYYMMDD-XXXX |
| BS kê đơn | Tên bác sĩ |
| Ngày kê | DD/MM/YYYY, HH:mm |
| Chẩn đoán | Tên chẩn đoán + mã ICD (nếu có) |
| Hạn đơn | DD/MM/YYYY (còn X ngày) |

### 6.3 Ghi chú BS (conditional)

Giống mục 5.4.

### 6.4 Bảng thuốc

| Cột | Nội dung |
|---|---|
| Tên thuốc | Chỉ tên thuốc (không hiển thị nhóm thuốc) |
| Liều dùng | Cách dùng chi tiết |
| Số lượng | Số lượng + đơn vị |

Không có cột Tồn kho, không có cột Thao tác. Đây là view read-only.

### 6.5 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| In đơn thuốc | Secondary (outline) | In đơn thuốc ra giấy |
| Phát thuốc | Primary (filled) | Chuyển sang modal Phát thuốc (chỉ hiển thị khi trạng thái = "Chờ phát") |

---

## 7. Modal: Chi tiết phát thuốc (read-only)

Mở khi dược sĩ click action "Xem chi tiết phát thuốc" cho đơn đã phát. Hiển thị so sánh thuốc BS kê vs thuốc thực tế đã phát.

### 7.1 Header modal

- Tiêu đề: "Chi tiết phát thuốc"
- Tag trạng thái: "Đã phát" (xanh lá)
- Nút đóng (×) ở góc phải

### 7.2 Thông tin đơn thuốc

Grid 2 cột, 4 fields: Bệnh nhân, Mã BN, BS kê đơn, Chẩn đoán.

### 7.3 Metadata phát thuốc

Thanh nền secondary, hiển thị 2 thông tin:
- Dược sĩ phát: [Tên dược sĩ]
- Thời gian: DD/MM/YYYY, HH:mm

### 7.4 Bảng thuốc đã phát

| Cột | Nội dung |
|---|---|
| Thuốc kê (BS) | Tên thuốc gốc BS kê. Nếu đã thay thế → text gạch ngang, màu tertiary |
| Thuốc phát (thực tế) | Tên thuốc thực tế đã phát. Nếu khác thuốc gốc → accent color + sub-label "→ Thay thế tương đương" |
| Liều dùng | Cách dùng chi tiết |
| SL | Số lượng + đơn vị |

### 7.5 Lý do thay thế (conditional)

Chỉ hiển thị khi đơn có thuốc đã thay thế. Hiển thị read-only trong box border.

### 7.6 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| In nhãn thuốc | Secondary (outline) | Mở modal In nhãn thuốc (xem mục 9) |
| In đơn thuốc | Secondary (outline) | In đơn thuốc |

---

## 8. Modal: Thay thế thuốc

Sub-modal mở khi dược sĩ click nút "Thay thế" hoặc "✎ Sửa" trên dòng thuốc hết hàng trong modal Phát thuốc.

### 8.1 Header modal

- Tiêu đề: "Thay thế thuốc"
- Nút đóng (×) ở góc phải

### 8.2 Thông tin thuốc gốc

Thanh nền secondary ngay dưới header:
- "Thuốc gốc: **[tên thuốc]** — Hết hàng" (badge đỏ)

### 8.3 Tìm kiếm thuốc thay thế

- Search box: placeholder "Tìm thuốc thay thế..."
- Kết quả hiển thị dạng danh sách phẳng (không phân nhóm — dược sĩ tự biết các loại thuốc)
- Mỗi kết quả gồm: tên thuốc (font-weight 500), nhà sản xuất + quy cách (sub-label), tồn kho (căn phải)
- Thuốc hết hàng: tên màu tertiary, tồn kho badge đỏ "✗ Hết"
- Thuốc được chọn: background accent nhạt, tên màu accent

### 8.4 Lý do thay thế

- Label: "Lý do thay thế" + dấu * đỏ (bắt buộc)
- Textarea, height 60px
- Có thể pre-fill nội dung mặc định: "[Thuốc gốc] hết hàng, thay bằng [thuốc thay thế] — cùng nhóm [nhóm dược lý]."
- Dược sĩ có thể sửa

### 8.5 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Hủy | Secondary (outline) | Đóng modal, không thay đổi |
| Xác nhận thay thế | Primary (filled) | Cập nhật thuốc thay thế lên bảng thuốc ở modal Phát thuốc |

**Validation:** Phải chọn thuốc thay thế có tồn kho đủ + lý do không được để trống.

---

## 9. Modal: In nhãn thuốc

Mở khi dược sĩ click nút "In nhãn thuốc". Hiển thị preview nhãn dán cho từng thuốc trong đơn.

### 9.1 Header modal

- Tiêu đề: "In nhãn thuốc — [Tên bệnh nhân]"
- Nút đóng (×) ở góc phải

### 9.2 Mô tả

Text mô tả: "Xem trước nhãn dán cho từng thuốc. Mỗi nhãn sẽ in trên giấy nhãn dán khổ nhỏ (70 × 35mm)."

### 9.3 Preview nhãn

Mỗi thuốc trong đơn tạo 1 nhãn dạng card viền dashed. Nội dung mỗi nhãn:

| Vùng | Nội dung |
|---|---|
| Header trái | Tên thuốc (font-weight 500). Nếu là thuốc thay thế → accent color + "(thay [thuốc gốc])" |
| Header phải | "PK Ganka28" + ngày phát |
| Body dòng 1 | "BN: **[Tên BN]** — [Mã BN]" |
| Body dòng 2 | "Cách dùng: [liều dùng chi tiết]" |
| Footer trái | Tên BS kê đơn |
| Footer phải | "SL: [số lượng + đơn vị]" |

### 9.4 Footer modal

| Nút | Loại | Mô tả |
|---|---|---|
| Chọn nhãn cần in | Secondary (outline) | Cho phép chọn in một số nhãn (không bắt buộc in tất cả) |
| In tất cả nhãn | Primary (filled) | In nhãn cho tất cả thuốc trong đơn |

---

## 10. Tab 2: Bán OTC

*(Thiết kế chi tiết ở spec riêng — `pharmacist-otc.md`)*

**Scope:** Bán thuốc không kê đơn (OTC) cho khách vãng lai.

**Yêu cầu chính:**
- Tra cứu / tạo nhanh hồ sơ khách hàng (tối thiểu: Họ tên + SĐT) — phục vụ loyalty & VIP
- Chọn sản phẩm từ danh mục thuốc OTC
- Tính tiền và xác nhận thanh toán
- Trừ tồn kho
- In hóa đơn

---

## 11. Tab 3: Tồn kho

*(Thiết kế chi tiết ở spec riêng — `pharmacist-inventory.md`)*

**Scope:** Quản lý nhập/xuất/tồn kho thuốc.

**Yêu cầu chính:**
- Danh sách thuốc với tồn kho hiện tại, mức tối thiểu, hạn sử dụng
- Cảnh báo: thuốc dưới mức tối thiểu, thuốc sắp hết hạn
- Nhập kho: từ hóa đơn nhà cung cấp (scan/nhập tay) hoặc import Excel
- Lịch sử xuất/nhập kho
- Thiết lập mức tồn kho tối thiểu cho từng thuốc

---

## 12. Nguyên tắc hiển thị chung

| Nguyên tắc | Mô tả |
|---|---|
| Không hiển thị nhóm thuốc | Tất cả bảng thuốc chỉ hiển thị tên thuốc, không có sub-label nhóm (vd: "Corticoid nhỏ mắt", "Thực phẩm chức năng"). Dược sĩ tự biết phân loại. |
| Tồn kho chỉ cảnh báo khi cần hành động | Trong modal Phát thuốc, không hiển thị cột tồn kho. Chỉ hiển thị badge "✗ Hết hàng" inline khi thuốc thực sự không phát được. |
| Banner dị ứng gọn | Chỉ hiển thị tên thành phần dị ứng, không giải thích thêm. |
| Three-dot dropdown | Nhất quán với pattern đã dùng ở Technician dashboard. |

---

## 13. Dữ liệu ghi nhận khi phát thuốc

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

## 14. Quy tắc nghiệp vụ

| # | Quy tắc | Xử lý |
|---|---|---|
| R1 | Đơn thuốc có hạn 7 ngày | Hiển thị cảnh báo khi còn ≤ 2 ngày. Không cho phát khi quá hạn. |
| R2 | Dược sĩ được thay thuốc tương đương | Bắt buộc ghi nhận thuốc gốc + thuốc thay thế + lý do. |
| R3 | Cảnh báo dị ứng | Nếu bệnh nhân dị ứng thành phần có trong đơn → block phát thuốc cho đến khi thay thế. |
| R4 | Bệnh nhân đã thanh toán trước khi phát thuốc | Đơn chỉ xuất hiện trong hàng đợi sau khi thu ngân xác nhận thanh toán. |
| R5 | Khách vãng lai mua OTC | Cần đăng ký tối thiểu (Họ tên + SĐT) — phục vụ loyalty & VIP. Không cần tạo hồ sơ bệnh án. |
| R6 | Tồn kho tối thiểu | Thiết lập cho từng thuốc. Khi tồn kho < mức tối thiểu → cảnh báo trên metric card + highlight trong tab Tồn kho. |
| R7 | Phát thuốc trừ tồn kho | Xác nhận phát thuốc → tự động trừ tồn kho tương ứng. |

---

## 15. Print templates

| Template | Trigger | Nội dung |
|---|---|---|
| Đơn thuốc | Nút "In đơn thuốc" | Thông tin BN, BS, chẩn đoán, danh sách thuốc (bao gồm thay thế nếu có), liều dùng, ghi chú |
| Nhãn thuốc | Nút "In nhãn thuốc" → modal preview | Nhãn dán từng thuốc: tên thuốc, cách dùng, tên BN, mã BN, ngày phát, BS kê đơn, số lượng. Khổ 70 × 35mm. |

---

## 16. Tổng hợp các modal

| # | Modal | Trigger | Loại |
|---|---|---|---|
| 1 | Phát thuốc | Dropdown → "Phát thuốc" (trạng thái Chờ phát) | Editable |
| 2 | Xem đơn thuốc | Dropdown → "Xem đơn thuốc" (cả 2 trạng thái) | Read-only |
| 3 | Chi tiết phát thuốc | Dropdown → "Xem chi tiết phát thuốc" (trạng thái Đã phát) | Read-only |
| 4 | Thay thế thuốc | Nút "Thay thế" / "✎ Sửa" trong modal Phát thuốc | Sub-modal, editable |
| 5 | In nhãn thuốc | Nút "In nhãn thuốc" trong modal Phát thuốc hoặc Chi tiết phát thuốc | Preview + print |

---

## 17. Spec files liên quan

| File | Mô tả | Trạng thái |
|---|---|---|
| `pharmacist-dashboard.md` | Dashboard + tất cả modal actions | ✅ File này |
| `pharmacist-otc.md` | Tab Bán OTC — chi tiết | 🔲 Chưa thiết kế |
| `pharmacist-inventory.md` | Tab Tồn kho — chi tiết | 🔲 Chưa thiết kế |
