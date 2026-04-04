# Cashier Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 4 remaining cashier screens — shift close page, view invoice modal, refund modal, and return-to-queue modal — with full interactivity and dashboard wiring.

**Architecture:** Dashboard manages modal state via discriminated union. Table components accept action callbacks. Shift close is a separate route. Two new hooks (`useShiftClose`, `useRefund`) manage complex state. Modals are sibling components rendered at dashboard level.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Dialog, Table, Button, Input, Select, Textarea), Tailwind CSS v4, Hugeicons, react-router v7

---

### Task 1: Add types and mock data for actions

**Files:**
- Modify: `src/data/mock-cashier.ts`

- [ ] **Step 1: Add new types after CompletedPayment interface**

Add after the `CompletedPayment` interface (around line 111):

```typescript
export interface ShiftBreakdownByMethod {
  method: PaymentMethod
  count: number
  amount: number
}

export interface ShiftBreakdownByCategory {
  category: PaymentCategory
  count: number
  amount: number
}

export interface ShiftReconciliation {
  shiftId: string
  totalRevenue: number
  totalTransactions: number
  cashExpected: number
  cashTransactions: number
  nonCashRevenue: number
  nonCashTransactions: number
  openingCash: number
  cashCollected: number
  cashChangeGiven: number
  breakdownByMethod: ShiftBreakdownByMethod[]
  breakdownByCategory: ShiftBreakdownByCategory[]
}

export interface RefundableItem {
  id: string
  description: string
  quantity: number
  amount: number
  alreadyRefunded: boolean
}

export interface RefundRecord {
  items: string[]
  amount: number
  reasonCode: string
  note: string
  refundMethod: string
  cashierName: string
  createdAt: string
}

export interface TransactionDetail {
  id: string
  patient: PaymentPatientInfo
  items: PaymentLineItem[]
  discount: PaymentDiscount | null
  paymentMethods: PaymentMethodEntry[]
  subtotal: number
  discountAmount: number
  total: number
  cashierName: string
  completedAt: string
  status: TransactionStatus
  refunds?: RefundRecord[]
}

export type ReturnReason =
  | "wrong_prescription"
  | "wrong_optical"
  | "patient_not_ready"
  | "other"

export type ModalState =
  | { type: "closed" }
  | { type: "view-invoice"; transactionId: string }
  | { type: "refund"; transactionId: string }
  | { type: "return-to-queue"; paymentRequestId: string }
```

- [ ] **Step 2: Add mock data at the end of the file**

