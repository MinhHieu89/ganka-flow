// src/components/patients/detail/stat-cards.tsx
import { cn } from "@/lib/utils"
import type { PatientDetailStat } from "@/data/mock-patient-detail"

interface StatCardsProps {
  stats: PatientDetailStat
}

export function StatCards({ stats }: StatCardsProps) {
  const isOverdue =
    stats.followUpDaysRemaining !== null && stats.followUpDaysRemaining < 0

  const cards = [
    {
      label: "Tổng lần khám",
      value: String(stats.totalVisits),
      subtext: `Lần đầu: ${stats.firstVisitDate}`,
      large: true,
    },
    {
      label: "Lần khám gần nhất",
      value: stats.lastVisitDate,
      subtext: stats.lastVisitDoctor,
      large: true,
    },
    {
      label: "Chẩn đoán hiện tại",
      value: stats.currentDiagnosis,
      subtext: [stats.currentDiagnosisIcd, stats.secondaryDiagnosis]
        .filter(Boolean)
        .join(" · "),
      large: false,
    },
    {
      label: "Tái khám tiếp theo",
      value: stats.nextFollowUp ?? "Không có",
      subtext: stats.followUpDate
        ? `Hẹn ${stats.followUpDate}${stats.followUpDaysRemaining !== null ? ` · ${Math.abs(stats.followUpDaysRemaining)} ngày` : ""}`
        : "",
      large: false,
      isOverdue,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[10px] bg-muted/50 px-4 py-3.5"
        >
          <div className="mb-1 text-[11px] tracking-wide text-muted-foreground">
            {card.label}
          </div>
          <div
            className={cn(
              "leading-tight font-medium",
              card.large ? "text-[22px]" : "text-sm",
              card.isOverdue && "text-[#A32D2D]"
            )}
          >
            {card.value}
          </div>
          {card.subtext && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              {card.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
