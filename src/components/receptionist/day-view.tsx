import {
  DOCTOR_COLORS,
  getTimeSlotsForDate,
  mockDoctors,
  type Appointment,
} from "@/data/mock-appointments"
import { cn } from "@/lib/utils"

interface DayViewProps {
  date: string // yyyy-mm-dd
  appointments: Appointment[]
  onClickAppointment: (appointment: Appointment, anchorEl: HTMLElement) => void
  onClickEmptySlot: (date: string, time: string, doctor?: string) => void
}

export function DayView({
  date,
  appointments,
  onClickAppointment,
  onClickEmptySlot,
}: DayViewProps) {
  const timeSlots = getTimeSlotsForDate(date)

  // Filter appointments for this date, exclude cancelled
  const dayAppointments = appointments.filter(
    (appt) => appt.date === date && appt.status !== "cancelled"
  )

  // Group by doctor then by time slot
  const appointmentMap = new Map<string, Map<string, Appointment[]>>()
  for (const doc of mockDoctors) {
    const docMap = new Map<string, Appointment[]>()
    for (const slot of timeSlots) {
      docMap.set(slot, [])
    }
    appointmentMap.set(doc.name, docMap)
  }

  for (const appt of dayAppointments) {
    const docMap = appointmentMap.get(appt.doctorName)
    if (docMap) {
      const slotAppts = docMap.get(appt.time)
      if (slotAppts) {
        slotAppts.push(appt)
      }
    }
  }

  // Count appointments per doctor
  const doctorCounts = new Map<string, number>()
  for (const doc of mockDoctors) {
    doctorCounts.set(
      doc.name,
      dayAppointments.filter((a) => a.doctorName === doc.name).length
    )
  }

  // Count empty slots
  let emptySlotCount = 0
  for (const doc of mockDoctors) {
    const docMap = appointmentMap.get(doc.name)!
    for (const slot of timeSlots) {
      if (docMap.get(slot)!.length === 0) {
        emptySlotCount++
      }
    }
  }

  const totalAppointments = dayAppointments.length

  return (
    <div>
      {/* Grid */}
      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{
          display: "grid",
          gridTemplateColumns: `60px repeat(${mockDoctors.length}, 1fr)`,
        }}
      >
        {/* Header row */}
        <div className="border-b border-border bg-muted/50 p-2" />
        {mockDoctors.map((doc) => {
          const colors = DOCTOR_COLORS[doc.name]
          const count = doctorCounts.get(doc.name) ?? 0
          return (
            <div
              key={doc.id}
              className="border-b border-l border-border bg-muted/50 p-3 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span
                  className={cn(
                    "inline-block size-2.5 rounded-full",
                    colors?.dot
                  )}
                />
                <span className="text-sm font-semibold">{doc.name}</span>
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {count} lịch hẹn
              </div>
            </div>
          )
        })}

        {/* Time rows */}
        {timeSlots.map((slot, slotIdx) => {
          const isHalfHour = slot.endsWith(":30")
          return (
            <div key={slot} className="contents">
              {/* Time label */}
              <div
                className={cn(
                  "flex items-center justify-center border-b border-border px-1 text-xs font-medium",
                  "text-muted-foreground",
                  isHalfHour ? "border-dashed" : "border-solid",
                  slotIdx === timeSlots.length - 1 && "border-b-0"
                )}
                style={{ height: 64 }}
              >
                {slot}
              </div>

              {/* Doctor cells */}
              {mockDoctors.map((doc) => {
                const docMap = appointmentMap.get(doc.name)!
                const slotAppts = docMap.get(slot)!
                const colors = DOCTOR_COLORS[doc.name]
                const hasAppointment = slotAppts.length > 0

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      "group relative border-b border-l border-border",
                      isHalfHour ? "border-dashed" : "border-solid",
                      slotIdx === timeSlots.length - 1 && "border-b-0",
                      !hasAppointment && "cursor-pointer"
                    )}
                    style={{ height: 64 }}
                    onClick={() => {
                      if (!hasAppointment) {
                        onClickEmptySlot(date, slot, doc.name)
                      }
                    }}
                  >
                    {hasAppointment ? (
                      slotAppts.map((appt) => (
                        <button
                          key={appt.id}
                          className={cn(
                            "absolute inset-1 rounded-md border px-2 py-1 text-left",
                            colors?.bg,
                            colors?.border,
                            colors?.text
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onClickAppointment(
                              appt,
                              e.currentTarget as HTMLElement
                            )
                          }}
                        >
                          <div className="truncate text-xs font-medium">
                            {appt.time} – {appt.endTime}
                          </div>
                          <div className="truncate text-xs font-semibold">
                            {appt.patientName}
                          </div>
                          {appt.reason && (
                            <div className="truncate text-[10px] text-muted-foreground">
                              {appt.reason}
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-[calc(100%-8px)] w-[calc(100%-8px)] items-center justify-center rounded-md border border-dashed border-border/50">
                          <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                            + Đặt lịch
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">
            {totalAppointments}
          </span>{" "}
          lịch hẹn
        </span>
        <span>
          <span className="font-medium text-foreground">{emptySlotCount}</span>{" "}
          slot trống
        </span>
        <span className="ml-auto">Nhấn vào slot trống để đặt lịch hẹn mới</span>
      </div>
    </div>
  )
}
