# Pre-Exam Screening Form Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pre-exam screening form that replaces the placeholder at `/screening/:visitId`, allowing technicians to collect chief complaint, visual acuity, red flags, and screening questions.

**Architecture:** Single-page scrollable form with 4 card sections, managed by local `useState`. Extends the `Visit` type with optional `screeningData` and adds `saveScreeningData` to `ReceptionistContext`. Each card section is its own component receiving form state + updater as props.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Input, Textarea, Label, Select, Button), HugeIcons

---

### Task 1: Extend data model with ScreeningFormData type and context method

**Files:**
- Modify: `src/data/mock-patients.ts`
- Modify: `src/contexts/receptionist-context.tsx`

- [ ] **Step 1: Add ScreeningFormData interface and extend Visit type**

In `src/data/mock-patients.ts`, add the `ScreeningFormData` interface after the `Visit` interface, then add the optional `screeningData` field to `Visit`:

```typescript
// Add after the Visit interface (after line 47)

export interface ScreeningFormData {
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

In the `Visit` interface, add:

```typescript
export interface Visit {
  // ... existing fields remain unchanged
  screeningData?: ScreeningFormData  // add this line
}
```

- [ ] **Step 2: Add saveScreeningData to ReceptionistContext**

In `src/contexts/receptionist-context.tsx`, import `ScreeningFormData`:

```typescript
import {
  mockPatients,
  mockVisits,
  generatePatientId,
  type Patient,
  type Visit,
  type PatientStatus,
  type ScreeningFormData,
} from "@/data/mock-patients"
```

Add to the `ReceptionistContextType` interface:

```typescript
saveScreeningData: (visitId: string, data: ScreeningFormData) => void
```

Add the implementation inside `ReceptionistProvider`:

```typescript
function saveScreeningData(visitId: string, data: ScreeningFormData) {
  setVisits((prev) =>
    prev.map((v) =>
      v.id === visitId ? { ...v, screeningData: data } : v
    )
  )
}
```

Add `saveScreeningData` to the Provider `value` object:

```typescript
value={{
  // ... existing values
  saveScreeningData,
}}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-patients.ts src/contexts/receptionist-context.tsx
git commit -m "feat: add ScreeningFormData type and saveScreeningData context method"
```

---

### Task 2: Build the patient header component

**Files:**
- Create: `src/components/screening/screening-form-header.tsx`

- [ ] **Step 1: Create the header component**

This component shows back button, patient name/info, and wait time. It receives the patient and visit as props.

```tsx
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import type { Patient, Visit } from "@/data/mock-patients"
import { SOURCE_CONFIG } from "@/data/mock-patients"

interface ScreeningFormHeaderProps {
  patient: Patient
  visit: Visit
}

