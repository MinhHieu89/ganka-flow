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
  EyeIcon,
  Settings02Icon,
  CheckmarkCircle02Icon,
  PrinterIcon,
  CallingIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { OpticalOrder, OrderStatus } from "@/data/mock-optical"

interface OrderTableProps {
  orders: OpticalOrder[]
  onUpdateStatus: (id: string, status: OrderStatus) => void
}

function formatOrderDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> =
  {
    ordered: {
      label: "Đã đặt",
      className:
        "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    },
    fabricating: {
      label: "Đang gia công",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    },
    ready_delivery: {
      label: "Sẵn sàng giao",
      className:
        "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    },
    delivered: {
      label: "Đã giao",
      className: "bg-secondary text-secondary-foreground",
    },
  }

export function OrderTable({ orders, onUpdateStatus }: OrderTableProps) {
  const sorted = [...orders].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1
    if (a.status !== "delivered" && b.status === "delivered") return -1
    return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
  })

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã đơn</TableHead>
          <TableHead>Bệnh nhân</TableHead>
          <TableHead>Loại kính</TableHead>
          <TableHead>Gọng</TableHead>
          <TableHead>Tròng</TableHead>
          <TableHead>Ngày đặt</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((o) => {
          const sc = statusConfig[o.status]
          const isDelivered = o.status === "delivered"

          return (
            <TableRow key={o.id} className={cn(isDelivered && "opacity-55")}>
              <TableCell>
                <span className="font-mono text-xs">{o.id}</span>
              </TableCell>
              <TableCell>
                <div className="font-medium">{o.patientName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.patientId}
                </div>
              </TableCell>
              <TableCell>{o.lensType}</TableCell>
              <TableCell>
                <div>{o.frameName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.frameColor}
                </div>
              </TableCell>
              <TableCell>
                <div>{o.lensName}</div>
                <div className="text-xs text-muted-foreground">
                  {o.lensSpec}
                </div>
              </TableCell>
              <TableCell>{formatOrderDate(o.orderDate)}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    sc.className
                  )}
                >
                  {sc.label}
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
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={EyeIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>

                    {o.status === "ordered" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(o.id, "fabricating")}
                      >
                        <HugeiconsIcon
                          icon={Settings02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Bắt đầu gia công
                      </DropdownMenuItem>
                    )}

                    {o.status === "fabricating" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(o.id, "ready_delivery")}
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Hoàn thành gia công
                      </DropdownMenuItem>
                    )}

                    {o.status === "ready_delivery" && (
                      <DropdownMenuItem
                        onClick={() => onUpdateStatus(o.id, "delivered")}
                      >
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        Xác nhận giao kính
                      </DropdownMenuItem>
                    )}

                    {o.status !== "delivered" && (
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        In đơn kính
                      </DropdownMenuItem>
                    )}

                    {o.status === "delivered" && (
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="size-4"
                          strokeWidth={1.5}
                        />
                        In đơn kính
                      </DropdownMenuItem>
                    )}

                    {o.status === "ready_delivery" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <HugeiconsIcon
                            icon={CallingIcon}
                            className="size-4"
                            strokeWidth={1.5}
                          />
                          Liên hệ BN
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
