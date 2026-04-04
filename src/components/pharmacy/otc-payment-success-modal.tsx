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

        {/* Top section — payment info */}
        <div className="flex flex-col items-center py-2">
          <div className="mb-3 flex size-[52px] items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            ✓
          </div>
          <div className="text-[28px] leading-tight font-medium">
            {formatVnd(order.totalAmount)}
          </div>
          <div className="mt-1 text-[13px] text-muted-foreground">
            {paymentLabels[order.paymentMethod]} — {order.customer.name}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {formatDateTime(order.soldAt)} — Mã đơn: {order.id}
          </div>
        </div>

        {/* Middle section — product summary */}
        <div className="border-y border-border py-3">
          <div className="space-y-1.5">
            {order.items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center justify-between text-sm"
              >
                <div>
                  <span>{item.product.name}</span>
                  <span className="ml-1 text-muted-foreground">
                    × {item.quantity}
                  </span>
                </div>
                <span className="font-medium">
                  {formatVnd(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions — 2 rows */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={onPrintInvoice}>
              In hóa đơn
            </Button>
            <Button variant="outline" onClick={onPrintLabels}>
              In nhãn thuốc
            </Button>
          </div>
          <Button className="w-full" onClick={onNewOrder}>
            Đơn hàng mới
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
