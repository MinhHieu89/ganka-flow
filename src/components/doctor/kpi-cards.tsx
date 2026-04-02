import { HugeiconsIcon } from "@hugeicons/react"
import {
  Stethoscope02Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"
import { useDoctor } from "@/contexts/doctor-context"
import { useReceptionist } from "@/contexts/receptionist-context"

const kpiConfig = [
  {
    key: "dang_kham",
    label: "Đang khám",
    icon: Stethoscope02Icon,
    colorClass: "text-blue-600",
  },
  {
    key: "cho_kham",
    label: "Đang chờ",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "hoan_thanh",
    label: "Đã khám",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-emerald-600",
  },
  {
    key: "next_appointment",
    label: "Lịch hẹn kế tiếp",
    icon: Calendar01Icon,
    colorClass: "text-violet-600",
  },
] as const

export function DoctorKpiCards() {
  const { todayVisits } = useDoctor()
  const { appointments } = useReceptionist()

  const counts = {
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
  }

  const now = new Date()
  const nextAppt = appointments
    .filter((a) => {
      if (!a.time) return false
      const [h, m] = a.time.split(":").map(Number)
      return h * 60 + m > now.getHours() * 60 + now.getMinutes()
    })
    .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""))[0]

  const nextTime = nextAppt?.time ?? "—"
  const nextSubtitle = nextAppt
    ? (() => {
        const [h, m] = nextAppt.time!.split(":").map(Number)
        const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes())
        return diff > 0 ? `trong ${diff} phút` : ""
      })()
    : ""

  return (
    <div className="grid grid-cols-4 gap-3.5">
      {kpiConfig.map((kpi) => {
        const isNext = kpi.key === "next_appointment"
        const value = isNext
          ? nextTime
          : counts[kpi.key as keyof typeof counts]
        const subtitle =
          isNext ? nextSubtitle : kpi.key === "hoan_thanh" ? "hôm nay" : ""

        return (
          <div
            key={kpi.key}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </span>
              <HugeiconsIcon
                icon={kpi.icon}
                className="size-[18px] text-muted-foreground/60"
                strokeWidth={1.5}
              />
            </div>
            <div className={`mt-1.5 text-3xl font-bold ${kpi.colorClass}`}>
              {value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {subtitle || "\u00A0"}
            </div>
          </div>
        )
      })}
    </div>
  )
}
