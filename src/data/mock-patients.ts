import { TODAY, todayTimestamp } from "@/lib/demo-date"

export type PatientStatus =
  | "chua_den"
  | "cho_kham"
  | "dang_sang_loc"
  | "dang_kham"
  | "hoan_thanh"
  | "da_huy"

export type PatientSource = "hen" | "walk_in"

export type PatientType = "kham_benh" | "mua_thuoc"
export type PatientActiveStatus = "hoat_dong" | "ngung_hoat_dong"

export const PATIENT_TYPE_CONFIG: Record<
  PatientType,
  { label: string; color: string }
> = {
  kham_benh: {
    label: "Khám bệnh",
    color: "text-sky-700 bg-sky-100",
  },
  mua_thuoc: {
    label: "Mua thuốc",
    color: "text-amber-800 bg-amber-100",
  },
}

export const ACTIVE_STATUS_CONFIG: Record<
  PatientActiveStatus,
  { label: string; color: string }
> = {
  hoat_dong: {
    label: "Hoạt động",
    color: "text-emerald-800 bg-emerald-100",
  },
  ngung_hoat_dong: {
    label: "Ngừng HĐ",
    color: "text-red-800 bg-red-100",
  },
}

export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface SymptomDetail {
  onset?: string
  severity?: "nhe" | "trung_binh" | "nang"
  frequency?: "thinh_thoang" | "thuong_xuyen" | "lien_tuc"
  dailyImpact?: "khong" | "mot_phan" | "nghiem_trong"
  factors?: string
}

export interface GlassesInfo {
  types: string[]
  duration?: string
  seesWell?: boolean
}

export interface ContactLensDetail {
  type?: string[]
  brand?: string
  duration?: string
  issues?: string[]
  issueOther?: string
}

export interface EyeSurgery {
  type: string
  typeOther?: string
  year?: string
  od: boolean
  os: boolean
}

export interface RefractionValues {
  myopia?: { od?: string; os?: string }
  hyperopia?: { od?: string; os?: string }
  astigmatism?: { od?: string; os?: string }
}

export interface DiabetesDetail {
  yearDiagnosed?: string
  hba1c?: string
}

export interface CancerDetail {
  type?: string
  onTreatment?: boolean
}

export interface MedicationEntry {
  name: string
  dose: string
  purpose: string
}

export interface AllergyEntry {
  type: "thuoc" | "thuc_pham" | "moi_truong" | "khac"
  name: string
  reaction: string
}

export interface AllergiesInfo {
  none: boolean
  items: AllergyEntry[]
}

export interface FamilyHistoryEntry {
  has: boolean
  who?: string
}

export interface SmokingInfo {
  status: "khong" | "co" | "da_bo"
  quantity?: string
  years?: string
  quitYear?: string
}

export interface AlcoholInfo {
  status: "khong" | "thinh_thoang" | "thuong_xuyen"
  frequency?: string
}

export interface DrivingInfo {
  does: boolean
  when?: "ban_ngay" | "ban_dem" | "ca_hai"
}

export interface SportsInfo {
  does: boolean
  type?: string
}

export interface Patient {
  id: string // GK-YYYY-NNNN
  name: string
  gender: "Nam" | "Nữ" | "Khác"
  dob: string // dd/mm/yyyy
  birthYear: number
  phone: string
  email?: string
  address?: string
  city?: string // deprecated — use district + cityProvince
  occupation?: string
  cccd?: string
  chiefComplaint?: string
  eyeHistory?: string // deprecated
  systemicHistory?: string // deprecated
  currentMedications?: string // deprecated
  allergies?: string // deprecated
  familyHistory?: string // deprecated
  screenTime?: number // deprecated
  workEnvironment?: string // deprecated
  contactLens?: string // deprecated
  lifestyleNotes?: string // deprecated
  createdAt: string // ISO date
  lastExamDate?: string // dd/mm/yyyy
  type: PatientType
  activeStatus: PatientActiveStatus

  // Section I additions
  district?: string
  cityProvince?: string
  emergencyContact?: EmergencyContact

  // Section II: Visit reasons & symptoms
  visitReasons?: string[]
  visitReasonOther?: string
  symptomDetail?: SymptomDetail
  symptoms?: Record<string, boolean>

  // Section III: Eye history
  lastEyeExam?: { date?: string; location?: string }
  currentGlasses?: GlassesInfo
  contactLensStatus?: "co" | "khong" | "da_tung"
  contactLensDetail?: ContactLensDetail
  eyeInjury?: { has: boolean; detail?: string }
  diagnosedEyeConditions?: Record<string, boolean>
  diagnosedEyeConditionOther?: string
  refractionValues?: RefractionValues
  eyeSurgeries?: EyeSurgery[]

