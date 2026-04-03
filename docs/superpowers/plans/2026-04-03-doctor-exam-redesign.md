# Doctor Exam Page — 4-Tab Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the doctor exam page from a 2-panel layout to a 4-tab sidebar layout with Patient Header, Patient Info, Pre-Exam, Requests, and Exam & Conclusion tabs.

**Architecture:** Fixed patient header at top, 175px left sidebar with 4 vertical tabs, scrollable content area on the right. Each tab is a separate component. State managed in the page component and passed down as props.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui components (Button, Input, Textarea, Badge, Select, Dialog), HugeIcons

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/mock-patients.ts` | Modify | Add new types (SlitLampExam, FundusExam, VisitRequest, etc.), update ExamData, add mock visit history data |
| `src/pages/doctor/exam.tsx` | Rewrite | New layout shell: PatientHeader + ExamSidebar + tab content area, state management |
| `src/components/doctor/patient-header.tsx` | Create | Fixed header: avatar, patient info, visit type badge, action buttons |
| `src/components/doctor/exam-sidebar.tsx` | Create | 175px sidebar with 4 vertical tab items + request badge |
| `src/components/doctor/tab-patient.tsx` | Create | Tab 1: admin info key-value grid + visit history cards |
| `src/components/doctor/tab-pre-exam.tsx` | Create | Tab 2: chief complaint, history, screening, VA/IOP/AutoRef value cards |
| `src/components/doctor/tab-requests.tsx` | Create | Tab 3: request creation form + request cards with status/results |
| `src/components/doctor/tab-exam.tsx` | Create | Tab 4: slit-lamp, fundus, diagnosis, optional sections (meds, optical, follow-up) |
| `src/components/doctor/patient-panel.tsx` | Delete | Replaced by patient-header + tab-patient |
| `src/components/doctor/screening-data.tsx` | Delete | Absorbed into tab-pre-exam |
| `src/components/doctor/exam-findings.tsx` | Delete | Replaced by tab-exam structured fields |
| `src/components/doctor/treatment-plan.tsx` | Delete | Absorbed into tab-exam optional sections |
| `src/components/doctor/diagnosis-input.tsx` | Keep | Used inside tab-exam, no changes |

---

## Task 1: Update data types and mock data

**Files:**
- Modify: `src/data/mock-patients.ts`

- [ ] **Step 1: Add new type definitions**

Add these types after the existing `RefractionData` interface (around line 136), replacing `DryEyeExamData`, `RefractionData`, and `OpticalRxData`:

```typescript
export interface SlitLampEye {
  lids: string
  conjunctiva: string
  cornea: string
  anteriorChamber: string
  iris: string
  lens: string
  notes: string
}

export interface SlitLampExam {
  od: SlitLampEye
  os: SlitLampEye
}

export interface FundusEye {
  opticDisc: string
  cdRatio: string
  macula: string
  vessels: string
  peripheralRetina: string
  notes: string
}

export interface FundusExam {
  od: FundusEye
  os: FundusEye
}

export type RequestStatus = "pending" | "in_progress" | "completed" | "cancelled"

export interface SubjectiveRefractionResult {
  od: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
}

export interface GenericResult {
  conclusion: string
}

export interface VisitRequest {
  id: string
  type: string
  priority: "normal" | "urgent"
  status: RequestStatus
  notesForTech: string
  requestedAt: string
  completedAt?: string
  assignedTo?: string
  result?: {
    type: "subjective_refraction" | "generic"
    data: SubjectiveRefractionResult | GenericResult
  }
}

export interface NewOpticalRx {
  od: { sph: string; cyl: string; axis: string; add: string }
  os: { sph: string; cyl: string; axis: string; add: string }
  pd: string
  lensType: string
  notes: string
}

export interface NewFollowUp {
  interval: string
  date: string
  doctor: string
  instructions: string
}

export const REQUEST_TYPES = [
  "Đo khúc xạ chủ quan",
  "OCT",
  "Chụp đáy mắt",
  "Đo thị trường",
  "Topography giác mạc",
  "Siêu âm mắt",
  "Xét nghiệm máu",
  "Khác",
] as const

export const FOLLOW_UP_INTERVALS = [
  "1 tuần",
  "2 tuần",
  "1 tháng",
  "3 tháng",
  "6 tháng",
  "1 năm",
] as const

export const FREQUENCY_OPTIONS = [
  "1 lần/ngày",
  "2 lần/ngày",
  "3 lần/ngày",
  "4 lần/ngày",
  "Khi cần",
] as const

export const DURATION_OPTIONS = [
  "1 tuần",
  "2 tuần",
  "1 tháng",
  "2 tháng",
  "3 tháng",
] as const

export const EYE_OPTIONS = ["OD", "OS", "OU"] as const

