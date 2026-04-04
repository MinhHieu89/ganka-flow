import type { PaymentMethod, PaymentMethodEntry } from "@/data/mock-cashier"
import { PaymentMethodCard } from "@/components/cashier/payment-method-card"

interface PaymentMethodsSectionProps {
  methods: PaymentMethodEntry[]
  onAdd: () => void
  onRemove: (id: string) => void
  onUpdate: (
    id: string,
    updates: { method?: PaymentMethod; amount?: number }
  ) => void
  onUpdateCash: (id: string, cashReceived: number) => void
  canAddMore: boolean
  amountMismatch: boolean
  total: number
  methodsTotal: number
}

export function PaymentMethodsSection({
  methods,
  onAdd,
  onRemove,
  onUpdate,
  onUpdateCash,
  canAddMore,
  amountMismatch,
  total,
  methodsTotal,
}: PaymentMethodsSectionProps) {
  return (
    <div className="mb-5">
      <div className="mb-2.5 text-[13px] font-medium text-muted-foreground">
        Phương thức thanh toán
      </div>
      <div className="flex flex-col gap-2.5">
        {methods.map((entry) => (
          <PaymentMethodCard
            key={entry.id}
            entry={entry}
            showRemove={methods.length > 1}
            onUpdate={(updates) => onUpdate(entry.id, updates)}
            onUpdateCashReceived={(amount) => onUpdateCash(entry.id, amount)}
            onRemove={() => onRemove(entry.id)}
          />
        ))}
      </div>
      {canAddMore && (
        <button
          onClick={onAdd}
          className="mt-2 text-[13px] font-medium text-[#0F6E56] hover:underline"
        >
          + Thêm phương thức thanh toán
        </button>
      )}
      {amountMismatch && (
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Tổng các phương thức (
          {new Intl.NumberFormat("vi-VN").format(methodsTotal)}đ) chưa khớp với
          thành tiền ({new Intl.NumberFormat("vi-VN").format(total)}đ)
        </div>
      )}
    </div>
  )
}
