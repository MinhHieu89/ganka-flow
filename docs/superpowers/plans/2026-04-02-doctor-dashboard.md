# Doctor Dashboard & Exam View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a doctor-facing module with two screens — a queue dashboard at `/doctor` showing patients ready for examination, and a resizable two-panel exam view at `/doctor/:visitId` for clinical documentation.

**Architecture:** Mirrors intake/screening dashboard patterns. Queue dashboard in `src/pages/doctor/index.tsx`, exam view in `src/pages/doctor/exam.tsx`. Child components in `src/components/doctor/`. New `DoctorContext` for state management (same pattern as `ReceptionistContext`). Extends `Visit` type with `ExamData`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Table, Button, Select, ResizablePanelGroup, Textarea, Input), HugeIcons, react-router

---

### Task 1: Install resizable component and extend data types

**Files:**
- Create: `src/components/ui/resizable.tsx` (via shadcn CLI)
- Modify: `src/data/mock-patients.ts`

- [ ] **Step 1: Install shadcn resizable component**

Run:

```bash
npx shadcn@latest add resizable
```

Expected: Creates `src/components/ui/resizable.tsx` with `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` exports.

- [ ] **Step 2: Add exam-related types to `src/data/mock-patients.ts`**

Add these type definitions after the existing `Step2FormData` interface:

```tsx
export interface Diagnosis {
  text: string
  icd10Code?: string
  isPrimary: boolean
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  notes?: string
}

export interface Procedure {
  name: string
  notes: string
}

export interface OpticalRxData {
  od: { sph: string; cyl: string; axis: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; add: string; pd: string }
}

export interface DryEyeExamData {
  tbutOd: string
  tbutOs: string
  meibomian: string
  staining: string
}

export interface RefractionData {
  od: { sph: string; cyl: string; axis: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; add: string; pd: string }
}

export interface ExamData {
  va: { od: string; os: string }
  iop: { od: string; os: string }
  slitLamp: string
  fundus: string
  refractionExam?: RefractionData
  dryEyeExam?: DryEyeExamData
  diagnoses: Diagnosis[]
  medications: Medication[]
  opticalRx?: OpticalRxData
  procedures: Procedure[]
  followUp?: { date: string; reason: string }
}
```

- [ ] **Step 3: Add `examData` field to the `Visit` interface**

In the existing `Visit` interface, add after the `screeningData` field:

```tsx
  examData?: ExamData
```

- [ ] **Step 4: Add mock visits with `dang_kham` and post-screening `cho_kham` status**

Add to the `mockVisits` array (these are patients who have completed screening and are waiting for the doctor):

```tsx
  {
    id: "v-doc-1",
    patientId: "GK-2026-0042",
    status: "cho_kham",
    source: "hen",
    reason: "Đau mắt đột ngột, nhìn mờ",
    scheduledAt: "14:30",
    checkedInAt: "2026-04-01T13:40:00",
    date: "2026-04-01",
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Đau mắt đột ngột, nhìn mờ",
      ucvaOd: "20/40",
      ucvaOs: "20/25",
      currentRxOd: "",
      currentRxOs: "",
      redFlags: { eyePain: true, suddenVisionLoss: true, asymmetry: false },
      symptoms: { dryEyes: true, gritty: true, blurry: true, tearing: false, itchy: false, headache: false },
      blinkImprovement: "no",
      symptomDuration: 2,
      symptomDurationUnit: "ngày",
      screenTime: "10",
      contactLens: "no",
      discomfortLevel: "severe",
      notes: "",
    },
  },
  {
    id: "v-doc-2",
    patientId: "GK-2026-0038",
    status: "cho_kham",
    source: "walk_in",
    reason: "Khô mắt kéo dài",
    checkedInAt: "2026-04-01T13:47:00",
    date: "2026-04-01",
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Khô mắt kéo dài, cộm rát",
      ucvaOd: "20/20",
      ucvaOs: "20/20",
      currentRxOd: "",
      currentRxOs: "",
      redFlags: { eyePain: false, suddenVisionLoss: false, asymmetry: false },
      symptoms: { dryEyes: true, gritty: true, blurry: false, tearing: true, itchy: false, headache: false },
      blinkImprovement: "yes",
      symptomDuration: 3,
      symptomDurationUnit: "tháng",
      screenTime: "8",
      contactLens: "no",
      discomfortLevel: "moderate",
      notes: "",
      step2: {
        selectedGroups: ["dryEye"],
        groupOrder: ["dryEye"],
        dryEye: {
          osdiScore: 7,
          osdiAnswers: [2, 1, 1, 1, 1, 1],
          osdiSeverity: "moderate",
          tbutOd: "6",
          tbutOs: "7",
          schirmerOd: "8",
          schirmerOs: "9",
          meibomian: "Grade 2",
          staining: "Oxford 1",
        },
      },
    },
  },
  {
    id: "v-doc-3",
    patientId: "GK-2026-0035",
    status: "dang_kham",
    source: "hen",
    reason: "Tái khám khúc xạ",
    scheduledAt: "14:00",
    checkedInAt: "2026-04-01T13:55:00",
    date: "2026-04-01",
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Tái khám khúc xạ, nhìn xa mờ",
      ucvaOd: "20/50",
      ucvaOs: "20/40",
      currentRxOd: "-2.00/-0.50x180",
      currentRxOs: "-1.75/-0.25x170",
      redFlags: { eyePain: false, suddenVisionLoss: false, asymmetry: false },
      symptoms: { dryEyes: false, gritty: false, blurry: true, tearing: false, itchy: false, headache: true },
      blinkImprovement: "no",
      symptomDuration: 6,
      symptomDurationUnit: "tháng",
      screenTime: "6",
      contactLens: "no",
      discomfortLevel: "mild",
      notes: "",
      step2: {
        selectedGroups: ["refraction"],
        groupOrder: ["refraction"],
        dryEye: {
          osdiScore: null,
          osdiAnswers: [null, null, null, null, null, null],
          osdiSeverity: null,
          tbutOd: "",
          tbutOs: "",
          schirmerOd: "",
          schirmerOs: "",
          meibomian: "",
          staining: "",
        },
      },
    },
  },
  {
    id: "v-doc-4",
    patientId: "GK-2026-0044",
    status: "cho_kham",
    source: "hen",
    reason: "Kiểm tra cận thị con",
    scheduledAt: "15:00",
    checkedInAt: "2026-04-01T13:57:00",
    date: "2026-04-01",
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Kiểm tra cận thị tiến triển",
      ucvaOd: "20/60",
      ucvaOs: "20/50",
      currentRxOd: "-3.00/-0.75x180",
      currentRxOs: "-2.75/-0.50x175",
      redFlags: { eyePain: false, suddenVisionLoss: false, asymmetry: false },
      symptoms: { dryEyes: false, gritty: false, blurry: true, tearing: false, itchy: false, headache: false },
      blinkImprovement: "no",
      symptomDuration: 12,
      symptomDurationUnit: "tháng",
      screenTime: "4",
      contactLens: "no",
      discomfortLevel: null,
      notes: "",
    },
  },
  {
    id: "v-doc-5",
    patientId: "GK-2026-0045",
    status: "cho_kham",
    source: "walk_in",
    reason: "Khám tổng quát mắt",
    checkedInAt: "2026-04-01T14:02:00",
    date: "2026-04-01",
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Khám tổng quát, lâu không khám mắt",
      ucvaOd: "20/25",
      ucvaOs: "20/25",
      currentRxOd: "",
      currentRxOs: "",
      redFlags: { eyePain: false, suddenVisionLoss: false, asymmetry: false },
      symptoms: { dryEyes: false, gritty: false, blurry: false, tearing: false, itchy: false, headache: false },
      blinkImprovement: null,
      symptomDuration: 0,
      symptomDurationUnit: "ngày",
      screenTime: "5",
      contactLens: "no",
      discomfortLevel: null,
      notes: "",
    },
  },
```

