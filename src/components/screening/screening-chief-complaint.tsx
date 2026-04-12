import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  const visitReasonLabels = (patient.visitReasons ?? []).map(
    (r) => VISIT_REASON_LABELS[r] ?? r
  )
  const displayText =
    visitReasonLabels.length > 0
      ? visitReasonLabels.join(", ")
      : patient.visitReasonOther ?? "Chưa có thông tin"

  function handleEdit() {
    setDraft(patient.visitReasonOther ?? displayText)
    setEditing(true)
  }

  function handleSave() {
    onPatientUpdate({ visitReasonOther: draft.trim() })
    setEditing(false)
  }

  function handleCancel() {
    setEditing(false)
  }

  return (
    <div className="rounded-lg border border-border bg-background px-3.5 py-2.5">
      <div className="flex items-baseline gap-2">
        <span className="shrink-0 text-xs font-semibold text-muted-foreground">
          Lý do khám
        </span>
        {!editing && (
          <>
            <span className="flex-1 text-sm text-foreground">
              {displayText}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 text-xs text-muted-foreground"
              onClick={handleEdit}
            >
              Cập nhật
            </Button>
          </>
        )}
      </div>
      {editing && (
        <div className="mt-2 space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            className="text-sm"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleSave}>
              Lưu
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
