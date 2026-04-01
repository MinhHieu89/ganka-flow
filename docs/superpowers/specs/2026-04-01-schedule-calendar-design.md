# Schedule Calendar View — Design Spec

## Overview

A calendar page at `/schedule` for viewing all patient bookings, filterable by doctor. Replaces the current lack of a schedule index page. The existing `/schedule/new` booking page remains separate.

## Views

### Week View (Default)

- **Grid**: 6 columns (Tue–Sun), Monday excluded (clinic closed). Time slots on Y-axis in 30-minute intervals.
- **Weekday hours**: 13:00–20:00
- **Weekend hours**: 08:00–12:00 (Sat–Sun)
- **Appointments**: Color-coded blocks showing patient name + doctor name. Each doctor has a distinct color (blue for BS. Nguyễn Hải, amber for BS. Trần Minh).
- **Doctor filter**: Dropdown at the top with options "Tất cả bác sĩ", "BS. Nguyễn Hải", "BS. Trần Minh". When "Tất cả" is selected, appointments are color-coded by doctor. When a specific doctor is selected, only their appointments show.
- **Today highlight**: Today's date number displayed in a blue circle.
- **Weekend headers**: Day name shown in amber color to distinguish from weekdays.
- **Legend**: Color key at the bottom showing doctor-to-color mapping.

### Day View

- **Layout**: Side-by-side columns, one per doctor. Time slots on Y-axis in 30-minute intervals.
- **Column headers**: Doctor color dot + name + appointment count for the day (e.g. "5 lịch hẹn").
- **Appointments**: More detailed blocks showing time range, patient name, and reason.
- **Empty slots**: Dashed border on hover with "+ Đặt lịch" text.
- **Summary bar**: Bottom bar showing total appointments + available slots count.
- **No doctor dropdown**: Both doctors are always visible in their own columns.

## Toolbar (Shared)

- **Navigation**: `‹` `›` arrow buttons + "Hôm nay" button to jump to today
- **Date label**: Week view shows date range (e.g. "31 Th3 – 06 Th4, 2026"), day view shows full date (e.g. "Thứ Ba, 01 tháng 4")
- **View toggle**: "Ngày" / "Tuần" segmented control, active state uses dark background
- **Add button**: "+ Đặt lịch" primary blue button — navigates to `/schedule/new` (full booking form with patient creation). The quick-add form (from clicking empty slots) is for existing patients only.

## Interactions

### Appointment Popover

Clicking an appointment block shows a popover with:

- **Header**: Patient avatar (initials) + name + patient ID (GK-YYYY-NNNN) + close button
- **Body rows**:
  - Trạng thái (status badge, e.g. "Sắp tới" in green)
  - Thời gian (time range + day)
  - Bác sĩ (doctor name with color dot)
  - Lý do (appointment reason)
  - SĐT (phone number)
- **Footer actions**:
  - "Hủy lịch" — red/danger style, cancels the appointment
  - "Đổi lịch" — secondary style, reschedules (future implementation)
  - "Xem hồ sơ" — primary blue, navigates to patient record (`/intake/:id/edit`)

### Quick-Add (Click Empty Slot)

Clicking an empty time slot opens a modal/popover form:

- **Header**: "Đặt lịch nhanh" title + pre-filled slot info (e.g. "14:00 – 14:30 · BS. Nguyễn Hải")
- **Fields**:
  - Patient search input (by name or phone) with inline search results showing matched patient name + ID + phone
  - Doctor selector (pre-filled from the column clicked in day view)
  - Reason textarea (placeholder: "Tái khám, khám mắt khô, đo khúc xạ...")
- **Actions**: "Hủy" (cancel) + "Xác nhận đặt lịch" (confirm, primary blue)
- **Behavior**: Uses existing `searchPatients()` from ReceptionistContext. Pre-fills doctor based on column (day view) or selected filter (week view).

## Data

### Mock Data Extension

Extend `mock-appointments.ts` with additional appointments across the week to populate the calendar views. Each appointment needs:

```typescript
interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string        // yyyy-mm-dd
  time: string        // HH:mm
  endTime: string     // HH:mm (new field)
  reason?: string
  doctorName: string  // required (was optional)
  status: "upcoming" | "completed" | "cancelled"  // new field
  phone?: string      // for popover display
}
```

### Doctor Colors

Hardcoded mapping for the mockup phase:

```typescript
const DOCTOR_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  "BS. Nguyễn Hải": { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  "BS. Trần Minh":  { bg: "#fffbeb", border: "#fde68a", text: "#92400e" },
}
```

## Routing

- `/schedule` — Calendar index page (week view by default)
- `/schedule/new` — Existing appointment booking page (unchanged)

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `ScheduleCalendar` | `src/pages/schedule/index.tsx` | Page component with toolbar + view switching |
| `WeekView` | `src/components/receptionist/week-view.tsx` | Week grid with time slots and appointments |
| `DayView` | `src/components/receptionist/day-view.tsx` | Day grid with doctor columns |
| `AppointmentPopover` | `src/components/receptionist/appointment-popover.tsx` | Click-to-view appointment details |
| `QuickAddForm` | `src/components/receptionist/quick-add-form.tsx` | Click-empty-slot booking form |
| `CalendarToolbar` | `src/components/receptionist/calendar-toolbar.tsx` | Shared toolbar (nav, filter, toggle, add) |

## Deferred

- Month view — excluded from this iteration
- Drag-and-drop rescheduling
- Recurring appointment patterns
- "Đổi lịch" (reschedule) action in popover — button present but non-functional in mockup

## Visual References

Mockup files in `.superpowers/brainstorm/1562-1775058505/content/`:
- `schedule-week-view-v2.html` — Week view
- `schedule-day-view.html` — Day view with doctor columns
- `appointment-popover.html` — Popover + quick-add form
