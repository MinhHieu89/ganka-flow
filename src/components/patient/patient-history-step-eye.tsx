import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  GlassesInfo,
  ContactLensDetail,
  EyeSurgery,
  RefractionValues,
} from "@/data/mock-patients"

export interface EyeHistoryData {
  lastEyeExam: { date?: string; location?: string }
  currentGlasses: GlassesInfo
  contactLensStatus: string
  contactLensDetail: ContactLensDetail
  eyeInjury: { has: boolean; detail?: string }
  diagnosedEyeConditions: Record<string, boolean>
  diagnosedEyeConditionOther: string
  refractionValues: RefractionValues
  eyeSurgeries: EyeSurgery[]
}

interface Props {
  data: EyeHistoryData
  onChange: (data: EyeHistoryData) => void
}

const GLASSES_TYPE_OPTIONS = [
  { key: "can", label: "Cận" },
  { key: "vien", label: "Viễn" },
  { key: "loan", label: "Loạn" },
  { key: "lao", label: "Lão" },
]

const CONTACT_LENS_STATUS_OPTIONS = [
  { value: "co", label: "Có" },
  { value: "khong", label: "Không" },
  { value: "da_tung", label: "Đã từng" },
] as const

const CONTACT_LENS_TYPE_OPTIONS = [
  { key: "mem", label: "Mềm" },
  { key: "cung", label: "Cứng" },
  { key: "deo_ngay", label: "Đeo ngày" },
  { key: "deo_keo_dai", label: "Đeo kéo dài" },
]

const CONTACT_LENS_ISSUE_OPTIONS = [
  { key: "kho_mat", label: "Khô mắt" },
  { key: "kho_chiu", label: "Khó chịu" },
  { key: "nhin_mo", label: "Nhìn mờ" },
  { key: "khac", label: "Khác" },
]

