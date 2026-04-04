import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  UserAdd01Icon,
  EyeIcon,
  FileAddIcon,
  UndoIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { OpticalConsultation } from "@/data/mock-optical"

interface ConsultationQueueProps {
  consultations: OpticalConsultation[]
  onAcceptPatient: (id: string) => void
  onCreateOrder: (id: string) => void
  onReturnToQueue: (id: string) => void
  onViewRx: (id: string) => void
}

function getWaitMinutes(queuedAt: string): number {
  return Math.floor((Date.now() - new Date(queuedAt).getTime()) / 60000)
}

export function ConsultationQueue({
  consultations,
  onAcceptPatient,
  onCreateOrder,
  onReturnToQueue,
  onViewRx,
}: ConsultationQueueProps) {
  const sorted = [...consultations].sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === "in_consultation" ? -1 : 1
    }
    return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime()
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">STT</TableHead>
          <TableHead>Bệnh nhân</TableHead>
          <TableHead>BS chỉ định</TableHead>
          <TableHead>Đơn kính BS</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Thời gian chờ</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((c, i) => {
          const waitMin = getWaitMinutes(c.queuedAt)
          const isConsulting = c.status === "in_consultation"

          return (
            <TableRow
              key={c.id}
              className={cn(isConsulting && "bg-blue-50 dark:bg-blue-950/30")}
            >
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <div className="font-medium">{c.patientName}</div>
                <div className="text-xs text-muted-foreground">
                  {c.patientId}
                </div>
              </TableCell>
              <TableCell>{c.doctor}</TableCell>
              <TableCell>
                <div className="font-mono text-xs leading-relaxed text-muted-foreground">
                  OD: {c.rxOd}
                  <br />
                  OS: {c.rxOs}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    isConsulting
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      isConsulting ? "bg-blue-500" : "bg-amber-500"
                    )}
                  />
                  {isConsulting ? "Đang tư vấn" : "Chờ tư vấn"}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "text-xs",
                    waitMin >= 30
                      ? "font-medium text-destructive"
                      : "text-muted-foreground"
                  )}
                >
                  {waitMin} phút
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    {isConsulting ? (
                      <>
                        <DropdownMenuItem onClick={() => onCreateOrder(c.id)}>
                          <HugeiconsIcon
                            icon={FileAddIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Tạo đơn kính
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewRx(c.id)}>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Xem đơn kính BS
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onReturnToQueue(c.id)}>
                          <HugeiconsIcon
                            icon={UndoIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Trả lại hàng đợi
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem onClick={() => onAcceptPatient(c.id)}>
                          <HugeiconsIcon
                            icon={UserAdd01Icon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Nhận BN
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewRx(c.id)}>
                          <HugeiconsIcon
                            icon={EyeIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Xem đơn kính BS
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
