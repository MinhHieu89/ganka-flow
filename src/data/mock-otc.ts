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
