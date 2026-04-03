# Patient Registry Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a patient registry page at `/patients` that lists all clinic patients with search, filters, sorting, and pagination — plus a blank patient detail placeholder at `/patients/:id`.

**Architecture:** New page components following existing patterns from the intake dashboard. Data model extended with `type` and `activeStatus` fields on `Patient`. Filter bar + table + pagination as separate components. No new context provider needed — reads directly from `mockPatients` array.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Table, Select, Input, Badge, Button), Hugeicons, React Router

---

### Task 1: Extend Patient Data Model

**Files:**
- Modify: `src/data/mock-patients.ts`

- [ ] **Step 1: Add new types and config constants**

Add these types after the existing `PatientSource` type:

```typescript
export type PatientType = "kham_benh" | "mua_thuoc"
export type PatientActiveStatus = "hoat_dong" | "ngung_hoat_dong"

export const PATIENT_TYPE_CONFIG: Record<
  PatientType,
  { label: string; color: string }
> = {
  kham_benh: {
    label: "Bệnh nhân khám bệnh",
    color: "text-sky-700 bg-sky-100",
  },
  mua_thuoc: {
    label: "Khách mua thuốc",
    color: "text-amber-800 bg-amber-100",
  },
}

export const ACTIVE_STATUS_CONFIG: Record<
  PatientActiveStatus,
  { label: string; color: string }
> = {
  hoat_dong: {
    label: "Hoạt động",
    color: "text-emerald-800 bg-emerald-100",
  },
  ngung_hoat_dong: {
    label: "Ngừng HĐ",
    color: "text-red-800 bg-red-100",
  },
}
```

- [ ] **Step 2: Add fields to Patient interface**

Add two required fields to the `Patient` interface:

```typescript
export interface Patient {
  // ... existing fields ...
  type: PatientType
  activeStatus: PatientActiveStatus
}
```

- [ ] **Step 3: Update existing mock patients with new fields**

Add `type` and `activeStatus` to every existing patient in the `mockPatients` array. All existing patients are exam patients and active:

```typescript
// For each existing patient, add:
type: "kham_benh",
activeStatus: "hoat_dong",
```

- [ ] **Step 4: Add new mock patients to reach 18 total**

Append these new patients to the `mockPatients` array (after the existing 10):

```typescript
  {
    id: "GK-2026-0010",
    name: "Đỗ Thị Hồng",
    gender: "Nữ",
    dob: "25/12/1980",
    birthYear: 1980,
    phone: "0911223344",
    occupation: "Nội trợ",
    chiefComplaint: "Nhìn gần mờ",
    createdAt: "2026-03-01T09:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0012",
    name: "Bùi Quang Hà",
    gender: "Nam",
    dob: "08/02/1999",
    birthYear: 1999,
    phone: "0922334455",
    occupation: "Sinh viên",
    chiefComplaint: "Cận thị tăng nhanh",
    createdAt: "2026-03-05T10:30:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0015",
    name: "Trịnh Văn Khánh",
    gender: "Nam",
    dob: "17/07/1970",
    birthYear: 1970,
    phone: "0933445566",
    occupation: "Hưu trí",
    allergies: "Chloramphenicol, Sulfamide",
    systemicHistory: "Cao huyết áp",
    createdAt: "2026-02-15T08:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0018",
    name: "Lý Thị Ngọc",
    gender: "Nữ",
    dob: "30/09/1955",
    birthYear: 1955,
    phone: "0944556677",
    createdAt: "2026-01-20T14:00:00Z",
    type: "kham_benh",
    activeStatus: "ngung_hoat_dong",
  },
  {
    id: "GK-2026-0020",
    name: "Hoàng Minh Phúc",
    gender: "Nam",
    dob: "12/04/2005",
    birthYear: 2005,
    phone: "0955667788",
    chiefComplaint: "Kiểm tra mắt định kỳ",
    createdAt: "2026-03-10T11:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0022",
    name: "Ngô Thị Quỳnh",
    gender: "Nữ",
    dob: "05/06/1988",
    birthYear: 1988,
    phone: "0966778899",
    createdAt: "2026-03-20T09:30:00Z",
    type: "mua_thuoc",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0025",
    name: "Phan Văn Sơn",
    gender: "Nam",
    dob: "22/11/1960",
    birthYear: 1960,
    phone: "0977889900",
    createdAt: "2026-02-28T16:00:00Z",
    type: "mua_thuoc",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0030",
    name: "Đinh Thị Uyên",
    gender: "Nữ",
    dob: "14/08/1993",
    birthYear: 1993,
    phone: "0988990011",
    occupation: "Nhân viên ngân hàng",
    chiefComplaint: "Mỏi mắt cuối ngày",
    screenTime: 10,
    createdAt: "2026-03-25T08:00:00Z",
    type: "kham_benh",
    activeStatus: "ngung_hoat_dong",
  },
```

- [ ] **Step 5: Verify the app still compiles**

Run: `npm run typecheck`
Expected: No errors. All existing code that uses `Patient` will need the new fields — the mock data should cover it.

