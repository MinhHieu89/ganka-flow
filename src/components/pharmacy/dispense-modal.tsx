import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { SubstituteMedicationDialog } from "@/components/pharmacy/substitute-medication-dialog"
import type {
  PrescriptionOrder,
  PrescriptionMedication,
  MedicationCatalogItem,
} from "@/data/mock-pharmacy"

interface DispenseModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

function daysUntil(isoDate: string): number {
  const now = new Date()
  const exp = new Date(isoDate)
  return Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

export function DispenseModal({
  order,
  open,
  onClose,
  onConfirm,
}: DispenseModalProps) {
  const [medications, setMedications] = useState<PrescriptionMedication[]>(
    order.medications
  )
  const [substitutionReason, setSubstitutionReason] = useState(
    order.substitutionReason ?? ""
  )
  const [substituteTarget, setSubstituteTarget] =
    useState<PrescriptionMedication | null>(null)

  const hasSubstitutions = medications.some((m) => m.substitution)
  const hasOutOfStock = medications.some(
    (m) => m.isOutOfStock && !m.substitution
  )
  const daysLeft = daysUntil(order.expiresAt)
  const isExpired = daysLeft < 0
  const canConfirm =
    !isExpired && !hasOutOfStock && (!hasSubstitutions || substitutionReason.trim() !== "")

  const handleSubstitute = (
    medId: string,
    replacement: MedicationCatalogItem
  ) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medId
          ? {
              ...m,
              substitution: {
                name: replacement.name,
                group: replacement.group,
                stockQuantity: replacement.stockQuantity,
                unit: replacement.unit,
              },
            }
          : m
      )
    )
    setSubstituteTarget(null)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-h-[85vh] sm:max-w-3xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-medium">
              Phát thuốc — {order.patientName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            {/* Allergy Banner */}
            {order.allergies && order.allergies.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                <span className="text-sm">&#9888;</span>
                <span>
                  Dị ứng: <strong>{order.allergies.join(", ")}</strong>
                </span>
              </div>
            )}

            {/* Prescription Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-muted-foreground">
                  Mã bệnh nhân
                </div>
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
              <div>
                <div className="text-xs text-muted-foreground">
                  Hạn đơn thuốc
                </div>
                <div
                  className={`text-sm font-medium ${isExpired ? "text-red-600" : daysLeft <= 2 ? "text-red-600" : ""}`}
                >
                  {formatDate(order.expiresAt)}{" "}
                  <span className="font-normal text-muted-foreground">
                    {isExpired
                      ? "(Quá hạn)"
                      : `(còn ${daysLeft} ngày)`}
                  </span>
                </div>
              </div>
            </div>

            {/* Doctor Notes */}
            {order.doctorNotes && (
              <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <strong className="text-foreground">Ghi chú BS:</strong>{" "}
                {order.doctorNotes}
              </div>
            )}

            {/* Medication Table */}
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Danh sách thuốc trong đơn
              </div>
              <div className="rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[35%]">Tên thuốc</TableHead>
                      <TableHead>Liều dùng</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead className="w-[80px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow
                        key={med.id}
                        className={
                          med.isOutOfStock && !med.substitution
                            ? "bg-red-50 dark:bg-red-950/20"
                            : ""
                        }
                      >
                        <TableCell>
                          {med.substitution ? (
                            <>
                              <div className="font-medium text-muted-foreground line-through">
                                {med.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
                              {med.isOutOfStock && (
                                <span className="mt-0.5 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                  &#10007; Hết hàng
                                </span>
                              )}
                              <div className="mt-1.5 font-medium text-primary">
                                → {med.substitution.name}
                              </div>
                              <div className="text-xs text-primary">
                                Thay thế tương đương
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">{med.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {med.group}
                              </div>
                              {med.isOutOfStock && (
                                <span className="mt-0.5 inline-block rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
                                  &#10007; Hết hàng
                                </span>
                              )}
                            </>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {med.dosage}
                        </TableCell>
                        <TableCell>
                          {med.quantity} {med.unit}
                        </TableCell>
                        <TableCell>
                          {med.isOutOfStock && !med.substitution && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs text-primary"
                              onClick={() => setSubstituteTarget(med)}
                            >
                              Thay thế
                            </Button>
                          )}
                          {med.substitution && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 text-xs text-primary"
                              onClick={() => setSubstituteTarget(med)}
                            >
                              &#9998; Sửa
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Substitution Reason */}
            {hasSubstitutions && (
              <div>
                <div className="mb-2 text-xs font-medium text-muted-foreground">
                  Lý do thay thế thuốc
                </div>
                <Textarea
                  value={substitutionReason}
                  onChange={(e) => setSubstitutionReason(e.target.value)}
                  placeholder="Nhập lý do thay thế thuốc..."
                  className="min-h-[60px] text-sm"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              In nhãn thuốc
            </Button>
            <Button variant="outline" onClick={onClose}>
              In đơn thuốc
            </Button>
            <Button disabled={!canConfirm} onClick={onConfirm}>
              Xác nhận phát thuốc
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {substituteTarget && (
        <SubstituteMedicationDialog
          medication={substituteTarget}
          open={!!substituteTarget}
          onClose={() => setSubstituteTarget(null)}
          onSelect={(replacement) =>
            handleSubstitute(substituteTarget.id, replacement)
          }
        />
      )}
    </>
  )
}
