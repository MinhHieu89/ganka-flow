import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type {
  DiabetesDetail,
  CancerDetail,
  MedicationEntry,
  AllergiesInfo,
  AllergyEntry,
} from "@/data/mock-patients"

export interface MedicalHistoryData {
  primaryDoctor: { name?: string; lastVisit?: string }
  systemicConditions: Record<string, boolean>
  diabetesDetail: DiabetesDetail
  cancerDetail: CancerDetail
  systemicConditionOther: string
  medicationsList: MedicationEntry[]
  allergiesInfo: AllergiesInfo
  pregnancyStatus: string
  pregnancyTrimester: string
}

interface Props {
  data: MedicalHistoryData
  gender: string
  onChange: (data: MedicalHistoryData) => void
}

const CONDITION_GROUPS = [
  {
    label: "Tim mạch",
    items: [
      { key: "tang_huyet_ap", label: "Tăng huyết áp" },
      { key: "dau_that_nguc", label: "Đau thắt ngực" },
      { key: "benh_tim_mach", label: "Bệnh tim mạch" },
      { key: "dot_quy", label: "Đột quỵ" },
    ],
  },
  {
    label: "Nội tiết",
    items: [
      { key: "dtd_type1", label: "ĐTĐ Típ 1" },
      { key: "dtd_type2", label: "ĐTĐ Típ 2" },
      { key: "tuyen_giap", label: "Tuyến giáp" },
      { key: "cholesterol_cao", label: "Cholesterol cao" },
    ],
  },
  {
    label: "Thần kinh",
    items: [
      { key: "da_xo_cung", label: "Đa xơ cứng" },
      { key: "dong_kinh", label: "Động kinh" },
      { key: "parkinson", label: "Parkinson" },
      { key: "migraine", label: "Migraine" },
    ],
  },
  {
    label: "Hô hấp & Miễn dịch",
    items: [
      { key: "hen_suyen", label: "Hen suyễn" },
      { key: "copd", label: "COPD" },
      { key: "hiv", label: "HIV" },
      { key: "viem_gan_bc", label: "Viêm gan B/C" },
      { key: "lupus", label: "Lupus" },
      { key: "viem_khop_dang_thap", label: "Viêm khớp dạng thấp" },
    ],
  },
  {
    label: "Ung thư",
    items: [
      { key: "ung_thu", label: "Ung thư" },
      { key: "dang_hoa_xa_tri", label: "Đang hóa xạ trị" },
    ],
  },
  {
    label: "Khác",
    items: [
      { key: "benh_than", label: "Bệnh thận" },
      { key: "benh_gan", label: "Bệnh gan" },
      { key: "roi_loan_dong_mau", label: "Rối loạn đông máu" },
      { key: "benh_ngoai_da", label: "Bệnh ngoài da" },
      { key: "tram_cam_lo_au", label: "Trầm cảm/Lo âu" },
    ],
  },
]

const ALLERGY_TYPE_OPTIONS: {
  value: AllergyEntry["type"]
  label: string
}[] = [
  { value: "thuoc", label: "Thuốc" },
  { value: "thuc_pham", label: "Thực phẩm" },
  { value: "moi_truong", label: "Môi trường" },
  { value: "khac", label: "Khác" },
]

const PREGNANCY_OPTIONS = [
  { value: "mang_thai", label: "Đang mang thai" },
  { value: "cho_con_bu", label: "Đang cho con bú" },
  { value: "khong", label: "Không" },
] as const

