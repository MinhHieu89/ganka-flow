import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { ClipboardIcon } from "@hugeicons/core-free-icons"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormInitialProps {
  form: ScreeningFormData
  errors: Record<string, string>
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

export function ScreeningFormInitial({
  form,
  errors,
  onUpdate,
}: ScreeningFormInitialProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={ClipboardIcon}
          className="size-5"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold">Thông tin khám ban đầu</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <div className="space-y-4">
        {/* Chief Complaint */}
        <div>
          <Label>
            Lý do đến khám <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={form.chiefComplaint}
            onChange={(e) =>
              onUpdate("chiefComplaint", e.target.value.slice(0, 500))
            }
            placeholder="Mô tả lý do khám chính của bệnh nhân..."
            rows={3}
            aria-required
            aria-invalid={!!errors.chiefComplaint}
          />
          <div className="mt-1 flex justify-between">
            {errors.chiefComplaint ? (
              <p className="text-xs text-destructive">
                {errors.chiefComplaint}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground">
              {form.chiefComplaint.length}/500
            </span>
          </div>
        </div>

        {/* UCVA */}
        <div>
          <Label>
            Thị lực cơ bản (UCVA) <span className="text-destructive">*</span>
          </Label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={form.ucvaOd}
                onChange={(e) => onUpdate("ucvaOd", e.target.value)}
                placeholder="VD: 20/40"
                aria-label="UCVA mắt phải (OD)"
                aria-required
                aria-invalid={!!errors.ucvaOd}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
                OS
              </span>
              <Input
                value={form.ucvaOs}
                onChange={(e) => onUpdate("ucvaOs", e.target.value)}
                placeholder="VD: 20/40"
                aria-label="UCVA mắt trái (OS)"
                aria-required
                aria-invalid={!!errors.ucvaOs}
              />
            </div>
          </div>
          {(errors.ucvaOd || errors.ucvaOs) && (
            <div className="mt-1 grid grid-cols-2 gap-3">
              <p className="text-xs text-destructive">{errors.ucvaOd ?? ""}</p>
              <p className="text-xs text-destructive">{errors.ucvaOs ?? ""}</p>
            </div>
          )}
        </div>

        {/* Current Rx */}
        <div>
          <Label>Khúc xạ nhanh / Kính hiện tại</Label>
          <div className="mt-1.5 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={form.currentRxOd}
                onChange={(e) => onUpdate("currentRxOd", e.target.value)}
                placeholder="VD: -2.50 / -0.75 x 180"
                aria-label="Khúc xạ mắt phải (OD)"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
                OS
              </span>
              <Input
                value={form.currentRxOs}
                onChange={(e) => onUpdate("currentRxOs", e.target.value)}
                placeholder="VD: -2.50 / -0.75 x 180"
                aria-label="Khúc xạ mắt trái (OS)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
