import { useParams, useSearchParams } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { PatientHistoryForm } from "@/components/patient/patient-history-form"

export default function PatientHistory() {
  const { visitId } = useParams<{ visitId: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token")
  const { todayVisits, getPatient } = useReceptionist()

  const visit = todayVisits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  if (!visit || !patient) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Không tìm thấy phiếu khám hoặc link đã hết hạn.
          </p>
        </div>
      </div>
    )
  }

  // Determine if returning patient (has any per-patient history data)
  const isReturning = !!(
    patient.diagnosedEyeConditions ||
    patient.systemicConditions ||
    patient.familyEyeHistory ||
    (patient.smokingInfo && patient.smokingInfo.status !== "khong")
  )

  return (
    <PatientHistoryForm
      patient={patient}
      visit={visit}
      isReturning={isReturning}
      onComplete={() => {
        // Patient stays on completion screen — no navigation needed
      }}
    />
  )
}
