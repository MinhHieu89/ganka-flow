# Receptionist Module — Design Spec

## Overview

The receptionist module is the primary workspace for Ganka28's lễ tân (receptionist). It covers patient registration, check-in, walk-in handling, and appointment booking. All UI text is in Vietnamese.

**Current stage**: Frontend mockup with static mock data. No backend.

---

## Routing

| Route | Screen | Type |
|-------|--------|------|
| `/intake` | Receptionist Dashboard | Page |
| `/intake/new` | Patient Intake Form (new) | Page |
| `/intake/:id/edit` | Patient Intake Form (edit) | Page |
| `/schedule/new` | Appointment Booking Form | Page |

Check-in and walk-in flows are modals triggered from the Dashboard.

---

## Patient ID Format

`GK-YYYY-NNNN` (e.g. GK-2026-0001). Auto-generated, read-only.

---

## Status Model

6 statuses with the following progression:

```
Chưa đến → Chờ khám → Đang sàng lọc → Đang khám → Hoàn thành
                                                    ↘ Đã hủy
```

| Status | Color | Meaning |
|--------|-------|---------|
| Chưa đến | Purple (#7c3aed) | Scheduled but not yet arrived |
| Chờ khám | Amber (#f59e0b) | Checked in, waiting |
| Đang sàng lọc | Sky (#0ea5e9) | With technician (pre-exam) |
| Đang khám | Blue (#2563eb) | With doctor |
| Hoàn thành | Green (#059669) | Visit complete |
| Đã hủy | Gray | Cancelled visit |

Status is rendered as colored text (no badge background).

---

## Screen 1: Dashboard (`/intake`)

### Layout

- **Page title**: "Dashboard"
- **Action bar**: Search input (left) + refresh button, "Đặt lịch hẹn" (outline) + "Tiếp nhận BN mới" (primary dark) buttons (right)
- **5 KPI cards**: Lịch hẹn hôm nay, Chờ khám, Đang sàng lọc, Đang khám, Hoàn thành
- **Filter tabs**: Tất cả, Chưa đến, Chờ khám, Đang sàng lọc, Đang khám, Hoàn thành, Đã hủy
- **Patient table**: 8 columns
- **Pagination**: Vietnamese labels (Trước/Sau) + rows-per-page dropdown (10/20/50)

### KPI Cards

- Clean single border, no colored left border
- Gray SVG icon (single color) top-right
- Number colored per status (black for appointments total, status color for others)
- Sub-text on first card: "X chưa đến"

### Patient Table Columns

| Column | Sortable | Notes |
|--------|----------|-------|
| STT | No | Row number |
| Họ tên | Yes | Bold name + GK-YYYY-NNNN below in muted text |
| Năm sinh | Yes | 4-digit year |
| Giờ hẹn | Yes (default) | "—" for walk-in |
| Nguồn | Yes | Purple text "Hẹn" or rose text "Walk-in" |
| Lý do khám | No | Italic "Chưa rõ" if missing |
| Trạng thái | Yes | Colored text per status |
| Thao tác | No | ⋮ vertical dots menu |

### ⋮ Menu Actions

For "Chưa đến" rows:
- Check-in → opens check-in modal
- Xem hồ sơ → opens intake read-only
- Sửa thông tin → navigates to `/intake/:id/edit`
- Hủy lượt khám → confirmation dialog

For other statuses:
- Xem hồ sơ
- Sửa thông tin
- Hủy lượt khám

### Search

- Inline search on dashboard: searches today's patients by phone/name
- Autocomplete dropdown for existing patients (all patients, not just today)
- Clicking an existing patient from autocomplete → opens Walk-in modal (Modal C)

### Action Buttons

- "Tiếp nhận BN mới" → navigates to `/intake/new`
- "Đặt lịch hẹn" → navigates to `/schedule/new`

---

## Screen 2: Patient Intake Form (`/intake/new`, `/intake/:id/edit`)

### Layout

Full-page form with 4 sections separated by icon headers + divider lines. No numbered sections — icon + bold title + optional "(tùy chọn)" label.

### Section 1: Thông tin cá nhân

Icon: person-add

| Field | Type | Required | Layout | Notes |
|-------|------|----------|--------|-------|
| Họ và tên | Text | Yes | 2.5fr | Max 100 chars, placeholder "Nhập họ và tên đầy đủ" |
| Giới tính | Dropdown | Yes | 1fr | Nam/Nữ/Khác |
| Ngày sinh | Date picker | Yes | 1fr | dd/mm/yyyy, calendar icon, not future |
| Số điện thoại | Phone | Yes | 1fr | 10-11 digits starting 0, triggers duplicate check |
| Email | Email | No | 1fr | |
| Địa chỉ | Text | No | Full width | Max 200 chars |
| Nghề nghiệp | Text | No | 1fr | Placeholder "VD: Nhân viên văn phòng" |
| Số CCCD | Text | No | 1fr | |

**Grid layout**:
- Row 1: Họ tên (2.5fr) + Giới tính (1fr)
- Row 2: Ngày sinh + SĐT + Email (1fr each)
- Row 3: Địa chỉ (full width)
- Row 4: Nghề nghiệp + Số CCCD (1fr each)

**Duplicate phone warning**: Yellow banner appears real-time when phone matches existing patient. Shows patient name + ID + "Mở hồ sơ cũ" link.

### Section 2: Thông tin khám

Icon: clock

| Field | Type | Required | Layout | Notes |
|-------|------|----------|--------|-------|
| Lý do đến khám | Textarea | Yes | Full width | Max 500 chars, char counter, helper text: "Tối đa 500 ký tự. Ghi rõ triệu chứng, thời gian, mức độ nếu BN cung cấp." Placeholder: "VD: Mắt khô rát 2 tuần, nhìn mờ khi dùng máy tính..." |

This field flows to Pre-Exam as Chief Complaint.

### Section 3: Tiền sử bệnh (tùy chọn)

Icon: plus-circle

| Field | Type | Required | Layout | Notes |
|-------|------|----------|--------|-------|
| Tiền sử bệnh mắt | Textarea | No | 1fr | Placeholder "VD: Cận thị từ nhỏ, đã Lasik 2020..." |
| Tiền sử bệnh toàn thân | Textarea | No | 1fr | Placeholder "VD: Tiểu đường type 2, cao huyết áp..." |
| Thuốc đang dùng | Text | No | 1fr | Placeholder "VD: Metformin 500mg, Amlodipine 5mg..." |
| Dị ứng | Text | No | 1fr | Placeholder "VD: Penicillin, phấn hoa, hải sản..." Alerts on prescriptions. |

**Grid layout**:
- Row 1: Tiền sử bệnh mắt + toàn thân (1fr each, textareas)
- Row 2: Thuốc + Dị ứng (1fr each)

### Section 4: Lối sống (tùy chọn)

Icon: clock/lifestyle

| Field | Type | Required | Layout | Notes |
|-------|------|----------|--------|-------|
| Thời gian sử dụng màn hình (giờ/ngày) | Number | No | 1fr | 0-24, placeholder "VD: 8" |
| Môi trường làm việc | Dropdown | No | 1fr | Office/Outdoor/Factory/Other, placeholder "Chọn..." |
| Sử dụng kính áp tròng | Dropdown | No | 1fr | None/Daily/Sometimes, placeholder "Chọn..." |
| Ghi chú khác về lối sống | Text | No | Full width | Placeholder "VD: Hay bơi lội, thường xuyên lái xe đêm, dùng thuốc nhỏ mắt hàng ngày..." |

**Grid layout**:
- Row 1: Screen time + Môi trường + Kính áp tròng (1fr each)
- Row 2: Ghi chú (full width)

### Footer Actions

- Left: "Hủy" (outline) — returns to dashboard with confirmation if unsaved changes
- Right: "Lưu" (outline) + "Lưu & chuyển Pre-Exam →" (primary dark)

### Edit Mode (`/intake/:id/edit`)

Same form, pre-filled with existing data. Patient ID shown but not editable.

---

## Screen 3: Dashboard Modals

### Modal A — Check-in: Complete Record

Triggered from ⋮ menu → "Check-in" on a "Chưa đến" row when all required fields are filled.

**Content**:
- Header: "Check-in bệnh nhân" + subtitle
- Patient info grid (2 columns, read-only): Họ tên, Năm sinh, Giới tính, SĐT, Nghề nghiệp, Lý do khám
- Last visit info
- Blue info note: "Xác nhận thông tin với bệnh nhân trước khi check-in."
- Footer: "Sửa thông tin" link (left) + "Hủy" + "Xác nhận check-in" buttons (right)

**On confirm**: Status changes Chưa đến → Chờ khám. Records `checked_in_at` timestamp.

### Modal B — Check-in: Incomplete Record

Same trigger, but system detects missing required fields (DOB, gender, reason).

**Content**:
- Same layout as Modal A
- Missing fields shown as italic "Chưa có" in muted color
- Yellow warning: "Hồ sơ bệnh nhân chưa đầy đủ. Cần bổ sung thông tin bắt buộc trước khi check-in."
- Footer: "Hủy" + "Check-in & bổ sung hồ sơ →" (navigates to `/intake/:id/edit`, auto-checks-in on save)

### Modal C — Walk-in: Existing Patient New Visit

Triggered from dashboard search → clicking an existing patient result.

**Content**:
- Header: "Tạo lượt khám mới" + "Walk-in" badge (rose)
- Patient info grid (read-only): Họ tên, Năm sinh, Giới tính, SĐT
- Last visit info
- Textarea: "Lý do khám lần này" (required, max 500 chars, char counter)
- Footer: "Sửa thông tin" link (left) + "Hủy" + "Tạo lượt khám" buttons (right)

**On confirm**: Creates new visit record (not new patient). Appears on dashboard with Source: "Walk-in", Status: "Chờ khám".

---

## Screen 4: Appointment Booking (`/schedule/new`)

### Layout

Two-column layout:
- **Left**: Bordered card with "Thông tin bệnh nhân" section
- **Right**: "Chọn ngày & giờ" — calendar + time slots (not stretched, natural size)

### Left Panel — Patient Info

Inside a bordered rounded card:

1. **Search**: "Tìm bệnh nhân" input with search icon
2. **Result banner**:
   - Found: Green banner "Đã tìm thấy: [Name] — GK-YYYY-NNNN"
   - Not found: Yellow banner "Không tìm thấy BN với SĐT này. Nhập thông tin bên dưới để tạo hẹn cho BN mới."
3. **Fields** (vary by case):

**Existing patient**:
- Bác sĩ chỉ định (dropdown, default "BS nào trống")
- Lý do khám (textarea)

**New patient**:
- Họ tên (required)
- Số điện thoại (required)
- Blue info note: "BN mới chỉ cần tên + SĐT + lý do khám để đặt hẹn. Thông tin đầy đủ sẽ bổ sung khi BN đến check-in."
- Bác sĩ chỉ định (dropdown)
- Lý do khám (textarea)

### Right Panel — Calendar & Slots

**Calendar**:
- Month view, compact (not stretched to fill)
- Navigation arrows ‹ ›
- Day headers: Th 2, Th 3, Th 4, Th 5, Th 6, Th 7, CN
- Selected date: black rounded square
- Holiday/special dates: red text
- Previous/next month dates: muted gray
- Cannot select past dates

**Time Slots**:
- Grouped: "Sáng" and "Chiều" with slot count "X slot trống / Y"
- Divider line under each group header
- Flex-wrap layout (5 per row approximately)
- States:
  - Available: border, dark text
  - Selected: purple border + purple text + light purple background
  - Full: muted text, muted background, strikethrough
- Legend at bottom: Trống / Đang chọn / Đã đầy

### Confirmation Bar

Appears at the bottom when date + time are selected. Purple-themed.

- Left: "Xác nhận lịch hẹn" title + patient name + date/time + missing info warnings
- Right: "Hủy" (outline) + "Xác nhận lịch hẹn" (purple primary)

**On confirm**:
- Existing patient: Creates appointment, appears on dashboard on that date
- New patient: Creates temp patient record + appointment. Full intake completed at check-in.

---

## Data Flow to Other Modules

| Intake Field | Flows To |
|-------------|----------|
| Lý do khám | Pre-Exam → Chief Complaint |
| Screen time | Pre-Exam Block A (pre-fill) |
| Contact lens | Pre-Exam Block A (pre-fill) |
| Tiền sử bệnh | EMR Tab History (read-only) |
| Dị ứng | EMR Plan tab (prescription warning) |
| Nghề nghiệp | EMR + Dry Eye diagnosis context |

---

## Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Họ và tên | Required, max 100 chars | "Trường này không được bỏ trống" |
| SĐT | 10-11 digits starting 0 | "SĐT phải có 10–11 số và bắt đầu bằng 0" |
| Ngày sinh | Valid date, not future | "Ngày sinh không hợp lệ" |
| Email | Valid format if provided | "Email không đúng định dạng" |
| Lý do khám | Required, max 500 chars | "Trường này không được bỏ trống" |

Inline errors shown below fields with red border on invalid fields.

---

## Confirmation Dialogs

- Cancel form with unsaved changes: "Bạn có chắc muốn hủy? Dữ liệu chưa lưu sẽ mất."
- Cancel visit (Hủy lượt khám): "Xóa khỏi hàng đợi?" with confirm button
- Duplicate phone on appointment: "BN đã có hẹn ngày này. Đổi lịch hay tạo thêm?"

---

## File Structure

```
src/pages/intake/
  index.tsx              → Dashboard
  new.tsx                → Intake form (new)
  [id]/edit.tsx          → Intake form (edit)
src/pages/schedule/
  new.tsx                → Appointment booking
src/components/receptionist/
  dashboard-kpi-cards.tsx
  dashboard-table.tsx
  dashboard-filters.tsx
  checkin-modal.tsx       → Modals A & B
  walkin-modal.tsx        → Modal C
  patient-search.tsx      → Shared search with autocomplete
src/data/
  mock-patients.ts        → Static mock data
  mock-appointments.ts
```

---

## Mock Data

Static arrays of patients and appointments. No state management library — React state + context is sufficient for the mockup phase. Status changes (check-in, create visit) update local state only.

---

## Out of Scope

- Backend API integration
- Real-time refresh / WebSocket
- Keyboard shortcuts
- Responsive/mobile layout
- Dark mode styling (theme system exists but not designed for these screens yet)
- Print functionality
