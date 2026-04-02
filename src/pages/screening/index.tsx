import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useReceptionist } from "@/contexts/receptionist-context"
import { type Visit } from "@/data/mock-patients"
import { ScreeningKpiCards } from "@/components/screening/kpi-cards"
import { QueueTable } from "@/components/screening/queue-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { Refresh01Icon } from "@hugeicons/core-free-icons"

export default function ScreeningDashboard() {
  const navigate = useNavigate()
  const { todayVisits, updateVisitStatus } = useReceptionist()

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Filter to only screening-relevant statuses
  const queueVisits = todayVisits.filter(
    (v) => v.status === "cho_kham" || v.status === "dang_sang_loc"
  )

  const totalPages = Math.max(1, Math.ceil(queueVisits.length / pageSize))

  function handleStartScreening(visit: Visit) {
    updateVisitStatus(visit.id, "dang_sang_loc")
    navigate(`/screening/${visit.id}`)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page title + actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard Sàng lọc</h1>
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <ScreeningKpiCards />

      {/* Queue Table */}
      <div className="rounded-lg border border-border">
        <QueueTable
          visits={queueVisits}
          onStartScreening={handleStartScreening}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(queueVisits.length, pageSize)} /{" "}
          {queueVisits.length} bệnh nhân trong hàng chờ
        </span>
        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v))
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
