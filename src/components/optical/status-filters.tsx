import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { useRef, useCallback } from "react"

interface FilterOption<T extends string> {
  key: T
  label: string
}

interface OpticalStatusFiltersProps<T extends string> {
  filters: FilterOption<T>[]
  activeFilter: T
  onFilterChange: (filter: T) => void
  counts?: Record<T, number>
  searchPlaceholder: string
  search: string
  onSearchChange: (value: string) => void
}

export function OpticalStatusFilters<T extends string>({
  filters,
  activeFilter,
  onFilterChange,
  counts,
  searchPlaceholder,
  search,
  onSearchChange,
}: OpticalStatusFiltersProps<T>) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleSearch = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, 300)
    },
    [onSearchChange]
  )

  return (
    <div className="flex items-center justify-between">
      <div className="relative w-[280px]">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.5}
        />
        <Input
          placeholder={searchPlaceholder}
          defaultValue={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
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
            {counts && ` ${counts[f.key]}`}
          </button>
        ))}
      </div>
    </div>
  )
}
