# Trang chi tiết bệnh nhân

> **Route:** `/patients/:patient_id`
> **Roles:** Doctor, Receptionist, Technician, Admin
> **Version:** 1.0
> **Ngày:** 03/04/2026

---

## 1. Tổng quan

Trang hồ sơ tổng quan của một bệnh nhân. Khác với màn hình EMR (trang workflow khám bệnh), trang này là trang **profile** — hiển thị toàn bộ thông tin bệnh nhân, lịch sử khám, và xu hướng các chỉ số qua thời gian. Mọi role đều có thể truy cập.

### 1.1 Layout

```
┌──────────────────────────────────────────┐
│  ← Danh sách bệnh nhân (breadcrumb)     │
│                                          │
│  [Avatar]  Tên BN          [Actions]     │
│            Meta + Alert pills            │
│                                          │
│  ┌──────┬──────┬──────┬──────┐           │
│  │ Stat │ Stat │ Stat │ Stat │           │
│  └──────┴──────┴──────┴──────┘           │
│                                          │
│  [Tổng quan] [Lịch sử khám] [Xu hướng]  │
│  ─────────────────────────────────────   │
│                                          │
│  Tab content (scrollable)                │
│                                          │
└──────────────────────────────────────────┘
```

Single-page layout, không có sidebar. Max-width 960px, centered. Nội dung cuộn dọc.

---

## 2. Breadcrumb

Dòng đầu tiên, trên cùng trang.

- Text: "← Danh sách bệnh nhân"
- Click: navigate về `/patients` (patient list).
- Style: font-size 13px, color secondary, hover → primary.

---

## 3. Patient Header

### 3.1 Thành phần

| Vị trí | Thành phần | Chi tiết |
|--------|------------|----------|
| Trái | Avatar | Hình tròn 56px, initials từ tên, nền xanh nhạt |
| Giữa — dòng 1 | Họ tên | Font-size 22px, weight 500 |
| Giữa — dòng 2 | Meta info | Mã BN · Giới tính, tuổi (ngày sinh) · SĐT. Font-size 13px, color secondary. Cách nhau bằng `·` hoặc gap 16px |
| Giữa — dòng 3 | Alert pills | Các badge cảnh báo nổi bật |
| Phải | Action buttons | Chỉnh sửa, Xuất PDF, Tạo lượt khám |

### 3.2 Alert Pills

Hiển thị các thông tin cần chú ý ngay, lấy từ dữ liệu bệnh nhân.

| Loại | Điều kiện hiển thị | Style |
|------|-------------------|-------|
| Dị ứng | `patients.allergies IS NOT NULL` | Nền đỏ nhạt, text đỏ đậm. Format: "Dị ứng: {tên thuốc}" |
| Bệnh mắt | Có record trong `visit_medical_history` WHERE `category = 'eye'` | Nền xanh nhạt, text xanh đậm. Mỗi bệnh 1 pill |
| OSDI score | Có kết quả OSDI từ lần khám gần nhất AND score > 0 | Nền vàng nhạt, text vàng đậm. Format: "OSDI: {score}/30" |
| Red flag | Visit hiện tại có `red_flag = true` | Nền đỏ nhạt, text đỏ đậm. Format: "Red flag" |

Hiển thị tối đa 5 pills. Nếu nhiều hơn → hiển thị 4 + badge "+N".

### 3.3 Action Buttons

| Button | Quyền | Hành vi |
|--------|-------|---------|
| Chỉnh sửa | Receptionist, Admin | Mở form chỉnh sửa thông tin hành chính BN |
| Xuất PDF | Tất cả | Xuất báo cáo tổng hợp bệnh nhân (Module 5: Reporting) |
| Tạo lượt khám | Receptionist, Doctor | Navigate → tạo visit mới cho BN này. Nút primary (xanh lá) |

### 3.4 Separator

Sau header, border-bottom 0.5px separates header khỏi stat cards. Padding-bottom 20px.

---

## 4. Stat Cards

Grid 4 cột, ngay dưới header.

| Card | Giá trị | Sub-text | Logic |
|------|---------|----------|-------|
| Tổng lần khám | `COUNT(visits WHERE patient_id = X AND status = 'completed')` | "Lần đầu: {ngày visit đầu tiên}" | — |
| Lần khám gần nhất | `MAX(visit_date)` format DD/MM/YYYY | Tên BS của lần khám đó | — |
| Chẩn đoán hiện tại | Chẩn đoán chính từ lần khám gần nhất | Mã ICD + chẩn đoán phụ (nếu có) | Font-size 14px cho text dài |
| Tái khám tiếp theo | Ngày tái khám từ `follow_up_appointments` | Số ngày còn lại hoặc "Quá hạn X ngày" | Nếu quá hạn → text đỏ, value = "Quá hạn". Nếu không có lịch → value = "Không có", color secondary |

