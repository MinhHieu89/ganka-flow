import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FrameDetail, LensDetail } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

// ─── Types ──────────────────────────────────────────────────────────────────

interface InventoryDetailDrawerProps {
  open: boolean
  onClose: () => void
  item: FrameDetail | LensDetail | null
  type: "frame" | "lens"
  onSave: (updates: Record<string, unknown>) => void
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function isFrame(
  item: FrameDetail | LensDetail,
  type: "frame" | "lens"
): item is FrameDetail {
  return type === "frame"
}

function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted px-3 py-2.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-[13px] font-medium">{value}</div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────

export function InventoryDetailDrawer({
  open,
  onClose,
  item,
  type,
  onSave,
}: InventoryDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editPrice, setEditPrice] = useState("")
  const [editField1, setEditField1] = useState("")
  const [editField2, setEditField2] = useState("")
  const [editOrigin, setEditOrigin] = useState("")
  const [editThreshold, setEditThreshold] = useState("")

  useEffect(() => {
    if (!item) return
    if (isFrame(item, type)) {
      setEditPrice(String(item.price))
      setEditField1(item.color)
      setEditField2(item.material)
      setEditOrigin(item.origin)
      setEditThreshold(String(item.lowStockThreshold))
    } else {
      const lens = item as LensDetail
      setEditPrice(String(lens.price))
      setEditField1(lens.coating)
      setEditField2(lens.design)
      setEditOrigin(lens.origin)
      setEditThreshold(String(lens.lowStockThreshold))
    }
    setIsEditing(false)
  }, [item, type])

  if (!item) return null

  const frame = isFrame(item, type) ? item : null
  const lens = !frame ? (item as LensDetail) : null

  const margin =
    item.price > 0
      ? Math.round(((item.price - item.costPrice) / item.price) * 100)
      : 0
  const marginAmount = item.price - item.costPrice
  const isLowStock = item.stock <= item.lowStockThreshold

  const handleSave = () => {
    const price = Number(editPrice)
    const threshold = Number(editThreshold)
    if (price <= 0 || threshold < 0) return

    const updates: Record<string, unknown> = {
      price,
      origin: editOrigin,
      lowStockThreshold: threshold,
    }
    if (frame) {
      updates.color = editField1
      updates.material = editField2
    } else {
      updates.coating = editField1
      updates.design = editField2
    }
    onSave(updates)
    setIsEditing(false)
  }

