import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { DiagnosisInput } from "@/components/doctor/diagnosis-input"
import type {
  ExamData,
  PreviousVisit,
  SlitLampEye,
  FundusEye,
  Medication,
  NewOpticalRx,
  NewFollowUp,
} from "@/data/mock-patients"
import {
  FREQUENCY_OPTIONS,
  DURATION_OPTIONS,
  EYE_OPTIONS,
  LENS_TYPE_OPTIONS,
  FOLLOW_UP_INTERVALS,
} from "@/data/mock-patients"

interface TabExamProps {
  examData: ExamData
  onChange: (data: ExamData) => void
  previousVisit?: PreviousVisit
}

const EMPTY_MEDICATION: Medication = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  eye: "",
}

const EMPTY_OPTICAL_RX: NewOpticalRx = {
  od: { sph: "", cyl: "", axis: "", add: "" },
  os: { sph: "", cyl: "", axis: "", add: "" },
  pd: "",
  lensType: "",
  notes: "",
}

const EMPTY_FOLLOW_UP: NewFollowUp = {
  interval: "",
  date: "",
  doctor: "",
  instructions: "",
}

// --- Sub-components ---

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
      {children}
    </h3>
  )
}

function EyeCard({
  eye,
  color,
  children,
}: {
  eye: "OD" | "OS"
  color: string
  children: React.ReactNode
}) {
  return (
    <div className="flex-1 space-y-4 rounded-lg border p-5">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold">{eye}</span>
      </div>
      {children}
    </div>
  )
}

function FieldRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="w-32 shrink-0 text-sm text-muted-foreground">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function SlitLampFields({
  data,
  onChange,
}: {
  data: SlitLampEye
  onChange: (d: SlitLampEye) => void
}) {
  const fields: { key: keyof Omit<SlitLampEye, "notes">; label: string }[] = [
    { key: "lids", label: "Mi mắt (Lids)" },
    { key: "conjunctiva", label: "Kết mạc (Conjunctiva)" },
    { key: "cornea", label: "Giác mạc (Cornea)" },
    { key: "anteriorChamber", label: "Tiền phòng (AC)" },
    { key: "iris", label: "Mống mắt (Iris)" },
    { key: "lens", label: "Thể thủy tinh (Lens)" },
  ]

  return (
    <div className="space-y-2.5">
      {fields.map((f) => (
        <FieldRow key={f.key} label={f.label}>
          <Input
            value={data[f.key]}
            onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
          />
        </FieldRow>
      ))}
      <FieldRow label="Ghi chú">
        <Textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={2}
        />
      </FieldRow>
    </div>
  )
}

function FundusFields({
  data,
  onChange,
}: {
  data: FundusEye
  onChange: (d: FundusEye) => void
}) {
  const fields: { key: keyof Omit<FundusEye, "notes">; label: string }[] = [
    { key: "opticDisc", label: "Đĩa thị (Optic Disc)" },
    { key: "cdRatio", label: "C/D ratio" },
    { key: "macula", label: "Hoàng điểm (Macula)" },
    { key: "vessels", label: "Mạch máu (Vessels)" },
    { key: "peripheralRetina", label: "Võng mạc ngoại vi" },
  ]

  return (
    <div className="space-y-2.5">
      {fields.map((f) => (
        <FieldRow key={f.key} label={f.label}>
          <Input
            value={data[f.key]}
            onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
          />
        </FieldRow>
      ))}
      <FieldRow label="Ghi chú">
        <Textarea
          value={data.notes}
          onChange={(e) => onChange({ ...data, notes: e.target.value })}
          rows={2}
        />
      </FieldRow>
    </div>
  )
}

function PreviousVisitPanel({
  visit,
  onClose,
}: {
  visit: PreviousVisit
  onClose: () => void
}) {
  return (
    <div className="rounded-lg border border-[#B5D4F4] bg-[#F8FBFE] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">
          {visit.date} — {visit.doctorName}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={16} />
        </button>
      </div>
      <div className="space-y-2 text-sm">
        {visit.diagnoses.length > 0 && (
          <div>
            <span className="font-medium">Chẩn đoán: </span>
            {visit.diagnoses
              .map((d) => `${d.text}${d.icd10Code ? ` (${d.icd10Code})` : ""}`)
              .join(", ")}
          </div>
        )}
        {visit.medications.length > 0 && (
          <div>
            <span className="font-medium">Thuốc: </span>
            {visit.medications
              .map((m) => `${m.name} ${m.dosage} ${m.frequency} (${m.eye})`)
              .join("; ")}
          </div>
        )}
        {visit.instructions && (
          <div>
            <span className="font-medium">Dặn dò: </span>
            {visit.instructions}
          </div>
        )}
      </div>
    </div>
  )
}

