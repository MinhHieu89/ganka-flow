import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => navigate("/patients")}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Chi tiết bệnh nhân</h1>
          <p className="text-sm text-muted-foreground">{id}</p>
        </div>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border py-20 text-muted-foreground">
        Trang chi tiết bệnh nhân sẽ được phát triển sau
      </div>
    </div>
  )
}
