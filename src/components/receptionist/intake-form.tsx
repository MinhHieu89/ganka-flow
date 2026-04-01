import { useState } from "react"
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Clock01Icon,
  PlusSignCircleIcon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons"

interface IntakeFormProps {
  patient?: Patient
  autoCheckIn?: boolean
}

export function IntakeForm({ patient, autoCheckIn }: IntakeFormProps) {
  const navigate = useNavigate()
  const { addPatient, updatePatient, searchPatients } = useReceptionist()

  const [form, setForm] = useState({
    name: patient?.name ?? "",
    gender: patient?.gender ?? "",
    dob: patient?.dob ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    occupation: patient?.occupation ?? "",
    cccd: patient?.cccd ?? "",
    chiefComplaint: patient?.chiefComplaint ?? "",
    eyeHistory: patient?.eyeHistory ?? "",
    systemicHistory: patient?.systemicHistory ?? "",
    currentMedications: patient?.currentMedications ?? "",
    allergies: patient?.allergies ?? "",
    screenTime: patient?.screenTime?.toString() ?? "",
    workEnvironment: patient?.workEnvironment ?? "",
    contactLens: patient?.contactLens ?? "",
    lifestyleNotes: patient?.lifestyleNotes ?? "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Duplicate phone check
  const duplicatePatient =
    form.phone.length >= 10 && !patient
      ? searchPatients(form.phone).find((p) => p.phone === form.phone)
      : undefined

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Trường này không được bỏ trống"
    if (!form.gender) errs.gender = "Trường này không được bỏ trống"
    if (!form.dob) errs.dob = "Trường này không được bỏ trống"
    if (!form.phone) {
      errs.phone = "Trường này không được bỏ trống"
    } else if (!/^0\d{9,10}$/.test(form.phone)) {
      errs.phone = "SĐT phải có 10–11 số và bắt đầu bằng 0"
    }
    if (!form.chiefComplaint.trim())
      errs.chiefComplaint = "Trường này không được bỏ trống"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave(goToPreExam = false) {
    if (!validate()) return

    const data = {
      name: form.name.trim(),
      gender: form.gender as Patient["gender"],
      dob: form.dob,
      birthYear: parseInt(form.dob.split("/")[2] ?? "0", 10),
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      occupation: form.occupation || undefined,
      cccd: form.cccd || undefined,
      chiefComplaint: form.chiefComplaint.trim(),
      eyeHistory: form.eyeHistory || undefined,
      systemicHistory: form.systemicHistory || undefined,
      currentMedications: form.currentMedications || undefined,
      allergies: form.allergies || undefined,
      screenTime: form.screenTime ? Number(form.screenTime) : undefined,
      workEnvironment: form.workEnvironment || undefined,
      contactLens: form.contactLens || undefined,
      lifestyleNotes: form.lifestyleNotes || undefined,
    }

    if (patient) {
      updatePatient(patient.id, data)
    } else {
      addPatient(data)
    }

    if (goToPreExam) {
      // Future: navigate to pre-exam
      navigate("/intake")
    } else {
      navigate("/intake")
    }
  }

  function FieldError({ field }: { field: string }) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6">
      {/* Section 1: Thông tin cá nhân */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={UserAdd01Icon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Thông tin cá nhân</h2>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          {/* Row 1: Name + Gender */}
          <div className="grid grid-cols-[2.5fr_1fr] gap-6">
            <div>
              <Label>
                Họ và tên <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Nhập họ và tên đầy đủ"
                maxLength={100}
                aria-invalid={!!errors.name}
              />
              <FieldError field="name" />
            </div>
            <div>
              <Label>
                Giới tính <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.gender}
                onValueChange={(v) => updateField("gender", v)}
              >
                <SelectTrigger aria-invalid={!!errors.gender}>
                  <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
              <FieldError field="gender" />
            </div>
          </div>

          {/* Row 2: DOB + Phone + Email */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label>
                Ngày sinh <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.dob}
                onChange={(e) => updateField("dob", e.target.value)}
                placeholder="dd/mm/yyyy"
                aria-invalid={!!errors.dob}
              />
              <FieldError field="dob" />
            </div>
            <div>
              <Label>
                Số điện thoại <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                aria-invalid={!!errors.phone}
              />
              <FieldError field="phone" />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                type="email"
                aria-invalid={!!errors.email}
              />
              <FieldError field="email" />
            </div>
          </div>

          {/* Duplicate warning */}
          {duplicatePatient && (
            <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <span>
                ⚠ SĐT <strong>{form.phone}</strong> đã tồn tại — BN:{" "}
                <strong>{duplicatePatient.name}</strong> (
                {duplicatePatient.birthYear})
              </span>
              <button
                className="font-semibold text-primary hover:underline"
                onClick={() =>
                  navigate(`/intake/${duplicatePatient!.id}/edit`)
                }
              >
                Mở hồ sơ cũ
              </button>
            </div>
          )}

          {/* Row 3: Address */}
          <div>
            <Label>Địa chỉ</Label>
            <Input
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Row 4: Occupation + CCCD */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Nghề nghiệp</Label>
              <Input
                value={form.occupation}
                onChange={(e) => updateField("occupation", e.target.value)}
                placeholder="VD: Nhân viên văn phòng"
                maxLength={100}
              />
            </div>
            <div>
              <Label>Số CCCD</Label>
              <Input
                value={form.cccd}
                onChange={(e) => updateField("cccd", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Thông tin khám */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={Clock01Icon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Thông tin khám</h2>
        </div>
        <div className="mb-5 border-t border-border" />

        <div>
          <Label>
            Lý do đến khám <span className="text-destructive">*</span>
          </Label>
          <Textarea
            value={form.chiefComplaint}
            onChange={(e) =>
              updateField(
                "chiefComplaint",
                e.target.value.slice(0, 500)
              )
            }
            placeholder="Mô tả lý do bệnh nhân đến khám. VD: Mắt khô rát 2 tuần, nhìn mờ khi dùng máy tính..."
            rows={3}
            aria-invalid={!!errors.chiefComplaint}
          />
          <div className="mt-1 flex justify-between">
            <span className="text-xs italic text-muted-foreground">
              Tối đa 500 ký tự. Ghi rõ triệu chứng, thời gian, mức độ nếu BN
              cung cấp.
            </span>
            <span className="text-xs text-muted-foreground">
              {form.chiefComplaint.length}/500
            </span>
          </div>
          <FieldError field="chiefComplaint" />
        </div>
      </section>

      {/* Section 3: Tiền sử bệnh */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={PlusSignCircleIcon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Tiền sử bệnh</h2>
          <span className="text-sm text-muted-foreground">(tùy chọn)</span>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Tiền sử bệnh mắt</Label>
              <Textarea
                value={form.eyeHistory}
                onChange={(e) => updateField("eyeHistory", e.target.value)}
                placeholder="VD: Cận thị từ nhỏ, đã Lasik 2020..."
                rows={3}
              />
            </div>
            <div>
              <Label>Tiền sử bệnh toàn thân</Label>
              <Textarea
                value={form.systemicHistory}
                onChange={(e) =>
                  updateField("systemicHistory", e.target.value)
                }
                placeholder="VD: Tiểu đường type 2, cao huyết áp..."
                rows={3}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Thuốc đang dùng</Label>
              <Input
                value={form.currentMedications}
                onChange={(e) =>
                  updateField("currentMedications", e.target.value)
                }
                placeholder="VD: Metformin 500mg, Amlodipine 5mg..."
              />
            </div>
            <div>
              <Label>Dị ứng</Label>
              <Input
                value={form.allergies}
                onChange={(e) => updateField("allergies", e.target.value)}
                placeholder="VD: Penicillin, phấn hoa, hải sản..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Lối sống */}
      <section>
        <div className="mb-1.5 flex items-center gap-2">
          <HugeiconsIcon icon={TimeQuarterPassIcon} className="size-5" strokeWidth={1.5} />
          <h2 className="text-lg font-bold">Lối sống</h2>
          <span className="text-sm text-muted-foreground">(tùy chọn)</span>
        </div>
        <div className="mb-5 border-t border-border" />

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label>Thời gian sử dụng màn hình (giờ/ngày)</Label>
              <Input
                value={form.screenTime}
                onChange={(e) => updateField("screenTime", e.target.value)}
                placeholder="VD: 8"
                type="number"
                min={0}
                max={24}
              />
            </div>
            <div>
              <Label>Môi trường làm việc</Label>
              <Select
                value={form.workEnvironment}
                onValueChange={(v) => updateField("workEnvironment", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Văn phòng">Văn phòng</SelectItem>
                  <SelectItem value="Ngoài trời">Ngoài trời</SelectItem>
                  <SelectItem value="Nhà máy">Nhà máy</SelectItem>
                  <SelectItem value="Khác">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sử dụng kính áp tròng</Label>
              <Select
                value={form.contactLens}
                onValueChange={(v) => updateField("contactLens", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Không">Không</SelectItem>
                  <SelectItem value="Hàng ngày">Hàng ngày</SelectItem>
                  <SelectItem value="Thỉnh thoảng">Thỉnh thoảng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Ghi chú khác về lối sống</Label>
            <Input
              value={form.lifestyleNotes}
              onChange={(e) => updateField("lifestyleNotes", e.target.value)}
              placeholder="VD: Hay bơi lội, thường xuyên lái xe đêm, dùng thuốc nhỏ mắt hàng ngày..."
              maxLength={300}
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={() => navigate("/intake")}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)}>
            Lưu
          </Button>
          <Button onClick={() => handleSave(true)}>
            Lưu & chuyển Pre-Exam →
          </Button>
        </div>
      </div>
    </div>
  )
}
