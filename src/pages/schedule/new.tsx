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
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

export default function ScheduleNew() {
  const navigate = useNavigate()
  const { searchPatients, addAppointment, addPatient, addVisit } =
    useReceptionist()

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [searchDone, setSearchDone] = useState(false)

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

  function handleSearch() {
    if (searchQuery.length < 2) return
    const results = searchPatients(searchQuery)
    if (results.length > 0) {
      setFoundPatient(results[0])
    } else {
      setFoundPatient(null)
    }
    setSearchDone(true)
  }

  function handleConfirm() {
    let patientId = foundPatient?.id
    let patientName = foundPatient?.name ?? newName

    if (!foundPatient && newName && newPhone) {
      const newPat = addPatient({
        name: newName,
        phone: newPhone,
        gender: "Khác" as const,
        dob: "",
        birthYear: 0,
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
      reason: reason || undefined,
      doctorName: selectedDoctor?.name,
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
          <div className="relative mb-3">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchDone(false)
                setFoundPatient(null)
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onBlur={handleSearch}
              placeholder="Nhập SĐT hoặc tên BN..."
              className="pl-9"
            />
          </div>

          {/* Found banner */}
          {searchDone && foundPatient && (
            <div className="mb-4 flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-4 py-2.5 text-sm text-green-700 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400">
              <span>ℹ</span>
              <span>
                Đã tìm thấy: <strong>{foundPatient.name}</strong> —{" "}
                {foundPatient.id}
              </span>
            </div>
          )}

          {/* Not found banner */}
          {searchDone && !foundPatient && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
              <span>⚠</span>
              <span>
                Không tìm thấy BN với SĐT này. Nhập thông tin bên dưới để tạo
                hẹn cho BN mới.
              </span>
            </div>
          )}

          {/* New patient fields */}
          {searchDone && !foundPatient && (
            <>
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
                <span>ℹ</span>
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
        patientName={foundPatient?.name ?? newName || null}
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