  // Section IV: Medical history
  primaryDoctor?: { name?: string; lastVisit?: string }
  systemicConditions?: Record<string, boolean>
  diabetesDetail?: DiabetesDetail
  cancerDetail?: CancerDetail
  systemicConditionOther?: string
  medicationsList?: MedicationEntry[]
  allergiesInfo?: AllergiesInfo
  pregnancyStatus?: "mang_thai" | "cho_con_bu" | "khong"
  pregnancyTrimester?: string

  // Section V: Family history
  familyEyeHistory?: Record<string, FamilyHistoryEntry>
  familyMedicalHistory?: Record<string, FamilyHistoryEntry>
  familyHistoryOther?: { has: boolean; detail?: string; who?: string }

  // Section VI: Lifestyle
  smokingInfo?: SmokingInfo
  alcoholInfo?: AlcoholInfo
  screenTimeComputer?: string
  screenTimePhone?: string
  outdoorTime?: string
  sunglassesUse?: string
  workNearVision?: boolean
  workDustyChemical?: boolean
  drivingInfo?: DrivingInfo
  sportsInfo?: SportsInfo
  hobbies?: string

  // Section VII: Referral
  referralSource?: string
  referralDetail?: string
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
  refractionData?: RefractionFormData
  historyStatus?: "pending" | "completed"
  examData?: ExamData
  previousVisits?: PreviousVisit[]
  requests?: VisitRequest[]
  dangerousSymptoms?: Record<string, boolean>
  specializedPackages?: string[]
  specializedPackageData?: Record<string, DryEyeFormData>
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
  progression?: string
  affectedEye?: string
  pinholeOd?: string
  pinholeOs?: string
  nearOd?: string
  nearOs?: string
  iopOd?: string
  iopOs?: string
  autoRef?: {
    sphOd: string
    cylOd: string
    axisOd: string
    sphOs: string
    cylOs: string
    axisOs: string
  }
  screeningQuestions?: { question: string; answer: string }[]
  eyeRest?: string
  notes: string
  step2?: Step2FormData
}

export type DiseaseGroup = "dryEye" | "refraction" | "myopiaControl" | "general"

export interface DryEyeFormData {
  osdiScore: number | null
  osdiAnswers: (number | null)[] // 6 answers, each 0-4 or null
  osdiSeverity: "normal" | "moderate" | "severe" | null
  tbutOd: string
  tbutOs: string
  schirmerOd: string
  schirmerOs: string
  meibomian: string
  staining: string
}

export interface Step2FormData {
  selectedGroups: DiseaseGroup[]
  groupOrder: DiseaseGroup[]
  dryEye: DryEyeFormData
}

// --- Refraction Examination Types ---

export interface RefractionEyeRow {
  sph: string
  cyl: string
  axis: string
  va: string
}

export interface RefractionEyeRowWithAdd extends RefractionEyeRow {
  add: string
}

export interface SubjectiveEyeRow extends RefractionEyeRowWithAdd {
  vaNear: string
}

export type CycloplegicAgent = "cyclogyl" | "mydrinP" | "atropine"

export interface RefractionFormData {
  currentGlasses: { od: RefractionEyeRowWithAdd; os: RefractionEyeRowWithAdd }
  objective: { od: RefractionEyeRow; os: RefractionEyeRow }
  subjective: { od: SubjectiveEyeRow; os: SubjectiveEyeRow }
  cycloplegicEnabled: boolean
  cycloplegicAgent: CycloplegicAgent[]
  cycloplegic: { od: RefractionEyeRow; os: RefractionEyeRow }
  retinoscopy: { od: string; os: string }
  iop: { od: string; os: string }
  axialLength: { od: string; os: string }
  glassesRxEnabled: boolean
  glassesRx: {
    od: RefractionEyeRowWithAdd
    os: RefractionEyeRowWithAdd
    pd: string
    lensType: string
    purpose: string
    notes: string
  }
  notes: string
}

export interface Diagnosis {
  text: string
  icd10Code?: string
  isPrimary: boolean
}

export interface Medication {
  name: string
  dosage: string
  frequency: string
  duration: string
  eye?: string
  notes?: string
}

export interface Procedure {
  name: string
  notes: string
}

export interface SlitLampEye {
  lids: string
  conjunctiva: string
  cornea: string
  anteriorChamber: string
  iris: string
  lens: string
  notes: string
}

export interface SlitLampExam {
  od: SlitLampEye
  os: SlitLampEye
}

export interface FundusEye {
  opticDisc: string
  cdRatio: string
  macula: string
  vessels: string
  peripheralRetina: string
  notes: string
}

export interface FundusExam {
  od: FundusEye
  os: FundusEye
}

export type RequestStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface SubjectiveRefractionResult {
  od: {
    sph: string
    cyl: string
    axis: string
    bcva: string
    add: string
    pd: string
  }
  os: {
    sph: string
    cyl: string
    axis: string
    bcva: string
    add: string
    pd: string
  }
}

export interface GenericResult {
  conclusion: string
}

