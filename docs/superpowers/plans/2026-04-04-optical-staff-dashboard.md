# Optical Staff Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Optical Staff Dashboard at `/optical` with 3 tabs (Tư vấn kính, Đơn hàng kính, Kho kính), mock data, and full UI matching existing dashboard patterns.

**Architecture:** Tab-per-file structure matching the Pharmacy dashboard. Each tab is a self-contained component with its own KPI cards, filters, and table. Mock data lives in `src/data/mock-optical.ts` with types and helper functions.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Tabs, Table, Button, DropdownMenu, Input), Hugeicons

---

### Task 1: Mock Data and Types

**Files:**
- Create: `src/data/mock-optical.ts`

- [ ] **Step 1: Create the mock data file with types and data**

```typescript
import { offsetDate, todayTimestamp } from "@/lib/demo-date"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConsultationStatus = "waiting_consultation" | "in_consultation"
export type OrderStatus = "ordered" | "fabricating" | "ready_delivery" | "delivered"

export interface OpticalConsultation {
  id: string
  patientName: string
  patientId: string
  doctor: string
  rxOd: string
  rxOs: string
  status: ConsultationStatus
  assignedStaff?: string
  queuedAt: string
}

export interface OpticalOrder {
  id: string
  patientName: string
  patientId: string
  lensType: string
  frameName: string
  frameColor: string
  lensName: string
  lensSpec: string
  orderDate: string
  status: OrderStatus
  deliveredAt?: string
  phone?: string
}

export interface FrameItem {
  barcode: string
  name: string
  brand: string
  color: string
  price: number
  stock: number
  lowStockThreshold: number
}

export interface LensItem {
  code: string
  name: string
  brand: string
  refractiveIndex: string
  type: string
  price: number
  stock: number
  lowStockThreshold: number
}

export interface ConsultationMetrics {
  waitingCount: number
  consultingCount: number
  ordersCreatedToday: number
  deliveredToday: number
}

export interface OrderMetrics {
  orderedCount: number
  fabricatingCount: number
  readyCount: number
  deliveredToday: number
}

export interface InventoryMetrics {
  totalFrames: number
  totalLenses: number
  lowStockCount: number
}

// ─── Mock Consultations ─────────────────────────────────────────────────────

export const mockConsultations: OpticalConsultation[] = [
  {
    id: "oc-001",
    patientName: "Trần Văn Hùng",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0012`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-2.50 / -0.75 x 180",
    rxOs: "-3.00 / -1.00 x 175",
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(12),
  },
  {
    id: "oc-002",
    patientName: "Nguyễn Thị Lan",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0008`,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "+1.50 ADD +2.00",
    rxOs: "+1.75 ADD +2.00",
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(8),
  },
  {
    id: "oc-003",
    patientName: "Lê Hoàng Phúc",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0015`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-4.25 / -1.50 x 10",
    rxOs: "-3.75 / -1.25 x 170",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(35),
  },
  {
    id: "oc-004",
    patientName: "Phạm Minh Châu",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0019`,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "-1.00 / -0.50 x 90",
    rxOs: "-1.25 / -0.50 x 85",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(22),
  },
  {
    id: "oc-005",
    patientName: "Võ Thanh Tâm",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0021`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-5.50 / -2.00 x 5",
    rxOs: "-5.00 / -1.75 x 175",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(10),
  },
]

// ─── Mock Orders ────────────────────────────────────────────────────────────

