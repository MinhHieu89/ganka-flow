import { useState } from "react"
import {
  Clock01Icon,
  UserGroupIcon,
  File02Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { ConsultationQueue } from "@/components/optical/consultation-queue"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type {
  OpticalConsultation,
  ConsultationStatus,
  ConsultationMetrics,
} from "@/data/mock-optical"

type ConsultationFilter = "all" | "waiting_consultation" | "in_consultation"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "waitingCount",
    label: "Chờ tư vấn",
    icon: Clock01Icon,
    colorClass: "text-amber-500",
    subtitle: "bệnh nhân",
    highlightWhen: (v) => v > 0,
  },
  {
    key: "consultingCount",
    label: "Đang tư vấn",
    icon: UserGroupIcon,
    colorClass: "text-blue-600",
  },
  {
    key: "ordersCreatedToday",
    label: "Đã tạo đơn hôm nay",
    icon: File02Icon,
    colorClass: "text-emerald-600",
  },
  {
    key: "deliveredToday",
    label: "Đã giao hôm nay",
    icon: CheckmarkCircle02Icon,
    colorClass: "",
  },
]

const filterOptions: { key: ConsultationFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "waiting_consultation", label: "Chờ tư vấn" },
  { key: "in_consultation", label: "Đang tư vấn" },
]

interface TabConsultationProps {
  consultations: OpticalConsultation[]
  metrics: ConsultationMetrics
  onUpdateConsultations: (
    updater: (prev: OpticalConsultation[]) => OpticalConsultation[]
  ) => void
}

export function TabConsultation({
  consultations,
  metrics,
  onUpdateConsultations,
}: TabConsultationProps) {
  const [filter, setFilter] = useState<ConsultationFilter>("all")
  const [search, setSearch] = useState("")

  const filtered = consultations
    .filter((c) => {
      if (filter === "all") return true
      return c.status === filter
    })
    .filter((c) => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        c.patientName.toLowerCase().includes(q) ||
        c.patientId.toLowerCase().includes(q) ||
        c.doctor.toLowerCase().includes(q)
      )
    })

  const counts: Record<ConsultationFilter, number> = {
    all: consultations.length,
    waiting_consultation: consultations.filter(
      (c) => c.status === "waiting_consultation"
    ).length,
    in_consultation: consultations.filter((c) => c.status === "in_consultation")
      .length,
  }

  const handleAcceptPatient = (id: string) => {
    onUpdateConsultations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "in_consultation" as ConsultationStatus,
              assignedStaff: "Nguyễn Thị Mai",
            }
          : c
      )
    )
  }

  const handleReturnToQueue = (id: string) => {
    onUpdateConsultations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "waiting_consultation" as ConsultationStatus,
              assignedStaff: undefined,
            }
          : c
      )
    )
  }

  const handleCreateOrder = (_id: string) => {
    // Placeholder — will open order form in future
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
        searchPlaceholder="Tìm theo tên, mã BN, SĐT..."
        search={search}
        onSearchChange={setSearch}
      />
      <ConsultationQueue
        consultations={filtered}
        onAcceptPatient={handleAcceptPatient}
        onCreateOrder={handleCreateOrder}
        onReturnToQueue={handleReturnToQueue}
      />
    </div>
  )
}
