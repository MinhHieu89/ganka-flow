import { cn } from "@/lib/utils"
import { TODAY } from "@/lib/demo-date"

interface AppointmentCalendarProps {
  year: number
  month: number // 0-indexed
  selectedDate: string | null // yyyy-mm-dd
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
}

const dayHeaders = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"]

const monthNames = [
  "Tháng Một",
  "Tháng Hai",
  "Tháng Ba",
  "Tháng Tư",
  "Tháng Năm",
  "Tháng Sáu",
  "Tháng Bảy",
  "Tháng Tám",
  "Tháng Chín",
  "Tháng Mười",
  "Tháng Mười Một",
  "Tháng Mười Hai",
]

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  // Monday = 0, Sunday = 6
  let startDow = firstDay.getDay() - 1
  if (startDow < 0) startDow = 6

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const days: {
    day: number
    month: "prev" | "current" | "next"
    date: string
  }[] = []

  for (let i = startDow - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i
    const m = month === 0 ? 11 : month - 1
    const y = month === 0 ? year - 1 : year
    days.push({
      day: d,
      month: "prev",
      date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      month: "current",
      date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 0 : month + 1
    const y = month === 11 ? year + 1 : year
    days.push({
      day: d,
      month: "next",
      date: `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }

  return days
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isHoliday(_date: string): boolean {
  // Placeholder: mark some dates as holidays (red)
  // For now, no holidays — extend later
  return false
}

function isPast(date: string): boolean {
  return date < TODAY
}

export function AppointmentCalendar({
  year,
  month,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: AppointmentCalendarProps) {
  const days = getCalendarDays(year, month)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrevMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          ‹
        </button>
        <span className="text-sm font-semibold">
          {monthNames[month]} {year}
        </span>
        <button
          onClick={onNextMonth}
          className="text-muted-foreground hover:text-foreground"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs">
        {dayHeaders.map((d) => (
          <div key={d} className="py-2 font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {days.map((d, i) => {
          const isSelected = d.date === selectedDate
          const past = isPast(d.date)
          const holiday = isHoliday(d.date)
          const isOtherMonth = d.month !== "current"
          const disabled = past || isOtherMonth

          return (
            <button
              key={i}
              disabled={disabled}
              onClick={() => !disabled && onSelectDate(d.date)}
              className={cn(
                "flex items-center justify-center py-2.5 text-sm",
                isOtherMonth && "text-muted-foreground/40",
                past &&
                  !isOtherMonth &&
                  "text-muted-foreground/40 line-through",
                holiday && !isOtherMonth && "font-medium text-red-500",
                !disabled &&
                  !isSelected &&
                  "text-foreground hover:text-foreground/80",
                isSelected &&
                  "mx-auto size-9 rounded-lg bg-foreground font-semibold text-background"
              )}
            >
              {d.day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
