import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { HugeiconsIcon } from "@hugeicons/react"
import { Clock01Icon } from "@hugeicons/core-free-icons"
import { PatientInfoBar } from "@/components/cashier/patient-info-bar"
import { PaymentLineItems } from "@/components/cashier/payment-line-items"
import {
  formatVND,
  mockPaymentRequests,
  mockPaymentPatients,
  mockPaymentLineItems,
  mockPaymentRequestMeta,
} from "@/data/mock-cashier"

interface ViewPaymentRequestModalProps {
  paymentRequestId: string
  open: boolean
  onClose: () => void
  onPay: (paymentRequestId: string) => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function ViewPaymentRequestModal({
  paymentRequestId,
  open,
  onClose,
  onPay,
}: ViewPaymentRequestModalProps) {
  const request = useMemo(
    () => mockPaymentRequests.find((r) => r.id === paymentRequestId),
    [paymentRequestId]
  )
  const patient = mockPaymentPatients[paymentRequestId]
  const items = mockPaymentLineItems[paymentRequestId] ?? []
  const meta = mockPaymentRequestMeta[paymentRequestId]

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotal, 0),
    [items]
  )

  if (!request || !patient) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-[460px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Chi tiết chờ thanh toán
          </DialogTitle>
        </DialogHeader>

        {/* Patient info */}
        <PatientInfoBar patient={patient} />

        {/* Line items */}
        <div className="rounded-xl border border-border">
          <PaymentLineItems items={items} />
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between border-t border-border pt-3 text-[17px] font-medium">
          <span>Tổng tạm tính</span>
          <span>{formatVND(subtotal)}</span>
        </div>

        {/* Metadata */}
        {meta && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HugeiconsIcon
              icon={Clock01Icon}
              className="size-3.5"
              strokeWidth={1.5}
            />
            <span>
              Chờ từ {formatTime(request.queuedAt)} · {meta.doctorName} ·{" "}
              {meta.visitType}
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            className="bg-[#0F6E56] hover:bg-[#0d5f4a]"
            onClick={() => onPay(paymentRequestId)}
          >
            Thanh toán
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
