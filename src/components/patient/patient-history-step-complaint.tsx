import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { SymptomDetail } from "@/data/mock-patients"

export interface ComplaintData {
  visitReasons: string[]
  visitReasonOther: string
  symptomDetail: SymptomDetail
  symptoms: Record<string, boolean>
}

interface Props {
  data: ComplaintData
  onChange: (data: ComplaintData) => void
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
] as const

const FREQUENCY_OPTIONS = [
  { value: "thinh_thoang", label: "Thỉnh thoảng" },
  { value: "thuong_xuyen", label: "Thường xuyên" },
  { value: "lien_tuc", label: "Liên tục" },
] as const

const IMPACT_OPTIONS = [
  { value: "khong", label: "Không" },
  { value: "mot_phan", label: "Một phần" },
  { value: "nghiem_trong", label: "Nghiêm trọng" },
] as const

export function PatientHistoryStepComplaint({ data, onChange }: Props) {
  const hasAnySymptom = Object.values(data.symptoms).some(Boolean)

  function toggleVisitReason(key: string) {
    const next = data.visitReasons.includes(key)
      ? data.visitReasons.filter((r) => r !== key)
      : [...data.visitReasons, key]
    onChange({ ...data, visitReasons: next })
  }

  function toggleSymptom(key: string) {
    onChange({
      ...data,
      symptoms: { ...data.symptoms, [key]: !data.symptoms[key] },
    })
  }

  function updateSymptomDetail(field: keyof SymptomDetail, value: string) {
    onChange({
      ...data,
      symptomDetail: { ...data.symptomDetail, [field]: value },
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Lý do khám và triệu chứng</h2>

      {/* Visit Reasons */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Lý do đến khám hôm nay
        </legend>
        <div className="space-y-1">
          {VISIT_REASON_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 py-2.5 text-base"
            >
              <input
                type="checkbox"
                checked={data.visitReasons.includes(option.key)}
                onChange={() => toggleVisitReason(option.key)}
                className="size-5 rounded border-gray-300"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {data.visitReasons.includes("khac") && (
          <div className="space-y-1.5 pl-8">
            <Label htmlFor="visit-reason-other" className="text-base">
              Vui lòng ghi rõ
            </Label>
            <Input
              id="visit-reason-other"
              value={data.visitReasonOther}
              onChange={(e) =>
                onChange({ ...data, visitReasonOther: e.target.value })
              }
              placeholder="Nhập lý do khác..."
              className="text-base"
            />
          </div>
        )}
      </fieldset>

      {/* Symptoms */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Triệu chứng hiện tại (chọn tất cả triệu chứng đang có)
        </legend>
        <div className="space-y-1">
          {SYMPTOM_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 py-2.5 text-base"
            >
              <input
                type="checkbox"
                checked={!!data.symptoms[option.key]}
                onChange={() => toggleSymptom(option.key)}
                className="size-5 rounded border-gray-300"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Symptom Details — shown when at least one symptom is selected */}
      {hasAnySymptom && (
        <fieldset className="space-y-6">
          <legend className="text-base font-medium">
            Chi tiết triệu chứng
          </legend>

          {/* Onset */}
          <div className="space-y-1.5">
            <Label htmlFor="symptom-onset" className="text-base">
              Triệu chứng bắt đầu từ khi nào?
            </Label>
            <Input
              id="symptom-onset"
              value={data.symptomDetail.onset ?? ""}
              onChange={(e) => updateSymptomDetail("onset", e.target.value)}
              placeholder="Ví dụ: 2 tuần trước, 3 tháng..."
              className="text-base"
            />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="text-base">Mức độ nghiêm trọng</Label>
            <div className="space-y-1">
              {SEVERITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 py-2.5 text-base"
                >
                  <input
                    type="radio"
                    name="severity"
                    value={option.value}
                    checked={data.symptomDetail.severity === option.value}
                    onChange={() =>
                      updateSymptomDetail("severity", option.value)
                    }
                    className="size-5 border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label className="text-base">Tần suất xuất hiện</Label>
            <div className="space-y-1">
              {FREQUENCY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 py-2.5 text-base"
                >
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={data.symptomDetail.frequency === option.value}
                    onChange={() =>
                      updateSymptomDetail("frequency", option.value)
                    }
                    className="size-5 border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Daily Impact */}
          <div className="space-y-2">
            <Label className="text-base">
              Ảnh hưởng đến sinh hoạt hàng ngày
            </Label>
            <div className="space-y-1">
              {IMPACT_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 py-2.5 text-base"
                >
                  <input
                    type="radio"
                    name="dailyImpact"
                    value={option.value}
                    checked={data.symptomDetail.dailyImpact === option.value}
                    onChange={() =>
                      updateSymptomDetail("dailyImpact", option.value)
                    }
                    className="size-5 border-gray-300"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Aggravating/Relieving Factors */}
          <div className="space-y-1.5">
            <Label htmlFor="symptom-factors" className="text-base">
              Yếu tố làm tăng/giảm triệu chứng
            </Label>
            <Input
              id="symptom-factors"
              value={data.symptomDetail.factors ?? ""}
              onChange={(e) => updateSymptomDetail("factors", e.target.value)}
              placeholder="Ví dụ: đọc sách lâu, ra nắng..."
              className="text-base"
            />
          </div>
        </fieldset>
      )}
    </div>
  )
}
