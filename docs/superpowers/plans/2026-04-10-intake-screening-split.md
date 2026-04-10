# Intake & Screening Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the intake form to sections I + VII only, and create a separate mobile-first patient history form (sections II-VI) accessible via QR code.

**Architecture:** The intake form is stripped down to personal info + referral. A new `/patient/:visitId/history` route hosts a wizard-style form for patients to fill on their phone/iPad. The existing `IntakeShareModal` (QR code dialog) is reused and enhanced. The screening form gets a collapsible history panel. Visit records gain a `historyStatus` field.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, qrcode.react (already installed), react-router

---

## File Structure

```
MODIFY:
  src/data/mock-patients.ts              — Add historyStatus to Visit interface
  src/components/receptionist/intake-form.tsx — Remove sections II-VI, simplify form
  src/components/receptionist/intake-share-modal.tsx — Update URL to point to patient history route
  src/components/receptionist/intake-print-view.tsx — Remove sections II-VI from print
  src/components/screening/screening-form.tsx — Add collapsible history panel
  src/App.tsx                             — Add /patient/:visitId/history route

CREATE:
  src/pages/patient/history.tsx           — Route handler for patient history form
  src/components/patient/patient-history-form.tsx — Wizard orchestrator
  src/components/patient/patient-history-step-complaint.tsx — Section II (per-visit)
  src/components/patient/patient-history-step-eye.tsx — Section III (per-patient)
  src/components/patient/patient-history-step-medical.tsx — Section IV (per-patient)
  src/components/patient/patient-history-step-family.tsx — Section V (per-patient)
  src/components/patient/patient-history-step-lifestyle.tsx — Section VI (per-patient)
  src/components/patient/patient-history-summary.tsx — Returning patient summary cards
  src/components/screening/screening-history-panel.tsx — Collapsible history panel

DELETE (after patient history components are built):
  src/components/receptionist/intake-section-complaint.tsx
  src/components/receptionist/intake-section-eye-history.tsx
  src/components/receptionist/intake-section-medical-history.tsx
  src/components/receptionist/intake-section-family-history.tsx
  src/components/receptionist/intake-section-lifestyle.tsx
```

---

### Task 1: Add `historyStatus` to Visit interface

**Files:**
- Modify: `src/data/mock-patients.ts`

- [ ] **Step 1: Add historyStatus to Visit interface**

In `src/data/mock-patients.ts`, add `historyStatus` field to the `Visit` interface, after the `screeningData` field:

```typescript
  screeningData?: ScreeningFormData
  historyStatus?: "pending" | "completed"  // ADD THIS LINE
  examData?: ExamData
```

- [ ] **Step 2: Add historyStatus to mock visits**

In the same file, find the mock visits array and add `historyStatus: "pending"` to a few visits so we can test the badge display. Add it to the first 3 mock visits that have status `"dang_sang_loc"` or `"cho_kham"`.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-patients.ts
git commit -m "feat: add historyStatus field to Visit interface"
```

---

### Task 2: Simplify the Intake Form

**Files:**
- Modify: `src/components/receptionist/intake-form.tsx`

- [ ] **Step 1: Remove section imports**

Remove these import lines from `intake-form.tsx`:

```typescript
// DELETE these imports:
import { IntakeSectionComplaint } from "./intake-section-complaint"
import { IntakeSectionEyeHistory } from "./intake-section-eye-history"
import { IntakeSectionMedicalHistory } from "./intake-section-medical-history"
import { IntakeSectionFamilyHistory } from "./intake-section-family-history"
import { IntakeSectionLifestyle } from "./intake-section-lifestyle"
```

Also remove the unused type imports that were only used by those sections. Remove from the type import block:

```typescript
// DELETE these type imports (no longer used in this file):
import type {
  SymptomDetail,
  GlassesInfo,
  ContactLensDetail,
  EyeSurgery,
  RefractionValues,
  DiabetesDetail,
  CancerDetail,
  MedicationEntry,
  AllergiesInfo,
  FamilyHistoryEntry,
  SmokingInfo,
  AlcoholInfo,
  DrivingInfo,
  SportsInfo,
} from "@/data/mock-patients"
```

Also remove unused icon imports:

```typescript
// DELETE these icon imports (only used by removed sections):
  Clock01Icon,
  PlusSignCircleIcon,
  UserGroupIcon,
  HeartCheckIcon,
  Activity01Icon,
