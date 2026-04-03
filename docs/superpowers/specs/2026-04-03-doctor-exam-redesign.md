# Doctor Exam Page — Full 4-Tab Redesign

> **Route:** `/doctor/:visitId`
> **Source spec:** `docs/doctor/doctor-emr-exam.md`
> **Date:** 2026-04-03

## Overview

Complete rewrite of the doctor exam page from the current 2-panel layout (PatientPanel + scrollable form) to a 4-tab sidebar layout matching the EMR spec. The new layout uses a fixed patient header, a 175px left sidebar with 4 vertical tab navigation, and a scrollable content area.

## Layout Architecture

**Chosen approach:** Fixed 175px sidebar (option A from brainstorming).

```
┌─────────────────────────────────────────────────┐
│  Patient Header (fixed)                         │
│  Avatar | Name | ID | Gender | Age | Phone |    │
│  Visit Type | [In phiếu] [Hoàn tất khám]       │
├────────────┬────────────────────────────────────┤
│            │                                    │
│  Sidebar   │   Content Area                     │
│  175px     │   (scrollable)                     │
│  4 tabs    │                                    │
│            │                                    │
├────────────┴────────────────────────────────────┤
```

## Component Structure

### Files to create

| Component | Path | Description |
|-----------|------|-------------|
| `patient-header.tsx` | `src/components/doctor/` | Fixed header with avatar, patient info, action buttons |
| `exam-sidebar.tsx` | `src/components/doctor/` | 175px sidebar with 4 vertical tabs + badge |
| `tab-patient.tsx` | `src/components/doctor/` | Tab 1: Admin info + visit history cards |
| `tab-pre-exam.tsx` | `src/components/doctor/` | Tab 2: Chief complaint, history, screening, measurements |
| `tab-requests.tsx` | `src/components/doctor/` | Tab 3: Request creation + tracking + results |
| `tab-exam.tsx` | `src/components/doctor/` | Tab 4: Slit-lamp, Fundus, Diagnosis, optional sections |

### Files to modify

| File | Change |
|------|--------|
| `src/pages/doctor/exam.tsx` | Full rewrite — new layout shell with header + sidebar + tab routing |
| `src/data/mock-patients.ts` | Add structured slit-lamp/fundus data types, request types, master data |

### Files to remove

| File | Reason |
|------|--------|
| `patient-panel.tsx` | Replaced by patient-header + tab-patient |
| `screening-data.tsx` | Absorbed into tab-pre-exam |
| `exam-findings.tsx` | Split into tab-exam (structured fields) |
| `treatment-plan.tsx` | Absorbed into tab-exam as optional sections |

### Files to keep

| File | Note |
|------|------|
| `diagnosis-input.tsx` | Moves into tab-exam, no structural changes needed |

## Patient Header

Fixed bar at the top, does not change when switching tabs.

**Fields displayed:**
- Avatar (initials circle, blue background `#E6F1FB`, text `#0C447C`)
- Họ tên (font-weight 500, 15px)
- Mã bệnh nhân
- Giới tính + tuổi
- Số điện thoại
- Loại khám badge — "Khám lần đầu" or "Tái khám lần N" (based on completed visit count)

**Action buttons (right side):**
- "In phiếu" — outline button (future: opens print dialog)
- "Hoàn tất khám" — primary green button (`#1D9E75`). Validates: at least 1 diagnosis required. Shows confirmation dialog.

## Tab 1: Bệnh nhân

### Section: Thông tin hành chính

Displays **only identity/demographic fields** from intake (medical/lifestyle fields go to Tab 2):

| Field | Source |
|-------|--------|
| Họ tên | `patient.name` |
| Ngày sinh (+ tuổi) | `patient.dob` |
| Giới tính | `patient.gender` |
| CCCD | `patient.cccd` |
| Điện thoại | `patient.phone` |
| Email | `patient.email` |
| Địa chỉ | `patient.address` |
| Nghề nghiệp | `patient.occupation` |

