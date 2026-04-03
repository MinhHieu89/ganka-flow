// src/components/patients/detail/tab-visits.tsx
import { useState } from "react"
import { cn } from "@/lib/utils"
import { VisitDetailPanel } from "./visit-detail-panel"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface TabVisitsProps {
  visits: VisitRecord[]
}

export function TabVisits({ visits }: TabVisitsProps) {
  const [selectedId, setSelectedId] = useState<string>(visits[0]?.id ?? "")
  const selectedVisit = visits.find((v) => v.id === selectedId)

  if (visits.length === 0) {
    return (
      <div className="py-12 text-center text-[13px] text-muted-foreground">
        Bệnh nhân chưa có lần khám nào
      </div>
    )
  }

  return (
    <div className="flex min-h-[400px]">
      {/* Left: Timeline list */}
      <div className="w-[240px] shrink-0 border-r border-border pl-3">
        <div className="relative pl-5">
          {/* Timeline line */}
          <div className="absolute top-0 bottom-0 left-[6px] w-px bg-border" />

          {visits.map((visit) => {
            const isSelected = visit.id === selectedId
            const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]

            return (
              <div
                key={visit.id}
                className="relative cursor-pointer"
                onClick={() => setSelectedId(visit.id)}
              >
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute top-3.5 -left-5 size-[11px] rounded-full border-2",
                    isSelected
                      ? "border-[#378ADD] bg-[#E6F1FB]"
                      : "border-border bg-background"
                  )}
                />

                <div
                  className={cn(
                    "mr-2 rounded-r-md py-2.5 pr-3",
                    isSelected && "bg-[#F0F7FF]"
                  )}
                >
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="text-[13px] font-medium">
                      {visit.date}
                    </span>
                    <span
                      className={cn(
                        "rounded px-1.5 py-px text-[9px] font-medium",
                        groupConfig.colorClass
                      )}
                    >
                      {groupConfig.label}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {visit.doctorName}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Detail panel */}
      {selectedVisit && <VisitDetailPanel visit={selectedVisit} />}
    </div>
  )
}
