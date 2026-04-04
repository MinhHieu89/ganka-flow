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
  FileSearchIcon,
  PrinterIcon,
  MoneyReceive01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { CategoryBadge } from "@/components/cashier/category-badge"
import type { Transaction, TransactionStatus } from "@/data/mock-cashier"
import {
  formatVND,
  formatPhone,
  getPaymentMethodLabel,
} from "@/data/mock-cashier"

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; color: string }
> = {
  paid: { label: "Đã thanh toán", color: "#0F6E56" },
  refunded: { label: "Đã hoàn tiền", color: "#A32D2D" },
  pending_refund: { label: "Chờ hoàn tiền", color: "#854F0B" },
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface CashierTransactionsTableProps {
  transactions: Transaction[]
  onViewInvoice?: (transactionId: string) => void
  onRefund?: (transactionId: string) => void
}

export function CashierTransactionsTable({
  transactions,
  onViewInvoice,
  onRefund,
}: CashierTransactionsTableProps) {
  const sorted = [...transactions].sort(
    (a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  )

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-9">STT</TableHead>
            <TableHead>Bệnh nhân</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead className="text-right">Thành tiền</TableHead>
            <TableHead>Giờ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((tx) => {
            const statusCfg = STATUS_CONFIG[tx.status]
            return (
              <TableRow key={tx.id}>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {tx.stt}
                </TableCell>
                <TableCell>
                  <div className="text-[13px] font-medium">
                    {tx.patientName}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {tx.patientId}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatPhone(tx.patientPhone)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {tx.categories.map((cat) => (
                      <CategoryBadge key={cat} category={cat} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {getPaymentMethodLabel(tx.paymentMethod)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(tx.amount)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatTime(tx.completedAt)}
                </TableCell>
                <TableCell>
                  <span
                    className="text-xs font-medium"
                    style={{ color: statusCfg.color }}
                  >
                    {statusCfg.label}
                  </span>
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
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={() => onViewInvoice?.(tx.id)}>
                        <HugeiconsIcon
                          icon={FileSearchIcon}
                          className="mr-2 size-4"
                          strokeWidth={1.5}
                        />
                        Xem hóa đơn
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HugeiconsIcon
                          icon={PrinterIcon}
                          className="mr-2 size-4"
                          strokeWidth={1.5}
                        />
                        In lại
                      </DropdownMenuItem>
                      {tx.status === "paid" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onRefund?.(tx.id)}>
                            <HugeiconsIcon
                              icon={MoneyReceive01Icon}
                              className="mr-2 size-4"
                              strokeWidth={1.5}
                            />
                            Yêu cầu hoàn tiền
                          </DropdownMenuItem>
                        </>
                      )}
                      {tx.status === "pending_refund" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <HugeiconsIcon
                              icon={Cancel01Icon}
                              className="mr-2 size-4"
                              strokeWidth={1.5}
                            />
                            Hủy yêu cầu hoàn tiền
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
    </div>
  )
}
