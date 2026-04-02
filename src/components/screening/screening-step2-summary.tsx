import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ClipboardIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningStep2SummaryProps {
  form: ScreeningFormData
}

const SYMPTOM_LABELS: Record<string, string> = {
  dryEyes: "Khô mắt",
  gritty: "Cộm/rát mắt",
  blurry: "Nhìn mờ",
  tearing: "Chảy nước mắt",
  itchy: "Ngứa mắt",
  headache: "Nhức đầu",
}

const SEVERITY_LABELS: Record<string, string> = {
  mild: "Nhẹ",
  moderate: "Trung bình",
  severe: "Nặng",
}

const BLINK_LABELS: Record<string, string> = {
  yes: "Có",
  no: "Không",
  unclear: "Không rõ",
}

const DURATION_UNIT_LABELS: Record<string, string> = {
  ngày: "ngày",
  tuần: "tuần",
  tháng: "tháng",
  năm: "năm",
}

export function ScreeningStep2Summary({ form }: ScreeningStep2SummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasRedFlags =
    form.redFlags.eyePain ||
    form.redFlags.suddenVisionLoss ||
    form.redFlags.asymmetry

  const checkedSymptoms = Object.entries(form.symptoms)
    .filter(([, v]) => v)
    .map(([k]) => SYMPTOM_LABELS[k])

  return (
    <section className="rounded-lg border border-border bg-background">
      {/* Header — always visible, toggles expand */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ClipboardIcon}
            className="size-4"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold">
            Tóm tắt sàng lọc (Bước 1)
          </span>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* Collapsed summary — always visible */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Lý do:</span>{" "}
          {form.chiefComplaint || "—"}
        </span>
        <span>
          <span className="font-medium text-foreground">UCVA:</span>{" "}
          <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
            OD
          </span>{" "}
          {form.ucvaOd || "—"}{" "}
          <span className="rounded bg-sky-500 px-1.5 py-0.5 text-xs font-bold text-white">
            OS
          </span>{" "}
          {form.ucvaOs || "—"}
        </span>
        {hasRedFlags ? (
          <span className="font-medium text-amber-600">⚠ Red Flag</span>
        ) : (
          <span className="text-emerald-600">✓ Không có Red Flag</span>
        )}
      </div>

      {/* Symptom tags — always visible */}
      {(checkedSymptoms.length > 0 || form.discomfortLevel) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {checkedSymptoms.map((s) => (
            <span
              key={s}
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
          {form.discomfortLevel && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Mức độ: {SEVERITY_LABELS[form.discomfortLevel]}
            </span>
          )}
        </div>
      )}

      {/* Expanded details */}
      {isOpen && (
        <div className="space-y-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {/* Red flags detail */}
          {hasRedFlags && (
            <div className="text-amber-600">
              <span className="font-medium">Red Flags:</span>{" "}
              {form.redFlags.eyePain && "Đau mắt nhiều"}
              {form.redFlags.suddenVisionLoss && ", Giảm thị lực đột ngột"}
              {form.redFlags.asymmetry && ", Triệu chứng lệch 1 bên"}
            </div>
          )}

          {/* Current Rx */}
          {(form.currentRxOd || form.currentRxOs) && (
            <div>
              <span className="font-medium text-foreground">
                Kính hiện tại:
              </span>{" "}
              OD {form.currentRxOd || "—"} · OS {form.currentRxOs || "—"}
            </div>
          )}

          {/* Screening questions */}
          {form.blinkImprovement && (
            <div>
              <span className="font-medium text-foreground">
                Chớp mắt cải thiện:
              </span>{" "}
              {BLINK_LABELS[form.blinkImprovement]}
            </div>
          )}
          {form.symptomDuration > 0 && (
            <div>
              <span className="font-medium text-foreground">
                Thời gian triệu chứng:
              </span>{" "}
              {form.symptomDuration}{" "}
              {DURATION_UNIT_LABELS[form.symptomDurationUnit]}
            </div>
          )}
          {form.screenTime && (
            <div>
              <span className="font-medium text-foreground">Màn hình:</span>{" "}
              {form.screenTime} giờ/ngày
            </div>
          )}
          {form.contactLens && (
            <div>
              <span className="font-medium text-foreground">
                Kính áp tròng:
              </span>{" "}
              {form.contactLens === "yes" ? "Có" : "Không"}
            </div>
          )}
          {form.notes && (
            <div>
              <span className="font-medium text-foreground">Ghi chú:</span>{" "}
              {form.notes}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
