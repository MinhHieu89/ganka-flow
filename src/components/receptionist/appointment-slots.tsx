import { cn } from "@/lib/utils"
import { type TimeSlot } from "@/data/mock-appointments"

interface AppointmentSlotsProps {
  morning: TimeSlot[]
  afternoon: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}

function SlotGrid({
  slots,
  selectedTime,
  onSelectTime,
}: {
  slots: TimeSlot[]
  selectedTime: string | null
  onSelectTime: (time: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => {
        const isFull = slot.booked >= slot.capacity
        const isSelected = slot.time === selectedTime

        return (
          <button
            key={slot.time}
            disabled={isFull}
            onClick={() => onSelectTime(slot.time)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm transition-colors",
              isFull &&
                "cursor-not-allowed border-border bg-muted text-muted-foreground/40 line-through",
              isSelected &&
                "border-2 border-purple-500 bg-purple-50 font-semibold text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
              !isFull &&
                !isSelected &&
                "border-border text-foreground hover:border-foreground/30"
            )}
          >
            {slot.time}
          </button>
        )
      })}
    </div>
  )
}

export function AppointmentSlots({
  morning,
  afternoon,
  selectedTime,
  onSelectTime,
}: AppointmentSlotsProps) {
  const morningAvail = morning.filter((s) => s.booked < s.capacity).length
  const afternoonAvail = afternoon.filter((s) => s.booked < s.capacity).length

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-1 text-sm font-semibold">
          Sáng{" "}
          <span className="font-normal text-muted-foreground">
            {morningAvail} slot trống / {morning.length}
          </span>
        </div>
        <div className="mb-2.5 border-t border-border" />
        <SlotGrid
          slots={morning}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
        />
      </div>

      <div>
        <div className="mb-1 text-sm font-semibold">
          Chiều{" "}
          <span className="font-normal text-muted-foreground">
            {afternoonAvail} slot trống / {afternoon.length}
          </span>
        </div>
        <div className="mb-2.5 border-t border-border" />
        <SlotGrid
          slots={afternoon}
          selectedTime={selectedTime}
          onSelectTime={onSelectTime}
        />
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border border-border" />
          Trống
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border-2 border-purple-500" />
          Đang chọn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3.5 rounded border border-border bg-muted" />
          Đã đầy
        </span>
      </div>
    </div>
  )
}