export const mockOrders: OpticalOrder[] = [
  {
    id: `DK-${offsetDate(-3).replace(/-/g, "")}-001`,
    patientName: "Lê Hoàng Phúc",
    patientId: `BN-${offsetDate(-3).replace(/-/g, "")}-0003`,
    lensType: "Kính cận",
    frameName: "Rayban RB5154",
    frameColor: "Đen nhám",
    lensName: "Essilor Crizal Alizé",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-3),
    status: "ordered",
    phone: "0901234567",
  },
  {
    id: `DK-${offsetDate(-3).replace(/-/g, "")}-002`,
    patientName: "Nguyễn Văn An",
    patientId: `BN-${offsetDate(-3).replace(/-/g, "")}-0007`,
    lensType: "Kính cận",
    frameName: "Oakley OX8046",
    frameColor: "Xanh navy",
    lensName: "Hoya BlueControl",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-3),
    status: "ordered",
    phone: "0912345678",
  },
  {
    id: `DK-${offsetDate(-2).replace(/-/g, "")}-001`,
    patientName: "Trần Thị Bích",
    patientId: `BN-${offsetDate(-2).replace(/-/g, "")}-0001`,
    lensType: "Kính đa tròng",
    frameName: "Việt Pháp VP2201",
    frameColor: "Vàng hồng",
    lensName: "Essilor Varilux",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-2),
    status: "ordered",
    phone: "0923456789",
  },
  {
    id: `DK-${offsetDate(-5).replace(/-/g, "")}-003`,
    patientName: "Phạm Quốc Bảo",
    patientId: `BN-${offsetDate(-5).replace(/-/g, "")}-0005`,
    lensType: "Kính cận",
    frameName: "Rayban RB7047",
    frameColor: "Nâu tortoise",
    lensName: "Hoya Nulux",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-5),
    status: "fabricating",
    phone: "0934567890",
  },
  {
    id: `DK-${offsetDate(-4).replace(/-/g, "")}-001`,
    patientName: "Võ Minh Tâm",
    patientId: `BN-${offsetDate(-4).replace(/-/g, "")}-0002`,
    lensType: "Kính lão",
    frameName: "Việt Pháp VP1105",
    frameColor: "Bạc",
    lensName: "Việt Pháp Titan",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-4),
    status: "fabricating",
    phone: "0945678901",
  },
  {
    id: `DK-${offsetDate(-4).replace(/-/g, "")}-002`,
    patientName: "Đặng Thu Hà",
    patientId: `BN-${offsetDate(-4).replace(/-/g, "")}-0006`,
    lensType: "Kính cận",
    frameName: "Oakley OX3227",
    frameColor: "Đen bóng",
    lensName: "Essilor Crizal Prevencia",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-4),
    status: "fabricating",
    phone: "0956789012",
  },
  {
    id: `DK-${offsetDate(-7).replace(/-/g, "")}-001`,
    patientName: "Hoàng Thị Mai",
    patientId: `BN-${offsetDate(-7).replace(/-/g, "")}-0004`,
    lensType: "Kính cận",
    frameName: "Rayban RB5228",
    frameColor: "Đen",
    lensName: "Hoya Diamond",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-7),
    status: "ready_delivery",
    phone: "0967890123",
  },
  {
    id: `DK-${offsetDate(-6).replace(/-/g, "")}-002`,
    patientName: "Lý Quang Vinh",
    patientId: `BN-${offsetDate(-6).replace(/-/g, "")}-0008`,
    lensType: "Kính mát có độ",
    frameName: "Oakley OO9102",
    frameColor: "Đen mờ",
    lensName: "Essilor Xperio",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-6),
    status: "ready_delivery",
    phone: "0978901234",
  },
  {
    id: `DK-${offsetDate(-10).replace(/-/g, "")}-001`,
    patientName: "Trần Minh Đức",
    patientId: `BN-${offsetDate(-10).replace(/-/g, "")}-0001`,
    lensType: "Kính cận",
    frameName: "Việt Pháp VP3302",
    frameColor: "Xám",
    lensName: "Việt Pháp UV420",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-10),
    status: "delivered",
    deliveredAt: offsetDate(0),
    phone: "0989012345",
  },
  {
    id: `DK-${offsetDate(-9).replace(/-/g, "")}-002`,
    patientName: "Nguyễn Hồng Nhung",
    patientId: `BN-${offsetDate(-9).replace(/-/g, "")}-0003`,
    lensType: "Kính cận",
    frameName: "Rayban RB5154",
    frameColor: "Nâu",
    lensName: "Essilor Crizal Alizé",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-9),
    status: "delivered",
    deliveredAt: offsetDate(0),
    phone: "0990123456",
  },
  {
    id: `DK-${offsetDate(-12).replace(/-/g, "")}-001`,
    patientName: "Lê Thị Hoa",
    patientId: `BN-${offsetDate(-12).replace(/-/g, "")}-0005`,
    lensType: "Kính lão",
    frameName: "Việt Pháp VP1105",
    frameColor: "Vàng",
    lensName: "Việt Pháp Titan",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-12),
    status: "delivered",
    deliveredAt: offsetDate(-1),
    phone: "0901234568",
  },
  {
    id: `DK-${offsetDate(-14).replace(/-/g, "")}-003`,
    patientName: "Bùi Văn Sơn",
    patientId: `BN-${offsetDate(-14).replace(/-/g, "")}-0009`,
    lensType: "Kính đa tròng",
    frameName: "Oakley OX8046",
    frameColor: "Đen",
    lensName: "Essilor Varilux",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-14),
    status: "delivered",
    deliveredAt: offsetDate(-2),
    phone: "0912345679",
  },
]

// ─── Mock Frames ────────────────────────────────────────────────────────────

export const mockFrames: FrameItem[] = [
  { barcode: "GK-FR-00001", name: "RB5154 Clubmaster", brand: "Rayban", color: "Đen nhám", price: 2800000, stock: 12, lowStockThreshold: 3 },
  { barcode: "GK-FR-00002", name: "RB7047", brand: "Rayban", color: "Nâu tortoise", price: 3200000, stock: 8, lowStockThreshold: 3 },
  { barcode: "GK-FR-00003", name: "OX8046 Airdrop", brand: "Oakley", color: "Xanh navy", price: 3500000, stock: 6, lowStockThreshold: 3 },
  { barcode: "GK-FR-00004", name: "VP2201", brand: "Việt Pháp", color: "Vàng hồng", price: 850000, stock: 2, lowStockThreshold: 3 },
  { barcode: "GK-FR-00005", name: "VP1105", brand: "Việt Pháp", color: "Bạc", price: 750000, stock: 1, lowStockThreshold: 3 },
  { barcode: "GK-FR-00006", name: "RB5228", brand: "Rayban", color: "Đen", price: 2600000, stock: 15, lowStockThreshold: 3 },
  { barcode: "GK-FR-00007", name: "OX3227", brand: "Oakley", color: "Đen bóng", price: 3800000, stock: 0, lowStockThreshold: 3 },
  { barcode: "GK-FR-00008", name: "VP3302", brand: "Việt Pháp", color: "Xám", price: 900000, stock: 10, lowStockThreshold: 3 },
]

