import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
  renderFieldError: (field: string) => React.ReactNode
}

const VISIT_REASON_OPTIONS = [
  { key: "kham_dinh_ky", label: "Khám định kỳ/Kiểm tra tổng quát" },
  { key: "giam_thi_luc", label: "Giảm thị lực" },
  { key: "mo_mat", label: "Mờ mắt" },
  { key: "nhuc_dau_dau_mat", label: "Nhức đầu/Đau mắt" },
  { key: "dau_mat_kho_chiu", label: "Đau mắt hoặc khó chịu" },
  { key: "kho_nhin_gan", label: "Khó nhìn gần (đọc sách, xem điện thoại)" },
  { key: "kho_nhin_xa", label: "Khó nhìn xa (xem bảng, lái xe)" },
  { key: "kinh_ap_trong", label: "Muốn đeo kính áp tròng" },
  {
    key: "tu_van_phau_thuat",
    label: "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)",
  },
  { key: "khac", label: "Khác" },
]

const SYMPTOM_OPTIONS = [
  { key: "mo_mat", label: "Nhìn mờ/Giảm thị lực" },
  { key: "nhin_doi", label: "Nhìn đôi (song thị)" },
  { key: "nhin_bien_dang", label: "Nhìn biến dạng" },
  { key: "dom_bay", label: "Xuất hiện điểm đen/đốm bay" },
  { key: "vong_sang", label: "Thấy vòng sáng quanh đèn" },
  { key: "chop_sang", label: "Nhìn chớp sáng (flash)" },
  { key: "mat_thi_truong", label: "Mất thị trường (góc nhìn)" },
  { key: "mo_thay_doi_theo_gio", label: "Nhìn mờ thay đổi theo giờ" },
  { key: "nhuc_dau", label: "Nhức đầu thường xuyên" },
  { key: "choi_sang", label: "Chói sáng/Sợ ánh sáng" },
  { key: "kho_mat", label: "Khô mắt" },
  { key: "chay_nuoc_mat", label: "Chảy nước mắt nhiều" },
  { key: "tiet_dich", label: "Tiết dịch/Ghèn mắt" },
  { key: "ngua_mat", label: "Ngứa mắt" },
  { key: "do_mat", label: "Đỏ mắt" },
  { key: "sung_mi", label: "Sưng mi mắt" },
  { key: "moi_mat_doc", label: "Mỏi mắt khi đọc/máy tính" },
  { key: "kho_tap_trung_doc", label: "Khó tập trung khi đọc" },
]

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
        <div className="mt-2 grid grid-cols-2 gap-2" role="group">
          {VISIT_REASON_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                visitReasonsMap[opt.key]
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
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
        <Label className="mb-2 block">
          Mô tả chi tiết triệu chứng (nếu có)
        </Label>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">
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
              <Label className="text-sm text-muted-foreground">Mức độ</Label>
              <div className="mt-1 flex gap-3">
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
              <Label className="text-sm text-muted-foreground">Tần suất</Label>
              <div className="mt-1 flex gap-3">
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
              <Label className="text-sm text-muted-foreground">
                Ảnh hưởng đến sinh hoạt
              </Label>
              <div className="mt-1 flex gap-3">
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
            <Label className="text-sm text-muted-foreground">
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
        <Label className="mb-2 block">
          Bạn có gặp các triệu chứng sau không?
        </Label>
        <CheckboxGrid
          items={SYMPTOM_OPTIONS}
          values={data.symptoms ?? {}}
          onChange={updateSymptom}
        />
      </div>
    </div>
  )
}
