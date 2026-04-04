import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatVnd } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcPaymentSuccessModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
  onPrintLabels: () => void
  onPrintInvoice: () => void
  onNewOrder: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export function OtcPaymentSuccessModal({
  order,
  open,
  onClose,
  onPrintLabels,
  onPrintInvoice,
  onNewOrder,
}: OtcPaymentSuccessModalProps) {
  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-base font-medium">
            Thanh toán thành công
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-2">
          <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <div className="text-2xl font-medium">
            {formatVnd(order.totalAmount)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {paymentLabels[order.paymentMethod]} — {order.customer.name} —{" "}
            {order.customer.phone}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatDateTime(order.soldAt)} — Mã đơn: {order.id}
          </div>
        </div>

        <div className="flex justify-center gap-2 border-t border-border pt-3">
          <Button variant="outline" size="sm" onClick={onPrintLabels}>
            In nhãn thuốc
          </Button>
          <Button variant="outline" size="sm" onClick={onPrintInvoice}>
            In hóa đơn
          </Button>
          <Button size="sm" onClick={onNewOrder}>
            Đơn hàng mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
