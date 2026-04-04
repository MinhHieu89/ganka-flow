# Optical Staff Action Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 6 action screens (modals + drawer) for the optical staff dashboard, wiring them into the existing tab components.

**Architecture:** Each screen is a self-contained component in `src/components/optical/`. Mock data types are extended in `src/data/mock-optical.ts`. Table components get new callback props to open modals. Tab containers manage modal open/close state and pass handlers down.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Dialog, Sheet, Button, Input, Textarea, Select), Tailwind CSS v4, Hugeicons, Sonner toasts.

**Spec:** `docs/superpowers/specs/2026-04-04-optical-staff-actions-design.md`

---

## File Structure

```
Modify: src/data/mock-optical.ts                          — Add RxDetail, OrderDetailData, FrameDetail, LensDetail types + mock data
Create: src/components/optical/view-rx-modal.tsx           — Screen 1: View doctor Rx
Create: src/components/optical/create-order-modal.tsx      — Screen 2: Create optical order
Create: src/components/optical/order-detail-modal.tsx      — Screen 3: Order detail with timeline
Create: src/components/optical/delivery-confirm-modal.tsx  — Screen 4: Delivery confirmation
Create: src/components/optical/status-transition-modal.tsx — Screen 5: Status change confirmation
Create: src/components/optical/inventory-detail-drawer.tsx — Screen 6: Inventory detail drawer
Modify: src/components/optical/consultation-queue.tsx      — Add onViewRx callback, wire menu items
Modify: src/components/optical/order-table.tsx             — Add onViewDetail, onStartFabrication, onCompleteFabrication, onConfirmDelivery callbacks
Modify: src/components/optical/frame-table.tsx             — Add onViewDetail callback
Modify: src/components/optical/lens-table.tsx              — Add onViewDetail callback
Modify: src/components/optical/tab-consultation.tsx        — Manage ViewRx + CreateOrder modal state
Modify: src/components/optical/tab-orders.tsx              — Manage OrderDetail, StatusTransition, DeliveryConfirm modal state
Modify: src/components/optical/tab-inventory.tsx           — Manage InventoryDetail drawer state
Modify: src/pages/optical/index.tsx                        — Pass frames/lenses to TabConsultation, pass onUpdateOrders to TabOrders for order creation
```

---

### Task 1: Extend mock data types and add detail data

**Files:**
- Modify: `src/data/mock-optical.ts`

This task adds all the new types and mock data needed by the 6 action screens. It also fixes `formatPrice` to use Vietnamese dot separators.

- [ ] **Step 1: Add RxDetail and related types**

Add these types after the existing `LensItem` interface in `src/data/mock-optical.ts`:

```ts
export interface RxEye {
  sph: string
  cyl: string
  axis: number
  add?: string
}

export interface RxDetail {
  od: RxEye
  os: RxEye
  pd: number
  ucvaOd: string
  bcvaOd: string
  ucvaOs: string
  bcvaOs: string
  lensType: string
  purpose: string
  doctor: string
  prescribedAt: string
  notes?: string
}

export interface TimelineStep {
  status: string
  label: string
  completedAt?: string
  staffName?: string
}

export interface OrderDetailData extends OpticalOrder {
  rx: RxDetail
  frameBarcode: string
  lensType: string
  glassType: string
  framePrice: number
  lensPrice: number
  paymentStatus: "paid" | "pending"
  timeline: TimelineStep[]
  notes?: string
}

export interface StockHistoryEntry {
  date: string
  type: "in" | "out"
  quantity: number
  note: string
}

export interface FrameDetail extends FrameItem {
  material: string
  size: string
  gender: string
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
}

export interface LensDetail extends LensItem {
  coating: string
  design: string
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
}
```

- [ ] **Step 2: Add RxDetail to OpticalConsultation**

Update `OpticalConsultation` interface to include the Rx data:

```ts
export interface OpticalConsultation {
  id: string
  patientName: string
  patientId: string
  gender: string
  age: number
  doctor: string
  rxOd: string
  rxOs: string
  rx: RxDetail
  status: ConsultationStatus
  assignedStaff?: string
  queuedAt: string
}
```

Then update each item in `mockConsultations` to include `gender`, `age`, and `rx`. Example for oc-001:

```ts
{
  id: "oc-001",
  patientName: "Trần Văn Hùng",
  patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0012`,
  gender: "Nam",
  age: 42,
  doctor: "BS. Lê Minh Tuấn",
  rxOd: "-2.50 / -0.75 x 180",
  rxOs: "-3.00 / -1.00 x 175",
  rx: {
    od: { sph: "-2.50", cyl: "-0.75", axis: 180 },
    os: { sph: "-3.00", cyl: "-1.00", axis: 175 },
    pd: 63,
    ucvaOd: "20/100",
    bcvaOd: "20/20",
    ucvaOs: "20/200",
    bcvaOs: "20/25",
    lensType: "Kính cận",
    purpose: "Đeo thường xuyên",
    doctor: "BS. Lê Minh Tuấn",
    prescribedAt: todayTimestamp(60),
    notes: "BN cận nặng, cần tròng chiết suất cao. Tư vấn tròng AS.",
  },
  status: "in_consultation",
  assignedStaff: "Nguyễn Thị Mai",
  queuedAt: todayTimestamp(12),
},
```

Do the same for oc-002 through oc-005 with appropriate Rx values matching their existing `rxOd`/`rxOs` strings. Use `gender: "Nữ"` for patients Nguyễn Thị Lan and Phạm Minh Châu, `"Nam"` for the rest. Ages: 42, 58, 25, 31, 35.

- [ ] **Step 3: Add mock order detail data**

Add a function that generates `OrderDetailData` from an `OpticalOrder`. Place it after `mockLenses`:

```ts
export function getOrderDetail(order: OpticalOrder): OrderDetailData {
  const statusLabels: Record<OrderStatus, string> = {
    ordered: "Đã đặt",
    fabricating: "Đang gia công",
    ready_delivery: "Sẵn sàng giao",
    delivered: "Đã giao",
  }
  const statusOrder: OrderStatus[] = [
    "ordered",
    "fabricating",
    "ready_delivery",
    "delivered",
  ]
  const currentIdx = statusOrder.indexOf(order.status)

  const timeline: TimelineStep[] = statusOrder.map((s, i) => ({
    status: s,
    label: statusLabels[s],
    completedAt:
      i <= currentIdx
        ? new Date(
            new Date(order.orderDate).getTime() + i * 24 * 60 * 60 * 1000
          ).toISOString()
        : undefined,
    staffName: i <= currentIdx ? "Nguyễn Thị Mai" : undefined,
  }))

  return {
    ...order,
    rx: {
      od: { sph: "-2.50", cyl: "-0.75", axis: 180 },
      os: { sph: "-3.00", cyl: "-1.00", axis: 175 },
      pd: 63,
      ucvaOd: "20/100",
      bcvaOd: "20/20",
      ucvaOs: "20/200",
      bcvaOs: "20/25",
      lensType: order.lensType,
      purpose: "Đeo thường xuyên",
      doctor: "BS. Lê Minh Tuấn",
      prescribedAt: order.orderDate,
    },
    frameBarcode:
      mockFrames.find((f) => order.frameName.includes(f.name))?.barcode ??
      "GK-FR-00001",
    glassType: order.lensType,
    framePrice:
      mockFrames.find((f) => order.frameName.includes(f.name))?.price ??
      2800000,
    lensPrice:
      mockLenses.find((l) => order.lensName.includes(l.name))?.price ?? 1800000,
    paymentStatus: "paid",
    timeline,
    notes: undefined,
  }
}
```

- [ ] **Step 4: Add mock frame/lens detail data**

Add functions that generate detail data from existing items:

```ts
const frameMaterials = ["Nhựa Acetate", "Titanium", "TR-90", "Nhựa Ultem"]
const frameSizes = ["52-17-140", "53-18-145", "54-17-140", "51-16-135"]
const frameGenders = ["Unisex", "Nam", "Nữ"]
const frameOrigins = ["Italy", "Japan", "Việt Nam", "China"]

