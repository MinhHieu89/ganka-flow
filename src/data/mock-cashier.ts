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
  label: string
  startTime: string
  endTime: string
  closedAt?: string
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
  | { type: "view-detail"; paymentRequestId: string }
  | { type: "view-invoice"; transactionId: string }
  | { type: "refund"; transactionId: string }
  | { type: "return-to-queue"; paymentRequestId: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatVND(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ"
}

export function formatPhone(phone: string): string {
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

// ─── Payment Processing Mock Data ───────────────────────────────────────────

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
      description: "Phí khám chuyên khoa mắt",
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

// ─── Payment Request Detail Metadata ────────────────────────────────────────

export interface PaymentRequestMeta {
  doctorName: string
  visitType: string // "Lần khám mới" | "Tái khám"
}

export const mockPaymentRequestMeta: Record<string, PaymentRequestMeta> = {
  "pr-001": { doctorName: "BS. Trần Minh Đức", visitType: "Lần khám mới" },
  "pr-002": { doctorName: "BS. Nguyễn Hoàng Anh", visitType: "Tái khám" },
  "pr-003": { doctorName: "BS. Trần Minh Đức", visitType: "Lần khám mới" },
  "pr-004": { doctorName: "BS. Lê Thanh Hà", visitType: "Tái khám" },
  "pr-005": { doctorName: "BS. Trần Minh Đức", visitType: "Tái khám" },
}
