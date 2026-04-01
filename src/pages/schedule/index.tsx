import { useState, useMemo, useCallback } from "react"
import { useReceptionist } from "@/contexts/receptionist-context"
import {
  CalendarToolbar,
  type CalendarView,
} from "@/components/receptionist/calendar-toolbar"
import { WeekView } from "@/components/receptionist/week-view"
import { DayView } from "@/components/receptionist/day-view"
import { AppointmentPopover } from "@/components/receptionist/appointment-popover"
import { QuickAddForm } from "@/components/receptionist/quick-add-form"
import type { Appointment } from "@/data/mock-appointments"

const TODAY = "2026-04-01" // hardcoded for mockup

const VIET_MONTHS = [
  "Th1",
  "Th2",
  "Th3",
  "Th4",
  "Th5",
  "Th6",
  "Th7",
  "Th8",
  "Th9",
  "Th10",
  "Th11",
  "Th12",
]

const VIET_FULL_MONTHS = [
  "tháng 1",
  "tháng 2",
  "tháng 3",
  "tháng 4",
  "tháng 5",
  "tháng 6",
  "tháng 7",
  "tháng 8",
  "tháng 9",
  "tháng 10",
  "tháng 11",
  "tháng 12",
]

const VIET_DAY_FULL: Record<number, string> = {
  0: "Chủ Nhật",
  1: "Thứ Hai",
  2: "Thứ Ba",
  3: "Thứ Tư",
  4: "Thứ Năm",
  5: "Thứ Sáu",
  6: "Thứ Bảy",
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00")
  date.setDate(date.getDate() + days)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00")
  const day = date.getDay() // 0=Sun, 6=Sat

  let offset: number
  if (day === 0) {
    offset = -5 // Sun -> go back 5 to get Tue
  } else if (day === 1) {
    offset = -6 // Mon -> go back 6 to get Tue
  } else {
    offset = 2 - day // Tue=0, Wed=-1, etc.
  }

  const tuesday = addDays(dateStr, offset)
  return Array.from({ length: 6 }, (_, i) => addDays(tuesday, i))
}

export function ScheduleCalendar() {
  const { appointments, cancelAppointment } = useReceptionist()

  const [view, setView] = useState<CalendarView>("week")
  const [currentDate, setCurrentDate] = useState(TODAY)
  const [doctorFilter, setDoctorFilter] = useState("all")
  const [popoverAppt, setPopoverAppt] = useState<Appointment | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddDate, setQuickAddDate] = useState("")
  const [quickAddTime, setQuickAddTime] = useState("")
  const [quickAddDoctor, setQuickAddDoctor] = useState<string | undefined>(
    undefined
  )

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  const dateLabel = useMemo(() => {
    if (view === "week") {
      const first = new Date(weekDates[0] + "T00:00:00")
      const last = new Date(weekDates[weekDates.length - 1] + "T00:00:00")
      const firstDay = String(first.getDate()).padStart(2, "0")
      const lastDay = String(last.getDate()).padStart(2, "0")
      const firstMonth = VIET_MONTHS[first.getMonth()]
      const lastMonth = VIET_MONTHS[last.getMonth()]
      const year = last.getFullYear()
      if (first.getMonth() === last.getMonth()) {
        return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth}, ${year}`
      }
      return `${firstDay} ${firstMonth} – ${lastDay} ${lastMonth}, ${year}`
    } else {
      const date = new Date(currentDate + "T00:00:00")
      const dayName = VIET_DAY_FULL[date.getDay()]
      const day = String(date.getDate()).padStart(2, "0")
      const month = VIET_FULL_MONTHS[date.getMonth()]
      return `${dayName}, ${day} ${month}`
    }
  }, [view, currentDate, weekDates])

  const todayLabel = useMemo(() => {
    if (view === "day" && currentDate === TODAY) {
      return "Hôm nay"
    }
    return undefined
  }, [view, currentDate])

  const handlePrev = useCallback(() => {
    setCurrentDate((prev) => addDays(prev, view === "week" ? -7 : -1))
  }, [view])

  const handleNext = useCallback(() => {
    setCurrentDate((prev) => addDays(prev, view === "week" ? 7 : 1))
  }, [view])

  const handleToday = useCallback(() => {
    setCurrentDate(TODAY)
  }, [])

  const handleClickAppointment = useCallback((appt: Appointment) => {
    setPopoverAppt(appt)
    setPopoverOpen(true)
  }, [])

  const handleClickEmptySlot = useCallback(
    (date: string, time: string, doctor?: string) => {
      setQuickAddDate(date)
      setQuickAddTime(time)
      setQuickAddDoctor(doctor)
      setQuickAddOpen(true)
    },
    []
  )

  return (
    <div className="flex flex-1 flex-col">
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        dateLabel={dateLabel}
        todayLabel={todayLabel}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        doctorFilter={doctorFilter}
        onDoctorFilterChange={setDoctorFilter}
        showDoctorFilter={view === "week"}
      />
      <div className="flex-1 overflow-auto">
        {view === "week" ? (
          <WeekView
            weekDates={weekDates}
            appointments={appointments}
            doctorFilter={doctorFilter}
            onClickAppointment={handleClickAppointment}
            onClickEmptySlot={handleClickEmptySlot}
          />
        ) : (
          <DayView
            date={currentDate}
            appointments={appointments}
            onClickAppointment={handleClickAppointment}
            onClickEmptySlot={handleClickEmptySlot}
          />
        )}
      </div>
      <AppointmentPopover
        appointment={popoverAppt}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
        onCancel={cancelAppointment}
      />
      <QuickAddForm
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        date={quickAddDate}
        time={quickAddTime}
        prefilledDoctor={quickAddDoctor}
      />
    </div>
  )
}

export default ScheduleCalendar
