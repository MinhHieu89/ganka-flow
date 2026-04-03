// src/components/patients/detail/patient-header.tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PencilEdit02Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { CreateVisitDialog } from "./create-visit-dialog"
import type {
  PatientPersonalInfo,
  PatientDetailAlert,
} from "@/data/mock-patient-detail"

const ALERT_STYLES: Record<string, string> = {
  allergy: "bg-[#FCEBEB] text-[#791F1F]",
  eyeDisease: "bg-[#E6F1FB] text-[#0C447C]",
  osdi: "bg-[#FAEEDA] text-[#633806]",
  redFlag: "bg-[#FCEBEB] text-[#791F1F]",
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  return words
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

interface PatientDetailHeaderProps {
  patient: PatientPersonalInfo
  alerts: PatientDetailAlert[]
  isCollapsed: boolean
}

export function PatientDetailHeader({
  patient,
  alerts,
  isCollapsed,
}: PatientDetailHeaderProps) {
  const navigate = useNavigate()
  const initials = getInitials(patient.name)
  const [showCreateVisit, setShowCreateVisit] = useState(false)

  if (isCollapsed) {
    return (
      <div className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
            >
              {initials}
            </div>
            <span className="text-[15px] font-medium">{patient.name}</span>
            <span className="text-xs text-muted-foreground">{patient.id}</span>
            {alerts.some((a) => a.type === "allergy") && (
              <span className="rounded-full bg-[#FCEBEB] px-2 py-0.5 text-[10px] font-medium text-[#791F1F]">
                Dị ứng
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-7 text-xs">
              Chỉnh sửa
            </Button>
            <Button
              size="sm"
              className="h-7 bg-[#1D9E75] text-xs text-white hover:bg-[#0F6E56]"
              onClick={() => setShowCreateVisit(true)}
            >
              Tạo lượt khám
            </Button>
          </div>
          <CreateVisitDialog
            open={showCreateVisit}
            onOpenChange={setShowCreateVisit}
            patientName={patient.name}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-border pb-[18px]">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("/patients")}
        className="mb-4 flex items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        Danh sách bệnh nhân
      </button>

      {/* Header content */}
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full text-lg font-medium"
          style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
        >
          {initials}
        </div>

        <div className="flex-1">
          {/* Line 1: Name + ID + Actions */}
          <div className="mb-1.5 flex items-center justify-between">
            <div className="flex items-baseline gap-2.5">
              <span className="text-[21px] font-medium">{patient.name}</span>
              <span className="text-[13px] text-muted-foreground">
                {patient.id}
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <HugeiconsIcon
                  icon={PencilEdit02Icon}
                  className="size-3.5"
                  strokeWidth={1.5}
                />
                Chỉnh sửa
              </Button>
              <Button
                size="sm"
                className="gap-1.5 bg-[#1D9E75] text-white hover:bg-[#0F6E56]"
                onClick={() => setShowCreateVisit(true)}
              >
                <HugeiconsIcon
                  icon={Stethoscope02Icon}
                  className="size-3.5"
                  strokeWidth={1.5}
                />
                Tạo lượt khám
              </Button>
            </div>
          </div>

          {/* Line 2: Meta + Pills */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[13px] text-muted-foreground">
              {patient.gender}, {patient.age} tuổi ({patient.dob})
            </span>
            <span className="text-[13px] text-muted-foreground">
              {patient.phone}
            </span>
            {alerts.length > 0 && <span className="h-3.5 w-px bg-border" />}
            {alerts.slice(0, 5).map((alert, i) => (
              <span
                key={i}
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  ALERT_STYLES[alert.type]
                )}
              >
                {alert.label}
              </span>
            ))}
            {alerts.length > 5 && (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                +{alerts.length - 5}
              </span>
            )}
          </div>
        </div>
      </div>
      <CreateVisitDialog
        open={showCreateVisit}
        onOpenChange={setShowCreateVisit}
        patientName={patient.name}
      />
    </div>
  )
}