export const LENS_TYPE_OPTIONS = ["Đơn tròng", "Đa tròng", "Lũy tiến"] as const
```

- [ ] **Step 2: Update ExamData interface**

Replace the existing `ExamData` interface with:

```typescript
export interface ExamData {
  slitLamp: SlitLampExam
  fundus: FundusExam
  diagnoses: Diagnosis[]
  diagnosisNotes: string
  medications: Medication[]
  opticalRx?: NewOpticalRx
  procedures: Procedure[]
  followUp?: NewFollowUp
  requests: VisitRequest[]
}
```

Keep `Diagnosis`, `Medication`, `Procedure` unchanged. Remove `DryEyeExamData`, `RefractionData`, and `OpticalRxData` interfaces (they are no longer used).

- [ ] **Step 3: Add mock visit history to the Visit interface**

Add a `previousVisits` field to the `Visit` interface:

```typescript
export interface PreviousVisit {
  date: string
  doctorName: string
  diagnoses: { text: string; icd10Code?: string; isPrimary: boolean }[]
  medications: { name: string; dosage: string; frequency: string; eye: string }[]
  va: { scOd: string; scOs: string; ccOd: string; ccOs: string; iopOd: string; iopOs: string }
  refraction: { sphOd: string; sphOs: string; cylOd: string; cylOs: string; axisOd: string; axisOs: string }
  instructions?: string
}
```

Add `previousVisits?: PreviousVisit[]` to the `Visit` interface.

- [ ] **Step 4: Add mock data for v-doc-5 visit**

Update the `v-doc-5` visit in `mockVisits` to include `previousVisits` array with 2 entries:

```typescript
previousVisits: [
  {
    date: "10/01/2026",
    doctorName: "BS. Nguyễn Hải",
    diagnoses: [
      { text: "Cận thị cả hai mắt", icd10Code: "H52.1", isPrimary: true },
    ],
    medications: [
      { name: "Refresh Tears 0.5%", dosage: "1 giọt", frequency: "4 lần/ngày", eye: "OU" },
    ],
    va: { scOd: "4/10", scOs: "5/10", ccOd: "9/10", ccOs: "10/10", iopOd: "14", iopOs: "15" },
    refraction: { sphOd: "-2.00", sphOs: "-1.75", cylOd: "-0.50", cylOs: "-0.25", axisOd: "180", axisOs: "175" },
    instructions: "Đeo kính đúng số, tái khám sau 3 tháng",
  },
  {
    date: "15/10/2025",
    doctorName: "BS. Nguyễn Hải",
    diagnoses: [
      { text: "Cận thị cả hai mắt", icd10Code: "H52.1", isPrimary: true },
    ],
    medications: [],
    va: { scOd: "5/10", scOs: "5/10", ccOd: "10/10", ccOs: "10/10", iopOd: "15", iopOs: "14" },
    refraction: { sphOd: "-1.75", sphOs: "-1.50", cylOd: "-0.50", cylOs: "-0.25", axisOd: "180", axisOs: "175" },
    instructions: "Hạn chế thời gian nhìn gần, tái khám sau 3 tháng",
  },
],
```

Also add mock `previousVisits` to `v-doc-2` (Hoàng Văn Bình — the dry eye patient with existing `lastVisitDate`):

```typescript
previousVisits: [
  {
    date: "05/02/2026",
    doctorName: "BS. Nguyễn Hải",
    diagnoses: [
      { text: "Khô mắt nhẹ", icd10Code: "H04.1", isPrimary: true },
    ],
    medications: [
      { name: "Refresh Tears 0.5%", dosage: "1 giọt", frequency: "3 lần/ngày", eye: "OU" },
    ],
    va: { scOd: "10/10", scOs: "10/10", ccOd: "10/10", ccOs: "10/10", iopOd: "16", iopOs: "15" },
    refraction: { sphOd: "-3.50", sphOs: "-3.25", cylOd: "-0.75", cylOs: "-0.50", axisOd: "10", axisOs: "170" },
    instructions: "Chườm nóng mi mắt, dùng nước mắt nhân tạo đều đặn",
  },
],
```

- [ ] **Step 5: Add mock requests data to v-doc-5**

Add a `requests` field to the `v-doc-5` visit (the one the doctor is examining):

```typescript
requests: [
  {
    id: "req-1",
    type: "Đo khúc xạ chủ quan",
    priority: "normal" as const,
    status: "completed" as const,
    notesForTech: "",
    requestedAt: todayTimestamp(55),
    completedAt: todayTimestamp(30),
    assignedTo: "KTV. Nguyễn Thị Lan",
    result: {
      type: "subjective_refraction" as const,
      data: {
        od: { sph: "-2.25", cyl: "-0.50", axis: "180", bcva: "10/10", add: "", pd: "31.5" },
        os: { sph: "-2.00", cyl: "-0.25", axis: "175", bcva: "10/10", add: "", pd: "31.5" },
      },
    },
  },
  {
    id: "req-2",
    type: "OCT",
    priority: "normal" as const,
    status: "in_progress" as const,
    notesForTech: "Kiểm tra lớp sợi thần kinh",
    requestedAt: todayTimestamp(40),
    assignedTo: "KTV. Phạm Văn Đức",
  },
],
```

Add `requests?: VisitRequest[]` to the `Visit` interface.

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`

Expected: Some errors in `exam.tsx`, `exam-findings.tsx`, `treatment-plan.tsx` because they reference old `ExamData` fields (`va`, `iop`, `slitLamp` as string, etc.). These files will be rewritten in later tasks, so these errors are expected. No errors in `mock-patients.ts` itself.

- [ ] **Step 7: Commit**

```bash
git add src/data/mock-patients.ts
git commit -m "feat: update ExamData types and add mock visit history + requests"
```

---

## Task 2: Create PatientHeader component

**Files:**
- Create: `src/components/doctor/patient-header.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Button } from "@/components/ui/button"
import type { Patient, Visit } from "@/data/mock-patients"

interface PatientHeaderProps {
  patient: Patient
  visit: Visit
  onComplete: () => void
}

export function PatientHeader({
  patient,
  visit,
  onComplete,
}: PatientHeaderProps) {
  const age = new Date().getFullYear() - patient.birthYear
  const initials = patient.name
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase()

  const visitCount = visit.previousVisits?.length ?? 0
  const visitTypeLabel =
    visitCount === 0 ? "Khám lần đầu" : `Tái khám lần ${visitCount}`

  return (
    <div className="flex items-center gap-3 border-b border-border bg-background px-5 py-2.5">
      {/* Avatar */}
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E6F1FB] text-[13px] font-semibold text-[#0C447C]">
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-medium">{patient.name}</div>
        <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
          <span>{patient.id}</span>
          <span>
            {patient.gender}, {age} tuổi
          </span>
          <span>{patient.phone}</span>
          <span className="rounded-full bg-[#E6F1FB] px-2 py-0.5 text-[11px] font-medium text-[#0C447C]">
            {visitTypeLabel}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm">
          In phiếu
        </Button>
        <Button
          size="sm"
          className="bg-[#1D9E75] text-white hover:bg-[#0F6E56]"
          onClick={onComplete}
        >
          Hoàn tất khám
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/patient-header.tsx
git commit -m "feat: add PatientHeader component with avatar and action buttons"
```

---

## Task 3: Create ExamSidebar component

**Files:**
- Create: `src/components/doctor/exam-sidebar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Stethoscope02Icon,
  Task01Icon,
  TestTube01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type ExamTab = "patient" | "preExam" | "requests" | "exam"

interface ExamSidebarProps {
  activeTab: ExamTab
  onTabChange: (tab: ExamTab) => void
  pendingRequestCount: number
}

const tabs: { id: ExamTab; label: string; icon: typeof UserIcon }[] = [
  { id: "patient", label: "Bệnh nhân", icon: UserIcon },
  { id: "preExam", label: "Pre-Exam", icon: TestTube01Icon },
  { id: "requests", label: "Yêu cầu", icon: Task01Icon },
  { id: "exam", label: "Khám & kết luận", icon: Stethoscope02Icon },
]

export function ExamSidebar({
  activeTab,
  onTabChange,
  pendingRequestCount,
}: ExamSidebarProps) {
  return (
    <div className="flex w-[175px] shrink-0 flex-col border-r border-border bg-muted/30 py-2.5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2.5 text-left text-[13px] text-muted-foreground transition-colors hover:bg-background hover:text-foreground",
              isActive &&
                "bg-background font-medium text-[#0C447C] before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-r-sm before:bg-[#0C447C]"
            )}
          >
            <HugeiconsIcon
              icon={tab.icon}
              className="size-[15px] shrink-0"
              strokeWidth={1.5}
            />
            <span className="flex-1">{tab.label}</span>
            {tab.id === "requests" && pendingRequestCount > 0 && (
              <span className="flex min-w-[18px] items-center justify-center rounded-full bg-[#D85A30] px-1.5 text-[10px] font-medium text-white">
                {pendingRequestCount}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Verify icons exist**

Check that `UserIcon`, `TestTube01Icon`, `Task01Icon` exist in `@hugeicons/core-free-icons`. If not, substitute with available icons:

Run: `grep -r "UserIcon\|TestTube01Icon\|Task01Icon" node_modules/@hugeicons/core-free-icons/dist/ 2>/dev/null | head -5`

If any icon is missing, replace with alternatives from the free-icons set (e.g., `User02Icon`, `FlaskIcon`, `NoteIcon`). The exact icon names should be checked against what's available.

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/exam-sidebar.tsx
git commit -m "feat: add ExamSidebar with 4-tab navigation and request badge"
```

---

## Task 4: Create TabPatient component (Tab 1)