export interface VisitRequest {
  id: string
  type: string
  priority: "normal" | "urgent"
  status: RequestStatus
  notesForTech: string
  requestedAt: string
  completedAt?: string
  assignedTo?: string
  result?: {
    type: "subjective_refraction" | "generic"
    data: SubjectiveRefractionResult | GenericResult
  }
}

export interface NewOpticalRx {
  od: { sph: string; cyl: string; axis: string; add: string }
  os: { sph: string; cyl: string; axis: string; add: string }
  pd: string
  lensType: string
  notes: string
}

export interface NewFollowUp {
  interval: string
  date: string
  doctor: string
  instructions: string
}

export const REQUEST_TYPES = [
  "Đo khúc xạ chủ quan",
  "OCT",
  "Chụp đáy mắt",
  "Đo thị trường",
  "Topography giác mạc",
  "Siêu âm mắt",
  "Xét nghiệm máu",
  "Khác",
] as const

export const FOLLOW_UP_INTERVALS = [
  "1 tuần",
  "2 tuần",
  "1 tháng",
  "3 tháng",
  "6 tháng",
  "1 năm",
] as const

export const FREQUENCY_OPTIONS = [
  "1 lần/ngày",
  "2 lần/ngày",
  "3 lần/ngày",
  "4 lần/ngày",
  "Khi cần",
] as const

export const DURATION_OPTIONS = [
  "1 tuần",
  "2 tuần",
  "1 tháng",
  "2 tháng",
  "3 tháng",
] as const

export const EYE_OPTIONS = ["OD", "OS", "OU"] as const

export const LENS_TYPE_OPTIONS = ["Đơn tròng", "Đa tròng", "Lũy tiến"] as const

export interface ExamData {
  slitLamp: SlitLampExam
  fundus: FundusExam
  diagnoses: Diagnosis[]
  diagnosisNotes: string
  medications: Medication[]
  opticalRx?: NewOpticalRx
  procedures: Procedure[]
  followUp?: NewFollowUp
  requests: VisitRequest[]
}

