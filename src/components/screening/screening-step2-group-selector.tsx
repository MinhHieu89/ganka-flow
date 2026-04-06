import { HugeiconsIcon } from "@hugeicons/react"
import { Tag01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { DiseaseGroup } from "@/data/mock-patients"

interface ScreeningStep2GroupSelectorProps {
  selectedGroups: DiseaseGroup[]
  onToggle: (group: DiseaseGroup) => void
}

const DISEASE_GROUPS: {
  key: DiseaseGroup
  label: string
  testCount: number
}[] = [
  { key: "dryEye", label: "Khô mắt", testCount: 5 },
  { key: "refraction", label: "Khúc xạ", testCount: 3 },
  { key: "myopiaControl", label: "Cận thị", testCount: 4 },
  { key: "general", label: "Tổng quát", testCount: 4 },
]

export { DISEASE_GROUPS }

export function ScreeningStep2GroupSelector({
  selectedGroups,
  onToggle,
}: ScreeningStep2GroupSelectorProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4 min-w-28">
      <div className="mb-3 flex items-center gap-2">
        <HugeiconsIcon icon={Tag01Icon} className="size-4" strokeWidth={1.5} />
        <span className="text-sm font-semibold">Chọn nhóm bệnh</span>
        <span className="text-xs text-muted-foreground">
          (chọn 1 hoặc nhiều)
        </span>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Chọn nhóm bệnh"
      >
        {DISEASE_GROUPS.map((group) => {
          const isSelected = selectedGroups.includes(group.key)
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onToggle(group.key)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors",
                isSelected
                  ? "border-2 border-primary bg-primary/5 font-medium text-primary"
                  : "border border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              {group.label}
              {isSelected && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selectedGroups.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Chọn ít nhất 1 nhóm bệnh để tiếp tục
        </p>
      )}
    </section>
  )
}