**Files:**
- Create: `src/components/doctor/tab-patient.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Button } from "@/components/ui/button"
import type { Patient, Visit, PreviousVisit } from "@/data/mock-patients"

interface TabPatientProps {
  patient: Patient
  visit: Visit
}

export function TabPatient({ patient, visit }: TabPatientProps) {
  const age = new Date().getFullYear() - patient.birthYear
  const previousVisits = visit.previousVisits ?? []

  return (
    <div className="space-y-6 px-6 py-5">
      {/* Thông tin hành chính */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-medium">Thông tin hành chính</h2>
          <Button variant="outline" size="xs" className="text-xs">
            Chỉnh sửa
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
          <InfoRow label="Họ tên" value={patient.name} />
          <InfoRow
            label="Ngày sinh"
            value={patient.dob ? `${patient.dob} (${age} tuổi)` : "—"}
          />
          <InfoRow label="Giới tính" value={patient.gender} />
          <InfoRow label="CCCD" value={patient.cccd} />
          <InfoRow label="Điện thoại" value={patient.phone} />
          <InfoRow label="Email" value={patient.email} />
          <InfoRow label="Địa chỉ" value={patient.address} />
          <InfoRow label="Nghề nghiệp" value={patient.occupation} />
        </div>
      </section>

      {/* Lần khám gần nhất */}
      {previousVisits.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-medium">Lần khám gần nhất</h2>
          <div className="space-y-3">
            {previousVisits.slice(0, 3).map((pv, i) => (
              <VisitHistoryCard key={i} visit={pv} isLatest={i === 0} />
            ))}
          </div>
          {previousVisits.length > 3 && (
            <div className="mt-3 text-center">
              <Button variant="outline" size="sm" className="text-xs">
                Xem toàn bộ lịch sử khám
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-1.5">
      <span className="min-w-[100px] shrink-0 text-muted-foreground">
        {label}
      </span>
      <span>{value || "—"}</span>
    </div>
  )
}

function VisitHistoryCard({
  visit,
  isLatest,
}: {
  visit: PreviousVisit
  isLatest: boolean
}) {
  const daysSince = Math.floor(
    (Date.now() - parseVietnameseDate(visit.date).getTime()) /
      (1000 * 60 * 60 * 24)
  )

  if (!isLatest) {
    // Collapsed card for older visits
    const primaryDiag = visit.diagnoses.find((d) => d.isPrimary)
    return (
      <div className="rounded-lg border border-border p-3 opacity-70">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[13px] font-medium">{visit.date}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              {visit.doctorName} · {daysSince} ngày trước
            </span>
          </div>
          <div className="text-xs">
            {primaryDiag?.text} · SC: {visit.va.scOd} / {visit.va.scOs}
          </div>
        </div>
      </div>
    )
  }

  // Full card for most recent visit
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">{visit.date}</div>
          <div className="text-xs text-muted-foreground">
            {visit.doctorName} · {daysSince} ngày trước
          </div>
        </div>
        <Button variant="outline" size="xs" className="text-xs">
          Xem chi tiết
        </Button>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Chẩn đoán */}
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Chẩn đoán
          </div>
          {visit.diagnoses.map((d, i) => (
            <div key={i} className="mb-0.5 text-xs">
              <span
                className={`mr-1 inline-block rounded px-1.5 py-px text-[10px] font-medium ${d.isPrimary ? "bg-[#E6F1FB] text-[#0C447C]" : "border border-border bg-muted text-muted-foreground"}`}
              >
                {d.isPrimary ? "Chính" : "Phụ"}
              </span>
              {d.text}
              {d.icd10Code && (
                <span className="text-muted-foreground">
                  {" "}
                  ({d.icd10Code})
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Thuốc */}
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Thuốc đã kê
          </div>
          {visit.medications.length === 0 ? (
            <div className="text-xs text-muted-foreground">Không có</div>
          ) : (
            visit.medications.map((m, i) => (
              <div key={i} className="mb-0.5 text-xs">
                {m.name} · {m.frequency} · {m.eye}
              </div>
            ))
          )}
        </div>

        {/* Thị lực */}
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Thị lực
          </div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 text-xs">
            <div />
            <div className="text-[10px] text-muted-foreground">OD</div>
            <div className="text-[10px] text-muted-foreground">OS</div>
            <div className="text-muted-foreground">SC</div>
            <div className="font-medium">{visit.va.scOd}</div>
            <div className="font-medium">{visit.va.scOs}</div>
            <div className="text-muted-foreground">CC</div>
            <div className="font-medium">{visit.va.ccOd}</div>
            <div className="font-medium">{visit.va.ccOs}</div>
            <div className="text-muted-foreground">IOP</div>
            <div className="font-medium">{visit.va.iopOd}</div>
            <div className="font-medium">{visit.va.iopOs}</div>
          </div>
        </div>

        {/* Khúc xạ */}
        <div className="rounded-lg bg-muted/50 p-2.5">
          <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            Khúc xạ
          </div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-x-3 gap-y-0.5 text-xs">
            <div />
            <div className="text-[10px] text-muted-foreground">OD</div>
            <div className="text-[10px] text-muted-foreground">OS</div>
            <div className="text-muted-foreground">Sph</div>
            <div className="font-medium">{visit.refraction.sphOd}</div>
            <div className="font-medium">{visit.refraction.sphOs}</div>
            <div className="text-muted-foreground">Cyl</div>
            <div className="font-medium">{visit.refraction.cylOd}</div>
            <div className="font-medium">{visit.refraction.cylOs}</div>
            <div className="text-muted-foreground">Axis</div>
            <div className="font-medium">{visit.refraction.axisOd}°</div>
            <div className="font-medium">{visit.refraction.axisOs}°</div>
          </div>
        </div>
      </div>

      {/* Dặn dò */}
      {visit.instructions && (
        <div className="mt-2.5 rounded-md bg-muted/50 px-2.5 py-2 text-xs">
          <span className="font-medium">Dặn dò:</span> {visit.instructions}
        </div>
      )}
    </div>
  )
}

/** Parse dd/mm/yyyy to Date */
function parseVietnameseDate(dateStr: string): Date {
  const [d, m, y] = dateStr.split("/").map(Number)
  return new Date(y, m - 1, d)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/tab-patient.tsx
git commit -m "feat: add TabPatient with admin info grid and visit history cards"
```

---

## Task 5: Create TabPreExam component (Tab 2)

**Files:**
- Create: `src/components/doctor/tab-pre-exam.tsx`

- [ ] **Step 1: Create the component**

This is a large read-only display component. It renders all pre-exam data from the screening form and visit measurements.

