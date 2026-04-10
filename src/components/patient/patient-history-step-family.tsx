import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FamilyHistoryEntry } from "@/data/mock-patients"

export interface FamilyHistoryData {
  familyEyeHistory: Record<string, FamilyHistoryEntry>
  familyMedicalHistory: Record<string, FamilyHistoryEntry>
  familyHistoryOther: { has: boolean; detail?: string; who?: string }
}

interface Props {
  data: FamilyHistoryData
  onChange: (data: FamilyHistoryData) => void
}

const EYE_CONDITIONS = [
  { key: "glaucoma", label: "Glaucoma (Tăng nhãn áp)" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể" },
  { key: "thoai_hoa_diem_vang", label: "Thoái hóa điểm vàng" },
  { key: "benh_vong_mac", label: "Bệnh võng mạc" },
  { key: "can_thi_nang", label: "Cận thị nặng" },
  { key: "mu_mau", label: "Mù màu" },
  { key: "lac_luoi", label: "Mắt lác/Mắt lười" },
  { key: "bong_vong_mac", label: "Bong võng mạc" },
]

const MEDICAL_CONDITIONS = [
  { key: "dtd", label: "Đái tháo đường" },
  { key: "tang_huyet_ap", label: "Tăng huyết áp" },
  { key: "benh_tim_mach", label: "Bệnh tim mạch" },
  { key: "dot_quy", label: "Đột quỵ" },
  { key: "ung_thu", label: "Ung thư" },
  { key: "benh_tu_mien", label: "Bệnh tự miễn (Lupus, RA...)" },
]

export function PatientHistoryStepFamily({ data, onChange }: Props) {
  function toggleEyeCondition(key: string) {
    const current = data.familyEyeHistory[key] ?? { has: false }
    onChange({
      ...data,
      familyEyeHistory: {
        ...data.familyEyeHistory,
        [key]: { ...current, has: !current.has },
      },
    })
  }

  function updateEyeWho(key: string, who: string) {
    const current = data.familyEyeHistory[key] ?? { has: true }
    onChange({
      ...data,
      familyEyeHistory: {
        ...data.familyEyeHistory,
        [key]: { ...current, who },
      },
    })
  }

  function toggleMedicalCondition(key: string) {
    const current = data.familyMedicalHistory[key] ?? { has: false }
    onChange({
      ...data,
      familyMedicalHistory: {
        ...data.familyMedicalHistory,
        [key]: { ...current, has: !current.has },
      },
    })
  }

  function updateMedicalWho(key: string, who: string) {
    const current = data.familyMedicalHistory[key] ?? { has: true }
    onChange({
      ...data,
      familyMedicalHistory: {
        ...data.familyMedicalHistory,
        [key]: { ...current, who },
      },
    })
  }

  return (
    <div className="space-y-8">
      <h2 className="text-lg font-semibold">Tiền sử gia đình</h2>

      {/* Family eye conditions */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">
          Bệnh mắt trong gia đình
        </legend>
        <div className="space-y-1">
          {EYE_CONDITIONS.map((item) => {
            const entry = data.familyEyeHistory[item.key] ?? { has: false }
            return (
              <div key={item.key}>
                <label className="flex items-center gap-2.5 py-2.5 text-base">
                  <input
                    type="checkbox"
                    checked={entry.has}
                    onChange={() => toggleEyeCondition(item.key)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  {item.label}
                </label>
                {entry.has && (
                  <div className="ml-6 mb-2">
                    <Input
                      value={entry.who ?? ""}
                      onChange={(e) => updateEyeWho(item.key, e.target.value)}
                      placeholder="VD: Bố, Mẹ, Ông ngoại..."
                      className="text-base"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      {/* Family medical conditions */}
      <fieldset className="space-y-1">
        <legend className="text-base font-medium">
          Bệnh lý toàn thân trong gia đình
        </legend>
        <div className="space-y-1">
          {MEDICAL_CONDITIONS.map((item) => {
            const entry = data.familyMedicalHistory[item.key] ?? { has: false }
            return (
              <div key={item.key}>
                <label className="flex items-center gap-2.5 py-2.5 text-base">
                  <input
                    type="checkbox"
                    checked={entry.has}
                    onChange={() => toggleMedicalCondition(item.key)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  {item.label}
                </label>
                {entry.has && (
                  <div className="ml-6 mb-2">
                    <Input
                      value={entry.who ?? ""}
                      onChange={(e) =>
                        updateMedicalWho(item.key, e.target.value)
                      }
                      placeholder="VD: Bố, Mẹ, Ông ngoại..."
                      className="text-base"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </fieldset>

      {/* Other family history */}
      <fieldset className="space-y-3">
        <legend className="text-base font-medium">
          Tiền sử gia đình khác
        </legend>
        <div className="space-y-1">
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="family-history-other"
              checked={data.familyHistoryOther.has === true}
              onChange={() =>
                onChange({
                  ...data,
                  familyHistoryOther: {
                    ...data.familyHistoryOther,
                    has: true,
                  },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Có</span>
          </label>
          <label className="flex items-center gap-3 py-2.5 text-base">
            <input
              type="radio"
              name="family-history-other"
              checked={data.familyHistoryOther.has === false}
              onChange={() =>
                onChange({
                  ...data,
                  familyHistoryOther: { has: false },
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            <span>Không</span>
          </label>
        </div>

        {data.familyHistoryOther.has && (
          <div className="space-y-3 ml-6">
            <div className="space-y-1.5">
              <Label htmlFor="family-other-detail" className="text-base">
                Chi tiết
              </Label>
              <Input
                id="family-other-detail"
                value={data.familyHistoryOther.detail ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    familyHistoryOther: {
                      ...data.familyHistoryOther,
                      detail: e.target.value,
                    },
                  })
                }
                placeholder="Nhập chi tiết..."
                className="text-base"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="family-other-who" className="text-base">
                Ai bị?
              </Label>
              <Input
                id="family-other-who"
                value={data.familyHistoryOther.who ?? ""}
                onChange={(e) =>
                  onChange({
                    ...data,
                    familyHistoryOther: {
                      ...data.familyHistoryOther,
                      who: e.target.value,
                    },
                  })
                }
                placeholder="VD: Bố, Mẹ, Ông ngoại..."
                className="text-base"
              />
            </div>
          </div>
        )}
      </fieldset>
    </div>
  )
}
