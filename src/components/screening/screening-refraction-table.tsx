import { Input } from "@/components/ui/input"

type ColumnKey = "sph" | "cyl" | "axis" | "va" | "add" | "vaNear"

interface EyeRowData {
  sph: string
  cyl: string
  axis: string
  va: string
  add?: string
  vaNear?: string
}

interface RefractionTableProps {
  odData: EyeRowData
  osData: EyeRowData
  columns: ColumnKey[]
  onOdChange: (field: string, value: string) => void
  onOsChange: (field: string, value: string) => void
}

const COLUMN_LABELS: Record<ColumnKey, string> = {
  sph: "SPH",
  cyl: "CYL",
  axis: "AXIS",
  va: "VA",
  add: "ADD",
  vaNear: "VA gần",
}

export function RefractionTable({
  odData,
  osData,
  columns,
  onOdChange,
  onOsChange,
}: RefractionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-14 px-1 py-1.5" />
            {columns.map((col) => (
              <th
                key={col}
                className="px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {COLUMN_LABELS[col]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-1 py-1">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                OD
              </span>
            </td>
            {columns.map((col) => (
              <td key={col} className="px-1 py-1">
                <Input
                  value={(odData as Record<string, string>)[col] ?? ""}
                  onChange={(e) => onOdChange(col, e.target.value)}
                  className="h-8 text-center text-xs"
                  aria-label={`OD ${COLUMN_LABELS[col]}`}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-1 py-1">
              <span className="rounded-md bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                OS
              </span>
            </td>
            {columns.map((col) => (
              <td key={col} className="px-1 py-1">
                <Input
                  value={(osData as Record<string, string>)[col] ?? ""}
                  onChange={(e) => onOsChange(col, e.target.value)}
                  className="h-8 text-center text-xs"
                  aria-label={`OS ${COLUMN_LABELS[col]}`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}
