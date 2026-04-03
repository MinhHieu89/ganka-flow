import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const DOCTORS = [
  { id: "doc-1", name: "BS. Nguyễn Thị Mai" },
  { id: "doc-2", name: "BS. Trần Văn Hùng" },
  { id: "doc-3", name: "BS. Nguyễn Hải" },
  { id: "doc-4", name: "BS. Trần Minh" },
]

interface CreateVisitDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName: string
}

export function CreateVisitDialog({
  open,
  onOpenChange,
  patientName,
}: CreateVisitDialogProps) {
  const [doctor, setDoctor] = useState("")
  const [reason, setReason] = useState("")

  function handleSubmit() {
    // TODO: navigate to doctor exam page with selected doctor + reason
    onOpenChange(false)
    setDoctor("")
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Tạo lượt khám</DialogTitle>
          <DialogDescription>
            Tạo lượt khám mới cho {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="doctor">Bác sĩ khám</Label>
            <Select value={doctor} onValueChange={setDoctor}>
              <SelectTrigger id="doctor">
                <SelectValue placeholder="Chọn bác sĩ" />
              </SelectTrigger>
              <SelectContent>
                {DOCTORS.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reason">Lý do khám</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do đến khám..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!doctor || !reason.trim()}
            className="bg-[#1D9E75] text-white hover:bg-[#0F6E56]"
          >
            Tạo lượt khám
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
