import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatVND } from "@/data/mock-cashier"
import { useRefund } from "@/hooks/use-refund"

interface RefundModalProps {
  transactionId: string
  open: boolean
  onClose: () => void
}

const REASON_OPTIONS = [
  { value: "wrong_service", label: "Tính sai dịch vụ" },
  { value: "patient_cancel", label: "BN hủy dịch vụ" },
  { value: "cancel_treatment", label: "Hủy liệu trình" },
  { value: "warranty", label: "Bảo hành" },
  { value: "other", label: "Khác" },
]

export function RefundModal({
  transactionId,
  open,
  onClose,
}: RefundModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const {
    transaction,
    refundableItems,
    selectedItemIds,
    toggleItem,
    reasonCode,
    setReasonCode,
    refundMethod,
    setRefundMethod,
    note,
    setNote,
    refundTotal,
    canConfirm,
    originalMethodLabel,
  } = useRefund(transactionId)

  if (!transaction) return null

  function handleConfirmRefund() {
    setShowConfirm(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={open && !showConfirm}
        onOpenChange={(v) => !v && onClose()}
      >
        <DialogContent className="max-h-[90vh] max-w-[460px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">Hoàn tiền</DialogTitle>
          </DialogHeader>

          {/* Original invoice summary */}
          <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs">
            <div>
              Mã HĐ: <span className="font-medium">#{transaction.id}</span>
            </div>
            <div>
              Bệnh nhân:{" "}
              <span className="font-medium">{transaction.patient.name}</span>
            </div>
            <div>
              Tổng tiền gốc:{" "}
              <span className="font-medium">
                {formatVND(transaction.total)}
              </span>
            </div>
          </div>

          {/* Refundable items checkbox list */}
          <div className="space-y-1">
            {refundableItems.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5 ${
                  item.alreadyRefunded
                    ? "cursor-not-allowed opacity-50"
                    : selectedItemIds.has(item.id)
                      ? "border-[#A32D2D] bg-red-50/50"
                      : "hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={
                      selectedItemIds.has(item.id) || item.alreadyRefunded
                    }
                    disabled={item.alreadyRefunded}
                    onChange={() => toggleItem(item.id)}
                    className="size-4 rounded border-border"
                  />
                  <span className="text-[13px]">
                    {item.description}
                    {item.quantity > 1 && (
                      <span className="text-muted-foreground">
                        {" "}
                        x{item.quantity}
                      </span>
                    )}
                    {item.alreadyRefunded && (
                      <span className="ml-2 text-[11px] text-muted-foreground">
                        Đã hoàn
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-[13px] font-medium">
                  {formatVND(item.amount)}
                </span>
              </label>
            ))}
          </div>

          {/* Refund total */}
          {refundTotal > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-[#FCEBEB] px-3 py-2.5">
              <span className="text-[13px] font-medium text-[#791F1F]">
                Số tiền hoàn
              </span>
              <span className="text-[15px] font-medium text-[#791F1F]">
                {formatVND(refundTotal)}
              </span>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Lý do hoàn tiền
            </label>
            <Select value={reasonCode} onValueChange={setReasonCode}>
              <SelectTrigger size="sm">
                <SelectValue placeholder="Chọn lý do" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Refund method */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Hoàn qua
            </label>
            <Select value={refundMethod} onValueChange={setRefundMethod}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value={transaction.paymentMethods[0]?.method ?? "cash"}
                >
                  Phương thức gốc ({originalMethodLabel})
                </SelectItem>
                <SelectItem value="cash">Tiền mặt</SelectItem>
                <SelectItem value="transfer">Chuyển khoản</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Note */}
          <div>
            <label className="mb-1.5 block text-xs text-muted-foreground">
              Ghi chú <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Mô tả chi tiết lý do hoàn tiền"
              className="min-h-[60px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              className="bg-[#A32D2D] text-white hover:bg-[#8B2626]"
              disabled={!canConfirm}
              onClick={() => setShowConfirm(true)}
            >
              Xác nhận hoàn tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xác nhận hoàn tiền?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Xác nhận hoàn {formatVND(refundTotal)} cho hóa đơn #
            {transaction.id}? Hành động này không thể hoàn tác.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Hủy
            </Button>
            <Button
              className="bg-[#A32D2D] text-white hover:bg-[#8B2626]"
              onClick={handleConfirmRefund}
            >
              Xác nhận
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
