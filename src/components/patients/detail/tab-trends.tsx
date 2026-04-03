// src/components/patients/detail/tab-trends.tsx
import type { TrendChart } from "@/data/mock-patient-detail"

interface TabTrendsProps {
  charts: TrendChart[]
}

const CHART_W = 400
const CHART_H = 140
const PADDING_LEFT = 0
const PADDING_RIGHT = 40

function getX(index: number, total: number): number {
  if (total <= 1) return CHART_W / 2
  const usable = CHART_W - PADDING_LEFT - PADDING_RIGHT
  return PADDING_LEFT + PADDING_RIGHT / 2 + (index / (total - 1)) * usable
}

function getY(value: number, min: number, max: number): number {
  if (max === min) return CHART_H / 2
  return CHART_H - ((value - min) / (max - min)) * CHART_H
}

function TrendChartCard({ chart }: { chart: TrendChart }) {
  const validPoints = chart.data.filter((d) => d.od !== null || d.os !== null)
  if (validPoints.length === 0) return null

  // Calculate Y range from yLabels
  const yValues = chart.yLabels.map(Number).filter((n) => !isNaN(n))
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  const odPoints: { x: number; y: number }[] = []
  const osPoints: { x: number; y: number }[] = []

  chart.data.forEach((d, i) => {
    const x = getX(i, chart.data.length)
    if (d.od !== null) {
      const yVal = chart.invertY ? yMax - (d.od - yMin) + yMin : d.od
      odPoints.push({ x, y: getY(yVal, yMin, yMax) })
    }
    if (d.os !== null) {
      const yVal = chart.invertY ? yMax - (d.os - yMin) + yMin : d.os
      osPoints.push({ x, y: getY(yVal, yMin, yMax) })
    }
  })

  const thresholdY = chart.threshold
    ? getY(
        chart.invertY
          ? yMax - (chart.threshold.value - yMin) + yMin
          : chart.threshold.value,
        yMin,
        yMax
      )
    : null

  return (
    <div className="rounded-xl border border-border px-5 py-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[13px] font-medium">{chart.title}</span>
        <div className="flex items-center gap-3.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: "#378ADD" }}
            />
            OD
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: "#D85A30" }}
            />
            OS
          </span>
          {chart.threshold && (
            <span style={{ color: "#A32D2D" }}>{chart.threshold.label}</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: CHART_H, marginLeft: 32 }}>
        {/* Y-axis labels */}
        {chart.yLabels.map((label, i) => {
          const pct = i / (chart.yLabels.length - 1)
          return (
            <div
              key={i}
              className="absolute text-[10px] text-muted-foreground"
              style={{
                left: -32,
                top: `calc(${pct * 100}% - 6px)`,
                width: 27,
                textAlign: "right",
              }}
            >
              {label}
            </div>
          )
        })}

        <svg
          viewBox={`0 0 ${CHART_W} ${CHART_H}`}
          preserveAspectRatio="none"
          className="size-full"
          style={{
            borderLeft: "0.5px solid var(--color-border)",
            borderBottom: "0.5px solid var(--color-border)",
          }}
        >
          {/* Grid lines */}
          {[1, 2].map((i) => {
            const y = (CHART_H / 3) * i
            return (
              <line
                key={i}
                x1={0}
                y1={y}
                x2={CHART_W}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={0.5}
                strokeDasharray="4"
              />
            )
          })}

          {/* Threshold line */}
          {thresholdY !== null && (
            <line
              x1={0}
              y1={thresholdY}
              x2={CHART_W}
              y2={thresholdY}
              stroke="#E24B4A"
              strokeWidth={1}
              strokeDasharray="6,3"
              opacity={0.4}
            />
          )}

          {/* OD line (solid) */}
          {odPoints.length > 1 && (
            <polyline
              points={odPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#378ADD"
              strokeWidth={2}
            />
          )}
          {odPoints.map((p, i) => (
            <circle
              key={`od-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={i === odPoints.length - 1 ? "#fff" : "#378ADD"}
              stroke="#378ADD"
              strokeWidth={i === odPoints.length - 1 ? 2 : 0}
            />
          ))}

          {/* OS line (dashed) */}
          {osPoints.length > 1 && (
            <polyline
              points={osPoints.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#D85A30"
              strokeWidth={2}
              strokeDasharray="6,3"
            />
          )}
          {osPoints.map((p, i) => (
            <circle
              key={`os-${i}`}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={i === osPoints.length - 1 ? "#fff" : "#D85A30"}
              stroke="#D85A30"
              strokeWidth={i === osPoints.length - 1 ? 2 : 0}
            />
          ))}
        </svg>
      </div>

      {/* X-axis labels */}
      <div
        className="mt-1.5 flex justify-between text-[10px] text-muted-foreground"
        style={{ marginLeft: 32 }}
      >
        {chart.data.map((d, i) => (
          <span key={i}>{d.date}</span>
        ))}
      </div>
    </div>
  )
}

export function TabTrends({ charts }: TabTrendsProps) {
  if (charts.length === 0) {
    return (
      <div className="py-12 text-center text-[13px] text-muted-foreground">
        Cần ít nhất 1 lần khám để hiển thị xu hướng
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {charts.map((chart) => (
        <TrendChartCard key={chart.id} chart={chart} />
      ))}
    </div>
  )
}