// ─── Mock Lenses ────────────────────────────────────────────────────────────

export const mockLenses: LensItem[] = [
  { code: "GK-LN-001", name: "Crizal Alizé UV", brand: "Essilor", refractiveIndex: "1.60", type: "Đơn tròng", price: 1800000, stock: 20, lowStockThreshold: 5 },
  { code: "GK-LN-002", name: "Crizal Prevencia", brand: "Essilor", refractiveIndex: "1.60", type: "Đơn tròng", price: 2200000, stock: 15, lowStockThreshold: 5 },
  { code: "GK-LN-003", name: "Varilux Comfort Max", brand: "Essilor", refractiveIndex: "1.67", type: "Đa tròng", price: 5500000, stock: 8, lowStockThreshold: 5 },
  { code: "GK-LN-004", name: "BlueControl", brand: "Hoya", refractiveIndex: "1.56", type: "Đơn tròng", price: 1200000, stock: 25, lowStockThreshold: 5 },
  { code: "GK-LN-005", name: "Nulux EP", brand: "Hoya", refractiveIndex: "1.60", type: "Đơn tròng", price: 1600000, stock: 3, lowStockThreshold: 5 },
  { code: "GK-LN-006", name: "Diamond Finish", brand: "Hoya", refractiveIndex: "1.67", type: "Đơn tròng", price: 2800000, stock: 10, lowStockThreshold: 5 },
  { code: "GK-LN-007", name: "Titan UV420", brand: "Việt Pháp", refractiveIndex: "1.56", type: "Đơn tròng", price: 450000, stock: 40, lowStockThreshold: 5 },
  { code: "GK-LN-008", name: "Xperio Polarised", brand: "Essilor", refractiveIndex: "1.60", type: "Đơn tròng", price: 3200000, stock: 2, lowStockThreshold: 5 },
]

// ─── Metric Helpers ─────────────────────────────────────────────────────────

export function getConsultationMetrics(
  consultations: OpticalConsultation[],
  orders: OpticalOrder[]
): ConsultationMetrics {
  const today = offsetDate(0)
  return {
    waitingCount: consultations.filter((c) => c.status === "waiting_consultation").length,
    consultingCount: consultations.filter((c) => c.status === "in_consultation").length,
    ordersCreatedToday: orders.filter((o) => o.orderDate === today).length,
    deliveredToday: orders.filter((o) => o.status === "delivered" && o.deliveredAt === today).length,
  }
}

export function getOrderMetrics(orders: OpticalOrder[]): OrderMetrics {
  const today = offsetDate(0)
  return {
    orderedCount: orders.filter((o) => o.status === "ordered").length,
    fabricatingCount: orders.filter((o) => o.status === "fabricating").length,
    readyCount: orders.filter((o) => o.status === "ready_delivery").length,
    deliveredToday: orders.filter((o) => o.status === "delivered" && o.deliveredAt === today).length,
  }
}

export function getInventoryMetrics(
  frames: FrameItem[],
  lenses: LensItem[]
): InventoryMetrics {
  const lowFrames = frames.filter((f) => f.stock <= f.lowStockThreshold).length
  const lowLenses = lenses.filter((l) => l.stock <= l.lowStockThreshold).length
  return {
    totalFrames: frames.length,
    totalLenses: lenses.length,
    lowStockCount: lowFrames + lowLenses,
  }
}

/** Format price with thousands separator: 2800000 → "2,800,000" */
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US")
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `mock-optical.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-optical.ts
git commit -m "feat: add optical staff mock data and types"
```

---

### Task 2: KPI Cards Component

**Files:**
- Create: `src/components/optical/kpi-cards.tsx`

- [ ] **Step 1: Create the KPI cards component**

This component renders KPI card grids for all 3 tabs. It accepts a config array and a values record.

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface KpiCardConfig {
  key: string
  label: string
  icon: IconSvgElement
  colorClass: string
  subtitle?: string
  highlightWhen?: (value: number) => boolean
}

interface OpticalKpiCardsProps {
  config: KpiCardConfig[]
  values: Record<string, number>
  columns?: 3 | 4
}

