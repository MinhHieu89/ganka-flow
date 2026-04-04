import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PrintPrescriptionModal } from "@/components/pharmacy/print-prescription-modal"
import type { PrescriptionOrder } from "@/data/mock-pharmacy"

interface ViewPrescriptionModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onDispense: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${formatDate(isoDate)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

function daysUntil(isoDate: string): number {
  const now = new Date()
  const exp = new Date(isoDate)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function ViewPrescriptionModal({
  order,
  open,
  onClose,
  onDispense,
}: ViewPrescriptionModalProps) {
  const [showPrint, setShowPrint] = useState(false)
  const daysLeft = daysUntil(order.expiresAt)

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-medium">
                Xem đơn thuốc
              </DialogTitle>
              {order.status === "pending" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Chờ phát
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Đã phát
                </span>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient info grid — 6 fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">Bệnh nhân</div>
                <div className="text-sm font-medium">{order.patientName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Mã BN</div>
                <div className="text-sm font-medium">{order.patientId}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">BS kê đơn</div>
                <div className="text-sm font-medium">{order.doctorName}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Ngày kê</div>
                <div className="text-sm font-medium">
                  {formatDateTime(order.prescribedAt)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Chẩn đoán</div>
                <div className="text-sm font-medium">
                  {order.diagnosis}
                  {order.icdCode && (
                    <span className="text-muted-foreground">
                      {" "}
                      ({order.icdCode})
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Hạn đơn</div>
                <div
                  className={`text-sm font-medium ${daysLeft <= 2 ? "text-red-600" : ""}`}
                >
                  {formatDate(order.expiresAt)}{" "}
                  <span className="font-normal text-muted-foreground">
                    {daysLeft < 0 ? "(Quá hạn)" : `(còn ${daysLeft} ngày)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor notes */}
            {order.doctorNotes && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Ghi chú BS:</strong>{" "}
                {order.doctorNotes}
              </div>
            )}

            {/* Medication table — 3 columns, read-only */}
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên thuốc</TableHead>
                    <TableHead>Liều dùng</TableHead>
                    <TableHead>Số lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.medications.map((med) => (
                    <TableRow key={med.id}>
                      <TableCell className="font-medium">{med.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {med.dosage}
                      </TableCell>
                      <TableCell>
                        {med.quantity} {med.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPrint(true)}>
              In đơn thuốc
            </Button>
            {order.status === "pending" && (
              <Button onClick={onDispense}>Phát thuốc</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showPrint && (
        <PrintPrescriptionModal
          order={order}
          open={showPrint}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  )
}
