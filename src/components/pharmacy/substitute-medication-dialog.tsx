import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
  onSelect: (replacement: MedicationCatalogItem) => void
}

export function SubstituteMedicationDialog({
  medication,
  open,
  onClose,
  onSelect,
}: SubstituteMedicationDialogProps) {
  const [search, setSearch] = useState("")

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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Thay thế thuốc
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Chọn thuốc tương đương cho{" "}
            <strong>{medication.name}</strong> (nhóm: {medication.group})
          </p>
        </DialogHeader>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Tìm thuốc..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-h-[240px] space-y-1 overflow-y-auto">
          {results.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Không tìm thấy thuốc phù hợp
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
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
      </DialogContent>
    </Dialog>
  )
}
