# Cashier Payment Processing — Implementation Design

**Scope:** Payment processing page + success/receipt page (screens 1 & 2 from cashier-payment-processing.md)
**Route base:** `/payment/process/:paymentRequestId` and `/payment/:paymentId/success`
**Approach:** Single-page state machine with `usePaymentProcessing` hook

---

## 1. Data Model

### New types (in `data/mock-cashier.ts`)

```typescript
interface PaymentLineItem {
  id: string
  category: PaymentCategory  // "exam" | "drug" | "optical" | "treatment"
  description: string
  quantity: number
  unitPrice: number
  lineTotal: number
  refId?: string
}

interface PaymentDiscount {
  type: "percent" | "fixed"
  value: number           // 1-100 for percent, VND amount for fixed
  reason: string
  appliedBy: string
  amount: number          // calculated VND amount
}

interface PaymentMethodEntry {
  id: string
  method: PaymentMethod
  amount: number
  cashReceived?: number
  cashChange?: number
}

interface CompletedPayment {
  id: string              // GD-YYYYMMDD-XXX
  paymentRequestId: string
  patient: PaymentPatientInfo
  items: PaymentLineItem[]
  discount: PaymentDiscount | null
  paymentMethods: PaymentMethodEntry[]
  subtotal: number
  discountAmount: number
  total: number
  cashierName: string
  completedAt: string     // ISO timestamp
}

interface PaymentPatientInfo {
  name: string
  code: string
  gender: string
  age: number
  phone: string
}
```

### Mock data

One mock `PaymentRequest` with full line items (exam + drug + optical) for the demo flow. The `mockPaymentRequests` array in `mock-cashier.ts` already has queue entries — extend with a `mockPaymentLineItems` map keyed by `paymentRequestId`.

---

## 2. Hooks

### `useClinic()` — `hooks/use-clinic.ts`

Returns static clinic info consumed by receipt, print headers, and any future component needing clinic details.

```typescript
interface ClinicInfo {
  name: string        // "Phòng khám mắt Ganka28"
  address: string     // "123 Nguyễn Văn Cừ, Q.5, TP.HCM"
  hotline: string     // "028 1234 5678"
  website: string     // "ganka28.vn"
}

export function useClinic(): ClinicInfo
```

Hardcoded for now. Later can pull from API/env config.

### `usePaymentProcessing(paymentRequestId)` — `hooks/use-payment-processing.ts`

Owns all payment processing state and calculations.

**State:**
- `patient: PaymentPatientInfo`
- `items: PaymentLineItem[]`
- `discount: PaymentDiscount | null`
- `paymentMethods: PaymentMethodEntry[]`

**Derived values:**
- `subtotal`: sum of all `item.lineTotal`
- `discountAmount`: calculated from discount
- `total`: `subtotal - discountAmount`
- `methodsTotal`: sum of all `paymentMethod.amount`
- `amountMismatch`: `methodsTotal !== total`
- `canConfirm`: boolean — all validation rules pass

**Methods:**
- `addDiscount(type, value, reason)` — applies discount, calculates amount
- `removeDiscount()` — clears discount
- `addPaymentMethod()` — adds empty method entry (max 3)
- `removePaymentMethod(id)` — removes a method entry
- `updatePaymentMethod(id, updates)` — changes method type or amount
- `updateCashReceived(id, amount)` — sets cash received, auto-calculates change
- `confirmPayment()` — returns `CompletedPayment` object

**Calculation rules:**
- Discount %: `Math.floor(subtotal * value / 100 / 1000) * 1000` (round down to nearest 1000đ)
- Discount fixed: `Math.min(value, subtotal)`
- `canConfirm` requires:
  - At least 1 payment method selected
  - `methodsTotal === total`
  - For each cash method: `cashReceived >= method.amount`

**Initial state:** Loads patient + line items from mock data by `paymentRequestId`. One default payment method (cash) with amount = total.

---

## 3. Page Components

### Payment Processing Page — `pages/payment/process.tsx`

Route: `/payment/process/:paymentRequestId`

Two-column layout (60/40). Left column scrollable, right column sticky.

**Left column:**
- `PatientInfoBar` — patient name, code, gender, age, phone
- `PaymentLineItems` — grouped by category with badges, subtotals
- `PaymentDiscount` — applied discount display or add-discount form

**Right column (sticky):**
- `PaymentSummary` — subtotal, discount line, grand total
- `PaymentMethodsSection` — list of method cards + add button
- System note box
- `PaymentActions` — Hủy, In tạm, Xác nhận thanh toán

**Navigation:**
- Back button → navigate to `/payment` with confirm dialog if data changed
- "Hủy" → same as back button
- "Xác nhận thanh toán" → call `confirmPayment()`, navigate to success page with payment in route state

### Payment Success Page — `pages/payment/success.tsx`

