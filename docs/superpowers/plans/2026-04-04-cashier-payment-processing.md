# Cashier Payment Processing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the payment processing page and success/receipt page for the cashier module — fully interactive with live calculations for discounts, multiple payment methods, and cash change.

**Architecture:** A `usePaymentProcessing` hook owns all state and calculations. The processing page is a 2-column layout (left=invoice details, right=payment controls). On confirmation, navigate to a centered success page with a reusable `ReceiptCard`. A `useClinic` hook provides centralized clinic info.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Button, Input, Select, Dialog, Textarea), Tailwind CSS v4, Hugeicons, react-router v7

---

### Task 1: Add payment processing types and mock data

**Files:**
- Modify: `src/data/mock-cashier.ts`

- [ ] **Step 1: Add new type exports after the existing types**

Add these after the `CashierMetrics` interface (around line 63):

```typescript
export interface PaymentPatientInfo {
  name: string
  code: string
  gender: string
  age: number
  phone: string
}

export interface PaymentLineItem {
  id: string
  category: PaymentCategory
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  refId?: string
}

export interface PaymentDiscount {
  type: "percent" | "fixed"
  value: number
  reason: string
  appliedBy: string
  amount: number
}

export interface PaymentMethodEntry {
  id: string
  method: PaymentMethod
  amount: number
  cashReceived?: number
  cashChange?: number
}

export interface CompletedPayment {
  id: string
  paymentRequestId: string
  patient: PaymentPatientInfo
  items: PaymentLineItem[]
  discount: PaymentDiscount | null
  paymentMethods: PaymentMethodEntry[]
  subtotal: number
  discountAmount: number
  total: number
  cashierName: string
  completedAt: string
}
```

- [ ] **Step 2: Add mock patient info and line items data**

Add after the `mockTransactions` array at the end of the file:

```typescript
// ─── Payment Processing Mock Data ───────���───────────────────────────────────

export const mockPaymentPatients: Record<string, PaymentPatientInfo> = {
  "pr-001": {
    name: "Nguyễn Thị Mai",
    code: "BN-20260405-0008",
    gender: "Nữ",
    age: 42,
    phone: "0912345678",
  },
  "pr-002": {
    name: "Trần Văn Hùng",
    code: "BN-20260405-0012",
    gender: "Nam",
    age: 55,
    phone: "0987654321",
  },
  "pr-003": {
    name: "Lê Hoàng Anh",
    code: "BN-20260405-0015",
    gender: "Nam",
    age: 28,
    phone: "0365123456",
  },
  "pr-004": {
    name: "Phạm Minh Châu",
    code: "BN-20260405-0018",
    gender: "Nữ",
    age: 36,
    phone: "0901222333",
  },
  "pr-005": {
    name: "Vũ Đức Thắng",
    code: "BN-20260405-0003",
    gender: "Nam",
    age: 63,
    phone: "0778999111",
  },
}

export const mockPaymentLineItems: Record<string, PaymentLineItem[]> = {
  "pr-001": [
    {
      id: "li-001",
      category: "exam",
      description: "Phí khám chuyên khoa mắt",
      quantity: 1,
      unitPrice: 200_000,
      lineTotal: 200_000,
    },
    {
      id: "li-002",
      category: "exam",
      description: "Đo khúc xạ tự động",
      quantity: 1,
      unitPrice: 50_000,
      lineTotal: 50_000,
    },
    {
      id: "li-003",
      category: "drug",
      description: "Restasis 0.05%",
      quantity: 2,
      unitPrice: 240_000,
      lineTotal: 480_000,
    },
    {
      id: "li-004",
      category: "drug",
      description: "Systane Ultra UD",
      quantity: 1,
      unitPrice: 125_000,
      lineTotal: 125_000,
    },
  ],
  "pr-002": [
    {
      id: "li-005",
      category: "optical",
      description: "Gọng Essilor Stylance X",
      quantity: 1,
      unitPrice: 850_000,
      lineTotal: 850_000,
    },
    {
      id: "li-006",
      category: "optical",
      description: "Tròng Hoya 1.67 BlueControl",
      quantity: 1,
      unitPrice: 1_200_000,
      lineTotal: 1_200_000,
    },
    {
      id: "li-007",
      category: "optical",
      description: "Phí cắt lắp tròng",
      quantity: 1,
      unitPrice: 150_000,
      lineTotal: 150_000,
    },
  ],
  "pr-003": [
    {
      id: "li-008",
      category: "exam",
      description: "Ph�� khám chuyên khoa mắt",
      quantity: 1,
      unitPrice: 200_000,
      lineTotal: 200_000,
    },
    {
      id: "li-009",
      category: "drug",
      description: "Tobradex nhỏ mắt",
      quantity: 1,
      unitPrice: 180_000,
      lineTotal: 180_000,
    },
    {
      id: "li-010",
      category: "drug",
      description: "Refresh Tears",
      quantity: 1,
      unitPrice: 100_000,
      lineTotal: 100_000,
    },
  ],
  "pr-004": [
    {
      id: "li-011",
      category: "treatment",
      description: "Gói IPL 6 buổi (Đợt 1 – 50%)",
      quantity: 1,
      unitPrice: 2_400_000,
      lineTotal: 2_400_000,
    },
  ],
  "pr-005": [
    {
      id: "li-012",
      category: "drug",
      description: "Systane Ultra UD",
      quantity: 1,
      unitPrice: 125_000,
      lineTotal: 125_000,
    },
    {
      id: "li-013",
      category: "drug",
      description: "Vitamin A 25000IU",
      quantity: 30,
      unitPrice: 2_000,
      lineTotal: 60_000,
    },
  ],
}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-cashier.ts
git commit -m "feat(cashier): add payment processing types and mock line items data"
```