```typescript
// ─── Actions Mock Data ──────────────────────────────────────────────────────

export const mockShiftReconciliation: ShiftReconciliation = {
  shiftId: "CA-20260405-C",
  totalRevenue: 14_745_000,
  totalTransactions: 7,
  cashExpected: 1_320_000,
  cashTransactions: 2,
  nonCashRevenue: 13_925_000,
  nonCashTransactions: 5,
  openingCash: 500_000,
  cashCollected: 820_000,
  cashChangeGiven: 0,
  breakdownByMethod: [
    { method: "cash", count: 2, amount: 820_000 },
    { method: "transfer", count: 1, amount: 4_200_000 },
    { method: "qr_vnpay", count: 1, amount: 3_600_000 },
    { method: "qr_momo", count: 1, amount: 245_000 },
    { method: "card_visa", count: 1, amount: 780_000 },
    { method: "combined", count: 1, amount: 5_100_000 },
  ],
  breakdownByCategory: [
    { category: "exam", count: 5, amount: 1_600_000 },
    { category: "drug", count: 3, amount: 1_545_000 },
    { category: "optical", count: 2, amount: 9_300_000 },
    { category: "treatment", count: 1, amount: 3_600_000 },
  ],
}

export const mockTransactionDetails: Record<string, TransactionDetail> = {
  "tx-024": {
    id: "GD-20260405-024",
    patient: { name: "Đỗ Thị Hương", code: "BN-20260405-0022", gender: "Nữ", age: 38, phone: "0938111222" },
    items: [
      { id: "tli-1", category: "exam", description: "Phí khám chuyên khoa mắt", quantity: 1, unitPrice: 200_000, lineTotal: 200_000 },
      { id: "tli-2", category: "drug", description: "Restasis 0.05%", quantity: 2, unitPrice: 160_000, lineTotal: 320_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-1", method: "cash", amount: 520_000, cashReceived: 600_000, cashChange: 80_000 }],
    subtotal: 520_000,
    discountAmount: 0,
    total: 520_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(18),
    status: "paid",
  },
  "tx-023": {
    id: "GD-20260405-023",
    patient: { name: "Nguyễn Văn Tâm", code: "BN-20260405-0021", gender: "Nam", age: 51, phone: "0912888999" },
    items: [
      { id: "tli-3", category: "optical", description: "Gọng Lindberg Air Titanium", quantity: 1, unitPrice: 2_800_000, lineTotal: 2_800_000 },
      { id: "tli-4", category: "optical", description: "Tròng Zeiss 1.74 DriveSafe", quantity: 1, unitPrice: 1_400_000, lineTotal: 1_400_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-2", method: "transfer", amount: 4_200_000 }],
    subtotal: 4_200_000,
    discountAmount: 0,
    total: 4_200_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(32),
    status: "paid",
  },
  "tx-022": {
    id: "GD-20260405-022",
    patient: { name: "Bùi Thanh Hà", code: "BN-20260405-0019", gender: "Nữ", age: 44, phone: "0977444555" },
    items: [
      { id: "tli-5", category: "treatment", description: "Gói IPL 6 buổi (Đợt 1 – 50%)", quantity: 1, unitPrice: 3_600_000, lineTotal: 3_600_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-3", method: "qr_vnpay", amount: 3_600_000 }],
    subtotal: 3_600_000,
    discountAmount: 0,
    total: 3_600_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(50),
    status: "pending_refund",
  },
  "tx-021": {
    id: "GD-20260405-021",
    patient: { name: "Hoàng Minh Đức", code: "BN-20260405-0017", gender: "Nam", age: 29, phone: "0866333777" },
    items: [
      { id: "tli-6", category: "exam", description: "Phí khám chuyên khoa mắt", quantity: 1, unitPrice: 200_000, lineTotal: 200_000 },
      { id: "tli-7", category: "exam", description: "Chụp OCT võng mạc", quantity: 1, unitPrice: 300_000, lineTotal: 300_000 },
      { id: "tli-8", category: "drug", description: "Tobradex nhỏ mắt", quantity: 1, unitPrice: 180_000, lineTotal: 180_000 },
      { id: "tli-9", category: "drug", description: "Refresh Tears", quantity: 1, unitPrice: 100_000, lineTotal: 100_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-4", method: "card_visa", amount: 780_000 }],
    subtotal: 780_000,
    discountAmount: 0,
    total: 780_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(65),
    status: "paid",
  },
  "tx-020": {
    id: "GD-20260405-020",
    patient: { name: "Trần Thị Lan", code: "BN-20260405-0014", gender: "Nữ", age: 60, phone: "0945666888" },
    items: [
      { id: "tli-10", category: "exam", description: "Phí khám chuyên khoa mắt", quantity: 1, unitPrice: 200_000, lineTotal: 200_000 },
      { id: "tli-11", category: "exam", description: "Đo nhãn áp", quantity: 1, unitPrice: 100_000, lineTotal: 100_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-5", method: "cash", amount: 300_000, cashReceived: 300_000, cashChange: 0 }],
    subtotal: 300_000,
    discountAmount: 0,
    total: 300_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(82),
    status: "refunded",
    refunds: [{
      items: ["tli-10", "tli-11"],
      amount: 300_000,
      reasonCode: "patient_cancel",
      note: "BN hủy khám, yêu cầu hoàn tiền",
      refundMethod: "cash",
      cashierName: "Thu ngân Linh",
      createdAt: todayTimestamp(75),
    }],
  },
  "tx-019": {
    id: "GD-20260405-019",
    patient: { name: "Lý Văn Quang", code: "BN-20260405-0011", gender: "Nam", age: 35, phone: "0703222444" },
    items: [
      { id: "tli-12", category: "drug", description: "Systane Ultra UD", quantity: 1, unitPrice: 125_000, lineTotal: 125_000 },
      { id: "tli-13", category: "drug", description: "Vitamin A 25000IU", quantity: 30, unitPrice: 4_000, lineTotal: 120_000 },
    ],
    discount: null,
    paymentMethods: [{ id: "pm-6", method: "qr_momo", amount: 245_000 }],
    subtotal: 245_000,
    discountAmount: 0,
    total: 245_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(100),
    status: "paid",
  },
  "tx-018": {
    id: "GD-20260405-018",
    patient: { name: "Phan Thị Ngọc", code: "BN-20260405-0009", gender: "Nữ", age: 47, phone: "0856999000" },
    items: [
      { id: "tli-14", category: "exam", description: "Phí khám chuyên khoa mắt", quantity: 1, unitPrice: 200_000, lineTotal: 200_000 },
      { id: "tli-15", category: "optical", description: "Gọng Essilor Stylance X", quantity: 1, unitPrice: 850_000, lineTotal: 850_000 },
      { id: "tli-16", category: "optical", description: "Tròng Hoya 1.67 BlueControl", quantity: 1, unitPrice: 1_200_000, lineTotal: 1_200_000 },
      { id: "tli-17", category: "optical", description: "Phí cắt lắp tròng", quantity: 1, unitPrice: 150_000, lineTotal: 150_000 },
    ],
    discount: { type: "percent", value: 5, reason: "Khách quen", appliedBy: "Thu ngân Linh", amount: 120_000 },
    paymentMethods: [
      { id: "pm-7a", method: "cash", amount: 2_000_000, cashReceived: 2_000_000, cashChange: 0 },
      { id: "pm-7b", method: "transfer", amount: 280_000 },
    ],
    subtotal: 2_400_000,
    discountAmount: 120_000,
    total: 2_280_000,
    cashierName: "Thu ngân Linh",
    completedAt: todayTimestamp(118),
    status: "paid",
  },
}

export function getMockRefundableItems(transactionId: string): RefundableItem[] {
  const detail = mockTransactionDetails[transactionId]
  if (!detail) return []
  const refundedItemIds = new Set(
    (detail.refunds ?? []).flatMap((r) => r.items)
  )
  return detail.items.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    amount: item.lineTotal,
    alreadyRefunded: refundedItemIds.has(item.id),
  }))
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-cashier.ts
git commit -m "feat(cashier): add action types and mock data for shift close, invoice, refund"
```

