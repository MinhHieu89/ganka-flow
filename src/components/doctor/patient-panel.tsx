import type { Patient, Visit } from "@/data/mock-patients"

interface PatientPanelProps {
  patient: Patient
  visit: Visit
}

export function PatientPanel({ patient, visit }: PatientPanelProps) {
  const screening = visit.screeningData
  const redFlags = screening?.redFlags
  const hasFlags =
    redFlags?.eyePain || redFlags?.suddenVisionLoss || redFlags?.asymmetry
  const age = new Date().getFullYear() - patient.birthYear

  return (
    <div className="h-full overflow-y-auto bg-muted/30">
      {/* Patient Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[15px] font-bold">{patient.name}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {patient.id} · {patient.gender} · {patient.birthYear} ({age}t)
            </div>
          </div>
          {hasFlags && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
              Cờ đỏ
            </span>
          )}
        </div>
      </div>

      {/* Chief Complaint */}
      {screening?.chiefComplaint && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Lý do khám
          </div>
          <div className="mt-1 text-sm">{screening.chiefComplaint}</div>
        </div>
      )}

      {/* Red Flags */}
      {hasFlags && (
        <div className="border-b border-border/50 bg-red-50 px-4 py-3 dark:bg-red-950/20">
          <div className="text-xs font-medium uppercase tracking-wide text-red-600">
            Cờ đỏ
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            {redFlags?.eyePain && (
              <div className="text-xs text-red-600">• Đau mắt</div>
            )}
            {redFlags?.suddenVisionLoss && (
              <div className="text-xs text-red-600">
                • Giảm thị lực đột ngột
              </div>
            )}
            {redFlags?.asymmetry && (
              <div className="text-xs text-red-600">
                • Bất đối xứng hai mắt
              </div>
            )}
          </div>
        </div>
      )}

      {/* UCVA */}
      {(screening?.ucvaOd || screening?.ucvaOs) && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            UCVA
          </div>
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">OD (Phải)</div>
              <div className="text-sm font-semibold">
                {screening?.ucvaOd || "—"}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">OS (Trái)</div>
              <div className="text-sm font-semibold">
                {screening?.ucvaOs || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screening Symptoms */}
      {screening && (
        <div className="border-b border-border/50 px-4 py-3">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Triệu chứng sàng lọc
          </div>
          <div className="mt-1.5 flex flex-col gap-1">
            <div className="text-xs">
              • Khô/cộm/kích ứng:{" "}
              <strong>
                {screening.symptoms.dryEyes || screening.symptoms.gritty
                  ? "Có"
                  : "Không"}
              </strong>
            </div>
            <div className="text-xs">
              • Mờ sau chớp mắt:{" "}
              <strong>
                {screening.blinkImprovement === "yes" ? "Có" : "Không"}
              </strong>
            </div>
            <div className="text-xs">
              • Thời gian màn hình:{" "}
              <strong>{screening.screenTime}h/ngày</strong>
            </div>
          </div>
        </div>
      )}

      {/* Current Glasses Rx */}
      <div className="px-4 py-3">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Kính đang đeo
        </div>
        {screening?.currentRxOd || screening?.currentRxOs ? (
          <div className="mt-1.5 grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-muted-foreground">OD</div>
              <div className="text-sm font-semibold">
                {screening?.currentRxOd}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">OS</div>
              <div className="text-sm font-semibold">
                {screening?.currentRxOs}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-1 text-xs italic text-muted-foreground">
            Không đeo kính
          </div>
        )}
      </div>
    </div>
  )
}