---

### Task 2: Create useClinic hook

**Files:**
- Create: `src/hooks/use-clinic.ts`

- [ ] **Step 1: Create the hook**

```typescript
export interface ClinicInfo {
  name: string
  address: string
  hotline: string
  website: string
}

const CLINIC_INFO: ClinicInfo = {
  name: "Phòng khám m��t Ganka28",
  address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
  hotline: "028 1234 5678",
  website: "ganka28.vn",
}

export function useClinic(): ClinicInfo {
  return CLINIC_INFO
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-clinic.ts
git commit -m "feat: add useClinic hook for centralized clinic info"
```

---

### Task 3: Create usePaymentProcessing hook

**Files:**
- Create: `src/hooks/use-payment-processing.ts`

- [ ] **Step 1: Create the hook**

```typescript
import { useState, useMemo, useCallback } from "react"
import type {
  PaymentPatientInfo,
  PaymentLineItem,
  PaymentDiscount,
  PaymentMethodEntry,
  CompletedPayment,
  PaymentMethod,
} from "@/data/mock-cashier"
import {
  mockPaymentPatients,
  mockPaymentLineItems,
} from "@/data/mock-cashier"

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function generateTransactionId(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
  return `GD-${yyyy}${mm}${dd}-${seq}`
}

function calcDiscountAmount(
  subtotal: number,
  type: "percent" | "fixed",
  value: number
): number {
  if (type === "percent") {
    return Math.floor((subtotal * value) / 100 / 1000) * 1000
  }
  return Math.min(value, subtotal)
}

export function usePaymentProcessing(paymentRequestId: string) {
  const patient: PaymentPatientInfo = mockPaymentPatients[paymentRequestId] ?? {
    name: "Không tìm thấy",
    code: "",
    gender: "",
    age: 0,
    phone: "",
  }

  const items: PaymentLineItem[] =
    mockPaymentLineItems[paymentRequestId] ?? []

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotal, 0),
    [items]
  )

  const [discount, setDiscount] = useState<PaymentDiscount | null>(null)

  const discountAmount = discount?.amount ?? 0
  const total = subtotal - discountAmount

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodEntry[]>(
    () => [
      {
        id: generateId(),
        method: "cash" as PaymentMethod,
        amount: subtotal,
      },
    ]
  )

  // Recalculate default method amount when total changes
  // This is handled by the page — when discount changes, the single method's amount updates

  const methodsTotal = useMemo(
    () => paymentMethods.reduce((sum, m) => sum + m.amount, 0),
    [paymentMethods]
  )

  const amountMismatch = methodsTotal !== total

  const canConfirm = useMemo(() => {
    if (paymentMethods.length === 0) return false
    if (amountMismatch) return false
    for (const m of paymentMethods) {
      if (m.method === "cash") {
        if (m.cashReceived === undefined || m.cashReceived < m.amount) {
          return false
        }
      }
    }
    return true
  }, [paymentMethods, amountMismatch])

  const isDirty = useMemo(() => {
    return discount !== null || paymentMethods.length > 1
  }, [discount, paymentMethods])

  const addDiscount = useCallback(
    (type: "percent" | "fixed", value: number, reason: string) => {
      const amount = calcDiscountAmount(subtotal, type, value)
      setDiscount({ type, value, reason, appliedBy: "Thu ngân Linh", amount })
      // Update single payment method if only one exists
      setPaymentMethods((prev) => {
        if (prev.length === 1) {
          return [{ ...prev[0], amount: subtotal - amount }]
        }
        return prev
      })
    },
    [subtotal]
  )

  const removeDiscount = useCallback(() => {
    setDiscount(null)
    setPaymentMethods((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], amount: subtotal }]
      }
      return prev
    })
  }, [subtotal])

  const addPaymentMethod = useCallback(() => {
    setPaymentMethods((prev) => {
      if (prev.length >= 3) return prev
      const usedAmount = prev.reduce((sum, m) => sum + m.amount, 0)
      const remaining = Math.max(0, total - usedAmount)
      return [
        ...prev,
        {
          id: generateId(),
          method: "transfer" as PaymentMethod,
          amount: remaining,
        },
      ]
    })
  }, [total])

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const updatePaymentMethod = useCallback(
    (id: string, updates: { method?: PaymentMethod; amount?: number }) => {
      setPaymentMethods((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m
          const updated = { ...m, ...updates }
          // Clear cash fields if switching away from cash
          if (updates.method && updates.method !== "cash") {
            delete updated.cashReceived
            delete updated.cashChange
          }
          return updated
        })
      )
    },
    []
  )

  const updateCashReceived = useCallback((id: string, cashReceived: number) => {
    setPaymentMethods((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        return {
          ...m,
          cashReceived,
          cashChange: cashReceived - m.amount,
        }
      })
    )
  }, [])

  const confirmPayment = useCallback((): CompletedPayment => {
    return {
      id: generateTransactionId(),
      paymentRequestId,
      patient,
      items,
      discount,
      paymentMethods,
      subtotal,
      discountAmount,
      total,
      cashierName: "Thu ngân Linh",
      completedAt: new Date().toISOString(),
    }
  }, [
    paymentRequestId,
    patient,
    items,
    discount,
    paymentMethods,
    subtotal,
    discountAmount,
    total,
  ])

  return {
    patient,
    items,
    subtotal,
    discount,
    discountAmount,
    total,
    paymentMethods,
    methodsTotal,
    amountMismatch,
    canConfirm,
    isDirty,
    addDiscount,
    removeDiscount,
    addPaymentMethod,
    removePaymentMethod,
    updatePaymentMethod,
    updateCashReceived,
    confirmPayment,
  }
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-payment-processing.ts
git commit -m "feat(cashier): add usePaymentProcessing hook with calculations and state"
```

