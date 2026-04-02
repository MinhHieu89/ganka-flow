# Pre-Exam Step 2 — Phân loại nhóm bệnh (Disease Group Routing) — Design Spec

## Overview

Step 2 of the pre-exam workflow. After the technician completes screening (Step 1), they select one or more disease groups and fill in group-specific test data. This is the routing and initial measurement step — still NOT diagnosis.

The technician arrives here by clicking "Tiếp tục →" on Step 1, which saves Step 1 data and transitions to Step 2 on the same route.

## Scope

**In scope:**
- Disease group selection (multi-select toggle pills)
- Dry Eye group form with full fields (OSDI-6 modal, TBUT, Schirmer, Meibomian, Staining)
- Refraction, Myopia Control, General group forms as placeholders
- Step 1 summary card (collapsible, read-only)
- Drag-to-reorder selected group form sections
- Save draft / Complete actions
- OSDI-6 questionnaire modal matching clinic template

**Out of scope:**
- Full field design for Refraction, Myopia Control, General (deferred)
- Auto-suggestion of disease group based on Step 1 data
- Backend integration

## Route

Same route as Step 1: `/screening/:visitId`. The screening form component manages which step is displayed via internal state.

## Page Layout

```
┌──────────────────────────────────────────────────┐
│ ← Back  Patient Name                  Chờ: 12p  │
│          GK-2026-0042 · Nam · 1985 · Khám mới   │
├──────────────────────────────────────────────────┤
│ (✓) Khám sàng lọc ——— (2) Phân loại nhóm bệnh  │
├──────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐ │
│ │ 📋 Tóm tắt sàng lọc (Bước 1)          ▼    │ │
│ │ Lý do: Khô mắt · UCVA: OD 20/30 OS 20/25   │ │
│ │ ✓ Không có Red Flag · Symptoms: ...          │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ 🏷️ Chọn nhóm bệnh (chọn 1 hoặc nhiều)      │ │
│ │ [👁️ Khô mắt ✓] [🔍 Khúc xạ] [📏 Cận thị]  │ │
│ │ [🏥 Tổng quát]                               │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ ⠿ 👁️ Khô mắt (Dry Eye)          [5 tests]  │ │
│ │ ─────────────────────────────────────         │ │
│ │ OSDI-6: [Chưa đánh giá] [📝 Làm bảng hỏi]  │ │
│ │ TBUT:   [OD] [OS]                            │ │
│ │ Schirmer: [OD] [OS]                          │ │
│ │ Meibomian: [textarea]                        │ │
│ │ Staining:  [textarea]                        │ │
│ └──────────────────────────────────────────────┘ │
│ ┌──────────────────────────────────────────────┐ │
│ │ ⠿ 🔍 Khúc xạ (Refraction)        [3 tests]  │ │
│ │ ─────────────────────────────────────         │ │
│ │ [Full refraction] [Current glasses] [VA]     │ │
│ │ (placeholder — chi tiết thiết kế sau)        │ │
│ └──────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────┤
│ [← Quay lại]              [Lưu nháp] [Hoàn thành →] │
└──────────────────────────────────────────────────┘
```

## Patient Header

Identical to Step 1 — reuses `ScreeningFormHeader` component.

## Step Indicator

Reuses `ScreeningStepIndicator` with `currentStep={2}`.

| Step | Label | State |
|------|-------|-------|
| 1 | Khám sàng lọc | Completed — primary color circle with checkmark |
| 2 | Phân loại nhóm bệnh | Active — primary color circle + bold text |

## Step 1 Summary Card

Collapsible card showing Step 1 data in read-only format.

| Element | Details |
|---------|---------|
| Default state | Collapsed — shows one-line summary |
| Header | Icon (📋) + "Tóm tắt sàng lọc (Bước 1)" + chevron toggle |
| Collapsed content | Inline: chief complaint, UCVA OD/OS (with colored badges), red flag status |
| Collapsed symptoms | Tags showing checked symptoms from Step 1 (e.g. "Khô mắt", "Nhìn mờ", "Mức độ: Trung bình") |
| Expanded content | Full read-only display of all Step 1 data (screening questions, notes, etc.) |
| Red flag reminder | If any red flags were checked in Step 1 (but not fast-tracked), show in amber |
| Toggle | Click header to expand/collapse |

## Disease Group Selector

Card with icon + title + hint text.

### Layout

```
🏷️ Chọn nhóm bệnh (chọn 1 hoặc nhiều)
[👁️ Khô mắt ✓] [🔍 Khúc xạ ✓] [📏 Cận thị] [🏥 Tổng quát]
```

### Groups

| Group | Icon | Label | Tests |
|-------|------|-------|-------|
| Dry Eye | 👁️ | Khô mắt | OSDI, TBUT, Schirmer, Meibomian, Staining |
| Refraction | 🔍 | Khúc xạ | Full refraction, Current glasses, VA |
| Myopia Control | 📏 | Cận thị | Axial length, Progression, Lifestyle, Risk scoring |
| General | 🏥 | Tổng quát | VA, IOP, Slit-lamp, Fundus |

