import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

interface ScreeningOtherTestCardProps {
  title: string
  odValue: string
  osValue: string
  onOdChange: (value: string) => void
  onOsChange: (value: string) => void
  defaultOpen?: boolean
}

export function ScreeningOtherTestCard({
  title,
  odValue,
  osValue,
  onOdChange,
  onOsChange,
  defaultOpen = true,
}: ScreeningOtherTestCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-background">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center px-3.5 py-2.5"
          >
            <span className="text-sm font-semibold">{title}</span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn(
                "ml-auto size-3.5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="grid grid-cols-2 gap-2 border-t border-border px-3.5 py-3">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                OD
              </span>
              <Input
                value={odValue}
                onChange={(e) => onOdChange(e.target.value)}
                className="h-8 text-xs"
                aria-label={`${title} OD`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-sky-500 px-2 py-0.5 text-[10px] font-bold text-white">
                OS
              </span>
              <Input
                value={osValue}
                onChange={(e) => onOsChange(e.target.value)}
                className="h-8 text-xs"
                aria-label={`${title} OS`}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
