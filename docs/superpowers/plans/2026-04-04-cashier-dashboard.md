# Cashier Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the cashier dashboard at `/payment` with KPI cards, payment queue tab, and transactions history tab.

**Architecture:** Single page component with two tabs using shadcn Tabs. Mock data layer with types, a context for shared state, and three presentational components (KPI cards, queue table, transactions table). Follows the same patterns as Pharmacy dashboard.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Tabs, Table, DropdownMenu, Button, Badge), Hugeicons, React Router v7.

---

## File Structure

```
src/
  data/mock-cashier.ts              # Types + mock data + metrics helper
  components/cashier/
    cashier-kpi-cards.tsx            # 4 revenue metric cards
    cashier-queue-table.tsx          # Payment queue table + row actions
    cashier-transactions-table.tsx   # Transactions table + row actions
  pages/payment/index.tsx            # Main dashboard page
```

Also modify:
- `src/App.tsx` — add `/payment` route
- `src/components/app-sidebar.tsx` — add nav item
- `src/components/site-header.tsx` — add breadcrumb title

---

### Task 1: Mock Data & Types

**Files:**
- Create: `src/data/mock-cashier.ts`

- [ ] **Step 1: Create types and mock data file**

```ts
import { todayTimestamp } from "@/lib/demo-date"

// ─── Types ───────────────────────────────────────────────────────────────────

export type PaymentCategory = "exam" | "drug" | "optical" | "treatment"

export type PaymentMethod =
  | "cash"
  | "transfer"
  | "qr_vnpay"
  | "qr_momo"
  | "qr_zalopay"
  | "card_visa"
  | "card_mastercard"
  | "combined"

export type TransactionStatus = "paid" | "refunded" | "pending_refund"

export type ShiftState = "not_opened" | "active" | "closed"

export interface PaymentRequest {
  id: string
  patientName: string
  patientId: string
  patientPhone: string
  categories: PaymentCategory[]
  estimatedTotal: number
  queuedAt: string // ISO
  visitId: string
}

export interface Transaction {
  id: string
  stt: number
  patientName: string
  patientId: string
  patientPhone: string
  categories: PaymentCategory[]
  paymentMethod: PaymentMethod
  amount: number
  completedAt: string // ISO
  status: TransactionStatus
  visitId: string
}

export interface ShiftInfo {
  state: ShiftState
  label: string // e.g. "Ca chiều"
  startTime: string // e.g. "13:00"
  endTime: string // e.g. "20:00"
  closedAt?: string // e.g. "20:15"
}

export interface CashierMetrics {
  totalRevenue: number
  totalCount: number
  cashRevenue: number
  cashCount: number
  transferRevenue: number
  transferCount: number
  cardRevenue: number
  cardCount: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ"
}

export function formatPhone(phone: string): string {
  // 0912345678 → 0912 345 678
  const digits = phone.replace(/\D/g, "")
  if (digits.length !== 10) return phone
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`
}

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr_vnpay: "QR VNPay",
  qr_momo: "QR MoMo",
  qr_zalopay: "QR ZaloPay",
  card_visa: "Thẻ Visa",
  card_mastercard: "Thẻ Mastercard",
  combined: "Kết hợp",
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method]
}

function isCashMethod(m: PaymentMethod): boolean {
  return m === "cash"
}

function isTransferOrQR(m: PaymentMethod): boolean {
  return m === "transfer" || m.startsWith("qr_")
}

function isCardMethod(m: PaymentMethod): boolean {
  return m.startsWith("card_")
}

