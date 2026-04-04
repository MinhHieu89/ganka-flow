import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { OpticalOrder } from "@/data/mock-optical"

export interface DeliveryData {
  method: "pickup" | "shipping"
  receiver: string
  address?: string
  carrier?: string
  notes?: string
}

interface DeliveryConfirmModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder | null
  onConfirm: (data: DeliveryData) => void
}

interface RadioCardProps {
  selected: boolean
  onClick: () => void
  label: string
}

function RadioCard({ selected, onClick, label }: RadioCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
        selected
          ? "border-teal-600 bg-teal-50 dark:bg-teal-950/30"
          : "border-border bg-background hover:bg-muted/50"
      )}
      style={selected ? { borderWidth: "1.5px" } : undefined}
    >
      {/* Radio circle */}
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-teal-600" : "border-muted-foreground/40"
        )}
      >
        {selected && (
          <span className="size-2 rounded-full bg-teal-600" />
        )}
      </span>
      <span className={cn("font-medium", selected && "text-teal-700 dark:text-teal-300")}>
        {label}
      </span>
    </button>
  )
}

const carrierOptions = [
  "Grab",
  "GHTK",
  "GHN",
  "Bee / Xanh SM",
  "Tự giao",
]

export function DeliveryConfirmModal({
  open,
  onClose,
  order,
  onConfirm,
}: DeliveryConfirmModalProps) {
  const [method, setMethod] = useState<"pickup" | "shipping">("pickup")
  const [receiver, setReceiver] = useState("")
  const [address, setAddress] = useState("")
  const [carrier, setCarrier] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset state when dialog opens
  useEffect(() => {
    if (open && order) {
      setMethod("pickup")
      setReceiver(order.patientName)
      setAddress("")
      setCarrier("")
      setNotes("")
      setErrors({})
    }
  }, [open, order])

  if (!order) return null

  function validate(): boolean {
    const newErrors: Record<string, string> = {}

    if (!receiver.trim()) {
      newErrors.receiver = "Vui lòng nhập người nhận"
    }

    if (method === "shipping") {
      if (!address.trim()) {
        newErrors.address = "Vui lòng nhập địa chỉ giao hàng"
      }
      if (!carrier) {
        newErrors.carrier = "Vui lòng chọn đơn vị vận chuyển"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleConfirm() {
    if (!validate()) return

    const data: DeliveryData = {
      method,
      receiver: receiver.trim(),
      notes: notes.trim() || undefined,
    }

    if (method === "shipping") {
      data.address = address.trim()
      data.carrier = carrier
    }

    onConfirm(data)
    onClose()
  }

  function handleCancel() {
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Xác nhận giao kính</DialogTitle>
        </DialogHeader>

        {/* Order info */}
        <div className="border-b pb-3">
          <p className="text-sm font-medium">{order.patientName}</p>
          <p className="text-muted-foreground text-xs">
            {order.id} &middot; {order.frameName} &middot; {order.lensName}
          </p>
        </div>

        {/* Delivery method */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Hình thức giao
          </p>
          <div className="flex flex-col gap-2">
            <RadioCard
              selected={method === "pickup"}
              onClick={() => setMethod("pickup")}
              label="Nhận tại phòng khám"
            />
            <RadioCard
              selected={method === "shipping"}
              onClick={() => setMethod("shipping")}
              label="Giao hàng (ship)"
            />
          </div>
        </div>

        {/* Shipping fields (conditional) */}
        {method === "shipping" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="delivery-address">
                Địa chỉ giao hàng <span className="text-destructive">*</span>
              </Label>
              <Input
                id="delivery-address"
                placeholder="Nhập địa chỉ giao hàng..."
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  if (errors.address) setErrors((prev) => ({ ...prev, address: "" }))
                }}
              />
              {errors.address && (
                <p className="text-destructive text-xs">{errors.address}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery-carrier">
                Đơn vị vận chuyển <span className="text-destructive">*</span>
              </Label>
              <Select
                value={carrier}
                onValueChange={(v) => {
                  setCarrier(v)
                  if (errors.carrier) setErrors((prev) => ({ ...prev, carrier: "" }))
                }}
              >
                <SelectTrigger id="delivery-carrier">
                  <SelectValue placeholder="Chọn đơn vị vận chuyển" />
                </SelectTrigger>
                <SelectContent>
                  {carrierOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.carrier && (
                <p className="text-destructive text-xs">{errors.carrier}</p>
              )}
            </div>
          </div>
        )}

        {/* Common fields */}
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="delivery-receiver">
              Người nhận <span className="text-destructive">*</span>
            </Label>
            <Input
              id="delivery-receiver"
              value={receiver}
              onChange={(e) => {
                setReceiver(e.target.value)
                if (errors.receiver) setErrors((prev) => ({ ...prev, receiver: "" }))
              }}
            />
            {errors.receiver && (
              <p className="text-destructive text-xs">{errors.receiver}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="delivery-notes">Ghi chú giao hàng</Label>
            <Textarea
              id="delivery-notes"
              placeholder="Ghi chú thêm (tùy chọn)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Xác nhận giao kính</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
