import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type {
  PrescriptionOrder,
  PrescriptionMedication,
} from "@/data/mock-pharmacy"

interface PrintLabelsModalProps {
  order: PrescriptionOrder
  open: boolean
  onClose: () => void
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
}

function LabelCard({
  med,
  order,
  actualSize,
  selectionMode,
  isSelected,
  onToggle,
}: {
  med: PrescriptionMedication
  order: PrescriptionOrder
  actualSize: boolean
  selectionMode: boolean
  isSelected: boolean
  onToggle: () => void
}) {
  const dispenseDate = order.dispensedAt
    ? formatDate(order.dispensedAt)
    : formatDate(new Date().toISOString())

  const isSubstituted = !!med.substitution

  return (
    <div
      className={`relative rounded border border-dashed border-border p-3 ${
        selectionMode && !isSelected ? "opacity-40" : ""
      } ${actualSize ? "h-[35mm] w-[70mm] p-2 text-[8px]" : ""}`}
      onClick={selectionMode ? onToggle : undefined}
      role={selectionMode ? "checkbox" : undefined}
      aria-checked={selectionMode ? isSelected : undefined}
    >
      {selectionMode && (
        <div
          className={`absolute top-2 right-2 flex size-4 items-center justify-center rounded border text-xs ${
            isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          }`}
        >
          {isSelected && "\u2713"}
        </div>
      )}

      {/* Header row */}
      <div
        className={`flex items-start justify-between ${actualSize ? "text-[8px]" : "text-sm"}`}
      >
        <span className={`font-medium ${isSubstituted ? "text-primary" : ""}`}>
          {isSubstituted ? med.substitution!.name : med.name}
          {isSubstituted && (
            <span className="font-normal"> (thay {med.name})</span>
          )}
        </span>
        <span
          className={`text-muted-foreground ${actualSize ? "text-[7px]" : "text-xs"}`}
        >
          PK Ganka28 · {dispenseDate}
        </span>
      </div>

      {/* Body */}
      <div
        className={`mt-1 space-y-0.5 ${actualSize ? "text-[7px]" : "text-xs"} text-muted-foreground`}
      >
        <div>
          BN: <strong className="text-foreground">{order.patientName}</strong> —{" "}
          {order.patientId}
        </div>
        <div>Cách dùng: {med.dosage}</div>
      </div>

      {/* Footer row */}
      <div
        className={`mt-1.5 flex items-end justify-between ${actualSize ? "text-[7px]" : "text-xs"} text-muted-foreground`}
      >
        <span>{order.doctorName}</span>
        <span>
          SL: {med.quantity} {med.unit}
        </span>
      </div>
    </div>
  )
}

export function PrintLabelsModal({
  order,
  open,
  onClose,
}: PrintLabelsModalProps) {
  const [actualSize, setActualSize] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(order.medications.map((m) => m.id))
  )

  const toggleLabel = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectedCount = selectedIds.size
  const allSelected = selectedCount === order.medications.length
  const printButtonText =
    selectionMode && !allSelected
      ? `In ${selectedCount} nhãn đã chọn`
      : "In tất cả nhãn"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            In nhãn thuốc — {order.patientName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Description */}
          <p className="text-xs text-muted-foreground">
            Xem trước nhãn dán cho từng thuốc. Mỗi nhãn sẽ in trên giấy nhãn dán
            khổ nhỏ (70 × 35mm).
          </p>

          {/* Size toggle */}
          <div className="flex gap-1">
            <button
              onClick={() => setActualSize(false)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                !actualSize
                  ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              Xem phóng to
            </button>
            <button
              onClick={() => setActualSize(true)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                actualSize
                  ? "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                  : "border-border text-muted-foreground hover:border-muted-foreground/30"
              }`}
            >
              Kích thước thật
            </button>
          </div>

          {/* Label cards */}
          <div className="space-y-3">
            {order.medications.map((med) => (
              <LabelCard
                key={med.id}
                med={med}
                order={order}
                actualSize={actualSize}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(med.id)}
                onToggle={() => toggleLabel(med.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setSelectionMode(!selectionMode)
              if (!selectionMode) {
                setSelectedIds(new Set(order.medications.map((m) => m.id)))
              }
            }}
          >
            {selectionMode ? "Hủy chọn" : "Chọn nhãn cần in"}
          </Button>
          <Button>{printButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
