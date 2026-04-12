import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConditionalField } from "./intake-conditional-field"
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
import type { IntakeFormData } from "@/components/screening/screening-intake-form-editable"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const SUNGLASSES_OPTIONS = [
  { value: "luon_luon", label: "Luôn luôn" },
  { value: "thinh_thoang", label: "Thỉnh thoảng" },
  { value: "khong_bao_gio", label: "Không bao giờ" },
]

const DRIVING_WHEN_OPTIONS = [
  { value: "ban_ngay", label: "Ban ngày" },
  { value: "ban_dem", label: "Ban đêm" },
  { value: "ca_hai", label: "Cả hai" },
]

function RadioRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { value: string; label: string }[]
  value: string | undefined
  onChange: (value: string) => void
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="size-4 accent-[var(--color-primary)]"
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export function IntakeSectionLifestyle({ data, onChange }: Props) {
  const screenTimeOptions = useMasterDataOptions("screen_time_ranges").map(
    (i) => ({
      value: i.key,
      label: i.label,
    })
  )
  const outdoorTimeOptions = useMasterDataOptions("outdoor_time_ranges").map(
    (i) => ({
      value: i.key,
      label: i.label,
    })
  )

  const smoking = data.smokingInfo ?? { status: "khong" as const }
  const alcohol = data.alcoholInfo ?? { status: "khong" as const }
  const driving = data.drivingInfo ?? { does: false }
  const sports = data.sportsInfo ?? { does: false }

  function updateSmoking(field: string, value: string) {
    onChange("smokingInfo", { ...smoking, [field]: value })
  }

  function updateAlcohol(field: string, value: string) {
    onChange("alcoholInfo", { ...alcohol, [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* Smoking */}
      <div>
        <Label className="mb-1 block">Hút thuốc</Label>
        <div className="flex gap-4">
          {(
            [
              { value: "khong", label: "Không" },
              { value: "co", label: "Có" },
              { value: "da_bo", label: "Đã bỏ" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="smoking"
                checked={smoking.status === opt.value}
                onChange={() => updateSmoking("status", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {smoking.status === "co" && (
          <div className="mt-2 grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">
                Số điếu/ngày
              </Label>
              <Input
                value={smoking.quantity ?? ""}
                onChange={(e) => updateSmoking("quantity", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Hút được bao nhiêu năm?
              </Label>
              <Input
                value={smoking.years ?? ""}
                onChange={(e) => updateSmoking("years", e.target.value)}
              />
            </div>
          </div>
        )}
        {smoking.status === "da_bo" && (
          <div className="mt-2">
            <Label className="text-sm text-muted-foreground">
              Bỏ từ năm nào?
            </Label>
            <Input
              value={smoking.quitYear ?? ""}
              onChange={(e) => updateSmoking("quitYear", e.target.value)}
              placeholder="VD: 2020"
              className="max-w-[200px]"
            />
          </div>
        )}
      </div>

      {/* Alcohol */}
      <div>
        <Label className="mb-1 block">Uống rượu/bia</Label>
        <div className="flex gap-4">
          {(
            [
              { value: "khong", label: "Không" },
              { value: "thinh_thoang", label: "Thỉnh thoảng" },
              { value: "thuong_xuyen", label: "Thường xuyên" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="alcohol"
                checked={alcohol.status === opt.value}
                onChange={() => updateAlcohol("status", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <ConditionalField
          show={alcohol.status === "thuong_xuyen"}
          label="Bao nhiêu lần/tuần?"
          value={alcohol.frequency ?? ""}
          onChange={(v) => updateAlcohol("frequency", v)}
        />
      </div>

      {/* Screen time */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">
            Thời gian máy tính/laptop mỗi ngày
          </Label>
          <RadioRow
            name="screenTimeComputer"
            options={screenTimeOptions}
            value={data.screenTimeComputer}
            onChange={(v) => onChange("screenTimeComputer", v)}
          />
        </div>
        <div>
          <Label className="mb-1 block">
            Thời gian điện thoại/tablet mỗi ngày
          </Label>
          <RadioRow
            name="screenTimePhone"
            options={screenTimeOptions}
            value={data.screenTimePhone}
            onChange={(v) => onChange("screenTimePhone", v)}
          />
        </div>
      </div>

      {/* Outdoor time + Sunglasses */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">
            Thời gian hoạt động ngoài trời mỗi ngày
          </Label>
          <RadioRow
            name="outdoorTime"
            options={outdoorTimeOptions}
            value={data.outdoorTime}
            onChange={(v) => onChange("outdoorTime", v)}
          />
        </div>
        <div>
          <Label className="mb-1 block">
            Có đeo kính râm khi ra ngoài trời không?
          </Label>
          <RadioRow
            name="sunglassesUse"
            options={SUNGLASSES_OPTIONS}
            value={data.sunglassesUse}
            onChange={(v) => onChange("sunglassesUse", v)}
          />
        </div>
      </div>

      {/* Work conditions */}
      <div className="grid grid-cols-2 gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.workNearVision ?? false}
            onChange={(e) => onChange("workNearVision", e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Công việc yêu cầu nhìn gần nhiều (đọc, máy tính)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.workDustyChemical ?? false}
            onChange={(e) => onChange("workDustyChemical", e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Công việc trong môi trường bụi bặm, hóa chất
        </label>
      </div>

      {/* Driving */}
      <div>
        <Label className="mb-1 block">Lái xe thường xuyên</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="driving"
              checked={driving.does}
              onChange={() => onChange("drivingInfo", { does: true })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Có
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="driving"
              checked={!driving.does}
              onChange={() => onChange("drivingInfo", { does: false })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Không
          </label>
        </div>
        {driving.does && (
          <div className="mt-2">
            <RadioRow
              name="drivingWhen"
              options={DRIVING_WHEN_OPTIONS}
              value={driving.when}
              onChange={(v) => onChange("drivingInfo", { does: true, when: v })}
            />
          </div>
        )}
      </div>

      {/* Sports + Hobbies */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">Chơi thể thao</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="sports"
                checked={sports.does}
                onChange={() =>
                  onChange("sportsInfo", { does: true, type: sports.type })
                }
                className="size-4 accent-[var(--color-primary)]"
              />
              Có
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="sports"
                checked={!sports.does}
                onChange={() => onChange("sportsInfo", { does: false })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Không
            </label>
          </div>
          <ConditionalField
            show={sports.does}
            label="Môn thể thao"
            value={sports.type ?? ""}
            onChange={(v) => onChange("sportsInfo", { does: true, type: v })}
          />
        </div>
        <div>
          <Label>Sở thích đặc biệt (vẽ, may vá, thủ công...)</Label>
          <Input
            value={data.hobbies ?? ""}
            onChange={(e) => onChange("hobbies", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
