# Screening Page Redesign: Refraction Examination Form

## Summary

Rebuild the screening page from a triage-focused 2-step wizard (chief complaint + disease group routing) into a measurement-focused single-page form for refraction examination. This aligns with the new clinic workflow where the receptionist handles triage (red flags, symptoms) and the technician/refractionist focuses on measurements and can prescribe glasses.

## Scope

**In scope:** Screening page rebuild only.

**Out of scope:** Receptionist red flag migration, OSDI-6 integration, doctor exam changes. These are separate tasks.

## Section Order

The page is a single scrollable form (`max-w-4xl`, centered) with collapsible cards:

1. **Header** — patient name, ID, gender, birth year, source, wait time (reuse `screening-form-header.tsx`)
2. **Phiếu tiếp nhận** — collapsible intake summary, read-only, "Cập nhật" button opens intake drawer (reuse `screening-intake-summary.tsx`, remove summary text from collapsed bar)
3. **Lý do khám** — read-only chief complaint from intake data, "Cập nhật" button to edit
4. **Kính cũ** — OD/OS table: SPH, CYL, AXIS, VA, ADD
5. **Khúc xạ khách quan** — OD/OS table: SPH, CYL, AXIS, VA. Badge: "Chỉ lưu trữ" (software only, not printed)
6. **Khúc xạ chủ quan** — OD/OS table: SPH, CYL, AXIS, VA, ADD, VA gần
7. **Liệt điều tiết** — toggle (OFF by default). When ON: OD/OS table (SPH, CYL, AXIS, VA) + cycloplegic agent checkboxes (Cyclogyl, Mydrin P, Atropine)
8. **Soi bóng đồng tử** — collapsible card (default: expanded), OD/OS inputs
9. **Nhãn áp** — collapsible card (default: expanded), OD/OS inputs
10. **Trục nhãn cầu** — collapsible card (default: expanded), OD/OS inputs
11. **Đơn kính** — toggle (OFF by default). When ON: prescription form pre-filled from subjective refraction (SPH, CYL, AXIS, ADD) + PD, lens type, purpose, notes. Current glasses data carries over (no re-entry).
12. **Ghi chú** — free text textarea
13. **Footer** — Hủy, Lưu nháp, Hoàn thành

## Data Model

### RefractionFormData

Replaces the current `ScreeningFormData` type.

```ts
interface RefractionEyeRow {
  sph: string
  cyl: string
  axis: string
  va: string
}

interface RefractionEyeRowWithAdd extends RefractionEyeRow {
  add: string
}

interface SubjectiveEyeRow extends RefractionEyeRowWithAdd {
  vaNear: string
}

interface RefractionFormData {
  // Current glasses
  currentGlasses: { od: RefractionEyeRowWithAdd; os: RefractionEyeRowWithAdd }

  // Objective refraction (software only, not printed)
  objective: { od: RefractionEyeRow; os: RefractionEyeRow }

  // Subjective refraction
  subjective: { od: SubjectiveEyeRow; os: SubjectiveEyeRow }

  // Cycloplegic refraction (optional)
  cycloplegicEnabled: boolean
  cycloplegicAgent: ("cyclogyl" | "mydrinP" | "atropine")[]
  cycloplegic: { od: RefractionEyeRow; os: RefractionEyeRow }

  // Other tests
  retinoscopy: { od: string; os: string }
  iop: { od: string; os: string }
  axialLength: { od: string; os: string }

  // Glasses prescription (optional)
  glassesRxEnabled: boolean
  glassesRx: {
    od: RefractionEyeRowWithAdd
    os: RefractionEyeRowWithAdd
    pd: string
    lensType: string
    purpose: string
    notes: string
  }

  // Notes
  notes: string
}
```

### Data Flow

- **Chief complaint**: read from `patient.visitReasons` / intake data, not stored in refraction form
- **Current glasses data → Đơn kính**: when glasses Rx toggle is enabled, pre-fill from subjective refraction. Current glasses data also carries over to the optical module's `RxDetail` (no re-entry).
- **On "Hoàn thành"**: save form data to visit, update visit status to `dang_kham` (ready for doctor), navigate back to screening dashboard

