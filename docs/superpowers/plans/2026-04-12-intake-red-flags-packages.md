# Intake Red Flags & Specialized Packages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add dangerous symptom (red flag) checking and specialized package registration to the intake form, plus a new "Khám chuyên sâu" sidebar section in the doctor's exam view with per-package forms.

**Architecture:** Two new sections appended to both intake forms (new patient and edit). A new doctor sidebar item renders collapsible package cards with package-specific forms. Data lives on the Visit object. The old OSDI modal and dry eye form are restored from git history into the doctor's specialized tab.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Hugeicons

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `src/data/mock-patients.ts` | Add `dangerousSymptoms`, `specializedPackages`, `specializedPackageData` to Visit; add `DryEyeFormData` reexport |
| Modify | `src/contexts/receptionist-context.tsx` | Add `updateVisitIntakeData` method |
| Create | `src/components/intake/intake-dangerous-symptoms.tsx` | Red flag checkbox section with alert banner |
| Create | `src/components/intake/intake-specialized-packages.tsx` | Package checkbox section |
| Modify | `src/components/receptionist/intake-form.tsx` | Render the two new sections, pass visit data |
| Modify | `src/components/intake/intake-form-editable.tsx` | Render the two new sections for edit mode |
| Modify | `src/components/doctor/exam-sidebar.tsx` | Add "Khám chuyên sâu" item, rename labels, reorder tabs |
| Create | `src/components/doctor/tab-specialized.tsx` | Content for the specialized tab: list of package cards + add button |
| Create | `src/components/doctor/specialized-package-card.tsx` | Collapsible card wrapper per package |
| Create | `src/components/doctor/specialized-dry-eye-form.tsx` | Dry eye form (OSDI + TBUT + Schirmer + Meibomian + Staining) |
| Create | `src/components/doctor/osdi-modal.tsx` | OSDI-6 questionnaire modal (restored from git) |
| Modify | `src/pages/doctor/exam.tsx` | Handle "specialized" tab, wire up data |
| Modify | `src/components/doctor/tab-patient.tsx` | Show red flag alert banner when symptoms flagged |

---

### Task 1: Extend Visit Data Model

**Files:**
- Modify: `src/data/mock-patients.ts:223-242`

- [ ] **Step 1: Add new fields to the Visit interface**

Open `src/data/mock-patients.ts` and add three new optional fields to the `Visit` interface after the `requests` field (line ~241):

```typescript
export interface Visit {
  // ... existing fields ...
  requests?: VisitRequest[]
  // NEW fields:
  dangerousSymptoms?: Record<string, boolean>
  specializedPackages?: string[]
  specializedPackageData?: Record<string, DryEyeFormData>
}
```

Note: `DryEyeFormData` already exists in this file (line 293). The `specializedPackageData` maps package keys (e.g., `"dry-eye"`) to their form data. For now only `DryEyeFormData` is used; other package types will reuse the same record with `Record<string, DryEyeFormData>` since myopia-control has no form yet.

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-patients.ts
git commit -m "feat: add dangerousSymptoms and specializedPackages to Visit type"
```

---

### Task 2: Add Receptionist Context Support

**Files:**
- Modify: `src/contexts/receptionist-context.tsx`

- [ ] **Step 1: Add `updateVisitIntakeData` method**

This method allows saving dangerous symptoms and specialized packages on a visit. Add to the `ReceptionistContextType` interface:

```typescript
interface ReceptionistContextType {
  // ... existing methods ...
  updateVisitIntakeData: (
    visitId: string,
    data: Pick<Visit, "dangerousSymptoms" | "specializedPackages">
  ) => void
}
```

Add the import of `Visit` if not already imported (it's not currently imported — only `Patient`, `PatientStatus`, `ScreeningFormData`, `RefractionFormData` are). Update the import line:

```typescript
import {
  mockPatients,
  mockVisits,
  generatePatientId,
  type Patient,
  type Visit,
  type PatientStatus,
  type ScreeningFormData,
  type RefractionFormData,
} from "@/data/mock-patients"
```

Add the function implementation inside `ReceptionistProvider`:

```typescript
function updateVisitIntakeData(
  visitId: string,
  data: Pick<Visit, "dangerousSymptoms" | "specializedPackages">
) {
  setVisits((prev) =>
    prev.map((v) => (v.id === visitId ? { ...v, ...data } : v))
  )
}
```

Add `updateVisitIntakeData` to the Provider value object.

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/contexts/receptionist-context.tsx
git commit -m "feat: add updateVisitIntakeData to receptionist context"
```

---

### Task 3: Create Intake Dangerous Symptoms Component

