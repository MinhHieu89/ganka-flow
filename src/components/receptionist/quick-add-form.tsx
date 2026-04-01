import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PatientSearch } from "@/components/receptionist/patient-search"
import { useReceptionist } from "@/contexts/receptionist-context"
import { mockDoctors } from "@/data/mock-appointments"
import type { Patient } from "@/data/mock-patients"

interface QuickAddFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: string
  time: string
  prefilledDoctor?: string
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number)
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`
}

export function QuickAddForm({
  open,
  onOpenChange,
  date,
  time,
  prefilledDoctor,
}: QuickAddFormProps) {
  const { addAppointment, addVisit } = useReceptionist()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [doctorName, setDoctorName] = useState(prefilledDoctor ?? "")
  const [reason, setReason] = useState("")

  const endTime = addMinutes(time, 30)

  const resetState = useCallback(() => {
    setSelectedPatient(null)
    setDoctorName(prefilledDoctor ?? "")
    setReason("")
  }, [prefilledDoctor])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  function handleConfirm() {
    if (!selectedPatient || !doctorName) return

    addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date,
      time,
      endTime,
      reason,
      doctorName,
      status: "upcoming",
      phone: selectedPatient.phone,
    })

    addVisit({
      patientId: selectedPatient.id,
      status: "chua_den",
      source: "hen",
      reason,
      scheduledAt: time,
      date,
      doctorName,
    })

    resetState()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Đặt lịch nhanh</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {time} – {endTime} · {prefilledDoctor ?? "Chọn bác sĩ"}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient search */}
          <div className="space-y-2">
            <Label>Bệnh nhân</Label>
            <PatientSearch onSelectPatient={setSelectedPatient} />
            {selectedPatient && (
              <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300">
                <svg
                  className="size-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>
                  {selectedPatient.name} · {selectedPatient.id} ·{" "}
                  {selectedPatient.phone}
                </span>
              </div>
            )}
          </div>

          {/* Doctor selector */}
          <div className="space-y-2">
            <Label>Bác sĩ</Label>
            <Select value={doctorName} onValueChange={setDoctorName}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn bác sĩ" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map((doc) => (
                  <SelectItem key={doc.id} value={doc.name}>
                    {doc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label>Lý do khám</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Tái khám, khám mắt khô, đo khúc xạ..."
              maxLength={500}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPatient || !doctorName}
          >
            Xác nhận đặt lịch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