**UI:** Key-value 2-column grid. "Chỉnh sửa" button in section header — toggles fields to editable inputs.

### Section: Lần khám gần nhất

Shows previous visit history cards. Hidden if first visit.

**Most recent visit — full card with 2x2 grid:**

| Block | Content |
|-------|---------|
| Chẩn đoán | Diagnosis list with Chính/Phụ badges + ICD codes |
| Thuốc đã kê | Medication name, dose, frequency, eye |
| Thị lực | SC, CC, IOP for OD and OS |
| Khúc xạ | Sph, Cyl, Axis for OD and OS |

Below the grid: Dặn dò text. Footer: "Xem chi tiết lần khám này" button.

**Older visits:** Collapsed (diagnosis + VA only), reduced opacity. Max 3 shown, "Xem toàn bộ lịch sử khám" button for more.

Each card shows: visit date, doctor name, days since today.

## Tab 2: Pre-Exam

All data read-only by default. Displays intake medical/lifestyle data + pre-exam measurements.

### Header Actions

- "So sánh" — toggles history comparison panel
- "Chỉnh sửa" — toggles all fields to editable mode (override)

### Section: Lý do khám & triệu chứng

Source: intake `chiefComplaint` + screening data.

| Field | Display |
|-------|---------|
| Lý do khám | Text, font-weight 500 |
| Khởi phát | Key-value |
| Mức độ | Key-value + severity badge |
| Diễn biến | Key-value |
| Mắt ảnh hưởng | Key-value |
| Triệu chứng kèm theo | Pills/tags |
| Dấu hiệu cảnh báo | Green "Không có" if none, red pills if present |

### Section: Tiền sử

Source: intake `eyeHistory`, `systemicHistory`, `allergies`, `currentMedications`.

Sub-sections with labels:
- Bệnh mắt — pills + text notes
- Toàn thân — text
- Dị ứng — red pills
- Thuốc đang dùng — text
- Gia đình — text (if available)

### Section: Sàng lọc

**Key metrics grid (2x2):** OSDI-6 score + badge, Screen time, Kính áp tròng, Nghỉ mắt.

**Below:** Dynamic Q&A list from screening questionnaire. Each item: question (12px, secondary color) + answer (13px, primary color).

### Section: Thị lực & nhãn áp

OD/OS cards side by side. OD has blue dot (`#378ADD`), OS has orange dot (`#D85A30`).

Each card contains value cards (label top, value bottom, secondary background):
- SC (Snellen)
- CC (Snellen)
- PH (Snellen)
- Gần (Jaeger)
- IOP (mmHg)

### Section: Khúc xạ kế (Auto-Ref)

OD/OS cards, each with 3 value cards: Sph, Cyl, Axis.

### Comparison Panel (toggled via "So sánh")

Appears below header, above all sections. Contains:
- Visit date chips (horizontal pills, current highlighted)
- Comparison table: Chỉ số, OD/OS, columns per visit date, Xu hướng column
- Trend badges: red if worsening, gray if stable

### Override Behavior

When "Chỉnh sửa" clicked:
1. All value cards become editable inputs
2. "Lưu thay đổi" + "Hủy" buttons appear
3. Save writes new values + creates audit log entry
4. Cancel reverts to original values

## Tab 3: Yêu cầu

### Header

"+ Tạo yêu cầu" button (blue background, top right).

### Create Request Form

Toggle form with fields:

| Field | Type | Required | Options |
|-------|------|----------|---------|
| Loại | Select | Yes | Đo khúc xạ chủ quan, OCT, Chụp đáy mắt, Đo thị trường, Topography giác mạc, Siêu âm mắt, Xét nghiệm máu, Khác |
| Ưu tiên | Select | Yes | Bình thường, Khẩn |
| Ghi chú cho KTV | Text input | No | Free text |

Submit creates a request card with status "Đang chờ".

### Request Cards

