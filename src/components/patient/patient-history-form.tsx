import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Patient, Visit } from "@/data/mock-patients"
import { useReceptionist } from "@/contexts/receptionist-context"
import {
  PatientHistoryStepComplaint,
  type ComplaintData,
} from "./patient-history-step-complaint"
import {
  PatientHistoryStepEye,
  type EyeHistoryData,
} from "./patient-history-step-eye"
import {
  PatientHistoryStepMedical,
  type MedicalHistoryData,
} from "./patient-history-step-medical"
import {
  PatientHistoryStepFamily,
  type FamilyHistoryData,
} from "./patient-history-step-family"
import {
  PatientHistoryStepLifestyle,
  type LifestyleData,
} from "./patient-history-step-lifestyle"
import { PatientHistorySummary } from "./patient-history-summary"

interface PatientHistoryFormProps {
  patient: Patient
  visit: Visit
  isReturning: boolean
  onComplete: () => void
}

function initEyeData(patient: Patient): EyeHistoryData {
  return {
    lastEyeExam: patient.lastEyeExam ?? { date: "", location: "" },
    currentGlasses: patient.currentGlasses ?? {
      types: [],
      duration: "",
      seesWell: undefined,
    },
    contactLensStatus: patient.contactLensStatus ?? "",
    contactLensDetail: patient.contactLensDetail ?? {
      type: [],
      brand: "",
      duration: "",
      issues: [],
      issueOther: "",
    },
    eyeInjury: patient.eyeInjury ?? { has: false, detail: "" },
    diagnosedEyeConditions: patient.diagnosedEyeConditions ?? {},
    diagnosedEyeConditionOther: patient.diagnosedEyeConditionOther ?? "",
    refractionValues: patient.refractionValues ?? {},
    eyeSurgeries: patient.eyeSurgeries ?? [],
  }
}

function initMedicalData(patient: Patient): MedicalHistoryData {
  return {
    primaryDoctor: patient.primaryDoctor ?? { name: "", lastVisit: "" },
    systemicConditions: patient.systemicConditions ?? {},
    diabetesDetail: patient.diabetesDetail ?? {},
    cancerDetail: patient.cancerDetail ?? {},
    systemicConditionOther: patient.systemicConditionOther ?? "",
    medicationsList: patient.medicationsList ?? [],
    allergiesInfo: patient.allergiesInfo ?? { none: false, items: [] },
    pregnancyStatus: patient.pregnancyStatus ?? "",
    pregnancyTrimester: patient.pregnancyTrimester ?? "",
  }
}

function initFamilyData(patient: Patient): FamilyHistoryData {
  return {
    familyEyeHistory: patient.familyEyeHistory ?? {},
    familyMedicalHistory: patient.familyMedicalHistory ?? {},
    familyHistoryOther: patient.familyHistoryOther ?? {
      has: false,
      detail: "",
      who: "",
    },
  }
}

function initLifestyleData(patient: Patient): LifestyleData {
  return {
    smokingInfo: patient.smokingInfo ?? {
      status: "khong",
      quantity: "",
      years: "",
      quitYear: "",
    },
    alcoholInfo: patient.alcoholInfo ?? {
      status: "khong",
      frequency: "",
    },
    screenTimeComputer: patient.screenTimeComputer ?? "",
    screenTimePhone: patient.screenTimePhone ?? "",
    outdoorTime: patient.outdoorTime ?? "",
    sunglassesUse: patient.sunglassesUse ?? "",
    workNearVision: patient.workNearVision ?? false,
    workDustyChemical: patient.workDustyChemical ?? false,
    drivingInfo: patient.drivingInfo ?? { does: false },
    sportsInfo: patient.sportsInfo ?? { does: false },
    hobbies: patient.hobbies ?? "",
  }
}

const STEP_TITLES_NEW = [
  "Lý do khám",
  "Tiền sử mắt",
  "Tiền sử y tế",
  "Tiền sử gia đình",
  "Thói quen sinh hoạt",
]

const STEP_TITLES_RETURNING = ["Lý do khám", "Xem lại thông tin"]