---

### Task 2: Create useShiftClose hook

**Files:**
- Create: `src/hooks/use-shift-close.ts`

- [ ] **Step 1: Create the hook**

```typescript
import { useState, useMemo } from "react"
import {
  mockShiftReconciliation,
  mockPaymentRequests,
} from "@/data/mock-cashier"

export function useShiftClose() {
  const reconciliation = mockShiftReconciliation

  const cashExpected =
    reconciliation.openingCash +
    reconciliation.cashCollected -
    reconciliation.cashChangeGiven

  const [cashActual, setCashActual] = useState<number | null>(null)
  const [note, setNote] = useState("")

  const difference = (cashActual ?? 0) - cashExpected

  const differenceStatus = useMemo<"match" | "over" | "short">(() => {
    if (cashActual === null) return "match"
    if (difference === 0) return "match"
    return difference > 0 ? "over" : "short"
  }, [cashActual, difference])

  const pendingCount = mockPaymentRequests.length

  const canClose = useMemo(() => {
    if (cashActual === null) return false
    if (pendingCount > 0) return false
    if (difference !== 0 && !note.trim()) return false
    return true
  }, [cashActual, pendingCount, difference, note])

  return {
    reconciliation,
    cashExpected,
    cashActual,
    setCashActual,
    difference,
    differenceStatus,
    note,
    setNote,
    canClose,
    pendingCount,
  }
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-shift-close.ts
git commit -m "feat(cashier): add useShiftClose hook with reconciliation logic"
```

---

### Task 3: Create useRefund hook

**Files:**
- Create: `src/hooks/use-refund.ts`

- [ ] **Step 1: Create the hook**

```typescript
import { useState, useMemo } from "react"
import {
  mockTransactionDetails,
  getMockRefundableItems,
  getPaymentMethodLabel,
} from "@/data/mock-cashier"
import type { TransactionDetail, RefundableItem } from "@/data/mock-cashier"

export function useRefund(transactionId: string) {
  const transaction: TransactionDetail | undefined =
    mockTransactionDetails[transactionId]

  const refundableItems: RefundableItem[] = useMemo(
    () => getMockRefundableItems(transactionId),
    [transactionId]
  )

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  )
  const [reasonCode, setReasonCode] = useState("")
  const [refundMethod, setRefundMethod] = useState(() => {
    if (!transaction) return "cash"
    return transaction.paymentMethods[0]?.method ?? "cash"
  })
  const [note, setNote] = useState("")

  const refundTotal = useMemo(
    () =>
      refundableItems
        .filter((item) => selectedItemIds.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
    [refundableItems, selectedItemIds]
  )

  const canConfirm = useMemo(() => {
    if (selectedItemIds.size === 0) return false
    if (!reasonCode) return false
    if (!note.trim()) return false
    return true
  }, [selectedItemIds, reasonCode, note])

  const originalMethodLabel = transaction
    ? getPaymentMethodLabel(transaction.paymentMethods[0]?.method ?? "cash")
    : "Tiền mặt"

  function toggleItem(id: string) {
    const item = refundableItems.find((i) => i.id === id)
    if (!item || item.alreadyRefunded) return
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return {
    transaction,
    refundableItems,
    selectedItemIds,
    toggleItem,
    reasonCode,
    setReasonCode,
    refundMethod,
    setRefundMethod,
    note,
    setNote,
    refundTotal,
    canConfirm,
    originalMethodLabel,
  }
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-refund.ts
git commit -m "feat(cashier): add useRefund hook with item selection and validation"
```

---

### Task 4: Create ShiftMetricCards component

**Files:**
- Create: `src/components/cashier/shift-metric-cards.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { ShiftReconciliation } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface ShiftMetricCardsProps {
  reconciliation: ShiftReconciliation
}

export function ShiftMetricCards({ reconciliation }: ShiftMetricCardsProps) {
  const cards = [
    {
      label: "Tổng doanh thu ca",
      value: formatVND(reconciliation.totalRevenue),
      sub: `${reconciliation.totalTransactions} giao dịch`,
    },
    {
      label: "Tiền mặt (hệ thống)",
      value: formatVND(reconciliation.cashExpected),
      sub: `${reconciliation.cashTransactions} giao dịch`,
    },
    {
      label: "Không tiền mặt",
      value: formatVND(reconciliation.nonCashRevenue),
      sub: `${reconciliation.nonCashTransactions} giao dịch`,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-background p-4"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1 text-lg font-medium">{card.value}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cashier/shift-metric-cards.tsx
git commit -m "feat(cashier): add ShiftMetricCards component"
```

---

### Task 5: Create ShiftBreakdownTable component

**Files:**
- Create: `src/components/cashier/shift-breakdown-table.tsx`

- [ ] **Step 1: Create the component**

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  ShiftBreakdownByMethod,
  ShiftBreakdownByCategory,
} from "@/data/mock-cashier"
import { formatVND, getPaymentMethodLabel } from "@/data/mock-cashier"

const CATEGORY_LABELS: Record<string, string> = {
  exam: "Khám",
  drug: "Thuốc",
  optical: "Kính",
  treatment: "Liệu trình",
}

interface ShiftBreakdownTableProps {
  byMethod: ShiftBreakdownByMethod[]
  byCategory: ShiftBreakdownByCategory[]
  totalRevenue: number
}

