import { offsetDate, todayTimestamp } from "@/lib/demo-date"

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConsultationStatus = "waiting_consultation" | "in_consultation"
export type OrderStatus =
  | "ordered"
  | "fabricating"
  | "ready_delivery"
  | "delivered"

export interface OpticalConsultation {
  id: string
  patientName: string
  patientId: string
  doctor: string
  rxOd: string
  rxOs: string
  status: ConsultationStatus
  assignedStaff?: string
  queuedAt: string
}

export interface OpticalOrder {
  id: string
  patientName: string
  patientId: string
  lensType: string
  frameName: string
  frameColor: string
  lensName: string
  lensSpec: string
  orderDate: string
  status: OrderStatus
  deliveredAt?: string
  phone?: string
}

export interface FrameItem {
  barcode: string
  name: string
  brand: string
  color: string
  price: number
  stock: number
  lowStockThreshold: number
}

export interface LensItem {
  code: string
  name: string
  brand: string
  refractiveIndex: string
  type: string
  price: number
  stock: number
  lowStockThreshold: number
}

export interface ConsultationMetrics {
  waitingCount: number
  consultingCount: number
  ordersCreatedToday: number
  deliveredToday: number
}

export interface OrderMetrics {
  orderedCount: number
  fabricatingCount: number
  readyCount: number
  deliveredToday: number
}

export interface InventoryMetrics {
  totalFrames: number
  totalLenses: number
  lowStockCount: number
}

// ─── Mock Consultations ─────────────────────────────────────────────────────