const EYE_CONDITION_OPTIONS = [
  { key: "can_thi", label: "Cận thị" },
  { key: "vien_thi", label: "Viễn thị" },
  { key: "loan_thi", label: "Loạn thị" },
  { key: "lao_thi", label: "Lão thị" },
  { key: "nhuoc_thi", label: "Nhược thị (mắt lười)" },
  { key: "lac_mat", label: "Lác mắt" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể" },
  { key: "glaucoma", label: "Glaucoma (tăng nhãn áp)" },
  { key: "thoai_hoa_hoang_diem", label: "Thoái hóa hoàng điểm" },
  { key: "benh_vong_mac", label: "Bệnh võng mạc" },
  { key: "kho_mat", label: "Khô mắt mãn tính" },
  { key: "viem_ket_mac", label: "Viêm kết mạc dị ứng" },
  { key: "keratoconus", label: "Keratoconus (giác mạc hình chóp)" },
  { key: "chan_thuong_mat", label: "Chấn thương mắt trước đây" },
  { key: "khac", label: "Khác" },
]

const SURGERY_TYPE_OPTIONS = [
  { value: "lasik", label: "LASIK/PRK" },
  { value: "duc_thuy_tinh_the", label: "Phẫu thuật đục thủy tinh thể" },
  { value: "glaucoma", label: "Phẫu thuật Glaucoma" },
  { value: "vong_mac", label: "Phẫu thuật võng mạc" },
  { value: "lac_mat", label: "Phẫu thuật lác mắt" },
  { value: "khac", label: "Khác" },
]

const REFRACTION_CONDITIONS = ["can_thi", "vien_thi", "loan_thi"] as const

export function PatientHistoryStepEye({ data, onChange }: Props) {
  const hasAnyGlassesType = data.currentGlasses.types.length > 0
  const showContactLensDetail =
    data.contactLensStatus === "co" || data.contactLensStatus === "da_tung"
  const showRefractionValues = REFRACTION_CONDITIONS.some(
    (c) => data.diagnosedEyeConditions[c]
  )

  function toggleGlassesType(key: string) {
    const types = data.currentGlasses.types.includes(key)
      ? data.currentGlasses.types.filter((t) => t !== key)
      : [...data.currentGlasses.types, key]
    onChange({
      ...data,
      currentGlasses: { ...data.currentGlasses, types },
    })
  }

  function toggleContactLensType(key: string) {
    const current = data.contactLensDetail.type ?? []
    const next = current.includes(key)
      ? current.filter((t) => t !== key)
      : [...current, key]
    onChange({
      ...data,
      contactLensDetail: { ...data.contactLensDetail, type: next },
    })
  }

  function toggleContactLensIssue(key: string) {
    const current = data.contactLensDetail.issues ?? []
    const next = current.includes(key)
      ? current.filter((i) => i !== key)
      : [...current, key]
    onChange({
      ...data,
      contactLensDetail: { ...data.contactLensDetail, issues: next },
    })
  }

  function toggleEyeCondition(key: string) {
    onChange({
      ...data,
      diagnosedEyeConditions: {
        ...data.diagnosedEyeConditions,
        [key]: !data.diagnosedEyeConditions[key],
      },
    })
  }

  function updateRefraction(
    field: keyof RefractionValues,
    eye: "od" | "os",
    value: string
  ) {
    onChange({
      ...data,
      refractionValues: {
        ...data.refractionValues,
        [field]: {
          ...data.refractionValues[field],
          [eye]: value,
        },
      },
    })
  }

  function addSurgery() {
    onChange({
      ...data,
      eyeSurgeries: [
        ...data.eyeSurgeries,
        { type: "", year: "", od: false, os: false },
      ],
    })
  }

  function updateSurgery(index: number, updates: Partial<EyeSurgery>) {
    const next = data.eyeSurgeries.map((s, i) =>
      i === index ? { ...s, ...updates } : s
    )
    onChange({ ...data, eyeSurgeries: next })
  }

  function removeSurgery(index: number) {
    onChange({
      ...data,
      eyeSurgeries: data.eyeSurgeries.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Tiền sử mắt cá nhân</h2>

      {/* Last eye exam */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">
          Lần khám mắt gần nhất
        </legend>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="last-exam-date" className="text-base">
              Thời gian
            </Label>
            <Input
              id="last-exam-date"
              value={data.lastEyeExam.date ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  lastEyeExam: { ...data.lastEyeExam, date: e.target.value },
                })
              }
              placeholder="Ví dụ: 6 tháng trước, 01/2025..."
              className="text-base"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="last-exam-location" className="text-base">
              Nơi khám
            </Label>
            <Input
              id="last-exam-location"
              value={data.lastEyeExam.location ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  lastEyeExam: {
                    ...data.lastEyeExam,
                    location: e.target.value,
                  },
                })
              }
              placeholder="Ví dụ: BV Mắt TP.HCM..."
              className="text-base"
            />
          </div>
        </div>
      </fieldset>

      {/* Current glasses */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Kính đang đeo hiện tại
        </legend>
        <div className="space-y-1">
          {GLASSES_TYPE_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 py-2.5 text-base"
            >
              <input
                type="checkbox"
                checked={data.currentGlasses.types.includes(option.key)}
                onChange={() => toggleGlassesType(option.key)}
                className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {hasAnyGlassesType && (
          <div className="space-y-4 pl-8">
            <div className="space-y-1.5">
              <Label htmlFor="glasses-duration" className="text-base">
                Đeo kính bao lâu rồi?
              </Label>
              <Input
                id="glasses-duration"
                value={data.currentGlasses.duration ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    currentGlasses: {
                      ...data.currentGlasses,
                      duration: e.target.value,
                    },
                  })
                }
                placeholder="Ví dụ: 5 năm, từ nhỏ..."
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Nhìn rõ với kính hiện tại?</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-3 py-2.5 text-base">
                  <input
                    type="radio"
                    name="glasses-sees-well"
                    checked={data.currentGlasses.seesWell === true}
                    onChange={() =>
                      onChange({
                        ...data,
                        currentGlasses: {
                          ...data.currentGlasses,
                          seesWell: true,
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
                    name="glasses-sees-well"
                    checked={data.currentGlasses.seesWell === false}
                    onChange={() =>
                      onChange({
                        ...data,
                        currentGlasses: {
                          ...data.currentGlasses,
                          seesWell: false,
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
        )}
      </fieldset>

      {/* Contact lens status */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Sử dụng kính áp tròng
        </legend>
        <div className="space-y-1">
          {CONTACT_LENS_STATUS_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 py-2.5 text-base"
            >
              <input
                type="radio"
                name="contact-lens-status"
                value={option.value}
                checked={data.contactLensStatus === option.value}
                onChange={() =>
                  onChange({ ...data, contactLensStatus: option.value })
                }
                className="size-5 border-gray-300 accent-[var(--color-primary)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {showContactLensDetail && (
          <div className="space-y-4 pl-8">
            <div className="space-y-2">
              <Label className="text-base">Loại kính áp tròng</Label>
              <div className="space-y-1">
                {CONTACT_LENS_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-3 py-2.5 text-base"
                  >
                    <input
                      type="checkbox"
                      checked={
                        data.contactLensDetail.type?.includes(option.key) ??
                        false
                      }
                      onChange={() => toggleContactLensType(option.key)}
                      className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-lens-brand" className="text-base">
                Thương hiệu
              </Label>
              <Input
                id="contact-lens-brand"
                value={data.contactLensDetail.brand ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    contactLensDetail: {
                      ...data.contactLensDetail,
                      brand: e.target.value,
                    },
                  })
                }
                placeholder="Ví dụ: Acuvue, Bausch+Lomb..."
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="contact-lens-duration" className="text-base">
                Thời gian sử dụng
              </Label>
              <Input
                id="contact-lens-duration"
                value={data.contactLensDetail.duration ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    contactLensDetail: {
                      ...data.contactLensDetail,
                      duration: e.target.value,
                    },
                  })
                }
                placeholder="Ví dụ: 3 năm..."
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-base">Vấn đề gặp phải</Label>
              <div className="space-y-1">
                {CONTACT_LENS_ISSUE_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center gap-3 py-2.5 text-base"
                  >
                    <input
                      type="checkbox"
                      checked={
                        data.contactLensDetail.issues?.includes(option.key) ??
                        false
                      }
                      onChange={() => toggleContactLensIssue(option.key)}
                      className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </fieldset>

      {/* Eye injury */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">Chấn thương mắt</legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="eye-injury"
              checked={data.eyeInjury.has === true}
              onChange={() =>
                onChange({
                  ...data,
                  eyeInjury: { ...data.eyeInjury, has: true },
                })
              }
              className="size-5 border-gray-300 accent-[var(--color-primary)]"
            />
            <span>Có</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="eye-injury"
              checked={data.eyeInjury.has === false}
              onChange={() =>
                onChange({
                  ...data,
                  eyeInjury: { has: false },
                })
              }
              className="size-5 border-gray-300 accent-[var(--color-primary)]"
            />
            <span>Không</span>
          </label>
        </div>

        {data.eyeInjury.has && (
          <div className="space-y-1.5 pl-8">
            <Label htmlFor="eye-injury-detail" className="text-base">
              Vui lòng mô tả
            </Label>
            <Input
              id="eye-injury-detail"
              value={data.eyeInjury.detail ?? ""}
              onChange={(e) =>
                onChange({
                  ...data,
                  eyeInjury: { ...data.eyeInjury, detail: e.target.value },
                })
              }
              placeholder="Ví dụ: Bị vật nhọn đâm vào mắt trái năm 2020..."
              className="text-base"
            />
          </div>
        )}
      </fieldset>

      {/* Diagnosed eye conditions */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Bệnh mắt đã được chẩn đoán
        </legend>
        <div className="space-y-1">
          {EYE_CONDITION_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center gap-3 py-2.5 text-base"
            >
              <input
                type="checkbox"
                checked={!!data.diagnosedEyeConditions[option.key]}
                onChange={() => toggleEyeCondition(option.key)}
                className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>

        {data.diagnosedEyeConditions["khac"] && (
          <div className="space-y-1.5 pl-8">
            <Label htmlFor="eye-condition-other" className="text-base">
              Vui lòng ghi rõ
            </Label>
            <Input
              id="eye-condition-other"
              value={data.diagnosedEyeConditionOther}
              onChange={(e) =>
                onChange({
                  ...data,
                  diagnosedEyeConditionOther: e.target.value,
                })
              }
              placeholder="Nhập bệnh mắt khác..."
              className="text-base"
            />
          </div>
        )}

        {showRefractionValues && (
          <div className="space-y-4 pl-8">
            <Label className="text-base">Số đo khúc xạ (nếu biết)</Label>

            {data.diagnosedEyeConditions["can_thi"] && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Cận thị
                </span>
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="myopia-od" className="text-sm">
                      OD (mắt phải)
                    </Label>
                    <Input
                      id="myopia-od"
                      value={data.refractionValues.myopia?.od ?? ""}
                      onChange={(e) =>
                        updateRefraction("myopia", "od", e.target.value)
                      }
                      placeholder="Ví dụ: -2.50"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="myopia-os" className="text-sm">
                      OS (mắt trái)
                    </Label>
                    <Input
                      id="myopia-os"
                      value={data.refractionValues.myopia?.os ?? ""}
                      onChange={(e) =>
                        updateRefraction("myopia", "os", e.target.value)
                      }
                      placeholder="Ví dụ: -3.00"
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {data.diagnosedEyeConditions["vien_thi"] && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Viễn thị
                </span>
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="hyperopia-od" className="text-sm">
                      OD (mắt phải)
                    </Label>
                    <Input
                      id="hyperopia-od"
                      value={data.refractionValues.hyperopia?.od ?? ""}
                      onChange={(e) =>
                        updateRefraction("hyperopia", "od", e.target.value)
                      }
                      placeholder="Ví dụ: +1.50"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hyperopia-os" className="text-sm">
                      OS (mắt trái)
                    </Label>
                    <Input
                      id="hyperopia-os"
                      value={data.refractionValues.hyperopia?.os ?? ""}
                      onChange={(e) =>
                        updateRefraction("hyperopia", "os", e.target.value)
                      }
                      placeholder="Ví dụ: +2.00"
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {data.diagnosedEyeConditions["loan_thi"] && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Loạn thị
                </span>
                <div className="space-y-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="astigmatism-od" className="text-sm">
                      OD (mắt phải)
                    </Label>
                    <Input
                      id="astigmatism-od"
                      value={data.refractionValues.astigmatism?.od ?? ""}
                      onChange={(e) =>
                        updateRefraction("astigmatism", "od", e.target.value)
                      }
                      placeholder="Ví dụ: -0.75"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="astigmatism-os" className="text-sm">
                      OS (mắt trái)
                    </Label>
                    <Input
                      id="astigmatism-os"
                      value={data.refractionValues.astigmatism?.os ?? ""}
                      onChange={(e) =>
                        updateRefraction("astigmatism", "os", e.target.value)
                      }
                      placeholder="Ví dụ: -1.00"
                      className="text-base"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </fieldset>

      {/* Eye surgeries */}
      <fieldset className="space-y-4">
        <legend className="text-base font-medium">
          Phẫu thuật mắt đã thực hiện
        </legend>

        {data.eyeSurgeries.map((surgery, index) => (
          <div
            key={index}
            className="space-y-3 rounded-lg border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Phẫu thuật {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeSurgery(index)}
                className="px-2 py-1 text-sm text-destructive hover:text-destructive/80"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-base">Loại phẫu thuật</Label>
              <Select
                value={surgery.type}
                onValueChange={(value) =>
                  updateSurgery(index, { type: value })
                }
              >
                <SelectTrigger className="w-full text-base">
                  <SelectValue placeholder="Chọn loại phẫu thuật" />
                </SelectTrigger>
                <SelectContent>
                  {SURGERY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {surgery.type === "khac" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor={`surgery-other-${index}`}
                  className="text-base"
                >
                  Ghi rõ loại phẫu thuật
                </Label>
                <Input
                  id={`surgery-other-${index}`}
                  value={surgery.typeOther ?? ""}
                  onChange={(e) =>
                    updateSurgery(index, { typeOther: e.target.value })
                  }
                  placeholder="Nhập loại phẫu thuật..."
                  className="text-base"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor={`surgery-year-${index}`} className="text-base">
                Năm thực hiện
              </Label>
              <Input
                id={`surgery-year-${index}`}
                value={surgery.year ?? ""}
                onChange={(e) =>
                  updateSurgery(index, { year: e.target.value })
                }
                placeholder="Ví dụ: 2022"
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Mắt phẫu thuật</Label>
              <div className="space-y-1">
                <label className="flex items-center gap-3 py-2.5 text-base">
                  <input
                    type="checkbox"
                    checked={surgery.od}
                    onChange={() =>
                      updateSurgery(index, { od: !surgery.od })
                    }
                    className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
                  />
                  <span>OD (mắt phải)</span>
                </label>
                <label className="flex items-center gap-3 py-2.5 text-base">
                  <input
                    type="checkbox"
                    checked={surgery.os}
                    onChange={() =>
                      updateSurgery(index, { os: !surgery.os })
                    }
                    className="size-5 rounded border-gray-300 accent-[var(--color-primary)]"
                  />
                  <span>OS (mắt trái)</span>
                </label>
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addSurgery}
          className="w-full text-base"
        >
          Thêm phẫu thuật
        </Button>
      </fieldset>
    </div>
  )
}
