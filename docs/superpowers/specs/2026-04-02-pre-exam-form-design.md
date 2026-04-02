# Pre-Exam Form (Khám sàng lọc) — Design Spec

## Overview

A screening form for technicians to collect initial exam data, check for red flags, and run screening questions before routing the patient to a disease group. This is Step 1 of the pre-exam workflow — triage and data collection, NOT diagnosis.

The technician arrives here from the screening dashboard by clicking "Bắt đầu sàng lọc" or "Tiếp tục" on a patient row.

## Scope

**In scope (Step 1 — Screening):**
- Chief complaint
- UCVA (OD/OS)
- Current glasses Rx (OD/OS)
- Red flag mandatory checks
- Screening questions (symptoms, duration, screen time, contact lens, severity)
- Notes
- Save draft / Continue actions

**Out of scope (Step 2 — deferred):**
- Disease group routing (Dry Eye, Refraction, Myopia Control, General)
- Disease-group-specific test templates

## Route

| Route | Purpose |
|-------|---------|
| `/screening/:visitId` | Pre-exam screening form (replaces current placeholder) |

## Page Layout

```
┌──────────────────────────────────────────────────┐
│ ← Back  Patient Name                  Chờ: 12p  │
│          GK-2026-0042 · Nam · 1985 · Khám mới   │
├──────────────────────────────────────────────────┤
│ (1) Khám sàng lọc ——— (2) Phân loại nhóm bệnh  │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ 📋 Thông tin khám ban đầu                    │ │
│ │ ─────────────────────────────────────         │ │
│ │ Lý do đến khám *          [textarea]         │ │
│ │ Thị lực cơ bản (UCVA) *   [OD] [OS]         │ │
│ │ Khúc xạ / Kính hiện tại   [OD] [OS]         │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🚩 Red Flag               (red border)       │ │
│ │ ─────────────────────────────────────         │ │
│ │ ☑ Đau mắt nhiều    ☐ Giảm thị lực đột ngột  │ │
│ │ ☐ Triệu chứng lệch 1 bên rõ                 │ │
│ │ ┌─ Alert Banner ────────────────────────────┐ │
│ │ │ ⚠ Phát hiện Red Flag!    [Chuyển BS ngay] │ │
│ │ └──────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ ❓ Câu hỏi định hướng                        │ │
│ │ ─────────────────────────────────────         │ │
│ │ Triệu chứng:  [3×2 checkbox grid]           │ │
│ │ Chớp mắt:     ○ Có  ○ Không  ○ Không rõ     │ │
│ │ Thời gian:     [num][đơn vị]  Màn hình: [h]  │ │
│ │ Kính áp tròng: ○ Có  ○ Không                 │ │
│ │ Mức độ:        [Nhẹ] [Trung bình] [Nặng]    │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ ✏️ Ghi chú                                   │ │
│ │ ─────────────────────────────────────         │ │
│ │ [textarea]                                   │ │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ [Hủy]                      [Lưu nháp] [Tiếp tục →] │
└──────────────────────────────────────────────────┘
```

## Patient Header

Displayed at the top of the page, consistent with the existing visit.tsx pattern.

| Element | Details |
|---------|---------|
| Back button | `Button variant="ghost" size="icon-sm"`, navigates to `/screening` |
| Patient name | `text-xl font-bold` |
| Subtitle | `text-sm text-muted-foreground` — format: `{patient.id} · {gender} · {birthYear} · {visitType}` |
| Wait time | Right-aligned. Label "Thời gian chờ:" + calculated minutes from `checkedInAt`. Amber color (`text-amber-500`), bold if >= 30 min use `text-destructive font-semibold` |

Patient data is looked up from context using the `visitId` route param.

## Step Indicator

A horizontal step indicator below the patient header. Visual only — not clickable.

| Step | Label | State |
|------|-------|-------|
| 1 | Khám sàng lọc | Active — primary color circle + bold text |
| 2 | Phân loại nhóm bệnh | Disabled — gray circle + muted text |

Connected by a short gray line between steps. Step 2 is shown for context but not interactive in this scope.

## Section 1: Thông tin khám ban đầu

Card with icon + title + divider (matching intake-form section pattern).

### Fields

