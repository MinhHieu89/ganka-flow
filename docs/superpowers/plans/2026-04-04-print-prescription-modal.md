# Print Prescription Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a print prescription modal that previews an A5-formatted prescription and prints it via the browser print dialog.

**Architecture:** Single new modal component (`print-prescription-modal.tsx`) following the existing pharmacy modal pattern (shadcn Dialog). Adds patient demographic fields to `PrescriptionOrder` type and mock data. Integrates with existing modals (dispense, view-prescription, dispense-detail) and the prescription queue table dropdown.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui Dialog, `@media print` CSS

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/data/mock-pharmacy.ts` | Modify | Add `prescriptionCode`, `patientBirthYear`, `patientGender`, `patientPhone` to type + mock data |
| `src/components/pharmacy/print-prescription-modal.tsx` | Create | A5 prescription preview modal with print support |
| `src/components/pharmacy/prescription-queue-table.tsx` | Modify | Add `"print"` to `OpenModal` type, wire dropdown actions, render modal |
| `src/components/pharmacy/dispense-modal.tsx` | Modify | Wire "In đơn thuốc" footer button to open print modal |
| `src/components/pharmacy/view-prescription-modal.tsx` | Modify | Wire "In đơn thuốc" footer button to open print modal |
| `src/components/pharmacy/dispense-detail-modal.tsx` | Modify | Wire "In đơn thuốc" footer button to open print modal |

---

### Task 1: Add patient demographic fields to PrescriptionOrder

**Files:**
- Modify: `src/data/mock-pharmacy.ts`

- [ ] **Step 1: Add new fields to PrescriptionOrder interface**

In `src/data/mock-pharmacy.ts`, add four fields to the `PrescriptionOrder` interface after the `patientId` field:

```ts
export interface PrescriptionOrder {
  id: string
  patientName: string
  patientId: string
  prescriptionCode: string
  patientBirthYear: number
  patientGender: "male" | "female"
  patientPhone: string
  doctorName: string
  // ... rest unchanged
}
```

- [ ] **Step 2: Add fields to all 6 mock prescriptions**

Update each mock prescription in the `mockPrescriptions` array. Add the four new fields after `patientId`:

**RX-001 (Trần Văn Minh):**
```ts
prescriptionCode: "DT-20260404-0001",
patientBirthYear: 1978,
patientGender: "male",
patientPhone: "0912345678",
```

**RX-002 (Lê Thị Hoa):**
```ts
prescriptionCode: "DT-20260404-0002",
patientBirthYear: 1990,
patientGender: "female",
patientPhone: "0987654321",
```

**RX-003 (Nguyễn Hoàng Nam):**
```ts
prescriptionCode: "DT-20260404-0003",
patientBirthYear: 2010,
patientGender: "male",
patientPhone: "0933111222",
```

**RX-004 (Phạm Thị Mai):**
```ts
prescriptionCode: "DT-20260404-0004",
patientBirthYear: 1965,
patientGender: "female",
patientPhone: "0909888777",
```

**RX-005 (Vũ Đức Anh):**
```ts
prescriptionCode: "DT-20260404-0005",
patientBirthYear: 1985,
patientGender: "male",
patientPhone: "0976543210",
```

**RX-006 (Đỗ Thị Thanh):**
```ts
prescriptionCode: "DT-20260404-0006",
patientBirthYear: 1972,
patientGender: "female",
patientPhone: "0918222333",
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS (no errors — all mock data satisfies the updated interface)

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-pharmacy.ts
git commit -m "feat: add patient demographic fields to PrescriptionOrder type and mock data"
```

---

### Task 2: Create PrintPrescriptionModal component

**Files:**
- Create: `src/components/pharmacy/print-prescription-modal.tsx`

- [ ] **Step 1: Create the modal component file**

Create `src/components/pharmacy/print-prescription-modal.tsx` with the full component:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

interface PrintPrescriptionModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
}

function formatDateParts(isoDate: string) {
  const d = new Date(isoDate)
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: d.getFullYear(),
  }
}

function formatDate(isoDate: string): string {
  const { day, month, year } = formatDateParts(isoDate)
  return `${day}/${month}/${year}`
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  const prefix = phone.slice(0, 4)
  return `${prefix}.xxx.xxx`
}

function getMedicationRows(order: PrescriptionOrder) {
  // For dispensed prescriptions with dispensedItems, use actual dispensed data
  if (order.status === "dispensed" && order.dispensedItems?.length) {
    return order.dispensedItems.map((item, idx) => ({
      index: idx + 1,
      name: item.dispensedMedication,
      dosage: item.dosage,
      quantity: item.quantity,
      unit: item.unit,
    }))
  }

  // For pending prescriptions, use medications — show substitution name if present
  return order.medications.map((med, idx) => ({
    index: idx + 1,
    name: med.substitution ? med.substitution.name : med.name,
    dosage: med.dosage,
    quantity: med.quantity,
    unit: med.unit,
  }))
}

export function PrintPrescriptionModal({
  order,
  open,
  onClose,
}: PrintPrescriptionModalProps) {
  const prescribedDate = formatDateParts(order.prescribedAt)
  const expiryDate = formatDate(order.expiresAt)
  const medicationRows = getMedicationRows(order)

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-base font-medium">
            In đơn thuốc — {order.patientName}
          </DialogTitle>
        </DialogHeader>

        {/* Description */}
        <p className="text-xs text-muted-foreground print:hidden">
          Xem trước đơn thuốc. Đơn sẽ in trên giấy A5.
        </p>

        {/* A5 Preview Card */}
        <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible print:pr-0">
          <div className="rounded-lg border border-border px-8 py-7 print:border-none print:p-0">
            {/* 5.1 Header */}
            <div className="border-b border-border pb-4 text-center">
              <div className="text-base font-medium">
                PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh — ĐT: (028) 1234 5678
              </div>
              <div className="mt-3 text-lg font-medium tracking-wide">
                ĐƠN THUỐC
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Số: {order.prescriptionCode}
              </div>
            </div>

            {/* 5.2 Patient Info */}
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              <div>
                <span className="text-muted-foreground">Họ tên: </span>
                <span className="font-medium">{order.patientName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Mã BN: </span>
                <span>{order.patientId}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Năm sinh: </span>
                <span>{order.patientBirthYear}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Giới tính: </span>
                <span>
                  {order.patientGender === "male" ? "Nam" : "Nữ"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Ngày khám: </span>
                <span>{formatDate(order.prescribedAt)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">SĐT: </span>
                <span>{maskPhone(order.patientPhone)}</span>
              </div>
            </div>

            {/* 5.3 Diagnosis */}
            <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Chẩn đoán: </span>
              <strong>
                {order.diagnosis}
                {order.icdCode && ` (${order.icdCode})`}
              </strong>
            </div>

            {/* 5.4 Medication Table */}
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="w-[30px] py-2 text-center">STT</th>
                  <th className="py-2">Tên thuốc</th>
                  <th className="py-2">Cách dùng</th>
                  <th className="py-2">SL</th>
                </tr>
              </thead>
              <tbody>
                {medicationRows.map((row) => (
                  <tr key={row.index} className="border-b border-border/50">
                    <td className="py-2 text-center text-muted-foreground">
                      {row.index}
                    </td>
                    <td className="py-2 font-medium">{row.name}</td>
                    <td className="py-2 text-muted-foreground">{row.dosage}</td>
                    <td className="py-2">
                      {row.quantity} {row.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 5.5 Doctor Notes (conditional) */}
            {order.doctorNotes && (
              <div className="mt-4 rounded bg-muted px-3 py-2 text-xs">
                <span className="text-muted-foreground">Lời dặn: </span>
                {order.doctorNotes}
              </div>
            )}

            {/* 5.6 Prescription Footer */}
            <div className="mt-6 flex items-start justify-between text-sm">
              <div className="text-xs text-muted-foreground">
                Ngày {prescribedDate.day} tháng {prescribedDate.month} năm{" "}
                {prescribedDate.year}
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground">
                  Bác sĩ kê đơn
                </div>
                <div className="mt-1 font-medium">{order.doctorName}</div>
              </div>
            </div>

            {/* 5.7 Expiry Line */}
            <div className="mt-4 text-center text-[11px] text-muted-foreground">
              Đơn thuốc có giá trị 7 ngày kể từ ngày kê — Hết hạn: {expiryDate}
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            Tải PDF
          </Button>
          <Button onClick={handlePrint}>In đơn thuốc</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/print-prescription-modal.tsx
git commit -m "feat: add print prescription modal with A5 preview"
```

