import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { OpticalOrder, OrderStatus } from "@/data/mock-optical"

interface StatusTransitionModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder | null
  targetStatus: "fabricating" | "ready_delivery"
  onConfirm: (notes?: string) => void
}

const statusConfig: Record<
  OrderStatus,
  { label: string; bgClass: string; dotClass: string }
> = {
  ordered: {
    label: "Đã đặt",
    bgClass:
      "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
    dotClass: "bg-green-500",
  },
  fabricating: {
    label: "Đang gia công",
    bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
    dotClass: "bg-blue-500",
  },
  ready_delivery: {
    label: "Sẵn sàng giao",
    bgClass: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300",
    dotClass: "bg-teal-500",
  },
  delivered: {
    label: "Đã giao",
    bgClass: "bg-secondary text-secondary-foreground",
    dotClass: "bg-muted-foreground",
  },
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        config.bgClass
      )}
    >
      <span className={cn("size-1.5 rounded-full", config.dotClass)} />
      {config.label}
    </span>
  )
}

export function StatusTransitionModal({
  open,
  onClose,
  order,
  targetStatus,
  onConfirm,
}: StatusTransitionModalProps) {
  const [notes, setNotes] = useState("")

  if (!order) return null

  const oldConfig = statusConfig[order.status]
  const newConfig = statusConfig[targetStatus]

  function handleConfirm() {
    onConfirm(notes || undefined)
    setNotes("")
    onClose()
  }

  function handleCancel() {
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Xác nhận chuyển trạng thái
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Icon */}
          <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-600 dark:text-blue-400"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Order info */}
          <div className="text-center">
            <p className="font-medium">Đơn kính {order.id}</p>
            <p className="text-muted-foreground text-xs">
              {order.patientName} &middot; {order.frameName} &middot;{" "}
              {order.lensName}
            </p>
          </div>

          {/* Transition block */}
          <div className="bg-muted w-full rounded-lg p-3">
            <div className="flex items-center justify-center gap-3">
              <StatusBadge status={order.status} />
              <span className="text-muted-foreground text-sm">&rarr;</span>
              <StatusBadge status={targetStatus} />
            </div>
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Trạng thái sẽ chuyển từ &lsquo;{oldConfig.label}&rsquo; sang
              &lsquo;{newConfig.label}&rsquo;
            </p>
          </div>

          {/* Notes */}
          <div className="w-full space-y-1.5 text-left">
            <Label htmlFor="transition-notes">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="transition-notes"
              placeholder="Ghi chú khi chuyển trạng thái..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
