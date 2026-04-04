import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { CashierKpiCards } from "@/components/cashier/cashier-kpi-cards"
import { CashierQueueTable } from "@/components/cashier/cashier-queue-table"
import { CashierTransactionsTable } from "@/components/cashier/cashier-transactions-table"
import {
  mockPaymentRequests,
  mockTransactions,
  mockShift,
  getCashierMetrics,
} from "@/data/mock-cashier"

function formatVietnameseDate(): string {
  const d = new Date()
  const days = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ]
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${days[d.getDay()]}, ${day}/${month}/${year}`
}

export default function CashierDashboard() {
  const [activeTab, setActiveTab] = useState("queue")
  const requests = mockPaymentRequests
  const transactions = mockTransactions
  const metrics = getCashierMetrics(transactions)
  const shift = mockShift

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium">Thu ngân</h1>
          <p className="text-[13px] text-muted-foreground">
            {formatVietnameseDate()}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {shift.state === "active" && (
            <>
              <div className="flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                <span className="size-1.5 rounded-full bg-green-500" />
                {shift.label} · {shift.startTime}–{shift.endTime}
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                Chốt ca
              </Button>
            </>
          )}
          {shift.state === "not_opened" && (
            <>
              <span className="text-xs text-amber-600">Chưa mở ca</span>
              <Button variant="outline" size="sm" className="text-xs">
                Mở ca
              </Button>
            </>
          )}
          {shift.state === "closed" && (
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground/50" />
              {shift.label} · Đã chốt {shift.closedAt}
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <CashierKpiCards metrics={metrics} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            Chờ thanh toán
            {requests.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                {requests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">
            Giao dịch hôm nay
            <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {transactions.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="pt-2">
          <CashierQueueTable requests={requests} />
        </TabsContent>

        <TabsContent value="transactions" className="pt-2">
          <CashierTransactionsTable transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
