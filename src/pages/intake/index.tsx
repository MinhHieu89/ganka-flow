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
import { type PatientStatus, type Patient, type Visit } from "@/data/mock-patients"
import { KpiCards } from "@/components/receptionist/kpi-cards"
import { StatusFilters } from "@/components/receptionist/status-filters"
import { PatientTable } from "@/components/receptionist/patient-table"
import { PatientSearch } from "@/components/receptionist/patient-search"
import { CheckinModal } from "@/components/receptionist/checkin-modal"
import { WalkinModal } from "@/components/receptionist/walkin-modal"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon, UserAdd01Icon, Refresh01Icon } from "@hugeicons/core-free-icons"

export default function IntakeDashboard() {
  const navigate = useNavigate()
  const { todayVisits, cancelVisit } = useReceptionist()

  const [activeFilter, setActiveFilter] = useState<PatientStatus | "all">(
    "all"
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals
  const [checkinVisit, setCheckinVisit] = useState<Visit | null>(null)
  const [walkinPatient, setWalkinPatient] = useState<Patient | null>(null)

  // Filter visits
  const filteredVisits =
    activeFilter === "all"
      ? todayVisits
      : todayVisits.filter((v) => v.status === activeFilter)

  // Counts for filter tabs
  const counts = {
    all: todayVisits.length,
    chua_den: todayVisits.filter((v) => v.status === "chua_den").length,
    cho_kham: todayVisits.filter((v) => v.status === "cho_kham").length,
    dang_sang_loc: todayVisits.filter((v) => v.status === "dang_sang_loc").length,
    dang_kham: todayVisits.filter((v) => v.status === "dang_kham").length,
    hoan_thanh: todayVisits.filter((v) => v.status === "hoan_thanh").length,
    da_huy: todayVisits.filter((v) => v.status === "da_huy").length,
  }

  const totalPages = Math.max(1, Math.ceil(filteredVisits.length / pageSize))

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page title */}
      <h1 className="text-xl font-bold">Dashboard</h1>

      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-60">
            <PatientSearch onSelectPatient={setWalkinPatient} />
          </div>
          <Button variant="ghost" size="icon-sm">
            <HugeiconsIcon icon={Refresh01Icon} className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/schedule/new")}>
            <HugeiconsIcon icon={Calendar01Icon} className="size-4" />
            Đặt lịch hẹn
          </Button>
          <Button onClick={() => navigate("/intake/new")}>
            <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
            Tiếp nhận BN mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards />

      {/* Status Filters */}
      <StatusFilters
        activeFilter={activeFilter}
        onFilterChange={(f) => {
          setActiveFilter(f)
          setPage(1)
        }}
        counts={counts}
      />

      {/* Patient Table */}
      <div className="rounded-lg border border-border">
        <PatientTable
          visits={filteredVisits}
          onCheckIn={setCheckinVisit}
          onCancel={cancelVisit}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(filteredVisits.length, pageSize)} /{" "}
          {filteredVisits.length} bệnh nhân hôm nay
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

      {/* Modals */}
      <CheckinModal
        visit={checkinVisit}
        open={!!checkinVisit}
        onOpenChange={(open) => !open && setCheckinVisit(null)}
      />
      <WalkinModal
        patient={walkinPatient}
        open={!!walkinPatient}
        onOpenChange={(open) => !open && setWalkinPatient(null)}
      />
    </div>
  )
}