export function getFrameDetail(frame: FrameItem): FrameDetail {
  const idx = mockFrames.indexOf(frame)
  return {
    ...frame,
    material: frameMaterials[idx % frameMaterials.length],
    size: frameSizes[idx % frameSizes.length],
    gender: frameGenders[idx % frameGenders.length],
    origin: frameOrigins[idx % frameOrigins.length],
    costPrice: Math.round(frame.price * 0.6),
    stockHistory: [
      {
        date: offsetDate(0),
        type: "out",
        quantity: -1,
        note: `DK-${offsetDate(0).replace(/-/g, "")}-001`,
      },
      {
        date: offsetDate(-3),
        type: "in",
        quantity: 10,
        note: "Nhập lô T4/2026",
      },
      {
        date: offsetDate(-7),
        type: "out",
        quantity: -1,
        note: `DK-${offsetDate(-7).replace(/-/g, "")}-003`,
      },
    ],
  }
}

const lensCoatings = [
  "Chống xước, lọc UV",
  "Chống xước, chống phản quang, lọc UV",
  "Lọc ánh sáng xanh, chống xước",
  "Phân cực, lọc UV",
]
const lensDesigns = ["Spherical", "Aspherical (AS)", "Double Aspherical"]
const lensOrigins = ["France", "Japan", "Thailand", "Việt Nam"]

export function getLensDetail(lens: LensItem): LensDetail {
  const idx = mockLenses.indexOf(lens)
  return {
    ...lens,
    coating: lensCoatings[idx % lensCoatings.length],
    design: lensDesigns[idx % lensDesigns.length],
    origin: lensOrigins[idx % lensOrigins.length],
    costPrice: Math.round(lens.price * 0.55),
    stockHistory: [
      {
        date: offsetDate(-1),
        type: "out",
        quantity: -2,
        note: `DK-${offsetDate(-1).replace(/-/g, "")}-002`,
      },
      {
        date: offsetDate(-5),
        type: "in",
        quantity: 20,
        note: "Nhập lô T4/2026",
      },
    ],
  }
}
```

- [ ] **Step 5: Fix formatPrice to use Vietnamese dot separators**

Replace the existing `formatPrice` function:

```ts
/** Format price with Vietnamese dot separator: 2800000 → "2.800.000" */
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN")
}
```

- [ ] **Step 6: Verify the build compiles**

Run: `npm run typecheck`

Expected: No errors (new types are additive, `gender`/`age` additions to `OpticalConsultation` may cause errors in existing references — fix any by adding the new fields to all mock entries).

- [ ] **Step 7: Commit**

```bash
git add src/data/mock-optical.ts
git commit -m "feat(optical): extend mock data with Rx detail, order detail, and inventory detail types"
```

---

### Task 2: View Rx Modal (Screen 1)

**Files:**
- Create: `src/components/optical/view-rx-modal.tsx`

- [ ] **Step 1: Create the view-rx-modal component**

Create `src/components/optical/view-rx-modal.tsx`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OpticalConsultation } from "@/data/mock-optical"

interface ViewRxModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation | null
  onCreateOrder?: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function getInitials(name: string): string {
  const parts = name.split(" ")
  if (parts.length < 2) return name.slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ViewRxModal({
  open,
  onClose,
  consultation,
  onCreateOrder,
}: ViewRxModalProps) {
  if (!consultation) return null
  const { rx } = consultation

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Đơn kính bác sĩ
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Patient info */}
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-300">
              {getInitials(consultation.patientName)}
            </div>
            <div>
              <div className="text-sm font-medium">
                {consultation.patientName}
              </div>
              <div className="text-xs text-muted-foreground">
                {consultation.patientId} · {consultation.gender} ·{" "}
                {consultation.age} tuổi
              </div>
            </div>
          </div>

          {/* Rx table */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông số khúc xạ
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]" />
                  <TableHead className="text-center">SPH</TableHead>
                  <TableHead className="text-center">CYL</TableHead>
                  <TableHead className="text-center">AXIS</TableHead>
                  <TableHead className="text-center">ADD</TableHead>
                  <TableHead className="text-center">PD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD (mắt phải)</TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.sph}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.cyl}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.od.add ?? "—"}
                  </TableCell>
                  <TableCell
                    className="text-center font-mono font-medium"
                    rowSpan={2}
                  >
                    {rx.pd}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS (mắt trái)</TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.sph}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.cyl}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.os.add ?? "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Visual acuity */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thị lực
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]" />
                  <TableHead className="text-center">
                    Không kính (UCVA)
                  </TableHead>
                  <TableHead className="text-center">Có kính (BCVA)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD (mắt phải)</TableCell>
                  <TableCell className="text-center">{rx.ucvaOd}</TableCell>
                  <TableCell className="text-center">{rx.bcvaOd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS (mắt trái)</TableCell>
                  <TableCell className="text-center">{rx.ucvaOs}</TableCell>
                  <TableCell className="text-center">{rx.bcvaOs}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Prescription info */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông tin chỉ định
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <div className="text-[11px] text-muted-foreground/70">
                  Loại kính
                </div>
                <div className="text-sm">{rx.lensType}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground/70">
                  Mục đích sử dụng
                </div>
                <div className="text-sm">{rx.purpose}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground/70">
                  BS chỉ định
                </div>
                <div className="text-sm">{rx.doctor}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground/70">
                  Ngày kê
                </div>
                <div className="text-sm">{formatDateTime(rx.prescribedAt)}</div>
              </div>
            </div>
          </div>

          {/* Doctor notes */}
          {rx.notes && (
            <div className="rounded-lg bg-muted p-3 text-[13px] leading-relaxed text-muted-foreground">
              {rx.notes}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {onCreateOrder && <Button onClick={onCreateOrder}>Tạo đơn kính</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/view-rx-modal.tsx
git commit -m "feat(optical): add view Rx modal component"
```

