import type { PaymentPatientInfo } from "@/data/mock-cashier"
import { formatPhone } from "@/data/mock-cashier"

interface PatientInfoBarProps {
  patient: PaymentPatientInfo
}

export function PatientInfoBar({ patient }: PatientInfoBarProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted/50 px-[18px] py-[14px]">
      <div>
        <div className="text-[15px] font-medium">{patient.name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {patient.code} · {patient.gender} · {patient.age} tuổi
        </div>
      </div>
      <div className="text-[13px] text-muted-foreground">
        {formatPhone(patient.phone)}
      </div>
    </div>
  )
}
