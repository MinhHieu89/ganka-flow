import type { ShiftReconciliation } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface ShiftMetricCardsProps {
  reconciliation: ShiftReconciliation
}

export function ShiftMetricCards({ reconciliation }: ShiftMetricCardsProps) {
  const cards = [
    {
      label: "Tổng doanh thu ca",
      value: formatVND(reconciliation.totalRevenue),
      sub: `${reconciliation.totalTransactions} giao dịch`,
    },
    {
      label: "Tiền mặt (hệ thống)",
      value: formatVND(reconciliation.cashExpected),
      sub: `${reconciliation.cashTransactions} giao dịch`,
    },
    {
      label: "Không tiền mặt",
      value: formatVND(reconciliation.nonCashRevenue),
      sub: `${reconciliation.nonCashTransactions} giao dịch`,
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-border bg-background p-4"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1 text-lg font-medium">{card.value}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