- [ ] **Step 6: Commit**

```bash
git add src/data/mock-patients.ts
git commit -m "feat: add patient type and active status to data model with new mock patients"
```

---

### Task 2: Patient Filters Component

**Files:**
- Create: `src/components/patients/patient-filters.tsx`

- [ ] **Step 1: Create the filter bar component**

```tsx
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import type { PatientActiveStatus } from "@/data/mock-patients"

interface PatientFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: PatientActiveStatus | "all"
  onStatusFilterChange: (value: PatientActiveStatus | "all") => void
  genderFilter: "all" | "Nam" | "Nữ" | "Khác"
  onGenderFilterChange: (value: "all" | "Nam" | "Nữ" | "Khác") => void
}

export function PatientFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genderFilter,
  onGenderFilterChange,
}: PatientFiltersProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Tìm kiếm bệnh nhân..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(v) =>
          onStatusFilterChange(v as PatientActiveStatus | "all")
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="hoat_dong">Hoạt động</SelectItem>
          <SelectItem value="ngung_hoat_dong">Ngừng hoạt động</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={genderFilter}
        onValueChange={(v) =>
          onGenderFilterChange(v as "all" | "Nam" | "Nữ" | "Khác")
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Giới tính" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="Nam">Nam</SelectItem>
          <SelectItem value="Nữ">Nữ</SelectItem>
          <SelectItem value="Khác">Khác</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patients/patient-filters.tsx
git commit -m "feat: add patient filter bar component"
```

---

### Task 3: Patient Registry Table Component

**Files:**
- Create: `src/components/patients/patient-registry-table.tsx`

- [ ] **Step 1: Create the table component**

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
  type Patient,
  PATIENT_TYPE_CONFIG,
  ACTIVE_STATUS_CONFIG,
} from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon } from "@hugeicons/core-free-icons"

type SortField = "id" | "name"
type SortDir = "asc" | "desc"

interface PatientRegistryTableProps {
  patients: Patient[]
  page: number
  pageSize: number
}