function IconCloseButton({
  onClick,
  label = "Xóa",
}: {
  onClick: () => void
  label?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <HugeiconsIcon icon={Cancel01Icon} size={16} />
    </button>
  )
}

function MedicationRow({
  med,
  onChange,
  onRemove,
}: {
  med: Medication
  onChange: (m: Medication) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Input
          value={med.name}
          onChange={(e) => onChange({ ...med, name: e.target.value })}
        />
      </div>
      <div className="w-24">
        <Input
          value={med.dosage}
          onChange={(e) => onChange({ ...med, dosage: e.target.value })}
        />
      </div>
      <div className="w-28">
        <Select
          value={med.frequency}
          onValueChange={(v) => onChange({ ...med, frequency: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tần suất" />
          </SelectTrigger>
          <SelectContent>
            {FREQUENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-24">
        <Select
          value={med.duration}
          onValueChange={(v) => onChange({ ...med, duration: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Thời gian" />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-16">
        <Select
          value={med.eye ?? ""}
          onValueChange={(v) => onChange({ ...med, eye: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Mắt" />
          </SelectTrigger>
          <SelectContent>
            {EYE_OPTIONS.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <IconCloseButton onClick={onRemove} label="Xóa thuốc" />
    </div>
  )
}

function MedicationSection({
  medications,
  onChange,
  onRemoveSection,
}: {
  medications: Medication[]
  onChange: (meds: Medication[]) => void
  onRemoveSection: () => void
}) {
  const updateMed = (idx: number, med: Medication) => {
    const next = [...medications]
    next[idx] = med
    onChange(next)
  }
  const removeMed = (idx: number) => {
    onChange(medications.filter((_, i) => i !== idx))
  }
  const addMed = () => {
    onChange([...medications, { ...EMPTY_MEDICATION }])
  }

  return (
    <div className="rounded-lg border px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>ĐƠN THUỐC</SectionTitle>
        <IconCloseButton onClick={onRemoveSection} label="Đóng đơn thuốc" />
      </div>
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="flex-1">Tên thuốc</div>
          <div className="w-24">Liều</div>
          <div className="w-28">Tần suất</div>
          <div className="w-24">Thời gian</div>
          <div className="w-16">Mắt</div>
          <div className="w-4" />
        </div>
        {medications.map((med, i) => (
          <MedicationRow
            key={i}
            med={med}
            onChange={(m) => updateMed(i, m)}
            onRemove={() => removeMed(i)}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={addMed}
      >
        + Thêm thuốc
      </Button>
    </div>
  )
}

function OpticalRxSection({
  rx,
  onChange,
  onRemoveSection,
}: {
  rx: NewOpticalRx
  onChange: (rx: NewOpticalRx) => void
  onRemoveSection: () => void
}) {
  const renderEyeInputs = (
    eye: "od" | "os",
    label: string,
    color: string,
  ) => {
    const eyeData = rx[eye]
    const updateField = (field: keyof typeof eyeData, value: string) => {
      onChange({ ...rx, [eye]: { ...eyeData, [field]: value } })
    }

    return (
      <div className="flex-1 space-y-2.5 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold">
            {label}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {(["sph", "cyl", "axis", "add"] as const).map((f) => (
            <div key={f}>
              <label className="mb-1 block text-xs text-muted-foreground uppercase">
                {f === "sph" ? "Sph" : f === "cyl" ? "Cyl" : f === "axis" ? "Axis" : "Add"}
              </label>
              <Input
                value={eyeData[f]}
                onChange={(e) => updateField(f, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>ĐƠN KÍNH</SectionTitle>
        <IconCloseButton onClick={onRemoveSection} label="Đóng đơn kính" />
      </div>
      <div className="mb-4 flex gap-5">
        {renderEyeInputs("od", "OD", "#378ADD")}
        {renderEyeInputs("os", "OS", "#D85A30")}
      </div>
      <div className="flex items-center gap-4">
        <div className="w-24">
          <label className="mb-1 block text-xs text-muted-foreground">
            PD (mm)
          </label>
          <Input
            value={rx.pd}
            onChange={(e) => onChange({ ...rx, pd: e.target.value })}
          />
        </div>
        <div className="w-40">
          <label className="mb-1 block text-xs text-muted-foreground">
            Loại kính
          </label>
          <Select
            value={rx.lensType}
            onValueChange={(v) => onChange({ ...rx, lensType: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn loại" />
            </SelectTrigger>
            <SelectContent>
              {LENS_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            Ghi chú
          </label>
          <Input
            value={rx.notes}
            onChange={(e) => onChange({ ...rx, notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}

function computeFollowUpDate(interval: string): string {
  const now = new Date()
  const match = interval.match(/^(\d+)\s+(tuần|tháng|năm)$/)
  if (!match) return ""
  const num = parseInt(match[1], 10)
  const unit = match[2]
  if (unit === "tuần") now.setDate(now.getDate() + num * 7)
  else if (unit === "tháng") now.setMonth(now.getMonth() + num)
  else if (unit === "năm") now.setFullYear(now.getFullYear() + num)
  return now.toISOString().slice(0, 10)
}

function FollowUpSection({
  followUp,
  onChange,
  onRemoveSection,
}: {
  followUp: NewFollowUp
  onChange: (f: NewFollowUp) => void
  onRemoveSection: () => void
}) {
  const handleIntervalChange = (interval: string) => {
    const date = computeFollowUpDate(interval)
    onChange({ ...followUp, interval, date })
  }

  return (
    <div className="rounded-lg border px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <SectionTitle>TÁI KHÁM</SectionTitle>
        <IconCloseButton onClick={onRemoveSection} label="Đóng tái khám" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Tái khám sau
          </label>
          <Select
            value={followUp.interval}
            onValueChange={handleIntervalChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn thời gian" />
            </SelectTrigger>
            <SelectContent>
              {FOLLOW_UP_INTERVALS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Ngày tái khám
          </label>
          <Input
            type="date"
            value={followUp.date}
            onChange={(e) =>
              onChange({ ...followUp, date: e.target.value })
            }
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Bác sĩ
          </label>
          <Select
            value={followUp.doctor}
            onValueChange={(v) =>
              onChange({ ...followUp, doctor: v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn bác sĩ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BS. Nguyễn Hải">
                BS. Nguyễn Hải
              </SelectItem>
              <SelectItem value="BS. Trần Minh">
                BS. Trần Minh
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4">
        <label className="mb-1 block text-xs text-muted-foreground">
          Dặn dò bệnh nhân
        </label>
        <Textarea
          value={followUp.instructions}
          onChange={(e) =>
            onChange({ ...followUp, instructions: e.target.value })
          }
          rows={3}
        />
      </div>
    </div>
  )
}

function ToggleButton({
  active,
  activeLabel,
  inactiveLabel,
  onClick,
}: {
  active: boolean
  activeLabel: string
  inactiveLabel: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "transition-colors",
        active
          ? "border-[#B5D4F4] bg-[#E6F1FB] text-[#0C447C]"
          : "border-dashed border-border text-muted-foreground",
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </Button>
  )
}

// --- Main component ---

export function TabExam({ examData, onChange, previousVisit }: TabExamProps) {
  const [showPrevious, setShowPrevious] = useState(false)
  const [showMedication, setShowMedication] = useState(
    examData.medications.length > 0,
  )
  const [showOptical, setShowOptical] = useState(!!examData.opticalRx)
  const [showFollowUp, setShowFollowUp] = useState(!!examData.followUp)

  const update = (partial: Partial<ExamData>) => {
    onChange({ ...examData, ...partial })
  }

  const updateSlitLampOd = (od: SlitLampEye) =>
    update({ slitLamp: { ...examData.slitLamp, od } })
  const updateSlitLampOs = (os: SlitLampEye) =>
    update({ slitLamp: { ...examData.slitLamp, os } })
  const updateFundusOd = (od: FundusEye) =>
    update({ fundus: { ...examData.fundus, od } })
  const updateFundusOs = (os: FundusEye) =>
    update({ fundus: { ...examData.fundus, os } })

  const toggleMedication = () => {
    if (showMedication) {
      update({ medications: [] })
      setShowMedication(false)
    } else {
      if (examData.medications.length === 0) {
        update({ medications: [{ ...EMPTY_MEDICATION }] })
      }
      setShowMedication(true)
    }
  }

  const toggleOptical = () => {
    if (showOptical) {
      update({ opticalRx: undefined })
      setShowOptical(false)
    } else {
      if (!examData.opticalRx) {
        update({ opticalRx: { ...EMPTY_OPTICAL_RX } })
      }
      setShowOptical(true)
    }
  }

  const toggleFollowUp = () => {
    if (showFollowUp) {
      update({ followUp: undefined })
      setShowFollowUp(false)
    } else {
      if (!examData.followUp) {
        update({ followUp: { ...EMPTY_FOLLOW_UP } })
      }
      setShowFollowUp(true)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Khám &amp; kết luận</h2>
        {previousVisit && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPrevious(!showPrevious)}
          >
            Lần trước
          </Button>
        )}
      </div>

      {/* Previous Visit Panel */}
      {showPrevious && previousVisit && (
        <PreviousVisitPanel
          visit={previousVisit}
          onClose={() => setShowPrevious(false)}
        />
      )}

      {/* Slit-lamp (Sinh hiển vi) */}
      <section className="space-y-4">
        <SectionTitle>Sinh hiển vi</SectionTitle>
        <div className="flex gap-5">
          <EyeCard eye="OD" color="#378ADD">
            <SlitLampFields
              data={examData.slitLamp.od}
              onChange={updateSlitLampOd}
            />
          </EyeCard>
          <EyeCard eye="OS" color="#D85A30">
            <SlitLampFields
              data={examData.slitLamp.os}
              onChange={updateSlitLampOs}
            />
          </EyeCard>
        </div>
      </section>

      {/* Fundus (Đáy mắt) */}
      <section className="space-y-4">
        <SectionTitle>Đáy mắt</SectionTitle>
        <div className="flex gap-5">
          <EyeCard eye="OD" color="#378ADD">
            <FundusFields
              data={examData.fundus.od}
              onChange={updateFundusOd}
            />
          </EyeCard>
          <EyeCard eye="OS" color="#D85A30">
            <FundusFields
              data={examData.fundus.os}
              onChange={updateFundusOs}
            />
          </EyeCard>
        </div>
      </section>

      {/* Diagnosis */}
      <section className="space-y-4">
        <SectionTitle>Chẩn đoán</SectionTitle>
        <DiagnosisInput
          diagnoses={examData.diagnoses}
          onChange={(diagnoses) => update({ diagnoses })}
        />
        <Textarea
          value={examData.diagnosisNotes}
          onChange={(e) => update({ diagnosisNotes: e.target.value })}
          rows={2}
        />
      </section>

      {/* Separator */}
      <div className="h-px bg-border" />

      {/* Optional Section Toggles */}
      <div className="flex gap-2.5">
        <ToggleButton
          active={showMedication}
          activeLabel="− Đơn thuốc"
          inactiveLabel="+ Đơn thuốc"
          onClick={toggleMedication}
        />
        <ToggleButton
          active={showOptical}
          activeLabel="− Đơn kính"
          inactiveLabel="+ Đơn kính"
          onClick={toggleOptical}
        />
        <ToggleButton
          active={showFollowUp}
          activeLabel="− Tái khám"
          inactiveLabel="+ Tái khám"
          onClick={toggleFollowUp}
        />
      </div>

      {/* Medication Section */}
      {showMedication && (
        <MedicationSection
          medications={examData.medications}
          onChange={(medications) => update({ medications })}
          onRemoveSection={toggleMedication}
        />
      )}

      {/* Optical Rx Section */}
      {showOptical && examData.opticalRx && (
        <OpticalRxSection
          rx={examData.opticalRx}
          onChange={(opticalRx) => update({ opticalRx })}
          onRemoveSection={toggleOptical}
        />
      )}

      {/* Follow-up Section */}
      {showFollowUp && examData.followUp && (
        <FollowUpSection
          followUp={examData.followUp}
          onChange={(followUp) => update({ followUp })}
          onRemoveSection={toggleFollowUp}
        />
      )}
    </div>
  )
}
