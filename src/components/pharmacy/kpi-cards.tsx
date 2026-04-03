import { HugeiconsIcon } from "@hugeicons/react"
import {
  Clock01Icon,
  CheckmarkCircle02Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons"
import type { PharmacyMetrics } from "@/data/mock-pharmacy"

const kpiConfig = [
  {
    key: "pendingCount" as const,
    label: "Chờ phát thuốc",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
  },
  {
    key: "dispensedToday" as const,
    label: "Đã phát hôm nay",
    icon: CheckmarkCircle02Icon,
    colorClass: "",
  },
  {
    key: "lowStockAlerts" as const,
    label: "Cảnh báo tồn kho",
    icon: Alert01Icon,
    colorClass: "text-red-600",
    clickable: true,
  },
]

interface PharmacyKpiCardsProps {
  metrics: PharmacyMetrics
  onStockAlertClick: () => void
}

export function PharmacyKpiCards({
  metrics,
  onStockAlertClick,
}: PharmacyKpiCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {kpiConfig.map((kpi) => (
        <div
          key={kpi.key}
          className={`rounded-lg border border-border bg-background p-4 ${kpi.clickable ? "cursor-pointer transition-colors hover:bg-muted" : ""}`}
          onClick={kpi.clickable ? onStockAlertClick : undefined}
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
          <div className={`mt-1.5 text-2xl font-medium ${kpi.colorClass}`}>
            {metrics[kpi.key]}
          </div>
        </div>
      ))}
    </div>
  )
}