**Files:**
- Create: `src/components/intake/intake-dangerous-symptoms.tsx`

- [ ] **Step 1: Create the component**

This component replicates the behavior of the old `screening-form-red-flags.tsx` but with the label "Triệu chứng nguy hiểm". It receives the current symptoms state and an `onUpdate` callback. When any flag is checked, an alert banner appears with a "Chuyển bác sĩ ngay" button that shows a toast.

```typescript
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const DANGEROUS_SYMPTOM_OPTIONS = [
  { key: "eyePain", label: "Đau mắt nhiều" },
  { key: "suddenVisionLoss", label: "Giảm thị lực đột ngột" },
  { key: "asymmetry", label: "Triệu chứng lệch 1 bên rõ" },
]

interface IntakeDangerousSymptomsProps {
  symptoms: Record<string, boolean>
  onUpdate: (symptoms: Record<string, boolean>) => void
}

export function IntakeDangerousSymptoms({
  symptoms,
  onUpdate,
}: IntakeDangerousSymptomsProps) {
  const { toast } = useToast()

  const hasAnyFlag = Object.values(symptoms).some(Boolean)
  const activeFlags = DANGEROUS_SYMPTOM_OPTIONS.filter(
    (opt) => symptoms[opt.key]
  )

  function toggleFlag(key: string) {
    onUpdate({ ...symptoms, [key]: !symptoms[key] })
  }

  function handleFastTrack() {
    toast({
      title: "Đã ghi nhận",
      description: "Vui lòng liên hệ bác sĩ để chuyển bệnh nhân",
    })
  }

  return (
    <section
      className={cn(
        "rounded-lg border-l-[3px] border-l-destructive p-5",
        hasAnyFlag ? "bg-destructive/[0.03]" : "bg-background"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <HugeiconsIcon
          icon={Alert01Icon}
          className="size-5 text-destructive"
          strokeWidth={1.5}
        />
        <h2 className="text-[15px] font-bold text-destructive">
          Triệu chứng nguy hiểm
        </h2>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Kiểm tra triệu chứng nguy hiểm"
      >
        {DANGEROUS_SYMPTOM_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
              symptoms[opt.key]
                ? "border-destructive bg-destructive/5"
                : "border-border"
            )}
          >
            <input
              type="checkbox"
              checked={symptoms[opt.key] ?? false}
              onChange={() => toggleFlag(opt.key)}
              className="size-4 accent-[var(--color-destructive)]"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {hasAnyFlag && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-destructive text-white">
              <HugeiconsIcon icon={Alert01Icon} className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">
                Phát hiện triệu chứng nguy hiểm!
              </p>
              <p className="text-xs text-destructive/80">
                {activeFlags.map((f) => f.label).join(", ")}
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleFastTrack}>
            → Chuyển bác sĩ ngay
          </Button>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Check if `use-toast` hook exists**

Run: `ls src/hooks/use-toast*`

If it doesn't exist, use the shadcn sonner toast instead. Check what toast mechanism the project uses:

Run: `grep -r "useToast\|toast(" src/hooks/ src/components/ui/sonner* src/components/ui/toast* 2>/dev/null | head -10`

If no toast hook exists, install shadcn toast: `npx shadcn@latest add toast` or use `sonner`. Alternatively, use a simple `window.alert()` as a placeholder and note it for later.

Adapt the import based on what exists. If using sonner: `import { toast } from "sonner"` and call `toast("Đã ghi nhận — vui lòng liên hệ bác sĩ")`.

- [ ] **Step 3: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/intake/intake-dangerous-symptoms.tsx
git commit -m "feat: add IntakeDangerousSymptoms component for intake form"
```

---

### Task 4: Create Intake Specialized Packages Component

**Files:**
- Create: `src/components/intake/intake-specialized-packages.tsx`

- [ ] **Step 1: Create the component**

