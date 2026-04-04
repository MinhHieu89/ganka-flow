# Pharmacist Dashboard Modals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 new modals (view prescription, dispense detail, print labels) and fix 2 existing components (dispense modal, substitute dialog) to fully match the pharmacist dashboard functional spec.

**Architecture:** One component per modal in `src/components/pharmacy/`. Queue table manages modal state via a discriminated union. Sub-modals (labels from dispense/detail) use separate Dialog instances layered on top.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Dialog, Table, Button, Textarea), Tailwind CSS v4, Hugeicons

---

### Task 1: Extend mock data types and add dispensed order data

**Files:**
- Modify: `src/data/mock-pharmacy.ts`

- [ ] **Step 1: Add DispensedItem type and extend PrescriptionOrder**

Add the new type and optional fields after the existing `PrescriptionOrder` interface:

```typescript
export interface DispensedItem {
  originalMedication: string
  dispensedMedication: string
  isSubstituted: boolean
  dosage: string
  quantity: number
  unit: string
}
```

Add to the `PrescriptionOrder` interface:

```typescript
  dispensedBy?: string
  dispensedItems?: DispensedItem[]
```

- [ ] **Step 2: Add dispensed data to RX-006**

In the RX-006 mock object, add:

```typescript
    dispensedBy: "Nguyễn Thị Lan",
    dispensedItems: [
      {
        originalMedication: "Refresh Tears",
        dispensedMedication: "Refresh Tears",
        isSubstituted: false,
        dosage: "Nhỏ 1\u20132 giọt mỗi mắt, 3 lần/ngày",
        quantity: 1,
        unit: "lọ",
      },
      {
        originalMedication: "Systane Ultra",
        dispensedMedication: "Systane Ultra",
        isSubstituted: false,
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "lọ",
      },
      {
        originalMedication: "Omega-3",
        dispensedMedication: "Omega-3",
        isSubstituted: false,
        dosage: "Uống 1 viên/ngày sau ăn",
        quantity: 30,
        unit: "viên",
      },
    ],
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-pharmacy.ts
git commit -m "feat: add DispensedItem type and dispensed data to mock pharmacy"
```

---

### Task 2: Fix dispense modal — remove group labels, add allergy blocking

**Files:**
- Modify: `src/components/pharmacy/dispense-modal.tsx`

- [ ] **Step 1: Remove medication group labels**

In the medication table rows, remove the two `<div>` elements that display `med.group`. There are two instances — one inside the substitution branch and one inside the normal branch.

Remove this line from the substitution branch (around line 192):
```tsx
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
```

Remove this line from the normal branch (around line 209):
```tsx
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
```

- [ ] **Step 2: Add allergy-blocking logic**

Add a computed variable after `hasOutOfStock`:

```typescript
  const hasAllergyConflict = medications.some(
    (m) =>
      !m.substitution &&
      order.allergies?.some((a) =>
        m.name.toLowerCase().includes(a.toLowerCase())
      )
  )
```

Update `canConfirm` to include the allergy check:

```typescript
  const canConfirm =
    !isExpired &&
    !hasOutOfStock &&
    !hasAllergyConflict &&
    (!hasSubstitutions || substitutionReason.trim() !== "")
```

Add allergy highlight to table rows. Update the row className to also check allergy match:

```tsx
                      <TableRow
                        key={med.id}
                        className={
                          !med.substitution &&
                          order.allergies?.some((a) =>
                            med.name.toLowerCase().includes(a.toLowerCase())
                          )
                            ? "bg-red-50 dark:bg-red-950/20"
                            : med.isOutOfStock && !med.substitution
                              ? "bg-red-50 dark:bg-red-950/20"
                              : ""
                        }
                      >
```

- [ ] **Step 3: Verify dev server renders correctly**

Run: `npm run dev`
Open `/pharmacy`, click "Phát thuốc" on a pending order. Confirm:
- No group labels under medication names
- Confirm button logic still works

- [ ] **Step 4: Commit**

```bash
git add src/components/pharmacy/dispense-modal.tsx
git commit -m "fix: remove group labels and add allergy-blocking to dispense modal"
```

