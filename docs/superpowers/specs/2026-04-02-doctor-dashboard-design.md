# Doctor Dashboard & Exam View — Design Spec

## Overview

Doctor-facing module for Ganka Flow. Two screens: a queue dashboard (landing page) and a two-panel exam view. Follows the same visual patterns as the intake and screening dashboards.

**Route prefix:** `/doctor`

---

## Screen 1: Queue Dashboard (`/doctor`)

### Page Header

- Title: "Dashboard" (text-xl font-bold), matching intake pattern
- Refresh button (outline, with icon)

### KPI Cards

4 cards in `grid grid-cols-4 gap-3.5`, same card structure as intake `KpiCards`:

| Order | Label | Color | Data |
|-------|-------|-------|------|
| 1 | Đang khám | `text-blue-600` | Count of visits with status `dang_kham` for this doctor |
| 2 | Đang chờ | `text-amber-500` | Count of visits with status `cho_kham` (post-screening) assigned to this doctor |
| 3 | Đã khám | `text-emerald-600` | Count of visits with status `hoan_thanh` for this doctor today |
| 4 | Lịch hẹn kế tiếp | `text-violet-600` | Next scheduled appointment time + relative "trong X phút" |

Each card has: muted label (top-left), HugeiconsIcon (top-right, `size-[18px]`), bold number (`text-3xl`), optional subtitle.

### Status Filter Tabs

Same component pattern as intake `StatusFilters`:

- Tất cả (count)
- Đang chờ (count)
- Đang khám (count)

Active tab: `bg-foreground text-background`. Inactive: `text-muted-foreground hover:text-foreground`.

### Queue Table

Wrapped in `rounded-lg border border-border`. Uses shadcn `Table` component.

**Columns:**

| Column | Width | Content |
|--------|-------|---------|
| STT | `w-12` | Row number (waiting patients) or "—" (in-progress) |
| Bệnh nhân | flex | Name (`font-semibold`) + subtitle line: patient ID + disease group (e.g. "GK-2026-0042 · Khô mắt"). Red flag badge inline next to name if applicable |
| Năm sinh | `w-20` | Birth year |
| Thời gian chờ | `w-[120px]` | Minutes waiting or "Đang khám" for in-progress |
| Trạng thái | `w-28` | Status label with color (`text-amber-500` for waiting, `text-blue-600` for examining) |
| Action | `w-16` | "Khám" button (outline for normal, primary for red flag/in-progress) |

**Row highlights:**
- Red flag patient: `bg-red-50 dark:bg-red-950/20`, sorted to top of queue
- In-progress patient: `bg-blue-50 dark:bg-blue-950/20`, button text "Tiếp tục"

**Sorting:** Red flag patients first, then by wait time (longest first).

### Pagination

Same pattern as intake: "Hiển thị X–Y trên Z" + page size select (`h-8 w-16`) + Trước/Sau buttons.

---

## Screen 2: Exam View (`/doctor/:visitId`)

### Navigation

- Clicking "Khám" or "Tiếp tục" from queue navigates to `/doctor/:visitId`
- Back button at top returns to `/doctor` queue
- On enter: if patient status is `cho_kham`, update to `dang_kham`

### Layout

`ResizablePanelGroup` (shadcn) with horizontal direction:
- Left panel: default ~30% width, min ~20%
- Right panel: default ~70% width, min ~50%
- Draggable divider between panels

### Left Panel — Patient Info + Screening Context

Sticky positioning, independently scrollable. Background `bg-muted/30`.

**Sections (top to bottom):**

1. **Patient header**
   - Name (`text-[15px] font-bold`)
   - Subtitle: Patient ID · Gender · Birth year (age) — e.g. "GK-2026-0042 · Nam · 1990 (36t)"
   - Red flag badge (if applicable): `bg-red-100 text-red-600 rounded-full`

2. **Chief complaint (Lý do khám)**
   - Label: uppercase, `text-xs font-medium text-muted-foreground`
   - Value: `text-sm text-foreground`

3. **Red flags (Cờ đỏ)** — only shown if any triggered
   - Background: `bg-red-50`
   - Label: `text-red-600`
   - Bullet list of triggered flags in red

4. **UCVA**
   - Two-column grid: OD (Phải) / OS (Trái)
   - Label `text-xs text-muted-foreground`, value `text-sm font-semibold`

5. **Screening symptoms (Triệu chứng sàng lọc)**
   - Bullet list: Khô/cộm/kích ứng, Mờ sau chớp mắt, Thời gian màn hình

6. **Current glasses Rx (Kính đang đeo)**
   - Rx values or italic "Không đeo kính"

### Right Panel — Exam Form

Scrollable. Sections separated by `border-t border-border` with `pt-4`.

**1. Screening Data (read-only, editable on click)**

Displayed at the top of the right panel in a distinct block with `bg-muted/50 rounded-lg p-4`.

Content depends on disease group routed from screening Step 2:
- **Dry Eye:** OSDI-6 score, TBUT (OD/OS), Schirmer (OD/OS), Meibomian grade, Staining score
- **Refraction:** Full refraction data (SPH, CYL, AXIS, ADD, PD)
- **Myopia Control:** Axial length (OD/OS), progression data, lifestyle/risk
- **General:** VA, IOP, Slit-lamp summary, Fundus summary

Values displayed as read-only text. An "Chỉnh sửa" (Edit) button toggles fields to editable inputs inline. This allows the doctor to correct technician measurements without navigating away.