export function ShiftBreakdownTable({
  byMethod,
  byCategory,
  totalRevenue,
}: ShiftBreakdownTableProps) {
  return (
    <div className="space-y-6">
      {/* By payment method */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Breakdown theo phương thức thanh toán
        </h3>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phương thức</TableHead>
                <TableHead className="text-center">Số GD</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byMethod.map((row) => (
                <TableRow key={row.method}>
                  <TableCell className="text-[13px]">
                    {getPaymentMethodLabel(row.method)}
                  </TableCell>
                  <TableCell className="text-center text-[13px] text-muted-foreground">
                    {row.count}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium">
                    {formatVND(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="text-[13px] font-medium">Tổng</TableCell>
                <TableCell className="text-center text-[13px] font-medium">
                  {byMethod.reduce((s, r) => s + r.count, 0)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* By category */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Breakdown theo phân hệ doanh thu
        </h3>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phân hệ</TableHead>
                <TableHead className="text-center">Số GD</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCategory.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="text-[13px]">
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </TableCell>
                  <TableCell className="text-center text-[13px] text-muted-foreground">
                    {row.count}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium">
                    {formatVND(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="text-[13px] font-medium">Tổng</TableCell>
                <TableCell className="text-center text-[13px] font-medium">
                  {byCategory.reduce((s, r) => s + r.count, 0)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/cashier/shift-breakdown-table.tsx
git commit -m "feat(cashier): add ShiftBreakdownTable with method and category breakdowns"
```

---

### Task 6: Create ShiftCashReconciliation component

**Files:**
- Create: `src/components/cashier/shift-cash-reconciliation.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatVND } from "@/data/mock-cashier"

interface ShiftCashReconciliationProps {
  openingCash: number
  cashCollected: number
  cashChangeGiven: number
  cashExpected: number
  cashActual: number | null
  onCashActualChange: (value: number) => void
  difference: number
  differenceStatus: "match" | "over" | "short"
  note: string
  onNoteChange: (value: string) => void
  canClose: boolean
  pendingCount: number
  onClose: () => void
}

const STATUS_STYLES = {
  match: "border-green-200 bg-[#E1F5EE] text-[#085041]",
  over: "border-amber-200 bg-[#FAEEDA] text-[#633806]",
  short: "border-red-200 bg-[#FCEBEB] text-[#791F1F]",
}

const STATUS_LABELS = {
  match: "Khớp",
  over: "Thừa",
  short: "Thiếu",
}

export function ShiftCashReconciliation({
  openingCash,
  cashCollected,
  cashChangeGiven,
  cashExpected,
  cashActual,
  onCashActualChange,
  difference,
  differenceStatus,
  note,
  onNoteChange,
  canClose,
  pendingCount,
  onClose,
}: ShiftCashReconciliationProps) {
  const [inputText, setInputText] = useState("")
  const [focused, setFocused] = useState(false)

  function handleFocus() {
    setFocused(true)
    setInputText(cashActual !== null && cashActual > 0 ? String(cashActual) : "")
  }

  function handleBlur() {
    setFocused(false)
    const num = parseInt(inputText.replace(/\D/g, ""), 10) || 0
    onCashActualChange(num)
    setInputText(formatVND(num))
  }

  function handleChange(val: string) {
    setInputText(val.replace(/[^\d]/g, ""))
  }

  // Sync display when value changes externally
  if (!focused && cashActual !== null && formatVND(cashActual) !== inputText) {
    setInputText(formatVND(cashActual))
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-medium">Đối soát tiền mặt</h3>

      {/* System info rows */}
      <div className="space-y-2.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tiền đầu ca</span>
          <span>{formatVND(openingCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Thu trong ca</span>
          <span>{formatVND(cashCollected)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tiền thừa trả khách</span>
          <span>-{formatVND(cashChangeGiven)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2.5 font-medium">
          <span>Tiền mặt kỳ vọng</span>
          <span>{formatVND(cashExpected)}</span>
        </div>
      </div>

      {/* Cash actual input */}
      <div className="mt-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">
          Tiền mặt thực tế đếm được
        </label>
        <Input
          value={focused ? inputText : (cashActual !== null ? formatVND(cashActual) : "")}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nhập số tiền thực tế"
          className="h-10 text-right text-[15px] font-medium"
        />
      </div>

      {/* Difference display */}
      {cashActual !== null && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-[13px] font-medium ${STATUS_STYLES[differenceStatus]}`}
        >
          {STATUS_LABELS[differenceStatus]} · Chênh lệch:{" "}
          {difference >= 0 ? "+" : ""}
          {formatVND(Math.abs(difference))}
        </div>
      )}

      {/* Note */}
      <div className="mt-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">
          Ghi chú
          {cashActual !== null && difference !== 0 && (
            <span className="text-destructive"> *</span>
          )}
        </label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Ghi chú chênh lệch hoặc sự cố trong ca..."
          className="min-h-[60px]"
        />
      </div>

      {/* Pending patients warning */}
      {pendingCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Còn {pendingCount} bệnh nhân chờ thanh toán. Vui lòng xử lý trước
          khi chốt ca.
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Sau khi chốt ca, không thể thêm giao dịch mới vào ca này. Các giao
        dịch tiếp theo sẽ thuộc ca sau.
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2.5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.print()}
        >
          In báo cáo ca
        </Button>
        <Button
          className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
          disabled={!canClose}
          onClick={onClose}
        >
          Xác nhận chốt ca
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/shift-cash-reconciliation.tsx
git commit -m "feat(cashier): add ShiftCashReconciliation with live difference calculation"
```

---

### Task 7: Create ShiftClosePage

**Files:**
- Create: `src/pages/payment/shift-close.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { useShiftClose } from "@/hooks/use-shift-close"
import { ShiftMetricCards } from "@/components/cashier/shift-metric-cards"
import { ShiftBreakdownTable } from "@/components/cashier/shift-breakdown-table"
import { ShiftCashReconciliation } from "@/components/cashier/shift-cash-reconciliation"

export default function ShiftClosePage() {
  const navigate = useNavigate()
  const {
    reconciliation,
    cashExpected,
    cashActual,
    setCashActual,
    difference,
    differenceStatus,
    note,
    setNote,
    canClose,
    pendingCount,
  } = useShiftClose()

  function handleClose() {
    navigate("/payment")
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/payment")}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="mr-1.5 size-4"
            strokeWidth={1.5}
          />
          Quay lại
        </Button>
        <h1 className="text-xl font-medium">Chốt ca</h1>
        <span className="text-[13px] text-muted-foreground">
          Ca chiều · 13:00–20:00 · Thu ngân Linh
        </span>
      </div>

      {/* Metric cards */}
      <div className="mx-auto max-w-[1280px] p-6 pb-0">
        <ShiftMetricCards reconciliation={reconciliation} />
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex max-w-[1280px] gap-6 p-6">
        {/* Left column */}
        <div className="min-w-0 flex-[6]">
          <ShiftBreakdownTable
            byMethod={reconciliation.breakdownByMethod}
            byCategory={reconciliation.breakdownByCategory}
            totalRevenue={reconciliation.totalRevenue}
          />
        </div>

        {/* Right column (sticky) */}
        <div className="sticky top-6 min-w-[320px] flex-[4] self-start">
          <ShiftCashReconciliation
            openingCash={reconciliation.openingCash}
            cashCollected={reconciliation.cashCollected}
            cashChangeGiven={reconciliation.cashChangeGiven}
            cashExpected={cashExpected}
            cashActual={cashActual}
            onCashActualChange={setCashActual}
            difference={difference}
            differenceStatus={differenceStatus}
            note={note}
            onNoteChange={setNote}
            canClose={canClose}
            pendingCount={pendingCount}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/payment/shift-close.tsx
git commit -m "feat(cashier): add shift close page with reconciliation layout"
```

---

### Task 8: Create ViewInvoiceModal

**Files:**
- Create: `src/components/cashier/view-invoice-modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  PaymentCategory,
  PaymentLineItem,
  TransactionDetail,
} from "@/data/mock-cashier"
import {
  formatVND,
  formatPhone,
  getPaymentMethodLabel,
  mockTransactionDetails,
} from "@/data/mock-cashier"

interface ViewInvoiceModalProps {
  transactionId: string
  open: boolean
  onClose: () => void
  onRefund: (transactionId: string) => void
}

const STATUS_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  paid: { label: "Đã thanh toán", bg: "#E1F5EE", text: "#085041" },
  refunded: { label: "Đã hoàn tiền", bg: "#FCEBEB", text: "#791F1F" },
  pending_refund: { label: "Hoàn một phần", bg: "#FAEEDA", text: "#633806" },
}

const CATEGORY_ORDER: PaymentCategory[] = ["exam", "drug", "optical", "treatment"]
const CATEGORY_LABELS: Record<PaymentCategory, string> = {
  exam: "KHÁM",
  drug: "THUỐC",
  optical: "KÍNH",
  treatment: "LIỆU TRÌNH",
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function ViewInvoiceModal({
  transactionId,
  open,
  onClose,
  onRefund,
}: ViewInvoiceModalProps) {
  const tx: TransactionDetail | undefined =
    mockTransactionDetails[transactionId]

  const groups = useMemo(() => {
    if (!tx) return []
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of tx.items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
    }))
  }, [tx])

  if (!tx) return null

  const statusBadge = STATUS_BADGE[tx.status]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-[480px] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-base">#{tx.id}</DialogTitle>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: statusBadge.bg, color: statusBadge.text }}
            >
              {statusBadge.label}
            </span>
          </div>
        </DialogHeader>

        {/* Patient info */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-dashed border-border pb-4 text-[13px]">
          <span className="text-muted-foreground">Bệnh nhân</span>
          <span className="text-right">{tx.patient.name}</span>
          <span className="text-muted-foreground">Mã BN</span>
          <span className="text-right">{tx.patient.code}</span>
          <span className="text-muted-foreground">SĐT</span>
          <span className="text-right">{formatPhone(tx.patient.phone)}</span>
          <span className="text-muted-foreground">Thời gian</span>
          <span className="text-right">{formatDateTime(tx.completedAt)}</span>
          <span className="text-muted-foreground">Thu ngân</span>
          <span className="text-right">{tx.cashierName}</span>
        </div>

        {/* Line items */}
        {groups.map((group) => (
          <div key={group.category} className="mb-2">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[group.category]}
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-0.5 text-[13px]"
              >
                <span>
                  {item.description}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatVND(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Totals */}
        <div className="border-t border-dashed border-border pt-3">
          <div className="flex justify-between py-1 text-[13px] text-muted-foreground">
            <span>Tạm tính</span>
            <span>{formatVND(tx.subtotal)}</span>
          </div>
          {tx.discountAmount > 0 && (
            <div className="flex justify-between py-1 text-[13px] text-[#A32D2D]">
              <span>
                Giảm giá
                {tx.discount?.type === "percent"
                  ? ` ${tx.discount.value}%`
                  : ""}
              </span>
              <span>-{formatVND(tx.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-foreground pt-2 text-base font-medium">
            <span>Thành tiền</span>
            <span>{formatVND(tx.total)}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-dashed border-border pt-3">
          {tx.paymentMethods.map((pm) => (
            <div key={pm.id} className="flex justify-between py-0.5 text-[13px]">
              <span className="text-muted-foreground">
                {getPaymentMethodLabel(pm.method)}
              </span>
              <span>{formatVND(pm.amount)}</span>
            </div>
          ))}
        </div>

        {/* Refund section */}
        {tx.refunds && tx.refunds.length > 0 && (
          <div className="border-t border-dashed border-border pt-3">
            <div className="mb-2 text-[13px] font-medium text-[#A32D2D]">
              Hoàn tiền
            </div>
            {tx.refunds.map((refund, idx) => (
              <div
                key={idx}
                className="mb-2 rounded-lg border border-red-100 bg-red-50/50 p-3 text-xs"
              >
                <div className="font-medium text-[#A32D2D]">
                  -{formatVND(refund.amount)}
                </div>
                <div className="mt-1 text-muted-foreground">
                  Lý do: {refund.note}
                </div>
                <div className="text-muted-foreground">
                  {refund.cashierName} · {formatDateTime(refund.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            In lại
          </Button>
          {tx.status !== "refunded" && (
            <Button
              variant="outline"
              className="border-red-200 text-[#A32D2D] hover:bg-red-50 hover:text-[#A32D2D]"
              onClick={() => onRefund(transactionId)}
            >
              Hoàn tiền
            </Button>
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
git add src/components/cashier/view-invoice-modal.tsx
git commit -m "feat(cashier): add ViewInvoiceModal with status badge and refund section"
```

---

### Task 9: Create RefundModal

**Files:**
- Create: `src/components/cashier/refund-modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatVND } from "@/data/mock-cashier"
import { useRefund } from "@/hooks/use-refund"

interface RefundModalProps {
  transactionId: string
  open: boolean
  onClose: () => void
}

const REASON_OPTIONS = [
  { value: "wrong_service", label: "Tính sai dịch vụ" },
  { value: "patient_cancel", label: "BN hủy dịch vụ" },
  { value: "cancel_treatment", label: "Hủy liệu trình" },
  { value: "warranty", label: "Bảo hành" },
  { value: "other", label: "Khác" },
]

export function RefundModal({
  transactionId,
  open,
  onClose,
}: RefundModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const {
    transaction,
    refundableItems,
    selectedItemIds,
    toggleItem,
    reasonCode,
    setReasonCode,
    refundMethod,
    setRefundMethod,
    note,
    setNote,
    refundTotal,
    canConfirm,
    originalMethodLabel,
  } = useRefund(transactionId)

  if (!transaction) return null

  function handleConfirmRefund() {
    setShowConfirm(false)
    onClose()
  }

  return (
    <>
      <Dialog open={open && !showConfirm} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-h-[90vh] max-w-[460px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Hoàn tiền</DialogTitle>
          </DialogHeader>

          {/* Original invoice summary */}
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs">
            <div>
              Mã HĐ: <span className="font-medium">#{transaction.id}</span>
            </div>
            <div>
              Bệnh nhân:{" "}
              <span className="font-medium">{transaction.patient.name}</span>
            </div>
            <div>
              Tổng tiền gốc:{" "}
              <span className="font-medium">
                {formatVND(transaction.total)}
              </span>
            </div>
          </div>

          {/* Refundable items checkbox list */}
          <div className="space-y-1">
            {refundableItems.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5 ${
                  item.alreadyRefunded
                    ? "cursor-not-allowed opacity-50"
                    : selectedItemIds.has(item.id)
                      ? "border-[#A32D2D] bg-red-50/50"
                      : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={
                      selectedItemIds.has(item.id) || item.alreadyRefunded
                    }
                    disabled={item.alreadyRefunded}
                    onChange={() => toggleItem(item.id)}
                    className="size-4 rounded border-border"
                  />
                  <span className="text-[13px]">
                    {item.description}
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground">
                        {" "}
                        x{item.quantity}
                      </span>
                    )}
                    {item.alreadyRefunded && (
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        Đã hoàn
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[13px] font-medium">
                  {formatVND(item.amount)}
                </span>
              </label>
            ))}
          </div>

          {/* Refund total */}
          {refundTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-[#FCEBEB] px-3 py-2.5">
              <span className="text-[13px] font-medium text-[#791F1F]">
                Số tiền hoàn
              </span>
              <span className="text-[15px] font-medium text-[#791F1F]">
                {formatVND(refundTotal)}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Lý do hoàn tiền
            </label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refund method */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Hoàn qua
            </label>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={transaction.paymentMethods[0]?.method ?? "cash"}>
                  Phương thức gốc ({originalMethodLabel})
                </SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="transfer">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Ghi chú <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả chi tiết lý do hoàn tiền"
              className="min-h-[60px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              className="bg-[#A32D2D] text-white hover:bg-[#8B2626]"
              disabled={!canConfirm}
              onClick={() => setShowConfirm(true)}
            >
              Xác nhận hoàn tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn tiền?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Xác nhận hoàn {formatVND(refundTotal)} cho hóa đơn #
            {transaction.id}? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#A32D2D] text-white hover:bg-[#8B2626]"
              onClick={handleConfirmRefund}
            >
              Xác nhận
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
git add src/components/cashier/refund-modal.tsx
git commit -m "feat(cashier): add RefundModal with item selection and confirm dialog"
```

---

### Task 10: Create ReturnToQueueModal

**Files:**
- Create: `src/components/cashier/return-to-queue-modal.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ReturnReason } from "@/data/mock-cashier"
import { mockPaymentRequests, formatPhone } from "@/data/mock-cashier"

interface ReturnToQueueModalProps {
  paymentRequestId: string
  open: boolean
  onClose: () => void
}

const REASON_OPTIONS: {
  value: ReturnReason
  label: string
  description: string
}[] = [
  {
    value: "wrong_prescription",
    label: "Đơn thuốc chưa đúng",
    description: "Trả về bác sĩ để chỉnh sửa đơn thuốc",
  },
  {
    value: "wrong_optical",
    label: "Đơn kính chưa đúng",
    description: "Trả về trung tâm kính để chỉnh sửa",
  },
  {
    value: "patient_not_ready",
    label: "BN chưa sẵn sàng",
    description: "BN yêu cầu chờ hoặc rời PK tạm thời",
  },
  {
    value: "other",
    label: "Khác",
    description: "Nhập lý do ở ghi chú bên dưới",
  },
]

export function ReturnToQueueModal({
  paymentRequestId,
  open,
  onClose,
}: ReturnToQueueModalProps) {
  const request = useMemo(
    () => mockPaymentRequests.find((r) => r.id === paymentRequestId),
    [paymentRequestId]
  )
  const [reason, setReason] = useState<ReturnReason | "">("")
  const [note, setNote] = useState("")

  if (!request) return null

  const waitMinutes = Math.floor(
    (Date.now() - new Date(request.queuedAt).getTime()) / 60_000
  )

  const canConfirm = reason !== "" && (reason !== "other" || note.trim() !== "")

  function handleConfirm() {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">Trả lại hàng đợi</DialogTitle>
        </DialogHeader>

        {/* Patient info */}
        <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs">
          <div>
            Họ tên:{" "}
            <span className="font-medium">{request.patientName}</span>
          </div>
          <div>
            Mã BN:{" "}
            <span className="font-medium">{request.patientId}</span>
          </div>
          <div>
            SĐT:{" "}
            <span className="font-medium">
              {formatPhone(request.patientPhone)}
            </span>
          </div>
          <div>
            Thời gian chờ:{" "}
            <span className="font-medium">{waitMinutes} phút</span>
          </div>
        </div>

        {/* Reason radio group */}
        <div className="space-y-0">
          {REASON_OPTIONS.map((opt, idx) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 border border-border px-3 py-3 ${
                idx === 0 ? "rounded-t-lg" : ""
              } ${idx === REASON_OPTIONS.length - 1 ? "rounded-b-lg" : ""} ${
                idx > 0 ? "-mt-px" : ""
              } ${reason === opt.value ? "border-[#633806] bg-[#FAEEDA]/30 z-10 relative" : ""}`}
            >
              <input
                type="radio"
                name="return-reason"
                checked={reason === opt.value}
                onChange={() => setReason(opt.value)}
                className="mt-0.5 size-4"
              />
              <div>
                <div className="text-[13px] font-medium">{opt.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {opt.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">
            Ghi chú
            {reason === "other" && (
              <span className="text-destructive"> *</span>
            )}
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm..."
            className="min-h-[60px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-[#FAEEDA] text-[#633806] hover:bg-[#f5e3c8]"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Xác nhận trả lại
          </Button>
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
git add src/components/cashier/return-to-queue-modal.tsx
git commit -m "feat(cashier): add ReturnToQueueModal with radio reasons"
```

---

### Task 11: Wire dashboard modal state and table callbacks

**Files:**
- Modify: `src/pages/payment/index.tsx`
- Modify: `src/components/cashier/cashier-transactions-table.tsx`
- Modify: `src/components/cashier/cashier-queue-table.tsx`

- [ ] **Step 1: Update CashierTransactionsTable to accept callbacks**

In `src/components/cashier/cashier-transactions-table.tsx`, change the props interface and add onClick handlers:

Replace the interface (line 47-49):
```typescript
interface CashierTransactionsTableProps {
  transactions: Transaction[]
}
```
with:
```typescript
interface CashierTransactionsTableProps {
  transactions: Transaction[]
  onViewInvoice?: (transactionId: string) => void
  onRefund?: (transactionId: string) => void
}
```

Replace the component signature (line 51-53):
```typescript
export function CashierTransactionsTable({
  transactions,
}: CashierTransactionsTableProps) {
```
with:
```typescript
export function CashierTransactionsTable({
  transactions,
  onViewInvoice,
  onRefund,
}: CashierTransactionsTableProps) {
```

Add `onClick` to the "Xem hóa đơn" menu item (line 134):
```tsx
                      <DropdownMenuItem onClick={() => onViewInvoice?.(tx.id)}>
```

Add `onClick` to the "Yêu cầu hoàn tiền" menu item (line 153):
```tsx
                          <DropdownMenuItem onClick={() => onRefund?.(tx.id)}>
```

- [ ] **Step 2: Update CashierQueueTable to accept onReturnToQueue callback**

In `src/components/cashier/cashier-queue-table.tsx`, change the props interface:

Replace (line 55-57):
```typescript
interface CashierQueueTableProps {
  requests: PaymentRequest[]
}
```
with:
```typescript
interface CashierQueueTableProps {
  requests: PaymentRequest[]
  onReturnToQueue?: (paymentRequestId: string) => void
}
```

Replace the component signature (line 59-60):
```typescript
export function CashierQueueTable({ requests }: CashierQueueTableProps) {
  const navigate = useNavigate()
```
with:
```typescript
export function CashierQueueTable({ requests, onReturnToQueue }: CashierQueueTableProps) {
  const navigate = useNavigate()
```

Add `onClick` to the "Trả lại hàng đợi" menu item (line 153):
```tsx
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onReturnToQueue?.(req.id)}
                    >
```

- [ ] **Step 3: Update CashierDashboard to manage modal state and wire everything**

Replace the entire `src/pages/payment/index.tsx` with:

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CashierKpiCards } from "@/components/cashier/cashier-kpi-cards"
import { CashierQueueTable } from "@/components/cashier/cashier-queue-table"
import { CashierTransactionsTable } from "@/components/cashier/cashier-transactions-table"
import { ViewInvoiceModal } from "@/components/cashier/view-invoice-modal"
import { RefundModal } from "@/components/cashier/refund-modal"
import { ReturnToQueueModal } from "@/components/cashier/return-to-queue-modal"
import {
  mockPaymentRequests,
  mockTransactions,
  mockShift,
  getCashierMetrics,
} from "@/data/mock-cashier"
import type { ModalState } from "@/data/mock-cashier"

function formatVietnameseDate(): string {
  const d = new Date()
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ]
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${days[d.getDay()]}, ${day}/${month}/${year}`
}

export default function CashierDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("queue")
  const [modalState, setModalState] = useState<ModalState>({ type: "closed" })
  const requests = mockPaymentRequests
  const transactions = mockTransactions
  const metrics = getCashierMetrics(transactions)
  const shift = mockShift

  function closeModal() {
    setModalState({ type: "closed" })
  }

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium">Thu ngân</h1>
          <p className="text-[13px] text-muted-foreground">
            {formatVietnameseDate()}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {shift.state === "active" && (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                <span className="size-1.5 rounded-full bg-green-500" />
                {shift.label} · {shift.startTime}–{shift.endTime}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => navigate("/payment/shift-close")}
              >
                Chốt ca
              </Button>
            </>
          )}
          {shift.state === "not_opened" && (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-500" />
                Chưa mở ca
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Mở ca
              </Button>
            </>
          )}
          {shift.state === "closed" && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
              {shift.label} · Đã chốt {shift.closedAt}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <CashierKpiCards metrics={metrics} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            Chờ thanh toán
            {requests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            Giao dịch hôm nay
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {transactions.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="pt-2">
          <CashierQueueTable
            requests={requests}
            onReturnToQueue={(id) =>
              setModalState({ type: "return-to-queue", paymentRequestId: id })
            }
          />
        </TabsContent>

        <TabsContent value="transactions" className="pt-2">
          <CashierTransactionsTable
            transactions={transactions}
            onViewInvoice={(id) =>
              setModalState({ type: "view-invoice", transactionId: id })
            }
            onRefund={(id) =>
              setModalState({ type: "refund", transactionId: id })
            }
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {modalState.type === "view-invoice" && (
        <ViewInvoiceModal
          transactionId={modalState.transactionId}
          open
          onClose={closeModal}
          onRefund={(id) =>
            setModalState({ type: "refund", transactionId: id })
          }
        />
      )}

      {modalState.type === "refund" && (
        <RefundModal
          transactionId={modalState.transactionId}
          open
          onClose={closeModal}
        />
      )}

      {modalState.type === "return-to-queue" && (
        <ReturnToQueueModal
          paymentRequestId={modalState.paymentRequestId}
          open
          onClose={closeModal}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add src/pages/payment/index.tsx src/components/cashier/cashier-transactions-table.tsx src/components/cashier/cashier-queue-table.tsx
git commit -m "feat(cashier): wire dashboard modal state and table action callbacks"
```

---

### Task 12: Add shift-close route to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add import and route**

Add import after `PaymentSuccessPage` import (line 23):
```typescript
import ShiftClosePage from "@/pages/payment/shift-close"
```

Add route after the payment success route (after line 61):
```tsx
                  <Route
                    path="/payment/shift-close"
                    element={<ShiftClosePage />}
                  />
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(cashier): add shift-close route"
```

---

### Task 13: Build verification

**Files:** None (verification only)

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No new errors from our code

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit if any fixes needed**

```bash
git add -A
git commit -m "fix(cashier): QA fixes for cashier actions"
```