---

### Task 3: Fix substitute medication dialog — info bar, reason, footer

**Files:**
- Modify: `src/components/pharmacy/substitute-medication-dialog.tsx`

- [ ] **Step 1: Update the component props to include onConfirm with reason**

Change the interface to pass back both the selected medication and the reason:

```typescript
interface SubstituteMedicationDialogProps {
  medication: PrescriptionMedication
  open: boolean
  onClose: () => void
  onSelect: (replacement: MedicationCatalogItem, reason: string) => void
}
```

- [ ] **Step 2: Rewrite the component body**

Replace the entire component with the updated version that adds info bar, highlight-then-confirm, reason textarea, and footer buttons:

```tsx
import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  onSelect: (replacement: MedicationCatalogItem, reason: string) => void
}

export function SubstituteMedicationDialog({
  medication,
  open,
  onClose,
  onSelect,
}: SubstituteMedicationDialogProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MedicationCatalogItem | null>(null)
  const [reason, setReason] = useState("")

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

  const updateReason = (item: MedicationCatalogItem) => {
    setSelected(item)
    setReason(
      `${medication.name} hết hàng, thay bằng ${item.name} — cùng nhóm ${medication.group}.`
    )
  }

  const canConfirm = selected !== null && reason.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Thay thế thuốc
          </DialogTitle>
        </DialogHeader>

        {/* Info bar */}
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
          <span>
            Thuốc gốc: <strong>{medication.name}</strong>
          </span>
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            Hết hàng
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Tìm thuốc thay thế..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Results list */}
        <div className="max-h-[200px] space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy thuốc phù hợp
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => updateReason(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selected?.id === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
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

        {/* Reason textarea */}
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Lý do thay thế <span className="text-red-500">*</span>
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do thay thế thuốc..."
            className="min-h-[60px] text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={!canConfirm}
            onClick={() => selected && onSelect(selected, reason)}
          >
            Xác nhận thay thế
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 3: Update dispense-modal.tsx to handle the new onSelect signature**

The `handleSubstitute` function in `dispense-modal.tsx` currently receives only a `MedicationCatalogItem`. Update it to also receive the reason:

Change the function signature:

```typescript
  const handleSubstitute = (
    medId: string,
    replacement: MedicationCatalogItem,
    reason: string,
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
    setSubstitutionReason(reason)
    setSubstituteTarget(null)
  }
```

Update the `onSelect` prop passed to `SubstituteMedicationDialog`:

```tsx
          onSelect={(replacement, reason) =>
            handleSubstitute(substituteTarget.id, replacement, reason)
          }
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/components/pharmacy/substitute-medication-dialog.tsx src/components/pharmacy/dispense-modal.tsx
git commit -m "feat: upgrade substitute dialog with info bar, reason textarea, and confirm flow"
```

---

### Task 4: Create view-prescription-modal

**Files:**
- Create: `src/components/pharmacy/view-prescription-modal.tsx`

- [ ] **Step 1: Create the component**

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
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

interface ViewPrescriptionModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onDispense: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${formatDate(isoDate)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function daysUntil(isoDate: string): number {
  const now = new Date()
  const exp = new Date(isoDate)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function ViewPrescriptionModal({
  order,
  open,
  onClose,
  onDispense,
}: ViewPrescriptionModalProps) {
  const daysLeft = daysUntil(order.expiresAt)

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-medium">
              Xem đơn thuốc
            </DialogTitle>
            {order.status === "pending" ? (
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
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient info grid — 6 fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Bệnh nhân</div>
              <div className="text-sm font-medium">{order.patientName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Mã BN</div>
              <div className="text-sm font-medium">{order.patientId}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">BS kê đơn</div>
              <div className="text-sm font-medium">{order.doctorName}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Ngày kê</div>
              <div className="text-sm font-medium">
                {formatDateTime(order.prescribedAt)}
              </div>
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
              <div className="text-xs text-muted-foreground">Hạn đơn</div>
              <div
                className={`text-sm font-medium ${daysLeft <= 2 ? "text-red-600" : ""}`}
              >
                {formatDate(order.expiresAt)}{" "}
                <span className="font-normal text-muted-foreground">
                  {daysLeft < 0 ? "(Quá hạn)" : `(còn ${daysLeft} ngày)`}
                </span>
              </div>
            </div>
          </div>

          {/* Doctor notes */}
          {order.doctorNotes && (
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              <strong className="text-foreground">Ghi chú BS:</strong>{" "}
              {order.doctorNotes}
            </div>
          )}

          {/* Medication table — 3 columns, read-only */}
          <div className="rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên thuốc</TableHead>
                  <TableHead>Liều dùng</TableHead>
                  <TableHead>Số lượng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.medications.map((med) => (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">{med.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {med.dosage}
                    </TableCell>
                    <TableCell>
                      {med.quantity} {med.unit}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            In đơn thuốc
          </Button>
          {order.status === "pending" && (
            <Button onClick={onDispense}>Phát thuốc</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/view-prescription-modal.tsx
git commit -m "feat: add view-prescription read-only modal"
```

