import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"
import type { EyeSurgery } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const GLASSES_TYPE_OPTIONS = [
  { key: "can", label: "Kính cận" },
  { key: "vien", label: "Kính viễn" },
  { key: "loan", label: "Kính loạn" },
  { key: "lao", label: "Kính lão" },
]

const CONTACT_LENS_STATUS_OPTIONS = [
  { value: "co", label: "Có" },
  { value: "khong", label: "Không" },
  { value: "da_tung", label: "Đã từng đeo nhưng hiện không dùng" },
]

const CONTACT_LENS_TYPE_OPTIONS = [
  { key: "mem", label: "Mềm" },
  { key: "cung", label: "Cứng (RGP)" },
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
  { key: "can_thi", label: "Cận thị (Myopia)" },
  { key: "vien_thi", label: "Viễn thị (Hyperopia)" },
  { key: "loan_thi", label: "Loạn thị (Astigmatism)" },
  { key: "lao_thi", label: "Lão thị (Presbyopia)" },
  { key: "glaucoma", label: "Glaucoma (Tăng nhãn áp)" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể (Cataract)" },
  { key: "thoai_hoa_diem_vang", label: "Thoái hóa điểm vàng" },
  { key: "benh_vong_mac_dtd", label: "Bệnh võng mạc do ĐTĐ" },
  { key: "lac_mat", label: "Lác mắt (Strabismus)" },
  { key: "mat_luoi", label: "Mắt lười (Amblyopia)" },
  { key: "kho_mat_syndrome", label: "Khô mắt (Dry Eye)" },
  { key: "viem_ket_mac", label: "Viêm kết mạc thường xuyên" },
  { key: "bong_vong_mac", label: "Bong võng mạc" },
  { key: "viem_mang_bo_dao", label: "Viêm màng bồ đào (Uveitis)" },
  { key: "khac", label: "Khác" },
]

const SURGERY_TYPE_OPTIONS = [
  { value: "lasik", label: "LASIK/PRK" },
  { value: "duc_thuy_tinh_the", label: "Phẫu thuật đục thủy tinh thể" },
  { value: "glaucoma", label: "Phẫu thuật glaucoma" },
  { value: "vong_mac", label: "Phẫu thuật võng mạc" },
  { value: "lac_mat", label: "Phẫu thuật lác mắt" },
  { value: "khac", label: "Khác" },
]

const REFRACTION_CONDITIONS = ["can_thi", "vien_thi", "loan_thi"]

const emptySurgery: EyeSurgery = {
  type: "",
  year: "",
  od: false,
  os: false,
}

export function IntakeSectionEyeHistory({ data, onChange }: Props) {
  const conditions = data.diagnosedEyeConditions ?? {}
  const hasGlasses = (data.currentGlasses?.types ?? []).length > 0
  const showLensDetail =
    data.contactLensStatus === "co" || data.contactLensStatus === "da_tung"
  const hasEyeInjury = data.eyeInjury?.has ?? false
  const hasSurgery = (data.eyeSurgeries ?? []).length > 0

  function toggleGlassesType(key: string, checked: boolean) {
    const current = data.currentGlasses?.types ?? []
    const next = checked ? [...current, key] : current.filter((t) => t !== key)
    onChange("currentGlasses", {
      ...(data.currentGlasses ?? { types: [] }),
      types: next,
    })
  }

  function updateGlasses(field: string, value: unknown) {
    onChange("currentGlasses", {
      ...(data.currentGlasses ?? { types: [] }),
      [field]: value,
    })
  }

  function updateLensDetail(field: string, value: unknown) {
    onChange("contactLensDetail", {
      ...(data.contactLensDetail ?? {}),
      [field]: value,
    })
  }

  function toggleLensType(key: string, checked: boolean) {
    const current = data.contactLensDetail?.type ?? []
    const next = checked ? [...current, key] : current.filter((t) => t !== key)
    updateLensDetail("type", next)
  }

  function toggleLensIssue(key: string, checked: boolean) {
    const current = data.contactLensDetail?.issues ?? []
    const next = checked ? [...current, key] : current.filter((i) => i !== key)
    updateLensDetail("issues", next)
  }

  function updateCondition(key: string, checked: boolean) {
    onChange("diagnosedEyeConditions", { ...conditions, [key]: checked })
  }

  function updateRefraction(
    condition: string,
    eye: "od" | "os",
    value: string
  ) {
    const rv = data.refractionValues ?? {}
    const condKey =
      condition === "can_thi"
        ? "myopia"
        : condition === "vien_thi"
          ? "hyperopia"
          : "astigmatism"
    onChange("refractionValues", {
      ...rv,
      [condKey]: { ...(rv[condKey] ?? {}), [eye]: value },
    })
  }

  function addSurgery() {
    onChange("eyeSurgeries", [
      ...(data.eyeSurgeries ?? []),
      { ...emptySurgery },
    ])
  }

  function updateSurgery(index: number, field: string, value: unknown) {
    const surgeries = [...(data.eyeSurgeries ?? [])]
    surgeries[index] = { ...surgeries[index], [field]: value }
    onChange("eyeSurgeries", surgeries)
  }

  function removeSurgery(index: number) {
    const surgeries = (data.eyeSurgeries ?? []).filter((_, i) => i !== index)
    onChange("eyeSurgeries", surgeries)
  }

  return (
    <div className="space-y-5">
      {/* Last exam */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Lần khám mắt gần nhất</Label>
          <Input
            value={data.lastEyeExam?.date ?? ""}
            onChange={(e) =>
              onChange("lastEyeExam", {
                ...(data.lastEyeExam ?? {}),
                date: e.target.value,
              })
            }
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div>
          <Label>Tại đâu?</Label>
          <Input
            value={data.lastEyeExam?.location ?? ""}
            onChange={(e) =>
              onChange("lastEyeExam", {
                ...(data.lastEyeExam ?? {}),
                location: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Current glasses */}
      <div>
        <Label className="mb-2 block">Hiện có đeo kính không?</Label>
        <div className="grid grid-cols-2 gap-2">
          {GLASSES_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                (data.currentGlasses?.types ?? []).includes(opt.key)
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={(data.currentGlasses?.types ?? []).includes(opt.key)}
                onChange={(e) => toggleGlassesType(opt.key, e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {hasGlasses && (
          <div className="mt-3 grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">
                Kính đã dùng bao lâu?
              </Label>
              <Input
                value={data.currentGlasses?.duration ?? ""}
                onChange={(e) => updateGlasses("duration", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Có thấy rõ với kính hiện tại không?
              </Label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="seesWell"
                    checked={data.currentGlasses?.seesWell === true}
                    onChange={() => updateGlasses("seesWell", true)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Có
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="seesWell"
                    checked={data.currentGlasses?.seesWell === false}
                    onChange={() => updateGlasses("seesWell", false)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Không
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact lens */}
      <div>
        <Label className="mb-2 block">Có đeo kính áp tròng không?</Label>
        <div className="flex gap-3">
          {CONTACT_LENS_STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="contactLensStatus"
                checked={data.contactLensStatus === opt.value}
                onChange={() => onChange("contactLensStatus", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {showLensDetail && (
          <div className="mt-3 space-y-3 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">Loại</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {CONTACT_LENS_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                      (data.contactLensDetail?.type ?? []).includes(opt.key)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(data.contactLensDetail?.type ?? []).includes(
                        opt.key
                      )}
                      onChange={(e) =>
                        toggleLensType(opt.key, e.target.checked)
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Thương hiệu
                </Label>
                <Input
                  value={data.contactLensDetail?.brand ?? ""}
                  onChange={(e) => updateLensDetail("brand", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">
                  Đeo được bao lâu?
                </Label>
                <Input
                  value={data.contactLensDetail?.duration ?? ""}
                  onChange={(e) => updateLensDetail("duration", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Có gặp vấn đề gì không?
              </Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {CONTACT_LENS_ISSUE_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                      (data.contactLensDetail?.issues ?? []).includes(opt.key)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(data.contactLensDetail?.issues ?? []).includes(
                        opt.key
                      )}
                      onChange={(e) =>
                        toggleLensIssue(opt.key, e.target.checked)
                      }
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <ConditionalField
                show={(data.contactLensDetail?.issues ?? []).includes("khac")}
                label="Mô tả vấn đề khác"
                value={data.contactLensDetail?.issueOther ?? ""}
                onChange={(v) => updateLensDetail("issueOther", v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Eye injury */}
      <div>
        <Label className="mb-2 block">
          Có từng bị chấn thương mắt hoặc nhiễm trùng mắt không?
        </Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="eyeInjury"
              checked={hasEyeInjury}
              onChange={() =>
                onChange("eyeInjury", {
                  has: true,
                  detail: data.eyeInjury?.detail,
                })
              }
              className="size-4 accent-[var(--color-primary)]"
            />
            Có
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="eyeInjury"
              checked={data.eyeInjury?.has === false}
              onChange={() => onChange("eyeInjury", { has: false })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Không
          </label>
        </div>
        <ConditionalField
          show={hasEyeInjury}
          label="Mô tả"
          value={data.eyeInjury?.detail ?? ""}
          onChange={(v) => onChange("eyeInjury", { has: true, detail: v })}
        />
      </div>

      {/* Diagnosed conditions */}
      <div>
        <Label className="mb-2 block">
          Có từng được chẩn đoán hoặc điều trị các bệnh mắt sau không?
        </Label>
        <CheckboxGrid
          items={EYE_CONDITION_OPTIONS}
          values={conditions}
          onChange={updateCondition}
        />
        <ConditionalField
          show={conditions["khac"] ?? false}
          label="Bệnh khác"
          value={data.diagnosedEyeConditionOther ?? ""}
          onChange={(v) => onChange("diagnosedEyeConditionOther", v)}
        />
        {/* Refraction values for applicable conditions */}
        {REFRACTION_CONDITIONS.some((c) => conditions[c]) && (
          <div className="mt-3 space-y-2 rounded-lg border border-border p-4">
            <Label className="text-sm font-medium">Số đo khúc xạ</Label>
            {REFRACTION_CONDITIONS.filter((c) => conditions[c]).map((c) => {
              const label =
                c === "can_thi"
                  ? "Cận thị"
                  : c === "vien_thi"
                    ? "Viễn thị"
                    : "Loạn thị"
              const condKey =
                c === "can_thi"
                  ? "myopia"
                  : c === "vien_thi"
                    ? "hyperopia"
                    : "astigmatism"
              return (
                <div
                  key={c}
                  className="grid grid-cols-[120px_1fr_1fr] items-center gap-4"
                >
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">OD</span>
                    <Input
                      value={data.refractionValues?.[condKey]?.od ?? ""}
                      onChange={(e) =>
                        updateRefraction(c, "od", e.target.value)
                      }
                      placeholder="VD: -3.50"
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">OS</span>
                    <Input
                      value={data.refractionValues?.[condKey]?.os ?? ""}
                      onChange={(e) =>
                        updateRefraction(c, "os", e.target.value)
                      }
                      placeholder="VD: -3.25"
                      className="h-8"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Eye surgeries */}
      <div>
        <Label className="mb-2 block">Có từng phẫu thuật mắt không?</Label>
        {!hasSurgery ? (
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="hasSurgery"
                checked={false}
                onChange={() => addSurgery()}
                className="size-4 accent-[var(--color-primary)]"
              />
              Có
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="hasSurgery"
                checked={true}
                readOnly
                className="size-4 accent-[var(--color-primary)]"
              />
              Không
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {(data.eyeSurgeries ?? []).map((surgery, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_80px_60px_60px_40px] items-end gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Loại phẫu thuật
                  </Label>
                  <select
                    value={surgery.type}
                    onChange={(e) => updateSurgery(i, "type", e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="">Chọn...</option>
                    {SURGERY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {surgery.type === "khac" && (
                    <Input
                      value={surgery.typeOther ?? ""}
                      onChange={(e) =>
                        updateSurgery(i, "typeOther", e.target.value)
                      }
                      placeholder="Loại khác..."
                      className="mt-1 h-8"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Năm</Label>
                  <Input
                    value={surgery.year ?? ""}
                    onChange={(e) => updateSurgery(i, "year", e.target.value)}
                    className="mt-1 h-8"
                    placeholder="2020"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={surgery.od}
                    onChange={(e) => updateSurgery(i, "od", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  OD
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={surgery.os}
                    onChange={(e) => updateSurgery(i, "os", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  OS
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSurgery(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSurgery}>
              + Thêm phẫu thuật
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
