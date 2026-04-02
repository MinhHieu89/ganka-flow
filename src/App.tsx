import { BrowserRouter, Routes, Route, Navigate } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/site-header"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ReceptionistProvider } from "@/contexts/receptionist-context"
import IntakeDashboard from "@/pages/intake/index"
import IntakeNew from "@/pages/intake/new"
import IntakeEdit from "@/pages/intake/edit"
import ScheduleCalendar from "@/pages/schedule/index"
import ScheduleNew from "@/pages/schedule/new"
import ScreeningDashboard from "@/pages/screening/index"
import ScreeningVisit from "@/pages/screening/visit"

export function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <ReceptionistProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <SiteHeader />
              <Routes>
                <Route path="/" element={<Navigate to="/intake" replace />} />
                <Route path="/intake" element={<IntakeDashboard />} />
                <Route path="/intake/new" element={<IntakeNew />} />
                <Route path="/intake/:id/edit" element={<IntakeEdit />} />
                <Route path="/schedule" element={<ScheduleCalendar />} />
                <Route path="/schedule/new" element={<ScheduleNew />} />
                <Route path="/screening" element={<ScreeningDashboard />} />
                <Route path="/screening/:visitId" element={<ScreeningVisit />} />
              </Routes>
            </SidebarInset>
          </SidebarProvider>
        </ReceptionistProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
