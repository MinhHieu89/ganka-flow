import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  Visit,
  ScreeningFormData,
  DiseaseGroup,
  DryEyeFormData,
  Step2FormData,
} from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningStepIndicator } from "./screening-step-indicator"
import { ScreeningFormInitial } from "./screening-form-initial"
import { ScreeningFormRedFlags } from "./screening-form-red-flags"
import { ScreeningFormQuestions } from "./screening-form-questions"
import { ScreeningFormNotes } from "./screening-form-notes"
import { ScreeningStep2Summary } from "./screening-step2-summary"
import { ScreeningStep2GroupSelector } from "./screening-step2-group-selector"
import { ScreeningStep2GroupForm } from "./screening-step2-group-form"

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

const INITIAL_DRY_EYE: DryEyeFormData = {
  osdiScore: null,
  osdiAnswers: [null, null, null, null, null, null],
  osdiSeverity: null,
  tbutOd: "",
  tbutOs: "",
  schirmerOd: "",
  schirmerOs: "",
  meibomian: "",
  staining: "",
}

const INITIAL_STEP2: Step2FormData = {
  selectedGroups: [],
  groupOrder: [],
  dryEye: INITIAL_DRY_EYE,
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveScreeningData, updateVisitStatus } = useReceptionist()

  const [form, setForm] = useState<ScreeningFormData>(
    visit.screeningData ?? INITIAL_FORM
  )
  const [step2, setStep2] = useState<Step2FormData>(
    visit.screeningData?.step2 ?? INITIAL_STEP2
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Determine initial step: if step2 data exists, start on step 2
  const [currentStep, setCurrentStep] = useState<1 | 2>(
    visit.screeningData?.step2 ? 2 : 1
  )

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  function getFullData(): ScreeningFormData {
    return { ...form, step2 }
  }

  // --- Step 1 handlers ---

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
    saveScreeningData(visit.id, getFullData())
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleContinueToStep2() {
    if (!validate()) return
    saveScreeningData(visit.id, getFullData())
    setCurrentStep(2)
  }

  function handleFastTrack() {
    saveScreeningData(visit.id, getFullData())
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.warning("Đã chuyển bệnh nhân đến bác sĩ (Red Flag)")
  }

  // --- Step 2 handlers ---

  function handleBackToStep1() {
    setCurrentStep(1)
  }

  function handleStep2SaveDraft() {
    saveScreeningData(visit.id, getFullData())
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleComplete() {
    saveScreeningData(visit.id, getFullData())
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.success("Hoàn thành sàng lọc — chờ bác sĩ khám")
  }

  function toggleGroup(group: DiseaseGroup) {
    setStep2((prev) => {
      const isSelected = prev.selectedGroups.includes(group)
      if (isSelected) {
        return {
          ...prev,
          selectedGroups: prev.selectedGroups.filter((g) => g !== group),
          groupOrder: prev.groupOrder.filter((g) => g !== group),
        }
      }
      return {
        ...prev,
        selectedGroups: [...prev.selectedGroups, group],
        groupOrder: [...prev.groupOrder, group],
      }
    })
    setIsDirty(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStep2((prev) => {
        const oldIndex = prev.groupOrder.indexOf(active.id as DiseaseGroup)
        const newIndex = prev.groupOrder.indexOf(over.id as DiseaseGroup)
        return {
          ...prev,
          groupOrder: arrayMove(prev.groupOrder, oldIndex, newIndex),
        }
      })
      setIsDirty(true)
    }
  }

  function handleDryEyeUpdate(data: DryEyeFormData) {
    setStep2((prev) => ({ ...prev, dryEye: data }))
    setIsDirty(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
      <ScreeningStepIndicator currentStep={currentStep} />

      {currentStep === 1 ? (
        <>
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

          {/* Step 1 Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleContinueToStep2}>Tiếp tục →</Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <ScreeningStep2Summary form={form} />
          <ScreeningStep2GroupSelector
            selectedGroups={step2.selectedGroups}
            onToggle={toggleGroup}
          />

          {/* Sortable group forms */}
          {step2.groupOrder.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={step2.groupOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {step2.groupOrder.map((group) => (
                    <ScreeningStep2GroupForm
                      key={group}
                      group={group}
                      dryEyeData={step2.dryEye}
                      onDryEyeUpdate={handleDryEyeUpdate}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Step 2 Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={handleBackToStep1}>
              ← Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleStep2SaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleComplete}>Hoàn thành →</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