| Field | Type | Required | Details |
|-------|------|----------|---------|
| Lý do đến khám | Textarea | Yes | Placeholder: "Mô tả lý do khám chính của bệnh nhân...", rows=3, max 500 chars with counter |
| Thị lực cơ bản (UCVA) | 2× Input (OD/OS) | Yes | Placeholder: "VD: 20/40". OD badge = primary purple, OS badge = sky blue |
| Khúc xạ nhanh / Kính hiện tại | 2× Input (OD/OS) | No | Placeholder: "VD: -2.50 / -0.75 x 180". Same OD/OS badge colors |

### OD/OS Badge Colors

| Eye | Background | Text |
|-----|-----------|------|
| OD | `bg-primary` (app purple) | `text-primary-foreground` (white) |
| OS | `bg-sky-500` | `text-white` |

Badges are `text-xs font-bold px-2.5 py-1 rounded-md`.

### Layout

- Each OD/OS field row: `grid grid-cols-2 gap-3` with badge + input inside each cell
- Fields stack vertically with `space-y-4`

## Section 2: Red Flag

Card with **red border** (`border-2 border-red-300`) to visually distinguish from other sections.

### Red Flag Checkboxes

| Flag | Value |
|------|-------|
| Đau mắt nhiều | `eyePain` |
| Giảm thị lực đột ngột | `suddenVisionLoss` |
| Triệu chứng lệch 1 bên rõ | `asymmetry` |

Layout: `grid grid-cols-2 gap-2.5`. Each checkbox inside a bordered card-style label (`border border-border rounded-lg px-3 py-2.5`).

### Alert Banner

Shown **only when at least one red flag is checked**. Animated entrance (fade + slide).

| Element | Details |
|---------|---------|
| Container | `bg-red-50 border border-red-300 rounded-lg px-4 py-3`, flex between |
| Icon | Red circle with warning icon (`bg-destructive text-white rounded-full size-9`) |
| Title | "Phát hiện Red Flag!" — `text-destructive font-semibold text-sm` |
| Subtitle | Lists checked flag names — `text-destructive text-xs` |
| Action button | "→ Chuyển bác sĩ ngay" — `Button variant destructive`. Navigates back to screening dashboard (in real app would fast-track patient status) |

### Behavior

- Checking any red flag immediately shows the alert banner
- Unchecking all flags hides the banner
- "Chuyển bác sĩ ngay" button: for mockup, navigates to `/screening` with a toast/alert indicating the patient was fast-tracked. Updates visit status to `dang_kham` in context.

## Section 3: Câu hỏi định hướng

Card with icon + title + divider.

### Fields

| Field | Type | Layout | Options |
|-------|------|--------|---------|
| Triệu chứng | Checkboxes | `grid grid-cols-3 gap-2` | Khô mắt, Cộm/rát mắt, Nhìn mờ, Chảy nước mắt, Ngứa mắt, Nhức đầu |
| Nhìn mờ có cải thiện sau khi chớp mắt không? | Radio pills | Horizontal flex | Có, Không, Không rõ |
| Thời gian triệu chứng | Number + Select | `grid grid-cols-2 gap-4` (left half) | Number input + dropdown: ngày/tuần/tháng/năm |
| Thời gian dùng màn hình (giờ/ngày) | Number input | `grid grid-cols-2 gap-4` (right half) | Placeholder: "VD: 8" |
| Đeo kính áp tròng? | Radio pills | Horizontal flex | Có, Không |
| Mức độ khó chịu | Toggle group | `grid grid-cols-3 gap-2` | Nhẹ, Trung bình, Nặng |

### Checkbox Style

Each checkbox is rendered inside a bordered card-style label:
```
border border-border rounded-lg px-3 py-2.5 text-sm cursor-pointer
hover:bg-muted/50 transition-colors
```
Checked state: `border-primary bg-primary/5`

### Radio Pill Style

Rounded pill buttons with radio inside:
```
border border-border rounded-full px-4 py-1.5 text-sm cursor-pointer
```
Selected state: `border-primary bg-primary/5 text-primary font-medium`

### Severity Toggle

Three equal-width buttons. Only one selectable at a time.
- Default: `border border-border bg-background text-foreground`
- Selected: `border-2 border-primary bg-primary/5 text-primary font-semibold`

