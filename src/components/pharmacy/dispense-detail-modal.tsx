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

interface DispenseDetailModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onPrintLabels: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function formatDateTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${formatDate(isoDate)}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export function DispenseDetailModal({
  order,
  open,
  onClose,
  onPrintLabels,
}: DispenseDetailModalProps) {
  const [showPrint, setShowPrint] = useState(false)
  const hasSubstitutions = order.dispensedItems?.some(
    (item) => item.isSubstituted
  )

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-3xl">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle className="text-base font-medium">
                Chi tiết phát thuốc
              </DialogTitle>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Đã phát
              </span>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto pr-1">
            {/* Patient info — 4 fields */}
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
            </div>

            {/* Dispensing metadata bar */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-sm">
              <span>
                Dược sĩ phát: <strong>{order.dispensedBy ?? "—"}</strong>
              </span>
              <span className="text-muted-foreground">
                Thời gian:{" "}
                {order.dispensedAt ? formatDateTime(order.dispensedAt) : "—"}
              </span>
            </div>

            {/* Dispensed medication table — 4 columns */}
            <div className="rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%]">Thuốc kê (BS)</TableHead>
                    <TableHead className="w-[30%]">
                      Thuốc phát (thực tế)
                    </TableHead>
                    <TableHead>Liều dùng</TableHead>
                    <TableHead>SL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(order.dispensedItems ?? []).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <span
                          className={
                            item.isSubstituted
                              ? "text-muted-foreground line-through"
                              : "font-medium"
                          }
                        >
                          {item.originalMedication}
                        </span>
                      </TableCell>
                      <TableCell>
                        {item.isSubstituted ? (
                          <>
                            <div className="font-medium text-primary">
                              {item.dispensedMedication}
                            </div>
                            <div className="text-[11px] text-primary">
                              → Thay thế tương đương
                            </div>
                          </>
                        ) : (
                          <span className="font-medium">
                            {item.dispensedMedication}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.dosage}
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Substitution reason */}
            {hasSubstitutions && order.substitutionReason && (
              <div className="rounded-lg border border-border p-3 text-sm text-muted-foreground">
                <strong className="text-foreground">Lý do thay thế:</strong>{" "}
                {order.substitutionReason}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onPrintLabels}>
              In nhãn thuốc
            </Button>
            <Button variant="outline" onClick={() => setShowPrint(true)}>
              In đơn thuốc
            </Button>
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
