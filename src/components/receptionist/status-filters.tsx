import { cn } from "@/lib/utils"
import { type PatientStatus } from "@/data/mock-patients"

const filters: { key: PatientStatus | "all"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "chua_den", label: "Chưa đến" },
  { key: "cho_kham", label: "Chờ khám" },
  { key: "dang_sang_loc", label: "Đang sàng lọc" },
  { key: "dang_kham", label: "Đang khám" },
  { key: "hoan_thanh", label: "Hoàn thành" },
  { key: "da_huy", label: "Đã hủy" },
]

interface StatusFiltersProps {
  activeFilter: PatientStatus | "all"
  onFilterChange: (filter: PatientStatus | "all") => void
  counts: Record<PatientStatus | "all", number>
}

export function StatusFilters({
  activeFilter,
  onFilterChange,
  counts,
}: StatusFiltersProps) {
  return (
    <div className="flex gap-1">
      {filters.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilterChange(f.key)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            activeFilter === f.key
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {f.label}
          {f.key !== "all" && ` (${counts[f.key]})`}
        </button>
      ))}
    </div>
  )
}
