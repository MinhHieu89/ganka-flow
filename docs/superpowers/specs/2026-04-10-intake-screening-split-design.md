# Intake & Screening Split Design

**Date:** 2026-04-10
**Status:** Draft
**Summary:** Simplify the intake form to personal info + referral only. Move medical/eye history sections to a separate patient-facing history form accessible via QR code, filled on patient's phone or clinic iPad while waiting.

---

## Problem

The current intake form at `/intake/new` has 7 sections (I-VII), all filled by the receptionist. This is time-consuming and delays patient flow. Sections II-VI are better suited for patient self-service or collection during the screening step.

## Solution

Split the intake form into two separate experiences:

1. **Simplified Intake Form** (receptionist) — Sections I + VII only
2. **Patient History Form** (patient self-service) — Sections II-VI, accessed via QR code

---

## 1. Simplified Intake Form

**Route:** `/intake/new` (unchanged)

**Sections kept:**
- **I. Thong tin ca nhan** — Name, gender, DOB, phone, email, ID, occupation, address, district, city, emergency contact
- **VII. Nguon thong tin ve phong kham** — Referral source + detail

**Sections removed from intake:**
- II. Ly do kham va trieu chung
- III. Tien su mat ca nhan
- IV. Tien su y te tong quat
- V. Tien su gia dinh
- VI. Thoi quen sinh hoat va cong viec

**Action buttons:**
- **"Huy"** — Cancel, navigate back to `/intake`
- **"Luu"** — Save patient only (e.g., pre-registration)
- **"Luu & Sang loc"** — Save patient, create visit, move to screening queue, then show QR code dialog for the patient history form

**Components removed:**
- `intake-section-complaint.tsx`
- `intake-section-eye-history.tsx`
- `intake-section-medical-history.tsx`
- `intake-section-family-history.tsx`
- `intake-section-lifestyle.tsx`

**Components kept:**
- `intake-section-personal.tsx`
- `intake-section-referral.tsx`
- `intake-form.tsx` (simplified orchestrator)

**New component:**
- `qr-code-dialog.tsx` — Modal with QR code + copyable link + patient name + "In QR" (print) button

---

## 2. Patient History Form

**Route:** `/patient/:visitId/history?token=<short-token>`

**Purpose:** Mobile-first wizard for patients to fill medical history on their phone or clinic iPad. No login required — accessed via QR code link with a short visit token for basic access control.

### New Patient Flow (wizard, one section per screen)

1. **II. Ly do kham va trieu chung** (per-visit — always fresh)
2. **III. Tien su mat ca nhan** (per-patient — saved once, reused)
3. **IV. Tien su y te tong quat** (per-patient)
4. **V. Tien su gia dinh** (per-patient)
5. **VI. Thoi quen sinh hoat** (per-patient)
6. **Confirmation screen** — "Cam on! Vui long cho goi ten."

### Returning Patient Flow

1. **II. Ly do kham** — fill fresh (always)
2. **Summary screen** — Read-only cards showing existing III-VI data. Each card has a "Cap nhat" button to expand and edit. If nothing changed, patient taps "Xac nhan" to confirm and go to completion screen.

### Data Ownership

| Section | Scope | Behavior |
|---------|-------|----------|
| II. Ly do kham va trieu chung | Per-visit | Fresh every visit |
| III. Tien su mat ca nhan | Per-patient | Saved once, summary + update for returning patients |
| IV. Tien su y te tong quat | Per-patient | Saved once, summary + update for returning patients |
| V. Tien su gia dinh | Per-patient | Saved once, summary + update for returning patients |
| VI. Thoi quen sinh hoat | Per-patient | Saved once, summary + update for returning patients |

### UI Design

- Progress bar at top showing step completion
- One question group visible at a time
- Large touch targets for mobile
- "Tiep tuc" / "Quay lai" navigation between steps
- Auto-save draft as patient progresses (resilient to connection loss)
- Vietnamese labels throughout, no emoji
- No login required — token-based access

### Components

