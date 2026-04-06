import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

export function IntakeSectionConsent({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        <p>
          Tôi xác nhận rằng tất cả thông tin trên là chính xác và đầy đủ theo
          hiểu biết của tôi. Tôi hiểu rằng việc cung cấp thông tin không chính
          xác có thể ảnh hưởng đến chẩn đoán và điều trị của tôi.
        </p>
        <p className="mt-2">
          Tôi đồng ý cho phép phòng khám sử dụng thông tin này cho mục đích
          khám, điều trị và lưu trữ hồ sơ y tế.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.consentConfirmed ?? false}
          onChange={(e) => onChange("consentConfirmed", e.target.checked)}
          className="size-4 accent-[var(--color-primary)]"
        />
        <span>Bệnh nhân đã đồng ý cung cấp thông tin</span>
      </label>
      <p className="text-xs text-muted-foreground italic">
        Chữ ký sẽ được thu thập trên bản in.
      </p>
    </div>
  )
}
