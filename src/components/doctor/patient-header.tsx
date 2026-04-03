import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft01Icon, PrinterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Patient, Visit } from "@/data/mock-patients"
import { cn } from "@/lib/utils"

interface PatientHeaderProps {
  patient: Patient
  visit: Visit
  onComplete: () => void
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const last2 = words.slice(-2)
  return last2
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function getVisitBadgeLabel(visit: Visit): string {
  const count = visit.previousVisits?.length ?? 0
  if (count === 0) return "Khám lần đầu"
  return "Tái khám"
}

export function PatientHeader({ patient, visit, onComplete }: PatientHeaderProps) {
  const age = new Date().getFullYear() - patient.birthYear
  const initials = getInitials(patient.name)
  const badgeLabel = getVisitBadgeLabel(visit)
  const isFirstVisit = (visit.previousVisits?.length ?? 0) === 0

  return (
    <div className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-6">
      {/* Back button */}
      <Button variant="ghost" size="icon-sm" asChild>
        <Link to="/doctor" aria-label="Quay lại danh sách">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </Link>
      </Button>

      {/* Avatar */}
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
      >
        {initials}
      </div>

      {/* Patient info */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0">
          <span className="truncate text-[15px] font-medium leading-tight">
            {patient.name}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span>{patient.id}</span>
          <span className="text-border">·</span>
          <span>
            {patient.gender} · {age} tuổi
          </span>
          <span className="text-border">·</span>
          <span>{patient.phone}</span>
        </div>

        {/* Visit type badge */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium",
            isFirstVisit
              ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
          )}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="sm" className="gap-1.5">
          <HugeiconsIcon icon={PrinterIcon} className="size-4" strokeWidth={1.5} />
          In phiếu
        </Button>
        <Button
          size="sm"
          onClick={onComplete}
          className="bg-[#1D9E75] text-white transition-colors hover:bg-[#0F6E56] focus-visible:ring-[#1D9E75]/30"
        >
          Hoàn tất khám
        </Button>
      </div>
    </div>
  )
}