---

## 5. Tabs

3 tabs ngang, ngay dưới stat cards.

| Tab | Mô tả |
|-----|-------|
| Tổng quan | Thông tin cá nhân, tiền sử, đơn thuốc, đơn kính, chẩn đoán, số đo gần nhất |
| Lịch sử khám | Timeline tất cả lần khám, expand/collapse chi tiết |
| Xu hướng | Biểu đồ theo dõi các chỉ số qua thời gian |

Tab mặc định khi mở trang: **Tổng quan**.

---

## 6. Tab: Tổng quan

### 6.1 Section: Thông tin cá nhân + Tiền sử (Grid 2 cột)

**Card trái — Thông tin cá nhân:**

| Trường | Nguồn |
|--------|-------|
| Họ tên | `patients.full_name` |
| Ngày sinh | `patients.dob` + auto-calculate tuổi |
| Giới tính | `patients.gender` |
| Điện thoại | `patients.phone` |
| Địa chỉ | `patients.address` |
| Nghề nghiệp | `patients.occupation` |
| BHYT | `patients.insurance_number` (hiển thị "—" nếu null) |
| LH khẩn cấp | `patients.emergency_contact_name` (relationship) · `emergency_contact_phone` |

UI: Key-value list, key color secondary width 110px, value color primary.

**Card phải — Tiền sử & dị ứng:**

3 sub-sections với label 12px weight 500:

| Sub-section | Kiểu hiển thị |
|-------------|---------------|
| Bệnh mắt | Pills xanh + text mô tả bên dưới (color secondary) |
| Dị ứng | Pills đỏ |
| Toàn thân | Text. "Không có bệnh nền" nếu trống |

Nguồn: `visit_medical_history` từ lần khám gần nhất + `patients.allergies`.

### 6.2 Section: Đơn thuốc hiện tại

Section title: "Đơn thuốc hiện tại", font-size 15px, weight 500, margin-bottom 12px.

Nguồn: `visit_prescriptions` từ lần khám gần nhất (visit có status = 'completed', ORDER BY visit_date DESC LIMIT 1).

Mỗi thuốc hiển thị dạng row:

| Bên trái | Bên phải |
|----------|----------|
| **Tên thuốc** (13px, weight 500) | **Liều · Tần suất** + badge mắt (OU/OD/OS) |
| Mô tả / hoạt chất (12px, secondary) | Thời gian · Ngày kê · Tên BS (12px, secondary) |

Badge mắt: nhỏ gọn, nền secondary, text secondary, border-radius 4px, font-size 10px.

Nếu không có đơn thuốc: hiển thị text "Không có đơn thuốc hiện tại" color secondary, centered.

### 6.3 Section: Đơn kính hiện tại

Section title: "Đơn kính hiện tại".

Nguồn: `visit_optical_prescriptions` từ lần khám gần nhất có kê đơn kính.

**Layout:** Grid 2 cột (OD | OS), mỗi cột có nền secondary, border-radius 10px, padding 14px.

**Mỗi mắt hiển thị:**

| Trường | Format |
|--------|--------|
| Eye label | "Mắt phải (OD)" hoặc "Mắt trái (OS)" + dot màu (xanh/cam) |
| Sph | Metric card, label trên, value dưới (15px, weight 500) |
| Cyl | Metric card |
| Axis | Metric card, hiển thị kèm ° |

3 metric cards xếp ngang trong mỗi cột (grid 3 cột).

**Dưới grid OD/OS — Thông tin chung:**

Border-top separator, padding-top 14px. Hiển thị ngang:
- PD: {value} mm
- Loại kính: {value}
- Ngày kê: DD/MM/YYYY · Tên BS

Nếu không có đơn kính: hiển thị text "Không có đơn kính hiện tại" color secondary.

### 6.4 Section: Lịch sử chẩn đoán

Section title: "Lịch sử chẩn đoán".

Nguồn: Aggregate từ `visit_diagnoses` JOIN `visits`, group theo `master_diagnosis_id`.

Mỗi row hiển thị:

| Thành phần | Mô tả |
|------------|-------|
| Badge loại | "Chính" (xanh) / "Phụ" (xám) — lấy từ lần khám gần nhất |
| Tên chẩn đoán | Text 13px |
| Mã ICD | Text 12px, secondary |
| Khoảng thời gian | Format: "MM/YYYY → Hiện tại · N lần" hoặc "MM/YYYY → MM/YYYY" nếu đã resolved |

Logic loại chẩn đoán: lấy `sort_order` từ lần khám gần nhất. `sort_order = 0` → "Chính", còn lại → "Phụ".

Logic khoảng thời gian: lần xuất hiện đầu tiên → lần xuất hiện cuối cùng. Nếu lần cuối = lần khám gần nhất → "Hiện tại". Đếm số lần xuất hiện.

### 6.5 Section: Số đo gần nhất

Section title: "Số đo gần nhất — DD/MM/YYYY" (ngày lần khám gần nhất).

Grid 2x2, mỗi block có nền secondary, border-radius 10px, padding 14px.

**Block 1 — Thị lực & nhãn áp:**

```
OD  SC 20/40 · CC 20/25 · PH 20/20 · IOP 15
OS  SC 20/30 · CC 20/20 · PH 20/20 · IOP 14
```

Nguồn: `visit_measurements` WHERE `visit_id = latest_visit_id`.

**Block 2 — Khúc xạ (Auto-Ref):**

```
OD  -2.50 / -0.75 x 180
OS  -2.75 / -0.75 x 5
```

Format: `{Sph} / {Cyl} x {Axis}`.

**Block 3 — Khô mắt (Dry Eye):**

Chỉ hiển thị nếu lần khám gần nhất có `disease_group = 'dry_eye'` hoặc có dữ liệu TBUT/Schirmer.

```
OSDI-6: 18/30 [badge Trung bình]
OD  TBUT 7s · Schirmer 12mm · Meibomian: Tắc nhẹ
OS  TBUT 8s · Schirmer 10mm · Meibomian: BT
```

Nguồn: `visit_screening_responses` (OSDI) + `visit_exam_dry_eye` (TBUT, Schirmer, Meibomian).

**Block 4 — Sinh hiển vi & đáy mắt:**

Tóm tắt 1–2 dòng kết quả. Nếu tất cả bình thường → "Slit-lamp: Tất cả bình thường (OD & OS)". Nếu có bất thường → liệt kê cụ thể.

Nguồn: `visit_exam_slitlamp` + `visit_exam_fundus`.