---

### Task 3: Add print CSS for prescription modal

**Files:**
- Modify: `src/components/pharmacy/print-prescription-modal.tsx`

- [ ] **Step 1: Add a print-specific style block inside the modal**

Tailwind's `print:` variant handles most cases (hiding header/footer/description). However, we need global print overrides to hide the dialog overlay and backdrop. Add a `<style>` tag inside the component's return, just before the `<Dialog>`:

```tsx
export function PrintPrescriptionModal({
  order,
  open,
  onClose,
}: PrintPrescriptionModalProps) {
  // ... existing code ...

  return (
    <>
      {open && (
        <style>{`
          @media print {
            body > *:not([data-radix-portal]) {
              display: none !important;
            }
            [data-radix-portal] [data-slot="dialog-overlay"] {
              background: none !important;
            }
            [data-radix-portal] [data-slot="dialog-content"] {
              position: static !important;
              max-height: none !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              max-width: none !important;
            }
          }
        `}</style>
      )}
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        {/* ... rest unchanged ... */}
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Verify visually in browser**

Run: `npm run dev`
Open the pharmacy dashboard, open a print prescription preview, press Ctrl+P. Verify only the A5 card content appears in the print preview — no modal chrome, no overlay, no page header/sidebar.

- [ ] **Step 4: Commit**

```bash
git add src/components/pharmacy/print-prescription-modal.tsx
git commit -m "feat: add print CSS for prescription modal"
```

---

### Task 4: Wire print modal into prescription queue table dropdown

**Files:**
- Modify: `src/components/pharmacy/prescription-queue-table.tsx`

- [ ] **Step 1: Import PrintPrescriptionModal**

Add to the imports at the top of `prescription-queue-table.tsx`:

```ts
import { PrintPrescriptionModal } from "@/components/pharmacy/print-prescription-modal"
```

- [ ] **Step 2: Add "print" to OpenModal type**

Update the `OpenModal` type:

```ts
type OpenModal =
  | { type: "dispense"; order: PrescriptionOrder }
  | { type: "view"; order: PrescriptionOrder }
  | { type: "detail"; order: PrescriptionOrder }
  | { type: "print"; order: PrescriptionOrder }
  | null
