import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { ExamData, DiseaseGroup } from "@/data/mock-patients"

interface ExamFindingsProps {
  examData: ExamData
  diseaseGroups: DiseaseGroup[]
  onChange: (data: ExamData) => void
}

export function ExamFindings({
  examData,
  diseaseGroups,
  onChange,
}: ExamFindingsProps) {
  const isDryEye = diseaseGroups.includes("dryEye")
  const isRefraction =
    diseaseGroups.includes("refraction") ||
    diseaseGroups.includes("myopiaControl")

  function updateField<K extends keyof ExamData>(key: K, value: ExamData[K]) {
    onChange({ ...examData, [key]: value })
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold">Khám lâm sàng</div>

      {/* VA */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Thị lực (VA)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">OD (Phải)</label>
            <Input
              className="mt-1 h-9"
              placeholder="20/"
              value={examData.va.od}
              onChange={(e) =>
                updateField("va", { ...examData.va, od: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OS (Trái)</label>
            <Input
              className="mt-1 h-9"
              placeholder="20/"
              value={examData.va.os}
              onChange={(e) =>
                updateField("va", { ...examData.va, os: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* IOP */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Nhãn áp (IOP)
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">OD (mmHg)</label>
            <Input
              className="mt-1 h-9"
              value={examData.iop.od}
              onChange={(e) =>
                updateField("iop", { ...examData.iop, od: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">OS (mmHg)</label>
            <Input
              className="mt-1 h-9"
              value={examData.iop.os}
              onChange={(e) =>
                updateField("iop", { ...examData.iop, os: e.target.value })
              }
            />
          </div>
        </div>
      </div>

      {/* Refraction (adaptive) */}
      {isRefraction && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Khúc xạ (Refraction)
          </div>
          <div className="mb-2 text-xs text-muted-foreground">OD (Phải)</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">SPH</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.sph ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      sph: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CYL</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.cyl ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      cyl: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">AXIS</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.od.axis ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: {
                      ...(examData.refractionExam?.od ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      axis: e.target.value,
                    },
                    os: examData.refractionExam?.os ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="mt-3 mb-2 text-xs text-muted-foreground">
            OS (Trái)
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">SPH</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.sph ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      sph: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">CYL</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.cyl ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      cyl: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">AXIS</label>
              <Input
                className="mt-1 h-9"
                value={examData.refractionExam?.os.axis ?? ""}
                onChange={(e) =>
                  updateField("refractionExam", {
                    od: examData.refractionExam?.od ?? {
                      sph: "",
                      cyl: "",
                      axis: "",
                      add: "",
                      pd: "",
                    },
                    os: {
                      ...(examData.refractionExam?.os ?? {
                        sph: "",
                        cyl: "",
                        axis: "",
                        add: "",
                        pd: "",
                      }),
                      axis: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Dry Eye adaptive fields */}
      {isDryEye && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Khô mắt — Đo lại
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">
                TBUT OD (s)
              </label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.tbutOd ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    tbutOd: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">
                TBUT OS (s)
              </label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.tbutOs ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    tbutOs: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Meibomian</label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.meibomian ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    meibomian: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Staining</label>
              <Input
                className="mt-1 h-9"
                value={examData.dryEyeExam?.staining ?? ""}
                onChange={(e) =>
                  updateField("dryEyeExam", {
                    ...(examData.dryEyeExam ?? {
                      tbutOd: "",
                      tbutOs: "",
                      meibomian: "",
                      staining: "",
                    }),
                    staining: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Slit-lamp */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Sinh hiển vi (Slit-lamp)
        </div>
        <Textarea
          placeholder="Ghi chú..."
          rows={3}
          value={examData.slitLamp}
          onChange={(e) => updateField("slitLamp", e.target.value)}
        />
      </div>

      {/* Fundus */}
      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">
          Soi đáy mắt (Fundus)
        </div>
        <Textarea
          placeholder="Ghi chú..."
          rows={3}
          value={examData.fundus}
          onChange={(e) => updateField("fundus", e.target.value)}
        />
      </div>
    </div>
  )
}
