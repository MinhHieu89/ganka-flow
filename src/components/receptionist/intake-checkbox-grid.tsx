import { cn } from "@/lib/utils"

interface CheckboxGridItem {
  key: string
  label: string
}

interface CheckboxGridProps {
  items: CheckboxGridItem[]
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
  columns?: 2 | 3
}

export function CheckboxGrid({
  items,
  values,
  onChange,
  columns = 2,
}: CheckboxGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "grid-cols-3" : "grid-cols-2"
      )}
      role="group"
    >
      {items.map((item) => (
        <label
          key={item.key}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
            values[item.key] ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <input
            type="checkbox"
            checked={values[item.key] ?? false}
            onChange={(e) => onChange(item.key, e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
