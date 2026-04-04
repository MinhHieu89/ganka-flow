import { formatVND } from "@/data/mock-cashier"

interface PaymentSummaryProps {
  subtotal: number
  discountAmount: number
  discountPercent?: number
  total: number
  itemCount: number
}

export function PaymentSummary({
  subtotal,
  discountAmount,
  discountPercent,
  total,
  itemCount,
}: PaymentSummaryProps) {
  return (
    <div className="rounded-xl border border-border bg-muted/50 px-5 py-[18px]">
      <div className="flex items-center justify-between py-1.5 text-sm text-muted-foreground">
        <span>Tạm tính ({itemCount} items)</span>
        <span>{formatVND(subtotal)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex items-center justify-between py-1.5 text-sm text-[#A32D2D]">
          <span>
            Giảm giá{discountPercent ? ` ${discountPercent}%` : ""}
          </span>
          <span>-{formatVND(discountAmount)}</span>
        </div>
      )}
      <div className="mt-2 flex items-center justify-between border-t-2 border-foreground pt-3 text-[22px] font-medium">
        <span>Thành tiền</span>
        <span>{formatVND(total)}</span>
      </div>
    </div>
  )
}
