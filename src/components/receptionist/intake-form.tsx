import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Megaphone01Icon,
  PrinterIcon,
  Share01Icon,
} from "@hugeicons/core-free-icons"
import { IntakeSectionPersonal } from "./intake-section-personal"
import { IntakeSectionReferral } from "./intake-section-referral"
import { IntakePrintView } from "./intake-print-view"
import { IntakeShareModal } from "./intake-share-modal"

export interface IntakeFormData {
  // Section I — Personal Info
  name: string
  gender: string
  dob: string
  phone: string
  email: string
  address: string
  district: string
  cityProvince: string
  occupation: string
  cccd: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  // Section VII — Referral
  referralSource: string
  referralDetail: string
}

function buildInitialForm(patient?: Patient): IntakeFormData {
  return {
    name: patient?.name ?? "",
    gender: patient?.gender ?? "",
    dob: patient?.dob ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    district: patient?.district ?? "",
    cityProvince: patient?.cityProvince ?? patient?.city ?? "",
    occupation: patient?.occupation ?? "",
    cccd: patient?.cccd ?? "",
    emergencyContactName: patient?.emergencyContact?.name ?? "",
    emergencyContactPhone: patient?.emergencyContact?.phone ?? "",
    emergencyContactRelationship: patient?.emergencyContact?.relationship ?? "",
    referralSource: patient?.referralSource ?? "",
    referralDetail: patient?.referralDetail ?? "",
  }
}

interface IntakeFormProps {
  patient?: Patient
}

const SECTIONS = [
  { id: "personal", num: "I", title: "Thông tin cá nhân", icon: UserAdd01Icon },
  {
    id: "referral",
    num: "VII",
    title: "Nguồn thông tin về phòng khám",
    icon: Megaphone01Icon,
  },
]

export function IntakeForm({ patient }: IntakeFormProps) {
  const navigate = useNavigate()
  const { addPatient, updatePatient, searchPatients } = useReceptionist()

  const [form, setForm] = useState<IntakeFormData>(() =>
    buildInitialForm(patient)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPrint, setShowPrint] = useState(false)
  const [showShare, setShowShare] = useState(false)

  const duplicatePatient =
    form.phone.length >= 10 && !patient
      ? searchPatients(form.phone).find((p) => p.phone === form.phone)
      : undefined

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

  function handleSave(goToScreening = false) {
    if (!validate()) return

    const data: Omit<Patient, "id" | "createdAt"> &
      Partial<Pick<Patient, "id" | "createdAt">> = {
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
      type: "kham_benh" as const,
      activeStatus: "hoat_dong" as const,
    }

    if (patient) {
      updatePatient(patient.id, data)
    } else {
      addPatient(data as Omit<Patient, "id" | "createdAt">)
    }

    if (goToScreening) {
      setShowShare(true)
    } else {
      navigate("/intake")
    }
  }

  function renderFieldError(field: string) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  const duplicateWarning = duplicatePatient ? (
    <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
      <span>
        SĐT <strong>{form.phone}</strong> đã tồn tại — BN:{" "}
        <strong>{duplicatePatient.name}</strong> ({duplicatePatient.birthYear})
      </span>
      <button
        className="font-semibold text-primary hover:underline"
        onClick={() => navigate(`/intake/${duplicatePatient!.id}/edit`)}
      >
        Mở hồ sơ cũ
      </button>
    </div>
  ) : null

  const sectionComponents: Record<string, React.ReactNode> = {
    personal: (
      <IntakeSectionPersonal
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
        duplicateWarning={duplicateWarning}
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
    <div className="mx-auto max-w-4xl space-y-8 p-6">
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

      {/* Footer actions */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background pt-4 pb-2">
        <Button variant="outline" onClick={() => navigate("/intake")}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowShare(true)}>
            <HugeiconsIcon
              icon={Share01Icon}
              className="mr-1.5 size-4"
              strokeWidth={1.5}
            />
            Gửi cho BN
          </Button>
          <Dialog open={showPrint} onOpenChange={setShowPrint}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HugeiconsIcon
                  icon={PrinterIcon}
                  className="mr-1.5 size-4"
                  strokeWidth={1.5}
                />
                In phiếu
              </Button>
            </DialogTrigger>
            <DialogContent className="h-[95vh] sm:max-w-[67.2vh] overflow-y-auto">
              <IntakePrintView data={form} patientId={patient?.id} />
              <div className="flex justify-end gap-2 border-t pt-4 print:hidden">
                <Button variant="outline" onClick={() => setShowPrint(false)}>
                  Đóng
                </Button>
                <Button onClick={() => window.print()}>
                  <HugeiconsIcon
                    icon={PrinterIcon}
                    className="mr-1.5 size-4"
                    strokeWidth={1.5}
                  />
                  In
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => handleSave(false)}>
            Lưu
          </Button>
          <Button onClick={() => handleSave(true)}>Lưu & Sàng lọc →</Button>
        </div>
      </div>

      <IntakeShareModal
        open={showShare}
        onOpenChange={(open) => {
          setShowShare(open)
          if (!open && form.name) {
            navigate("/screening")
          }
        }}
        patientName={form.name || undefined}
        patientId={patient?.id}
      />

    </div>
  )
}
