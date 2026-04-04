import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import type { Patient, Visit } from "@/data/mock-patients"
import { SOURCE_CONFIG } from "@/data/mock-patients"

interface ScreeningFormHeaderProps {
  patient: Patient
  visit: Visit
}

export function ScreeningFormHeader({
  patient,
  visit,
}: ScreeningFormHeaderProps) {
  const waitMinutes = visit.checkedInAt
    ? Math.floor((Date.now() - new Date(visit.checkedInAt).getTime()) / 60000)
    : 0

  const sourceLabel = SOURCE_CONFIG[visit.source].label

  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link to="/screening">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold">{patient.name}</h1>
        <p className="text-sm text-muted-foreground">
          {patient.id} · {patient.gender} · {patient.birthYear} · {sourceLabel}
        </p>
      </div>
      {visit.checkedInAt && (
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Thời gian chờ:</span>
          <span
            className={
              waitMinutes >= 30
                ? "font-semibold text-destructive"
                : "text-amber-500"
            }
          >
            {waitMinutes}p
          </span>
        </div>
      )}
    </div>
  )
}
