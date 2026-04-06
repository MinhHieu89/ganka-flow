import { useState } from "react"
import { useNavigate } from "react-router"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import { generateTimeSlots, mockDoctors } from "@/data/mock-appointments"
import { AppointmentCalendar } from "@/components/receptionist/appointment-calendar"
import { AppointmentSlots } from "@/components/receptionist/appointment-slots"
import { ConfirmationBar } from "@/components/receptionist/confirmation-bar"
import { PatientSearch } from "@/components/receptionist/patient-search"
import type { Patient } from "@/data/mock-patients"

export default function ScheduleNew() {
  const navigate = useNavigate()
  const { addAppointment, addPatient, addVisit } = useReceptionist()

  // Patient state
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [showNewPatientForm, setShowNewPatientForm] = useState(false)

  // New patient fields
  const [newName, setNewName] = useState("")
  const [newPhone, setNewPhone] = useState("")

  // Shared fields
  const [reason, setReason] = useState("")
  const [doctorId, setDoctorId] = useState("")

  // Calendar state
  const [calYear, setCalYear] = useState(2026)
  const [calMonth, setCalMonth] = useState(3) // April = 3 (0-indexed)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const slots = selectedDate ? generateTimeSlots(selectedDate) : null
  const selectedDoctor = mockDoctors.find((d) => d.id === doctorId)

  function handleConfirm() {
    let patientId = foundPatient?.id
    let patientName = foundPatient?.name ?? newName

    if (!foundPatient && showNewPatientForm && newName && newPhone) {
      const newPat = addPatient({
        name: newName,
        phone: newPhone,
        gender: "Khác" as const,
        dob: "",
        birthYear: 0,
        type: "kham_benh" as const,
        activeStatus: "hoat_dong" as const,
      })
      patientId = newPat.id
      patientName = newPat.name
    }

    if (!patientId || !selectedDate || !selectedTime) return

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

    addVisit({
      patientId,
      status: "chua_den",
      source: "hen",
      reason: reason || undefined,
      scheduledAt: selectedTime,
      date: selectedDate,
      doctorName: selectedDoctor?.name,
    })

    navigate("/intake")
  }

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear((y) => y - 1)
    } else {
      setCalMonth((m) => m - 1)
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear((y) => y + 1)
    } else {
      setCalMonth((m) => m + 1)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <h1 className="text-xl font-bold">Đặt lịch hẹn</h1>

      <div className="grid grid-cols-2 gap-8">
        {/* Left: Patient info */}
        <div className="rounded-lg border border-border p-6">
          <h2 className="mb-4 text-base font-bold">Thông tin bệnh nhân</h2>

          <Label className="mb-1.5">Tìm bệnh nhân</Label>
          <div className="mb-3">
            <PatientSearch
              onSelectPatient={(patient) => {
                setFoundPatient(patient)
                setShowNewPatientForm(false)
                setNewName("")
                setNewPhone("")
              }}
              onCreateNew={() => {
                setFoundPatient(null)
                setShowNewPatientForm(true)
              }}
              placeholder="Nhập SĐT hoặc tên BN..."
            />
          </div>

          {/* Selected patient banner */}
          {foundPatient && (
            <div className="mb-4 flex items-center justify-between rounded-md border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <span>
                Đã chọn: <strong>{foundPatient.name}</strong> —{" "}
                {foundPatient.id} · {foundPatient.phone}
              </span>
              <button
                className="text-xs underline hover:no-underline"
                onClick={() => setFoundPatient(null)}
              >
                Bỏ chọn
              </button>
            </div>
          )}

          {/* New patient fields */}
          {showNewPatientForm && !foundPatient && (
            <>
              <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                <span>
                  Nhập thông tin bên dưới để tạo hẹn cho BN mới.
                </span>
              </div>
              <div className="mb-3">
                <Label>
                  Họ tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <Label>
                  Số điện thoại <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                />
              </div>
              <div className="mb-4 flex items-start gap-2 rounded-md bg-blue-50 px-4 py-2.5 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                <span>
                  BN mới chỉ cần tên + SĐT + lý do khám để đặt hẹn. Thông tin
                  đầy đủ sẽ bổ sung khi BN đến check-in.
                </span>
              </div>
            </>
          )}

          {/* Shared fields */}
          <div className="mb-3">
            <Label>Bác sĩ chỉ định</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger>
                <SelectValue placeholder="BS nào trống" />
              </SelectTrigger>
              <SelectContent>
                {mockDoctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lý do khám</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value.slice(0, 500))}
              rows={3}
            />
          </div>
        </div>

        {/* Right: Calendar + Slots */}
        <div>
          <h2 className="mb-4 text-base font-bold">Chọn ngày & giờ</h2>

          <AppointmentCalendar
            year={calYear}
            month={calMonth}
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d)
              setSelectedTime(null)
            }}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />

          {slots && (
            <div className="mt-6">
              <AppointmentSlots
                morning={slots.morning}
                afternoon={slots.afternoon}
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
              />
            </div>
          )}
        </div>
      </div>

      {/* Confirmation bar */}
      <ConfirmationBar
        patientName={(foundPatient?.name ?? newName) || null}
        date={selectedDate}
        time={selectedTime}
        reason={reason || null}
        doctorName={selectedDoctor?.name ?? null}
        onCancel={() => navigate("/intake")}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
