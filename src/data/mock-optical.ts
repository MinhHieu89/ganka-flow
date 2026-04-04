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
  gender: string
  age: number
  doctor: string
  rxOd: string
  rxOs: string
  rx: RxDetail
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

export interface RxEye {
  sph: number
  cyl: number
  axis: number
  add?: number
}

export interface RxDetail {
  od: RxEye
  os: RxEye
  pd: number
  ucvaOd: string
  bcvaOd: string
  ucvaOs: string
  bcvaOs: string
  lensType: string
  purpose: string
  doctor: string
  prescribedAt: string
  notes?: string
}

export interface TimelineStep {
  status: OrderStatus
  label: string
  completedAt?: string
  staffName?: string
}

export interface OrderDetailData extends OpticalOrder {
  rx: RxDetail
  frameBarcode: string
  lensType: string
  glassType: string
  framePrice: number
  lensPrice: number
  paymentStatus: "paid" | "partial" | "unpaid"
  timeline: TimelineStep[]
  notes?: string
}

export interface StockHistoryEntry {
  date: string
  type: "in" | "out"
  quantity: number
  note: string
}

export interface FrameDetail extends FrameItem {
  material: string
  size: string
  gender: string
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
}

export interface LensDetail extends LensItem {
  coating: string
  design: string
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
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
    gender: "Nam",
    age: 42,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-2.50 / -0.75 x 180",
    rxOs: "-3.00 / -1.00 x 175",
    rx: {
      od: { sph: -2.5, cyl: -0.75, axis: 180 },
      os: { sph: -3.0, cyl: -1.0, axis: 175 },
      pd: 64,
      ucvaOd: "20/80",
      bcvaOd: "20/20",
      ucvaOs: "20/100",
      bcvaOs: "20/20",
      lensType: "Đơn tròng",
      purpose: "Nhìn xa",
      doctor: "BS. Lê Minh Tuấn",
      prescribedAt: todayTimestamp(12),
    },
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(12),
  },
  {
    id: "oc-002",
    patientName: "Nguyễn Thị Lan",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0008`,
    gender: "Nữ",
    age: 58,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "+1.50 ADD +2.00",
    rxOs: "+1.75 ADD +2.00",
    rx: {
      od: { sph: 1.5, cyl: 0, axis: 0, add: 2.0 },
      os: { sph: 1.75, cyl: 0, axis: 0, add: 2.0 },
      pd: 62,
      ucvaOd: "20/40",
      bcvaOd: "20/20",
      ucvaOs: "20/40",
      bcvaOs: "20/20",
      lensType: "Đa tròng",
      purpose: "Nhìn xa + đọc sách",
      doctor: "BS. Phạm Anh Dũng",
      prescribedAt: todayTimestamp(8),
    },
    status: "in_consultation",
    assignedStaff: "Nguyễn Thị Mai",
    queuedAt: todayTimestamp(8),
  },
  {
    id: "oc-003",
    patientName: "Lê Hoàng Phúc",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0015`,
    gender: "Nam",
    age: 25,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-4.25 / -1.50 x 10",
    rxOs: "-3.75 / -1.25 x 170",
    rx: {
      od: { sph: -4.25, cyl: -1.5, axis: 10 },
      os: { sph: -3.75, cyl: -1.25, axis: 170 },
      pd: 66,
      ucvaOd: "20/200",
      bcvaOd: "20/20",
      ucvaOs: "20/150",
      bcvaOs: "20/20",
      lensType: "Đơn tròng",
      purpose: "Nhìn xa",
      doctor: "BS. Lê Minh Tuấn",
      prescribedAt: todayTimestamp(35),
    },
    status: "waiting_consultation",
    queuedAt: todayTimestamp(35),
  },
  {
    id: "oc-004",
    patientName: "Phạm Minh Châu",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0019`,
    gender: "Nữ",
    age: 31,
    doctor: "BS. Phạm Anh Dũng",
    rxOd: "-1.00 / -0.50 x 90",
    rxOs: "-1.25 / -0.50 x 85",
    rx: {
      od: { sph: -1.0, cyl: -0.5, axis: 90 },
      os: { sph: -1.25, cyl: -0.5, axis: 85 },
      pd: 60,
      ucvaOd: "20/40",
      bcvaOd: "20/20",
      ucvaOs: "20/50",
      bcvaOs: "20/20",
      lensType: "Đơn tròng",
      purpose: "Nhìn xa",
      doctor: "BS. Phạm Anh Dũng",
      prescribedAt: todayTimestamp(22),
    },
    status: "waiting_consultation",
    queuedAt: todayTimestamp(22),
  },
  {
    id: "oc-005",
    patientName: "Võ Thanh Tâm",
    patientId: `BN-${offsetDate(0).replace(/-/g, "")}-0021`,
    gender: "Nam",
    age: 35,
    doctor: "BS. Lê Minh Tuấn",
    rxOd: "-5.50 / -2.00 x 5",
    rxOs: "-5.00 / -1.75 x 175",
    rx: {
      od: { sph: -5.5, cyl: -2.0, axis: 5 },
      os: { sph: -5.0, cyl: -1.75, axis: 175 },
      pd: 65,
      ucvaOd: "20/400",
      bcvaOd: "20/20",
      ucvaOs: "20/300",
      bcvaOs: "20/20",
      lensType: "Đơn tròng",
      purpose: "Nhìn xa",
      doctor: "BS. Lê Minh Tuấn",
      prescribedAt: todayTimestamp(10),
    },
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

/** Format price with thousands separator: 2800000 → "2.800.000" */
export function formatPrice(price: number): string {
  return price.toLocaleString("vi-VN")
}

// ─── Detail Helpers ──────────────────────────────────────────────────────────

const statusSteps: { status: OrderStatus; label: string }[] = [
  { status: "ordered", label: "Đã đặt hàng" },
  { status: "fabricating", label: "Đang gia công" },
  { status: "ready_delivery", label: "Sẵn sàng giao" },
  { status: "delivered", label: "Đã giao" },
]

const defaultRx: RxDetail = {
  od: { sph: -2.5, cyl: -0.75, axis: 180 },
  os: { sph: -3.0, cyl: -1.0, axis: 175 },
  pd: 64,
  ucvaOd: "20/80",
  bcvaOd: "20/20",
  ucvaOs: "20/100",
  bcvaOs: "20/20",
  lensType: "Đơn tròng",
  purpose: "Nhìn xa",
  doctor: "BS. Lê Minh Tuấn",
  prescribedAt: todayTimestamp(0),
}

export function getOrderDetail(order: OpticalOrder): OrderDetailData {
  const statusIndex = statusSteps.findIndex((s) => s.status === order.status)

  const timeline: TimelineStep[] = statusSteps.map((step, i) => ({
    status: step.status,
    label: step.label,
    completedAt:
      i <= statusIndex
        ? i === 0
          ? order.orderDate
          : offsetDate(
              -Math.round(
                (new Date(offsetDate(0)).getTime() -
                  new Date(order.orderDate).getTime()) /
                  (1000 * 60 * 60 * 24) -
                  i
              )
            )
        : undefined,
    staffName: i <= statusIndex ? "Nguyễn Thị Mai" : undefined,
  }))

  const matchedFrame = mockFrames.find((f) =>
    order.frameName.toLowerCase().includes(f.name.split(" ")[0].toLowerCase())
  )
  const matchedLens = mockLenses.find((l) =>
    order.lensName.toLowerCase().includes(l.name.split(" ")[0].toLowerCase())
  )

  return {
    ...order,
    rx: defaultRx,
    frameBarcode: matchedFrame?.barcode ?? "GK-FR-00001",
    lensType: order.lensType,
    glassType: order.lensSpec,
    framePrice: matchedFrame?.price ?? 2800000,
    lensPrice: matchedLens?.price ?? 1800000,
    paymentStatus: order.status === "delivered" ? "paid" : "partial",
    timeline,
    notes: undefined,
  }
}

export function getFrameDetail(frame: FrameItem): FrameDetail {
  const materials: Record<string, string> = {
    Rayban: "Acetate + Kim loại",
    Oakley: "O-Matter",
    "Việt Pháp": "TR90",
  }
  const sizes: Record<string, string> = {
    Rayban: "51-21-145",
    Oakley: "53-18-143",
    "Việt Pháp": "52-17-140",
  }
  const genders: Record<string, string> = {
    Rayban: "Unisex",
    Oakley: "Nam",
    "Việt Pháp": "Unisex",
  }
  const origins: Record<string, string> = {
    Rayban: "Ý",
    Oakley: "Mỹ",
    "Việt Pháp": "Việt Nam",
  }

  return {
    ...frame,
    material: materials[frame.brand] ?? "Nhựa",
    size: sizes[frame.brand] ?? "52-18-140",
    gender: genders[frame.brand] ?? "Unisex",
    origin: origins[frame.brand] ?? "Không rõ",
    costPrice: Math.round(frame.price * 0.45),
    stockHistory: [
      {
        date: offsetDate(-30),
        type: "in",
        quantity: 20,
        note: "Nhập lô mới",
      },
      {
        date: offsetDate(-15),
        type: "out",
        quantity: 5,
        note: "Bán lẻ",
      },
      {
        date: offsetDate(-7),
        type: "out",
        quantity: 3,
        note: "Bán lẻ",
      },
    ],
  }
}

export function getLensDetail(lens: LensItem): LensDetail {
  const coatings: Record<string, string> = {
    Essilor: "Crizal",
    Hoya: "Super HiVision",
    "Việt Pháp": "UV420",
  }
  const designs: Record<string, string> = {
    "Đơn tròng": "Phi cầu",
    "Đa tròng": "Thiết kế tự do",
  }
  const origins: Record<string, string> = {
    Essilor: "Pháp",
    Hoya: "Nhật Bản",
    "Việt Pháp": "Việt Nam",
  }

  return {
    ...lens,
    coating: coatings[lens.brand] ?? "Tiêu chuẩn",
    design: designs[lens.type] ?? "Phi cầu",
    origin: origins[lens.brand] ?? "Không rõ",
    costPrice: Math.round(lens.price * 0.4),
    stockHistory: [
      {
        date: offsetDate(-25),
        type: "in",
        quantity: 30,
        note: "Nhập lô mới",
      },
      {
        date: offsetDate(-10),
        type: "out",
        quantity: 8,
        note: "Gia công đơn hàng",
      },
      {
        date: offsetDate(-3),
        type: "out",
        quantity: 2,
        note: "Gia công đơn hàng",
      },
    ],
  }
}
