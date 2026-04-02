# Screening Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a technician dashboard at `/screening` that shows patients waiting for pre-exam, with KPI cards, a queue table with red flag indicators, and action buttons that navigate to a placeholder pre-exam page.

**Architecture:** Mirrors the intake dashboard pattern — page component in `src/pages/screening/`, child components in `src/components/screening/`. Reuses `ReceptionistContext` for data access. No new context needed.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui table components, HugeIcons, react-router

---

### Task 1: Add screening routes and sidebar nav

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: Add route imports and route elements in `src/App.tsx`**

Add lazy imports for the two new pages and two `<Route>` elements after the schedule routes:

```tsx
// Add these imports after the existing ScheduleNew import
import ScreeningDashboard from "@/pages/screening/index"
import ScreeningVisit from "@/pages/screening/visit"
```

Inside `<Routes>`, after the `/schedule/new` route:

```tsx
<Route path="/screening" element={<ScreeningDashboard />} />
<Route path="/screening/:visitId" element={<ScreeningVisit />} />
```

- [ ] **Step 2: Add "Sàng lọc" to sidebar nav in `src/components/app-sidebar.tsx`**

Add the icon import — add `Search01Icon` to the existing `@hugeicons/core-free-icons` import:

```tsx
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
```

Add the nav item to the `navItems` array (after "Lịch hẹn"):

```tsx
const navItems = [
  {
    title: "Tiếp nhận",
    url: "/intake",
    icon: UserAdd01Icon,
  },
  {
    title: "Lịch hẹn",
    url: "/schedule",
    icon: Calendar01Icon,
  },
  {
    title: "Sàng lọc",
    url: "/screening",
    icon: Search01Icon,
  },
]
```

- [ ] **Step 3: Add breadcrumb title in `src/components/site-header.tsx`**

Add entries to the `pageTitles` object:

```tsx
const pageTitles: Record<string, string> = {
  "/intake": "Bệnh nhân",
  "/intake/new": "Tiếp nhận bệnh nhân",
  "/schedule/new": "Đặt lịch hẹn",
  "/screening": "Sàng lọc",
}
```

Also add a matcher for the dynamic screening visit route. After the `isEdit` line:

```tsx
const isScreeningVisit = pathname.match(/^\/screening\/(.+)$/)
```

Update the `displayTitle`:

```tsx
const displayTitle = isEdit
  ? "Sửa thông tin bệnh nhân"
  : isScreeningVisit
    ? "Sàng lọc bệnh nhân"
    : pageTitle
```

- [ ] **Step 4: Create placeholder page files so routes don't break**

Create `src/pages/screening/index.tsx`:

```tsx
export default function ScreeningDashboard() {
  return <div className="flex-1 p-6">Screening placeholder</div>
}
```

Create `src/pages/screening/visit.tsx`:

```tsx
export default function ScreeningVisit() {
  return <div className="flex-1 p-6">Visit placeholder</div>
}
```

- [ ] **Step 5: Verify dev server runs and routing works**

Run: `npm run dev`

Manually verify:
- Sidebar shows "Sàng lọc" link
- Clicking it navigates to `/screening` and shows placeholder
- Breadcrumb shows "Sàng lọc"

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/app-sidebar.tsx src/components/site-header.tsx src/pages/screening/index.tsx src/pages/screening/visit.tsx
git commit -m "feat: add screening routes, sidebar nav, and placeholder pages"
```

---

### Task 2: Build KPI cards component

**Files:**
- Create: `src/components/screening/kpi-cards.tsx`

- [ ] **Step 1: Create `src/components/screening/kpi-cards.tsx`**

Follow the exact same pattern as `src/components/receptionist/kpi-cards.tsx` but with 3 cards in `grid-cols-3`:

```tsx
import { useReceptionist } from "@/contexts/receptionist-context"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  Search01Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const kpiConfig = [
  {
    key: "cho_kham",
    label: "Chờ sàng lọc",
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
    key: "hoan_thanh",
    label: "Hoàn thành hôm nay",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-emerald-600",
  },
] as const

