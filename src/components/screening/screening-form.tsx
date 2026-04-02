import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient, Visit, ScreeningFormData } from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningStepIndicator } from "./screening-step-indicator"
import { ScreeningFormInitial } from "./screening-form-initial"
import { ScreeningFormRedFlags } from "./screening-form-red-flags"
import { ScreeningFormQuestions } from "./screening-form-questions"
import { ScreeningFormNotes } from "./screening-form-notes"

interface ScreeningFormProps {
  patient: Patient
  visit: Visit
}

const INITIAL_FORM: ScreeningFormData = {
  chiefComplaint: "",
  ucvaOd: "",
  ucvaOs: "",
  currentRxOd: "",
  currentRxOs: "",
  redFlags: {
    eyePain: false,
    suddenVisionLoss: false,
    asymmetry: false,
  },
  symptoms: {
    dryEyes: false,
    gritty: false,
    blurry: false,
    tearing: false,
    itchy: false,
    headache: false,
  },
  blinkImprovement: null,
  symptomDuration: 0,
  symptomDurationUnit: "ngày",
  screenTime: "",
  contactLens: null,
  discomfortLevel: null,
  notes: "",
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveScreeningData, updateVisitStatus } = useReceptionist()

  const [form, setForm] = useState<ScreeningFormData>(
    visit.screeningData ?? INITIAL_FORM
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  function updateField<K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.chiefComplaint.trim())
      errs.chiefComplaint = "Vui lòng nhập lý do đến khám"
    if (!form.ucvaOd.trim()) errs.ucvaOd = "Vui lòng nhập thị lực mắt phải"
    if (!form.ucvaOs.trim()) errs.ucvaOs = "Vui lòng nhập thị lực mắt trái"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?"
      )
      if (!confirmed) return
    }
    navigate("/screening")
  }

  function handleSaveDraft() {
    saveScreeningData(visit.id, form)
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleContinue() {
    if (!validate()) return
    saveScreeningData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.success("Hoàn thành sàng lọc")
  }

  function handleFastTrack() {
    saveScreeningData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.warning("Đã chuyển bệnh nhân đến bác sĩ (Red Flag)")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
      <ScreeningStepIndicator currentStep={1} />

      <ScreeningFormInitial
        form={form}
        errors={errors}
        onUpdate={updateField}
      />
      <ScreeningFormRedFlags
        form={form}
        onUpdate={updateField}
        onFastTrack={handleFastTrack}
      />
      <ScreeningFormQuestions form={form} onUpdate={updateField} />
      <ScreeningFormNotes form={form} onUpdate={updateField} />

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button onClick={handleContinue}>Tiếp tục →</Button>
        </div>
      </div>
    </div>
  )
}
