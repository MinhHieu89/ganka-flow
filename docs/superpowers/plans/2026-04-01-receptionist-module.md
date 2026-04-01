# Receptionist Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full receptionist module UI — dashboard, intake form, check-in modals, and appointment booking — with static mock data and local state.

**Architecture:** 4 page routes + 3 dashboard modals. Shared mock data layer with React context for state. Components follow existing shadcn/ui + Tailwind patterns. No backend.

**Tech Stack:** React 19, TypeScript 5.9, React Router 7, shadcn/ui (radix-vega), Tailwind CSS v4, hugeicons

**Spec:** `docs/superpowers/specs/2026-04-01-receptionist-module-design.md`

---

## File Structure

```
src/data/
  mock-patients.ts           → Patient type + mock data array
  mock-appointments.ts       → Appointment type + mock data array + time slot helpers

src/contexts/
  receptionist-context.tsx   → React context: patients, appointments, visits, CRUD actions

src/pages/intake/
  index.tsx                  → Dashboard (replaces src/pages/intake.tsx)
  new.tsx                    → Intake form (new patient)
  edit.tsx                   → Intake form (edit patient, reads :id from URL)

src/pages/schedule/
  new.tsx                    → Appointment booking form

src/components/receptionist/
  kpi-cards.tsx              → 5 KPI stat cards
  patient-table.tsx          → Sortable patient table with columns
  status-filters.tsx         → Tab-style filter bar
  patient-search.tsx         → Search input with autocomplete dropdown
  action-menu.tsx            → ⋮ dropdown menu per row
  checkin-modal.tsx          → Check-in modals A (complete) & B (incomplete)
  walkin-modal.tsx           → Walk-in existing patient modal C
  intake-form.tsx            → Shared form component for new + edit
  appointment-calendar.tsx   → Month calendar picker
  appointment-slots.tsx      → Time slot grid (sáng/chiều)
  confirmation-bar.tsx       → Purple confirmation footer for appointments
```

---

### Task 1: Install Missing shadcn Components

**Files:**
- Modify: `package.json` (dependencies added by shadcn CLI)
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/select.tsx`
- Create: `src/components/ui/textarea.tsx`
- Create: `src/components/ui/table.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/label.tsx`
- Create: `src/components/ui/popover.tsx`
- Create: `src/components/ui/calendar.tsx`
- Create: `src/components/ui/tabs.tsx`

- [ ] **Step 1: Add shadcn components**

```bash
npx shadcn@latest add dialog select textarea table badge label popover calendar tabs
```

Accept all defaults when prompted. This adds the UI primitives needed for modals, forms, tables, and the appointment calendar.

- [ ] **Step 2: Verify build passes**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ package.json package-lock.json
git commit -m "feat: add shadcn dialog, select, textarea, table, badge, label, popover, calendar, tabs"
```

---

### Task 2: Mock Data Layer

**Files:**
- Create: `src/data/mock-patients.ts`
- Create: `src/data/mock-appointments.ts`

- [ ] **Step 1: Create patient types and mock data**

Create `src/data/mock-patients.ts`:

```typescript
export type PatientStatus =
  | "chua_den"
  | "cho_kham"
  | "dang_sang_loc"
  | "dang_kham"
  | "hoan_thanh"
  | "da_huy"

export type PatientSource = "hen" | "walk_in"

export interface Patient {
  id: string // GK-YYYY-NNNN
  name: string
  gender: "Nam" | "Nữ" | "Khác"
  dob: string // dd/mm/yyyy
  birthYear: number
  phone: string
  email?: string
  address?: string
  occupation?: string
  cccd?: string
  chiefComplaint?: string
  eyeHistory?: string
  systemicHistory?: string
  currentMedications?: string
  allergies?: string
  screenTime?: number
  workEnvironment?: string
  contactLens?: string
  lifestyleNotes?: string
  createdAt: string // ISO date
}

export interface Visit {
  id: string
  patientId: string
  status: PatientStatus
  source: PatientSource
  reason?: string
  scheduledAt?: string // HH:mm
  checkedInAt?: string // ISO datetime
  date: string // yyyy-mm-dd
  doctorName?: string
  lastVisitDate?: string
  lastVisitDiagnosis?: string
  lastVisitDoctor?: string
}

export const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; color: string }
> = {
  chua_den: { label: "Chưa đến", color: "text-purple-600" },
  cho_kham: { label: "Chờ khám", color: "text-amber-500" },
  dang_sang_loc: { label: "Đang sàng lọc", color: "text-sky-500" },
  dang_kham: { label: "Đang khám", color: "text-blue-600" },
  hoan_thanh: { label: "Hoàn thành", color: "text-emerald-600" },
  da_huy: { label: "Đã hủy", color: "text-gray-500" },
}

export const SOURCE_CONFIG: Record<
  PatientSource,
  { label: string; color: string }
> = {
  hen: { label: "Hẹn", color: "text-purple-600" },
  walk_in: { label: "Walk-in", color: "text-rose-500" },
}

let patientCounter = 6

export function generatePatientId(): string {
  const year = new Date().getFullYear()
  const id = `GK-${year}-${String(patientCounter).padStart(4, "0")}`
  patientCounter++
  return id
}

export const mockPatients: Patient[] = [
  {
    id: "GK-2026-0001",
    name: "Nguyễn Văn An",
    gender: "Nam",
    dob: "15/03/1985",
    birthYear: 1985,
    phone: "0912345678",
    occupation: "Kỹ sư phần mềm",
    address: "123 Phố Huế, Hai Bà Trưng, Hà Nội",
    screenTime: 10,
    workEnvironment: "Văn phòng",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "GK-2026-0002",
    name: "Trần Thị Bình",
    gender: "Nữ",
    dob: "22/07/1992",
    birthYear: 1992,
    phone: "0987654321",
    email: "binh.tran@email.com",
    occupation: "Nhân viên văn phòng",
    address: "45 Kim Mã, Ba Đình, Hà Nội",
    chiefComplaint: "Khô mắt, mỏi mắt",
    eyeHistory: "Cận thị từ nhỏ",
    allergies: "Penicillin",
    screenTime: 8,
    workEnvironment: "Văn phòng",
    contactLens: "Thỉnh thoảng",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "GK-2026-0003",
    name: "Lê Hoàng Cường",
    gender: "Nam",
    dob: "10/11/1978",
    birthYear: 1978,
    phone: "0901234567",
    occupation: "Giáo viên",
    chiefComplaint: "Giảm thị lực",
    systemicHistory: "Tiểu đường type 2",
    currentMedications: "Metformin 500mg",
    createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "GK-2026-0004",
    name: "Phạm Minh Đức",
    gender: "Nam",
    dob: "05/06/2001",
    birthYear: 2001,
    phone: "0978123456",
    chiefComplaint: "Đau mắt đỏ",
    createdAt: "2026-04-01T08:30:00Z",
  },
  {
    id: "GK-2026-0005",
    name: "Vũ Thị Em",
    gender: "Nữ",
    dob: "18/09/1965",
    birthYear: 1965,
    phone: "0965432100",
    occupation: "Hưu trí",
    chiefComplaint: "Tái khám khô mắt",
    eyeHistory: "Đã Lasik 2018",
    screenTime: 3,
    createdAt: "2026-01-05T11:00:00Z",
  },
]

export const mockVisits: Visit[] = [
  {
    id: "v1",
    patientId: "GK-2026-0001",
    status: "chua_den",
    source: "hen",
    scheduledAt: "14:00",
    date: "2026-04-01",
  },
  {
    id: "v2",
    patientId: "GK-2026-0002",
    status: "cho_kham",
    source: "hen",
    reason: "Khô mắt, mỏi mắt",
    scheduledAt: "13:30",
    checkedInAt: "2026-04-01T13:25:00Z",
    date: "2026-04-01",
    lastVisitDate: "15/01/2026",
    lastVisitDiagnosis: "Khô mắt",
    lastVisitDoctor: "BS. Nguyễn Hải",
  },
  {
    id: "v3",
    patientId: "GK-2026-0003",
    status: "dang_sang_loc",
    source: "hen",
    reason: "Giảm thị lực",
    scheduledAt: "13:00",
    checkedInAt: "2026-04-01T12:55:00Z",
    date: "2026-04-01",
  },
  {
    id: "v4",
    patientId: "GK-2026-0004",
    status: "dang_kham",
    source: "walk_in",
    reason: "Đau mắt đỏ",
    checkedInAt: "2026-04-01T13:10:00Z",
    date: "2026-04-01",
    doctorName: "BS. Trần Minh",
  },
  {
    id: "v5",
    patientId: "GK-2026-0005",
    status: "hoan_thanh",
    source: "hen",
    reason: "Tái khám khô mắt",
    scheduledAt: "13:00",
    checkedInAt: "2026-04-01T12:50:00Z",
    date: "2026-04-01",
    lastVisitDate: "20/02/2026",
    lastVisitDiagnosis: "Khô mắt mạn tính",
    lastVisitDoctor: "BS. Nguyễn Hải",
  },
]
```