```

- [ ] **Step 3: Wire dropdown "In đơn thuốc" actions**

In the pending status dropdown, change the "In đơn thuốc" `DropdownMenuItem` from:

```tsx
<DropdownMenuItem>
  <HugeiconsIcon
    icon={PrinterIcon}
    className="size-4"
    strokeWidth={1.5}
  />
  In đơn thuốc
</DropdownMenuItem>
```

to:

```tsx
<DropdownMenuItem
  onClick={() =>
    setOpenModal({ type: "print", order: rx })
  }
>
  <HugeiconsIcon
    icon={PrinterIcon}
    className="size-4"
    strokeWidth={1.5}
  />
  In đơn thuốc
</DropdownMenuItem>
```

Do the same for the "In đơn thuốc" item in the dispensed status dropdown (the second one with `PrinterIcon`).

- [ ] **Step 4: Render PrintPrescriptionModal**

Add the modal render below the existing print labels modal, before the closing `</>`:

```tsx
{/* Print prescription modal */}
{openModal?.type === "print" && (
  <PrintPrescriptionModal
    order={openModal.order}
    open
    onClose={() => setOpenModal(null)}
  />
)}
```

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/pharmacy/prescription-queue-table.tsx
git commit -m "feat: wire print prescription modal into queue table dropdown"
```

---

### Task 5: Wire print modal into dispense-modal footer

**Files:**
- Modify: `src/components/pharmacy/dispense-modal.tsx`

- [ ] **Step 1: Import PrintPrescriptionModal**

Add to imports:

```ts
import { PrintPrescriptionModal } from "@/components/pharmacy/print-prescription-modal"
```

- [ ] **Step 2: Add state for print modal**

Inside the `DispenseModal` component, add state alongside the existing `showLabels` state:

```ts
const [showPrint, setShowPrint] = useState(false)
```

- [ ] **Step 3: Update "In đơn thuốc" footer button**

Change the existing "In đơn thuốc" button in `DialogFooter` from:

```tsx
<Button variant="outline" onClick={onClose}>
  In đơn thuốc
</Button>
```

to:

```tsx
<Button variant="outline" onClick={() => setShowPrint(true)}>
  In đơn thuốc
</Button>
```

- [ ] **Step 4: Render PrintPrescriptionModal**

Add after the existing `PrintLabelsModal` render (and before `SubstituteMedicationDialog`):