```typescript
import { HugeiconsIcon } from "@hugeicons/react"
import { MedicalKit01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const PACKAGE_OPTIONS = [
  { key: "dry-eye", label: "Khám chuyên sâu Khô mắt" },
  { key: "myopia-control", label: "Khám chuyên sâu Cận thị" },
]

interface IntakeSpecializedPackagesProps {
  packages: string[]
  onUpdate: (packages: string[]) => void
}

export function IntakeSpecializedPackages({
  packages,
  onUpdate,
}: IntakeSpecializedPackagesProps) {
  function togglePackage(key: string) {
    if (packages.includes(key)) {
      onUpdate(packages.filter((p) => p !== key))
    } else {
      onUpdate([...packages, key])
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <HugeiconsIcon
          icon={MedicalKit01Icon}
          className="size-5 text-teal-600 dark:text-teal-400"
          strokeWidth={1.5}
        />
        <h2 className="text-[15px] font-bold text-teal-600 dark:text-teal-400">
          Gói khám chuyên sâu
        </h2>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Chọn gói khám chuyên sâu"
      >
        {PACKAGE_OPTIONS.map((opt) => {
          const isChecked = packages.includes(opt.key)
          return (
            <label
              key={opt.key}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                isChecked
                  ? "border-teal-500 bg-teal-500/5 dark:border-teal-600"
                  : "border-border"
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => togglePackage(opt.key)}
                className="size-4 accent-teal-600"
              />
              {opt.label}
            </label>
          )
        })}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify the icon exists**

Run: `grep -r "MedicalKit01Icon\|MedicalKit" node_modules/@hugeicons/core-free-icons/dist/ 2>/dev/null | head -3`

If `MedicalKit01Icon` doesn't exist, search for alternatives:

Run: `grep -r "Medical\|FirstAid\|Briefcase\|Stethoscope" node_modules/@hugeicons/core-free-icons/dist/types.d.ts 2>/dev/null | head -10`

Use whichever medical-related icon exists. Fallback: `Stethoscope02Icon` (already used in sidebar).

- [ ] **Step 3: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/intake/intake-specialized-packages.tsx
git commit -m "feat: add IntakeSpecializedPackages component for intake form"
```

---

### Task 5: Integrate New Sections into Intake Form (New Patient)

**Files:**
- Modify: `src/components/receptionist/intake-form.tsx`

- [ ] **Step 1: Add state and render new sections**

The intake form (`IntakeForm`) creates a visit on save. The new sections need local state for `dangerousSymptoms` and `specializedPackages`, which get saved to the visit when "Lưu & Sàng lọc" is clicked.

Add imports at the top:

```typescript
import { IntakeDangerousSymptoms } from "@/components/intake/intake-dangerous-symptoms"
import { IntakeSpecializedPackages } from "@/components/intake/intake-specialized-packages"
```

Add state hooks inside the `IntakeForm` component, after the existing `useState` calls:

```typescript
const [dangerousSymptoms, setDangerousSymptoms] = useState<
  Record<string, boolean>
>({ eyePain: false, suddenVisionLoss: false, asymmetry: false })
const [specializedPackages, setSpecializedPackages] = useState<string[]>([])
```

In the `handleSave` function, after the visit is created (both `existingVisit` and `newVisit` branches), call `updateVisitIntakeData` to save the intake-specific data. Destructure `updateVisitIntakeData` from `useReceptionist()`:

```typescript
const { addPatient, updatePatient, searchPatients, addVisit, visits, updateVisitIntakeData } =
  useReceptionist()
```

After the visit ID is determined (both the `existingVisit` and `newVisit` branches inside `if (goToScreening)`), add:

```typescript
const visitIdToUpdate = existingVisit?.id ?? newVisit!.id
updateVisitIntakeData(visitIdToUpdate, {
  dangerousSymptoms,
  specializedPackages,
})
```

More precisely, restructure the `if (goToScreening)` block:

```typescript
if (goToScreening) {
  const existingVisit = visits.find(
    (v) => v.patientId === savedPatientId && v.date === TODAY
  )
  let visitIdForIntake: string
  if (existingVisit) {
    visitIdForIntake = existingVisit.id
    setLatestVisitId(existingVisit.id)
  } else {
    const newVisit = addVisit({
      patientId: savedPatientId,
      status: "cho_kham",
      source: "walk_in",
      date: TODAY,
    })
    visitIdForIntake = newVisit.id
    setLatestVisitId(newVisit.id)
  }
  updateVisitIntakeData(visitIdForIntake, {
    dangerousSymptoms,
    specializedPackages,
  })
  setShowShare(true)
}
```

Add the new sections in the JSX, after the `{SECTIONS.map(...)}` block and before the footer actions:

```tsx
{/* Dangerous Symptoms & Specialized Packages */}
<IntakeDangerousSymptoms
  symptoms={dangerousSymptoms}
  onUpdate={setDangerousSymptoms}
/>
<IntakeSpecializedPackages
  packages={specializedPackages}
  onUpdate={setSpecializedPackages}
/>
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Visually verify**

Run: `npm run dev`

Navigate to `/intake/new`. Scroll down past Section VII. You should see:
- "Triệu chứng nguy hiểm" section with 3 checkboxes
- "Gói khám chuyên sâu" section with 2 checkboxes
- Check a red flag → alert banner appears with destructive button
- Click "Chuyển bác sĩ ngay" → toast appears

- [ ] **Step 4: Commit**

```bash
git add src/components/receptionist/intake-form.tsx
git commit -m "feat: integrate dangerous symptoms and packages into new patient intake form"
```

---

### Task 6: Integrate New Sections into Intake Form (Edit Patient)

**Files:**
- Modify: `src/components/intake/intake-form-editable.tsx`

- [ ] **Step 1: Add state and render new sections**

The edit form needs the same two sections. Since the edit form doesn't have direct access to the visit, it needs to accept the initial values and an update callback as props.

Update the props interface:

```typescript
interface IntakeFormEditableProps {
  patient: Patient
  dangerousSymptoms: Record<string, boolean>
  specializedPackages: string[]
  onDangerousSymptomsChange: (symptoms: Record<string, boolean>) => void
  onSpecializedPackagesChange: (packages: string[]) => void
  onSave: (data: Partial<Patient>) => void
  onCancel: () => void
}
```

Add imports:

```typescript
import { IntakeDangerousSymptoms } from "@/components/intake/intake-dangerous-symptoms"
import { IntakeSpecializedPackages } from "@/components/intake/intake-specialized-packages"
```

Destructure the new props:

```typescript
export function IntakeFormEditable({
  patient,
  dangerousSymptoms,
  specializedPackages,
  onDangerousSymptomsChange,
  onSpecializedPackagesChange,
  onSave,
  onCancel,
}: IntakeFormEditableProps) {
```

Add the new sections in the JSX, after the `{SECTIONS.map(...)}` block and before the footer `<div>`:

```tsx
<IntakeDangerousSymptoms
  symptoms={dangerousSymptoms}
  onUpdate={onDangerousSymptomsChange}
/>
<IntakeSpecializedPackages
  packages={specializedPackages}
  onUpdate={onSpecializedPackagesChange}
/>
```

- [ ] **Step 2: Update the parent that renders IntakeFormEditable**

Find where `IntakeFormEditable` is rendered and pass the new props. Search:

Run: `grep -rn "IntakeFormEditable" src/ --include="*.tsx"`

The parent component needs to manage the state and pass it down. The parent should get the current visit for this patient (if one exists for today) and read the initial values from it.

For each parent, add state:

```typescript
const [dangerousSymptoms, setDangerousSymptoms] = useState<Record<string, boolean>>(
  () => visit?.dangerousSymptoms ?? { eyePain: false, suddenVisionLoss: false, asymmetry: false }
)
const [specializedPackages, setSpecializedPackages] = useState<string[]>(
  () => visit?.specializedPackages ?? []
)
```

And pass to `IntakeFormEditable`:

```tsx
<IntakeFormEditable
  patient={patient}
  dangerousSymptoms={dangerousSymptoms}
  specializedPackages={specializedPackages}
  onDangerousSymptomsChange={setDangerousSymptoms}
  onSpecializedPackagesChange={setSpecializedPackages}
  onSave={handleSave}
  onCancel={handleCancel}
/>
```

On save, also call `updateVisitIntakeData` with the current values.

- [ ] **Step 3: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/intake/intake-form-editable.tsx
git commit -m "feat: integrate dangerous symptoms and packages into edit patient intake form"
```

---

### Task 7: Update Doctor Exam Sidebar

**Files:**
- Modify: `src/components/doctor/exam-sidebar.tsx`

- [ ] **Step 1: Update the ExamTab type, tab list, labels, and order**

Replace the entire file content:

```typescript
import { HugeiconsIcon } from "@hugeicons/react"
import {
  User02Icon,
  ClipboardIcon,
  Note01Icon,
  Stethoscope02Icon,
  Progress04Icon,
  MedicalKit01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type ExamTab =
  | "patient"
  | "preExam"
  | "requests"
  | "specialized"
  | "treatment"
  | "exam"

interface ExamSidebarProps {
  activeTab: ExamTab
  onTabChange: (tab: ExamTab) => void
  pendingRequestCount: number
  specializedPackageCount: number
}

const tabs: {
  id: ExamTab
  label: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}[] = [
  { id: "patient", label: "Bệnh nhân", icon: User02Icon },
  { id: "preExam", label: "Khám chức năng", icon: ClipboardIcon },
  { id: "requests", label: "Cận lâm sàng", icon: Note01Icon },
  { id: "specialized", label: "Khám chuyên sâu", icon: MedicalKit01Icon },
  { id: "treatment", label: "Liệu trình", icon: Progress04Icon },
  { id: "exam", label: "Khám & kết luận", icon: Stethoscope02Icon },
]

export function ExamSidebar({
  activeTab,
  onTabChange,
  pendingRequestCount,
  specializedPackageCount,
}: ExamSidebarProps) {
  return (
    <aside className="flex w-[175px] shrink-0 flex-col border-r border-border bg-muted/30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2.5 px-4 py-3 text-left text-[13px] transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
              "hover:bg-background/60",
              isActive
                ? "bg-background font-medium text-[#0C447C]"
                : "text-muted-foreground",
              isActive &&
                "before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[#0C447C] before:content-['']"
            )}
          >
            <HugeiconsIcon
              icon={tab.icon}
              size={18}
              strokeWidth={1.75}
              className="shrink-0"
            />
            <span className="leading-tight">{tab.label}</span>
            {tab.id === "requests" && pendingRequestCount > 0 && (
              <span className="ml-auto flex min-w-[18px] items-center justify-center rounded-full bg-[#D85A30] px-1 text-[10px] leading-[18px] font-semibold text-white">
                {pendingRequestCount}
              </span>
            )}
            {tab.id === "specialized" && specializedPackageCount > 0 && (
              <span className="ml-auto flex min-w-[18px] items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] leading-[18px] font-semibold text-white">
                {specializedPackageCount}
              </span>
            )}
          </button>
        )
      })}
    </aside>
  )
}
```

Note: If `MedicalKit01Icon` doesn't exist in `@hugeicons/core-free-icons`, substitute with an available medical icon. Run `grep -r "MedicalKit\|FirstAid\|Briefcase" node_modules/@hugeicons/core-free-icons/dist/types.d.ts 2>/dev/null | head -5` to check. If none found, use `Stethoscope02Icon` as fallback (already imported).

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: Errors in `src/pages/doctor/exam.tsx` because it doesn't pass `specializedPackageCount` yet. That's expected — we'll fix it in Task 10.

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/exam-sidebar.tsx
git commit -m "feat: update doctor sidebar with Khám chuyên sâu item, rename labels, reorder"
```

---

### Task 8: Create OSDI Modal Component

**Files:**
- Create: `src/components/doctor/osdi-modal.tsx`

- [ ] **Step 1: Restore the OSDI modal from git history**

Run: `git show d9e8876^:src/components/screening/screening-step2-osdi-modal.tsx > src/components/doctor/osdi-modal.tsx`

Then rename the exported component from `ScreeningStep2OsdiModal` to `OsdiModal` and update the interface name from `OsdiModalProps` to match. The content stays identical — same OSDI-6 questions, same answer options, same scoring.

Open `src/components/doctor/osdi-modal.tsx` and make these renames:
- `ScreeningStep2OsdiModal` → `OsdiModal`
- `OsdiModalProps` stays as-is (already clean)

The full component code (with renames applied):

```typescript
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getOsdiSeverity } from "@/lib/osdi-utils"