export const mockConsultations: OpticalConsultation[] = [
  {
    id: "oc-001",
    patientName: "Trần Văn Hùng",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0012`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-2.50 / -0.75 x 180",
    rxOs: "-3.00 / -1.00 x 175",
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(12),
  },
  {
    id: "oc-002",
    patientName: "Nguyễn Thị Lan",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0008`,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "+1.50 ADD +2.00",
    rxOs: "+1.75 ADD +2.00",
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(8),
  },
  {
    id: "oc-003",
    patientName: "Lê Hoàng Phúc",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0015`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-4.25 / -1.50 x 10",
    rxOs: "-3.75 / -1.25 x 170",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(35),
  },
  {
    id: "oc-004",
    patientName: "Phạm Minh Châu",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0019`,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "-1.00 / -0.50 x 90",
    rxOs: "-1.25 / -0.50 x 85",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(22),
  },
  {
    id: "oc-005",
    patientName: "Võ Thanh Tâm",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0021`,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-5.50 / -2.00 x 5",
    rxOs: "-5.00 / -1.75 x 175",
    status: "waiting_consultation",
    queuedAt: todayTimestamp(10),
  },
]

// ─── Mock Orders ────────────────────────────────────────────────────────────

export const mockOrders: OpticalOrder[] = [
  {
    id: `DK-${offsetDate(-3).replace(/-/g, "")}-001`,
    patientName: "Lê Hoàng Phúc",
    patientId: `BN-${offsetDate(-3).replace(/-/g, "")}-0003`,
    lensType: "Kính cận",
    frameName: "Rayban RB5154",
    frameColor: "Đen nhám",
    lensName: "Essilor Crizal Alizé",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-3),
    status: "ordered",
    phone: "0901234567",
  },
  {
    id: `DK-${offsetDate(-3).replace(/-/g, "")}-002`,
    patientName: "Nguyễn Văn An",
    patientId: `BN-${offsetDate(-3).replace(/-/g, "")}-0007`,
    lensType: "Kính cận",
    frameName: "Oakley OX8046",
    frameColor: "Xanh navy",
    lensName: "Hoya BlueControl",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-3),
    status: "ordered",
    phone: "0912345678",
  },
  {
    id: `DK-${offsetDate(-2).replace(/-/g, "")}-001`,
    patientName: "Trần Thị Bích",
    patientId: `BN-${offsetDate(-2).replace(/-/g, "")}-0001`,
    lensType: "Kính đa tròng",
    frameName: "Việt Pháp VP2201",
    frameColor: "Vàng hồng",
    lensName: "Essilor Varilux",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-2),
    status: "ordered",
    phone: "0923456789",
  },
  {
    id: `DK-${offsetDate(-5).replace(/-/g, "")}-003`,
    patientName: "Phạm Quốc Bảo",
    patientId: `BN-${offsetDate(-5).replace(/-/g, "")}-0005`,
    lensType: "Kính cận",
    frameName: "Rayban RB7047",
    frameColor: "Nâu tortoise",
    lensName: "Hoya Nulux",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-5),
    status: "fabricating",
    phone: "0934567890",
  },
  {
    id: `DK-${offsetDate(-4).replace(/-/g, "")}-001`,
    patientName: "Võ Minh Tâm",
    patientId: `BN-${offsetDate(-4).replace(/-/g, "")}-0002`,
    lensType: "Kính lão",
    frameName: "Việt Pháp VP1105",
    frameColor: "Bạc",
    lensName: "Việt Pháp Titan",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-4),
    status: "fabricating",
    phone: "0945678901",
  },
  {
    id: `DK-${offsetDate(-4).replace(/-/g, "")}-002`,
    patientName: "Đặng Thu Hà",
    patientId: `BN-${offsetDate(-4).replace(/-/g, "")}-0006`,
    lensType: "Kính cận",
    frameName: "Oakley OX3227",
    frameColor: "Đen bóng",
    lensName: "Essilor Crizal Prevencia",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-4),
    status: "fabricating",
    phone: "0956789012",
  },
  {
    id: `DK-${offsetDate(-7).replace(/-/g, "")}-001`,
    patientName: "Hoàng Thị Mai",
    patientId: `BN-${offsetDate(-7).replace(/-/g, "")}-0004`,
    lensType: "Kính cận",
    frameName: "Rayban RB5228",
    frameColor: "Đen",
    lensName: "Hoya Diamond",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-7),
    status: "ready_delivery",
    phone: "0967890123",
  },
  {
    id: `DK-${offsetDate(-6).replace(/-/g, "")}-002`,
    patientName: "Lý Quang Vinh",
    patientId: `BN-${offsetDate(-6).replace(/-/g, "")}-0008`,
    lensType: "Kính mát có độ",
    frameName: "Oakley OO9102",
    frameColor: "Đen mờ",
    lensName: "Essilor Xperio",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-6),
    status: "ready_delivery",
    phone: "0978901234",
  },
  {
    id: `DK-${offsetDate(-10).replace(/-/g, "")}-001`,
    patientName: "Trần Minh Đức",
    patientId: `BN-${offsetDate(-10).replace(/-/g, "")}-0001`,
    lensType: "Kính cận",
    frameName: "Việt Pháp VP3302",
    frameColor: "Xám",
    lensName: "Việt Pháp UV420",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-10),
    status: "delivered",
    deliveredAt: offsetDate(0),
    phone: "0989012345",
  },
  {
    id: `DK-${offsetDate(-9).replace(/-/g, "")}-002`,
    patientName: "Nguyễn Hồng Nhung",
    patientId: `BN-${offsetDate(-9).replace(/-/g, "")}-0003`,
    lensType: "Kính cận",
    frameName: "Rayban RB5154",
    frameColor: "Nâu",
    lensName: "Essilor Crizal Alizé",
    lensSpec: "Chiết suất 1.60",
    orderDate: offsetDate(-9),
    status: "delivered",
    deliveredAt: offsetDate(0),
    phone: "0990123456",
  },
  {
    id: `DK-${offsetDate(-12).replace(/-/g, "")}-001`,
    patientName: "Lê Thị Hoa",
    patientId: `BN-${offsetDate(-12).replace(/-/g, "")}-0005`,
    lensType: "Kính lão",
    frameName: "Việt Pháp VP1105",
    frameColor: "Vàng",
    lensName: "Việt Pháp Titan",
    lensSpec: "Chiết suất 1.56",
    orderDate: offsetDate(-12),
    status: "delivered",
    deliveredAt: offsetDate(-1),
    phone: "0901234568",
  },
  {
    id: `DK-${offsetDate(-14).replace(/-/g, "")}-003`,
    patientName: "Bùi Văn Sơn",
    patientId: `BN-${offsetDate(-14).replace(/-/g, "")}-0009`,
    lensType: "Kính đa tròng",
    frameName: "Oakley OX8046",
    frameColor: "Đen",
    lensName: "Essilor Varilux",
    lensSpec: "Chiết suất 1.67",
    orderDate: offsetDate(-14),
    status: "delivered",
    deliveredAt: offsetDate(-2),
    phone: "0912345679",
  },
]

// ─── Mock Frames ────────────────────────────────────────────────────────────

export const mockFrames: FrameItem[] = [
  {
    barcode: "GK-FR-00001",
    name: "RB5154 Clubmaster",
    brand: "Rayban",
    color: "Đen nhám",
    price: 2800000,
    stock: 12,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00002",
    name: "RB7047",
    brand: "Rayban",
    color: "Nâu tortoise",
    price: 3200000,
    stock: 8,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00003",
    name: "OX8046 Airdrop",
    brand: "Oakley",
    color: "Xanh navy",
    price: 3500000,
    stock: 6,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00004",
    name: "VP2201",
    brand: "Việt Pháp",
    color: "Vàng hồng",
    price: 850000,
    stock: 2,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00005",
    name: "VP1105",
    brand: "Việt Pháp",
    color: "Bạc",
    price: 750000,
    stock: 1,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00006",
    name: "RB5228",
    brand: "Rayban",
    color: "Đen",
    price: 2600000,
    stock: 15,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00007",
    name: "OX3227",
    brand: "Oakley",
    color: "Đen bóng",
    price: 3800000,
    stock: 0,
    lowStockThreshold: 3,
  },
  {
    barcode: "GK-FR-00008",
    name: "VP3302",
    brand: "Việt Pháp",
    color: "Xám",
    price: 900000,
    stock: 10,
    lowStockThreshold: 3,
  },
]

// ─── Mock Lenses ────────────────────────────────────────────────────────────

export const mockLenses: LensItem[] = [
  {
    code: "GK-LN-001",
    name: "Crizal Alizé UV",
    brand: "Essilor",
    refractiveIndex: "1.60",
    type: "Đơn tròng",
    price: 1800000,
    stock: 20,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-002",
    name: "Crizal Prevencia",
    brand: "Essilor",
    refractiveIndex: "1.60",
    type: "Đơn tròng",
    price: 2200000,
    stock: 15,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-003",
    name: "Varilux Comfort Max",
    brand: "Essilor",
    refractiveIndex: "1.67",
    type: "Đa tròng",
    price: 5500000,
    stock: 8,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-004",
    name: "BlueControl",
    brand: "Hoya",
    refractiveIndex: "1.56",
    type: "Đơn tròng",
    price: 1200000,
    stock: 25,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-005",
    name: "Nulux EP",
    brand: "Hoya",
    refractiveIndex: "1.60",
    type: "Đơn tròng",
    price: 1600000,
    stock: 3,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-006",
    name: "Diamond Finish",
    brand: "Hoya",
    refractiveIndex: "1.67",
    type: "Đơn tròng",
    price: 2800000,
    stock: 10,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-007",
    name: "Titan UV420",
    brand: "Việt Pháp",
    refractiveIndex: "1.56",
    type: "Đơn tròng",
    price: 450000,
    stock: 40,
    lowStockThreshold: 5,
  },
  {
    code: "GK-LN-008",
    name: "Xperio Polarised",
    brand: "Essilor",
    refractiveIndex: "1.60",
    type: "Đơn tròng",
    price: 3200000,
    stock: 2,
    lowStockThreshold: 5,
  },
]

// ─── Metric Helpers ─────────────────────────────────────────────────────────

export function getConsultationMetrics(
  consultations: OpticalConsultation[],
  orders: OpticalOrder[]
): ConsultationMetrics {
  const today = offsetDate(0)
  return {
    waitingCount: consultations.filter(
      (c) => c.status === "waiting_consultation"
    ).length,
    consultingCount: consultations.filter((c) => c.status === "in_consultation")
      .length,
    ordersCreatedToday: orders.filter((o) => o.orderDate === today).length,
    deliveredToday: orders.filter(
      (o) => o.status === "delivered" && o.deliveredAt === today
    ).length,
  }
}

export function getOrderMetrics(orders: OpticalOrder[]): OrderMetrics {
  const today = offsetDate(0)
  return {
    orderedCount: orders.filter((o) => o.status === "ordered").length,
    fabricatingCount: orders.filter((o) => o.status === "fabricating").length,
    readyCount: orders.filter((o) => o.status === "ready_delivery").length,
    deliveredToday: orders.filter(
      (o) => o.status === "delivered" && o.deliveredAt === today
    ).length,
  }
}

export function getInventoryMetrics(
  frames: FrameItem[],
  lenses: LensItem[]
): InventoryMetrics {
  const lowFrames = frames.filter((f) => f.stock <= f.lowStockThreshold).length
  const lowLenses = lenses.filter((l) => l.stock <= l.lowStockThreshold).length
  return {
    totalFrames: frames.length,
    totalLenses: lenses.length,
    lowStockCount: lowFrames + lowLenses,
  }
}

/** Format price with thousands separator: 2800000 → "2,800,000" */
export function formatPrice(price: number): string {
  return price.toLocaleString("en-US")
}
