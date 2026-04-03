import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useRef, useCallback } from "react"

export type PharmacyFilter = "all" | "pending" | "dispensed"

const filters: { key: PharmacyFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ phát" },
  { key: "dispensed", label: "Đã phát" },
]

interface PharmacyStatusFiltersProps {
  activeFilter: PharmacyFilter
  onFilterChange: (filter: PharmacyFilter) => void
  counts: Record<PharmacyFilter, number>
  search: string
  onSearchChange: (value: string) => void
}

export function PharmacyStatusFilters({
  activeFilter,
  onFilterChange,
  counts,
  search,
  onSearchChange,
}: PharmacyStatusFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange],
  )

  return (
    <div className="flex items-center justify-between">
      <div className="relative w-[300px]">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder="Tìm theo tên, mã BN, BS kê đơn..."
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={cn(
              "rounded-full border px-3.5 py-1 text-xs font-medium transition-colors",
              activeFilter === f.key
                ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                : "border-border text-muted-foreground hover:border-muted-foreground/30",
            )}
          >
            {f.label} {counts[f.key]}
          </button>
        ))}
      </div>
    </div>
  )
}
