# Doctor EMR — Màn hình khám bệnh

> **Module:** EMR (Doctor)
> **Route:** `/doctor/exam/:visit_id`
> **Role:** Doctor
> **Version:** 1.0
> **Ngày:** 03/04/2026

---

## 1. Tổng quan

Màn hình khám bệnh là giao diện chính của bác sĩ khi tiến hành khám mắt cho bệnh nhân. Màn hình tổng hợp toàn bộ dữ liệu từ các bước trước (Intake, Pre-Exam), cho phép bác sĩ khám lâm sàng, đưa ra chẩn đoán và kế hoạch điều trị.

### 1.1 Nguyên tắc thiết kế

- **Bác sĩ đọc nhiều hơn nhập:** Phần lớn dữ liệu đã được thu thập từ Receptionist (intake) và Technician (pre-exam). BS chỉ nhập liệu trực tiếp ở phần khám lâm sàng (Slit-lamp, Fundus) và kết luận (Chẩn đoán, Đơn thuốc, Đơn kính, Tái khám).
- **Tối thiểu chuyển tab:** Gộp thông tin liên quan vào cùng một tab, BS cuộn trang thay vì nhảy qua lại giữa nhiều tab.
- **So sánh lịch sử:** BS có thể xem kết quả các lần khám trước tại bất kỳ section nào cần so sánh số liệu.
- **Override có kiểm soát:** BS có quyền chỉnh sửa dữ liệu từ Pre-Exam nếu cần, nhưng mặc định hiển thị read-only.
- **Optional sections:** Đơn thuốc, Đơn kính, Tái khám không bắt buộc — BS chủ động thêm khi cần thông qua action buttons.

### 1.2 Cấu trúc layout

```
┌─────────────────────────────────────────────────┐
│  Patient Header (cố định)                       │
├────────────┬────────────────────────────────────┤
│            │                                    │
│  Sidebar   │   Content Area                     │
│  (4 tabs)  │   (scrollable)                     │
│            │                                    │
├────────────┴────────────────────────────────────┤
```

- **Patient Header:** Cố định trên cùng, hiển thị thông tin tóm tắt bệnh nhân + action buttons.
- **Sidebar:** Bên trái, 175px, chứa 4 tab navigation.
- **Content Area:** Bên phải, chiếm phần còn lại, cuộn dọc.

### 1.3 Bốn tab chính

| # | Tab | Nội dung | Quyền nhập liệu |
|---|-----|----------|------------------|
| 1 | Bệnh nhân | Thông tin hành chính + lịch sử khám | Read-only (có nút Chỉnh sửa) |
| 2 | Pre-Exam | Kết quả Pre-Exam Step 1 + Step 2 | Read-only (có nút Chỉnh sửa) |
| 3 | Yêu cầu | Gửi / theo dõi / xem kết quả xét nghiệm & thủ thuật | BS tạo yêu cầu, KTV trả kết quả |
| 4 | Khám & kết luận | Slit-lamp, Fundus, Chẩn đoán, Đơn thuốc, Đơn kính, Tái khám | BS trực tiếp nhập |

---

## 2. Patient Header

Cố định trên cùng màn hình, không cuộn theo nội dung.

### 2.1 Thông tin hiển thị

| Trường | Nguồn | Ví dụ |
|--------|-------|-------|
| Avatar (initials) | Tự generate từ tên | `NA` |
| Họ tên | `patients.full_name` | Nguyễn Văn An |
| Mã bệnh nhân | `patients.patient_id` | BN-20260403-0012 |
| Giới tính + tuổi | `patients.gender`, `patients.dob` | Nam, 45 tuổi |
| Số điện thoại | `patients.phone` | 0912 345 678 |
| Loại khám | Tính từ `visits` history | Tái khám lần 3 / Khám lần đầu |

### 2.2 Action Buttons

| Button | Hành vi |
|--------|---------|
| **In phiếu** | Mở dialog chọn loại phiếu in (phiếu khám, đơn thuốc, đơn kính, phiếu tái khám). Chỉ enable cho phiếu đã có dữ liệu. |
| **Hoàn tất khám** | Kết thúc lượt khám. Validate: Chẩn đoán bắt buộc phải có ít nhất 1 chẩn đoán chính. Hiển thị confirmation dialog trước khi submit. Cập nhật `visits.status` → `completed`. |

### 2.3 Business Rules

- Loại khám hiển thị dựa trên số lần khám trước: nếu `COUNT(visits WHERE patient_id = X AND status = 'completed') = 0` → "Khám lần đầu", ngược lại → "Tái khám lần N".
- Header không thay đổi khi chuyển tab.

---

## 3. Tab 1: Bệnh nhân

Hiển thị thông tin hành chính từ form intake (Receptionist nhập) và tóm tắt các lần khám trước.

### 3.1 Section: Thông tin hành chính

Nguồn dữ liệu: bảng `patients` (từ intake form).

