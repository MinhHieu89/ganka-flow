import type { Visit } from "@/data/mock-patients"
import { cn } from "@/lib/utils"

interface TabPreExamProps {
  visit: Visit
}

// ── Helper components ─────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="mb-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
        {title}
      </div>
      {children}
    </div>
  )
}

function EyeBadge({ eye }: { eye: "OD" | "OS" }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-[28px] items-center justify-center rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white",
        eye === "OD" ? "bg-primary" : "bg-sky-500"
      )}
    >
      {eye}
    </span>
  )
}

const CYCLOPLEGIC_LABELS: Record<string, string> = {
  cyclogyl: "Cyclogyl",
  mydrinP: "Mydrin P",
  atropine: "Atropine",
}

// ── Refraction table (read-only) ──────────────────────────────────────────────

function RefractionTable({
  columns,
  od,
  os,
}: {
  columns: { key: string; label: string }[]
  od: Record<string, string>
  os: Record<string, string>
}) {
  const hasAnyValue = columns.some(
    (col) => od[col.key]?.trim() || os[col.key]?.trim()
  )
  if (!hasAnyValue) return null

  return (
    <table className="w-full text-sm">
      <thead>
        <tr>
          <th className="w-12 pb-1.5 text-left font-normal text-muted-foreground" />
          {columns.map((col) => (
            <th
              key={col.key}
              className="pb-1.5 text-left text-xs font-normal text-muted-foreground"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="py-1">
            <EyeBadge eye="OD" />
          </td>
          {columns.map((col) => (
            <td key={col.key} className="py-1 font-medium tabular-nums">
              {od[col.key] || "—"}
            </td>
          ))}
        </tr>
        <tr>
          <td className="py-1">
            <EyeBadge eye="OS" />
          </td>
          {columns.map((col) => (
            <td key={col.key} className="py-1 font-medium tabular-nums">
              {os[col.key] || "—"}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  )
}

function OdOsPair({
  label,
  od,
  os,
  unit,
}: {
  label: string
  od: string
  os: string
  unit?: string
}) {
  if (!od && !os) return null
  return (
    <div className="rounded-lg bg-muted/40 px-3 py-2.5">
      <div className="mb-1 text-[10px] text-muted-foreground">{label}</div>
      <div className="flex gap-3 text-sm font-semibold">
        <span className="flex items-center gap-1">
          <EyeBadge eye="OD" />
          <span className="tabular-nums">
            {od ? `${od}${unit ?? ""}` : "—"}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <EyeBadge eye="OS" />
          <span className="tabular-nums">
            {os ? `${os}${unit ?? ""}` : "—"}
          </span>
        </span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const BASIC_COLS = [
  { key: "sph", label: "SPH" },
  { key: "cyl", label: "CYL" },
  { key: "axis", label: "AXIS" },
  { key: "va", label: "VA" },
]
const WITH_ADD_COLS = [...BASIC_COLS, { key: "add", label: "ADD" }]
const SUBJECTIVE_COLS = [
  ...WITH_ADD_COLS,
  { key: "vaNear", label: "VA Near" },
]

export function TabPreExam({ visit }: TabPreExamProps) {
  const refraction = visit.refractionData

  if (!refraction) {
    return (
      <div className="space-y-5">
        <h2 className="text-base font-medium">Kết quả khám chức năng</h2>
        <div className="rounded-lg border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
          Chưa có kết quả khám chức năng
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h2 className="text-base font-medium">Kết quả khám chức năng</h2>

      {/* Kính cũ */}
      <Section title="Kính cũ">
        <RefractionTable
          columns={WITH_ADD_COLS}
          od={refraction.currentGlasses.od}
          os={refraction.currentGlasses.os}
        />
      </Section>

      {/* Khúc xạ khách quan */}
      <Section title="Khúc xạ khách quan">
        <RefractionTable
          columns={BASIC_COLS}
          od={refraction.objective.od}
          os={refraction.objective.os}
        />
      </Section>

      {/* Khúc xạ chủ quan */}
      <Section title="Khúc xạ chủ quan">
        <RefractionTable
          columns={SUBJECTIVE_COLS}
          od={refraction.subjective.od}
          os={refraction.subjective.os}
        />
      </Section>

      {/* Liệt điều tiết */}
      {refraction.cycloplegicEnabled && (
        <Section title="Liệt điều tiết">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {refraction.cycloplegicAgent.map((agent) => (
              <span
                key={agent}
                className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
              >
                {CYCLOPLEGIC_LABELS[agent] ?? agent}
              </span>
            ))}
          </div>
          <RefractionTable
            columns={BASIC_COLS}
            od={refraction.cycloplegic.od}
            os={refraction.cycloplegic.os}
          />
        </Section>
      )}

      {/* Các xét nghiệm khác */}
      {(refraction.retinoscopy.od ||
        refraction.retinoscopy.os ||
        refraction.iop.od ||
        refraction.iop.os ||
        refraction.axialLength.od ||
        refraction.axialLength.os) && (
        <Section title="Các xét nghiệm khác">
          <div className="grid grid-cols-3 gap-2">
            <OdOsPair
              label="Soi bóng đồng tử"
              od={refraction.retinoscopy.od}
              os={refraction.retinoscopy.os}
            />
            <OdOsPair
              label="Nhãn áp (mmHg)"
              od={refraction.iop.od}
              os={refraction.iop.os}
            />
            <OdOsPair
              label="Trục nhãn cầu (mm)"
              od={refraction.axialLength.od}
              os={refraction.axialLength.os}
            />
          </div>
        </Section>
      )}

      {/* Đơn kính */}
      {refraction.glassesRxEnabled && (
        <Section title="Đơn kính">
          <RefractionTable
            columns={WITH_ADD_COLS}
            od={refraction.glassesRx.od}
            os={refraction.glassesRx.os}
          />
          <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-2 border-t border-border pt-3">
            {refraction.glassesRx.pd && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground">PD</span>
                <span className="font-medium">{refraction.glassesRx.pd}</span>
              </div>
            )}
            {refraction.glassesRx.lensType && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground">Loại kính</span>
                <span className="font-medium">
                  {refraction.glassesRx.lensType}
                </span>
              </div>
            )}
            {refraction.glassesRx.purpose && (
              <div className="flex gap-2 text-sm">
                <span className="text-muted-foreground">Mục đích</span>
                <span className="font-medium">
                  {refraction.glassesRx.purpose}
                </span>
              </div>
            )}
          </div>
          {refraction.glassesRx.notes && (
            <div className="mt-2 text-sm text-muted-foreground">
              {refraction.glassesRx.notes}
            </div>
          )}
        </Section>
      )}

      {/* Ghi chú */}
      {refraction.notes && (
        <Section title="Ghi chú">
          <p className="text-sm whitespace-pre-wrap">{refraction.notes}</p>
        </Section>
      )}
    </div>
  )
}
