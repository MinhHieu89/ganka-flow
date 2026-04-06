import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type {
  PaymentCategory,
  PaymentLineItem,
  TransactionDetail,
} from "@/data/mock-cashier"
import {
  formatVND,
  formatPhone,
  getPaymentMethodLabel,
} from "@/data/mock-cashier"
import { useCashier } from "@/contexts/cashier-context"

interface ViewInvoiceModalProps {
  transactionId: string
  open: boolean
  onClose: () => void
  onRefund: (transactionId: string) => void
}

const STATUS_BADGE: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  paid: { label: "Đã thanh toán", bg: "#E1F5EE", text: "#085041" },
  refunded: { label: "Đã hoàn tiền", bg: "#FCEBEB", text: "#791F1F" },
  pending_refund: { label: "Hoàn một phần", bg: "#FAEEDA", text: "#633806" },
}

const CATEGORY_ORDER: PaymentCategory[] = [
  "exam",
  "drug",
  "optical",
  "treatment",
]
const CATEGORY_LABELS: Record<PaymentCategory, string> = {
  exam: "KHÁM",
  drug: "THUỐC",
  optical: "KÍNH",
  treatment: "LIỆU TRÌNH",
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function ViewInvoiceModal({
  transactionId,
  open,
  onClose,
  onRefund,
}: ViewInvoiceModalProps) {
  const { getTransactionDetail } = useCashier()
  const tx: TransactionDetail | undefined =
    getTransactionDetail(transactionId)

  const groups = useMemo(() => {
    if (!tx) return []
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of tx.items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
    }))
  }, [tx])

  if (!tx) return null

  const statusBadge = STATUS_BADGE[tx.status]

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="print-receipt max-h-[90vh] max-w-[480px] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <DialogTitle className="text-base">#{tx.id}</DialogTitle>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-medium"
              style={{
                backgroundColor: statusBadge.bg,
                color: statusBadge.text,
              }}
            >
              {statusBadge.label}
            </span>
          </div>
        </DialogHeader>

        {/* Patient info */}
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-dashed border-border pb-4 text-[13px]">
          <span className="text-muted-foreground">Bệnh nhân</span>
          <span className="text-right">{tx.patient.name}</span>
          <span className="text-muted-foreground">Mã BN</span>
          <span className="text-right">{tx.patient.code}</span>
          <span className="text-muted-foreground">SĐT</span>
          <span className="text-right">{formatPhone(tx.patient.phone)}</span>
          <span className="text-muted-foreground">Thời gian</span>
          <span className="text-right">{formatDateTime(tx.completedAt)}</span>
          <span className="text-muted-foreground">Thu ngân</span>
          <span className="text-right">{tx.cashierName}</span>
        </div>

        {/* Line items */}
        {groups.map((group) => (
          <div key={group.category} className="mb-2">
            <div className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {CATEGORY_LABELS[group.category]}
            </div>
            {group.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between py-0.5 text-[13px]"
              >
                <span>
                  {item.description}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatVND(item.lineTotal)}</span>
              </div>
            ))}
          </div>
        ))}

        {/* Totals */}
        <div className="border-t border-dashed border-border pt-3">
          <div className="flex justify-between py-1 text-[13px] text-muted-foreground">
            <span>Tạm tính</span>
            <span>{formatVND(tx.subtotal)}</span>
          </div>
          {tx.discountAmount > 0 && (
            <div className="flex justify-between py-1 text-[13px] text-[#A32D2D]">
              <span>
                Giảm giá
                {tx.discount?.type === "percent"
                  ? ` ${tx.discount.value}%`
                  : ""}
              </span>
              <span>-{formatVND(tx.discountAmount)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-foreground pt-2 text-base font-medium">
            <span>Thành tiền</span>
            <span>{formatVND(tx.total)}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="border-t border-dashed border-border pt-3">
          {tx.paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="flex justify-between py-0.5 text-[13px]"
            >
              <span className="text-muted-foreground">
                {getPaymentMethodLabel(pm.method)}
              </span>
              <span>{formatVND(pm.amount)}</span>
            </div>
          ))}
        </div>

        {/* Refund section */}
        {tx.refunds && tx.refunds.length > 0 && (
          <div className="border-t border-dashed border-border pt-3">
            <div className="mb-2 text-[13px] font-medium text-[#A32D2D]">
              Hoàn tiền
            </div>
            {tx.refunds.map((refund, idx) => (
              <div
                key={idx}
                className="mb-2 rounded-lg border border-red-100 bg-red-50/50 p-3 text-xs"
              >
                <div className="font-medium text-[#A32D2D]">
                  -{formatVND(refund.amount)}
                </div>
                <div className="mt-1 text-muted-foreground">
                  Lý do: {refund.note}
                </div>
                <div className="text-muted-foreground">
                  {refund.cashierName} · {formatDateTime(refund.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => window.print()}>
            In lại
          </Button>
          {tx.status !== "refunded" && (
            <Button
              variant="outline"
              className="border-red-200 text-[#A32D2D] hover:bg-red-50 hover:text-[#A32D2D]"
              onClick={() => onRefund(transactionId)}
            >
              Hoàn tiền
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
