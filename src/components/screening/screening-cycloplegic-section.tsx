import { Switch } from "@/components/ui/switch"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { RefractionTable } from "./screening-refraction-table"
import type { RefractionEyeRow, CycloplegicAgent } from "@/data/mock-patients"

interface ScreeningCycloplegicSectionProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  agents: CycloplegicAgent[]
  onAgentsChange: (agents: CycloplegicAgent[]) => void
  od: RefractionEyeRow
  os: RefractionEyeRow
  onOdChange: (field: string, value: string) => void
  onOsChange: (field: string, value: string) => void
}

const AGENT_OPTIONS: { key: CycloplegicAgent; label: string }[] = [
  { key: "cyclogyl", label: "Cyclogyl" },
  { key: "mydrinP", label: "Mydrin P" },
  { key: "atropine", label: "Atropine" },
]

export function ScreeningCycloplegicSection({
  enabled,
  onEnabledChange,
  agents,
  onAgentsChange,
  od,
  os,
  onOdChange,
  onOsChange,
}: ScreeningCycloplegicSectionProps) {
  function toggleAgent(agent: CycloplegicAgent) {
    if (agents.includes(agent)) {
      onAgentsChange(agents.filter((a) => a !== agent))
    } else {
      onAgentsChange([...agents, agent])
    }
  }

  return (
    <Collapsible open={enabled} onOpenChange={onEnabledChange}>
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Switch
            checked={enabled}
            onCheckedChange={onEnabledChange}
            aria-label="Bật liệt điều tiết"
          />
          <span className="text-sm text-muted-foreground">Liệt điều tiết</span>
          {!enabled && (
            <span className="text-xs text-muted-foreground/60">
              Cyclogyl / Mydrin P / Atropine
            </span>
          )}
        </div>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-3.5 py-3">
            <div className="flex gap-3">
              {AGENT_OPTIONS.map((opt) => (
                <label
                  key={opt.key}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
                    agents.includes(opt.key)
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={agents.includes(opt.key)}
                    onChange={() => toggleAgent(opt.key)}
                    className="size-3 accent-[var(--color-primary)]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <RefractionTable
              odData={od}
              osData={os}
              columns={["sph", "cyl", "axis", "va"]}
              onOdChange={onOdChange}
              onOsChange={onOsChange}
            />
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
