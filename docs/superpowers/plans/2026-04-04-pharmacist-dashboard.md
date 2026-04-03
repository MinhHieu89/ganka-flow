# Pharmacist Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the pharmacist dashboard with prescription queue, dispense modal, and placeholder tabs for OTC/inventory.

**Architecture:** New `/pharmacy` route with tabbed dashboard. Tab 1 has KPI cards, filter bar, and queue table with dropdown actions. Dispense modal handles the core workflow. Mock data layer provides types and sample prescriptions. All components follow existing doctor/screening patterns.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Tabs, Table, Dialog, DropdownMenu, Input, Textarea, Button), Hugeicons

---

### Task 1: Mock Data — Types and Sample Prescriptions

**Files:**
- Create: `src/data/mock-pharmacy.ts`

- [ ] **Step 1: Create the mock data file with types and sample data**

```typescript
import { TODAY, todayTimestamp } from "@/lib/demo-date"

export type PrescriptionStatus = "pending" | "dispensed"

export interface MedicationSubstitution {
  name: string
  group: string
  stockQuantity: number
  unit: string
}

export interface PrescriptionMedication {
  id: string
  name: string
  group: string
  dosage: string
  quantity: number
  unit: string
  stockQuantity: number
  isOutOfStock: boolean
  substitution?: MedicationSubstitution
}

export interface PrescriptionOrder {
  id: string
  patientName: string
  patientId: string
  doctorName: string
  diagnosis: string
  icdCode?: string
  prescribedAt: string // ISO datetime
  dispensedAt?: string // ISO datetime
  expiresAt: string // ISO datetime
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  doctorNotes?: string
  allergies?: string[]
  substitutionReason?: string
}

export interface PharmacyMetrics {
  pendingCount: number
  dispensedToday: number
  lowStockAlerts: number
}

export interface MedicationCatalogItem {
  id: string
  name: string
  group: string
  stockQuantity: number
  unit: string
}

// Expiry = 7 days from today
function expiresIn(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export const mockPrescriptions: PrescriptionOrder[] = [
  {
    id: "RX-001",
    patientName: "Trần Văn Minh",
    patientId: "BN-20260403-0012",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Khô mắt mức độ trung bình",
    icdCode: "H04.1",
    prescribedAt: todayTimestamp(18),
    expiresAt: expiresIn(7),
    status: "pending",
    allergies: ["Chloramphenicol"],
    doctorNotes: "Bệnh nhân dùng Omega-3 liều cao. Tái khám sau 4 tuần.",
    medications: [
      {
        id: "M1",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 2,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
      {
        id: "M2",
        name: "Systane Gel Drops",
        group: "Gel bôi trơn mắt",
        dosage: "1 lần/ngày, trước khi ngủ, cả 2 mắt",
        quantity: 1,
        unit: "tuýp",
        stockQuantity: 15,
        isOutOfStock: false,
      },
      {
        id: "M3",
        name: "Omega-3 TG 1000mg",
        group: "Thực phẩm chức năng",
        dosage: "2 viên/ngày, uống sau ăn",
        quantity: 1,
        unit: "hộp (60v)",
        stockQuantity: 3,
        isOutOfStock: false,
      },
      {
        id: "M4",
        name: "Lotemax 0.5%",
        group: "Corticoid nhỏ mắt",
        dosage: "3 lần/ngày, mỗi lần 1 giọt, cả 2 mắt × 2 tuần",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 0,
        isOutOfStock: true,
        substitution: {
          name: "FML 0.1%",
          group: "Corticoid nhỏ mắt",
          stockQuantity: 8,
          unit: "lọ",
        },
      },
    ],
    substitutionReason:
      "Lotemax 0.5% hết hàng, thay bằng FML 0.1% — cùng nhóm corticoid nhãn khoa, tương đương tác dụng.",
  },
  {
    id: "RX-002",
    patientName: "Lê Thị Hoa",
    patientId: "BN-20260403-0008",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Viêm kết mạc dị ứng",
    icdCode: "H10.1",
    prescribedAt: todayTimestamp(31),
    expiresAt: expiresIn(7),
    status: "pending",
    medications: [
      {
        id: "M5",
        name: "Opatanol 0.1%",
        group: "Thuốc chống dị ứng",
        dosage: "2 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 12,
        isOutOfStock: false,
      },
      {
        id: "M6",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
    ],
  },
  {
    id: "RX-003",
    patientName: "Nguyễn Hoàng Nam",
    patientId: "BN-20260403-0005",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Cận thị tiến triển",
    icdCode: "H52.1",
    prescribedAt: todayTimestamp(43),
    expiresAt: expiresIn(6),
    status: "pending",
    medications: [
      {
        id: "M7",
        name: "Atropine 0.01%",
        group: "Thuốc nhỏ mắt",
        dosage: "1 lần/ngày, trước khi ngủ, cả 2 mắt",
        quantity: 2,
        unit: "lọ",
        stockQuantity: 10,
        isOutOfStock: false,
      },
      {
        id: "M8",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "3 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
      {
        id: "M9",
        name: "Omega-3 TG 1000mg",
        group: "Thực phẩm chức năng",
        dosage: "1 viên/ngày, uống sau ăn",
        quantity: 1,
        unit: "hộp (60v)",
        stockQuantity: 3,
        isOutOfStock: false,
      },
    ],
  },
  {
    id: "RX-004",
    patientName: "Phạm Thị Mai",
    patientId: "BN-20260402-0041",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Khô mắt nặng — bội nhiễm",
    prescribedAt: todayTimestamp(58),
    expiresAt: expiresIn(5),
    status: "pending",
    medications: [
      {
        id: "M10",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "6 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 3,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
      {
        id: "M11",
        name: "Systane Gel Drops",
        group: "Gel bôi trơn mắt",
        dosage: "1 lần/ngày, trước khi ngủ, cả 2 mắt",
        quantity: 1,
        unit: "tuýp",
        stockQuantity: 15,
        isOutOfStock: false,
      },
      {
        id: "M12",
        name: "Tobramycin 0.3%",
        group: "Kháng sinh nhỏ mắt",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt × 7 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 6,
        isOutOfStock: false,
      },
      {
        id: "M13",
        name: "Omega-3 TG 1000mg",
        group: "Thực phẩm chức năng",
        dosage: "2 viên/ngày, uống sau ăn",
        quantity: 1,
        unit: "hộp (60v)",
        stockQuantity: 3,
        isOutOfStock: false,
      },
      {
        id: "M14",
        name: "FML 0.1%",
        group: "Corticoid nhỏ mắt",
        dosage: "3 lần/ngày, mỗi lần 1 giọt, cả 2 mắt × 2 tuần",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 8,
        isOutOfStock: false,
      },
    ],
  },
  {
    id: "RX-005",
    patientName: "Vũ Đức Anh",
    patientId: "BN-20260403-0003",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Viêm bờ mi",
    icdCode: "H01.0",
    prescribedAt: todayTimestamp(73),
    expiresAt: expiresIn(7),
    status: "pending",
    medications: [
      {
        id: "M15",
        name: "Tobramycin 0.3%",
        group: "Kháng sinh nhỏ mắt",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt × 7 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 6,
        isOutOfStock: false,
      },
      {
        id: "M16",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
    ],
  },
  {
    id: "RX-006",
    patientName: "Đỗ Thị Thanh",
    patientId: "BN-20260403-0001",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Khô mắt nhẹ",
    icdCode: "H04.1",
    prescribedAt: todayTimestamp(120),
    dispensedAt: todayTimestamp(95),
    expiresAt: expiresIn(6),
    status: "dispensed",
    medications: [
      {
        id: "M17",
        name: "Refresh Tears 0.5%",
        group: "Nước mắt nhân tạo",
        dosage: "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt",
        quantity: 2,
        unit: "lọ",
        stockQuantity: 24,
        isOutOfStock: false,
      },
      {
        id: "M18",
        name: "Systane Gel Drops",
        group: "Gel bôi trơn mắt",
        dosage: "1 lần/ngày, trước khi ngủ, cả 2 mắt",
        quantity: 1,
        unit: "tuýp",
        stockQuantity: 15,
        isOutOfStock: false,
      },
      {
        id: "M19",
        name: "Omega-3 TG 1000mg",
        group: "Thực phẩm chức năng",
        dosage: "1 viên/ngày, uống sau ăn",
        quantity: 1,
        unit: "hộp (60v)",
        stockQuantity: 3,
        isOutOfStock: false,
      },
    ],
  },
]

// Medication catalog for substitution search dialog
export const medicationCatalog: MedicationCatalogItem[] = [
  { id: "CAT-001", name: "FML 0.1%", group: "Corticoid nhỏ mắt", stockQuantity: 8, unit: "lọ" },
  { id: "CAT-002", name: "Prednisolone 1%", group: "Corticoid nhỏ mắt", stockQuantity: 5, unit: "lọ" },
  { id: "CAT-003", name: "Refresh Tears 0.5%", group: "Nước mắt nhân tạo", stockQuantity: 24, unit: "lọ" },
  { id: "CAT-004", name: "Systane Ultra", group: "Nước mắt nhân tạo", stockQuantity: 18, unit: "lọ" },
  { id: "CAT-005", name: "Optive Plus", group: "Nước mắt nhân tạo", stockQuantity: 10, unit: "lọ" },
  { id: "CAT-006", name: "Tobramycin 0.3%", group: "Kháng sinh nhỏ mắt", stockQuantity: 6, unit: "lọ" },
  { id: "CAT-007", name: "Moxifloxacin 0.5%", group: "Kháng sinh nhỏ mắt", stockQuantity: 9, unit: "lọ" },
  { id: "CAT-008", name: "Opatanol 0.1%", group: "Thuốc chống dị ứng", stockQuantity: 12, unit: "lọ" },
  { id: "CAT-009", name: "Omega-3 TG 1000mg", group: "Thực phẩm chức năng", stockQuantity: 3, unit: "hộp (60v)" },
  { id: "CAT-010", name: "Atropine 0.01%", group: "Thuốc nhỏ mắt", stockQuantity: 10, unit: "lọ" },
]

export function getPharmacyMetrics(prescriptions: PrescriptionOrder[]): PharmacyMetrics {
  return {
    pendingCount: prescriptions.filter((p) => p.status === "pending").length,
    dispensedToday: prescriptions.filter((p) => p.status === "dispensed").length,
    lowStockAlerts: 3, // hardcoded for mock
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `mock-pharmacy.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-pharmacy.ts
git commit -m "feat: add pharmacy mock data types and sample prescriptions"
```

---

### Task 2: Sidebar Navigation — Add Pharmacy Route

**Files:**
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Add MedicineBottle02Icon import and nav item**

In `src/components/app-sidebar.tsx`, add `MedicineBottle02Icon` to the icon imports:

```typescript
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
  Stethoscope02Icon,
  UserGroupIcon,
  MedicineBottle02Icon,
} from "@hugeicons/core-free-icons"
```

Then add the pharmacy nav item at the end of the `navItems` array:

```typescript
const navItems = [
  { title: "Bệnh nhân", url: "/patients", icon: UserGroupIcon },
  { title: "Tiếp nhận", url: "/intake", icon: UserAdd01Icon },
  { title: "Lịch hẹn", url: "/schedule", icon: Calendar01Icon },
  { title: "Sàng lọc", url: "/screening", icon: Search01Icon },
  { title: "Khám bệnh", url: "/doctor", icon: Stethoscope02Icon },
  { title: "Nhà thuốc", url: "/pharmacy", icon: MedicineBottle02Icon },
]
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/app-sidebar.tsx
git commit -m "feat: add pharmacy nav item to sidebar"
```

---

### Task 3: Pharmacy Page Shell with Tabs

**Files:**
- Create: `src/pages/pharmacy/index.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the pharmacy page with header and tabs**

