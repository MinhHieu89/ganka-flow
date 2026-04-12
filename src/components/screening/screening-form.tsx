import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  Visit,
  RefractionFormData,
  RefractionEyeRow,
  RefractionEyeRowWithAdd,
  SubjectiveEyeRow,
} from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningHistoryPanel } from "./screening-history-panel"
import { ScreeningIntakeSummary } from "./screening-intake-summary"
import { ScreeningChiefComplaint } from "./screening-chief-complaint"
import { RefractionTable } from "./screening-refraction-table"
import { ScreeningCycloplegicSection } from "./screening-cycloplegic-section"
import { ScreeningOtherTestCard } from "./screening-other-test-card"
import { ScreeningGlassesRxSection } from "./screening-glasses-rx-section"
import { IntakeShareModal } from "../receptionist/intake-share-modal"

interface ScreeningFormProps {
  patient: Patient
  visit: Visit
}

const EMPTY_EYE_ROW: RefractionEyeRow = { sph: "", cyl: "", axis: "", va: "" }
const EMPTY_EYE_ROW_ADD: RefractionEyeRowWithAdd = { ...EMPTY_EYE_ROW, add: "" }
const EMPTY_SUBJECTIVE: SubjectiveEyeRow = { ...EMPTY_EYE_ROW_ADD, vaNear: "" }