---

### Task 3: Create Order Modal (Screen 2)

**Files:**
- Create: `src/components/optical/create-order-modal.tsx`

- [ ] **Step 1: Create the create-order-modal component**

Create `src/components/optical/create-order-modal.tsx`:

```tsx
import { useState, useMemo, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type {
  OpticalConsultation,
  FrameItem,
  LensItem,
} from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

export interface NewOpticalOrder {
  consultationId: string
  frameBarcode: string
  lensCode: string
  notes?: string
}

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation | null
  frames: FrameItem[]
  lenses: LensItem[]
  onSubmit: (order: NewOpticalOrder) => void
}

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function matchSearch(query: string, ...fields: string[]): boolean {
  const q = removeDiacritics(query.toLowerCase())
  return fields.some((f) => removeDiacritics(f.toLowerCase()).includes(q))
}

function ProductSearch<T extends FrameItem | LensItem>({
  label,
  placeholder,
  items,
  selected,
  onSelect,
  onClear,
  getSearchFields,
  renderItem,
  renderSelected,
}: {
  label: string
  placeholder: string
  items: T[]
  selected: T | null
  onSelect: (item: T) => void
  onClear: () => void
  getSearchFields: (item: T) => string[]
  renderItem: (item: T) => React.ReactNode
  renderSelected: (item: T) => React.ReactNode
}) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const filtered = useMemo(() => {
    if (!query.trim()) return []
    return items
      .filter((item) => {
        const stock = "stock" in item ? item.stock : 0
        if (stock === 0) return false
        return matchSearch(query, ...getSearchFields(item))
      })
      .slice(0, 8)
  }, [query, items, getSearchFields])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleBlur = () => {
    timeoutRef.current = setTimeout(() => setShowDropdown(false), 200)
  }

  if (selected) {
    return (
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {renderSelected(selected)}
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {showDropdown && filtered.length > 0 && (
        <div className="mt-1 max-h-[240px] overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {filtered.map((item) => (
            <button
              key={"barcode" in item ? item.barcode : item.code}
              type="button"
              className="w-full border-b border-border/50 px-3.5 py-2.5 text-left last:border-b-0 hover:bg-muted"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item)
                setQuery("")
                setShowDropdown(false)
              }}
            >
              {renderItem(item)}
            </button>
          ))}
        </div>
      )}
      {showDropdown && query.trim() && filtered.length === 0 && (
        <div className="mt-1 rounded-lg border bg-popover p-4 text-center text-sm text-muted-foreground shadow-lg">
          Không tìm thấy sản phẩm
        </div>
      )}
    </div>
  )
}

function SelectedCard({
  name,
  description,
  price,
  onClear,
}: {
  name: string
  description: string
  price: number
  onClear: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-teal-600 bg-teal-50 px-3.5 py-2.5 dark:border-teal-500 dark:bg-teal-950/30">
      <div>
        <div className="text-[13px] font-medium">{name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[13px] font-medium">{formatPrice(price)}</div>
        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs" onClick={onClear}>
          Đổi
        </Button>
      </div>
    </div>
  )
}

export function CreateOrderModal({
  open,
  onClose,
  consultation,
  frames,
  lenses,
  onSubmit,
}: CreateOrderModalProps) {
  const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(null)
  const [selectedLens, setSelectedLens] = useState<LensItem | null>(null)
  const [notes, setNotes] = useState("")
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  const hasChanges = selectedFrame !== null || selectedLens !== null

  const handleClose = () => {
    if (hasChanges) {
      setShowConfirmClose(true)
    } else {
      resetAndClose()
    }
  }

  const resetAndClose = () => {
    setSelectedFrame(null)
    setSelectedLens(null)
    setNotes("")
    setShowConfirmClose(false)
    onClose()
  }

  const handleSubmit = () => {
    if (!consultation || !selectedFrame || !selectedLens) return
    if (selectedFrame.stock <= 0 || selectedLens.stock <= 0) return
    onSubmit({
      consultationId: consultation.id,
      frameBarcode: selectedFrame.barcode,
      lensCode: selectedLens.code,
      notes: notes.trim() || undefined,
    })
    resetAndClose()
  }

  if (!consultation) return null
  const { rx } = consultation

  const total =
    selectedFrame && selectedLens ? selectedFrame.price + selectedLens.price : null

  return (
    <>
      <Dialog open={open && !showConfirmClose} onOpenChange={(v) => !v && handleClose()}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              Tạo đơn kính — {consultation.patientName}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Rx summary */}
            <div className="rounded-lg bg-muted px-3.5 py-2.5 font-mono text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/70">Rx:</span>{" "}
              OD {rx.od.sph} / {rx.od.cyl} x {rx.od.axis} | OS {rx.os.sph} /{" "}
              {rx.os.cyl} x {rx.os.axis} | PD {rx.pd}
            </div>

            {/* Frame search */}
            <ProductSearch<FrameItem>
              label="Gọng kính"
              placeholder="Tìm gọng theo tên, thương hiệu, barcode..."
              items={frames}
              selected={selectedFrame}
              onSelect={setSelectedFrame}
              onClear={() => setSelectedFrame(null)}
              getSearchFields={(f) => [f.name, f.brand, f.barcode, f.color]}
              renderItem={(f) => (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-medium">{f.brand} {f.name}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {f.color} ·{" "}
                      <span className="font-mono text-[11px]">{f.barcode}</span>{" "}
                      · Tồn:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          f.stock <= f.lowStockThreshold
                            ? "text-destructive"
                            : "text-green-600 dark:text-green-400"
                        )}
                      >
                        {f.stock}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-medium">
                    {formatPrice(f.price)}
                  </div>
                </div>
              )}
              renderSelected={(f) => (
                <SelectedCard
                  name={`${f.brand} ${f.name}`}
                  description={`${f.color} · ${f.barcode} · Tồn: ${f.stock}`}
                  price={f.price}
                  onClear={() => setSelectedFrame(null)}
                />
              )}
            />

            {/* Lens search */}
            <ProductSearch<LensItem>
              label="Tròng kính"
              placeholder="Tìm tròng theo tên, thương hiệu, chiết suất..."
              items={lenses}
              selected={selectedLens}
              onSelect={setSelectedLens}
              onClear={() => setSelectedLens(null)}
              getSearchFields={(l) => [l.name, l.brand, l.refractiveIndex, l.type]}
              renderItem={(l) => (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[13px] font-medium">
                      {l.brand} {l.name} — {l.refractiveIndex} {l.type === "Đa tròng" ? "" : ""}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {l.type} · {l.refractiveIndex}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs font-medium">
                    {formatPrice(l.price)}
                  </div>
                </div>
              )}
              renderSelected={(l) => (
                <SelectedCard
                  name={`${l.brand} ${l.name} — ${l.refractiveIndex}`}
                  description={`${l.type}`}
                  price={l.price}
                  onClear={() => setSelectedLens(null)}
                />
              )}
            />

            {/* Separator */}
            <div className="border-t" />

            {/* Order summary */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1 text-[13px]">
                <span className="text-muted-foreground">
                  Gọng:{" "}
                  {selectedFrame ? (
                    <span className="text-foreground">{selectedFrame.brand} {selectedFrame.name}</span>
                  ) : (
                    <span className="italic text-muted-foreground/70">chưa chọn</span>
                  )}
                </span>
                <span className={selectedFrame ? "text-foreground" : "text-muted-foreground/70"}>
                  {selectedFrame ? formatPrice(selectedFrame.price) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 text-[13px]">
                <span className="text-muted-foreground">
                  Tròng:{" "}
                  {selectedLens ? (
                    <span className="text-foreground">{selectedLens.brand} {selectedLens.name}</span>
                  ) : (
                    <span className="italic text-muted-foreground/70">chưa chọn</span>
                  )}
                </span>
                <span className={selectedLens ? "text-foreground" : "text-muted-foreground/70"}>
                  {selectedLens ? formatPrice(selectedLens.price) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t-2 border-foreground pt-2 text-[15px] font-medium">
                <span>Tổng cộng</span>
                <span className={total ? "" : "text-muted-foreground/70"}>
                  {total ? formatPrice(total) : "—"}
                </span>
              </div>
            </div>

            {/* Notes */}
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú thêm cho đơn kính (tùy chọn)..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFrame || !selectedLens}
            >
              Tạo đơn kính
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <Dialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              Xác nhận đóng
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Bạn có chắc muốn đóng? Dữ liệu chưa lưu sẽ bị mất.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmClose(false)}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button onClick={resetAndClose}>Đóng không lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/create-order-modal.tsx
git commit -m "feat(optical): add create order modal with product search"
```