Also add the corresponding mock patients if they don't already exist. Add to `mockPatients` if missing:

```tsx
  {
    id: "GK-2026-0042",
    name: "Trần Văn Minh",
    gender: "Nam",
    dob: "15/03/1990",
    birthYear: 1990,
    phone: "0901234567",
    occupation: "Kỹ sư phần mềm",
    screenTime: 10,
    createdAt: "2026-03-15",
  },
  {
    id: "GK-2026-0044",
    name: "Phạm Đức Huy",
    gender: "Nam",
    dob: "20/08/2012",
    birthYear: 2012,
    phone: "0912345678",
    createdAt: "2026-03-20",
  },
  {
    id: "GK-2026-0045",
    name: "Vũ Mai Hương",
    gender: "Nữ",
    dob: "05/11/1975",
    birthYear: 1975,
    phone: "0923456789",
    occupation: "Giáo viên",
    createdAt: "2026-03-22",
  },
```

Check if `GK-2026-0038` and `GK-2026-0035` already exist in the mock data. If not, add them similarly.

- [ ] **Step 5: Verify the build passes**

Run:

```bash
npm run typecheck
```

Expected: No type errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/resizable.tsx src/data/mock-patients.ts
git commit -m "feat: add resizable component and doctor exam data types"
```

---

### Task 2: Create DoctorContext

**Files:**
- Create: `src/contexts/doctor-context.tsx`

- [ ] **Step 1: Create the doctor context provider**

Create `src/contexts/doctor-context.tsx`:

```tsx
import { createContext, useContext, type ReactNode } from "react"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Visit, ExamData } from "@/data/mock-patients"

interface DoctorContextType {
  currentDoctor: string
  todayVisits: Visit[]
  startExam: (visitId: string) => void
  saveExamDraft: (visitId: string, examData: ExamData) => void
  completeExam: (visitId: string, examData: ExamData) => void
}

const DoctorContext = createContext<DoctorContextType | null>(null)

export function DoctorProvider({ children }: { children: ReactNode }) {
  const { todayVisits, updateVisitStatus, visits } = useReceptionist()
  const currentDoctor = "BS. Nguyễn Hải"

  const doctorVisits = todayVisits.filter(
    (v) => v.doctorName === currentDoctor
  )

  function startExam(visitId: string) {
    updateVisitStatus(visitId, "dang_kham")
  }

  function saveExamDraft(visitId: string, examData: ExamData) {
    const visit = visits.find((v) => v.id === visitId)
    if (visit) {
      visit.examData = examData
    }
  }

  function completeExam(visitId: string, examData: ExamData) {
    const visit = visits.find((v) => v.id === visitId)
    if (visit) {
      visit.examData = examData
    }
    updateVisitStatus(visitId, "hoan_thanh")
  }

  return (
    <DoctorContext.Provider
      value={{
        currentDoctor,
        todayVisits: doctorVisits,
        startExam,
        saveExamDraft,
        completeExam,
      }}
    >
      {children}
    </DoctorContext.Provider>
  )
}

export function useDoctor() {
  const context = useContext(DoctorContext)
  if (!context) {
    throw new Error("useDoctor must be used within DoctorProvider")
  }
  return context
}
```

- [ ] **Step 2: Verify typecheck passes**

Run:

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/doctor-context.tsx
git commit -m "feat: add DoctorContext for doctor exam state management"
```

---

### Task 3: Add routes, sidebar nav, and site header

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: Create placeholder page files**

Create `src/pages/doctor/index.tsx`:

```tsx
export default function DoctorDashboard() {
  return <div className="flex-1 p-6">Doctor Dashboard placeholder</div>
}
```

Create `src/pages/doctor/exam.tsx`:

```tsx
export default function DoctorExam() {
  return <div className="flex-1 p-6">Doctor Exam placeholder</div>
}
```

- [ ] **Step 2: Add routes in `src/App.tsx`**

Add imports after the existing screening imports:

```tsx
import DoctorDashboard from "@/pages/doctor/index"
import DoctorExam from "@/pages/doctor/exam"
```

Add the `DoctorProvider` import:

```tsx
import { DoctorProvider } from "@/contexts/doctor-context"
```

Wrap the `Routes` block with `DoctorProvider` (inside `ReceptionistProvider`):