const INITIAL_FORM: RefractionFormData = {
  currentGlasses: { od: { ...EMPTY_EYE_ROW_ADD }, os: { ...EMPTY_EYE_ROW_ADD } },
  objective: { od: { ...EMPTY_EYE_ROW }, os: { ...EMPTY_EYE_ROW } },
  subjective: { od: { ...EMPTY_SUBJECTIVE }, os: { ...EMPTY_SUBJECTIVE } },
  cycloplegicEnabled: false,
  cycloplegicAgent: [],
  cycloplegic: { od: { ...EMPTY_EYE_ROW }, os: { ...EMPTY_EYE_ROW } },
  retinoscopy: { od: "", os: "" },
  iop: { od: "", os: "" },
  axialLength: { od: "", os: "" },
  glassesRxEnabled: false,
  glassesRx: {
    od: { ...EMPTY_EYE_ROW_ADD },
    os: { ...EMPTY_EYE_ROW_ADD },
    pd: "",
    lensType: "",
    purpose: "",
    notes: "",
  },
  notes: "",
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveRefractionData, updateVisitStatus, updatePatient } =
    useReceptionist()

  const [form, setForm] = useState<RefractionFormData>(
    visit.refractionData ?? INITIAL_FORM
  )
  const [isDirty, setIsDirty] = useState(false)
  const [showQr, setShowQr] = useState(false)

  function update(patch: Partial<RefractionFormData>) {
    setForm((prev) => ({ ...prev, ...patch }))
    setIsDirty(true)
  }

  function updateEyeSection<
    S extends "currentGlasses" | "objective" | "subjective" | "cycloplegic",
  >(section: S, eye: "od" | "os", field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [eye]: {
          ...(prev[section][eye] as unknown as Record<string, string>),
          [field]: value,
        },
      },
    }))
    setIsDirty(true)
  }

  function updateOdOs(
    section: "retinoscopy" | "iop" | "axialLength",
    eye: "od" | "os",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [eye]: value },
    }))
    setIsDirty(true)
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
    saveRefractionData(visit.id, form)
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleComplete() {
    saveRefractionData(visit.id, form)
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.success("Hoàn thành khám khúc xạ — chờ bác sĩ khám")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
      <ScreeningHistoryPanel
        patient={patient}
        visit={visit}
        onShowQr={() => setShowQr(true)}
      />
      <IntakeShareModal
        open={showQr}
        onOpenChange={setShowQr}
        patientName={patient.name}
        patientId={patient.id}
        visitId={visit.id}
      />

      {/* Intake Summary */}
      <ScreeningIntakeSummary
        patient={patient}
        onPatientUpdate={(data) => updatePatient(patient.id, data)}
      />

      {/* Chief Complaint */}
      <ScreeningChiefComplaint
        patient={patient}
        onPatientUpdate={(data) => updatePatient(patient.id, data)}
      />

      {/* Kính cũ */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Kính cũ</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.currentGlasses.od}
            osData={form.currentGlasses.os}
            columns={["sph", "cyl", "axis", "va", "add"]}
            onOdChange={(f, v) => updateEyeSection("currentGlasses", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("currentGlasses", "os", f, v)}
          />
        </div>
      </section>

      {/* Khúc xạ khách quan */}
      <section className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <span className="text-sm font-semibold">Khúc xạ khách quan</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
            Chỉ lưu trữ
          </span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.objective.od}
            osData={form.objective.os}
            columns={["sph", "cyl", "axis", "va"]}
            onOdChange={(f, v) => updateEyeSection("objective", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("objective", "os", f, v)}
          />
        </div>
      </section>

      {/* Khúc xạ chủ quan */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Khúc xạ chủ quan</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <RefractionTable
            odData={form.subjective.od}
            osData={form.subjective.os}
            columns={["sph", "cyl", "axis", "va", "add", "vaNear"]}
            onOdChange={(f, v) => updateEyeSection("subjective", "od", f, v)}
            onOsChange={(f, v) => updateEyeSection("subjective", "os", f, v)}
          />
        </div>
      </section>

      {/* Liệt điều tiết */}
      <ScreeningCycloplegicSection
        enabled={form.cycloplegicEnabled}
        onEnabledChange={(v) => update({ cycloplegicEnabled: v })}
        agents={form.cycloplegicAgent}
        onAgentsChange={(v) => update({ cycloplegicAgent: v })}
        od={form.cycloplegic.od}
        os={form.cycloplegic.os}
        onOdChange={(f, v) => updateEyeSection("cycloplegic", "od", f, v)}
        onOsChange={(f, v) => updateEyeSection("cycloplegic", "os", f, v)}
      />

      {/* Soi bóng đồng tử */}
      <ScreeningOtherTestCard
        title="Soi bóng đồng tử"
        odValue={form.retinoscopy.od}
        osValue={form.retinoscopy.os}
        onOdChange={(v) => updateOdOs("retinoscopy", "od", v)}
        onOsChange={(v) => updateOdOs("retinoscopy", "os", v)}
      />

      {/* Nhãn áp */}
      <ScreeningOtherTestCard
        title="Nhãn áp"
        odValue={form.iop.od}
        osValue={form.iop.os}
        onOdChange={(v) => updateOdOs("iop", "od", v)}
        onOsChange={(v) => updateOdOs("iop", "os", v)}
      />

      {/* Trục nhãn cầu */}
      <ScreeningOtherTestCard
        title="Trục nhãn cầu"
        odValue={form.axialLength.od}
        osValue={form.axialLength.os}
        onOdChange={(v) => updateOdOs("axialLength", "od", v)}
        onOsChange={(v) => updateOdOs("axialLength", "os", v)}
      />

      {/* Đơn kính */}
      <ScreeningGlassesRxSection
        enabled={form.glassesRxEnabled}
        onEnabledChange={(v) => update({ glassesRxEnabled: v })}
        data={form.glassesRx}
        onDataChange={(v) => update({ glassesRx: v })}
        subjectiveOd={form.subjective.od}
        subjectiveOs={form.subjective.os}
      />

      {/* Ghi chú */}
      <section className="rounded-lg border border-border bg-background">
        <div className="px-3.5 py-2.5">
          <span className="text-sm font-semibold">Ghi chú</span>
        </div>
        <div className="border-t border-border px-3.5 py-3">
          <Textarea
            value={form.notes}
            onChange={(e) => update({ notes: e.target.value })}
            placeholder="Ghi chú thêm nếu cần..."
            rows={3}
            className="text-xs"
          />
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            Lưu nháp
          </Button>
          <Button onClick={handleComplete}>Hoàn thành →</Button>
        </div>
      </div>
    </div>
  )
}