export function PatientRegistryTable({
  patients,
  page,
  pageSize,
}: PatientRegistryTableProps) {
  const navigate = useNavigate()
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...patients].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case "id":
        cmp = a.id.localeCompare(b.id)
        break
      case "name":
        cmp = a.name.localeCompare(b.name, "vi")
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
          <TableHead
            className="w-36 cursor-pointer text-xs"
            onClick={() => toggleSort("id")}
          >
            Mã bệnh nhân{sortIndicator("id")}
          </TableHead>
          <TableHead
            className="cursor-pointer text-xs"
            onClick={() => toggleSort("name")}
          >
            Họ và tên{sortIndicator("name")}
          </TableHead>
          <TableHead className="w-32 text-xs">Số điện thoại</TableHead>
          <TableHead className="w-40 text-xs">Loại bệnh nhân</TableHead>
          <TableHead className="w-20 text-xs">Giới tính</TableHead>
          <TableHead className="w-20 text-xs">Dị ứng</TableHead>
          <TableHead className="w-28 text-xs">Trạng thái</TableHead>
          <TableHead className="w-12 text-right text-xs" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((patient) => {
          const typeCfg = PATIENT_TYPE_CONFIG[patient.type]
          const statusCfg = ACTIVE_STATUS_CONFIG[patient.activeStatus]
          const allergyCount = patient.allergies
            ? patient.allergies.split(",").length
            : 0

          return (
            <TableRow key={patient.id}>
              <TableCell className="font-medium text-teal-600">
                {patient.id}
              </TableCell>
              <TableCell className="font-semibold">{patient.name}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeCfg.color}`}
                >
                  {typeCfg.label}
                </span>
              </TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                {allergyCount > 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                    <span className="size-4 text-center leading-4">!</span>
                    {allergyCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <HugeiconsIcon icon={ViewIcon} className="size-4" />
                </Button>
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
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/patients/patient-registry-table.tsx
git commit -m "feat: add patient registry table component"
```

---

### Task 4: Patient Registry Page

**Files:**
- Create: `src/pages/patients/index.tsx`

- [ ] **Step 1: Create the registry page**

```tsx
import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockPatients,
  type PatientActiveStatus,
} from "@/data/mock-patients"
import { PatientFilters } from "@/components/patients/patient-filters"
import { PatientRegistryTable } from "@/components/patients/patient-registry-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"

export default function PatientRegistry() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    PatientActiveStatus | "all"
  >("hoat_dong")
  const [genderFilter, setGenderFilter] = useState<
    "all" | "Nam" | "Nữ" | "Khác"
  >("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let result = mockPatients

    if (statusFilter !== "all") {
      result = result.filter((p) => p.activeStatus === statusFilter)
    }

    if (genderFilter !== "all") {
      result = result.filter((p) => p.gender === genderFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.id.toLowerCase().includes(q)
      )
    }

    return result
  }, [search, statusFilter, genderFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bệnh nhân</h1>
          <p className="text-sm text-muted-foreground">
            Danh sách bệnh nhân
          </p>
        </div>
        <Button onClick={() => navigate("/intake/new")}>
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
          Đăng ký bệnh nhân
        </Button>
      </div>

      {/* Filters */}
      <PatientFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v)
          setPage(1)
        }}
        genderFilter={genderFilter}
        onGenderFilterChange={(v) => {
          setGenderFilter(v)
          setPage(1)
        }}
      />

      {/* Table */}
      <div className="rounded-lg border border-border">
        <PatientRegistryTable
          patients={filtered}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(filtered.length, pageSize)} / {filtered.length}{" "}
          bệnh nhân
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

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/patients/index.tsx
git commit -m "feat: add patient registry page with filters and pagination"
```

---

### Task 5: Patient Detail Placeholder Page

**Files:**
- Create: `src/pages/patients/detail.tsx`

- [ ] **Step 1: Create the blank detail page**

```tsx
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/patients")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Chi tiết bệnh nhân</h1>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-20 text-muted-foreground">
        Trang chi tiết bệnh nhân sẽ được phát triển sau
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/patients/detail.tsx
git commit -m "feat: add blank patient detail placeholder page"
```

---

### Task 6: Wire Up Routes and Sidebar

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Add routes to App.tsx**

Add imports at the top of `src/App.tsx`:

```typescript
import PatientRegistry from "@/pages/patients/index"
import PatientDetail from "@/pages/patients/detail"
```

Add these two routes inside `<Routes>`, after the `/intake/:id/edit` route:

```tsx
<Route path="/patients" element={<PatientRegistry />} />
<Route path="/patients/:id" element={<PatientDetail />} />
```

- [ ] **Step 2: Add sidebar entry to app-sidebar.tsx**

Add `UserGroupIcon` to the icon imports from `@hugeicons/core-free-icons`:

```typescript
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
  Stethoscope02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
```

Add the "Bệnh nhân" nav item as the first entry in the `navItems` array (before "Tiếp nhận"):

```typescript
const navItems = [
  {
    title: "Bệnh nhân",
    url: "/patients",
    icon: UserGroupIcon,
  },
  {
    title: "Tiếp nhận",
    url: "/intake",
    icon: UserAdd01Icon,
  },
  // ... rest unchanged
]
```

- [ ] **Step 3: Verify the app compiles and renders**

Run: `npm run typecheck`
Expected: No errors

Then visually verify: `npm run dev` → open http://localhost:3000/patients
Expected: The sidebar shows "Bệnh nhân" as first item. The patient registry page renders with filter bar, table of patients (default filtered to "Hoạt động"), and pagination.

- [ ] **Step 4: Verify navigation flows**

Check these flows:
1. Click "Bệnh nhân" in sidebar → shows patient registry
2. Click eye icon on a row → navigates to `/patients/GK-2026-XXXX` → shows blank detail page
3. Click back arrow on detail page → returns to registry
4. Click "+ Đăng ký bệnh nhân" → navigates to `/intake/new`

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/app-sidebar.tsx
git commit -m "feat: wire patient registry routes and sidebar navigation"
```

---

### Task 7: Visual Polish and Verification

**Files:**
- Possibly adjust: `src/components/patients/patient-registry-table.tsx`
- Possibly adjust: `src/components/patients/patient-filters.tsx`

- [ ] **Step 1: Verify filter behavior**

Open http://localhost:3000/patients and test:
1. Default status filter is "Hoạt động" — inactive patients should be hidden
2. Change status to "Tất cả" — all patients including "Ngừng HĐ" appear
3. Set gender to "Nam" — only male patients shown
4. Type "0901" in search — filters by phone number
5. Type "Lan" in search — filters by name
6. Type "GK-2026-0001" in search — filters by patient ID
7. Combine filters: status "Tất cả" + search "Nguyễn" — shows all Nguyễn patients regardless of status

- [ ] **Step 2: Verify table sorting**

1. Click "Mã bệnh nhân" header — sorts ascending by ID
2. Click again — sorts descending (default view)
3. Click "Họ và tên" — sorts alphabetically by Vietnamese name
4. Click again — reverses

- [ ] **Step 3: Verify pagination**

1. Set page size to 10 — if more than 10 filtered patients, "Sau" button is enabled
2. Click "Sau" — shows next page
3. Click "Trước" — returns to first page
4. Counter shows correct "Hiển thị X / Y bệnh nhân"

- [ ] **Step 4: Fix any visual issues**

Compare against the reference screenshot. Check:
- Badge colors render correctly (sky for exam, amber for pharmacy, emerald for active, red for inactive)
- Allergy warning icon shows amber with count
- Patient ID is teal colored
- Table has proper spacing and alignment
- Filter bar looks clean with proper widths

If the `UserGroupIcon` import doesn't exist in `@hugeicons/core-free-icons`, try alternatives: `UserMultipleIcon`, `UserMultiple02Icon`, or `PeopleIcon`. Check the available exports and use the closest match.

- [ ] **Step 5: Final commit if any adjustments were made**

```bash
git add -A
git commit -m "fix: polish patient registry visual details"
```
