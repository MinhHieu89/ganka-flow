import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { IntakeDatePicker } from "./intake-date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
  renderFieldError: (field: string) => React.ReactNode
  duplicateWarning?: React.ReactNode
}

export function IntakeSectionPersonal({
  data,
  errors,
  onChange,
  renderFieldError,
  duplicateWarning,
}: Props) {
  const relationshipOptions = useMasterDataOptions("relationships").map(
    (i) => ({
      value: i.key,
      label: i.label,
    })
  )

  return (
    <div className="space-y-4">
      {/* Row 1: Name + Gender */}
      <div className="grid grid-cols-[2.5fr_1fr] gap-6">
        <div>
          <Label>
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nhập họ và tên đầy đủ"
            maxLength={100}
            aria-invalid={!!errors.name}
          />
          {renderFieldError("name")}
        </div>
        <div>
          <Label>
            Giới tính <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.gender}
            onValueChange={(v) => onChange("gender", v)}
          >
            <SelectTrigger className="w-full" aria-invalid={!!errors.gender}>
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Nữ">Nữ</SelectItem>
              <SelectItem value="Khác">Khác</SelectItem>
            </SelectContent>
          </Select>
          {renderFieldError("gender")}
        </div>
      </div>

      {/* Row 2: DOB + Phone + Email */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label>
            Ngày sinh <span className="text-destructive">*</span>
          </Label>
          <IntakeDatePicker
            value={data.dob}
            onChange={(v) => onChange("dob", v)}
            placeholder="Chọn ngày sinh"
            ariaInvalid={!!errors.dob}
          />
          {renderFieldError("dob")}
        </div>
        <div>
          <Label>
            Số điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            aria-invalid={!!errors.phone}
          />
          {renderFieldError("phone")}
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            type="email"
            aria-invalid={!!errors.email}
          />
          {renderFieldError("email")}
        </div>
      </div>

      {/* Duplicate warning */}
      {duplicateWarning}

      {/* Row 3: CCCD */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Số CMND/CCCD</Label>
          <Input
            value={data.cccd}
            onChange={(e) => onChange("cccd", e.target.value)}
          />
        </div>
        <div>
          <Label>Nghề nghiệp</Label>
          <Input
            value={data.occupation}
            onChange={(e) => onChange("occupation", e.target.value)}
            placeholder="VD: Nhân viên văn phòng"
            maxLength={100}
          />
        </div>
      </div>

      {/* Row 4: Address */}
      <div>
        <Label>Địa chỉ</Label>
        <Input
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Row 5: District + City/Province */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Quận/Huyện</Label>
          <Input
            value={data.district}
            onChange={(e) => onChange("district", e.target.value)}
          />
        </div>
        <div>
          <Label>Thành phố/Tỉnh</Label>
          <Input
            value={data.cityProvince}
            onChange={(e) => onChange("cityProvince", e.target.value)}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <Label className="mb-2 block font-medium">
          Người liên hệ khẩn cấp
        </Label>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label>Họ tên</Label>
            <Input
              value={data.emergencyContactName}
              onChange={(e) => onChange("emergencyContactName", e.target.value)}
            />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={data.emergencyContactPhone}
              onChange={(e) =>
                onChange("emergencyContactPhone", e.target.value)
              }
            />
          </div>
          <div>
            <Label>Quan hệ</Label>
            <Select
              value={data.emergencyContactRelationship}
              onValueChange={(v) => onChange("emergencyContactRelationship", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn..." />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
