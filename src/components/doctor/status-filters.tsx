import { cn } from "@/lib/utils"

type DoctorFilter = "all" | "cho_kham" | "dang_kham"

const filters: { key: DoctorFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "cho_kham", label: "Đang chờ" },
  { key: "dang_kham", label: "Đang khám" },
]

interface DoctorStatusFiltersProps {
  activeFilter: DoctorFilter
  onFilterChange: (filter: DoctorFilter) => void
  counts: Record<DoctorFilter, number>
}

export function DoctorStatusFilters({
  activeFilter,
  onFilterChange,
  counts,
}: DoctorStatusFiltersProps) {
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
          {f.label} {counts[f.key]}
        </button>
      ))}
    </div>
  )
}

export type { DoctorFilter }
