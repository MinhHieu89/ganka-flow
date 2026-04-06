import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const REFERRAL_OPTIONS = [
  { value: "ban_be", label: "Bạn bè/Người thân giới thiệu" },
  { value: "bac_si_khac", label: "Bác sĩ/Phòng khám khác giới thiệu" },
  { value: "internet", label: "Tìm kiếm trên Internet (Google, Facebook, Zalo...)" },
  { value: "quang_cao", label: "Quảng cáo trực tuyến (Facebook Ads, Google Ads...)" },
  { value: "website", label: "Website của phòng khám" },
  { value: "di_ngang", label: "Đi ngang qua phòng khám" },
  { value: "bao_chi", label: "Báo chí/Tạp chí" },
  { value: "su_kien", label: "Sự kiện/Hội thảo sức khỏe" },
  { value: "da_kham", label: "Đã từng khám tại đây" },
  { value: "khac", label: "Khác" },
]

const NEEDS_DETAIL = ["ban_be", "bac_si_khac", "khac"]

export function IntakeSectionReferral({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Bạn biết đến phòng khám của chúng tôi qua đâu?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {REFERRAL_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
              data.referralSource === opt.value
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <input
              type="radio"
              name="referralSource"
              checked={data.referralSource === opt.value}
              onChange={() => onChange("referralSource", opt.value)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <ConditionalField
        show={NEEDS_DETAIL.includes(data.referralSource ?? "")}
        label={
          data.referralSource === "ban_be"
            ? "Tên người giới thiệu"
            : data.referralSource === "bac_si_khac"
              ? "Tên bác sĩ/phòng khám"
              : "Chi tiết"
        }
        value={data.referralDetail ?? ""}
        onChange={(v) => onChange("referralDetail", v)}
      />
    </div>
  )
}