- [ ] **Step 2: Create appointment mock data**

Create `src/data/mock-appointments.ts`:

```typescript
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string // yyyy-mm-dd
  time: string // HH:mm
  reason?: string
  doctorName?: string
  notes?: string
}

export interface TimeSlot {
  time: string
  capacity: number
  booked: number
}

export const mockDoctors = [
  { id: "d1", name: "BS. Nguyễn Hải" },
  { id: "d2", name: "BS. Trần Minh" },
]

export function generateTimeSlots(date: string): {
  morning: TimeSlot[]
  afternoon: TimeSlot[]
} {
  const morning: TimeSlot[] = []
  const afternoon: TimeSlot[] = []

  for (let h = 8; h < 12; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      morning.push({ time, capacity: 2, booked: 0 })
    }
  }

  for (let h = 12; h < 20; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      afternoon.push({ time, capacity: 2, booked: 0 })
    }
  }

  return { morning, afternoon }
}

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-01",
    time: "14:00",
    reason: "Khám mắt định kỳ",
    doctorName: "BS. Nguyễn Hải",
  },
  {
    id: "a2",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-01",
    time: "13:30",
    reason: "Khô mắt, mỏi mắt",
    doctorName: "BS. Nguyễn Hải",
  },
  {
    id: "a3",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: "2026-04-01",
    time: "13:00",
    reason: "Giảm thị lực",
  },
  {
    id: "a5",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: "2026-04-01",
    time: "13:00",
    reason: "Tái khám khô mắt",
    doctorName: "BS. Nguyễn Hải",
  },
]
```

- [ ] **Step 3: Verify build passes**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/
git commit -m "feat: add mock patient and appointment data with types"
```

---

### Task 3: Receptionist Context Provider

**Files:**
- Create: `src/contexts/receptionist-context.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the context**

Create `src/contexts/receptionist-context.tsx`:

```typescript
import { createContext, useContext, useState, type ReactNode } from "react"
import {
  mockPatients,
  mockVisits,
  generatePatientId,
  type Patient,
  type Visit,
  type PatientStatus,
} from "@/data/mock-patients"
import { mockAppointments, type Appointment } from "@/data/mock-appointments"

interface ReceptionistContextType {
  patients: Patient[]
  visits: Visit[]
  appointments: Appointment[]
  todayVisits: Visit[]
  addPatient: (patient: Omit<Patient, "id" | "createdAt">) => Patient
  updatePatient: (id: string, data: Partial<Patient>) => void
  getPatient: (id: string) => Patient | undefined
  searchPatients: (query: string) => Patient[]
  addVisit: (visit: Omit<Visit, "id">) => void
  updateVisitStatus: (visitId: string, status: PatientStatus) => void
  cancelVisit: (visitId: string) => void
  checkInVisit: (visitId: string) => void
  addAppointment: (appointment: Omit<Appointment, "id">) => void
}

const ReceptionistContext = createContext<ReceptionistContextType | null>(null)

export function ReceptionistProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments)

  const today = "2026-04-01" // hardcoded for mockup

  const todayVisits = visits.filter((v) => v.date === today)

  function addPatient(data: Omit<Patient, "id" | "createdAt">): Patient {
    const newPatient: Patient = {
      ...data,
      id: generatePatientId(),
      createdAt: new Date().toISOString(),
    }
    setPatients((prev) => [...prev, newPatient])
    return newPatient
  }

  function updatePatient(id: string, data: Partial<Patient>) {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    )
  }

  function getPatient(id: string) {
    return patients.find((p) => p.id === id)
  }

  function searchPatients(query: string): Patient[] {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }

  function addVisit(data: Omit<Visit, "id">) {
    const newVisit: Visit = {
      ...data,
      id: `v${Date.now()}`,
    }
    setVisits((prev) => [...prev, newVisit])
  }

  function updateVisitStatus(visitId: string, status: PatientStatus) {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status } : v))
    )
  }

  function cancelVisit(visitId: string) {
    updateVisitStatus(visitId, "da_huy")
  }

  function checkInVisit(visitId: string) {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: "cho_kham" as const,
              checkedInAt: new Date().toISOString(),
            }
          : v
      )
    )
  }

  function addAppointment(data: Omit<Appointment, "id">) {
    const newAppointment: Appointment = {
      ...data,
      id: `a${Date.now()}`,
    }
    setAppointments((prev) => [...prev, newAppointment])
  }

  return (
    <ReceptionistContext.Provider
      value={{
        patients,
        visits,
        appointments,
        todayVisits,
        addPatient,
        updatePatient,
        getPatient,
        searchPatients,
        addVisit,
        updateVisitStatus,
        cancelVisit,
        checkInVisit,
        addAppointment,
      }}
    >
      {children}
    </ReceptionistContext.Provider>
  )
}

export function useReceptionist() {
  const context = useContext(ReceptionistContext)
  if (!context) {
    throw new Error("useReceptionist must be used within ReceptionistProvider")
  }
  return context
}
```

