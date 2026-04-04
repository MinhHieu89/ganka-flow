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
