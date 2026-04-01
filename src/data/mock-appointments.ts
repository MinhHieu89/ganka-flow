export interface Appointment {
  id: string
  patientId: string
  patientName: string
  date: string // yyyy-mm-dd
  time: string // HH:mm
  reason?: string
  doctorName?: string
  notes?: string
}

export interface TimeSlot {
  time: string
  capacity: number
  booked: number
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

export const mockAppointments: Appointment[] = [
  {
    id: "a1",
    patientId: "GK-2026-0001",
    patientName: "Nguyễn Văn An",
    date: "2026-04-01",
    time: "14:00",
    reason: "Khám mắt định kỳ",
    doctorName: "BS. Nguyễn Hải",
  },
  {
    id: "a2",
    patientId: "GK-2026-0002",
    patientName: "Trần Thị Bình",
    date: "2026-04-01",
    time: "13:30",
    reason: "Khô mắt, mỏi mắt",
    doctorName: "BS. Nguyễn Hải",
  },
  {
    id: "a3",
    patientId: "GK-2026-0003",
    patientName: "Lê Hoàng Cường",
    date: "2026-04-01",
    time: "13:00",
    reason: "Giảm thị lực",
  },
  {
    id: "a5",
    patientId: "GK-2026-0005",
    patientName: "Vũ Thị Em",
    date: "2026-04-01",
    time: "13:00",
    reason: "Tái khám khô mắt",
    doctorName: "BS. Nguyễn Hải",
  },
]