```tsx
{showPrint && (
  <PrintPrescriptionModal
    order={order}
    open={showPrint}
    onClose={() => setShowPrint(false)}
  />
)}
```

- [ ] **Step 5: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/components/pharmacy/dispense-modal.tsx
git commit -m "feat: wire print prescription modal into dispense modal footer"
```

---

### Task 6: Wire print modal into view-prescription-modal footer

**Files:**
- Modify: `src/components/pharmacy/view-prescription-modal.tsx`

- [ ] **Step 1: Add useState import**

The file currently does not import `useState`. Update the import to:

```ts
import { useState } from "react"
```

- [ ] **Step 2: Import PrintPrescriptionModal**

Add:

```ts
import { PrintPrescriptionModal } from "@/components/pharmacy/print-prescription-modal"
```

- [ ] **Step 3: Add state for print modal**

Inside the `ViewPrescriptionModal` component, add:

```ts
const [showPrint, setShowPrint] = useState(false)
```

- [ ] **Step 4: Update "In đơn thuốc" footer button**

Change:

```tsx
<Button variant="outline" onClick={onClose}>
  In đơn thuốc
</Button>
```

to:

```tsx
<Button variant="outline" onClick={() => setShowPrint(true)}>
  In đơn thuốc
</Button>
```

- [ ] **Step 5: Render PrintPrescriptionModal**

Wrap the existing `<Dialog>` in a fragment and add the print modal. Change the component's return from:

```tsx
return (
  <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
    {/* ... */}
  </Dialog>
)
```

to:

```tsx
return (
  <>
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      {/* ... existing content unchanged ... */}
    </Dialog>

    {showPrint && (
      <PrintPrescriptionModal
        order={order}
        open={showPrint}
        onClose={() => setShowPrint(false)}
      />
    )}
  </>
)
```

- [ ] **Step 6: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/pharmacy/view-prescription-modal.tsx
git commit -m "feat: wire print prescription modal into view prescription modal footer"
```

---

### Task 7: Wire print modal into dispense-detail-modal footer

**Files:**
- Modify: `src/components/pharmacy/dispense-detail-modal.tsx`

- [ ] **Step 1: Add useState import**

Update the import:

```ts
import { useState } from "react"
```

- [ ] **Step 2: Import PrintPrescriptionModal**

Add:

```ts
import { PrintPrescriptionModal } from "@/components/pharmacy/print-prescription-modal"
```

- [ ] **Step 3: Add onPrintPrescription prop removal — use local state instead**

The `DispenseDetailModal` currently has `onPrintLabels` as a prop (called from the footer). For the print prescription modal, we use local state (same pattern as dispense-modal). Add inside the component:

```ts
const [showPrint, setShowPrint] = useState(false)
```

- [ ] **Step 4: Update "In đơn thuốc" footer button**

Change:

```tsx
<Button variant="outline" onClick={onClose}>
  In đơn thuốc
</Button>
```

to:

```tsx
<Button variant="outline" onClick={() => setShowPrint(true)}>
  In đơn thuốc
</Button>
```

- [ ] **Step 5: Render PrintPrescriptionModal**

Add inside the existing fragment (`<>...</>`), after the `</Dialog>` closing tag:

```tsx
{showPrint && (
  <PrintPrescriptionModal
    order={order}
    open={showPrint}
    onClose={() => setShowPrint(false)}
  />
)}
```

- [ ] **Step 6: Verify typecheck passes**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/components/pharmacy/dispense-detail-modal.tsx
git commit -m "feat: wire print prescription modal into dispense detail modal footer"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: PASS with no errors

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS (or only pre-existing warnings)

- [ ] **Step 3: Run dev server and verify all trigger points**

Run: `npm run dev`

Verify each of these trigger points opens the print prescription modal:
1. Queue table dropdown → "In đơn thuốc" (for a "Chờ phát" prescription)
2. Queue table dropdown → "In đơn thuốc" (for a "Đã phát" prescription)
3. Dispense modal → footer "In đơn thuốc" button
4. View prescription modal → footer "In đơn thuốc" button
5. Dispense detail modal → footer "In đơn thuốc" button

Verify the A5 preview shows:
- Clinic header with name, address, phone
- "ĐƠN THUỐC" title with prescription code
- Patient info grid (6 fields, phone masked)
- Diagnosis box
- Medication table (substituted meds show dispensed name only)
- Doctor notes (only when present)
- Date + doctor name footer
- Expiry line

Verify Ctrl+P shows clean print output with only the prescription content.
