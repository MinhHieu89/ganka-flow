# Pharmacist OTC Sales Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the OTC (over-the-counter) sales tab for the pharmacist dashboard — a POS-style 2-column layout with customer selection, product search, order management, checkout flow, invoice/label printing, and today's sales history.

**Architecture:** Local state within the OTC tab — no context provider needed since this is a mock/frontend-only implementation. The main `OtcPos` component orchestrates view switching (POS vs history) and owns all order state. Child components receive data and callbacks via props. Modals are triggered from the order panel and history view.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Dialog, Button, Input, Select, DropdownMenu, Badge), Hugeicons

---

### Task 1: Create OTC mock data

**Files:**
- Create: `src/data/mock-otc.ts`

- [ ] **Step 1: Create the mock data file with types, product catalog, customers, and sample orders**

```tsx
import { todayTimestamp } from "@/lib/demo-date"

// ─── Types ───────────────────────────────────────────────────────────────────

export type OtcPaymentMethod = "cash" | "transfer" | "qr" | "card"

export interface OtcProduct {
  id: string
  name: string
  manufacturer: string
  formFactor: string
  unit: string
  price: number
  stockQuantity: number
  usage: string
}

export interface OtcCustomer {
  id: string
  name: string
  phone: string
  birthDate?: string
  gender?: "male" | "female"
}

export interface OtcOrderItem {
  product: OtcProduct
  quantity: number
}

export interface OtcOrder {
  id: string
  customer: OtcCustomer
  items: OtcOrderItem[]
  paymentMethod: OtcPaymentMethod
  totalAmount: number
  soldBy: string
  soldAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ"
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  return phone.slice(0, 4) + ".xxx.xxx"
}

export function generateOtcOrderId(orderNumber: number): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  const d = String(now.getDate()).padStart(2, "0")
  return `OTC-${y}${m}${d}-${String(orderNumber).padStart(4, "0")}`
}

export function getOtcMetrics(orders: OtcOrder[]) {
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const totalProducts = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  )
  return { totalOrders, totalRevenue, totalProducts }
}

// ─── Product Catalog ─────────────────────────────────────────────────────────

export const otcProducts: OtcProduct[] = [
  {
    id: "OTC-P01",
    name: "Refresh Tears",
    manufacturer: "Allergan",
    formFactor: "Lọ 15ml",
    unit: "lọ",
    price: 85000,
    stockQuantity: 24,
    usage: "Nhỏ 1-2 giọt mỗi mắt, 3-4 lần/ngày khi khô mắt",
  },
  {
    id: "OTC-P02",
    name: "Systane Ultra",
    manufacturer: "Alcon",
    formFactor: "Lọ 10ml",
    unit: "lọ",
    price: 120000,
    stockQuantity: 18,
    usage: "Nhỏ 1-2 giọt mỗi mắt khi cần, tối đa 4 lần/ngày",
  },
  {
    id: "OTC-P03",
    name: "Optive Fusion",
    manufacturer: "Allergan",
    formFactor: "Lọ 10ml",
    unit: "lọ",
    price: 95000,
    stockQuantity: 12,
    usage: "Nhỏ 1-2 giọt mỗi mắt, 3 lần/ngày",
  },
  {
    id: "OTC-P04",
    name: "Omega-3 Eye Formula",
    manufacturer: "Nordic Naturals",
    formFactor: "Hộp 60 viên",
    unit: "hộp",
    price: 185000,
    stockQuantity: 15,
    usage: "Uống 2 viên/ngày sau ăn",
  },
  {
    id: "OTC-P05",
    name: "Lutein Plus",
    manufacturer: "Bausch + Lomb",
    formFactor: "Hộp 30 viên",
    unit: "hộp",
    price: 250000,
    stockQuantity: 8,
    usage: "Uống 1 viên/ngày sau ăn",
  },
  {
    id: "OTC-P06",
    name: "Visine Original",
    manufacturer: "Johnson & Johnson",
    formFactor: "Lọ 15ml",
    unit: "lọ",
    price: 65000,
    stockQuantity: 30,
    usage: "Nhỏ 1-2 giọt mỗi mắt khi đỏ mắt, tối đa 4 lần/ngày",
  },
  {
    id: "OTC-P07",
    name: "Rohto Cool",
    manufacturer: "Rohto",
    formFactor: "Lọ 12ml",
    unit: "lọ",
    price: 55000,
    stockQuantity: 0,
    usage: "Nhỏ 1-2 giọt mỗi mắt khi mỏi mắt, 3-4 lần/ngày",
  },
  {
    id: "OTC-P08",
    name: "Băng chườm ấm mắt",
    manufacturer: "Ganka28",
    formFactor: "Hộp 10 miếng",
    unit: "hộp",
    price: 150000,
    stockQuantity: 10,
    usage: "Đắp lên mắt nhắm 10-15 phút, 1-2 lần/ngày",
  },
  {
    id: "OTC-P09",
    name: "Khăn lau mi mắt",
    manufacturer: "Blephaclean",
    formFactor: "Hộp 20 miếng",
    unit: "hộp",
    price: 120000,
    stockQuantity: 6,
    usage: "Nhẹ nhàng lau dọc bờ mi, sáng và tối",
  },
]

// ─── Customers ───────────────────────────────────────────────────────────────

export const otcCustomers: OtcCustomer[] = [
  { id: "KH-001", name: "Nguyễn Thị Lan", phone: "0987654321" },
  {
    id: "KH-002",
    name: "Trần Văn Hùng",
    phone: "0912345678",
    birthDate: "1985-03-15",
    gender: "male",
  },
  {
    id: "KH-003",
    name: "Lê Thị Hương",
    phone: "0909876543",
    gender: "female",
  },
  { id: "KH-004", name: "Phạm Minh Tuấn", phone: "0933222111" },
]

// ─── Sample Orders (today's history) ─────────────────────────────────────────

export const mockOtcOrders: OtcOrder[] = [
  {
    id: "OTC-20260404-0001",
    customer: otcCustomers[2],
    items: [
      { product: otcProducts[0], quantity: 2 },
      { product: otcProducts[3], quantity: 1 },
      { product: otcProducts[7], quantity: 1 },
    ],
    paymentMethod: "cash",
    totalAmount: 85000 * 2 + 185000 + 150000,
    soldBy: "DS. Trần Minh Đức",
    soldAt: todayTimestamp(300),
  },
  {
    id: "OTC-20260404-0002",
    customer: otcCustomers[1],
    items: [{ product: otcProducts[3], quantity: 1 }],
    paymentMethod: "transfer",
    totalAmount: 185000,
    soldBy: "DS. Trần Minh Đức",
    soldAt: todayTimestamp(180),
  },
  {
    id: "OTC-20260404-0003",
    customer: otcCustomers[0],
    items: [
      { product: otcProducts[0], quantity: 2 },
      { product: otcProducts[1], quantity: 1 },
    ],
    paymentMethod: "cash",
    totalAmount: 85000 * 2 + 120000,
    soldBy: "DS. Trần Minh Đức",
    soldAt: todayTimestamp(60),
  },
]

export const PHARMACIST_NAME = "DS. Trần Minh Đức"
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors related to `mock-otc.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-otc.ts
git commit -m "feat: add OTC mock data — products, customers, orders"
```

---

### Task 2: Build the customer card component

**Files:**
- Create: `src/components/pharmacy/otc-customer-card.tsx`

- [ ] **Step 1: Create the customer search and selection card**

```tsx
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import type { OtcCustomer } from "@/data/mock-otc"