export function ScreeningKpiCards() {
  const { todayVisits } = useReceptionist()

  const counts = {
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    dang_sang_loc: todayVisits.filter((v) => v.status === "dang_sang_loc")
      .length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
  }

  return (
    <div className="grid grid-cols-3 gap-3.5">
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
          <div className="mt-0.5 text-xs text-muted-foreground">&nbsp;</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/kpi-cards.tsx
git commit -m "feat: add screening KPI cards component"
```

---

### Task 3: Build the red flag helper

**Files:**
- Create: `src/lib/red-flags.ts`

- [ ] **Step 1: Create `src/lib/red-flags.ts`**

A small utility that checks if a visit/patient has red flag keywords in their chief complaint:

```tsx
const RED_FLAG_KEYWORDS = [
  "đau mắt",
  "mất thị lực",
  "đột ngột",
  "chấn thương",
]

export function hasRedFlag(reason?: string, chiefComplaint?: string): boolean {
  const text = `${reason ?? ""} ${chiefComplaint ?? ""}`.toLowerCase()
  return RED_FLAG_KEYWORDS.some((keyword) => text.includes(keyword))
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/lib/red-flags.ts
git commit -m "feat: add red flag keyword detection utility"
```

---

### Task 4: Build the queue table component

**Files:**
- Create: `src/components/screening/queue-table.tsx`

- [ ] **Step 1: Create `src/components/screening/queue-table.tsx`**

Follows the `patient-table.tsx` pattern but with screening-specific columns. Key differences: Giới tính column instead of Giờ hẹn/Nguồn, wait time column, red flag indicator, action buttons instead of dropdown menu.

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useReceptionist } from "@/contexts/receptionist-context"
import { STATUS_CONFIG, type Visit } from "@/data/mock-patients"
import { hasRedFlag } from "@/lib/red-flags"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"

type SortField = "name" | "birthYear" | "waitTime" | "status"
type SortDir = "asc" | "desc"

interface QueueTableProps {
  visits: Visit[]
  onStartScreening: (visit: Visit) => void
  page: number
  pageSize: number
}

function getWaitMinutes(checkedInAt?: string): number | null {
  if (!checkedInAt) return null
  const now = new Date("2026-04-01T14:00:00Z") // hardcoded "now" matching mockup date
  const checkedIn = new Date(checkedInAt)
  return Math.floor((now.getTime() - checkedIn.getTime()) / 60000)
}

export function QueueTable({
  visits,
  onStartScreening,
  page,
  pageSize,
}: QueueTableProps) {
  const navigate = useNavigate()
  const { getPatient } = useReceptionist()
  const [sortField, setSortField] = useState<SortField>("waitTime")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

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
      case "waitTime":
        cmp = (getWaitMinutes(a.checkedInAt) ?? 0) - (getWaitMinutes(b.checkedInAt) ?? 0)
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
          <TableHead className="w-20 text-xs">Giới tính</TableHead>
          <TableHead
            className="w-24 cursor-pointer text-xs"
            onClick={() => toggleSort("waitTime")}
          >
            Thời gian chờ{sortIndicator("waitTime")}
          </TableHead>
          <TableHead className="text-xs">Lý do khám</TableHead>
          <TableHead
            className="w-28 cursor-pointer text-xs"
            onClick={() => toggleSort("status")}
          >
            Trạng thái{sortIndicator("status")}
          </TableHead>
          <TableHead className="w-28 text-right text-xs">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((visit, i) => {
          const patient = getPatient(visit.patientId)
          if (!patient) return null
          const statusCfg = STATUS_CONFIG[visit.status]
          const waitMinutes = getWaitMinutes(visit.checkedInAt)
          const isScreening = visit.status === "dang_sang_loc"
          const flagged = hasRedFlag(visit.reason, patient.chiefComplaint)

          return (
            <TableRow
              key={visit.id}
              className={isScreening ? "bg-sky-50 dark:bg-sky-950/20" : ""}
            >
              <TableCell className="text-muted-foreground">
                {(page - 1) * pageSize + i + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{patient.name}</span>
                  {flagged && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <HugeiconsIcon
                            icon={Alert01Icon}
                            className="size-4 text-destructive"
                            strokeWidth={2}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Cờ đỏ — cần ưu tiên
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {patient.id}
                </div>
              </TableCell>
              <TableCell>{patient.birthYear}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                {isScreening ? (
                  <span className="text-muted-foreground">—</span>
                ) : waitMinutes !== null ? (
                  <span
                    className={
                      waitMinutes >= 30
                        ? "font-semibold text-destructive"
                        : "text-amber-500"
                    }
                  >
                    {waitMinutes}p
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell
                className={!visit.reason ? "text-muted-foreground italic" : ""}
              >
                {visit.reason || "Chưa rõ"}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {isScreening ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/screening/${visit.id}`)}
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => onStartScreening(visit)}
                  >
                    Bắt đầu
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`

Expected: no errors. If `Alert01Icon` is not available from `@hugeicons/core-free-icons`, try `AlertCircleIcon` or `AlertDiamondIcon` instead — check what's available by searching the package.

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/queue-table.tsx
git commit -m "feat: add screening queue table with red flags and wait time"
```

