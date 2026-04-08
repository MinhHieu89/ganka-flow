import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatVnd, maskPhone } from "@/data/mock-otc"
import type { OtcOrder, OtcPaymentMethod } from "@/data/mock-otc"
import { useClinic } from "@/hooks/use-clinic"

const paymentLabels: Record<OtcPaymentMethod, string> = {
  cash: "Tiền mặt",
  transfer: "Chuyển khoản",
  qr: "QR code",
  card: "Thẻ",
}

interface OtcInvoiceModalProps {
  order: OtcOrder | null
  open: boolean
  onClose: () => void
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${day}/${month}/${year}, ${hours}:${minutes}`
}

export function OtcInvoiceModal({
  order,
  open,
  onClose,
}: OtcInvoiceModalProps) {
  const clinic = useClinic()
  if (!order) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      {open && (
        <style>{`
          @media print {
            body > *:not([data-radix-portal]) {
              display: none !important;
            }
            [data-radix-portal] [data-slot="dialog-overlay"] {
              background: none !important;
            }
            [data-radix-portal] [data-slot="dialog-content"] {
              position: static !important;
              max-height: none !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              max-width: none !important;
            }
          }
        `}</style>
      )}
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-base font-medium">
              In hóa đơn — {order.customer.name}
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-muted-foreground print:hidden">
            Xem trước hóa đơn bán hàng OTC.
          </p>

          <div className="flex-1 overflow-y-auto pr-1 print:overflow-visible print:pr-0">
            <div className="rounded-lg border border-border px-8 py-7 print:border-none print:p-0">
              {/* Header */}
              <div className="border-b border-border pb-4 text-center">
                <div className="text-base font-medium">
                  {clinic.name.toUpperCase()}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {clinic.address} — ĐT: {clinic.hotline}
                </div>
                <div className="mt-3 text-lg font-medium tracking-wide">
                  HÓA ĐƠN BÁN HÀNG
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  Số: {order.id}
                </div>
              </div>

              {/* Customer info */}
              <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                <div>
                  <span className="text-muted-foreground">Khách hàng: </span>
                  <span className="font-medium">{order.customer.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">SĐT: </span>
                  <span>{maskPhone(order.customer.phone)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày: </span>
                  <span>{formatDateTime(order.soldAt)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Thu ngân: </span>
                  <span>{order.soldBy}</span>
                </div>
              </div>

              {/* Product table */}
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="w-[30px] py-2 text-center">STT</th>
                    <th className="py-2">Sản phẩm</th>
                    <th className="py-2">ĐVT</th>
                    <th className="py-2 text-right">SL</th>
                    <th className="py-2 text-right">Đơn giá</th>
                    <th className="py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr
                      key={item.product.id}
                      className="border-b border-border/50"
                    >
                      <td className="py-2 text-center text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="py-2 font-medium">{item.product.name}</td>
                      <td className="py-2 capitalize">{item.product.unit}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        {formatVnd(item.product.price)}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatVnd(item.product.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="mt-3 border-t border-border pt-3 text-right">
                <div className="text-sm font-medium">
                  Tổng cộng: {formatVnd(order.totalAmount)}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Thanh toán: {paymentLabels[order.paymentMethod]}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 flex justify-between border-t border-dashed border-border pt-3 text-xs text-muted-foreground">
                <span>Cảm ơn quý khách!</span>
                <span>{clinic.name}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              Tải PDF
            </Button>
            <Button onClick={handlePrint}>In hóa đơn</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
