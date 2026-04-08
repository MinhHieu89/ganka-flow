# Intake Form Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable drawer that shows the full editable intake form, accessible from screening's "Phiếu tiếp nhận" section and reusable in doctor screens.

**Architecture:** Two new components — `IntakeFormEditable` (standalone form composing existing 7 section components) and `IntakeFormDrawer` (thin Sheet wrapper). Integration via a "Xem chi tiết" button added to `ScreeningIntakeSummary`.

**Tech Stack:** React, TypeScript, shadcn/ui Sheet, existing intake section components, Hugeicons

---

## File Map

```
src/components/intake/                         ← NEW directory
  intake-form-editable.tsx                     ← NEW: reusable editable form (all 7 sections)
  intake-form-drawer.tsx                       ← NEW: Sheet wrapper

src/components/screening/
  screening-intake-summary.tsx                 ← MODIFY: add "Xem chi tiết" button + drawer
```

---

### Task 1: Create `IntakeFormEditable`

**Files:**
- Create: `src/components/intake/intake-form-editable.tsx`

This component composes the existing 7 intake section components with local form state, validation, and save/cancel actions. It copies the `buildInitialForm`, `validate`, and form-to-patient mapping logic from `src/components/receptionist/intake-form.tsx`.

- [ ] **Step 1: Create the `src/components/intake/` directory and the file**

Create `src/components/intake/intake-form-editable.tsx` with the full component:

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Clock01Icon,
  PlusSignCircleIcon,
  HeartCheckIcon,
  UserGroupIcon,
  Activity01Icon,
  Megaphone01Icon,
} from "@hugeicons/core-free-icons"
import type { Patient } from "@/data/mock-patients"
import type { IntakeFormData } from "@/components/receptionist/intake-form"
import { IntakeSectionPersonal } from "@/components/receptionist/intake-section-personal"
import { IntakeSectionComplaint } from "@/components/receptionist/intake-section-complaint"
import { IntakeSectionEyeHistory } from "@/components/receptionist/intake-section-eye-history"
import { IntakeSectionMedicalHistory } from "@/components/receptionist/intake-section-medical-history"
import { IntakeSectionFamilyHistory } from "@/components/receptionist/intake-section-family-history"
import { IntakeSectionLifestyle } from "@/components/receptionist/intake-section-lifestyle"
import { IntakeSectionReferral } from "@/components/receptionist/intake-section-referral"

interface IntakeFormEditableProps {
  patient: Patient
  onSave: (data: Partial<Patient>) => void
  onCancel: () => void
}

const SECTIONS = [
  { id: "personal", num: "I", title: "Thông tin cá nhân", icon: UserAdd01Icon },
  {
    id: "complaint",
    num: "II",
    title: "Lý do khám và triệu chứng",
    icon: Clock01Icon,
  },
  {
    id: "eyeHistory",
    num: "III",
    title: "Tiền sử mắt cá nhân",
    icon: PlusSignCircleIcon,
  },
  {
    id: "medicalHistory",
    num: "IV",
    title: "Tiền sử y tế tổng quát",
    icon: HeartCheckIcon,
  },
  {
    id: "familyHistory",
    num: "V",
    title: "Tiền sử gia đình về mắt và sức khỏe",
    icon: UserGroupIcon,
  },
  {
    id: "lifestyle",
    num: "VI",
    title: "Thói quen sinh hoạt và công việc",
    icon: Activity01Icon,
  },
  {
    id: "referral",
    num: "VII",
    title: "Nguồn thông tin về phòng khám",
    icon: Megaphone01Icon,
  },
]

