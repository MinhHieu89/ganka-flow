import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  REQUEST_TYPES,
  type VisitRequest,
  type RequestStatus,
  type SubjectiveRefractionResult,
} from "@/data/mock-patients"

interface TabRequestsProps {
  requests: VisitRequest[]
  onAddRequest: (
    request: Omit<VisitRequest, "id" | "requestedAt" | "status">,
  ) => void
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; bg: string; text: string }
> = {
  pending: {
    label: "Đang chờ",
    bg: "#FAEEDA",
    text: "#854F0B",
  },
  in_progress: {
    label: "Đang thực hiện",
    bg: "#E6F1FB",
    text: "#0C447C",
  },
  completed: {
    label: "Hoàn tất",
    bg: "#EAF3DE",
    text: "#27500A",
  },
  cancelled: {
    label: "Đã hủy",
    bg: "#F1EFE8",
    text: "#444441",
  },
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function SubjectiveRefractionTable({
  data,
}: {
  data: SubjectiveRefractionResult
}) {
  const cols = ["Sph", "Cyl", "Axis", "BCVA", "Add", "PD"] as const
  const colKeys: (keyof SubjectiveRefractionResult["od"])[] = [
    "sph",
    "cyl",
    "axis",
    "bcva",
    "add",
    "pd",
  ]

  const eyes: { label: string; dot: string; key: "od" | "os" }[] = [
    { label: "OD", dot: "#378ADD", key: "od" },
    { label: "OS", dot: "#D85A30", key: "os" },
  ]

  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="w-10 pb-1 text-left font-medium text-muted-foreground" />
            {cols.map((col) => (
              <th
                key={col}
                className="pb-1 pr-3 text-right font-medium text-muted-foreground"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {eyes.map(({ label, dot, key }) => (
            <tr key={key}>
              <td className="py-1 pr-2">
                <span className="flex items-center gap-1 font-medium">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: dot }}
                  />
                  {label}
                </span>
              </td>
              {colKeys.map((colKey) => (
                <td key={colKey} className="py-1 pr-3 text-right tabular-nums">
                  {data[key][colKey] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RequestCard({ request }: { request: VisitRequest }) {
  const config = STATUS_CONFIG[request.status]
  const isCompleted = request.status === "completed"

  const metaParts: string[] = []
  if (request.requestedAt) metaParts.push(`Gửi ${formatTime(request.requestedAt)}`)
  if (isCompleted && request.completedAt)
    metaParts.push(`Hoàn tất ${formatTime(request.completedAt)}`)
  if (request.assignedTo) metaParts.push(request.assignedTo)
  if (request.priority === "urgent") metaParts.push("Khẩn")

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          {/* Status dot */}
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full"
            style={{ backgroundColor: config.text }}
          />
          <div>
            <p className="text-sm font-medium">{request.type}</p>
            {metaParts.length > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {metaParts.join(" · ")}
              </p>
            )}
            {request.notesForTech && (
              <p className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium">Ghi chú:</span>{" "}
                {request.notesForTech}
              </p>
            )}
          </div>
        </div>
        {/* Status badge */}
        <span
          className="shrink-0 rounded px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: config.bg, color: config.text }}
        >
          {config.label}
        </span>
      </div>

      {/* Result display for completed requests */}
      {isCompleted && request.result && (
        <div className="mt-3 border-t border-border pt-3">
          {request.result.type === "subjective_refraction" ? (
            <SubjectiveRefractionTable
              data={request.result.data as SubjectiveRefractionResult}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              {(request.result.data as { conclusion: string }).conclusion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function TabRequests({ requests, onAddRequest }: TabRequestsProps) {
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState("")
  const [priority, setPriority] = useState<"normal" | "urgent">("normal")
  const [notesForTech, setNotesForTech] = useState("")

  function handleSubmit() {
    if (!type) return
    onAddRequest({ type, priority, notesForTech })
    setType("")
    setPriority("normal")
    setNotesForTech("")
    setShowForm(false)
  }

  function handleCancel() {
    setType("")
    setPriority("normal")
    setNotesForTech("")
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium">Yêu cầu</h2>
        <Button
          size="sm"
          className="h-7 bg-[#E6F1FB] px-3 text-xs font-medium text-[#0C447C] transition-colors hover:bg-[#d4e6f7]"
          onClick={() => setShowForm(true)}
        >
          + Tạo yêu cầu
        </Button>
      </div>

      {/* Create Request Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Loại yêu cầu <span className="text-destructive">*</span>
              </label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại yêu cầu" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Ưu tiên
              </label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as "normal" | "urgent")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Bình thường</SelectItem>
                  <SelectItem value="urgent">Khẩn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Ghi chú cho KTV
              </label>
              <Input
                className="h-9"
                value={notesForTech}
                onChange={(e) => setNotesForTech(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              size="sm"
              disabled={!type}
              onClick={handleSubmit}
              className="bg-[#0C447C] text-white transition-colors hover:bg-[#093260] disabled:opacity-50"
            >
              Gửi yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Cards */}
      {requests.length === 0 ? (
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-muted-foreground">Chưa có yêu cầu nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <RequestCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  )
}
