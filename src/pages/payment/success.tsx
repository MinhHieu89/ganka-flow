import { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import type { CompletedPayment } from "@/data/mock-cashier"
import { ReceiptCard } from "@/components/cashier/receipt-card"

export default function PaymentSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const payment = (location.state as { payment?: CompletedPayment })?.payment

  // Auto-print on mount
  useEffect(() => {
    if (payment) {
      const timer = setTimeout(() => window.print(), 500)
      return () => clearTimeout(timer)
    }
  }, [payment])

  if (!payment) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Không tìm thấy thông tin thanh toán
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/payment")}
          >
            Về dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 py-10">
      <div className="mx-auto flex max-w-[520px] flex-col items-center px-5">
        {/* Success icon */}
        <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-[#E1F5EE]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0F6E56"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h1 className="mb-1.5 text-xl font-medium">Thanh toán thành công</h1>
        <p className="mb-7 text-[13px] text-muted-foreground">
          Giao dịch #{payment.id} đã được ghi nhận
        </p>

        <ReceiptCard payment={payment} />

        {/* Action buttons */}
        <div className="mt-6 flex w-full gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.print()}
          >
            In biên lai
          </Button>
          <Button
            className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
            onClick={() => navigate("/payment")}
          >
            Về dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
