import { toast } from "sonner"
import type { Patient } from "@/data/mock-patients"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { ScreeningIntakeFormEditable } from "./screening-intake-form-editable"

interface ScreeningIntakeDrawerProps {
  patient: Patient
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: Partial<Patient>) => void
}

export function ScreeningIntakeDrawer({
  patient,
  open,
  onOpenChange,
  onSave,
}: ScreeningIntakeDrawerProps) {
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
        <ScreeningIntakeFormEditable
          patient={patient}
          onSave={handleSave}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}