- [ ] **Step 2: Wrap App with provider and update routes**

Modify `src/App.tsx` to:

```typescript
import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReceptionistProvider } from "@/contexts/receptionist-context"
import IntakeDashboard from "@/pages/intake/index"
import IntakeNew from "@/pages/intake/new"
import IntakeEdit from "@/pages/intake/edit"
import ScheduleNew from "@/pages/schedule/new"

export function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ReceptionistProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SiteHeader />
              <Routes>
                <Route path="/" element={<Navigate to="/intake" replace />} />
                <Route path="/intake" element={<IntakeDashboard />} />
                <Route path="/intake/new" element={<IntakeNew />} />
                <Route path="/intake/:id/edit" element={<IntakeEdit />} />
                <Route path="/schedule/new" element={<ScheduleNew />} />
              </Routes>
            </SidebarInset>
          </SidebarProvider>
        </ReceptionistProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
```

- [ ] **Step 3: Create placeholder pages so the app compiles**

Create `src/pages/intake/index.tsx`:

```typescript
export default function IntakeDashboard() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        Dashboard — đang xây dựng
      </h1>
    </div>
  )
}
```

Create `src/pages/intake/new.tsx`:

```typescript
export default function IntakeNew() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        Tiếp nhận BN mới — đang xây dựng
      </h1>
    </div>
  )
}
```

Create `src/pages/intake/edit.tsx`:

```typescript
export default function IntakeEdit() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        Sửa thông tin BN — đang xây dựng
      </h1>
    </div>
  )
}
```

Create `src/pages/schedule/new.tsx`:

```typescript
export default function ScheduleNew() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <h1 className="text-2xl font-semibold text-muted-foreground">
        Đặt lịch hẹn — đang xây dựng
      </h1>
    </div>
  )
}
```

- [ ] **Step 4: Delete old placeholder pages**

Delete `src/pages/intake.tsx` and `src/pages/schedule.tsx` (replaced by the folder-based routes above).

- [ ] **Step 5: Update SiteHeader breadcrumbs for new routes**

Modify `src/components/site-header.tsx` — replace the `pageTitles` record with:

```typescript
const pageTitles: Record<string, string> = {
  "/intake": "Bệnh nhân",
  "/intake/new": "Tiếp nhận bệnh nhân",
  "/schedule/new": "Đặt lịch hẹn",
}
```

And update the breadcrumb logic to handle nested routes — match the longest prefix:

```typescript
export function SiteHeader() {
  const { pathname } = useLocation()

  // Match longest prefix first
  const matchedPath = Object.keys(pageTitles)
    .sort((a, b) => b.length - a.length)
    .find((p) => pathname.startsWith(p))

  const pageTitle = matchedPath ? pageTitles[matchedPath] : undefined

  // For edit pages, show dynamic title
  const isEdit = pathname.match(/^\/intake\/(.+)\/edit$/)
  const displayTitle = isEdit ? "Sửa thông tin bệnh nhân" : pageTitle

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink asChild>
                <Link to="/">Ganka28</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {displayTitle && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{displayTitle}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
```

- [ ] **Step 6: Verify app compiles and routes work**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add src/contexts/ src/pages/ src/App.tsx src/components/site-header.tsx
git rm src/pages/intake.tsx src/pages/schedule.tsx
git commit -m "feat: add receptionist context, routing, and placeholder pages"
```

---

### Task 4: Dashboard — KPI Cards Component

**Files:**
- Create: `src/components/receptionist/kpi-cards.tsx`

- [ ] **Step 1: Build the KPI cards**

Create `src/components/receptionist/kpi-cards.tsx`:

```typescript
import { useReceptionist } from "@/contexts/receptionist-context"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Clock01Icon,
  Search01Icon,
  Stethoscope02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const kpiConfig = [
  {
    key: "appointments",
    label: "Lịch hẹn hôm nay",
    icon: Calendar01Icon,
    colorClass: "text-foreground",
  },
  {
    key: "cho_kham",
    label: "Chờ khám",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "dang_sang_loc",
    label: "Đang sàng lọc",
    icon: Search01Icon,
    colorClass: "text-sky-500",
  },
  {
    key: "dang_kham",
    label: "Đang khám",
    icon: Stethoscope02Icon,
    colorClass: "text-blue-600",
  },
  {
    key: "hoan_thanh",
    label: "Hoàn thành",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-emerald-600",
  },
] as const

