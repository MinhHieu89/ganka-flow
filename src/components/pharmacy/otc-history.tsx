import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OtcHistoryKpiCards } from "./otc-history-kpi-cards"
import { OtcInvoiceModal } from "./otc-invoice-modal"
import { OtcLabelModal } from "./otc-label-modal"
import { formatVnd, getOtcMetrics } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcHistoryProps {
  orders: OtcOrder[]
  onBack: () => void
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function OtcHistory({ orders, onBack }: OtcHistoryProps) {
  const [invoiceOrder, setInvoiceOrder] = useState<OtcOrder | null>(null)
  const [labelOrder, setLabelOrder] = useState<OtcOrder | null>(null)

  const metrics = getOtcMetrics(orders)
  const sorted = [...orders].sort(
    (a, b) => new Date(b.soldAt).getTime() - new Date(a.soldAt).getTime()
  )

  return (
    <div className="space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Lịch sử bán OTC hôm nay</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>
          ← Quay lại bán hàng
        </Button>
      </div>

      {/* KPI cards */}
      <OtcHistoryKpiCards
        totalOrders={metrics.totalOrders}
        totalRevenue={metrics.totalRevenue}
        totalProducts={metrics.totalProducts}
      />

      {/* History table */}
      <div className="rounded-lg border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Mã đơn
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Khách hàng
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Thời gian
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Sản phẩm
              </th>
              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">
                Tổng tiền
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">
                Thanh toán
              </th>
              <th className="w-[50px] px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((order) => {
              const itemCount = order.items.reduce(
                (sum, i) => sum + i.quantity,
                0
              )
              return (
                <tr
                  key={order.id}
                  className="border-b border-border/50 last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium">{order.customer.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {order.customer.phone}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">{formatTime(order.soldAt)}</td>
                  <td className="px-4 py-2.5">{itemCount} sản phẩm</td>
                  <td className="px-4 py-2.5 text-right font-medium">
                    {formatVnd(order.totalAmount)}
                  </td>
                  <td className="px-4 py-2.5">
                    {paymentLabels[order.paymentMethod]}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground">
                          ⋮
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setInvoiceOrder(order)}
                        >
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setInvoiceOrder(order)}
                        >
                          In hóa đơn
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setLabelOrder(order)}>
                          In nhãn thuốc
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <OtcInvoiceModal
        order={invoiceOrder}
        open={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />
      <OtcLabelModal
        order={labelOrder}
        open={!!labelOrder}
        onClose={() => setLabelOrder(null)}
      />
    </div>
  )
}
