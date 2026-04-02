import type { DiseaseGroup } from "@/data/mock-patients"

interface ScreeningStep2PlaceholderGroupProps {
  group: DiseaseGroup
}

const GROUP_TESTS: Record<DiseaseGroup, string[]> = {
  dryEye: [], // not used — Dry Eye has its own form
  refraction: ["Full refraction", "Current glasses", "VA"],
  myopiaControl: ["Axial length", "Progression", "Lifestyle", "Risk scoring"],
  general: ["VA", "IOP", "Slit-lamp", "Fundus"],
}

export function ScreeningStep2PlaceholderGroup({
  group,
}: ScreeningStep2PlaceholderGroupProps) {
  const tests = GROUP_TESTS[group]
  const cols = tests.length === 3 ? "grid-cols-3" : "grid-cols-2"

  return (
    <div className={`grid ${cols} gap-3`}>
      {tests.map((test) => (
        <div
          key={test}
          className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center dark:bg-muted/30"
        >
          <p className="text-sm font-medium text-foreground">{test}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Chi tiết sẽ được thiết kế sau
          </p>
        </div>
      ))}
    </div>
  )
}
