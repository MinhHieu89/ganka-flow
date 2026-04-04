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
import type {
  OrderDetailData,
  OrderStatus,
  RxEye,
} from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

// ─── Status badge config ────────────────────────────────────────────────────

const statusBadgeConfig: Record<
  OrderStatus,
  { label: string; dotClass: string; bgClass: string }
> = {
  ordered: {
    label: "Da dat",
    dotClass: "bg-green-500",
    bgClass:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  },
  fabricating: {
    label: "Dang gia cong",
    dotClass: "bg-blue-500",
    bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ready_delivery: {
    label: "San sang giao",
    dotClass: "bg-teal-500",
    bgClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  delivered: {
    label: "Da giao",
    dotClass: "bg-secondary-foreground/40",
    bgClass: "bg-secondary text-secondary-foreground",
  },
}

// Fix Vietnamese labels with proper diacritics
statusBadgeConfig.ordered.label = "\u0110\u00e3 \u0111\u1eb7t"
statusBadgeConfig.fabricating.label = "\u0110ang gia c\u00f4ng"
statusBadgeConfig.ready_delivery.label = "S\u1eb5n s\u00e0ng giao"
statusBadgeConfig.delivered.label = "\u0110\u00e3 giao"

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

function formatSph(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

function formatCyl(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

function formatAxis(value: number): string {
  return `${value}\u00b0`
}

function formatAdd(eye: RxEye): string {
  if (eye.add == null) return "\u2014"
  const sign = eye.add >= 0 ? "+" : ""
  return `${sign}${eye.add.toFixed(2)}`
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

  // Timeline helpers
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
          <DialogTitle className="sr-only">Chi ti\u1ebft \u0111\u01a1n k\u00ednh</DialogTitle>
        </DialogHeader>

        {/* 1. Patient + Status */}
        <div className="flex items-start justify-between border-b pb-4">
          <div>
            <p className="text-sm font-medium leading-none">
              {order.patientName}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {order.patientId}
              {order.phone && <> &middot; {order.phone}</>}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
              badge.bgClass
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", badge.dotClass)}
            />
            {badge.label}
          </span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
          {/* 2. Rx table */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Th\u00f4ng s\u1ed1 kh\u00fac x\u1ea1 (Rx b\u00e1c s\u0129)
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>SPH</TableHead>
                  <TableHead>CYL</TableHead>
                  <TableHead>AXIS</TableHead>
                  <TableHead>ADD</TableHead>
                  <TableHead>PD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD</TableCell>
                  <TableCell className="font-mono">
                    {formatSph(rx.od.sph)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCyl(rx.od.cyl)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAxis(rx.od.axis)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAdd(rx.od)}
                  </TableCell>
                  <TableCell
                    className="text-center font-mono align-middle"
                    rowSpan={2}
                  >
                    {rx.pd}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS</TableCell>
                  <TableCell className="font-mono">
                    {formatSph(rx.os.sph)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCyl(rx.os.cyl)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAxis(rx.os.axis)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAdd(rx.os)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* 3. Products */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              S\u1ea3n ph\u1ea9m
            </p>
            <div className="grid grid-cols-[100px_1fr] gap-y-2 text-[13px]">
              <span className="text-muted-foreground">G\u1ecdng</span>
              <span>
                {order.frameName} \u2014 {order.frameColor}
              </span>
              <span className="text-muted-foreground">Barcode g\u1ecdng</span>
              <span className="font-mono">{order.frameBarcode}</span>
              <span className="text-muted-foreground">Tr\u00f2ng</span>
              <span>
                {order.lensName} \u2014 {order.lensSpec}
              </span>
              <span className="text-muted-foreground">Lo\u1ea1i k\u00ednh</span>
              <span>{order.glassType}</span>
            </div>
          </div>

          {/* 4. Payment */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Thanh to\u00e1n
            </p>
            <div className="space-y-1.5 text-[13px]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">G\u1ecdng k\u00ednh</span>
                <span>{formatPrice(order.framePrice)}\u0111</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tr\u00f2ng k\u00ednh</span>
                <span>{formatPrice(order.lensPrice)}\u0111</span>
              </div>
              <div className="border-foreground flex justify-between border-t-2 pt-1.5 text-[15px] font-medium">
                <span>T\u1ed5ng c\u1ed9ng</span>
                <span>{formatPrice(order.framePrice + order.lensPrice)}\u0111</span>
              </div>
              <div className="flex justify-end pt-1">
                {order.paymentStatus === "paid" ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
                    \u0110\u00e3 thanh to\u00e1n
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Ch\u1edd thanh to\u00e1n
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 5. Timeline */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              L\u1ecbch s\u1eed tr\u1ea1ng th\u00e1i
            </p>
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

                return (
                  <div key={status} className="relative pb-4 last:pb-0">
                    {/* Connecting line */}
                    {!isLast && (
                      <div className="bg-border absolute -left-6 top-3 h-full w-0.5 translate-x-[5px]" />
                    )}
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 h-2.5 w-2.5 rounded-full border-2",
                        isCurrent
                          ? "border-blue-500 bg-blue-100"
                          : isCompleted
                            ? "border-green-500 bg-green-100"
                            : "border-border bg-background"
                      )}
                    />
                    {/* Content */}
                    <div>
                      <p
                        className={cn(
                          "text-[13px]",
                          isCurrent
                            ? "font-medium text-blue-600 dark:text-blue-400"
                            : isCompleted
                              ? "font-medium"
                              : "text-muted-foreground"
                        )}
                      >
                        {step?.label ?? statusBadgeConfig[status].label}
                      </p>
                      {isCompleted && step?.completedAt ? (
                        <p className="text-muted-foreground text-xs">
                          {formatDateTime(step.completedAt)}
                          {step.staffName && <> &middot; {step.staffName}</>}
                        </p>
                      ) : (
                        <p className="text-muted-foreground text-xs">&mdash;</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 6. Notes */}
          {order.notes && (
            <div className="bg-muted rounded-md p-3 text-[13px]">
              {order.notes}
            </div>
          )}
        </div>

        {/* 7. Footer */}
        <DialogFooter>
          <Button variant="outline">In \u0111\u01a1n k\u00ednh</Button>
          {order.status === "ordered" && onStartFabrication && (
            <Button onClick={onStartFabrication}>
              B\u1eaft \u0111\u1ea7u gia c\u00f4ng
            </Button>
          )}
          {order.status === "fabricating" && onCompleteFabrication && (
            <Button onClick={onCompleteFabrication}>
              Ho\u00e0n th\u00e0nh gia c\u00f4ng
            </Button>
          )}
          {order.status === "ready_delivery" && onConfirmDelivery && (
            <Button onClick={onConfirmDelivery}>
              X\u00e1c nh\u1eadn giao k\u00ednh
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
