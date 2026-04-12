import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
import type { IntakeFormData } from "@/components/screening/screening-intake-form-editable"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
  renderFieldError: (field: string) => React.ReactNode
}

const SEVERITY_OPTIONS = [
  { value: "nhe", label: "Nhẹ" },
  { value: "trung_binh", label: "Trung bình" },
  { value: "nang", label: "Nặng" },
]

const FREQUENCY_OPTIONS = [
  { value: "thinh_thoang", label: "Thỉnh thoảng" },
  { value: "thuong_xuyen", label: "Thường xuyên" },
  { value: "lien_tuc", label: "Liên tục" },
]

const IMPACT_OPTIONS = [
  { value: "khong", label: "Không" },
  { value: "mot_phan", label: "Một phần" },
  { value: "nghiem_trong", label: "Nghiêm trọng" },
]

export function IntakeSectionComplaint({
  data,
  onChange,
  renderFieldError,
}: Props) {
  const visitReasonOptions = useMasterDataOptions("visit_reasons")
  const symptomOptions = useMasterDataOptions("symptoms")

  const visitReasonsMap = Object.fromEntries(
    (data.visitReasons ?? []).map((r) => [r, true])
  )

  function toggleVisitReason(key: string, checked: boolean) {
    const current = data.visitReasons ?? []
    const next = checked ? [...current, key] : current.filter((r) => r !== key)
    onChange("visitReasons", next)
  }

  function updateSymptom(key: string, checked: boolean) {
    onChange("symptoms", { ...(data.symptoms ?? {}), [key]: checked })
  }

  function updateSymptomDetail(field: string, value: string) {
    onChange("symptomDetail", { ...(data.symptomDetail ?? {}), [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* Visit Reasons */}
      <div>
        <Label>
          Lý do chính đến khám hôm nay{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-0.5" role="group">
          {visitReasonOptions.map((opt) => (
            <label
              key={opt.key}
              className="flex cursor-pointer items-center gap-2 px-1 py-1 text-sm transition-colors hover:bg-muted/50 rounded"
            >
              <input
                type="checkbox"
                checked={!!visitReasonsMap[opt.key]}
                onChange={(e) => toggleVisitReason(opt.key, e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {renderFieldError("visitReasons")}
        <ConditionalField
          show={visitReasonsMap["khac"] ?? false}
          label="Mô tả lý do khác"
          value={data.visitReasonOther ?? ""}
          onChange={(v) => onChange("visitReasonOther", v)}
          placeholder="Nhập lý do..."
        />
      </div>

      {/* Symptom Detail */}
      <div>
        <Label className="mb-2 block font-medium">
          Mô tả chi tiết triệu chứng (nếu có)
        </Label>
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium">
              Bắt đầu từ khi nào?
            </Label>
            <Input
              value={data.symptomDetail?.onset ?? ""}
              onChange={(e) => updateSymptomDetail("onset", e.target.value)}
              placeholder="VD: 2 tuần trước, từ tháng 1..."
            />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-sm font-medium">Mức độ</Label>
              <div className="mt-1.5 space-y-1.5">
                {SEVERITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="radio"
                      name="severity"
                      checked={data.symptomDetail?.severity === opt.value}
                      onChange={() =>
                        updateSymptomDetail("severity", opt.value)
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Tần suất</Label>
              <div className="mt-1.5 space-y-1.5">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="radio"
                      name="frequency"
                      checked={data.symptomDetail?.frequency === opt.value}
                      onChange={() =>
                        updateSymptomDetail("frequency", opt.value)
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Ảnh hưởng đến sinh hoạt
              </Label>
              <div className="mt-1.5 space-y-1.5">
                {IMPACT_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="radio"
                      name="dailyImpact"
                      checked={data.symptomDetail?.dailyImpact === opt.value}
                      onChange={() =>
                        updateSymptomDetail("dailyImpact", opt.value)
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">
              Các yếu tố làm tình trạng tốt hơn hoặc xấu đi
            </Label>
            <Input
              value={data.symptomDetail?.factors ?? ""}
              onChange={(e) => updateSymptomDetail("factors", e.target.value)}
              placeholder="VD: Tốt hơn khi nghỉ ngơi, xấu đi khi dùng máy tính..."
            />
          </div>
        </div>
      </div>

      {/* Symptom Checklist */}
      <div>
        <Label className="mb-2 block font-medium">
          Bạn có gặp các triệu chứng sau không?
        </Label>
        <CheckboxGrid
          items={symptomOptions}
          values={data.symptoms ?? {}}
          onChange={updateSymptom}
        />
      </div>
    </div>
  )
}
