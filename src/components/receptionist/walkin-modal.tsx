import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"

interface WalkinModalProps {
  patient: Patient | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WalkinModal({ patient, open, onOpenChange }: WalkinModalProps) {
  const { addVisit } = useReceptionist()
  const navigate = useNavigate()
  const [reason, setReason] = useState("")

  if (!patient) return null

  function handleCreate() {
    if (!reason.trim()) return
    addVisit({
      patientId: patient!.id,
      status: "cho_kham",
      source: "walk_in",
      reason: reason.trim(),
      date: "2026-04-01",
      checkedInAt: new Date().toISOString(),
    })
    setReason("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Tạo lượt khám mới</DialogTitle>
            <Badge
              variant="secondary"
              className="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
            >
              Walk-in
            </Badge>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          <div>
            <div className="text-xs text-muted-foreground">Họ tên</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Năm sinh</div>
            <div className="mt-0.5 text-sm font-semibold">
              {patient.birthYear}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Giới tính</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.gender}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">SĐT</div>
            <div className="mt-0.5 text-sm font-semibold">{patient.phone}</div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">
            Lý do khám lần này <span className="text-destructive">*</span>
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, 500))}
            placeholder="Nhập lý do khám..."
            rows={3}
          />
          <div className="mt-1 text-right text-xs text-muted-foreground">
            {reason.length} / 500
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="link"
            className="px-0 text-primary"
            onClick={() => {
              onOpenChange(false)
              navigate(`/intake/${patient.id}/edit`)
            }}
          >
            Sửa thông tin
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={!reason.trim()}>
              Tạo lượt khám
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