---

### Task 4: Create PatientInfoBar component

**Files:**
- Create: `src/components/cashier/patient-info-bar.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { PaymentPatientInfo } from "@/data/mock-cashier"
import { formatPhone } from "@/data/mock-cashier"

interface PatientInfoBarProps {
  patient: PaymentPatientInfo
}

export function PatientInfoBar({ patient }: PatientInfoBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-[18px] py-[14px]">
      <div>
        <div className="text-[15px] font-medium">{patient.name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {patient.code} · {patient.gender} · {patient.age} tuổi
        </div>
      </div>
      <div className="text-[13px] text-muted-foreground">
        {formatPhone(patient.phone)}
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
git add src/components/cashier/patient-info-bar.tsx
git commit -m "feat(cashier): add PatientInfoBar component"
```

---

### Task 5: Create PaymentLineItems component

**Files:**
- Create: `src/components/cashier/payment-line-items.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useMemo } from "react"
import type { PaymentLineItem, PaymentCategory } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"
import { CategoryBadge } from "@/components/cashier/category-badge"

interface PaymentLineItemsProps {
  items: PaymentLineItem[]
}

const CATEGORY_ORDER: PaymentCategory[] = [
  "exam",
  "drug",
  "optical",
  "treatment",
]

export function PaymentLineItems({ items }: PaymentLineItemsProps) {
  const groups = useMemo(() => {
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
      subtotal: map.get(cat)!.reduce((sum, i) => sum + i.lineTotal, 0),
    }))
  }, [items])

  const CATEGORY_LABELS: Record<PaymentCategory, string> = {
    exam: "Khám",
    drug: "Thuốc",
    optical: "Kính",
    treatment: "Liệu trình",
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className="px-[18px] pb-2 pt-3">
            <CategoryBadge category={group.category} />
          </div>
          {group.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-[18px] py-2 text-sm"
            >
              <span>
                {item.description}
                {item.quantity > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    x{item.quantity}
                  </span>
                )}
              </span>
              <span className="font-medium">{formatVND(item.lineTotal)}</span>
            </div>
          ))}
          <div className="mx-[18px] flex justify-between border-t border-dashed border-border pb-3 pt-2 text-xs text-muted-foreground">
            <span>Tổng phụ {CATEGORY_LABELS[group.category]}</span>
            <span>{formatVND(group.subtotal)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/payment-line-items.tsx
git commit -m "feat(cashier): add PaymentLineItems grouped by category"
```

---

### Task 6: Create PaymentDiscount component