export function PatientHistoryForm({
  patient,
  visit,
  isReturning,
  onComplete,
}: PatientHistoryFormProps) {
  // visit will be used for historyStatus updates once the context method is added
  void visit
  const { updatePatient } = useReceptionist()

  const [currentStep, setCurrentStep] = useState(0)
  const [complaintData, setComplaintData] = useState<ComplaintData>({
    visitReasons: [],
    visitReasonOther: "",
    symptomDetail: {},
    symptoms: {},
  })
  const [eyeData, setEyeData] = useState<EyeHistoryData>(() =>
    initEyeData(patient)
  )
  const [medicalData, setMedicalData] = useState<MedicalHistoryData>(() =>
    initMedicalData(patient)
  )
  const [familyData, setFamilyData] = useState<FamilyHistoryData>(() =>
    initFamilyData(patient)
  )
  const [lifestyleData, setLifestyleData] = useState<LifestyleData>(() =>
    initLifestyleData(patient)
  )
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // Build a "live" patient object with current form data for the summary
  const patientWithFormData: Patient = {
    ...patient,
    ...eyeDataToPatient(eyeData),
    ...medicalDataToPatient(medicalData),
    ...familyDataToPatient(familyData),
    ...lifestyleDataToPatient(lifestyleData),
  }

  const stepTitles = isReturning ? STEP_TITLES_RETURNING : STEP_TITLES_NEW
  const totalSteps = stepTitles.length
  const displayStep = Math.min(currentStep + 1, totalSteps)
  const stepTitle = stepTitles[Math.min(currentStep, totalSteps - 1)]
  const isLastStep = currentStep === totalSteps - 1

  function handleSave() {
    updatePatient(patient.id, {
      // Eye history
      lastEyeExam: eyeData.lastEyeExam,
      currentGlasses: eyeData.currentGlasses,
      contactLensStatus:
        eyeData.contactLensStatus as Patient["contactLensStatus"],
      contactLensDetail: eyeData.contactLensDetail,
      eyeInjury: eyeData.eyeInjury,
      diagnosedEyeConditions: eyeData.diagnosedEyeConditions,
      diagnosedEyeConditionOther: eyeData.diagnosedEyeConditionOther,
      refractionValues: eyeData.refractionValues,
      eyeSurgeries: eyeData.eyeSurgeries,
      // Medical history
      primaryDoctor: medicalData.primaryDoctor,
      systemicConditions: medicalData.systemicConditions,
      diabetesDetail: medicalData.diabetesDetail,
      cancerDetail: medicalData.cancerDetail,
      systemicConditionOther: medicalData.systemicConditionOther,
      medicationsList: medicalData.medicationsList,
      allergiesInfo: medicalData.allergiesInfo,
      pregnancyStatus:
        medicalData.pregnancyStatus as Patient["pregnancyStatus"],
      pregnancyTrimester: medicalData.pregnancyTrimester,
      // Family history
      familyEyeHistory: familyData.familyEyeHistory,
      familyMedicalHistory: familyData.familyMedicalHistory,
      familyHistoryOther: familyData.familyHistoryOther,
      // Lifestyle
      smokingInfo: lifestyleData.smokingInfo,
      alcoholInfo: lifestyleData.alcoholInfo,
      screenTimeComputer: lifestyleData.screenTimeComputer,
      screenTimePhone: lifestyleData.screenTimePhone,
      outdoorTime: lifestyleData.outdoorTime,
      sunglassesUse: lifestyleData.sunglassesUse,
      workNearVision: lifestyleData.workNearVision,
      workDustyChemical: lifestyleData.workDustyChemical,
      drivingInfo: lifestyleData.drivingInfo,
      sportsInfo: lifestyleData.sportsInfo,
      hobbies: lifestyleData.hobbies,
      // Per-visit complaint data
      visitReasons: complaintData.visitReasons,
      visitReasonOther: complaintData.visitReasonOther,
      symptomDetail: complaintData.symptomDetail,
      symptoms: complaintData.symptoms,
    })
  }

  function handleNext() {
    if (isLastStep) {
      handleSave()
      setIsCompleted(true)
      onComplete()
      return
    }
    setCurrentStep((s) => s + 1)
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
    }
  }

  function handleUpdateSection(
    section: "eye" | "medical" | "family" | "lifestyle"
  ) {
    setEditingSection(section)
  }

  function handleDoneEditing() {
    setEditingSection(null)
  }

  function renderStep() {
    if (isCompleted) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <svg
              className="size-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold">Cảm ơn!</h2>
          <p className="mt-2 text-muted-foreground">
            Thông tin của bạn đã được ghi nhận.
            <br />
            Vui lòng chờ gọi tên.
          </p>
        </div>
      )
    }

    // Complaint step is always step 0 for both flows
    if (currentStep === 0) {
      return (
        <PatientHistoryStepComplaint
          data={complaintData}
          onChange={setComplaintData}
        />
      )
    }

    // New patient: steps 1-4 are individual form sections
    if (!isReturning) {
      switch (currentStep) {
        case 1:
          return (
            <PatientHistoryStepEye data={eyeData} onChange={setEyeData} />
          )
        case 2:
          return (
            <PatientHistoryStepMedical
              data={medicalData}
              gender={patient.gender}
              onChange={setMedicalData}
            />
          )
        case 3:
          return (
            <PatientHistoryStepFamily
              data={familyData}
              onChange={setFamilyData}
            />
          )
        case 4:
          return (
            <PatientHistoryStepLifestyle
              data={lifestyleData}
              onChange={setLifestyleData}
            />
          )
        default:
          return null
      }
    }

    // Returning patient: step 1 is summary with optional inline editing
    if (currentStep === 1) {
      if (editingSection === "eye") {
        return (
          <div>
            <PatientHistoryStepEye data={eyeData} onChange={setEyeData} />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDoneEditing}>Xong</Button>
            </div>
          </div>
        )
      }
      if (editingSection === "medical") {
        return (
          <div>
            <PatientHistoryStepMedical
              data={medicalData}
              gender={patient.gender}
              onChange={setMedicalData}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDoneEditing}>Xong</Button>
            </div>
          </div>
        )
      }
      if (editingSection === "family") {
        return (
          <div>
            <PatientHistoryStepFamily
              data={familyData}
              onChange={setFamilyData}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDoneEditing}>Xong</Button>
            </div>
          </div>
        )
      }
      if (editingSection === "lifestyle") {
        return (
          <div>
            <PatientHistoryStepLifestyle
              data={lifestyleData}
              onChange={setLifestyleData}
            />
            <div className="mt-4 flex justify-end">
              <Button onClick={handleDoneEditing}>Xong</Button>
            </div>
          </div>
        )
      }

      return (
        <PatientHistorySummary
          patient={patientWithFormData}
          onUpdateSection={handleUpdateSection}
          editingSection={editingSection}
        />
      )
    }

    return null
  }

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background px-4 py-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-lg font-bold">Khai báo bệnh sử</h1>
        <p className="text-sm text-muted-foreground">{patient.name}</p>
      </div>

      {/* Progress bar */}
      {!isCompleted && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Bước {displayStep}/{totalSteps}
            </span>
            <span>{stepTitle}</span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${(displayStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      {renderStep()}

      {/* Navigation (not shown on completion screen) */}
      {!isCompleted && (
        <div className="mt-8 flex justify-between">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              ← Quay lại
            </Button>
          )}
          <Button onClick={handleNext} className="ml-auto">
            {isLastStep ? "Hoàn thành" : "Tiếp tục →"}
          </Button>
        </div>
      )}
    </div>
  )
}

