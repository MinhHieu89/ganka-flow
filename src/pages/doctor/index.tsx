import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"
import { useDoctor } from "@/contexts/doctor-context"
import { DoctorKpiCards } from "@/components/doctor/kpi-cards"
import {
  DoctorStatusFilters,
  type DoctorFilter,
} from "@/components/doctor/status-filters"
import { DoctorQueueTable } from "@/components/doctor/queue-table"

export default function DoctorDashboard() {
  const { todayVisits } = useDoctor()
  const [filter, setFilter] = useState<DoctorFilter>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const queueVisits = todayVisits.filter(
    (v) => v.status === "cho_kham" || v.status === "dang_kham"
  )

  const filtered =
    filter === "all"
      ? queueVisits
      : queueVisits.filter((v) => v.status === filter)

  const counts: Record<DoctorFilter, number> = {
    all: queueVisits.length,
    cho_kham: queueVisits.filter((v) => v.status === "cho_kham").length,
    dang_kham: queueVisits.filter((v) => v.status === "dang_kham").length,
  }

  const totalPages = Math.ceil(filtered.length / pageSize)
  const from = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, filtered.length)

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <Button variant="outline" size="sm">
          <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
          Làm mới
        </Button>
      </div>

      <DoctorKpiCards />

      <DoctorStatusFilters
        activeFilter={filter}
        onFilterChange={(f) => {
          setFilter(f)
          setPage(1)
        }}
        counts={counts}
      />

      <DoctorQueueTable visits={filtered} page={page} pageSize={pageSize} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {from}–{to} trên {filtered.length} bệnh nhân
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(val) => {
              setPageSize(Number(val))
              setPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  )
}