export function OpticalKpiCards({
  config,
  values,
  columns = 4,
}: OpticalKpiCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3.5",
        columns === 3 ? "grid-cols-3" : "grid-cols-4"
      )}
    >
      {config.map((kpi) => {
        const value = values[kpi.key] ?? 0
        const highlight = kpi.highlightWhen?.(value) ?? false

        return (
          <div
            key={kpi.key}
            className={cn(
              "rounded-lg border border-border bg-background p-4",
              highlight && "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            )}
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
            <div className={cn("mt-1.5 text-3xl font-bold", kpi.colorClass)}>
              {value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {kpi.subtitle || "\u00A0"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { KpiCardConfig }
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/kpi-cards.tsx
git commit -m "feat: add optical KPI cards component"
```

---

### Task 3: Status Filters Component

**Files:**
- Create: `src/components/optical/status-filters.tsx`

- [ ] **Step 1: Create the shared status filter component**

This is used across all 3 tabs. Matches the Doctor dashboard filter style (dark bg when active).

```tsx
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useRef, useCallback } from "react"

interface FilterOption<T extends string> {
  key: T
  label: string
}

interface OpticalStatusFiltersProps<T extends string> {
  filters: FilterOption<T>[]
  activeFilter: T
  onFilterChange: (filter: T) => void
  counts?: Record<T, number>
  searchPlaceholder: string
  search: string
  onSearchChange: (value: string) => void
}

export function OpticalStatusFilters<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  counts,
  searchPlaceholder,
  search,
  onSearchChange,
}: OpticalStatusFiltersProps<T>) {
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
      <div className="relative w-[280px]">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder={searchPlaceholder}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
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
            {counts && ` ${counts[f.key]}`}
          </button>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/status-filters.tsx
git commit -m "feat: add optical status filters component"
```

---

### Task 4: Consultation Queue Table

**Files:**
- Create: `src/components/optical/consultation-queue.tsx`

- [ ] **Step 1: Create the consultation queue table**

```tsx
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
import {
  MoreVerticalIcon,
  UserAdd01Icon,
  EyeIcon,
  FileAddIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { OpticalConsultation } from "@/data/mock-optical"

interface ConsultationQueueProps {
  consultations: OpticalConsultation[]
  onAcceptPatient: (id: string) => void
  onCreateOrder: (id: string) => void
  onReturnToQueue: (id: string) => void
}

function getWaitMinutes(queuedAt: string): number {
  return Math.floor((Date.now() - new Date(queuedAt).getTime()) / 60000)
}

export function ConsultationQueue({
  consultations,
  onAcceptPatient,
  onCreateOrder,
  onReturnToQueue,
}: ConsultationQueueProps) {
  const sorted = [...consultations].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "in_consultation" ? -1 : 1
    }
    return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">STT</TableHead>
          <TableHead>Bệnh nhân</TableHead>
          <TableHead>BS chỉ định</TableHead>
          <TableHead>Đơn kính BS</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thời gian chờ</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c, i) => {
          const waitMin = getWaitMinutes(c.queuedAt)
          const isConsulting = c.status === "in_consultation"

          return (
            <TableRow
              key={c.id}
              className={cn(isConsulting && "bg-blue-50 dark:bg-blue-950/30")}
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{c.patientName}</div>
                <div className="text-xs text-muted-foreground">
                  {c.patientId}
                </div>
              </TableCell>
              <TableCell>{c.doctor}</TableCell>
              <TableCell>
                <div className="font-mono text-xs text-muted-foreground leading-relaxed">
                  OD: {c.rxOd}
                  <br />
                  OS: {c.rxOs}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    isConsulting
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isConsulting ? "bg-blue-500" : "bg-amber-500"
                    )}
                  />
                  {isConsulting ? "Đang tư vấn" : "Chờ tư vấn"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-xs",
                    waitMin >= 30
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {waitMin} phút
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    {isConsulting ? (
                      <>
                        <DropdownMenuItem
                          onClick={() => onCreateOrder(c.id)}
                        >
                          <HugeiconsIcon
                            icon={FileAddIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Tạo đơn kính
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Xem đơn kính BS
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onReturnToQueue(c.id)}
                        >
                          <HugeiconsIcon
                            icon={UndoIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Trả lại hàng đợi
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={() => onAcceptPatient(c.id)}
                        >
                          <HugeiconsIcon
                            icon={UserAdd01Icon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Nhận BN
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Xem đơn kính BS
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/consultation-queue.tsx
git commit -m "feat: add optical consultation queue table"
```

---

### Task 5: Tab Consultation

**Files:**
- Create: `src/components/optical/tab-consultation.tsx`

- [ ] **Step 1: Create the consultation tab component**

```tsx
import { useState } from "react"
import {
  Clock01Icon,
  UserGroupIcon,
  File02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { ConsultationQueue } from "@/components/optical/consultation-queue"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type {
  OpticalConsultation,
  ConsultationStatus,
  ConsultationMetrics,
} from "@/data/mock-optical"

type ConsultationFilter = "all" | "waiting_consultation" | "in_consultation"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "waitingCount",
    label: "Chờ tư vấn",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
    subtitle: "bệnh nhân",
    highlightWhen: (v) => v > 0,
  },
  {
    key: "consultingCount",
    label: "Đang tư vấn",
    icon: UserGroupIcon,
    colorClass: "text-blue-600",
  },
  {
    key: "ordersCreatedToday",
    label: "Đã tạo đơn hôm nay",
    icon: File02Icon,
    colorClass: "text-emerald-600",
  },
  {
    key: "deliveredToday",
    label: "Đã giao hôm nay",
    icon: CheckmarkCircle02Icon,
    colorClass: "",
  },
]

const filterOptions: { key: ConsultationFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "waiting_consultation", label: "Chờ tư vấn" },
  { key: "in_consultation", label: "Đang tư vấn" },
]

interface TabConsultationProps {
  consultations: OpticalConsultation[]
  metrics: ConsultationMetrics
  onUpdateConsultations: (
    updater: (prev: OpticalConsultation[]) => OpticalConsultation[]
  ) => void
}

export function TabConsultation({
  consultations,
  metrics,
  onUpdateConsultations,
}: TabConsultationProps) {
  const [filter, setFilter] = useState<ConsultationFilter>("all")
  const [search, setSearch] = useState("")

  const filtered = consultations
    .filter((c) => {
      if (filter === "all") return true
      return c.status === filter
    })
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.patientName.toLowerCase().includes(q) ||
        c.patientId.toLowerCase().includes(q) ||
        c.doctor.toLowerCase().includes(q)
      )
    })

  const counts: Record<ConsultationFilter, number> = {
    all: consultations.length,
    waiting_consultation: consultations.filter(
      (c) => c.status === "waiting_consultation"
    ).length,
    in_consultation: consultations.filter(
      (c) => c.status === "in_consultation"
    ).length,
  }

  const handleAcceptPatient = (id: string) => {
    onUpdateConsultations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "in_consultation" as ConsultationStatus,
              assignedStaff: "Nguyễn Thị Mai",
            }
          : c
      )
    )
  }

  const handleReturnToQueue = (id: string) => {
    onUpdateConsultations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "waiting_consultation" as ConsultationStatus,
              assignedStaff: undefined,
            }
          : c
      )
    )
  }

  const handleCreateOrder = (_id: string) => {
    // Placeholder — will open order form in future
  }

  return (
    <div className="space-y-4">
      <OpticalKpiCards
        config={kpiConfig}
        values={metrics as unknown as Record<string, number>}
      />
      <OpticalStatusFilters
        filters={filterOptions}
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
        searchPlaceholder="Tìm theo tên, mã BN, SĐT..."
        search={search}
        onSearchChange={setSearch}
      />
      <ConsultationQueue
        consultations={filtered}
        onAcceptPatient={handleAcceptPatient}
        onCreateOrder={handleCreateOrder}
        onReturnToQueue={handleReturnToQueue}
      />
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/tab-consultation.tsx
git commit -m "feat: add optical consultation tab"
```

---

### Task 6: Order Table

**Files:**
- Create: `src/components/optical/order-table.tsx`

- [ ] **Step 1: Create the order table component**

```tsx
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
import {
  MoreVerticalIcon,
  EyeIcon,
  Settings02Icon,
  CheckmarkCircle02Icon,
  PrinterIcon,
  CallingIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { OpticalOrder, OrderStatus } from "@/data/mock-optical"

interface OrderTableProps {
  orders: OpticalOrder[]
  onUpdateStatus: (id: string, status: OrderStatus) => void
}

function formatOrderDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  ordered: {
    label: "Đã đặt",
    className:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  fabricating: {
    label: "Đang gia công",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ready_delivery: {
    label: "Sẵn sàng giao",
    className:
      "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  delivered: {
    label: "Đã giao",
    className: "bg-secondary text-secondary-foreground",
  },
}

export function OrderTable({ orders, onUpdateStatus }: OrderTableProps) {
  const sorted = [...orders].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1
    if (a.status !== "delivered" && b.status === "delivered") return -1
    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã đơn</TableHead>
          <TableHead>Bệnh nhân</TableHead>
          <TableHead>Loại kính</TableHead>
          <TableHead>Gọng</TableHead>
          <TableHead>Tròng</TableHead>
          <TableHead>Ngày đặt</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((o) => {
          const sc = statusConfig[o.status]
          const isDelivered = o.status === "delivered"

          return (
            <TableRow
              key={o.id}
              className={cn(isDelivered && "opacity-55")}
            >
              <TableCell>
                <span className="font-mono text-xs">{o.id}</span>
              </TableCell>
              <TableCell>
                <div className="font-medium">{o.patientName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.patientId}
                </div>
              </TableCell>
              <TableCell>{o.lensType}</TableCell>
              <TableCell>
                <div>{o.frameName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.frameColor}
                </div>
              </TableCell>
              <TableCell>
                <div>{o.lensName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.lensSpec}
                </div>
              </TableCell>
              <TableCell>{formatOrderDate(o.orderDate)}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    sc.className
                  )}
                >
                  {sc.label}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={EyeIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>

                    {o.status === "ordered" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(o.id, "fabricating")}
                      >
                        <HugeiconsIcon
                          icon={Settings02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Bắt đầu gia công
                      </DropdownMenuItem>
                    )}

                    {o.status === "fabricating" && (
                      <DropdownMenuItem
                        onClick={() =>
                          onUpdateStatus(o.id, "ready_delivery")
                        }
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Hoàn thành gia công
                      </DropdownMenuItem>
                    )}

                    {o.status === "ready_delivery" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(o.id, "delivered")}
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Xác nhận giao kính
                      </DropdownMenuItem>
                    )}

                    {o.status !== "delivered" && (
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        In đơn kính
                      </DropdownMenuItem>
                    )}

                    {o.status === "delivered" && (
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        In đơn kính
                      </DropdownMenuItem>
                    )}

                    {o.status === "ready_delivery" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={CallingIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Liên hệ BN
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
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

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/order-table.tsx
git commit -m "feat: add optical order table"
```

---

### Task 7: Tab Orders

**Files:**
- Create: `src/components/optical/tab-orders.tsx`

- [ ] **Step 1: Create the orders tab component**

```tsx
import { useState } from "react"
import {
  CheckmarkCircle02Icon,
  Settings02Icon,
  DeliveryTruck01Icon,
  PackageDelivered01Icon,
} from "@hugeicons/core-free-icons"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { OrderTable } from "@/components/optical/order-table"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type { OpticalOrder, OrderStatus, OrderMetrics } from "@/data/mock-optical"
import { offsetDate } from "@/lib/demo-date"

type OrderFilter =
  | "all"
  | "ordered"
  | "fabricating"
  | "ready_delivery"
  | "delivered"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "orderedCount",
    label: "Đã đặt",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-green-600",
  },
  {
    key: "fabricatingCount",
    label: "Đang gia công",
    icon: Settings02Icon,
    colorClass: "text-blue-600",
    highlightWhen: (v) => v > 0,
  },
  {
    key: "readyCount",
    label: "Sẵn sàng giao",
    icon: DeliveryTruck01Icon,
    colorClass: "text-teal-600",
  },
  {
    key: "deliveredToday",
    label: "Đã giao hôm nay",
    icon: PackageDelivered01Icon,
    colorClass: "",
  },
]

const filterOptions: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "ordered", label: "Đã đặt" },
  { key: "fabricating", label: "Đang gia công" },
  { key: "ready_delivery", label: "Sẵn sàng giao" },
  { key: "delivered", label: "Đã giao" },
]

interface TabOrdersProps {
  orders: OpticalOrder[]
  metrics: OrderMetrics
  onUpdateOrders: (
    updater: (prev: OpticalOrder[]) => OpticalOrder[]
  ) => void
}

export function TabOrders({
  orders,
  metrics,
  onUpdateOrders,
}: TabOrdersProps) {
  const [filter, setFilter] = useState<OrderFilter>("all")
  const [search, setSearch] = useState("")

  const filtered = orders
    .filter((o) => {
      if (filter === "all") return true
      return o.status === filter
    })
    .filter((o) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.patientId.toLowerCase().includes(q)
      )
    })

  const counts: Record<OrderFilter, number> = {
    all: orders.length,
    ordered: orders.filter((o) => o.status === "ordered").length,
    fabricating: orders.filter((o) => o.status === "fabricating").length,
    ready_delivery: orders.filter((o) => o.status === "ready_delivery")
      .length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    onUpdateOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: newStatus,
              deliveredAt:
                newStatus === "delivered" ? offsetDate(0) : o.deliveredAt,
            }
          : o
      )
    )
  }

  return (
    <div className="space-y-4">
      <OpticalKpiCards
        config={kpiConfig}
        values={metrics as unknown as Record<string, number>}
      />
      <OpticalStatusFilters
        filters={filterOptions}
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
        searchPlaceholder="Tìm theo mã đơn, tên BN..."
        search={search}
        onSearchChange={setSearch}
      />
      <OrderTable orders={filtered} onUpdateStatus={handleUpdateStatus} />
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/tab-orders.tsx
git commit -m "feat: add optical orders tab"
```

---

### Task 8: Frame Table and Lens Table

**Files:**
- Create: `src/components/optical/frame-table.tsx`
- Create: `src/components/optical/lens-table.tsx`

- [ ] **Step 1: Create the frame table component**

```tsx
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  EyeIcon,
  Edit02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { FrameItem } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface FrameTableProps {
  frames: FrameItem[]
}

export function FrameTable({ frames }: FrameTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Barcode</TableHead>
          <TableHead>Tên gọng</TableHead>
          <TableHead>Thương hiệu</TableHead>
          <TableHead>Màu sắc</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {frames.map((f) => {
          const isLow = f.stock <= f.lowStockThreshold

          return (
            <TableRow key={f.barcode}>
              <TableCell>
                <span className="font-mono text-xs">{f.barcode}</span>
              </TableCell>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.brand}</TableCell>
              <TableCell>{f.color}</TableCell>
              <TableCell>
                <span className="tabular-nums">{formatPrice(f.price)}</span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    isLow
                      ? "text-destructive"
                      : "text-green-600 dark:text-green-400"
                  )}
                >
                  {f.stock}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={EyeIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Edit02Icon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Lịch sử xuất/nhập
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 2: Create the lens table component**

```tsx
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  EyeIcon,
  Edit02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { LensItem } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface LensTableProps {
  lenses: LensItem[]
}

export function LensTable({ lenses }: LensTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã tròng</TableHead>
          <TableHead>Tên tròng</TableHead>
          <TableHead>Thương hiệu</TableHead>
          <TableHead>Chiết suất</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {lenses.map((l) => {
          const isLow = l.stock <= l.lowStockThreshold

          return (
            <TableRow key={l.code}>
              <TableCell>
                <span className="font-mono text-xs">{l.code}</span>
              </TableCell>
              <TableCell>{l.name}</TableCell>
              <TableCell>{l.brand}</TableCell>
              <TableCell>{l.refractiveIndex}</TableCell>
              <TableCell>{l.type}</TableCell>
              <TableCell>
                <span className="tabular-nums">{formatPrice(l.price)}</span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    isLow
                      ? "text-destructive"
                      : "text-green-600 dark:text-green-400"
                  )}
                >
                  {l.stock}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={EyeIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Edit02Icon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Chỉnh sửa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Verify both compile**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/optical/frame-table.tsx src/components/optical/lens-table.tsx
git commit -m "feat: add optical frame and lens inventory tables"
```

---

### Task 9: Tab Inventory

**Files:**
- Create: `src/components/optical/tab-inventory.tsx`

- [ ] **Step 1: Create the inventory tab with sub-tab button group**

```tsx
import { useState } from "react"
import {
  Package01Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { FrameTable } from "@/components/optical/frame-table"
import { LensTable } from "@/components/optical/lens-table"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type {
  FrameItem,
  LensItem,
  InventoryMetrics,
} from "@/data/mock-optical"

type InventorySubTab = "frames" | "lenses"
type FrameFilter = "all" | "in_stock" | "low_stock" | "out_of_stock"
type LensFilter = "all" | "Essilor" | "Hoya" | "Việt Pháp"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "totalFrames",
    label: "Tổng gọng kính",
    icon: Package01Icon,
    colorClass: "",
    subtitle: "SKU",
  },
  {
    key: "totalLenses",
    label: "Tổng tròng kính",
    icon: Package01Icon,
    colorClass: "",
    subtitle: "SKU",
  },
  {
    key: "lowStockCount",
    label: "Sắp hết hàng",
    icon: Alert01Icon,
    colorClass: "text-amber-500",
    subtitle: "SKU cần bổ sung",
    highlightWhen: (v) => v > 0,
  },
]

const frameFilterOptions: { key: FrameFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "in_stock", label: "Còn hàng" },
  { key: "low_stock", label: "Sắp hết" },
  { key: "out_of_stock", label: "Hết hàng" },
]

const lensFilterOptions: { key: LensFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Essilor", label: "Essilor" },
  { key: "Hoya", label: "Hoya" },
  { key: "Việt Pháp", label: "Việt Pháp" },
]

interface TabInventoryProps {
  frames: FrameItem[]
  lenses: LensItem[]
  metrics: InventoryMetrics
}

export function TabInventory({
  frames,
  lenses,
  metrics,
}: TabInventoryProps) {
  const [subTab, setSubTab] = useState<InventorySubTab>("frames")
  const [frameFilter, setFrameFilter] = useState<FrameFilter>("all")
  const [lensFilter, setLensFilter] = useState<LensFilter>("all")
  const [frameSearch, setFrameSearch] = useState("")
  const [lensSearch, setLensSearch] = useState("")

  const filteredFrames = frames
    .filter((f) => {
      if (frameFilter === "all") return true
      if (frameFilter === "out_of_stock") return f.stock === 0
      if (frameFilter === "low_stock")
        return f.stock > 0 && f.stock <= f.lowStockThreshold
      return f.stock > f.lowStockThreshold
    })
    .filter((f) => {
      if (!frameSearch) return true
      const q = frameSearch.toLowerCase()
      return (
        f.barcode.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
      )
    })

  const filteredLenses = lenses
    .filter((l) => {
      if (lensFilter === "all") return true
      return l.brand === lensFilter
    })
    .filter((l) => {
      if (!lensSearch) return true
      const q = lensSearch.toLowerCase()
      return (
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.refractiveIndex.includes(q)
      )
    })

  return (
    <div className="space-y-4">
      <OpticalKpiCards config={kpiConfig} values={metrics as unknown as Record<string, number>} columns={3} />

      {/* Sub-tab button group */}
      <div className="flex">
        <button
          onClick={() => setSubTab("frames")}
          className={cn(
            "rounded-l-lg border px-5 py-1.5 text-sm font-medium transition-colors",
            subTab === "frames"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Gọng kính
        </button>
        <button
          onClick={() => setSubTab("lenses")}
          className={cn(
            "rounded-r-lg border border-l-0 px-5 py-1.5 text-sm font-medium transition-colors",
            subTab === "lenses"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Tròng kính
        </button>
      </div>

      {subTab === "frames" ? (
        <>
          <OpticalStatusFilters
            filters={frameFilterOptions}
            activeFilter={frameFilter}
            onFilterChange={setFrameFilter}
            searchPlaceholder="Tìm theo tên, mã barcode, thương hiệu..."
            search={frameSearch}
            onSearchChange={setFrameSearch}
          />
          <FrameTable frames={filteredFrames} />
        </>
      ) : (
        <>
          <OpticalStatusFilters
            filters={lensFilterOptions}
            activeFilter={lensFilter}
            onFilterChange={setLensFilter}
            searchPlaceholder="Tìm theo tên tròng, thương hiệu, chiết suất..."
            search={lensSearch}
            onSearchChange={setLensSearch}
          />
          <LensTable lenses={filteredLenses} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/tab-inventory.tsx
git commit -m "feat: add optical inventory tab with sub-tabs"
```

---

### Task 10: Page Shell and Route Integration

**Files:**
- Create: `src/pages/optical/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`

- [ ] **Step 1: Create the main optical dashboard page**

```tsx
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mockConsultations as initialConsultations,
  mockOrders as initialOrders,
  mockFrames,
  mockLenses,
  getConsultationMetrics,
  getOrderMetrics,
  getInventoryMetrics,
} from "@/data/mock-optical"
import { TabConsultation } from "@/components/optical/tab-consultation"
import { TabOrders } from "@/components/optical/tab-orders"
import { TabInventory } from "@/components/optical/tab-inventory"

export default function OpticalDashboard() {
  const [consultations, setConsultations] = useState(initialConsultations)
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState("consultation")

  const consultationMetrics = getConsultationMetrics(consultations, orders)
  const orderMetrics = getOrderMetrics(orders)
  const inventoryMetrics = getInventoryMetrics(mockFrames, mockLenses)

  const consultationBadge =
    consultationMetrics.waitingCount + consultationMetrics.consultingCount
  const orderBadge =
    orderMetrics.orderedCount +
    orderMetrics.fabricatingCount +
    orderMetrics.readyCount

  const now = new Date()
  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ]
  const dateStr = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Trung tâm kính</h1>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <div className="rounded-md bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          Nhân viên kính: Nguyễn Thị Mai
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="consultation">
            Tư vấn kính
            {consultationBadge > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {consultationBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders">
            Đơn hàng kính
            {orderBadge > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {orderBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory">Kho kính</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-4 pt-2">
          <TabConsultation
            consultations={consultations}
            metrics={consultationMetrics}
            onUpdateConsultations={setConsultations}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 pt-2">
          <TabOrders
            orders={orders}
            metrics={orderMetrics}
            onUpdateOrders={setOrders}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 pt-2">
          <TabInventory
            frames={mockFrames}
            lenses={mockLenses}
            metrics={inventoryMetrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Add route to App.tsx**

Add the import at the top of `src/App.tsx` after the PharmacyDashboard import:

```tsx
import OpticalDashboard from "@/pages/optical/index"
```

Add the route inside `<Routes>` after the pharmacy route:

```tsx
<Route path="/optical" element={<OpticalDashboard />} />
```

- [ ] **Step 3: Add sidebar nav item to app-sidebar.tsx**

Add `EyeIcon` to the imports:

```tsx
import {
  CommandIcon,
  UserAdd01Icon,
  Calendar01Icon,
  Search01Icon,
  Stethoscope02Icon,
  UserGroupIcon,
  MedicineBottle02Icon,
  EyeIcon,
} from "@hugeicons/core-free-icons"
```

Add the nav item after the Nhà thuốc entry in the `navItems` array:

```tsx
{ title: "Trung tâm kính", url: "/optical", icon: EyeIcon },
```

- [ ] **Step 4: Verify everything compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Start dev server and verify visually**

Run: `npm run dev`

Open `http://localhost:3000/optical` and verify:
1. Sidebar shows "Trung tâm kính" with eye icon after "Nhà thuốc"
2. Header shows "Trung tâm kính", date, and user badge
3. Tab 1 (Tư vấn kính): 4 KPI cards, filter buttons, queue table with 5 rows, dropdown menus work
4. Tab 2 (Đơn hàng kính): 4 KPI cards, 5 filter buttons, orders table with 12 rows, status transitions work
5. Tab 3 (Kho kính): 3 KPI cards, button group sub-tabs switch between frames/lenses, stock colors correct

- [ ] **Step 6: Commit**

```bash
git add src/pages/optical/index.tsx src/App.tsx src/components/app-sidebar.tsx
git commit -m "feat: add optical staff dashboard with routing and sidebar"
```
