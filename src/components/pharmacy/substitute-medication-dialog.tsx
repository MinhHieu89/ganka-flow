import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import {
  medicationCatalog,
  type PrescriptionMedication,
  type MedicationCatalogItem,
} from "@/data/mock-pharmacy"

interface SubstituteMedicationDialogProps {
  medication: PrescriptionMedication
  open: boolean
  onClose: () => void
  onSelect: (replacement: MedicationCatalogItem, reason: string) => void
}

export function SubstituteMedicationDialog({
  medication,
  open,
  onClose,
  onSelect,
}: SubstituteMedicationDialogProps) {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<MedicationCatalogItem | null>(null)
  const [reason, setReason] = useState("")

  const results = useMemo(() => {
    return medicationCatalog
      .filter((item) => item.group === medication.group)
      .filter((item) => item.name !== medication.name)
      .filter((item) => item.stockQuantity > 0)
      .filter((item) => {
        if (!search) return true
        return item.name.toLowerCase().includes(search.toLowerCase())
      })
  }, [medication, search])

  const updateReason = (item: MedicationCatalogItem) => {
    setSelected(item)
    setReason(
      `${medication.name} hết hàng, thay bằng ${item.name} — cùng nhóm ${medication.group}.`
    )
  }

  const canConfirm = selected !== null && reason.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Thay thế thuốc
          </DialogTitle>
        </DialogHeader>

        {/* Info bar */}
        <div className="flex items-center gap-2 rounded-lg bg-muted p-3 text-sm">
          <span>
            Thuốc gốc: <strong>{medication.name}</strong>
          </span>
          <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">
            Hết hàng
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Tìm thuốc thay thế..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Results list */}
        <div className="max-h-[200px] space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy thuốc phù hợp
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => updateReason(item)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  selected?.id === item.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.group}
                  </div>
                </div>
                <span className="text-xs text-emerald-600">
                  {item.stockQuantity} {item.unit}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Reason textarea */}
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">
            Lý do thay thế <span className="text-red-500">*</span>
          </div>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Nhập lý do thay thế thuốc..."
            className="min-h-[60px] text-sm"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            disabled={!canConfirm}
            onClick={() => selected && onSelect(selected, reason)}
          >
            Xác nhận thay thế
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
