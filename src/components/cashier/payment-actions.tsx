import { Button } from "@/components/ui/button"

interface PaymentActionsProps {
  canConfirm: boolean
  onCancel: () => void
  onPrintPreview: () => void
  onConfirm: () => void
}

export function PaymentActions({
  canConfirm,
  onCancel,
  onPrintPreview,
  onConfirm,
}: PaymentActionsProps) {
  return (
    <div className="flex gap-2.5 border-t border-border pt-4">
      <Button variant="outline" className="flex-1" onClick={onCancel}>
        Hủy
      </Button>
      <Button
        variant="secondary"
        className="flex-1"
        onClick={onPrintPreview}
      >
        In tạm
      </Button>
      <Button
        className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        Xác nhận thanh toán
      </Button>
    </div>
  )
}
