# Schedule Calendar View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a calendar page at `/schedule` with week view (default) and day view to browse all patient appointments, filterable by doctor.

**Architecture:** Page component (`ScheduleCalendar`) manages view mode, date navigation, and doctor filter state. Two view components (`WeekView`, `DayView`) render the calendar grids. Shared `CalendarToolbar` handles navigation/filter/toggle. `AppointmentPopover` and `QuickAddForm` handle click interactions. All data comes from `ReceptionistContext`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Popover, Dialog, Button, Select), HugeIcons, React Router v7

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/data/mock-appointments.ts` | Extend `Appointment` interface + add week-spanning mock data + doctor color map |
| Modify | `src/contexts/receptionist-context.tsx` | Add `cancelAppointment()` method |
| Create | `src/components/receptionist/calendar-toolbar.tsx` | Shared toolbar: nav arrows, "Hôm nay", date label, doctor dropdown, view toggle, add button |
| Create | `src/components/receptionist/week-view.tsx` | Week grid: 6 columns (Tue–Sun), 30-min time slots, color-coded appointment blocks |
| Create | `src/components/receptionist/day-view.tsx` | Day grid: side-by-side doctor columns, detailed appointment blocks, empty slot indicators |
| Create | `src/components/receptionist/appointment-popover.tsx` | Popover: patient info, status, doctor, actions (cancel, view record) |
| Create | `src/components/receptionist/quick-add-form.tsx` | Dialog: patient search, doctor select, reason, confirm booking |
| Create | `src/pages/schedule/index.tsx` | Page component: state management, view switching, wires everything together |
| Modify | `src/App.tsx` | Add `/schedule` route |

---

### Task 1: Extend Appointment Data Model + Mock Data

**Files:**
- Modify: `src/data/mock-appointments.ts`

- [ ] **Step 1: Update the `Appointment` interface with new fields**

Add `endTime`, make `doctorName` required, add `status` and `phone` fields:

```typescript
export interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string // yyyy-mm-dd
  time: string // HH:mm
  endTime: string // HH:mm
  reason?: string
  doctorName: string
  status: "upcoming" | "completed" | "cancelled"
  phone?: string
  notes?: string
}
```

- [ ] **Step 2: Add doctor color map constant**

```typescript
export const DOCTOR_COLORS: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  "BS. Nguyễn Hải": {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-300",
    dot: "bg-blue-600",
  },
  "BS. Trần Minh": {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-300",
    dot: "bg-amber-500",
  },
}
```

- [ ] **Step 3: Update existing mock appointments to include new fields**

Update the 4 existing entries in `mockAppointments` to include `endTime`, required `doctorName`, `status`, and `phone`. For the entry missing `doctorName` (id `a3`), assign `"BS. Trần Minh"`:

```typescript
export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-01",
    time: "14:00",
    endTime: "14:30",
    reason: "Khám mắt định kỳ",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345001",
  },
  {
    id: "a2",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-01",
    time: "13:30",
    endTime: "14:00",
    reason: "Khô mắt, mỏi mắt",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345002",
  },
  {
    id: "a3",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: "2026-04-01",
    time: "13:00",
    endTime: "13:30",
    reason: "Giảm thị lực",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345003",
  },
  {
    id: "a5",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: "2026-04-01",
    time: "13:00",
    endTime: "13:30",
    reason: "Tái khám khô mắt",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345005",
  },
