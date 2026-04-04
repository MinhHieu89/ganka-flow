import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { usePaymentProcessing } from "@/hooks/use-payment-processing"
import { PatientInfoBar } from "@/components/cashier/patient-info-bar"
import { PaymentLineItems } from "@/components/cashier/payment-line-items"
import { PaymentDiscount } from "@/components/cashier/payment-discount"
import { PaymentSummary } from "@/components/cashier/payment-summary"
import { PaymentMethodsSection } from "@/components/cashier/payment-methods-section"
import { PaymentActions } from "@/components/cashier/payment-actions"
import { ReceiptCard } from "@/components/cashier/receipt-card"
import type { CompletedPayment } from "@/data/mock-cashier"

export default function PaymentProcessingPage() {
  const { paymentRequestId } = useParams<{ paymentRequestId: string }>()
  const navigate = useNavigate()
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReceiptPreview, setShowReceiptPreview] = useState(false)

  const {
    patient,
    items,
    subtotal,
    discount,
    discountAmount,
    total,
    paymentMethods,
    methodsTotal,
    amountMismatch,
    canConfirm,
    isDirty,
    addDiscount,
    removeDiscount,
    addPaymentMethod,
    removePaymentMethod,
    updatePaymentMethod,
    updateCashReceived,
    confirmPayment,
  } = usePaymentProcessing(paymentRequestId ?? "")

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`

  function handleBack() {
    if (isDirty) {
      setShowCancelDialog(true)
    } else {
      navigate("/payment")
    }
  }

  function handleConfirmCancel() {
    setShowCancelDialog(false)
    navigate("/payment")
  }

  function handleConfirmPayment() {
    const completed = confirmPayment()
    navigate(`/payment/${completed.id}/success`, {
      state: { payment: completed },
    })
  }

  const previewPayment = useMemo<CompletedPayment>(
    () => ({
      id: `GD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-000`,
      paymentRequestId: paymentRequestId ?? "",
      patient,
      items,
      discount,
      paymentMethods,
      subtotal,
      discountAmount,
      total,
      cashierName: "Thu ngân Linh",
      completedAt: new Date().toISOString(),
    }),
    [
      paymentRequestId,
      patient,
      items,
      discount,
      paymentMethods,
      subtotal,
      discountAmount,
      total,
    ]
  )

  function handlePrintPreview() {
    setShowReceiptPreview(true)
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="mr-1.5 size-4"
            strokeWidth={1.5}
          />
          Quay lại
        </Button>
        <h1 className="text-xl font-medium">Xử lý thanh toán</h1>
        <span className="text-[13px] text-muted-foreground">
          Hóa đơn mới · Hôm nay {timeStr}
        </span>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex max-w-[1280px] gap-6 p-6">
        {/* Left column (60%) */}
        <div className="min-w-0 flex-[6]">
          <div className="rounded-xl border border-border bg-background">
            <div className="p-[18px]">
              <PatientInfoBar patient={patient} />
            </div>
            <PaymentLineItems items={items} />
            <PaymentDiscount
              discount={discount}
              subtotal={subtotal}
              onAdd={addDiscount}
              onRemove={removeDiscount}
            />
          </div>
        </div>

        {/* Right column (40%, sticky) */}
        <div className="sticky top-6 min-w-[320px] flex-[4] self-start">
          <PaymentSummary
            subtotal={subtotal}
            discountAmount={discountAmount}
            discountPercent={
              discount?.type === "percent" ? discount.value : undefined
            }
            total={total}
            itemCount={items.length}
          />

          <div className="mt-5">
            <PaymentMethodsSection
              methods={paymentMethods}
              onAdd={addPaymentMethod}
              onRemove={removePaymentMethod}
              onUpdate={updatePaymentMethod}
              onUpdateCash={updateCashReceived}
              canAddMore={paymentMethods.length < 3}
              amountMismatch={amountMismatch}
              total={total}
              methodsTotal={methodsTotal}
            />
          </div>

          {/* System note */}
          <div className="mb-5 rounded-lg border border-border bg-muted/50 px-3 py-2.5 text-xs text-muted-foreground">
            Thu ngân xác nhận thủ công khi BN đã quét QR hoặc cà thẻ thành
            công bên ngoài hệ thống.
          </div>

          <PaymentActions
            canConfirm={canConfirm}
            onCancel={handleBack}
            onPrintPreview={handlePrintPreview}
            onConfirm={handleConfirmPayment}
          />
        </div>
      </div>

      {/* Receipt preview dialog */}
      <Dialog open={showReceiptPreview} onOpenChange={setShowReceiptPreview}>
        <DialogContent className="max-w-[480px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Xem trước biên lai</DialogTitle>
          </DialogHeader>
          <ReceiptCard payment={previewPayment} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReceiptPreview(false)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel confirmation dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hủy thanh toán?</DialogTitle>
            <DialogDescription>
              Dữ liệu thanh toán chưa được lưu. Bạn có chắc muốn quay lại?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Tiếp tục thanh toán
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Hủy thanh toán
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
