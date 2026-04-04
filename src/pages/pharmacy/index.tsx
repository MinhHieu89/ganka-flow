import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mockPrescriptions, getPharmacyMetrics } from "@/data/mock-pharmacy"
import { PharmacyKpiCards } from "@/components/pharmacy/kpi-cards"
import { PharmacyStatusFilters } from "@/components/pharmacy/status-filters"
import { PrescriptionQueueTable } from "@/components/pharmacy/prescription-queue-table"
import type {
  PrescriptionStatus,
  PrescriptionMedication,
  DispensedItem,
} from "@/data/mock-pharmacy"

type PharmacyFilter = "all" | "pending" | "dispensed"

export default function PharmacyDashboard() {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions)
  const [filter, setFilter] = useState<PharmacyFilter>("all")
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("queue")
  const metrics = getPharmacyMetrics(prescriptions)

  const filtered = prescriptions
    .filter((p) => {
      if (filter === "all") return true
      return p.status === filter
    })
    .filter((p) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        p.patientName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q)
      )
    })

  const sorted = [...filtered].sort((a, b) => {
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1
    if (a.status === "pending") {
      return (
        new Date(a.prescribedAt).getTime() - new Date(b.prescribedAt).getTime()
      )
    }
    return (
      new Date(b.dispensedAt ?? b.prescribedAt).getTime() -
      new Date(a.dispensedAt ?? a.prescribedAt).getTime()
    )
  })

  const counts: Record<PharmacyFilter, number> = {
    all: prescriptions.length,
    pending: prescriptions.filter((p) => p.status === "pending").length,
    dispensed: prescriptions.filter((p) => p.status === "dispensed").length,
  }

  const handleDispense = (
    orderId: string,
    finalMedications?: PrescriptionMedication[]
  ) => {
    setPrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== orderId) return p
        const meds = finalMedications ?? p.medications
        const dispensedItems: DispensedItem[] = meds.map((m) => ({
          originalMedication: m.name,
          dispensedMedication: m.substitution ? m.substitution.name : m.name,
          isSubstituted: !!m.substitution,
          dosage: m.dosage,
          quantity: m.quantity,
          unit: m.unit,
        }))
        return {
          ...p,
          status: "dispensed" as PrescriptionStatus,
          dispensedAt: new Date().toISOString(),
          dispensedBy: "Nguyễn Thị Lan",
          dispensedItems,
        }
      })
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Nhà thuốc</h1>
        <div className="rounded-md bg-blue-50 px-3 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Dược sĩ: Nguyễn Thị Lan
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="queue">
            Hàng đợi đơn thuốc
            {metrics.pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                {metrics.pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="otc">Bán OTC</TabsTrigger>
          <TabsTrigger value="inventory">Tồn kho</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4 pt-2">
          <PharmacyKpiCards
            metrics={metrics}
            onStockAlertClick={() => setActiveTab("inventory")}
          />
          <PharmacyStatusFilters
            activeFilter={filter}
            onFilterChange={setFilter}
            counts={counts}
            search={search}
            onSearchChange={setSearch}
          />
          <PrescriptionQueueTable
            prescriptions={sorted}
            onDispense={handleDispense}
          />
        </TabsContent>

        <TabsContent value="otc">
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sẽ thiết kế chi tiết ở bước tiếp theo
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
            Sẽ thiết kế chi tiết ở bước tiếp theo
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