function buildInitialForm(patient: Patient): IntakeFormData {
  return {
    name: patient.name ?? "",
    gender: patient.gender ?? "",
    dob: patient.dob ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    address: patient.address ?? "",
    district: patient.district ?? "",
    cityProvince: patient.cityProvince ?? patient.city ?? "",
    occupation: patient.occupation ?? "",
    cccd: patient.cccd ?? "",
    emergencyContactName: patient.emergencyContact?.name ?? "",
    emergencyContactPhone: patient.emergencyContact?.phone ?? "",
    emergencyContactRelationship: patient.emergencyContact?.relationship ?? "",
    visitReasons: patient.visitReasons ?? [],
    visitReasonOther: patient.visitReasonOther ?? "",
    symptomDetail: patient.symptomDetail ?? {},
    symptoms: patient.symptoms ?? {},
    lastEyeExam: patient.lastEyeExam ?? {},
    currentGlasses: patient.currentGlasses ?? { types: [] },
    contactLensStatus: patient.contactLensStatus ?? "",
    contactLensDetail: patient.contactLensDetail ?? {},
    eyeInjury: patient.eyeInjury ?? { has: false },
    diagnosedEyeConditions: patient.diagnosedEyeConditions ?? {},
    diagnosedEyeConditionOther: patient.diagnosedEyeConditionOther ?? "",
    refractionValues: patient.refractionValues ?? {},
    eyeSurgeries: patient.eyeSurgeries ?? [],
    primaryDoctor: patient.primaryDoctor ?? {},
    systemicConditions: patient.systemicConditions ?? {},
    diabetesDetail: patient.diabetesDetail ?? {},
    cancerDetail: patient.cancerDetail ?? {},
    systemicConditionOther: patient.systemicConditionOther ?? "",
    medicationsList: patient.medicationsList ?? [],
    allergiesInfo: patient.allergiesInfo ?? { none: false, items: [] },
    pregnancyStatus: patient.pregnancyStatus ?? "",
    pregnancyTrimester: patient.pregnancyTrimester ?? "",
    familyEyeHistory: patient.familyEyeHistory ?? {},
    familyMedicalHistory: patient.familyMedicalHistory ?? {},
    familyHistoryOther: patient.familyHistoryOther ?? { has: false },
    smokingInfo: patient.smokingInfo ?? { status: "khong" },
    alcoholInfo: patient.alcoholInfo ?? { status: "khong" },
    screenTimeComputer: patient.screenTimeComputer ?? "",
    screenTimePhone: patient.screenTimePhone ?? "",
    outdoorTime: patient.outdoorTime ?? "",
    sunglassesUse: patient.sunglassesUse ?? "",
    workNearVision: patient.workNearVision ?? false,
    workDustyChemical: patient.workDustyChemical ?? false,
    drivingInfo: patient.drivingInfo ?? { does: false },
    sportsInfo: patient.sportsInfo ?? { does: false },
    hobbies: patient.hobbies ?? "",
    referralSource: patient.referralSource ?? "",
    referralDetail: patient.referralDetail ?? "",
  }
}

function buildPatientData(form: IntakeFormData): Partial<Patient> {
  return {
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
    visitReasons: form.visitReasons,
    visitReasonOther: form.visitReasonOther || undefined,
    symptomDetail:
      Object.keys(form.symptomDetail).length > 0
        ? form.symptomDetail
        : undefined,
    symptoms:
      Object.keys(form.symptoms).length > 0 ? form.symptoms : undefined,
    lastEyeExam:
      form.lastEyeExam?.date || form.lastEyeExam?.location
        ? form.lastEyeExam
        : undefined,
    currentGlasses:
      (form.currentGlasses?.types ?? []).length > 0
        ? form.currentGlasses
        : undefined,
    contactLensStatus:
      (form.contactLensStatus as Patient["contactLensStatus"]) || undefined,
    contactLensDetail:
      form.contactLensStatus === "co" || form.contactLensStatus === "da_tung"
        ? form.contactLensDetail
        : undefined,
    eyeInjury: form.eyeInjury?.has ? form.eyeInjury : undefined,
    diagnosedEyeConditions: Object.values(form.diagnosedEyeConditions).some(
      Boolean
    )
      ? form.diagnosedEyeConditions
      : undefined,
    diagnosedEyeConditionOther: form.diagnosedEyeConditionOther || undefined,
    refractionValues:
      Object.keys(form.refractionValues).length > 0
        ? form.refractionValues
        : undefined,
    eyeSurgeries:
      form.eyeSurgeries.length > 0 ? form.eyeSurgeries : undefined,
    primaryDoctor:
      form.primaryDoctor?.name || form.primaryDoctor?.lastVisit
        ? form.primaryDoctor
        : undefined,
    systemicConditions: Object.values(form.systemicConditions).some(Boolean)
      ? form.systemicConditions
      : undefined,
    diabetesDetail:
      form.diabetesDetail?.yearDiagnosed || form.diabetesDetail?.hba1c
        ? form.diabetesDetail
        : undefined,
    cancerDetail: form.cancerDetail?.type ? form.cancerDetail : undefined,
    systemicConditionOther: form.systemicConditionOther || undefined,
    medicationsList:
      form.medicationsList.length > 0 ? form.medicationsList : undefined,
    allergiesInfo:
      form.allergiesInfo.none || form.allergiesInfo.items.length > 0
        ? form.allergiesInfo
        : undefined,
    pregnancyStatus:
      (form.pregnancyStatus as Patient["pregnancyStatus"]) || undefined,
    pregnancyTrimester: form.pregnancyTrimester || undefined,
    familyEyeHistory: Object.values(form.familyEyeHistory).some((e) => e.has)
      ? form.familyEyeHistory
      : undefined,
    familyMedicalHistory: Object.values(form.familyMedicalHistory).some(
      (e) => e.has
    )
      ? form.familyMedicalHistory
      : undefined,
    familyHistoryOther: form.familyHistoryOther?.has
      ? form.familyHistoryOther
      : undefined,
    smokingInfo: form.smokingInfo,
    alcoholInfo: form.alcoholInfo,
    screenTimeComputer: form.screenTimeComputer || undefined,
    screenTimePhone: form.screenTimePhone || undefined,
    outdoorTime: form.outdoorTime || undefined,
    sunglassesUse: form.sunglassesUse || undefined,
    workNearVision: form.workNearVision || undefined,
    workDustyChemical: form.workDustyChemical || undefined,
    drivingInfo: form.drivingInfo?.does ? form.drivingInfo : undefined,
    sportsInfo: form.sportsInfo?.does ? form.sportsInfo : undefined,
    hobbies: form.hobbies || undefined,
    referralSource: form.referralSource || undefined,
    referralDetail: form.referralDetail || undefined,
  }
}

