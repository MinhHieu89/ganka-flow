# Screening Refraction Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the screening page from a 2-step triage wizard into a single-page refraction examination form with measurement tables, toggle sections, and inline glasses prescription.

**Architecture:** Replace `screening-form.tsx` and its child components with a new component tree. The root form manages state for all sections via a single `RefractionFormData` object. A reusable `screening-refraction-table.tsx` renders the OD/OS measurement tables with configurable columns. Toggle sections (cycloplegic, glasses Rx) use shadcn Switch + Collapsible. Data persists via the existing `saveScreeningData` context function after updating its type signature.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS v4, shadcn/ui (Collapsible, Switch, Input, Button), Radix UI primitives, sonner (toasts)

**Spec:** `docs/superpowers/specs/2026-04-12-screening-refraction-redesign.md`

---

### Task 1: Install shadcn Switch component

**Files:**
- Create: `src/components/ui/switch.tsx`

The project does not have the shadcn Switch component. The toggle sections need it.

- [ ] **Step 1: Install the Switch component**

Run:
```bash
npx shadcn@latest add switch
```

Expected: creates `src/components/ui/switch.tsx`

- [ ] **Step 2: Verify the component was created**

Run:
```bash
ls src/components/ui/switch.tsx
```

Expected: file exists

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/switch.tsx
git commit -m "chore: add shadcn Switch component"
```

---

### Task 2: Add RefractionFormData types

**Files:**
- Modify: `src/data/mock-patients.ts` (add types after line 308, update Visit interface)
- Modify: `src/contexts/receptionist-context.tsx` (update saveScreeningData signature)

- [ ] **Step 1: Add the new types to mock-patients.ts**

Add after the `Step2FormData` interface (line 308):

```ts
// --- Refraction Examination Types ---

export interface RefractionEyeRow {
  sph: string
  cyl: string
  axis: string
  va: string
}

export interface RefractionEyeRowWithAdd extends RefractionEyeRow {
  add: string
}

export interface SubjectiveEyeRow extends RefractionEyeRowWithAdd {
  vaNear: string
}

export type CycloplegicAgent = "cyclogyl" | "mydrinP" | "atropine"

export interface RefractionFormData {
  currentGlasses: { od: RefractionEyeRowWithAdd; os: RefractionEyeRowWithAdd }
  objective: { od: RefractionEyeRow; os: RefractionEyeRow }
  subjective: { od: SubjectiveEyeRow; os: SubjectiveEyeRow }
  cycloplegicEnabled: boolean
  cycloplegicAgent: CycloplegicAgent[]
  cycloplegic: { od: RefractionEyeRow; os: RefractionEyeRow }
  retinoscopy: { od: string; os: string }
  iop: { od: string; os: string }
  axialLength: { od: string; os: string }
  glassesRxEnabled: boolean
  glassesRx: {
    od: RefractionEyeRowWithAdd
    os: RefractionEyeRowWithAdd
    pd: string
    lensType: string
    purpose: string
    notes: string
  }
  notes: string
}
```

- [ ] **Step 2: Update Visit interface to accept both data types**

In the `Visit` interface (line 236), change:

```ts
// Old:
screeningData?: ScreeningFormData
// New:
screeningData?: ScreeningFormData
refractionData?: RefractionFormData
```

This keeps backward compatibility — old screening data stays on `screeningData`, the new refraction form saves to `refractionData`.

- [ ] **Step 3: Update receptionist-context.tsx**

Add a new `saveRefractionData` function next to the existing `saveScreeningData` (around line 124):

```ts
function saveRefractionData(visitId: string, data: RefractionFormData) {
  setVisits((prev) =>
    prev.map((v) => (v.id === visitId ? { ...v, refractionData: data } : v))
  )
}
```

Add `saveRefractionData` to the context value object and the `ReceptionistContextType` interface. Import `RefractionFormData` from `@/data/mock-patients`.

- [ ] **Step 4: Verify types compile**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/data/mock-patients.ts src/contexts/receptionist-context.tsx
git commit -m "feat: add RefractionFormData types and saveRefractionData context function"
```

