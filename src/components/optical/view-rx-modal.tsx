import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { OpticalConsultation, RxEye } from "@/data/mock-optical"

interface ViewRxModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation | null
  onCreateOrder?: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, "0")
  const min = String(d.getMinutes()).padStart(2, "0")
  return `${dd}/${mm}/${yyyy}, ${hh}:${min}`
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

function formatSph(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

function formatCyl(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}`
}

function formatAxis(value: number): string {
  return `${value}°`
}

function formatAdd(eye: RxEye): string {
  if (eye.add == null) return "\u2014"
  const sign = eye.add >= 0 ? "+" : ""
  return `${sign}${eye.add.toFixed(2)}`
}

export function ViewRxModal({
  open,
  onClose,
  consultation,
  onCreateOrder,
}: ViewRxModalProps) {
  if (!consultation) return null

  const { rx } = consultation

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Đơn kính bác sĩ
          </DialogTitle>
        </DialogHeader>

        {/* Patient info */}
        <div className="flex items-center gap-3 border-b pb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
            {getInitials(consultation.patientName)}
          </div>
          <div>
            <p className="text-sm font-medium leading-none">
              {consultation.patientName}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {consultation.patientId} &middot; {consultation.gender} &middot;{" "}
              {consultation.age} tuổi
            </p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 space-y-4 overflow-y-auto pr-1">
          {/* Rx table */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Thông số khúc xạ
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>SPH</TableHead>
                  <TableHead>CYL</TableHead>
                  <TableHead>AXIS</TableHead>
                  <TableHead>ADD</TableHead>
                  <TableHead>PD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD</TableCell>
                  <TableCell className="font-mono">
                    {formatSph(rx.od.sph)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCyl(rx.od.cyl)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAxis(rx.od.axis)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAdd(rx.od)}
                  </TableCell>
                  <TableCell
                    className="text-center font-mono align-middle"
                    rowSpan={2}
                  >
                    {rx.pd}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS</TableCell>
                  <TableCell className="font-mono">
                    {formatSph(rx.os.sph)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatCyl(rx.os.cyl)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAxis(rx.os.axis)}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatAdd(rx.os)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Visual acuity table */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Thị lực
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>Không kính (UCVA)</TableHead>
                  <TableHead>Có kính (BCVA)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">OD</TableCell>
                  <TableCell>{rx.ucvaOd}</TableCell>
                  <TableCell>{rx.bcvaOd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">OS</TableCell>
                  <TableCell>{rx.ucvaOs}</TableCell>
                  <TableCell>{rx.bcvaOs}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Prescription info */}
          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wider">
              Thông tin chỉ định
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-[11px]">Loại kính</p>
                <p className="text-[13px]">{rx.lensType}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">
                  Mục đích sử dụng
                </p>
                <p className="text-[13px]">{rx.purpose}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">
                  BS chỉ định
                </p>
                <p className="text-[13px]">{rx.doctor}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[11px]">Ngày kê</p>
                <p className="text-[13px]">
                  {formatDateTime(rx.prescribedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Doctor notes */}
          {rx.notes && (
            <div className="bg-muted rounded-md p-3 text-[13px]">
              {rx.notes}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          {onCreateOrder && (
            <Button onClick={onCreateOrder}>Tạo đơn kính</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
