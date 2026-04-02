import { useParams, Link } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { Button } from "@/components/ui/button"
import { ScreeningForm } from "@/components/screening/screening-form"

export default function ScreeningVisit() {
  const { visitId } = useParams<{ visitId: string }>()
  const { todayVisits, getPatient } = useReceptionist()

  const visit = todayVisits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  if (!visit || !patient) {
    return (
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            Không tìm thấy lượt khám này.
          </p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/screening">← Quay lại</Link>
          </Button>
        </div>
      </div>
    )
  }

  return <ScreeningForm patient={patient} visit={visit} />
}
