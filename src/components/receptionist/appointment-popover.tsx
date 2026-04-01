import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DOCTOR_COLORS, type Appointment } from "@/data/mock-appointments"

interface AppointmentPopoverProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: (id: string) => void
}

const VIET_DAY_NAMES: Record<number, string> = {
  0: "Chủ Nhật",
  1: "Thứ Hai",
  2: "Thứ Ba",
  3: "Thứ Tư",
  4: "Thứ Năm",
  5: "Thứ Sáu",
  6: "Thứ Bảy",
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase()
}

function formatDateViet(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const dayName = VIET_DAY_NAMES[date.getDay()]
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  return `${dayName} ${dd}/${mm}`
}

export function AppointmentPopover({
  appointment,
  open,
  onOpenChange,
  onCancel,
}: AppointmentPopoverProps) {
  const navigate = useNavigate()

  if (!appointment) return null

  const doctorColor = DOCTOR_COLORS[appointment.doctorName]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
              {getInitials(appointment.patientName)}
            </div>
            <div>
              <DialogTitle className="text-base">
                {appointment.patientName}
              </DialogTitle>
              <p className="text-muted-foreground text-sm">
                {appointment.patientId}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-16 shrink-0 text-sm">
              Trạng thái
            </span>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-300"
            >
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-green-600" />
              Sắp tới
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-16 shrink-0 text-sm">
              Thời gian
            </span>
            <span className="text-sm">
              {appointment.time} – {appointment.endTime},{" "}
              {formatDateViet(appointment.date)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-muted-foreground w-16 shrink-0 text-sm">
              Bác sĩ
            </span>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  doctorColor?.dot
                )}
              />
              <span className="text-sm">{appointment.doctorName}</span>
            </div>
          </div>

          {appointment.reason && (
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-16 shrink-0 text-sm">
                Lý do
              </span>
              <span className="text-sm">{appointment.reason}</span>
            </div>
          )}

          {appointment.phone && (
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-16 shrink-0 text-sm">
                SĐT
              </span>
              <span className="text-sm">{appointment.phone}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            className="text-destructive"
            onClick={() => {
              onCancel(appointment.id)
              onOpenChange(false)
            }}
          >
            Hủy lịch
          </Button>
          <Button variant="outline" disabled>
            Đổi lịch
          </Button>
          <Button
            onClick={() => {
              navigate(`/intake/${appointment.patientId}/edit`)
              onOpenChange(false)
            }}
          >
            Xem hồ sơ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