| Trường | Kiểu | Nguồn |
|--------|------|-------|
| Họ tên | Text | `patients.full_name` |
| Ngày sinh (+ tuổi) | Date | `patients.dob` → auto-calculate tuổi |
| Giới tính | Enum | `patients.gender` |
| Điện thoại | Text | `patients.phone` |
| Địa chỉ | Text | `patients.address` |
| Số BHYT | Text | `patients.insurance_number` (nullable) |
| Nghề nghiệp | Text | `patients.occupation` (nullable) |
| Nguồn đến | Enum | `patients.referral_source` |
| Liên hệ khẩn cấp | Text | `patients.emergency_contact_name` + `emergency_contact_phone` + `emergency_contact_relationship` |

**UI:** Hiển thị dạng key-value 2 cột. Nút "Chỉnh sửa" ở góc phải header — khi bấm, chuyển các trường sang dạng input editable.

### 3.2 Section: Lần khám gần nhất

Hiển thị tóm tắt thông tin lần khám trước đó (nếu có). Nếu là khám lần đầu, section này ẩn.

Nguồn dữ liệu: bảng `visits` + `visit_diagnoses` + `prescriptions` + `visit_measurements` — lọc theo `patient_id`, sắp xếp `visit_date DESC`, lấy N bản ghi gần nhất.

**Mỗi lần khám hiển thị dạng card chứa grid 2x2:**

| Block | Nội dung |
|-------|----------|
| Chẩn đoán | Danh sách chẩn đoán chính + phụ kèm mã ICD |
| Thuốc đã kê | Tên thuốc, liều dùng, tần suất, mắt áp dụng |
| Thị lực | SC, CC, IOP cho OD và OS |
| Khúc xạ | Sph, Cyl, Axis cho OD và OS |

**Bên dưới grid:** Dặn dò bệnh nhân từ lần khám đó.

**Footer card:** Nút "Xem chi tiết lần khám này" → mở full hồ sơ lần khám đó (có thể là modal hoặc navigate sang trang detail).

**Quy tắc hiển thị:**
- Lần khám gần nhất: hiển thị đầy đủ (full opacity).
- Các lần khám cũ hơn: hiển thị thu gọn (chỉ Chẩn đoán + Thị lực), opacity giảm.
- Mỗi card hiển thị: ngày khám, tên BS, số ngày tính từ hôm nay.
- Mặc định hiển thị tối đa 3 lần khám gần nhất. Nếu nhiều hơn → nút "Xem toàn bộ lịch sử khám".

---

## 4. Tab 2: Pre-Exam

Hiển thị toàn bộ kết quả Pre-Exam gồm cả Step 1 (sàng lọc, tiền sử) và Step 2 (đo lường). Tất cả mặc định **read-only**, BS có nút "Chỉnh sửa" để override nếu cần.

### 4.1 Header Actions

| Button | Hành vi |
|--------|---------|
| **So sánh** | Toggle mở/đóng bảng so sánh lịch sử đo lường qua các lần khám |
| **Chỉnh sửa** | Chuyển toàn bộ dữ liệu Pre-Exam sang editable mode |

### 4.2 Section: Lý do khám & triệu chứng

Nguồn: `visit_chief_complaints`, `visit_symptoms` (Pre-Exam Step 1).

| Trường | Kiểu hiển thị |
|--------|---------------|
| Lý do khám | Text, font-weight: 500 |
| Khởi phát | Key-value (VD: "2 tuần trước") |
| Mức độ | Key-value + severity badge (VD: "Trung bình 3/5") |
| Diễn biến | Key-value (VD: "Tăng dần") |
| Mắt ảnh hưởng | Key-value (VD: "Cả hai mắt") |
| Triệu chứng kèm theo | Danh sách pills/tags |
| Dấu hiệu cảnh báo (Red flags) | Text — hiển thị xanh "Không có" nếu trống, hoặc pills đỏ nếu có |

### 4.3 Section: Tiền sử

Nguồn: `visit_medical_history` (Pre-Exam Step 1).

Hiển thị dưới dạng các sub-section có tiêu đề:

| Sub-section | Kiểu hiển thị | Ví dụ |
|-------------|---------------|-------|
| Bệnh mắt | Pills + ghi chú text | `Cận thị`, `Khô mắt` + "Đeo kính từ 15 tuổi" |
| Toàn thân | Text hoặc pills | "Không có bệnh nền" |
| Dị ứng | Pills (màu đỏ) | `Tetracycline` |
| Thuốc đang dùng | Text mô tả | "Refresh Tears 0.5% — 3 lần/ngày" |
| Gia đình | Text | "Mẹ cận nặng (-8.00D)" |

### 4.4 Section: Sàng lọc

Nguồn: `visit_screening_responses`, `visit_screening_answers` (Pre-Exam Step 1 — bộ questionnaire động).

**Phần trên — Key metrics (grid 2x2):**