**Files:**
- Create: `src/components/cashier/payment-discount.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentDiscount as PaymentDiscountType } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface PaymentDiscountProps {
  discount: PaymentDiscountType | null
  subtotal: number
  onAdd: (type: "percent" | "fixed", value: number, reason: string) => void
  onRemove: () => void
}

export function PaymentDiscount({
  discount,
  subtotal,
  onAdd,
  onRemove,
}: PaymentDiscountProps) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<"percent" | "fixed">("percent")
  const [value, setValue] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  function handleApply() {
    const numValue = Number(value)
    if (!value || numValue <= 0) {
      setError("Vui lòng nhập giá trị hợp lệ")
      return
    }
    if (type === "percent" && (numValue < 1 || numValue > 100)) {
      setError("Phần trăm phải từ 1 đến 100")
      return
    }
    if (type === "fixed" && numValue > subtotal) {
      setError("Giá trị giảm không được vượt quá tổng tạm tính")
      return
    }
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do giảm giá")
      return
    }
    setError("")
    onAdd(type, numValue, reason.trim())
    setShowForm(false)
    setValue("")
    setReason("")
  }

  function handleCancel() {
    setShowForm(false)
    setValue("")
    setReason("")
    setError("")
  }

  if (discount) {
    return (
      <div className="border-t border-border px-[18px] py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px]">
              {discount.type === "percent"
                ? `Giảm ${discount.value}% — ${discount.reason}`
                : `Giảm ${formatVND(discount.value)} — ${discount.reason}`}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/70">
              Áp dụng bởi: {discount.appliedBy}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-[#A32D2D]">
              -{formatVND(discount.amount)}
            </span>
            <button
              onClick={onRemove}
              className="ml-3 text-xs text-muted-foreground hover:text-[#A32D2D]"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border px-[18px] py-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-[13px] font-medium text-[#0F6E56] hover:underline"
        >
          + Thêm giảm giá
        </button>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2">
            <Select
              value={type}
              onValueChange={(v) => setType(v as "percent" | "fixed")}
            >
              <SelectTrigger className="w-24" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="fixed">VNĐ</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "Số %" : "Số tiền"}
              className="h-8 w-28 text-[13px]"
            />
          </div>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do giảm giá"
            className="h-8 text-[13px]"
          />
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-[#0F6E56] text-xs hover:bg-[#0d5f4a]"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/payment-discount.tsx
git commit -m "feat(cashier): add PaymentDiscount with form and validation"
```

---

### Task 7: Create PaymentSummary component

**Files:**
- Create: `src/components/cashier/payment-summary.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { formatVND } from "@/data/mock-cashier"

interface PaymentSummaryProps {
  subtotal: number
  discountAmount: number
  discountPercent?: number
  total: number
  itemCount: number
}

export function PaymentSummary({
  subtotal,
  discountAmount,
  discountPercent,
  total,
  itemCount,
}: PaymentSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 px-5 py-[18px]">
      <div className="flex items-center justify-between py-1.5 text-sm text-muted-foreground">
        <span>Tạm tính ({itemCount} items)</span>
        <span>{formatVND(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex items-center justify-between py-1.5 text-sm text-[#A32D2D]">
          <span>
            Giảm giá{discountPercent ? ` ${discountPercent}%` : ""}
          </span>
          <span>-{formatVND(discountAmount)}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t-2 border-foreground pt-3 text-[22px] font-medium">
        <span>Thành tiền</span>
        <span>{formatVND(total)}</span>
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
git add src/components/cashier/payment-summary.tsx
git commit -m "feat(cashier): add PaymentSummary card component"
```

---

### Task 8: Create PaymentMethodCard component

