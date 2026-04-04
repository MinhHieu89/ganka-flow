import { formatVnd } from "@/data/mock-otc"

interface OtcHistoryKpiCardsProps {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
}

export function OtcHistoryKpiCards({
  totalOrders,
  totalRevenue,
  totalProducts,
}: OtcHistoryKpiCardsProps) {
  const cards = [
    { label: "Số đơn hôm nay", value: String(totalOrders) },
    { label: "Doanh thu OTC", value: formatVnd(totalRevenue) },
    { label: "Sản phẩm đã bán", value: String(totalProducts) },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-background p-4"
        >
          <div className="text-xs text-muted-foreground">{card.label}</div>
          <div className="mt-1.5 text-2xl font-medium">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