| Metric | Hiển thị |
|--------|----------|
| OSDI-6 | Score + severity badge (VD: "18/30" + badge "Trung bình") |
| Screen time | Text (VD: "8–10h/ngày") |
| Kính áp tròng | Text (VD: "Không sử dụng") |
| Nghỉ mắt | Text (VD: "Không thường xuyên") |

**Phần dưới — Câu hỏi & trả lời:**

Hiển thị tất cả câu hỏi sàng lọc từ bộ questionnaire động. Mỗi câu gồm:
- Câu hỏi: font-size 12px, color secondary
- Câu trả lời: font-size 13px, color primary

Lưu ý: Danh sách câu hỏi là dynamic, được quản lý từ bảng `screening_questions`. Hiển thị tất cả câu hỏi đã được trả lời trong lần khám này.

### 4.5 Section: Thị lực & nhãn áp

Nguồn: `visit_measurements` WHERE `measurement_type IN ('va_sc', 'va_cc', 'va_ph', 'va_near', 'iop')` (Pre-Exam Step 2).

**Layout:** Grid 2 cột (OD | OS). Mỗi cột hiển thị dạng value cards:

| Metric | Đơn vị | Ví dụ OD | Ví dụ OS |
|--------|--------|----------|----------|
| SC (Không kính) | Snellen | 20/40 | 20/30 |
| CC (Có kính) | Snellen | 20/25 | 20/20 |
| PH (Pinhole) | Snellen | 20/20 | 20/20 |
| Gần (Near VA) | Jaeger | J2 | J1 |
| IOP | mmHg | 16 | 15 |