interface OtcCustomerCardProps {
  customers: OtcCustomer[]
  selectedCustomer: OtcCustomer | null
  onSelect: (customer: OtcCustomer) => void
  onClear: () => void
  onCreateNew: () => void
}

export function OtcCustomerCard({
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  onCreateNew,
}: OtcCustomerCardProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [search, customers])

  if (selectedCustomer) {
    return (
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Khách hàng
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{selectedCustomer.name}</div>
            <div className="text-xs text-muted-foreground">
              {selectedCustomer.phone}
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-primary hover:underline"
          >
            Đổi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Khách hàng
      </div>
      <Input
        placeholder="Tìm theo tên hoặc SĐT..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-sm"
      />
      {search.trim() && (
        <div className="mt-2 max-h-[140px] space-y-0.5 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c)
                  setSearch("")
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">
                  {c.phone}
                </span>
              </button>
            ))
          ) : (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Không tìm thấy khách hàng
            </div>
          )}
        </div>
      )}
      <button
        onClick={onCreateNew}
        className="mt-2 text-xs text-primary hover:underline"
      >
        + Tạo khách hàng mới
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-customer-card.tsx
git commit -m "feat: add OTC customer card with search and selection"
```

---

### Task 3: Build the product card component

**Files:**
- Create: `src/components/pharmacy/otc-product-card.tsx`

- [ ] **Step 1: Create the product search card with search-first behavior**

```tsx
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { formatVnd } from "@/data/mock-otc"
import type { OtcProduct } from "@/data/mock-otc"