- `patient-history-form.tsx` — Orchestrator (wizard state machine)
- `patient-history-step-complaint.tsx` — Reuses logic from `intake-section-complaint.tsx`
- `patient-history-step-eye.tsx` — Reuses logic from `intake-section-eye-history.tsx`
- `patient-history-step-medical.tsx` — Reuses logic from `intake-section-medical-history.tsx`
- `patient-history-step-family.tsx` — Reuses logic from `intake-section-family-history.tsx`
- `patient-history-step-lifestyle.tsx` — Reuses logic from `intake-section-lifestyle.tsx`
- `patient-history-summary.tsx` — Returning patient summary cards with "Cap nhat" buttons

---

## 3. QR Code & Handoff Mechanism

### QR Code Dialog

**Component:** `qr-code-dialog.tsx`

- Shown automatically after "Luu & Sang loc" completes
- Contains: QR code image, copyable URL, patient name for confirmation
- URL format: `/patient/:visitId/history?token=<short-token>`
- Token: Short random string tied to the visit for basic access control without login
- Buttons: "In QR" (print small receipt), "Dong" (close)

### QR Access on Dashboards

- **Receptionist dashboard** (`/intake`): QR icon button on each patient row. Opens QR dialog.
- **Screening dashboard** (`/screening`): QR icon button visible when history status is "Chua khai". Hidden once completed.

### History Completion Status

- Stored on visit record: `historyStatus: "pending" | "completed"`
- Updated when patient submits the history form
- Displayed as badge on both dashboards:
  - **"Chua khai"** (amber) — Patient hasn't filled the form
  - **"Da khai"** (green) — Patient completed the history form

---

## 4. Technician Screening Integration

**No changes to existing Step 1 and Step 2 flow.**

### History Panel

- Collapsible panel at the top of the screening page
- Default state: collapsed, showing status badge only ("Da khai" / "Chua khai")
- Expanded: read-only view of all submitted history (sections II-VI), organized by section
- If "Chua khai": shows message "Benh nhan chua khai bao benh su" + QR button

### Data Pre-fill (existing behavior, new source)

| Screening Field | Source |
|----------------|--------|
| Chief complaint (Step 1) | Section II — Ly do kham |
| Screen time (Step 1) | Section VI — Thoi quen sinh hoat |
| Contact lens status (Step 1) | Section III — Tien su mat |

These pre-fills already exist in the current screening code. They just pull from the patient history record instead of the intake form data.

### No Changes To

- Step 1 fields (UCVA, Rx, red flags, symptoms)
- Step 2 disease group routing
- Red flag fast-track logic
- Dry eye / refraction / myopia / general sub-forms

---

## 5. User Flow Summary

```
RECEPTIONIST                    PATIENT                         TECHNICIAN
-----------                     -------                         ----------
1. /intake/new
   Fill Section I + VII
   Click "Luu & Sang loc"
   → QR dialog appears
   → Hand QR to patient
                                2. Scan QR → /patient/:id/history
                                   New: Fill II → III → IV → V → VI → Done
                                   Returning: Fill II → Review III-VI → Done
                                   Status → "Da khai"
                                                                3. /screening/:visitId
                                                                   See history panel (Da khai)
                                                                   Step 1: UCVA, Rx, red flags
                                                                   Step 2: Disease group routing
                                                                   → Move to doctor exam
```

---

## 6. File Structure

```
src/components/
  receptionist/
    intake-form.tsx                    # Simplified (Sections I + VII only)
    intake-section-personal.tsx        # Kept as-is
    intake-section-referral.tsx        # Kept as-is
    qr-code-dialog.tsx                 # NEW: QR code + link modal
    # REMOVED: intake-section-complaint.tsx
    # REMOVED: intake-section-eye-history.tsx
    # REMOVED: intake-section-medical-history.tsx
    # REMOVED: intake-section-family-history.tsx
    # REMOVED: intake-section-lifestyle.tsx
  patient/                             # NEW directory
    patient-history-form.tsx           # Wizard orchestrator
    patient-history-step-complaint.tsx # Section II (per-visit)
    patient-history-step-eye.tsx       # Section III (per-patient)
    patient-history-step-medical.tsx   # Section IV (per-patient)
    patient-history-step-family.tsx    # Section V (per-patient)
    patient-history-step-lifestyle.tsx # Section VI (per-patient)
    patient-history-summary.tsx        # Returning patient summary cards
  screening/
    screening-form.tsx                 # Add history panel (collapsible)
    # All other screening files unchanged
src/pages/
  patient/
    history.tsx                        # NEW: Route handler for /patient/:visitId/history
```