export interface PreviousVisit {
  date: string
  doctorName: string
  diagnoses: { text: string; icd10Code?: string; isPrimary: boolean }[]
  medications: {
    name: string
    dosage: string
    frequency: string
    eye: string
  }[]
  va: {
    scOd: string
    scOs: string
    ccOd: string
    ccOs: string
    iopOd: string
    iopOs: string
  }
  refraction: {
    sphOd: string
    sphOs: string
    cylOd: string
    cylOs: string
    axisOd: string
    axisOs: string
  }
  instructions?: string
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
    id: "GK-2026-0035",
    name: "Nguyễn Thị Lan",
    gender: "Nữ",
    dob: "12/04/1988",
    birthYear: 1988,
    phone: "0901112233",
    city: "Hà Nội",
    district: "Cầu Giấy",
    cityProvince: "Hà Nội",
    occupation: "Kế toán",
    chiefComplaint: "Mỏi mắt, nhìn mờ",
    visitReasons: ["mo_mat", "giam_thi_luc"],
    symptoms: { mo_mat: true, moi_mat_doc: true, nhuc_dau: true },
    symptomDetail: {
      onset: "2 tuần trước",
      severity: "trung_binh",
      frequency: "thuong_xuyen",
      dailyImpact: "mot_phan",
      factors: "Tệ hơn khi làm việc trên máy tính, tốt hơn khi nghỉ ngơi",
    },
    lastEyeExam: { date: "15/01/2026", location: "BV Mắt TW" },
    currentGlasses: { types: ["can"], duration: "5 năm", seesWell: false },
    diagnosedEyeConditions: { can_thi: true },
    refractionValues: { myopia: { od: "-2.75", os: "-3.00" } },
    systemicConditions: { migraine: true },
    medicationsList: [
      { name: "Paracetamol", dose: "500mg", purpose: "Đau đầu" },
    ],
    allergiesInfo: { none: false, items: [{ type: "thuoc", name: "Aspirin", reaction: "Nổi mẩn" }] },
    familyEyeHistory: {
      can_thi_nang: { has: true, who: "Mẹ" },
      glaucoma: { has: true, who: "Ông ngoại" },
    },
    smokingInfo: { status: "khong" },
    alcoholInfo: { status: "khong" },
    screenTimeComputer: "4-8h",
    screenTimePhone: "2-4h",
    outdoorTime: "<30m",
    workNearVision: true,
    referralSource: "internet",
    screenTime: 9,
    workEnvironment: "Văn phòng",
    lastExamDate: "02/04/2026",
    createdAt: "2026-04-02T08:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0038",
    name: "Hoàng Văn Bình",
    gender: "Nam",
    dob: "30/06/1995",
    birthYear: 1995,
    phone: "0933445566",
    city: "Hà Nội",
    district: "Đống Đa",
    cityProvince: "Hà Nội",
    occupation: "Lập trình viên",
    chiefComplaint: "Khô mắt kéo dài",
    visitReasons: ["dau_mat_kho_chiu", "kho_nhin_gan"],
    symptoms: { kho_mat: true, moi_mat_doc: true, choi_sang: true, do_mat: true },
    symptomDetail: {
      onset: "3 tháng trước",
      severity: "trung_binh",
      frequency: "lien_tuc",
      dailyImpact: "nghiem_trong",
      factors: "Xấu đi khi dùng máy tính lâu, điều hòa khô",
    },
    lastEyeExam: { date: "10/06/2025", location: "Phòng khám tư" },
    currentGlasses: { types: ["can", "loan"], duration: "8 năm", seesWell: true },
    contactLensStatus: "co",
    contactLensDetail: {
      type: ["mem", "deo_ngay"],
      brand: "Acuvue",
      duration: "3 năm",
      issues: ["kho_mat"],
    },
    diagnosedEyeConditions: { can_thi: true, loan_thi: true, kho_mat_syndrome: true },
    refractionValues: {
      myopia: { od: "-3.50", os: "-3.25" },
      astigmatism: { od: "-0.75", os: "-1.00" },
    },
    eyeInjury: { has: false },
    systemicConditions: { cholesterol_cao: true },
    allergiesInfo: { none: true, items: [] },
    familyEyeHistory: {
      can_thi_nang: { has: true, who: "Bố" },
    },
    familyMedicalHistory: {
      tang_huyet_ap: { has: true, who: "Bố" },
      dtd: { has: true, who: "Ông nội" },
    },
    smokingInfo: { status: "khong" },
    alcoholInfo: { status: "thinh_thoang" },
    screenTimeComputer: ">8h",
    screenTimePhone: "4-8h",
    outdoorTime: "<30m",
    sunglassesUse: "thinh_thoang",
    workNearVision: true,
    workDustyChemical: false,
    drivingInfo: { does: false },
    sportsInfo: { does: true, type: "Bơi lội" },
    referralSource: "ban_be",
    referralDetail: "Nguyễn Văn An",
    eyeHistory: "Cận thị -3.50D",
    screenTime: 12,
    workEnvironment: "Văn phòng",
    contactLens: "Hàng ngày",
    lastExamDate: "02/04/2026",
    createdAt: "2026-04-02T08:10:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0042",
    name: "Trần Văn Minh",
    gender: "Nam",
    dob: "14/05/1990",
    birthYear: 1990,
    phone: "0944556677",
    city: "Bắc Ninh",
    occupation: "Nhân viên kinh doanh",
    chiefComplaint: "Mắt đỏ, cộm",
    visitReasons: ["dau_mat_kho_chiu"],
    symptoms: { do_mat: true },
    screenTime: 6,
    workEnvironment: "Văn phòng",
    lastExamDate: "02/04/2026",
    createdAt: "2026-04-02T08:20:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0044",
    name: "Phạm Đức Huy",
    gender: "Nam",
    dob: "20/08/2012",
    birthYear: 2012,
    phone: "0955667788",
    city: "Hà Nội",
    chiefComplaint: "Nhìn bảng không rõ",
    visitReasons: ["kho_nhin_xa"],
    screenTime: 5,
    workEnvironment: "Học sinh",
    lastExamDate: "02/04/2026",
    createdAt: "2026-04-02T08:30:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0045",
    name: "Vũ Mai Hương",
    gender: "Nữ",
    dob: "03/11/1975",
    birthYear: 1975,
    phone: "0966778899",
    city: "Hà Nội",
    occupation: "Giáo viên",
    chiefComplaint: "Tái khám cận thị",
    visitReasons: ["kham_dinh_ky", "mo_mat", "khac"],
    visitReasonOther: "Kiểm tra độ kính",
    eyeHistory: "Cận thị từ năm 15 tuổi",
    allergies: "Tetracycline",
    currentMedications: "Refresh Tears 0.5% — 4 lần/ngày",
    familyHistory: "Mẹ cận nặng (-6.00D)",
    symptoms: {
      mo_mat: true,
      kho_mat: true,
      moi_mat_doc: true,
    },
    symptomDetail: {
      onset: "6 tháng",
      severity: "trung_binh" as const,
      frequency: "thuong_xuyen" as const,
    },
    lastEyeExam: {
      date: "10/2025",
      location: "BV Mắt TW",
    },
    currentGlasses: {
      types: ["can" as const],
      duration: "5 năm",
    },
    contactLensStatus: "khong",
    diagnosedEyeConditions: {
      can_thi: true,
      kho_mat_syndrome: true,
    },
    systemicConditions: {
      tang_huyet_ap: true,
    },
    medicationsList: [
      { name: "Refresh Tears 0.5%", dose: "1 giọt", purpose: "Khô mắt" },
      { name: "Amlodipine 5mg", dose: "1 viên", purpose: "Huyết áp" },
    ],
    allergiesInfo: {
      none: false,
      items: [{ type: "thuoc" as const, name: "Tetracycline", reaction: "Nổi mẩn đỏ" }],
    },
    familyEyeHistory: {
      can_thi_nang: { has: true, who: "Mẹ" },
      glaucoma: { has: true, who: "Ông ngoại" },
    },
    familyMedicalHistory: {
      tang_huyet_ap: { has: true, who: "Bố" },
      dtd: { has: true, who: "Bà ngoại" },
    },
    smokingInfo: { status: "khong" as const },
    alcoholInfo: { status: "khong" as const },
    screenTimeComputer: "6-8 giờ/ngày",
    screenTimePhone: "2-3 giờ/ngày",
    workNearVision: true,
    referralSource: "da_kham",
    lastExamDate: "02/04/2026",
    createdAt: "2026-04-02T08:40:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0001",
    name: "Nguyễn Văn An",
    gender: "Nam",
    dob: "15/03/1985",
    birthYear: 1985,
    phone: "0912345678",
    city: "Hà Nội",
    occupation: "Kỹ sư phần mềm",
    address: "123 Phố Huế, Hai Bà Trưng, Hà Nội",
    screenTime: 10,
    workEnvironment: "Văn phòng",
    lastExamDate: "15/03/2026",
    createdAt: "2026-03-15T10:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0002",
    name: "Trần Thị Bình",
    gender: "Nữ",
    dob: "22/07/1992",
    birthYear: 1992,
    phone: "0987654321",
    email: "binh.tran@email.com",
    city: "Hà Nội",
    occupation: "Nhân viên văn phòng",
    address: "45 Kim Mã, Ba Đình, Hà Nội",
    chiefComplaint: "Khô mắt, mỏi mắt",
    visitReasons: ["dau_mat_kho_chiu"],
    eyeHistory: "Cận thị từ nhỏ",
    allergies: "Penicillin",
    screenTime: 8,
    workEnvironment: "Văn phòng",
    contactLens: "Thỉnh thoảng",
    lastExamDate: "10/01/2026",
    createdAt: "2026-01-10T09:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0003",
    name: "Lê Hoàng Cường",
    gender: "Nam",
    dob: "10/11/1978",
    birthYear: 1978,
    phone: "0901234567",
    city: "Hải Phòng",
    occupation: "Giáo viên",
    chiefComplaint: "Giảm thị lực",
    visitReasons: ["giam_thi_luc"],
    systemicHistory: "Tiểu đường type 2",
    currentMedications: "Metformin 500mg",
    lastExamDate: "20/02/2026",
    createdAt: "2026-02-20T14:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0004",
    name: "Phạm Minh Đức",
    gender: "Nam",
    dob: "05/06/2001",
    birthYear: 2001,
    phone: "0978123456",
    city: "Hà Nội",
    chiefComplaint: "Đau mắt đỏ",
    visitReasons: ["dau_mat_kho_chiu"],
    lastExamDate: "01/04/2026",
    createdAt: "2026-04-01T08:30:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0005",
    name: "Vũ Thị Em",
    gender: "Nữ",
    dob: "18/09/1965",
    birthYear: 1965,
    phone: "0965432100",
    city: "Hà Nội",
    occupation: "Hưu trí",
    chiefComplaint: "Tái khám khô mắt",
    visitReasons: ["kham_dinh_ky"],
    eyeHistory: "Đã Lasik 2018",
    screenTime: 3,
    lastExamDate: "05/01/2026",
    createdAt: "2026-01-05T11:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0010",
    name: "Đỗ Thị Hồng",
    gender: "Nữ",
    dob: "25/12/1980",
    birthYear: 1980,
    phone: "0911223344",
    city: "Hưng Yên",
    occupation: "Nội trợ",
    chiefComplaint: "Nhìn gần mờ",
    visitReasons: ["kho_nhin_gan"],
    lastExamDate: "01/03/2026",
    createdAt: "2026-03-01T09:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0012",
    name: "Bùi Quang Hà",
    gender: "Nam",
    dob: "08/02/1999",
    birthYear: 1999,
    phone: "0922334455",
    city: "Hà Nội",
    occupation: "Sinh viên",
    chiefComplaint: "Cận thị tăng nhanh",
    visitReasons: ["kho_nhin_xa"],
    lastExamDate: "05/03/2026",
    createdAt: "2026-03-05T10:30:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0015",
    name: "Trịnh Văn Khánh",
    gender: "Nam",
    dob: "17/07/1970",
    birthYear: 1970,
    phone: "0933445566",
    city: "Hà Nội",
    occupation: "Hưu trí",
    allergies: "Chloramphenicol, Sulfamide",
    systemicHistory: "Cao huyết áp",
    lastExamDate: "15/02/2026",
    createdAt: "2026-02-15T08:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0018",
    name: "Lý Thị Ngọc",
    gender: "Nữ",
    dob: "30/09/1955",
    birthYear: 1955,
    phone: "0944556677",
    city: "Nam Định",
    lastExamDate: "20/01/2026",
    createdAt: "2026-01-20T14:00:00Z",
    type: "kham_benh",
    activeStatus: "ngung_hoat_dong",
  },
  {
    id: "GK-2026-0020",
    name: "Hoàng Minh Phúc",
    gender: "Nam",
    dob: "12/04/2005",
    birthYear: 2005,
    phone: "0955667788",
    city: "Hà Nội",
    chiefComplaint: "Kiểm tra mắt định kỳ",
    visitReasons: ["kham_dinh_ky"],
    lastExamDate: "10/03/2026",
    createdAt: "2026-03-10T11:00:00Z",
    type: "kham_benh",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0022",
    name: "Ngô Thị Quỳnh",
    gender: "Nữ",
    dob: "05/06/1988",
    birthYear: 1988,
    phone: "0966778899",
    city: "Hà Nội",
    lastExamDate: "20/03/2026",
    createdAt: "2026-03-20T09:30:00Z",
    type: "mua_thuoc",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0025",
    name: "Phan Văn Sơn",
    gender: "Nam",
    dob: "22/11/1960",
    birthYear: 1960,
    phone: "0977889900",
    city: "Thái Bình",
    lastExamDate: "28/02/2026",
    createdAt: "2026-02-28T16:00:00Z",
    type: "mua_thuoc",
    activeStatus: "hoat_dong",
  },
  {
    id: "GK-2026-0030",
    name: "Đinh Thị Uyên",
    gender: "Nữ",
    dob: "14/08/1993",
    birthYear: 1993,
    phone: "0988990011",
    city: "Hà Nội",
    occupation: "Nhân viên ngân hàng",
    chiefComplaint: "Mỏi mắt cuối ngày",
    visitReasons: ["mo_mat"],
    screenTime: 10,
    lastExamDate: "25/03/2026",
    createdAt: "2026-03-25T08:00:00Z",
    type: "kham_benh",
    activeStatus: "ngung_hoat_dong",
  },
]

