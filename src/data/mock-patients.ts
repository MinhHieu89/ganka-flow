export type PatientStatus =
  | "chua_den"
  | "cho_kham"
  | "dang_sang_loc"
  | "dang_kham"
  | "hoan_thanh"
  | "da_huy"

export type PatientSource = "hen" | "walk_in"

export interface Patient {
  id: string // GK-YYYY-NNNN
  name: string
  gender: "Nam" | "Nữ" | "Khác"
  dob: string // dd/mm/yyyy
  birthYear: number
  phone: string
  email?: string
  address?: string
  occupation?: string
  cccd?: string
  chiefComplaint?: string
  eyeHistory?: string
  systemicHistory?: string
  currentMedications?: string
  allergies?: string
  screenTime?: number
  workEnvironment?: string
  contactLens?: string
  lifestyleNotes?: string
  createdAt: string // ISO date
}

export interface Visit {
  id: string
  patientId: string
  status: PatientStatus
  source: PatientSource
  reason?: string
  scheduledAt?: string // HH:mm
  checkedInAt?: string // ISO datetime
  date: string // yyyy-mm-dd
  doctorName?: string
  lastVisitDate?: string
  lastVisitDiagnosis?: string
  lastVisitDoctor?: string
  screeningData?: ScreeningFormData
}

export interface ScreeningFormData {
  chiefComplaint: string
  ucvaOd: string
  ucvaOs: string
  currentRxOd: string
  currentRxOs: string
  redFlags: {
    eyePain: boolean
    suddenVisionLoss: boolean
    asymmetry: boolean
  }
  symptoms: {
    dryEyes: boolean
    gritty: boolean
    blurry: boolean
    tearing: boolean
    itchy: boolean
    headache: boolean
  }
  blinkImprovement: "yes" | "no" | "unclear" | null
  symptomDuration: number
  symptomDurationUnit: "ngày" | "tuần" | "tháng" | "năm"
  screenTime: string
  contactLens: "yes" | "no" | null
  discomfortLevel: "mild" | "moderate" | "severe" | null
  notes: string
}

export const STATUS_CONFIG: Record<
  PatientStatus,
  { label: string; color: string }
> = {
  chua_den: { label: "Chưa đến", color: "text-purple-600" },
  cho_kham: { label: "Chờ khám", color: "text-amber-500" },
  dang_sang_loc: { label: "Đang sàng lọc", color: "text-sky-500" },
  dang_kham: { label: "Đang khám", color: "text-blue-600" },
  hoan_thanh: { label: "Hoàn thành", color: "text-emerald-600" },
  da_huy: { label: "Đã hủy", color: "text-gray-500" },
}

export const SOURCE_CONFIG: Record<
  PatientSource,
  { label: string; color: string }
> = {
  hen: { label: "Hẹn", color: "text-purple-600" },
  walk_in: { label: "Walk-in", color: "text-rose-500" },
}

let patientCounter = 6

export function generatePatientId(): string {
  const year = new Date().getFullYear()
  const id = `GK-${year}-${String(patientCounter).padStart(4, "0")}`
  patientCounter++
  return id
}

export const mockPatients: Patient[] = [
  {
    id: "GK-2026-0001",
    name: "Nguyễn Văn An",
    gender: "Nam",
    dob: "15/03/1985",
    birthYear: 1985,
    phone: "0912345678",
    occupation: "Kỹ sư phần mềm",
    address: "123 Phố Huế, Hai Bà Trưng, Hà Nội",
    screenTime: 10,
    workEnvironment: "Văn phòng",
    createdAt: "2026-03-15T10:00:00Z",
  },
  {
    id: "GK-2026-0002",
    name: "Trần Thị Bình",
    gender: "Nữ",
    dob: "22/07/1992",
    birthYear: 1992,
    phone: "0987654321",
    email: "binh.tran@email.com",
    occupation: "Nhân viên văn phòng",
    address: "45 Kim Mã, Ba Đình, Hà Nội",
    chiefComplaint: "Khô mắt, mỏi mắt",
    eyeHistory: "Cận thị từ nhỏ",
    allergies: "Penicillin",
    screenTime: 8,
    workEnvironment: "Văn phòng",
    contactLens: "Thỉnh thoảng",
    createdAt: "2026-01-10T09:00:00Z",
  },
  {
    id: "GK-2026-0003",
    name: "Lê Hoàng Cường",
    gender: "Nam",
    dob: "10/11/1978",
    birthYear: 1978,
    phone: "0901234567",
    occupation: "Giáo viên",
    chiefComplaint: "Giảm thị lực",
    systemicHistory: "Tiểu đường type 2",
    currentMedications: "Metformin 500mg",
    createdAt: "2026-02-20T14:00:00Z",
  },
  {
    id: "GK-2026-0004",
    name: "Phạm Minh Đức",
    gender: "Nam",
    dob: "05/06/2001",
    birthYear: 2001,
    phone: "0978123456",
    chiefComplaint: "Đau mắt đỏ",
    createdAt: "2026-04-01T08:30:00Z",
  },
  {
    id: "GK-2026-0005",
    name: "Vũ Thị Em",
    gender: "Nữ",
    dob: "18/09/1965",
    birthYear: 1965,
    phone: "0965432100",
    occupation: "Hưu trí",
    chiefComplaint: "Tái khám khô mắt",
    eyeHistory: "Đã Lasik 2018",
    screenTime: 3,
    createdAt: "2026-01-05T11:00:00Z",
  },
]

export const mockVisits: Visit[] = [
  {
    id: "v1",
    patientId: "GK-2026-0001",
    status: "chua_den",
    source: "hen",
    scheduledAt: "14:00",
    date: "2026-04-01",
  },
  {
    id: "v2",
    patientId: "GK-2026-0002",
    status: "cho_kham",
    source: "hen",
    reason: "Khô mắt, mỏi mắt",
    scheduledAt: "13:30",
    checkedInAt: "2026-04-01T13:25:00Z",
    date: "2026-04-01",
    lastVisitDate: "15/01/2026",
    lastVisitDiagnosis: "Khô mắt",
    lastVisitDoctor: "BS. Nguyễn Hải",
  },
  {
    id: "v3",
    patientId: "GK-2026-0003",
    status: "dang_sang_loc",
    source: "hen",
    reason: "Giảm thị lực",
    scheduledAt: "13:00",
    checkedInAt: "2026-04-01T12:55:00Z",
    date: "2026-04-01",
  },
  {
    id: "v4",
    patientId: "GK-2026-0004",
    status: "dang_kham",
    source: "walk_in",
    reason: "Đau mắt đỏ",
    checkedInAt: "2026-04-01T13:10:00Z",
    date: "2026-04-01",
    doctorName: "BS. Trần Minh",
  },
  {
    id: "v5",
    patientId: "GK-2026-0005",
    status: "hoan_thanh",
    source: "hen",
    reason: "Tái khám khô mắt",
    scheduledAt: "13:00",
    checkedInAt: "2026-04-01T12:50:00Z",
    date: "2026-04-01",
    lastVisitDate: "20/02/2026",
    lastVisitDiagnosis: "Khô mắt mạn tính",
    lastVisitDoctor: "BS. Nguyễn Hải",
  },
]