---

### Task 5: Build the screening dashboard page

**Files:**
- Modify: `src/pages/screening/index.tsx`

- [ ] **Step 1: Replace the placeholder in `src/pages/screening/index.tsx`**

Follow the intake dashboard layout pattern:

```tsx
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
import { type Visit } from "@/data/mock-patients"
import { ScreeningKpiCards } from "@/components/screening/kpi-cards"
import { QueueTable } from "@/components/screening/queue-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"

export default function ScreeningDashboard() {
  const navigate = useNavigate()
  const { todayVisits, updateVisitStatus } = useReceptionist()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter to only screening-relevant statuses
  const queueVisits = todayVisits.filter(
    (v) => v.status === "cho_kham" || v.status === "dang_sang_loc"
  )

  const totalPages = Math.max(1, Math.ceil(queueVisits.length / pageSize))

  function handleStartScreening(visit: Visit) {
    updateVisitStatus(visit.id, "dang_sang_loc")
    navigate(`/screening/${visit.id}`)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page title + actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard Sàng lọc</h1>
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <ScreeningKpiCards />

      {/* Queue Table */}
      <div className="rounded-lg border border-border">
        <QueueTable
          visits={queueVisits}
          onStartScreening={handleStartScreening}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(queueVisits.length, pageSize)} /{" "}
          {queueVisits.length} bệnh nhân trong hàng chờ
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
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles and renders**

Run: `npm run typecheck`

Then `npm run dev` and navigate to `/screening` to verify the dashboard renders with KPI cards and table.

- [ ] **Step 3: Commit**

```bash
git add src/pages/screening/index.tsx
git commit -m "feat: build screening dashboard page with KPI cards and queue table"
```

---

### Task 6: Build the blank pre-exam page

**Files:**
- Modify: `src/pages/screening/visit.tsx`

- [ ] **Step 1: Replace the placeholder in `src/pages/screening/visit.tsx`**

```tsx
import { useParams, Link } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

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

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/screening">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">{patient.id}</p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="rounded-lg border border-border p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Trang sàng lọc đang được phát triển
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Biểu mẫu sàng lọc sẽ được thêm trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles and renders**

Run: `npm run typecheck`

Then `npm run dev`:
- Navigate to `/screening`
- Click "Bắt đầu" on a waiting patient — should navigate to `/screening/v2` (or similar)
- Verify patient name, ID, and placeholder message display
- Click back arrow — should return to `/screening`

- [ ] **Step 3: Commit**

```bash
git add src/pages/screening/visit.tsx
git commit -m "feat: add blank pre-exam page with patient header and back navigation"
```

---

### Task 7: Final verification and lint

**Files:** None (verification only)

- [ ] **Step 1: Run type checker**

Run: `npm run typecheck`

Expected: no errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`

Expected: no errors. If there are warnings/errors, fix them.

- [ ] **Step 3: Run formatter**

Run: `npm run format`

If any files are reformatted, commit:

```bash
git add -u
git commit -m "chore: format screening dashboard files"
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: build succeeds with no errors.

- [ ] **Step 5: Manual smoke test**

Run: `npm run dev` and verify the complete flow:

1. Sidebar shows "Sàng lọc" with search icon
2. Clicking navigates to `/screening`
3. Breadcrumb shows "Sàng lọc"
4. 3 KPI cards display with correct counts and colors
5. Queue table shows only `cho_kham` and `dang_sang_loc` patients
6. Wait time displays in minutes, red if >= 30 minutes
7. Red flag icon shows for patients with matching keywords (e.g., "Đau mắt đỏ" for GK-2026-0004 if it's in the queue)
8. "Đang sàng lọc" rows have blue background tint
9. "Bắt đầu" button changes status and navigates to `/screening/:visitId`
10. Pre-exam page shows patient name, ID, placeholder message
11. Back button returns to `/screening`
12. "Tiếp tục" button on screening-in-progress rows navigates to pre-exam page