```typescript
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockPrescriptions, getPharmacyMetrics } from "@/data/mock-pharmacy"
import { PharmacyKpiCards } from "@/components/pharmacy/kpi-cards"
import { PharmacyStatusFilters } from "@/components/pharmacy/status-filters"
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table"
import type { PrescriptionStatus } from "@/data/mock-pharmacy"

type PharmacyFilter = "all" | "pending" | "dispensed"

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions)
  const [filter, setFilter] = useState<PharmacyFilter>("all")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("queue")
  const metrics = getPharmacyMetrics(prescriptions)

  const filtered = prescriptions
    .filter((p) => {
      if (filter === "all") return true
      return p.status === filter
    })
    .filter((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        p.patientName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q)
      )
    })

  const sorted = [...filtered].sort((a, b) => {
    // Pending first (FIFO — oldest on top), then dispensed (newest on top)
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1
    if (a.status === "pending") {
      return new Date(a.prescribedAt).getTime() - new Date(b.prescribedAt).getTime()
    }
    return new Date(b.dispensedAt ?? b.prescribedAt).getTime() - new Date(a.dispensedAt ?? a.prescribedAt).getTime()
  })

  const counts: Record<PharmacyFilter, number> = {
    all: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "pending").length,
    dispensed: prescriptions.filter((p) => p.status === "dispensed").length,
  }

  const handleDispense = (orderId: string) => {
    setPrescriptions((prev) =>
      prev.map((p) =>
        p.id === orderId
          ? { ...p, status: "dispensed" as PrescriptionStatus, dispensedAt: new Date().toISOString() }
          : p
      )
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Nhà thuốc</h1>
        <div className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Dược sĩ: Nguyễn Thị Lan
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            Hàng đợi đơn thuốc
            {metrics.pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                {metrics.pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="otc">Bán OTC</TabsTrigger>
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4 pt-2">
          <PharmacyKpiCards
            metrics={metrics}
            onStockAlertClick={() => setActiveTab("inventory")}
          />
          <PharmacyStatusFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
            search={search}
            onSearchChange={setSearch}
          />
          <PrescriptionQueueTable
            prescriptions={sorted}
            onDispense={handleDispense}
          />
        </TabsContent>

        <TabsContent value="otc">
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sẽ thiết kế chi tiết ở bước tiếp theo
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sẽ thiết kế chi tiết ở bước tiếp theo
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Add the route in App.tsx**

Add import at the top of `src/App.tsx`:

```typescript
import PharmacyDashboard from "@/pages/pharmacy/index"
```

Add route inside `<Routes>`, after the doctor routes:

```typescript
<Route path="/pharmacy" element={<PharmacyDashboard />} />
```

- [ ] **Step 3: Verify it compiles** (will fail — components don't exist yet, that's expected)

Run: `npx tsc --noEmit`
Expected: Errors about missing pharmacy components (kpi-cards, status-filters, prescription-queue-table). This is expected — we build them in Tasks 4–6.

- [ ] **Step 4: Commit**

```bash
git add src/pages/pharmacy/index.tsx src/App.tsx
git commit -m "feat: add pharmacy page shell with tabs and route"
```

---

### Task 4: KPI Cards Component

**Files:**
- Create: `src/components/pharmacy/kpi-cards.tsx`

- [ ] **Step 1: Create the KPI cards component**

```typescript
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import type { PharmacyMetrics } from "@/data/mock-pharmacy"

