import { useReceptionist } from "@/contexts/receptionist-context"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Calendar01Icon,
  Clock01Icon,
  Search01Icon,
  Stethoscope02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const kpiConfig = [
  {
    key: "appointments",
    label: "Lịch hẹn hôm nay",
    icon: Calendar01Icon,
    colorClass: "text-foreground",
  },
  {
    key: "cho_kham",
    label: "Chờ khám",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "dang_sang_loc",
    label: "Đang sàng lọc",
    icon: Search01Icon,
    colorClass: "text-sky-500",
  },
  {
    key: "dang_kham",
    label: "Đang khám",
    icon: Stethoscope02Icon,
    colorClass: "text-blue-600",
  },
  {
    key: "hoan_thanh",
    label: "Hoàn thành",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-emerald-600",
  },
] as const

export function KpiCards() {
  const { todayVisits } = useReceptionist()

  const counts = {
    appointments: todayVisits.filter((v) => v.source === "hen").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    dang_sang_loc: todayVisits.filter((v) => v.status === "dang_sang_loc")
      .length,
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
  }

  const chuaDen = todayVisits.filter((v) => v.status === "chua_den").length

  return (
    <div className="grid grid-cols-5 gap-3.5">
      {kpiConfig.map((kpi) => (
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
            {counts[kpi.key]}
          </div>
          {kpi.key === "appointments" && chuaDen > 0 && (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {chuaDen} chưa đến
            </div>
          )}
          {kpi.key !== "appointments" && (
            <div className="mt-0.5 text-xs text-muted-foreground">&nbsp;</div>
          )}
        </div>
      ))}
    </div>
  )
}
