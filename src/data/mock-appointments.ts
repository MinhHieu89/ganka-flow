import { TODAY, offsetDate } from "@/lib/demo-date"

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

export interface TimeSlot {
  time: string
  capacity: number
  booked: number
}

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

export const mockDoctors = [
  { id: "d1", name: "BS. Nguyễn Hải" },
  { id: "d2", name: "BS. Trần Minh" },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function generateTimeSlots(_date: string): {
  morning: TimeSlot[]
  afternoon: TimeSlot[]
} {
  const morning: TimeSlot[] = []
  const afternoon: TimeSlot[] = []

  for (let h = 8; h < 12; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      morning.push({ time, capacity: 2, booked: 0 })
    }
  }

  for (let h = 12; h < 20; h++) {
    for (const m of [0, 30]) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      afternoon.push({ time, capacity: 2, booked: 0 })
    }
  }

  return { morning, afternoon }
}

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

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: TODAY,
    time: "14:00",
    endTime: "14:30",
    reason: "Khám mắt định kỳ",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234001",
  },
  {
    id: "a2",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: TODAY,
    time: "13:30",
    endTime: "14:00",
    reason: "Khô mắt, mỏi mắt",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234002",
  },
  {
    id: "a3",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: TODAY,
    time: "13:00",
    endTime: "13:30",
    reason: "Giảm thị lực",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234003",
  },
  {
    id: "a5",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: TODAY,
    time: "13:00",
    endTime: "13:30",
    reason: "Tái khám khô mắt",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234005",
  },
  // Week-spanning appointments: today through today+5
  {
    id: "a6",
    patientId: "GK-2026-0006",
    patientName: "Phạm Minh Đức",
    date: TODAY,
    time: "15:00",
    endTime: "15:30",
    reason: "Đo khúc xạ",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234006",
  },
  {
    id: "a7",
    patientId: "GK-2026-0007",
    patientName: "Hoàng Thị Giang",
    date: TODAY,
    time: "16:00",
    endTime: "16:30",
    reason: "Khám glaucoma",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234007",
  },
  {
    id: "a8",
    patientId: "GK-2026-0008",
    patientName: "Đỗ Văn Hùng",
    date: offsetDate(1),
    time: "13:00",
    endTime: "13:30",
    reason: "Tái khám sau phẫu thuật",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234008",
  },
  {
    id: "a9",
    patientId: "GK-2026-0009",
    patientName: "Ngô Thị Inh",
    date: offsetDate(1),
    time: "14:00",
    endTime: "14:30",
    reason: "Khám mắt trẻ em",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234009",
  },
  {
    id: "a10",
    patientId: "GK-2026-0010",
    patientName: "Bùi Quang Khải",
    date: offsetDate(1),
    time: "15:30",
    endTime: "16:00",
    reason: "Đo thị lực",
    doctorName: "BS. Nguyễn Hải",
    status: "cancelled",
    phone: "0901234010",
  },
  {
    id: "a11",
    patientId: "GK-2026-0011",
    patientName: "Lý Thị Lan",
    date: offsetDate(2),
    time: "13:30",
    endTime: "14:00",
    reason: "Viêm kết mạc",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234011",
  },
  {
    id: "a12",
    patientId: "GK-2026-0012",
    patientName: "Trịnh Văn Mạnh",
    date: offsetDate(2),
    time: "14:30",
    endTime: "15:00",
    reason: "Khám cận thị",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234012",
  },
  {
    id: "a13",
    patientId: "GK-2026-0013",
    patientName: "Vương Thị Ngọc",
    date: offsetDate(2),
    time: "16:00",
    endTime: "16:30",
    reason: "Tái khám đáy mắt",
    doctorName: "BS. Nguyễn Hải",
    status: "completed",
    phone: "0901234013",
  },
  {
    id: "a14",
    patientId: "GK-2026-0014",
    patientName: "Cao Văn Phú",
    date: offsetDate(3),
    time: "08:00",
    endTime: "08:30",
    reason: "Khám mắt định kỳ",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234014",
  },
  {
    id: "a15",
    patientId: "GK-2026-0015",
    patientName: "Đinh Thị Quỳnh",
    date: offsetDate(3),
    time: "09:00",
    endTime: "09:30",
    reason: "Khô mắt mãn tính",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234015",
  },
  {
    id: "a16",
    patientId: "GK-2026-0016",
    patientName: "Tạ Văn Sơn",
    date: offsetDate(4),
    time: "08:30",
    endTime: "09:00",
    reason: "Đo nhãn áp",
    doctorName: "BS. Nguyễn Hải",
    status: "upcoming",
    phone: "0901234016",
  },
  {
    id: "a17",
    patientId: "GK-2026-0017",
    patientName: "Mai Thị Trang",
    date: offsetDate(4),
    time: "10:00",
    endTime: "10:30",
    reason: "Khám viễn thị",
    doctorName: "BS. Trần Minh",
    status: "cancelled",
    phone: "0901234017",
  },
  {
    id: "a18",
    patientId: "GK-2026-0018",
    patientName: "Lưu Văn Uy",
    date: offsetDate(5),
    time: "14:00",
    endTime: "14:30",
    reason: "Tái khám sau laser",
    doctorName: "BS. Trần Minh",
    status: "upcoming",
    phone: "0901234018",
  },
]
