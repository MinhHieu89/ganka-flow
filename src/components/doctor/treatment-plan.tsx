import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import type { ExamData, Medication, Procedure } from "@/data/mock-patients"

interface TreatmentPlanProps {
  examData: ExamData
  onChange: (data: ExamData) => void
}

type PlanSection = "medication" | "optical" | "procedure" | "followUp"

export function TreatmentPlan({ examData, onChange }: TreatmentPlanProps) {
  const [openSections, setOpenSections] = useState<Set<PlanSection>>(new Set())

  function toggleSection(section: PlanSection) {
    const next = new Set(openSections)
    if (next.has(section)) {
      next.delete(section)
      // Clear data when removing section
      if (section === "medication")
        onChange({ ...examData, medications: [] })
      if (section === "optical")
        onChange({ ...examData, opticalRx: undefined })
      if (section === "procedure")
        onChange({ ...examData, procedures: [] })
      if (section === "followUp")
        onChange({ ...examData, followUp: undefined })
    } else {
      next.add(section)
    }
    setOpenSections(next)
  }

  function addMedication() {
    onChange({
      ...examData,
      medications: [
        ...examData.medications,
        { name: "", dosage: "", frequency: "", duration: "" },
      ],
    })
  }

  function updateMedication(index: number, med: Medication) {
    const meds = [...examData.medications]
    meds[index] = med
    onChange({ ...examData, medications: meds })
  }

  function removeMedication(index: number) {
    onChange({
      ...examData,
      medications: examData.medications.filter((_, i) => i !== index),
    })
  }

  function addProcedure() {
    onChange({
      ...examData,
      procedures: [...examData.procedures, { name: "", notes: "" }],
    })
  }

  function updateProcedure(index: number, proc: Procedure) {
    const procs = [...examData.procedures]
    procs[index] = proc
    onChange({ ...examData, procedures: procs })
  }

  function removeProcedure(index: number) {
    onChange({
      ...examData,
      procedures: examData.procedures.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Kế hoạch điều trị</div>

      {/* Add buttons for closed sections */}
      <div className="flex flex-wrap gap-2">
        {!openSections.has("medication") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("medication")}
          >
            + Thuốc
          </Button>
        )}
        {!openSections.has("optical") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("optical")}
          >
            + Kính (Rx)
          </Button>
        )}
        {!openSections.has("procedure") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("procedure")}
          >
            + Thủ thuật
          </Button>
        )}
        {!openSections.has("followUp") && (
          <Button
            variant="outline"
            size="sm"
            className="border-dashed text-muted-foreground"
            onClick={() => toggleSection("followUp")}
          >
            + Tái khám
          </Button>
        )}
      </div>

      {/* Medication Section */}
      {openSections.has("medication") && (
        <SectionWrapper
          title="Thuốc"
          onRemove={() => toggleSection("medication")}
        >
          {examData.medications.map((med, i) => (
            <div key={i} className="grid grid-cols-4 gap-2">
              <Input
                placeholder="Tên thuốc"
                value={med.name}
                onChange={(e) =>
                  updateMedication(i, { ...med, name: e.target.value })
                }
              />
              <Input
                placeholder="Liều lượng"
                value={med.dosage}
                onChange={(e) =>
                  updateMedication(i, { ...med, dosage: e.target.value })
                }
              />
              <Input
                placeholder="Tần suất"
                value={med.frequency}
                onChange={(e) =>
                  updateMedication(i, { ...med, frequency: e.target.value })
                }
              />
              <div className="flex gap-1">
                <Input
                  placeholder="Thời gian"
                  value={med.duration}
                  onChange={(e) =>
                    updateMedication(i, { ...med, duration: e.target.value })
                  }
                />
                <button
                  onClick={() => removeMedication(i)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              </div>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addMedication}>
            + Thêm thuốc
          </Button>
        </SectionWrapper>
      )}

      {/* Optical Rx Section */}
      {openSections.has("optical") && (
        <SectionWrapper
          title="Kính (Rx)"
          onRemove={() => toggleSection("optical")}
        >
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">OD (Phải)</div>
            <div className="grid grid-cols-5 gap-2">
              {(["sph", "cyl", "axis", "add", "pd"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs uppercase text-muted-foreground">
                    {field}
                  </label>
                  <Input
                    className="mt-1 h-8"
                    value={examData.opticalRx?.od[field] ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...examData,
                        opticalRx: {
                          od: {
                            ...(examData.opticalRx?.od ?? {
                              sph: "",
                              cyl: "",
                              axis: "",
                              add: "",
                              pd: "",
                            }),
                            [field]: e.target.value,
                          },
                          os: examData.opticalRx?.os ?? {
                            sph: "",
                            cyl: "",
                            axis: "",
                            add: "",
                            pd: "",
                          },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">OS (Trái)</div>
            <div className="grid grid-cols-5 gap-2">
              {(["sph", "cyl", "axis", "add", "pd"] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs uppercase text-muted-foreground">
                    {field}
                  </label>
                  <Input
                    className="mt-1 h-8"
                    value={examData.opticalRx?.os[field] ?? ""}
                    onChange={(e) =>
                      onChange({
                        ...examData,
                        opticalRx: {
                          od: examData.opticalRx?.od ?? {
                            sph: "",
                            cyl: "",
                            axis: "",
                            add: "",
                            pd: "",
                          },
                          os: {
                            ...(examData.opticalRx?.os ?? {
                              sph: "",
                              cyl: "",
                              axis: "",
                              add: "",
                              pd: "",
                            }),
                            [field]: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </SectionWrapper>
      )}

      {/* Procedure Section */}
      {openSections.has("procedure") && (
        <SectionWrapper
          title="Thủ thuật"
          onRemove={() => toggleSection("procedure")}
        >
          {examData.procedures.map((proc, i) => (
            <div key={i} className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Tên thủ thuật"
                  value={proc.name}
                  onChange={(e) =>
                    updateProcedure(i, { ...proc, name: e.target.value })
                  }
                />
                <button
                  onClick={() => removeProcedure(i)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                </button>
              </div>
              <Textarea
                placeholder="Ghi chú..."
                rows={2}
                value={proc.notes}
                onChange={(e) =>
                  updateProcedure(i, { ...proc, notes: e.target.value })
                }
              />
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={addProcedure}>
            + Thêm thủ thuật
          </Button>
        </SectionWrapper>
      )}

      {/* Follow-up Section */}
      {openSections.has("followUp") && (
        <SectionWrapper
          title="Tái khám"
          onRemove={() => toggleSection("followUp")}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Ngày</label>
              <Input
                type="date"
                className="mt-1"
                value={examData.followUp?.date ?? ""}
                onChange={(e) =>
                  onChange({
                    ...examData,
                    followUp: {
                      date: e.target.value,
                      reason: examData.followUp?.reason ?? "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Lý do</label>
              <Input
                className="mt-1"
                placeholder="Lý do tái khám..."
                value={examData.followUp?.reason ?? ""}
                onChange={(e) =>
                  onChange({
                    ...examData,
                    followUp: {
                      date: examData.followUp?.date ?? "",
                      reason: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </SectionWrapper>
      )}
    </div>
  )
}

function SectionWrapper({
  title,
  onRemove,
  children,
}: {
  title: string
  onRemove: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <button
          onClick={onRemove}
          className="text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
        </button>
      </div>
      {children}
    </div>
  )
}