Sorted by created_at DESC. Each card shows:
- Status icon (colored circle/icon matching status)
- Request type name (font-weight 500)
- Meta: sent time, completed time (if done), technician name
- Status badge (right side)

**Status badges:**

| Status | Label | Colors |
|--------|-------|--------|
| `pending` | Đang chờ | `#FAEEDA` / `#854F0B` |
| `in_progress` | Đang thực hiện | `#E6F1FB` / `#0C447C` |
| `completed` | Hoàn tất | `#EAF3DE` / `#27500A` |
| `cancelled` | Đã hủy | `#F1EFE8` / `#444441` |

### Result Display

When completed, card expands to show results:
- **Khúc xạ chủ quan:** OD/OS grid with Sph, Cyl, Axis, BCVA, Add, PD
- **Other types:** Conclusion text + file attachments (future)

### Sidebar Badge

Tab 3 in sidebar shows red badge with count of pending + in_progress requests.

## Tab 4: Khám & kết luận

Primary doctor input tab. Scrollable content with sections in order.

### Header Action

"Lần trước" button — toggles comparison panel showing last visit's slit-lamp, fundus, diagnosis, and treatment summary.

### Section: Sinh hiển vi (Slit-lamp)

OD/OS cards side by side. **All fields are text inputs** (not dropdowns).

**Fields per eye:**

| Field | Vietnamese label | Input type |
|-------|-----------------|------------|
| Lids | Mi mắt | Text input |
| Conjunctiva | Kết mạc | Text input |
| Cornea | Giác mạc | Text input |
| Anterior Chamber | Tiền phòng | Text input |
| Iris | Mống mắt | Text input |
| Lens | Thể thủy tinh | Text input |
| Notes | Ghi chú | Textarea |

Default values: "Bình thường" / "Trong" / "Sạch, sâu" as placeholder text (not pre-filled values).

### Section: Đáy mắt (Fundus)

Same OD/OS card layout. **All fields are text inputs** (not dropdowns).

**Fields per eye:**

| Field | Vietnamese label | Input type |
|-------|-----------------|------------|
| Optic Disc | Đĩa thị | Text input |
| C/D ratio | C/D ratio | Number input (0.0–1.0) |
| Macula | Hoàng điểm | Text input |
| Vessels | Mạch máu | Text input |
| Peripheral Retina | Võng mạc ngoại vi | Text input |
| Notes | Ghi chú | Textarea |

### Section: Chẩn đoán

Always visible. Uses existing `DiagnosisInput` component (grouped ICD-10 search).

- First diagnosis = "Chính" (blue badge), rest = "Phụ" (gray badge)
- Drag & drop to reorder (changes which is primary)
- Search input: "Tìm chẩn đoán hoặc mã ICD..."
- Below list: diagnosis notes textarea

### Optional Section Buttons

3 dashed-border toggle buttons below diagnosis:
- "+ Đơn thuốc"
- "+ Đơn kính"
- "+ Tái khám"

