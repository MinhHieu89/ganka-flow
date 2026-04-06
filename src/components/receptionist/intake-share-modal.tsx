import { useState } from "react"
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
}

function MockQrCode() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="rounded-lg border border-border"
    >
      <rect width="180" height="180" fill="white" rx="8" />
      {/* Top-left finder pattern */}
      <rect x="12" y="12" width="42" height="42" rx="4" fill="currentColor" />
      <rect x="18" y="18" width="30" height="30" rx="2" fill="white" />
      <rect x="24" y="24" width="18" height="18" rx="1" fill="currentColor" />
      {/* Top-right finder pattern */}
      <rect x="126" y="12" width="42" height="42" rx="4" fill="currentColor" />
      <rect x="132" y="18" width="30" height="30" rx="2" fill="white" />
      <rect
        x="138"
        y="24"
        width="18"
        height="18"
        rx="1"
        fill="currentColor"
      />
      {/* Bottom-left finder pattern */}
      <rect x="12" y="126" width="42" height="42" rx="4" fill="currentColor" />
      <rect x="18" y="132" width="30" height="30" rx="2" fill="white" />
      <rect
        x="24"
        y="138"
        width="18"
        height="18"
        rx="1"
        fill="currentColor"
      />
      {/* Data modules - scattered blocks to simulate QR data */}
      {[
        [66, 12],
        [78, 12],
        [90, 12],
        [66, 24],
        [102, 24],
        [78, 36],
        [90, 36],
        [114, 36],
        [12, 66],
        [24, 66],
        [48, 66],
        [66, 66],
        [90, 66],
        [114, 66],
        [138, 66],
        [156, 66],
        [12, 78],
        [36, 78],
        [66, 78],
        [78, 78],
        [102, 78],
        [126, 78],
        [150, 78],
        [24, 90],
        [48, 90],
        [78, 90],
        [90, 90],
        [114, 90],
        [138, 90],
        [12, 102],
        [36, 102],
        [66, 102],
        [102, 102],
        [126, 102],
        [156, 102],
        [66, 114],
        [78, 114],
        [90, 114],
        [114, 114],
        [138, 114],
        [78, 126],
        [102, 126],
        [126, 126],
        [150, 126],
        [66, 138],
        [90, 138],
        [114, 138],
        [138, 138],
        [156, 138],
        [78, 150],
        [102, 150],
        [126, 150],
        [138, 150],
        [66, 156],
        [90, 156],
        [114, 156],
        [150, 156],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="10"
          height="10"
          rx="1"
          fill="currentColor"
        />
      ))}
    </svg>
  )
}

export function IntakeShareModal({
  open,
  onOpenChange,
  patientName,
  patientId,
}: IntakeShareModalProps) {
  const [copied, setCopied] = useState(false)

  const mockUrl = `https://ganka28.vn/intake/${patientId ?? "abc123"}`

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
          <div className="text-foreground">
            <MockQrCode />
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