**Files:**
- Create: `src/components/cashier/payment-method-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentMethod, PaymentMethodEntry } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "qr_vnpay", label: "QR VNPay" },
  { value: "qr_momo", label: "QR MoMo" },
  { value: "qr_zalopay", label: "QR ZaloPay" },
  { value: "card_visa", label: "Thẻ Visa" },
  { value: "card_mastercard", label: "Thẻ Mastercard" },
]

interface PaymentMethodCardProps {
  entry: PaymentMethodEntry
  showRemove: boolean
  onUpdate: (updates: { method?: PaymentMethod; amount?: number }) => void
  onUpdateCashReceived: (amount: number) => void
  onRemove: () => void
}

export function PaymentMethodCard({
  entry,
  showRemove,
  onUpdate,
  onUpdateCashReceived,
  onRemove,
}: PaymentMethodCardProps) {
  const [amountText, setAmountText] = useState(formatVND(entry.amount))
  const [amountFocused, setAmountFocused] = useState(false)
  const [cashText, setCashText] = useState(
    entry.cashReceived !== undefined ? formatVND(entry.cashReceived) : ""
  )
  const [cashFocused, setCashFocused] = useState(false)

  const isCash = entry.method === "cash"
  const cashInsufficient =
    isCash &&
    entry.cashReceived !== undefined &&
    entry.cashReceived < entry.amount

  function handleAmountFocus() {
    setAmountFocused(true)
    setAmountText(entry.amount > 0 ? String(entry.amount) : "")
  }

  function handleAmountBlur() {
    setAmountFocused(false)
    const num = parseInt(amountText.replace(/\D/g, ""), 10) || 0
    onUpdate({ amount: num })
    setAmountText(formatVND(num))
  }

  function handleAmountChange(val: string) {
    setAmountText(val.replace(/[^\d]/g, ""))
  }

  function handleCashFocus() {
    setCashFocused(true)
    setCashText(
      entry.cashReceived !== undefined && entry.cashReceived > 0
        ? String(entry.cashReceived)
        : ""
    )
  }

  function handleCashBlur() {
    setCashFocused(false)
    const num = parseInt(cashText.replace(/\D/g, ""), 10) || 0
    onUpdateCashReceived(num)
    setCashText(formatVND(num))
  }

  function handleCashChange(val: string) {
    setCashText(val.replace(/[^\d]/g, ""))
  }

  // Sync amountText when entry.amount changes externally and not focused
  if (!amountFocused && formatVND(entry.amount) !== amountText) {
    setAmountText(formatVND(entry.amount))
  }

  return (
    <div className="rounded-[10px] border border-border bg-background p-[14px]">
      <div className="flex items-center gap-2">
        <Select
          value={entry.method}
          onValueChange={(v) => onUpdate({ method: v as PaymentMethod })}
        >
          <SelectTrigger className="flex-1" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={amountFocused ? amountText : formatVND(entry.amount)}
          onFocus={handleAmountFocus}
          onBlur={handleAmountBlur}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="h-8 w-[130px] text-right text-[13px]"
        />
        {showRemove && (
          <button
            onClick={onRemove}
            className="flex size-7 items-center justify-center rounded-md border border-border text-sm text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-[#A32D2D]"
          >
            ✕
          </button>
        )}
      </div>
      {isCash && (
        <div className="mt-3 flex flex-col gap-2 border-t border-dashed border-border pt-3">
          <div className="flex items-center justify-between text-[13px]">
            <label className="text-muted-foreground">Tiền nhận</label>
            <Input
              value={cashFocused ? cashText : (entry.cashReceived !== undefined ? formatVND(entry.cashReceived) : "")}
              onFocus={handleCashFocus}
              onBlur={handleCashBlur}
              onChange={(e) => handleCashChange(e.target.value)}
              placeholder="Nhập số tiền"
              className={`h-8 w-[130px] text-right text-[13px] ${cashInsufficient ? "border-destructive" : ""}`}
            />
          </div>
          {entry.cashReceived !== undefined && entry.cashReceived > 0 && (
            <div className="flex items-center justify-between text-[13px]">
              <label className="text-muted-foreground">Tiền thừa</label>
              <span className="text-base font-medium text-[#0F6E56]">
                {formatVND(Math.max(0, entry.cashChange ?? 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/payment-method-card.tsx
git commit -m "feat(cashier): add PaymentMethodCard with cash detail and VND formatting"
```

---

### Task 9: Create PaymentMethodsSection component

**Files:**
- Create: `src/components/cashier/payment-methods-section.tsx`

- [ ] **Step 1: Create the component**

```tsx
import type { PaymentMethod, PaymentMethodEntry } from "@/data/mock-cashier"
import { PaymentMethodCard } from "@/components/cashier/payment-method-card"

interface PaymentMethodsSectionProps {
  methods: PaymentMethodEntry[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: { method?: PaymentMethod; amount?: number }) => void
  onUpdateCash: (id: string, cashReceived: number) => void
  canAddMore: boolean
  amountMismatch: boolean
  total: number
  methodsTotal: number
}

export function PaymentMethodsSection({
  methods,
  onAdd,
  onRemove,
  onUpdate,
  onUpdateCash,
  canAddMore,
  amountMismatch,
  total,
  methodsTotal,
}: PaymentMethodsSectionProps) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 text-[13px] font-medium text-muted-foreground">
        Phương thức thanh toán
      </div>
      <div className="flex flex-col gap-2.5">
        {methods.map((entry) => (
          <PaymentMethodCard
            key={entry.id}
            entry={entry}
            showRemove={methods.length > 1}
            onUpdate={(updates) => onUpdate(entry.id, updates)}
            onUpdateCashReceived={(amount) => onUpdateCash(entry.id, amount)}
            onRemove={() => onRemove(entry.id)}
          />
        ))}
      </div>
      {canAddMore && (
        <button
          onClick={onAdd}
          className="mt-2 text-[13px] font-medium text-[#0F6E56] hover:underline"
        >
          + Thêm phương thức thanh toán
        </button>
      )}
      {amountMismatch && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tổng các phương thức ({new Intl.NumberFormat("vi-VN").format(methodsTotal)}đ) chưa khớp với thành tiền ({new Intl.NumberFormat("vi-VN").format(total)}đ)
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/payment-methods-section.tsx
git commit -m "feat(cashier): add PaymentMethodsSection with mismatch warning"
```