## Components

### New Components

| Component | Purpose |
|-----------|---------|
| `screening-form.tsx` | Root form — rewritten, manages state for all sections |
| `screening-refraction-table.tsx` | Reusable OD/OS table for SPH/CYL/AXIS/VA columns. Props control which columns to show (ADD, VA gần). Supports Tab navigation between cells. |
| `screening-chief-complaint.tsx` | Read-only chief complaint with "Cập nhật" edit affordance |
| `screening-cycloplegic-section.tsx` | Toggle + expanded form with agent checkboxes |
| `screening-other-test-card.tsx` | Simple OD/OS input card for retinoscopy, IOP, axial length |
| `screening-glasses-rx-section.tsx` | Toggle + expanded prescription form, pre-filled from subjective refraction |
| `screening-form-notes.tsx` | Free text notes (can reuse existing with minor changes) |

### Reused Components (keep as-is or minor changes)

| Component | Changes |
|-----------|---------|
| `screening-form-header.tsx` | No changes |
| `screening-intake-summary.tsx` | Remove summary text from collapsed bar, keep "Cập nhật" button |
| `screening-history-panel.tsx` | No changes |

### Deleted Components

| Component | Reason |
|-----------|--------|
| `screening-form-initial.tsx` | Replaced by refraction tables |
| `screening-form-red-flags.tsx` | Red flags move to receptionist (separate task) |
| `screening-form-questions.tsx` | Symptom questions no longer in screening |
| `screening-step-indicator.tsx` | No more steps |
| `screening-step2-summary.tsx` | No more Step 2 |
| `screening-step2-group-selector.tsx` | No more disease group routing |
| `screening-step2-group-form.tsx` | No more disease group forms |
| `screening-step2-dry-eye.tsx` | Dry eye moves out of screening |
| `screening-step2-osdi-modal.tsx` | OSDI not in this scope |
| `screening-step2-placeholder-group.tsx` | No more disease groups |

## Interaction Details

### Tab Navigation

Refraction tables support Tab key to move between cells left-to-right, then to the next row. This is critical for fast data entry — technicians work with phoropters and need to type values quickly.

### Toggle Sections (Liệt điều tiết, Đơn kính)

- OFF by default — collapsed to a single row with toggle switch + label
- When toggled ON — smoothly expands to reveal the form below the toggle row
- Toggle state is part of form data (persisted on save)

### Chief Complaint Edit

- Displayed as read-only text with "Cập nhật" button
- Clicking "Cập nhật" opens the intake form drawer (existing `IntakeFormDrawer` component) to edit the intake data
- The chief complaint text updates reactively after the drawer saves

### Đơn kính Pre-fill

When the glasses Rx toggle is turned ON:
- SPH, CYL, AXIS, ADD are pre-filled from the subjective refraction values
- PD, lens type, purpose are empty (technician fills in)
- If subjective refraction values change after pre-fill, they do NOT auto-update the prescription (prescription is a snapshot)

### Form Actions

- **Hủy**: confirm if dirty, navigate back to `/screening`
- **Lưu nháp**: save form data to visit without changing status, navigate back
- **Hoàn thành**: save form data, update visit status to `dang_kham`, navigate back with success toast

## UI Patterns

- `max-w-4xl mx-auto` container (matches doctor exam page)
- Collapsible cards use existing `Collapsible` from Radix UI
- OD badge: teal (`bg-primary`), OS badge: sky blue (`bg-sky-500`)
- Toggle uses shadcn `Switch` component
- Card style: `rounded-lg border border-border bg-background`
- Section headers: `text-sm font-semibold` inside card header row
- Inputs: center-aligned text for numeric fields, standard border styling
- "Chỉ lưu trữ" badge on objective refraction: amber background (`bg-amber-100 text-amber-800`)
