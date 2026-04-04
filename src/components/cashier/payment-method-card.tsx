import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaymentMethod, PaymentMethodEntry } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tiền mặt" },
  { value: "transfer", label: "Chuyển khoản" },
  { value: "qr_vnpay", label: "QR VNPay" },
  { value: "qr_momo", label: "QR MoMo" },
  { value: "qr_zalopay", label: "QR ZaloPay" },
  { value: "card_visa", label: "Thẻ Visa" },
  { value: "card_mastercard", label: "Thẻ Mastercard" },
]

interface PaymentMethodCardProps {
  entry: PaymentMethodEntry
  showRemove: boolean
  onUpdate: (updates: { method?: PaymentMethod; amount?: number }) => void
  onUpdateCashReceived: (amount: number) => void
  onRemove: () => void
}

export function PaymentMethodCard({
  entry,
  showRemove,
  onUpdate,
  onUpdateCashReceived,
  onRemove,
}: PaymentMethodCardProps) {
  const [amountText, setAmountText] = useState(formatVND(entry.amount))
  const [amountFocused, setAmountFocused] = useState(false)
  const [cashText, setCashText] = useState(
    entry.cashReceived !== undefined ? formatVND(entry.cashReceived) : ""
  )
  const [cashFocused, setCashFocused] = useState(false)

  const isCash = entry.method === "cash"
  const cashInsufficient =
    isCash &&
    entry.cashReceived !== undefined &&
    entry.cashReceived < entry.amount

  function handleAmountFocus() {
    setAmountFocused(true)
    setAmountText(entry.amount > 0 ? String(entry.amount) : "")
  }

  function handleAmountBlur() {
    setAmountFocused(false)
    const num = parseInt(amountText.replace(/\D/g, ""), 10) || 0
    onUpdate({ amount: num })
    setAmountText(formatVND(num))
  }

  function handleAmountChange(val: string) {
    setAmountText(val.replace(/[^\d]/g, ""))
  }

  function handleCashFocus() {
    setCashFocused(true)
    setCashText(
      entry.cashReceived !== undefined && entry.cashReceived > 0
        ? String(entry.cashReceived)
        : ""
    )
  }

  function handleCashBlur() {
    setCashFocused(false)
    const num = parseInt(cashText.replace(/\D/g, ""), 10) || 0
    onUpdateCashReceived(num)
    setCashText(formatVND(num))
  }

  function handleCashChange(val: string) {
    setCashText(val.replace(/[^\d]/g, ""))
  }

  // Sync amountText when entry.amount changes externally and not focused
  if (!amountFocused && formatVND(entry.amount) !== amountText) {
    setAmountText(formatVND(entry.amount))
  }

  return (
    <div className="rounded-[10px] border border-border bg-background p-[14px]">
      <div className="flex items-center gap-2">
        <Select
          value={entry.method}
          onValueChange={(v) => onUpdate({ method: v as PaymentMethod })}
        >
          <SelectTrigger className="flex-1" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {METHOD_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={amountFocused ? amountText : formatVND(entry.amount)}
          onFocus={handleAmountFocus}
          onBlur={handleAmountBlur}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="h-8 w-[130px] text-right text-[13px]"
        />
        {showRemove && (
          <button
            onClick={onRemove}
            className="flex size-7 items-center justify-center rounded-md border border-border text-sm text-muted-foreground hover:border-red-300 hover:bg-red-50 hover:text-[#A32D2D]"
          >
            ✕
          </button>
        )}
      </div>
      {isCash && (
        <div className="mt-3 flex flex-col gap-2 border-t border-dashed border-border pt-3">
          <div className="flex items-center justify-between text-[13px]">
            <label className="text-muted-foreground">Tiền nhận</label>
            <Input
              value={
                cashFocused
                  ? cashText
                  : entry.cashReceived !== undefined
                    ? formatVND(entry.cashReceived)
                    : ""
              }
              onFocus={handleCashFocus}
              onBlur={handleCashBlur}
              onChange={(e) => handleCashChange(e.target.value)}
              placeholder="Nhập số tiền"
              className={`h-8 w-[130px] text-right text-[13px] ${cashInsufficient ? "border-destructive" : ""}`}
            />
          </div>
          {entry.cashReceived !== undefined && entry.cashReceived > 0 && (
            <div className="flex items-center justify-between text-[13px]">
              <label className="text-muted-foreground">Tiền thừa</label>
              <span className="text-base font-medium text-[#0F6E56]">
                {formatVND(Math.max(0, entry.cashChange ?? 0))}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
