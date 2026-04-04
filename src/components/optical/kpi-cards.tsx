import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { cn } from "@/lib/utils"

interface KpiCardConfig {
  key: string
  label: string
  icon: IconSvgElement
  colorClass: string
  subtitle?: string
  highlightWhen?: (value: number) => boolean
}

interface OpticalKpiCardsProps {
  config: KpiCardConfig[]
  values: Record<string, number>
  columns?: 3 | 4
}

export function OpticalKpiCards({
  config,
  values,
  columns = 4,
}: OpticalKpiCardsProps) {
  return (
    <div
      className={cn(
        "grid gap-3.5",
        columns === 3 ? "grid-cols-3" : "grid-cols-4"
      )}
    >
      {config.map((kpi) => {
        const value = values[kpi.key] ?? 0
        const highlight = kpi.highlightWhen?.(value) ?? false

        return (
          <div
            key={kpi.key}
            className={cn(
              "rounded-lg border border-border bg-background p-4",
              highlight &&
                "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
            )}
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
            <div className={cn("mt-1.5 text-3xl font-bold", kpi.colorClass)}>
              {value}
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {kpi.subtitle || "\u00A0"}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export type { KpiCardConfig }