Click to show section, click again (or section's "Xóa" button) to hide. Multiple can be open simultaneously. Button style changes to solid/highlighted when active.

### Section: Đơn thuốc (optional)

Table with columns:

| Column | Type |
|--------|------|
| Tên thuốc | Text/Autocomplete |
| Liều | Text (e.g., "1 giọt") |
| Tần suất | Select (1–4 lần/ngày, khi cần) |
| Thời gian | Select/Text (1 tuần – 3 tháng) |
| Mắt | Select (OD, OS, OU) |
| Xóa | Button |

"+ Thêm thuốc" button at bottom.

### Section: Đơn kính (optional)

OD/OS grid with fields per eye: Sph, Cyl, Axis, Add.

Common fields below: PD (mm), Loại kính (Đơn tròng / Đa tròng / Lũy tiến), Ghi chú.

**Auto-fill:** If subjective refraction result exists in Tab 3 (completed), auto-populate Sph, Cyl, Axis, PD. Doctor can override.

### Section: Tái khám (optional)

| Field | Type | Options |
|-------|------|---------|
| Tái khám sau | Select | 1 tuần, 2 tuần, 1 tháng, 3 tháng, 6 tháng, 1 năm |
| Ngày tái khám | Date picker | Auto-calculated from interval, editable |
| Bác sĩ | Select | Active doctors list |
| Dặn dò bệnh nhân | Textarea | Free text |

## Mock Data Requirements

Since there's no backend, we need mock data additions to `mock-patients.ts`:

### New types needed

```typescript
interface SlitLampExam {
  od: SlitLampEye
  os: SlitLampEye
}

interface SlitLampEye {
  lids: string
  conjunctiva: string
  cornea: string
  anteriorChamber: string
  iris: string
  lens: string
  notes: string
}

interface FundusExam {
  od: FundusEye
  os: FundusEye
}

interface FundusEye {
  opticDisc: string
  cdRatio: string
  macula: string
  vessels: string
  peripheralRetina: string
  notes: string
}

interface VisitRequest {
  id: string
  type: string
  priority: "normal" | "urgent"
  status: "pending" | "in_progress" | "completed" | "cancelled"
  notesForTech: string
  requestedAt: string
  completedAt?: string
  assignedTo?: string
  result?: RequestResult
}

interface RequestResult {
  type: "subjective_refraction" | "generic"
  data: SubjectiveRefractionResult | GenericResult
}

interface SubjectiveRefractionResult {
  od: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
}

interface GenericResult {
  conclusion: string
  attachments?: string[]
}

interface OpticalRx {
  od: { sph: string; cyl: string; axis: string; add: string }
  os: { sph: string; cyl: string; axis: string; add: string }
  pd: string
  lensType: string
  notes: string
}

interface FollowUp {
  interval: string
  date: string
  doctor: string
  instructions: string
}

// Updated ExamData
interface ExamData {
  slitLamp: SlitLampExam
  fundus: FundusExam
  diagnoses: Diagnosis[]
  medications: Medication[]
  opticalRx?: OpticalRx
  procedures: Procedure[]
  followUp?: FollowUp
  requests: VisitRequest[]
}
```

### Mock visit history

Add 1-2 previous completed visits to mock data for demonstrating Tab 1 history cards and Tab 2/4 comparison panels.

## Validation Rules (Hoàn tất khám)

| Rule | Behavior |
|------|----------|
| At least 1 diagnosis | Blocks completion |
| Slit-lamp has at least 1 eye entered | Blocks completion |
| Fundus has at least 1 eye entered | Blocks completion |
| Pending/in-progress requests exist | Warning (does not block) |

## Breaking Changes

The `ExamData` type changes significantly:
- `slitLamp` changes from `string` to `SlitLampExam` (structured OD/OS object)
- `fundus` changes from `string` to `FundusExam` (structured OD/OS object)
- `va` and `iop` fields are removed from ExamData (these are pre-exam measurements displayed read-only in Tab 2, not doctor input)
- `opticalRx` changes from `{ od: {...}, os: {...} }` to include `pd`, `lensType`, `notes`
- `followUp` changes from `{ date, reason }` to `{ interval, date, doctor, instructions }`
- `requests` field added
- `dryEyeExam` and `refractionExam` removed (these were pre-exam data, now in Tab 2)

The `EMPTY_EXAM` constant in `exam.tsx` must be updated to match the new structure.

## Scoping Notes

**In scope (this implementation):**
- Full 4-tab layout with all sections
- Mock data for all states
- Structured slit-lamp/fundus input (text fields)
- Request creation and display (mock status changes)
- Optional sections toggle (medication, optical, follow-up)
- Visit history cards with mock data
- Diagnosis notes textarea

**Out of scope (future):**
- Real-time WebSocket updates for requests
- Print dialog for "In phiếu"
- Auto-save with debounce (currently save on button click)
- Comparison panel with trend badges (Tab 2 "So sánh")
- Override audit logging
- Drag & drop diagnosis reordering (keep existing promote mechanism)
