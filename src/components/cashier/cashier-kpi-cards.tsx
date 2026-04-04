import type { CashierMetrics } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"

interface CashierKpiCardsProps {
  metrics: CashierMetrics
}

export function CashierKpiCards({ metrics }: CashierKpiCardsProps) {
  const cards = [
    {
      label: "Doanh thu hôm nay",
      value: formatVND(metrics.totalRevenue),
      sub: `${metrics.totalCount} giao dịch`,
    },
    {
      label: "Tiền mặt",
      value: formatVND(metrics.cashRevenue),
      sub: `${metrics.cashCount} giao dịch`,
    },
    {
      label: "Chuyển khoản / QR",
      value: formatVND(metrics.transferRevenue),
      sub: `${metrics.transferCount} giao dịch`,
    },
    {
      label: "Thẻ",
      value: formatVND(metrics.cardRevenue),
      sub: `${metrics.cardCount} giao dịch`,
    },
  ]

  return (
    <div className="grid grid-cols-4 gap-3 max-md:grid-cols-2 max-sm:grid-cols-1">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[10px] border border-border bg-background p-[14px_16px]"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1.5 text-xl font-semibold">{card.value}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {card.sub}
          </div>
        </div>
      ))}
    </div>
  )
}
