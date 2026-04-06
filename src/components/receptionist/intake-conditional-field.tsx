import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConditionalFieldProps {
  show: boolean
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}

export function ConditionalField({
  show,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: ConditionalFieldProps) {
  if (!show) return null

  return (
    <div className="mt-2">
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1"
      />
    </div>
  )
}
