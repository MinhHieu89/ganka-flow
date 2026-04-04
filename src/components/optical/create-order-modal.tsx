import { useCallback, useRef, useState } from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import {
  type FrameItem,
  type LensItem,
  type OpticalConsultation,
  formatPrice,
} from "@/data/mock-optical"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// ─── Exported types ─────────────────────────────────────────────────────────

export interface NewOpticalOrder {
  consultationId: string
  frameBarcode: string
  lensCode: string
  notes?: string
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation | null
  frames: FrameItem[]
  lenses: LensItem[]
  onSubmit: (order: NewOpticalOrder) => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function formatSph(val: number): string {
  const sign = val >= 0 ? "+" : ""
  return `${sign}${val.toFixed(2)}`
}

// ─── Generic ProductSearch ──────────────────────────────────────────────────

interface ProductSearchProps<T> {
  items: T[]
  selected: T | null
  onSelect: (item: T) => void
  onClear: () => void
  label: string
  placeholder: string
  getSearchableFields: (item: T) => string[]
  renderItem: (item: T) => React.ReactNode
  renderSelected: (item: T) => React.ReactNode
  getStock: (item: T) => number
}

function ProductSearch<T>({
  items,
  selected,
  onSelect,
  onClear,
  label,
  placeholder,
  getSearchableFields,
  renderItem,
  renderSelected,
  getStock,
}: ProductSearchProps<T>) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const blurTimeout = useRef<ReturnType<typeof setTimeout>>(null)

  const filtered = items.filter((item) => {
    if (getStock(item) === 0) return false
    if (!query.trim()) return true
    const normalizedQuery = removeDiacritics(query.toLowerCase())
    return getSearchableFields(item).some((field) =>
      removeDiacritics(field.toLowerCase()).includes(normalizedQuery)
    )
  })

  const handleFocus = () => {
    setShowDropdown(true)
  }

  const handleBlur = () => {
    blurTimeout.current = setTimeout(() => {
      setShowDropdown(false)
    }, 200)
  }

  const handleSelect = (item: T) => {
    onSelect(item)
    setQuery("")
    setShowDropdown(false)
    if (blurTimeout.current) clearTimeout(blurTimeout.current)
  }