```tsx
import type { Patient, Visit } from "@/data/mock-patients"

interface TabPreExamProps {
  patient: Patient
  visit: Visit
}

export function TabPreExam({ patient, visit }: TabPreExamProps) {
  const screening = visit.screeningData

  return (
    <div className="space-y-5 px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Pre-Exam</h2>
      </div>

      {/* Lý do khám & triệu chứng */}
      <Section title="Lý do khám & triệu chứng">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[13px]">
          <div className="col-span-2 flex gap-1.5">
            <span className="min-w-[120px] shrink-0 text-muted-foreground">
              Lý do khám
            </span>
            <span className="font-medium">
              {screening?.chiefComplaint || patient.chiefComplaint || "—"}
            </span>
          </div>
          {screening && (
            <>
              <div className="flex gap-1.5">
                <span className="min-w-[120px] text-muted-foreground">
                  Khởi phát
                </span>
                <span>
                  {screening.symptomDuration} {screening.symptomDurationUnit}{" "}
                  trước
                </span>
              </div>
              <div className="flex gap-1.5">
                <span className="min-w-[120px] text-muted-foreground">
                  Mức độ
                </span>
                <span>
                  {screening.discomfortLevel === "mild"
                    ? "Nhẹ"
                    : screening.discomfortLevel === "moderate"
                      ? "Trung bình"
                      : screening.discomfortLevel === "severe"
                        ? "Nặng"
                        : "—"}
                </span>
              </div>
              <div className="col-span-2 flex gap-1.5">
                <span className="min-w-[120px] text-muted-foreground">
                  Triệu chứng
                </span>
                <div className="flex flex-wrap gap-1">
                  {screening.symptoms.dryEyes && (
                    <Pill>Khô mắt</Pill>
                  )}
                  {screening.symptoms.gritty && <Pill>Cộm rát</Pill>}
                  {screening.symptoms.blurry && <Pill>Mờ</Pill>}
                  {screening.symptoms.tearing && <Pill>Chảy nước mắt</Pill>}
                  {screening.symptoms.itchy && <Pill>Ngứa</Pill>}
                  {screening.symptoms.headache && <Pill>Đau đầu</Pill>}
                </div>
              </div>
              <div className="col-span-2 flex gap-1.5">
                <span className="min-w-[120px] text-muted-foreground">
                  Dấu hiệu cảnh báo
                </span>
                {screening.redFlags.eyePain ||
                screening.redFlags.suddenVisionLoss ||
                screening.redFlags.asymmetry ? (
                  <div className="flex gap-1">
                    {screening.redFlags.eyePain && (
                      <RedPill>Đau mắt</RedPill>
                    )}
                    {screening.redFlags.suddenVisionLoss && (
                      <RedPill>Giảm thị lực đột ngột</RedPill>
                    )}
                    {screening.redFlags.asymmetry && (
                      <RedPill>Bất đối xứng</RedPill>
                    )}
                  </div>
                ) : (
                  <span className="font-medium text-emerald-600">
                    Không có
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Tiền sử */}
      <Section title="Tiền sử">
        <div className="space-y-2.5 text-[13px]">
          {patient.eyeHistory && (
            <div>
              <div className="mb-1 text-xs font-medium">Bệnh mắt</div>
              <div>{patient.eyeHistory}</div>
            </div>
          )}
          {patient.systemicHistory && (
            <div>
              <div className="mb-1 text-xs font-medium">Toàn thân</div>
              <div>{patient.systemicHistory}</div>
            </div>
          )}
          {patient.allergies && (
            <div>
              <div className="mb-1 text-xs font-medium">Dị ứng</div>
              <div className="flex gap-1">
                <RedPill>{patient.allergies}</RedPill>
              </div>
            </div>
          )}
          {patient.currentMedications && (
            <div>
              <div className="mb-1 text-xs font-medium">Thuốc đang dùng</div>
              <div>{patient.currentMedications}</div>
            </div>
          )}
          {!patient.eyeHistory &&
            !patient.systemicHistory &&
            !patient.allergies &&
            !patient.currentMedications && (
              <div className="text-muted-foreground">Không có tiền sử</div>
            )}
        </div>
      </Section>

      {/* Sàng lọc */}
      {screening && (
        <Section title="Sàng lọc">
          <div className="mb-3 grid grid-cols-2 gap-2">
            <MetricCard
              label="OSDI-6"
              value={
                screening.step2?.dryEye.osdiScore != null
                  ? `${screening.step2.dryEye.osdiScore}/48`
                  : "—"
              }
            />
            <MetricCard
              label="Screen time"
              value={
                screening.screenTime ? `${screening.screenTime}h/ngày` : "—"
              }
            />
            <MetricCard
              label="Kính áp tròng"
              value={
                screening.contactLens === "yes"
                  ? "Có sử dụng"
                  : screening.contactLens === "no"
                    ? "Không sử dụng"
                    : "—"
              }
            />
            <MetricCard
              label="Mức khó chịu"
              value={
                screening.discomfortLevel === "mild"
                  ? "Nhẹ"
                  : screening.discomfortLevel === "moderate"
                    ? "Trung bình"
                    : screening.discomfortLevel === "severe"
                      ? "Nặng"
                      : "—"
              }
            />
          </div>
          {screening.notes && (
            <div className="border-t border-border pt-2.5">
              <div className="text-xs text-muted-foreground">Ghi chú</div>
              <div className="text-[13px]">{screening.notes}</div>
            </div>
          )}
        </Section>
      )}

      {/* Thị lực & nhãn áp */}
      {screening && (
        <Section title="Thị lực & nhãn áp">
          <div className="grid grid-cols-2 gap-3">
            <EyeCard eye="OD" label="OD (Phải)" dotColor="#378ADD">
              <ValueCard label="SC" value={screening.ucvaOd || "—"} />
              <ValueCard label="CC" value={screening.currentRxOd ? `c/ ${screening.currentRxOd}` : "—"} />
            </EyeCard>
            <EyeCard eye="OS" label="OS (Trái)" dotColor="#D85A30">
              <ValueCard label="SC" value={screening.ucvaOs || "—"} />
              <ValueCard label="CC" value={screening.currentRxOs ? `c/ ${screening.currentRxOs}` : "—"} />
            </EyeCard>
          </div>
        </Section>
      )}

      {/* Khúc xạ kế — show if step2 dry eye has data */}
      {screening?.step2?.dryEye && (
        <Section title="Đo lường bổ sung">
          <div className="grid grid-cols-2 gap-3">
            <EyeCard eye="OD" label="OD (Phải)" dotColor="#378ADD">
              <ValueCard
                label="TBUT"
                value={
                  screening.step2.dryEye.tbutOd
                    ? `${screening.step2.dryEye.tbutOd}s`
                    : "—"
                }
              />
              <ValueCard
                label="Schirmer"
                value={
                  screening.step2.dryEye.schirmerOd
                    ? `${screening.step2.dryEye.schirmerOd}mm`
                    : "—"
                }
              />
            </EyeCard>
            <EyeCard eye="OS" label="OS (Trái)" dotColor="#D85A30">
              <ValueCard
                label="TBUT"
                value={
                  screening.step2.dryEye.tbutOs
                    ? `${screening.step2.dryEye.tbutOs}s`
                    : "—"
                }
              />
              <ValueCard
                label="Schirmer"
                value={
                  screening.step2.dryEye.schirmerOs
                    ? `${screening.step2.dryEye.schirmerOs}mm`
                    : "—"
                }
              />
            </EyeCard>
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 text-[13px] font-medium">{title}</div>
      {children}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#E6F1FB] px-2 py-0.5 text-xs text-[#0C447C]">
      {children}
    </span>
  )
}

function RedPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#FCEBEB] px-2 py-0.5 text-xs text-[#791F1F]">
      {children}
    </span>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-2.5 py-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}

function EyeCard({
  label,
  dotColor,
  children,
}: {
  eye: string
  label: string
  dotColor: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border p-3.5">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium">
        <span
          className="size-[7px] rounded-full"
          style={{ background: dotColor }}
        />
        {label}
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(56px,1fr))] gap-1.5">
        {children}
      </div>
    </div>
  )
}

function ValueCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/50 px-1.5 py-1 text-center">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/tab-pre-exam.tsx
git commit -m "feat: add TabPreExam with chief complaint, history, screening, and measurements"
```

