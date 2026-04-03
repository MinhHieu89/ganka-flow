import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert01Icon } from "@hugeicons/core-free-icons"
import { useReceptionist } from "@/contexts/receptionist-context"
import { useDoctor } from "@/contexts/doctor-context"
import type { Visit } from "@/data/mock-patients"
import { hasRedFlag } from "@/lib/red-flags"

const DISEASE_GROUP_LABELS: Record<string, string> = {
  dryEye: "Khô mắt",
  refraction: "Khúc xạ",
  myopiaControl: "Cận thị",
  general: "Tổng quát",
}

function getDiseaseGroupLabel(visit: Visit): string {
  const groups = visit.screeningData?.step2?.selectedGroups
  if (!groups || groups.length === 0) return ""
  return DISEASE_GROUP_LABELS[groups[0]] ?? ""
}

function getWaitMinutes(checkedInAt?: string): number | null {
  if (!checkedInAt) return null
  const diff = Date.now() - new Date(checkedInAt).getTime()
  return Math.floor(diff / 60000)
}

interface DoctorQueueTableProps {
  visits: Visit[]
  page: number
  pageSize: number
}

export function DoctorQueueTable({
  visits,
  page,
  pageSize,
}: DoctorQueueTableProps) {
  const navigate = useNavigate()
  const { getPatient } = useReceptionist()
  const { startExam } = useDoctor()

  const sorted = [...visits].sort((a, b) => {
    const aFlag = hasRedFlag(a.reason, a.screeningData?.chiefComplaint)
    const bFlag = hasRedFlag(b.reason, b.screeningData?.chiefComplaint)
    if (aFlag && !bFlag) return -1
    if (!aFlag && bFlag) return 1
    const aWait = getWaitMinutes(a.checkedInAt) ?? 0
    const bWait = getWaitMinutes(b.checkedInAt) ?? 0
    return bWait - aWait
  })

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  function handleStartExam(visit: Visit) {
    if (visit.status === "cho_kham") {
      startExam(visit.id)
    }
    navigate(`/doctor/${visit.id}`)
  }

  let waitingIndex = 0

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-xs">STT</TableHead>
            <TableHead className="text-xs">Bệnh nhân</TableHead>
            <TableHead className="w-20 text-xs">Năm sinh</TableHead>
            <TableHead className="w-[120px] text-xs">Thời gian chờ</TableHead>
            <TableHead className="w-28 text-xs">Trạng thái</TableHead>
            <TableHead className="w-16 text-xs" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((visit) => {
            const patient = getPatient(visit.patientId)
            const flagged = hasRedFlag(
              visit.reason,
              visit.screeningData?.chiefComplaint
            )
            const isExamining = visit.status === "dang_kham"
            const waitMinutes = getWaitMinutes(visit.checkedInAt)
            const diseaseGroup = getDiseaseGroupLabel(visit)

            if (!isExamining) waitingIndex++

            return (
              <TableRow
                key={visit.id}
                className={
                  flagged
                    ? "bg-red-50 dark:bg-red-950/20"
                    : isExamining
                      ? "bg-blue-50 dark:bg-blue-950/20"
                      : ""
                }
              >
                <TableCell className="text-muted-foreground">
                  {isExamining ? "—" : waitingIndex}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {patient?.name ?? "—"}
                        </span>
                        {flagged && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-950 dark:text-red-400">
                                <HugeiconsIcon
                                  icon={Alert01Icon}
                                  className="size-3"
                                  strokeWidth={2}
                                />
                                Cờ đỏ
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>Cờ đỏ — cần ưu tiên</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {visit.patientId}
                        {diseaseGroup && ` · ${diseaseGroup}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{patient?.birthYear ?? "—"}</TableCell>
                <TableCell>
                  {isExamining ? (
                    <span className="font-medium text-blue-600">Đang khám</span>
                  ) : waitMinutes !== null ? (
                    <span
                      className={
                        waitMinutes >= 30
                          ? "font-semibold text-destructive"
                          : ""
                      }
                    >
                      {waitMinutes} phút
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${
                      isExamining ? "text-blue-600" : "text-amber-500"
                    }`}
                  >
                    {isExamining ? "Đang khám" : "Đang chờ"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant={flagged || isExamining ? "default" : "outline"}
                    onClick={() => handleStartExam(visit)}
                  >
                    {isExamining ? "Tiếp tục" : "Khám"}
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
