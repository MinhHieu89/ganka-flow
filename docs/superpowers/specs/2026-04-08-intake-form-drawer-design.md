# Intake Form Drawer — Design Spec

## Summary

Add a "Xem chi tiết" button to the Phiếu tiếp nhận collapsible in screening. Clicking it opens a right-side drawer (50% width) with the full editable intake form. The user can update fields and save. The component is reusable across screening and doctor screens.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Edit mode | Always editable | No read-only gate — form opens ready to edit |
| Drawer width | 50% screen width | Balanced — user sees screening context behind it |
| Save behavior | Save and close | "Lưu" saves data and closes drawer automatically |
| Sections shown | All 7 sections | Complete intake form, same as original |
| Architecture | Separated form + drawer shell | Form is reusable standalone; drawer is thin wrapper |

## Components

### 1. `IntakeFormEditable`

**File:** `src/components/intake/intake-form-editable.tsx`

A standalone editable form composing the existing 7 intake section components.

**Props:**
```typescript
interface IntakeFormEditableProps {
  patient: Patient
  onSave: (data: Partial<Patient>) => void
  onCancel: () => void
}
```

**Behavior:**
- Initializes form state from `patient` using the same `buildInitialForm` pattern from `intake-form.tsx`
- Renders all 7 sections with their existing section components:
  1. `IntakeSectionPersonal` — Thông tin cá nhân
  2. `IntakeSectionComplaint` — Lý do khám và triệu chứng
  3. `IntakeSectionEyeHistory` — Tiền sử mắt cá nhân
  4. `IntakeSectionMedicalHistory` — Tiền sử y tế tổng quát
  5. `IntakeSectionFamilyHistory` — Tiền sử gia đình
  6. `IntakeSectionLifestyle` — Thói quen sinh hoạt và công việc
  7. `IntakeSectionReferral` — Nguồn thông tin về phòng khám
- Each section has a header with roman numeral, title, and icon (same `SECTIONS` config as `intake-form.tsx`)
- Sticky footer with "Hủy" (calls `onCancel`) and "Lưu" (validates then calls `onSave`)
- Validation rules (same as current intake form):
  - `name` — required
  - `gender` — required
  - `dob` — required
  - `phone` — required, must match `^0\d{9,10}$`
  - `visitReasons` — at least one required
  - `email` — if provided, must be valid format
- `buildInitialForm` and form-to-patient data mapping logic: copy from `intake-form.tsx` (lines 107-161 and 252-358) into this component. The existing `IntakeForm` page keeps its own copy for now — deduplication is out of scope

**Not included** (page-level concerns):
- Navigation (`useNavigate`)
- Print dialog
- Share modal
- Duplicate patient detection

### 2. `IntakeFormDrawer`

**File:** `src/components/intake/intake-form-drawer.tsx`

Thin wrapper putting `IntakeFormEditable` inside a Sheet.

**Props:**
```typescript
interface IntakeFormDrawerProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Patient>) => void
}
```

**Structure:**
```
Sheet (side="right", ~50% width)
  SheetHeader
    SheetTitle: "Phiếu tiếp nhận — {patient.name}"
  SheetContent (scrollable)
    IntakeFormEditable
      patient={patient}
      onSave={(data) => { onSave(data); onOpenChange(false) }}
      onCancel={() => onOpenChange(false)}
```

**Styling:**
- Sheet opens from the right
- Width: `max-w-[50vw] w-[50vw]` via className on SheetContent
- Content area scrolls vertically for the full form
- No default close button in header (user uses "Hủy" or "Lưu" in the form footer)

### 3. Integration: `ScreeningIntakeSummary` update

**File:** `src/components/screening/screening-intake-summary.tsx`

**Changes:**
- Add a "Xem chi tiết" button in the collapsible header row, positioned before the chevron arrow
- Button style: `variant="ghost"` with small text, does not interfere with the collapsible trigger
- Clicking the button opens the `IntakeFormDrawer`
- Need to stop event propagation so clicking "Xem chi tiết" doesn't toggle the collapsible
- On save: calls `updatePatient(patient.id, data)` from `useReceptionist` context
- Component needs to accept an `onPatientUpdate` callback or use context directly

**Updated props:**
```typescript
interface ScreeningIntakeSummaryProps {
  patient: Patient
  onPatientUpdate?: (data: Partial<Patient>) => void
}
```

## File Structure

```
src/components/intake/
  intake-form-editable.tsx    ← NEW: reusable editable form
  intake-form-drawer.tsx      ← NEW: Sheet wrapper

src/components/screening/
  screening-intake-summary.tsx  ← MODIFIED: add "Xem chi tiết" button + drawer integration
```

## Reuse in Doctor Screens

To use in doctor screens (future):
```tsx
import { IntakeFormDrawer } from "@/components/intake/intake-form-drawer"

// In any doctor component:
<IntakeFormDrawer
  patient={patient}
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  onSave={(data) => updatePatient(patient.id, data)}
/>
```

No changes to `IntakeFormDrawer` needed — same props work for any consumer.

## Out of Scope

- Refactoring existing `IntakeForm` page to use `IntakeFormEditable` (can be done later)
- Doctor screen integration (this spec only adds the drawer, doctor screens import it when ready)
- Print/share functionality in the drawer
- Optimistic updates or loading states (no backend yet)
