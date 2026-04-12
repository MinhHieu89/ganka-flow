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
import DoctorDashboard from "@/pages/doctor/index"
import DoctorExam from "@/pages/doctor/exam"
import { DoctorProvider } from "@/contexts/doctor-context"
import { CashierProvider } from "@/contexts/cashier-context"
import { MasterDataProvider } from "@/contexts/master-data-context"
import PatientRegistry from "@/pages/patients/index"
import PatientDetail from "@/pages/patients/detail"
import PharmacyDashboard from "@/pages/pharmacy/index"
import OpticalDashboard from "@/pages/optical/index"
import CashierDashboard from "@/pages/payment/index"
import PaymentProcessingPage from "@/pages/payment/process"
import PaymentSuccessPage from "@/pages/payment/success"
import ShiftClosePage from "@/pages/payment/shift-close"
import PatientHistory from "@/pages/patient/history"
import SettingsIndex from "@/pages/settings/index"
import MasterDataPage from "@/pages/settings/master-data-page"

export function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <MasterDataProvider>
          <ReceptionistProvider>
            <DoctorProvider>
              <CashierProvider>
                <Routes>
                  {/* Patient-facing route (no sidebar/header) */}
                  <Route
                    path="/patient/:visitId/history"
                    element={<PatientHistory />}
                  />

                  {/* Staff-facing routes (with sidebar/header) */}
                  <Route
                    path="/*"
                    element={
                      <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset>
                          <SiteHeader />
                          <Routes>
                            <Route
                              path="/"
                              element={<Navigate to="/intake" replace />}
                            />
                            <Route
                              path="/intake"
                              element={<IntakeDashboard />}
                            />
                            <Route path="/intake/new" element={<IntakeNew />} />
                            <Route
                              path="/intake/:id/edit"
                              element={<IntakeEdit />}
                            />
                            <Route
                              path="/patients"
                              element={<PatientRegistry />}
                            />
                            <Route
                              path="/patients/:id"
                              element={<PatientDetail />}
                            />
                            <Route
                              path="/schedule"
                              element={<ScheduleCalendar />}
                            />
                            <Route
                              path="/schedule/new"
                              element={<ScheduleNew />}
                            />
                            <Route
                              path="/screening"
                              element={<ScreeningDashboard />}
                            />
                            <Route
                              path="/screening/:visitId"
                              element={<ScreeningVisit />}
                            />
                            <Route
                              path="/doctor"
                              element={<DoctorDashboard />}
                            />
                            <Route
                              path="/doctor/:visitId"
                              element={<DoctorExam />}
                            />
                            <Route
                              path="/pharmacy"
                              element={<PharmacyDashboard />}
                            />
                            <Route
                              path="/optical"
                              element={<OpticalDashboard />}
                            />
                            <Route
                              path="/payment"
                              element={<CashierDashboard />}
                            />
                            <Route
                              path="/payment/process/:paymentRequestId"
                              element={<PaymentProcessingPage />}
                            />
                            <Route
                              path="/payment/:paymentId/success"
                              element={<PaymentSuccessPage />}
                            />
                            <Route
                              path="/payment/shift-close"
                              element={<ShiftClosePage />}
                            />
                            <Route
                              path="/settings"
                              element={<SettingsIndex />}
                            />
                            <Route
                              path="/settings/:listKey"
                              element={<MasterDataPage />}
                            />
                          </Routes>
                        </SidebarInset>
                      </SidebarProvider>
                    }
                  />
                </Routes>
              </CashierProvider>
            </DoctorProvider>
          </ReceptionistProvider>
        </MasterDataProvider>
      </TooltipProvider>
    </BrowserRouter>
  )
}

export default App