interface OtcProductCardProps {
  products: OtcProduct[]
  onAddToOrder: (product: OtcProduct) => void
}

export function OtcProductCard({
  products,
  onAddToOrder,
}: OtcProductCardProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
    )
  }, [search, products])

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Sản phẩm OTC
      </div>
      <Input
        placeholder="Tìm thuốc OTC..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-sm"
      />

      <div className="mt-2 flex-1 overflow-y-auto">
        {!search.trim() ? (
          <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
            Nhập tên sản phẩm để tìm kiếm
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
            Không tìm thấy sản phẩm
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((p) => {
              const outOfStock = p.stockQuantity === 0
              return (
                <button
                  key={p.id}
                  disabled={outOfStock}
                  onClick={() => onAddToOrder(p)}
                  className={`flex w-full items-center rounded-md px-2 py-2 text-left ${
                    outOfStock
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-teal-50 dark:hover:bg-teal-950/30"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${outOfStock ? "text-muted-foreground" : ""}`}
                    >
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.manufacturer} — {p.formFactor}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${outOfStock ? "text-muted-foreground" : ""}`}
                    >
                      {formatVnd(p.price)}
                    </div>
                    <div
                      className={`text-[11px] ${
                        outOfStock
                          ? "text-red-500"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {outOfStock ? "Hết hàng" : `Còn ${p.stockQuantity}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-product-card.tsx
git commit -m "feat: add OTC product card with search-first behavior"
```

---

### Task 4: Build the order panel component

**Files:**
- Create: `src/components/pharmacy/otc-order-panel.tsx`

- [ ] **Step 1: Create the order panel with item management, payment pills, and checkout**

```tsx
import { Button } from "@/components/ui/button"
import { formatVnd } from "@/data/mock-otc"
import type { OtcOrderItem, OtcPaymentMethod, OtcCustomer } from "@/data/mock-otc"

const paymentMethods: { value: OtcPaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "qr", label: "QR code" },
  { value: "card", label: "Thẻ" },
]

interface OtcOrderPanelProps {
  items: OtcOrderItem[]
  paymentMethod: OtcPaymentMethod
  selectedCustomer: OtcCustomer | null
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onPaymentMethodChange: (method: OtcPaymentMethod) => void
  onCheckout: () => void
  onViewHistory: () => void
}

export function OtcOrderPanel({
  items,
  paymentMethod,
  selectedCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onPaymentMethodChange,
  onCheckout,
  onViewHistory,
}: OtcOrderPanelProps) {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0)
  const canCheckout = selectedCustomer && items.length > 0

  return (
    <div className="flex w-[38%] flex-col rounded-lg border border-border bg-background p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Đơn hàng</h3>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {totalProducts} sản phẩm
        </span>
      </div>

      {/* Items or empty state */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[100px] items-center justify-center text-xs text-muted-foreground">
            Chọn sản phẩm từ danh sách bên trái
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="rounded-md bg-muted/50 p-2"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium">
                  {item.product.name}
                </span>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, -1)
                    }
                    className="flex size-6 items-center justify-center rounded border border-border bg-background text-xs hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center text-xs font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, 1)
                    }
                    disabled={item.quantity >= item.product.stockQuantity}
                    className="flex size-6 items-center justify-center rounded border border-border bg-background text-xs hover:bg-muted disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">
                    {formatVnd(item.product.price)} × {item.quantity}
                  </div>
                  <div className="text-xs font-medium">
                    {formatVnd(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-border pt-3">
        {/* Total */}
        <div className="mb-3 flex items-center justify-between text-[15px] font-medium">
          <span>Tổng cộng</span>
          <span>{formatVnd(totalAmount)}</span>
        </div>

        {/* Payment method pills */}
        <div className="mb-3 flex gap-1">
          {paymentMethods.map((pm) => (
            <button
              key={pm.value}
              onClick={() => onPaymentMethodChange(pm.value)}
              className={`flex-1 rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${
                paymentMethod === pm.value
                  ? "border-teal-200 bg-teal-600 text-white dark:border-teal-800 dark:bg-teal-700"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>

        {/* Checkout button */}
        <Button
          className="w-full"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          Thanh toán {formatVnd(totalAmount)}
        </Button>

        {/* History link */}
        <button
          onClick={onViewHistory}
          className="mt-2 w-full text-center text-[11px] text-primary hover:underline"
        >
          Xem lịch sử bán OTC hôm nay
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-order-panel.tsx
git commit -m "feat: add OTC order panel with quantity controls and payment"
```

---

### Task 5: Build the create customer modal

**Files:**
- Create: `src/components/pharmacy/otc-create-customer-modal.tsx`

- [ ] **Step 1: Create the modal with 2-column form and validation**

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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OtcCustomer } from "@/data/mock-otc"

interface OtcCreateCustomerModalProps {
  open: boolean
  onClose: () => void
  onCreated: (customer: OtcCustomer) => void
  existingCustomers: OtcCustomer[]
}

export function OtcCreateCustomerModal({
  open,
  onClose,
  onCreated,
  existingCustomers,
}: OtcCreateCustomerModalProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên"
    }
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone = "SĐT phải có 10 chữ số, bắt đầu bằng 0"
    } else if (existingCustomers.some((c) => c.phone === phone)) {
      newErrors.phone = "SĐT đã tồn tại trong hệ thống"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const newCustomer: OtcCustomer = {
      id: `KH-${String(Date.now()).slice(-3)}`,
      name: name.trim(),
      phone,
      birthDate: birthDate || undefined,
      gender: gender ? (gender as "male" | "female") : undefined,
    }
    onCreated(newCustomer)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setPhone("")
    setBirthDate("")
    setGender("")
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Tạo khách hàng mới
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập họ tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
            {errors.name && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="0xxx.xxx.xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
            {errors.phone && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Ngày sinh</Label>
            <Input
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Giới tính</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder="Chọn..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Chỉ bắt buộc Họ tên + SĐT. Các trường khác có thể bổ sung sau.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Tạo khách hàng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-create-customer-modal.tsx
git commit -m "feat: add OTC create customer modal with validation"
```

---

### Task 6: Build the payment success modal

**Files:**
- Create: `src/components/pharmacy/otc-payment-success-modal.tsx`

- [ ] **Step 1: Create the confirmation modal**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatVnd } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcPaymentSuccessModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
  onPrintLabels: () => void
  onPrintInvoice: () => void
  onNewOrder: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export function OtcPaymentSuccessModal({
  order,
  open,
  onClose,
  onPrintLabels,
  onPrintInvoice,
  onNewOrder,
}: OtcPaymentSuccessModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-medium">
            Thanh toán thành công
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-2">
          {/* Green check icon */}
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>

          {/* Amount */}
          <div className="text-2xl font-medium">
            {formatVnd(order.totalAmount)}
          </div>

          {/* Payment + customer info */}
          <div className="mt-1 text-xs text-muted-foreground">
            {paymentLabels[order.paymentMethod]} — {order.customer.name} —{" "}
            {order.customer.phone}
          </div>

          {/* Metadata */}
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDateTime(order.soldAt)} — Mã đơn: {order.id}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onPrintLabels}>
            In nhãn thuốc
          </Button>
          <Button variant="outline" size="sm" onClick={onPrintInvoice}>
            In hóa đơn
          </Button>
          <Button size="sm" onClick={onNewOrder}>
            Đơn hàng mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-payment-success-modal.tsx
git commit -m "feat: add OTC payment success modal"
```

---

### Task 7: Build the invoice modal

**Files:**
- Create: `src/components/pharmacy/otc-invoice-modal.tsx`

- [ ] **Step 1: Create the invoice preview modal with paper-style layout**

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatVnd, maskPhone } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcInvoiceModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export function OtcInvoiceModal({
  order,
  open,
  onClose,
}: OtcInvoiceModalProps) {
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

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
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-base font-medium">
              In hóa đơn — {order.customer.name}
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground print:hidden">
            Xem trước hóa đơn bán hàng OTC.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible print:pr-0">
            <div className="rounded-lg border border-border px-8 py-7 print:border-none print:p-0">
              {/* Header */}
              <div className="border-b border-border pb-4 text-center">
                <div className="text-base font-medium">
                  PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh — ĐT: (028) 1234
                  5678
                </div>
                <div className="mt-3 text-lg font-medium tracking-wide">
                  HÓA ĐƠN BÁN HÀNG
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Số: {order.id}
                </div>
              </div>

              {/* Customer info */}
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Khách hàng: </span>
                  <span className="font-medium">{order.customer.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT: </span>
                  <span>{maskPhone(order.customer.phone)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày: </span>
                  <span>{formatDateTime(order.soldAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Thu ngân: </span>
                  <span>{order.soldBy}</span>
                </div>
              </div>

              {/* Product table */}
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="w-[30px] py-2 text-center">STT</th>
                    <th className="py-2">Sản phẩm</th>
                    <th className="py-2">ĐVT</th>
                    <th className="py-2 text-right">SL</th>
                    <th className="py-2 text-right">Đơn giá</th>
                    <th className="py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-border/50"
                    >
                      <td className="py-2 text-center text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2 font-medium">
                        {item.product.name}
                      </td>
                      <td className="py-2 capitalize">
                        {item.product.unit}
                      </td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        {formatVnd(item.product.price)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatVnd(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="mt-3 border-t border-border pt-3 text-right">
                <div className="text-sm font-medium">
                  Tổng cộng: {formatVnd(order.totalAmount)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Thanh toán: {paymentLabels[order.paymentMethod]}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-between border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
                <span>Cảm ơn quý khách!</span>
                <span>PK Ganka28</span>
              </div>
            </div>
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              Tải PDF
            </Button>
            <Button onClick={handlePrint}>In hóa đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-invoice-modal.tsx
git commit -m "feat: add OTC invoice modal with paper-style preview"
```

---

### Task 8: Build the label print modal

**Files:**
- Create: `src/components/pharmacy/otc-label-modal.tsx`

- [ ] **Step 1: Create the label preview modal with OTC-specific formatting**

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
import type { OtcOrder, OtcOrderItem } from "@/data/mock-otc"

interface OtcLabelModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function LabelCard({
  item,
  order,
  selectionMode,
  isSelected,
  onToggle,
}: {
  item: OtcOrderItem
  order: OtcOrder
  selectionMode: boolean
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`relative rounded border border-dashed border-border p-3 ${
        selectionMode && !isSelected ? "opacity-40" : ""
      }`}
      onClick={selectionMode ? onToggle : undefined}
      role={selectionMode ? "checkbox" : undefined}
      aria-checked={selectionMode ? isSelected : undefined}
    >
      {selectionMode && (
        <div
          className={`absolute top-2 right-2 flex size-4 items-center justify-center rounded border text-xs ${
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          }`}
        >
          {isSelected && "\u2713"}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between text-sm">
        <span className="font-medium">{item.product.name}</span>
        <span className="text-xs text-muted-foreground">
          PK Ganka28 · {formatDate(order.soldAt)}
        </span>
      </div>

      {/* Body */}
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <div>
          KH: <strong className="text-foreground">{order.customer.name}</strong>
        </div>
        <div>Cách dùng: {item.product.usage}</div>
      </div>

      {/* Footer */}
      <div className="mt-1.5 flex items-end justify-between text-xs text-muted-foreground">
        <span>{order.soldBy}</span>
        <span>
          SL: {item.quantity} {item.product.unit}
        </span>
      </div>
    </div>
  )
}

export function OtcLabelModal({ order, open, onClose }: OtcLabelModalProps) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  if (!order) return null

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

  const handleToggleSelectionMode = () => {
    if (!selectionMode) {
      setSelectedIds(new Set(order.items.map((i) => i.product.id)))
    }
    setSelectionMode(!selectionMode)
  }

  const selectedCount = selectedIds.size
  const allSelected = selectedCount === order.items.length
  const printButtonText =
    selectionMode && !allSelected
      ? `In ${selectedCount} nhãn đã chọn`
      : "In tất cả nhãn"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            In nhãn thuốc — {order.customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground">
            Xem trước nhãn dán. Mỗi nhãn in trên giấy nhãn dán khổ nhỏ (70 ×
            35mm).
          </p>

          <div className="space-y-3">
            {order.items.map((item) => (
              <LabelCard
                key={item.product.id}
                item={item}
                order={order}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(item.product.id)}
                onToggle={() => toggleLabel(item.product.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleToggleSelectionMode}>
            {selectionMode ? "Hủy chọn" : "Chọn nhãn cần in"}
          </Button>
          <Button>{printButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/pharmacy/otc-label-modal.tsx
git commit -m "feat: add OTC label print modal with selection mode"
```

---

### Task 9: Build the history view

**Files:**
- Create: `src/components/pharmacy/otc-history-kpi-cards.tsx`
- Create: `src/components/pharmacy/otc-history.tsx`

- [ ] **Step 1: Create the history KPI cards component**

```tsx
import { formatVnd } from "@/data/mock-otc"

interface OtcHistoryKpiCardsProps {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
}

export function OtcHistoryKpiCards({
  totalOrders,
  totalRevenue,
  totalProducts,
}: OtcHistoryKpiCardsProps) {
  const cards = [
    { label: "Số đơn hôm nay", value: String(totalOrders) },
    { label: "Doanh thu OTC", value: formatVnd(totalRevenue) },
    { label: "Sản phẩm đã bán", value: String(totalProducts) },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-background p-4"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1.5 text-2xl font-medium">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create the history view with table and three-dot menu**

```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OtcHistoryKpiCards } from "./otc-history-kpi-cards"
import { OtcInvoiceModal } from "./otc-invoice-modal"
import { OtcLabelModal } from "./otc-label-modal"
import { formatVnd, getOtcMetrics } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcHistoryProps {
  orders: OtcOrder[]
  onBack: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function OtcHistory({ orders, onBack }: OtcHistoryProps) {
  const [invoiceOrder, setInvoiceOrder] = useState<OtcOrder | null>(null)
  const [labelOrder, setLabelOrder] = useState<OtcOrder | null>(null)

  const metrics = getOtcMetrics(orders)
  const sorted = [...orders].sort(
    (a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
  )

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          Lịch sử bán OTC hôm nay
        </h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Quay lại bán hàng
        </Button>
      </div>

      {/* KPI cards */}
      <OtcHistoryKpiCards
        totalOrders={metrics.totalOrders}
        totalRevenue={metrics.totalRevenue}
        totalProducts={metrics.totalProducts}
      />

      {/* History table */}
      <div className="rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Mã đơn
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Khách hàng
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Thời gian
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Sản phẩm
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Tổng tiền
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Thanh toán
              </th>
              <th className="w-[50px] px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((order) => {
              const itemCount = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0
              )
              return (
                <tr
                  key={order.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {order.customer.phone}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">{formatTime(order.soldAt)}</td>
                  <td className="px-4 py-2.5">{itemCount} sản phẩm</td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    {formatVnd(order.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5">
                    {paymentLabels[order.paymentMethod]}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          ⋮
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setInvoiceOrder(order)}
                        >
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setInvoiceOrder(order)}
                        >
                          In hóa đơn
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setLabelOrder(order)}
                        >
                          In nhãn thuốc
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <OtcInvoiceModal
        order={invoiceOrder}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
      <OtcLabelModal
        order={labelOrder}
        open={!!labelOrder}
        onClose={() => setLabelOrder(null)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/pharmacy/otc-history-kpi-cards.tsx src/components/pharmacy/otc-history.tsx
git commit -m "feat: add OTC history view with KPI cards and table"
```

---

### Task 10: Build the main OTC POS orchestrator and wire into pharmacy dashboard

**Files:**
- Create: `src/components/pharmacy/otc-pos.tsx`
- Modify: `src/pages/pharmacy/index.tsx:124-128`

- [ ] **Step 1: Create the main OTC POS component that orchestrates everything**

```tsx
import { useState } from "react"
import { OtcCustomerCard } from "./otc-customer-card"
import { OtcProductCard } from "./otc-product-card"
import { OtcOrderPanel } from "./otc-order-panel"
import { OtcCreateCustomerModal } from "./otc-create-customer-modal"
import { OtcPaymentSuccessModal } from "./otc-payment-success-modal"
import { OtcInvoiceModal } from "./otc-invoice-modal"
import { OtcLabelModal } from "./otc-label-modal"
import { OtcHistory } from "./otc-history"
import {
  otcProducts,
  otcCustomers,
  mockOtcOrders,
  generateOtcOrderId,
  PHARMACIST_NAME,
} from "@/data/mock-otc"
import type {
  OtcCustomer,
  OtcOrderItem,
  OtcPaymentMethod,
  OtcOrder,
  OtcProduct,
} from "@/data/mock-otc"

type OtcView = "pos" | "history"

export function OtcPos() {
  // View state
  const [view, setView] = useState<OtcView>("pos")

  // Customer state
  const [customers, setCustomers] = useState<OtcCustomer[]>(otcCustomers)
  const [selectedCustomer, setSelectedCustomer] =
    useState<OtcCustomer | null>(null)
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)

  // Order state
  const [orderItems, setOrderItems] = useState<OtcOrderItem[]>([])
  const [paymentMethod, setPaymentMethod] =
    useState<OtcPaymentMethod>("cash")

  // Orders history
  const [orders, setOrders] = useState<OtcOrder[]>(mockOtcOrders)

  // Modal state
  const [lastOrder, setLastOrder] = useState<OtcOrder | null>(null)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showLabels, setShowLabels] = useState(false)

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleAddToOrder = (product: OtcProduct) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const handleCheckout = () => {
    if (!selectedCustomer || orderItems.length === 0) return

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    )

    const newOrder: OtcOrder = {
      id: generateOtcOrderId(orders.length + 1),
      customer: selectedCustomer,
      items: [...orderItems],
      paymentMethod,
      totalAmount,
      soldBy: PHARMACIST_NAME,
      soldAt: new Date().toISOString(),
    }

    setOrders((prev) => [...prev, newOrder])
    setLastOrder(newOrder)
    setShowPaymentSuccess(true)
  }

  const handleNewOrder = () => {
    setSelectedCustomer(null)
    setOrderItems([])
    setPaymentMethod("cash")
    setShowPaymentSuccess(false)
    setShowInvoice(false)
    setShowLabels(false)
    setLastOrder(null)
  }

  const handleCustomerCreated = (customer: OtcCustomer) => {
    setCustomers((prev) => [...prev, customer])
    setSelectedCustomer(customer)
    setShowCreateCustomer(false)
  }

  // ─── Render ──────────────────────────────────────────────────────────

  if (view === "history") {
    return <OtcHistory orders={orders} onBack={() => setView("pos")} />
  }

  return (
    <>
      <div className="flex gap-4 pt-2" style={{ height: "calc(100vh - 180px)" }}>
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-3">
          <OtcCustomerCard
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelect={setSelectedCustomer}
            onClear={() => setSelectedCustomer(null)}
            onCreateNew={() => setShowCreateCustomer(true)}
          />
          <OtcProductCard
            products={otcProducts}
            onAddToOrder={handleAddToOrder}
          />
        </div>

        {/* Right column */}
        <OtcOrderPanel
          items={orderItems}
          paymentMethod={paymentMethod}
          selectedCustomer={selectedCustomer}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onPaymentMethodChange={setPaymentMethod}
          onCheckout={handleCheckout}
          onViewHistory={() => setView("history")}
        />
      </div>

      {/* Modals */}
      <OtcCreateCustomerModal
        open={showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onCreated={handleCustomerCreated}
        existingCustomers={customers}
      />
      <OtcPaymentSuccessModal
        order={lastOrder}
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        onPrintLabels={() => {
          setShowPaymentSuccess(false)
          setShowLabels(true)
        }}
        onPrintInvoice={() => {
          setShowPaymentSuccess(false)
          setShowInvoice(true)
        }}
        onNewOrder={handleNewOrder}
      />
      <OtcInvoiceModal
        order={lastOrder}
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
      <OtcLabelModal
        order={lastOrder}
        open={showLabels}
        onClose={() => setShowLabels(false)}
      />
    </>
  )
}
```

- [ ] **Step 2: Wire OtcPos into the pharmacy dashboard**

In `src/pages/pharmacy/index.tsx`, replace the placeholder `TabsContent` for "otc" (lines 124-128):

**Replace:**
```tsx
        <TabsContent value="otc">
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sẽ thiết kế chi tiết ở bước tiếp theo
          </div>
        </TabsContent>
```

**With:**
```tsx
        <TabsContent value="otc">
          <OtcPos />
        </TabsContent>
```

Add the import at the top of the file:
```tsx
import { OtcPos } from "@/components/pharmacy/otc-pos"
```

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Run the dev server and verify visually**

Run: `npm run dev`
Expected: Navigate to `/pharmacy`, click "Bán OTC" tab. Verify:
- Customer search works, selecting shows card with "Đổi"
- Product search is empty until typing, results appear
- Clicking a product adds to order panel
- Quantity controls work, "Xóa" removes items
- Payment method pills toggle
- "Thanh toán" button shows amount, disabled when no customer/items
- Checkout shows success modal
- Success modal buttons open invoice/label modals or start new order
- "Xem lịch sử bán OTC hôm nay" shows history view with KPI cards and table
- History three-dot menu opens invoice/label modals

- [ ] **Step 5: Commit**

```bash
git add src/components/pharmacy/otc-pos.tsx src/pages/pharmacy/index.tsx
git commit -m "feat: wire OTC POS into pharmacy dashboard"
```

---

### Task 11: Final formatting and type-check

**Files:**
- All new files in `src/components/pharmacy/otc-*.tsx` and `src/data/mock-otc.ts`

- [ ] **Step 1: Run Prettier on all new files**

Run: `npx prettier --write "src/components/pharmacy/otc-*.tsx" "src/data/mock-otc.ts"`
Expected: Files formatted

- [ ] **Step 2: Run ESLint**

Run: `npx eslint "src/components/pharmacy/otc-*.tsx" "src/data/mock-otc.ts"`
Expected: No errors

- [ ] **Step 3: Run full type-check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit if formatting changed anything**

```bash
git add -A
git commit -m "style: format OTC pharmacy files"
```
