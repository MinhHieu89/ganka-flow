# Patient Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full patient detail page at `/patients/:id` with sticky collapsible header, stat cards, 3 tabs (Tổng quan, Lịch sử khám, Xu hướng), and responsive layout.

**Architecture:** Single page component orchestrating a mock data layer, a collapsible sticky header with IntersectionObserver, and three tab panels. The visit history tab uses a master-detail split layout. All data is mock/hardcoded for now (no backend). Components are split by UI section for focused files.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Tabs with line variant), Hugeicons, cn() utility

**Design spec:** `docs/superpowers/specs/2026-04-03-patient-detail-design.md`
**Base spec:** `docs/patients/patient-detail.md`

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/data/mock-patient-detail.ts` | Mock data types and sample patient detail data |
| `src/pages/patients/detail.tsx` | Page component — orchestrates layout, sticky header, tabs |
| `src/components/patients/detail/patient-header.tsx` | Expanded + collapsed header with avatar, meta, pills, actions |
| `src/components/patients/detail/stat-cards.tsx` | 4 stat cards grid |
| `src/components/patients/detail/tab-overview.tsx` | Tổng quan tab — personal info, history, prescriptions, optical, diagnoses, measurements |
| `src/components/patients/detail/tab-visits.tsx` | Lịch sử khám tab — master-detail with timeline + detail panel |
| `src/components/patients/detail/tab-trends.tsx` | Xu hướng tab — responsive chart grid |
| `src/components/patients/detail/visit-detail-panel.tsx` | Right panel for selected visit (measurement blocks, prescriptions, notes) |
| `src/components/patients/detail/measurement-block.tsx` | Reusable block for displaying OD/OS measurement data |
| `src/hooks/use-sticky-header.ts` | IntersectionObserver hook for sticky collapse behavior |

---

### Task 1: Mock Data Layer

**Files:**
- Create: `src/data/mock-patient-detail.ts`

- [ ] **Step 1: Define types for patient detail data**

```typescript
// src/data/mock-patient-detail.ts

export type DiseaseGroupType = "dryEye" | "refraction" | "myopiaControl" | "general"

export interface PatientDetailAlert {
  type: "allergy" | "eyeDisease" | "osdi" | "redFlag"
  label: string
}

export interface PatientDetailStat {
  totalVisits: number
  firstVisitDate: string
  lastVisitDate: string
  lastVisitDoctor: string
  currentDiagnosis: string
  currentDiagnosisIcd: string
  secondaryDiagnosis?: string
  nextFollowUp: string | null
  followUpDate: string | null
  followUpDaysRemaining: number | null // negative = overdue
}

export interface PatientPersonalInfo {
  id: string
  name: string
  dob: string
  age: number
  gender: string
  phone: string
  address: string
  occupation: string
  insurance: string | null
  emergencyContact: string | null
}

export interface MedicalHistory {
  eyeDiseases: string[]
  eyeNotes: string | null
  allergies: string[]
  systemicHistory: string | null
}

export interface CurrentMedication {
  name: string
  description: string
  dosage: string
  frequency: string
  eye: string
  duration: string
  prescribedDate: string
  doctor: string
}

export interface OpticalRx {
  od: { sph: string; cyl: string; axis: string }
  os: { sph: string; cyl: string; axis: string }
  pd: string
  lensType: string
  prescribedDate: string
  doctor: string
}

export interface DiagnosisRecord {
  name: string
  icdCode: string
  type: "primary" | "secondary"
  firstSeen: string
  lastSeen: string | null // null = current
  visitCount: number
}

export interface MeasurementData {
  date: string
  va: {
    od: { sc: string; cc: string; ph: string; iop: string }
    os: { sc: string; cc: string; ph: string; iop: string }
  }
  refraction: {
    od: { sph: string; cyl: string; axis: string }
    os: { sph: string; cyl: string; axis: string }
  }
  dryEye?: {
    osdiScore: number
    osdiMax: number
    osdiSeverity: string
    od: { tbut: string; schirmer: string; meibomian: string }
    os: { tbut: string; schirmer: string; meibomian: string }
  }
  slitLamp: string
  fundus: string
}

export interface VisitRecord {
  id: string
  date: string
  diseaseGroup: DiseaseGroupType
  doctorName: string
  daysAgo: number | null // null = "Khám lần đầu"
  diagnoses: { text: string; icdCode: string; isPrimary: boolean }[]
  summaryPills: string[]
  measurements: MeasurementData
  medications: CurrentMedication[]
  instructions: string | null
  followUp: string | null
  followUpOverdue: boolean
}

export interface TrendDataPoint {
  date: string
  od: number | null
  os: number | null
}

export interface TrendChart {
  id: string
  title: string
  unit: string
  threshold?: { value: number; label: string }
  data: TrendDataPoint[]
  invertY?: boolean
  yLabels: string[]
}

export interface PatientDetail {
  personal: PatientPersonalInfo
  alerts: PatientDetailAlert[]
  stats: PatientDetailStat
  medicalHistory: MedicalHistory
  currentMedications: CurrentMedication[]
  opticalRx: OpticalRx | null
  diagnosisHistory: DiagnosisRecord[]
  latestMeasurements: MeasurementData | null
  visits: VisitRecord[]
  trends: TrendChart[]
}
```

- [ ] **Step 2: Create sample mock data**

Add to the same file, below the types:

```typescript
export const DISEASE_GROUP_CONFIG: Record<
  DiseaseGroupType,
  { label: string; colorClass: string }
> = {
  dryEye: { label: "Dry Eye", colorClass: "bg-[#E6F1FB] text-[#0C447C]" },
  refraction: { label: "Refraction", colorClass: "bg-[#EEEDFE] text-[#3C3489]" },
  myopiaControl: { label: "Myopia Control", colorClass: "bg-emerald-100 text-emerald-800" },
  general: { label: "General", colorClass: "bg-[#F1EFE8] text-[#444441]" },
}

