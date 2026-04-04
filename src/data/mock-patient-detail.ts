// src/data/mock-patient-detail.ts

export type DiseaseGroupType =
  | "dryEye"
  | "refraction"
  | "myopiaControl"
  | "general"

export interface PatientDetailAlert {
  type: "allergy" | "eyeDisease" | "osdi" | "redFlag"
  label: string
}

export interface PatientDetailStat {
  totalVisits: number
  firstVisitDate: string
  lastVisitDate: string
  lastVisitDoctor: string
  currentDiagnosis: string
  currentDiagnosisIcd: string
  secondaryDiagnosis?: string
  nextFollowUp: string | null
  followUpDate: string | null
  followUpDaysRemaining: number | null // negative = overdue
}

export interface PatientPersonalInfo {
  id: string
  name: string
  dob: string
  age: number
  gender: string
  phone: string
  address: string
  occupation: string
  insurance: string | null
  emergencyContact: string | null
}

export interface MedicalHistory {
  eyeDiseases: string[]
  eyeNotes: string | null
  allergies: string[]
  systemicHistory: string | null
}

export interface CurrentMedication {
  name: string
  description: string
  dosage: string
  frequency: string
  eye: string
  duration: string
  prescribedDate: string
  doctor: string
}

export interface OpticalRx {
  od: { sph: string; cyl: string; axis: string }
  os: { sph: string; cyl: string; axis: string }
  pd: string
  lensType: string
  prescribedDate: string
  doctor: string
}

export interface DiagnosisRecord {
  name: string
  icdCode: string
  type: "primary" | "secondary"
  firstSeen: string
  lastSeen: string | null // null = current
  visitCount: number
}

export interface MeasurementData {
  date: string
  va: {
    od: { sc: string; cc: string; ph: string; iop: string }
    os: { sc: string; cc: string; ph: string; iop: string }
  }
  refraction: {
    od: { sph: string; cyl: string; axis: string }
    os: { sph: string; cyl: string; axis: string }
  }
  dryEye?: {
    osdiScore: number
    osdiMax: number
    osdiSeverity: string
    od: { tbut: string; schirmer: string; meibomian: string }
    os: { tbut: string; schirmer: string; meibomian: string }
  }
  slitLamp: string
  fundus: string
}

export interface VisitScreening {
  chiefComplaint: string
  ucva: { od: string; os: string }
  currentRx: { od: string; os: string } | null
  redFlags: {
    eyePain: boolean
    suddenVisionLoss: boolean
    asymmetry: boolean
  }
  symptoms: string[]
  blinkImprovement: string | null
  symptomDuration: string | null
  screenTime: string | null
  contactLens: string | null
  discomfortLevel: string | null
}

export interface VisitDryEye {
  osdiScore: number
  osdiMax: number
  osdiSeverity: string
  od: { tbut: string; schirmer: string; meibomian: string }
  os: { tbut: string; schirmer: string; meibomian: string }
  staining: string | null
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

export interface FundusEye {
  opticDisc: string
  cdRatio: string
  macula: string
  vessels: string
  peripheralRetina: string
  notes: string
}

export interface VisitRefraction {
  auto: {
    od: { sph: string; cyl: string; axis: string }
    os: { sph: string; cyl: string; axis: string }
  }
  subjective: {
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
  } | null
}

export interface VisitOpticalRx {
  od: { sph: string; cyl: string; axis: string; add: string }
  os: { sph: string; cyl: string; axis: string; add: string }
  pd: string
  lensType: string
}

export interface VisitMedication {
  name: string
  description: string
  dosage: string
  frequency: string
  eye: string
  duration: string
  notes: string | null
}

export interface VisitRequest {
  type: string
  status: string
  result: string | null
}

export interface VisitRecord {
  id: string
  date: string
  diseaseGroup: DiseaseGroupType
  doctorName: string
  daysAgo: number | null

  // Pre-Exam
  screening: VisitScreening

  // Pre-Exam Step 2 (conditional)
  dryEye: VisitDryEye | null

  // Exam
  diagnoses: { text: string; icdCode: string; isPrimary: boolean }[]
  diagnosisNotes: string | null
  va: {
    od: { sc: string; cc: string; ph: string; iop: string }
    os: { sc: string; cc: string; ph: string; iop: string }
  }
  refraction: VisitRefraction
  slitLamp: { od: SlitLampEye; os: SlitLampEye } | null
  fundus: { od: FundusEye; os: FundusEye } | null

  // Requests
  requests: VisitRequest[]

