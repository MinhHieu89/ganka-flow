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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useReceptionist } from "@/contexts/receptionist-context"
import { STATUS_CONFIG, type Visit } from "@/data/mock-patients"
import { hasRedFlag } from "@/lib/red-flags"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"

type SortField = "name" | "birthYear" | "waitTime" | "status"
type SortDir = "asc" | "desc"

interface QueueTableProps {
  visits: Visit[]
  onStartScreening: (visit: Visit) => void
  page: number
  pageSize: number
}

function getWaitMinutes(checkedInAt?: string): number | null {
  if (!checkedInAt) return null
  const now = new Date()
  const checkedIn = new Date(checkedInAt)
  return Math.floor((now.getTime() - checkedIn.getTime()) / 60000)
}

export function QueueTable({
  visits,
  onStartScreening,
  page,
  pageSize,
}: QueueTableProps) {
  const navigate = useNavigate()
  const { getPatient } = useReceptionist()
  const [sortField, setSortField] = useState<SortField>("waitTime")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

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
      case "waitTime":
        cmp =
          (getWaitMinutes(a.checkedInAt) ?? 0) -
          (getWaitMinutes(b.checkedInAt) ?? 0)
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
          <TableHead className="w-20 text-xs">Giới tính</TableHead>
          <TableHead
            className="w-24 cursor-pointer text-xs"
            onClick={() => toggleSort("waitTime")}
          >
            Thời gian chờ{sortIndicator("waitTime")}
          </TableHead>
          <TableHead className="text-xs">Lý do khám</TableHead>
          <TableHead
            className="w-28 cursor-pointer text-xs"
            onClick={() => toggleSort("status")}
          >
            Trạng thái{sortIndicator("status")}
          </TableHead>
          <TableHead className="w-28 text-right text-xs">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paginated.map((visit, i) => {
          const patient = getPatient(visit.patientId)
          if (!patient) return null
          const statusCfg = STATUS_CONFIG[visit.status]
          const waitMinutes = getWaitMinutes(visit.checkedInAt)
          const isScreening = visit.status === "dang_sang_loc"
          const flagged = hasRedFlag(visit.reason, patient.chiefComplaint)

          return (
            <TableRow
              key={visit.id}
              className={isScreening ? "bg-sky-50 dark:bg-sky-950/20" : ""}
            >
              <TableCell className="text-muted-foreground">
                {(page - 1) * pageSize + i + 1}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">{patient.name}</span>
                  {flagged && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <HugeiconsIcon
                            icon={Alert01Icon}
                            className="size-4 text-destructive"
                            strokeWidth={2}
                          />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Cờ đỏ — cần ưu tiên</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {patient.id}
                </div>
              </TableCell>
              <TableCell>{patient.birthYear}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>
                {isScreening ? (
                  <span className="text-muted-foreground">—</span>
                ) : waitMinutes !== null ? (
                  <span
                    className={
                      waitMinutes >= 30 ? "font-semibold text-destructive" : ""
                    }
                  >
                    {waitMinutes}p
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
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
                {isScreening ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/screening/${visit.id}`)}
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onStartScreening(visit)}>
                    Bắt đầu sàng lọc
                  </Button>
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
