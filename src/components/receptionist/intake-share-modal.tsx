import { useMemo, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Copy01Icon,
  MessageSquareShareIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"

interface IntakeShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientName?: string
  patientId?: string
  visitId?: string
}

export function IntakeShareModal({
  open,
  onOpenChange,
  patientName,
  patientId: _patientId,
  visitId,
}: IntakeShareModalProps) {
  const [copied, setCopied] = useState(false)

  const mockUrl = useMemo(() => {
    const token = (visitId ?? "new")
      .split("")
      .reduce((acc, c) => acc + c.charCodeAt(0), 0)
      .toString(36)
    return `${window.location.origin}/patient/${visitId ?? "unknown"}/history?token=${token}x${Date.now().toString(36).slice(-4)}`
  }, [visitId])

  function handleCopy() {
    navigator.clipboard.writeText(mockUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Gửi phiếu cho bệnh nhân</DialogTitle>
          {patientName && (
            <DialogDescription>
              Bệnh nhân: <strong>{patientName}</strong>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="flex flex-col items-center gap-5 py-2">
          {/* QR Code */}
          <div className="rounded-lg border border-border bg-white p-3">
            <QRCodeSVG value={mockUrl} size={180} level="M" />
          </div>

          {/* Copyable link */}
          <div className="flex w-full items-center gap-2">
            <Input value={mockUrl} readOnly className="text-xs" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="shrink-0"
            >
              <HugeiconsIcon
                icon={Copy01Icon}
                className="mr-1 size-3.5"
                strokeWidth={1.5}
              />
              {copied ? "Đã chép" : "Sao chép"}
            </Button>
          </div>

          {/* Share buttons */}
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1">
              <HugeiconsIcon
                icon={MessageSquareShareIcon}
                className="mr-1.5 size-4"
                strokeWidth={1.5}
              />
              Gửi qua Zalo
            </Button>
            <Button variant="outline" className="flex-1">
              <HugeiconsIcon
                icon={SmartPhone01Icon}
                className="mr-1.5 size-4"
                strokeWidth={1.5}
              />
              Gửi qua SMS
            </Button>
          </div>

          {/* Validity note */}
          <p className="text-xs text-muted-foreground">
            Link có hiệu lực trong 24 giờ
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
