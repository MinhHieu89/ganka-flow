import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

function MiniCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="mb-1 text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold">{children}</div>
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

// ── OSDI detail dialog ───────────────────────────────────────────────────────

const OSDI_ANSWER_LABELS = [
  "Không bao giờ",
  "Thỉnh thoảng",
  "Thường xuyên",
  "Hầu hết thời gian",
  "Liên tục",
]

const OSDI_QUESTION_GROUPS = [
  {
    title: "Triệu chứng mắt",
    questions: [
      { index: 0, text: "Chói mắt" },
      { index: 1, text: "Nhìn mờ giữa các lần chớp mắt" },
    ],
  },
  {
    title: "Ảnh hưởng hoạt động",
    questions: [
      { index: 2, text: "Lái xe / ngồi trên xe ban đêm" },
      { index: 3, text: "Xem tivi / máy tính / đọc sách" },
    ],
  },
  {
    title: "Yếu tố môi trường",
    questions: [
      { index: 4, text: "Nơi có gió / khô bụi" },
      { index: 5, text: "Nơi có độ ẩm thấp / điều hòa" },
    ],
  },
]

function AnswerBadge({ value }: { value: number | null }) {
  if (value == null) return <span className="text-muted-foreground">—</span>
  return (
    <span className="text-sm font-medium">{OSDI_ANSWER_LABELS[value]}</span>
  )
}

function OsdiDetailDialog({
  open,
  onOpenChange,
  answers,
  score,
  severity,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  answers: (number | null)[]
  score: number
  severity: string | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chi tiết OSDI-6</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {OSDI_QUESTION_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="mb-2 text-[11px] font-semibold tracking-wider text-muted-foreground/60 uppercase">
                {group.title}
              </div>
              <div className="space-y-2">
                {group.questions.map(({ index, text }) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4"
                  >
                    <span className="text-sm text-foreground/80">{text}</span>
                    <AnswerBadge value={answers[index]} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">Điểm OSDI-6</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tabular-nums">
                {score}/100
              </span>
              {severity && (
                <WarnPill>{OSDI_SEVERITY_LABELS[severity]}</WarnPill>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function TabPreExam({ patient, visit }: TabPreExamProps) {
  const [osdiDetailOpen, setOsdiDetailOpen] = useState(false)
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

          {/* Mini-cards grid */}
          <div className="grid grid-cols-3 gap-2">
            <MiniCard label="Chớp mắt cải thiện">
              {screening?.blinkImprovement
                ? BLINK_LABELS[screening.blinkImprovement]
                : "—"}
            </MiniCard>
            <MiniCard label="Thời gian t/c">
              {screening?.symptomDuration != null
                ? `${screening.symptomDuration} ${screening.symptomDurationUnit}`
                : "—"}
            </MiniCard>
            <MiniCard label="Screen time">
              {screening?.screenTime
                ? `${screening.screenTime} giờ/ngày`
                : "—"}
            </MiniCard>
            <MiniCard label="Kính áp tròng">
              {screening?.contactLens === "yes"
                ? "Có"
                : screening?.contactLens === "no"
                  ? "Không"
                  : "—"}
            </MiniCard>
            <MiniCard label="Mức độ khó chịu">
              {screening?.discomfortLevel
                ? DISCOMFORT_LABELS[screening.discomfortLevel]
                : "—"}
            </MiniCard>
          </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() => setOsdiDetailOpen(true)}
                      >
                        Xem chi tiết
                      </Button>
                      <OsdiDetailDialog
                        open={osdiDetailOpen}
                        onOpenChange={setOsdiDetailOpen}
                        answers={dryEye!.osdiAnswers}
                        score={dryEye!.osdiScore!}
                        severity={dryEye!.osdiSeverity}
                      />
                    </div>
                  )}

                  {/* Mini-cards grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {(!!dryEye!.tbutOd || !!dryEye!.tbutOs) && (
                      <MiniCard label="TBUT">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <EyeBadge eye="OD" />
                            <span className="tabular-nums">
                              {dryEye!.tbutOd ? `${dryEye!.tbutOd}s` : "—"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeBadge eye="OS" />
                            <span className="tabular-nums">
                              {dryEye!.tbutOs ? `${dryEye!.tbutOs}s` : "—"}
                            </span>
                          </span>
                        </div>
                      </MiniCard>
                    )}
                    {(!!dryEye!.schirmerOd || !!dryEye!.schirmerOs) && (
                      <MiniCard label="Schirmer">
                        <div className="flex gap-3">
                          <span className="flex items-center gap-1">
                            <EyeBadge eye="OD" />
                            <span className="tabular-nums">
                              {dryEye!.schirmerOd
                                ? `${dryEye!.schirmerOd}mm`
                                : "—"}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeBadge eye="OS" />
                            <span className="tabular-nums">
                              {dryEye!.schirmerOs
                                ? `${dryEye!.schirmerOs}mm`
                                : "—"}
                            </span>
                          </span>
                        </div>
                      </MiniCard>
                    )}
                    {!!dryEye!.meibomian && (
                      <MiniCard label="Meibomian">
                        {dryEye!.meibomian}
                      </MiniCard>
                    )}
                    {!!dryEye!.staining && (
                      <MiniCard label="Staining">
                        {dryEye!.staining}
                      </MiniCard>
                    )}
                  </div>
                </div>
              </Section>
            )}
          </div>
        )}
    </div>
  )
}
