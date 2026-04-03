import { useState } from "react"
import { useNavigate } from "react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  type Patient,
  PATIENT_TYPE_CONFIG,
  ACTIVE_STATUS_CONFIG,
} from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon } from "@hugeicons/core-free-icons"

type SortField = "id" | "name"
type SortDir = "asc" | "desc"

interface PatientRegistryTableProps {
  patients: Patient[]
  page: number
  pageSize: number
}

export function PatientRegistryTable({
  patients,
  page,
  pageSize,
}: PatientRegistryTableProps) {
  const navigate = useNavigate()
  const [sortField, setSortField] = useState<SortField>("id")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...patients].sort((a, b) => {
    let cmp = 0
    switch (sortField) {
      case "id":
        cmp = a.id.localeCompare(b.id)
        break
      case "name":
        cmp = a.name.localeCompare(b.name, "vi")
        break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  const sortIndicator = (field: SortField) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="w-36 cursor-pointer text-xs"
            onClick={() => toggleSort("id")}
          >
            Mã bệnh nhân{sortIndicator("id")}
          </TableHead>
          <TableHead
            className="cursor-pointer text-xs"
            onClick={() => toggleSort("name")}
          >
            Họ và tên{sortIndicator("name")}
          </TableHead>
          <TableHead className="w-32 text-xs">Số điện thoại</TableHead>
          <TableHead className="w-40 text-xs">Loại bệnh nhân</TableHead>
          <TableHead className="w-20 text-xs">Giới tính</TableHead>
          <TableHead className="w-20 text-xs">Dị ứng</TableHead>
          <TableHead className="w-28 text-xs">Trạng thái</TableHead>
          <TableHead className="w-12 text-right text-xs" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((patient) => {
          const typeCfg = PATIENT_TYPE_CONFIG[patient.type]
          const statusCfg = ACTIVE_STATUS_CONFIG[patient.activeStatus]
          const allergyCount = patient.allergies
            ? patient.allergies.split(",").length
            : 0

          return (
            <TableRow key={patient.id}>
              <TableCell className="font-medium text-teal-600">
                {patient.id}
              </TableCell>
              <TableCell className="font-semibold">{patient.name}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeCfg.color}`}
                >
                  {typeCfg.label}
                </span>
              </TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                {allergyCount > 0 ? (
                  <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                    <span className="size-4 text-center leading-4">!</span>
                    {allergyCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground">---</span>
                )}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusCfg.color}`}
                >
                  {statusCfg.label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <HugeiconsIcon icon={ViewIcon} className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