**2. Exam Findings (Khám lâm sàng)**

Always shown:
- **VA (Thị lực):** OD/OS inputs, two-column grid
- **IOP (Nhãn áp):** OD/OS inputs (mmHg), two-column grid
- **Slit-lamp (Sinh hiển vi):** Textarea
- **Fundus (Soi đáy mắt):** Textarea

Adaptive additions by disease group:
- **Dry Eye:** TBUT recheck, Meibomian grading, Staining score (doctor's own measurements)
- **Refraction:** SPH, CYL, AXIS, ADD, PD (3-column grid)
- **Myopia Control:** Axial length, risk assessment fields

All OD/OS fields tracked separately per PROJECT.md rules.

**3. Diagnosis (Chẩn đoán)**

Hybrid input:
- Primary: Searchable dropdown of common ophthalmology diagnoses
- Each option includes ICD-10 code (auto-attached on select)
- Fallback: Free-text input for uncommon diagnoses
- Multi-diagnosis support: primary + secondary (per PROJECT.md)
- Placeholder: "Tìm chẩn đoán hoặc nhập tự do..."
- Helper text: "ICD-10 sẽ tự động gắn khi chọn từ danh sách"

**4. Treatment Plan (Kế hoạch điều trị)**

Add-as-needed pattern. Empty by default with 4 dashed-border buttons:
- **+ Thuốc** (Medication): Searchable drug catalog select + dosage + frequency + duration fields. Free-text fallback for external meds. Allergy alert if patient has known allergies.
- **+ Kính Rx** (Optical): Glasses prescription fields (SPH, CYL, AXIS, ADD, PD per eye)
- **+ Thủ thuật** (Procedure): Procedure name + notes textarea
- **+ Tái khám** (Follow-up): Date picker + reason text field

Each section can be removed after adding (X button).

**5. Action Bar**

Sticky at bottom of the right panel (`sticky bottom-0 bg-background`):
- "Lưu nháp" — outline button, saves form data, keeps status `dang_kham`
- "Hoàn tất khám" — primary purple button, validates required fields, updates status to `hoan_thanh`, returns to queue

---

## State Management

### DoctorContext

New context provider (same pattern as `ReceptionistContext`):

- `currentDoctor`: Name/ID of logged-in doctor
- `todayVisits`: Filtered visits for this doctor today
- `startExam(visitId)`: Sets status to `dang_kham`
- `saveExamDraft(visitId, examData)`: Persists form data without completing
- `completeExam(visitId, examData)`: Saves data + sets status to `hoan_thanh`

### Data Model Extensions

Extend existing `Visit` type with exam data:

```typescript
interface ExamData {
  // Exam findings
  va: { od: string; os: string }
  iop: { od: string; os: string }
  slitLamp: string
  fundus: string

  // Disease-group specific (adaptive)
  refractionExam?: RefractionData
  dryEyeExam?: DryEyeExamData

  // Diagnosis
  diagnoses: Diagnosis[]

  // Plan
  medications: Medication[]
  opticalRx?: OpticalRxData
  procedures: Procedure[]
  followUp?: { date: string; reason: string }
}

interface Diagnosis {
  text: string
  icd10Code?: string
  isPrimary: boolean
}
```

### Status Flow

```
cho_kham (post-screening) → dang_kham (doctor clicked "Khám") → hoan_thanh (doctor clicked "Hoàn tất")
                                  ↑                |
                                  |                v
                                  +--- Lưu nháp (stays dang_kham, data saved)
```

---

## Sidebar Navigation

Add after "Sàng lọc":

```
Tiếp nhận    → /intake
Lịch hẹn     → /schedule
Sàng lọc     → /screening
Khám bệnh    → /doctor      ← NEW
```

---

## Component Structure

```
src/pages/doctor/
  index.tsx              — Queue dashboard page
  [visitId].tsx          — Exam view page

src/components/doctor/
  kpi-cards.tsx          — 4 KPI cards
  status-filters.tsx     — Tab filters (Tất cả / Đang chờ / Đang khám)
  queue-table.tsx        — Patient queue table
  patient-panel.tsx      — Left panel (patient info + screening)
  exam-form.tsx          — Right panel wrapper
  screening-data.tsx     — Read-only screening block (editable on click)
  exam-findings.tsx      — Clinical exam fields
  diagnosis-input.tsx    — Hybrid diagnosis search/free-text
  treatment-plan.tsx     — Add-as-needed plan sections
  medication-form.tsx    — Medication entry fields
  optical-rx-form.tsx    — Glasses Rx fields
  procedure-form.tsx     — Procedure entry
  follow-up-form.tsx     — Follow-up scheduling

src/contexts/
  doctor-context.tsx     — Doctor state management
```

---

## Design Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Resizable two-panel exam layout | Doctor can adjust screening vs form ratio to preference |
| 2 | Screening data read-only with edit toggle | Doctor sees technician data in context, can correct without navigating away |
| 3 | Add-as-needed treatment plan | Keeps form uncluttered — doctor adds only relevant sections |
| 4 | Hybrid diagnosis input | Prepares for ICD-10 requirement (31/12/2026) while keeping flexibility |
| 5 | Red flag patients sorted to top | Safety: urgent patients are always visible first |
| 6 | Disease-group adaptive exam sections | Matches screening routing — relevant fields shown per case type |
| 7 | Separate DoctorContext | Clean separation from ReceptionistContext, same pattern |
