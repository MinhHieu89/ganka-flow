import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Patient, Visit } from "@/data/mock-patients"

interface Props {
  patient: Patient
  visit: Visit
  onShowQr: () => void
}

export function ScreeningHistoryPanel({ patient, visit, onShowQr }: Props) {
  const [expanded, setExpanded] = useState(false)
  const historyStatus = visit.historyStatus ?? "pending"

  return (
    <div className="rounded-lg border border-border">
      {/* Header — always visible, clickable to expand */}
      <button
        className="flex w-full items-center justify-between px-4 py-3 text-sm hover:bg-muted/50"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Bệnh sử bệnh nhân</span>
          {historyStatus === "completed" ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Đã khai
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
              Chưa khai
            </span>
          )}
        </div>
        <span className="text-muted-foreground">{expanded ? "▲" : "▼"}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 py-3">
          {historyStatus === "completed" ? (
            <div className="space-y-2 text-sm">
              {/* Visit reasons */}
              {patient.visitReasons && patient.visitReasons.length > 0 && (
                <div>
                  <span className="font-medium">Lý do khám: </span>
                  <span className="text-muted-foreground">
                    {patient.visitReasons.join(", ")}
                  </span>
                </div>
              )}
              {/* Diagnosed conditions */}
              {patient.diagnosedEyeConditions && (
                <div>
                  <span className="font-medium">Bệnh mắt: </span>
                  <span className="text-muted-foreground">
                    {Object.entries(patient.diagnosedEyeConditions)
                      .filter(([, v]) => v)
                      .map(([k]) => k.replace(/_/g, " "))
                      .join(", ") || "Không có"}
                  </span>
                </div>
              )}
              {/* Systemic conditions */}
              {patient.systemicConditions && (
                <div>
                  <span className="font-medium">Bệnh nền: </span>
                  <span className="text-muted-foreground">
                    {Object.entries(patient.systemicConditions)
                      .filter(([, v]) => v)
                      .map(([k]) => k.replace(/_/g, " "))
                      .join(", ") || "Không có"}
                  </span>
                </div>
              )}
              {/* Allergies */}
              {patient.allergiesInfo && (
                <div>
                  <span className="font-medium">Dị ứng: </span>
                  <span className="text-muted-foreground">
                    {patient.allergiesInfo.none
                      ? "Không có"
                      : patient.allergiesInfo.items?.length
                        ? patient.allergiesInfo.items
                            .map((a) => a.name)
                            .join(", ")
                        : "Chưa khai"}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-sm text-muted-foreground">
                Bệnh nhân chưa khai báo bệnh sử
              </p>
              <Button variant="outline" size="sm" onClick={onShowQr}>
                Hiện QR code
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