```tsx
<ReceptionistProvider>
  <DoctorProvider>
    <SidebarProvider>
      {/* ... existing content ... */}
      <Routes>
        {/* ... existing routes ... */}
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/doctor/:visitId" element={<DoctorExam />} />
      </Routes>
    </SidebarProvider>
  </DoctorProvider>
</ReceptionistProvider>
```

- [ ] **Step 3: Add "Khám bệnh" to sidebar nav in `src/components/app-sidebar.tsx`**

Add `Stethoscope02Icon` to the HugeIcons import:

```tsx
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons"
```

Add the nav item after "Sàng lọc":

```tsx
const navItems = [
  { title: "Tiếp nhận", url: "/intake", icon: UserAdd01Icon },
  { title: "Lịch hẹn", url: "/schedule", icon: Calendar01Icon },
  { title: "Sàng lọc", url: "/screening", icon: Search01Icon },
  { title: "Khám bệnh", url: "/doctor", icon: Stethoscope02Icon },
]
```

- [ ] **Step 4: Add breadcrumb titles in `src/components/site-header.tsx`**

Add to the `pageTitles` object:

```tsx
"/doctor": "Khám bệnh",
```

Add a matcher for the dynamic exam route. After the `isScreeningVisit` line:

```tsx
const isDoctorExam = pathname.match(/^\/doctor\/(.+)$/)
```

Update the `displayTitle` chain to include it:

```tsx
const displayTitle = isEdit
  ? "Sửa thông tin bệnh nhân"
  : isScreeningVisit
    ? "Sàng lọc bệnh nhân"
    : isDoctorExam
      ? "Khám bệnh nhân"
      : pageTitle
```

- [ ] **Step 5: Verify the app runs and navigation works**

Run:

```bash
npm run dev
```

Navigate to `http://localhost:3000/doctor` — should show placeholder. Sidebar should show "Khám bệnh" link. Breadcrumb should show "Khám bệnh".

- [ ] **Step 6: Commit**

```bash
git add src/pages/doctor/index.tsx src/pages/doctor/exam.tsx src/App.tsx src/components/app-sidebar.tsx src/components/site-header.tsx
git commit -m "feat: add doctor routes, sidebar nav, and site header breadcrumbs"
```

---

### Task 4: Build doctor KPI cards

**Files:**
- Create: `src/components/doctor/kpi-cards.tsx`

- [ ] **Step 1: Create KPI cards component**

Create `src/components/doctor/kpi-cards.tsx`:

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Stethoscope02Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"
import { useDoctor } from "@/contexts/doctor-context"
import { useReceptionist } from "@/contexts/receptionist-context"

const kpiConfig = [
  {
    key: "dang_kham",
    label: "Đang khám",
    icon: Stethoscope02Icon,
    colorClass: "text-blue-600",
  },
  {
    key: "cho_kham",
    label: "Đang chờ",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "hoan_thanh",
    label: "Đã khám",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-emerald-600",
  },
  {
    key: "next_appointment",
    label: "Lịch hẹn kế tiếp",
    icon: Calendar01Icon,
    colorClass: "text-violet-600",
  },
] as const