Route: `/payment/:paymentId/success`

Centered layout (max-width 520px). Reads `CompletedPayment` from route state (via `useLocation().state`).

**Structure:**
- Success icon (teal circle + check)
- Title + transaction code
- `ReceiptCard` — full receipt rendering
- Action buttons: "In biên lai", "Về dashboard"

---

## 4. Component Breakdown

### Shared / Reusable

| Component | File | Props |
|---|---|---|
| `PatientInfoBar` | `components/cashier/patient-info-bar.tsx` | `patient: PaymentPatientInfo` |
| `ReceiptCard` | `components/cashier/receipt-card.tsx` | `payment: CompletedPayment` |

`PatientInfoBar`: background secondary bar with name (500 weight), metadata line (code, gender, age), phone right-aligned.

`ReceiptCard`: Self-contained receipt component. Uses `useClinic()` for header. Renders: clinic header, patient grid, grouped line items, totals, payment methods (with cash detail), footer. Reusable in Xem hóa đơn modal (screen 4) and for printing.

### Payment Processing Components

| Component | File | Props/Notes |
|---|---|---|
| `PaymentLineItems` | `components/cashier/payment-line-items.tsx` | `items: PaymentLineItem[]` — groups by category, renders badges (reuses `CategoryBadge`), subtotals |
| `PaymentDiscount` | `components/cashier/payment-discount.tsx` | `discount, subtotal, onAdd, onRemove` — toggles between display and form |
| `PaymentSummary` | `components/cashier/payment-summary.tsx` | `subtotal, discountAmount, discountPercent, total, itemCount` |
| `PaymentMethodCard` | `components/cashier/payment-method-card.tsx` | Single method entry with dropdown, amount input, optional cash detail, remove button |
| `PaymentMethodsSection` | `components/cashier/payment-methods-section.tsx` | `methods[], onAdd, onRemove, onUpdate, onUpdateCash, canAddMore` |
| `PaymentActions` | `components/cashier/payment-actions.tsx` | `canConfirm, onCancel, onPrintPreview, onConfirm` |

### Confirm Dialog

Use existing shadcn `Dialog` for the "Hủy thanh toán?" confirmation when navigating away with unsaved data.

---

## 5. Routing Changes

Add to `App.tsx`:

```
/payment/process/:paymentRequestId  → PaymentProcessingPage
/payment/:paymentId/success         → PaymentSuccessPage
```

The existing `/payment` route (CashierDashboard) stays unchanged. The "Thanh toán" action in `CashierQueueTable` navigates to `/payment/process/:id`.

---

## 6. Interaction Details

### Discount form
- Click "+ Thêm giảm giá" → inline form appears (type select, value input, reason input)
- "Áp dụng" validates: value > 0, reason non-empty, percent 1-100, fixed <= subtotal
- Applied discount shows summary line with "Xóa" button
- Only 1 discount per invoice

### Payment methods
- Default: 1 cash method with amount = total
- Adding a method: new empty card, amount defaults to remaining balance
- Changing amount on one method: does NOT auto-adjust others (manual entry)
- When total of all methods != grand total: amber warning shown, confirm button disabled
- Max 3 methods
- Switching a method away from cash clears cashReceived/cashChange fields

### Cash detail
- "Tiền nhận" input appears only for cash methods
- "Tiền thừa" auto-calculates: `cashReceived - method.amount`
- Shown in teal (#0F6E56) with 500 weight
- If cashReceived < amount: field shows red border, confirm disabled

### Currency input formatting
- All VND inputs use `formatVND()` for display
- On focus: show raw number for editing
- On blur: format back to VND display
- Only allow numeric input (strip non-digits)

### Print preview ("In tạm")
- Opens `window.print()` or a print-friendly view of current state
- Available before confirming — lets cashier preview the receipt

### Auto-print on success
- Success page triggers `window.print()` on mount if receipt data is present
- "In biên lai" button allows re-printing

---

## 7. File Summary

**New files:**
- `src/hooks/use-clinic.ts`
- `src/hooks/use-payment-processing.ts`
- `src/pages/payment/process.tsx`
- `src/pages/payment/success.tsx`
- `src/components/cashier/patient-info-bar.tsx`
- `src/components/cashier/payment-line-items.tsx`
- `src/components/cashier/payment-discount.tsx`
- `src/components/cashier/payment-summary.tsx`
- `src/components/cashier/payment-method-card.tsx`
- `src/components/cashier/payment-methods-section.tsx`
- `src/components/cashier/payment-actions.tsx`
- `src/components/cashier/receipt-card.tsx`

**Modified files:**
- `src/App.tsx` — add 2 routes
- `src/data/mock-cashier.ts` — add types + mock line items data
- `src/components/cashier/cashier-queue-table.tsx` — wire "Thanh toán" action to navigate to process page

**Total: 12 new files, 3 modified files**
