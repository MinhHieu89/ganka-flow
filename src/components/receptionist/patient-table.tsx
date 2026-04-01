import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useReceptionist } from "@/contexts/receptionist-context"
import { STATUS_CONFIG, SOURCE_CONFIG, type Visit } from "@/data/mock-patients"
import { ActionMenu } from "./action-menu"

type SortField = "name" | "birthYear" | "scheduledAt" | "source" | "status"
type SortDir = "asc" | "desc"

interface PatientTableProps {
  visits: Visit[]
  onCheckIn: (visit: Visit) => void
  onCancel: (visitId: string) => void
  page: number
  pageSize: number
}

export function PatientTable({
  visits,
  onCheckIn,
  onCancel,
  page,
  pageSize,
}: PatientTableProps) {
  const { getPatient } = useReceptionist()
  const [sortField, setSortField] = useState<SortField>("scheduledAt")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  const sorted = [...visits].sort((a, b) => {
    const patA = getPatient(a.patientId)
    const patB = getPatient(b.patientId)
    let cmp = 0
    switch (sortField) {
      case "name":
        cmp = (patA?.name ?? "").localeCompare(patB?.name ?? "", "vi")
        break
      case "birthYear":
        cmp = (patA?.birthYear ?? 0) - (patB?.birthYear ?? 0)
        break
      case "scheduledAt":
        cmp = (a.scheduledAt ?? "99:99").localeCompare(b.scheduledAt ?? "99:99")
        break
      case "source":
        cmp = a.source.localeCompare(b.source)
        break
      case "status":
        cmp = a.status.localeCompare(b.status)
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
          <TableHead className="w-12 text-xs">STT</TableHead>
          <TableHead
            className="cursor-pointer text-xs"
            onClick={() => toggleSort("name")}
          >
            Họ tên{sortIndicator("name")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("birthYear")}
          >
            Năm sinh{sortIndicator("birthYear")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("scheduledAt")}
          >
            Giờ hẹn{sortIndicator("scheduledAt")}
          </TableHead>
          <TableHead
            className="w-20 cursor-pointer text-xs"
            onClick={() => toggleSort("source")}
          >
            Nguồn{sortIndicator("source")}
          </TableHead>
          <TableHead className="text-xs">Lý do khám</TableHead>
          <TableHead
            className="w-28 cursor-pointer text-xs"
            onClick={() => toggleSort("status")}
          >
            Trạng thái{sortIndicator("status")}
          </TableHead>
          <TableHead className="w-16 text-right text-xs">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((visit, i) => {
          const patient = getPatient(visit.patientId)
          if (!patient) return null
          const statusCfg = STATUS_CONFIG[visit.status]
          const sourceCfg = SOURCE_CONFIG[visit.source]

          return (
            <TableRow key={visit.id}>
              <TableCell className="text-muted-foreground">
                {(page - 1) * pageSize + i + 1}
              </TableCell>
              <TableCell>
                <div className="font-semibold">{patient.name}</div>
                <div className="text-xs text-muted-foreground">
                  {patient.id}
                </div>
              </TableCell>
              <TableCell>{patient.birthYear}</TableCell>
              <TableCell
                className={!visit.scheduledAt ? "text-muted-foreground" : ""}
              >
                {visit.scheduledAt ?? "—"}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${sourceCfg.color}`}>
                  {sourceCfg.label}
                </span>
              </TableCell>
              <TableCell
                className={!visit.reason ? "text-muted-foreground italic" : ""}
              >
                {visit.reason || "Chưa rõ"}
              </TableCell>
              <TableCell>
                <span className={`font-medium ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <ActionMenu
                  visit={visit}
                  onCheckIn={() => onCheckIn(visit)}
                  onCancel={() => onCancel(visit.id)}
                />
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
