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
  examData?: ExamData
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
  notes?: string
}

export interface Procedure {
  name: string
  notes: string
}

export interface OpticalRxData {
  od: { sph: string; cyl: string; axis: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; add: string; pd: string }
}

export interface DryEyeExamData {
  tbutOd: string
  tbutOs: string
  meibomian: string
  staining: string
}

export interface RefractionData {
  od: { sph: string; cyl: string; axis: string; add: string; pd: string }
  os: { sph: string; cyl: string; axis: string; add: string; pd: string }
}

export interface ExamData {
  va: { od: string; os: string }
  iop: { od: string; os: string }
  slitLamp: string
  fundus: string
  refractionExam?: RefractionData
  dryEyeExam?: DryEyeExamData
  diagnoses: Diagnosis[]
  medications: Medication[]
  opticalRx?: OpticalRxData
  procedures: Procedure[]
  followUp?: { date: string; reason: string }
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
    occupation: "Kế toán",
    chiefComplaint: "Mỏi mắt, nhìn mờ",
    screenTime: 9,
    workEnvironment: "Văn phòng",
    createdAt: "2026-04-02T08:00:00Z",
  },
  {
    id: "GK-2026-0038",
    name: "Hoàng Văn Bình",
    gender: "Nam",
    dob: "30/06/1995",
    birthYear: 1995,
    phone: "0933445566",
    occupation: "Lập trình viên",
    chiefComplaint: "Khô mắt kéo dài",
    eyeHistory: "Cận thị -3.50D",
    screenTime: 12,
    workEnvironment: "Văn phòng",
    contactLens: "Hàng ngày",
    createdAt: "2026-04-02T08:10:00Z",
  },
  {
    id: "GK-2026-0042",
    name: "Trần Văn Minh",
    gender: "Nam",
    dob: "14/05/1990",
    birthYear: 1990,
    phone: "0944556677",
    occupation: "Nhân viên kinh doanh",
    chiefComplaint: "Mắt đỏ, cộm",
    screenTime: 6,
    workEnvironment: "Văn phòng",
    createdAt: "2026-04-02T08:20:00Z",
  },
  {
    id: "GK-2026-0044",
    name: "Phạm Đức Huy",
    gender: "Nam",
    dob: "20/08/2012",
    birthYear: 2012,
    phone: "0955667788",
    chiefComplaint: "Nhìn bảng không rõ",
    screenTime: 5,
    workEnvironment: "Học sinh",
    createdAt: "2026-04-02T08:30:00Z",
  },
  {
    id: "GK-2026-0045",
    name: "Vũ Mai Hương",
    gender: "Nữ",
    dob: "03/11/1975",
    birthYear: 1975,
    phone: "0966778899",
    occupation: "Giáo viên",
    chiefComplaint: "Tái khám cận thị",
    eyeHistory: "Cận thị -2.00D",
    lastVisitDate: "10/01/2026",
    createdAt: "2026-04-02T08:40:00Z",
  },
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
  {
    id: "v-doc-1",
    patientId: "GK-2026-0035",
    status: "cho_kham",
    source: "hen",
    reason: "Mỏi mắt, nhìn mờ",
    scheduledAt: "09:00",
    checkedInAt: "2026-04-02T08:55:00Z",
    date: "2026-04-02",
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
  },
  {
    id: "v-doc-2",
    patientId: "GK-2026-0038",
    status: "cho_kham",
    source: "walk_in",
    reason: "Khô mắt kéo dài",
    checkedInAt: "2026-04-02T09:10:00Z",
    date: "2026-04-02",
    doctorName: "BS. Nguyễn Hải",
    lastVisitDate: "05/02/2026",
    lastVisitDiagnosis: "Khô mắt nhẹ",
    lastVisitDoctor: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Khô mắt, cộm mắt cả ngày, đặc biệt khi đeo kính áp tròng",
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
    checkedInAt: "2026-04-02T09:25:00Z",
    date: "2026-04-02",
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
    checkedInAt: "2026-04-02T09:55:00Z",
    date: "2026-04-02",
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
    checkedInAt: "2026-04-02T08:25:00Z",
    date: "2026-04-02",
    doctorName: "BS. Nguyễn Hải",
    lastVisitDate: "10/01/2026",
    lastVisitDiagnosis: "Cận thị cả hai mắt",
    lastVisitDoctor: "BS. Nguyễn Hải",
    screeningData: {
      chiefComplaint: "Tái khám định kỳ, kiểm tra độ kính",
      ucvaOd: "4/10",
      ucvaOs: "5/10",
      currentRxOd: "-2.00",
      currentRxOs: "-1.75",
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
      screenTime: "4",
      contactLens: "no",
      discomfortLevel: null,
      notes: "Đeo kính đúng số",
    },
  },
]