**UI:** Mỗi giá trị là một value card nhỏ (label ở trên, value ở dưới, nền secondary). OD có dot xanh dương (#378ADD), OS có dot cam (#D85A30).

### 4.6 Section: Khúc xạ kế (Auto-Ref)

Nguồn: `visit_measurements` WHERE `measurement_type IN ('autoref_sph', 'autoref_cyl', 'autoref_axis')` (Pre-Exam Step 2).

**Layout:** Grid 2 cột (OD | OS), mỗi cột 3 value cards:

| Metric | Đơn vị | Ví dụ OD | Ví dụ OS |
|--------|--------|----------|----------|
| Sph (Sphere) | Diopter | -2.75 | -3.00 |
| Cyl (Cylinder) | Diopter | -0.75 | -1.00 |
| Axis | Degrees (°) | 180 | 5 |

### 4.7 Panel So sánh lịch sử

Khi bấm nút "So sánh" ở header, panel này hiển thị ngay dưới header, trên tất cả sections.

**Cấu trúc:**

| Thành phần | Mô tả |
|------------|-------|
| Visit chips | Dãy pills ngang, mỗi pill = 1 lần khám (format: DD/MM/YYYY). Lần hiện tại có style highlight. |
| Bảng so sánh | Bảng có cột: Chỉ số, Mắt (OD/OS), các cột ngày khám, cột Xu hướng |
| Xu hướng | Badge delta: đỏ nếu xấu đi, xám nếu ổn định. Logic xấu/tốt tùy chỉ số (VD: IOP tăng = xấu, VA giảm = xấu, Sph tăng âm = xấu) |

**Các chỉ số trong bảng so sánh:**

| Chỉ số | Logic "xấu đi" |
|--------|-----------------|
| SC | Mẫu số tăng (20/30 → 20/40 = xấu) |
| CC | Mẫu số tăng |
| IOP | Giá trị tăng |
| Sph | Giá trị tuyệt đối tăng (VD: -2.50 → -2.75 = xấu) |
| Cyl | Giá trị tuyệt đối tăng |

**Dữ liệu:** Query từ `visit_measurements` JOIN `visits` WHERE `patient_id = X AND status = 'completed'` ORDER BY `visit_date DESC` LIMIT 5.

### 4.8 Override Behavior

Khi BS bấm "Chỉnh sửa":
1. Tất cả value cards chuyển thành input fields editable.
2. Xuất hiện 2 button: "Lưu thay đổi" và "Hủy".
3. Khi lưu:
   - Ghi giá trị mới vào bảng `visit_measurements` hoặc tương ứng.
   - Lưu audit log: `override_logs` (visit_id, field_name, original_value, new_value, overridden_by, overridden_at).
4. Khi hủy: revert về giá trị gốc.

---

## 5. Tab 3: Yêu cầu

Cho phép BS gửi yêu cầu xét nghiệm / thủ thuật bổ sung cho KTV, theo dõi trạng thái real-time, và xem kết quả khi hoàn tất.

### 5.1 Header Actions

| Button | Hành vi |
|--------|---------|
| **+ Tạo yêu cầu** | Toggle mở/đóng form tạo yêu cầu mới |

### 5.2 Form tạo yêu cầu

| Trường | Kiểu | Bắt buộc | Options |
|--------|------|----------|---------|
| Loại | Select | Có | Xem danh sách bên dưới |
| Ưu tiên | Select | Có | Bình thường, Khẩn |
| Ghi chú cho KTV | Text input | Không | Free text |

**Danh sách loại yêu cầu (admin-managed từ `master_request_types`):**

| Loại | Mô tả |
|------|-------|
| Đo khúc xạ chủ quan | KTV dùng phoropter đo subjective refraction |
| OCT | Optical Coherence Tomography |
| Chụp đáy mắt | Fundus photography |
| Đo thị trường | Visual field test |
| Topography giác mạc | Corneal topography |
| Siêu âm mắt | Ocular ultrasound |
| Xét nghiệm máu | Blood test |
| Khác | Free text mô tả |

**Khi submit:**
- Tạo record trong bảng `visit_requests`.
- Status = `pending`.
- Gửi notification cho KTV (hiển thị trên dashboard KTV).
- Form đóng lại, card yêu cầu mới xuất hiện ở đầu danh sách.

### 5.3 Danh sách yêu cầu

Hiển thị tất cả yêu cầu của lượt khám hiện tại, sắp xếp theo `created_at DESC`.

**Mỗi request card gồm:**

| Thành phần | Mô tả |
|------------|-------|
| Icon | Hình tròn bo góc, màu tùy status (xanh lá = done, vàng = pending, xanh dương = in progress) |
| Tên yêu cầu | Font-weight 500, VD: "Đo khúc xạ chủ quan" |
| Meta info | Thời gian gửi, thời gian hoàn tất (nếu có), tên KTV thực hiện |
| Status badge | Góc phải, 3 trạng thái (bảng bên dưới) |
| Kết quả (nếu done) | Panel mở rộng bên dưới, hiển thị kết quả đo |

### 5.4 Trạng thái yêu cầu

| Status | Label | Màu badge | Mô tả |
|--------|-------|-----------|-------|
| `pending` | Đang chờ | Vàng (#FAEEDA / #854F0B) | BS đã gửi, chưa có KTV nhận |
| `in_progress` | Đang thực hiện | Xanh dương (#E6F1FB / #0C447C) | KTV đã nhận và đang thực hiện |
| `completed` | Hoàn tất | Xanh lá (#EAF3DE / #27500A) | KTV đã hoàn tất, có kết quả |
| `cancelled` | Đã hủy | Xám (#F1EFE8 / #444441) | BS hoặc KTV hủy yêu cầu |

### 5.5 Hiển thị kết quả

Khi status = `completed`, card mở rộng hiển thị kết quả. Layout tùy loại yêu cầu:

**Đo khúc xạ chủ quan:**
```
Grid 2 cột (OD | OS):
  OD: Sph, Cyl, Axis, BCVA, Add, PD
  OS: Sph, Cyl, Axis, BCVA, Add, PD
```

**OCT / Chụp đáy mắt / Các loại khác:**
```
- Hình ảnh kết quả (nếu có): thumbnail, bấm để xem full
- Kết luận KTV: text mô tả
- File đính kèm (nếu có)
```

### 5.6 Sidebar Badge

Tab "Yêu cầu" trên sidebar hiển thị badge đỏ với số lượng yêu cầu đang có status `pending` hoặc `in_progress`. Khi tất cả yêu cầu đã `completed` hoặc `cancelled` → ẩn badge.

### 5.7 Real-time Updates

- Khi KTV cập nhật status hoặc trả kết quả, card yêu cầu tương ứng phải cập nhật real-time (qua WebSocket hoặc polling).
- Khi có kết quả mới, hiển thị toast notification cho BS.

---

## 6. Tab 4: Khám & kết luận

Tab chính nơi BS nhập liệu trực tiếp. Gồm các phần theo thứ tự cuộn từ trên xuống:

1. Sinh hiển vi (Slit-lamp) — **luôn hiện**
2. Đáy mắt (Fundus) — **luôn hiện**
3. Chẩn đoán — **luôn hiện**
4. Đơn thuốc — **optional**, hiện khi BS bấm button
5. Đơn kính — **optional**, hiện khi BS bấm button
6. Tái khám — **optional**, hiện khi BS bấm button

### 6.1 Header Actions

| Button | Hành vi |
|--------|---------|
| **Lần trước** | Toggle panel so sánh kết quả khám lâm sàng + chẩn đoán + điều trị của lần khám gần nhất |

### 6.2 Panel So sánh lần trước

Khi bấm "Lần trước", hiển thị panel chứa:

**Bên trái — Sinh hiển vi lần trước:** Bảng 3 cột (Bộ phận | OD | OS) với giá trị từ lần khám gần nhất.

**Bên phải — Đáy mắt lần trước:** Bảng 3 cột (Chỉ số | OD | OS) với giá trị từ lần khám gần nhất.

**Bên dưới — Chẩn đoán & điều trị lần trước:** Tóm tắt 1–2 dòng chẩn đoán + thuốc đã kê + dặn dò.

**Metadata:** Ngày khám + tên BS ở đầu panel.

### 6.3 Sinh hiển vi (Slit-lamp)

BS trực tiếp khám và nhập kết quả. Layout: Grid 2 cột (OD | OS), mỗi cột là một card editable.

**Danh sách trường cho MỖI mắt:**

| Trường | Kiểu input | Options (admin-managed) |
|--------|-----------|------------------------|
| Mi mắt (Lids) | Select | Bình thường, Viêm bờ mi, Lẹo / Chắp, ... |
| Kết mạc (Conjunctiva) | Select | Bình thường, Cương tụ, Nhú gai, ... |
| Giác mạc (Cornea) | Select | Trong, Phù, Loét, Sẹo, ... |
| Tiền phòng (Anterior Chamber) | Select | Sạch sâu, Tyndall (+), Nông, ... |
| Mống mắt (Iris) | Select | Bình thường, Dính, Tân mạch, ... |
| Thể thủy tinh (Lens) | Select | Trong, Đục nhân, Đục vỏ, IOL, ... |
| Ghi chú | Textarea | Free text |

**Lưu ý:**
- Tất cả options trong dropdown phải là admin-managed (bảng `master_slitlamp_options`), không hard-code.
- OD và OS lưu trữ riêng biệt (2 records riêng trong DB).
- Mặc định tất cả select = "Bình thường" / "Trong" / "Sạch, sâu" (giá trị mặc định cấu hình từ master data).

### 6.4 Đáy mắt (Fundus)

BS trực tiếp khám và nhập kết quả. Layout tương tự Slit-lamp: Grid 2 cột (OD | OS).

**Danh sách trường cho MỖI mắt:**

| Trường | Kiểu input | Options (admin-managed) |
|--------|-----------|------------------------|
| Đĩa thị (Optic Disc) | Select | Bình thường, Phù gai, Lõm gai rộng, Teo gai, ... |
| C/D ratio | Number input | Free input (VD: 0.3). Range: 0.0 – 1.0 |
| Hoàng điểm (Macula) | Select | Bình thường, Phù, Thoái hóa, Drusen, ... |
| Mạch máu (Vessels) | Select | Bình thường, Hẹp ĐM, Tân mạch, ... |
| Võng mạc ngoại vi (Peripheral Retina) | Select | Bình thường, Thoái hóa lattice, Rách / Lỗ, ... |
| Ghi chú | Textarea | Free text |

**Lưu ý:**
- Options admin-managed từ bảng `master_fundus_options`.
- C/D ratio là số thập phân, validate range 0.0 – 1.0.

### 6.5 Chẩn đoán

**Luôn hiển thị**, nằm ngay sau Đáy mắt (có đường phân cách).

#### 6.5.1 Danh sách chẩn đoán

Hiển thị dạng list, mỗi dòng gồm:

| Thành phần | Mô tả |
|------------|-------|
| Badge loại | "Chính" (xanh dương) hoặc "Phụ" (xám) |
| Tên chẩn đoán | Text, font-size 13px |
| Mã ICD | Text secondary, nullable |
| Nút xóa (×) | Xóa chẩn đoán khỏi danh sách |

**Quy tắc:**
- Chẩn đoán đầu tiên trong danh sách = **Chẩn đoán chính** (badge "Chính"). Tất cả còn lại = **Chẩn đoán phụ** (badge "Phụ").
- Hỗ trợ kéo thả (drag & drop) để sắp xếp thứ tự → thay đổi chẩn đoán nào là chính.
- Mã ICD là **không bắt buộc** nhưng khuyến khích.
- Tối thiểu **1 chẩn đoán chính** để có thể bấm "Hoàn tất khám".

#### 6.5.2 Thêm chẩn đoán

- Input tìm kiếm: placeholder "Tìm chẩn đoán hoặc mã ICD..."
- Khi gõ: autocomplete từ bảng `master_diagnoses` (chứa tên tiếng Việt + tên tiếng Anh + mã ICD-10).
- Kết quả dropdown hiển thị: tên chẩn đoán + mã ICD.
- Bấm chọn hoặc bấm nút "+ Thêm" để thêm vào danh sách.

#### 6.5.3 Ghi chú chẩn đoán

Textarea bên dưới danh sách, cho BS ghi thêm mức độ, giai đoạn, giải thích.

### 6.6 Optional Section Buttons

Nằm ngay sau section Chẩn đoán. Gồm 3 button dạng dashed border:

| Button | Toggle section |
|--------|----------------|
| + Đơn thuốc | Section Đơn thuốc |
| + Đơn kính | Section Đơn kính |
| + Tái khám | Section Tái khám |

**Hành vi:**
- Bấm lần 1: Section tương ứng xuất hiện bên dưới, button chuyển sang style "added" (border solid, background highlight, icon chuyển từ "+" sang "−").
- Bấm lần 2 (hoặc bấm "Xóa" trong section): Section ẩn đi, button trở về style mặc định.
- Mỗi section optional có nút "Xóa" ở góc phải header.
- Nhiều section có thể mở đồng thời.

### 6.7 Section: Đơn thuốc (Optional)

Hiển thị khi BS bấm "+ Đơn thuốc".

#### 6.7.1 Bảng thuốc

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| Tên thuốc | Text / Autocomplete | Tìm từ `master_medications` |
| Liều | Text | VD: "1 giọt", "1 viên" |
| Tần suất | Select | 1 lần/ngày, 2 lần/ngày, 3 lần/ngày, 4 lần/ngày, khi cần, ... |
| Thời gian | Select / Text | 1 tuần, 2 tuần, 1 tháng, 3 tháng, ... |
| Mắt | Select | OD, OS, OU (cả hai) |
| Xóa (×) | Button | Xóa dòng thuốc |

#### 6.7.2 Thêm thuốc

- Nút "+ Thêm thuốc" ở cuối bảng → thêm dòng mới vào bảng.
- Tên thuốc: autocomplete từ `master_medications`, hỗ trợ tìm theo tên thương mại + hoạt chất.
- Cho phép thêm nhiều dòng thuốc.

### 6.8 Section: Đơn kính (Optional)

Hiển thị khi BS bấm "+ Đơn kính".

**Layout:** Grid 2 cột (OD | OS) + row thông tin chung.

**Trường cho MỖI mắt:**

| Trường | Kiểu | Đơn vị |
|--------|------|--------|
| Sph (Sphere) | Number | Diopter (D) |
| Cyl (Cylinder) | Number | Diopter (D) |
| Axis | Number | Degrees (°). Range: 0–180 |
| Add | Number | Diopter (D). Nullable (chỉ dùng cho lão thị) |

**Trường chung:**

| Trường | Kiểu | Options |
|--------|------|---------|
| PD (Pupillary Distance) | Number | mm |
| Loại kính | Select | Đơn tròng, Đa tròng, Lũy tiến (admin-managed) |
| Ghi chú | Text | VD: "Phủ chống ánh sáng xanh" |

**Auto-fill:** Khi mở section Đơn kính, nếu đã có kết quả Khúc xạ CQ trong tab Yêu cầu (status = completed), tự động điền Sph, Cyl, Axis, PD từ kết quả đó. BS có thể chỉnh sửa.

### 6.9 Section: Tái khám (Optional)

Hiển thị khi BS bấm "+ Tái khám".

| Trường | Kiểu | Options / Validation |
|--------|------|---------------------|
| Tái khám sau | Select | 1 tuần, 2 tuần, 1 tháng, 3 tháng, 6 tháng, 1 năm (admin-managed) |
| Ngày tái khám | Date picker | Auto-calculate từ "Tái khám sau", BS có thể chỉnh tay |
| Bác sĩ | Select | Danh sách BS đang active trong hệ thống |
| Dặn dò bệnh nhân | Textarea | Free text |

**Auto-calculate:** Khi chọn "Tái khám sau" → tự động tính ngày tái khám = ngày hôm nay + khoảng thời gian đã chọn. BS có thể override bằng date picker.

**Khi lưu:** Tạo record trong `follow_up_appointments` + tùy chọn tạo appointment trong bảng `appointments` (nếu clinic muốn auto-book).

---

## 7. Data Model

### 7.1 Bảng chính liên quan

| Bảng | Mô tả |
|------|-------|
| `patients` | Thông tin hành chính bệnh nhân |
| `visits` | Mỗi lượt khám |
| `visit_measurements` | Kết quả đo lường (VA, IOP, Auto-Ref, Subjective Ref...) |
| `visit_chief_complaints` | Lý do khám, triệu chứng |
| `visit_medical_history` | Tiền sử bệnh |
| `visit_screening_responses` | Câu trả lời sàng lọc |
| `visit_exam_slitlamp` | Kết quả sinh hiển vi |
| `visit_exam_fundus` | Kết quả đáy mắt |
| `visit_diagnoses` | Danh sách chẩn đoán |
| `visit_prescriptions` | Đơn thuốc |
| `visit_optical_prescriptions` | Đơn kính |
| `visit_requests` | Yêu cầu xét nghiệm/thủ thuật |
| `visit_request_results` | Kết quả yêu cầu |
| `follow_up_appointments` | Lịch tái khám |
| `override_logs` | Audit log khi BS override dữ liệu Pre-Exam |

### 7.2 Bảng `visit_requests`

```sql
CREATE TABLE visit_requests (
    request_id          INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    request_type_id     INT NOT NULL REFERENCES master_request_types(type_id),
    priority            VARCHAR(10) NOT NULL DEFAULT 'normal',    -- 'normal', 'urgent'
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',   -- 'pending', 'in_progress', 'completed', 'cancelled'
    notes_for_tech      NVARCHAR(500) NULL,
    requested_by        INT NOT NULL REFERENCES users(user_id),   -- doctor
    assigned_to         INT NULL REFERENCES users(user_id),       -- technician
    requested_at        DATETIME2 NOT NULL DEFAULT GETDATE(),
    started_at          DATETIME2 NULL,
    completed_at        DATETIME2 NULL,
    cancelled_at        DATETIME2 NULL,
    cancelled_by        INT NULL REFERENCES users(user_id),
    cancel_reason       NVARCHAR(200) NULL
);
```

### 7.3 Bảng `visit_request_results`

```sql
CREATE TABLE visit_request_results (
    result_id           INT IDENTITY PRIMARY KEY,
    request_id          INT NOT NULL REFERENCES visit_requests(request_id),
    eye                 VARCHAR(2) NULL,           -- 'OD', 'OS', NULL (nếu không phân mắt)
    result_data         NVARCHAR(MAX) NOT NULL,    -- JSON chứa kết quả đo
    conclusion          NVARCHAR(1000) NULL,       -- Kết luận của KTV
    attachments         NVARCHAR(MAX) NULL,        -- JSON array chứa file paths
    recorded_by         INT NOT NULL REFERENCES users(user_id),
    recorded_at         DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

**Ví dụ `result_data` cho Khúc xạ chủ quan:**
```json
{
  "sph": -2.50,
  "cyl": -0.50,
  "axis": 175,
  "bcva": "20/20",
  "add": null,
  "pd": 31.5
}
```

### 7.4 Bảng `visit_exam_slitlamp`

```sql
CREATE TABLE visit_exam_slitlamp (
    exam_id             INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    eye                 VARCHAR(2) NOT NULL,       -- 'OD', 'OS'
    lids                INT NULL REFERENCES master_slitlamp_options(option_id),
    conjunctiva         INT NULL REFERENCES master_slitlamp_options(option_id),
    cornea              INT NULL REFERENCES master_slitlamp_options(option_id),
    anterior_chamber    INT NULL REFERENCES master_slitlamp_options(option_id),
    iris                INT NULL REFERENCES master_slitlamp_options(option_id),
    lens                INT NULL REFERENCES master_slitlamp_options(option_id),
    notes               NVARCHAR(1000) NULL,
    examined_by         INT NOT NULL REFERENCES users(user_id),
    examined_at         DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(visit_id, eye)
);
```

### 7.5 Bảng `visit_exam_fundus`

```sql
CREATE TABLE visit_exam_fundus (
    exam_id             INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    eye                 VARCHAR(2) NOT NULL,       -- 'OD', 'OS'
    optic_disc          INT NULL REFERENCES master_fundus_options(option_id),
    cd_ratio            DECIMAL(3,2) NULL,         -- 0.00 - 1.00
    macula              INT NULL REFERENCES master_fundus_options(option_id),
    vessels             INT NULL REFERENCES master_fundus_options(option_id),
    peripheral_retina   INT NULL REFERENCES master_fundus_options(option_id),
    notes               NVARCHAR(1000) NULL,
    examined_by         INT NOT NULL REFERENCES users(user_id),
    examined_at         DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(visit_id, eye)
);
```

### 7.6 Bảng `visit_diagnoses`

```sql
CREATE TABLE visit_diagnoses (
    diagnosis_id        INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    master_diagnosis_id INT NULL REFERENCES master_diagnoses(diagnosis_id),
    diagnosis_name      NVARCHAR(200) NOT NULL,
    icd_code            VARCHAR(10) NULL,
    sort_order          INT NOT NULL DEFAULT 0,    -- 0 = chẩn đoán chính
    notes               NVARCHAR(500) NULL,
    created_by          INT NOT NULL REFERENCES users(user_id),
    created_at          DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

**Quy tắc:** `sort_order = 0` là chẩn đoán chính. `sort_order > 0` là chẩn đoán phụ.

### 7.7 Bảng `visit_prescriptions`

```sql
CREATE TABLE visit_prescriptions (
    prescription_id     INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    medication_id       INT NULL REFERENCES master_medications(medication_id),
    medication_name     NVARCHAR(200) NOT NULL,
    dosage              NVARCHAR(50) NOT NULL,     -- VD: "1 giọt"
    frequency           NVARCHAR(50) NOT NULL,     -- VD: "4 lần/ngày"
    duration            NVARCHAR(50) NOT NULL,     -- VD: "1 tháng"
    eye                 VARCHAR(2) NOT NULL,       -- 'OD', 'OS', 'OU'
    sort_order          INT NOT NULL DEFAULT 0,
    prescribed_by       INT NOT NULL REFERENCES users(user_id),
    prescribed_at       DATETIME2 NOT NULL DEFAULT GETDATE()
);
```

### 7.8 Bảng `visit_optical_prescriptions`

```sql
CREATE TABLE visit_optical_prescriptions (
    optical_rx_id       INT IDENTITY PRIMARY KEY,
    visit_id            INT NOT NULL REFERENCES visits(visit_id),
    eye                 VARCHAR(2) NOT NULL,       -- 'OD', 'OS'
    sph                 DECIMAL(5,2) NULL,
    cyl                 DECIMAL(5,2) NULL,
    axis                INT NULL,                  -- 0-180
    add_power           DECIMAL(5,2) NULL,
    pd                  DECIMAL(4,1) NULL,         -- mm
    lens_type           NVARCHAR(50) NULL,         -- Đơn tròng, Đa tròng, Lũy tiến
    notes               NVARCHAR(500) NULL,
    prescribed_by       INT NOT NULL REFERENCES users(user_id),
    prescribed_at       DATETIME2 NOT NULL DEFAULT GETDATE(),
    UNIQUE(visit_id, eye)
);
```

### 7.9 Master Data Tables

| Bảng | Mục đích |
|------|----------|
| `master_request_types` | Danh sách loại yêu cầu xét nghiệm/thủ thuật |
| `master_slitlamp_options` | Options cho dropdown sinh hiển vi (group by field: lids, conjunctiva...) |
| `master_fundus_options` | Options cho dropdown đáy mắt (group by field: disc, macula...) |
| `master_diagnoses` | Danh sách chẩn đoán + mã ICD-10 |
| `master_medications` | Danh sách thuốc (tên thương mại + hoạt chất) |
| `master_lens_types` | Loại kính (Đơn tròng, Đa tròng, Lũy tiến) |
| `master_followup_intervals` | Khoảng thời gian tái khám |

---

## 8. Workflow & Trạng thái

### 8.1 Luồng khám tổng thể

```
BS mở hồ sơ BN
  → Tab "Bệnh nhân": xem thông tin + lần khám trước
  → Tab "Pre-Exam": đọc kết quả sàng lọc + đo lường
  → Tab "Yêu cầu": gửi yêu cầu bổ sung (nếu cần) → chờ KTV trả kết quả
  → Tab "Khám & kết luận":
       Khám Slit-lamp → Khám Fundus → Chẩn đoán
       → (optional) Thêm đơn thuốc
       → (optional) Thêm đơn kính
       → (optional) Thêm tái khám
  → Bấm "Hoàn tất khám"
```

### 8.2 Visit Status Flow

```
Đang khám (examining)
  → [BS bấm "Hoàn tất khám"]
  → Validation: ít nhất 1 chẩn đoán chính
  → Confirmation dialog
  → Hoàn thành (completed)
```

### 8.3 Auto-save

- Tất cả dữ liệu BS nhập (Slit-lamp, Fundus, Chẩn đoán, Đơn thuốc, Đơn kính, Tái khám) được **auto-save** mỗi khi thay đổi (debounce 2 giây).
- BS không cần bấm "Lưu" thủ công cho từng section.
- Trạng thái visit vẫn là `examining` cho đến khi BS bấm "Hoàn tất khám".

### 8.4 Validation khi Hoàn tất

| Rule | Mô tả |
|------|-------|
| Chẩn đoán bắt buộc | Ít nhất 1 chẩn đoán (sort_order = 0) |
| Slit-lamp bắt buộc | Phải có ít nhất OD hoặc OS đã nhập (kiểm tra có record trong `visit_exam_slitlamp`) |
| Fundus bắt buộc | Phải có ít nhất OD hoặc OS đã nhập |
| Yêu cầu chưa hoàn tất | Warning (không block): "Có N yêu cầu chưa hoàn tất. Bạn vẫn muốn kết thúc?" |

---

## 9. Responsive & Performance

### 9.1 Responsive

- Sidebar collapse thành icon-only trên màn hình < 1200px.
- Grid OD/OS chuyển thành stack dọc trên màn hình < 900px.
- Patient header: ẩn bớt meta fields, chỉ giữ tên + mã BN.

### 9.2 Performance

- Lazy load: Tab chỉ load dữ liệu khi được click lần đầu.
- Pre-Exam comparison data: chỉ fetch khi BS bấm "So sánh".
- Lịch sử khám (tab Bệnh nhân): load 3 lần gần nhất, "Xem thêm" load thêm.
- Auto-save: debounce 2s, chỉ gửi fields đã thay đổi (partial update).

---

## 10. Permissions & Audit

### 10.1 Quyền truy cập

| Hành động | Doctor | Technician | Receptionist | Admin |
|-----------|--------|------------|--------------|-------|
| Xem màn hình EMR | Có | Không | Không | Có (read-only) |
| Nhập Slit-lamp, Fundus | Có | Không | Không | Không |
| Tạo chẩn đoán | Có | Không | Không | Không |
| Kê đơn thuốc / kính | Có | Không | Không | Không |
| Gửi yêu cầu | Có | Không | Không | Không |
| Override Pre-Exam | Có | Không | Không | Không |
| Hoàn tất khám | Có | Không | Không | Không |

### 10.2 Audit Trail

Mọi hành động quan trọng đều ghi log:

| Event | Dữ liệu ghi |
|-------|-------------|
| Override Pre-Exam | field, old_value, new_value, user, timestamp |
| Thêm/xóa chẩn đoán | diagnosis_name, action (add/remove), user, timestamp |
| Kê đơn thuốc | medication, dosage, user, timestamp |
| Hoàn tất khám | visit_id, user, timestamp |
| Gửi yêu cầu | request_type, user, timestamp |
| Hủy yêu cầu | request_id, reason, user, timestamp |