export function ScreeningFormHeader({
  patient,
  visit,
}: ScreeningFormHeaderProps) {
  const waitMinutes = visit.checkedInAt
    ? Math.floor(
        (new Date("2026-04-01T14:00:00Z").getTime() -
          new Date(visit.checkedInAt).getTime()) /
          60000
      )
    : 0

  const sourceLabel = SOURCE_CONFIG[visit.source].label

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link to="/screening">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold">{patient.name}</h1>
        <p className="text-sm text-muted-foreground">
          {patient.id} · {patient.gender} · {patient.birthYear} · {sourceLabel}
        </p>
      </div>
      {visit.checkedInAt && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Thời gian chờ:</span>
          <span
            className={
              waitMinutes >= 30
                ? "font-semibold text-destructive"
                : "font-semibold text-amber-500"
            }
          >
            {waitMinutes}p
          </span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-form-header.tsx
git commit -m "feat: add screening form patient header component"
```

---

### Task 3: Build the step indicator component

**Files:**
- Create: `src/components/screening/screening-step-indicator.tsx`

- [ ] **Step 1: Create the step indicator**

A simple visual-only component showing the 2-step flow with step 1 active.

```tsx
interface ScreeningStepIndicatorProps {
  currentStep?: 1 | 2
}

export function ScreeningStepIndicator({
  currentStep = 1,
}: ScreeningStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm ${
            currentStep >= 1
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Khám sàng lọc
        </span>
      </div>
      <div className="h-px w-10 bg-border" />
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep >= 2
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Phân loại nhóm bệnh
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/screening/screening-step-indicator.tsx
git commit -m "feat: add screening step indicator component"
```

---

### Task 4: Build Section 1 — Thông tin khám ban đầu

**Files:**
- Create: `src/components/screening/screening-form-initial.tsx`

- [ ] **Step 1: Create the initial exam info section**

This section has chief complaint textarea + UCVA OD/OS + current Rx OD/OS.

```tsx
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { Task01Icon } from "@hugeicons/core-free-icons"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormInitialProps {
  form: ScreeningFormData
  errors: Record<string, string>
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

export function ScreeningFormInitial({
  form,
  errors,
  onUpdate,
}: ScreeningFormInitialProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={Task01Icon}
          className="size-5"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold">Thông tin khám ban đầu</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <div className="space-y-4">
        {/* Chief Complaint */}
        <div>
          <Label>
            Lý do đến khám <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={form.chiefComplaint}
            onChange={(e) =>
              onUpdate(
                "chiefComplaint",
                e.target.value.slice(0, 500)
              )
            }
            placeholder="Mô tả lý do khám chính của bệnh nhân..."
            rows={3}
            aria-required
            aria-invalid={!!errors.chiefComplaint}
          />
          <div className="mt-1 flex justify-between">
            {errors.chiefComplaint ? (
              <p className="text-xs text-destructive">
                {errors.chiefComplaint}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground">
              {form.chiefComplaint.length}/500
            </span>
          </div>
        </div>

        {/* UCVA */}
        <div>
          <Label>
            Thị lực cơ bản (UCVA) <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={form.ucvaOd}
                onChange={(e) => onUpdate("ucvaOd", e.target.value)}
                placeholder="VD: 20/40"
                aria-label="UCVA mắt phải (OD)"
                aria-required
                aria-invalid={!!errors.ucvaOd}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
                OS
              </span>
              <Input
                value={form.ucvaOs}
                onChange={(e) => onUpdate("ucvaOs", e.target.value)}
                placeholder="VD: 20/40"
                aria-label="UCVA mắt trái (OS)"
                aria-required
                aria-invalid={!!errors.ucvaOs}
              />
            </div>
          </div>
          {(errors.ucvaOd || errors.ucvaOs) && (
            <div className="mt-1 grid grid-cols-2 gap-3">
              <p className="text-xs text-destructive">
                {errors.ucvaOd ?? ""}
              </p>
              <p className="text-xs text-destructive">
                {errors.ucvaOs ?? ""}
              </p>
            </div>
          )}
        </div>

        {/* Current Rx */}
        <div>
          <Label>Khúc xạ nhanh / Kính hiện tại</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={form.currentRxOd}
                onChange={(e) => onUpdate("currentRxOd", e.target.value)}
                placeholder="VD: -2.50 / -0.75 x 180"
                aria-label="Khúc xạ mắt phải (OD)"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
                OS
              </span>
              <Input
                value={form.currentRxOs}
                onChange={(e) => onUpdate("currentRxOs", e.target.value)}
                placeholder="VD: -2.50 / -0.75 x 180"
                aria-label="Khúc xạ mắt trái (OS)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors. If `Task01Icon` is not available, substitute with another icon from `@hugeicons/core-free-icons` like `NoteIcon` or `FileTextIcon`. Search with: `grep -r "Icon" node_modules/@hugeicons/core-free-icons/dist/index.d.ts | head -30` to find available icons.

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-form-initial.tsx
git commit -m "feat: add screening form initial exam section (chief complaint, UCVA, Rx)"
```

---

### Task 5: Build Section 2 — Red Flag

**Files:**
- Create: `src/components/screening/screening-form-red-flags.tsx`

- [ ] **Step 1: Create the red flag section**

This section has 3 checkboxes and a conditional alert banner with animated entrance.

```tsx
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormRedFlagsProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
  onFastTrack: () => void
}

const RED_FLAG_OPTIONS = [
  { key: "eyePain" as const, label: "Đau mắt nhiều" },
  { key: "suddenVisionLoss" as const, label: "Giảm thị lực đột ngột" },
  { key: "asymmetry" as const, label: "Triệu chứng lệch 1 bên rõ" },
]

export function ScreeningFormRedFlags({
  form,
  onUpdate,
  onFastTrack,
}: ScreeningFormRedFlagsProps) {
  const hasAnyFlag = Object.values(form.redFlags).some(Boolean)
  const activeFlags = RED_FLAG_OPTIONS.filter(
    (opt) => form.redFlags[opt.key]
  )

  function toggleFlag(key: keyof ScreeningFormData["redFlags"]) {
    onUpdate("redFlags", {
      ...form.redFlags,
      [key]: !form.redFlags[key],
    })
  }

  return (
    <section className="rounded-lg border-2 border-red-300 bg-background p-5 dark:border-red-800">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={Alert01Icon}
          className="size-5 text-destructive"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold text-destructive">Red Flag</h2>
      </div>
      <div className="mb-5 border-t border-red-200 dark:border-red-900" />

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Kiểm tra cờ đỏ"
      >
        {RED_FLAG_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
              form.redFlags[opt.key]
                ? "border-destructive bg-destructive/5"
                : "border-border"
            )}
          >
            <input
              type="checkbox"
              checked={form.redFlags[opt.key]}
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
                Phát hiện Red Flag!
              </p>
              <p className="text-xs text-destructive">
                {activeFlags.map((f) => f.label).join(", ")}
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={onFastTrack}>
            → Chuyển bác sĩ ngay
          </Button>
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-form-red-flags.tsx
git commit -m "feat: add screening form red flag section with alert banner"
```

---

### Task 6: Build Section 3 — Câu hỏi định hướng

**Files:**
- Create: `src/components/screening/screening-form-questions.tsx`

- [ ] **Step 1: Create the screening questions section**

This is the largest section with symptoms checkboxes, radio pills, duration, screen time, contact lens, and severity toggle.

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { HelpCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormQuestionsProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

const SYMPTOM_OPTIONS = [
  { key: "dryEyes" as const, label: "Khô mắt" },
  { key: "gritty" as const, label: "Cộm / rát mắt" },
  { key: "blurry" as const, label: "Nhìn mờ" },
  { key: "tearing" as const, label: "Chảy nước mắt" },
  { key: "itchy" as const, label: "Ngứa mắt" },
  { key: "headache" as const, label: "Nhức đầu" },
]

const BLINK_OPTIONS = [
  { value: "yes" as const, label: "Có" },
  { value: "no" as const, label: "Không" },
  { value: "unclear" as const, label: "Không rõ" },
]

const CONTACT_LENS_OPTIONS = [
  { value: "yes" as const, label: "Có" },
  { value: "no" as const, label: "Không" },
]

const SEVERITY_OPTIONS = [
  { value: "mild" as const, label: "Nhẹ" },
  { value: "moderate" as const, label: "Trung bình" },
  { value: "severe" as const, label: "Nặng" },
]

export function ScreeningFormQuestions({
  form,
  onUpdate,
}: ScreeningFormQuestionsProps) {
  function toggleSymptom(key: keyof ScreeningFormData["symptoms"]) {
    onUpdate("symptoms", {
      ...form.symptoms,
      [key]: !form.symptoms[key],
    })
  }

  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={HelpCircleIcon}
          className="size-5"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold">Câu hỏi định hướng</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <div className="space-y-5">
        {/* Symptoms */}
        <div>
          <Label>Triệu chứng</Label>
          <div
            className="mt-1.5 grid grid-cols-3 gap-2"
            role="group"
            aria-label="Triệu chứng"
          >
            {SYMPTOM_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                  form.symptoms[opt.key]
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={form.symptoms[opt.key]}
                  onChange={() => toggleSymptom(opt.key)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Blink Improvement */}
        <div>
          <Label>Nhìn mờ có cải thiện sau khi chớp mắt không?</Label>
          <div
            className="mt-1.5 flex gap-2"
            role="radiogroup"
            aria-label="Cải thiện sau khi chớp mắt"
          >
            {BLINK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  form.blinkImprovement === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border"
                )}
              >
                <input
                  type="radio"
                  name="blinkImprovement"
                  value={opt.value}
                  checked={form.blinkImprovement === opt.value}
                  onChange={() => onUpdate("blinkImprovement", opt.value)}
                  className="size-3.5 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Duration + Screen Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Thời gian triệu chứng</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                type="number"
                min={0}
                value={form.symptomDuration || ""}
                onChange={(e) =>
                  onUpdate(
                    "symptomDuration",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-20 text-center"
              />
              <Select
                value={form.symptomDurationUnit}
                onValueChange={(v) =>
                  onUpdate(
                    "symptomDurationUnit",
                    v as ScreeningFormData["symptomDurationUnit"]
                  )
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngày">ngày</SelectItem>
                  <SelectItem value="tuần">tuần</SelectItem>
                  <SelectItem value="tháng">tháng</SelectItem>
                  <SelectItem value="năm">năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Thời gian dùng màn hình (giờ/ngày)</Label>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              max={24}
              value={form.screenTime}
              onChange={(e) => onUpdate("screenTime", e.target.value)}
              placeholder="VD: 8"
            />
          </div>
        </div>

        {/* Contact Lens */}
        <div>
          <Label>Đeo kính áp tròng?</Label>
          <div
            className="mt-1.5 flex gap-2"
            role="radiogroup"
            aria-label="Kính áp tròng"
          >
            {CONTACT_LENS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  form.contactLens === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border"
                )}
              >
                <input
                  type="radio"
                  name="contactLens"
                  value={opt.value}
                  checked={form.contactLens === opt.value}
                  onChange={() => onUpdate("contactLens", opt.value)}
                  className="size-3.5 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Discomfort Severity */}
        <div>
          <Label>Mức độ khó chịu</Label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("discomfortLevel", opt.value)}
                className={cn(
                  "rounded-lg border py-2.5 text-sm transition-colors",
                  form.discomfortLevel === opt.value
                    ? "border-2 border-primary bg-primary/5 font-semibold text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors. If `HelpCircleIcon` is not available, use another icon. Check available icons: search for question/help icons in the hugeicons package.

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-form-questions.tsx
git commit -m "feat: add screening form questions section (symptoms, duration, severity)"
```

---

### Task 7: Build Section 4 — Ghi chú

**Files:**
- Create: `src/components/screening/screening-form-notes.tsx`

- [ ] **Step 1: Create the notes section**

```tsx
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Edit02Icon } from "@hugeicons/core-free-icons"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormNotesProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

export function ScreeningFormNotes({
  form,
  onUpdate,
}: ScreeningFormNotesProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={Edit02Icon}
          className="size-5"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold">Ghi chú</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <Textarea
        value={form.notes}
        onChange={(e) => onUpdate("notes", e.target.value)}
        placeholder="Ghi chú thêm nếu cần..."
        rows={3}
      />
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/screening/screening-form-notes.tsx
git commit -m "feat: add screening form notes section"
```

---

### Task 8: Build the main screening form orchestrator

**Files:**
- Create: `src/components/screening/screening-form.tsx`

- [ ] **Step 1: Create the main form component**

This component manages form state, validation, and renders all sections. It receives patient/visit props and uses `ReceptionistContext` to save data.

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  Visit,
  ScreeningFormData,
} from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningStepIndicator } from "./screening-step-indicator"
import { ScreeningFormInitial } from "./screening-form-initial"
import { ScreeningFormRedFlags } from "./screening-form-red-flags"
import { ScreeningFormQuestions } from "./screening-form-questions"
import { ScreeningFormNotes } from "./screening-form-notes"

interface ScreeningFormProps {
  patient: Patient
  visit: Visit
}

const INITIAL_FORM: ScreeningFormData = {
  chiefComplaint: "",
  ucvaOd: "",
  ucvaOs: "",
  currentRxOd: "",
  currentRxOs: "",
  redFlags: {
    eyePain: false,
    suddenVisionLoss: false,
    asymmetry: false,
  },
  symptoms: {
    dryEyes: false,
    gritty: false,
    blurry: false,
    tearing: false,
    itchy: false,
    headache: false,
  },
  blinkImprovement: null,
  symptomDuration: 0,
  symptomDurationUnit: "ngày",
  screenTime: "",
  contactLens: null,
  discomfortLevel: null,
  notes: "",
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveScreeningData, updateVisitStatus } = useReceptionist()

  const [form, setForm] = useState<ScreeningFormData>(
    visit.screeningData ?? INITIAL_FORM
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  function updateField<K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.chiefComplaint.trim())
      errs.chiefComplaint = "Vui lòng nhập lý do đến khám"
    if (!form.ucvaOd.trim())
      errs.ucvaOd = "Vui lòng nhập thị lực mắt phải"
    if (!form.ucvaOs.trim())
      errs.ucvaOs = "Vui lòng nhập thị lực mắt trái"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?"
      )
      if (!confirmed) return
    }
    navigate("/screening")
  }

  function handleSaveDraft() {
    saveScreeningData(visit.id, form)
    navigate("/screening")
  }

  function handleContinue() {
    if (!validate()) return
    saveScreeningData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
  }

  function handleFastTrack() {
    saveScreeningData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
      <ScreeningStepIndicator currentStep={1} />

      <ScreeningFormInitial
        form={form}
        errors={errors}
        onUpdate={updateField}
      />
      <ScreeningFormRedFlags
        form={form}
        onUpdate={updateField}
        onFastTrack={handleFastTrack}
      />
      <ScreeningFormQuestions form={form} onUpdate={updateField} />
      <ScreeningFormNotes form={form} onUpdate={updateField} />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button onClick={handleContinue}>Tiếp tục →</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-form.tsx
git commit -m "feat: add main screening form orchestrator with state management and validation"
```

---

### Task 9: Wire up the visit page to render the form

**Files:**
- Modify: `src/pages/screening/visit.tsx`

- [ ] **Step 1: Replace the placeholder with the screening form**

Replace the entire contents of `src/pages/screening/visit.tsx` with:

```tsx
import { useParams, Link } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { Button } from "@/components/ui/button"
import { ScreeningForm } from "@/components/screening/screening-form"

export default function ScreeningVisit() {
  const { visitId } = useParams<{ visitId: string }>()
  const { todayVisits, getPatient } = useReceptionist()

  const visit = todayVisits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  if (!visit || !patient) {
    return (
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            Không tìm thấy lượt khám này.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/screening">← Quay lại</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <ScreeningForm patient={patient} visit={visit} />
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Verify in browser**

Run: `npm run dev`

1. Navigate to `/screening`
2. Click "Bắt đầu sàng lọc" on a patient
3. Verify the form renders with all 4 sections
4. Fill in fields, check red flags — verify alert banner appears
5. Click "Lưu nháp" — verify navigation back to dashboard
6. Click "Tiếp tục" on the same patient — verify form data is pre-populated from draft
7. Test "Tiếp tục →" with empty required fields — verify error messages appear
8. Test "Hủy" with dirty form — verify confirmation dialog

- [ ] **Step 4: Commit**

```bash
git add src/pages/screening/visit.tsx
git commit -m "feat: wire screening form into visit page, replacing placeholder"
```

---

### Task 10: Fix icon imports and final polish

**Files:**
- Modify: any files with broken icon imports

- [ ] **Step 1: Verify all icon imports resolve**

Run: `npm run typecheck`

If any icon names (`Task01Icon`, `HelpCircleIcon`, `Edit02Icon`) don't exist in `@hugeicons/core-free-icons`, find alternatives:

```bash
# Search for available icon names in the package
node -e "const icons = require('@hugeicons/core-free-icons'); const names = Object.keys(icons).filter(k => k.endsWith('Icon')); console.log(names.filter(n => /task|note|file|document|clip/i.test(n)).join('\n'))"
```

Replace any missing icons with available ones that match semantically:
- `Task01Icon` → look for task/document/clipboard icon
- `HelpCircleIcon` → look for help/question icon
- `Edit02Icon` → look for edit/pencil/note icon

- [ ] **Step 2: Run lint and format**

```bash
npm run format
npm run lint
```

Fix any lint/format issues.

- [ ] **Step 3: Final typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit any fixes**

```bash
git add -u
git commit -m "fix: resolve icon imports and lint issues"
```

---

### Task 11: Manual smoke test

**Files:** None (testing only)

- [ ] **Step 1: Full flow test**

Run: `npm run dev` and test the complete flow:

1. Go to `/screening` dashboard
2. Click "Bắt đầu sàng lọc" on patient "Lê Hoàng Cường" (who is `dang_sang_loc`)
3. Verify patient header shows: name, ID, gender, birth year, wait time
4. Verify step indicator shows step 1 active, step 2 grayed
5. Fill in all form fields
6. Check "Đau mắt nhiều" red flag — verify alert banner appears with "Chuyển bác sĩ ngay" button
7. Uncheck it — verify banner disappears
8. Click "Hủy" — verify confirmation dialog when form is dirty
9. Go back, click "Lưu nháp" — verify return to dashboard
10. Click "Tiếp tục" on same patient — verify draft data loaded
11. Clear required fields, click "Tiếp tục →" — verify error messages
12. Fill required fields, click "Tiếp tục →" — verify status changes and navigates to dashboard
13. Test dark mode toggle — verify all sections render correctly

- [ ] **Step 2: Final commit if any adjustments needed**

```bash
git add -u
git commit -m "chore: final polish for pre-exam screening form"
```
