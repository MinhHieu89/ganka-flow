import { FirstAidKitIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

const PACKAGE_OPTIONS = [
  { key: "dry-eye", label: "Khám chuyên sâu Khô mắt" },
  { key: "myopia-control", label: "Khám chuyên sâu Cận thị" },
]

interface IntakeSpecializedPackagesProps {
  packages: string[]
  onUpdate: (packages: string[]) => void
}

export function IntakeSpecializedPackages({
  packages,
  onUpdate,
}: IntakeSpecializedPackagesProps) {
  function togglePackage(key: string) {
    if (packages.includes(key)) {
      onUpdate(packages.filter((p) => p !== key))
    } else {
      onUpdate([...packages, key])
    }
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <HugeiconsIcon
          icon={FirstAidKitIcon}
          className="size-5 text-teal-600 dark:text-teal-400"
          strokeWidth={1.5}
        />
        <h2 className="text-[15px] font-bold text-teal-600 dark:text-teal-400">
          Gói khám chuyên sâu
        </h2>
      </div>

      <div
        className="grid grid-cols-2 gap-2.5"
        role="group"
        aria-label="Chọn gói khám chuyên sâu"
      >
        {PACKAGE_OPTIONS.map((opt) => {
          const isChecked = packages.includes(opt.key)
          return (
            <label
              key={opt.key}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
                isChecked
                  ? "border-teal-500 bg-teal-500/5 dark:border-teal-600"
                  : "border-border"
              )}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => togglePackage(opt.key)}
                className="size-4 accent-teal-600"
              />
              {opt.label}
            </label>
          )
        })}
      </div>
    </section>
  )
}