export const mockVisits: Visit[] = [
  {
    id: "v1",
    patientId: "GK-2026-0001",
    status: "chua_den",
    source: "hen",
    scheduledAt: "14:00",
    date: TODAY,
  },
  {
    id: "v2",
    patientId: "GK-2026-0002",
    status: "cho_kham",
    source: "hen",
    reason: "Khô mắt, mỏi mắt",
    scheduledAt: "13:30",
    checkedInAt: todayTimestamp(35),
    date: TODAY,
    lastVisitDate: "15/01/2026",
    lastVisitDiagnosis: "Khô mắt",
    lastVisitDoctor: "BS. Nguyễn Hải",
    historyStatus: "pending",
  },
  {
    id: "v3",
    patientId: "GK-2026-0003",
    status: "dang_sang_loc",
    source: "hen",
    reason: "Giảm thị lực",
    scheduledAt: "13:00",
    checkedInAt: todayTimestamp(65),
    date: TODAY,
    historyStatus: "pending",
  },
  {
    id: "v4",
    patientId: "GK-2026-0004",
    status: "dang_kham",
    source: "walk_in",
    reason: "Đau mắt đỏ",
    checkedInAt: todayTimestamp(50),
    date: TODAY,
    doctorName: "BS. Trần Minh",
  },
  {
    id: "v5",
    patientId: "GK-2026-0005",
    status: "hoan_thanh",
    source: "hen",
    reason: "Tái khám khô mắt",
    scheduledAt: "13:00",
    checkedInAt: todayTimestamp(70),
    date: TODAY,
    lastVisitDate: "20/02/2026",
    lastVisitDiagnosis: "Khô mắt mạn tính",
    lastVisitDoctor: "BS. Nguyễn Hải",
  },
  {
    id: "v-doc-1",
    patientId: "GK-2026-0035",
    status: "cho_kham",
    source: "hen",
    reason: "Mỏi mắt, nhìn mờ",
    scheduledAt: "09:00",
    checkedInAt: todayTimestamp(45),
    date: TODAY,
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Mỏi mắt khi nhìn màn hình lâu, nhìn mờ cuối ngày",
      ucvaOd: "7/10",
      ucvaOs: "8/10",
      currentRxOd: "-1.50",
      currentRxOs: "-1.25",
      redFlags: {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      },
      symptoms: {
        dryEyes: true,
        gritty: false,
        blurry: true,
        tearing: false,
        itchy: false,
        headache: true,
      },
      blinkImprovement: "yes",
      symptomDuration: 3,
      symptomDurationUnit: "tháng",
      screenTime: "9",
      contactLens: "no",
      discomfortLevel: "mild",
      notes: "Làm việc văn phòng nhiều giờ",
    },
    historyStatus: "pending",
  },
  {
    id: "v-doc-2",
    patientId: "GK-2026-0038",
    status: "cho_kham",
    source: "walk_in",
    reason: "Khô mắt kéo dài",
    checkedInAt: todayTimestamp(30),
    date: TODAY,
    doctorName: "BS. Nguyễn Hải",
    lastVisitDate: "05/02/2026",
    lastVisitDiagnosis: "Khô mắt nhẹ",
    lastVisitDoctor: "BS. Nguyễn Hải",
    previousVisits: [
      {
        date: "05/02/2026",
        doctorName: "BS. Nguyễn Hải",
        diagnoses: [
          { text: "Khô mắt nhẹ", icd10Code: "H04.1", isPrimary: true },
        ],
        medications: [
          {
            name: "Refresh Tears 0.5%",
            dosage: "1 giọt",
            frequency: "3 lần/ngày",
            eye: "OU",
          },
        ],
        va: {
          scOd: "10/10",
          scOs: "10/10",
          ccOd: "10/10",
          ccOs: "10/10",
          iopOd: "16",
          iopOs: "15",
        },
        refraction: {
          sphOd: "-3.50",
          sphOs: "-3.25",
          cylOd: "-0.75",
          cylOs: "-0.50",
          axisOd: "10",
          axisOs: "170",
        },
        instructions: "Chườm nóng mi mắt, dùng nước mắt nhân tạo đều đặn",
      },
    ],
    screeningData: {
      chiefComplaint:
        "Khô mắt, cộm mắt cả ngày, đặc biệt khi đeo kính áp tròng",
      ucvaOd: "10/10",
      ucvaOs: "10/10",
      currentRxOd: "-3.50",
      currentRxOs: "-3.25",
      redFlags: {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      },
      symptoms: {
        dryEyes: true,
        gritty: true,
        blurry: false,
        tearing: true,
        itchy: true,
        headache: false,
      },
      blinkImprovement: "unclear",
      symptomDuration: 6,
      symptomDurationUnit: "tháng",
      screenTime: "12",
      contactLens: "yes",
      discomfortLevel: "moderate",
      notes: "Đeo kính áp tròng hàng ngày khoảng 10 tiếng",
      step2: {
        selectedGroups: ["dryEye"],
        groupOrder: ["dryEye"],
        dryEye: {
          osdiScore: 38,
          osdiAnswers: [3, 2, 3, 2, 4, 3],
          osdiSeverity: "moderate",
          tbutOd: "5",
          tbutOs: "4",
          schirmerOd: "8",
          schirmerOs: "7",
          meibomian: "Tắc nghẽn tuyến meibomian độ 2",
          staining: "Nhuộm fluorescein (+) nhẹ vùng dưới",
        },
      },
    },
  },
  {
    id: "v-doc-3",
    patientId: "GK-2026-0042",
    status: "cho_kham",
    source: "hen",
    reason: "Mắt đỏ, cộm",
    scheduledAt: "09:30",
    checkedInAt: todayTimestamp(20),
    date: TODAY,
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Mắt đỏ kèm cộm, chảy ghèn nhẹ",
      ucvaOd: "9/10",
      ucvaOs: "9/10",
      currentRxOd: "",
      currentRxOs: "",
      redFlags: {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      },
      symptoms: {
        dryEyes: false,
        gritty: true,
        blurry: false,
        tearing: true,
        itchy: true,
        headache: false,
      },
      blinkImprovement: "no",
      symptomDuration: 5,
      symptomDurationUnit: "ngày",
      screenTime: "6",
      contactLens: "no",
      discomfortLevel: "mild",
      notes: "Có thể dị ứng theo mùa",
      step2: {
        selectedGroups: ["refraction"],
        groupOrder: ["refraction"],
        dryEye: {
          osdiScore: null,
          osdiAnswers: [null, null, null, null, null, null],
          osdiSeverity: null,
          tbutOd: "",
          tbutOs: "",
          schirmerOd: "",
          schirmerOs: "",
          meibomian: "",
          staining: "",
        },
      },
    },
  },
  {
    id: "v-doc-4",
    patientId: "GK-2026-0044",
    status: "cho_kham",
    source: "hen",
    reason: "Nhìn bảng không rõ",
    scheduledAt: "10:00",
    checkedInAt: todayTimestamp(10),
    date: TODAY,
    doctorName: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Nhìn bảng trên lớp không rõ, phải nheo mắt",
      ucvaOd: "5/10",
      ucvaOs: "6/10",
      currentRxOd: "",
      currentRxOs: "",
      redFlags: {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      },
      symptoms: {
        dryEyes: false,
        gritty: false,
        blurry: true,
        tearing: false,
        itchy: false,
        headache: true,
      },
      blinkImprovement: "no",
      symptomDuration: 2,
      symptomDurationUnit: "tháng",
      screenTime: "5",
      contactLens: "no",
      discomfortLevel: "mild",
      notes: "Bố mẹ cận thị",
    },
  },
  {
    id: "v-doc-5",
    patientId: "GK-2026-0045",
    status: "dang_kham",
    source: "hen",
    reason: "Tái khám cận thị",
    scheduledAt: "08:30",
    checkedInAt: todayTimestamp(60),
    date: TODAY,
    doctorName: "BS. Nguyễn Hải",
    lastVisitDate: "10/01/2026",
    lastVisitDiagnosis: "Cận thị cả hai mắt",
    lastVisitDoctor: "BS. Nguyễn Hải",
    previousVisits: [
      {
        date: "10/01/2026",
        doctorName: "BS. Nguyễn Hải",
        diagnoses: [
          {
            text: "Cận thị cả hai mắt",
            icd10Code: "H52.1",
            isPrimary: true,
          },
        ],
        medications: [
          {
            name: "Refresh Tears 0.5%",
            dosage: "1 giọt",
            frequency: "4 lần/ngày",
            eye: "OU",
          },
        ],
        va: {
          scOd: "4/10",
          scOs: "5/10",
          ccOd: "9/10",
          ccOs: "10/10",
          iopOd: "14",
          iopOs: "15",
        },
        refraction: {
          sphOd: "-2.00",
          sphOs: "-1.75",
          cylOd: "-0.50",
          cylOs: "-0.25",
          axisOd: "180",
          axisOs: "175",
        },
        instructions: "Đeo kính đúng số, tái khám sau 3 tháng",
      },
      {
        date: "15/10/2025",
        doctorName: "BS. Nguyễn Hải",
        diagnoses: [
          {
            text: "Cận thị cả hai mắt",
            icd10Code: "H52.1",
            isPrimary: true,
          },
        ],
        medications: [],
        va: {
          scOd: "5/10",
          scOs: "5/10",
          ccOd: "10/10",
          ccOs: "10/10",
          iopOd: "15",
          iopOs: "14",
        },
        refraction: {
          sphOd: "-1.75",
          sphOs: "-1.50",
          cylOd: "-0.50",
          cylOs: "-0.25",
          axisOd: "180",
          axisOs: "175",
        },
        instructions: "Hạn chế thời gian nhìn gần, tái khám sau 3 tháng",
      },
    ],
    requests: [
      {
        id: "req-1",
        type: "Đo khúc xạ chủ quan",
        priority: "normal" as const,
        status: "completed" as const,
        notesForTech: "",
        requestedAt: todayTimestamp(55),
        completedAt: todayTimestamp(30),
        assignedTo: "KTV. Nguyễn Thị Lan",
        result: {
          type: "subjective_refraction" as const,
          data: {
            od: {
              sph: "-2.25",
              cyl: "-0.50",
              axis: "180",
              bcva: "10/10",
              add: "",
              pd: "31.5",
            },
            os: {
              sph: "-2.00",
              cyl: "-0.25",
              axis: "175",
              bcva: "10/10",
              add: "",
              pd: "31.5",
            },
          },
        },
      },
      {
        id: "req-2",
        type: "OCT",
        priority: "normal" as const,
        status: "in_progress" as const,
        notesForTech: "Kiểm tra lớp sợi thần kinh",
        requestedAt: todayTimestamp(40),
        assignedTo: "KTV. Phạm Văn Đức",
      },
    ],
    screeningData: {
      chiefComplaint: "Tái khám định kỳ, kiểm tra độ kính",
      ucvaOd: "4/10",
      ucvaOs: "5/10",
      currentRxOd: "9/10",
      currentRxOs: "10/10",
      pinholeOd: "10/10",
      pinholeOs: "10/10",
      nearOd: "J2",
      nearOs: "J1",
      iopOd: "14",
      iopOs: "15",
      redFlags: {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      },
      symptoms: {
        dryEyes: false,
        gritty: false,
        blurry: true,
        tearing: false,
        itchy: false,
        headache: false,
      },
      blinkImprovement: "no",
      symptomDuration: 12,
      symptomDurationUnit: "tháng",
      progression: "Ổn định",
      affectedEye: "Cả hai mắt",
      screenTime: "4",
      contactLens: "no",
      discomfortLevel: null,
      eyeRest: "Không thường xuyên",
      autoRef: {
        sphOd: "-2.25",
        cylOd: "-0.50",
        axisOd: "180",
        sphOs: "-2.00",
        cylOs: "-0.25",
        axisOs: "175",
      },
      screeningQuestions: [
        {
          question: "Mắt có bị đỏ hoặc chảy nước thường xuyên?",
          answer: "Không",
        },
        {
          question: "Nhìn thấy chấm đen, đốm sáng bất thường?",
          answer: "Không",
        },
        {
          question: "Khó khăn khi lái xe ban đêm?",
          answer: "Không",
        },
      ],
      notes: "Đeo kính đúng số",
      step2: {
        selectedGroups: ["dryEye"],
        groupOrder: ["dryEye"],
        dryEye: {
          osdiScore: 12,
          osdiAnswers: [1, 1, 0, 2, 1, 1],
          osdiSeverity: "moderate",
          tbutOd: "8",
          tbutOs: "9",
          schirmerOd: "12",
          schirmerOs: "14",
          meibomian: "Tuyến Meibomian bình thường",
          staining: "Không nhuộm",
        },
      },
    },
  },
]