---

### Task 10: Create PaymentActions component

**Files:**
- Create: `src/components/cashier/payment-actions.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { Button } from "@/components/ui/button"

interface PaymentActionsProps {
  canConfirm: boolean
  onCancel: () => void
  onPrintPreview: () => void
  onConfirm: () => void
}

export function PaymentActions({
  canConfirm,
  onCancel,
  onPrintPreview,
  onConfirm,
}: PaymentActionsProps) {
  return (
    <div className="flex gap-2.5 border-t border-border pt-4">
      <Button variant="outline" className="flex-1" onClick={onCancel}>
        Hủy
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        onClick={onPrintPreview}
      >
        In tạm
      </Button>
      <Button
        className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        Xác nhận thanh toán
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/payment-actions.tsx
git commit -m "feat(cashier): add PaymentActions with confirm/cancel/print buttons"
```

---

### Task 11: Create ReceiptCard component

**Files:**
- Create: `src/components/cashier/receipt-card.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useMemo } from "react"
import type {
  CompletedPayment,
  PaymentCategory,
  PaymentLineItem,
} from "@/data/mock-cashier"
import { formatVND, formatPhone, getPaymentMethodLabel } from "@/data/mock-cashier"
import { useClinic } from "@/hooks/use-clinic"

interface ReceiptCardProps {
  payment: CompletedPayment
}

const CATEGORY_ORDER: PaymentCategory[] = [
  "exam",
  "drug",
  "optical",
  "treatment",
]

const CATEGORY_LABELS: Record<PaymentCategory, string> = {
  exam: "KHÁM",
  drug: "THUỐC",
  optical: "KÍNH",
  treatment: "LIỆU TRÌNH",
}

function formatReceiptDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function ReceiptCard({ payment }: ReceiptCardProps) {
  const clinic = useClinic()

  const groups = useMemo(() => {
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of payment.items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
    }))
  }, [payment.items])

  const hasMultipleMethods = payment.paymentMethods.length > 1
  const methodLabel = hasMultipleMethods
    ? payment.paymentMethods
        .map((m) => getPaymentMethodLabel(m.method))
        .join(" + ")
    : getPaymentMethodLabel(payment.paymentMethods[0].method)

  return (
    <div className="w-full rounded-xl border border-border bg-background p-6">
      {/* Clinic header */}
      <div className="mb-5 border-b border-dashed border-border pb-4 text-center">
        <div className="text-[15px] font-medium">{clinic.name}</div>
        <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {clinic.address}
          <br />
          Hotline: {clinic.hotline}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          #{payment.id} · {formatReceiptDate(payment.completedAt)}
        </div>
      </div>

      {/* Patient info */}
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-dashed border-border pb-4 text-[13px]">
        <span className="text-muted-foreground">Bệnh nhân</span>
        <span className="text-right">{payment.patient.name}</span>
        <span className="text-muted-foreground">Mã BN</span>
        <span className="text-right">{payment.patient.code}</span>
        <span className="text-muted-foreground">SĐT</span>
        <span className="text-right">
          {formatPhone(payment.patient.phone)}
        </span>
        <span className="text-muted-foreground">Thu ngân</span>
        <span className="text-right">{payment.cashierName}</span>
      </div>

      {/* Line items grouped */}
      {groups.map((group) => (
        <div key={group.category} className="mb-3">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
      <div className="mt-4 border-t border-dashed border-border pt-3">
        <div className="flex justify-between py-1 text-[13px] text-muted-foreground">
          <span>T���m tính</span>
          <span>{formatVND(payment.subtotal)}</span>
        </div>
        {payment.discountAmount > 0 && (
          <div className="flex justify-between py-1 text-[13px] text-[#A32D2D]">
            <span>
              Giảm giá
              {payment.discount?.type === "percent"
                ? ` ${payment.discount.value}%`
                : ""}
            </span>
            <span>-{formatVND(payment.discountAmount)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-foreground pt-2.5 text-[17px] font-medium">
          <span>Thành tiền</span>
          <span>{formatVND(payment.total)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-3 border-t border-dashed border-border pt-3">
        <div className="flex justify-between py-1 text-[13px]">
          <span className="text-muted-foreground">Phương thức</span>
          <span>{methodLabel}</span>
        </div>
        {payment.paymentMethods.map((pm) => (
          <div key={pm.id}>
            {hasMultipleMethods && (
              <div className="flex justify-between py-1 text-[13px]">
                <span className="text-muted-foreground">
                  {getPaymentMethodLabel(pm.method)}
                </span>
                <span>{formatVND(pm.amount)}</span>
              </div>
            )}
            {pm.method === "cash" && pm.cashReceived !== undefined && (
              <>
                <div className="flex justify-between py-1 text-[13px]">
                  <span className="text-muted-foreground">Tiền nhận</span>
                  <span>{formatVND(pm.cashReceived)}</span>
                </div>
                <div className="flex justify-between py-1 text-[13px]">
                  <span className="text-muted-foreground">Tiền thừa</span>
                  <span className="font-medium text-[#0F6E56]">
                    {formatVND(pm.cashChange ?? 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-dashed border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Cảm ơn quý khách đã sử dụng dịch vụ tại Ganka28
        <br />
        Hotline: {clinic.hotline} · {clinic.website}
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
git add src/components/cashier/receipt-card.tsx
git commit -m "feat(cashier): add ReceiptCard component with useClinic integration"
```