### Toggle Pill Style

Horizontal flex row, wrapping on small screens.

Unselected:
```
border border-border rounded-full px-4 py-2 text-muted-foreground
```

Selected:
```
border-2 border-primary bg-primary/5 text-primary font-medium
```
Plus small checkmark circle (primary bg, white check icon).

### Behavior

- Click unselected pill → select group, append its form section at the bottom of the stack
- Click selected pill → deselect group, remove its form section (with animation)
- No limit on number of selected groups
- If no groups selected, show hint below pills: "Chọn ít nhất 1 nhóm bệnh để tiếp tục" (informational only, not blocking)

## Disease Group Form Sections

Each selected group renders as a card below the selector, stacked vertically with `space-y-3`.

### Card Header

| Element | Details |
|---------|---------|
| Drag handle | `⠿` icon, `cursor-grab`, for reorder only |
| Group icon | Emoji matching the group |
| Group name | `font-semibold text-sm` |
| Test count badge | Right-aligned, `bg-muted text-muted-foreground text-xs rounded-full px-2.5` |

### Drag to Reorder

- Drag handle only (not whole card)
- Uses `@dnd-kit/core` + `@dnd-kit/sortable`
- Cards animate position changes smoothly

### Animation

- Selected group form: fade in + slide down on appear
- Deselected group form: fade out + slide up on remove

## Dry Eye Form (Full Fields)

| Field | Type | OD/OS | Details |
|-------|------|-------|---------|
| OSDI-6 Score | Button → Modal | No | Opens OSDI-6 questionnaire modal. Displays score + severity after completion. |
| TBUT | Number input | Yes | In seconds, placeholder "VD: 5" |
| Schirmer | Number input | Yes | In mm, placeholder "VD: 10" |
| Meibomian | Textarea | No | Free text, rows=2, placeholder "Mô tả tình trạng tuyến Meibomian..." |
| Staining | Textarea | No | Free text, rows=2, placeholder "Mô tả kết quả nhuộm..." |

All fields are optional — no validation on Step 2.

### OD/OS Badge Colors

Same as Step 1:

| Eye | Background | Text |
|-----|-----------|------|
| OD | `bg-primary` | `text-primary-foreground` |
| OS | `bg-sky-500` | `text-white` |

### OSDI-6 Field States

**Before filling:**
- Dashed border placeholder: "Chưa đánh giá"
- Button: "📝 Làm bảng hỏi OSDI" (outline style, primary color)

**After filling:**
- Shows score (large, bold) + severity badge (color-coded) + "6/6 câu đã trả lời"
- Button changes to: "✏️ Làm lại" (outline style, muted color)

## OSDI-6 Questionnaire Modal

Opened by clicking "Làm bảng hỏi OSDI" button in Dry Eye form.

### Modal Structure

| Element | Details |
|---------|---------|
| Title | "📝 Bảng hỏi OSDI-6" |
| Close button | Top-right X button |
| Content | Scrollable area with 6 questions in 3 groups |
| Scoring reference | Bottom bar showing point scale |
| Footer | Live total + severity badge + "Hủy" / "Ghi nhận điểm" buttons |

### Question Groups

**Group 1 — Triệu chứng:**
"Trong một ngày điển hình trong 1 tuần qua, bạn có gặp phải bất kỳ triệu chứng nào của mắt dưới đây không:"

1. Chói mắt
2. Nhìn mờ giữa các lần chớp mắt liên tục

**Group 2 — Hoạt động:**
"Trong một ngày điển hình trong 1 tuần qua, các vấn đề về mắt có ảnh hưởng đến bạn chủ yếu trong việc thực hiện hoạt động nào sau đây:"

3. Lái xe hoặc ngồi trên xe vào ban đêm
4. Xem tivi / thực hiện các hoạt động trên máy tính / đọc sách

**Group 3 — Tình huống:**
"Trong một ngày điển hình trong 1 tuần qua, mắt bạn có cảm thấy khó chịu trong bất kỳ tình huống nào dưới đây không:"

5. Ở những nơi có gió thổi nhiều / khô bụi
6. Ở những nơi có độ ẩm thấp hoặc có điều hòa

### Answer Options

Each question has 5 options as labeled pill buttons (ordered left to right):

| Label | Score |
|-------|-------|
| Không bao giờ | 0 |
| Thỉnh thoảng | 1 |
| Thường xuyên | 2 |
| Hầu hết thời gian | 3 |
| Liên tục | 4 |

Pill style matches the disease group selector:
- Unselected: `border border-border rounded-full px-3 py-1.5 text-sm text-muted-foreground`
- Selected: `border-2 border-primary bg-primary/5 text-primary font-semibold`

### Scoring

- Total = sum of all 6 answers (range: 0–24)
- Live total displayed in modal footer, updates as answers change

| Score | Level | Badge Color |
|-------|-------|-------------|
| 0–3 | Bình thường | Green (`bg-green-100 text-green-800`) |
| 4–8 | Trung bình | Amber (`bg-amber-100 text-amber-800`) |
| ≥9 | Nặng | Red (`bg-red-100 text-red-800`) |

