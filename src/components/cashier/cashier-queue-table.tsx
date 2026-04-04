import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
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
  Payment02Icon,
  FileSearchIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { CategoryBadge } from "@/components/cashier/category-badge"
import type { PaymentRequest } from "@/data/mock-cashier"
import { formatVND, formatPhone } from "@/data/mock-cashier"

function WaitTime({ queuedAt }: { queuedAt: string }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const minutes = Math.floor(
    (Date.now() - new Date(queuedAt).getTime()) / 60_000
  )
  const isAlert = minutes >= 10
  return (
    <span
      className={
        isAlert
          ? "text-xs font-medium text-[#A32D2D]"
          : "text-xs text-muted-foreground"
      }
    >
      {minutes} phút
    </span>
  )
}

interface CashierQueueTableProps {
  requests: PaymentRequest[]
  onViewDetail?: (paymentRequestId: string) => void
  onReturnToQueue?: (paymentRequestId: string) => void
}

export function CashierQueueTable({ requests, onViewDetail, onReturnToQueue }: CashierQueueTableProps) {
  const navigate = useNavigate()

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-border">
        <div className="py-12 text-center text-[13px] text-muted-foreground">
          Không có bệnh nhân chờ thanh toán
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-9">STT</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Loại thanh toán</TableHead>
            <TableHead className="text-right">Tạm tính</TableHead>
            <TableHead>Chờ</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req, idx) => (
            <TableRow key={req.id}>
              <TableCell className="text-center text-xs text-muted-foreground">
                {idx + 1}
              </TableCell>
              <TableCell>
                <div className="text-[13px] font-medium">
                  {req.patientName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {req.patientId}
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatPhone(req.patientPhone)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {req.categories.map((cat) => (
                    <CategoryBadge key={cat} category={cat} />
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right text-[13px] font-medium">
                {formatVND(req.estimatedTotal)}
              </TableCell>
              <TableCell>
                <WaitTime queuedAt={req.queuedAt} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-muted-foreground"
                    >
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem
                      onClick={() =>
                        navigate(`/payment/process/${req.id}`)
                      }
                    >
                      <HugeiconsIcon
                        icon={Payment02Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Thanh toán
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onViewDetail?.(req.id)}
                    >
                      <HugeiconsIcon
                        icon={FileSearchIcon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onReturnToQueue?.(req.id)}
                    >
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        className="mr-2 size-4"
                        strokeWidth={1.5}
                      />
                      Trả lại hàng đợi
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