export function DoctorKpiCards() {
  const { todayVisits } = useDoctor()
  const { appointments } = useReceptionist()

  const counts = {
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
  }

  const now = new Date()
  const nextAppt = appointments
    .filter((a) => {
      if (!a.time) return false
      const [h, m] = a.time.split(":").map(Number)
      return h * 60 + m > now.getHours() * 60 + now.getMinutes()
    })
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))[0]

  const nextTime = nextAppt?.time ?? "—"
  const nextSubtitle = nextAppt
    ? (() => {
        const [h, m] = nextAppt.time!.split(":").map(Number)
        const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes())
        return diff > 0 ? `trong ${diff} phút` : ""
      })()
    : ""

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {kpiConfig.map((kpi) => {
        const isNext = kpi.key === "next_appointment"
        const value = isNext
          ? nextTime
          : counts[kpi.key as keyof typeof counts]
        const subtitle = isNext ? nextSubtitle : kpi.key === "hoan_thanh" ? "hôm nay" : ""

        return (
          <div
            key={kpi.key}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </span>
              <HugeiconsIcon
                icon={kpi.icon}
                className="size-[18px] text-muted-foreground/60"
                strokeWidth={1.5}
              />
            </div>
            <div className={`mt-1.5 text-3xl font-bold ${kpi.colorClass}`}>
              {value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {subtitle || "\u00A0"}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/kpi-cards.tsx
git commit -m "feat: add doctor KPI cards component"
```

---

### Task 5: Build doctor status filters

**Files:**
- Create: `src/components/doctor/status-filters.tsx`

- [ ] **Step 1: Create status filters component**

Create `src/components/doctor/status-filters.tsx`:

```tsx
import { cn } from "@/lib/utils"

type DoctorFilter = "all" | "cho_kham" | "dang_kham"

const filters: { key: DoctorFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "cho_kham", label: "Đang chờ" },
  { key: "dang_kham", label: "Đang khám" },
]

interface DoctorStatusFiltersProps {
  activeFilter: DoctorFilter
  onFilterChange: (filter: DoctorFilter) => void
  counts: Record<DoctorFilter, number>
}

export function DoctorStatusFilters({
  activeFilter,
  onFilterChange,
  counts,
}: DoctorStatusFiltersProps) {
  return (
    <div className="flex gap-1">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeFilter === f.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {f.label} {counts[f.key]}
        </button>
      ))}
    </div>
  )
}

export type { DoctorFilter }
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/status-filters.tsx
git commit -m "feat: add doctor status filter tabs"
```

---

### Task 6: Build doctor queue table

**Files:**
- Create: `src/components/doctor/queue-table.tsx`

- [ ] **Step 1: Create queue table component**

Create `src/components/doctor/queue-table.tsx`:

```tsx
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import type { Visit } from "@/data/mock-patients"
import { hasRedFlag } from "@/lib/red-flags"

const DISEASE_GROUP_LABELS: Record<string, string> = {
  dryEye: "Khô mắt",
  refraction: "Khúc xạ",
  myopiaControl: "Cận thị",
  general: "Tổng quát",
}

function getDiseaseGroupLabel(visit: Visit): string {
  const groups = visit.screeningData?.step2?.selectedGroups
  if (!groups || groups.length === 0) return ""
  return DISEASE_GROUP_LABELS[groups[0]] ?? ""
}

function getWaitMinutes(checkedInAt?: string): number | null {
  if (!checkedInAt) return null
  const diff = Date.now() - new Date(checkedInAt).getTime()
  return Math.floor(diff / 60000)
}

interface DoctorQueueTableProps {
  visits: Visit[]
  page: number
  pageSize: number
}

export function DoctorQueueTable({
  visits,
  page,
  pageSize,
}: DoctorQueueTableProps) {
  const navigate = useNavigate()
  const { getPatient } = useReceptionist()
  const { startExam } = useDoctor()

  const sorted = [...visits].sort((a, b) => {
    const aFlag = hasRedFlag(a.reason, a.screeningData?.chiefComplaint)
    const bFlag = hasRedFlag(b.reason, b.screeningData?.chiefComplaint)
    if (aFlag && !bFlag) return -1
    if (!aFlag && bFlag) return 1
    const aWait = getWaitMinutes(a.checkedInAt) ?? 0
    const bWait = getWaitMinutes(b.checkedInAt) ?? 0
    return bWait - aWait
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function handleStartExam(visit: Visit) {
    if (visit.status === "cho_kham") {
      startExam(visit.id)
    }
    navigate(`/doctor/${visit.id}`)
  }

  let waitingIndex = 0

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-xs">STT</TableHead>
            <TableHead className="text-xs">Bệnh nhân</TableHead>
            <TableHead className="w-20 text-xs">Năm sinh</TableHead>
            <TableHead className="w-[120px] text-xs">Thời gian chờ</TableHead>
            <TableHead className="w-28 text-xs">Trạng thái</TableHead>
            <TableHead className="w-16 text-xs" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((visit) => {
            const patient = getPatient(visit.patientId)
            const flagged = hasRedFlag(
              visit.reason,
              visit.screeningData?.chiefComplaint
            )
            const isExamining = visit.status === "dang_kham"
            const waitMinutes = getWaitMinutes(visit.checkedInAt)
            const diseaseGroup = getDiseaseGroupLabel(visit)

            if (!isExamining) waitingIndex++

            return (
              <TableRow
                key={visit.id}
                className={
                  flagged
                    ? "bg-red-50 dark:bg-red-950/20"
                    : isExamining
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                }
              >
                <TableCell className="text-muted-foreground">
                  {isExamining ? "—" : waitingIndex}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {patient?.name ?? "—"}
                        </span>
                        {flagged && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                                <HugeiconsIcon
                                  icon={Alert01Icon}
                                  className="size-3"
                                  strokeWidth={2}
                                />
                                Cờ đỏ
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Cờ đỏ — cần ưu tiên
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {visit.patientId}
                        {diseaseGroup && ` · ${diseaseGroup}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{patient?.birthYear ?? "—"}</TableCell>
                <TableCell>
                  {isExamining ? (
                    <span className="font-medium text-blue-600">
                      Đang khám
                    </span>
                  ) : waitMinutes !== null ? (
                    <span
                      className={
                        waitMinutes >= 30
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {waitMinutes} phút
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      isExamining ? "text-blue-600" : "text-amber-500"
                    }`}
                  >
                    {isExamining ? "Đang khám" : "Đang chờ"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={flagged || isExamining ? "default" : "outline"}
                    onClick={() => handleStartExam(visit)}
                  >
                    {isExamining ? "Tiếp tục" : "Khám"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck**

Run:

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/queue-table.tsx
git commit -m "feat: add doctor queue table with red flag sorting"
```

---

### Task 7: Assemble doctor dashboard page

**Files:**
- Modify: `src/pages/doctor/index.tsx`

- [ ] **Step 1: Replace placeholder with full dashboard page**

Replace `src/pages/doctor/index.tsx` with:

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { useDoctor } from "@/contexts/doctor-context"
import { DoctorKpiCards } from "@/components/doctor/kpi-cards"
import {
  DoctorStatusFilters,
  type DoctorFilter,
} from "@/components/doctor/status-filters"
import { DoctorQueueTable } from "@/components/doctor/queue-table"

export default function DoctorDashboard() {
  const { todayVisits } = useDoctor()
  const [filter, setFilter] = useState<DoctorFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queueVisits = todayVisits.filter(
    (v) => v.status === "cho_kham" || v.status === "dang_kham"
  )

  const filtered =
    filter === "all"
      ? queueVisits
      : queueVisits.filter((v) => v.status === filter)

  const counts: Record<DoctorFilter, number> = {
    all: queueVisits.length,
    cho_kham: queueVisits.filter((v) => v.status === "cho_kham").length,
    dang_kham: queueVisits.filter((v) => v.status === "dang_kham").length,
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const from = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered.length)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
          Làm mới
        </Button>
      </div>

      <DoctorKpiCards />

      <DoctorStatusFilters
        activeFilter={filter}
        onFilterChange={(f) => {
          setFilter(f)
          setPage(1)
        }}
        counts={counts}
      />

      <DoctorQueueTable
        visits={filtered}
        page={page}
        pageSize={pageSize}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {from}–{to} trên {filtered.length} bệnh nhân
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the dashboard renders**

Run:

```bash
npm run dev
```

Navigate to `http://localhost:3000/doctor`. Should show KPI cards, filter tabs, queue table with mock data, and pagination.

- [ ] **Step 3: Commit**

```bash
git add src/pages/doctor/index.tsx
git commit -m "feat: assemble doctor queue dashboard page"
```

---

### Task 8: Build patient panel (left panel of exam view)

**Files:**
- Create: `src/components/doctor/patient-panel.tsx`

- [ ] **Step 1: Create the patient info panel**

Create `src/components/doctor/patient-panel.tsx`:

```tsx
import type { Patient, Visit } from "@/data/mock-patients"

interface PatientPanelProps {
  patient: Patient
  visit: Visit
}

export function PatientPanel({ patient, visit }: PatientPanelProps) {
  const screening = visit.screeningData
  const redFlags = screening?.redFlags
  const hasFlags =
    redFlags?.eyePain || redFlags?.suddenVisionLoss || redFlags?.asymmetry
  const age = new Date().getFullYear() - patient.birthYear

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      {/* Patient Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-bold">{patient.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {patient.id} · {patient.gender} · {patient.birthYear} ({age}t)
            </div>
          </div>
          {hasFlags && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              Cờ đỏ
            </span>
          )}
        </div>
      </div>

      {/* Chief Complaint */}
      {screening?.chiefComplaint && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lý do khám
          </div>
          <div className="mt-1 text-sm">{screening.chiefComplaint}</div>
        </div>
      )}

      {/* Red Flags */}
      {hasFlags && (
        <div className="border-b border-border/50 bg-red-50 px-4 py-3 dark:bg-red-950/20">
          <div className="text-xs font-medium uppercase tracking-wide text-red-600">
            Cờ đỏ
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            {redFlags?.eyePain && (
              <div className="text-xs text-red-600">• Đau mắt</div>
            )}
            {redFlags?.suddenVisionLoss && (
              <div className="text-xs text-red-600">
                • Giảm thị lực đột ngột
              </div>
            )}
            {redFlags?.asymmetry && (
              <div className="text-xs text-red-600">
                • Bất đối xứng hai mắt
              </div>
            )}
          </div>
        </div>
      )}

      {/* UCVA */}
      {(screening?.ucvaOd || screening?.ucvaOs) && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            UCVA
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">OD (Phải)</div>
              <div className="text-sm font-semibold">
                {screening?.ucvaOd || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">OS (Trái)</div>
              <div className="text-sm font-semibold">
                {screening?.ucvaOs || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screening Symptoms */}
      {screening && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Triệu chứng sàng lọc
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            <div className="text-xs">
              • Khô/cộm/kích ứng:{" "}
              <strong>
                {screening.symptoms.dryEyes || screening.symptoms.gritty
                  ? "Có"
                  : "Không"}
              </strong>
            </div>
            <div className="text-xs">
              • Mờ sau chớp mắt:{" "}
              <strong>
                {screening.blinkImprovement === "yes" ? "Có" : "Không"}
              </strong>
            </div>
            <div className="text-xs">
              • Thời gian màn hình:{" "}
              <strong>{screening.screenTime}h/ngày</strong>
            </div>
          </div>
        </div>
      )}

      {/* Current Glasses Rx */}
      <div className="px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Kính đang đeo
        </div>
        {screening?.currentRxOd || screening?.currentRxOs ? (
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">OD</div>
              <div className="text-sm font-semibold">
                {screening?.currentRxOd}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">OS</div>
              <div className="text-sm font-semibold">
                {screening?.currentRxOs}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-xs italic text-muted-foreground">
            Không đeo kính
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/patient-panel.tsx
git commit -m "feat: add patient info panel for exam left side"
```

---

### Task 9: Build screening data block (read-only with edit toggle)

**Files:**
- Create: `src/components/doctor/screening-data.tsx`

- [ ] **Step 1: Create the screening data component**

Create `src/components/doctor/screening-data.tsx`:

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Visit, DryEyeFormData } from "@/data/mock-patients"

interface ScreeningDataProps {
  visit: Visit
  onUpdateScreeningData?: (data: DryEyeFormData) => void
}

export function ScreeningData({ visit }: ScreeningDataProps) {
  const [isEditing, setIsEditing] = useState(false)
  const step2 = visit.screeningData?.step2
  const groups = step2?.selectedGroups ?? []

  if (groups.length === 0) return null

  const isDryEye = groups.includes("dryEye")
  const isRefraction = groups.includes("refraction")
  const isMyopia = groups.includes("myopiaControl")
  const isGeneral = groups.includes("general")

  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Dữ liệu sàng lọc</div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Xong" : "Chỉnh sửa"}
        </Button>
      </div>

      {isDryEye && (
        <DryEyeScreeningBlock
          data={step2!.dryEye}
          isEditing={isEditing}
        />
      )}

      {isRefraction && (
        <RefractionScreeningBlock
          screening={visit.screeningData!}
          isEditing={isEditing}
        />
      )}

      {(isMyopia || isGeneral) && (
        <GeneralScreeningBlock
          screening={visit.screeningData!}
          isEditing={isEditing}
        />
      )}
    </div>
  )
}

function DryEyeScreeningBlock({
  data,
  isEditing,
}: {
  data: DryEyeFormData
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="OSDI-6"
        value={
          data.osdiScore !== null ? `${data.osdiScore} (${data.osdiSeverity})` : "—"
        }
        isEditing={isEditing}
      />
      <div />
      <Field
        label="TBUT OD"
        value={data.tbutOd ? `${data.tbutOd}s` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="TBUT OS"
        value={data.tbutOs ? `${data.tbutOs}s` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Schirmer OD"
        value={data.schirmerOd ? `${data.schirmerOd}mm` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Schirmer OS"
        value={data.schirmerOs ? `${data.schirmerOs}mm` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Meibomian"
        value={data.meibomian || "—"}
        isEditing={isEditing}
      />
      <Field
        label="Staining"
        value={data.staining || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function RefractionScreeningBlock({
  screening,
  isEditing,
}: {
  screening: { currentRxOd: string; currentRxOs: string }
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="Kính hiện tại OD"
        value={screening.currentRxOd || "—"}
        isEditing={isEditing}
      />
      <Field
        label="Kính hiện tại OS"
        value={screening.currentRxOs || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function GeneralScreeningBlock({
  screening,
  isEditing,
}: {
  screening: { ucvaOd: string; ucvaOs: string }
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="UCVA OD"
        value={screening.ucvaOd || "—"}
        isEditing={isEditing}
      />
      <Field
        label="UCVA OS"
        value={screening.ucvaOs || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function Field({
  label,
  value,
  isEditing,
}: {
  label: string
  value: string
  isEditing: boolean
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {isEditing ? (
        <Input
          className="mt-1 h-8 text-sm"
          defaultValue={value === "—" ? "" : value}
        />
      ) : (
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/screening-data.tsx
git commit -m "feat: add read-only screening data block with edit toggle"
```

---

### Task 10: Build exam findings form

**Files:**
- Create: `src/components/doctor/exam-findings.tsx`

- [ ] **Step 1: Create exam findings component**

Create `src/components/doctor/exam-findings.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ExamData, DiseaseGroup } from "@/data/mock-patients"

interface ExamFindingsProps {
  examData: ExamData
  diseaseGroups: DiseaseGroup[]
  onChange: (data: ExamData) => void
}

export function ExamFindings({
  examData,
  diseaseGroups,
  onChange,
}: ExamFindingsProps) {
  const isDryEye = diseaseGroups.includes("dryEye")
  const isRefraction =
    diseaseGroups.includes("refraction") ||
    diseaseGroups.includes("myopiaControl")

  function updateField<K extends keyof ExamData>(
    key: K,
    value: ExamData[K]
  ) {
    onChange({ ...examData, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Khám lâm sàng</div>

      {/* VA */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Thị lực (VA)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">OD (Phải)</label>
            <Input
              className="mt-1 h-9"
              placeholder="20/"
              value={examData.va.od}
              onChange={(e) =>
                updateField("va", { ...examData.va, od: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OS (Trái)</label>
            <Input
              className="mt-1 h-9"
              placeholder="20/"
              value={examData.va.os}
              onChange={(e) =>
                updateField("va", { ...examData.va, os: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* IOP */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Nhãn áp (IOP)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">OD (mmHg)</label>
            <Input
              className="mt-1 h-9"
              value={examData.iop.od}
              onChange={(e) =>
                updateField("iop", { ...examData.iop, od: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OS (mmHg)</label>
            <Input
              className="mt-1 h-9"
              value={examData.iop.os}
              onChange={(e) =>
                updateField("iop", { ...examData.iop, os: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Refraction (adaptive) */}
      {isRefraction && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Khúc xạ (Refraction)
          </div>
          <div className="mb-2 text-xs text-muted-foreground">OD (Phải)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">SPH</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.sph ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      sph: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CYL</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.cyl ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      cyl: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">AXIS</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.axis ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      axis: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="mb-2 mt-3 text-xs text-muted-foreground">
            OS (Trái)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">SPH</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.sph ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      sph: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CYL</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.cyl ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      cyl: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">AXIS</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.axis ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      axis: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Dry Eye adaptive fields */}
      {isDryEye && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Khô mắt — Đo lại
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">
                TBUT OD (s)
              </label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.tbutOd ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    tbutOd: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                TBUT OS (s)
              </label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.tbutOs ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    tbutOs: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                Meibomian
              </label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.meibomian ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    meibomian: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Staining</label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.staining ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    staining: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Slit-lamp */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Sinh hiển vi (Slit-lamp)
        </div>
        <Textarea
          placeholder="Ghi chú..."
          rows={3}
          value={examData.slitLamp}
          onChange={(e) => updateField("slitLamp", e.target.value)}
        />
      </div>

      {/* Fundus */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Soi đáy mắt (Fundus)
        </div>
        <Textarea
          placeholder="Ghi chú..."
          rows={3}
          value={examData.fundus}
          onChange={(e) => updateField("fundus", e.target.value)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/exam-findings.tsx
git commit -m "feat: add adaptive exam findings form"
```

---

### Task 11: Build diagnosis input

**Files:**
- Create: `src/components/doctor/diagnosis-input.tsx`
- Create: `src/data/diagnoses.ts`

- [ ] **Step 1: Create the diagnosis catalog**

Create `src/data/diagnoses.ts`:

```tsx
export interface DiagnosisCatalogEntry {
  text: string
  icd10: string
}

export const diagnosisCatalog: DiagnosisCatalogEntry[] = [
  { text: "Khô mắt (Dry eye syndrome)", icd10: "H04.1" },
  { text: "Viêm bờ mi (Blepharitis)", icd10: "H01.0" },
  { text: "Viêm kết mạc dị ứng", icd10: "H10.1" },
  { text: "Cận thị (Myopia)", icd10: "H52.1" },
  { text: "Viễn thị (Hypermetropia)", icd10: "H52.0" },
  { text: "Loạn thị (Astigmatism)", icd10: "H52.2" },
  { text: "Lão thị (Presbyopia)", icd10: "H52.4" },
  { text: "Đục thủy tinh thể (Cataract)", icd10: "H25.9" },
  { text: "Tăng nhãn áp (Glaucoma)", icd10: "H40.9" },
  { text: "Thoái hóa hoàng điểm", icd10: "H35.3" },
  { text: "Bệnh võng mạc tiểu đường", icd10: "H36.0" },
  { text: "Viêm giác mạc (Keratitis)", icd10: "H16.9" },
  { text: "Chắp (Chalazion)", icd10: "H00.1" },
  { text: "Lẹo (Hordeolum)", icd10: "H00.0" },
  { text: "Xuất huyết kết mạc", icd10: "H11.3" },
]
```

- [ ] **Step 2: Create the diagnosis input component**

Create `src/components/doctor/diagnosis-input.tsx`:

```tsx
import { useState, useRef, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { diagnosisCatalog } from "@/data/diagnoses"
import type { Diagnosis } from "@/data/mock-patients"

interface DiagnosisInputProps {
  diagnoses: Diagnosis[]
  onChange: (diagnoses: Diagnosis[]) => void
}

export function DiagnosisInput({ diagnoses, onChange }: DiagnosisInputProps) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    return diagnosisCatalog.filter(
      (d) =>
        d.text.toLowerCase().includes(q) ||
        d.icd10.toLowerCase().includes(q)
    )
  }, [query])

  function addFromCatalog(entry: { text: string; icd10: string }) {
    const isPrimary = diagnoses.length === 0
    onChange([
      ...diagnoses,
      { text: entry.text, icd10Code: entry.icd10, isPrimary },
    ])
    setQuery("")
    setShowDropdown(false)
  }

  function addFreeText() {
    if (!query.trim()) return
    const isPrimary = diagnoses.length === 0
    onChange([...diagnoses, { text: query.trim(), isPrimary }])
    setQuery("")
    setShowDropdown(false)
  }

  function removeDiagnosis(index: number) {
    const updated = diagnoses.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((d) => d.isPrimary)) {
      updated[0].isPrimary = true
    }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Chẩn đoán</div>

      {/* Existing diagnoses */}
      {diagnoses.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {d.isPrimary ? "Chính" : "Phụ"}
          </span>
          <span className="flex-1 text-sm">{d.text}</span>
          {d.icd10Code && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {d.icd10Code}
            </span>
          )}
          <button
            onClick={() => removeDiagnosis(i)}
            className="text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
          </button>
        </div>
      ))}

      {/* Search input */}
      <div ref={ref} className="relative">
        <Input
          placeholder="Tìm chẩn đoán hoặc nhập tự do..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length === 0 && query.trim()) {
              addFreeText()
            }
          }}
        />
        <div className="mt-1 text-xs text-muted-foreground">
          ICD-10 sẽ tự động gắn khi chọn từ danh sách
        </div>

        {showDropdown && query.length >= 2 && (
          <div className="absolute top-10 z-50 w-full rounded-md border border-border bg-popover shadow-md">
            {results.length > 0 ? (
              results.map((entry) => (
                <button
                  key={entry.icd10}
                  onClick={() => addFromCatalog(entry)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span>{entry.text}</span>
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {entry.icd10}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2">
                <div className="text-sm text-muted-foreground">
                  Không tìm thấy.{" "}
                  <Button
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    onClick={addFreeText}
                  >
                    Thêm "{query}" dạng tự do
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/diagnoses.ts src/components/doctor/diagnosis-input.tsx
git commit -m "feat: add hybrid diagnosis input with ICD-10 catalog"
```

---

### Task 12: Build treatment plan (add-as-needed sections)

**Files:**
- Create: `src/components/doctor/treatment-plan.tsx`

- [ ] **Step 1: Create the treatment plan component**

Create `src/components/doctor/treatment-plan.tsx`:

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import type { ExamData, Medication, Procedure } from "@/data/mock-patients"

interface TreatmentPlanProps {
  examData: ExamData
  onChange: (data: ExamData) => void
}

type PlanSection = "medication" | "optical" | "procedure" | "followUp"

export function TreatmentPlan({ examData, onChange }: TreatmentPlanProps) {
  const [openSections, setOpenSections] = useState<Set<PlanSection>>(new Set())

  function toggleSection(section: PlanSection) {
    const next = new Set(openSections)
    if (next.has(section)) {
      next.delete(section)
      // Clear data when removing section
      if (section === "medication")
        onChange({ ...examData, medications: [] })
      if (section === "optical")
        onChange({ ...examData, opticalRx: undefined })
      if (section === "procedure")
        onChange({ ...examData, procedures: [] })
      if (section === "followUp")
        onChange({ ...examData, followUp: undefined })
    } else {
      next.add(section)
    }
    setOpenSections(next)
  }

  function addMedication() {
    onChange({
      ...examData,
      medications: [
        ...examData.medications,
        { name: "", dosage: "", frequency: "", duration: "" },
      ],
    })
  }

  function updateMedication(index: number, med: Medication) {
    const meds = [...examData.medications]
    meds[index] = med
    onChange({ ...examData, medications: meds })
  }

  function removeMedication(index: number) {
    onChange({
      ...examData,
      medications: examData.medications.filter((_, i) => i !== index),
    })
  }

  function addProcedure() {
    onChange({
      ...examData,
      procedures: [...examData.procedures, { name: "", notes: "" }],
    })
  }

  function updateProcedure(index: number, proc: Procedure) {
    const procs = [...examData.procedures]
    procs[index] = proc
    onChange({ ...examData, procedures: procs })
  }

  function removeProcedure(index: number) {
    onChange({
      ...examData,
      procedures: examData.procedures.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Kế hoạch điều trị</div>

      {/* Add buttons for closed sections */}
      <div className="flex flex-wrap gap-2">
        {!openSections.has("medication") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("medication")}
          >
            + Thuốc
          </Button>
        )}
        {!openSections.has("optical") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("optical")}
          >
            + Kính (Rx)
          </Button>
        )}
        {!openSections.has("procedure") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("procedure")}
          >
            + Thủ thuật
          </Button>
        )}
        {!openSections.has("followUp") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("followUp")}
          >
            + Tái khám
          </Button>
        )}
      </div>

      {/* Medication Section */}
      {openSections.has("medication") && (
        <SectionWrapper
          title="Thuốc"
          onRemove={() => toggleSection("medication")}
        >
          {examData.medications.map((med, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Tên thuốc"
                value={med.name}
                onChange={(e) =>
                  updateMedication(i, { ...med, name: e.target.value })
                }
              />
              <Input
                placeholder="Liều lượng"
                value={med.dosage}
                onChange={(e) =>
                  updateMedication(i, { ...med, dosage: e.target.value })
                }
              />
              <Input
                placeholder="Tần suất"
                value={med.frequency}
                onChange={(e) =>
                  updateMedication(i, { ...med, frequency: e.target.value })
                }
              />
              <div className="flex gap-1">
                <Input
                  placeholder="Thời gian"
                  value={med.duration}
                  onChange={(e) =>
                    updateMedication(i, { ...med, duration: e.target.value })
                  }
                />
                <button
                  onClick={() => removeMedication(i)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addMedication}>
            + Thêm thuốc
          </Button>
        </SectionWrapper>
      )}

      {/* Optical Rx Section */}
      {openSections.has("optical") && (
        <SectionWrapper
          title="Kính (Rx)"
          onRemove={() => toggleSection("optical")}
        >
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">OD (Phải)</div>
            <div className="grid grid-cols-5 gap-2">
              {(["sph", "cyl", "axis", "add", "pd"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs uppercase text-muted-foreground">
                    {field}
                  </label>
                  <Input
                    className="mt-1 h-8"
                    value={examData.opticalRx?.od[field] ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...examData,
                        opticalRx: {
                          od: {
                            ...(examData.opticalRx?.od ?? {
                              sph: "",
                              cyl: "",
                              axis: "",
                              add: "",
                              pd: "",
                            }),
                            [field]: e.target.value,
                          },
                          os: examData.opticalRx?.os ?? {
                            sph: "",
                            cyl: "",
                            axis: "",
                            add: "",
                            pd: "",
                          },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">OS (Trái)</div>
            <div className="grid grid-cols-5 gap-2">
              {(["sph", "cyl", "axis", "add", "pd"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs uppercase text-muted-foreground">
                    {field}
                  </label>
                  <Input
                    className="mt-1 h-8"
                    value={examData.opticalRx?.os[field] ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...examData,
                        opticalRx: {
                          od: examData.opticalRx?.od ?? {
                            sph: "",
                            cyl: "",
                            axis: "",
                            add: "",
                            pd: "",
                          },
                          os: {
                            ...(examData.opticalRx?.os ?? {
                              sph: "",
                              cyl: "",
                              axis: "",
                              add: "",
                              pd: "",
                            }),
                            [field]: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* Procedure Section */}
      {openSections.has("procedure") && (
        <SectionWrapper
          title="Thủ thuật"
          onRemove={() => toggleSection("procedure")}
        >
          {examData.procedures.map((proc, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Tên thủ thuật"
                  value={proc.name}
                  onChange={(e) =>
                    updateProcedure(i, { ...proc, name: e.target.value })
                  }
                />
                <button
                  onClick={() => removeProcedure(i)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              </div>
              <Textarea
                placeholder="Ghi chú..."
                rows={2}
                value={proc.notes}
                onChange={(e) =>
                  updateProcedure(i, { ...proc, notes: e.target.value })
                }
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addProcedure}>
            + Thêm thủ thuật
          </Button>
        </SectionWrapper>
      )}

      {/* Follow-up Section */}
      {openSections.has("followUp") && (
        <SectionWrapper
          title="Tái khám"
          onRemove={() => toggleSection("followUp")}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Ngày</label>
              <Input
                type="date"
                className="mt-1"
                value={examData.followUp?.date ?? ""}
                onChange={(e) =>
                  onChange({
                    ...examData,
                    followUp: {
                      date: e.target.value,
                      reason: examData.followUp?.reason ?? "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Lý do</label>
              <Input
                className="mt-1"
                placeholder="Lý do tái khám..."
                value={examData.followUp?.reason ?? ""}
                onChange={(e) =>
                  onChange({
                    ...examData,
                    followUp: {
                      date: examData.followUp?.date ?? "",
                      reason: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </SectionWrapper>
      )}
    </div>
  )
}

function SectionWrapper({
  title,
  onRemove,
  children,
}: {
  title: string
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </div>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/treatment-plan.tsx
git commit -m "feat: add treatment plan with add-as-needed sections"
```

---

### Task 13: Assemble the exam view page

**Files:**
- Modify: `src/pages/doctor/exam.tsx`

- [ ] **Step 1: Replace placeholder with full exam page**

Replace `src/pages/doctor/exam.tsx` with:

```tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import { PatientPanel } from "@/components/doctor/patient-panel"
import { ScreeningData } from "@/components/doctor/screening-data"
import { ExamFindings } from "@/components/doctor/exam-findings"
import { DiagnosisInput } from "@/components/doctor/diagnosis-input"
import { TreatmentPlan } from "@/components/doctor/treatment-plan"
import type { ExamData } from "@/data/mock-patients"

const EMPTY_EXAM: ExamData = {
  va: { od: "", os: "" },
  iop: { od: "", os: "" },
  slitLamp: "",
  fundus: "",
  diagnoses: [],
  medications: [],
  procedures: [],
}

export default function DoctorExam() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const { visits, getPatient } = useReceptionist()
  const { startExam, saveExamDraft, completeExam } = useDoctor()

  const visit = visits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  const [examData, setExamData] = useState<ExamData>(
    visit?.examData ?? EMPTY_EXAM
  )

  useEffect(() => {
    if (visit && visit.status === "cho_kham") {
      startExam(visit.id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visit || !patient) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Không tìm thấy lượt khám
      </div>
    )
  }

  const diseaseGroups =
    visit.screeningData?.step2?.selectedGroups ?? []

  function handleSaveDraft() {
    saveExamDraft(visit!.id, examData)
  }

  function handleComplete() {
    completeExam(visit!.id, examData)
    navigate("/doctor")
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/doctor")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Button>
        <div className="text-sm font-medium">
          Khám bệnh — {patient.name} · {visit.patientId}
        </div>
      </div>

      {/* Resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={20}>
          <PatientPanel patient={patient} visit={visit} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Screening data (read-only with edit) */}
              <ScreeningData visit={visit} />

              {/* Exam findings */}
              <div className="border-t border-border pt-4">
                <ExamFindings
                  examData={examData}
                  diseaseGroups={diseaseGroups}
                  onChange={setExamData}
                />
              </div>

              {/* Diagnosis */}
              <div className="border-t border-border pt-4">
                <DiagnosisInput
                  diagnoses={examData.diagnoses}
                  onChange={(diagnoses) =>
                    setExamData({ ...examData, diagnoses })
                  }
                />
              </div>

              {/* Treatment Plan */}
              <div className="border-t border-border pt-4">
                <TreatmentPlan
                  examData={examData}
                  onChange={setExamData}
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background px-5 py-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleComplete}>Hoàn tất khám</Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
```

- [ ] **Step 2: Verify the full flow works**

Run:

```bash
npm run dev
```

1. Navigate to `http://localhost:3000/doctor`
2. Click "Khám" on a patient row
3. Should navigate to exam view with resizable panels
4. Left panel shows patient info + screening
5. Right panel shows screening data block, exam form, diagnosis, treatment plan
6. Drag the divider to resize panels
7. Click "Hoàn tất khám" — should return to queue

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/doctor/exam.tsx
git commit -m "feat: assemble doctor exam view with resizable panels"
```

---

### Task 14: Format and final verification

**Files:**
- All new files

- [ ] **Step 1: Run formatter**

```bash
npm run format
```

- [ ] **Step 2: Run linter**

```bash
npm run lint
```

Fix any issues reported.

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: format doctor dashboard components"
```
