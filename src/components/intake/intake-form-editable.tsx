import { useState } from "react"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon, Megaphone01Icon } from "@hugeicons/core-free-icons"
import type { Patient } from "@/data/mock-patients"
import type { IntakeFormData } from "@/components/receptionist/intake-form"
import { IntakeSectionPersonal } from "@/components/receptionist/intake-section-personal"
import { IntakeSectionReferral } from "@/components/receptionist/intake-section-referral"

interface IntakeFormEditableProps {
  patient: Patient
  onSave: (data: Partial<Patient>) => void
  onCancel: () => void
}

const SECTIONS = [
  {
    id: "personal",
    num: "I",
    title: "Thông tin cá nhân",
    icon: UserAdd01Icon,
  },
  {
    id: "referral",
    num: "VII",
    title: "Nguồn thông tin về phòng khám",
    icon: Megaphone01Icon,
  },
]

function buildInitialForm(patient: Patient): IntakeFormData {
  return {
    name: patient.name ?? "",
    gender: patient.gender ?? "",
    dob: patient.dob ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    address: patient.address ?? "",
    district: patient.district ?? "",
    cityProvince: patient.cityProvince ?? patient.city ?? "",
    occupation: patient.occupation ?? "",
    cccd: patient.cccd ?? "",
    emergencyContactName: patient.emergencyContact?.name ?? "",
    emergencyContactPhone: patient.emergencyContact?.phone ?? "",
    emergencyContactRelationship:
      patient.emergencyContact?.relationship ?? "",
    referralSource: patient.referralSource ?? "",
    referralDetail: patient.referralDetail ?? "",
  }
}

function buildPatientData(form: IntakeFormData): Partial<Patient> {
  return {
    name: form.name.trim(),
    gender: form.gender as Patient["gender"],
    dob: form.dob,
    birthYear: parseInt(form.dob.split("/")[2] ?? "0", 10),
    phone: form.phone,
    email: form.email || undefined,
    address: form.address || undefined,
    district: form.district || undefined,
    cityProvince: form.cityProvince || undefined,
    occupation: form.occupation || undefined,
    cccd: form.cccd || undefined,
    emergencyContact: form.emergencyContactName
      ? {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship,
        }
      : undefined,
    referralSource: form.referralSource || undefined,
    referralDetail: form.referralDetail || undefined,
  }
}

export function IntakeFormEditable({
  patient,
  onSave,
  onCancel,
}: IntakeFormEditableProps) {
  const [form, setForm] = useState<IntakeFormData>(() =>
    buildInitialForm(patient)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField(field: string, value: unknown) {
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
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    onSave(buildPatientData(form))
  }

  function renderFieldError(field: string) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  const sectionComponents: Record<string, React.ReactNode> = {
    personal: (
      <IntakeSectionPersonal
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
      />
    ),
    referral: (
      <IntakeSectionReferral
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-8 overflow-y-auto">
        {SECTIONS.map((section) => (
          <section key={section.id}>
            <div className="mb-1.5 flex items-center gap-2">
              <HugeiconsIcon
                icon={section.icon}
                className="size-5"
                strokeWidth={1.5}
              />
              <h2 className="text-lg font-bold">
                {section.num}. {section.title}
              </h2>
            </div>
            <div className="mb-5 border-t border-border" />
            {sectionComponents[section.id]}
          </section>
        ))}
      </div>

      {/* Footer */}
      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-popover pt-4 pb-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={handleSave}>Lưu</Button>
      </div>
    </div>
  )
}
