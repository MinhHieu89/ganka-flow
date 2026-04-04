import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { OrderDetailData, OrderStatus } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

// ─── Status badge config ────────────────────────────────────────────────────

const statusBadgeConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; bgClass: string }
> = {
  ordered: {
    label: "Đã đặt",
    dotClass: "bg-green-500",
    bgClass:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  fabricating: {
    label: "Đang gia công",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ready_delivery: {
    label: "Sẵn sàng giao",
    dotClass: "bg-teal-500",
    bgClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  delivered: {
    label: "Đã giao",
    dotClass: "bg-secondary-foreground/40",
    bgClass: "bg-secondary text-secondary-foreground",
  },
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}`
}

function formatRxValue(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface OrderDetailModalProps {
  open: boolean
  onClose: () => void
  order: OrderDetailData | null
  onStartFabrication?: () => void
  onCompleteFabrication?: () => void
  onConfirmDelivery?: () => void
}

// ─── Component ──────────────────────────────────────────────────────────────

export function OrderDetailModal({
  open,
  onClose,
  order,
  onStartFabrication,
  onCompleteFabrication,
  onConfirmDelivery,
}: OrderDetailModalProps) {
  if (!order) return null

  const { rx, timeline } = order
  const badge = statusBadgeConfig[order.status]
  const total = order.framePrice + order.lensPrice

  const allStatuses: OrderStatus[] = [
    "ordered",
    "fabricating",
    "ready_delivery",
    "delivered",
  ]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Chi tiết đơn kính — {order.id}
          </DialogTitle>
        </DialogHeader>

        {/* 1. Patient + Status */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <div className="text-sm font-medium">{order.patientName}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {order.patientId}
              {order.phone && <> · {order.phone}</>}
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              badge.bgClass
            )}
          >
            <span className={cn("size-1.5 rounded-full", badge.dotClass)} />
            {badge.label}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* 2. Rx table */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thông số khúc xạ (Rx bác sĩ)
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[130px]" />
                  <TableHead className="text-center">SPH</TableHead>
                  <TableHead className="text-center">CYL</TableHead>
                  <TableHead className="text-center">AXIS</TableHead>
                  <TableHead className="text-center">ADD</TableHead>
                  <TableHead className="text-center">PD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD (mắt phải)</TableCell>
                  <TableCell className="text-center font-mono">
                    {formatRxValue(rx.od.sph)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatRxValue(rx.od.cyl)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.od.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.od.add != null ? formatRxValue(rx.od.add) : "—"}
                  </TableCell>
                  <TableCell
                    className="text-center font-mono font-medium"
                    rowSpan={2}
                  >
                    {rx.pd}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS (mắt trái)</TableCell>
                  <TableCell className="text-center font-mono">
                    {formatRxValue(rx.os.sph)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {formatRxValue(rx.os.cyl)}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {rx.os.axis}
                  </TableCell>
                  <TableCell className="text-center">
                    {rx.os.add != null ? formatRxValue(rx.os.add) : "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 3. Products */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sản phẩm
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-x-3 gap-y-1.5 text-[13px]">
              <span className="text-muted-foreground">Gọng</span>
              <span>
                {order.frameName} — {order.frameColor}
              </span>
              <span className="text-muted-foreground">Barcode gọng</span>
              <span className="font-mono text-xs text-muted-foreground">
                {order.frameBarcode}
              </span>
              <span className="text-muted-foreground">Tròng</span>
              <span>
                {order.lensName} — {order.lensSpec}
              </span>
              <span className="text-muted-foreground">Loại kính</span>
              <span>{order.glassType}</span>
            </div>
          </div>

          {/* 4. Payment */}
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Thanh toán
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Gọng</span>
                <span>{formatPrice(order.framePrice)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-muted-foreground">Tròng</span>
                <span>{formatPrice(order.lensPrice)}</span>
              </div>
              <div className="flex justify-between border-t-2 border-foreground pt-2 text-[15px] font-medium">
                <span>Tổng cộng</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      order.paymentStatus === "paid"
                        ? "bg-green-500"
                        : "bg-amber-500"
                    )}
                  />
                  {order.paymentStatus === "paid"
                    ? "Đã thanh toán"
                    : "Chờ thanh toán"}
                </span>
              </div>
            </div>
          </div>

          {/* 5. Timeline */}
          <div>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lịch sử trạng thái
            </div>
            <div className="relative pl-6">
              {allStatuses.map((status, idx) => {
                const step = timeline.find((t) => t.status === status)
                const isCompleted = !!step?.completedAt
                const nextStep = timeline.find(
                  (t) => t.status === allStatuses[idx + 1]
                )
                const isCurrent =
                  isCompleted &&
                  (idx === allStatuses.length - 1 || !nextStep?.completedAt)
                const isLast = idx === allStatuses.length - 1

                let dotClass = "border-border bg-background"
                if (isCurrent)
                  dotClass = "border-blue-500 bg-blue-100 dark:bg-blue-950"
                else if (isCompleted)
                  dotClass = "border-green-500 bg-green-100 dark:bg-green-950"

                return (
                  <div key={status} className="relative pb-5 last:pb-0">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 size-3 rounded-full border-2",
                        dotClass
                      )}
                    />
                    {/* Line */}
                    {!isLast && (
                      <div className="absolute -left-[18px] top-4 h-[calc(100%-8px)] w-0.5 bg-border" />
                    )}
                    {/* Content */}
                    <div>
                      <div
                        className={cn(
                          "text-[13px] font-medium",
                          isCurrent
                            ? "text-blue-600 dark:text-blue-400"
                            : isCompleted
                              ? ""
                              : "text-muted-foreground/60"
                        )}
                      >
                        {step?.label ?? statusBadgeConfig[status].label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step?.completedAt
                          ? `${formatDateTime(step.completedAt)} · ${step.staffName}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 6. Notes */}
          {order.notes && (
            <div className="rounded-lg bg-muted p-3 text-[13px] leading-relaxed text-muted-foreground">
              {order.notes}
            </div>
          )}
        </div>

        {/* 7. Footer */}
        <DialogFooter>
          <Button variant="outline">In đơn kính</Button>
          {order.status === "ordered" && onStartFabrication && (
            <Button onClick={onStartFabrication}>Bắt đầu gia công</Button>
          )}
          {order.status === "fabricating" && onCompleteFabrication && (
            <Button onClick={onCompleteFabrication}>
              Hoàn thành gia công
            </Button>
          )}
          {order.status === "ready_delivery" && onConfirmDelivery && (
            <Button onClick={onConfirmDelivery}>Xác nhận giao kính</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
