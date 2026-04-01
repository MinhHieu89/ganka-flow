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