export function IntakeFormEditable({
  patient,
  onSave,
  onCancel,
}: IntakeFormEditableProps) {
  const [form, setForm] = useState<IntakeFormData>(() =>
    buildInitialForm(patient)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

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
    if (form.visitReasons.length === 0)
      errs.visitReasons = "Chọn ít nhất một lý do khám"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(buildPatientData(form))
  }

  function renderFieldError(field: string) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    personal: (
      <IntakeSectionPersonal
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
      />
    ),
    complaint: (
      <IntakeSectionComplaint
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
      />
    ),
    eyeHistory: (
      <IntakeSectionEyeHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    medicalHistory: (
      <IntakeSectionMedicalHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    familyHistory: (
      <IntakeSectionFamilyHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    lifestyle: (
      <IntakeSectionLifestyle
        data={form}
        errors={errors}
        onChange={updateField}
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

  return (
    <div className="space-y-8">
      {SECTIONS.map((section) => (
        <section key={section.id}>
          <div className="mb-1.5 flex items-center gap-2">
            <HugeiconsIcon
              icon={section.icon}
              className="size-5"
              strokeWidth={1.5}
            />
            <h2 className="text-lg font-bold">
              {section.num}. {section.title}
            </h2>
          </div>
          <div className="mb-5 border-t border-border" />
          {sectionComponents[section.id]}
        </section>
      ))}

      {/* Footer */}
      <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-border bg-popover pt-4 pb-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSave}>Lưu</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors (the component uses only existing exported types and components)

- [ ] **Step 3: Commit**

```bash
git add src/components/intake/intake-form-editable.tsx
git commit -m "feat: add IntakeFormEditable component for reusable intake form editing"
```

---

### Task 2: Create `IntakeFormDrawer`

**Files:**
- Create: `src/components/intake/intake-form-drawer.tsx`

Thin wrapper putting `IntakeFormEditable` inside a shadcn Sheet.

- [ ] **Step 1: Create the file**

Create `src/components/intake/intake-form-drawer.tsx`:

```tsx
import type { Patient } from "@/data/mock-patients"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { IntakeFormEditable } from "./intake-form-editable"

interface IntakeFormDrawerProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Patient>) => void
}

export function IntakeFormDrawer({
  patient,
  open,
  onOpenChange,
  onSave,
}: IntakeFormDrawerProps) {
  function handleSave(data: Partial<Patient>) {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[50vw] max-w-[50vw] overflow-y-auto p-6"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Phiếu tiếp nhận — {patient.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Chỉnh sửa thông tin phiếu tiếp nhận
          </SheetDescription>
        </SheetHeader>
        <IntakeFormEditable
          patient={patient}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/intake/intake-form-drawer.tsx
git commit -m "feat: add IntakeFormDrawer component wrapping editable form in Sheet"
```

---

### Task 3: Add "Xem chi tiết" button to `ScreeningIntakeSummary`

**Files:**
- Modify: `src/components/screening/screening-intake-summary.tsx`

Add a "Xem chi tiết" button in the collapsible header, plus drawer state and integration.

- [ ] **Step 1: Add imports**

Add these imports at the top of `screening-intake-summary.tsx`:

```tsx
import { Button } from "@/components/ui/button"
import { IntakeFormDrawer } from "@/components/intake/intake-form-drawer"
import type { Patient } from "@/data/mock-patients"
```

Note: `Patient` type is already imported, so only `Button` and `IntakeFormDrawer` are new.

- [ ] **Step 2: Update props interface**

Change the interface to add `onPatientUpdate`:

```tsx
interface ScreeningIntakeSummaryProps {
  patient: Patient
  onPatientUpdate?: (data: Partial<Patient>) => void
}
```

- [ ] **Step 3: Add drawer state and update function signature**

Inside `ScreeningIntakeSummary`, after the existing `const [isOpen, setIsOpen] = useState(false)`, add:

```tsx
const [drawerOpen, setDrawerOpen] = useState(false)
```

Update the function signature to destructure `onPatientUpdate`:

```tsx
export function ScreeningIntakeSummary({
  patient,
  onPatientUpdate,
}: ScreeningIntakeSummaryProps) {
```

- [ ] **Step 4: Add "Xem chi tiết" button in the header**

In the `CollapsibleTrigger` button, add a "Xem chi tiết" button before the chevron arrow icon. The button needs to stop propagation so it doesn't toggle the collapsible.

Replace the existing `CollapsibleTrigger` block (the `<CollapsibleTrigger asChild>` through its closing tag) with:

```tsx
<div className="flex w-full items-center gap-3 px-4 py-3">
  <CollapsibleTrigger asChild>
    <button
      type="button"
      className="flex flex-1 items-center gap-3"
    >
      <HugeiconsIcon
        icon={Note01Icon}
        className="size-4 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
      />
      <span className="text-sm font-semibold">Phiếu tiếp nhận</span>
      <span className="flex-1 truncate text-left text-sm text-muted-foreground">
        {collapsedSummary}
      </span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className={cn(
          "size-4 shrink-0 text-muted-foreground transition-transform",
          isOpen && "rotate-180"
        )}
        strokeWidth={1.5}
      />
    </button>
  </CollapsibleTrigger>
  <Button
    variant="ghost"
    size="sm"
    className="shrink-0 text-xs text-muted-foreground"
    onClick={(e) => {
      e.stopPropagation()
      setDrawerOpen(true)
    }}
  >
    Xem chi tiết
  </Button>
</div>
```

- [ ] **Step 5: Add the drawer component**

Right before the closing `</Collapsible>` tag, add:

```tsx
<IntakeFormDrawer
  patient={patient}
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  onSave={(data) => onPatientUpdate?.(data)}
/>
```

- [ ] **Step 6: Update `ScreeningForm` to pass `onPatientUpdate`**

In `src/components/screening/screening-form.tsx`, update the `ScreeningIntakeSummary` usage to pass the update callback.

Add `updatePatient` to the destructured context:

```tsx
const { saveScreeningData, updateVisitStatus, updatePatient } = useReceptionist()
```

Update the JSX:

```tsx
<ScreeningIntakeSummary
  patient={patient}
  onPatientUpdate={(data) => updatePatient(patient.id, data)}
/>
```

- [ ] **Step 7: Verify `updatePatient` exists in receptionist context**

Check that `updatePatient` is exported from `useReceptionist()`. It should already exist (used by the intake form page). If not, this step will surface the issue during typecheck.

- [ ] **Step 8: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 9: Run dev server and manually test**

Run: `npm run dev`

Test flow:
1. Navigate to screening for a patient
2. See "Phiếu tiếp nhận" collapsible with "Xem chi tiết" button
3. Click "Xem chi tiết" — drawer opens from right at 50% width
4. All 7 sections are visible and editable
5. Click "Lưu" — drawer closes
6. Click "Hủy" — drawer closes without saving
7. Clicking the collapsible header still toggles expand/collapse normally

- [ ] **Step 10: Commit**

```bash
git add src/components/screening/screening-intake-summary.tsx src/components/screening/screening-form.tsx
git commit -m "feat: add Xem chi tiết button to screening intake summary with drawer"
```