---

## Task 6: Create TabRequests component (Tab 3)

**Files:**
- Create: `src/components/doctor/tab-requests.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  REQUEST_TYPES,
  type VisitRequest,
  type RequestStatus,
  type SubjectiveRefractionResult,
} from "@/data/mock-patients"

interface TabRequestsProps {
  requests: VisitRequest[]
  onAddRequest: (request: Omit<VisitRequest, "id" | "requestedAt" | "status">) => void
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string }
> = {
  pending: { label: "Đang chờ", bg: "#FAEEDA", text: "#854F0B" },
  in_progress: { label: "Đang thực hiện", bg: "#E6F1FB", text: "#0C447C" },
  completed: { label: "Hoàn tất", bg: "#EAF3DE", text: "#27500A" },
  cancelled: { label: "Đã hủy", bg: "#F1EFE8", text: "#444441" },
}

export function TabRequests({ requests, onAddRequest }: TabRequestsProps) {
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState("")
  const [formPriority, setFormPriority] = useState<"normal" | "urgent">(
    "normal"
  )
  const [formNotes, setFormNotes] = useState("")

  function handleSubmit() {
    if (!formType) return
    onAddRequest({
      type: formType,
      priority: formPriority,
      notesForTech: formNotes,
    })
    setFormType("")
    setFormPriority("normal")
    setFormNotes("")
    setShowForm(false)
  }

  return (
    <div className="space-y-4 px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Yêu cầu</h2>
        <Button
          size="sm"
          className="bg-[#E6F1FB] text-[#0C447C] hover:bg-[#B5D4F4]"
          onClick={() => setShowForm(!showForm)}
        >
          + Tạo yêu cầu
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="rounded-lg border border-[#B5D4F4] bg-[#F8FBFE] p-3.5">
          <div className="mb-2.5 grid grid-cols-2 gap-2.5">
            <div>
              <div className="mb-1 text-[11px] text-muted-foreground">
                Loại yêu cầu *
              </div>
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <option value="">Chọn loại...</option>
                {REQUEST_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <div className="mb-1 text-[11px] text-muted-foreground">
                Ưu tiên *
              </div>
              <select
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-[13px]"
                value={formPriority}
                onChange={(e) =>
                  setFormPriority(e.target.value as "normal" | "urgent")
                }
              >
                <option value="normal">Bình thường</option>
                <option value="urgent">Khẩn</option>
              </select>
            </div>
          </div>
          <div>
            <div className="mb-1 text-[11px] text-muted-foreground">
              Ghi chú cho KTV
            </div>
            <Input
              className="h-8 text-[13px]"
              placeholder="Ghi chú thêm..."
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
            />
          </div>
          <div className="mt-2.5 flex justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </Button>
            <Button
              size="sm"
              className="bg-[#0C447C] text-white hover:bg-[#0C447C]/90"
              onClick={handleSubmit}
              disabled={!formType}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      )}

      {/* Request cards */}
      {requests.length === 0 ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Chưa có yêu cầu nào
        </div>
      ) : (
        <div className="space-y-2.5">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}

function RequestCard({ request }: { request: VisitRequest }) {
  const statusCfg = STATUS_CONFIG[request.status]
  const isCompleted = request.status === "completed"

  return (
    <div className="rounded-lg border border-border p-3 pr-3.5">
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-sm"
          style={{ background: statusCfg.bg }}
        >
          {request.status === "completed"
            ? "✓"
            : request.status === "in_progress"
              ? "⏳"
              : "●"}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-medium">{request.type}</div>
          <div className="text-[11px] text-muted-foreground">
            Gửi {formatTime(request.requestedAt)}
            {request.completedAt &&
              ` · Hoàn tất ${formatTime(request.completedAt)}`}
            {request.assignedTo && ` · ${request.assignedTo}`}
            {request.priority === "urgent" && (
              <span className="ml-1 font-medium">· Khẩn</span>
            )}
          </div>

          {/* Results */}
          {isCompleted && request.result && (
            <div className="mt-2 rounded-lg bg-muted/50 p-2.5 text-xs">
              {request.result.type === "subjective_refraction" ? (
                <SubjectiveRefractionDisplay
                  data={request.result.data as SubjectiveRefractionResult}
                />
              ) : (
                <div>
                  {"conclusion" in request.result.data &&
                    (request.result.data as { conclusion: string }).conclusion}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status badge */}
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: statusCfg.bg, color: statusCfg.text }}
        >
          {statusCfg.label}
        </span>
      </div>
    </div>
  )
}

function SubjectiveRefractionDisplay({
  data,
}: {
  data: SubjectiveRefractionResult
}) {
  const fields = ["sph", "cyl", "axis", "bcva", "add", "pd"] as const
  const labels = ["Sph", "Cyl", "Axis", "BCVA", "Add", "PD"]

  return (
    <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-x-2.5 gap-y-1">
      <div />
      {labels.map((l) => (
        <div
          key={l}
          className="text-[10px] font-medium text-muted-foreground"
        >
          {l}
        </div>
      ))}
      <div className="flex items-center gap-1 font-medium">
        <span className="size-1.5 rounded-full bg-[#378ADD]" />
        OD
      </div>
      {fields.map((f) => (
        <div key={f}>{data.od[f] || "—"}</div>
      ))}
      <div className="flex items-center gap-1 font-medium">
        <span className="size-1.5 rounded-full bg-[#D85A30]" />
        OS
      </div>
      {fields.map((f) => (
        <div key={f}>{data.os[f] || "—"}</div>
      ))}
    </div>
  )
}

function formatTime(isoString: string): string {
  const d = new Date(isoString)
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/tab-requests.tsx
git commit -m "feat: add TabRequests with creation form and request cards"
```

---

## Task 7: Create TabExam component (Tab 4)

**Files:**
- Create: `src/components/doctor/tab-exam.tsx`

- [ ] **Step 1: Create the component**

This is the largest component — slit-lamp, fundus, diagnosis, and optional sections. It handles all doctor input.

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { DiagnosisInput } from "@/components/doctor/diagnosis-input"
import {
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  EYE_OPTIONS,
  LENS_TYPE_OPTIONS,
  FOLLOW_UP_INTERVALS,
  type ExamData,
  type Medication,
  type SlitLampEye,
  type FundusEye,
  type PreviousVisit,
} from "@/data/mock-patients"

interface TabExamProps {
  examData: ExamData
  onChange: (data: ExamData) => void
  previousVisit?: PreviousVisit
}

type OptionalSection = "medication" | "optical" | "followUp"