export function KpiCards() {
  const { todayVisits } = useReceptionist()

  const counts = {
    appointments: todayVisits.filter((v) => v.source === "hen").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    dang_sang_loc: todayVisits.filter((v) => v.status === "dang_sang_loc")
      .length,
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
  }

  const chuaDen = todayVisits.filter((v) => v.status === "chua_den").length

  return (
    <div className="grid grid-cols-5 gap-3.5">
      {kpiConfig.map((kpi) => (
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
            {counts[kpi.key]}
          </div>
          {kpi.key === "appointments" && chuaDen > 0 && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {chuaDen} chưa đến
            </div>
          )}
          {kpi.key !== "appointments" && (
            <div className="mt-0.5 text-xs text-muted-foreground">&nbsp;</div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run typecheck
```

Expected: No errors. (Note: the hugeicons icon names may differ — check `@hugeicons/core-free-icons` exports. Substitute with the closest available icon if a name doesn't resolve. Common alternatives: `Clock01Icon`, `Search01Icon`, `Stethoscope02Icon`, `CheckmarkCircle02Icon`. Use the IDE or grep `node_modules/@hugeicons/core-free-icons` to verify.)

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/kpi-cards.tsx
git commit -m "feat: add KPI cards component for dashboard"
```

---

### Task 5: Dashboard — Status Filters Component

**Files:**
- Create: `src/components/receptionist/status-filters.tsx`

- [ ] **Step 1: Build the filter tabs**

Create `src/components/receptionist/status-filters.tsx`:

```typescript
import { cn } from "@/lib/utils"
import { type PatientStatus } from "@/data/mock-patients"

const filters: { key: PatientStatus | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "chua_den", label: "Chưa đến" },
  { key: "cho_kham", label: "Chờ khám" },
  { key: "dang_sang_loc", label: "Đang sàng lọc" },
  { key: "dang_kham", label: "Đang khám" },
  { key: "hoan_thanh", label: "Hoàn thành" },
  { key: "da_huy", label: "Đã hủy" },
]

interface StatusFiltersProps {
  activeFilter: PatientStatus | "all"
  onFilterChange: (filter: PatientStatus | "all") => void
  counts: Record<PatientStatus | "all", number>
}

export function StatusFilters({
  activeFilter,
  onFilterChange,
  counts,
}: StatusFiltersProps) {
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
          {f.label}
          {f.key !== "all" && ` (${counts[f.key]})`}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/status-filters.tsx
git commit -m "feat: add status filter tabs for dashboard"
```

---

### Task 6: Dashboard — Action Menu Component

**Files:**
- Create: `src/components/receptionist/action-menu.tsx`

- [ ] **Step 1: Build the ⋮ menu**

Create `src/components/receptionist/action-menu.tsx`:

```typescript
import { useNavigate } from "react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { type Visit } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalIcon } from "@hugeicons/core-free-icons"

interface ActionMenuProps {
  visit: Visit
  onCheckIn: () => void
  onCancel: () => void
}

export function ActionMenu({ visit, onCheckIn, onCancel }: ActionMenuProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon
            icon={MoreVerticalIcon}
            className="size-4 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visit.status === "chua_den" && (
          <DropdownMenuItem onClick={onCheckIn}>Check-in</DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => navigate(`/intake/${visit.patientId}/edit`)}
        >
          Xem hồ sơ
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/intake/${visit.patientId}/edit`)}
        >
          Sửa thông tin
        </DropdownMenuItem>
        {visit.status !== "hoan_thanh" && visit.status !== "da_huy" && (
          <DropdownMenuItem
            onClick={onCancel}
            className="text-destructive focus:text-destructive"
          >
            Hủy lượt khám
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/action-menu.tsx
git commit -m "feat: add action menu component for patient table rows"
```

---

### Task 7: Dashboard — Patient Table Component

**Files:**
- Create: `src/components/receptionist/patient-table.tsx`

- [ ] **Step 1: Build the sortable patient table**

Create `src/components/receptionist/patient-table.tsx`:

```typescript
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useReceptionist } from "@/contexts/receptionist-context"
import {
  STATUS_CONFIG,
  SOURCE_CONFIG,
  type Visit,
  type PatientStatus,
} from "@/data/mock-patients"
import { ActionMenu } from "./action-menu"

type SortField = "name" | "birthYear" | "scheduledAt" | "source" | "status"
type SortDir = "asc" | "desc"

interface PatientTableProps {
  visits: Visit[]
  onCheckIn: (visit: Visit) => void
  onCancel: (visitId: string) => void
  page: number
  pageSize: number
}

export function PatientTable({
  visits,
  onCheckIn,
  onCancel,
  page,
  pageSize,
}: PatientTableProps) {
  const { getPatient } = useReceptionist()
  const [sortField, setSortField] = useState<SortField>("scheduledAt")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...visits].sort((a, b) => {
    const patA = getPatient(a.patientId)
    const patB = getPatient(b.patientId)
    let cmp = 0
    switch (sortField) {
      case "name":
        cmp = (patA?.name ?? "").localeCompare(patB?.name ?? "", "vi")
        break
      case "birthYear":
        cmp = (patA?.birthYear ?? 0) - (patB?.birthYear ?? 0)
        break
      case "scheduledAt":
        cmp = (a.scheduledAt ?? "99:99").localeCompare(
          b.scheduledAt ?? "99:99"
        )
        break
      case "source":
        cmp = a.source.localeCompare(b.source)
        break
      case "status":
        cmp = a.status.localeCompare(b.status)
        break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12 text-xs">STT</TableHead>
          <TableHead
            className="cursor-pointer text-xs"
            onClick={() => toggleSort("name")}
          >
            Họ tên{sortIndicator("name")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("birthYear")}
          >
            Năm sinh{sortIndicator("birthYear")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("scheduledAt")}
          >
            Giờ hẹn{sortIndicator("scheduledAt")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("source")}
          >
            Nguồn{sortIndicator("source")}
          </TableHead>
          <TableHead className="text-xs">Lý do khám</TableHead>
          <TableHead
            className="w-28 cursor-pointer text-xs"
            onClick={() => toggleSort("status")}
          >
            Trạng thái{sortIndicator("status")}
          </TableHead>
          <TableHead className="w-16 text-right text-xs">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((visit, i) => {
          const patient = getPatient(visit.patientId)
          if (!patient) return null
          const statusCfg = STATUS_CONFIG[visit.status]
          const sourceCfg = SOURCE_CONFIG[visit.source]

          return (
            <TableRow key={visit.id}>
              <TableCell className="text-muted-foreground">
                {(page - 1) * pageSize + i + 1}
              </TableCell>
              <TableCell>
                <div className="font-semibold">{patient.name}</div>
                <div className="text-xs text-muted-foreground">
                  {patient.id}
                </div>
              </TableCell>
              <TableCell>{patient.birthYear}</TableCell>
              <TableCell className={!visit.scheduledAt ? "text-muted-foreground" : ""}>
                {visit.scheduledAt ?? "—"}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${sourceCfg.color}`}>
                  {sourceCfg.label}
                </span>
              </TableCell>
              <TableCell
                className={
                  !visit.reason
                    ? "italic text-muted-foreground"
                    : ""
                }
              >
                {visit.reason || "Chưa rõ"}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <ActionMenu
                  visit={visit}
                  onCheckIn={() => onCheckIn(visit)}
                  onCancel={() => onCancel(visit.id)}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/patient-table.tsx
git commit -m "feat: add sortable patient table component"
```

---

### Task 8: Dashboard — Patient Search Component

**Files:**
- Create: `src/components/receptionist/patient-search.tsx`

- [ ] **Step 1: Build the search with autocomplete**

Create `src/components/receptionist/patient-search.tsx`:

```typescript
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void
  placeholder?: string
}

export function PatientSearch({
  onSelectPatient,
  placeholder = "Tìm theo SĐT hoặc tên BN...",
}: PatientSearchProps) {
  const { searchPatients } = useReceptionist()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchPatients(query))
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, searchPatients])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {results.map((patient) => (
            <button
              key={patient.id}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                onSelectPatient(patient)
                setQuery("")
                setIsOpen(false)
              }}
            >
              <div>
                <div className="font-medium">{patient.name}</div>
                <div className="text-xs text-muted-foreground">
                  {patient.id} · {patient.phone}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          Không tìm thấy bệnh nhân
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/patient-search.tsx
git commit -m "feat: add patient search with autocomplete dropdown"
```

---

### Task 9: Dashboard — Check-in Modals

**Files:**
- Create: `src/components/receptionist/checkin-modal.tsx`

- [ ] **Step 1: Build modals A and B**

Create `src/components/receptionist/checkin-modal.tsx`:

```typescript
import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Visit } from "@/data/mock-patients"

interface CheckinModalProps {
  visit: Visit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckinModal({ visit, open, onOpenChange }: CheckinModalProps) {
  const { getPatient, checkInVisit } = useReceptionist()
  const navigate = useNavigate()

  if (!visit) return null

  const patient = getPatient(visit.patientId)
  if (!patient) return null

  const isComplete = Boolean(
    patient.dob && patient.gender && (visit.reason || patient.chiefComplaint)
  )

  function handleConfirm() {
    if (isComplete) {
      checkInVisit(visit!.id)
      onOpenChange(false)
    } else {
      checkInVisit(visit!.id)
      onOpenChange(false)
      navigate(`/intake/${visit!.patientId}/edit`)
    }
  }

  const fields = [
    { label: "Họ tên", value: patient.name },
    { label: "Năm sinh", value: patient.birthYear?.toString() },
    { label: "Giới tính", value: patient.gender },
    { label: "SĐT", value: patient.phone },
    { label: "Nghề nghiệp", value: patient.occupation },
    {
      label: "Lý do khám",
      value: visit.reason || patient.chiefComplaint,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check-in bệnh nhân</DialogTitle>
          <DialogDescription>
            {isComplete
              ? "Xác nhận thông tin trước khi check-in"
              : "Hồ sơ cần bổ sung trước khi check-in"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="text-xs text-muted-foreground">{f.label}</div>
              {f.value ? (
                <div className="mt-0.5 text-sm font-semibold">{f.value}</div>
              ) : (
                <div className="mt-0.5 text-sm italic text-muted-foreground/50">
                  Chưa có
                </div>
              )}
            </div>
          ))}
        </div>

        {visit.lastVisitDate && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lần khám gần nhất: </span>
            {visit.lastVisitDate} — {visit.lastVisitDiagnosis} —{" "}
            {visit.lastVisitDoctor}
          </div>
        )}

        {isComplete ? (
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            <span className="mt-0.5">ℹ</span>
            <span>Xác nhận thông tin với bệnh nhân trước khi check-in.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <span className="mt-0.5">⚠</span>
            <span>
              Hồ sơ bệnh nhân chưa đầy đủ. Cần bổ sung thông tin bắt buộc
              trước khi check-in.
            </span>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="link"
            className="px-0 text-primary"
            onClick={() => {
              onOpenChange(false)
              navigate(`/intake/${visit.patientId}/edit`)
            }}
          >
            Sửa thông tin
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirm}>
              {isComplete ? "Xác nhận check-in" : "Check-in & bổ sung hồ sơ →"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/checkin-modal.tsx
git commit -m "feat: add check-in modal with complete/incomplete variants"
```

---

### Task 10: Dashboard — Walk-in Modal

**Files:**
- Create: `src/components/receptionist/walkin-modal.tsx`

- [ ] **Step 1: Build modal C**

Create `src/components/receptionist/walkin-modal.tsx`:

```typescript
import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"

interface WalkinModalProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalkinModal({
  patient,
  open,
  onOpenChange,
}: WalkinModalProps) {
  const { addVisit } = useReceptionist()
  const navigate = useNavigate()
  const [reason, setReason] = useState("")

  if (!patient) return null

  function handleCreate() {
    if (!reason.trim()) return
    addVisit({
      patientId: patient!.id,
      status: "cho_kham",
      source: "walk_in",
      reason: reason.trim(),
      date: "2026-04-01",
      checkedInAt: new Date().toISOString(),
    })
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Tạo lượt khám mới</DialogTitle>
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
            >
              Walk-in
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div>
            <div className="text-xs text-muted-foreground">Họ tên</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Năm sinh</div>
            <div className="mt-0.5 text-sm font-semibold">
              {patient.birthYear}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Giới tính</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.gender}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SĐT</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.phone}</div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Lý do khám lần này <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            placeholder="Nhập lý do khám..."
            rows={3}
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {reason.length} / 500
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="link"
            className="px-0 text-primary"
            onClick={() => {
              onOpenChange(false)
              navigate(`/intake/${patient.id}/edit`)
            }}
          >
            Sửa thông tin
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!reason.trim()}>
              Tạo lượt khám
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/walkin-modal.tsx
git commit -m "feat: add walk-in modal for existing patients"
```

---

### Task 11: Dashboard — Assemble Full Page

**Files:**
- Modify: `src/pages/intake/index.tsx`

- [ ] **Step 1: Build the full dashboard page**

Replace `src/pages/intake/index.tsx` with:

```typescript
import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import { type PatientStatus, type Patient, type Visit } from "@/data/mock-patients"
import { KpiCards } from "@/components/receptionist/kpi-cards"
import { StatusFilters } from "@/components/receptionist/status-filters"
import { PatientTable } from "@/components/receptionist/patient-table"
import { PatientSearch } from "@/components/receptionist/patient-search"
import { CheckinModal } from "@/components/receptionist/checkin-modal"
import { WalkinModal } from "@/components/receptionist/walkin-modal"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, UserAdd01Icon, Refresh01Icon } from "@hugeicons/core-free-icons"

export default function IntakeDashboard() {
  const navigate = useNavigate()
  const { todayVisits, cancelVisit } = useReceptionist()

  const [activeFilter, setActiveFilter] = useState<PatientStatus | "all">(
    "all"
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals
  const [checkinVisit, setCheckinVisit] = useState<Visit | null>(null)
  const [walkinPatient, setWalkinPatient] = useState<Patient | null>(null)

  // Filter visits
  const filteredVisits =
    activeFilter === "all"
      ? todayVisits
      : todayVisits.filter((v) => v.status === activeFilter)

  // Counts for filter tabs
  const counts = {
    all: todayVisits.length,
    chua_den: todayVisits.filter((v) => v.status === "chua_den").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    dang_sang_loc: todayVisits.filter((v) => v.status === "dang_sang_loc").length,
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
    da_huy: todayVisits.filter((v) => v.status === "da_huy").length,
  }

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / pageSize))

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page title */}
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-60">
            <PatientSearch onSelectPatient={setWalkinPatient} />
          </div>
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/schedule/new")}>
            <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
            Đặt lịch hẹn
          </Button>
          <Button onClick={() => navigate("/intake/new")}>
            <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
            Tiếp nhận BN mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Status Filters */}
      <StatusFilters
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f)
          setPage(1)
        }}
        counts={counts}
      />

      {/* Patient Table */}
      <div className="rounded-lg border border-border">
        <PatientTable
          visits={filteredVisits}
          onCheckIn={setCheckinVisit}
          onCancel={cancelVisit}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(filteredVisits.length, pageSize)} /{" "}
          {filteredVisits.length} bệnh nhân hôm nay
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
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

      {/* Modals */}
      <CheckinModal
        visit={checkinVisit}
        open={!!checkinVisit}
        onOpenChange={(open) => !open && setCheckinVisit(null)}
      />
      <WalkinModal
        patient={walkinPatient}
        open={!!walkinPatient}
        onOpenChange={(open) => !open && setWalkinPatient(null)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build and test in browser**

```bash
npm run typecheck && npm run dev
```

Open `http://localhost:3000/intake` — you should see the full dashboard with KPI cards, filter tabs, patient table, and working modals.

- [ ] **Step 3: Commit**

```bash
git add src/pages/intake/index.tsx
git commit -m "feat: assemble complete receptionist dashboard page"
```

---

### Task 12: Intake Form — Shared Form Component

**Files:**
- Create: `src/components/receptionist/intake-form.tsx`

- [ ] **Step 1: Build the 4-section intake form**

Create `src/components/receptionist/intake-form.tsx`:

```typescript
import { useState } from "react"
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Clock01Icon,
  PlusSignCircleIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons"

interface IntakeFormProps {
  patient?: Patient
  autoCheckIn?: boolean
}

export function IntakeForm({ patient, autoCheckIn }: IntakeFormProps) {
  const navigate = useNavigate()
  const { addPatient, updatePatient, searchPatients } = useReceptionist()

  const [form, setForm] = useState({
    name: patient?.name ?? "",
    gender: patient?.gender ?? "",
    dob: patient?.dob ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    occupation: patient?.occupation ?? "",
    cccd: patient?.cccd ?? "",
    chiefComplaint: patient?.chiefComplaint ?? "",
    eyeHistory: patient?.eyeHistory ?? "",
    systemicHistory: patient?.systemicHistory ?? "",
    currentMedications: patient?.currentMedications ?? "",
    allergies: patient?.allergies ?? "",
    screenTime: patient?.screenTime?.toString() ?? "",
    workEnvironment: patient?.workEnvironment ?? "",
    contactLens: patient?.contactLens ?? "",
    lifestyleNotes: patient?.lifestyleNotes ?? "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Duplicate phone check
  const duplicatePatient =
    form.phone.length >= 10 && !patient
      ? searchPatients(form.phone).find((p) => p.phone === form.phone)
      : undefined

  function updateField(field: string, value: string) {
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
    if (!form.chiefComplaint.trim())
      errs.chiefComplaint = "Trường này không được bỏ trống"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave(goToPreExam = false) {
    if (!validate()) return

    const data = {
      name: form.name.trim(),
      gender: form.gender as Patient["gender"],
      dob: form.dob,
      birthYear: parseInt(form.dob.split("/")[2] ?? "0", 10),
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      occupation: form.occupation || undefined,
      cccd: form.cccd || undefined,
      chiefComplaint: form.chiefComplaint.trim(),
      eyeHistory: form.eyeHistory || undefined,
      systemicHistory: form.systemicHistory || undefined,
      currentMedications: form.currentMedications || undefined,
      allergies: form.allergies || undefined,
      screenTime: form.screenTime ? Number(form.screenTime) : undefined,
      workEnvironment: form.workEnvironment || undefined,
      contactLens: form.contactLens || undefined,
      lifestyleNotes: form.lifestyleNotes || undefined,
    }

    if (patient) {
      updatePatient(patient.id, data)
    } else {
      addPatient(data)
    }

    if (goToPreExam) {
      // Future: navigate to pre-exam
      navigate("/intake")
    } else {
      navigate("/intake")
    }
  }

  function FieldError({ field }: { field: string }) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Section 1: Thông tin cá nhân */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={UserAdd01Icon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          {/* Row 1: Name + Gender */}
          <div className="grid grid-cols-[2.5fr_1fr] gap-6">
            <div>
              <Label>
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                maxLength={100}
                aria-invalid={!!errors.name}
              />
              <FieldError field="name" />
            </div>
            <div>
              <Label>
                Giới tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v)}
              >
                <SelectTrigger aria-invalid={!!errors.gender}>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="gender" />
            </div>
          </div>

          {/* Row 2: DOB + Phone + Email */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label>
                Ngày sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                placeholder="dd/mm/yyyy"
                aria-invalid={!!errors.dob}
              />
              <FieldError field="dob" />
            </div>
            <div>
              <Label>
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-invalid={!!errors.phone}
              />
              <FieldError field="phone" />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                type="email"
                aria-invalid={!!errors.email}
              />
              <FieldError field="email" />
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicatePatient && (
            <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <span>
                ⚠ SĐT <strong>{form.phone}</strong> đã tồn tại — BN:{" "}
                <strong>{duplicatePatient.name}</strong> (
                {duplicatePatient.birthYear})
              </span>
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() =>
                  navigate(`/intake/${duplicatePatient!.id}/edit`)
                }
              >
                Mở hồ sơ cũ
              </button>
            </div>
          )}

          {/* Row 3: Address */}
          <div>
            <Label>Địa chỉ</Label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Row 4: Occupation + CCCD */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Nghề nghiệp</Label>
              <Input
                value={form.occupation}
                onChange={(e) => updateField("occupation", e.target.value)}
                placeholder="VD: Nhân viên văn phòng"
                maxLength={100}
              />
            </div>
            <div>
              <Label>Số CCCD</Label>
              <Input
                value={form.cccd}
                onChange={(e) => updateField("cccd", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Thông tin khám */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Thông tin khám</h2>
        </div>
        <div className="mb-5 border-t border-border" />

        <div>
          <Label>
            Lý do đến khám <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={form.chiefComplaint}
            onChange={(e) =>
              updateField(
                "chiefComplaint",
                e.target.value.slice(0, 500)
              )
            }
            placeholder="Mô tả lý do bệnh nhân đến khám. VD: Mắt khô rát 2 tuần, nhìn mờ khi dùng máy tính..."
            rows={3}
            aria-invalid={!!errors.chiefComplaint}
          />
          <div className="mt-1 flex justify-between">
            <span className="text-xs italic text-muted-foreground">
              Tối đa 500 ký tự. Ghi rõ triệu chứng, thời gian, mức độ nếu BN
              cung cấp.
            </span>
            <span className="text-xs text-muted-foreground">
              {form.chiefComplaint.length}/500
            </span>
          </div>
          <FieldError field="chiefComplaint" />
        </div>
      </section>

      {/* Section 3: Tiền sử bệnh */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={PlusSignCircleIcon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Tiền sử bệnh</h2>
          <span className="text-sm text-muted-foreground">(tùy chọn)</span>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Tiền sử bệnh mắt</Label>
              <Textarea
                value={form.eyeHistory}
                onChange={(e) => updateField("eyeHistory", e.target.value)}
                placeholder="VD: Cận thị từ nhỏ, đã Lasik 2020..."
                rows={3}
              />
            </div>
            <div>
              <Label>Tiền sử bệnh toàn thân</Label>
              <Textarea
                value={form.systemicHistory}
                onChange={(e) =>
                  updateField("systemicHistory", e.target.value)
                }
                placeholder="VD: Tiểu đường type 2, cao huyết áp..."
                rows={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Thuốc đang dùng</Label>
              <Input
                value={form.currentMedications}
                onChange={(e) =>
                  updateField("currentMedications", e.target.value)
                }
                placeholder="VD: Metformin 500mg, Amlodipine 5mg..."
              />
            </div>
            <div>
              <Label>Dị ứng</Label>
              <Input
                value={form.allergies}
                onChange={(e) => updateField("allergies", e.target.value)}
                placeholder="VD: Penicillin, phấn hoa, hải sản..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Lối sống */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={TimeQuarterPassIcon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Lối sống</h2>
          <span className="text-sm text-muted-foreground">(tùy chọn)</span>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label>Thời gian sử dụng màn hình (giờ/ngày)</Label>
              <Input
                value={form.screenTime}
                onChange={(e) => updateField("screenTime", e.target.value)}
                placeholder="VD: 8"
                type="number"
                min={0}
                max={24}
              />
            </div>
            <div>
              <Label>Môi trường làm việc</Label>
              <Select
                value={form.workEnvironment}
                onValueChange={(v) => updateField("workEnvironment", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                  <SelectItem value="Ngoài trời">Ngoài trời</SelectItem>
                  <SelectItem value="Nhà máy">Nhà máy</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sử dụng kính áp tròng</Label>
              <Select
                value={form.contactLens}
                onValueChange={(v) => updateField("contactLens", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Không">Không</SelectItem>
                  <SelectItem value="Hàng ngày">Hàng ngày</SelectItem>
                  <SelectItem value="Thỉnh thoảng">Thỉnh thoảng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Ghi chú khác về lối sống</Label>
            <Input
              value={form.lifestyleNotes}
              onChange={(e) => updateField("lifestyleNotes", e.target.value)}
              placeholder="VD: Hay bơi lội, thường xuyên lái xe đêm, dùng thuốc nhỏ mắt hàng ngày..."
              maxLength={300}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={() => navigate("/intake")}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)}>
            Lưu
          </Button>
          <Button onClick={() => handleSave(true)}>
            Lưu & chuyển Pre-Exam →
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-form.tsx
git commit -m "feat: add patient intake form with 4 sections and validation"
```

---

### Task 13: Intake Pages — Wire Up New and Edit

**Files:**
- Modify: `src/pages/intake/new.tsx`
- Modify: `src/pages/intake/edit.tsx`

- [ ] **Step 1: Wire up new patient page**

Replace `src/pages/intake/new.tsx`:

```typescript
import { IntakeForm } from "@/components/receptionist/intake-form"

export default function IntakeNew() {
  return <IntakeForm />
}
```

- [ ] **Step 2: Wire up edit patient page**

Replace `src/pages/intake/edit.tsx`:

```typescript
import { useParams, Navigate } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { IntakeForm } from "@/components/receptionist/intake-form"

export default function IntakeEdit() {
  const { id } = useParams<{ id: string }>()
  const { getPatient } = useReceptionist()

  const patient = id ? getPatient(id) : undefined

  if (!patient) {
    return <Navigate to="/intake" replace />
  }

  return <IntakeForm patient={patient} />
}
```

- [ ] **Step 3: Verify build and test in browser**

```bash
npm run typecheck
```

Navigate to `/intake/new` and `/intake/GK-2026-0001/edit` to verify forms work.

- [ ] **Step 4: Commit**

```bash
git add src/pages/intake/new.tsx src/pages/intake/edit.tsx
git commit -m "feat: wire up intake new and edit pages with shared form"
```

---

### Task 14: Appointment Booking — Calendar Component

**Files:**
- Create: `src/components/receptionist/appointment-calendar.tsx`

- [ ] **Step 1: Build the month calendar**

Create `src/components/receptionist/appointment-calendar.tsx`:

```typescript
import { cn } from "@/lib/utils"

interface AppointmentCalendarProps {
  year: number
  month: number // 0-indexed
  selectedDate: string | null // yyyy-mm-dd
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const dayHeaders = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"]

const monthNames = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
]

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: { day: number; month: "prev" | "current" | "next"; date: string }[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    days.push({
      day: d,
      month: "prev",
      date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      month: "current",
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    days.push({
      day: d,
      month: "next",
      date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  return days
}

function isHoliday(date: string): boolean {
  // Placeholder: mark some dates as holidays (red)
  // For now, no holidays — extend later
  return false
}

function isPast(date: string): boolean {
  return date < "2026-04-01" // hardcoded today for mockup
}

export function AppointmentCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: AppointmentCalendarProps) {
  const days = getCalendarDays(year, month)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          ‹
        </button>
        <span className="text-sm font-semibold">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs">
        {dayHeaders.map((d) => (
          <div key={d} className="py-2 font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const isSelected = d.date === selectedDate
          const past = isPast(d.date)
          const holiday = isHoliday(d.date)
          const isOtherMonth = d.month !== "current"
          const disabled = past || isOtherMonth

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(d.date)}
              className={cn(
                "flex items-center justify-center py-2.5 text-sm",
                isOtherMonth && "text-muted-foreground/40",
                past && !isOtherMonth && "text-muted-foreground/40 line-through",
                holiday && !isOtherMonth && "font-medium text-red-500",
                !disabled &&
                  !isSelected &&
                  "text-foreground hover:text-foreground/80",
                isSelected &&
                  "mx-auto size-9 rounded-lg bg-foreground font-semibold text-background"
              )}
            >
              {d.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/appointment-calendar.tsx
git commit -m "feat: add appointment calendar month picker"
```

---

### Task 15: Appointment Booking — Time Slots and Confirmation Bar

**Files:**
- Create: `src/components/receptionist/appointment-slots.tsx`
- Create: `src/components/receptionist/confirmation-bar.tsx`

- [ ] **Step 1: Build time slot grid**

Create `src/components/receptionist/appointment-slots.tsx`:

```typescript
import { cn } from "@/lib/utils"
import { type TimeSlot } from "@/data/mock-appointments"

interface AppointmentSlotsProps {
  morning: TimeSlot[]
  afternoon: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

function SlotGrid({
  slots,
  selectedTime,
  onSelectTime,
}: {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isFull = slot.booked >= slot.capacity
        const isSelected = slot.time === selectedTime

        return (
          <button
            key={slot.time}
            disabled={isFull}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm transition-colors",
              isFull &&
                "cursor-not-allowed border-border bg-muted text-muted-foreground/40 line-through",
              isSelected &&
                "border-2 border-purple-500 bg-purple-50 font-semibold text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
              !isFull &&
                !isSelected &&
                "border-border text-foreground hover:border-foreground/30"
            )}
          >
            {slot.time}
          </button>
        )
      })}
    </div>
  )
}

export function AppointmentSlots({
  morning,
  afternoon,
  selectedTime,
  onSelectTime,
}: AppointmentSlotsProps) {
  const morningAvail = morning.filter((s) => s.booked < s.capacity).length
  const afternoonAvail = afternoon.filter((s) => s.booked < s.capacity).length

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 text-sm font-semibold">
          Sáng{" "}
          <span className="font-normal text-muted-foreground">
            {morningAvail} slot trống / {morning.length}
          </span>
        </div>
        <div className="mb-2.5 border-t border-border" />
        <SlotGrid
          slots={morning}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
        />
      </div>

      <div>
        <div className="mb-1 text-sm font-semibold">
          Chiều{" "}
          <span className="font-normal text-muted-foreground">
            {afternoonAvail} slot trống / {afternoon.length}
          </span>
        </div>
        <div className="mb-2.5 border-t border-border" />
        <SlotGrid
          slots={afternoon}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border border-border" />
          Trống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border-2 border-purple-500" />
          Đang chọn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border border-border bg-muted" />
          Đã đầy
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build confirmation bar**

Create `src/components/receptionist/confirmation-bar.tsx`:

```typescript
import { Button } from "@/components/ui/button"

interface ConfirmationBarProps {
  patientName: string | null
  date: string | null
  time: string | null
  reason: string | null
  doctorName: string | null
  onCancel: () => void
  onConfirm: () => void
}

function formatDateVi(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]
  return `${days[date.getDay()]}, ${d}/${m}/${y}`
}

export function ConfirmationBar({
  patientName,
  date,
  time,
  reason,
  doctorName,
  onCancel,
  onConfirm,
}: ConfirmationBarProps) {
  if (!date || !time) return null

  const warnings: string[] = []
  if (!reason) warnings.push("Chưa nhập lý do")
  if (!doctorName) warnings.push("Không chỉ định BS")

  return (
    <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-900 dark:bg-purple-950/30">
      <div>
        <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">
          Xác nhận lịch hẹn
        </div>
        <div className="mt-0.5 text-sm">
          {patientName || "..."} — {formatDateVi(date)} lúc {time}
        </div>
        {warnings.length > 0 && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {warnings.join(" — ")}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={onConfirm}
        >
          Xác nhận lịch hẹn
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/appointment-slots.tsx src/components/receptionist/confirmation-bar.tsx
git commit -m "feat: add time slot grid and confirmation bar components"
```

---

### Task 16: Appointment Booking — Assemble Full Page

**Files:**
- Modify: `src/pages/schedule/new.tsx`

- [ ] **Step 1: Build the appointment booking page**

Replace `src/pages/schedule/new.tsx`:

```typescript
import { useState } from "react"
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import { generateTimeSlots, mockDoctors } from "@/data/mock-appointments"
import { AppointmentCalendar } from "@/components/receptionist/appointment-calendar"
import { AppointmentSlots } from "@/components/receptionist/appointment-slots"
import { ConfirmationBar } from "@/components/receptionist/confirmation-bar"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

export default function ScheduleNew() {
  const navigate = useNavigate()
  const { searchPatients, addAppointment, addPatient, addVisit } =
    useReceptionist()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [searchDone, setSearchDone] = useState(false)

  // New patient fields
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")

  // Shared fields
  const [reason, setReason] = useState("")
  const [doctorId, setDoctorId] = useState("")

  // Calendar state
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(3) // April = 3 (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const slots = selectedDate ? generateTimeSlots(selectedDate) : null
  const selectedDoctor = mockDoctors.find((d) => d.id === doctorId)

  function handleSearch() {
    if (searchQuery.length < 2) return
    const results = searchPatients(searchQuery)
    if (results.length > 0) {
      setFoundPatient(results[0])
    } else {
      setFoundPatient(null)
    }
    setSearchDone(true)
  }

  function handleConfirm() {
    let patientId = foundPatient?.id
    let patientName = foundPatient?.name ?? newName

    if (!foundPatient && newName && newPhone) {
      const newPat = addPatient({
        name: newName,
        phone: newPhone,
        gender: "Khác" as const,
        dob: "",
        birthYear: 0,
      })
      patientId = newPat.id
      patientName = newPat.name
    }

    if (!patientId || !selectedDate || !selectedTime) return

    addAppointment({
      patientId,
      patientName,
      date: selectedDate,
      time: selectedTime,
      reason: reason || undefined,
      doctorName: selectedDoctor?.name,
    })

    addVisit({
      patientId,
      status: "chua_den",
      source: "hen",
      reason: reason || undefined,
      scheduledAt: selectedTime,
      date: selectedDate,
      doctorName: selectedDoctor?.name,
    })

    navigate("/intake")
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-xl font-bold">Đặt lịch hẹn</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Patient info */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-base font-bold">Thông tin bệnh nhân</h2>

          <Label className="mb-1.5">Tìm bệnh nhân</Label>
          <div className="relative mb-3">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchDone(false)
                setFoundPatient(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onBlur={handleSearch}
              placeholder="Nhập SĐT hoặc tên BN..."
              className="pl-9"
            />
          </div>

          {/* Found banner */}
          {searchDone && foundPatient && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <span>ℹ</span>
              <span>
                Đã tìm thấy: <strong>{foundPatient.name}</strong> —{" "}
                {foundPatient.id}
              </span>
            </div>
          )}

          {/* Not found banner */}
          {searchDone && !foundPatient && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <span>⚠</span>
              <span>
                Không tìm thấy BN với SĐT này. Nhập thông tin bên dưới để tạo
                hẹn cho BN mới.
              </span>
            </div>
          )}

          {/* New patient fields */}
          {searchDone && !foundPatient && (
            <>
              <div className="mb-3">
                <Label>
                  Họ tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Label>
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="mb-4 flex items-start gap-2 rounded-md bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                <span>ℹ</span>
                <span>
                  BN mới chỉ cần tên + SĐT + lý do khám để đặt hẹn. Thông tin
                  đầy đủ sẽ bổ sung khi BN đến check-in.
                </span>
              </div>
            </>
          )}

          {/* Shared fields */}
          <div className="mb-3">
            <Label>Bác sĩ chỉ định</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="BS nào trống" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lý do khám</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              rows={3}
            />
          </div>
        </div>

        {/* Right: Calendar + Slots */}
        <div>
          <h2 className="mb-4 text-base font-bold">Chọn ngày & giờ</h2>

          <AppointmentCalendar
            year={calYear}
            month={calMonth}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d)
              setSelectedTime(null)
            }}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />

          {slots && (
            <div className="mt-6">
              <AppointmentSlots
                morning={slots.morning}
                afternoon={slots.afternoon}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation bar */}
      <ConfirmationBar
        patientName={foundPatient?.name ?? newName || null}
        date={selectedDate}
        time={selectedTime}
        reason={reason || null}
        doctorName={selectedDoctor?.name ?? null}
        onCancel={() => navigate("/intake")}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify build and test in browser**

```bash
npm run typecheck && npm run dev
```

Open `http://localhost:3000/schedule/new` — test both existing patient search and new patient flow.

- [ ] **Step 3: Commit**

```bash
git add src/pages/schedule/new.tsx
git commit -m "feat: assemble appointment booking page with calendar and slots"
```

---

### Task 17: Final Cleanup — Remove Old Files, Verify All Routes

**Files:**
- Delete: `src/pages/intake.tsx` (if not already deleted in Task 3)
- Delete: `src/pages/schedule.tsx` (if not already deleted in Task 3)

- [ ] **Step 1: Verify no stale imports**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 2: Verify all routes work in browser**

```bash
npm run dev
```

Test each route:
- `http://localhost:3000/intake` — Dashboard with KPI cards, table, filters, modals
- `http://localhost:3000/intake/new` — Intake form with 4 sections
- `http://localhost:3000/intake/GK-2026-0001/edit` — Edit form pre-filled
- `http://localhost:3000/schedule/new` — Appointment booking with calendar

- [ ] **Step 3: Run lint and format**

```bash
npm run lint && npm run format
```

Fix any lint errors.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and formatting for receptionist module"
```
