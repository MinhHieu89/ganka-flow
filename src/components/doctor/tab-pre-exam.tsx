import { Button } from "@/components/ui/button"
import type { Patient, Visit } from "@/data/mock-patients"
import { cn } from "@/lib/utils"

interface TabPreExamProps {
  patient: Patient
  visit: Visit
}

// ── Helper components ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
  variant,
}: {
  title: string
  children: React.ReactNode
  variant?: "red"
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card px-5 py-4",
        variant === "red"
          ? "border-red-300 bg-red-50/30 dark:border-red-800 dark:bg-red-950/20"
          : "border-border"
      )}
    >
      <div
        className={cn(
          "mb-3.5 text-[11px] font-semibold tracking-wider uppercase",
          variant === "red"
            ? "text-red-600 dark:text-red-400"
            : "text-muted-foreground/70"
        )}
      >
        {title}
      </div>
      {children}
    </div>
  )
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
    >
      {children}
    </span>
  )
}

function RedPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: "#FCEBEB", color: "#791F1F" }}
    >
      {children}
    </span>
  )
}

function WarnPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
      style={{ backgroundColor: "#FAEEDA", color: "#633806" }}
    >
      {children}
    </span>
  )
}

function KvRow({
  label,
  value,
  bold,
}: {
  label: string
  value: React.ReactNode
  bold?: boolean
}) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
      <span className={cn(bold && "font-medium")}>{value ?? "—"}</span>
    </div>
  )
}

function EyeBadge({ eye }: { eye: "OD" | "OS" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold text-white",
        eye === "OD" ? "bg-[#378ADD]" : "bg-[#D85A30]"
      )}
    >
      {eye}
    </span>
  )
}

// ── Label maps ────────────────────────────────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  dryEyes: "Khô mắt",
  gritty: "Cộm / rát mắt",
  blurry: "Nhìn mờ",
  tearing: "Chảy nước mắt",
  itchy: "Ngứa mắt",
  headache: "Nhức đầu",
}

const RED_FLAG_LABELS: Record<string, string> = {
  eyePain: "Đau mắt nhiều",
  suddenVisionLoss: "Giảm thị lực đột ngột",
  asymmetry: "Triệu chứng lệch 1 bên rõ",
}

const DISCOMFORT_LABELS: Record<string, string> = {
  mild: "Nhẹ",
  moderate: "Trung bình",
  severe: "Nặng",
}

const BLINK_LABELS: Record<string, string> = {
  yes: "Có",
  no: "Không",
  unclear: "Không rõ",
}

const OSDI_SEVERITY_LABELS: Record<string, string> = {
  normal: "Bình thường",
  moderate: "Trung bình",
  severe: "Nặng",
}

const DISEASE_GROUP_LABELS: Record<string, string> = {
  dryEye: "Khô mắt",
  refraction: "Khúc xạ",
  myopiaControl: "Cận thị",
  general: "Tổng quát",
}

// ── Main component ────────────────────────────────────────────────────────────

