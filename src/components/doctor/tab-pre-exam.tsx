import type { Patient, Visit } from "@/data/mock-patients"
import { cn } from "@/lib/utils"

interface TabPreExamProps {
  patient: Patient
  visit: Visit
}

// ── Internal helper components ──────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
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

function MetricCard({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-md bg-muted/40 px-3 py-2.5">
      <div className="mb-1 text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium leading-tight">{value}</div>
    </div>
  )
}

function ValueCard({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="rounded-md bg-muted/30 px-2.5 py-2">
      <div className="mb-0.5 text-[10px] text-muted-foreground">{label}</div>
      <div className="text-sm font-medium tabular-nums leading-tight">
        {value || "—"}
      </div>
    </div>
  )
}

function EyeCard({
  label,
  dotColor,
  ucva,
  currentRx,
}: {
  label: string
  dotColor: string
  ucva: string
  currentRx: string
}) {
  return (
    <div className="flex-1 rounded-lg border border-border bg-card p-3">
      <div className="mb-2.5 flex items-center gap-1.5">
        <span
          className="inline-block size-2 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <ValueCard label="SC" value={ucva || "—"} />
        <ValueCard label="CC" value={currentRx ? `c/ ${currentRx}` : "—"} />
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

const SYMPTOM_LABELS: Record<string, string> = {
  dryEyes: "Khô mắt",
  gritty: "Cộm rát",
  blurry: "Mờ",
  tearing: "Chảy nước mắt",
  itchy: "Ngứa",
  headache: "Đau đầu",
}

const RED_FLAG_LABELS: Record<string, string> = {
  eyePain: "Đau mắt",
  suddenVisionLoss: "Giảm thị lực đột ngột",
  asymmetry: "Không đồng đều",
}

const DISCOMFORT_LABELS: Record<string, string> = {
  mild: "Nhẹ",
  moderate: "Trung bình",
  severe: "Nặng",
}

export function TabPreExam({ patient, visit }: TabPreExamProps) {
  const screening = visit.screeningData

  // Chief complaint — prefer screening > patient
  const chiefComplaint =
    screening?.chiefComplaint || patient.chiefComplaint || ""

  // Symptoms as truthy keys
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

  // Red flags as truthy keys
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

  // History emptiness check
  const hasHistory =
    !!patient.eyeHistory ||
    !!patient.systemicHistory ||
    !!patient.allergies ||
    !!patient.currentMedications

  // Dry eye data from step2
  const dryEye = screening?.step2?.dryEye
  const hasDryEye =
    dryEye &&
    (!!dryEye.tbutOd ||
      !!dryEye.tbutOs ||
      !!dryEye.schirmerOd ||
      !!dryEye.schirmerOs)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-medium">Pre-Exam</h2>
      </div>

      {/* 1. Lý do khám & triệu chứng */}
      <Section title="Lý do khám & triệu chứng">
        <div className="space-y-3">
          {/* Lý do */}
          <Row label="Lý do khám" value={chiefComplaint || "—"} />

          {/* Khởi phát */}
          {screening?.symptomDuration ? (
            <Row
              label="Khởi phát"
              value={`${screening.symptomDuration} ${screening.symptomDurationUnit} trước`}
            />
          ) : null}

          {/* Mức độ */}
          {screening?.discomfortLevel ? (
            <Row
              label="Mức độ"
              value={DISCOMFORT_LABELS[screening.discomfortLevel] ?? "—"}
            />
          ) : null}

          {/* Triệu chứng */}
          {activeSymptoms.length > 0 && (
            <div className="flex flex-wrap items-start gap-1.5">
              <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                Triệu chứng
              </span>
              <div className="flex flex-wrap gap-1">
                {activeSymptoms.map((key) => (
                  <Pill key={key}>{SYMPTOM_LABELS[key]}</Pill>
                ))}
              </div>
            </div>
          )}

          {/* Dấu hiệu cảnh báo */}
          <div className="flex flex-wrap items-start gap-1.5">
            <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
              Cảnh báo
            </span>
            {activeRedFlags.length === 0 ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Không có
              </span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {activeRedFlags.map((key) => (
                  <RedPill key={key}>{RED_FLAG_LABELS[key]}</RedPill>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 2. Tiền sử */}
      <Section title="Tiền sử">
        {!hasHistory ? (
          <p className="text-xs text-muted-foreground">Không có tiền sử</p>
        ) : (
          <div className="space-y-3">
            {patient.eyeHistory && (
              <Row label="Bệnh mắt" value={patient.eyeHistory} />
            )}
            {patient.systemicHistory && (
              <Row label="Toàn thân" value={patient.systemicHistory} />
            )}
            {patient.allergies && (
              <div className="flex flex-wrap items-start gap-1.5">
                <span className="mt-0.5 shrink-0 text-xs text-muted-foreground">
                  Dị ứng
                </span>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.split(",").map((a) => (
                    <RedPill key={a.trim()}>{a.trim()}</RedPill>
                  ))}
                </div>
              </div>
            )}
            {patient.currentMedications && (
              <Row label="Thuốc đang dùng" value={patient.currentMedications} />
            )}
          </div>
        )}
      </Section>

      {/* 3. Sàng lọc */}
      <Section title="Sàng lọc">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <MetricCard
              label="OSDI-6"
              value={
                screening?.step2?.dryEye?.osdiScore != null
                  ? `${screening.step2.dryEye.osdiScore} — ${screening.step2.dryEye.osdiSeverity ?? ""}`
                  : "—"
              }
            />
            <MetricCard
              label="Thời gian màn hình"
              value={
                screening?.screenTime
                  ? `${screening.screenTime} giờ/ngày`
                  : "—"
              }
            />
            <MetricCard
              label="Kính áp tròng"
              value={
                screening?.contactLens === "yes"
                  ? "Có đeo"
                  : screening?.contactLens === "no"
                    ? "Không đeo"
                    : "—"
              }
            />
            <MetricCard
              label="Mức khó chịu"
              value={
                screening?.discomfortLevel
                  ? DISCOMFORT_LABELS[screening.discomfortLevel]
                  : "—"
              }
            />
          </div>
          {screening?.notes && (
            <p className="text-xs text-muted-foreground">{screening.notes}</p>
          )}
        </div>
      </Section>

      {/* 4. Thị lực & nhãn áp */}
      <Section title="Thị lực & nhãn áp">
        <div className="flex gap-3">
          <EyeCard
            label="OD"
            dotColor="#378ADD"
            ucva={screening?.ucvaOd ?? ""}
            currentRx={screening?.currentRxOd ?? ""}
          />
          <EyeCard
            label="OS"
            dotColor="#D85A30"
            ucva={screening?.ucvaOs ?? ""}
            currentRx={screening?.currentRxOs ?? ""}
          />
        </div>
      </Section>

      {/* 5. Đo lường bổ sung — only if dry eye data present */}
      {hasDryEye && (
        <Section title="Đo lường bổ sung">
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
              <div className={cn("font-medium tabular-nums", !dryEye!.tbutOd && "text-muted-foreground")}>
                {dryEye!.tbutOd ? `${dryEye!.tbutOd}s` : "—"}
              </div>
              <div className={cn("font-medium tabular-nums", !dryEye!.tbutOs && "text-muted-foreground")}>
                {dryEye!.tbutOs ? `${dryEye!.tbutOs}s` : "—"}
              </div>

              <div className="text-muted-foreground">Schirmer</div>
              <div className={cn("font-medium tabular-nums", !dryEye!.schirmerOd && "text-muted-foreground")}>
                {dryEye!.schirmerOd ? `${dryEye!.schirmerOd}mm` : "—"}
              </div>
              <div className={cn("font-medium tabular-nums", !dryEye!.schirmerOs && "text-muted-foreground")}>
                {dryEye!.schirmerOs ? `${dryEye!.schirmerOs}mm` : "—"}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  )
}

// ── Row helper ────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
