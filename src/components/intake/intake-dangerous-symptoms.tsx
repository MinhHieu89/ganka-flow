import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

const DANGEROUS_SYMPTOM_OPTIONS = [
  { key: "eyePain", label: "Đau mắt nhiều" },
  { key: "suddenVisionLoss", label: "Giảm thị lực đột ngột" },
  { key: "asymmetry", label: "Triệu chứng lệch 1 bên rõ" },
]

interface IntakeDangerousSymptomsProps {
  symptoms: Record<string, boolean>
  onUpdate: (symptoms: Record<string, boolean>) => void
}

export function IntakeDangerousSymptoms({
  symptoms,
  onUpdate,
}: IntakeDangerousSymptomsProps) {
  const hasAnyFlag = Object.values(symptoms).some(Boolean)
  const activeFlags = DANGEROUS_SYMPTOM_OPTIONS.filter(
    (opt) => symptoms[opt.key]
  )

  function toggleFlag(key: string) {
    onUpdate({ ...symptoms, [key]: !symptoms[key] })
  }

  function handleFastTrack() {
    toast("Đã ghi nhận — vui lòng liên hệ bác sĩ")
  }

  return (
    <section
      className={cn(
        "p-5",
        hasAnyFlag ? "bg-destructive/[0.03]" : "bg-background"
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <HugeiconsIcon
          icon={Alert01Icon}
          className="size-5 text-destructive"
          strokeWidth={1.5}
        />
        <h2 className="text-[15px] font-bold text-destructive">
          Triệu chứng nguy hiểm
        </h2>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Kiểm tra triệu chứng nguy hiểm"
      >
        {DANGEROUS_SYMPTOM_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
              symptoms[opt.key]
                ? "border-destructive bg-destructive/5"
                : "border-border"
            )}
          >
            <input
              type="checkbox"
              checked={symptoms[opt.key] ?? false}
              onChange={() => toggleFlag(opt.key)}
              className="size-4 accent-[var(--color-destructive)]"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {hasAnyFlag && (
        <div
          role="alert"
          className="mt-4 flex items-center justify-between rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-800 dark:bg-red-950/30"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-destructive text-white">
              <HugeiconsIcon icon={Alert01Icon} className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-destructive">
                Phát hiện triệu chứng nguy hiểm!
              </p>
              <p className="text-xs text-destructive/80">
                {activeFlags.map((f) => f.label).join(", ")}
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={handleFastTrack}>
            → Chuyển bác sĩ ngay
          </Button>
        </div>
      )}
    </section>
  )
}