---

### Task 12: Create Payment Processing page

**Files:**
- Create: `src/pages/payment/process.tsx`

- [ ] **Step 1: Create the page component**

```tsx
import { useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { usePaymentProcessing } from "@/hooks/use-payment-processing"
import { PatientInfoBar } from "@/components/cashier/patient-info-bar"
import { PaymentLineItems } from "@/components/cashier/payment-line-items"
import { PaymentDiscount } from "@/components/cashier/payment-discount"
import { PaymentSummary } from "@/components/cashier/payment-summary"
import { PaymentMethodsSection } from "@/components/cashier/payment-methods-section"
import { PaymentActions } from "@/components/cashier/payment-actions"

export default function PaymentProcessingPage() {
  const { paymentRequestId } = useParams<{ paymentRequestId: string }>()
  const navigate = useNavigate()
  const [showCancelDialog, setShowCancelDialog] = useState(false)

  const {
    patient,
    items,
    subtotal,
    discount,
    discountAmount,
    total,
    paymentMethods,
    methodsTotal,
    amountMismatch,
    canConfirm,
    isDirty,
    addDiscount,
    removeDiscount,
    addPaymentMethod,
    removePaymentMethod,
    updatePaymentMethod,
    updateCashReceived,
    confirmPayment,
  } = usePaymentProcessing(paymentRequestId ?? "")

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  function handleBack() {
    if (isDirty) {
      setShowCancelDialog(true)
    } else {
      navigate("/payment")
    }
  }

  function handleConfirmCancel() {
    setShowCancelDialog(false)
    navigate("/payment")
  }

  function handleConfirmPayment() {
    const completed = confirmPayment()
    navigate(`/payment/${completed.id}/success`, { state: { payment: completed } })
  }

  function handlePrintPreview() {
    window.print()
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="mr-1.5 size-4"
            strokeWidth={1.5}
          />
          Quay lại
        </Button>
        <h1 className="text-xl font-medium">Xử lý thanh toán</h1>
        <span className="text-[13px] text-muted-foreground">
          Hóa đơn mới · Hôm nay {timeStr}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex max-w-[1280px] gap-6 p-6">
        {/* Left column (60%) */}
        <div className="min-w-0 flex-[6]">
          <div className="rounded-xl border border-border bg-background">
            <div className="p-[18px]">
              <PatientInfoBar patient={patient} />
            </div>
            <PaymentLineItems items={items} />
            <PaymentDiscount
              discount={discount}
              subtotal={subtotal}
              onAdd={addDiscount}
              onRemove={removeDiscount}
            />
          </div>
        </div>

        {/* Right column (40%, sticky) */}
        <div className="min-w-[320px] flex-[4] self-start sticky top-6">
          <PaymentSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            discountPercent={
              discount?.type === "percent" ? discount.value : undefined
            }
            total={total}
            itemCount={items.length}
          />

          <div className="mt-5">
            <PaymentMethodsSection
              methods={paymentMethods}
              onAdd={addPaymentMethod}
              onRemove={removePaymentMethod}
              onUpdate={updatePaymentMethod}
              onUpdateCash={updateCashReceived}
              canAddMore={paymentMethods.length < 3}
              amountMismatch={amountMismatch}
              total={total}
              methodsTotal={methodsTotal}
            />
          </div>

          {/* System note */}
          <div className="mb-5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            Thu ngân xác nhận thủ công khi BN đã quét QR hoặc cà thẻ thành
            công bên ngoài hệ thống.
          </div>

          <PaymentActions
            canConfirm={canConfirm}
            onCancel={handleBack}
            onPrintPreview={handlePrintPreview}
            onConfirm={handleConfirmPayment}
          />
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hủy thanh toán?</DialogTitle>
            <DialogDescription>
              Dữ liệu thanh toán chưa được lưu. Bạn có chắc muốn quay lại?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Tiếp tục thanh toán
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Hủy thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/payment/process.tsx
git commit -m "feat(cashier): add payment processing page with full interactive layout"
```

