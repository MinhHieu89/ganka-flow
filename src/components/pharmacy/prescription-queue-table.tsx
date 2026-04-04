import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  MedicineBottle02Icon,
  File02Icon,
  PrinterIcon,
  LabelIcon,
  FileSearchIcon,
} from "@hugeicons/core-free-icons"
import { DispenseModal } from "@/components/pharmacy/dispense-modal"
import { ViewPrescriptionModal } from "@/components/pharmacy/view-prescription-modal"
import { DispenseDetailModal } from "@/components/pharmacy/dispense-detail-modal"
import { PrintLabelsModal } from "@/components/pharmacy/print-labels-modal"
import type {
  PrescriptionOrder,
  PrescriptionMedication,
} from "@/data/mock-pharmacy"

type OpenModal =
  | { type: "dispense"; order: PrescriptionOrder }
  | { type: "view"; order: PrescriptionOrder }
  | { type: "detail"; order: PrescriptionOrder }
  | null

function formatElapsed(isoDate: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000)
  if (diff < 60) return `${diff} phút trước`
  if (diff < 120) return `1h${String(diff - 60).padStart(2, "0")} phút trước`
  return `${Math.floor(diff / 60)}h trước`
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

interface PrescriptionQueueTableProps {
  prescriptions: PrescriptionOrder[]
  onDispense: (
    orderId: string,
    finalMedications?: PrescriptionMedication[]
  ) => void
}

export function PrescriptionQueueTable({
  prescriptions,
  onDispense,
}: PrescriptionQueueTableProps) {
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const [labelsOrder, setLabelsOrder] = useState<PrescriptionOrder | null>(null)

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bệnh nhân</TableHead>
              <TableHead>BS kê đơn</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Số thuốc</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {prescriptions.map((rx) => (
              <TableRow
                key={rx.id}
                className={
                  rx.allergies && rx.allergies.length > 0
                    ? "bg-amber-50 dark:bg-amber-950/20"
                    : ""
                }
              >
                <TableCell>
                  <div className="font-medium">
                    {rx.patientName}
                    {rx.allergies && rx.allergies.length > 0 && (
                      <span
                        className="ml-1 text-amber-500"
                        title={`Dị ứng: ${rx.allergies.join(", ")}`}
                      >
                        &#9888;
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {rx.patientId}
                  </div>
                </TableCell>
                <TableCell>{rx.doctorName}</TableCell>
                <TableCell>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(rx.prescribedAt)}
                  </div>
                  {rx.status === "pending" && (
                    <div className="text-[11px] text-muted-foreground/70">
                      {formatElapsed(rx.prescribedAt)}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {rx.medications.length} thuốc
                  </span>
                </TableCell>
                <TableCell>
                  {rx.status === "pending" ? (
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
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <HugeiconsIcon
                          icon={MoreVerticalIcon}
                          className="size-4"
                          strokeWidth={2}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-48">
                      {rx.status === "pending" ? (
                        <>
                          <DropdownMenuItem
                            className="text-primary"
                            onClick={() =>
                              setOpenModal({ type: "dispense", order: rx })
                            }
                          >
                            <HugeiconsIcon
                              icon={MedicineBottle02Icon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            Phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "view", order: rx })
                            }
                          >
                            <HugeiconsIcon
                              icon={File02Icon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <HugeiconsIcon
                              icon={PrinterIcon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            In đơn thuốc
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "view", order: rx })
                            }
                          >
                            <HugeiconsIcon
                              icon={File02Icon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            Xem đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setOpenModal({ type: "detail", order: rx })
                            }
                          >
                            <HugeiconsIcon
                              icon={FileSearchIcon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            Xem chi tiết phát thuốc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <HugeiconsIcon
                              icon={PrinterIcon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            In đơn thuốc
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <HugeiconsIcon
                              icon={LabelIcon}
                              className="size-4"
                              strokeWidth={1.5}
                            />
                            In nhãn thuốc
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dispense modal */}
      {openModal?.type === "dispense" && (
        <DispenseModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onConfirm={(finalMedications) => {
            onDispense(openModal.order.id, finalMedications)
            setOpenModal(null)
          }}
        />
      )}

      {/* View prescription modal */}
      {openModal?.type === "view" && (
        <ViewPrescriptionModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onDispense={() =>
            setOpenModal({ type: "dispense", order: openModal.order })
          }
        />
      )}

      {/* Dispense detail modal */}
      {openModal?.type === "detail" && (
        <DispenseDetailModal
          order={openModal.order}
          open
          onClose={() => setOpenModal(null)}
          onPrintLabels={() => setLabelsOrder(openModal.order)}
        />
      )}

      {/* Print labels sub-modal (opened from detail modal) */}
      {labelsOrder && (
        <PrintLabelsModal
          order={labelsOrder}
          open={!!labelsOrder}
          onClose={() => setLabelsOrder(null)}
        />
      )}
    </>
  )
}
