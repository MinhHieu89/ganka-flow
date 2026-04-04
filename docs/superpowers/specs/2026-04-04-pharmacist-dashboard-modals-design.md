# Pharmacist Dashboard — Modals & Fixes Design Spec

## Overview

Extends the existing pharmacist dashboard with 3 new modals and fixes to 2 existing components to fully match the functional spec (`docs/pharmacist/pharmacist-dashboard-action.md`).

**Approach:** One component per modal (Approach A). No shared abstractions — each modal is self-contained.

**Source spec:** `docs/pharmacist/pharmacist-dashboard-action.md`

---

## Part 1: Fixes to Existing Components

### 1A. `dispense-modal.tsx` — Align with spec section 5

| Current behavior | Fix |
|---|---|
| Shows `med.group` under medication name | Remove group label from all rows. Spec section 12: "Không hiển thị nhóm thuốc" |
| No allergy-blocking logic | If a medication's name matches an allergen in `order.allergies`, highlight row red and disable "Xác nhận phát thuốc" until the medication is substituted |

The allergy check compares `order.allergies` entries against medication names. In mock data, no current prescription triggers a block (RX-001 has Chloramphenicol allergy but no Chloramphenicol medication), so the logic is in place but doesn't visually fire unless mock data is adjusted.

### 1B. `substitute-medication-dialog.tsx` — Align with spec section 8

Current state is a minimal search + click-to-select dialog. Needs these additions:

**Info bar** (below header):
- Secondary background bar: "Thuốc gốc: **[medication name]** — Hết hàng" with red badge
- Replaces the current subtitle text

**Search results:**
- Click highlights the item (accent background, accent text) but does NOT immediately submit
- Out-of-stock items shown with tertiary text and red "Hết" badge (already filtered out in current impl — keep filtering, but the spec mentions showing them disabled)

**Reason textarea:**
- Label: "Lý do thay thế" with red asterisk
- Height: 60px
- Pre-filled: "[Original medication] hết hàng, thay bằng [selected replacement] — cùng nhóm [group]."
- Updates dynamically when a different replacement is selected

**Footer buttons:**
- "Hủy" — outline, calls `onClose`
- "Xác nhận thay thế" — primary, validates selection + reason non-empty, then calls `onSelect`

### 1C. `prescription-queue-table.tsx` — Wire new modals

Add state management for opening the 3 new modals from dropdown menu items:

```typescript
type OpenModal =
  | { type: "dispense"; order: PrescriptionOrder }
  | { type: "view"; order: PrescriptionOrder }
  | { type: "detail"; order: PrescriptionOrder }
  | { type: "labels"; order: PrescriptionOrder }
  | null
```

Each dropdown `DropdownMenuItem` sets the corresponding modal state. The `"Phát thuốc"` action in the dropdown uses accent color text (spec: "Primary accent color").

---

## Part 2: New Modal — Xem đơn thuốc (Modal 2)

**File:** `src/components/pharmacy/view-prescription-modal.tsx`
**Trigger:** Dropdown → "Xem đơn thuốc" (both pending and dispensed statuses)
**Spec reference:** Section 6

### Header
- Title: "Xem đơn thuốc"
- Status tag next to title: amber "Chờ phát" or green "Đã phát" (same badge style as queue table)
- Close button (x) top-right

### Patient info grid
2 columns, 6 fields:

| Field | Content |
|---|---|
| Bệnh nhân | Patient name |
| Mã BN | Patient ID (BN-YYYYMMDD-XXXX) |
| BS kê đơn | Doctor name |
| Ngày kê | DD/MM/YYYY, HH:mm (from `prescribedAt`) |
| Chẩn đoán | Diagnosis + ICD code if present |
| Hạn đơn | DD/MM/YYYY (còn X ngày) — red if <= 2 days remaining |

### Doctor notes (conditional)
Same style as dispense modal: secondary background, 12px text. Only shown when `order.doctorNotes` exists.

### Medication table
3 columns — no actions, no stock info:

| Column | Content |
|---|---|
| Tên thuốc | Medication name only (no group label) |
| Liều dùng | Dosage detail |
| Số lượng | Quantity + unit |

### Footer
- "In đơn thuốc" — outline button
- "Phát thuốc" — primary button, **only visible when status = pending**. Closes this modal and opens dispense modal for the same order.

### Size
`sm:max-w-2xl` — narrower than dispense modal since fewer columns.

---

## Part 3: New Modal — Chi tiết phát thuốc (Modal 3)

**File:** `src/components/pharmacy/dispense-detail-modal.tsx`
**Trigger:** Dropdown → "Xem chi tiết phát thuốc" (only when status = dispensed)
**Spec reference:** Section 7

### Header
- Title: "Chi tiết phát thuốc"
- Green "Đã phát" status tag next to title
- Close button (x) top-right

### Patient info grid
2 columns, 4 fields: Bệnh nhân, Mã BN, BS kê đơn, Chẩn đoán (+ ICD).

### Dispensing metadata bar
Secondary background strip (`bg-muted rounded-lg p-3`), showing:
- "Dược sĩ phát: **[pharmacist name]**"
- "Thời gian: DD/MM/YYYY, HH:mm"

Displayed as two items on one row, separated by spacing.

### Medication table
4 columns — comparison view:

| Column | Content |
|---|---|
| Thuốc kê (BS) | Original medication from doctor. If substituted: strike-through, tertiary color |
| Thuốc phát (thực tế) | Actual dispensed medication. If different from original: accent color + "→ Thay thế tương đương" sub-label (11px) |
| Liều dùng | Dosage detail |
| SL | Quantity + unit |

### Substitution reason (conditional)
Read-only box with border, only shown when `order.substitutionReason` exists. Shows the text as-is.

### Footer
- "In nhãn thuốc" — outline button, opens print labels modal
- "In đơn thuốc" — outline button
- No primary action (informational modal)

### Size
`sm:max-w-3xl` — same as dispense modal, 4-column table needs width.

---

## Part 4: New Modal — In nhãn thuốc (Modal 5)

**File:** `src/components/pharmacy/print-labels-modal.tsx`
**Trigger:** "In nhãn thuốc" button from dispense modal footer or dispense detail modal footer
**Spec reference:** Section 9

### Header
- Title: "In nhãn thuốc — [Patient name]"
- Close button (x) top-right

### Description
Text: "Xem trước nhãn dán cho từng thuốc. Mỗi nhãn sẽ in trên giấy nhãn dán khổ nhỏ (70 x 35mm)."

### Size toggle
Toggle switch or segmented control with two options:
- "Xem phóng to" (default) — labels scaled ~2x for readability
- "Kích thước thật" — labels at actual 70x35mm using CSS `mm` units

### Label cards
One card per medication, dashed border (`border-dashed`). Layout per label:

```
+------------------------------------------------------+
| [Medication name]              PK Ganka28 · DD/MM/YY |
| BN: [Patient name] — [Patient ID]                    |
| Cách dùng: [dosage detail]                           |
| [Doctor name]                      SL: [qty + unit]  |
+------------------------------------------------------+
```

If the medication is a substitution: name in accent color with "(thay [original name])" suffix.

**Scaled view:** Labels in a vertical stack with comfortable spacing, ~2x physical size.
**Actual size view:** Labels at 70mm x 35mm via CSS `mm` units. Small on screen but true to print.

### Selection mode
- "Chọn nhãn cần in" button toggles selection mode
- In selection mode: each label card gets a checkbox. Unselected labels dim (opacity).
- "In tất cả nhãn" button text changes to "In X nhãn đã chọn" when selection is active and not all are selected.
- Default: all labels selected.

### Footer
- "Chọn nhãn cần in" — outline button, toggles selection mode
- "In tất cả nhãn" / "In X nhãn đã chọn" — primary button

### Size
`sm:max-w-2xl` — labels are narrow, don't need full width.

---

## Part 5: Mock Data Changes

### Type extensions in `mock-pharmacy.ts`

Add to `PrescriptionOrder`:
```typescript
dispensedBy?: string        // Pharmacist name who dispensed
dispensedItems?: DispensedItem[]  // Original → actual medication mapping
```

New type:
```typescript
interface DispensedItem {
  originalMedication: string
  dispensedMedication: string
  isSubstituted: boolean
  dosage: string
  quantity: number
  unit: string
}
```

### Mock data updates

RX-006 (the existing dispensed order) gets:
- `dispensedBy: "Nguyễn Thị Lan"`
- `dispensedItems` populated from its medications (no substitutions in this case)

When a user clicks "Xác nhận phát thuốc" at runtime, the `handleDispense` callback receives the final medication list (with substitutions applied) from the dispense modal. It builds `dispensedItems` by comparing original medications to the final state and sets `dispensedBy: "Nguyễn Thị Lan"` (hardcoded for mockup).

---

## Part 6: Modal Wiring

### State management in `prescription-queue-table.tsx`

Single state variable controls which modal is open:

```typescript
type OpenModal =
  | { type: "dispense"; order: PrescriptionOrder }
  | { type: "view"; order: PrescriptionOrder }
  | { type: "detail"; order: PrescriptionOrder }
  | { type: "labels"; order: PrescriptionOrder }
  | null
```

### Modal transitions
- **View prescription → Dispense:** The "Phát thuốc" button in the view modal calls a handler that switches `openModal` from `{ type: "view" }` to `{ type: "dispense" }` for the same order.
- **Dispense → Labels:** The "In nhãn thuốc" button opens the labels modal as a sub-modal (separate Dialog, dispense modal stays open underneath). Same pattern as the existing substitute dialog.
- **Detail → Labels:** Same sub-modal pattern from the detail modal's "In nhãn thuốc" button.

### Dropdown accent color
The "Phát thuốc" menu item (pending status) uses `text-primary` class per spec's "Primary (accent color)" designation.

---

## Files to create/modify

| File | Action |
|---|---|
| `src/components/pharmacy/dispense-modal.tsx` | Modify — remove group labels, add allergy-blocking logic |
| `src/components/pharmacy/substitute-medication-dialog.tsx` | Modify — add info bar, reason textarea, footer, highlight-then-confirm UX |
| `src/components/pharmacy/prescription-queue-table.tsx` | Modify — wire modal state for all 5 modals |
| `src/components/pharmacy/view-prescription-modal.tsx` | Create |
| `src/components/pharmacy/dispense-detail-modal.tsx` | Create |
| `src/components/pharmacy/print-labels-modal.tsx` | Create |
| `src/data/mock-pharmacy.ts` | Modify — add types + dispensed data |
| `src/pages/pharmacy/index.tsx` | Modify — update handleDispense to build dispensedItems |