---

### Task 13: Create Payment Success page

**Files:**
- Create: `src/pages/payment/success.tsx`

- [ ] **Step 1: Create the page component**

```tsx
import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import type { CompletedPayment } from "@/data/mock-cashier"
import { ReceiptCard } from "@/components/cashier/receipt-card"

export default function PaymentSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const payment = (location.state as { payment?: CompletedPayment })?.payment

  // Auto-print on mount
  useEffect(() => {
    if (payment) {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [payment])

  if (!payment) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Không tìm thấy thông tin thanh toán
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/payment")}
          >
            Về dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-10">
      <div className="mx-auto flex max-w-[520px] flex-col items-center px-5">
        {/* Success icon */}
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#E1F5EE]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F6E56"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="mb-1.5 text-xl font-medium">Thanh toán thành công</h1>
        <p className="mb-7 text-[13px] text-muted-foreground">
          Giao dịch #{payment.id} đã được ghi nhận
        </p>

        <ReceiptCard payment={payment} />

        {/* Action buttons */}
        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.print()}
          >
            In biên lai
          </Button>
          <Button
            className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
            onClick={() => navigate("/payment")}
          >
            Về dashboard
          </Button>
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
git add src/pages/payment/success.tsx
git commit -m "feat(cashier): add payment success page with receipt and auto-print"
```

---

### Task 14: Add routes and wire up queue table navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/cashier/cashier-queue-table.tsx`

- [ ] **Step 1: Add route imports and routes to App.tsx**

Add imports after the existing `CashierDashboard` import (line 22):

```typescript
import PaymentProcessingPage from "@/pages/payment/process"
import PaymentSuccessPage from "@/pages/payment/success"
```

Add two new routes after the `/payment` route (line 52), inside the `<Routes>`:

```tsx
                  <Route
                    path="/payment/process/:paymentRequestId"
                    element={<PaymentProcessingPage />}
                  />
                  <Route
                    path="/payment/:paymentId/success"
                    element={<PaymentSuccessPage />}
                  />
```

- [ ] **Step 2: Wire "Thanh toán" action in queue table**

In `src/components/cashier/cashier-queue-table.tsx`, add `useNavigate` import. Change line 1:

```typescript
import { useEffect, useState } from "react"
```

to:

```typescript
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
```

Inside the `CashierQueueTable` component function body, add at the top:

```typescript
  const navigate = useNavigate()
```

Replace the "Thanh toán" `DropdownMenuItem` (around lines 129-135):

```tsx
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Payment02Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Thanh toán
                    </DropdownMenuItem>
```

with:

```tsx
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/payment/process/${req.id}`)
                      }
                    >
                      <HugeiconsIcon
                        icon={Payment02Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Thanh toán
                    </DropdownMenuItem>
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 4: Verify dev server runs**

Run: `npm run dev`
Expected: Dev server starts without errors on port 3000

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/components/cashier/cashier-queue-table.tsx
git commit -m "feat(cashier): add payment routes and wire queue table navigation"
```

---

### Task 15: Visual QA and final verification

**Files:** None (verification only)

- [ ] **Step 1: Run full typecheck**

Run: `npm run typecheck`
Expected: No errors

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Expected: No errors (or only pre-existing warnings)

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Manual smoke test**

Open `http://localhost:3000/payment` in browser. Verify:

1. Dashboard loads with queue table
2. Click three-dot menu on any patient → "Thanh toán" → navigates to `/payment/process/{id}`
3. Payment processing page shows:
   - Patient info bar with correct data
   - Line items grouped by category with badges and subtotals
   - Payment summary card with correct total
   - Cash payment method pre-selected with amount = total
4. Add discount (10%, reason "Test") → discount line appears, total updates, method amount updates
5. Remove discount → reverts
6. Enter cash received > amount → shows green change amount
7. Enter cash received < amount → shows red border, confirm disabled
8. Add second payment method → appears, amount warning if mismatch
9. Remove second method → warning clears
10. Click "Hủy" after changing discount → confirm dialog appears
11. Click "Xác nhận thanh toán" → navigates to success page
12. Success page shows receipt card with all data
13. "Về dashboard" → back to `/payment`

- [ ] **Step 5: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(cashier): visual QA fixes for payment processing flow"
```
