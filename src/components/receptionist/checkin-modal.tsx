import { useNavigate } from "react-router"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Visit } from "@/data/mock-patients"

interface CheckinModalProps {
  visit: Visit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckinModal({ visit, open, onOpenChange }: CheckinModalProps) {
  const { getPatient, checkInVisit } = useReceptionist()
  const navigate = useNavigate()

  if (!visit) return null

  const patient = getPatient(visit.patientId)
  if (!patient) return null

  const isComplete = Boolean(
    patient.dob &&
    patient.gender &&
    (visit.reason ||
      (patient.visitReasons && patient.visitReasons.length > 0) ||
      patient.chiefComplaint)
  )

  function handleConfirm() {
    if (isComplete) {
      checkInVisit(visit!.id)
      onOpenChange(false)
    } else {
      checkInVisit(visit!.id)
      onOpenChange(false)
      navigate(`/intake/${visit!.patientId}/edit`)
    }
  }

  const fields = [
    { label: "Họ tên", value: patient.name },
    { label: "Năm sinh", value: patient.birthYear?.toString() },
    { label: "Giới tính", value: patient.gender },
    { label: "SĐT", value: patient.phone },
    { label: "Nghề nghiệp", value: patient.occupation },
    {
      label: "Lý do khám",
      value:
        visit.reason ||
        (patient.visitReasons && patient.visitReasons.length > 0
          ? patient.visitReasons.join(", ")
          : patient.chiefComplaint),
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Check-in bệnh nhân</DialogTitle>
          <DialogDescription>
            {isComplete
              ? "Xác nhận thông tin trước khi check-in"
              : "Hồ sơ cần bổ sung trước khi check-in"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {fields.map((f) => (
            <div key={f.label}>
              <div className="text-xs text-muted-foreground">{f.label}</div>
              {f.value ? (
                <div className="mt-0.5 text-sm font-semibold">{f.value}</div>
              ) : (
                <div className="mt-0.5 text-sm text-muted-foreground/50 italic">
                  Chưa có
                </div>
              )}
            </div>
          ))}
        </div>

        {visit.lastVisitDate && (
          <div className="text-sm">
            <span className="text-muted-foreground">Lần khám gần nhất: </span>
            {visit.lastVisitDate} — {visit.lastVisitDiagnosis} —{" "}
            {visit.lastVisitDoctor}
          </div>
        )}

        {isComplete ? (
          <div className="flex items-start gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
            <span className="mt-0.5">ℹ</span>
            <span>Xác nhận thông tin với bệnh nhân trước khi check-in.</span>
          </div>
        ) : (
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
            <span className="mt-0.5">⚠</span>
            <span>
              Hồ sơ bệnh nhân chưa đầy đủ. Cần bổ sung thông tin bắt buộc trước
              khi check-in.
            </span>
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="link"
            className="px-0 text-primary"
            onClick={() => {
              onOpenChange(false)
              navigate(`/intake/${visit.patientId}/edit`)
            }}
          >
            Sửa thông tin
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirm}>
              {isComplete ? "Xác nhận check-in" : "Check-in & bổ sung hồ sơ →"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
