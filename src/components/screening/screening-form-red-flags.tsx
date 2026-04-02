import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormRedFlagsProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
  onFastTrack: () => void
}

const RED_FLAG_OPTIONS = [
  { key: "eyePain" as const, label: "Đau mắt nhiều" },
  { key: "suddenVisionLoss" as const, label: "Giảm thị lực đột ngột" },
  { key: "asymmetry" as const, label: "Triệu chứng lệch 1 bên rõ" },
]

export function ScreeningFormRedFlags({
  form,
  onUpdate,
  onFastTrack,
}: ScreeningFormRedFlagsProps) {
  const hasAnyFlag = Object.values(form.redFlags).some(Boolean)
  const activeFlags = RED_FLAG_OPTIONS.filter((opt) => form.redFlags[opt.key])

  function toggleFlag(key: keyof ScreeningFormData["redFlags"]) {
    onUpdate("redFlags", {
      ...form.redFlags,
      [key]: !form.redFlags[key],
    })
  }

  return (
    <section className="rounded-lg border-2 border-red-300 bg-background p-5 dark:border-red-800">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={Alert01Icon}
          className="size-5 text-destructive"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold text-destructive">Red Flag</h2>
      </div>
      <div className="mb-5 border-t border-red-200 dark:border-red-900" />

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Kiểm tra cờ đỏ"
      >
        {RED_FLAG_OPTIONS.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
              form.redFlags[opt.key]
                ? "border-destructive bg-destructive/5"
                : "border-border"
            )}
          >
            <input
              type="checkbox"
              checked={form.redFlags[opt.key]}
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
                Phát hiện Red Flag!
              </p>
              <p className="text-xs text-destructive">
                {activeFlags.map((f) => f.label).join(", ")}
              </p>
            </div>
          </div>
          <Button variant="destructive" onClick={onFastTrack}>
            → Chuyển bác sĩ ngay
          </Button>
        </div>
      )}
    </section>
  )
}