  if (selected) {
    return (
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {renderSelected(selected)}
      </div>
    )
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          strokeWidth={2}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="pl-8"
        />
        {showDropdown && (
          <div className="absolute top-full right-0 left-0 z-10 mt-1 max-h-72 overflow-y-auto rounded-md border bg-popover shadow-md">
            {filtered.length === 0 ? (
              <p className="p-3 text-center text-sm text-muted-foreground">
                Không tìm thấy sản phẩm
              </p>
            ) : (
              filtered.slice(0, 8).map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className="flex w-full items-start justify-between px-3 py-2 text-left hover:bg-accent"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                >
                  {renderItem(item)}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SelectedCard ───────────────────────────────────────────────────────────

interface SelectedCardProps {
  name: string
  description: React.ReactNode
  price: number
  onClear: () => void
}

function SelectedCard({ name, description, price, onClear }: SelectedCardProps) {
  return (
    <div className="flex items-start justify-between rounded-md border border-teal-600 bg-teal-50 p-3 dark:border-teal-500 dark:bg-teal-950/30">
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium">{name}</p>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-medium">{formatPrice(price)}đ</span>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={onClear}>
          Đổi
        </Button>
      </div>
    </div>
  )
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export function CreateOrderModal({
  open,
  onClose,
  consultation,
  frames,
  lenses,
  onSubmit,
}: CreateOrderModalProps) {
  const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(null)
  const [selectedLens, setSelectedLens] = useState<LensItem | null>(null)
  const [notes, setNotes] = useState("")
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)

  const hasSelection = selectedFrame !== null || selectedLens !== null

  const resetState = useCallback(() => {
    setSelectedFrame(null)
    setSelectedLens(null)
    setNotes("")
    setShowUnsavedDialog(false)
  }, [])

  const handleClose = useCallback(() => {
    if (hasSelection) {
      setShowUnsavedDialog(true)
    } else {
      resetState()
      onClose()
    }
  }, [hasSelection, onClose, resetState])

  const handleConfirmClose = useCallback(() => {
    resetState()
    onClose()
  }, [onClose, resetState])

  const handleSubmit = useCallback(() => {
    if (!consultation || !selectedFrame || !selectedLens) return
    if (selectedFrame.stock <= 0 || selectedLens.stock <= 0) return

    onSubmit({
      consultationId: consultation.id,
      frameBarcode: selectedFrame.barcode,
      lensCode: selectedLens.code,
      notes: notes.trim() || undefined,
    })
    resetState()
  }, [consultation, selectedFrame, selectedLens, notes, onSubmit, resetState])

  if (!consultation) return null

  const { rx } = consultation
  const total =
    selectedFrame && selectedLens
      ? selectedFrame.price + selectedLens.price
      : null

  return (
    <>
      <Dialog
        open={open && !showUnsavedDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleClose()
        }}
      >
        <DialogContent className="sm:max-w-[640px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              Tạo đơn kính &mdash; {consultation.patientName}
            </DialogTitle>
          </DialogHeader>

          {/* Rx summary */}
          <div className="rounded-md bg-muted px-3 py-2">
            <code className="text-xs leading-relaxed">
              Rx: OD {formatSph(rx.od.sph)} / {rx.od.cyl.toFixed(2)} x{" "}
              {rx.od.axis} | OS {formatSph(rx.os.sph)} /{" "}
              {rx.os.cyl.toFixed(2)} x {rx.os.axis} | PD {rx.pd}
            </code>
          </div>

          {/* Frame search */}
          <ProductSearch<FrameItem>
            items={frames}
            selected={selectedFrame}
            onSelect={setSelectedFrame}
            onClear={() => setSelectedFrame(null)}
            label="Gọng kính"
            placeholder="Tìm gọng theo tên, thương hiệu, barcode..."
            getSearchableFields={(f) => [f.name, f.brand, f.barcode, f.color]}
            getStock={(f) => f.stock}
            renderItem={(f) => (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">
                    {f.brand} {f.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {f.color}{" "}
                    <span className="font-mono text-muted-foreground/70">
                      {f.barcode}
                    </span>{" "}
                    <span
                      className={cn(
                        "font-medium",
                        f.stock > 3 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      SL: {f.stock}
                    </span>
                  </p>
                </div>
                <span className="ml-2 shrink-0 text-sm">
                  {formatPrice(f.price)}đ
                </span>
              </>
            )}
            renderSelected={(f) => (
              <SelectedCard
                name={`${f.brand} ${f.name}`}
                description={
                  <span>
                    {f.color}{" "}
                    <span className="font-mono text-muted-foreground/70">
                      {f.barcode}
                    </span>
                  </span>
                }
                price={f.price}
                onClear={() => setSelectedFrame(null)}
              />
            )}
          />

          {/* Lens search */}
          <ProductSearch<LensItem>
            items={lenses}
            selected={selectedLens}
            onSelect={setSelectedLens}
            onClear={() => setSelectedLens(null)}
            label="Tròng kính"
            placeholder="Tìm tròng theo tên, thương hiệu, chiết suất..."
            getSearchableFields={(l) => [
              l.name,
              l.brand,
              l.refractiveIndex,
              l.type,
            ]}
            getStock={(l) => l.stock}
            renderItem={(l) => (
              <>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium">
                    {l.brand} {l.name}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {l.type}{" "}
                    <span className="font-mono text-muted-foreground/70">
                      {l.refractiveIndex}
                    </span>{" "}
                    <span
                      className={cn(
                        "font-medium",
                        l.stock > 5 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      SL: {l.stock}
                    </span>
                  </p>
                </div>
                <span className="ml-2 shrink-0 text-sm">
                  {formatPrice(l.price)}đ
                </span>
              </>
            )}
            renderSelected={(l) => (
              <SelectedCard
                name={`${l.brand} ${l.name}`}
                description={
                  <span>
                    {l.type}{" "}
                    <span className="font-mono text-muted-foreground/70">
                      {l.refractiveIndex}
                    </span>
                  </span>
                }
                price={l.price}
                onClear={() => setSelectedLens(null)}
              />
            )}
          />

          {/* Order summary */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Gọng</span>
              <span>
                {selectedFrame ? (
                  <>
                    {selectedFrame.brand} {selectedFrame.name} &mdash;{" "}
                    {formatPrice(selectedFrame.price)}đ
                  </>
                ) : (
                  <>
                    <span className="italic text-muted-foreground">
                      chưa chọn
                    </span>{" "}
                    &mdash; —
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tròng</span>
              <span>
                {selectedLens ? (
                  <>
                    {selectedLens.brand} {selectedLens.name} &mdash;{" "}
                    {formatPrice(selectedLens.price)}đ
                  </>
                ) : (
                  <>
                    <span className="italic text-muted-foreground">
                      chưa chọn
                    </span>{" "}
                    &mdash; —
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between border-t-2 border-foreground pt-2 text-[15px] font-medium">
              <span>Tổng cộng</span>
              <span>{total !== null ? `${formatPrice(total)}đ` : "—"}</span>
            </div>
          </div>

          {/* Notes */}
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ghi chú thêm cho đơn kính (tùy chọn)..."
            className="min-h-20"
          />

          {/* Footer */}
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              disabled={!selectedFrame || !selectedLens}
              onClick={handleSubmit}
            >
              Tạo đơn kính
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unsaved changes confirmation */}
      <Dialog
        open={showUnsavedDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) setShowUnsavedDialog(false)
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Bạn có chắc muốn đóng?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Dữ liệu chưa lưu sẽ bị mất.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnsavedDialog(false)}
            >
              Tiếp tục chỉnh sửa
            </Button>
            <Button onClick={handleConfirmClose}>Đóng không lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
