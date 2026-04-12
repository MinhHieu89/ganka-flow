import { useState } from "react"
import { Button } from "@/components/ui/button"
import { IntakeFormDrawer } from "@/components/intake/intake-form-drawer"
import type { Patient } from "@/data/mock-patients"

const VISIT_REASON_LABELS: Record<string, string> = {
  kham_dinh_ky: "Khám định kỳ/Kiểm tra tổng quát",
  giam_thi_luc: "Giảm thị lực",
  mo_mat: "Mờ mắt",
  nhuc_dau_dau_mat: "Nhức đầu/Đau mắt",
  dau_mat_kho_chiu: "Đau mắt hoặc khó chịu",
  kho_nhin_gan: "Khó nhìn gần (đọc sách, xem điện thoại)",
  kho_nhin_xa: "Khó nhìn xa (xem bảng, lái xe)",
  kinh_ap_trong: "Muốn đeo kính áp tròng",
  tu_van_phau_thuat: "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)",
  khac: "Khác",
}

interface ScreeningChiefComplaintProps {
  patient: Patient
  onPatientUpdate: (data: Partial<Patient>) => void
}

export function ScreeningChiefComplaint({
  patient,
  onPatientUpdate,
}: ScreeningChiefComplaintProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const visitReasonLabels = (patient.visitReasons ?? []).map(
    (r) => VISIT_REASON_LABELS[r] ?? r
  )
  const displayText =
    visitReasonLabels.length > 0
      ? visitReasonLabels.join(", ")
      : patient.visitReasonOther ?? "Chưa có thông tin"

  return (
    <>
      <div className="flex items-baseline gap-2 rounded-lg border border-border bg-background px-3.5 py-2.5">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          Lý do khám
        </span>
        <span className="flex-1 text-sm text-foreground">{displayText}</span>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs text-muted-foreground"
          onClick={() => setDrawerOpen(true)}
        >
          Cập nhật
        </Button>
      </div>
      <IntakeFormDrawer
        patient={patient}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onSave={(data) => onPatientUpdate(data)}
      />
    </>
  )
}
