# Cashier Actions — Implementation Design

**Scope:** Screens 3-6 from cashier-payment-processing.md: Shift close page, View invoice modal, Refund modal, Return to queue modal
**Approach:** Dashboard-managed modal state (discriminated union) + separate route for shift close

---

## 1. Data Model Extensions

### New types (in `data/mock-cashier.ts`)

```typescript
interface ShiftBreakdownByMethod {
  method: PaymentMethod
  count: number
  amount: number
}

interface ShiftBreakdownByCategory {
  category: PaymentCategory
  count: number
  amount: number
}

interface ShiftReconciliation {
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

interface RefundableItem {
  id: string
  description: string
  quantity: number
  amount: number
  alreadyRefunded: boolean
}

interface RefundRecord {
  items: string[]
  amount: number
  reasonCode: string
  note: string
  refundMethod: string
  cashierName: string
  createdAt: string
}

interface TransactionDetail {
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

type ReturnReason = "wrong_prescription" | "wrong_optical" | "patient_not_ready" | "other"

type ModalState =
  | { type: "closed" }
  | { type: "view-invoice"; transactionId: string }
  | { type: "refund"; transactionId: string }
  | { type: "return-to-queue"; paymentRequestId: string }
```

### Mock data

- `mockShiftReconciliation: ShiftReconciliation` — hardcoded shift summary matching mockTransactions totals
- `mockTransactionDetails: Record<string, TransactionDetail>` — keyed by transaction ID, with line items and payment method entries for each
- `mockRefundableItems: Record<string, RefundableItem[]>` — keyed by transaction ID, derived from transaction line items

---

## 2. Hooks

### `useShiftClose()` — `hooks/use-shift-close.ts`

Manages shift close reconciliation state.

**State:**
- `reconciliation: ShiftReconciliation` — loaded from mock
- `cashActual: number | null` — cashier input
- `note: string` — textarea

**Derived:**
- `cashExpected`: `openingCash + cashCollected - cashChangeGiven`
- `difference`: `(cashActual ?? 0) - cashExpected`
- `differenceStatus`: `"match" | "over" | "short"`
- `canClose`: cashActual entered, and note required when difference !== 0
- `pendingCount`: number of items in mockPaymentRequests (patients still waiting)

**Methods:**
- `setCashActual(n: number)` — update cash count
- `setNote(s: string)` — update note
- `confirmClose()` — finalize (navigates back to dashboard)

### `useRefund(transactionId)` — `hooks/use-refund.ts`

Manages refund modal state.

**State:**
- `transaction: TransactionDetail` — loaded from mock
- `refundableItems: RefundableItem[]` — loaded from mock
- `selectedItemIds: Set<string>` — checkbox state
- `reasonCode: string` — select value
- `refundMethod: string` — select value (defaults to original method)
- `note: string` — textarea

**Derived:**
- `refundTotal`: sum of selected items' amounts
- `canConfirm`: at least 1 item selected, reasonCode set, note non-empty

**Methods:**
- `toggleItem(id: string)` — toggle checkbox (skip if alreadyRefunded)
- `setReasonCode(code: string)` — update reason
- `setRefundMethod(method: string)` — update method
- `setNote(note: string)` — update note
- `confirmRefund()` — execute refund

---

## 3. Shift Close Page

**Route:** `/payment/shift-close`
**File:** `pages/payment/shift-close.tsx`

Header with back button, "Chốt ca", metadata (shift type + time + cashier name).

**Layout:** 2-column below header.

**Left column:**
- `ShiftMetricCards` — 3 cards in a row: total revenue (+ transaction count), cash (+ count), non-cash (+ count)
- `ShiftBreakdownTable` — two shadcn Tables stacked: breakdown by payment method, breakdown by revenue category. Each has columns: name, count, amount. Footer row with bold total.

**Right column (sticky):**
- `ShiftCashReconciliation` — card with:
  - Read-only rows: Tiền đầu ca, Thu trong ca, Tiền thừa trả khách, Tiền mặt kỳ vọng
  - Input: Tiền mặt thực tế đếm được (VND formatted input, same pattern as payment method card)
  - Difference display: colored background per status (teal=match, amber=over, red=short)
  - Note textarea (required when difference !== 0)
  - Warning box about shift finality
  - Buttons: "In báo cáo ca" (outline) + "Xác nhận chốt ca" (primary teal)
  - If pendingCount > 0: amber warning + disable confirm button

**Components:**

| Component | File |
|---|---|
| `ShiftClosePage` | `pages/payment/shift-close.tsx` |
| `ShiftMetricCards` | `components/cashier/shift-metric-cards.tsx` |
| `ShiftBreakdownTable` | `components/cashier/shift-breakdown-table.tsx` |
| `ShiftCashReconciliation` | `components/cashier/shift-cash-reconciliation.tsx` |

---

## 4. View Invoice Modal

**File:** `components/cashier/view-invoice-modal.tsx`
**Props:** `transactionId: string, open: boolean, onClose: () => void, onRefund: (transactionId: string) => void`

Dialog, max-width 480px, max-height 90vh with overflow-y scroll.

**Header:**
- Transaction code `#GD-YYYYMMDD-XXX` (16px, font-weight 500)
- Status badge next to code (same colors as spec section 4.2)
- Dialog close button (X)

