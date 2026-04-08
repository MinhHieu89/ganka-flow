import { useMemo } from "react"
import type {
  CompletedPayment,
  PaymentCategory,
  PaymentLineItem,
} from "@/data/mock-cashier"
import {
  formatVND,
  formatPhone,
  getPaymentMethodLabel,
} from "@/data/mock-cashier"
import { useClinic } from "@/hooks/use-clinic"

interface ReceiptCardProps {
  payment: CompletedPayment
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

function formatReceiptDate(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}

export function ReceiptCard({ payment }: ReceiptCardProps) {
  const clinic = useClinic()

  const groups = useMemo(() => {
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of payment.items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
    }))
  }, [payment.items])

  const hasMultipleMethods = payment.paymentMethods.length > 1
  const methodLabel = hasMultipleMethods
    ? payment.paymentMethods
        .map((m) => getPaymentMethodLabel(m.method))
        .join(" + ")
    : getPaymentMethodLabel(payment.paymentMethods[0].method)

  return (
    <div className="print-receipt w-full rounded-xl border border-border bg-background p-6">
      {/* Clinic header */}
      <div className="mb-5 border-b border-dashed border-border pb-4 text-center">
        <div className="text-[15px] font-medium">{clinic.name}</div>
        <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {clinic.address}
          <br />
          Hotline: {clinic.hotline}
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          #{payment.id} · {formatReceiptDate(payment.completedAt)}
        </div>
      </div>

      {/* Patient info */}
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-b border-dashed border-border pb-4 text-[13px]">
        <span className="text-muted-foreground">Bệnh nhân</span>
        <span className="text-right">{payment.patient.name}</span>
        <span className="text-muted-foreground">Mã BN</span>
        <span className="text-right">{payment.patient.code}</span>
        <span className="text-muted-foreground">SĐT</span>
        <span className="text-right">
          {formatPhone(payment.patient.phone)}
        </span>
        <span className="text-muted-foreground">Thu ngân</span>
        <span className="text-right">{payment.cashierName}</span>
      </div>

      {/* Line items grouped */}
      {groups.map((group) => (
        <div key={group.category} className="mb-3">
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
      <div className="mt-4 border-t border-dashed border-border pt-3">
        <div className="flex justify-between py-1 text-[13px] text-muted-foreground">
          <span>Tạm tính</span>
          <span>{formatVND(payment.subtotal)}</span>
        </div>
        {payment.discountAmount > 0 && (
          <div className="flex justify-between py-1 text-[13px] text-[#A32D2D]">
            <span>
              Giảm giá
              {payment.discount?.type === "percent"
                ? ` ${payment.discount.value}%`
                : ""}
            </span>
            <span>-{formatVND(payment.discountAmount)}</span>
          </div>
        )}
        <div className="mt-2 flex justify-between border-t border-foreground pt-2.5 text-[17px] font-medium">
          <span>Thành tiền</span>
          <span>{formatVND(payment.total)}</span>
        </div>
      </div>

      {/* Payment methods */}
      <div className="mt-3 border-t border-dashed border-border pt-3">
        <div className="flex justify-between py-1 text-[13px]">
          <span className="text-muted-foreground">Phương thức</span>
          <span>{methodLabel}</span>
        </div>
        {payment.paymentMethods.map((pm) => (
          <div key={pm.id}>
            {hasMultipleMethods && (
              <div className="flex justify-between py-1 text-[13px]">
                <span className="text-muted-foreground">
                  {getPaymentMethodLabel(pm.method)}
                </span>
                <span>{formatVND(pm.amount)}</span>
              </div>
            )}
            {pm.method === "cash" && pm.cashReceived !== undefined && (
              <>
                <div className="flex justify-between py-1 text-[13px]">
                  <span className="text-muted-foreground">Tiền nhận</span>
                  <span>{formatVND(pm.cashReceived)}</span>
                </div>
                <div className="flex justify-between py-1 text-[13px]">
                  <span className="text-muted-foreground">Tiền thừa</span>
                  <span className="font-medium text-[#0F6E56]">
                    {formatVND(pm.cashChange ?? 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 border-t border-dashed border-border pt-4 text-center text-xs leading-relaxed text-muted-foreground">
        Cảm ơn quý khách đã sử dụng dịch vụ tại {clinic.name}
        <br />
        Hotline: {clinic.hotline} · {clinic.website}
      </div>
    </div>
  )
}
