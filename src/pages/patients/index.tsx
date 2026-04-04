import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { mockPatients, type PatientActiveStatus } from "@/data/mock-patients"
import { PatientFilters } from "@/components/patients/patient-filters"
import { PatientRegistryTable } from "@/components/patients/patient-registry-table"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserAdd01Icon } from "@hugeicons/core-free-icons"

export default function PatientRegistry() {
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<PatientActiveStatus | "all">(
    "hoat_dong"
  )
  const [genderFilter, setGenderFilter] = useState<
    "all" | "Nam" | "Nữ" | "Khác"
  >("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    let result = mockPatients

    if (statusFilter !== "all") {
      result = result.filter((p) => p.activeStatus === statusFilter)
    }

    if (genderFilter !== "all") {
      result = result.filter((p) => p.gender === genderFilter)
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.id.toLowerCase().includes(q)
      )
    }

    return result
  }, [search, statusFilter, genderFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Bệnh nhân</h1>
          <p className="text-sm text-muted-foreground">Danh sách bệnh nhân</p>
        </div>
        <Button onClick={() => navigate("/intake/new")}>
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
          Đăng ký bệnh nhân
        </Button>
      </div>

      {/* Filters */}
      <PatientFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => {
          setStatusFilter(v)
          setPage(1)
        }}
        genderFilter={genderFilter}
        onGenderFilterChange={(v) => {
          setGenderFilter(v)
          setPage(1)
        }}
      />

      {/* Table */}
      <div className="rounded-lg border border-border">
        <PatientRegistryTable
          patients={filtered}
          page={page}
          pageSize={pageSize}
        />
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Hiển thị {Math.min(filtered.length, pageSize)} / {filtered.length}{" "}
          bệnh nhân
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
