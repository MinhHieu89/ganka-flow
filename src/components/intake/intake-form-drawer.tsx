import { useState } from "react"
import { toast } from "sonner"
import type { Patient, Visit } from "@/data/mock-patients"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { IntakeFormEditable } from "./intake-form-editable"

interface IntakeFormDrawerProps {
  patient: Patient
  visit?: Visit
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Patient>) => void
}

export function IntakeFormDrawer({
  patient,
  visit,
  open,
  onOpenChange,
  onSave,
}: IntakeFormDrawerProps) {
  const [dangerousSymptoms, setDangerousSymptoms] = useState<
    Record<string, boolean>
  >(
    () =>
      visit?.dangerousSymptoms ?? {
        eyePain: false,
        suddenVisionLoss: false,
        asymmetry: false,
      }
  )
  const [specializedPackages, setSpecializedPackages] = useState<string[]>(
    () => visit?.specializedPackages ?? []
  )

  function handleSave(data: Partial<Patient>) {
    onSave(data)
    onOpenChange(false)
    toast.success("Đã lưu thay đổi")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[50vw] max-w-[50vw]! gap-0 overflow-hidden p-6 pb-2"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Phiếu tiếp nhận — {patient.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Chỉnh sửa thông tin phiếu tiếp nhận
          </SheetDescription>
        </SheetHeader>
        <IntakeFormEditable
          patient={patient}
          dangerousSymptoms={dangerousSymptoms}
          specializedPackages={specializedPackages}
          onDangerousSymptomsChange={setDangerousSymptoms}
          onSpecializedPackagesChange={setSpecializedPackages}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