### Modal Footer

- "Hủy" — closes modal, discards answers
- "Ghi nhận điểm" — saves score + individual answers to form state, closes modal

### Scoring Reference Bar

Between questions and footer: `bg-muted text-xs`
"Thang điểm tham chiếu: Không bao giờ = 0 · Thỉnh thoảng = 1 · Thường xuyên = 2 · Hầu hết thời gian = 3 · Liên tục = 4"

## Placeholder Group Forms (Refraction, Myopia Control, General)

Each placeholder group shows test names in dashed-border boxes.

### Refraction

| Test | Placeholder |
|------|-------------|
| Full refraction | "Chi tiết sẽ được thiết kế sau" |
| Current glasses | "Chi tiết sẽ được thiết kế sau" |
| VA | "Chi tiết sẽ được thiết kế sau" |

### Myopia Control

| Test | Placeholder |
|------|-------------|
| Axial length | "Chi tiết sẽ được thiết kế sau" |
| Progression | "Chi tiết sẽ được thiết kế sau" |
| Lifestyle | "Chi tiết sẽ được thiết kế sau" |
| Risk scoring | "Chi tiết sẽ được thiết kế sau" |

### General

| Test | Placeholder |
|------|-------------|
| VA | "Chi tiết sẽ được thiết kế sau" |
| IOP | "Chi tiết sẽ được thiết kế sau" |
| Slit-lamp | "Chi tiết sẽ được thiết kế sau" |
| Fundus | "Chi tiết sẽ được thiết kế sau" |

Layout: `grid grid-cols-2 gap-3` (or `grid-cols-3` for groups with 3 tests). Each box: `bg-muted/50 border border-dashed border-border rounded-lg p-6 text-center`.

## Footer

Matches Step 1 footer pattern: `border-t border-border pt-4`, flex justify-between.

| Button | Position | Variant | Behavior |
|--------|----------|---------|----------|
| ← Quay lại | Left | `outline` | Go back to Step 1, preserve Step 2 data in state |
| Lưu nháp | Right group | `outline` | Save all Step 2 data to context, navigate to `/screening`, toast "Đã lưu nháp" |
| Hoàn thành → | Right group | `default` (primary) | Save data, set visit status to `cho_kham_bs`, navigate to `/screening`, toast "Hoàn thành sàng lọc — chờ bác sĩ khám" |

No validation on "Hoàn thành" — saves whatever data is present.

## State Management

### Step 2 Form Data

```typescript
interface DryEyeFormData {
  osdiScore: number | null
  osdiAnswers: (number | null)[]  // 6 answers, each 0-4 or null
  osdiSeverity: "normal" | "moderate" | "severe" | null
  tbutOd: string
  tbutOs: string
  schirmerOd: string
  schirmerOs: string
  meibomian: string
  staining: string
}

interface Step2FormData {
  selectedGroups: ("dryEye" | "refraction" | "myopiaControl" | "general")[]
  groupOrder: ("dryEye" | "refraction" | "myopiaControl" | "general")[]
  dryEye: DryEyeFormData
  // Placeholder groups store no data for now
}
```

### Extension to ScreeningFormData

Add `step2` to the existing `ScreeningFormData`:

```typescript
interface ScreeningFormData {
  // ... existing Step 1 fields
  step2?: Step2FormData
}
```

### Step Transition

- "Tiếp tục →" on Step 1: saves Step 1 data, sets internal `currentStep` to 2
- "← Quay lại" on Step 2: sets `currentStep` back to 1, Step 2 data preserved in state
- On page load: if visit has `screeningData.step2`, restore both steps and show Step 2

## Component Structure

```
src/components/screening/
  screening-form.tsx                    — Extended: manages currentStep state (1 or 2)
  screening-step2-summary.tsx           — Step 1 summary card (collapsible, read-only)
  screening-step2-group-selector.tsx    — Toggle pills for disease group selection
  screening-step2-group-form.tsx        — Container for a single group's form (drag handle + card)
  screening-step2-dry-eye.tsx           — Dry Eye form with full fields
  screening-step2-osdi-modal.tsx        — OSDI-6 questionnaire modal
  screening-step2-placeholder-group.tsx — Placeholder form for non-Dry-Eye groups
```

## Dark Mode

All colors use Tailwind semantic tokens. Exceptions:

- OSDI severity badges: fixed colors that work in both modes (green/amber/red with appropriate dark variants)
- OD/OS badges: fixed purple/sky colors
- Placeholder boxes: `bg-muted/50 dark:bg-muted/30`
- Selected pill state: `bg-primary/5 dark:bg-primary/10`

## Accessibility

- Toggle pills use `role="group"` with `aria-label="Chọn nhóm bệnh"`
- Each pill is a button with `aria-pressed` state
- OSDI modal uses `Dialog` from Radix UI with proper focus trap
- OSDI answer pills use `role="radiogroup"` per question with `aria-label`
- Drag reorder: keyboard accessible via `@dnd-kit` (arrow keys to move)
- Live score in OSDI modal uses `aria-live="polite"` for screen reader updates