export function TabExam({
  examData,
  onChange,
  previousVisit,
}: TabExamProps) {
  const [openSections, setOpenSections] = useState<Set<OptionalSection>>(
    new Set()
  )
  const [showPrevious, setShowPrevious] = useState(false)

  function toggleSection(section: OptionalSection) {
    const next = new Set(openSections)
    if (next.has(section)) {
      next.delete(section)
      if (section === "medication") onChange({ ...examData, medications: [] })
      if (section === "optical") onChange({ ...examData, opticalRx: undefined })
      if (section === "followUp") onChange({ ...examData, followUp: undefined })
    } else {
      next.add(section)
    }
    setOpenSections(next)
  }

  function updateSlitLamp(
    eye: "od" | "os",
    field: keyof SlitLampEye,
    value: string
  ) {
    onChange({
      ...examData,
      slitLamp: {
        ...examData.slitLamp,
        [eye]: { ...examData.slitLamp[eye], [field]: value },
      },
    })
  }

  function updateFundus(
    eye: "od" | "os",
    field: keyof FundusEye,
    value: string
  ) {
    onChange({
      ...examData,
      fundus: {
        ...examData.fundus,
        [eye]: { ...examData.fundus[eye], [field]: value },
      },
    })
  }

  return (
    <div className="space-y-6 px-6 py-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Khám & kết luận</h2>
        {previousVisit && (
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowPrevious(!showPrevious)}
          >
            Lần trước
          </Button>
        )}
      </div>

      {/* Previous visit comparison panel */}
      {showPrevious && previousVisit && (
        <PreviousVisitPanel
          visit={previousVisit}
          onClose={() => setShowPrevious(false)}
        />
      )}

      {/* Slit-lamp */}
      <div>
        <div className="mb-3 text-[13px] font-medium">
          Sinh hiển vi (Slit-lamp)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <SlitLampCard
            eye="od"
            label="OD (Phải)"
            dotColor="#378ADD"
            data={examData.slitLamp.od}
            onChange={(field, value) => updateSlitLamp("od", field, value)}
          />
          <SlitLampCard
            eye="os"
            label="OS (Trái)"
            dotColor="#D85A30"
            data={examData.slitLamp.os}
            onChange={(field, value) => updateSlitLamp("os", field, value)}
          />
        </div>
      </div>

      {/* Fundus */}
      <div>
        <div className="mb-3 text-[13px] font-medium">Đáy mắt (Fundus)</div>
        <div className="grid grid-cols-2 gap-3">
          <FundusCard
            eye="od"
            label="OD (Phải)"
            dotColor="#378ADD"
            data={examData.fundus.od}
            onChange={(field, value) => updateFundus("od", field, value)}
          />
          <FundusCard
            eye="os"
            label="OS (Trái)"
            dotColor="#D85A30"
            data={examData.fundus.os}
            onChange={(field, value) => updateFundus("os", field, value)}
          />
        </div>
      </div>

      {/* Diagnosis */}
      <div>
        <div className="mb-3 text-[13px] font-medium">Chẩn đoán</div>
        <DiagnosisInput
          diagnoses={examData.diagnoses}
          onChange={(diagnoses) => onChange({ ...examData, diagnoses })}
        />
        <Textarea
          className="mt-2"
          placeholder="Ghi chú chẩn đoán (mức độ, giai đoạn...)"
          rows={2}
          value={examData.diagnosisNotes}
          onChange={(e) =>
            onChange({ ...examData, diagnosisNotes: e.target.value })
          }
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Optional section buttons */}
      <div className="flex flex-wrap gap-2">
        <ToggleButton
          label="Đơn thuốc"
          isOpen={openSections.has("medication")}
          onClick={() => toggleSection("medication")}
        />
        <ToggleButton
          label="Đơn kính"
          isOpen={openSections.has("optical")}
          onClick={() => toggleSection("optical")}
        />
        <ToggleButton
          label="Tái khám"
          isOpen={openSections.has("followUp")}
          onClick={() => toggleSection("followUp")}
        />
      </div>

      {/* Medication section */}
      {openSections.has("medication") && (
        <MedicationSection
          medications={examData.medications}
          onChange={(medications) => onChange({ ...examData, medications })}
          onRemove={() => toggleSection("medication")}
        />
      )}

      {/* Optical Rx section */}
      {openSections.has("optical") && (
        <OpticalSection
          opticalRx={examData.opticalRx}
          onChange={(opticalRx) => onChange({ ...examData, opticalRx })}
          onRemove={() => toggleSection("optical")}
        />
      )}

      {/* Follow-up section */}
      {openSections.has("followUp") && (
        <FollowUpSection
          followUp={examData.followUp}
          onChange={(followUp) => onChange({ ...examData, followUp })}
          onRemove={() => toggleSection("followUp")}
        />
      )}
    </div>
  )
}

// --- Sub-components ---