```

- [ ] **Step 2: Simplify IntakeFormData interface**

Replace the `IntakeFormData` interface to only keep Section I and VII fields:

```typescript
export interface IntakeFormData {
  // Section I — Personal Info
  name: string
  gender: string
  dob: string
  phone: string
  email: string
  address: string
  district: string
  cityProvince: string
  occupation: string
  cccd: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  // Section VII — Referral
  referralSource: string
  referralDetail: string
}
```

- [ ] **Step 3: Simplify buildInitialForm**

Replace `buildInitialForm` to only initialize Section I and VII fields:

```typescript
function buildInitialForm(patient?: Patient): IntakeFormData {
  return {
    name: patient?.name ?? "",
    gender: patient?.gender ?? "",
    dob: patient?.dob ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    district: patient?.district ?? "",
    cityProvince: patient?.cityProvince ?? patient?.city ?? "",
    occupation: patient?.occupation ?? "",
    cccd: patient?.cccd ?? "",
    emergencyContactName: patient?.emergencyContact?.name ?? "",
    emergencyContactPhone: patient?.emergencyContact?.phone ?? "",
    emergencyContactRelationship: patient?.emergencyContact?.relationship ?? "",
    referralSource: patient?.referralSource ?? "",
    referralDetail: patient?.referralDetail ?? "",
  }
}
```

- [ ] **Step 4: Simplify SECTIONS array**

Replace the `SECTIONS` array to only include personal and referral:

```typescript
const SECTIONS = [
  { id: "personal", num: "I", title: "Thông tin cá nhân", icon: UserAdd01Icon },
  {
    id: "referral",
    num: "VII",
    title: "Nguồn thông tin về phòng khám",
    icon: Megaphone01Icon,
  },
]
```

- [ ] **Step 5: Simplify validate()**

Remove the `visitReasons` validation from `validate()`. The function should only validate Section I fields:

```typescript
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Trường này không được bỏ trống"
    if (!form.gender) errs.gender = "Trường này không được bỏ trống"
    if (!form.dob) errs.dob = "Trường này không được bỏ trống"
    if (!form.phone) {
      errs.phone = "Trường này không được bỏ trống"
    } else if (!/^0\d{9,10}$/.test(form.phone)) {
      errs.phone = "SĐT phải có 10–11 số và bắt đầu bằng 0"
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
```

- [ ] **Step 6: Simplify handleSave()**

Remove all section II-VI fields from the `data` object in `handleSave()`. Keep only Section I and VII fields:

```typescript
  function handleSave(goToScreening = false) {
    if (!validate()) return

    const data: Omit<Patient, "id" | "createdAt"> &
      Partial<Pick<Patient, "id" | "createdAt">> = {
      name: form.name.trim(),
      gender: form.gender as Patient["gender"],
      dob: form.dob,
      birthYear: parseInt(form.dob.split("/")[2] ?? "0", 10),
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      district: form.district || undefined,
      cityProvince: form.cityProvince || undefined,
      occupation: form.occupation || undefined,
      cccd: form.cccd || undefined,
      emergencyContact: form.emergencyContactName
        ? {
            name: form.emergencyContactName,
            phone: form.emergencyContactPhone,
            relationship: form.emergencyContactRelationship,
          }
        : undefined,
      referralSource: form.referralSource || undefined,
      referralDetail: form.referralDetail || undefined,
      type: "kham_benh" as const,
      activeStatus: "hoat_dong" as const,
    }

    if (patient) {
      updatePatient(patient.id, data)
    } else {
      addPatient(data as Omit<Patient, "id" | "createdAt">)
    }

    if (goToScreening) {
      setShowShare(true)
    } else {
      navigate("/intake")
    }
  }
```

Note the key change: when `goToScreening` is true, we now show the share modal (QR code) instead of immediately navigating. The share modal's close handler should navigate to `/screening`.

- [ ] **Step 7: Simplify sectionComponents**

Remove all entries except `personal` and `referral`:

```typescript
  const sectionComponents: Record<string, React.ReactNode> = {
    personal: (
      <IntakeSectionPersonal
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
        duplicateWarning={duplicateWarning}
      />
    ),
    referral: (
      <IntakeSectionReferral
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
  }
```

- [ ] **Step 8: Update the "Lưu & Sàng lọc" button behavior**

Update the `IntakeShareModal` `onOpenChange` handler so that when the modal closes after "Lưu & Sàng lọc", we navigate to screening:

```typescript
      <IntakeShareModal
        open={showShare}
        onOpenChange={(open) => {
          setShowShare(open)
          if (!open && form.name) {
            navigate("/screening")
          }
        }}
        patientName={form.name || undefined}
        patientId={patient?.id}
      />
```

- [ ] **Step 9: Verify typecheck passes**

Run: `npm run typecheck`
Expected: May have errors in `intake-print-view.tsx` since it references removed fields — that's expected and fixed in Task 3.

- [ ] **Step 10: Commit**

```bash
git add src/components/receptionist/intake-form.tsx
git commit -m "feat: simplify intake form to sections I and VII only"
```

---

### Task 3: Simplify the Print View

**Files:**
- Modify: `src/components/receptionist/intake-print-view.tsx`

- [ ] **Step 1: Remove sections II-VI from print view**

This file is 785 lines. Read it fully (in chunks) to understand the structure, then remove all print sections related to:
- Section II (visit reasons, symptoms, symptom detail)
- Section III (eye history, glasses, contact lens, eye conditions, refraction, surgeries)
- Section IV (medical history, medications, allergies, pregnancy)
- Section V (family history)
- Section VI (lifestyle)

Keep only:
- The header (clinic info, patient ID, date)
- Section I (personal info print layout)
- Section VII (referral source)
- The footer/signature area if any

Also remove the label constant arrays that are no longer needed (VISIT_REASON_LABELS, SYMPTOM_LABELS, EYE_CONDITION_LABELS, GLASSES_TYPE_LABELS, CONTACT_LENS_STATUS_LABELS, CONTACT_LENS_TYPE_LABELS, SURGERY_TYPE_LABELS, SYSTEMIC_CONDITION_GROUPS, FAMILY_EYE_CONDITIONS, FAMILY_MEDICAL_CONDITIONS, SCREEN_TIME_LABELS, OUTDOOR_TIME_LABELS, SUNGLASSES_LABELS, DRIVING_WHEN_LABELS, ALLERGY_TYPE_LABELS).

Keep only REFERRAL_LABELS.

Update the `IntakePrintViewProps` to use the simplified `IntakeFormData` type.

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/intake-print-view.tsx
git commit -m "feat: simplify print view to match simplified intake form"
```

---

### Task 4: Delete Removed Intake Section Components

**Files:**
- Delete: `src/components/receptionist/intake-section-complaint.tsx`
- Delete: `src/components/receptionist/intake-section-eye-history.tsx`
- Delete: `src/components/receptionist/intake-section-medical-history.tsx`
- Delete: `src/components/receptionist/intake-section-family-history.tsx`
- Delete: `src/components/receptionist/intake-section-lifestyle.tsx`

- [ ] **Step 1: Verify no other files import these components**

Search for imports of each deleted component across the codebase. The only importer should be `intake-form.tsx` (already cleaned up in Task 2). Check with grep:

```bash
grep -r "intake-section-complaint\|intake-section-eye-history\|intake-section-medical-history\|intake-section-family-history\|intake-section-lifestyle" src/ --include="*.tsx" --include="*.ts"
```

Expected: No results (all imports were removed in Task 2).

- [ ] **Step 2: Delete the files**

```bash
git rm src/components/receptionist/intake-section-complaint.tsx
git rm src/components/receptionist/intake-section-eye-history.tsx
git rm src/components/receptionist/intake-section-medical-history.tsx
git rm src/components/receptionist/intake-section-family-history.tsx
git rm src/components/receptionist/intake-section-lifestyle.tsx
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git commit -m "refactor: remove intake section components moved to patient history"
```

---

### Task 5: Create Patient History Step — Complaint (Section II)

**Files:**
- Create: `src/components/patient/patient-history-step-complaint.tsx`

This is the per-visit step. Adapted from the old `intake-section-complaint.tsx` but designed for mobile wizard layout (single column, larger touch targets).

- [ ] **Step 1: Create the component**

Create `src/components/patient/patient-history-step-complaint.tsx`. This component receives the complaint data and an onChange callback. It renders:
- Visit reasons as a single-column checkbox list (not 2-column — mobile-first)
- Conditional "other reason" text field
- Symptom detail section (onset, severity, frequency, impact, factors)
- Symptom checklist as a single-column checkbox list

Use the same field keys and options as the old `intake-section-complaint.tsx` (VISIT_REASON_OPTIONS, SYMPTOM_OPTIONS, SEVERITY_OPTIONS, FREQUENCY_OPTIONS, IMPACT_OPTIONS — copy them into this file).

The interface for this component:

```typescript
import type { SymptomDetail } from "@/data/mock-patients"

interface ComplaintData {
  visitReasons: string[]
  visitReasonOther: string
  symptomDetail: SymptomDetail
  symptoms: Record<string, boolean>
}

interface Props {
  data: ComplaintData
  onChange: (data: ComplaintData) => void
}
```

Key differences from the old desktop version:
- Single column layout (no `grid-cols-2`)
- Larger touch targets: `py-2.5` padding on checkbox labels instead of `py-1`
- `text-base` instead of `text-sm` for readability on mobile

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/patient/patient-history-step-complaint.tsx
git commit -m "feat: add patient history complaint step (section II)"
```

---

### Task 6: Create Patient History Step — Eye History (Section III)

**Files:**
- Create: `src/components/patient/patient-history-step-eye.tsx`

- [ ] **Step 1: Read the old eye history component for reference**

Read the deleted `intake-section-eye-history.tsx` from git history:

```bash
git show HEAD~2:src/components/receptionist/intake-section-eye-history.tsx
```

Use this as the reference for field keys, options, and conditional logic.

- [ ] **Step 2: Create the component**

Create `src/components/patient/patient-history-step-eye.tsx`. This component handles all Section III fields:
- Last eye exam (date + location)
- Current glasses (types checkbox + duration + sees well)
- Contact lens status (dropdown: Có/Không/Đã từng) + conditional detail form
- Eye injury (yes/no + conditional detail)
- Diagnosed eye conditions (checkbox list — single column for mobile)
- Refraction values (OD/OS inputs)
- Eye surgeries (repeatable rows: type + year + eye checkboxes)

Interface:

```typescript
import type {
  GlassesInfo,
  ContactLensDetail,
  EyeSurgery,
  RefractionValues,
} from "@/data/mock-patients"

interface EyeHistoryData {
  lastEyeExam: { date?: string; location?: string }
  currentGlasses: GlassesInfo
  contactLensStatus: string
  contactLensDetail: ContactLensDetail
  eyeInjury: { has: boolean; detail?: string }
  diagnosedEyeConditions: Record<string, boolean>
  diagnosedEyeConditionOther: string
  refractionValues: RefractionValues
  eyeSurgeries: EyeSurgery[]
}

interface Props {
  data: EyeHistoryData
  onChange: (data: EyeHistoryData) => void
}
```

Mobile adaptations: single-column checkboxes, larger touch targets, stacked layout for refraction inputs.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/patient/patient-history-step-eye.tsx
git commit -m "feat: add patient history eye history step (section III)"
```

---

### Task 7: Create Patient History Step — Medical History (Section IV)

**Files:**
- Create: `src/components/patient/patient-history-step-medical.tsx`

- [ ] **Step 1: Read the old medical history component for reference**

```bash
git show HEAD~3:src/components/receptionist/intake-section-medical-history.tsx
```

- [ ] **Step 2: Create the component**

Create `src/components/patient/patient-history-step-medical.tsx`. This handles all Section IV fields:
- Primary doctor (name + last visit date)
- Systemic conditions (grouped checkboxes — single column for mobile)
- Conditional diabetes detail (year diagnosed + HbA1c)
- Conditional cancer detail (type + on treatment)
- Other conditions text
- Medications list (repeatable rows: name + dose + purpose)
- Allergies (none checkbox + repeatable allergy items: type + name + reaction)
- Pregnancy status (only if gender is female — receive gender as prop)

Interface:

```typescript
import type {
  DiabetesDetail,
  CancerDetail,
  MedicationEntry,
  AllergiesInfo,
} from "@/data/mock-patients"

interface MedicalHistoryData {
  primaryDoctor: { name?: string; lastVisit?: string }
  systemicConditions: Record<string, boolean>
  diabetesDetail: DiabetesDetail
  cancerDetail: CancerDetail
  systemicConditionOther: string
  medicationsList: MedicationEntry[]
  allergiesInfo: AllergiesInfo
  pregnancyStatus: string
  pregnancyTrimester: string
}

interface Props {
  data: MedicalHistoryData
  gender: string
  onChange: (data: MedicalHistoryData) => void
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/patient/patient-history-step-medical.tsx
git commit -m "feat: add patient history medical history step (section IV)"
```

---

### Task 8: Create Patient History Step — Family History (Section V)

**Files:**
- Create: `src/components/patient/patient-history-step-family.tsx`

- [ ] **Step 1: Read the old family history component for reference**

```bash
git show HEAD~4:src/components/receptionist/intake-section-family-history.tsx
```

- [ ] **Step 2: Create the component**

Create `src/components/patient/patient-history-step-family.tsx`. This handles Section V:
- Family eye conditions (checkbox list with inline "Ai bị?" text field for each checked condition)
- Family medical conditions (checkbox list with inline "Ai bị?" text field)
- Other family history (yes/no + conditional detail + who field)

Interface:

```typescript
import type { FamilyHistoryEntry } from "@/data/mock-patients"

interface FamilyHistoryData {
  familyEyeHistory: Record<string, FamilyHistoryEntry>
  familyMedicalHistory: Record<string, FamilyHistoryEntry>
  familyHistoryOther: { has: boolean; detail?: string; who?: string }
}

interface Props {
  data: FamilyHistoryData
  onChange: (data: FamilyHistoryData) => void
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/patient/patient-history-step-family.tsx
git commit -m "feat: add patient history family history step (section V)"
```

---

### Task 9: Create Patient History Step — Lifestyle (Section VI)

**Files:**
- Create: `src/components/patient/patient-history-step-lifestyle.tsx`

- [ ] **Step 1: Read the old lifestyle component for reference**

```bash
git show HEAD~5:src/components/receptionist/intake-section-lifestyle.tsx
```

- [ ] **Step 2: Create the component**

Create `src/components/patient/patient-history-step-lifestyle.tsx`. This handles Section VI:
- Smoking (status radio + conditional quantity/years/quit year)
- Alcohol (status radio + conditional frequency)
- Screen time computer (dropdown)
- Screen time phone (dropdown)
- Outdoor time (dropdown)
- Sunglasses use (radio)
- Work near vision (checkbox)
- Work dusty/chemical (checkbox)
- Driving (yes/no + conditional when)
- Sports (yes/no + conditional sport type)
- Hobbies (text)

Interface:

```typescript
import type { SmokingInfo, AlcoholInfo, DrivingInfo, SportsInfo } from "@/data/mock-patients"

interface LifestyleData {
  smokingInfo: SmokingInfo
  alcoholInfo: AlcoholInfo
  screenTimeComputer: string
  screenTimePhone: string
  outdoorTime: string
  sunglassesUse: string
  workNearVision: boolean
  workDustyChemical: boolean
  drivingInfo: DrivingInfo
  sportsInfo: SportsInfo
  hobbies: string
}

interface Props {
  data: LifestyleData
  onChange: (data: LifestyleData) => void
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/patient/patient-history-step-lifestyle.tsx
git commit -m "feat: add patient history lifestyle step (section VI)"
```

---

### Task 10: Create Patient History Summary (Returning Patients)

**Files:**
- Create: `src/components/patient/patient-history-summary.tsx`

- [ ] **Step 1: Create the summary component**

Create `src/components/patient/patient-history-summary.tsx`. This shows read-only summary cards of existing per-patient data (sections III-VI) for returning patients.

Each section renders as a collapsible card showing key data points. Each card has a "Cập nhật" button that, when clicked, expands the full editable form for that section.

Interface:

```typescript
import type { Patient } from "@/data/mock-patients"

interface Props {
  patient: Patient
  onUpdateSection: (section: "eye" | "medical" | "family" | "lifestyle") => void
  editingSection: string | null
}
```

The component renders 4 summary cards:
1. **Tiền sử mắt** — Shows: glasses types, contact lens status, diagnosed conditions count, surgeries count
2. **Tiền sử y tế** — Shows: systemic conditions count, medications count, allergies summary
3. **Tiền sử gia đình** — Shows: conditions with family history count
4. **Thói quen sinh hoạt** — Shows: screen time, smoking status, driving status

Each card:
```tsx
<div className="rounded-lg border border-border p-4">
  <div className="flex items-center justify-between">
    <h3 className="font-semibold">{title}</h3>
    <Button variant="outline" size="sm" onClick={() => onUpdateSection(sectionKey)}>
      Cập nhật
    </Button>
  </div>
  <div className="mt-2 text-sm text-muted-foreground">
    {/* summary items */}
  </div>
</div>
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/patient/patient-history-summary.tsx
git commit -m "feat: add patient history summary cards for returning patients"
```

---

### Task 11: Create Patient History Form Wizard

**Files:**
- Create: `src/components/patient/patient-history-form.tsx`

- [ ] **Step 1: Create the wizard orchestrator**

Create `src/components/patient/patient-history-form.tsx`. This is the main wizard that orchestrates the multi-step patient history form.

Interface:

```typescript
import type { Patient, Visit } from "@/data/mock-patients"

interface PatientHistoryFormProps {
  patient: Patient
  visit: Visit
  isReturning: boolean
}
```

State management:
- `currentStep`: number (0-5 for new patients: complaint → eye → medical → family → lifestyle → done)
- `complaintData`: Section II state (per-visit, always fresh)
- `eyeData`: Section III state (initialized from patient if returning)
- `medicalData`: Section IV state (initialized from patient if returning)
- `familyData`: Section V state (initialized from patient if returning)
- `lifestyleData`: Section VI state (initialized from patient if returning)
- `editingSection`: string | null (for returning patient summary — which section is being edited)

Layout:
```tsx
<div className="mx-auto min-h-screen max-w-lg bg-background px-4 py-6">
  {/* Progress bar */}
  <div className="mb-6">
    <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
      <span>Bước {currentStep + 1}/{totalSteps}</span>
      <span>{stepTitle}</span>
    </div>
    <div className="h-2 rounded-full bg-muted">
      <div
        className="h-2 rounded-full bg-primary transition-all"
        style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
      />
    </div>
  </div>

  {/* Step content */}
  {renderStep()}

  {/* Navigation */}
  <div className="mt-8 flex justify-between">
    {currentStep > 0 && (
      <Button variant="outline" onClick={handleBack}>
        ← Quay lại
      </Button>
    )}
    <Button onClick={handleNext} className="ml-auto">
      {isLastStep ? "Hoàn thành" : "Tiếp tục →"}
    </Button>
  </div>
</div>
```

For returning patients:
- Step 0: Complaint form (always)
- Step 1: Summary cards (sections III-VI) with "Cập nhật" option → done

For new patients:
- Steps 0-4: complaint → eye → medical → family → lifestyle
- Step 5: Confirmation screen

On completion:
- Save per-visit data (complaint) to the visit via context
- Save per-patient data (sections III-VI) to the patient via context
- Update `visit.historyStatus` to `"completed"`
- Show confirmation screen: "Cảm ơn! Vui lòng chờ gọi tên."

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/patient/patient-history-form.tsx
git commit -m "feat: add patient history wizard orchestrator"
```

---

### Task 12: Create Patient History Route & Page

**Files:**
- Create: `src/pages/patient/history.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the page component**

Create `src/pages/patient/history.tsx`:

```typescript
import { useParams, useSearchParams } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { PatientHistoryForm } from "@/components/patient/patient-history-form"

export default function PatientHistory() {
  const { visitId } = useParams<{ visitId: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { todayVisits, getPatient } = useReceptionist()

  const visit = todayVisits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  if (!visit || !patient) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Không tìm thấy phiếu khám hoặc link đã hết hạn.
          </p>
        </div>
      </div>
    )
  }

  // Determine if returning patient (has any per-patient history data)
  const isReturning = !!(
    patient.diagnosedEyeConditions ||
    patient.systemicConditions ||
    patient.familyEyeHistory ||
    patient.smokingInfo?.status !== "khong"
  )

  return (
    <PatientHistoryForm
      patient={patient}
      visit={visit}
      isReturning={isReturning}
    />
  )
}
```

- [ ] **Step 2: Add route to App.tsx**

In `src/App.tsx`, add the import and route. The patient history route should be **outside** the sidebar layout since it's a standalone page for patients on their phone:

Add import:
```typescript
import PatientHistory from "@/pages/patient/history"
```

Add a route **before** the `SidebarProvider` block — this route renders without the sidebar/header:

```typescript
<Routes>
  {/* Patient-facing routes (no sidebar) */}
  <Route path="/patient/:visitId/history" element={<PatientHistory />} />

  {/* Staff-facing routes (with sidebar) */}
  <Route path="/*" element={
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Routes>
          <Route path="/" element={<Navigate to="/intake" replace />} />
          {/* ... existing routes ... */}
        </Routes>
      </SidebarInset>
    </SidebarProvider>
  } />
</Routes>
```

Note: This requires restructuring App.tsx to have a top-level Routes with two branches — one for patient-facing (no sidebar) and one for staff-facing (with sidebar). The staff routes become nested inside a `Route path="/*"` element.

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Test manually**

Run: `npm run dev`
Navigate to `http://localhost:3000/patient/V001/history?token=test`
Expected: Should render the patient history form (or "not found" if V001 doesn't exist in mock data — adjust the visit ID to match a real mock visit).

- [ ] **Step 5: Commit**

```bash
git add src/pages/patient/history.tsx src/App.tsx
git commit -m "feat: add patient history route and page"
```

---

### Task 13: Update IntakeShareModal URL

**Files:**
- Modify: `src/components/receptionist/intake-share-modal.tsx`

- [ ] **Step 1: Update the URL to point to patient history route**

In `intake-share-modal.tsx`, update the `mockUrl` to generate a URL for the patient history form instead of the current mock URL.

The modal needs a `visitId` prop in addition to `patientId`. Update the interface:

```typescript
interface IntakeShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName?: string
  patientId?: string
  visitId?: string
}
```

Update the URL generation:

```typescript
  const mockUrl = useMemo(() => {
    const token = (visitId ?? "new")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0)
      .toString(36)
    return `${window.location.origin}/patient/${visitId ?? "unknown"}/history?token=${token}x${Date.now().toString(36).slice(-4)}`
  }, [visitId])
```

- [ ] **Step 2: Update IntakeForm to pass visitId**

In `intake-form.tsx`, the `handleSave` function needs to capture the visit ID when creating a visit. Update the save flow to pass the visit ID to the share modal.

This requires the `addPatient` and the visit creation to return a visit ID. Check the `receptionist-context.tsx` to see how visits are created. The current flow navigates to `/screening` which picks up the visit from context — we need the visit ID to generate the QR URL.

If the context doesn't return a visit ID from `addPatient`, add a state variable to track the latest created visit and pass it to the modal. The simplest approach: after `addPatient`, find the most recently created visit for this patient.

```typescript
<IntakeShareModal
  open={showShare}
  onOpenChange={(open) => {
    setShowShare(open)
    if (!open && form.name) {
      navigate("/screening")
    }
  }}
  patientName={form.name || undefined}
  patientId={patient?.id}
  visitId={latestVisitId}
/>
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/receptionist/intake-share-modal.tsx src/components/receptionist/intake-form.tsx
git commit -m "feat: update share modal URL to point to patient history route"
```

---

### Task 14: Create Screening History Panel

**Files:**
- Create: `src/components/screening/screening-history-panel.tsx`
- Modify: `src/components/screening/screening-form.tsx`

- [ ] **Step 1: Create the collapsible history panel**

Create `src/components/screening/screening-history-panel.tsx`:

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon, ArrowUp01Icon, QrCodeIcon } from "@hugeicons/core-free-icons"
import type { Patient, Visit } from "@/data/mock-patients"

interface Props {
  patient: Patient
  visit: Visit
  onShowQr: () => void
}

export function ScreeningHistoryPanel({ patient, visit, onShowQr }: Props) {
  const [expanded, setExpanded] = useState(false)
  const historyStatus = visit.historyStatus ?? "pending"

  return (
    <div className="rounded-lg border border-border">
      {/* Header — always visible */}
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Bệnh sử bệnh nhân</span>
          {historyStatus === "completed" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Đã khai
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              Chưa khai
            </span>
          )}
        </div>
        <HugeiconsIcon
          icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
          className="size-4"
          strokeWidth={1.5}
        />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          {historyStatus === "completed" ? (
            <div className="space-y-3 text-sm">
              {/* Visit reasons */}
              {patient.visitReasons && patient.visitReasons.length > 0 && (
                <div>
                  <span className="font-medium">Lý do khám:</span>{" "}
                  {patient.visitReasons.join(", ")}
                </div>
              )}
              {/* Key history items — show summaries */}
              {patient.diagnosedEyeConditions && (
                <div>
                  <span className="font-medium">Bệnh mắt đã chẩn đoán:</span>{" "}
                  {Object.entries(patient.diagnosedEyeConditions)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(", ") || "Không có"}
                </div>
              )}
              {patient.systemicConditions && (
                <div>
                  <span className="font-medium">Bệnh nền:</span>{" "}
                  {Object.entries(patient.systemicConditions)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join(", ") || "Không có"}
                </div>
              )}
              {patient.allergiesInfo && (
                <div>
                  <span className="font-medium">Dị ứng:</span>{" "}
                  {patient.allergiesInfo.none
                    ? "Không có"
                    : patient.allergiesInfo.items.map((a) => a.name).join(", ") || "Chưa khai"}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                Bệnh nhân chưa khai báo bệnh sử
              </p>
              <Button variant="outline" size="sm" onClick={onShowQr}>
                <HugeiconsIcon icon={QrCodeIcon} className="mr-1.5 size-4" strokeWidth={1.5} />
                Hiện QR code
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Add the panel to screening-form.tsx**

In `screening-form.tsx`, import and render the `ScreeningHistoryPanel` above the step indicator. Also import the `IntakeShareModal` for the QR code display:

```typescript
import { ScreeningHistoryPanel } from "./screening-history-panel"
import { IntakeShareModal } from "../receptionist/intake-share-modal"
```

Add state for showing QR:
```typescript
const [showQr, setShowQr] = useState(false)
```

Render the panel before the step content:
```tsx
<ScreeningHistoryPanel
  patient={patient}
  visit={visit}
  onShowQr={() => setShowQr(true)}
/>

<IntakeShareModal
  open={showQr}
  onOpenChange={setShowQr}
  patientName={patient.name}
  patientId={patient.id}
  visitId={visit.id}
/>
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Test manually**

Run: `npm run dev`
Navigate to a screening visit. The history panel should appear at the top, collapsed by default, showing status badge.

- [ ] **Step 5: Commit**

```bash
git add src/components/screening/screening-history-panel.tsx src/components/screening/screening-form.tsx
git commit -m "feat: add collapsible history panel to screening form"
```

---

### Task 15: Final Integration & Verification

**Files:**
- All modified files

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Lint check**

Run: `npm run lint`
Expected: PASS or only pre-existing warnings

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: PASS — successful production build

- [ ] **Step 4: Manual E2E verification**

Run: `npm run dev` and verify:

1. **Intake form** (`/intake/new`): Only shows Section I and VII. "Lưu & Sàng lọc" saves and shows QR dialog. Closing dialog navigates to `/screening`.
2. **QR code**: Link in QR dialog points to `/patient/:visitId/history?token=...`
3. **Patient history form** (open QR link): Shows wizard with 5 steps for new patient. Progress bar works. Navigation between steps works. Completion shows thank you screen.
4. **Screening form** (`/screening/:visitId`): History panel appears at top with "Chưa khai" or "Đã khai" badge. Expandable. QR button works when status is pending.
5. **Print view**: Only shows Section I and VII data.

- [ ] **Step 5: Commit any fixes**

If any issues found during verification, fix and commit:

```bash
git add -A
git commit -m "fix: address integration issues in intake/screening split"
```