---

### Task 5: Create dispense-detail-modal

**Files:**
- Create: `src/components/pharmacy/dispense-detail-modal.tsx`

- [ ] **Step 1: Create the component**

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
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

interface DispenseDetailModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onPrintLabels: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${formatDate(isoDate)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function DispenseDetailModal({
  order,
  open,
  onClose,
  onPrintLabels,
}: DispenseDetailModalProps) {
  const hasSubstitutions = order.dispensedItems?.some((item) => item.isSubstituted)

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-h-[85vh] sm:max-w-3xl flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-medium">
                Chi tiết phát thuốc
              </DialogTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Đã phát
              </span>
            </div>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Patient info — 4 fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Bệnh nhân</div>
                <div className="text-sm font-medium">{order.patientName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Mã BN</div>
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
            </div>

            {/* Dispensing metadata bar */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
              <span>
                Dược sĩ phát:{" "}
                <strong>{order.dispensedBy ?? "—"}</strong>
              </span>
              <span className="text-muted-foreground">
                Thời gian:{" "}
                {order.dispensedAt
                  ? formatDateTime(order.dispensedAt)
                  : "—"}
              </span>
            </div>

            {/* Dispensed medication table — 4 columns */}
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Thuốc kê (BS)</TableHead>
                    <TableHead className="w-[30%]">
                      Thuốc phát (thực tế)
                    </TableHead>
                    <TableHead>Liều dùng</TableHead>
                    <TableHead>SL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.dispensedItems ?? []).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span
                          className={
                            item.isSubstituted
                              ? "text-muted-foreground line-through"
                              : "font-medium"
                          }
                        >
                          {item.originalMedication}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.isSubstituted ? (
                          <>
                            <div className="font-medium text-primary">
                              {item.dispensedMedication}
                            </div>
                            <div className="text-[11px] text-primary">
                              → Thay thế tương đương
                            </div>
                          </>
                        ) : (
                          <span className="font-medium">
                            {item.dispensedMedication}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.dosage}
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Substitution reason */}
            {hasSubstitutions && order.substitutionReason && (
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">Lý do thay thế:</strong>{" "}
                {order.substitutionReason}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onPrintLabels}>
              In nhãn thuốc
            </Button>
            <Button variant="outline" onClick={onClose}>
              In đơn thuốc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/dispense-detail-modal.tsx
git commit -m "feat: add dispense-detail read-only modal with comparison table"
```

---

### Task 6: Create print-labels-modal

**Files:**
- Create: `src/components/pharmacy/print-labels-modal.tsx`

- [ ] **Step 1: Create the component**

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
import type { PrescriptionOrder, PrescriptionMedication } from "@/data/mock-pharmacy"

interface PrintLabelsModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function LabelCard({
  med,
  order,
  actualSize,
  selectionMode,
  isSelected,
  onToggle,
}: {
  med: PrescriptionMedication
  order: PrescriptionOrder
  actualSize: boolean
  selectionMode: boolean
  isSelected: boolean
  onToggle: () => void
}) {
  const dispenseDate = order.dispensedAt
    ? formatDate(order.dispensedAt)
    : formatDate(new Date().toISOString())

  const isSubstituted = !!med.substitution

  return (
    <div
      className={`relative rounded border border-dashed border-border p-3 ${
        selectionMode && !isSelected ? "opacity-40" : ""
      } ${actualSize ? "h-[35mm] w-[70mm] p-2 text-[8px]" : ""}`}
      onClick={selectionMode ? onToggle : undefined}
      role={selectionMode ? "checkbox" : undefined}
      aria-checked={selectionMode ? isSelected : undefined}
    >
      {selectionMode && (
        <div
          className={`absolute right-2 top-2 flex size-4 items-center justify-center rounded border text-xs ${
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          }`}
        >
          {isSelected && "\u2713"}
        </div>
      )}

      {/* Header row */}
      <div
        className={`flex items-start justify-between ${actualSize ? "text-[8px]" : "text-sm"}`}
      >
        <span
          className={`font-medium ${isSubstituted ? "text-primary" : ""}`}
        >
          {isSubstituted ? med.substitution!.name : med.name}
          {isSubstituted && (
            <span className="font-normal"> (thay {med.name})</span>
          )}
        </span>
        <span
          className={`text-muted-foreground ${actualSize ? "text-[7px]" : "text-xs"}`}
        >
          PK Ganka28 · {dispenseDate}
        </span>
      </div>

      {/* Body */}
      <div
        className={`mt-1 space-y-0.5 ${actualSize ? "text-[7px]" : "text-xs"} text-muted-foreground`}
      >
        <div>
          BN: <strong className="text-foreground">{order.patientName}</strong>{" "}
          — {order.patientId}
        </div>
        <div>Cách dùng: {med.dosage}</div>
      </div>

      {/* Footer row */}
      <div
        className={`mt-1.5 flex items-end justify-between ${actualSize ? "text-[7px]" : "text-xs"} text-muted-foreground`}
      >
        <span>{order.doctorName}</span>
        <span>
          SL: {med.quantity} {med.unit}
        </span>
      </div>
    </div>
  )
}

export function PrintLabelsModal({
  order,
  open,
  onClose,
}: PrintLabelsModalProps) {
  const [actualSize, setActualSize] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(order.medications.map((m) => m.id))
  )

  const toggleLabel = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedCount = selectedIds.size
  const allSelected = selectedCount === order.medications.length
  const printButtonText =
    selectionMode && !allSelected
      ? `In ${selectedCount} nhãn đã chọn`
      : "In tất cả nhãn"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[85vh] sm:max-w-2xl flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            In nhãn thuốc — {order.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Description */}
          <p className="text-xs text-muted-foreground">
            Xem trước nhãn dán cho từng thuốc. Mỗi nhãn sẽ in trên giấy nhãn
            dán khổ nhỏ (70 × 35mm).
          </p>

          {/* Size toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setActualSize(false)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !actualSize
                  ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              Xem phóng to
            </button>
            <button
              onClick={() => setActualSize(true)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                actualSize
                  ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              Kích thước thật
            </button>
          </div>

          {/* Label cards */}
          <div className="space-y-3">
            {order.medications.map((med) => (
              <LabelCard
                key={med.id}
                med={med}
                order={order}
                actualSize={actualSize}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(med.id)}
                onToggle={() => toggleLabel(med.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectionMode(!selectionMode)
              if (!selectionMode) {
                setSelectedIds(new Set(order.medications.map((m) => m.id)))
              }
            }}
          >
            {selectionMode ? "Hủy chọn" : "Chọn nhãn cần in"}
          </Button>
          <Button>{printButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors (dispense-detail-modal can now resolve the import)

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/print-labels-modal.tsx
git commit -m "feat: add print-labels modal with scaled/actual size toggle and selection"
```

---

### Task 7: Wire all modals into prescription-queue-table and update dispense modal with print-labels sub-modal

**Files:**
- Modify: `src/components/pharmacy/prescription-queue-table.tsx`
- Modify: `src/components/pharmacy/dispense-modal.tsx`

- [ ] **Step 1: Add print labels sub-modal to dispense-modal**

In `dispense-modal.tsx`, add state and import for the print labels modal.

Add import at top:

```typescript
import { PrintLabelsModal } from "@/components/pharmacy/print-labels-modal"
```

Add state inside the component:

```typescript
  const [showLabels, setShowLabels] = useState(false)
```

Change the "In nhãn thuốc" button in the footer from `onClick={onClose}` to:

```tsx
            <Button variant="outline" onClick={() => setShowLabels(true)}>
              In nhãn thuốc
            </Button>
```

After the closing `</Dialog>` and before the `SubstituteMedicationDialog`, add:

```tsx
      {showLabels && (
        <PrintLabelsModal
          order={order}
          open={showLabels}
          onClose={() => setShowLabels(false)}
        />
      )}
```

- [ ] **Step 2: Rewrite prescription-queue-table to manage all modals**

Replace the entire file with the updated version that uses a discriminated union for modal state:

```tsx
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
import {
  MoreVerticalIcon,
  MedicineBottle02Icon,
  File02Icon,
  PrinterIcon,
  LabelIcon,
  FileSearchIcon,
} from "@hugeicons/core-free-icons"
import { DispenseModal } from "@/components/pharmacy/dispense-modal"
import { ViewPrescriptionModal } from "@/components/pharmacy/view-prescription-modal"
import { DispenseDetailModal } from "@/components/pharmacy/dispense-detail-modal"
import { PrintLabelsModal } from "@/components/pharmacy/print-labels-modal"
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

type OpenModal =
  | { type: "dispense"; order: PrescriptionOrder }
  | { type: "view"; order: PrescriptionOrder }
  | { type: "detail"; order: PrescriptionOrder }
  | null

function formatElapsed(isoDate: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(isoDate).getTime()) / 60000,
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
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const [labelsOrder, setLabelsOrder] = useState<PrescriptionOrder | null>(null)

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
                      <Button variant="ghost" size="icon" className="size-7">
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="size-4"
                          strokeWidth={2}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      {rx.status === "pending" ? (
                        <>
                          <DropdownMenuItem
                            className="text-primary"
                            onClick={() =>
                              setOpenModal({ type: "dispense", order: rx })
                            }
                          >
                            <HugeiconsIcon icon={MedicineBottle02Icon} className="size-4" strokeWidth={1.5} />
                            Phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "view", order: rx })
                            }
                          >
                            <HugeiconsIcon icon={File02Icon} className="size-4" strokeWidth={1.5} />
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <HugeiconsIcon icon={PrinterIcon} className="size-4" strokeWidth={1.5} />
                            In đơn thuốc
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "view", order: rx })
                            }
                          >
                            <HugeiconsIcon icon={File02Icon} className="size-4" strokeWidth={1.5} />
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "detail", order: rx })
                            }
                          >
                            <HugeiconsIcon icon={FileSearchIcon} className="size-4" strokeWidth={1.5} />
                            Xem chi tiết phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <HugeiconsIcon icon={PrinterIcon} className="size-4" strokeWidth={1.5} />
                            In đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <HugeiconsIcon icon={LabelIcon} className="size-4" strokeWidth={1.5} />
                            In nhãn thuốc
                          </DropdownMenuItem>
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

      {/* Dispense modal */}
      {openModal?.type === "dispense" && (
        <DispenseModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onConfirm={() => {
            onDispense(openModal.order.id)
            setOpenModal(null)
          }}
        />
      )}

      {/* View prescription modal */}
      {openModal?.type === "view" && (
        <ViewPrescriptionModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onDispense={() =>
            setOpenModal({ type: "dispense", order: openModal.order })
          }
        />
      )}

      {/* Dispense detail modal */}
      {openModal?.type === "detail" && (
        <DispenseDetailModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onPrintLabels={() => setLabelsOrder(openModal.order)}
        />
      )}

      {/* Print labels sub-modal (opened from dispense or detail modal) */}
      {labelsOrder && (
        <PrintLabelsModal
          order={labelsOrder}
          open={!!labelsOrder}
          onClose={() => setLabelsOrder(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/pharmacy/prescription-queue-table.tsx src/components/pharmacy/dispense-modal.tsx
git commit -m "feat: wire all pharmacy modals with discriminated union state management"
```

---

### Task 8: Update handleDispense to build dispensedItems

**Files:**
- Modify: `src/pages/pharmacy/index.tsx`

- [ ] **Step 1: Update handleDispense to accept medication data**

Import the types:

```typescript
import type { PrescriptionStatus, PrescriptionMedication, DispensedItem } from "@/data/mock-pharmacy"
```

Change the `handleDispense` function to accept the final medications list:

```typescript
  const handleDispense = (orderId: string, finalMedications?: PrescriptionMedication[]) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== orderId) return p
        const meds = finalMedications ?? p.medications
        const dispensedItems: DispensedItem[] = meds.map((m) => ({
          originalMedication: m.name,
          dispensedMedication: m.substitution ? m.substitution.name : m.name,
          isSubstituted: !!m.substitution,
          dosage: m.dosage,
          quantity: m.quantity,
          unit: m.unit,
        }))
        return {
          ...p,
          status: "dispensed" as PrescriptionStatus,
          dispensedAt: new Date().toISOString(),
          dispensedBy: "Nguyễn Thị Lan",
          dispensedItems,
        }
      }),
    )
  }
```

- [ ] **Step 2: Update PrescriptionQueueTable props and dispense-modal callback**

The `onDispense` prop type needs to accept the optional medications parameter. Update the `PrescriptionQueueTable` usage in `index.tsx`:

```tsx
          <PrescriptionQueueTable prescriptions={sorted} onDispense={handleDispense} />
```

Then update `PrescriptionQueueTableProps` in `prescription-queue-table.tsx`:

```typescript
interface PrescriptionQueueTableProps {
  prescriptions: PrescriptionOrder[]
  onDispense: (orderId: string, finalMedications?: PrescriptionMedication[]) => void
}
```

Add the import for `PrescriptionMedication`:

```typescript
import type { PrescriptionOrder, PrescriptionMedication } from "@/data/mock-pharmacy"
```

Update the dispense modal's `onConfirm` to pass medications — but since `DispenseModal` manages its own medications state internally, we need to update the dispense modal to pass the final medications back.

In `dispense-modal.tsx`, update the `onConfirm` prop type:

```typescript
interface DispenseModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onConfirm: (finalMedications: PrescriptionMedication[]) => void
}
```

Update the confirm button:

```tsx
            <Button disabled={!canConfirm} onClick={() => onConfirm(medications)}>
              Xác nhận phát thuốc
            </Button>
```

Update the queue table's dispense modal usage:

```tsx
      {openModal?.type === "dispense" && (
        <DispenseModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onConfirm={(finalMedications) => {
            onDispense(openModal.order.id, finalMedications)
            setOpenModal(null)
          }}
        />
      )}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Verify in browser**

Run: `npm run dev`
Open `/pharmacy`. Test the full flow:
1. Click three-dot menu on a pending order → "Phát thuốc" should be accent colored
2. "Phát thuốc" opens dispense modal (no group labels visible)
3. "Xem đơn thuốc" opens view modal with status tag and 6 info fields
4. In view modal, "Phát thuốc" button transitions to dispense modal
5. "Xác nhận phát thuốc" dispenses the order
6. On a dispensed order, "Xem chi tiết phát thuốc" opens detail modal with metadata bar
7. "In nhãn thuốc" from dispense or detail modal opens label preview
8. Toggle actual/scaled size works
9. Selection mode toggles checkboxes on labels

- [ ] **Step 5: Commit**

```bash
git add src/pages/pharmacy/index.tsx src/components/pharmacy/prescription-queue-table.tsx src/components/pharmacy/dispense-modal.tsx
git commit -m "feat: update handleDispense to build dispensedItems with substitution tracking"
```

---

### Task 9: Final typecheck and lint

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No errors (or only pre-existing ones)

- [ ] **Step 3: Run format**

Run: `npm run format`

- [ ] **Step 4: Commit any formatting changes**

```bash
git add -u
git commit -m "style: format pharmacist dashboard modal files"
```
