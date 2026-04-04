import { useState } from "react"
import {
  CheckmarkCircle02Icon,
  Settings02Icon,
  DeliveryTruck01Icon,
  PackageDelivered01Icon,
} from "@hugeicons/core-free-icons"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { OrderTable } from "@/components/optical/order-table"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type {
  OpticalOrder,
  OrderStatus,
  OrderMetrics,
} from "@/data/mock-optical"
import { offsetDate } from "@/lib/demo-date"

type OrderFilter =
  | "all"
  | "ordered"
  | "fabricating"
  | "ready_delivery"
  | "delivered"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "orderedCount",
    label: "Đã đặt",
    icon: CheckmarkCircle02Icon,
    colorClass: "text-green-600",
  },
  {
    key: "fabricatingCount",
    label: "Đang gia công",
    icon: Settings02Icon,
    colorClass: "text-blue-600",
    highlightWhen: (v) => v > 0,
  },
  {
    key: "readyCount",
    label: "Sẵn sàng giao",
    icon: DeliveryTruck01Icon,
    colorClass: "text-teal-600",
  },
  {
    key: "deliveredToday",
    label: "Đã giao hôm nay",
    icon: PackageDelivered01Icon,
    colorClass: "",
  },
]

const filterOptions: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "ordered", label: "Đã đặt" },
  { key: "fabricating", label: "Đang gia công" },
  { key: "ready_delivery", label: "Sẵn sàng giao" },
  { key: "delivered", label: "Đã giao" },
]

interface TabOrdersProps {
  orders: OpticalOrder[]
  metrics: OrderMetrics
  onUpdateOrders: (updater: (prev: OpticalOrder[]) => OpticalOrder[]) => void
}

export function TabOrders({ orders, metrics, onUpdateOrders }: TabOrdersProps) {
  const [filter, setFilter] = useState<OrderFilter>("all")
  const [search, setSearch] = useState("")

  const filtered = orders
    .filter((o) => {
      if (filter === "all") return true
      return o.status === filter
    })
    .filter((o) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.id.toLowerCase().includes(q) ||
        o.patientName.toLowerCase().includes(q) ||
        o.patientId.toLowerCase().includes(q)
      )
    })

  const counts: Record<OrderFilter, number> = {
    all: orders.length,
    ordered: orders.filter((o) => o.status === "ordered").length,
    fabricating: orders.filter((o) => o.status === "fabricating").length,
    ready_delivery: orders.filter((o) => o.status === "ready_delivery").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  }

  const handleUpdateStatus = (id: string, newStatus: OrderStatus) => {
    onUpdateOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status: newStatus,
              deliveredAt:
                newStatus === "delivered" ? offsetDate(0) : o.deliveredAt,
            }
          : o
      )
    )
  }

  return (
    <div className="space-y-4">
      <OpticalKpiCards
        config={kpiConfig}
        values={metrics as unknown as Record<string, number>}
      />
      <OpticalStatusFilters
        filters={filterOptions}
        activeFilter={filter}
        onFilterChange={setFilter}
        counts={counts}
        searchPlaceholder="Tìm theo mã đơn, tên BN..."
        search={search}
        onSearchChange={setSearch}
      />
      <OrderTable orders={filtered} onUpdateStatus={handleUpdateStatus} />
    </div>
  )
}
