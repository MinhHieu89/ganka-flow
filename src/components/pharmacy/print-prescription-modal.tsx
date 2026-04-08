import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { PrescriptionOrder } from "@/data/mock-pharmacy"
import { useClinic } from "@/hooks/use-clinic"

interface PrintPrescriptionModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
}

function formatDateParts(isoDate: string) {
  const d = new Date(isoDate)
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: String(d.getMonth() + 1).padStart(2, "0"),
    year: d.getFullYear(),
  }
}

function formatDate(isoDate: string): string {
  const { day, month, year } = formatDateParts(isoDate)
  return `${day}/${month}/${year}`
}

function maskPhone(phone: string): string {
  if (phone.length < 4) return phone
  const prefix = phone.slice(0, 4)
  return `${prefix}.xxx.xxx`
}

function getMedicationRows(order: PrescriptionOrder) {
  // For dispensed prescriptions with dispensedItems, use actual dispensed data
  if (order.status === "dispensed" && order.dispensedItems?.length) {
    return order.dispensedItems.map((item, idx) => ({
      index: idx + 1,
      name: item.dispensedMedication,
      dosage: item.dosage,
      quantity: item.quantity,
      unit: item.unit,
    }))
  }

  // For pending prescriptions, use medications — show substitution name if present
  return order.medications.map((med, idx) => ({
    index: idx + 1,
    name: med.substitution ? med.substitution.name : med.name,
    dosage: med.dosage,
    quantity: med.quantity,
    unit: med.unit,
  }))
}

export function PrintPrescriptionModal({
  order,
  open,
  onClose,
}: PrintPrescriptionModalProps) {
  const clinic = useClinic()
  const prescribedDate = formatDateParts(order.prescribedAt)
  const expiryDate = formatDate(order.expiresAt)
  const medicationRows = getMedicationRows(order)

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {open && (
        <style>{`
          @media print {
            body > *:not([data-radix-portal]) {
              display: none !important;
            }
            [data-radix-portal] [data-slot="dialog-overlay"] {
              background: none !important;
            }
            [data-radix-portal] [data-slot="dialog-content"] {
              position: static !important;
              max-height: none !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              max-width: none !important;
            }
          }
        `}</style>
      )}
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-base font-medium">
              In đơn thuốc — {order.patientName}
            </DialogTitle>
          </DialogHeader>

          {/* Description */}
          <p className="text-xs text-muted-foreground print:hidden">
            Xem trước đơn thuốc. Đơn sẽ in trên giấy A5.
          </p>

          {/* A5 Preview Card */}
          <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible print:pr-0">
            <div className="rounded-lg border border-border px-8 py-7 print:border-none print:p-0">
              {/* 5.1 Header */}
              <div className="border-b border-border pb-4 text-center">
                <div className="text-base font-medium">
                  {clinic.name.toUpperCase()}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {clinic.address} — ĐT: {clinic.hotline}
                </div>
                <div className="mt-3 text-lg font-medium tracking-wide">
                  ĐƠN THUỐC
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Số: {order.prescriptionCode}
                </div>
              </div>

              {/* 5.2 Patient Info */}
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Họ tên: </span>
                  <span className="font-medium">{order.patientName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Mã BN: </span>
                  <span>{order.patientId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Năm sinh: </span>
                  <span>{order.patientBirthYear}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Giới tính: </span>
                  <span>{order.patientGender === "male" ? "Nam" : "Nữ"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày khám: </span>
                  <span>{formatDate(order.prescribedAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT: </span>
                  <span>{maskPhone(order.patientPhone)}</span>
                </div>
              </div>

              {/* 5.3 Diagnosis */}
              <div className="mt-4 rounded bg-muted px-3 py-2 text-sm">
                <span className="text-muted-foreground">Chẩn đoán: </span>
                <strong>
                  {order.diagnosis}
                  {order.icdCode && ` (${order.icdCode})`}
                </strong>
              </div>

              {/* 5.4 Medication Table */}
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="w-[30px] py-2 text-center">STT</th>
                    <th className="py-2">Tên thuốc</th>
                    <th className="py-2">Cách dùng</th>
                    <th className="py-2">SL</th>
                  </tr>
                </thead>
                <tbody>
                  {medicationRows.map((row) => (
                    <tr key={row.index} className="border-b border-border/50">
                      <td className="py-2 text-center text-muted-foreground">
                        {row.index}
                      </td>
                      <td className="py-2 font-medium">{row.name}</td>
                      <td className="py-2 text-muted-foreground">
                        {row.dosage}
                      </td>
                      <td className="py-2">
                        {row.quantity} {row.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 5.5 Doctor Notes (conditional) */}
              {order.doctorNotes && (
                <div className="mt-4 rounded bg-muted px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Lời dặn: </span>
                  {order.doctorNotes}
                </div>
              )}

              {/* 5.6 Prescription Footer */}
              <div className="mt-6 flex items-start justify-between text-sm">
                <div className="text-xs text-muted-foreground">
                  Ngày {prescribedDate.day} tháng {prescribedDate.month} năm{" "}
                  {prescribedDate.year}
                </div>
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">
                    Bác sĩ kê đơn
                  </div>
                  <div className="mt-1 font-medium">{order.doctorName}</div>
                </div>
              </div>

              {/* 5.7 Expiry Line */}
              <div className="mt-4 text-center text-[11px] text-muted-foreground">
                Đơn thuốc có giá trị 7 ngày kể từ ngày kê — Hết hạn:{" "}
                {expiryDate}
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              Tải PDF
            </Button>
            <Button onClick={handlePrint}>In đơn thuốc</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