---

### Task 4: Order Detail Modal (Screen 3)

**Files:**
- Create: `src/components/optical/order-detail-modal.tsx`

- [ ] **Step 1: Create the order-detail-modal component**

Create `src/components/optical/order-detail-modal.tsx`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { OrderDetailData, OrderStatus } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface OrderDetailModalProps {
  open: boolean
  onClose: () => void
  order: OrderDetailData | null
  onStartFabrication?: () => void
  onCompleteFabrication?: () => void
  onConfirmDelivery?: () => void
}

const statusBadgeConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; bgClass: string }
> = {
  ordered: {
    label: "Đã đặt",
    dotClass: "bg-green-500",
    bgClass:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  fabricating: {
    label: "Đang gia công",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ready_delivery: {
    label: "Sẵn sàng giao",
    dotClass: "bg-teal-500",
    bgClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  delivered: {
    label: "Đã giao",
    dotClass: "bg-secondary-foreground/40",
    bgClass: "bg-secondary text-secondary-foreground",
  },
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function OrderDetailModal({
  open,
  onClose,
  order,
  onStartFabrication,
  onCompleteFabrication,
  onConfirmDelivery,
}: OrderDetailModalProps) {
  if (!order) return null

  const badge = statusBadgeConfig[order.status]
  const { rx } = order
  const total = order.framePrice + order.lensPrice

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Chi tiết đơn kính — {order.id}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Patient + Status */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <div className="text-sm font-medium">{order.patientName}</div>
              <div className="text-xs text-muted-foreground">
                {order.patientId} · {order.phone}
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                badge.bgClass
              )}
            >
              <span className={cn("size-1.5 rounded-full", badge.dotClass)} />
              {badge.label}
            </span>
          </div>

          {/* Rx table */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông số khúc xạ (Rx bác sĩ)
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]" />
                  <TableHead className="text-center">SPH</TableHead>
                  <TableHead className="text-center">CYL</TableHead>
                  <TableHead className="text-center">AXIS</TableHead>
                  <TableHead className="text-center">ADD</TableHead>
                  <TableHead className="text-center">PD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD (mắt phải)</TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.sph}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.cyl}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.od.add ?? "—"}
                  </TableCell>
                  <TableCell
                    className="text-center font-mono font-medium"
                    rowSpan={2}
                  >
                    {rx.pd}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS (mắt trái)</TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.sph}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.cyl}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.os.add ?? "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Products */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sản phẩm
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
              <span className="text-muted-foreground">Gọng</span>
              <span>
                {order.frameName} — {order.frameColor}
              </span>
              <span className="text-muted-foreground">Barcode gọng</span>
              <span className="font-mono text-xs text-muted-foreground">
                {order.frameBarcode}
              </span>
              <span className="text-muted-foreground">Tròng</span>
              <span>
                {order.lensName} — {order.lensSpec}
              </span>
              <span className="text-muted-foreground">Loại kính</span>
              <span>{order.glassType}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thanh toán
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Gọng</span>
                <span>{formatPrice(order.framePrice)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Tròng</span>
                <span>{formatPrice(order.lensPrice)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-foreground pt-2 text-[15px] font-medium">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      order.paymentStatus === "paid"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    )}
                  />
                  {order.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lịch sử trạng thái
            </div>
            <div className="relative pl-6">
              {order.timeline.map((step, i) => {
                const isLast = i === order.timeline.length - 1
                const isCompleted = !!step.completedAt
                const isCurrent =
                  isCompleted &&
                  (isLast || !order.timeline[i + 1]?.completedAt)

                let dotClass = "border-border bg-background"
                if (isCurrent)
                  dotClass = "border-blue-500 bg-blue-100 dark:bg-blue-950"
                else if (isCompleted)
                  dotClass = "border-green-500 bg-green-100 dark:bg-green-950"

                return (
                  <div key={step.status} className="relative pb-5 last:pb-0">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 size-3 rounded-full border-2",
                        dotClass
                      )}
                    />
                    {/* Line */}
                    {!isLast && (
                      <div className="absolute -left-[18px] top-4 h-[calc(100%-8px)] w-0.5 bg-border" />
                    )}
                    {/* Content */}
                    <div>
                      <div
                        className={cn(
                          "text-[13px] font-medium",
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                              ? ""
                              : "text-muted-foreground/60"
                        )}
                      >
                        {step.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.completedAt
                          ? `${formatDateTime(step.completedAt)} · ${step.staffName}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-lg bg-muted p-3 text-[13px] leading-relaxed text-muted-foreground">
              {order.notes}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline">In đơn kính</Button>
          {order.status === "ordered" && onStartFabrication && (
            <Button onClick={onStartFabrication}>Bắt đầu gia công</Button>
          )}
          {order.status === "fabricating" && onCompleteFabrication && (
            <Button onClick={onCompleteFabrication}>Hoàn thành gia công</Button>
          )}
          {order.status === "ready_delivery" && onConfirmDelivery && (
            <Button onClick={onConfirmDelivery}>Xác nhận giao kính</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/order-detail-modal.tsx
git commit -m "feat(optical): add order detail modal with timeline"
```

---

### Task 5: Status Transition Modal (Screen 5)

**Files:**
- Create: `src/components/optical/status-transition-modal.tsx`

- [ ] **Step 1: Create the status-transition-modal component**

Create `src/components/optical/status-transition-modal.tsx`:

```tsx
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
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { OpticalOrder, OrderStatus } from "@/data/mock-optical"

interface StatusTransitionModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder | null
  targetStatus: "fabricating" | "ready_delivery"
  onConfirm: (notes?: string) => void
}

const statusBadgeConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; bgClass: string }
> = {
  ordered: {
    label: "Đã đặt",
    dotClass: "bg-green-500",
    bgClass:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  fabricating: {
    label: "Đang gia công",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ready_delivery: {
    label: "Sẵn sàng giao",
    dotClass: "bg-teal-500",
    bgClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  delivered: {
    label: "Đã giao",
    dotClass: "bg-secondary-foreground/40",
    bgClass: "bg-secondary text-secondary-foreground",
  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusBadgeConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        config.bgClass
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  )
}

export function StatusTransitionModal({
  open,
  onClose,
  order,
  targetStatus,
  onConfirm,
}: StatusTransitionModalProps) {
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined)
    setNotes("")
    onClose()
  }

  const handleClose = () => {
    setNotes("")
    onClose()
  }

  if (!order) return null

  const fromBadge = statusBadgeConfig[order.status]
  const toBadge = statusBadgeConfig[targetStatus]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="sr-only">Chuyển trạng thái</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
              <svg
                className="size-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>

          {/* Order info */}
          <div>
            <div className="text-sm">
              Đơn kính <span className="font-medium">{order.id}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {order.patientName} · {order.frameName} · {order.lensName}
            </div>
          </div>

          {/* Transition block */}
          <div className="rounded-lg bg-muted p-3">
            <div className="flex items-center justify-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-muted-foreground">→</span>
              <StatusBadge status={targetStatus} />
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Trạng thái sẽ chuyển từ &lsquo;{fromBadge.label}&rsquo; sang
              &lsquo;{toBadge.label}&rsquo;
            </div>
          </div>

          {/* Notes */}
          <div className="text-left">
            <Label className="mb-1.5 text-xs">Ghi chú (tùy chọn)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú khi chuyển trạng thái..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/status-transition-modal.tsx
git commit -m "feat(optical): add status transition confirmation modal"
```

---

### Task 6: Delivery Confirmation Modal (Screen 4)

**Files:**
- Create: `src/components/optical/delivery-confirm-modal.tsx`

- [ ] **Step 1: Create the delivery-confirm-modal component**

Create `src/components/optical/delivery-confirm-modal.tsx`:

```tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
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
import { cn } from "@/lib/utils"
import type { OpticalOrder } from "@/data/mock-optical"

export interface DeliveryData {
  method: "pickup" | "shipping"
  receiver: string
  address?: string
  carrier?: string
  notes?: string
}

interface DeliveryConfirmModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder | null
  onConfirm: (data: DeliveryData) => void
}

const carriers = [
  { value: "grab", label: "Grab" },
  { value: "ghtk", label: "GHTK" },
  { value: "ghn", label: "GHN" },
  { value: "bee", label: "Bee / Xanh SM" },
  { value: "self", label: "Tự giao" },
]

function RadioCard({
  selected,
  onClick,
  label,
}: {
  selected: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-[13px] transition-colors",
        selected
          ? "border-teal-600 bg-teal-50 font-medium dark:border-teal-500 dark:bg-teal-950/30"
          : "border-border hover:bg-muted"
      )}
    >
      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-teal-600 dark:border-teal-500" : "border-border"
        )}
      >
        {selected && (
          <div className="size-2 rounded-full bg-teal-600 dark:bg-teal-500" />
        )}
      </div>
      <span className={cn(!selected && "text-muted-foreground")}>{label}</span>
    </button>
  )
}

export function DeliveryConfirmModal({
  open,
  onClose,
  order,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup")
  const [receiver, setReceiver] = useState("")
  const [address, setAddress] = useState("")
  const [carrier, setCarrier] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill receiver when order changes
  const handleOpen = (v: boolean) => {
    if (v && order) {
      setReceiver(order.patientName)
      setMethod("pickup")
      setAddress("")
      setCarrier("")
      setNotes("")
      setErrors({})
    }
    if (!v) onClose()
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!receiver.trim()) newErrors.receiver = "Vui lòng nhập tên người nhận"
    if (method === "shipping") {
      if (!address.trim())
        newErrors.address = "Vui lòng nhập địa chỉ giao hàng"
      if (!carrier) newErrors.carrier = "Vui lòng chọn đơn vị vận chuyển"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleConfirm = () => {
    if (!validate()) return
    onConfirm({
      method,
      receiver: receiver.trim(),
      address: method === "shipping" ? address.trim() : undefined,
      carrier: method === "shipping" ? carrier : undefined,
      notes: notes.trim() || undefined,
    })
    onClose()
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Xác nhận giao kính
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Order info */}
          <div className="border-b pb-4">
            <div className="text-sm font-medium">{order.patientName}</div>
            <div className="text-xs text-muted-foreground">
              {order.id} · {order.frameName} · {order.lensName}
            </div>
          </div>

          {/* Delivery method */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hình thức giao
            </div>
            <div className="space-y-2">
              <RadioCard
                selected={method === "pickup"}
                onClick={() => setMethod("pickup")}
                label="Nhận tại phòng khám"
              />
              <RadioCard
                selected={method === "shipping"}
                onClick={() => setMethod("shipping")}
                label="Giao hàng (ship)"
              />
            </div>
          </div>

          {/* Shipping fields */}
          {method === "shipping" && (
            <div className="space-y-3">
              <div>
                <Label className="mb-1.5 text-xs">
                  Địa chỉ giao hàng <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    setErrors((prev) => ({ ...prev, address: "" }))
                  }}
                  placeholder="Nhập địa chỉ giao hàng..."
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.address}
                  </p>
                )}
              </div>
              <div>
                <Label className="mb-1.5 text-xs">
                  Đơn vị vận chuyển{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={carrier}
                  onValueChange={(v) => {
                    setCarrier(v)
                    setErrors((prev) => ({ ...prev, carrier: "" }))
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.carrier && (
                  <p className="mt-1 text-xs text-destructive">
                    {errors.carrier}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Common fields */}
          <div className="space-y-3">
            <div>
              <Label className="mb-1.5 text-xs">
                Người nhận <span className="text-destructive">*</span>
              </Label>
              <Input
                value={receiver}
                onChange={(e) => {
                  setReceiver(e.target.value)
                  setErrors((prev) => ({ ...prev, receiver: "" }))
                }}
                placeholder="Nhập tên người nhận..."
              />
              {errors.receiver && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.receiver}
                </p>
              )}
            </div>
            <div>
              <Label className="mb-1.5 text-xs">Ghi chú giao hàng</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm (tùy chọn)..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận giao kính</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/delivery-confirm-modal.tsx
git commit -m "feat(optical): add delivery confirmation modal with radio cards"
```

---

### Task 7: Inventory Detail Drawer (Screen 6)

**Files:**
- Create: `src/components/optical/inventory-detail-drawer.tsx`

- [ ] **Step 1: Create the inventory-detail-drawer component**

Create `src/components/optical/inventory-detail-drawer.tsx`:

```tsx
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FrameDetail, LensDetail } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface InventoryDetailDrawerProps {
  open: boolean
  onClose: () => void
  item: FrameDetail | LensDetail | null
  type: "frame" | "lens"
  onSave: (updates: Record<string, unknown>) => void
}

function isFrame(
  item: FrameDetail | LensDetail,
  type: "frame" | "lens"
): item is FrameDetail {
  return type === "frame"
}

function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground/70">{label}</div>
      <div className="mt-0.5 text-[13px] font-medium">{value}</div>
    </div>
  )
}

export function InventoryDetailDrawer({
  open,
  onClose,
  item,
  type,
  onSave,
}: InventoryDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editPrice, setEditPrice] = useState("")
  const [editField1, setEditField1] = useState("")
  const [editField2, setEditField2] = useState("")
  const [editOrigin, setEditOrigin] = useState("")
  const [editThreshold, setEditThreshold] = useState("")

  useEffect(() => {
    if (item && open) {
      setIsEditing(false)
      if (isFrame(item, type)) {
        setEditPrice(String(item.price))
        setEditField1(item.color)
        setEditField2(item.material)
        setEditOrigin(item.origin)
        setEditThreshold(String(item.lowStockThreshold))
      } else {
        setEditPrice(String(item.price))
        setEditField1((item as LensDetail).coating)
        setEditField2((item as LensDetail).design)
        setEditOrigin((item as LensDetail).origin)
        setEditThreshold(String(item.lowStockThreshold))
      }
    }
  }, [item, open, type])

  const handleSave = () => {
    const price = parseInt(editPrice)
    const threshold = parseInt(editThreshold)
    if (isNaN(price) || price <= 0) return
    if (isNaN(threshold) || threshold < 0) return

    onSave({
      sellingPrice: price,
      ...(type === "frame"
        ? { color: editField1, material: editField2 }
        : { coating: editField1, design: editField2 }),
      origin: editOrigin,
      lowStockThreshold: threshold,
    })
    setIsEditing(false)
  }

  if (!item) return null

  const isFrameItem = isFrame(item, type)
  const costPrice = item.costPrice
  const margin = item.price - costPrice
  const marginPct = Math.round((margin / item.price) * 100)
  const isLowStock = item.stock <= item.lowStockThreshold

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-[480px]"
      >
        <SheetHeader>
          <SheetTitle>
            {isFrameItem ? "Chi tiết gọng kính" : "Chi tiết tròng kính"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Image placeholder */}
          <div className="flex h-[140px] items-center justify-center rounded-lg border border-dashed bg-muted text-[13px] text-muted-foreground">
            {isFrameItem ? "Hình ảnh gọng kính" : "Hình ảnh tròng kính"}
          </div>

          {isEditing ? (
            /* ── Edit Mode ── */
            <>
              <div>
                <div className="text-base font-medium">{item.name}</div>
                <div className="mt-0.5 text-[13px] text-muted-foreground">
                  Thương hiệu và tên không thể chỉnh sửa
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground/70">
                  {isFrameItem ? item.barcode : (item as LensDetail).code}
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Chỉnh sửa
                </div>
                <div className="space-y-3">
                  <div>
                    <Label className="mb-1.5 text-xs">
                      Giá bán <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">
                      {isFrameItem ? "Màu sắc" : "Lớp phủ"}
                    </Label>
                    <Input
                      value={editField1}
                      onChange={(e) => setEditField1(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">
                      {isFrameItem ? "Chất liệu" : "Thiết kế"}
                    </Label>
                    <Input
                      value={editField2}
                      onChange={(e) => setEditField2(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">Xuất xứ</Label>
                    <Input
                      value={editOrigin}
                      onChange={(e) => setEditOrigin(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="mb-1.5 text-xs">
                      Ngưỡng cảnh báo{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={editThreshold}
                      onChange={(e) => setEditThreshold(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ── View Mode ── */
            <>
              {/* Main info */}
              <div>
                <div className="text-base font-medium">{item.name}</div>
                <div className="mt-0.5 text-[13px] text-muted-foreground">
                  {isFrameItem
                    ? `${item.color} · ${(item as FrameDetail).material}`
                    : `${(item as LensDetail).type} · ${item.refractiveIndex}`}
                </div>
                <div className="mt-1 font-mono text-xs text-muted-foreground/70">
                  {isFrameItem ? item.barcode : (item as LensDetail).code}
                </div>
              </div>

              {/* Specs grid */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Thông số
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SpecCard label="Thương hiệu" value={item.brand} />
                  {isFrameItem ? (
                    <>
                      <SpecCard label="Màu sắc" value={item.color} />
                      <SpecCard
                        label="Chất liệu"
                        value={(item as FrameDetail).material}
                      />
                      <SpecCard
                        label="Kích thước"
                        value={(item as FrameDetail).size}
                      />
                      <SpecCard
                        label="Giới tính"
                        value={(item as FrameDetail).gender}
                      />
                      <SpecCard
                        label="Xuất xứ"
                        value={(item as FrameDetail).origin}
                      />
                    </>
                  ) : (
                    <>
                      <SpecCard
                        label="Chiết suất"
                        value={(item as LensDetail).refractiveIndex}
                      />
                      <SpecCard
                        label="Loại"
                        value={(item as LensDetail).type}
                      />
                      <SpecCard
                        label="Lớp phủ"
                        value={(item as LensDetail).coating}
                      />
                      <SpecCard
                        label="Thiết kế"
                        value={(item as LensDetail).design}
                      />
                      <SpecCard
                        label="Xuất xứ"
                        value={(item as LensDetail).origin}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Price & Stock */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Giá & tồn kho
                </div>
                <div className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
                  <span className="text-muted-foreground">Giá nhập</span>
                  <span>{formatPrice(costPrice)}</span>
                  <span className="text-muted-foreground">Giá bán</span>
                  <span className="font-medium">{formatPrice(item.price)}</span>
                  <span className="text-muted-foreground">Lãi gộp</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatPrice(margin)} ({marginPct}%)
                  </span>
                  <span className="text-muted-foreground">Tồn kho</span>
                  <span
                    className={cn(
                      "font-medium",
                      isLowStock
                        ? "text-destructive"
                        : "text-green-600 dark:text-green-400"
                    )}
                  >
                    {item.stock}
                  </span>
                  <span className="text-muted-foreground">Ngưỡng cảnh báo</span>
                  <span>{item.lowStockThreshold}</span>
                </div>
              </div>

              {/* Stock History */}
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Lịch sử xuất/nhập gần đây
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead className="text-center">SL</TableHead>
                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {item.stockHistory.slice(0, 5).map((entry, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatShortDate(entry.date)}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-medium",
                              entry.type === "in"
                                ? "text-green-600 dark:text-green-400"
                                : "text-destructive"
                            )}
                          >
                            {entry.type === "in" ? "Nhập" : "Xuất"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {entry.type === "in" ? "+" : ""}
                          {entry.quantity}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {entry.note.startsWith("DK-") ? (
                            <span className="font-mono text-[11px]">
                              {entry.note}
                            </span>
                          ) : (
                            entry.note
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>Lưu thay đổi</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/inventory-detail-drawer.tsx
git commit -m "feat(optical): add inventory detail drawer with view/edit modes"
```

---

### Task 8: Wire modals into Consultation tab

**Files:**
- Modify: `src/components/optical/consultation-queue.tsx`
- Modify: `src/components/optical/tab-consultation.tsx`

- [ ] **Step 1: Add onViewRx callback to ConsultationQueue**

In `src/components/optical/consultation-queue.tsx`, add `onViewRx` to the props interface:

```ts
interface ConsultationQueueProps {
  consultations: OpticalConsultation[]
  onAcceptPatient: (id: string) => void
  onCreateOrder: (id: string) => void
  onReturnToQueue: (id: string) => void
  onViewRx: (id: string) => void
}
```

Update the function signature to destructure `onViewRx`. Then wire the "Xem đơn kính BS" menu items (both in `isConsulting` and non-consulting branches) to call `onViewRx(c.id)`:

For the `isConsulting` branch, change:
```tsx
<DropdownMenuItem>
  <HugeiconsIcon icon={EyeIcon} className="size-4" strokeWidth={1.5} />
  Xem đơn kính BS
</DropdownMenuItem>
```
to:
```tsx
<DropdownMenuItem onClick={() => onViewRx(c.id)}>
  <HugeiconsIcon icon={EyeIcon} className="size-4" strokeWidth={1.5} />
  Xem đơn kính BS
</DropdownMenuItem>
```

Do the same for the non-consulting branch.

- [ ] **Step 2: Wire modals in TabConsultation**

In `src/components/optical/tab-consultation.tsx`, add imports and modal state:

Add these imports at the top:
```ts
import { ViewRxModal } from "@/components/optical/view-rx-modal"
import { CreateOrderModal } from "@/components/optical/create-order-modal"
import type { FrameItem, LensItem } from "@/data/mock-optical"
```

Add props for frames, lenses, and orders callback:
```ts
interface TabConsultationProps {
  consultations: OpticalConsultation[]
  metrics: ConsultationMetrics
  onUpdateConsultations: (
    updater: (prev: OpticalConsultation[]) => OpticalConsultation[]
  ) => void
  frames: FrameItem[]
  lenses: LensItem[]
  onCreateOrder: (order: { consultationId: string; frameBarcode: string; lensCode: string; notes?: string }) => void
}
```

Add state inside the component:
```ts
const [rxModalConsultation, setRxModalConsultation] =
  useState<OpticalConsultation | null>(null)
const [createOrderConsultation, setCreateOrderConsultation] =
  useState<OpticalConsultation | null>(null)
```

Update `handleCreateOrder` to open the create order modal:
```ts
const handleCreateOrder = (id: string) => {
  const c = consultations.find((c) => c.id === id)
  if (c) setCreateOrderConsultation(c)
}
```

Add `handleViewRx`:
```ts
const handleViewRx = (id: string) => {
  const c = consultations.find((c) => c.id === id)
  if (c) setRxModalConsultation(c)
}
```

Pass `onViewRx={handleViewRx}` to `<ConsultationQueue>`.

After the `<ConsultationQueue>` JSX, add the modals:
```tsx
<ViewRxModal
  open={!!rxModalConsultation}
  onClose={() => setRxModalConsultation(null)}
  consultation={rxModalConsultation}
  onCreateOrder={
    rxModalConsultation?.status === "in_consultation"
      ? () => {
          setRxModalConsultation(null)
          if (rxModalConsultation)
            setCreateOrderConsultation(rxModalConsultation)
        }
      : undefined
  }
/>

<CreateOrderModal
  open={!!createOrderConsultation}
  onClose={() => setCreateOrderConsultation(null)}
  consultation={createOrderConsultation}
  frames={frames}
  lenses={lenses}
  onSubmit={(order) => {
    onCreateOrder(order)
    setCreateOrderConsultation(null)
  }}
/>
```

- [ ] **Step 3: Pass frames/lenses from page to TabConsultation**

In `src/pages/optical/index.tsx`, update the `<TabConsultation>` usage to pass `frames`, `lenses`, and `onCreateOrder`:

```tsx
<TabConsultation
  consultations={consultations}
  metrics={consultationMetrics}
  onUpdateConsultations={setConsultations}
  frames={mockFrames}
  lenses={mockLenses}
  onCreateOrder={(order) => {
    // Remove consultation from list, add to orders (mock behavior)
    setConsultations((prev) =>
      prev.filter((c) => c.id !== order.consultationId)
    )
  }}
/>
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/optical/consultation-queue.tsx src/components/optical/tab-consultation.tsx src/pages/optical/index.tsx
git commit -m "feat(optical): wire view Rx and create order modals into consultation tab"
```

---

### Task 9: Wire modals into Orders tab

**Files:**
- Modify: `src/components/optical/order-table.tsx`
- Modify: `src/components/optical/tab-orders.tsx`

- [ ] **Step 1: Update OrderTable callbacks**

In `src/components/optical/order-table.tsx`, change the props interface:

```ts
interface OrderTableProps {
  orders: OpticalOrder[]
  onViewDetail: (order: OpticalOrder) => void
  onStartFabrication: (order: OpticalOrder) => void
  onCompleteFabrication: (order: OpticalOrder) => void
  onConfirmDelivery: (order: OpticalOrder) => void
}
```

Replace the existing `onUpdateStatus` prop usage. Update the dropdown menu items to use the new callbacks:

- "Xem chi tiết" → `onClick={() => onViewDetail(o)}`
- "Bắt đầu gia công" → `onClick={() => onStartFabrication(o)}`
- "Hoàn thành gia công" → `onClick={() => onCompleteFabrication(o)}`
- "Xác nhận giao kính" → `onClick={() => onConfirmDelivery(o)}`

- [ ] **Step 2: Add modal state management to TabOrders**

In `src/components/optical/tab-orders.tsx`, add imports:

```ts
import { OrderDetailModal } from "@/components/optical/order-detail-modal"
import { StatusTransitionModal } from "@/components/optical/status-transition-modal"
import { DeliveryConfirmModal } from "@/components/optical/delivery-confirm-modal"
import { toast } from "sonner"
import { getOrderDetail } from "@/data/mock-optical"
import type { OrderDetailData } from "@/data/mock-optical"
```

Add state:
```ts
const [detailOrder, setDetailOrder] = useState<OrderDetailData | null>(null)
const [transitionOrder, setTransitionOrder] = useState<OpticalOrder | null>(null)
const [transitionTarget, setTransitionTarget] = useState<"fabricating" | "ready_delivery">("fabricating")
const [deliveryOrder, setDeliveryOrder] = useState<OpticalOrder | null>(null)
```

Replace `<OrderTable>` usage:
```tsx
<OrderTable
  orders={filtered}
  onViewDetail={(o) => setDetailOrder(getOrderDetail(o))}
  onStartFabrication={(o) => {
    setTransitionOrder(o)
    setTransitionTarget("fabricating")
  }}
  onCompleteFabrication={(o) => {
    setTransitionOrder(o)
    setTransitionTarget("ready_delivery")
  }}
  onConfirmDelivery={(o) => setDeliveryOrder(o)}
/>
```

Add the modals after the `<OrderTable>`:
```tsx
<OrderDetailModal
  open={!!detailOrder}
  onClose={() => setDetailOrder(null)}
  order={detailOrder}
  onStartFabrication={() => {
    if (detailOrder) {
      setDetailOrder(null)
      setTransitionOrder(detailOrder)
      setTransitionTarget("fabricating")
    }
  }}
  onCompleteFabrication={() => {
    if (detailOrder) {
      setDetailOrder(null)
      setTransitionOrder(detailOrder)
      setTransitionTarget("ready_delivery")
    }
  }}
  onConfirmDelivery={() => {
    if (detailOrder) {
      setDetailOrder(null)
      setDeliveryOrder(detailOrder)
    }
  }}
/>

<StatusTransitionModal
  open={!!transitionOrder}
  onClose={() => setTransitionOrder(null)}
  order={transitionOrder}
  targetStatus={transitionTarget}
  onConfirm={() => {
    if (transitionOrder) {
      handleUpdateStatus(transitionOrder.id, transitionTarget)
      toast.success(
        transitionTarget === "fabricating"
          ? "Đã chuyển trạng thái sang Đang gia công"
          : "Đã chuyển trạng thái sang Sẵn sàng giao"
      )
    }
  }}
/>

<DeliveryConfirmModal
  open={!!deliveryOrder}
  onClose={() => setDeliveryOrder(null)}
  order={deliveryOrder}
  onConfirm={() => {
    if (deliveryOrder) {
      handleUpdateStatus(deliveryOrder.id, "delivered" as OrderStatus)
      toast.success("Đã xác nhận giao kính thành công")
    }
  }}
/>
```

- [ ] **Step 3: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/optical/order-table.tsx src/components/optical/tab-orders.tsx
git commit -m "feat(optical): wire order detail, status transition, and delivery modals into orders tab"
```

---

### Task 10: Wire drawer into Inventory tab

**Files:**
- Modify: `src/components/optical/frame-table.tsx`
- Modify: `src/components/optical/lens-table.tsx`
- Modify: `src/components/optical/tab-inventory.tsx`

- [ ] **Step 1: Add onViewDetail to FrameTable**

In `src/components/optical/frame-table.tsx`, add callback prop:

```ts
interface FrameTableProps {
  frames: FrameItem[]
  onViewDetail: (frame: FrameItem) => void
}
```

Wire the "Xem chi tiết" menu item:
```tsx
<DropdownMenuItem onClick={() => onViewDetail(f)}>
```

Wire the "Chỉnh sửa" menu item to also open the detail drawer (it opens in edit mode from the drawer):
```tsx
<DropdownMenuItem onClick={() => onViewDetail(f)}>
```

Remove the "Lịch sử xuất/nhập" menu item (the drawer now shows this).

- [ ] **Step 2: Add onViewDetail to LensTable**

Same pattern as FrameTable. In `src/components/optical/lens-table.tsx`:

```ts
interface LensTableProps {
  lenses: LensItem[]
  onViewDetail: (lens: LensItem) => void
}
```

Wire "Xem chi tiết" and "Chỉnh sửa" to `onClick={() => onViewDetail(l)}`.

- [ ] **Step 3: Add drawer state to TabInventory**

In `src/components/optical/tab-inventory.tsx`, add imports:

```ts
import { InventoryDetailDrawer } from "@/components/optical/inventory-detail-drawer"
import { toast } from "sonner"
import {
  getFrameDetail,
  getLensDetail,
} from "@/data/mock-optical"
import type { FrameDetail, LensDetail } from "@/data/mock-optical"
```

Add state:
```ts
const [drawerItem, setDrawerItem] = useState<FrameDetail | LensDetail | null>(null)
const [drawerType, setDrawerType] = useState<"frame" | "lens">("frame")
```

Pass `onViewDetail` to both tables:
```tsx
<FrameTable
  frames={filteredFrames}
  onViewDetail={(f) => {
    setDrawerItem(getFrameDetail(f))
    setDrawerType("frame")
  }}
/>
```
```tsx
<LensTable
  lenses={filteredLenses}
  onViewDetail={(l) => {
    setDrawerItem(getLensDetail(l))
    setDrawerType("lens")
  }}
/>
```

Add the drawer after the tables (inside the main `<div>`):
```tsx
<InventoryDetailDrawer
  open={!!drawerItem}
  onClose={() => setDrawerItem(null)}
  item={drawerItem}
  type={drawerType}
  onSave={() => {
    toast.success("Đã lưu thay đổi")
    setDrawerItem(null)
  }}
/>
```

- [ ] **Step 4: Verify the build compiles**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/optical/frame-table.tsx src/components/optical/lens-table.tsx src/components/optical/tab-inventory.tsx
git commit -m "feat(optical): wire inventory detail drawer into inventory tab"
```

---

### Task 11: Final integration test

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Run the dev server and manually verify**

Run: `npm run dev`

Open http://localhost:3000 in the browser, navigate to the Optical page.

Verify:
1. **Consultation tab:** Click three-dot menu → "Xem đơn kính BS" opens the Rx modal with patient info, tables, notes. For `in_consultation` patients, the "Tạo đơn kính" button appears in both the menu and the Rx modal footer.
2. **Consultation tab:** Click "Tạo đơn kính" → opens create order modal. Search for frames/lenses, select products, see price summary update. Submit creates the order.
3. **Orders tab:** Click "Xem chi tiết" → opens order detail with Rx table, products, payment, timeline. Footer buttons match the order status.
4. **Orders tab:** Click "Bắt đầu gia công" → opens status transition modal. Confirm changes the status.
5. **Orders tab:** For `ready_delivery` orders, click "Xác nhận giao kính" → opens delivery form. Toggle radio between pickup/shipping, see conditional fields.
6. **Inventory tab:** Click "Xem chi tiết" on a frame → drawer slides in from right with specs, pricing, history. Click "Chỉnh sửa" → edit mode. Same for lenses.

- [ ] **Step 3: Commit any fixes**

If any issues found during manual testing, fix and commit:

```bash
git add -u
git commit -m "fix(optical): address integration issues in action screen modals"
```