  // Conclusion
  medications: VisitMedication[]
  opticalRx: VisitOpticalRx | null
  procedures: { name: string; notes: string }[]
  instructions: string | null
  followUp: { date: string; interval: string; instructions: string } | null
  followUpOverdue: boolean
}

export interface TrendDataPoint {
  date: string
  od: number | null
  os: number | null
}

export interface TrendChart {
  id: string
  title: string
  unit: string
  threshold?: { value: number; label: string }
  data: TrendDataPoint[]
  invertY?: boolean
  yLabels: string[]
}

export interface PatientDetail {
  personal: PatientPersonalInfo
  alerts: PatientDetailAlert[]
  stats: PatientDetailStat
  medicalHistory: MedicalHistory
  currentMedications: CurrentMedication[]
  opticalRx: OpticalRx | null
  diagnosisHistory: DiagnosisRecord[]
  latestMeasurements: MeasurementData | null
  visits: VisitRecord[]
  trends: TrendChart[]
}

export const DISEASE_GROUP_CONFIG: Record<
  DiseaseGroupType,
  { label: string; colorClass: string }
> = {
  dryEye: { label: "Dry Eye", colorClass: "bg-[#E6F1FB] text-[#0C447C]" },
  refraction: {
    label: "Refraction",
    colorClass: "bg-[#EEEDFE] text-[#3C3489]",
  },
  myopiaControl: {
    label: "Myopia Control",
    colorClass: "bg-emerald-100 text-emerald-800",
  },
  general: { label: "General", colorClass: "bg-[#F1EFE8] text-[#444441]" },
}

export const MOCK_PATIENT_DETAIL: PatientDetail = {
  personal: {
    id: "GK-2026-0012",
    name: "Nguyễn Văn An",
    dob: "15/03/1981",
    age: 45,
    gender: "Nam",
    phone: "0912 345 678",
    address: "45 Nguyễn Trãi, Thanh Xuân, HN",
    occupation: "Nhân viên văn phòng",
    insurance: "DN-4851234567",
    emergencyContact: "Nguyễn Thị Lan (vợ) · 0987 654 321",
  },
  alerts: [
    { type: "allergy", label: "Dị ứng: Tetracycline" },
    { type: "eyeDisease", label: "Cận thị" },
    { type: "eyeDisease", label: "Khô mắt" },
    { type: "osdi", label: "OSDI: 18/30" },
  ],
  stats: {
    totalVisits: 3,
    firstVisitDate: "10/03/2025",
    lastVisitDate: "15/01/2026",
    lastVisitDoctor: "BS. Nguyễn Thị Mai",
    currentDiagnosis: "Cận thị 2 mắt",
    currentDiagnosisIcd: "H52.1",
    secondaryDiagnosis: "Khô mắt H04.1",
    nextFollowUp: "Quá hạn",
    followUpDate: "15/03/2026",
    followUpDaysRemaining: -19,
  },
  medicalHistory: {
    eyeDiseases: ["Cận thị", "Khô mắt"],
    eyeNotes: "Đeo kính cận từ 15 tuổi. Mẹ cận nặng (-8.00D).",
    allergies: ["Tetracycline"],
    systemicHistory: null,
  },
  currentMedications: [
    {
      name: "Refresh Tears 0.5%",
      description: "Nước mắt nhân tạo",
      dosage: "1 giọt",
      frequency: "3 lần/ngày",
      eye: "OU",
      duration: "3 tháng",
      prescribedDate: "15/01/2026",
      doctor: "BS. Nguyễn Thị Mai",
    },
    {
      name: "Systane Ultra",
      description: "Gel bôi trơn mắt",
      dosage: "1 giọt",
      frequency: "Khi cần",
      eye: "OU",
      duration: "3 tháng",
      prescribedDate: "15/01/2026",
      doctor: "BS. Nguyễn Thị Mai",
    },
  ],
  opticalRx: {
    od: { sph: "-2.25", cyl: "-0.50", axis: "180°" },
    os: { sph: "-2.50", cyl: "-0.50", axis: "5°" },
    pd: "63.0",
    lensType: "Đơn tròng",
    prescribedDate: "20/09/2025",
    doctor: "BS. Trần Văn Hùng",
  },
  diagnosisHistory: [
    {
      name: "Cận thị 2 mắt",
      icdCode: "H52.1",
      type: "primary",
      firstSeen: "03/2025",
      lastSeen: null,
      visitCount: 3,
    },
    {
      name: "Loạn thị",
      icdCode: "H52.2",
      type: "secondary",
      firstSeen: "01/2026",
      lastSeen: null,
      visitCount: 1,
    },
    {
      name: "Hội chứng khô mắt",
      icdCode: "H04.1",
      type: "secondary",
      firstSeen: "01/2026",
      lastSeen: null,
      visitCount: 1,
    },
  ],
  latestMeasurements: {
    date: "15/01/2026",
    va: {
      od: { sc: "20/40", cc: "20/25", ph: "20/20", iop: "15" },
      os: { sc: "20/30", cc: "20/20", ph: "20/20", iop: "14" },
    },
    refraction: {
      od: { sph: "-2.50", cyl: "-0.75", axis: "180" },
      os: { sph: "-2.75", cyl: "-0.75", axis: "5" },
    },
    dryEye: {
      osdiScore: 18,
      osdiMax: 30,
      osdiSeverity: "Trung bình",
      od: { tbut: "7s", schirmer: "12mm", meibomian: "Tắc nhẹ" },
      os: { tbut: "8s", schirmer: "10mm", meibomian: "BT" },
    },
    slitLamp: "Tất cả bình thường (OD & OS)",
    fundus: "Bình thường · C/D 0.3 / 0.3",
  },
  visits: [
    {
      id: "v3",
      date: "15/01/2026",
      diseaseGroup: "dryEye",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: 79,
      screening: {
        chiefComplaint: "Tái khám định kỳ, kiểm tra độ kính",
        ucva: { od: "4/10", os: "5/10" },
        currentRx: { od: "9/10", os: "10/10" },
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: ["Nhìn mờ"],
        blinkImprovement: "Không",
        symptomDuration: "12 tháng",
        screenTime: "4 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: {
        osdiScore: 18,
        osdiMax: 30,
        osdiSeverity: "Trung bình",
        od: { tbut: "7s", schirmer: "12mm", meibomian: "Tắc nhẹ" },
        os: { tbut: "8s", schirmer: "10mm", meibomian: "BT" },
        staining: null,
      },
      diagnoses: [
        { text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true },
        { text: "Hội chứng khô mắt", icdCode: "H04.1", isPrimary: false },
      ],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/40", cc: "20/25", ph: "20/20", iop: "15" },
        os: { sc: "20/30", cc: "20/20", ph: "20/20", iop: "14" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.50", cyl: "-0.75", axis: "180" },
          os: { sph: "-2.75", cyl: "-0.75", axis: "5" },
        },
        subjective: null,
      },
      slitLamp: {
        od: {
          lids: "Bình thường",
          conjunctiva: "Bình thường",
          cornea: "Bình thường",
          anteriorChamber: "Bình thường",
          iris: "Bình thường",
          lens: "Trong",
          notes: "",
        },
        os: {
          lids: "Bình thường",
          conjunctiva: "Bình thường",
          cornea: "Bình thường",
          anteriorChamber: "Bình thường",
          iris: "Bình thường",
          lens: "Trong",
          notes: "",
        },
      },
      fundus: {
        od: {
          opticDisc: "Bình thường",
          cdRatio: "0.3",
          macula: "Bình thường",
          vessels: "Bình thường",
          peripheralRetina: "Bình thường",
          notes: "",
        },
        os: {
          opticDisc: "Bình thường",
          cdRatio: "0.3",
          macula: "Bình thường",
          vessels: "Bình thường",
          peripheralRetina: "Bình thường",
          notes: "",
        },
      },
      requests: [
        {
          type: "Đo khúc xạ chủ quan",
          status: "completed",
          result:
            "OD -2.25 / -0.50 x 180 (BCVA 20/20) · OS -2.50 / -0.50 x 5 (BCVA 20/20)",
        },
      ],
      medications: [
        {
          name: "Refresh Tears 0.5%",
          description: "Nước mắt nhân tạo",
          dosage: "1 giọt",
          frequency: "3 lần/ngày",
          eye: "OU",
          duration: "3 tháng",
          notes: null,
        },
        {
          name: "Systane Ultra",
          description: "Gel bôi trơn mắt",
          dosage: "1 giọt",
          frequency: "Khi cần",
          eye: "OU",
          duration: "3 tháng",
          notes: null,
        },
      ],
      opticalRx: null,
      procedures: [],
      instructions: "Giảm screen time. Nhỏ nước mắt đều.",
      followUp: {
        date: "15/03/2026",
        interval: "2 tháng",
        instructions: "Tái khám đánh giá khô mắt",
      },
      followUpOverdue: true,
    },
    {
      id: "v2",
      date: "20/09/2025",
      diseaseGroup: "refraction",
      doctorName: "BS. Trần Văn Hùng",
      daysAgo: 196,
      screening: {
        chiefComplaint: "Nhìn mờ xa, muốn kiểm tra lại độ kính",
        ucva: { od: "5/10", os: "6/10" },
        currentRx: { od: "9/10", os: "10/10" },
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: ["Nhìn mờ"],
        blinkImprovement: null,
        symptomDuration: "6 tháng",
        screenTime: "5 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: null,
      diagnoses: [{ text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true }],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/30", cc: "20/25", ph: "", iop: "14" },
        os: { sc: "20/25", cc: "20/20", ph: "", iop: "14" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.25", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.50", cyl: "-0.75", axis: "5" },
        },
        subjective: {
          od: {
            sph: "-2.25",
            cyl: "-0.50",
            axis: "180",
            bcva: "20/20",
            add: "",
            pd: "31.5",
          },
          os: {
            sph: "-2.50",
            cyl: "-0.50",
            axis: "5",
            bcva: "20/20",
            add: "",
            pd: "31.5",
          },
        },
      },
      slitLamp: null,
      fundus: null,
      requests: [
        {
          type: "Đo khúc xạ chủ quan",
          status: "completed",
          result:
            "OD -2.25 / -0.50 x 180 (BCVA 20/20) · OS -2.50 / -0.50 x 5 (BCVA 20/20)",
        },
      ],
      medications: [],
      opticalRx: {
        od: { sph: "-2.25", cyl: "-0.50", axis: "180°", add: "" },
        os: { sph: "-2.50", cyl: "-0.50", axis: "5°", add: "" },
        pd: "63.0",
        lensType: "Đơn tròng",
      },
      procedures: [],
      instructions: "Đeo kính đúng số. Tái khám sau 6 tháng.",
      followUp: null,
      followUpOverdue: false,
    },
    {
      id: "v1",
      date: "10/03/2025",
      diseaseGroup: "general",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: null,
      screening: {
        chiefComplaint: "Khám mắt tổng quát lần đầu",
        ucva: { od: "5/10", os: "6/10" },
        currentRx: null,
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: [],
        blinkImprovement: null,
        symptomDuration: null,
        screenTime: "4 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: null,
      diagnoses: [{ text: "Cận thị", icdCode: "H52.1", isPrimary: true }],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/30", cc: "20/20", ph: "", iop: "14" },
        os: { sc: "20/25", cc: "20/20", ph: "", iop: "13" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.00", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.25", cyl: "-0.50", axis: "5" },
        },
        subjective: null,
      },
      slitLamp: null,
      fundus: null,
      requests: [],
      medications: [],
      opticalRx: null,
      procedures: [],
      instructions: null,
      followUp: null,
      followUpOverdue: false,
    },
  ],
  trends: [
    {
      id: "va-sc",
      title: "Thị lực SC (không kính)",
      unit: "Snellen",
      data: [
        { date: "03/2025", od: 0.67, os: 0.8 },
        { date: "09/2025", od: 0.67, os: 0.8 },
        { date: "01/2026", od: 0.5, os: 0.67 },
      ],
      invertY: true,
      yLabels: ["20/20", "20/30", "20/40", "20/50"],
    },
    {
      id: "iop",
      title: "Nhãn áp (IOP mmHg)",
      unit: "mmHg",
      threshold: { value: 21, label: "Ngưỡng 21" },
      data: [
        { date: "03/2025", od: 14, os: 13 },
        { date: "09/2025", od: 14, os: 14 },
        { date: "01/2026", od: 15, os: 14 },
      ],
      yLabels: ["22", "18", "14", "10"],
    },
    {
      id: "sphere",
      title: "Khúc xạ (Sphere)",
      unit: "D",
      data: [
        { date: "03/2025", od: -2.0, os: -2.25 },
        { date: "09/2025", od: -2.25, os: -2.5 },
        { date: "01/2026", od: -2.5, os: -2.75 },
      ],
      yLabels: ["-1.0", "-2.0", "-2.5", "-3.0"],
    },
    {
      id: "tbut",
      title: "TBUT (giây)",
      unit: "s",
      threshold: { value: 5, label: "Ngưỡng 5s" },
      data: [
        { date: "09/2025", od: null, os: null },
        { date: "01/2026", od: 7, os: 8 },
      ],
      yLabels: ["15", "10", "5", "0"],
    },
  ],
}
