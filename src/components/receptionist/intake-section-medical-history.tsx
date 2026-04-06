import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"
import type { MedicationEntry, AllergyEntry } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const SYSTEMIC_CONDITION_GROUPS = [
  {
    label: "Tim mạch",
    items: [
      { key: "tang_huyet_ap", label: "Tăng huyết áp" },
      { key: "dau_that_nguc", label: "Đau thắt ngực" },
      { key: "benh_tim_mach", label: "Bệnh tim mạch" },
      { key: "dot_quy", label: "Đột quỵ/Tai biến mạch máu não" },
    ],
  },
  {
    label: "Nội tiết",
    items: [
      { key: "dtd_type1", label: "Đái tháo đường Típ 1" },
      { key: "dtd_type2", label: "Đái tháo đường Típ 2" },
      { key: "benh_tuyen_giap", label: "Bệnh tuyến giáp" },
      { key: "cholesterol_cao", label: "Cholesterol cao" },
    ],
  },
  {
    label: "Thần kinh",
    items: [
      { key: "da_xo_cung", label: "Đa xơ cứng (MS)" },
      { key: "dong_kinh", label: "Động kinh" },
      { key: "parkinson", label: "Bệnh Parkinson" },
      { key: "migraine", label: "Đau nửa đầu/Migraine" },
    ],
  },
  {
    label: "Hô hấp & Miễn dịch",
    items: [
      { key: "hen_suyen", label: "Hen suyễn" },
      { key: "copd", label: "COPD" },
      { key: "hiv", label: "HIV/AIDS" },
      { key: "viem_gan_bc", label: "Viêm gan B/C" },
      { key: "lupus", label: "Lupus ban đỏ hệ thống" },
      { key: "viem_khop_dang_thap", label: "Viêm khớp dạng thấp" },
    ],
  },
  {
    label: "Ung thư",
    items: [
      { key: "ung_thu", label: "Ung thư" },
      { key: "dang_hoa_xa_tri", label: "Đang điều trị hóa chất/xạ trị" },
    ],
  },
  {
    label: "Khác",
    items: [
      { key: "benh_than", label: "Bệnh thận" },
      { key: "benh_gan", label: "Bệnh gan" },
      { key: "roi_loan_dong_mau", label: "Rối loạn đông máu" },
      { key: "benh_ngoai_da", label: "Bệnh ngoài da (vảy nến, chàm...)" },
      { key: "tram_cam_lo_au", label: "Trầm cảm/Lo âu" },
    ],
  },
]

const ALLERGY_TYPE_OPTIONS = [
  { value: "thuoc", label: "Thuốc" },
  { value: "thuc_pham", label: "Thực phẩm" },
  { value: "moi_truong", label: "Môi trường" },
  { value: "khac", label: "Khác" },
]

const emptyMedication: MedicationEntry = { name: "", dose: "", purpose: "" }
const emptyAllergy: AllergyEntry = {
  type: "thuoc",
  name: "",
  reaction: "",
}