export function PatientHistoryStepMedical({ data, onChange, gender }: Props) {
  const showDiabetesDetail =
    data.systemicConditions["dtd_type1"] ||
    data.systemicConditions["dtd_type2"]
  const showCancerDetail = data.systemicConditions["ung_thu"]

  function toggleCondition(key: string) {
    onChange({
      ...data,
      systemicConditions: {
        ...data.systemicConditions,
        [key]: !data.systemicConditions[key],
      },
    })
  }

  function addMedication() {
    onChange({
      ...data,
      medicationsList: [
        ...data.medicationsList,
        { name: "", dose: "", purpose: "" },
      ],
    })
  }

  function updateMedication(
    index: number,
    updates: Partial<MedicationEntry>
  ) {
    const next = data.medicationsList.map((m, i) =>
      i === index ? { ...m, ...updates } : m
    )
    onChange({ ...data, medicationsList: next })
  }

  function removeMedication(index: number) {
    onChange({
      ...data,
      medicationsList: data.medicationsList.filter((_, i) => i !== index),
    })
  }

  function addAllergy() {
    onChange({
      ...data,
      allergiesInfo: {
        ...data.allergiesInfo,
        items: [
          ...data.allergiesInfo.items,
          { type: "thuoc", name: "", reaction: "" },
        ],
      },
    })
  }

  function updateAllergy(index: number, updates: Partial<AllergyEntry>) {
    const next = data.allergiesInfo.items.map((a, i) =>
      i === index ? { ...a, ...updates } : a
    )
    onChange({
      ...data,
      allergiesInfo: { ...data.allergiesInfo, items: next },
    })
  }

  function removeAllergy(index: number) {
    onChange({
      ...data,
      allergiesInfo: {
        ...data.allergiesInfo,
        items: data.allergiesInfo.items.filter((_, i) => i !== index),
      },
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Tiền sử bệnh lý toàn thân</h2>

      {/* Primary doctor */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">Bác sĩ điều trị</legend>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="doctor-name" className="text-base">
              Tên bác sĩ
            </Label>
            <Input
              id="doctor-name"
              value={data.primaryDoctor.name ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  primaryDoctor: {
                    ...data.primaryDoctor,
                    name: e.target.value,
                  },
                })
              }
              placeholder="Nhập tên bác sĩ..."
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="doctor-last-visit" className="text-base">
              Lần khám gần nhất
            </Label>
            <Input
              id="doctor-last-visit"
              value={data.primaryDoctor.lastVisit ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  primaryDoctor: {
                    ...data.primaryDoctor,
                    lastVisit: e.target.value,
                  },
                })
              }
              placeholder="Ví dụ: 3 tháng trước, 01/2025..."
              className="text-base"
            />
          </div>
        </div>
      </fieldset>

      {/* Systemic conditions */}
      <fieldset className="space-y-5">
        <legend className="text-base font-medium">
          Bệnh lý toàn thân (chọn tất cả bệnh đang có)
        </legend>

        {CONDITION_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {group.label}
            </span>
            <div className="space-y-1">
              {group.items.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 py-2.5 text-base"
                >
                  <input
                    type="checkbox"
                    checked={!!data.systemicConditions[item.key]}
                    onChange={() => toggleCondition(item.key)}
                    className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      {/* Conditional diabetes detail */}
      {showDiabetesDetail && (
        <fieldset className="space-y-4 pl-8">
          <legend className="text-base font-medium">
            Chi tiết đái tháo đường
          </legend>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="diabetes-year" className="text-base">
                Năm chẩn đoán
              </Label>
              <Input
                id="diabetes-year"
                value={data.diabetesDetail.yearDiagnosed ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    diabetesDetail: {
                      ...data.diabetesDetail,
                      yearDiagnosed: e.target.value,
                    },
                  })
                }
                placeholder="Ví dụ: 2018"
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="diabetes-hba1c" className="text-base">
                HbA1c gần nhất
              </Label>
              <Input
                id="diabetes-hba1c"
                value={data.diabetesDetail.hba1c ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    diabetesDetail: {
                      ...data.diabetesDetail,
                      hba1c: e.target.value,
                    },
                  })
                }
                placeholder="Ví dụ: 7.2%"
                className="text-base"
              />
            </div>
          </div>
        </fieldset>
      )}

      {/* Conditional cancer detail */}
      {showCancerDetail && (
        <fieldset className="space-y-4 pl-8">
          <legend className="text-base font-medium">Chi tiết ung thư</legend>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="cancer-type" className="text-base">
                Loại ung thư
              </Label>
              <Input
                id="cancer-type"
                value={data.cancerDetail.type ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    cancerDetail: {
                      ...data.cancerDetail,
                      type: e.target.value,
                    },
                  })
                }
                placeholder="Nhập loại ung thư..."
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Đang điều trị?</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-3 py-2.5 text-base">
                  <input
                    type="radio"
                    name="cancer-treatment"
                    checked={data.cancerDetail.onTreatment === true}
                    onChange={() =>
                      onChange({
                        ...data,
                        cancerDetail: {
                          ...data.cancerDetail,
                          onTreatment: true,
                        },
                      })
                    }
                    className="size-5 border-gray-300 accent-[var(--color-primary)]"
                  />
                  <span>Có</span>
                </label>
                <label className="flex items-center gap-3 py-2.5 text-base">
                  <input
                    type="radio"
                    name="cancer-treatment"
                    checked={data.cancerDetail.onTreatment === false}
                    onChange={() =>
                      onChange({
                        ...data,
                        cancerDetail: {
                          ...data.cancerDetail,
                          onTreatment: false,
                        },
                      })
                    }
                    className="size-5 border-gray-300 accent-[var(--color-primary)]"
                  />
                  <span>Không</span>
                </label>
              </div>
            </div>
          </div>
        </fieldset>
      )}

      {/* Other condition text */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Bệnh lý khác (nếu có)
        </legend>
        <Input
          value={data.systemicConditionOther}
          onChange={(e) =>
            onChange({ ...data, systemicConditionOther: e.target.value })
          }
          placeholder="Nhập bệnh lý khác..."
          className="text-base"
        />
      </fieldset>

      {/* Medications list */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">
          Thuốc đang sử dụng
        </legend>

        {data.medicationsList.map((med, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Thuốc {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeMedication(index)}
                className="px-2 py-1 text-sm text-destructive hover:text-destructive/80"
              >
                Xoá
              </button>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`med-name-${index}`} className="text-base">
                Tên thuốc
              </Label>
              <Input
                id={`med-name-${index}`}
                value={med.name}
                onChange={(e) =>
                  updateMedication(index, { name: e.target.value })
                }
                placeholder="Nhập tên thuốc..."
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`med-dose-${index}`} className="text-base">
                Liều dùng
              </Label>
              <Input
                id={`med-dose-${index}`}
                value={med.dose}
                onChange={(e) =>
                  updateMedication(index, { dose: e.target.value })
                }
                placeholder="Ví dụ: 500mg, 1 viên/ngày..."
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`med-purpose-${index}`} className="text-base">
                Mục đích
              </Label>
              <Input
                id={`med-purpose-${index}`}
                value={med.purpose}
                onChange={(e) =>
                  updateMedication(index, { purpose: e.target.value })
                }
                placeholder="Ví dụ: huyết áp, đái tháo đường..."
                className="text-base"
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addMedication}
          className="w-full text-base"
        >
          Thêm thuốc
        </Button>
      </fieldset>

      {/* Allergies */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">Dị ứng</legend>

        <label className="flex items-center gap-3 py-2.5 text-base">
          <input
            type="checkbox"
            checked={data.allergiesInfo.none}
            onChange={() =>
              onChange({
                ...data,
                allergiesInfo: {
                  ...data.allergiesInfo,
                  none: !data.allergiesInfo.none,
                },
              })
            }
            className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
          />
          <span>Không có dị ứng nào</span>
        </label>

        {!data.allergiesInfo.none && (
          <div className="space-y-4">
            {data.allergiesInfo.items.map((allergy, index) => (
              <div
                key={index}
                className="space-y-3 rounded-lg border border-border p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Dị ứng {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAllergy(index)}
                    className="px-2 py-1 text-sm text-destructive hover:text-destructive/80"
                  >
                    Xoá
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`allergy-type-${index}`} className="text-base">
                    Loại dị ứng
                  </Label>
                  <select
                    id={`allergy-type-${index}`}
                    value={allergy.type}
                    onChange={(e) =>
                      updateAllergy(index, {
                        type: e.target.value as AllergyEntry["type"],
                      })
                    }
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {ALLERGY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`allergy-name-${index}`} className="text-base">
                    Tên chất gây dị ứng
                  </Label>
                  <Input
                    id={`allergy-name-${index}`}
                    value={allergy.name}
                    onChange={(e) =>
                      updateAllergy(index, { name: e.target.value })
                    }
                    placeholder="Ví dụ: Penicillin, tôm cua..."
                    className="text-base"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`allergy-reaction-${index}`}
                    className="text-base"
                  >
                    Phản ứng
                  </Label>
                  <Input
                    id={`allergy-reaction-${index}`}
                    value={allergy.reaction}
                    onChange={(e) =>
                      updateAllergy(index, { reaction: e.target.value })
                    }
                    placeholder="Ví dụ: nổi mề đay, khó thở..."
                    className="text-base"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addAllergy}
              className="w-full text-base"
            >
              Thêm dị ứng
            </Button>
          </div>
        )}
      </fieldset>

      {/* Pregnancy status — only for female patients */}
      {gender === "Nữ" && (
        <fieldset className="space-y-3">
          <legend className="text-base font-medium">
            Tình trạng thai sản
          </legend>
          <div className="space-y-1">
            {PREGNANCY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 py-2.5 text-base"
              >
                <input
                  type="radio"
                  name="pregnancy-status"
                  value={option.value}
                  checked={data.pregnancyStatus === option.value}
                  onChange={() =>
                    onChange({ ...data, pregnancyStatus: option.value })
                  }
                  className="size-5 border-gray-300 accent-[var(--color-primary)]"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {data.pregnancyStatus === "mang_thai" && (
            <div className="space-y-1.5 pl-8">
              <Label htmlFor="pregnancy-trimester" className="text-base">
                Tam cá nguyệt
              </Label>
              <Input
                id="pregnancy-trimester"
                value={data.pregnancyTrimester}
                onChange={(e) =>
                  onChange({ ...data, pregnancyTrimester: e.target.value })
                }
                placeholder="Ví dụ: Tam cá nguyệt thứ 2, tuần 24..."
                className="text-base"
              />
            </div>
          )}
        </fieldset>
      )}
    </div>
  )
}
