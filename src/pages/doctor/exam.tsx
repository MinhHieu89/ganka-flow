import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import { PatientPanel } from "@/components/doctor/patient-panel"
import { ScreeningData } from "@/components/doctor/screening-data"
import { ExamFindings } from "@/components/doctor/exam-findings"
import { DiagnosisInput } from "@/components/doctor/diagnosis-input"
import { TreatmentPlan } from "@/components/doctor/treatment-plan"
import type { ExamData } from "@/data/mock-patients"

const EMPTY_EXAM: ExamData = {
  va: { od: "", os: "" },
  iop: { od: "", os: "" },
  slitLamp: "",
  fundus: "",
  diagnoses: [],
  medications: [],
  procedures: [],
}

export default function DoctorExam() {
  const { visitId } = useParams<{ visitId: string }>()
  const navigate = useNavigate()
  const { visits, getPatient } = useReceptionist()
  const { startExam, saveExamDraft, completeExam } = useDoctor()

  const visit = visits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  const [examData, setExamData] = useState<ExamData>(
    visit?.examData ?? EMPTY_EXAM
  )

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

  const diseaseGroups =
    visit.screeningData?.step2?.selectedGroups ?? []

  function handleSaveDraft() {
    saveExamDraft(visit!.id, examData)
  }

  function handleComplete() {
    completeExam(visit!.id, examData)
    navigate("/doctor")
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/doctor")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Button>
        <div className="text-sm font-medium">
          Khám bệnh — {patient.name} · {visit.patientId}
        </div>
      </div>

      {/* Resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={30} minSize={20}>
          <PatientPanel patient={patient} visit={visit} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={70} minSize={50}>
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {/* Screening data (read-only with edit) */}
              <ScreeningData visit={visit} />

              {/* Exam findings */}
              <div className="border-t border-border pt-4">
                <ExamFindings
                  examData={examData}
                  diseaseGroups={diseaseGroups}
                  onChange={setExamData}
                />
              </div>

              {/* Diagnosis */}
              <div className="border-t border-border pt-4">
                <DiagnosisInput
                  diagnoses={examData.diagnoses}
                  onChange={(diagnoses) =>
                    setExamData({ ...examData, diagnoses })
                  }
                />
              </div>

              {/* Treatment Plan */}
              <div className="border-t border-border pt-4">
                <TreatmentPlan
                  examData={examData}
                  onChange={setExamData}
                />
              </div>
            </div>

            {/* Action bar */}
            <div className="sticky bottom-0 flex justify-end gap-2 border-t border-border bg-background px-5 py-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleComplete}>Hoàn tất khám</Button>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
