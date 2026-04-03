import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import { PatientHeader } from "@/components/doctor/patient-header"
import { ExamSidebar, type ExamTab } from "@/components/doctor/exam-sidebar"
import { TabPatient } from "@/components/doctor/tab-patient"
import { TabPreExam } from "@/components/doctor/tab-pre-exam"
import { TabRequests } from "@/components/doctor/tab-requests"
import { TabExam } from "@/components/doctor/tab-exam"
import type { ExamData, VisitRequest } from "@/data/mock-patients"

const EMPTY_SLIT_LAMP_EYE = {
  lids: "",
  conjunctiva: "",
  cornea: "",
  anteriorChamber: "",
  iris: "",
  lens: "",
  notes: "",
}
const EMPTY_FUNDUS_EYE = {
  opticDisc: "",
  cdRatio: "",
  macula: "",
  vessels: "",
  peripheralRetina: "",
  notes: "",
}
const EMPTY_EXAM: ExamData = {
  slitLamp: { od: { ...EMPTY_SLIT_LAMP_EYE }, os: { ...EMPTY_SLIT_LAMP_EYE } },
  fundus: { od: { ...EMPTY_FUNDUS_EYE }, os: { ...EMPTY_FUNDUS_EYE } },
  diagnoses: [],
  diagnosisNotes: "",
  medications: [],
  procedures: [],
  requests: [],
}

export default function DoctorExam() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const { visits, getPatient } = useReceptionist()
  const { startExam, saveExamDraft, completeExam } = useDoctor()

  const visit = visits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  const [activeTab, setActiveTab] = useState<ExamTab>("exam")
  const [examData, setExamData] = useState<ExamData>(() => ({
    ...(visit?.examData ?? EMPTY_EXAM),
    requests: visit?.requests ?? [],
  }))

  useEffect(() => {
    if (visit && visit.status === "cho_kham") {
      startExam(visit.id)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!visit || !patient) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Không tìm thấy lượt khám
      </div>
    )
  }

  const pendingRequestCount = examData.requests.filter(
    (r) => r.status === "pending" || r.status === "in_progress"
  ).length

  const previousVisit = visit.previousVisits?.[0]

  function handleAddRequest(
    request: Omit<VisitRequest, "id" | "requestedAt" | "status">
  ) {
    const newRequest: VisitRequest = {
      ...request,
      id: `req-${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: "pending",
    }
    setExamData((prev) => ({
      ...prev,
      requests: [...prev.requests, newRequest],
    }))
  }

  function handleComplete() {
    if (examData.diagnoses.length === 0) {
      return
    }
    completeExam(visit!.id, examData)
    navigate("/doctor")
  }

  function handleSaveDraft() {
    saveExamDraft(visit!.id, examData)
  }

  // Keep handleSaveDraft available but not wired to UI for now
  void handleSaveDraft

  return (
    <div className="flex flex-1 flex-col">
      <PatientHeader
        patient={patient}
        visit={visit}
        onComplete={handleComplete}
      />
      <div className="flex flex-1 overflow-hidden">
        <ExamSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingRequestCount={pendingRequestCount}
        />
        <div className="flex-1 overflow-y-auto">
          {activeTab === "patient" && (
            <TabPatient patient={patient} visit={visit} />
          )}
          {activeTab === "preExam" && (
            <TabPreExam patient={patient} visit={visit} />
          )}
          {activeTab === "requests" && (
            <TabRequests
              requests={examData.requests}
              onAddRequest={handleAddRequest}
            />
          )}
          {activeTab === "exam" && (
            <TabExam
              examData={examData}
              onChange={setExamData}
              previousVisit={previousVisit}
            />
          )}
        </div>
      </div>
    </div>
  )
}