export const MOCK_PATIENT_DETAIL: PatientDetail = {
  personal: {
    id: "GK-2026-0012",
    name: "Nguyễn Văn An",
    dob: "15/03/1981",
    age: 45,
    gender: "Nam",
    phone: "0912 345 678",
    address: "45 Nguyễn Trãi, Thanh Xuân, HN",
    occupation: "Nhân viên văn phòng",
    insurance: "DN-4851234567",
    emergencyContact: "Nguyễn Thị Lan (vợ) · 0987 654 321",
  },
  alerts: [
    { type: "allergy", label: "Dị ứng: Tetracycline" },
    { type: "eyeDisease", label: "Cận thị" },
    { type: "eyeDisease", label: "Khô mắt" },
    { type: "osdi", label: "OSDI: 18/30" },
  ],
  stats: {
    totalVisits: 3,
    firstVisitDate: "10/03/2025",
    lastVisitDate: "15/01/2026",
    lastVisitDoctor: "BS. Nguyễn Thị Mai",
    currentDiagnosis: "Cận thị 2 mắt",
    currentDiagnosisIcd: "H52.1",
    secondaryDiagnosis: "Khô mắt H04.1",
    nextFollowUp: "Quá hạn",
    followUpDate: "15/03/2026",
    followUpDaysRemaining: -19,
  },
  medicalHistory: {
    eyeDiseases: ["Cận thị", "Khô mắt"],
    eyeNotes: "Đeo kính cận từ 15 tuổi. Mẹ cận nặng (-8.00D).",
    allergies: ["Tetracycline"],
    systemicHistory: null,
  },
  currentMedications: [
    {
      name: "Refresh Tears 0.5%",
      description: "Nước mắt nhân tạo",
      dosage: "1 giọt",
      frequency: "3 lần/ngày",
      eye: "OU",
      duration: "3 tháng",
      prescribedDate: "15/01/2026",
      doctor: "BS. Nguyễn Thị Mai",
    },
    {
      name: "Systane Ultra",
      description: "Gel bôi trơn mắt",
      dosage: "1 giọt",
      frequency: "Khi cần",
      eye: "OU",
      duration: "3 tháng",
      prescribedDate: "15/01/2026",
      doctor: "BS. Nguyễn Thị Mai",
    },
  ],
  opticalRx: {
    od: { sph: "-2.25", cyl: "-0.50", axis: "180°" },
    os: { sph: "-2.50", cyl: "-0.50", axis: "5°" },
    pd: "63.0",
    lensType: "Đơn tròng",
    prescribedDate: "20/09/2025",
    doctor: "BS. Trần Văn Hùng",
  },
  diagnosisHistory: [
    {
      name: "Cận thị 2 mắt",
      icdCode: "H52.1",
      type: "primary",
      firstSeen: "03/2025",
      lastSeen: null,
      visitCount: 3,
    },
    {
      name: "Loạn thị",
      icdCode: "H52.2",
      type: "secondary",
      firstSeen: "01/2026",
      lastSeen: null,
      visitCount: 1,
    },
    {
      name: "Hội chứng khô mắt",
      icdCode: "H04.1",
      type: "secondary",
      firstSeen: "01/2026",
      lastSeen: null,
      visitCount: 1,
    },
  ],
  latestMeasurements: {
    date: "15/01/2026",
    va: {
      od: { sc: "20/40", cc: "20/25", ph: "20/20", iop: "15" },
      os: { sc: "20/30", cc: "20/20", ph: "20/20", iop: "14" },
    },
    refraction: {
      od: { sph: "-2.50", cyl: "-0.75", axis: "180" },
      os: { sph: "-2.75", cyl: "-0.75", axis: "5" },
    },
    dryEye: {
      osdiScore: 18,
      osdiMax: 30,
      osdiSeverity: "Trung bình",
      od: { tbut: "7s", schirmer: "12mm", meibomian: "Tắc nhẹ" },
      os: { tbut: "8s", schirmer: "10mm", meibomian: "BT" },
    },
    slitLamp: "Tất cả bình thường (OD & OS)",
    fundus: "Bình thường · C/D 0.3 / 0.3",
  },
  visits: [
    {
      id: "v3",
      date: "15/01/2026",
      diseaseGroup: "dryEye",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: 79,
      diagnoses: [
        { text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true },
        { text: "Hội chứng khô mắt", icdCode: "H04.1", isPrimary: false },
      ],
      summaryPills: ["Cận thị 2 mắt", "Khô mắt nhẹ"],
      measurements: {
        date: "15/01/2026",
        va: {
          od: { sc: "20/40", cc: "20/25", ph: "20/20", iop: "15" },
          os: { sc: "20/30", cc: "20/20", ph: "20/20", iop: "14" },
        },
        refraction: {
          od: { sph: "-2.50", cyl: "-0.75", axis: "180" },
          os: { sph: "-2.75", cyl: "-0.75", axis: "5" },
        },
        dryEye: {
          osdiScore: 18,
          osdiMax: 30,
          osdiSeverity: "Trung bình",
          od: { tbut: "7s", schirmer: "12mm", meibomian: "Tắc nhẹ" },
          os: { tbut: "8s", schirmer: "10mm", meibomian: "BT" },
        },
        slitLamp: "Tất cả bình thường",
        fundus: "BT · C/D 0.3 / 0.3",
      },
      medications: [
        {
          name: "Refresh Tears 0.5%",
          description: "Nước mắt nhân tạo",
          dosage: "1 giọt",
          frequency: "3 lần/ngày",
          eye: "OU",
          duration: "3 tháng",
          prescribedDate: "15/01/2026",
          doctor: "BS. Nguyễn Thị Mai",
        },
        {
          name: "Systane Ultra",
          description: "Gel bôi trơn mắt",
          dosage: "1 giọt",
          frequency: "Khi cần",
          eye: "OU",
          duration: "3 tháng",
          prescribedDate: "15/01/2026",
          doctor: "BS. Nguyễn Thị Mai",
        },
      ],
      instructions: "Giảm screen time. Nhỏ nước mắt đều.",
      followUp: "15/03/2026",
      followUpOverdue: true,
    },
    {
      id: "v2",
      date: "20/09/2025",
      diseaseGroup: "refraction",
      doctorName: "BS. Trần Văn Hùng",
      daysAgo: 196,
      diagnoses: [
        { text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true },
      ],
      summaryPills: ["Cận thị 2 mắt"],
      measurements: {
        date: "20/09/2025",
        va: {
          od: { sc: "20/30", cc: "20/25", ph: "", iop: "14" },
          os: { sc: "20/25", cc: "20/20", ph: "", iop: "14" },
        },
        refraction: {
          od: { sph: "-2.25", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.50", cyl: "-0.75", axis: "5" },
        },
        slitLamp: "",
        fundus: "",
      },
      medications: [],
      instructions: "Đeo kính đúng số. Tái khám sau 6 tháng.",
      followUp: null,
      followUpOverdue: false,
    },
    {
      id: "v1",
      date: "10/03/2025",
      diseaseGroup: "general",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: null,
      diagnoses: [
        { text: "Cận thị", icdCode: "H52.1", isPrimary: true },
      ],
      summaryPills: ["Cận thị"],
      measurements: {
        date: "10/03/2025",
        va: {
          od: { sc: "20/30", cc: "20/20", ph: "", iop: "14" },
          os: { sc: "20/25", cc: "20/20", ph: "", iop: "13" },
        },
        refraction: {
          od: { sph: "-2.00", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.25", cyl: "-0.50", axis: "5" },
        },
        slitLamp: "",
        fundus: "",
      },
      medications: [],
      instructions: null,
      followUp: null,
      followUpOverdue: false,
    },
  ],
  trends: [
    {
      id: "va-sc",
      title: "Thị lực SC (không kính)",
      unit: "Snellen",
      data: [
        { date: "03/2025", od: 0.67, os: 0.8 },
        { date: "09/2025", od: 0.67, os: 0.8 },
        { date: "01/2026", od: 0.5, os: 0.67 },
      ],
      invertY: true,
      yLabels: ["20/20", "20/30", "20/40", "20/50"],
    },
    {
      id: "iop",
      title: "Nhãn áp (IOP mmHg)",
      unit: "mmHg",
      threshold: { value: 21, label: "Ngưỡng 21" },
      data: [
        { date: "03/2025", od: 14, os: 13 },
        { date: "09/2025", od: 14, os: 14 },
        { date: "01/2026", od: 15, os: 14 },
      ],
      yLabels: ["22", "18", "14", "10"],
    },
    {
      id: "sphere",
      title: "Khúc xạ (Sphere)",
      unit: "D",
      data: [
        { date: "03/2025", od: -2.0, os: -2.25 },
        { date: "09/2025", od: -2.25, os: -2.5 },
        { date: "01/2026", od: -2.5, os: -2.75 },
      ],
      yLabels: ["-1.0", "-2.0", "-2.5", "-3.0"],
    },
    {
      id: "tbut",
      title: "TBUT (giây)",
      unit: "s",
      threshold: { value: 5, label: "Ngưỡng 5s" },
      data: [
        { date: "09/2025", od: null, os: null },
        { date: "01/2026", od: 7, os: 8 },
      ],
      yLabels: ["15", "10", "5", "0"],
    },
  ],
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-patient-detail.ts
git commit -m "feat(patient-detail): add mock data types and sample data"
```

---

### Task 2: Sticky Header Hook

**Files:**
- Create: `src/hooks/use-sticky-header.ts`

- [ ] **Step 1: Create the IntersectionObserver hook**

```typescript
// src/hooks/use-sticky-header.ts
import { useEffect, useRef, useState } from "react"

export function useStickyHeader() {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCollapsed(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  return { sentinelRef, isCollapsed }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/use-sticky-header.ts
git commit -m "feat(patient-detail): add sticky header intersection observer hook"
```

---

### Task 3: Patient Header Component

**Files:**
- Create: `src/components/patients/detail/patient-header.tsx`

- [ ] **Step 1: Create the header component with expanded and collapsed states**

```typescript
// src/components/patients/detail/patient-header.tsx
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit02Icon,
  Download04Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { PatientPersonalInfo, PatientDetailAlert } from "@/data/mock-patient-detail"

const ALERT_STYLES: Record<string, string> = {
  allergy: "bg-[#FCEBEB] text-[#791F1F]",
  eyeDisease: "bg-[#E6F1FB] text-[#0C447C]",
  osdi: "bg-[#FAEEDA] text-[#633806]",
  redFlag: "bg-[#FCEBEB] text-[#791F1F]",
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  return words
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

interface PatientDetailHeaderProps {
  patient: PatientPersonalInfo
  alerts: PatientDetailAlert[]
  isCollapsed: boolean
}

export function PatientDetailHeader({
  patient,
  alerts,
  isCollapsed,
}: PatientDetailHeaderProps) {
  const navigate = useNavigate()
  const initials = getInitials(patient.name)

  if (isCollapsed) {
    return (
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
            >
              {initials}
            </div>
            <span className="text-[15px] font-medium">{patient.name}</span>
            <span className="text-xs text-muted-foreground">{patient.id}</span>
            {alerts.some((a) => a.type === "allergy") && (
              <span className="rounded-full bg-[#FCEBEB] px-2 py-0.5 text-[10px] font-medium text-[#791F1F]">
                Dị ứng
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Chỉnh sửa
            </Button>
            <Button
              size="sm"
              className="h-7 bg-[#1D9E75] text-xs text-white hover:bg-[#0F6E56]"
            >
              Tạo lượt khám
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-border pb-[18px]">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("/patients")}
        className="mb-4 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Danh sách bệnh nhân
      </button>

      {/* Header content */}
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium"
          style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
        >
          {initials}
        </div>

        <div className="flex-1">
          {/* Line 1: Name + ID + Actions */}
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[21px] font-medium">{patient.name}</span>
              <span className="text-[13px] text-muted-foreground">{patient.id}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <HugeiconsIcon icon={PencilEdit02Icon} className="size-3.5" strokeWidth={1.5} />
                Chỉnh sửa
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5">
                <HugeiconsIcon icon={Download04Icon} className="size-3.5" strokeWidth={1.5} />
                Xuất PDF
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-[#1D9E75] text-white hover:bg-[#0F6E56]"
              >
                <HugeiconsIcon icon={Stethoscope02Icon} className="size-3.5" strokeWidth={1.5} />
                Tạo lượt khám
              </Button>
            </div>
          </div>

          {/* Line 2: Meta + Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-muted-foreground">
              {patient.gender}, {patient.age} tuổi ({patient.dob})
            </span>
            <span className="text-[13px] text-muted-foreground">{patient.phone}</span>
            {alerts.length > 0 && (
              <span className="h-3.5 w-px bg-border" />
            )}
            {alerts.slice(0, 5).map((alert, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  ALERT_STYLES[alert.type]
                )}
              >
                {alert.label}
              </span>
            ))}
            {alerts.length > 5 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{alerts.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/patient-header.tsx
git commit -m "feat(patient-detail): add patient header with expanded/collapsed states"
```

---

### Task 4: Stat Cards Component

**Files:**
- Create: `src/components/patients/detail/stat-cards.tsx`

- [ ] **Step 1: Create stat cards grid**

```typescript
// src/components/patients/detail/stat-cards.tsx
import { cn } from "@/lib/utils"
import type { PatientDetailStat } from "@/data/mock-patient-detail"

interface StatCardsProps {
  stats: PatientDetailStat
}

export function StatCards({ stats }: StatCardsProps) {
  const isOverdue = stats.followUpDaysRemaining !== null && stats.followUpDaysRemaining < 0

  const cards = [
    {
      label: "Tổng lần khám",
      value: String(stats.totalVisits),
      subtext: `Lần đầu: ${stats.firstVisitDate}`,
      large: true,
    },
    {
      label: "Lần khám gần nhất",
      value: stats.lastVisitDate,
      subtext: stats.lastVisitDoctor,
      large: true,
    },
    {
      label: "Chẩn đoán hiện tại",
      value: stats.currentDiagnosis,
      subtext: [stats.currentDiagnosisIcd, stats.secondaryDiagnosis]
        .filter(Boolean)
        .join(" · "),
      large: false,
    },
    {
      label: "Tái khám tiếp theo",
      value: stats.nextFollowUp ?? "Không có",
      subtext: stats.followUpDate
        ? `Hẹn ${stats.followUpDate}${stats.followUpDaysRemaining !== null ? ` · ${Math.abs(stats.followUpDaysRemaining)} ngày` : ""}`
        : "",
      large: false,
      isOverdue,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[10px] bg-muted/50 px-4 py-3.5"
        >
          <div className="mb-1 text-[11px] tracking-wide text-muted-foreground">
            {card.label}
          </div>
          <div
            className={cn(
              "font-medium leading-tight",
              card.large ? "text-[22px]" : "text-sm",
              card.isOverdue && "text-[#A32D2D]"
            )}
          >
            {card.value}
          </div>
          {card.subtext && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              {card.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/stat-cards.tsx
git commit -m "feat(patient-detail): add stat cards grid component"
```

---

### Task 5: Measurement Block Component

**Files:**
- Create: `src/components/patients/detail/measurement-block.tsx`

- [ ] **Step 1: Create reusable measurement block**

```typescript
// src/components/patients/detail/measurement-block.tsx
interface MeasurementBlockProps {
  label: string
  children: React.ReactNode
}

export function MeasurementBlock({ label, children }: MeasurementBlockProps) {
  return (
    <div className="rounded-[10px] bg-muted/50 p-3.5">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="space-y-1 text-[13px]">{children}</div>
    </div>
  )
}

export function OdOsRow({
  eye,
  children,
}: {
  eye: "OD" | "OS"
  children: React.ReactNode
}) {
  return (
    <div>
      <b
        className="font-medium"
        style={{ color: eye === "OD" ? "#185FA5" : "#993C1D" }}
      >
        {eye}
      </b>
      {"  "}
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/measurement-block.tsx
git commit -m "feat(patient-detail): add reusable measurement block component"
```

---

### Task 6: Tab Tổng quan

**Files:**
- Create: `src/components/patients/detail/tab-overview.tsx`

- [ ] **Step 1: Create the overview tab with all 5 sections**

```typescript
// src/components/patients/detail/tab-overview.tsx
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import type {
  PatientPersonalInfo,
  MedicalHistory,
  CurrentMedication,
  OpticalRx,
  DiagnosisRecord,
  MeasurementData,
} from "@/data/mock-patient-detail"

interface TabOverviewProps {
  personal: PatientPersonalInfo
  medicalHistory: MedicalHistory
  medications: CurrentMedication[]
  opticalRx: OpticalRx | null
  diagnosisHistory: DiagnosisRecord[]
  measurements: MeasurementData | null
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-[13px]">
      <span className="w-[110px] shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function TabOverview({
  personal,
  medicalHistory,
  medications,
  opticalRx,
  diagnosisHistory,
  measurements,
}: TabOverviewProps) {
  return (
    <div className="space-y-5">
      {/* Section 1: Personal info + Medical history (2-col grid) */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Personal info card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Thông tin cá nhân
          </div>
          <div className="space-y-1.5">
            <KvRow label="Họ tên" value={personal.name} />
            <KvRow label="Ngày sinh" value={`${personal.dob} (${personal.age} tuổi)`} />
            <KvRow label="Giới tính" value={personal.gender} />
            <KvRow label="Điện thoại" value={personal.phone} />
            <KvRow label="Địa chỉ" value={personal.address} />
            <KvRow label="Nghề nghiệp" value={personal.occupation} />
            <KvRow label="BHYT" value={personal.insurance ?? "—"} />
            <KvRow label="LH khẩn cấp" value={personal.emergencyContact ?? "—"} />
          </div>
        </div>

        {/* Medical history card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Tiền sử & dị ứng
          </div>

          <div className="mb-1.5 text-xs font-medium">Bệnh mắt</div>
          <div className="mb-1 flex flex-wrap gap-1.5">
            {medicalHistory.eyeDiseases.map((d) => (
              <span key={d} className="rounded-full bg-[#E6F1FB] px-2.5 py-0.5 text-[11px] font-medium text-[#0C447C]">
                {d}
              </span>
            ))}
          </div>
          {medicalHistory.eyeNotes && (
            <div className="mb-3 text-xs text-muted-foreground">{medicalHistory.eyeNotes}</div>
          )}

          <div className="mb-1.5 text-xs font-medium">Dị ứng</div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {medicalHistory.allergies.length > 0 ? (
              medicalHistory.allergies.map((a) => (
                <span key={a} className="rounded-full bg-[#FCEBEB] px-2.5 py-0.5 text-[11px] font-medium text-[#791F1F]">
                  {a}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-muted-foreground">Không có</span>
            )}
          </div>

          <div className="mb-1.5 text-xs font-medium">Toàn thân</div>
          <div className="text-[13px]">
            {medicalHistory.systemicHistory ?? "Không có bệnh nền"}
          </div>
        </div>
      </div>

      {/* Section 2: Current medications */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Đơn thuốc hiện tại</h3>
        {medications.length > 0 ? (
          <div className="rounded-xl border border-border px-5 py-3">
            {medications.map((med, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start justify-between py-2.5",
                  i < medications.length - 1 && "border-b border-border"
                )}
              >
                <div>
                  <div className="text-[13px] font-medium">{med.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{med.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-medium">
                    {med.dosage} · {med.frequency}
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {med.eye}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {med.duration} · Kê {med.prescribedDate} · {med.doctor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-5 text-center text-[13px] text-muted-foreground">
            Không có đơn thuốc hiện tại
          </div>
        )}
      </div>

      {/* Section 3: Current optical Rx */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Đơn kính hiện tại</h3>
        {opticalRx ? (
          <div className="rounded-xl border border-border px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* OD */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#185FA5" }}>
                  <span className="inline-block size-2 rounded-full" style={{ background: "#378ADD" }} />
                  Mắt phải (OD)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-[10px] text-muted-foreground">Sph</div><div className="text-[15px] font-medium">{opticalRx.od.sph}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">Cyl</div><div className="text-[15px] font-medium">{opticalRx.od.cyl}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">Axis</div><div className="text-[15px] font-medium">{opticalRx.od.axis}</div></div>
                </div>
              </div>
              {/* OS */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium" style={{ color: "#993C1D" }}>
                  <span className="inline-block size-2 rounded-full" style={{ background: "#D85A30" }} />
                  Mắt trái (OS)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-[10px] text-muted-foreground">Sph</div><div className="text-[15px] font-medium">{opticalRx.os.sph}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">Cyl</div><div className="text-[15px] font-medium">{opticalRx.os.cyl}</div></div>
                  <div><div className="text-[10px] text-muted-foreground">Axis</div><div className="text-[15px] font-medium">{opticalRx.os.axis}</div></div>
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex gap-5 border-t border-border pt-3.5 text-[13px]">
              <span><span className="text-muted-foreground">PD </span>{opticalRx.pd} mm</span>
              <span><span className="text-muted-foreground">Loại </span>{opticalRx.lensType}</span>
              <span><span className="text-muted-foreground">Kê </span>{opticalRx.prescribedDate} · {opticalRx.doctor}</span>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center text-[13px] text-muted-foreground">
            Không có đơn kính hiện tại
          </div>
        )}
      </div>

      {/* Section 4: Diagnosis history */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Lịch sử chẩn đoán</h3>
        <div className="rounded-xl border border-border px-5 py-3">
          {diagnosisHistory.map((dx, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 py-2",
                i < diagnosisHistory.length - 1 && "border-b border-border"
              )}
            >
              <span
                className={cn(
                  "rounded-[5px] px-2 py-0.5 text-[10px] font-medium",
                  dx.type === "primary"
                    ? "bg-[#E6F1FB] text-[#0C447C]"
                    : "bg-[#F1EFE8] text-[#444441]"
                )}
              >
                {dx.type === "primary" ? "Chính" : "Phụ"}
              </span>
              <span className="flex-1 text-[13px]">{dx.name}</span>
              <span className="text-xs text-muted-foreground">{dx.icdCode}</span>
              <span className="text-[11px] text-muted-foreground">
                {dx.firstSeen} → {dx.lastSeen ?? "Hiện tại"}
                {dx.visitCount > 1 && ` · ${dx.visitCount} lần`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Latest measurements */}
      {measurements && (
        <div>
          <h3 className="mb-3 text-[15px] font-medium">
            Số đo gần nhất — {measurements.date}
          </h3>
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Thị lực & nhãn áp">
              <OdOsRow eye="OD">
                SC {measurements.va.od.sc} · CC {measurements.va.od.cc}
                {measurements.va.od.ph && ` · PH ${measurements.va.od.ph}`} · IOP{" "}
                {measurements.va.od.iop}
              </OdOsRow>
              <OdOsRow eye="OS">
                SC {measurements.va.os.sc} · CC {measurements.va.os.cc}
                {measurements.va.os.ph && ` · PH ${measurements.va.os.ph}`} · IOP{" "}
                {measurements.va.os.iop}
              </OdOsRow>
            </MeasurementBlock>

            <MeasurementBlock label="Khúc xạ (Auto-Ref)">
              <OdOsRow eye="OD">
                {measurements.refraction.od.sph} / {measurements.refraction.od.cyl} x{" "}
                {measurements.refraction.od.axis}
              </OdOsRow>
              <OdOsRow eye="OS">
                {measurements.refraction.os.sph} / {measurements.refraction.os.cyl} x{" "}
                {measurements.refraction.os.axis}
              </OdOsRow>
            </MeasurementBlock>

            {measurements.dryEye && (
              <MeasurementBlock label="Khô mắt (Dry Eye)">
                <div>
                  <b className="font-medium">OSDI-6:</b> {measurements.dryEye.osdiScore}/
                  {measurements.dryEye.osdiMax}{" "}
                  <span className="rounded bg-[#FAEEDA] px-1.5 py-px text-[10px] font-medium text-[#633806]">
                    {measurements.dryEye.osdiSeverity}
                  </span>
                </div>
                <OdOsRow eye="OD">
                  TBUT {measurements.dryEye.od.tbut} · Schirmer{" "}
                  {measurements.dryEye.od.schirmer} · Meibomian:{" "}
                  {measurements.dryEye.od.meibomian}
                </OdOsRow>
                <OdOsRow eye="OS">
                  TBUT {measurements.dryEye.os.tbut} · Schirmer{" "}
                  {measurements.dryEye.os.schirmer} · Meibomian:{" "}
                  {measurements.dryEye.os.meibomian}
                </OdOsRow>
              </MeasurementBlock>
            )}

            <MeasurementBlock label="Sinh hiển vi & đáy mắt">
              <div>Slit-lamp: {measurements.slitLamp}</div>
              <div>Fundus: {measurements.fundus}</div>
            </MeasurementBlock>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/tab-overview.tsx
git commit -m "feat(patient-detail): add overview tab with all 5 sections"
```

---

### Task 7: Visit Detail Panel

**Files:**
- Create: `src/components/patients/detail/visit-detail-panel.tsx`

- [ ] **Step 1: Create the visit detail panel (right side of master-detail)**

```typescript
// src/components/patients/detail/visit-detail-panel.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface VisitDetailPanelProps {
  visit: VisitRecord
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]
  const m = visit.measurements

  return (
    <div className="flex-1 overflow-y-auto py-4 pl-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-[17px] font-medium">
            {visit.date}
            <span className={cn("rounded-[5px] px-2.5 py-0.5 text-[10px] font-medium", groupConfig.colorClass)}>
              {groupConfig.label}
            </span>
          </div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            {visit.doctorName} · {visit.daysAgo !== null ? `${visit.daysAgo} ngày trước` : "Khám lần đầu"}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs">In phiếu</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">Xuất PDF</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs font-medium">Xem đầy đủ</Button>
        </div>
      </div>

      {/* Diagnosis pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {visit.diagnoses.map((dx, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              dx.isPrimary
                ? "bg-[#E6F1FB] text-[#0C447C]"
                : "bg-[#F1EFE8] text-[#444441]"
            )}
          >
            {dx.text} · {dx.icdCode}
          </span>
        ))}
      </div>

      {/* Measurement blocks */}
      <div className="space-y-2.5">
        <div className="grid gap-2.5 md:grid-cols-2">
          <MeasurementBlock label="Thị lực & nhãn áp">
            <OdOsRow eye="OD">
              SC {m.va.od.sc} · CC {m.va.od.cc}
              {m.va.od.ph && ` · PH ${m.va.od.ph}`} · IOP {m.va.od.iop}
            </OdOsRow>
            <OdOsRow eye="OS">
              SC {m.va.os.sc} · CC {m.va.os.cc}
              {m.va.os.ph && ` · PH ${m.va.os.ph}`} · IOP {m.va.os.iop}
            </OdOsRow>
          </MeasurementBlock>

          <MeasurementBlock label="Khúc xạ">
            <OdOsRow eye="OD">
              {m.refraction.od.sph} / {m.refraction.od.cyl} x {m.refraction.od.axis}°
            </OdOsRow>
            <OdOsRow eye="OS">
              {m.refraction.os.sph} / {m.refraction.os.cyl} x {m.refraction.os.axis}°
            </OdOsRow>
          </MeasurementBlock>
        </div>

        {m.dryEye && (
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Khô mắt">
              <div>
                OSDI-6: {m.dryEye.osdiScore}/{m.dryEye.osdiMax} ({m.dryEye.osdiSeverity})
              </div>
              <OdOsRow eye="OD">
                TBUT {m.dryEye.od.tbut} · Schirmer {m.dryEye.od.schirmer} · Meibomian: {m.dryEye.od.meibomian}
              </OdOsRow>
              <OdOsRow eye="OS">
                TBUT {m.dryEye.os.tbut} · Schirmer {m.dryEye.os.schirmer} · Meibomian: {m.dryEye.os.meibomian}
              </OdOsRow>
            </MeasurementBlock>

            {(m.slitLamp || m.fundus) && (
              <MeasurementBlock label="Khám lâm sàng">
                {m.slitLamp && <div>Slit-lamp: {m.slitLamp}</div>}
                {m.fundus && <div>Fundus: {m.fundus}</div>}
              </MeasurementBlock>
            )}
          </div>
        )}

        {!m.dryEye && (m.slitLamp || m.fundus) && (
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Khám lâm sàng">
              {m.slitLamp && <div>Slit-lamp: {m.slitLamp}</div>}
              {m.fundus && <div>Fundus: {m.fundus}</div>}
            </MeasurementBlock>
            <div /> {/* empty grid cell */}
          </div>
        )}

        <div className="grid gap-2.5 md:grid-cols-2">
          <MeasurementBlock label="Đơn thuốc">
            {visit.medications.length > 0 ? (
              visit.medications.map((med, i) => (
                <div key={i}>
                  {med.name} — {med.dosage} {med.frequency} — {med.eye} — {med.duration}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">Không có đơn thuốc</div>
            )}
          </MeasurementBlock>

          <MeasurementBlock label="Dặn dò & tái khám">
            {visit.instructions && <div>{visit.instructions}</div>}
            {visit.followUp && (
              <div className={cn("font-medium", visit.followUpOverdue && "text-[#A32D2D]")}>
                Tái khám: {visit.followUp}
                {visit.followUpOverdue && " (quá hạn)"}
              </div>
            )}
            {!visit.instructions && !visit.followUp && (
              <div className="text-muted-foreground">Không có</div>
            )}
          </MeasurementBlock>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/visit-detail-panel.tsx
git commit -m "feat(patient-detail): add visit detail panel component"
```

---

### Task 8: Tab Lịch sử khám (Master-Detail)

**Files:**
- Create: `src/components/patients/detail/tab-visits.tsx`

- [ ] **Step 1: Create the master-detail visit history tab**

```typescript
// src/components/patients/detail/tab-visits.tsx
import { useState } from "react"
import { cn } from "@/lib/utils"
import { VisitDetailPanel } from "./visit-detail-panel"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface TabVisitsProps {
  visits: VisitRecord[]
}

export function TabVisits({ visits }: TabVisitsProps) {
  const [selectedId, setSelectedId] = useState<string>(visits[0]?.id ?? "")
  const selectedVisit = visits.find((v) => v.id === selectedId)

  if (visits.length === 0) {
    return (
      <div className="py-12 text-center text-[13px] text-muted-foreground">
        Bệnh nhân chưa có lần khám nào
      </div>
    )
  }

  return (
    <div className="flex min-h-[400px]">
      {/* Left: Timeline list */}
      <div className="w-[240px] shrink-0 border-r border-border pl-3">
        <div className="relative pl-5">
          {/* Timeline line */}
          <div className="absolute bottom-0 left-[6px] top-0 w-px bg-border" />

          {visits.map((visit) => {
            const isSelected = visit.id === selectedId
            const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]

            return (
              <div
                key={visit.id}
                className="relative cursor-pointer"
                onClick={() => setSelectedId(visit.id)}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute -left-5 top-3.5 size-[11px] rounded-full border-2",
                    isSelected
                      ? "border-[#378ADD] bg-[#E6F1FB]"
                      : "border-border bg-background"
                  )}
                />

                <div
                  className={cn(
                    "mr-2 rounded-r-md py-2.5 pr-3",
                    isSelected && "bg-[#F0F7FF]"
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="text-[13px] font-medium">{visit.date}</span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-px text-[9px] font-medium",
                        groupConfig.colorClass
                      )}
                    >
                      {groupConfig.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {visit.doctorName}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Detail panel */}
      {selectedVisit && <VisitDetailPanel visit={selectedVisit} />}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/tab-visits.tsx
git commit -m "feat(patient-detail): add visit history tab with master-detail layout"
```

---

### Task 9: Tab Xu hướng (Trend Charts)

**Files:**
- Create: `src/components/patients/detail/tab-trends.tsx`

- [ ] **Step 1: Create the trend charts tab with SVG line charts**

```typescript
// src/components/patients/detail/tab-trends.tsx
import type { TrendChart, TrendDataPoint } from "@/data/mock-patient-detail"

interface TabTrendsProps {
  charts: TrendChart[]
}

const CHART_W = 400
const CHART_H = 140
const PADDING_LEFT = 0
const PADDING_RIGHT = 40

function getX(index: number, total: number): number {
  if (total <= 1) return CHART_W / 2
  const usable = CHART_W - PADDING_LEFT - PADDING_RIGHT
  return PADDING_LEFT + PADDING_RIGHT / 2 + (index / (total - 1)) * usable
}

function getY(value: number, min: number, max: number): number {
  if (max === min) return CHART_H / 2
  return CHART_H - ((value - min) / (max - min)) * CHART_H
}

function TrendChartCard({ chart }: { chart: TrendChart }) {
  const validPoints = chart.data.filter(
    (d) => d.od !== null || d.os !== null
  )
  if (validPoints.length === 0) return null

  // Calculate Y range from yLabels
  const yValues = chart.yLabels.map(Number).filter((n) => !isNaN(n))
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  const odPoints: { x: number; y: number }[] = []
  const osPoints: { x: number; y: number }[] = []

  chart.data.forEach((d, i) => {
    const x = getX(i, chart.data.length)
    if (d.od !== null) {
      const yVal = chart.invertY ? yMax - (d.od - yMin) + yMin : d.od
      odPoints.push({ x, y: getY(yVal, yMin, yMax) })
    }
    if (d.os !== null) {
      const yVal = chart.invertY ? yMax - (d.os - yMin) + yMin : d.os
      osPoints.push({ x, y: getY(yVal, yMin, yMax) })
    }
  })

  const thresholdY = chart.threshold
    ? getY(
        chart.invertY
          ? yMax - (chart.threshold.value - yMin) + yMin
          : chart.threshold.value,
        yMin,
        yMax
      )
    : null

  return (
    <div className="rounded-xl border border-border px-5 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium">{chart.title}</span>
        <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: "#378ADD" }} />
            OD
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 rounded-full" style={{ background: "#D85A30" }} />
            OS
          </span>
          {chart.threshold && (
            <span style={{ color: "#A32D2D" }}>{chart.threshold.label}</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: CHART_H, marginLeft: 32 }}>
        {/* Y-axis labels */}
        {chart.yLabels.map((label, i) => {
          const pct = i / (chart.yLabels.length - 1)
          return (
            <div
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{
                left: -32,
                top: `calc(${pct * 100}% - 6px)`,
                width: 27,
                textAlign: "right",
              }}
            >
              {label}
            </div>
          )
        })}

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="size-full"
          style={{ borderLeft: "0.5px solid var(--color-border)", borderBottom: "0.5px solid var(--color-border)" }}
        >
          {/* Grid lines */}
          {[1, 2].map((i) => {
            const y = (CHART_H / 3) * i
            return (
              <line
                key={i}
                x1={0}
                y1={y}
                x2={CHART_W}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={0.5}
                strokeDasharray="4"
              />
            )
          })}

          {/* Threshold line */}
          {thresholdY !== null && (
            <line
              x1={0}
              y1={thresholdY}
              x2={CHART_W}
              y2={thresholdY}
              stroke="#E24B4A"
              strokeWidth={1}
              strokeDasharray="6,3"
              opacity={0.4}
            />
          )}

          {/* OD line (solid) */}
          {odPoints.length > 1 && (
            <polyline
              points={odPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#378ADD"
              strokeWidth={2}
            />
          )}
          {odPoints.map((p, i) => (
            <circle
              key={`od-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={i === odPoints.length - 1 ? "#fff" : "#378ADD"}
              stroke="#378ADD"
              strokeWidth={i === odPoints.length - 1 ? 2 : 0}
            />
          ))}

          {/* OS line (dashed) */}
          {osPoints.length > 1 && (
            <polyline
              points={osPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#D85A30"
              strokeWidth={2}
              strokeDasharray="6,3"
            />
          )}
          {osPoints.map((p, i) => (
            <circle
              key={`os-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={i === osPoints.length - 1 ? "#fff" : "#D85A30"}
              stroke="#D85A30"
              strokeWidth={i === osPoints.length - 1 ? 2 : 0}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div
        className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"
        style={{ marginLeft: 32 }}
      >
        {chart.data.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  )
}

export function TabTrends({ charts }: TabTrendsProps) {
  if (charts.length === 0) {
    return (
      <div className="py-12 text-center text-[13px] text-muted-foreground">
        Cần ít nhất 1 lần khám để hiển thị xu hướng
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((chart) => (
        <TrendChartCard key={chart.id} chart={chart} />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/patients/detail/tab-trends.tsx
git commit -m "feat(patient-detail): add trend charts tab with responsive grid"
```

---

### Task 10: Main Page Component (Orchestrator)

**Files:**
- Modify: `src/pages/patients/detail.tsx`

- [ ] **Step 1: Replace the placeholder page with the full patient detail page**

```typescript
// src/pages/patients/detail.tsx
import { useState } from "react"
import { useParams } from "react-router"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useStickyHeader } from "@/hooks/use-sticky-header"
import { MOCK_PATIENT_DETAIL } from "@/data/mock-patient-detail"
import { PatientDetailHeader } from "@/components/patients/detail/patient-header"
import { StatCards } from "@/components/patients/detail/stat-cards"
import { TabOverview } from "@/components/patients/detail/tab-overview"
import { TabVisits } from "@/components/patients/detail/tab-visits"
import { TabTrends } from "@/components/patients/detail/tab-trends"

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const { sentinelRef, isCollapsed } = useStickyHeader()
  const [activeTab, setActiveTab] = useState("overview")

  // In a real app, fetch by id. For now, use mock data.
  const data = MOCK_PATIENT_DETAIL

  return (
    <div className="flex-1">
      {/* Sticky header (collapsed) — fixed at top when scrolled */}
      {isCollapsed && (
        <div className="sticky top-0 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
          <PatientDetailHeader
            patient={data.personal}
            alerts={data.alerts}
            isCollapsed={true}
          />
          <div className="border-b border-border bg-background">
            <div className="mx-auto max-w-[960px] px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line" className="h-10">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="visits">Lịch sử khám</TabsTrigger>
                  <TabsTrigger value="trends">Xu hướng</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="mx-auto max-w-[960px] px-6 py-6">
        {/* Expanded header */}
        {!isCollapsed && (
          <PatientDetailHeader
            patient={data.personal}
            alerts={data.alerts}
            isCollapsed={false}
          />
        )}

        {/* Stat cards + sentinel for intersection observer */}
        <div ref={sentinelRef} className="py-[18px]">
          <StatCards stats={data.stats} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {!isCollapsed && (
            <TabsList variant="line" className="mb-5 h-10">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="visits">Lịch sử khám</TabsTrigger>
              <TabsTrigger value="trends">Xu hướng</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview">
            <TabOverview
              personal={data.personal}
              medicalHistory={data.medicalHistory}
              medications={data.currentMedications}
              opticalRx={data.opticalRx}
              diagnosisHistory={data.diagnosisHistory}
              measurements={data.latestMeasurements}
            />
          </TabsContent>

          <TabsContent value="visits">
            <TabVisits visits={data.visits} />
          </TabsContent>

          <TabsContent value="trends">
            <TabTrends charts={data.trends} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run typecheck`
Expected: No TypeScript errors

- [ ] **Step 3: Verify the dev server renders the page**

Run: `npm run dev`
Navigate to: `http://localhost:3000/patients/GK-2026-0001` (or any ID)
Expected: Full patient detail page renders with header, stat cards, 3 tabs

- [ ] **Step 4: Commit**

```bash
git add src/pages/patients/detail.tsx
git commit -m "feat(patient-detail): wire up full page with sticky header, stat cards, and tabs"
```

---

### Task 11: Visual Polish Pass

**Files:**
- Modify: All components created above as needed

- [ ] **Step 1: Run dev server and visually verify each section**

Run: `npm run dev`
Navigate to: `http://localhost:3000/patients/GK-2026-0001`

Check each section against the design spec and HTML mockup (`docs/patients/patient_detail_v4_polished.html`):

1. Header — avatar, name, ID, meta, alert pills, action buttons
2. Stat cards — 4 cards in a row, proper colors for "Quá hạn"
3. Tab: Tổng quan — personal info, medical history, medications, optical Rx, diagnoses, measurements
4. Tab: Lịch sử khám — timeline dots on left, detail panel on right, selected state
5. Tab: Xu hướng — 2-col grid of charts, OD/OS lines, threshold lines

Fix any spacing, color, or layout issues found during review.

- [ ] **Step 2: Test sticky header collapse behavior**

Scroll down the page. Verify:
- Header collapses to slim bar when stat cards exit viewport
- Collapsed header shows avatar, name, allergy pill, action buttons, tabs
- Clicking tabs in collapsed state switches content
- Scrolling back to top restores expanded header

- [ ] **Step 3: Test tab switching**

Click each tab and verify:
- Content switches correctly
- Active tab has underline indicator
- Visit history default-selects the most recent visit
- Trend charts render with correct data

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix(patient-detail): visual polish and layout adjustments"
```

---

### Task 12: Final Build Verification

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: 0 errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (warnings acceptable)

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit if any lint/type fixes were needed**

```bash
git add -A
git commit -m "fix(patient-detail): resolve lint and type issues"
```
