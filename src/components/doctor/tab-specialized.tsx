import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Visit, DryEyeFormData } from "@/data/mock-patients"
import { SpecializedPackageCard } from "./specialized-package-card"
import { SpecializedDryEyeForm } from "./specialized-dry-eye-form"

const AVAILABLE_PACKAGES = [
  { key: "dry-eye", label: "Khám chuyên sâu Khô mắt" },
  { key: "myopia-control", label: "Khám chuyên sâu Cận thị" },
]

const EMPTY_DRY_EYE: DryEyeFormData = {
  osdiScore: null,
  osdiAnswers: [null, null, null, null, null, null],
  osdiSeverity: null,
  tbutOd: "",
  tbutOs: "",
  schirmerOd: "",
  schirmerOs: "",
  meibomian: "",
  staining: "",
}

interface TabSpecializedProps {
  visit: Visit
  packageData: Record<string, DryEyeFormData>
  onPackageDataChange: (data: Record<string, DryEyeFormData>) => void
  packages: string[]
  onPackagesChange: (packages: string[]) => void
}

export function TabSpecialized({
  visit,
  packageData,
  onPackageDataChange,
  packages,
  onPackagesChange,
}: TabSpecializedProps) {
  const receptionistPackages = visit.specializedPackages ?? []
  const [doctorAddedPackages, setDoctorAddedPackages] = useState<string[]>(
    () => packages.filter((p) => !receptionistPackages.includes(p))
  )

  const allPackages = packages

  const availableToAdd = AVAILABLE_PACKAGES.filter(
    (p) => !allPackages.includes(p.key)
  )

  function handleAddPackage(key: string) {
    setDoctorAddedPackages((prev) => [...prev, key])
    onPackagesChange([...packages, key])
  }

  function handleDryEyeUpdate(data: DryEyeFormData) {
    onPackageDataChange({ ...packageData, "dry-eye": data })
  }

  function getPackageLabel(key: string) {
    return AVAILABLE_PACKAGES.find((p) => p.key === key)?.label ?? key
  }

  function getRegisteredBy(key: string): "receptionist" | "doctor" {
    return receptionistPackages.includes(key) ? "receptionist" : "doctor"
  }

  void doctorAddedPackages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
          Gói đã đăng ký
        </span>
        {availableToAdd.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-dashed border-teal-400 text-xs text-teal-600 hover:bg-teal-50 dark:border-teal-700 dark:text-teal-400 dark:hover:bg-teal-950/30"
              >
                + Thêm gói khám
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableToAdd.map((pkg) => (
                <DropdownMenuItem
                  key={pkg.key}
                  onClick={() => handleAddPackage(pkg.key)}
                >
                  {pkg.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {allPackages.length === 0 && (
        <div className="rounded-lg border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
          Chưa có gói khám chuyên sâu nào được đăng ký
        </div>
      )}

      {allPackages.map((key, i) => (
        <SpecializedPackageCard
          key={key}
          title={getPackageLabel(key)}
          registeredBy={getRegisteredBy(key)}
          defaultOpen={i === 0}
        >
          {key === "dry-eye" ? (
            <SpecializedDryEyeForm
              data={packageData["dry-eye"] ?? EMPTY_DRY_EYE}
              onUpdate={handleDryEyeUpdate}
            />
          ) : (
            <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
              Biểu mẫu cho gói này sẽ được bổ sung sau
            </div>
          )}
        </SpecializedPackageCard>
      ))}
    </div>
  )
}
