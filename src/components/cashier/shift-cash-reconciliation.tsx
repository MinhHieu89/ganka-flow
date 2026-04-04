import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatVND } from "@/data/mock-cashier"

interface ShiftCashReconciliationProps {
  openingCash: number
  cashCollected: number
  cashChangeGiven: number
  cashExpected: number
  cashActual: number | null
  onCashActualChange: (value: number) => void
  difference: number
  differenceStatus: "match" | "over" | "short"
  note: string
  onNoteChange: (value: string) => void
  canClose: boolean
  pendingCount: number
  onClose: () => void
}

const STATUS_STYLES = {
  match: "border-green-200 bg-[#E1F5EE] text-[#085041]",
  over: "border-amber-200 bg-[#FAEEDA] text-[#633806]",
  short: "border-red-200 bg-[#FCEBEB] text-[#791F1F]",
}

const STATUS_LABELS = {
  match: "Khớp",
  over: "Thừa",
  short: "Thiếu",
}

export function ShiftCashReconciliation({
  openingCash,
  cashCollected,
  cashChangeGiven,
  cashExpected,
  cashActual,
  onCashActualChange,
  difference,
  differenceStatus,
  note,
  onNoteChange,
  canClose,
  pendingCount,
  onClose,
}: ShiftCashReconciliationProps) {
  const [inputText, setInputText] = useState("")
  const [focused, setFocused] = useState(false)

  function handleFocus() {
    setFocused(true)
    setInputText(cashActual !== null && cashActual > 0 ? String(cashActual) : "")
  }

  function handleBlur() {
    setFocused(false)
    const num = parseInt(inputText.replace(/\D/g, ""), 10) || 0
    onCashActualChange(num)
    setInputText(formatVND(num))
  }

  function handleChange(val: string) {
    setInputText(val.replace(/[^\d]/g, ""))
  }

  // Sync display when value changes externally
  if (!focused && cashActual !== null && formatVND(cashActual) !== inputText) {
    setInputText(formatVND(cashActual))
  }

  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-medium">Đối soát tiền mặt</h3>

      {/* System info rows */}
      <div className="space-y-2.5 text-[13px]">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tiền đầu ca</span>
          <span>{formatVND(openingCash)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Thu trong ca</span>
          <span>{formatVND(cashCollected)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tiền thừa trả khách</span>
          <span>-{formatVND(cashChangeGiven)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2.5 font-medium">
          <span>Tiền mặt kỳ vọng</span>
          <span>{formatVND(cashExpected)}</span>
        </div>
      </div>

      {/* Cash actual input */}
      <div className="mt-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">
          Tiền mặt thực tế đếm được
        </label>
        <Input
          value={focused ? inputText : (cashActual !== null ? formatVND(cashActual) : "")}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Nhập số tiền thực tế"
          className="h-10 text-right text-[15px] font-medium"
        />
      </div>

      {/* Difference display */}
      {cashActual !== null && (
        <div
          className={`mt-3 rounded-lg border px-3 py-2 text-[13px] font-medium ${STATUS_STYLES[differenceStatus]}`}
        >
          {STATUS_LABELS[differenceStatus]} · Chênh lệch:{" "}
          {difference >= 0 ? "+" : ""}
          {formatVND(Math.abs(difference))}
        </div>
      )}

      {/* Note */}
      <div className="mt-4">
        <label className="mb-1.5 block text-xs text-muted-foreground">
          Ghi chú
          {cashActual !== null && difference !== 0 && (
            <span className="text-destructive"> *</span>
          )}
        </label>
        <Textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Ghi chú chênh lệch hoặc sự cố trong ca..."
          className="min-h-[60px]"
        />
      </div>

      {/* Pending patients warning */}
      {pendingCount > 0 && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Còn {pendingCount} bệnh nhân chờ thanh toán. Vui lòng xử lý trước
          khi chốt ca.
        </div>
      )}

      {/* Warning */}
      <div className="mt-4 rounded-lg border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Sau khi chốt ca, không thể thêm giao dịch mới vào ca này. Các giao
        dịch tiếp theo sẽ thuộc ca sau.
      </div>

      {/* Buttons */}
      <div className="mt-4 flex gap-2.5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => window.print()}
        >
          In báo cáo ca
        </Button>
        <Button
          className="flex-1 bg-[#0F6E56] hover:bg-[#0d5f4a]"
          disabled={!canClose}
          onClick={onClose}
        >
          Xác nhận chốt ca
        </Button>
      </div>
    </div>
  )
}