---

### Task 3: Create screening-refraction-table.tsx

**Files:**
- Create: `src/components/screening/screening-refraction-table.tsx`

This is the reusable OD/OS table used by Kính cũ, KX khách quan, KX chủ quan, and Cycloplegic sections. Props control which columns are visible.

- [ ] **Step 1: Create the component**

Create `src/components/screening/screening-refraction-table.tsx`:

```tsx
import { Input } from "@/components/ui/input"

type ColumnKey = "sph" | "cyl" | "axis" | "va" | "add" | "vaNear"

interface EyeRowData {
  sph: string
  cyl: string
  axis: string
  va: string
  add?: string
  vaNear?: string
}

interface RefractionTableProps {
  odData: EyeRowData
  osData: EyeRowData
  columns: ColumnKey[]
  onOdChange: (field: string, value: string) => void
  onOsChange: (field: string, value: string) => void
}

const COLUMN_LABELS: Record<ColumnKey, string> = {
  sph: "SPH",
  cyl: "CYL",
  axis: "AXIS",
  va: "VA",
  add: "ADD",
  vaNear: "VA gần",
}

export function RefractionTable({
  odData,
  osData,
  columns,
  onOdChange,
  onOsChange,
}: RefractionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-14 px-1 py-1.5" />
            {columns.map((col) => (
              <th
                key={col}
                className="px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {COLUMN_LABELS[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-1 py-1">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                OD
              </span>
            </td>
            {columns.map((col) => (
              <td key={col} className="px-1 py-1">
                <Input
                  value={(odData as Record<string, string>)[col] ?? ""}
                  onChange={(e) => onOdChange(col, e.target.value)}
                  className="h-8 text-center text-xs"
                  aria-label={`OD ${COLUMN_LABELS[col]}`}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-1 py-1">
              <span className="rounded-md bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                OS
              </span>
            </td>
            {columns.map((col) => (
              <td key={col} className="px-1 py-1">
                <Input
                  value={(osData as Record<string, string>)[col] ?? ""}
                  onChange={(e) => onOsChange(col, e.target.value)}
                  className="h-8 text-center text-xs"
                  aria-label={`OS ${COLUMN_LABELS[col]}`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-refraction-table.tsx
git commit -m "feat: add reusable RefractionTable component for OD/OS measurement grids"
```

---

### Task 4: Create screening-chief-complaint.tsx

**Files:**
- Create: `src/components/screening/screening-chief-complaint.tsx`

Read-only chief complaint with "Cập nhật" button that opens the intake form drawer.

- [ ] **Step 1: Create the component**

Create `src/components/screening/screening-chief-complaint.tsx`:

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IntakeFormDrawer } from "@/components/intake/intake-form-drawer"
import type { Patient } from "@/data/mock-patients"

const VISIT_REASON_LABELS: Record<string, string> = {
  kham_dinh_ky: "Khám định kỳ/Kiểm tra tổng quát",
  giam_thi_luc: "Giảm thị lực",
  mo_mat: "Mờ mắt",
  nhuc_dau_dau_mat: "Nhức đầu/Đau mắt",
  dau_mat_kho_chiu: "Đau mắt hoặc khó chịu",
  kho_nhin_gan: "Khó nhìn gần (đọc sách, xem điện thoại)",
  kho_nhin_xa: "Khó nhìn xa (xem bảng, lái xe)",
  kinh_ap_trong: "Muốn đeo kính áp tròng",
  tu_van_phau_thuat: "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)",
  khac: "Khác",
}

interface ScreeningChiefComplaintProps {
  patient: Patient
  onPatientUpdate: (data: Partial<Patient>) => void
}

