import { useParams, Navigate } from "react-router"
import { useReceptionist } from "@/contexts/receptionist-context"
import { IntakeForm } from "@/components/receptionist/intake-form"

export default function IntakeEdit() {
  const { id } = useParams<{ id: string }>()
  const { getPatient } = useReceptionist()

  const patient = id ? getPatient(id) : undefined

  if (!patient) {
    return <Navigate to="/intake" replace />
  }

  return <IntakeForm patient={patient} />
}