```

- [ ] **Step 4: Add week-spanning mock appointments**

Add ~15 more mock appointments spread across 2026-04-01 to 2026-04-06 (Tue–Sun) using both doctors. Include a mix of statuses. Append to the `mockAppointments` array:

```typescript
  // Wednesday 04-02
  {
    id: "a6",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-02",
    time: "13:00",
    endTime: "13:20",
    reason: "Tái khám",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345002",
  },
  {
    id: "a7",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-02",
    time: "14:00",
    endTime: "14:30",
    reason: "Đo khúc xạ",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345001",
  },
  // Thursday 04-03
  {
    id: "a8",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: "2026-04-03",
    time: "13:00",
    endTime: "13:30",
    reason: "Khám tổng quát",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345003",
  },
  {
    id: "a9",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: "2026-04-03",
    time: "13:30",
    endTime: "14:00",
    reason: "IPL session 2",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345005",
  },
  {
    id: "a10",
    patientId: "GK-2026-0004",
    patientName: "Phạm Thu Dung",
    date: "2026-04-03",
    time: "15:00",
    endTime: "15:30",
    reason: "Tái khám Ortho-K",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345004",
  },
  // Friday 04-04
  {
    id: "a11",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-04",
    time: "14:30",
    endTime: "15:00",
    reason: "Khám mắt khô",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345001",
  },
  {
    id: "a12",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-04",
    time: "13:00",
    endTime: "13:30",
    reason: "Đo khúc xạ",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345002",
  },
  // Saturday 04-05 (morning hours: 08:00-12:00)
  {
    id: "a13",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: "2026-04-05",
    time: "08:00",
    endTime: "08:30",
    reason: "Khám tổng quát",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345003",
  },
  {
    id: "a14",
    patientId: "GK-2026-0004",
    patientName: "Phạm Thu Dung",
    date: "2026-04-05",
    time: "09:00",
    endTime: "09:30",
    reason: "Tái khám",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345004",
  },
  {
    id: "a15",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: "2026-04-05",
    time: "10:00",
    endTime: "10:30",
    reason: "IPL session 3",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345005",
  },
  // Sunday 04-06 (morning hours: 08:00-12:00)
  {
    id: "a16",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-06",
    time: "08:30",
    endTime: "09:00",
    reason: "Khám mắt khô",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0912345001",
  },
  {
    id: "a17",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-06",
    time: "09:00",
    endTime: "09:30",
    reason: "Đo khúc xạ",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345002",
  },
  {
    id: "a18",
    patientId: "GK-2026-0004",
    patientName: "Phạm Thu Dung",
    date: "2026-04-06",
    time: "10:00",
    endTime: "10:30",
    reason: "Tái khám Ortho-K",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0912345004",
  },
]
```

- [ ] **Step 5: Add helper to get time slots for a given date**

Add a function that returns the correct time range based on the day of week:

```typescript
export function getTimeSlotsForDate(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00")
  const day = date.getDay() // 0=Sun, 6=Sat

  const slots: string[] = []
  let startHour: number
  let endHour: number

  if (day === 0 || day === 6) {
    // Weekend: 08:00-12:00
    startHour = 8
    endHour = 12
  } else {
    // Weekday: 13:00-20:00
    startHour = 13
    endHour = 20
  }

  for (let h = startHour; h < endHour; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`)
    slots.push(`${String(h).padStart(2, "0")}:30`)
  }

  return slots
}
```

- [ ] **Step 6: Run typecheck**

Run: `npm run typecheck`
Expected: There will be type errors in `schedule/new.tsx` and `receptionist-context.tsx` because the `Appointment` interface now requires `endTime`, `doctorName` (non-optional), and `status`. Fix them:

In `src/pages/schedule/new.tsx`, update the `addAppointment` call in `handleConfirm()` to include the new required fields:

```typescript
    addAppointment({
      patientId,
      patientName,
      date: selectedDate,
      time: selectedTime,
      endTime: (() => {
        const [h, m] = selectedTime.split(":").map(Number)
        const end = new Date(2026, 0, 1, h, m + 30)
        return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
      })(),
      reason: reason || undefined,
      doctorName: selectedDoctor?.name ?? "BS. Nguyễn Hải",
      status: "upcoming",
      phone: foundPatient?.phone,
    })
```

- [ ] **Step 7: Run typecheck again to confirm clean**

Run: `npm run typecheck`
Expected: PASS — no errors

- [ ] **Step 8: Commit**

```bash
git add src/data/mock-appointments.ts src/pages/schedule/new.tsx
git commit -m "feat: extend appointment model with endTime, status, doctor colors, and week mock data"
```

---

### Task 2: Add `cancelAppointment` to ReceptionistContext

**Files:**
- Modify: `src/contexts/receptionist-context.tsx`

- [ ] **Step 1: Add `cancelAppointment` to the context interface**

Add to `ReceptionistContextType`:

```typescript
  cancelAppointment: (appointmentId: string) => void
```

- [ ] **Step 2: Implement `cancelAppointment` in the provider**

Add inside `ReceptionistProvider`, after `addAppointment`:

```typescript
  function cancelAppointment(appointmentId: string) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId
          ? { ...a, status: "cancelled" as const }
          : a
      )
    )
  }
```

- [ ] **Step 3: Add to context value**

Add `cancelAppointment` to the `value` prop of `ReceptionistContext.Provider`.

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/contexts/receptionist-context.tsx
git commit -m "feat: add cancelAppointment to receptionist context"
```

---

### Task 3: Build CalendarToolbar Component

**Files:**
- Create: `src/components/receptionist/calendar-toolbar.tsx`

- [ ] **Step 1: Create the toolbar component**

```typescript
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useNavigate } from "react-router"
import { mockDoctors } from "@/data/mock-appointments"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

export type CalendarView = "day" | "week"

interface CalendarToolbarProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  dateLabel: string
  todayLabel?: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  doctorFilter: string
  onDoctorFilterChange: (doctor: string) => void
  showDoctorFilter?: boolean
}