const kpiConfig = [
  {
    key: "pendingCount" as const,
    label: "Chờ phát thuốc",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "dispensedToday" as const,
    label: "Đã phát hôm nay",
    icon: CheckmarkCircle02Icon,
    colorClass: "",
  },
  {
    key: "lowStockAlerts" as const,
    label: "Cảnh báo tồn kho",
    icon: Alert01Icon,
    colorClass: "text-red-600",
    clickable: true,
  },
]

interface PharmacyKpiCardsProps {
  metrics: PharmacyMetrics
  onStockAlertClick: () => void
}

export function PharmacyKpiCards({
  metrics,
  onStockAlertClick,
}: PharmacyKpiCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {kpiConfig.map((kpi) => (
        <div
          key={kpi.key}
          className={`rounded-lg border border-border bg-background p-4 ${kpi.clickable ? "cursor-pointer transition-colors hover:bg-muted" : ""}`}
          onClick={kpi.clickable ? onStockAlertClick : undefined}
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
          <div className={`mt-1.5 text-2xl font-medium ${kpi.colorClass}`}>
            {metrics[kpi.key]}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors for this file

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/kpi-cards.tsx
git commit -m "feat: add pharmacy KPI cards component"
```

---

### Task 5: Status Filters Component (Search + Pills)

**Files:**
- Create: `src/components/pharmacy/status-filters.tsx`

- [ ] **Step 1: Create the status filters component**

```typescript
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useRef, useCallback } from "react"

export type PharmacyFilter = "all" | "pending" | "dispensed"

const filters: { key: PharmacyFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ phát" },
  { key: "dispensed", label: "Đã phát" },
]

interface PharmacyStatusFiltersProps {
  activeFilter: PharmacyFilter
  onFilterChange: (filter: PharmacyFilter) => void
  counts: Record<PharmacyFilter, number>
  search: string
  onSearchChange: (value: string) => void
}

export function PharmacyStatusFilters({
  activeFilter,
  onFilterChange,
  counts,
  search,
  onSearchChange,
}: PharmacyStatusFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange]
  )

  return (
    <div className="flex items-center justify-between">
      <div className="relative w-[300px]">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Tìm theo tên, mã BN, BS kê đơn..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              activeFilter === f.key
                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                : "border-border text-muted-foreground hover:border-muted-foreground/30"
            )}
          >
            {f.label} {counts[f.key]}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors for this file

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/status-filters.tsx
git commit -m "feat: add pharmacy status filters with search and pills"
```

---

### Task 6: Prescription Queue Table with Dropdown Actions

**Files:**
- Create: `src/components/pharmacy/prescription-queue-table.tsx`

- [ ] **Step 1: Create the queue table component**

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalIcon } from "@hugeicons/core-free-icons"
import { DispenseModal } from "@/components/pharmacy/dispense-modal"
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

function formatElapsed(isoDate: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 60000
  )
  if (diff < 60) return `${diff} phút trước`
  if (diff < 120) return `1h${String(diff - 60).padStart(2, "0")} phút trước`
  return `${Math.floor(diff / 60)}h trước`
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface PrescriptionQueueTableProps {
  prescriptions: PrescriptionOrder[]
  onDispense: (orderId: string) => void
}

export function PrescriptionQueueTable({
  prescriptions,
  onDispense,
}: PrescriptionQueueTableProps) {
  const [dispenseOrder, setDispenseOrder] = useState<PrescriptionOrder | null>(
    null
  )

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>BS kê đơn</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số thuốc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((rx) => (
              <TableRow
                key={rx.id}
                className={
                  rx.allergies && rx.allergies.length > 0
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              >
                <TableCell>
                  <div className="font-medium">
                    {rx.patientName}
                    {rx.allergies && rx.allergies.length > 0 && (
                      <span
                        className="ml-1 text-amber-500"
                        title={`Dị ứng: ${rx.allergies.join(", ")}`}
                      >
                        &#9888;
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rx.patientId}
                  </div>
                </TableCell>
                <TableCell>{rx.doctorName}</TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(rx.prescribedAt)}
                  </div>
                  {rx.status === "pending" && (
                    <div className="text-[11px] text-muted-foreground/70">
                      {formatElapsed(rx.prescribedAt)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {rx.medications.length} thuốc
                  </span>
                </TableCell>
                <TableCell>
                  {rx.status === "pending" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Chờ phát
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Đã phát
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                      >
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="size-4"
                          strokeWidth={2}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {rx.status === "pending" ? (
                        <>
                          <DropdownMenuItem
                            className="font-medium text-primary"
                            onClick={() => setDispenseOrder(rx)}
                          >
                            Phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>In đơn thuốc</DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem>
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Xem chi tiết phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>In đơn thuốc</DropdownMenuItem>
                          <DropdownMenuItem>In nhãn thuốc</DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {dispenseOrder && (
        <DispenseModal
          order={dispenseOrder}
          open={!!dispenseOrder}
          onClose={() => setDispenseOrder(null)}
          onConfirm={() => {
            onDispense(dispenseOrder.id)
            setDispenseOrder(null)
          }}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles** (will fail — DispenseModal doesn't exist yet, expected)

Run: `npx tsc --noEmit`
Expected: Error about missing `DispenseModal` — that's Task 7.

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/prescription-queue-table.tsx
git commit -m "feat: add prescription queue table with dropdown actions"
```

---

### Task 7: Dispense Modal

**Files:**
- Create: `src/components/pharmacy/dispense-modal.tsx`

- [ ] **Step 1: Create the dispense modal component**

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
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubstituteMedicationDialog } from "@/components/pharmacy/substitute-medication-dialog"
import type {
  PrescriptionOrder,
  PrescriptionMedication,
  MedicationCatalogItem,
} from "@/data/mock-pharmacy"

