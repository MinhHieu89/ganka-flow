import { Button } from "@/components/ui/button"
import { formatVnd } from "@/data/mock-otc"
import type { OtcOrderItem, OtcPaymentMethod, OtcCustomer } from "@/data/mock-otc"

const paymentMethods: { value: OtcPaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "qr", label: "QR code" },
  { value: "card", label: "Thẻ" },
]

interface OtcOrderPanelProps {
  items: OtcOrderItem[]
  paymentMethod: OtcPaymentMethod
  selectedCustomer: OtcCustomer | null
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string) => void
  onPaymentMethodChange: (method: OtcPaymentMethod) => void
  onCheckout: () => void
  onViewHistory: () => void
}

export function OtcOrderPanel({
  items,
  paymentMethod,
  selectedCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onPaymentMethodChange,
  onCheckout,
  onViewHistory,
}: OtcOrderPanelProps) {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const totalProducts = items.reduce((sum, item) => sum + item.quantity, 0)
  const canCheckout = selectedCustomer && items.length > 0

  return (
    <div className="flex w-[38%] flex-col rounded-lg border border-border bg-background p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Đơn hàng</h3>
        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] text-teal-700 dark:bg-teal-950 dark:text-teal-300">
          {totalProducts} sản phẩm
        </span>
      </div>

      {/* Items or empty state */}
      <div className="flex-1 space-y-2 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full min-h-[100px] items-center justify-center text-xs text-muted-foreground">
            Chọn sản phẩm từ danh sách bên trái
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.product.id}
              className="rounded-md bg-muted/50 p-2"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-medium">
                  {item.product.name}
                </span>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-[11px] text-red-500 hover:underline"
                >
                  Xóa
                </button>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, -1)
                    }
                    className="flex size-6 items-center justify-center rounded border border-border bg-background text-xs hover:bg-muted"
                  >
                    −
                  </button>
                  <span className="min-w-[20px] text-center text-xs font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.product.id, 1)
                    }
                    disabled={item.quantity >= item.product.stockQuantity}
                    className="flex size-6 items-center justify-center rounded border border-border bg-background text-xs hover:bg-muted disabled:opacity-50"
                  >
                    +
                  </button>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground">
                    {formatVnd(item.product.price)} × {item.quantity}
                  </div>
                  <div className="text-xs font-medium">
                    {formatVnd(item.product.price * item.quantity)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 border-t border-border pt-3">
        <div className="mb-3 flex items-center justify-between text-[15px] font-medium">
          <span>Tổng cộng</span>
          <span>{formatVnd(totalAmount)}</span>
        </div>
        <div className="mb-3 flex gap-1">
          {paymentMethods.map((pm) => (
            <button
              key={pm.value}
              onClick={() => onPaymentMethodChange(pm.value)}
              className={`flex-1 rounded-md border px-1 py-1.5 text-[11px] font-medium transition-colors ${
                paymentMethod === pm.value
                  ? "border-teal-200 bg-teal-600 text-white dark:border-teal-800 dark:bg-teal-700"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              {pm.label}
            </button>
          ))}
        </div>
        <Button
          className="w-full"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          Thanh toán {formatVnd(totalAmount)}
        </Button>
        <button
          onClick={onViewHistory}
          className="mt-2 w-full text-center text-[11px] text-primary hover:underline"
        >
          Xem lịch sử bán OTC hôm nay
        </button>
      </div>
    </div>
  )
}