export function CalendarToolbar({
  view,
  onViewChange,
  dateLabel,
  todayLabel,
  onPrev,
  onNext,
  onToday,
  doctorFilter,
  onDoctorFilterChange,
  showDoctorFilter = true,
}: CalendarToolbarProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex">
          <Button
            variant="outline"
            size="icon"
            className="rounded-r-none"
            onClick={onPrev}
          >
            ‹
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="-ml-px rounded-l-none"
            onClick={onNext}
          >
            ›
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hôm nay
        </Button>
        <span className="text-[15px] font-semibold tracking-tight">
          {dateLabel}
        </span>
        {todayLabel && (
          <span className="text-sm text-muted-foreground">{todayLabel}</span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {showDoctorFilter && (
          <Select value={doctorFilter} onValueChange={onDoctorFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả bác sĩ</SelectItem>
              {mockDoctors.map((d) => (
                <SelectItem key={d.id} value={d.name}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex overflow-hidden rounded-md border border-border">
          <button
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "day"
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => onViewChange("day")}
          >
            Ngày
          </button>
          <button
            className={`-ml-px border-l border-border px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "week"
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:bg-muted"
            }`}
            onClick={() => onViewChange("week")}
          >
            Tuần
          </button>
        </div>

        <Button size="sm" onClick={() => navigate("/schedule/new")}>
          <HugeiconsIcon icon={Add01Icon} className="mr-1.5 size-4" />
          Đặt lịch
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/calendar-toolbar.tsx
git commit -m "feat: add CalendarToolbar component with nav, filter, view toggle"
```

---

### Task 4: Build WeekView Component

**Files:**
- Create: `src/components/receptionist/week-view.tsx`

- [ ] **Step 1: Create the week view component**

This is the largest component. It renders a CSS grid with time labels on the left and 6 day columns (Tue–Sun). Each cell can contain color-coded appointment blocks.

```typescript
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  DOCTOR_COLORS,
  getTimeSlotsForDate,
  mockDoctors,
  type Appointment,
} from "@/data/mock-appointments"

interface WeekViewProps {
  weekDates: string[] // array of 6 date strings (Tue-Sun) in yyyy-mm-dd
  appointments: Appointment[]
  doctorFilter: string
  onClickAppointment: (appointment: Appointment, anchorEl: HTMLElement) => void
  onClickEmptySlot: (date: string, time: string, doctor?: string) => void
}

const VIET_DAY_NAMES: Record<number, string> = {
  0: "CN",
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
}

export function WeekView({
  weekDates,
  appointments,
  doctorFilter,
  onClickAppointment,
  onClickEmptySlot,
}: WeekViewProps) {
  const today = "2026-04-01" // hardcoded for mockup

  // Build time slots from the first weekday (they differ for weekends)
  // We need a union of all unique time slots across the week
  const allTimeSlots = useMemo(() => {
    const slotSet = new Set<string>()
    for (const date of weekDates) {
      for (const slot of getTimeSlotsForDate(date)) {
        slotSet.add(slot)
      }
    }
    return Array.from(slotSet).sort()
  }, [weekDates])

  // Group appointments by date+time
  const apptMap = useMemo(() => {
    const filtered =
      doctorFilter === "all"
        ? appointments
        : appointments.filter((a) => a.doctorName === doctorFilter)

    const map = new Map<string, Appointment[]>()
    for (const appt of filtered) {
      if (appt.status === "cancelled") continue
      const key = `${appt.date}_${appt.time}`
      const list = map.get(key) ?? []
      list.push(appt)
      map.set(key, list)
    }
    return map
  }, [appointments, doctorFilter])

  return (
    <div className="flex flex-col">
      {/* Grid */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "60px repeat(6, 1fr)" }}
      >
        {/* Header row */}
        <div className="border-b-2 border-border bg-muted/50 p-3" />
        {weekDates.map((dateStr) => {
          const date = new Date(dateStr + "T00:00:00")
          const dayNum = date.getDate()
          const dayOfWeek = date.getDay()
          const isToday = dateStr === today
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          return (
            <div
              key={dateStr}
              className="border-b-2 border-border bg-muted/50 px-2 py-3 text-center"
            >
              <div
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  isWeekend
                    ? "text-amber-500"
                    : "text-muted-foreground"
                )}
              >
                {VIET_DAY_NAMES[dayOfWeek]}
              </div>
              <div
                className={cn(
                  "mt-1 inline-flex text-lg font-bold",
                  isToday &&
                    "size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-base"
                )}
              >
                {dayNum}
              </div>
            </div>
          )
        })}

        {/* Time rows */}
        {allTimeSlots.map((timeSlot, idx) => {
          const isHalfHour = timeSlot.endsWith(":30")

          return (
            <div key={timeSlot} className="contents">
              {/* Time label */}
              <div
                className={cn(
                  "border-r border-border pr-2 text-right text-[11px] font-medium text-muted-foreground",
                  idx === 0 ? "" : "-mt-[7px]"
                )}
                style={{ height: 56 }}
              >
                {timeSlot}
              </div>

              {/* Day cells */}
              {weekDates.map((dateStr) => {
                const dateSlotsForDay = getTimeSlotsForDate(dateStr)
                const isValidSlot = dateSlotsForDay.includes(timeSlot)
                const key = `${dateStr}_${timeSlot}`
                const cellAppts = apptMap.get(key) ?? []

                if (!isValidSlot) {
                  return (
                    <div
                      key={key}
                      className="border-b border-muted bg-muted/30"
                      style={{ height: 56 }}
                    />
                  )
                }

                return (
                  <div
                    key={key}
                    className={cn(
                      "cursor-pointer border-r border-border px-0.5 py-0.5 transition-colors hover:bg-muted/50",
                      isHalfHour
                        ? "border-b border-dashed border-muted"
                        : "border-b border-muted"
                    )}
                    style={{ height: 56 }}
                    onClick={() => {
                      if (cellAppts.length === 0) {
                        onClickEmptySlot(
                          dateStr,
                          timeSlot,
                          doctorFilter !== "all" ? doctorFilter : undefined
                        )
                      }
                    }}
                  >
                    {cellAppts.map((appt) => {
                      const colors =
                        DOCTOR_COLORS[appt.doctorName] ??
                        DOCTOR_COLORS[mockDoctors[0].name]

                      return (
                        <div
                          key={appt.id}
                          className={cn(
                            "cursor-pointer rounded-md border px-2 py-1 text-[11px] transition-all hover:-translate-y-px hover:shadow-md",
                            colors.bg,
                            colors.border,
                            colors.text
                          )}
                          onClick={(e) => {
                            e.stopPropagation()
                            onClickAppointment(appt, e.currentTarget)
                          }}
                        >
                          <div className="truncate font-semibold">
                            {appt.patientName}
                          </div>
                          <div className="truncate text-[10px] opacity-80">
                            {appt.doctorName}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 border-t border-border bg-muted/50 px-5 py-3">
        {mockDoctors.map((d) => {
          const colors = DOCTOR_COLORS[d.name]
          return (
            <div
              key={d.id}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <div className={cn("size-2 rounded-sm", colors?.dot)} />
              {d.name}
            </div>
          )
        })}
        <span className="ml-auto text-[11px] text-muted-foreground/50">
          Click ô trống để đặt lịch · Click lịch hẹn để xem chi tiết
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/week-view.tsx
git commit -m "feat: add WeekView component with color-coded appointments and time grid"
```

---

### Task 5: Build DayView Component

**Files:**
- Create: `src/components/receptionist/day-view.tsx`

- [ ] **Step 1: Create the day view component**

```typescript
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import {
  DOCTOR_COLORS,
  getTimeSlotsForDate,
  mockDoctors,
  type Appointment,
} from "@/data/mock-appointments"

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
  const timeSlots = useMemo(() => getTimeSlotsForDate(date), [date])

  const activeAppts = appointments.filter(
    (a) => a.date === date && a.status !== "cancelled"
  )

  // Group by doctor
  const apptsByDoctor = useMemo(() => {
    const map = new Map<string, Map<string, Appointment>>()
    for (const doc of mockDoctors) {
      map.set(doc.name, new Map())
    }
    for (const appt of activeAppts) {
      const docMap = map.get(appt.doctorName)
      if (docMap) {
        docMap.set(appt.time, appt)
      }
    }
    return map
  }, [activeAppts])

  // Count per doctor
  const countByDoctor = (name: string) =>
    activeAppts.filter((a) => a.doctorName === name).length

  const totalAppts = activeAppts.length
  const totalSlots = timeSlots.length * mockDoctors.length
  const emptySlots = totalSlots - totalAppts

  return (
    <div className="flex flex-col">
      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `60px repeat(${mockDoctors.length}, 1fr)`,
        }}
      >
        {/* Doctor column headers */}
        <div className="border-b border-border bg-muted/50 p-3" />
        {mockDoctors.map((doc) => {
          const colors = DOCTOR_COLORS[doc.name]
          return (
            <div
              key={doc.id}
              className="flex items-center gap-2.5 border-b border-border bg-muted/50 px-4 py-3"
            >
              <div className={cn("size-2.5 rounded-full", colors?.dot)} />
              <span className="text-sm font-semibold">{doc.name}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {countByDoctor(doc.name)} lịch hẹn
              </span>
            </div>
          )
        })}

        {/* Time rows */}
        {timeSlots.map((timeSlot, idx) => {
          const isHalfHour = timeSlot.endsWith(":30")

          return (
            <div key={timeSlot} className="contents">
              <div
                className={cn(
                  "border-r border-border pr-2 text-right text-[11px] font-medium text-muted-foreground",
                  idx === 0 ? "" : "-mt-[7px]"
                )}
                style={{ height: 64 }}
              >
                {timeSlot}
              </div>

              {mockDoctors.map((doc) => {
                const docAppts = apptsByDoctor.get(doc.name)
                const appt = docAppts?.get(timeSlot)
                const colors = DOCTOR_COLORS[doc.name]

                return (
                  <div
                    key={`${doc.id}_${timeSlot}`}
                    className={cn(
                      "group cursor-pointer border-r border-border px-1.5 py-0.5 transition-colors",
                      isHalfHour
                        ? "border-b border-dashed border-muted"
                        : "border-b border-muted",
                      !appt && "hover:bg-muted/50"
                    )}
                    style={{ height: 64 }}
                    onClick={() => {
                      if (!appt) {
                        onClickEmptySlot(date, timeSlot, doc.name)
                      }
                    }}
                  >
                    {appt ? (
                      <div
                        className={cn(
                          "cursor-pointer rounded-lg border px-2.5 py-1.5 transition-all hover:-translate-y-px hover:shadow-md",
                          colors?.bg,
                          colors?.border,
                          colors?.text
                        )}
                        onClick={(e) => {
                          e.stopPropagation()
                          onClickAppointment(appt, e.currentTarget)
                        }}
                      >
                        <div className="text-[10px] font-semibold opacity-70">
                          {appt.time} – {appt.endTime}
                        </div>
                        <div className="text-xs font-semibold">
                          {appt.patientName}
                        </div>
                        {appt.reason && (
                          <div className="truncate text-[10px] opacity-65">
                            {appt.reason}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-transparent transition-all group-hover:border-border group-hover:bg-muted/50">
                        <span className="text-[11px] font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                          + Đặt lịch
                        </span>
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
      <div className="flex items-center gap-6 border-t border-border bg-muted/50 px-5 py-3">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{totalAppts}</span>{" "}
          lịch hẹn hôm nay
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{emptySlots}</span>{" "}
          slot trống
        </div>
        <span className="ml-auto text-[11px] text-muted-foreground/50">
          Click ô trống để đặt lịch · Click lịch hẹn để xem chi tiết
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/day-view.tsx
git commit -m "feat: add DayView component with doctor columns and empty slot indicators"
```

---

### Task 6: Build AppointmentPopover Component

**Files:**
- Create: `src/components/receptionist/appointment-popover.tsx`

- [ ] **Step 1: Create the popover component**

```typescript
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DOCTOR_COLORS, type Appointment } from "@/data/mock-appointments"

interface AppointmentPopoverProps {
  appointment: Appointment | null
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorEl: HTMLElement | null
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
  anchorEl,
  onCancel,
}: AppointmentPopoverProps) {
  const navigate = useNavigate()

  if (!appointment || !anchorEl) return null

  const colors = DOCTOR_COLORS[appointment.doctorName]

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span
          ref={(node) => {
            if (node && anchorEl) {
              // Virtual anchor positioning handled by Radix
            }
          }}
          className="hidden"
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="center" side="bottom">
        {/* Header */}
        <div className="flex items-start gap-3 border-b border-border p-4">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {getInitials(appointment.patientName)}
          </div>
          <div>
            <div className="text-sm font-semibold">
              {appointment.patientName}
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.patientId}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-2.5 p-4">
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted-foreground">
              Trạng thái
            </span>
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400"
            >
              <span className="mr-1.5 size-1.5 rounded-full bg-green-500" />
              Sắp tới
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted-foreground">
              Thời gian
            </span>
            <span className="text-sm font-medium">
              {appointment.time} – {appointment.endTime},{" "}
              {formatDateViet(appointment.date)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 text-xs text-muted-foreground">Bác sĩ</span>
            <span className="flex items-center gap-1.5 text-sm font-medium">
              <span
                className={cn("size-1.5 rounded-full", colors?.dot)}
              />
              {appointment.doctorName}
            </span>
          </div>
          {appointment.reason && (
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">Lý do</span>
              <span className="text-sm">{appointment.reason}</span>
            </div>
          )}
          {appointment.phone && (
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">SĐT</span>
              <span className="text-sm">{appointment.phone}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              onCancel(appointment.id)
              onOpenChange(false)
            }}
          >
            Hủy lịch
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled>
            Đổi lịch
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              navigate(`/intake/${appointment.patientId}/edit`)
              onOpenChange(false)
            }}
          >
            Xem hồ sơ
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/appointment-popover.tsx
git commit -m "feat: add AppointmentPopover with patient info and action buttons"
```

---

### Task 7: Build QuickAddForm Component

**Files:**
- Create: `src/components/receptionist/quick-add-form.tsx`

- [ ] **Step 1: Create the quick-add dialog component**

Uses the existing `Dialog` shadcn component and `PatientSearch` component:

```typescript
import { useState } from "react"
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

  // Calculate end time (30 min later)
  const endTime = (() => {
    const [h, m] = time.split(":").map(Number)
    const end = new Date(2026, 0, 1, h, m + 30)
    return `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`
  })()

  function handleConfirm() {
    if (!selectedPatient || !doctorName) return

    addAppointment({
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date,
      time,
      endTime,
      reason: reason || undefined,
      doctorName,
      status: "upcoming",
      phone: selectedPatient.phone,
    })

    addVisit({
      patientId: selectedPatient.id,
      status: "chua_den",
      source: "hen",
      reason: reason || undefined,
      scheduledAt: time,
      date,
      doctorName,
    })

    // Reset and close
    setSelectedPatient(null)
    setDoctorName(prefilledDoctor ?? "")
    setReason("")
    onOpenChange(false)
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setSelectedPatient(null)
      setDoctorName(prefilledDoctor ?? "")
      setReason("")
    }
    onOpenChange(nextOpen)
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

        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-1.5">Tìm bệnh nhân (tên hoặc SĐT)</Label>
            <PatientSearch onSelectPatient={setSelectedPatient} />
            {selectedPatient && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
                <span className="font-bold">✓</span>
                <span>
                  <strong>{selectedPatient.name}</strong> ·{" "}
                  {selectedPatient.id} · {selectedPatient.phone}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label className="mb-1.5">Bác sĩ</Label>
            <Select value={doctorName} onValueChange={setDoctorName}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn bác sĩ" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5">Lý do khám</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              placeholder="Tái khám, khám mắt khô, đo khúc xạ..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
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
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/quick-add-form.tsx
git commit -m "feat: add QuickAddForm dialog for booking from empty calendar slots"
```

---

### Task 8: Build ScheduleCalendar Page + Add Route

**Files:**
- Create: `src/pages/schedule/index.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the page component**

This is the orchestrator that manages state and wires all sub-components together:

```typescript
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
  "Th1", "Th2", "Th3", "Th4", "Th5", "Th6",
  "Th7", "Th8", "Th9", "Th10", "Th11", "Th12",
]

const VIET_FULL_MONTHS = [
  "tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6",
  "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12",
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

function getWeekDates(dateStr: string): string[] {
  const date = new Date(dateStr + "T00:00:00")
  const day = date.getDay() // 0=Sun
  // Find Tuesday of this week
  // If day is Sun(0) or Mon(1), go to previous Tue
  let tueDiff: number
  if (day === 0) {
    tueDiff = -5 // Sun → prev Tue
  } else if (day === 1) {
    tueDiff = -6 // Mon → prev Tue
  } else {
    tueDiff = 2 - day // Tue=0, Wed=-1, etc.
  }

  const tue = new Date(date)
  tue.setDate(date.getDate() + tueDiff)

  const dates: string[] = []
  for (let i = 0; i < 6; i++) {
    // Tue(0), Wed(1), Thu(2), Fri(3), Sat(4), Sun(5)
    const d = new Date(tue)
    d.setDate(tue.getDate() + i)
    dates.push(d.toISOString().split("T")[0])
  }
  return dates
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00")
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export default function ScheduleCalendar() {
  const { appointments, cancelAppointment } = useReceptionist()

  const [view, setView] = useState<CalendarView>("week")
  const [currentDate, setCurrentDate] = useState(TODAY)
  const [doctorFilter, setDoctorFilter] = useState("all")

  // Popover state
  const [popoverAppt, setPopoverAppt] = useState<Appointment | null>(null)
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null)
  const [popoverOpen, setPopoverOpen] = useState(false)

  // Quick-add state
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [quickAddDate, setQuickAddDate] = useState("")
  const [quickAddTime, setQuickAddTime] = useState("")
  const [quickAddDoctor, setQuickAddDoctor] = useState<string | undefined>()

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate])

  // Date labels
  const dateLabel = useMemo(() => {
    if (view === "week") {
      const first = new Date(weekDates[0] + "T00:00:00")
      const last = new Date(weekDates[5] + "T00:00:00")
      const d1 = `${String(first.getDate()).padStart(2, "0")} ${VIET_MONTHS[first.getMonth()]}`
      const d2 = `${String(last.getDate()).padStart(2, "0")} ${VIET_MONTHS[last.getMonth()]}, ${last.getFullYear()}`
      return `${d1} – ${d2}`
    }
    const d = new Date(currentDate + "T00:00:00")
    return `${VIET_DAY_FULL[d.getDay()]}, ${String(d.getDate()).padStart(2, "0")} ${VIET_FULL_MONTHS[d.getMonth()]}`
  }, [view, currentDate, weekDates])

  const todayLabel = useMemo(() => {
    if (view === "day" && currentDate === TODAY) return "Hôm nay"
    return undefined
  }, [view, currentDate])

  // Navigation
  const handlePrev = useCallback(() => {
    if (view === "week") {
      setCurrentDate((d) => addDays(d, -7))
    } else {
      setCurrentDate((d) => addDays(d, -1))
    }
  }, [view])

  const handleNext = useCallback(() => {
    if (view === "week") {
      setCurrentDate((d) => addDays(d, 7))
    } else {
      setCurrentDate((d) => addDays(d, 1))
    }
  }, [view])

  const handleToday = useCallback(() => {
    setCurrentDate(TODAY)
  }, [])

  // Interactions
  const handleClickAppointment = useCallback(
    (appt: Appointment, anchorEl: HTMLElement) => {
      setPopoverAppt(appt)
      setPopoverAnchor(anchorEl)
      setPopoverOpen(true)
    },
    []
  )

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
        anchorEl={popoverAnchor}
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
```

- [ ] **Step 2: Add the `/schedule` route to App.tsx**

In `src/App.tsx`, add the import and route:

Import at top:
```typescript
import ScheduleCalendar from "@/pages/schedule/index"
```

Add route before the `/schedule/new` route:
```typescript
<Route path="/schedule" element={<ScheduleCalendar />} />
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Run dev server and verify**

Run: `npm run dev`

Open `http://localhost:3000/schedule` in browser. Verify:
- Week view loads as default with toolbar
- 6 columns (Tue–Sun), no Monday
- Color-coded appointment blocks appear
- Doctor dropdown filters appointments
- Day/Week toggle switches views
- Day view shows doctor columns
- Navigation arrows move through weeks/days
- "Hôm nay" button returns to today

- [ ] **Step 5: Commit**

```bash
git add src/pages/schedule/index.tsx src/App.tsx
git commit -m "feat: add schedule calendar page with week/day views and routing"
```

---

### Task 9: Lint, Format, and Final Verification

**Files:**
- All new/modified files

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Fix any lint errors that appear.

- [ ] **Step 2: Run format**

Run: `npm run format`

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS — clean build with no errors

- [ ] **Step 5: Commit any formatting/lint fixes**

```bash
git add -u
git commit -m "chore: fix lint and format schedule calendar files"
```

---

## Spec Coverage Checklist

| Spec Requirement | Task |
|---|---|
| Week view with 6 columns (Tue-Sun) | Task 4 |
| Weekday hours 13:00-20:00, weekend 08:00-12:00 | Task 1 (`getTimeSlotsForDate`) |
| Color-coded appointments by doctor | Task 1 (DOCTOR_COLORS) + Task 4 |
| Doctor dropdown filter (week view) | Task 3 + Task 8 |
| Today highlight (blue circle) | Task 4 |
| Weekend headers in amber | Task 4 |
| Legend with doctor colors | Task 4 |
| Day view with doctor columns | Task 5 |
| Column headers with count | Task 5 |
| Empty slot hover indicator | Task 5 |
| Summary bar (day view) | Task 5 |
| Toolbar: nav arrows, Hôm nay, date label | Task 3 |
| Toolbar: view toggle (Ngày/Tuần) | Task 3 |
| Toolbar: "+ Đặt lịch" button → /schedule/new | Task 3 |
| Appointment popover with details | Task 6 |
| Popover: cancel, view record actions | Task 6 |
| Popover: "Đổi lịch" disabled button | Task 6 |
| Quick-add form on empty slot click | Task 7 |
| Quick-add: patient search, doctor, reason | Task 7 |
| Route: /schedule | Task 8 |
| `cancelAppointment` in context | Task 2 |
| Extended Appointment interface | Task 1 |
| Mock data across the week | Task 1 |