interface DispenseModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

function daysUntil(isoDate: string): number {
  const now = new Date()
  const exp = new Date(isoDate)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

export function DispenseModal({
  order,
  open,
  onClose,
  onConfirm,
}: DispenseModalProps) {
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    order.medications
  )
  const [substitutionReason, setSubstitutionReason] = useState(
    order.substitutionReason ?? ""
  )
  const [substituteTarget, setSubstituteTarget] =
    useState<PrescriptionMedication | null>(null)

  const hasSubstitutions = medications.some((m) => m.substitution)
  const hasOutOfStock = medications.some(
    (m) => m.isOutOfStock && !m.substitution
  )
  const daysLeft = daysUntil(order.expiresAt)
  const isExpired = daysLeft < 0
  const canConfirm =
    !isExpired && !hasOutOfStock && (!hasSubstitutions || substitutionReason.trim() !== "")

  const handleSubstitute = (
    medId: string,
    replacement: MedicationCatalogItem
  ) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              substitution: {
                name: replacement.name,
                group: replacement.group,
                stockQuantity: replacement.stockQuantity,
                unit: replacement.unit,
              },
            }
          : m
      )
    )
    setSubstituteTarget(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-[680px]">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              Phát thuốc — {order.patientName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Allergy Banner */}
            {order.allergies && order.allergies.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <span className="text-sm">&#9888;</span>
                <span>
                  Dị ứng: <strong>{order.allergies.join(", ")}</strong> — Hệ
                  thống sẽ cảnh báo nếu đơn thuốc chứa thành phần này
                </span>
              </div>
            )}

            {/* Prescription Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Mã bệnh nhân
                </div>
                <div className="text-sm font-medium">{order.patientId}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">BS kê đơn</div>
                <div className="text-sm font-medium">{order.doctorName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Chẩn đoán</div>
                <div className="text-sm font-medium">
                  {order.diagnosis}
                  {order.icdCode && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({order.icdCode})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  Hạn đơn thuốc
                </div>
                <div
                  className={`text-sm font-medium ${isExpired ? "text-red-600" : daysLeft <= 2 ? "text-red-600" : ""}`}
                >
                  {formatDate(order.expiresAt)}{" "}
                  <span className="font-normal text-muted-foreground">
                    {isExpired
                      ? "(Quá hạn)"
                      : `(còn ${daysLeft} ngày)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Notes */}
            {order.doctorNotes && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Ghi chú BS:</strong>{" "}
                {order.doctorNotes}
              </div>
            )}

            {/* Medication Table */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Danh sách thuốc trong đơn
              </div>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Tên thuốc</TableHead>
                      <TableHead>Liều dùng</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="w-[80px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow
                        key={med.id}
                        className={
                          med.isOutOfStock && !med.substitution
                            ? "bg-red-50 dark:bg-red-950/20"
                            : ""
                        }
                      >
                        <TableCell>
                          {med.substitution ? (
                            <>
                              <div className="font-medium text-muted-foreground line-through">
                                {med.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
                              {med.isOutOfStock && (
                                <span className="mt-0.5 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                  &#10007; Hết hàng
                                </span>
                              )}
                              <div className="mt-1.5 font-medium text-primary">
                                → {med.substitution.name}
                              </div>
                              <div className="text-xs text-primary">
                                Thay thế tương đương
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
                              {med.isOutOfStock && (
                                <span className="mt-0.5 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                  &#10007; Hết hàng
                                </span>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {med.dosage}
                        </TableCell>
                        <TableCell>
                          {med.quantity} {med.unit}
                        </TableCell>
                        <TableCell>
                          {med.isOutOfStock && !med.substitution && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs text-primary"
                              onClick={() => setSubstituteTarget(med)}
                            >
                              Thay thế
                            </Button>
                          )}
                          {med.substitution && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs text-primary"
                              onClick={() => setSubstituteTarget(med)}
                            >
                              &#9998; Sửa
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Substitution Reason */}
            {hasSubstitutions && (
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Lý do thay thế thuốc
                </div>
                <Textarea
                  value={substitutionReason}
                  onChange={(e) => setSubstitutionReason(e.target.value)}
                  placeholder="Nhập lý do thay thế thuốc..."
                  className="min-h-[60px] text-sm"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              In nhãn thuốc
            </Button>
            <Button variant="outline" onClick={onClose}>
              In đơn thuốc
            </Button>
            <Button disabled={!canConfirm} onClick={onConfirm}>
              Xác nhận phát thuốc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {substituteTarget && (
        <SubstituteMedicationDialog
          medication={substituteTarget}
          open={!!substituteTarget}
          onClose={() => setSubstituteTarget(null)}
          onSelect={(replacement) =>
            handleSubstitute(substituteTarget.id, replacement)
          }
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Verify it compiles** (will fail — SubstituteMedicationDialog doesn't exist yet)

Run: `npx tsc --noEmit`
Expected: Error about missing `SubstituteMedicationDialog` — that's Task 8.

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/dispense-modal.tsx
git commit -m "feat: add dispense modal with allergy banner and medication table"
```

---

### Task 8: Substitute Medication Dialog

**Files:**
- Create: `src/components/pharmacy/substitute-medication-dialog.tsx`

- [ ] **Step 1: Create the substitute medication dialog**

```typescript
import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import {
  medicationCatalog,
  type PrescriptionMedication,
  type MedicationCatalogItem,
} from "@/data/mock-pharmacy"

interface SubstituteMedicationDialogProps {
  medication: PrescriptionMedication
  open: boolean
  onClose: () => void
  onSelect: (replacement: MedicationCatalogItem) => void
}

export function SubstituteMedicationDialog({
  medication,
  open,
  onClose,
  onSelect,
}: SubstituteMedicationDialogProps) {
  const [search, setSearch] = useState("")

  const results = useMemo(() => {
    return medicationCatalog
      .filter((item) => item.group === medication.group)
      .filter((item) => item.name !== medication.name)
      .filter((item) => item.stockQuantity > 0)
      .filter((item) => {
        if (!search) return true
        return item.name.toLowerCase().includes(search.toLowerCase())
      })
  }, [medication, search])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Thay thế thuốc
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Chọn thuốc tương đương cho{" "}
            <strong>{medication.name}</strong> (nhóm: {medication.group})
          </p>
        </DialogHeader>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Tìm thuốc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[240px] space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy thuốc phù hợp
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.group}
                  </div>
                </div>
                <span className="text-xs text-emerald-600">
                  {item.stockQuantity} {item.unit}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the full project compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/substitute-medication-dialog.tsx
git commit -m "feat: add substitute medication dialog with search"
```

---

### Task 9: Visual Verification and Final Polish

**Files:**
- All pharmacy files created in Tasks 1–8

- [ ] **Step 1: Start the dev server and verify the full flow**

Run: `npm run dev`

Open `http://localhost:3000/pharmacy` and verify:
1. Sidebar shows "Nhà thuốc" nav item with pill bottle icon
2. Page header: "Nhà thuốc" title + "Dược sĩ: Nguyễn Thị Lan" badge
3. Three tabs — "Hàng đợi đơn thuốc" active by default with red badge "5"
4. KPI cards: Chờ phát thuốc (amber 5), Đã phát hôm nay (12), Cảnh báo tồn kho (red 3)
5. Click "Cảnh báo tồn kho" card → switches to "Tồn kho" tab
6. Filter pills work: Tất cả / Chờ phát / Đã phát
7. Search box filters by name/ID/doctor
8. Table rows: allergy row (Trần Văn Minh) has amber tint + &#9888; icon
9. Table sorting: pending FIFO oldest first, dispensed newest first
10. Elapsed time: shows "X phút trước" for pending, only timestamp for dispensed
11. Three-dot menu: "Phát thuốc" (primary) for pending, view/print for dispensed

- [ ] **Step 2: Verify dispense modal**

Click three-dot → "Phát thuốc" on Trần Văn Minh row:
1. Modal opens with "Phát thuốc — Trần Văn Minh"
2. Allergy banner (red): "Dị ứng: Chloramphenicol"
3. Prescription info grid: patient ID, doctor, diagnosis + ICD, expiry
4. Doctor notes: "Bệnh nhân dùng Omega-3 liều cao..."
5. Medication table: 4 rows, Lotemax struck through with FML 0.1% substitution (teal)
6. "Hết hàng" red badge on Lotemax row
7. Substitution reason textarea visible with pre-filled text
8. "Xác nhận phát thuốc" button enabled (all conditions met)
9. Click confirm → row updates to "Đã phát", modal closes

- [ ] **Step 3: Verify OTC and Tồn kho tabs show placeholder**

Click "Bán OTC" tab → shows "Sẽ thiết kế chi tiết ở bước tiếp theo"
Click "Tồn kho" tab → shows same placeholder text

- [ ] **Step 4: Run lint and type check**

Run: `npm run typecheck && npm run lint`
Expected: No errors

- [ ] **Step 5: Fix any issues found during visual verification**

Address any visual discrepancies, spacing issues, or functional bugs found in steps 1–3.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: complete pharmacist dashboard with queue, dispense modal, and placeholders"
```