export function ScreeningChiefComplaint({
  patient,
  onPatientUpdate,
}: ScreeningChiefComplaintProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const visitReasonLabels = (patient.visitReasons ?? []).map(
    (r) => VISIT_REASON_LABELS[r] ?? r
  )
  const displayText =
    visitReasonLabels.length > 0
      ? visitReasonLabels.join(", ")
      : patient.visitReasonOther ?? "Chưa có thông tin"

  return (
    <>
      <div className="flex items-baseline gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          Lý do khám
        </span>
        <span className="flex-1 text-sm text-foreground">{displayText}</span>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs text-muted-foreground"
          onClick={() => setDrawerOpen(true)}
        >
          Cập nhật
        </Button>
      </div>
      <IntakeFormDrawer
        patient={patient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={(data) => onPatientUpdate(data)}
      />
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-chief-complaint.tsx
git commit -m "feat: add ScreeningChiefComplaint read-only component with edit drawer"
```

---

### Task 5: Create screening-cycloplegic-section.tsx

**Files:**
- Create: `src/components/screening/screening-cycloplegic-section.tsx`

Toggle switch that expands to show cycloplegic refraction table + agent checkboxes.

- [ ] **Step 1: Create the component**

Create `src/components/screening/screening-cycloplegic-section.tsx`:

```tsx
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { RefractionTable } from "./screening-refraction-table"
import type { RefractionEyeRow, CycloplegicAgent } from "@/data/mock-patients"

interface ScreeningCycloplegicSectionProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  agents: CycloplegicAgent[]
  onAgentsChange: (agents: CycloplegicAgent[]) => void
  od: RefractionEyeRow
  os: RefractionEyeRow
  onOdChange: (field: string, value: string) => void
  onOsChange: (field: string, value: string) => void
}

const AGENT_OPTIONS: { key: CycloplegicAgent; label: string }[] = [
  { key: "cyclogyl", label: "Cyclogyl" },
  { key: "mydrinP", label: "Mydrin P" },
  { key: "atropine", label: "Atropine" },
]

export function ScreeningCycloplegicSection({
  enabled,
  onEnabledChange,
  agents,
  onAgentsChange,
  od,
  os,
  onOdChange,
  onOsChange,
}: ScreeningCycloplegicSectionProps) {
  function toggleAgent(agent: CycloplegicAgent) {
    if (agents.includes(agent)) {
      onAgentsChange(agents.filter((a) => a !== agent))
    } else {
      onAgentsChange([...agents, agent])
    }
  }

  return (
    <Collapsible open={enabled} onOpenChange={onEnabledChange}>
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Bật liệt điều tiết"
          />
          <span className="text-sm text-muted-foreground">Liệt điều tiết</span>
          {!enabled && (
            <span className="text-xs text-muted-foreground/60">
              Cyclogyl / Mydrin P / Atropine
            </span>
          )}
        </div>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-3.5 py-3">
            {/* Agent checkboxes */}
            <div className="flex gap-3">
              {AGENT_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                    agents.includes(opt.key)
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={agents.includes(opt.key)}
                    onChange={() => toggleAgent(opt.key)}
                    className="size-3 accent-[var(--color-primary)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {/* Refraction table */}
            <RefractionTable
              odData={od}
              osData={os}
              columns={["sph", "cyl", "axis", "va"]}
              onOdChange={onOdChange}
              onOsChange={onOsChange}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-cycloplegic-section.tsx
git commit -m "feat: add ScreeningCycloplegicSection toggle with agent checkboxes"
```

---

### Task 6: Create screening-other-test-card.tsx

**Files:**
- Create: `src/components/screening/screening-other-test-card.tsx`

Simple collapsible card with OD/OS text inputs for retinoscopy, IOP, axial length.

- [ ] **Step 1: Create the component**

Create `src/components/screening/screening-other-test-card.tsx`:

```tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ScreeningOtherTestCardProps {
  title: string
  odValue: string
  osValue: string
  onOdChange: (value: string) => void
  onOsChange: (value: string) => void
  defaultOpen?: boolean
}

export function ScreeningOtherTestCard({
  title,
  odValue,
  osValue,
  onOdChange,
  onOsChange,
  defaultOpen = true,
}: ScreeningOtherTestCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-background">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center px-3.5 py-2.5"
          >
            <span className="text-sm font-semibold">{title}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn(
                "ml-auto size-3.5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-2 border-t border-border px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={odValue}
                onChange={(e) => onOdChange(e.target.value)}
                className="h-8 text-xs"
                aria-label={`${title} OD`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                OS
              </span>
              <Input
                value={osValue}
                onChange={(e) => onOsChange(e.target.value)}
                className="h-8 text-xs"
                aria-label={`${title} OS`}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-other-test-card.tsx
git commit -m "feat: add ScreeningOtherTestCard for retinoscopy, IOP, axial length"
```

---

### Task 7: Create screening-glasses-rx-section.tsx

**Files:**
- Create: `src/components/screening/screening-glasses-rx-section.tsx`

Toggle section for glasses prescription. When toggled ON, pre-fills from subjective refraction data.

- [ ] **Step 1: Create the component**

Create `src/components/screening/screening-glasses-rx-section.tsx`:

```tsx
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { RefractionTable } from "./screening-refraction-table"
import type { RefractionEyeRowWithAdd, SubjectiveEyeRow } from "@/data/mock-patients"

interface GlassesRxData {
  od: RefractionEyeRowWithAdd
  os: RefractionEyeRowWithAdd
  pd: string
  lensType: string
  purpose: string
  notes: string
}

interface ScreeningGlassesRxSectionProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  data: GlassesRxData
  onDataChange: (data: GlassesRxData) => void
  subjectiveOd: SubjectiveEyeRow
  subjectiveOs: SubjectiveEyeRow
}

export function ScreeningGlassesRxSection({
  enabled,
  onEnabledChange,
  data,
  onDataChange,
  subjectiveOd,
  subjectiveOs,
}: ScreeningGlassesRxSectionProps) {
  function handleToggle(checked: boolean) {
    if (checked) {
      // Pre-fill from subjective refraction (snapshot)
      onDataChange({
        ...data,
        od: {
          sph: subjectiveOd.sph,
          cyl: subjectiveOd.cyl,
          axis: subjectiveOd.axis,
          va: subjectiveOd.va,
          add: subjectiveOd.add,
        },
        os: {
          sph: subjectiveOs.sph,
          cyl: subjectiveOs.cyl,
          axis: subjectiveOs.axis,
          va: subjectiveOs.va,
          add: subjectiveOs.add,
        },
      })
    }
    onEnabledChange(checked)
  }

  function updateField<K extends keyof GlassesRxData>(
    field: K,
    value: GlassesRxData[K]
  ) {
    onDataChange({ ...data, [field]: value })
  }

  return (
    <Collapsible open={enabled} onOpenChange={handleToggle}>
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label="Bật đơn kính"
          />
          <span className="text-sm text-muted-foreground">Đơn kính</span>
          {!enabled && (
            <span className="text-xs text-muted-foreground/60">
              Kê đơn kính từ kết quả khúc xạ
            </span>
          )}
        </div>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-3.5 py-3">
            {/* Rx table */}
            <RefractionTable
              odData={data.od}
              osData={data.os}
              columns={["sph", "cyl", "axis", "va", "add"]}
              onOdChange={(field, value) =>
                updateField("od", { ...data.od, [field]: value })
              }
              onOsChange={(field, value) =>
                updateField("os", { ...data.os, [field]: value })
              }
            />
            {/* Additional fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1 block text-xs">PD</Label>
                <Input
                  value={data.pd}
                  onChange={(e) => updateField("pd", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: 63"
                  aria-label="PD"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Loại kính</Label>
                <Input
                  value={data.lensType}
                  onChange={(e) => updateField("lensType", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: Đơn tròng"
                  aria-label="Loại kính"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Mục đích</Label>
                <Input
                  value={data.purpose}
                  onChange={(e) => updateField("purpose", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: Nhìn xa"
                  aria-label="Mục đích"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Ghi chú đơn kính</Label>
              <Textarea
                value={data.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="text-xs"
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-glasses-rx-section.tsx
git commit -m "feat: add ScreeningGlassesRxSection toggle with pre-fill from subjective refraction"
```

---

### Task 8: Modify screening-intake-summary.tsx

**Files:**
- Modify: `src/components/screening/screening-intake-summary.tsx`

Remove the summary text from the collapsed bar. Keep "Cập nhật" button.

- [ ] **Step 1: Remove the collapsed summary text**

In `src/components/screening/screening-intake-summary.tsx`, find the collapsed bar (around line 283-306). Replace the `CollapsibleTrigger` button content to remove the `collapsedSummary` span:

Change this section (inside the `<div className="flex w-full items-center gap-3 px-4 py-3">`):

```tsx
// Old — remove this span:
<span className="flex-1 truncate text-left text-sm text-muted-foreground">
  {collapsedSummary}
</span>
```

Replace the trigger button to:

```tsx
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
    <span className="flex-1" />
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
```

- [ ] **Step 2: Verify it compiles and renders**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-intake-summary.tsx
git commit -m "fix: remove summary text from intake summary collapsed bar"
```

---

### Task 9: Rewrite screening-form.tsx

**Files:**
- Modify: `src/components/screening/screening-form.tsx` (complete rewrite)

This is the main task. Replace the 2-step wizard with the new single-page refraction form.

- [ ] **Step 1: Rewrite the component**

Replace the entire content of `src/components/screening/screening-form.tsx` with:

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  Visit,
  RefractionFormData,
  RefractionEyeRow,
  RefractionEyeRowWithAdd,
  SubjectiveEyeRow,
  CycloplegicAgent,
} from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningHistoryPanel } from "./screening-history-panel"
import { ScreeningIntakeSummary } from "./screening-intake-summary"
import { ScreeningChiefComplaint } from "./screening-chief-complaint"
import { RefractionTable } from "./screening-refraction-table"
import { ScreeningCycloplegicSection } from "./screening-cycloplegic-section"
import { ScreeningOtherTestCard } from "./screening-other-test-card"
import { ScreeningGlassesRxSection } from "./screening-glasses-rx-section"
import { IntakeShareModal } from "../receptionist/intake-share-modal"

interface ScreeningFormProps {
  patient: Patient
  visit: Visit
}

const EMPTY_EYE_ROW: RefractionEyeRow = { sph: "", cyl: "", axis: "", va: "" }
const EMPTY_EYE_ROW_ADD: RefractionEyeRowWithAdd = { ...EMPTY_EYE_ROW, add: "" }
const EMPTY_SUBJECTIVE: SubjectiveEyeRow = { ...EMPTY_EYE_ROW_ADD, vaNear: "" }

const INITIAL_FORM: RefractionFormData = {
  currentGlasses: { od: { ...EMPTY_EYE_ROW_ADD }, os: { ...EMPTY_EYE_ROW_ADD } },
  objective: { od: { ...EMPTY_EYE_ROW }, os: { ...EMPTY_EYE_ROW } },
  subjective: { od: { ...EMPTY_SUBJECTIVE }, os: { ...EMPTY_SUBJECTIVE } },
  cycloplegicEnabled: false,
  cycloplegicAgent: [],
  cycloplegic: { od: { ...EMPTY_EYE_ROW }, os: { ...EMPTY_EYE_ROW } },
  retinoscopy: { od: "", os: "" },
  iop: { od: "", os: "" },
  axialLength: { od: "", os: "" },
  glassesRxEnabled: false,
  glassesRx: {
    od: { ...EMPTY_EYE_ROW_ADD },
    os: { ...EMPTY_EYE_ROW_ADD },
    pd: "",
    lensType: "",
    purpose: "",
    notes: "",
  },
  notes: "",
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveRefractionData, updateVisitStatus, updatePatient } =
    useReceptionist()

  const [form, setForm] = useState<RefractionFormData>(
    visit.refractionData ?? INITIAL_FORM
  )
  const [isDirty, setIsDirty] = useState(false)
  const [showQr, setShowQr] = useState(false)

  function update(patch: Partial<RefractionFormData>) {
    setForm((prev) => ({ ...prev, ...patch }))
    setIsDirty(true)
  }

  function updateEyeSection<
    S extends "currentGlasses" | "objective" | "subjective" | "cycloplegic",
  >(section: S, eye: "od" | "os", field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [eye]: { ...(prev[section] as Record<string, unknown>)[eye] as Record<string, string>, [field]: value },
      },
    }))
    setIsDirty(true)
  }

  function updateOdOs(
    section: "retinoscopy" | "iop" | "axialLength",
    eye: "od" | "os",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [eye]: value },
    }))
    setIsDirty(true)
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
    saveRefractionData(visit.id, form)
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleComplete() {
    saveRefractionData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.success("Hoàn thành khám khúc xạ — chờ bác sĩ khám")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
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

      {/* Intake Summary */}
      <ScreeningIntakeSummary
        patient={patient}
        onPatientUpdate={(data) => updatePatient(patient.id, data)}
      />

      {/* Chief Complaint */}
      <ScreeningChiefComplaint
        patient={patient}
        onPatientUpdate={(data) => updatePatient(patient.id, data)}
      />

      {/* Kính cũ */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Kính cũ</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.currentGlasses.od}
            osData={form.currentGlasses.os}
            columns={["sph", "cyl", "axis", "va", "add"]}
            onOdChange={(f, v) => updateEyeSection("currentGlasses", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("currentGlasses", "os", f, v)}
          />
        </div>
      </section>

      {/* Khúc xạ khách quan */}
      <section className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <span className="text-sm font-semibold">Khúc xạ khách quan</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            Chỉ lưu trữ
          </span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.objective.od}
            osData={form.objective.os}
            columns={["sph", "cyl", "axis", "va"]}
            onOdChange={(f, v) => updateEyeSection("objective", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("objective", "os", f, v)}
          />
        </div>
      </section>

      {/* Khúc xạ chủ quan */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Khúc xạ chủ quan</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.subjective.od}
            osData={form.subjective.os}
            columns={["sph", "cyl", "axis", "va", "add", "vaNear"]}
            onOdChange={(f, v) => updateEyeSection("subjective", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("subjective", "os", f, v)}
          />
        </div>
      </section>

      {/* Liệt điều tiết */}
      <ScreeningCycloplegicSection
        enabled={form.cycloplegicEnabled}
        onEnabledChange={(v) => update({ cycloplegicEnabled: v })}
        agents={form.cycloplegicAgent}
        onAgentsChange={(v) => update({ cycloplegicAgent: v })}
        od={form.cycloplegic.od}
        os={form.cycloplegic.os}
        onOdChange={(f, v) => updateEyeSection("cycloplegic", "od", f, v)}
        onOsChange={(f, v) => updateEyeSection("cycloplegic", "os", f, v)}
      />

      {/* Soi bóng đồng tử */}
      <ScreeningOtherTestCard
        title="Soi bóng đồng tử"
        odValue={form.retinoscopy.od}
        osValue={form.retinoscopy.os}
        onOdChange={(v) => updateOdOs("retinoscopy", "od", v)}
        onOsChange={(v) => updateOdOs("retinoscopy", "os", v)}
      />

      {/* Nhãn áp */}
      <ScreeningOtherTestCard
        title="Nhãn áp"
        odValue={form.iop.od}
        osValue={form.iop.os}
        onOdChange={(v) => updateOdOs("iop", "od", v)}
        onOsChange={(v) => updateOdOs("iop", "os", v)}
      />

      {/* Trục nhãn cầu */}
      <ScreeningOtherTestCard
        title="Trục nhãn cầu"
        odValue={form.axialLength.od}
        osValue={form.axialLength.os}
        onOdChange={(v) => updateOdOs("axialLength", "od", v)}
        onOsChange={(v) => updateOdOs("axialLength", "os", v)}
      />

      {/* Đơn kính */}
      <ScreeningGlassesRxSection
        enabled={form.glassesRxEnabled}
        onEnabledChange={(v) => update({ glassesRxEnabled: v })}
        data={form.glassesRx}
        onDataChange={(v) => update({ glassesRx: v })}
        subjectiveOd={form.subjective.od}
        subjectiveOs={form.subjective.os}
      />

      {/* Ghi chú */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Ghi chú</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <Textarea
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Ghi chú thêm nếu cần..."
            rows={3}
            className="text-xs"
          />
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button onClick={handleComplete}>Hoàn thành →</Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run:
```bash
npm run typecheck
```

Expected: no errors. If there are type errors in `updateEyeSection`, adjust the type casting as needed.

- [ ] **Step 3: Run the dev server and visually verify**

Run:
```bash
npm run dev
```

Navigate to a screening visit in the browser. Verify:
- All sections render in the correct order
- Refraction tables show correct columns
- Toggle sections expand/collapse
- Form inputs accept values
- Footer buttons work (Hủy with confirmation, Lưu nháp, Hoàn thành)

- [ ] **Step 4: Commit**

```bash
git add src/components/screening/screening-form.tsx
git commit -m "feat: rewrite screening form as single-page refraction examination"
```

---

### Task 10: Delete obsolete components

**Files:**
- Delete: `src/components/screening/screening-form-initial.tsx`
- Delete: `src/components/screening/screening-form-red-flags.tsx`
- Delete: `src/components/screening/screening-form-questions.tsx`
- Delete: `src/components/screening/screening-step-indicator.tsx`
- Delete: `src/components/screening/screening-step2-summary.tsx`
- Delete: `src/components/screening/screening-step2-group-selector.tsx`
- Delete: `src/components/screening/screening-step2-group-form.tsx`
- Delete: `src/components/screening/screening-step2-dry-eye.tsx`
- Delete: `src/components/screening/screening-step2-osdi-modal.tsx`
- Delete: `src/components/screening/screening-step2-placeholder-group.tsx`

- [ ] **Step 1: Delete all obsolete files**

Run:
```bash
rm src/components/screening/screening-form-initial.tsx
rm src/components/screening/screening-form-red-flags.tsx
rm src/components/screening/screening-form-questions.tsx
rm src/components/screening/screening-step-indicator.tsx
rm src/components/screening/screening-step2-summary.tsx
rm src/components/screening/screening-step2-group-selector.tsx
rm src/components/screening/screening-step2-group-form.tsx
rm src/components/screening/screening-step2-dry-eye.tsx
rm src/components/screening/screening-step2-osdi-modal.tsx
rm src/components/screening/screening-step2-placeholder-group.tsx
```

- [ ] **Step 2: Also delete the now-unused screening-form-notes.tsx**

The notes section is now inline in screening-form.tsx, so the separate component is not needed:

```bash
rm src/components/screening/screening-form-notes.tsx
```

- [ ] **Step 3: Verify no remaining imports reference deleted files**

Run:
```bash
npm run typecheck
```

Expected: no errors. If any other files import deleted components, those imports need to be removed.

- [ ] **Step 4: Verify the app still runs**

Run:
```bash
npm run dev
```

Navigate to a screening visit and confirm everything works.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: delete obsolete screening components (step wizard, disease groups, red flags)"
```

---

### Task 11: Final verification

**Files:** None — verification only

- [ ] **Step 1: Run type check**

Run:
```bash
npm run typecheck
```

Expected: no errors

- [ ] **Step 2: Run linter**

Run:
```bash
npm run lint
```

Expected: no errors (or only pre-existing warnings)

- [ ] **Step 3: Run build**

Run:
```bash
npm run build
```

Expected: build succeeds

- [ ] **Step 4: Visual walkthrough**

Run `npm run dev` and verify the full flow:
1. Navigate to `/screening`
2. Click a patient to open the screening form
3. Verify all 13 sections render in correct order
4. Fill in some refraction values — verify Tab moves between cells
5. Toggle "Liệt điều tiết" ON — verify agent checkboxes and table appear
6. Toggle "Đơn kính" ON — verify pre-fill from subjective refraction values
7. Click "Lưu nháp" — verify toast and navigation back
8. Re-open the same patient — verify saved data persists
9. Click "Hoàn thành" — verify status changes and toast