export function IntakeSectionMedicalHistory({
  data,
  errors,
  onChange,
}: Props) {
  const conditions = data.systemicConditions ?? {}
  const hasDiabetes = conditions["dtd_type1"] || conditions["dtd_type2"]
  const hasCancer = conditions["ung_thu"]
  const medications = data.medicationsList ?? []
  const allergiesInfo = data.allergiesInfo ?? { none: false, items: [] }
  const isFemale = data.gender === "Nữ"

  function updateCondition(key: string, checked: boolean) {
    onChange("systemicConditions", { ...conditions, [key]: checked })
  }

  function addMedication() {
    onChange("medicationsList", [...medications, { ...emptyMedication }])
  }

  function updateMedication(index: number, field: string, value: string) {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    onChange("medicationsList", updated)
  }

  function removeMedication(index: number) {
    onChange("medicationsList", medications.filter((_, i) => i !== index))
  }

  function toggleAllergyNone(none: boolean) {
    onChange("allergiesInfo", { none, items: none ? [] : allergiesInfo.items })
  }

  function addAllergy() {
    onChange("allergiesInfo", {
      ...allergiesInfo,
      none: false,
      items: [...allergiesInfo.items, { ...emptyAllergy }],
    })
  }

  function updateAllergy(index: number, field: string, value: string) {
    const items = [...allergiesInfo.items]
    items[index] = { ...items[index], [field]: value } as AllergyEntry
    onChange("allergiesInfo", { ...allergiesInfo, items })
  }

  function removeAllergy(index: number) {
    onChange("allergiesInfo", {
      ...allergiesInfo,
      items: allergiesInfo.items.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-5">
      {/* Primary doctor */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Bác sĩ gia đình/Bác sĩ điều trị chính</Label>
          <Input
            value={data.primaryDoctor?.name ?? ""}
            onChange={(e) =>
              onChange("primaryDoctor", {
                ...(data.primaryDoctor ?? {}),
                name: e.target.value,
              })
            }
          />
        </div>
        <div>
          <Label>Lần khám gần nhất</Label>
          <Input
            value={data.primaryDoctor?.lastVisit ?? ""}
            onChange={(e) =>
              onChange("primaryDoctor", {
                ...(data.primaryDoctor ?? {}),
                lastVisit: e.target.value,
              })
            }
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>

      {/* Systemic conditions by group */}
      <div>
        <Label className="mb-2 block">Bạn có bị các bệnh sau không?</Label>
        <div className="space-y-4">
          {SYSTEMIC_CONDITION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <CheckboxGrid
                items={group.items}
                values={conditions}
                onChange={updateCondition}
              />
            </div>
          ))}
        </div>

        {/* Diabetes detail */}
        {hasDiabetes && (
          <div className="mt-3 grid grid-cols-2 gap-6 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Năm chẩn đoán
              </Label>
              <Input
                value={data.diabetesDetail?.yearDiagnosed ?? ""}
                onChange={(e) =>
                  onChange("diabetesDetail", {
                    ...(data.diabetesDetail ?? {}),
                    yearDiagnosed: e.target.value,
                  })
                }
                placeholder="VD: 2018"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                HbA1c gần nhất
              </Label>
              <Input
                value={data.diabetesDetail?.hba1c ?? ""}
                onChange={(e) =>
                  onChange("diabetesDetail", {
                    ...(data.diabetesDetail ?? {}),
                    hba1c: e.target.value,
                  })
                }
                placeholder="VD: 7.2%"
              />
            </div>
          </div>
        )}

        {/* Cancer detail */}
        {hasCancer && (
          <div className="mt-3 grid grid-cols-2 gap-6 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Loại ung thư
              </Label>
              <Input
                value={data.cancerDetail?.type ?? ""}
                onChange={(e) =>
                  onChange("cancerDetail", {
                    ...(data.cancerDetail ?? {}),
                    type: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Đang điều trị?
              </Label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="cancerOnTreatment"
                    checked={data.cancerDetail?.onTreatment === true}
                    onChange={() =>
                      onChange("cancerDetail", {
                        ...(data.cancerDetail ?? {}),
                        onTreatment: true,
                      })
                    }
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Có
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="cancerOnTreatment"
                    checked={data.cancerDetail?.onTreatment === false}
                    onChange={() =>
                      onChange("cancerDetail", {
                        ...(data.cancerDetail ?? {}),
                        onTreatment: false,
                      })
                    }
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Không
                </label>
              </div>
            </div>
          </div>
        )}

        <ConditionalField
          show={!SYSTEMIC_CONDITION_GROUPS.flatMap((g) =>
            g.items.map((i) => i.key)
          ).every((k) => !conditions[k])}
          label=""
          value=""
          onChange={() => {}}
        />
      </div>

      {/* Other systemic condition */}
      <div>
        <Label>Bệnh khác</Label>
        <Input
          value={data.systemicConditionOther ?? ""}
          onChange={(e) => onChange("systemicConditionOther", e.target.value)}
          placeholder="Mô tả bệnh khác nếu có..."
        />
      </div>

      {/* Medications */}
      <div>
        <Label className="mb-2 block">
          Thuốc đang sử dụng (bao gồm thuốc kê đơn, vitamin, thực phẩm chức
          năng)
        </Label>
        {medications.length === 0 ? (
          <Button variant="outline" size="sm" onClick={addMedication}>
            + Thêm thuốc
          </Button>
        ) : (
          <div className="space-y-2">
            {medications.map((med, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_100px_1fr_40px] items-end gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tên thuốc
                  </Label>
                  <Input
                    value={med.name}
                    onChange={(e) => updateMedication(i, "name", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Liều</Label>
                  <Input
                    value={med.dose}
                    onChange={(e) => updateMedication(i, "dose", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Mục đích
                  </Label>
                  <Input
                    value={med.purpose}
                    onChange={(e) =>
                      updateMedication(i, "purpose", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMedication}>
              + Thêm thuốc
            </Button>
          </div>
        )}
      </div>

      {/* Allergies */}
      <div>
        <Label className="mb-2 block">Dị ứng</Label>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allergiesInfo.none}
            onChange={(e) => toggleAllergyNone(e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Không có dị ứng nào
        </label>
        {!allergiesInfo.none && (
          <div className="space-y-2">
            {allergiesInfo.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[120px_1fr_1fr_40px] items-end gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">Loại</Label>
                  <Select
                    value={item.type}
                    onValueChange={(v) => updateAllergy(i, "type", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLERGY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tên chất gây dị ứng
                  </Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateAllergy(i, "name", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Phản ứng
                  </Label>
                  <Input
                    value={item.reaction}
                    onChange={(e) =>
                      updateAllergy(i, "reaction", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAllergy(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAllergy}>
              + Thêm dị ứng
            </Button>
          </div>
        )}
      </div>

      {/* Pregnancy — female only */}
      {isFemale && (
        <div>
          <Label className="mb-2 block">Phụ nữ</Label>
          <div className="flex gap-4">
            {(
              [
                { value: "mang_thai", label: "Đang mang thai" },
                { value: "cho_con_bu", label: "Đang cho con bú" },
                { value: "khong", label: "Không" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-sm"
              >
                <input
                  type="radio"
                  name="pregnancyStatus"
                  checked={data.pregnancyStatus === opt.value}
                  onChange={() => onChange("pregnancyStatus", opt.value)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <ConditionalField
            show={data.pregnancyStatus === "mang_thai"}
            label="Thai kỳ thứ"
            value={data.pregnancyTrimester ?? ""}
            onChange={(v) => onChange("pregnancyTrimester", v)}
            placeholder="VD: 2"
          />
        </div>
      )}
    </div>
  )
}