## Section 4: Ghi chú

Card with icon + title + divider.

Single textarea field:
- Placeholder: "Ghi chú thêm nếu cần..."
- Rows: 3
- No character limit
- Not required

## Footer

Matches the intake-form footer pattern: `border-t border-border pt-4`, flex justify-between.

| Button | Position | Variant | Behavior |
|--------|----------|---------|----------|
| Hủy | Left | `outline` | Navigate back to `/screening`, discard changes. Show confirm dialog if form has been modified. |
| Lưu nháp | Right group | `outline` | Save form state to context (partial data OK). Navigate to `/screening`. Show toast "Đã lưu nháp". |
| Tiếp tục → | Right group | `default` (primary) | Validate required fields. If valid, save to context, update visit status to `dang_kham`, navigate to `/screening` with toast "Hoàn thành sàng lọc". (Step 2 routing is out of scope — for now this completes the screening.) If invalid, show inline errors. |

## Validation

Only applied on "Tiếp tục →", not on "Lưu nháp".

| Field | Rule | Error message |
|-------|------|---------------|
| Lý do đến khám | Required, non-empty | "Vui lòng nhập lý do đến khám" |
| UCVA OD | Required, non-empty | "Vui lòng nhập thị lực mắt phải" |
| UCVA OS | Required, non-empty | "Vui lòng nhập thị lực mắt trái" |

Error display: `text-xs text-destructive mt-1` below the field (matching intake-form pattern).

## State Management

Form state stored in a local `useState` object:

```typescript
interface ScreeningFormData {
  chiefComplaint: string
  ucvaOd: string
  ucvaOs: string
  currentRxOd: string
  currentRxOs: string
  redFlags: {
    eyePain: boolean
    suddenVisionLoss: boolean
    asymmetry: boolean
  }
  symptoms: {
    dryEyes: boolean
    gritty: boolean
    blurry: boolean
    tearing: boolean
    itchy: boolean
    headache: boolean
  }
  blinkImprovement: "yes" | "no" | "unclear" | null
  symptomDuration: number
  symptomDurationUnit: "ngày" | "tuần" | "tháng" | "năm"
  screenTime: string
  contactLens: "yes" | "no" | null
  discomfortLevel: "mild" | "moderate" | "severe" | null
  notes: string
}
```

On "Lưu nháp" or "Tiếp tục", data is saved to the visit object in `ReceptionistContext` (extend the context to hold screening data per visit). On page load, if the visit already has screening data (e.g. returning to a draft), pre-populate the form.

## Component Structure

```
src/pages/screening/visit.tsx          — Page component (read route params, render form)
src/components/screening/
  screening-form.tsx                   — Main form component (state, validation, submit)
  screening-form-header.tsx            — Patient header + wait time
  screening-form-initial.tsx           — Section 1: Thông tin khám ban đầu
  screening-form-red-flags.tsx         — Section 2: Red Flag with alert banner
  screening-form-questions.tsx         — Section 3: Câu hỏi định hướng
  screening-form-notes.tsx             — Section 4: Ghi chú
```

Each section component receives form state + `updateField` handler as props. The main `screening-form.tsx` manages state and orchestrates sections.

## Data Model Extension

Add `screeningData` to the `Visit` type in `src/data/mock-patients.ts`:

```typescript
interface Visit {
  // ... existing fields
  screeningData?: ScreeningFormData
}
```

## Dark Mode

All colors use Tailwind semantic tokens (`border-border`, `bg-background`, `text-foreground`, etc.) which auto-switch in dark mode. Exceptions:

- Red flag border: `border-red-300 dark:border-red-800`
- Red flag alert bg: `bg-red-50 dark:bg-red-950/30`
- OD/OS badges: fixed colors (purple/sky) that work in both modes
- Severity selected state: `bg-primary/5 dark:bg-primary/10`

## Accessibility

- All form fields have associated `<Label>` elements
- Required fields marked with red asterisk and `aria-required`
- Invalid fields use `aria-invalid` with descriptive error messages
- Red flag alert uses `role="alert"` for screen reader announcement
- Checkbox/radio groups use `role="group"` with `aria-label`
- Keyboard navigation: Tab through fields, Space to toggle checkboxes, Enter to submit
