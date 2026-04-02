import { useParams, Link } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function ScreeningVisit() {
  const { visitId } = useParams<{ visitId: string }>()
  const { todayVisits, getPatient } = useReceptionist()

  const visit = todayVisits.find((v) => v.id === visitId)
  const patient = visit ? getPatient(visit.patientId) : undefined

  if (!visit || !patient) {
    return (
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">Không tìm thấy lượt khám này.</p>
          <Button variant="outline" className="mt-4" asChild>
            <Link to="/screening">← Quay lại</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" asChild>
          <Link to="/screening">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold">{patient.name}</h1>
          <p className="text-sm text-muted-foreground">{patient.id}</p>
        </div>
      </div>

      {/* Placeholder content */}
      <div className="rounded-lg border border-border p-12 text-center">
        <p className="text-lg text-muted-foreground">
          Trang sàng lọc đang được phát triển
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Biểu mẫu sàng lọc sẽ được thêm trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  )
}
