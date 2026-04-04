import { offsetDate, todayTimestamp } from "@/lib/demo-date"

// ─── Types ───────────────────────────────────────────────────────────────────

export type PrescriptionStatus = "pending" | "dispensed"

export interface MedicationSubstitution {
  name: string
  group: string
  stockQuantity: number
  unit: string
}

export interface PrescriptionMedication {
  id: string
  name: string
  group: string
  dosage: string
  quantity: number
  unit: string
  stockQuantity: number
  isOutOfStock: boolean
  substitution?: MedicationSubstitution
}

export interface PrescriptionOrder {
  id: string
  patientName: string
  patientId: string
  doctorName: string
  diagnosis: string
  icdCode?: string
  prescribedAt: string // ISO
  dispensedAt?: string // ISO
  expiresAt: string // ISO
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  doctorNotes?: string
  allergies?: string[]
  substitutionReason?: string
  dispensedBy?: string
  dispensedItems?: DispensedItem[]
}

export interface DispensedItem {
  originalMedication: string
  dispensedMedication: string
  isSubstituted: boolean
  dosage: string
  quantity: number
  unit: string
}

export interface PharmacyMetrics {
  pendingCount: number
  dispensedToday: number
  lowStockAlerts: number
}

export interface MedicationCatalogItem {
  id: string
  name: string
  group: string
  stockQuantity: number
  unit: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns ISO date string for N days from now */
export function expiresIn(days: number): string {
  return offsetDate(days)
}

/** Derives pharmacy metrics from a prescription array */
export function getPharmacyMetrics(
  prescriptions: PrescriptionOrder[],
): PharmacyMetrics {
  const pendingCount = prescriptions.filter((p) => p.status === "pending").length
  const dispensedToday = prescriptions.filter(
    (p) => p.status === "dispensed",
  ).length
  const lowStockAlerts = prescriptions
    .flatMap((p) => p.medications)
    .filter((m) => !m.isOutOfStock && m.stockQuantity > 0 && m.stockQuantity <= 10)
    .length

  return { pendingCount, dispensedToday, lowStockAlerts }
}

// ─── Mock Prescriptions ───────────────────────────────────────────────────────

export const mockPrescriptions: PrescriptionOrder[] = [
  // RX-001 — Trần Văn Minh — Khô mắt mức độ trung bình
  {
    id: "RX-001",
    patientName: "Trần Văn Minh",
    patientId: "BN-20260403-0012",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Khô mắt mức độ trung bình",
    icdCode: "H04.1",
    prescribedAt: todayTimestamp(18),
    expiresAt: expiresIn(30),
    status: "pending",
    allergies: ["Chloramphenicol"],
    doctorNotes:
      "Bệnh nhân dùng Omega-3 liều cao. Tái khám sau 4 tuần.",
    substitutionReason:
      "Lotemax hiện hết hàng, thay thế bằng FML cùng nhóm corticosteroid nhỏ mắt.",
    medications: [
      {
        id: "MED-001-1",
        name: "Refresh Tears",
        group: "Nước mắt nhân tạo",
        dosage: "Nhỏ 1–2 giọt mỗi mắt, 4 lần/ngày",
        quantity: 2,
        unit: "lọ",
        stockQuantity: 48,
        isOutOfStock: false,
      },
      {
        id: "MED-001-2",
        name: "Systane Gel",
        group: "Gel nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "tuýp",
        stockQuantity: 22,
        isOutOfStock: false,
      },
      {
        id: "MED-001-3",
        name: "Omega-3",
        group: "Thực phẩm chức năng",
        dosage: "Uống 2 viên/ngày sau ăn",
        quantity: 60,
        unit: "viên",
        stockQuantity: 120,
        isOutOfStock: false,
      },
      {
        id: "MED-001-4",
        name: "Lotemax",
        group: "Corticosteroid nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 2 lần/ngày trong 2 tuần",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 0,
        isOutOfStock: true,
        substitution: {
          name: "FML",
          group: "Corticosteroid nhỏ mắt",
          stockQuantity: 15,
          unit: "lọ",
        },
      },
    ],
  },

  // RX-002 — Lê Thị Hoa — Viêm kết mạc dị ứng
  {
    id: "RX-002",
    patientName: "Lê Thị Hoa",
    patientId: "BN-20260403-0008",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Viêm kết mạc dị ứng",
    icdCode: "H10.1",
    prescribedAt: todayTimestamp(31),
    expiresAt: expiresIn(14),
    status: "pending",
    medications: [
      {
        id: "MED-002-1",
        name: "Opatanol",
        group: "Kháng histamin nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 2 lần/ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 9,
        isOutOfStock: false,
      },
      {
        id: "MED-002-2",
        name: "Prednisolone",
        group: "Corticosteroid nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 3 lần/ngày trong 5 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 30,
        isOutOfStock: false,
      },
    ],
  },

  // RX-003 — Nguyễn Hoàng Nam — Cận thị tiến triển
  {
    id: "RX-003",
    patientName: "Nguyễn Hoàng Nam",
    patientId: "BN-20260403-0005",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Cận thị tiến triển",
    icdCode: "H52.1",
    prescribedAt: todayTimestamp(43),
    expiresAt: expiresIn(30),
    status: "pending",
    medications: [
      {
        id: "MED-003-1",
        name: "Atropine",
        group: "Thuốc giãn đồng tử",
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 18,
        isOutOfStock: false,
      },
      {
        id: "MED-003-2",
        name: "Refresh Tears",
        group: "Nước mắt nhân tạo",
        dosage: "Nhỏ 1–2 giọt mỗi mắt, 3 lần/ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 48,
        isOutOfStock: false,
      },
      {
        id: "MED-003-3",
        name: "Omega-3",
        group: "Thực phẩm chức năng",
        dosage: "Uống 1 viên/ngày sau ăn",
        quantity: 30,
        unit: "viên",
        stockQuantity: 120,
        isOutOfStock: false,
      },
    ],
  },

  // RX-004 — Phạm Thị Mai — Khô mắt nặng — bội nhiễm
  {
    id: "RX-004",
    patientName: "Phạm Thị Mai",
    patientId: "BN-20260402-0041",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Khô mắt nặng — bội nhiễm",
    prescribedAt: todayTimestamp(58),
    expiresAt: expiresIn(14),
    status: "pending",
    medications: [
      {
        id: "MED-004-1",
        name: "Systane Ultra",
        group: "Nước mắt nhân tạo",
        dosage: "Nhỏ 1–2 giọt mỗi mắt, 6 lần/ngày",
        quantity: 2,
        unit: "lọ",
        stockQuantity: 35,
        isOutOfStock: false,
      },
      {
        id: "MED-004-2",
        name: "Tobramycin",
        group: "Kháng sinh nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 4 lần/ngày trong 7 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 12,
        isOutOfStock: false,
      },
      {
        id: "MED-004-3",
        name: "Prednisolone",
        group: "Corticosteroid nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 2 lần/ngày trong 7 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 30,
        isOutOfStock: false,
      },
      {
        id: "MED-004-4",
        name: "Optive Plus",
        group: "Gel nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "tuýp",
        stockQuantity: 7,
        isOutOfStock: false,
      },
      {
        id: "MED-004-5",
        name: "Omega-3",
        group: "Thực phẩm chức năng",
        dosage: "Uống 2 viên/ngày sau ăn",
        quantity: 30,
        unit: "viên",
        stockQuantity: 120,
        isOutOfStock: false,
      },
    ],
  },

  // RX-005 — Vũ Đức Anh — Viêm bờ mi
  {
    id: "RX-005",
    patientName: "Vũ Đức Anh",
    patientId: "BN-20260403-0003",
    doctorName: "BS. Nguyễn Hải",
    diagnosis: "Viêm bờ mi",
    icdCode: "H01.0",
    prescribedAt: todayTimestamp(73),
    expiresAt: expiresIn(21),
    status: "pending",
    medications: [
      {
        id: "MED-005-1",
        name: "Moxifloxacin",
        group: "Kháng sinh nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 3 lần/ngày trong 10 ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 6,
        isOutOfStock: false,
      },
      {
        id: "MED-005-2",
        name: "FML",
        group: "Corticosteroid nhỏ mắt",
        dosage: "Nhỏ 1 giọt mỗi mắt, 2 lần/ngày trong 2 tuần",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 15,
        isOutOfStock: false,
      },
    ],
  },

  // RX-006 — Đỗ Thị Thanh — Khô mắt nhẹ (dispensed)
  {
    id: "RX-006",
    patientName: "Đỗ Thị Thanh",
    patientId: "BN-20260403-0001",
    doctorName: "BS. Trần Minh Đức",
    diagnosis: "Khô mắt nhẹ",
    icdCode: "H04.1",
    prescribedAt: todayTimestamp(120),
    dispensedAt: todayTimestamp(95),
    expiresAt: expiresIn(30),
    status: "dispensed",
    dispensedBy: "Nguyễn Thị Lan",
    dispensedItems: [
      {
        originalMedication: "Refresh Tears",
        dispensedMedication: "Refresh Tears",
        isSubstituted: false,
        dosage: "Nhỏ 1–2 giọt mỗi mắt, 3 lần/ngày",
        quantity: 1,
        unit: "lọ",
      },
      {
        originalMedication: "Systane Ultra",
        dispensedMedication: "Systane Ultra",
        isSubstituted: false,
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "lọ",
      },
      {
        originalMedication: "Omega-3",
        dispensedMedication: "Omega-3",
        isSubstituted: false,
        dosage: "Uống 1 viên/ngày sau ăn",
        quantity: 30,
        unit: "viên",
      },
    ],
    medications: [
      {
        id: "MED-006-1",
        name: "Refresh Tears",
        group: "Nước mắt nhân tạo",
        dosage: "Nhỏ 1–2 giọt mỗi mắt, 3 lần/ngày",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 48,
        isOutOfStock: false,
      },
      {
        id: "MED-006-2",
        name: "Systane Ultra",
        group: "Nước mắt nhân tạo",
        dosage: "Nhỏ 1 giọt mỗi mắt trước khi ngủ",
        quantity: 1,
        unit: "lọ",
        stockQuantity: 35,
        isOutOfStock: false,
      },
      {
        id: "MED-006-3",
        name: "Omega-3",
        group: "Thực phẩm chức năng",
        dosage: "Uống 1 viên/ngày sau ăn",
        quantity: 30,
        unit: "viên",
        stockQuantity: 120,
        isOutOfStock: false,
      },
    ],
  },
]

// ─── Medication Catalog ───────────────────────────────────────────────────────

export const medicationCatalog: MedicationCatalogItem[] = [
  {
    id: "CAT-001",
    name: "FML",
    group: "Corticosteroid nhỏ mắt",
    stockQuantity: 15,
    unit: "lọ",
  },
  {
    id: "CAT-002",
    name: "Prednisolone",
    group: "Corticosteroid nhỏ mắt",
    stockQuantity: 30,
    unit: "lọ",
  },
  {
    id: "CAT-003",
    name: "Refresh Tears",
    group: "Nước mắt nhân tạo",
    stockQuantity: 48,
    unit: "lọ",
  },
  {
    id: "CAT-004",
    name: "Systane Ultra",
    group: "Nước mắt nhân tạo",
    stockQuantity: 35,
    unit: "lọ",
  },
  {
    id: "CAT-005",
    name: "Optive Plus",
    group: "Gel nhỏ mắt",
    stockQuantity: 7,
    unit: "tuýp",
  },
  {
    id: "CAT-006",
    name: "Tobramycin",
    group: "Kháng sinh nhỏ mắt",
    stockQuantity: 12,
    unit: "lọ",
  },
  {
    id: "CAT-007",
    name: "Moxifloxacin",
    group: "Kháng sinh nhỏ mắt",
    stockQuantity: 6,
    unit: "lọ",
  },
  {
    id: "CAT-008",
    name: "Opatanol",
    group: "Kháng histamin nhỏ mắt",
    stockQuantity: 9,
    unit: "lọ",
  },
  {
    id: "CAT-009",
    name: "Omega-3",
    group: "Thực phẩm chức năng",
    stockQuantity: 120,
    unit: "viên",
  },
  {
    id: "CAT-010",
    name: "Atropine",
    group: "Thuốc giãn đồng tử",
    stockQuantity: 18,
    unit: "lọ",
  },
]
