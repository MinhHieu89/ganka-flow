import {
  DOCTOR_COLORS,
  getTimeSlotsForDate,
  mockDoctors,
  type Appointment,
} from "@/data/mock-appointments"
import { cn } from "@/lib/utils"

const DAY_NAMES: Record<number, string> = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
}

const TODAY = "2026-04-01"

interface WeekViewProps {
  weekDates: string[]
  appointments: Appointment[]
  doctorFilter: string
  onClickAppointment: (appointment: Appointment, anchorEl: HTMLElement) => void
  onClickEmptySlot: (date: string, time: string, doctor?: string) => void
}

export function WeekView({
  weekDates,
  appointments,
  doctorFilter,
  onClickAppointment,
  onClickEmptySlot,
}: WeekViewProps) {
  // Build union of all time slots across the 6 days
  const allTimeSlotsSet = new Set<string>()
  const validSlotsMap = new Map<string, Set<string>>()

  for (const date of weekDates) {
    const slots = getTimeSlotsForDate(date)
    const slotSet = new Set(slots)
    validSlotsMap.set(date, slotSet)
    for (const slot of slots) {
      allTimeSlotsSet.add(slot)
    }
  }

  const allTimeSlots = Array.from(allTimeSlotsSet).sort()

  // Group appointments by date_time key, filter by doctor, exclude cancelled
  const appointmentMap = new Map<string, Appointment[]>()

  for (const apt of appointments) {
    if (apt.status === "cancelled") continue
    if (
      doctorFilter &&
      doctorFilter !== "all" &&
      apt.doctorName !== doctorFilter
    )
      continue

    const key = `${apt.date}_${apt.time}`
    if (!appointmentMap.has(key)) {
      appointmentMap.set(key, [])
    }
    appointmentMap.get(key)!.push(apt)
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Grid */}
      <div
        className="overflow-hidden rounded-lg border border-border"
        style={{ display: "grid", gridTemplateColumns: "60px repeat(6, 1fr)" }}
      >
        {/* Header row */}
        <div className="border-b border-border bg-muted/50 p-2" />
        {weekDates.map((date) => {
          const d = new Date(date + "T00:00:00")
          const dayOfWeek = d.getDay()
          const dayNum = d.getDate()
          const dayName = DAY_NAMES[dayOfWeek]
          const isToday = date === TODAY
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          return (
            <div
              key={date}
              className="flex flex-col items-center justify-center border-b border-l border-border bg-muted/50 py-2"
            >
              <span
                className={cn(
                  "text-xs font-medium text-muted-foreground",
                  isWeekend && "text-amber-500"
                )}
              >
                {dayName}
              </span>
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 items-center justify-center text-sm font-semibold",
                  isToday && "rounded-full bg-primary text-primary-foreground"
                )}
              >
                {dayNum}
              </span>
            </div>
          )
        })}

        {/* Time rows */}
        {allTimeSlots.map((time) => {
          const isHalfHour = time.endsWith(":30")

          return (
            <div key={time} className="contents">
              {/* Time label */}
              <div
                className={cn(
                  "flex items-start justify-end border-b border-border px-2 pt-1",
                  isHalfHour && "border-dashed"
                )}
              >
                <span className="text-xs text-muted-foreground">{time}</span>
              </div>

              {/* Day cells */}
              {weekDates.map((date) => {
                const isValid = validSlotsMap.get(date)?.has(time) ?? false
                const key = `${date}_${time}`
                const cellAppointments = appointmentMap.get(key) || []

                return (
                  <div
                    key={`${date}_${time}`}
                    className={cn(
                      "min-h-[48px] cursor-pointer border-b border-l border-border p-0.5 transition-colors",
                      isHalfHour && "border-dashed",
                      !isValid && "bg-muted/30",
                      isValid && "hover:bg-accent/50"
                    )}
                    onClick={() => {
                      if (isValid) {
                        onClickEmptySlot(date, time)
                      }
                    }}
                  >
                    {cellAppointments.map((apt) => {
                      const colors = DOCTOR_COLORS[apt.doctorName] ?? {
                        bg: "bg-gray-50 dark:bg-gray-950/30",
                        border: "border-gray-200 dark:border-gray-800",
                        text: "text-gray-800 dark:text-gray-300",
                        dot: "bg-gray-500",
                      }

                      return (
                        <button
                          key={apt.id}
                          className={cn(
                            "mb-0.5 w-full rounded border px-1.5 py-1 text-left text-xs transition-all hover:-translate-y-0.5 hover:shadow-md",
                            colors.bg,
                            colors.border,
                            colors.text
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onClickAppointment(apt, e.currentTarget)
                          }}
                        >
                          <div className="truncate font-medium">
                            {apt.patientName}
                          </div>
                          <div className="truncate opacity-75">
                            {apt.doctorName}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend bar */}
      <div className="flex items-center gap-4 px-1 text-xs text-muted-foreground">
        {mockDoctors.map((doc) => {
          const colors = DOCTOR_COLORS[doc.name]
          return (
            <div key={doc.id} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-block h-2.5 w-2.5 rounded-full",
                  colors?.dot
                )}
              />
              <span>{doc.name}</span>
            </div>
          )
        })}
        <span className="ml-auto opacity-60">
          Nhấn vào ô trống để đặt lịch hẹn
        </span>
      </div>
    </div>
  )
}