// Helper functions to map form data back to Patient fields for the summary preview
function eyeDataToPatient(data: EyeHistoryData): Partial<Patient> {
  return {
    lastEyeExam: data.lastEyeExam,
    currentGlasses: data.currentGlasses,
    contactLensStatus: data.contactLensStatus as Patient["contactLensStatus"],
    contactLensDetail: data.contactLensDetail,
    eyeInjury: data.eyeInjury,
    diagnosedEyeConditions: data.diagnosedEyeConditions,
    diagnosedEyeConditionOther: data.diagnosedEyeConditionOther,
    refractionValues: data.refractionValues,
    eyeSurgeries: data.eyeSurgeries,
  }
}

function medicalDataToPatient(data: MedicalHistoryData): Partial<Patient> {
  return {
    primaryDoctor: data.primaryDoctor,
    systemicConditions: data.systemicConditions,
    diabetesDetail: data.diabetesDetail,
    cancerDetail: data.cancerDetail,
    systemicConditionOther: data.systemicConditionOther,
    medicationsList: data.medicationsList,
    allergiesInfo: data.allergiesInfo,
    pregnancyStatus: data.pregnancyStatus as Patient["pregnancyStatus"],
    pregnancyTrimester: data.pregnancyTrimester,
  }
}

function familyDataToPatient(data: FamilyHistoryData): Partial<Patient> {
  return {
    familyEyeHistory: data.familyEyeHistory,
    familyMedicalHistory: data.familyMedicalHistory,
    familyHistoryOther: data.familyHistoryOther,
  }
}

function lifestyleDataToPatient(data: LifestyleData): Partial<Patient> {
  return {
    smokingInfo: data.smokingInfo,
    alcoholInfo: data.alcoholInfo,
    screenTimeComputer: data.screenTimeComputer,
    screenTimePhone: data.screenTimePhone,
    outdoorTime: data.outdoorTime,
    sunglassesUse: data.sunglassesUse,
    workNearVision: data.workNearVision,
    workDustyChemical: data.workDustyChemical,
    drivingInfo: data.drivingInfo,
    sportsInfo: data.sportsInfo,
    hobbies: data.hobbies,
  }
}