interface OsdiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAnswers: (number | null)[]
  onSubmit: (answers: (number | null)[], score: number) => void
}

const ANSWER_OPTIONS = [
  { label: "Không bao giờ", value: 0 },
  { label: "Thỉnh thoảng", value: 1 },
  { label: "Thường xuyên", value: 2 },
  { label: "Hầu hết thời gian", value: 3 },
  { label: "Liên tục", value: 4 },
]

const QUESTION_GROUPS = [
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, bạn có gặp phải bất kỳ triệu chứng nào của mắt dưới đây không:",
    questions: ["Chói mắt", "Nhìn mờ giữa các lần chớp mắt liên tục"],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, các vấn đề về mắt có ảnh hưởng đến bạn chủ yếu trong việc thực hiện hoạt động nào sau đây:",
    questions: [
      "Lái xe hoặc ngồi trên xe vào ban đêm",
      "Xem tivi / thực hiện các hoạt động trên máy tính / đọc sách",
    ],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, mắt bạn có cảm thấy khó chịu trong bất kỳ tình huống nào dưới đây không:",
    questions: [
      "Ở những nơi có gió thổi nhiều / khô bụi",
      "Ở những nơi có độ ẩm thấp hoặc có điều hòa",
    ],
  },
]

export function OsdiModal({
  open,
  onOpenChange,
  initialAnswers,
  onSubmit,
}: OsdiModalProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => [
    ...initialAnswers,
  ])

  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setAnswers([...initialAnswers])
    }
    onOpenChange(isOpen)
  }

  function setAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[questionIndex] = value
      return next
    })
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const totalScore = answers.reduce<number>((sum, a) => sum + (a ?? 0), 0)
  const severity = getOsdiSeverity(totalScore)

  function handleSubmit() {
    onSubmit(answers, totalScore)
    onOpenChange(false)
  }

  let questionIndex = 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>Bảng hỏi OSDI-6</DialogTitle>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto px-5">
          {QUESTION_GROUPS.map((group, gi) => (
            <div key={gi}>
              <p className="border-b border-border py-3 text-sm font-medium text-muted-foreground">
                {group.title}
              </p>
              {group.questions.map((question) => {
                const qi = questionIndex++
                return (
                  <div
                    key={qi}
                    className="border-b border-border/50 py-3 last:border-b-0"
                  >
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-primary">
                        {qi + 1}.
                      </span>{" "}
                      {question}
                    </p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="radiogroup"
                      aria-label={question}
                    >
                      {ANSWER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(qi, opt.value)}
                          aria-checked={answers[qi] === opt.value}
                          role="radio"
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs transition-colors",
                            answers[qi] === opt.value
                              ? "border-2 border-primary bg-primary/5 font-semibold text-primary"
                              : "border border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border px-5 py-3">
          <div className="text-sm text-muted-foreground" aria-live="polite">
            Tổng:{" "}
            <span className="text-lg font-bold text-foreground">
              {totalScore}
            </span>
            /24
            {answeredCount > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  severity.className
                )}
              >
                {severity.label}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Ghi nhận điểm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors (component is not imported anywhere yet)

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/osdi-modal.tsx
git commit -m "feat: restore OSDI-6 modal component for doctor specialized tab"
```

---

### Task 9: Create Dry Eye Form, Package Card, and Specialized Tab

**Files:**
- Create: `src/components/doctor/specialized-dry-eye-form.tsx`
- Create: `src/components/doctor/specialized-package-card.tsx`
- Create: `src/components/doctor/tab-specialized.tsx`

- [ ] **Step 1: Create the dry eye form**

This replicates the old `screening-step2-dry-eye.tsx` fields. It uses the `OsdiModal` from Task 8.

```typescript
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { DryEyeFormData } from "@/data/mock-patients"
import { OsdiModal } from "./osdi-modal"
import { getOsdiSeverity } from "@/lib/osdi-utils"
import { cn } from "@/lib/utils"

interface SpecializedDryEyeFormProps {
  data: DryEyeFormData
  onUpdate: (data: DryEyeFormData) => void
}

export function SpecializedDryEyeForm({
  data,
  onUpdate,
}: SpecializedDryEyeFormProps) {
  const [osdiOpen, setOsdiOpen] = useState(false)

  function updateField<K extends keyof DryEyeFormData>(
    field: K,
    value: DryEyeFormData[K]
  ) {
    onUpdate({ ...data, [field]: value })
  }

  function handleOsdiSubmit(answers: (number | null)[], score: number) {
    const severity = getOsdiSeverity(score)
    onUpdate({
      ...data,
      osdiAnswers: answers,
      osdiScore: score,
      osdiSeverity: severity.key,
    })
  }

  const hasOsdiScore = data.osdiScore !== null

  return (
    <div className="space-y-4">
      {/* OSDI-6 Score */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          OSDI-6 Score
        </Label>
        <div className="flex items-center gap-3">
          {hasOsdiScore ? (
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-4 py-2.5">
              <span className="text-xl font-bold">{data.osdiScore}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  getOsdiSeverity(data.osdiScore!).className
                )}
              >
                {getOsdiSeverity(data.osdiScore!).label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                6/6 câu đã trả lời
              </span>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
              Chưa đánh giá
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOsdiOpen(true)}
            className={cn(
              hasOsdiScore
                ? "text-muted-foreground"
                : "border-primary text-primary"
            )}
          >
            {hasOsdiScore ? "Làm lại" : "Làm bảng hỏi OSDI"}
          </Button>
        </div>
      </div>

      {/* TBUT */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          TBUT (giây)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOd}
              onChange={(e) => updateField("tbutOd", e.target.value)}
              placeholder="VD: 5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOs}
              onChange={(e) => updateField("tbutOs", e.target.value)}
              placeholder="VD: 5"
            />
          </div>
        </div>
      </div>

      {/* Schirmer */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          Schirmer (mm)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOd}
              onChange={(e) => updateField("schirmerOd", e.target.value)}
              placeholder="VD: 10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOs}
              onChange={(e) => updateField("schirmerOs", e.target.value)}
              placeholder="VD: 10"
            />
          </div>
        </div>
      </div>

      {/* Meibomian */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">Meibomian</Label>
        <Textarea
          value={data.meibomian}
          onChange={(e) => updateField("meibomian", e.target.value)}
          placeholder="Mô tả tình trạng tuyến Meibomian..."
          rows={2}
        />
      </div>

      {/* Staining */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">Staining</Label>
        <Textarea
          value={data.staining}
          onChange={(e) => updateField("staining", e.target.value)}
          placeholder="Mô tả kết quả nhuộm..."
          rows={2}
        />
      </div>

      <OsdiModal
        open={osdiOpen}
        onOpenChange={setOsdiOpen}
        initialAnswers={data.osdiAnswers}
        onSubmit={handleOsdiSubmit}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the collapsible package card**

```typescript
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SpecializedPackageCardProps {
  title: string
  registeredBy: "receptionist" | "doctor"
  defaultOpen?: boolean
  children: React.ReactNode
}

export function SpecializedPackageCard({
  title,
  registeredBy,
  defaultOpen = false,
  children,
}: SpecializedPackageCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  const byLabel =
    registeredBy === "receptionist" ? "Đăng ký bởi Lễ tân" : "Đăng ký bởi Bác sĩ"

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors",
          open && "border-b border-border bg-teal-500/[0.03]"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-teal-600" />
          <span className="text-sm font-bold">{title}</span>
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            {byLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {open ? "▲ Thu gọn" : "▼ Mở rộng"}
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
```

- [ ] **Step 3: Create the specialized tab**

```typescript
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Visit, DryEyeFormData } from "@/data/mock-patients"
import { SpecializedPackageCard } from "./specialized-package-card"
import { SpecializedDryEyeForm } from "./specialized-dry-eye-form"

const AVAILABLE_PACKAGES = [
  { key: "dry-eye", label: "Khám chuyên sâu Khô mắt" },
  { key: "myopia-control", label: "Khám chuyên sâu Cận thị" },
]

const EMPTY_DRY_EYE: DryEyeFormData = {
  osdiScore: null,
  osdiAnswers: [null, null, null, null, null, null],
  osdiSeverity: null,
  tbutOd: "",
  tbutOs: "",
  schirmerOd: "",
  schirmerOs: "",
  meibomian: "",
  staining: "",
}

interface TabSpecializedProps {
  visit: Visit
  packageData: Record<string, DryEyeFormData>
  onPackageDataChange: (data: Record<string, DryEyeFormData>) => void
  packages: string[]
  onPackagesChange: (packages: string[]) => void
}

export function TabSpecialized({
  visit,
  packageData,
  onPackageDataChange,
  packages,
  onPackagesChange,
}: TabSpecializedProps) {
  const receptionistPackages = visit.specializedPackages ?? []
  const [doctorAddedPackages, setDoctorAddedPackages] = useState<string[]>(
    () => packages.filter((p) => !receptionistPackages.includes(p))
  )

  const allPackages = packages

  const availableToAdd = AVAILABLE_PACKAGES.filter(
    (p) => !allPackages.includes(p.key)
  )

  function handleAddPackage(key: string) {
    setDoctorAddedPackages((prev) => [...prev, key])
    onPackagesChange([...packages, key])
  }

  function handleDryEyeUpdate(data: DryEyeFormData) {
    onPackageDataChange({ ...packageData, "dry-eye": data })
  }

  function getPackageLabel(key: string) {
    return AVAILABLE_PACKAGES.find((p) => p.key === key)?.label ?? key
  }

  function getRegisteredBy(key: string): "receptionist" | "doctor" {
    return receptionistPackages.includes(key) ? "receptionist" : "doctor"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
          Gói đã đăng ký
        </span>
        {availableToAdd.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed border-teal-400 text-xs text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/30"
              >
                + Thêm gói khám
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableToAdd.map((pkg) => (
                <DropdownMenuItem
                  key={pkg.key}
                  onClick={() => handleAddPackage(pkg.key)}
                >
                  {pkg.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {allPackages.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          Chưa có gói khám chuyên sâu nào được đăng ký
        </div>
      )}

      {allPackages.map((key, i) => (
        <SpecializedPackageCard
          key={key}
          title={getPackageLabel(key)}
          registeredBy={getRegisteredBy(key)}
          defaultOpen={i === 0}
        >
          {key === "dry-eye" ? (
            <SpecializedDryEyeForm
              data={packageData["dry-eye"] ?? EMPTY_DRY_EYE}
              onUpdate={handleDryEyeUpdate}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Biểu mẫu cho gói này sẽ được bổ sung sau
            </div>
          )}
        </SpecializedPackageCard>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors (or only errors in `exam.tsx` which we fix next)

- [ ] **Step 5: Commit**

```bash
git add src/components/doctor/specialized-dry-eye-form.tsx src/components/doctor/specialized-package-card.tsx src/components/doctor/tab-specialized.tsx
git commit -m "feat: add specialized exam tab with dry eye form and package cards"
```

---

### Task 10: Wire Up Doctor Exam Page

**Files:**
- Modify: `src/pages/doctor/exam.tsx`

- [ ] **Step 1: Add imports and state for specialized tab**

Add imports:

```typescript
import { TabSpecialized } from "@/components/doctor/tab-specialized"
import type { DryEyeFormData } from "@/data/mock-patients"
```

Add state inside `DoctorExam`, after the `examData` state:

```typescript
const [specializedPackages, setSpecializedPackages] = useState<string[]>(
  () => visit?.specializedPackages ?? []
)
const [specializedPackageData, setSpecializedPackageData] = useState<
  Record<string, DryEyeFormData>
>(() => (visit?.specializedPackageData as Record<string, DryEyeFormData>) ?? {})
```

Compute the count for the sidebar:

```typescript
const specializedPackageCount = specializedPackages.length
```

- [ ] **Step 2: Update ExamSidebar props**

Pass the new prop:

```tsx
<ExamSidebar
  activeTab={activeTab}
  onTabChange={setActiveTab}
  pendingRequestCount={pendingRequestCount}
  specializedPackageCount={specializedPackageCount}
/>
```

- [ ] **Step 3: Add the specialized tab render case**

Add in the tab rendering section, after the `requests` case and before the `exam` case:

```tsx
{activeTab === "specialized" && (
  <TabSpecialized
    visit={visit}
    packageData={specializedPackageData}
    onPackageDataChange={setSpecializedPackageData}
    packages={specializedPackages}
    onPackagesChange={setSpecializedPackages}
  />
)}
```

- [ ] **Step 4: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 5: Visually verify**

Run: `npm run dev`

Navigate to `/doctor/<visitId>` for a visit that has specialized packages. The sidebar should show:
- Renamed labels: "Khám chức năng", "Cận lâm sàng"
- "Khám chuyên sâu" with count badge
- "Khám & kết luận" at the bottom
- Clicking "Khám chuyên sâu" shows the tab with package cards

- [ ] **Step 6: Commit**

```bash
git add src/pages/doctor/exam.tsx
git commit -m "feat: wire up specialized tab in doctor exam page"
```

---

### Task 11: Show Red Flag Alert in Doctor's Patient Tab

**Files:**
- Modify: `src/components/doctor/tab-patient.tsx`

- [ ] **Step 1: Add red flag alert banner**

Add import:

```typescript
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
```

Create a `DangerousSymptomsAlert` component inside the file:

```typescript
const SYMPTOM_LABELS: Record<string, string> = {
  eyePain: "Đau mắt nhiều",
  suddenVisionLoss: "Giảm thị lực đột ngột",
  asymmetry: "Triệu chứng lệch 1 bên rõ",
}

function DangerousSymptomsAlert({ visit }: { visit: Visit }) {
  const symptoms = visit.dangerousSymptoms
  if (!symptoms) return null

  const active = Object.entries(symptoms)
    .filter(([, v]) => v)
    .map(([k]) => SYMPTOM_LABELS[k] ?? k)

  if (active.length === 0) return null

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive text-white">
        <HugeiconsIcon icon={Alert01Icon} className="size-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-destructive">
          Triệu chứng nguy hiểm
        </p>
        <p className="text-xs text-destructive/80">{active.join(", ")}</p>
      </div>
    </div>
  )
}
```

In the `TabPatient` render, add it at the top of the flex column, before `AdminInfoSection`:

```tsx
export function TabPatient({ patient, visit }: TabPatientProps) {
  return (
    <div className="flex flex-col gap-8">
      <DangerousSymptomsAlert visit={visit} />
      <AdminInfoSection patient={patient} />
      <ScreeningIntakeSummary patient={patient} defaultOpen />
      <VisitHistorySection visit={visit} />
    </div>
  )
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/tab-patient.tsx
git commit -m "feat: show dangerous symptoms alert in doctor patient tab"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run full type check**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing ones)

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Visual walkthrough**

Run: `npm run dev`

Test the full flow:
1. Go to `/intake/new` → check a dangerous symptom → alert banner appears → click "Chuyển bác sĩ ngay" → toast appears
2. Check a specialized package (Khô mắt) → save with "Lưu & Sàng lọc"
3. Go to `/doctor/<visitId>` → sidebar shows "Khám chuyên sâu" with badge "1"
4. Click "Khám chuyên sâu" → dry eye card visible → expand → OSDI modal works
5. Click "+ Thêm gói khám" → add myopia → badge updates to "2"
6. Click "Bệnh nhân" → red flag alert banner visible at top
7. Sidebar labels: "Khám chức năng", "Cận lâm sàng", "Khám & kết luận" at bottom

- [ ] **Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: address any remaining issues from final verification"
```