  const barcode = frame ? item.barcode : (item as LensDetail).code
  const subtitle = frame
    ? `${frame.color} - ${frame.material}`
    : `${lens!.type} - ${lens!.refractiveIndex}`
  const imagePlaceholder = frame
    ? "Hình ảnh gọng kính"
    : "Hình ảnh tròng kính"

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-[480px]"
      >
        <SheetHeader>
          <SheetTitle>
            {isEditing ? "Chỉnh sửa sản phẩm" : "Chi tiết sản phẩm"}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Image placeholder */}
          <div className="flex h-[140px] items-center justify-center rounded-lg border-2 border-dashed bg-muted text-[13px] text-muted-foreground">
            {imagePlaceholder}
          </div>

          {isEditing ? (
            <EditMode
              item={item}
              type={type}
              barcode={barcode}
              editPrice={editPrice}
              setEditPrice={setEditPrice}
              editField1={editField1}
              setEditField1={setEditField1}
              editField2={editField2}
              setEditField2={setEditField2}
              editOrigin={editOrigin}
              setEditOrigin={setEditOrigin}
              editThreshold={editThreshold}
              setEditThreshold={setEditThreshold}
              isFrame={!!frame}
            />
          ) : (
            <ViewMode
              item={item}
              type={type}
              frame={frame}
              lens={lens}
              subtitle={subtitle}
              barcode={barcode}
              margin={margin}
              marginAmount={marginAmount}
              isLowStock={isLowStock}
            />
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t pt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave}>Lưu thay đổi</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
              <Button onClick={() => setIsEditing(true)}>Chỉnh sửa</Button>
            </>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── View Mode ──────────────────────────────────────────────────────────────

function ViewMode({
  item,
  type,
  frame,
  lens,
  subtitle,
  barcode,
  margin,
  marginAmount,
  isLowStock,
}: {
  item: FrameDetail | LensDetail
  type: "frame" | "lens"
  frame: FrameDetail | null
  lens: LensDetail | null
  subtitle: string
  barcode: string
  margin: number
  marginAmount: number
  isLowStock: boolean
}) {
  return (
    <>
      {/* Main info */}
      <div className="mt-4">
        <div className="text-base font-medium">{item.name}</div>
        <div className="text-[13px] text-muted-foreground">{subtitle}</div>
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
          {barcode}
        </div>
      </div>

      {/* Specs grid */}
      <div className="mt-5">
        <div className="mb-2 text-[13px] font-medium text-muted-foreground">
          Thông số
        </div>
        <div className="grid grid-cols-2 gap-2">
          {frame ? (
            <>
              <SpecCard label="Thương hiệu" value={frame.brand} />
              <SpecCard label="Màu sắc" value={frame.color} />
              <SpecCard label="Chất liệu" value={frame.material} />
              <SpecCard label="Kích thước" value={frame.size} />
              <SpecCard label="Giới tính" value={frame.gender} />
              <SpecCard label="Xuất xứ" value={frame.origin} />
            </>
          ) : (
            <>
              <SpecCard label="Thương hiệu" value={lens!.brand} />
              <SpecCard label="Chiết suất" value={lens!.refractiveIndex} />
              <SpecCard label="Loại" value={lens!.type} />
              <SpecCard label="Lớp phủ" value={lens!.coating} />
              <SpecCard label="Thiết kế" value={lens!.design} />
              <SpecCard label="Xuất xứ" value={lens!.origin} />
            </>
          )}
        </div>
      </div>

      {/* Price & stock */}
      <div className="mt-5">
        <div className="mb-2 text-[13px] font-medium text-muted-foreground">
          Giá & tồn kho
        </div>
        <div className="space-y-1.5">
          <PriceRow label="Giá nhập" value={formatPrice(item.costPrice)} />
          <PriceRow
            label="Giá bán"
            value={formatPrice(item.price)}
            valueClassName="font-medium"
          />
          <PriceRow
            label="Lãi gộp"
            value={`${formatPrice(marginAmount)} (${margin}%)`}
            valueClassName="text-emerald-600"
          />
          <PriceRow
            label="Tồn kho"
            value={String(item.stock)}
            valueClassName={isLowStock ? "text-red-600" : "text-emerald-600"}
          />
          <PriceRow
            label="Ngưỡng cảnh báo"
            value={String(item.lowStockThreshold)}
          />
        </div>
      </div>

      {/* Stock history */}
      <div className="mt-5">
        <div className="mb-2 text-[13px] font-medium text-muted-foreground">
          Lịch sử xuất/nhập gần đây
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Ngày</TableHead>
              <TableHead className="w-[50px]">Loại</TableHead>
              <TableHead className="w-[40px] text-right">SL</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {item.stockHistory.slice(0, 5).map((entry, i) => {
              const dateStr = entry.date.split("-")
              const ddmm = `${dateStr[2]}/${dateStr[1]}`
              const isIn = entry.type === "in"
              const qty = isIn ? `+${entry.quantity}` : `-${entry.quantity}`
              const isDkNote = entry.note.startsWith("DK-")

              return (
                <TableRow key={i}>
                  <TableCell className="text-xs">{ddmm}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isIn ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {isIn ? "Nhập" : "Xuất"}
                    </span>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right text-xs",
                      isIn ? "text-emerald-600" : "text-red-600"
                    )}
                  >
                    {qty}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-xs",
                      isDkNote && "font-mono"
                    )}
                  >
                    {entry.note}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

function PriceRow({
  label,
  value,
  valueClassName,
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] text-[13px]">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClassName}>{value}</span>
    </div>
  )
}

// ─── Edit Mode ──────────────────────────────────────────────────────────────

function EditMode({
  item,
  barcode,
  editPrice,
  setEditPrice,
  editField1,
  setEditField1,
  editField2,
  setEditField2,
  editOrigin,
  setEditOrigin,
  editThreshold,
  setEditThreshold,
  isFrame: isFrameType,
}: {
  item: FrameDetail | LensDetail
  type: "frame" | "lens"
  barcode: string
  editPrice: string
  setEditPrice: (v: string) => void
  editField1: string
  setEditField1: (v: string) => void
  editField2: string
  setEditField2: (v: string) => void
  editOrigin: string
  setEditOrigin: (v: string) => void
  editThreshold: string
  setEditThreshold: (v: string) => void
  isFrame: boolean
}) {
  return (
    <>
      {/* Main info (read-only) */}
      <div className="mt-4">
        <div className="text-base font-medium">{item.name}</div>
        <div className="text-[13px] text-muted-foreground">
          Thương hiệu và tên không thể chỉnh sửa
        </div>
        <div className="mt-0.5 font-mono text-xs text-muted-foreground">
          {barcode}
        </div>
      </div>

      {/* Editable fields */}
      <div className="mt-5">
        <div className="mb-3 text-[13px] font-medium text-muted-foreground">
          Chỉnh sửa
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-price">Giá bán</Label>
            <Input
              id="edit-price"
              type="number"
              min={1}
              required
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-field1">
              {isFrameType ? "Màu sắc" : "Lớp phủ"}
            </Label>
            <Input
              id="edit-field1"
              value={editField1}
              onChange={(e) => setEditField1(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-field2">
              {isFrameType ? "Chất liệu" : "Thiết kế"}
            </Label>
            <Input
              id="edit-field2"
              value={editField2}
              onChange={(e) => setEditField2(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-origin">Xuất xứ</Label>
            <Input
              id="edit-origin"
              value={editOrigin}
              onChange={(e) => setEditOrigin(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-threshold">Ngưỡng cảnh báo</Label>
            <Input
              id="edit-threshold"
              type="number"
              min={0}
              required
              value={editThreshold}
              onChange={(e) => setEditThreshold(e.target.value)}
            />
          </div>
        </div>
      </div>
    </>
  )
}