**Body:**
- Patient info grid (2-column): Bệnh nhân, Mã BN, SĐT, Thời gian, Thu ngân
- Line items grouped by category (same rendering as ReceiptCard: uppercase category labels, item rows)
- Totals: Tạm tính, Giảm giá (if any), Thành tiền
- Payment methods section

**Refund section** (only if transaction has refunds):
- Section header "Hoàn tiền"
- Each refund: items refunded, amount, reason, timestamp, cashier

**Footer:**
- "In lại" (outline) — calls window.print()
- "Hoàn tiền" (outline red) — calls onRefund(transactionId). Hidden if status === "refunded" (fully refunded)

**Status badge colors:**

| Status | Background | Text |
|---|---|---|
| paid (Đã thanh toán) | `#E1F5EE` | `#085041` |
| refunded (Đã hoàn tiền) | `#FCEBEB` | `#791F1F` |
| pending_refund (Hoàn một phần) | `#FAEEDA` | `#633806` |

---

## 5. Refund Modal

**File:** `components/cashier/refund-modal.tsx`
**Props:** `transactionId: string, open: boolean, onClose: () => void`

Dialog, max-width 460px.

**Header:** "Hoàn tiền" + close button

**Body:**
- Original invoice summary box (bg secondary): Mã HĐ, Tên BN, Tổng tiền gốc (12px)
- Checkbox list of refundable items:
  - Each row: checkbox + item description (+ quantity if > 1) + amount (right-aligned, 500 weight)
  - Already refunded items: checkbox disabled, "Đã hoàn" label
- Refund total box (bg red-50, text red-800): "Số tiền hoàn" + computed total. Auto-updates on checkbox change.
- Reason select: Tính sai dịch vụ, BN hủy dịch vụ, Hủy liệu trình, Bảo hành, Khác
- Refund method select: Phương thức gốc ({name}), Tiền mặt, Chuyển khoản. Default = original method.
- Note textarea (required)

**Footer:**
- "Hủy" (outline)
- "Xác nhận hoàn tiền" (red solid bg `#A32D2D`, white text). Disabled until canConfirm.

**Confirm dialog:** Before executing, show Dialog: "Xác nhận hoàn {amount}đ cho hóa đơn #{code}? Hành động này không thể hoàn tác." with Cancel + Confirm buttons.

---

## 6. Return to Queue Modal

**File:** `components/cashier/return-to-queue-modal.tsx`
**Props:** `paymentRequestId: string, open: boolean, onClose: () => void`

Dialog, max-width 420px.

**Header:** "Trả lại hàng đợi" + close button

**Body:**
- Patient info box (bg secondary): Họ tên, Mã BN, Thời gian chờ
- Radio group (stacked cards, border-connected):
  - "Đơn thuốc chưa đúng" — subtitle: "Trả về bác sĩ để chỉnh sửa đơn thuốc"
  - "Đơn kính chưa đúng" — subtitle: "Trả về trung tâm kính để chỉnh sửa"
  - "BN chưa sẵn sàng" — subtitle: "BN yêu cầu chờ hoặc rời PK tạm thời"
  - "Khác" — subtitle: "Nhập lý do ở ghi chú bên dưới"
- Each radio: 2 lines — label (13px) + description (11px, color secondary)
- Note textarea: optional unless "Khác" selected

**Footer:**
- "Hủy" (outline)
- "Xác nhận trả lại" (amber solid: bg `#FAEEDA`, text `#633806`). Disabled until reason selected (and note filled if "Khác").

---

## 7. Dashboard Wiring

**Modified:** `pages/payment/index.tsx`

- Add `modalState` state with discriminated union
- Pass `onViewInvoice`, `onRefund`, `onReturnToQueue` callbacks to table components
- Render all 3 modals at dashboard level, controlled by modalState
- "Chốt ca" button navigates to `/payment/shift-close`

**Modified:** `components/cashier/cashier-transactions-table.tsx`

- Accept `onViewInvoice(id)` and `onRefund(id)` props
- Wire dropdown menu items to these callbacks

**Modified:** `components/cashier/cashier-queue-table.tsx`

- Accept `onReturnToQueue(id)` prop
- Wire "Trả lại hàng đợi" menu item to callback

---

## 8. Routing

Add to `App.tsx`:
```
/payment/shift-close → ShiftClosePage
```

---

## 9. File Summary

**New files:**
- `src/hooks/use-shift-close.ts`
- `src/hooks/use-refund.ts`
- `src/pages/payment/shift-close.tsx`
- `src/components/cashier/shift-metric-cards.tsx`
- `src/components/cashier/shift-breakdown-table.tsx`
- `src/components/cashier/shift-cash-reconciliation.tsx`
- `src/components/cashier/view-invoice-modal.tsx`
- `src/components/cashier/refund-modal.tsx`
- `src/components/cashier/return-to-queue-modal.tsx`

**Modified files:**
- `src/data/mock-cashier.ts` — add types + mock data
- `src/App.tsx` — add shift-close route
- `src/pages/payment/index.tsx` — add modal state + wire actions + shift close navigation
- `src/components/cashier/cashier-transactions-table.tsx` — accept onViewInvoice/onRefund props
- `src/components/cashier/cashier-queue-table.tsx` — accept onReturnToQueue prop

**Total: 9 new files, 5 modified files**
