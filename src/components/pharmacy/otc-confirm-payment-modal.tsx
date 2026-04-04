import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatVnd } from "@/data/mock-otc"
import type {
  OtcCustomer,
  OtcOrderItem,
  OtcPaymentMethod,
} from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcConfirmPaymentModalProps {
  open: boolean
  customer: OtcCustomer | null
  items: OtcOrderItem[]
  paymentMethod: OtcPaymentMethod
  onClose: () => void
  onConfirm: () => void
}

export function OtcConfirmPaymentModal({
  open,
  customer,
  items,
  paymentMethod,
  onClose,
  onConfirm,
}: OtcConfirmPaymentModalProps) {
  if (!customer || items.length === 0) return null

  const totalAmount = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  )

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Xác nhận thanh toán
          </DialogTitle>
        </DialogHeader>

        {/* Customer info */}
        <div className="space-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Khách hàng: </span>
            <span className="font-medium">{customer.name}</span>
          </div>
          <div>
            <span className="text-muted-foreground">SĐT: </span>
            <span>{customer.phone}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Phương thức: </span>
            <span>{paymentLabels[paymentMethod]}</span>
          </div>
        </div>

        {/* Product list */}
        <div className="space-y-1.5 border-t border-border pt-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <span className="font-medium">{item.product.name}</span>
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

        {/* Total */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-base font-medium">
          <span>Tổng cộng</span>
          <span>{formatVnd(totalAmount)}</span>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Quay lại
          </Button>
          <Button onClick={onConfirm}>Xác nhận thanh toán</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