export function TabPreExam({ patient, visit }: TabPreExamProps) {
  const screening = visit.screeningData

  const chiefComplaint =
    screening?.chiefComplaint || patient.chiefComplaint || ""

  const activeSymptoms = screening?.symptoms
    ? (
        Object.entries(screening.symptoms) as [
          keyof typeof SYMPTOM_LABELS,
          boolean,
        ][]
      )
        .filter(([, v]) => v)
        .map(([k]) => k)
    : []

  const activeRedFlags = screening?.redFlags
    ? (
        Object.entries(screening.redFlags) as [
          keyof typeof RED_FLAG_LABELS,
          boolean,
        ][]
      )
        .filter(([, v]) => v)
        .map(([k]) => k)
    : []

  const dryEye = screening?.step2?.dryEye
  const hasDryEye =
    dryEye &&
    (dryEye.osdiScore != null ||
      !!dryEye.tbutOd ||
      !!dryEye.tbutOs ||
      !!dryEye.schirmerOd ||
      !!dryEye.schirmerOs ||
      !!dryEye.meibomian ||
      !!dryEye.staining)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Kết quả Pre-Exam</h2>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          Chỉnh sửa
        </Button>
      </div>

      {/* ── STEP 1 ─────────────────────────────────────────────────────── */}

      {/* 1. Thông tin khám ban đầu — matches screening-form-initial.tsx */}
      <Section title="Thông tin khám ban đầu">
        <div className="space-y-3">
          <KvRow label="Lý do đến khám" value={chiefComplaint || "—"} bold />
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">
              Thị lực cơ bản (UCVA)
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <EyeBadge eye="OD" />
                <span className="font-medium tabular-nums">
                  {screening?.ucvaOd || "—"}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <EyeBadge eye="OS" />
                <span className="font-medium tabular-nums">
                  {screening?.ucvaOs || "—"}
                </span>
              </span>
            </div>
          </div>
          {(screening?.currentRxOd || screening?.currentRxOs) && (
            <div>
              <div className="mb-1.5 text-xs text-muted-foreground">
                Kính hiện tại
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5">
                  <EyeBadge eye="OD" />
                  <span className="font-medium tabular-nums">
                    {screening?.currentRxOd || "—"}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <EyeBadge eye="OS" />
                  <span className="font-medium tabular-nums">
                    {screening?.currentRxOs || "—"}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* 2. Red Flag — matches screening-form-red-flags.tsx */}
      <Section
        title="Red Flag"
        variant={activeRedFlags.length > 0 ? "red" : undefined}
      >
        {activeRedFlags.length === 0 ? (
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Không có Red Flag
          </span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {activeRedFlags.map((key) => (
              <RedPill key={key}>{RED_FLAG_LABELS[key]}</RedPill>
            ))}
          </div>
        )}
      </Section>

      {/* 3. Câu hỏi định hướng — matches screening-form-questions.tsx */}
      <Section title="Câu hỏi định hướng">
        <div className="space-y-4">
          {/* Triệu chứng */}
          <div>
            <div className="mb-1.5 text-xs text-muted-foreground">
              Triệu chứng
            </div>
            {activeSymptoms.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {activeSymptoms.map((key) => (
                  <Pill key={key}>{SYMPTOM_LABELS[key]}</Pill>
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Không có</span>
            )}
          </div>

          {/* Chớp mắt cải thiện */}
          <KvRow
            label="Chớp mắt cải thiện"
            value={
              screening?.blinkImprovement
                ? BLINK_LABELS[screening.blinkImprovement]
                : "—"
            }
            bold
          />

          {/* Thời gian triệu chứng */}
          <div className="grid grid-cols-2 gap-x-8">
            <KvRow
              label="Thời gian t/c"
              value={
                screening?.symptomDuration != null
                  ? `${screening.symptomDuration} ${screening.symptomDurationUnit}`
                  : "—"
              }
              bold
            />
            <KvRow
              label="Screen time"
              value={
                screening?.screenTime ? `${screening.screenTime} giờ/ngày` : "—"
              }
              bold
            />
          </div>

          {/* Kính áp tròng */}
          <KvRow
            label="Kính áp tròng"
            value={
              screening?.contactLens === "yes"
                ? "Có"
                : screening?.contactLens === "no"
                  ? "Không"
                  : "—"
            }
            bold
          />

          {/* Mức độ khó chịu */}
          <KvRow
            label="Mức độ khó chịu"
            value={
              screening?.discomfortLevel
                ? DISCOMFORT_LABELS[screening.discomfortLevel]
                : "—"
            }
            bold
          />
        </div>
      </Section>

      {/* ── STEP 2 ─────────────────────────────────────────────────────── */}

      {/* 6. Nhóm bệnh đã chọn */}
      {screening?.step2?.selectedGroups &&
        screening.step2.selectedGroups.length > 0 && (
          <div className="space-y-5">
            <div className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Kết quả chuyên sâu (Bước 2)
            </div>

            {/* Selected groups display */}
            <div className="flex flex-wrap gap-1.5">
              {screening.step2.selectedGroups.map((g) => (
                <Pill key={g}>{DISEASE_GROUP_LABELS[g] ?? g}</Pill>
              ))}
            </div>

            {/* Dry Eye data */}
            {hasDryEye && (
              <Section title="Khô mắt">
                <div className="space-y-3">
                  {/* OSDI */}
                  {dryEye!.osdiScore != null && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        OSDI-6:
                      </span>
                      <span className="text-sm font-medium">
                        {dryEye!.osdiScore}/100
                      </span>
                      {dryEye!.osdiSeverity && (
                        <WarnPill>
                          {OSDI_SEVERITY_LABELS[dryEye!.osdiSeverity]}
                        </WarnPill>
                      )}
                    </div>
                  )}

                  {/* TBUT + Schirmer */}
                  {(!!dryEye!.tbutOd ||
                    !!dryEye!.tbutOs ||
                    !!dryEye!.schirmerOd ||
                    !!dryEye!.schirmerOs) && (
                    <div className="rounded-md bg-muted/30 p-2.5">
                      <div className="grid grid-cols-[5rem_1fr_1fr] gap-x-4 gap-y-1.5 text-xs">
                        <div />
                        <div className="text-[10px] font-medium text-muted-foreground">
                          OD
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground">
                          OS
                        </div>

                        <div className="text-muted-foreground">TBUT</div>
                        <div
                          className={cn(
                            "font-medium tabular-nums",
                            !dryEye!.tbutOd && "text-muted-foreground"
                          )}
                        >
                          {dryEye!.tbutOd ? `${dryEye!.tbutOd}s` : "—"}
                        </div>
                        <div
                          className={cn(
                            "font-medium tabular-nums",
                            !dryEye!.tbutOs && "text-muted-foreground"
                          )}
                        >
                          {dryEye!.tbutOs ? `${dryEye!.tbutOs}s` : "—"}
                        </div>

                        <div className="text-muted-foreground">Schirmer</div>
                        <div
                          className={cn(
                            "font-medium tabular-nums",
                            !dryEye!.schirmerOd && "text-muted-foreground"
                          )}
                        >
                          {dryEye!.schirmerOd ? `${dryEye!.schirmerOd}mm` : "—"}
                        </div>
                        <div
                          className={cn(
                            "font-medium tabular-nums",
                            !dryEye!.schirmerOs && "text-muted-foreground"
                          )}
                        >
                          {dryEye!.schirmerOs ? `${dryEye!.schirmerOs}mm` : "—"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Meibomian + Staining */}
                  {!!dryEye!.meibomian && (
                    <KvRow label="Meibomian" value={dryEye!.meibomian} bold />
                  )}
                  {!!dryEye!.staining && (
                    <KvRow label="Staining" value={dryEye!.staining} bold />
                  )}
                </div>
              </Section>
            )}
          </div>
        )}
    </div>
  )
}
