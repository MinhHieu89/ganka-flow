import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { HelpCircleIcon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormQuestionsProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

const SYMPTOM_OPTIONS = [
  { key: "dryEyes" as const, label: "Khô mắt" },
  { key: "gritty" as const, label: "Cộm / rát mắt" },
  { key: "blurry" as const, label: "Nhìn mờ" },
  { key: "tearing" as const, label: "Chảy nước mắt" },
  { key: "itchy" as const, label: "Ngứa mắt" },
  { key: "headache" as const, label: "Nhức đầu" },
]

const BLINK_OPTIONS = [
  { value: "yes" as const, label: "Có" },
  { value: "no" as const, label: "Không" },
  { value: "unclear" as const, label: "Không rõ" },
]

const CONTACT_LENS_OPTIONS = [
  { value: "yes" as const, label: "Có" },
  { value: "no" as const, label: "Không" },
]

const SEVERITY_OPTIONS = [
  { value: "mild" as const, label: "Nhẹ" },
  { value: "moderate" as const, label: "Trung bình" },
  { value: "severe" as const, label: "Nặng" },
]

export function ScreeningFormQuestions({
  form,
  onUpdate,
}: ScreeningFormQuestionsProps) {
  function toggleSymptom(key: keyof ScreeningFormData["symptoms"]) {
    onUpdate("symptoms", {
      ...form.symptoms,
      [key]: !form.symptoms[key],
    })
  }

  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <HugeiconsIcon
          icon={HelpCircleIcon}
          className="size-5"
          strokeWidth={1.5}
        />
        <h2 className="text-lg font-bold">Câu hỏi định hướng</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <div className="space-y-5">
        {/* Symptoms */}
        <div>
          <Label>Triệu chứng</Label>
          <div
            className="mt-1.5 grid grid-cols-3 gap-2"
            role="group"
            aria-label="Triệu chứng"
          >
            {SYMPTOM_OPTIONS.map((opt) => (
              <label
                key={opt.key}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                  form.symptoms[opt.key]
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <input
                  type="checkbox"
                  checked={form.symptoms[opt.key]}
                  onChange={() => toggleSymptom(opt.key)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Blink Improvement */}
        <div>
          <Label>Nhìn mờ có cải thiện sau khi chớp mắt không?</Label>
          <div
            className="mt-1.5 flex gap-2"
            role="radiogroup"
            aria-label="Cải thiện sau khi chớp mắt"
          >
            {BLINK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  form.blinkImprovement === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border"
                )}
              >
                <input
                  type="radio"
                  name="blinkImprovement"
                  value={opt.value}
                  checked={form.blinkImprovement === opt.value}
                  onChange={() => onUpdate("blinkImprovement", opt.value)}
                  className="size-3.5 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Duration + Screen Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Thời gian triệu chứng</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                type="number"
                min={0}
                value={form.symptomDuration || ""}
                onChange={(e) =>
                  onUpdate("symptomDuration", parseInt(e.target.value) || 0)
                }
                className="w-20 text-center"
              />
              <Select
                value={form.symptomDurationUnit}
                onValueChange={(v) =>
                  onUpdate(
                    "symptomDurationUnit",
                    v as ScreeningFormData["symptomDurationUnit"]
                  )
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngày">ngày</SelectItem>
                  <SelectItem value="tuần">tuần</SelectItem>
                  <SelectItem value="tháng">tháng</SelectItem>
                  <SelectItem value="năm">năm</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Thời gian dùng màn hình (giờ/ngày)</Label>
            <Input
              className="mt-1.5"
              type="number"
              min={0}
              max={24}
              value={form.screenTime}
              onChange={(e) => onUpdate("screenTime", e.target.value)}
              placeholder="VD: 8"
            />
          </div>
        </div>

        {/* Contact Lens */}
        <div>
          <Label>Đeo kính áp tròng?</Label>
          <div
            className="mt-1.5 flex gap-2"
            role="radiogroup"
            aria-label="Kính áp tròng"
          >
            {CONTACT_LENS_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors",
                  form.contactLens === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border"
                )}
              >
                <input
                  type="radio"
                  name="contactLens"
                  value={opt.value}
                  checked={form.contactLens === opt.value}
                  onChange={() => onUpdate("contactLens", opt.value)}
                  className="size-3.5 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        {/* Discomfort Severity */}
        <div>
          <Label>Mức độ khó chịu</Label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {SEVERITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate("discomfortLevel", opt.value)}
                className={cn(
                  "rounded-lg border py-2.5 text-sm transition-colors",
                  form.discomfortLevel === opt.value
                    ? "border-2 border-primary bg-primary/5 font-semibold text-primary"
                    : "border-border bg-background text-foreground hover:bg-muted/50"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
