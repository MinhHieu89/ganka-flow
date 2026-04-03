import { createContext, useContext, useState, type ReactNode } from "react"
import {
  mockPatients,
  mockVisits,
  generatePatientId,
  type Patient,
  type Visit,
  type PatientStatus,
  type ScreeningFormData,
} from "@/data/mock-patients"
import { mockAppointments, type Appointment } from "@/data/mock-appointments"
import { TODAY } from "@/lib/demo-date"

interface ReceptionistContextType {
  patients: Patient[]
  visits: Visit[]
  appointments: Appointment[]
  todayVisits: Visit[]
  addPatient: (patient: Omit<Patient, "id" | "createdAt">) => Patient
  updatePatient: (id: string, data: Partial<Patient>) => void
  getPatient: (id: string) => Patient | undefined
  searchPatients: (query: string) => Patient[]
  addVisit: (visit: Omit<Visit, "id">) => void
  updateVisitStatus: (visitId: string, status: PatientStatus) => void
  cancelVisit: (visitId: string) => void
  checkInVisit: (visitId: string) => void
  addAppointment: (appointment: Omit<Appointment, "id">) => void
  cancelAppointment: (appointmentId: string) => void
  saveScreeningData: (visitId: string, data: ScreeningFormData) => void
}

const ReceptionistContext = createContext<ReceptionistContextType | null>(null)

export function ReceptionistProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [visits, setVisits] = useState<Visit[]>(mockVisits)
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments)

  const today = TODAY

  const todayVisits = visits.filter((v) => v.date === today)

  function addPatient(data: Omit<Patient, "id" | "createdAt">): Patient {
    const newPatient: Patient = {
      ...data,
      id: generatePatientId(),
      createdAt: new Date().toISOString(),
    }
    setPatients((prev) => [...prev, newPatient])
    return newPatient
  }

  function updatePatient(id: string, data: Partial<Patient>) {
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    )
  }

  function getPatient(id: string) {
    return patients.find((p) => p.id === id)
  }

  function searchPatients(query: string): Patient[] {
    if (!query || query.length < 2) return []
    const q = query.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.id.toLowerCase().includes(q)
    )
  }

  function addVisit(data: Omit<Visit, "id">) {
    const newVisit: Visit = {
      ...data,
      id: `v${Date.now()}`,
    }
    setVisits((prev) => [...prev, newVisit])
  }

  function updateVisitStatus(visitId: string, status: PatientStatus) {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, status } : v))
    )
  }

  function cancelVisit(visitId: string) {
    updateVisitStatus(visitId, "da_huy")
  }

  function checkInVisit(visitId: string) {
    setVisits((prev) =>
      prev.map((v) =>
        v.id === visitId
          ? {
              ...v,
              status: "cho_kham" as const,
              checkedInAt: new Date().toISOString(),
            }
          : v
      )
    )
  }

  function addAppointment(data: Omit<Appointment, "id">) {
    const newAppointment: Appointment = {
      ...data,
      id: `a${Date.now()}`,
    }
    setAppointments((prev) => [...prev, newAppointment])
  }

  function cancelAppointment(appointmentId: string) {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, status: "cancelled" as const } : a
      )
    )
  }

  function saveScreeningData(visitId: string, data: ScreeningFormData) {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, screeningData: data } : v))
    )
  }

  return (
    <ReceptionistContext.Provider
      value={{
        patients,
        visits,
        appointments,
        todayVisits,
        addPatient,
        updatePatient,
        getPatient,
        searchPatients,
        addVisit,
        updateVisitStatus,
        cancelVisit,
        checkInVisit,
        addAppointment,
        cancelAppointment,
        saveScreeningData,
      }}
    >
      {children}
    </ReceptionistContext.Provider>
  )
}

export function useReceptionist() {
  const context = useContext(ReceptionistContext)
  if (!context) {
    throw new Error("useReceptionist must be used within ReceptionistProvider")
  }
  return context
}
