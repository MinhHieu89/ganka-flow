import type { Patient } from "@/data/mock-patients"

interface Props {
  patient: Patient
  onUpdateSection: (section: "eye" | "medical" | "family" | "lifestyle") => void
  editingSection: string | null
}

function SummaryCard({
  title,
  sectionKey,
  lines,
  onUpdate,
}: {
  title: string
  sectionKey: "eye" | "medical" | "family" | "lifestyle"
  lines: string[]
  onUpdate: (section: "eye" | "medical" | "family" | "lifestyle") => void
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <button
          onClick={() => onUpdate(sectionKey)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-primary hover:bg-muted"
        >
          Cập nhật
        </button>
      </div>
      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
        {lines.length > 0 ? (
          lines.map((line, i) => <p key={i}>{line}</p>)
        ) : (
          <p>Chưa có thông tin</p>
        )}
      </div>
    </div>
  )
}

function getEyeHistoryLines(patient: Patient): string[] {
  const lines: string[] = []

  // Glasses types
  if (patient.currentGlasses?.types && patient.currentGlasses.types.length > 0) {
    lines.push(`Đang đeo: ${patient.currentGlasses.types.join(", ")}`)
  }

  // Contact lens status
  if (patient.contactLensStatus) {
    const statusMap: Record<string, string> = {
      co: "Có",
      khong: "Không",
      da_tung: "Đã từng",
    }
    lines.push(
      `Kính áp tròng: ${statusMap[patient.contactLensStatus] ?? patient.contactLensStatus}`
    )
  }

  // Diagnosed conditions count
  if (patient.diagnosedEyeConditions) {
    const count = Object.values(patient.diagnosedEyeConditions).filter(
      Boolean
    ).length
    lines.push(
      count > 0
        ? `${count} bệnh mắt đã chẩn đoán`
        : "Bệnh mắt đã chẩn đoán: Chưa có"
    )
  }

  // Surgeries count
  if (patient.eyeSurgeries) {
    const count = patient.eyeSurgeries.length
    lines.push(
      count > 0
        ? `${count} ca phẫu thuật`
        : "Phẫu thuật mắt: Chưa có"
    )
  }

  return lines
}

function getMedicalHistoryLines(patient: Patient): string[] {
  const lines: string[] = []

  // Systemic conditions
  if (patient.systemicConditions) {
    const count = Object.values(patient.systemicConditions).filter(
      Boolean
    ).length
    lines.push(
      count > 0
        ? `${count} bệnh lý toàn thân`
        : "Bệnh lý toàn thân: Chưa có"
    )
  }

  // Medications
  if (patient.medicationsList) {
    const count = patient.medicationsList.length
    lines.push(
      count > 0 ? `${count} thuốc đang dùng` : "Thuốc đang dùng: Không có"
    )
  }

  // Allergies
  if (patient.allergiesInfo) {
    if (patient.allergiesInfo.none) {
      lines.push("Dị ứng: Không có")
    } else if (patient.allergiesInfo.items.length > 0) {
      lines.push(`${patient.allergiesInfo.items.length} dị ứng`)
    } else {
      lines.push("Dị ứng: Chưa khai")
    }
  }

  return lines
}

function getFamilyHistoryLines(patient: Patient): string[] {
  const lines: string[] = []

  // Eye conditions with family history
  if (patient.familyEyeHistory) {
    const count = Object.values(patient.familyEyeHistory).filter(
      (entry) => entry.has
    ).length
    lines.push(
      count > 0
        ? `${count} bệnh mắt trong gia đình`
        : "Bệnh mắt gia đình: Chưa có"
    )
  }

  // Medical conditions with family history
  if (patient.familyMedicalHistory) {
    const count = Object.values(patient.familyMedicalHistory).filter(
      (entry) => entry.has
    ).length
    lines.push(
      count > 0
        ? `${count} bệnh lý gia đình`
        : "Bệnh lý gia đình: Chưa có"
    )
  }

  return lines
}

function getLifestyleLines(patient: Patient): string[] {
  const lines: string[] = []

  // Screen time
  if (patient.screenTimeComputer || patient.screenTimePhone) {
    const parts: string[] = []
    if (patient.screenTimeComputer) {
      parts.push(`Máy tính: ${patient.screenTimeComputer}`)
    }
    if (patient.screenTimePhone) {
      parts.push(`Điện thoại: ${patient.screenTimePhone}`)
    }
    lines.push(`Thời gian màn hình: ${parts.join(", ")}`)
  }

  // Smoking
  if (patient.smokingInfo) {
    const statusMap: Record<string, string> = {
      khong: "Không hút",
      co: "Có hút",
      da_bo: "Đã bỏ",
    }
    lines.push(
      `Hút thuốc: ${statusMap[patient.smokingInfo.status] ?? patient.smokingInfo.status}`
    )
  }

  // Driving
  if (patient.drivingInfo) {
    lines.push(`Lái xe: ${patient.drivingInfo.does ? "Có" : "Không"}`)
  }

  return lines
}

export function PatientHistorySummary({
  patient,
  onUpdateSection,
}: Props) {
  const eyeLines = getEyeHistoryLines(patient)
  const medicalLines = getMedicalHistoryLines(patient)
  const familyLines = getFamilyHistoryLines(patient)
  const lifestyleLines = getLifestyleLines(patient)

  return (
    <div className="space-y-4">
      <SummaryCard
        title="Tiền sử mắt"
        sectionKey="eye"
        lines={eyeLines}
        onUpdate={onUpdateSection}
      />
      <SummaryCard
        title="Tiền sử y tế"
        sectionKey="medical"
        lines={medicalLines}
        onUpdate={onUpdateSection}
      />
      <SummaryCard
        title="Tiền sử gia đình"
        sectionKey="family"
        lines={familyLines}
        onUpdate={onUpdateSection}
      />
      <SummaryCard
        title="Thói quen sinh hoạt"
        sectionKey="lifestyle"
        lines={lifestyleLines}
        onUpdate={onUpdateSection}
      />
    </div>
  )
}
