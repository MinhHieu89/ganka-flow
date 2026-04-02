import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { DiseaseGroup, DryEyeFormData } from "@/data/mock-patients"
import { DISEASE_GROUPS } from "./screening-step2-group-selector"
import { ScreeningStep2DryEye } from "./screening-step2-dry-eye"
import { ScreeningStep2PlaceholderGroup } from "./screening-step2-placeholder-group"

interface ScreeningStep2GroupFormProps {
  group: DiseaseGroup
  dryEyeData: DryEyeFormData
  onDryEyeUpdate: (data: DryEyeFormData) => void
}

export function ScreeningStep2GroupForm({
  group,
  dryEyeData,
  onDryEyeUpdate,
}: ScreeningStep2GroupFormProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const groupInfo = DISEASE_GROUPS.find((g) => g.key === group)!

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-background"
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Kéo để sắp xếp"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <span className="text-lg">{groupInfo.icon}</span>
        <span className="text-sm font-semibold">{groupInfo.label}</span>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {groupInfo.testCount} tests
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        {group === "dryEye" ? (
          <ScreeningStep2DryEye data={dryEyeData} onUpdate={onDryEyeUpdate} />
        ) : (
          <ScreeningStep2PlaceholderGroup group={group} />
        )}
      </div>
    </div>
  )
}
