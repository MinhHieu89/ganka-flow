import { Button } from "@/components/ui/button"

interface ConfirmationBarProps {
  patientName: string | null
  date: string | null
  time: string | null
  reason: string | null
  doctorName: string | null
  onCancel: () => void
  onConfirm: () => void
}

function formatDateVi(dateStr: string): string {
  const [y, m, d] = dateStr.split("-")
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  const days = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"]
  return `${days[date.getDay()]}, ${d}/${m}/${y}`
}

export function ConfirmationBar({
  patientName,
  date,
  time,
  reason,
  doctorName,
  onCancel,
  onConfirm,
}: ConfirmationBarProps) {
  if (!date || !time) return null

  const warnings: string[] = []
  if (!reason) warnings.push("Chưa nhập lý do")
  if (!doctorName) warnings.push("Không chỉ định BS")

  return (
    <div className="flex items-center justify-between rounded-lg border border-purple-200 bg-purple-50 px-5 py-4 dark:border-purple-900 dark:bg-purple-950/30">
      <div>
        <div className="text-sm font-semibold text-purple-700 dark:text-purple-400">
          Xác nhận lịch hẹn
        </div>
        <div className="mt-0.5 text-sm">
          {patientName || "..."} — {formatDateVi(date)} lúc {time}
        </div>
        {warnings.length > 0 && (
          <div className="mt-0.5 text-xs text-muted-foreground">
            {warnings.join(" — ")}
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={onConfirm}
        >
          Xác nhận lịch hẹn
        </Button>
      </div>
    </div>
  )
}
