import { createContext, useContext, type ReactNode } from "react"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Visit, ExamData } from "@/data/mock-patients"

interface DoctorContextType {
  currentDoctor: string
  todayVisits: Visit[]
  startExam: (visitId: string) => void
  saveExamDraft: (visitId: string, examData: ExamData) => void
  completeExam: (visitId: string, examData: ExamData) => void
}

const DoctorContext = createContext<DoctorContextType | null>(null)

export function DoctorProvider({ children }: { children: ReactNode }) {
  const { todayVisits, updateVisitStatus, visits } = useReceptionist()
  const currentDoctor = "BS. Nguyễn Hải"

  const doctorVisits = todayVisits.filter((v) => v.doctorName === currentDoctor)

  function startExam(visitId: string) {
    updateVisitStatus(visitId, "dang_kham")
  }

  function saveExamDraft(visitId: string, examData: ExamData) {
    const visit = visits.find((v) => v.id === visitId)
    if (visit) {
      visit.examData = examData
    }
  }

  function completeExam(visitId: string, examData: ExamData) {
    const visit = visits.find((v) => v.id === visitId)
    if (visit) {
      visit.examData = examData
    }
    updateVisitStatus(visitId, "hoan_thanh")
  }

  return (
    <DoctorContext.Provider
      value={{
        currentDoctor,
        todayVisits: doctorVisits,
        startExam,
        saveExamDraft,
        completeExam,
      }}
    >
      {children}
    </DoctorContext.Provider>
  )
}

export function useDoctor() {
  const context = useContext(DoctorContext)
  if (!context) {
    throw new Error("useDoctor must be used within DoctorProvider")
  }
  return context
}
