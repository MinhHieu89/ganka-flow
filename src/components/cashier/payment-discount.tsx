import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentDiscount as PaymentDiscountType } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface PaymentDiscountProps {
  discount: PaymentDiscountType | null
  subtotal: number
  onAdd: (type: "percent" | "fixed", value: number, reason: string) => void
  onRemove: () => void
}

export function PaymentDiscount({
  discount,
  subtotal,
  onAdd,
  onRemove,
}: PaymentDiscountProps) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<"percent" | "fixed">("percent")
  const [value, setValue] = useState("")
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")

  function handleApply() {
    const numValue = Number(value)
    if (!value || numValue <= 0) {
      setError("Vui lòng nhập giá trị hợp lệ")
      return
    }
    if (type === "percent" && (numValue < 1 || numValue > 100)) {
      setError("Phần trăm phải từ 1 đến 100")
      return
    }
    if (type === "fixed" && numValue > subtotal) {
      setError("Giá trị giảm không được vượt quá tổng tạm tính")
      return
    }
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do giảm giá")
      return
    }
    setError("")
    onAdd(type, numValue, reason.trim())
    setShowForm(false)
    setValue("")
    setReason("")
  }

  function handleCancel() {
    setShowForm(false)
    setValue("")
    setReason("")
    setError("")
  }

  if (discount) {
    return (
      <div className="border-t border-border px-[18px] py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px]">
              {discount.type === "percent"
                ? `Giảm ${discount.value}% — ${discount.reason}`
                : `Giảm ${formatVND(discount.value)} — ${discount.reason}`}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground/70">
              Áp dụng bởi: {discount.appliedBy}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm font-medium text-[#A32D2D]">
              -{formatVND(discount.amount)}
            </span>
            <button
              onClick={onRemove}
              className="ml-3 text-xs text-muted-foreground hover:text-[#A32D2D]"
            >
              Xóa
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border px-[18px] py-4">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="text-[13px] font-medium text-[#0F6E56] hover:underline"
        >
          + Thêm giảm giá
        </button>
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex gap-2">
            <Select
              value={type}
              onValueChange={(v) => setType(v as "percent" | "fixed")}
            >
              <SelectTrigger className="w-24" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="fixed">VNĐ</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={type === "percent" ? "Số %" : "Số tiền"}
              className="h-8 w-28 text-[13px]"
            />
          </div>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do giảm giá"
            className="h-8 text-[13px]"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="text-xs"
            >
              Hủy
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="bg-[#0F6E56] text-xs hover:bg-[#0d5f4a]"
            >
              Áp dụng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