export function getCashierMetrics(transactions: Transaction[]): CashierMetrics {
  const paid = transactions.filter((t) => t.status === "paid")
  return {
    totalRevenue: paid.reduce((sum, t) => sum + t.amount, 0),
    totalCount: paid.length,
    cashRevenue: paid
      .filter((t) => isCashMethod(t.paymentMethod))
      .reduce((sum, t) => sum + t.amount, 0),
    cashCount: paid.filter((t) => isCashMethod(t.paymentMethod)).length,
    transferRevenue: paid
      .filter((t) => isTransferOrQR(t.paymentMethod))
      .reduce((sum, t) => sum + t.amount, 0),
    transferCount: paid.filter((t) => isTransferOrQR(t.paymentMethod)).length,
    cardRevenue: paid
      .filter((t) => isCardMethod(t.paymentMethod))
      .reduce((sum, t) => sum + t.amount, 0),
    cardCount: paid.filter((t) => isCardMethod(t.paymentMethod)).length,
  }
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const mockShift: ShiftInfo = {
  state: "active",
  label: "Ca chiều",
  startTime: "13:00",
  endTime: "20:00",
}

export const mockPaymentRequests: PaymentRequest[] = [
  {
    id: "pr-001",
    patientName: "Nguyễn Thị Mai",
    patientId: "BN-20260405-0008",
    patientPhone: "0912345678",
    categories: ["exam", "drug"],
    estimatedTotal: 650_000,
    queuedAt: todayTimestamp(12),
    visitId: "v-008",
  },
  {
    id: "pr-002",
    patientName: "Trần Văn Hùng",
    patientId: "BN-20260405-0012",
    patientPhone: "0987654321",
    categories: ["optical"],
    estimatedTotal: 3_500_000,
    queuedAt: todayTimestamp(10),
    visitId: "v-012",
  },
  {
    id: "pr-003",
    patientName: "Lê Hoàng Anh",
    patientId: "BN-20260405-0015",
    patientPhone: "0365123456",
    categories: ["exam", "drug"],
    estimatedTotal: 480_000,
    queuedAt: todayTimestamp(7),
    visitId: "v-015",
  },
  {
    id: "pr-004",
    patientName: "Phạm Minh Châu",
    patientId: "BN-20260405-0018",
    patientPhone: "0901222333",
    categories: ["treatment"],
    estimatedTotal: 2_400_000,
    queuedAt: todayTimestamp(4),
    visitId: "v-018",
  },
  {
    id: "pr-005",
    patientName: "Vũ Đức Thắng",
    patientId: "BN-20260405-0003",
    patientPhone: "0778999111",
    categories: ["drug"],
    estimatedTotal: 185_000,
    queuedAt: todayTimestamp(2),
    visitId: "v-003",
  },
]

export const mockTransactions: Transaction[] = [
  {
    id: "tx-024",
    stt: 24,
    patientName: "Đỗ Thị Hương",
    patientId: "BN-20260405-0022",
    patientPhone: "0938111222",
    categories: ["exam", "drug"],
    paymentMethod: "cash",
    amount: 520_000,
    completedAt: todayTimestamp(18),
    status: "paid",
    visitId: "v-022",
  },
  {
    id: "tx-023",
    stt: 23,
    patientName: "Nguyễn Văn Tâm",
    patientId: "BN-20260405-0021",
    patientPhone: "0912888999",
    categories: ["optical"],
    paymentMethod: "transfer",
    amount: 4_200_000,
    completedAt: todayTimestamp(32),
    status: "paid",
    visitId: "v-021",
  },
  {
    id: "tx-022",
    stt: 22,
    patientName: "Bùi Thanh Hà",
    patientId: "BN-20260405-0019",
    patientPhone: "0977444555",
    categories: ["treatment"],
    paymentMethod: "qr_vnpay",
    amount: 3_600_000,
    completedAt: todayTimestamp(50),
    status: "pending_refund",
    visitId: "v-019",
  },
  {
    id: "tx-021",
    stt: 21,
    patientName: "Hoàng Minh Đức",
    patientId: "BN-20260405-0017",
    patientPhone: "0866333777",
    categories: ["exam", "drug"],
    paymentMethod: "card_visa",
    amount: 780_000,
    completedAt: todayTimestamp(65),
    status: "paid",
    visitId: "v-017",
  },
  {
    id: "tx-020",
    stt: 20,
    patientName: "Trần Thị Lan",
    patientId: "BN-20260405-0014",
    patientPhone: "0945666888",
    categories: ["exam"],
    paymentMethod: "cash",
    amount: 300_000,
    completedAt: todayTimestamp(82),
    status: "refunded",
    visitId: "v-014",
  },
  {
    id: "tx-019",
    stt: 19,
    patientName: "Lý Văn Quang",
    patientId: "BN-20260405-0011",
    patientPhone: "0703222444",
    categories: ["drug"],
    paymentMethod: "qr_momo",
    amount: 245_000,
    completedAt: todayTimestamp(100),
    status: "paid",
    visitId: "v-011",
  },
  {
    id: "tx-018",
    stt: 18,
    patientName: "Phan Thị Ngọc",
    patientId: "BN-20260405-0009",
    patientPhone: "0856999000",
    categories: ["exam", "optical"],
    paymentMethod: "combined",
    amount: 5_100_000,
    completedAt: todayTimestamp(118),
    status: "paid",
    visitId: "v-009",
  },
]
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `mock-cashier.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/mock-cashier.ts
git commit -m "feat(cashier): add mock data types and helpers"
```

---

### Task 2: KPI Cards Component

**Files:**
- Create: `src/components/cashier/cashier-kpi-cards.tsx`

- [ ] **Step 1: Create the KPI cards component**

```tsx
import type { CashierMetrics } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface CashierKpiCardsProps {
  metrics: CashierMetrics
}

export function CashierKpiCards({ metrics }: CashierKpiCardsProps) {
  const cards = [
    {
      label: "Doanh thu hôm nay",
      value: formatVND(metrics.totalRevenue),
      sub: `${metrics.totalCount} giao dịch`,
    },
    {
      label: "Tiền mặt",
      value: formatVND(metrics.cashRevenue),
      sub: `${metrics.cashCount} giao dịch`,
    },
    {
      label: "Chuyển khoản / QR",
      value: formatVND(metrics.transferRevenue),
      sub: `${metrics.transferCount} giao dịch`,
    },
    {
      label: "Thẻ",
      value: formatVND(metrics.cardRevenue),
      sub: `${metrics.cardCount} giao dịch`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[10px] border border-border bg-background p-[14px_16px]"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1.5 text-xl font-semibold">{card.value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/cashier-kpi-cards.tsx
git commit -m "feat(cashier): add KPI cards component"
```

---

### Task 3: Queue Table Component

**Files:**
- Create: `src/components/cashier/cashier-queue-table.tsx`

- [ ] **Step 1: Create the payment queue table**

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
  Payment02Icon,
  FileSearchIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import type { PaymentRequest, PaymentCategory } from "@/data/mock-cashier"
import { formatVND, formatPhone } from "@/data/mock-cashier"

const CATEGORY_CONFIG: Record<
  PaymentCategory,
  { label: string; bg: string; text: string }
> = {
  exam: { label: "Khám", bg: "#E6F1FB", text: "#0C447C" },
  drug: { label: "Thuốc", bg: "#E1F5EE", text: "#085041" },
  optical: { label: "Kính", bg: "#EEEDFE", text: "#3C3489" },
  treatment: { label: "Liệu trình", bg: "#FAEEDA", text: "#633806" },
}

function CategoryBadge({ category }: { category: PaymentCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

function WaitTime({ queuedAt }: { queuedAt: string }) {
  const minutes = Math.floor(
    (Date.now() - new Date(queuedAt).getTime()) / 60_000
  )
  const isAlert = minutes >= 10
  return (
    <span
      className={
        isAlert
          ? "text-xs font-medium text-[#A32D2D]"
          : "text-xs text-muted-foreground"
      }
    >
      {minutes} phút
    </span>
  )
}

interface CashierQueueTableProps {
  requests: PaymentRequest[]
}

export function CashierQueueTable({ requests }: CashierQueueTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <div className="py-12 text-center text-[13px] text-muted-foreground">
          Không có bệnh nhân chờ thanh toán
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-9">STT</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Loại thanh toán</TableHead>
            <TableHead className="text-right">Tạm tính</TableHead>
            <TableHead>Chờ</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req, idx) => (
            <TableRow key={req.id}>
              <TableCell className="text-center text-xs text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div className="text-[13px] font-medium">
                  {req.patientName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {req.patientId}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatPhone(req.patientPhone)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {req.categories.map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right text-[13px] font-medium">
                {formatVND(req.estimatedTotal)}
              </TableCell>
              <TableCell>
                <WaitTime queuedAt={req.queuedAt} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Payment02Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Thanh toán
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={FileSearchIcon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Trả lại hàng đợi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/cashier-queue-table.tsx
git commit -m "feat(cashier): add payment queue table component"
```

---

### Task 4: Transactions Table Component

**Files:**
- Create: `src/components/cashier/cashier-transactions-table.tsx`

- [ ] **Step 1: Create the transactions table**

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
  FileSearchIcon,
  PrinterIcon,
  MoneyReceive01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import type {
  Transaction,
  TransactionStatus,
  PaymentCategory,
} from "@/data/mock-cashier"
import { formatVND, formatPhone, getPaymentMethodLabel } from "@/data/mock-cashier"

const CATEGORY_CONFIG: Record<
  PaymentCategory,
  { label: string; bg: string; text: string }
> = {
  exam: { label: "Khám", bg: "#E6F1FB", text: "#0C447C" },
  drug: { label: "Thuốc", bg: "#E1F5EE", text: "#085041" },
  optical: { label: "Kính", bg: "#EEEDFE", text: "#3C3489" },
  treatment: { label: "Liệu trình", bg: "#FAEEDA", text: "#633806" },
}

function CategoryBadge({ category }: { category: PaymentCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string }
> = {
  paid: { label: "Đã thanh toán", color: "#0F6E56" },
  refunded: { label: "Đã hoàn tiền", color: "#A32D2D" },
  pending_refund: { label: "Chờ hoàn tiền", color: "#854F0B" },
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface CashierTransactionsTableProps {
  transactions: Transaction[]
}

export function CashierTransactionsTable({
  transactions,
}: CashierTransactionsTableProps) {
  // Sort newest first for display
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-9">STT</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
            <TableHead>Giờ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((tx) => {
            const statusCfg = STATUS_CONFIG[tx.status]
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {tx.stt}
                </TableCell>
                <TableCell>
                  <div className="text-[13px] font-medium">
                    {tx.patientName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {tx.patientId}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatPhone(tx.patientPhone)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {tx.categories.map((cat) => (
                      <CategoryBadge key={cat} category={cat} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {getPaymentMethodLabel(tx.paymentMethod)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(tx.amount)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatTime(tx.completedAt)}
                </TableCell>
                <TableCell>
                  <span
                    className="text-xs font-medium"
                    style={{ color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground"
                      >
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={FileSearchIcon}
                          className="mr-2 size-4"
                          strokeWidth={1.5}
                        />
                        Xem hóa đơn
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="mr-2 size-4"
                          strokeWidth={1.5}
                        />
                        In lại
                      </DropdownMenuItem>
                      {tx.status === "paid" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <HugeiconsIcon
                              icon={MoneyReceive01Icon}
                              className="mr-2 size-4"
                              strokeWidth={1.5}
                            />
                            Yêu cầu hoàn tiền
                          </DropdownMenuItem>
                        </>
                      )}
                      {tx.status === "pending_refund" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              className="mr-2 size-4"
                              strokeWidth={1.5}
                            />
                            Hủy yêu cầu hoàn tiền
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
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/cashier/cashier-transactions-table.tsx
git commit -m "feat(cashier): add transactions table component"
```

---

### Task 5: Dashboard Page + Routing

**Files:**
- Create: `src/pages/payment/index.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: Create the main dashboard page**

```tsx
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CashierKpiCards } from "@/components/cashier/cashier-kpi-cards"
import { CashierQueueTable } from "@/components/cashier/cashier-queue-table"
import { CashierTransactionsTable } from "@/components/cashier/cashier-transactions-table"
import {
  mockPaymentRequests,
  mockTransactions,
  mockShift,
  getCashierMetrics,
} from "@/data/mock-cashier"

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
  const [activeTab, setActiveTab] = useState("queue")
  const requests = mockPaymentRequests
  const transactions = mockTransactions
  const metrics = getCashierMetrics(transactions)
  const shift = mockShift

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
              <Button variant="outline" size="sm" className="text-xs">
                Chốt ca
              </Button>
            </>
          )}
          {shift.state === "not_opened" && (
            <>
              <span className="text-xs text-amber-600">Chưa mở ca</span>
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
          <CashierQueueTable requests={requests} />
        </TabsContent>

        <TabsContent value="transactions" className="pt-2">
          <CashierTransactionsTable transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Add route to App.tsx**

Add import at the top of `src/App.tsx`:
```ts
import CashierDashboard from "@/pages/payment/index"
```

Add route after the `/optical` route:
```tsx
<Route path="/payment" element={<CashierDashboard />} />
```

- [ ] **Step 3: Add sidebar nav item**

In `src/components/app-sidebar.tsx`, add the import:
```ts
import { Invoice03Icon } from "@hugeicons/core-free-icons"
```

Add to the `navItems` array after the "Trung tâm kính" entry:
```ts
{ title: "Thu ngân", url: "/payment", icon: Invoice03Icon },
```

- [ ] **Step 4: Add breadcrumb title**

In `src/components/site-header.tsx`, add to the `pageTitles` object:
```ts
"/payment": "Thu ngân",
```

- [ ] **Step 5: Verify the full build**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Start dev server and visually verify**

Run: `npm run dev`

Open `http://localhost:3000/payment` and verify:
- Header shows "Thu ngân" + date + shift badge + "Chốt ca" button
- 4 KPI cards with Vietnamese currency formatting
- "Chờ thanh toán" tab shows 5 queue items with badges, wait times (red for >= 10 min)
- "Giao dịch hôm nay" tab shows 7 transactions with statuses and payment methods
- Three-dot menus open correctly with contextual actions
- Sidebar shows "Thu ngân" nav item with Invoice03 icon

- [ ] **Step 7: Commit**

```bash
git add src/pages/payment/index.tsx src/App.tsx src/components/app-sidebar.tsx src/components/site-header.tsx
git commit -m "feat(cashier): add cashier dashboard page with routing and navigation"
```
