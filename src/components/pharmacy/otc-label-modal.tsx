import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { OtcOrder, OtcOrderItem } from "@/data/mock-otc"
import { useClinic } from "@/hooks/use-clinic"

interface OtcLabelModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

function LabelCard({
  item,
  order,
  selectionMode,
  isSelected,
  onToggle,
}: {
  item: OtcOrderItem
  order: OtcOrder
  selectionMode: boolean
  isSelected: boolean
  onToggle: () => void
}) {
  const clinic = useClinic()
  return (
    <div
      className={`relative rounded border border-dashed border-border p-3 ${
        selectionMode && !isSelected ? "opacity-40" : ""
      }`}
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

      {/* Header */}
      <div className="flex items-start justify-between text-sm">
        <span className="font-medium">{item.product.name}</span>
        <span className="text-xs text-muted-foreground">
          {clinic.name} · {formatDate(order.soldAt)}
        </span>
      </div>

      {/* Body */}
      <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
        <div>
          KH: <strong className="text-foreground">{order.customer.name}</strong>
        </div>
        <div>Cách dùng: {item.product.usage}</div>
      </div>

      {/* Footer */}
      <div className="mt-1.5 flex items-end justify-between text-xs text-muted-foreground">
        <span>{order.soldBy}</span>
        <span>
          SL: {item.quantity} {item.product.unit}
        </span>
      </div>
    </div>
  )
}

export function OtcLabelModal({ order, open, onClose }: OtcLabelModalProps) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  if (!order) return null

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

  const handleToggleSelectionMode = () => {
    if (!selectionMode) {
      setSelectedIds(new Set(order.items.map((i) => i.product.id)))
    }
    setSelectionMode(!selectionMode)
  }

  const selectedCount = selectedIds.size
  const allSelected = selectedCount === order.items.length
  const printButtonText =
    selectionMode && !allSelected
      ? `In ${selectedCount} nhãn đã chọn`
      : "In tất cả nhãn"

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            In nhãn thuốc — {order.customer.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground">
            Xem trước nhãn dán. Mỗi nhãn in trên giấy nhãn dán khổ nhỏ (70 ×
            35mm).
          </p>

          <div className="space-y-3">
            {order.items.map((item) => (
              <LabelCard
                key={item.product.id}
                item={item}
                order={order}
                selectionMode={selectionMode}
                isSelected={selectedIds.has(item.product.id)}
                onToggle={() => toggleLabel(item.product.id)}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleToggleSelectionMode}>
            {selectionMode ? "Hủy chọn" : "Chọn nhãn cần in"}
          </Button>
          <Button onClick={() => window.print()}>{printButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