**Formatting OD/OS:** "OD" in đậm màu xanh (#185FA5), "OS" in đậm màu cam (#993C1D). Thống nhất toàn trang.

---

## 7. Tab: Lịch sử khám

### 7.1 Layout

Timeline dọc, bên trái có đường line 1px và dot cho mỗi lần khám.

- Dot lần gần nhất: viền xanh lá, nền xanh nhạt (nhấn mạnh).
- Dot các lần còn lại: viền tertiary, nền trắng.
- Đường line: 1px, color border-tertiary.

### 7.2 Mỗi lần khám (Visit Card)

**Trạng thái mặc định: collapsed.** Lần khám gần nhất mặc định expanded.

**Phần collapsed (luôn hiện):**

| Thành phần | Vị trí | Chi tiết |
|------------|--------|----------|
| Ngày khám | Trái, 15px weight 500 | Format DD/MM/YYYY |
| Disease group badge | Cạnh ngày | Dry Eye (xanh) / Refraction (tím) / Myopia Control (xanh lá) / General (xám) |
| Tên BS | Dưới ngày, 12px secondary | "BS. {tên}" |
| Thời gian | Phải, 12px secondary | "X ngày trước" hoặc "Khám lần đầu" |
| Summary pills | Dưới tên BS | Chẩn đoán chính (pill xanh), chẩn đoán phụ (pill xám), tên thuốc, tái khám |

**Phần expanded (khi click):**

Border-top separator, padding-top 14px.

Hiển thị dạng grid 2 cột, nhiều hàng. Mỗi block là 1 measurement block (nền secondary, border-radius 10px, padding 14px):

| Hàng | Block trái | Block phải |
|------|-----------|------------|
| 1 | Thị lực & nhãn áp | Khúc xạ |
| 2 | Khô mắt (nếu Dry Eye visit) | Khám lâm sàng (SHV + Fundus) |
| 3 | Đơn thuốc | Dặn dò & tái khám |

Hàng 2 chỉ hiện nếu visit có dữ liệu tương ứng. Ví dụ Refraction visit sẽ không có block "Khô mắt" → hàng 2 chỉ có block "Khám lâm sàng" spanning full width, hoặc thay bằng block "Đơn kính" nếu có.

**Footer mỗi card:** Flex right, 3 buttons: "In phiếu", "Xuất PDF", "Xem đầy đủ".

| Button | Hành vi |
|--------|---------|
| In phiếu | Mở dialog chọn loại phiếu in cho lần khám này |
| Xuất PDF | Xuất PDF chi tiết lần khám (Module 5) |
| Xem đầy đủ | Navigate → `/doctor/exam/:visit_id` (read-only mode nếu visit đã completed) |

### 7.3 Pagination

- Mặc định hiển thị 5 lần khám gần nhất.
- Nếu nhiều hơn → nút "Tải thêm" ở cuối timeline.
- Lazy load: mỗi lần tải thêm 5 records.

### 7.4 Trường hợp đặc biệt

**Red flag visit:** Badge "Red flag" đỏ thay vì disease group badge. Summary hiển thị lý do red flag.

**Visit chưa hoàn tất:** Nếu visit có status = 'examining' (đang khám), card hiển thị badge "Đang khám" màu vàng. Không có phần expanded (vì dữ liệu chưa đầy đủ). Nút "Tiếp tục khám" thay vì "Xem đầy đủ".

---

## 8. Tab: Xu hướng

### 8.1 Mục đích

Hiển thị biểu đồ line chart theo dõi các chỉ số quan trọng qua các lần khám. Giúp BS nhận biết nhanh xu hướng tốt lên hay xấu đi.

### 8.2 Danh sách biểu đồ

Hiển thị theo thứ tự từ trên xuống:

| # | Biểu đồ | Trục Y | Ngưỡng cảnh báo | Điều kiện hiển thị |
|---|---------|--------|-----------------|-------------------|
| 1 | Thị lực SC (không kính) | Snellen (20/20 → 20/50) | Không | Luôn hiện |
| 2 | Nhãn áp (IOP) | mmHg (10 → 22) | 21 mmHg (đường đỏ nét đứt) | Luôn hiện |
| 3 | Khúc xạ (Sphere) | Diopter (-1.0 → -3.0) | Không | Luôn hiện |
| 4 | TBUT | Giây (0 → 15) | 5s (đường đỏ nét đứt) | Chỉ hiện nếu BN có ≥ 1 Dry Eye visit |
| 5 | Schirmer | mm/5min (0 → 25) | 5mm (đường đỏ nét đứt) | Chỉ hiện nếu BN có ≥ 1 Dry Eye visit |
| 6 | OSDI Score | Điểm (0 → 30) | 9 (đường vàng nét đứt) | Chỉ hiện nếu BN có ≥ 1 OSDI record |

### 8.3 Cấu trúc mỗi biểu đồ

| Thành phần | Chi tiết |
|------------|----------|
| Title | Tên chỉ số, font-size 13px, weight 500 |
| Legend | Góc phải: dot xanh + "OD", dot cam + "OS". Nếu có ngưỡng → text đỏ "Ngưỡng: {value}" |
| Trục Y | Labels bên trái, font-size 10px, secondary |
| Trục X | Labels bên dưới, format MM/YYYY, font-size 10px, secondary |
| Đường OD | Nét liền, stroke #378ADD, width 2px, dot tại mỗi data point |
| Đường OS | Nét đứt, stroke #D85A30, width 2px, dot tại mỗi data point |
| Data point hiện tại | Dot rỗng (fill trắng, stroke màu) để nhấn mạnh |
| Gridlines | Nét đứt nhạt, stroke border-tertiary |
| Đường ngưỡng | Nét đứt đỏ (#E24B4A), opacity 0.4 |

### 8.4 Data source

Query: `visit_measurements` JOIN `visits` WHERE `patient_id = X AND visits.status = 'completed'` ORDER BY `visit_date ASC`.

Cho mỗi chỉ số, lấy giá trị OD và OS riêng biệt. Mỗi data point = 1 lần khám.

**Lưu ý cho Snellen VA:** Snellen (20/20, 20/30...) cần convert sang số để plot. Sử dụng LogMAR hoặc đơn giản lấy mẫu số: 20/20 = 1.0, 20/25 = 0.8, 20/30 = 0.67, 20/40 = 0.5. Trục Y inverted (1.0 ở trên, 0.5 ở dưới) để "tốt" ở trên, "xấu" ở dưới. Labels hiển thị Snellen notation.

### 8.5 Tương tác

- Hover data point → tooltip hiển thị: ngày khám, giá trị OD, giá trị OS.
- Nếu BN chỉ có 1 lần khám → hiển thị single dot thay vì line (không đủ data để vẽ trend).
- Nếu chỉ số không có data (VD: TBUT chỉ đo từ lần thứ 2) → line bắt đầu từ data point đầu tiên có data.

---

## 9. Data Sources

### 9.1 Bảng truy vấn chính

| Bảng | Sử dụng tại |
|------|------------|
| `patients` | Header, Thông tin cá nhân |
| `visits` | Stat cards, Lịch sử khám, tất cả tab |
| `visit_diagnoses` | Stat card chẩn đoán, Lịch sử chẩn đoán, Visit cards |
| `visit_prescriptions` | Đơn thuốc hiện tại, Visit card detail |
| `visit_optical_prescriptions` | Đơn kính hiện tại, Visit card detail |
| `visit_measurements` | Số đo gần nhất, Visit card detail, Xu hướng |
| `visit_medical_history` | Tiền sử, Alert pills |
| `visit_screening_responses` | OSDI score, Alert pills |
| `visit_exam_slitlamp` | Số đo gần nhất, Visit card detail |
| `visit_exam_fundus` | Số đo gần nhất, Visit card detail |
| `visit_exam_dry_eye` | Số đo gần nhất (Dry Eye block), Visit card detail, Xu hướng |
| `follow_up_appointments` | Stat card tái khám |
| `master_diagnoses` | Lookup tên chẩn đoán + ICD |
| `master_medications` | Lookup tên thuốc + mô tả |

### 9.2 Query chính khi load trang

**Initial load (tab Tổng quan):**
1. `patients` WHERE `patient_id = :id` → header + thông tin cá nhân
2. `visits` WHERE `patient_id = :id AND status = 'completed'` ORDER BY `visit_date DESC` → stat cards, xác định latest_visit_id
3. Từ latest_visit_id → parallel queries: `visit_diagnoses`, `visit_prescriptions`, `visit_optical_prescriptions`, `visit_measurements`, `visit_medical_history`, `visit_screening_responses`, `visit_exam_slitlamp`, `visit_exam_fundus`, `visit_exam_dry_eye`
4. `follow_up_appointments` WHERE `patient_id = :id` ORDER BY `appointment_date DESC` LIMIT 1 → stat card tái khám
5. Aggregate `visit_diagnoses` grouped by `master_diagnosis_id` → lịch sử chẩn đoán

**Lazy load (tab Lịch sử khám):** Fetch khi user click tab.

**Lazy load (tab Xu hướng):** Fetch `visit_measurements` full history khi user click tab.

---

## 10. Permissions

| Thành phần | Doctor | Technician | Receptionist | Admin |
|------------|--------|------------|--------------|-------|
| Xem trang | Có | Có | Có | Có |
| Chỉnh sửa thông tin BN | Không | Không | Có | Có |
| Tạo lượt khám | Có | Không | Có | Không |
| Xuất PDF | Có | Có | Có | Có |
| In phiếu | Có | Có | Có | Có |
| Xem đầy đủ lần khám | Có | Chỉ xem Pre-Exam | Không | Có (read-only) |

---

## 11. Responsive

| Breakpoint | Thay đổi |
|------------|----------|
| ≥ 960px | Layout mặc định, grid 2 cột |
| 768–959px | Stat cards chuyển thành 2x2. Nội dung giữ nguyên max-width |
| < 768px | Stat cards stack 1 cột. Grid 2 cột → stack 1 cột. Visit card detail grid → stack 1 cột. Chart width 100% |

---

## 12. Empty States

| Trường hợp | Hiển thị |
|------------|----------|
| BN chưa từng khám | Stat cards: tổng = 0, lần gần nhất = "Chưa có", chẩn đoán = "—", tái khám = "—". Tab Tổng quan: chỉ hiện thông tin cá nhân + tiền sử (nếu đã nhập từ intake). Sections đơn thuốc, đơn kính, chẩn đoán, số đo: ẩn. Tab Lịch sử khám: "Bệnh nhân chưa có lần khám nào". Tab Xu hướng: "Cần ít nhất 1 lần khám để hiển thị xu hướng" |
| Không có đơn thuốc | "Không có đơn thuốc hiện tại", font-size 13px, color secondary, text-align center, padding 20px |
| Không có đơn kính | "Không có đơn kính hiện tại", tương tự |
| Không có dữ liệu Dry Eye | Block "Khô mắt" ẩn hoàn toàn (không hiện card trống) |
| Không có lịch tái khám | Stat card tái khám: value = "Không có", color secondary |