function SlitLampCard({
  label,
  dotColor,
  data,
  onChange,
}: {
  eye: string
  label: string
  dotColor: string
  data: SlitLampEye
  onChange: (field: keyof SlitLampEye, value: string) => void
}) {
  const fields: { key: keyof SlitLampEye; label: string; placeholder: string }[] =
    [
      { key: "lids", label: "Mi mắt (Lids)", placeholder: "Bình thường" },
      { key: "conjunctiva", label: "Kết mạc (Conjunctiva)", placeholder: "Bình thường" },
      { key: "cornea", label: "Giác mạc (Cornea)", placeholder: "Trong" },
      { key: "anteriorChamber", label: "Tiền phòng (AC)", placeholder: "Sạch, sâu" },
      { key: "iris", label: "Mống mắt (Iris)", placeholder: "Bình thường" },
      { key: "lens", label: "Thể thủy tinh (Lens)", placeholder: "Trong" },
    ]

  return (
    <div className="rounded-lg border border-border p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium">
        <span
          className="size-[7px] rounded-full"
          style={{ background: dotColor }}
        />
        {label}
      </div>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.key}>
            <div className="mb-0.5 text-[11px] text-muted-foreground">
              {f.label}
            </div>
            <Input
              className="h-8 text-[13px]"
              placeholder={f.placeholder}
              value={data[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <div className="mb-0.5 text-[11px] text-muted-foreground">
            Ghi chú
          </div>
          <Textarea
            className="min-h-[36px] text-[13px]"
            placeholder="Ghi chú thêm..."
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function FundusCard({
  label,
  dotColor,
  data,
  onChange,
}: {
  eye: string
  label: string
  dotColor: string
  data: FundusEye
  onChange: (field: keyof FundusEye, value: string) => void
}) {
  const fields: { key: keyof FundusEye; label: string; placeholder: string }[] =
    [
      { key: "opticDisc", label: "Đĩa thị (Optic Disc)", placeholder: "Bình thường" },
      { key: "cdRatio", label: "C/D ratio", placeholder: "0.3" },
      { key: "macula", label: "Hoàng điểm (Macula)", placeholder: "Bình thường" },
      { key: "vessels", label: "Mạch máu (Vessels)", placeholder: "Bình thường" },
      { key: "peripheralRetina", label: "Võng mạc ngoại vi", placeholder: "Bình thường" },
    ]

  return (
    <div className="rounded-lg border border-border p-3.5">
      <div className="mb-2.5 flex items-center gap-1.5 text-xs font-medium">
        <span
          className="size-[7px] rounded-full"
          style={{ background: dotColor }}
        />
        {label}
      </div>
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.key}>
            <div className="mb-0.5 text-[11px] text-muted-foreground">
              {f.label}
            </div>
            <Input
              className="h-8 text-[13px]"
              placeholder={f.placeholder}
              value={data[f.key]}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <div className="mb-0.5 text-[11px] text-muted-foreground">
            Ghi chú
          </div>
          <Textarea
            className="min-h-[36px] text-[13px]"
            placeholder="Ghi chú thêm..."
            value={data.notes}
            onChange={(e) => onChange("notes", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

function ToggleButton({
  label,
  isOpen,
  onClick,
}: {
  label: string
  isOpen: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs transition-all ${
        isOpen
          ? "border-[#B5D4F4] bg-[#E6F1FB] text-[#0C447C]"
          : "border-dashed border-border text-muted-foreground hover:border-[#0C447C]/50 hover:text-[#0C447C]"
      }`}
    >
      {isOpen ? "−" : "+"} {label}
    </button>
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
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground/50 transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
        </button>
      </div>
      {children}
    </div>
  )
}

function MedicationSection({
  medications,
  onChange,
  onRemove,
}: {
  medications: Medication[]
  onChange: (meds: Medication[]) => void
  onRemove: () => void
}) {
  function add() {
    onChange([
      ...medications,
      { name: "", dosage: "", frequency: "", duration: "" },
    ])
  }

  function update(i: number, med: Medication) {
    const next = [...medications]
    next[i] = med
    onChange(next)
  }

  function remove(i: number) {
    onChange(medications.filter((_, idx) => idx !== i))
  }

  return (
    <SectionWrapper title="Đơn thuốc" onRemove={onRemove}>
      <div className="space-y-2">
        {medications.length > 0 && (
          <div className="grid grid-cols-[1fr_6rem_7rem_6rem_4rem_1.5rem] gap-1.5 text-[10px] font-medium text-muted-foreground">
            <div>Tên thuốc</div>
            <div>Liều</div>
            <div>Tần suất</div>
            <div>Thời gian</div>
            <div>Mắt</div>
            <div />
          </div>
        )}
        {medications.map((med, i) => (
          <div
            key={i}
            className="grid grid-cols-[1fr_6rem_7rem_6rem_4rem_1.5rem] items-center gap-1.5"
          >
            <Input
              className="h-8 text-[13px]"
              placeholder="Tên thuốc"
              value={med.name}
              onChange={(e) => update(i, { ...med, name: e.target.value })}
            />
            <Input
              className="h-8 text-[13px]"
              placeholder="Liều"
              value={med.dosage}
              onChange={(e) => update(i, { ...med, dosage: e.target.value })}
            />
            <select
              className="h-8 rounded-md border border-border bg-background px-1.5 text-[13px]"
              value={med.frequency}
              onChange={(e) => update(i, { ...med, frequency: e.target.value })}
            >
              <option value="">—</option>
              {FREQUENCY_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <select
              className="h-8 rounded-md border border-border bg-background px-1.5 text-[13px]"
              value={med.duration}
              onChange={(e) => update(i, { ...med, duration: e.target.value })}
            >
              <option value="">—</option>
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              className="h-8 rounded-md border border-border bg-background px-1.5 text-[13px]"
              value={med.notes ?? ""}
              onChange={(e) => update(i, { ...med, notes: e.target.value })}
            >
              <option value="">—</option>
              {EYE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <button
              onClick={() => remove(i)}
              className="flex items-center justify-center text-muted-foreground/50 hover:text-foreground"
            >
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-1 text-muted-foreground"
        onClick={add}
      >
        + Thêm thuốc
      </Button>
    </SectionWrapper>
  )
}

function OpticalSection({
  opticalRx,
  onChange,
  onRemove,
}: {
  opticalRx?: ExamData["opticalRx"]
  onChange: (rx: ExamData["opticalRx"]) => void
  onRemove: () => void
}) {
  const rx = opticalRx ?? {
    od: { sph: "", cyl: "", axis: "", add: "" },
    os: { sph: "", cyl: "", axis: "", add: "" },
    pd: "",
    lensType: "",
    notes: "",
  }

  function updateEye(
    eye: "od" | "os",
    field: string,
    value: string
  ) {
    onChange({ ...rx, [eye]: { ...rx[eye], [field]: value } })
  }

  return (
    <SectionWrapper title="Đơn kính" onRemove={onRemove}>
      <div className="grid grid-cols-2 gap-3 mb-2.5">
        {(["od", "os"] as const).map((eye) => (
          <div key={eye} className="rounded-lg border border-border p-2.5">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-medium">
              <span
                className="size-1.5 rounded-full"
                style={{
                  background: eye === "od" ? "#378ADD" : "#D85A30",
                }}
              />
              {eye === "od" ? "OD" : "OS"}
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(["sph", "cyl", "axis", "add"] as const).map((field) => (
                <div key={field}>
                  <div className="mb-0.5 text-[9px] uppercase text-muted-foreground">
                    {field}
                  </div>
                  <Input
                    className="h-7 text-xs"
                    value={rx[eye][field]}
                    onChange={(e) => updateEye(eye, field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            PD (mm)
          </div>
          <Input
            className="h-8 text-xs"
            value={rx.pd}
            onChange={(e) => onChange({ ...rx, pd: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            Loại kính
          </div>
          <select
            className="h-8 w-full rounded-md border border-border bg-background px-1.5 text-xs"
            value={rx.lensType}
            onChange={(e) => onChange({ ...rx, lensType: e.target.value })}
          >
            <option value="">—</option>
            {LENS_TYPE_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            Ghi chú
          </div>
          <Input
            className="h-8 text-xs"
            placeholder="VD: Phủ chống ánh sáng xanh"
            value={rx.notes}
            onChange={(e) => onChange({ ...rx, notes: e.target.value })}
          />
        </div>
      </div>
    </SectionWrapper>
  )
}

function FollowUpSection({
  followUp,
  onChange,
  onRemove,
}: {
  followUp?: ExamData["followUp"]
  onChange: (fu: ExamData["followUp"]) => void
  onRemove: () => void
}) {
  const fu = followUp ?? {
    interval: "",
    date: "",
    doctor: "",
    instructions: "",
  }

  function handleIntervalChange(interval: string) {
    // Auto-calculate date from interval
    const now = new Date()
    const map: Record<string, number> = {
      "1 tuần": 7,
      "2 tuần": 14,
      "1 tháng": 30,
      "3 tháng": 90,
      "6 tháng": 180,
      "1 năm": 365,
    }
    const days = map[interval] ?? 0
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    const dateStr = futureDate.toISOString().split("T")[0]
    onChange({ ...fu, interval, date: dateStr })
  }

  return (
    <SectionWrapper title="Tái khám" onRemove={onRemove}>
      <div className="mb-2 grid grid-cols-3 gap-2">
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            Tái khám sau
          </div>
          <select
            className="h-8 w-full rounded-md border border-border bg-background px-1.5 text-xs"
            value={fu.interval}
            onChange={(e) => handleIntervalChange(e.target.value)}
          >
            <option value="">—</option>
            {FOLLOW_UP_INTERVALS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            Ngày tái khám
          </div>
          <Input
            type="date"
            className="h-8 text-xs"
            value={fu.date}
            onChange={(e) => onChange({ ...fu, date: e.target.value })}
          />
        </div>
        <div>
          <div className="mb-0.5 text-[10px] text-muted-foreground">
            Bác sĩ
          </div>
          <select
            className="h-8 w-full rounded-md border border-border bg-background px-1.5 text-xs"
            value={fu.doctor}
            onChange={(e) => onChange({ ...fu, doctor: e.target.value })}
          >
            <option value="">—</option>
            <option value="BS. Nguyễn Hải">BS. Nguyễn Hải</option>
            <option value="BS. Trần Minh">BS. Trần Minh</option>
          </select>
        </div>
      </div>
      <div>
        <div className="mb-0.5 text-[10px] text-muted-foreground">
          Dặn dò bệnh nhân
        </div>
        <Textarea
          className="min-h-[40px] text-[13px]"
          placeholder="Dặn dò..."
          value={fu.instructions}
          onChange={(e) => onChange({ ...fu, instructions: e.target.value })}
        />
      </div>
    </SectionWrapper>
  )
}

function PreviousVisitPanel({
  visit,
  onClose,
}: {
  visit: PreviousVisit
  onClose: () => void
}) {
  return (
    <div className="relative rounded-lg border border-[#B5D4F4] bg-[#F8FBFE] p-3.5">
      <button
        onClick={onClose}
        className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
      </button>
      <div className="mb-2 text-[11px] text-muted-foreground">
        {visit.date} · {visit.doctorName}
      </div>
      <div className="text-xs">
        <span className="font-medium">Chẩn đoán:</span>{" "}
        {visit.diagnoses.map((d) => d.text).join(", ")}
        {visit.medications.length > 0 && (
          <>
            {" "}
            · <span className="font-medium">Thuốc:</span>{" "}
            {visit.medications.map((m) => m.name).join(", ")}
          </>
        )}
        {visit.instructions && (
          <>
            {" "}
            · <span className="font-medium">Dặn dò:</span>{" "}
            {visit.instructions}
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/doctor/tab-exam.tsx
git commit -m "feat: add TabExam with slit-lamp, fundus, diagnosis, and optional sections"
```

---

## Task 8: Rewrite exam page and wire everything together

**Files:**
- Rewrite: `src/pages/doctor/exam.tsx`

- [ ] **Step 1: Rewrite the page component**

```tsx
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import { PatientHeader } from "@/components/doctor/patient-header"
import { ExamSidebar, type ExamTab } from "@/components/doctor/exam-sidebar"
import { TabPatient } from "@/components/doctor/tab-patient"
import { TabPreExam } from "@/components/doctor/tab-pre-exam"
import { TabRequests } from "@/components/doctor/tab-requests"
import { TabExam } from "@/components/doctor/tab-exam"
import type { ExamData, VisitRequest } from "@/data/mock-patients"

const EMPTY_SLIT_LAMP_EYE = {
  lids: "",
  conjunctiva: "",
  cornea: "",
  anteriorChamber: "",
  iris: "",
  lens: "",
  notes: "",
}

const EMPTY_FUNDUS_EYE = {
  opticDisc: "",
  cdRatio: "",
  macula: "",
  vessels: "",
  peripheralRetina: "",
  notes: "",
}

const EMPTY_EXAM: ExamData = {
  slitLamp: { od: { ...EMPTY_SLIT_LAMP_EYE }, os: { ...EMPTY_SLIT_LAMP_EYE } },
  fundus: { od: { ...EMPTY_FUNDUS_EYE }, os: { ...EMPTY_FUNDUS_EYE } },
  diagnoses: [],
  diagnosisNotes: "",
  medications: [],
  procedures: [],
  requests: [],
}

export default function DoctorExam() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const { visits, getPatient } = useReceptionist()
  const { startExam, saveExamDraft, completeExam } = useDoctor()

  const visit = visits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  const [activeTab, setActiveTab] = useState<ExamTab>("exam")
  const [examData, setExamData] = useState<ExamData>(
    visit?.examData ?? EMPTY_EXAM
  )

  // Initialize requests from visit mock data
  const [requests, setRequests] = useState<VisitRequest[]>(
    visit?.requests ?? []
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

  const pendingRequestCount = requests.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  ).length

  const previousVisit = visit.previousVisits?.[0]

  function handleAddRequest(
    req: Omit<VisitRequest, "id" | "requestedAt" | "status">
  ) {
    const newReq: VisitRequest = {
      ...req,
      id: `req-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: "pending",
    }
    setRequests((prev) => [newReq, ...prev])
  }

  function handleComplete() {
    if (examData.diagnoses.length === 0) {
      alert("Cần ít nhất 1 chẩn đoán để hoàn tất khám")
      return
    }
    completeExam(visit!.id, examData)
    navigate("/doctor")
  }

  function handleSaveDraft() {
    saveExamDraft(visit!.id, examData)
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Patient Header */}
      <PatientHeader
        patient={patient}
        visit={visit}
        onComplete={handleComplete}
      />

      {/* Body: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        <ExamSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingRequestCount={pendingRequestCount}
        />

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "patient" && (
            <TabPatient patient={patient} visit={visit} />
          )}
          {activeTab === "preExam" && (
            <TabPreExam patient={patient} visit={visit} />
          )}
          {activeTab === "requests" && (
            <TabRequests
              requests={requests}
              onAddRequest={handleAddRequest}
            />
          )}
          {activeTab === "exam" && (
            <TabExam
              examData={examData}
              onChange={setExamData}
              previousVisit={previousVisit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/doctor/exam.tsx
git commit -m "feat: rewrite exam page with 4-tab sidebar layout"
```

---

## Task 9: Delete old components and fix imports

**Files:**
- Delete: `src/components/doctor/patient-panel.tsx`
- Delete: `src/components/doctor/screening-data.tsx`
- Delete: `src/components/doctor/exam-findings.tsx`
- Delete: `src/components/doctor/treatment-plan.tsx`

- [ ] **Step 1: Delete the old files**

```bash
rm src/components/doctor/patient-panel.tsx
rm src/components/doctor/screening-data.tsx
rm src/components/doctor/exam-findings.tsx
rm src/components/doctor/treatment-plan.tsx
```

- [ ] **Step 2: Run typecheck to verify no broken imports**

Run: `npm run typecheck`

Expected: Clean pass. The exam page no longer imports any of the deleted files. If there are errors, fix the remaining references.

- [ ] **Step 3: Run dev server to verify**

Run: `npm run dev`

Open the browser, navigate to `/doctor`, click on a patient (e.g., v-doc-5). Verify:
- Patient header shows correctly with avatar, name, visit type
- Sidebar has 4 tabs, default is "Khám & kết luận"
- Clicking each tab shows the correct content
- Tab 3 (Yêu cầu) shows the badge with pending request count
- Tab 4 slit-lamp and fundus have text inputs (not dropdowns)
- Optional sections (medication, optical, follow-up) toggle correctly
- "Hoàn tất khám" button validates at least 1 diagnosis

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old exam components replaced by 4-tab layout"
```

---

## Task 10: Fix Medication eye field

**Files:**
- Modify: `src/components/doctor/tab-exam.tsx`

- [ ] **Step 1: Add `eye` field to Medication type**

The current `Medication` type in `mock-patients.ts` doesn't have an `eye` field. Add it:

In `src/data/mock-patients.ts`, update the `Medication` interface:

```typescript
export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  eye?: string
  notes?: string
}
```

- [ ] **Step 2: Fix the medication grid in tab-exam.tsx**

In the `MedicationSection`, the eye select currently uses `med.notes` for the eye value. Fix it to use `med.eye`:

Replace `value={med.notes ?? ""}` with `value={med.eye ?? ""}` and `onChange={(e) => update(i, { ...med, notes: e.target.value })}` with `onChange={(e) => update(i, { ...med, eye: e.target.value })}` in the eye select element.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-patients.ts src/components/doctor/tab-exam.tsx
git commit -m "fix: add eye field to Medication and wire up in medication grid"
```
