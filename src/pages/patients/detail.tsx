import { useState } from "react"
import { useParams } from "react-router"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useStickyHeader } from "@/hooks/use-sticky-header"
import { MOCK_PATIENT_DETAIL } from "@/data/mock-patient-detail"
import { PatientDetailHeader } from "@/components/patients/detail/patient-header"
import { StatCards } from "@/components/patients/detail/stat-cards"
import { TabOverview } from "@/components/patients/detail/tab-overview"
import { TabVisits } from "@/components/patients/detail/tab-visits"
import { TabTrends } from "@/components/patients/detail/tab-trends"

export default function PatientDetail() {
  const { id: _id } = useParams<{ id: string }>()
  const { sentinelRef, isCollapsed } = useStickyHeader()
  const [activeTab, setActiveTab] = useState("overview")

  // In a real app, fetch by _id. For now, use mock data.
  const data = MOCK_PATIENT_DETAIL

  return (
    <div className="flex-1">
      {/* Sticky header (collapsed) — fixed at top when scrolled */}
      {isCollapsed && (
        <div className="sticky top-0 z-20 animate-in duration-150 fade-in slide-in-from-top-2">
          <PatientDetailHeader
            patient={data.personal}
            alerts={data.alerts}
            isCollapsed={true}
          />
          <div className="border-b border-border bg-background">
            <div className="mx-auto max-w-[960px] px-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList variant="line" className="h-10">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="visits">Lịch sử khám</TabsTrigger>
                  <TabsTrigger value="trends">Xu hướng</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable content */}
      <div className="mx-auto max-w-[960px] px-6 py-6">
        {/* Expanded header */}
        {!isCollapsed && (
          <PatientDetailHeader
            patient={data.personal}
            alerts={data.alerts}
            isCollapsed={false}
          />
        )}

        {/* Stat cards + sentinel for intersection observer */}
        <div ref={sentinelRef} className="py-[18px]">
          <StatCards stats={data.stats} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {!isCollapsed && (
            <TabsList variant="line" className="mb-5 h-10">
              <TabsTrigger value="overview">Tổng quan</TabsTrigger>
              <TabsTrigger value="visits">Lịch sử khám</TabsTrigger>
              <TabsTrigger value="trends">Xu hướng</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="overview">
            <TabOverview
              personal={data.personal}
              medicalHistory={data.medicalHistory}
              medications={data.currentMedications}
              opticalRx={data.opticalRx}
              diagnosisHistory={data.diagnosisHistory}
              measurements={data.latestMeasurements}
            />
          </TabsContent>

          <TabsContent value="visits">
            <TabVisits visits={data.visits} />
          </TabsContent>

          <TabsContent value="trends">
            <TabTrends charts={data.trends} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
