import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ReturnReason } from "@/data/mock-cashier"
import { mockPaymentRequests, formatPhone } from "@/data/mock-cashier"

interface ReturnToQueueModalProps {
  paymentRequestId: string
  open: boolean
  onClose: () => void
}

const REASON_OPTIONS: {
  value: ReturnReason
  label: string
  description: string
}[] = [
  {
    value: "wrong_prescription",
    label: "Đơn thuốc chưa đúng",
    description: "Trả về bác sĩ để chỉnh sửa đơn thuốc",
  },
  {
    value: "wrong_optical",
    label: "Đơn kính chưa đúng",
    description: "Trả về trung tâm kính để chỉnh sửa",
  },
  {
    value: "patient_not_ready",
    label: "BN chưa sẵn sàng",
    description: "BN yêu cầu chờ hoặc rời PK tạm thời",
  },
  {
    value: "other",
    label: "Khác",
    description: "Nhập lý do ở ghi chú bên dưới",
  },
]

export function ReturnToQueueModal({
  paymentRequestId,
  open,
  onClose,
}: ReturnToQueueModalProps) {
  const request = useMemo(
    () => mockPaymentRequests.find((r) => r.id === paymentRequestId),
    [paymentRequestId]
  )
  const [reason, setReason] = useState<ReturnReason | "">("")
  const [note, setNote] = useState("")

  if (!request) return null

  const waitMinutes = Math.floor(
    (Date.now() - new Date(request.queuedAt).getTime()) / 60_000
  )

  const canConfirm = reason !== "" && (reason !== "other" || note.trim() !== "")

  function handleConfirm() {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-base">Trả lại hàng đợi</DialogTitle>
        </DialogHeader>

        {/* Patient info */}
        <div className="rounded-lg bg-muted/50 px-3 py-2.5 text-xs">
          <div>
            Họ tên:{" "}
            <span className="font-medium">{request.patientName}</span>
          </div>
          <div>
            Mã BN:{" "}
            <span className="font-medium">{request.patientId}</span>
          </div>
          <div>
            SĐT:{" "}
            <span className="font-medium">
              {formatPhone(request.patientPhone)}
            </span>
          </div>
          <div>
            Thời gian chờ:{" "}
            <span className="font-medium">{waitMinutes} phút</span>
          </div>
        </div>

        {/* Reason radio group */}
        <div className="space-y-0">
          {REASON_OPTIONS.map((opt, idx) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 border border-border px-3 py-3 ${
                idx === 0 ? "rounded-t-lg" : ""
              } ${idx === REASON_OPTIONS.length - 1 ? "rounded-b-lg" : ""} ${
                idx > 0 ? "-mt-px" : ""
              } ${reason === opt.value ? "border-[#633806] bg-[#FAEEDA]/30 z-10 relative" : ""}`}
            >
              <input
                type="radio"
                name="return-reason"
                checked={reason === opt.value}
                onChange={() => setReason(opt.value)}
                className="mt-0.5 size-4"
              />
              <div>
                <div className="text-[13px] font-medium">{opt.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {opt.description}
                </div>
              </div>
            </label>
          ))}
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-xs text-muted-foreground">
            Ghi chú
            {reason === "other" && (
              <span className="text-destructive"> *</span>
            )}
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú thêm..."
            className="min-h-[60px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            className="bg-[#FAEEDA] text-[#633806] hover:bg-[#f5e3c8]"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            Xác nhận trả lại
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
