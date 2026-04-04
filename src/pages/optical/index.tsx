import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  mockConsultations as initialConsultations,
  mockOrders as initialOrders,
  mockFrames,
  mockLenses,
  getConsultationMetrics,
  getOrderMetrics,
  getInventoryMetrics,
} from "@/data/mock-optical"
import { TabConsultation } from "@/components/optical/tab-consultation"
import { TabOrders } from "@/components/optical/tab-orders"
import { TabInventory } from "@/components/optical/tab-inventory"

export default function OpticalDashboard() {
  const [consultations, setConsultations] = useState(initialConsultations)
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState("consultation")

  const consultationMetrics = getConsultationMetrics(consultations, orders)
  const orderMetrics = getOrderMetrics(orders)
  const inventoryMetrics = getInventoryMetrics(mockFrames, mockLenses)

  const consultationBadge =
    consultationMetrics.waitingCount + consultationMetrics.consultingCount
  const orderBadge =
    orderMetrics.orderedCount +
    orderMetrics.fabricatingCount +
    orderMetrics.readyCount

  const now = new Date()
  const dayNames = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ]
  const dateStr = `${dayNames[now.getDay()]}, ${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium">Trung tâm kính</h1>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>
        <div className="rounded-md bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          Nhân viên kính: Nguyễn Thị Mai
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value="consultation">
            Tư vấn kính
            {consultationBadge > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {consultationBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders">
            Đơn hàng kính
            {orderBadge > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {orderBadge}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="inventory">Kho kính</TabsTrigger>
        </TabsList>

        <TabsContent value="consultation" className="space-y-4 pt-2">
          <TabConsultation
            consultations={consultations}
            metrics={consultationMetrics}
            onUpdateConsultations={setConsultations}
            frames={mockFrames}
            lenses={mockLenses}
            onCreateOrder={(order) => {
              setConsultations((prev) =>
                prev.filter((c) => c.id !== order.consultationId)
              )
            }}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4 pt-2">
          <TabOrders
            orders={orders}
            metrics={orderMetrics}
            onUpdateOrders={setOrders}
          />
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4 pt-2">
          <TabInventory
            frames={mockFrames}
            lenses={mockLenses}
            metrics={inventoryMetrics}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
