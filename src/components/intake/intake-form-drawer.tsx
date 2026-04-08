import type { Patient } from "@/data/mock-patients"
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
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Patient>) => void
}

export function IntakeFormDrawer({
  patient,
  open,
  onOpenChange,
  onSave,
}: IntakeFormDrawerProps) {
  function handleSave(data: Partial<Patient>) {
    onSave(data)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="w-[50vw] max-w-[50vw] overflow-y-auto p-6"
      >
        <SheetHeader className="p-0">
          <SheetTitle>Phiếu tiếp nhận — {patient.name}</SheetTitle>
          <SheetDescription className="sr-only">
            Chỉnh sửa thông tin phiếu tiếp nhận
          </SheetDescription>
        </SheetHeader>
        <IntakeFormEditable
          patient={patient}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
