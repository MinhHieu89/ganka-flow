import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type {
  ShiftBreakdownByMethod,
  ShiftBreakdownByCategory,
} from "@/data/mock-cashier"
import { formatVND, getPaymentMethodLabel } from "@/data/mock-cashier"

const CATEGORY_LABELS: Record<string, string> = {
  exam: "Khám",
  drug: "Thuốc",
  optical: "Kính",
  treatment: "Liệu trình",
}

interface ShiftBreakdownTableProps {
  byMethod: ShiftBreakdownByMethod[]
  byCategory: ShiftBreakdownByCategory[]
  totalRevenue: number
}

export function ShiftBreakdownTable({
  byMethod,
  byCategory,
  totalRevenue,
}: ShiftBreakdownTableProps) {
  return (
    <div className="space-y-6">
      {/* By payment method */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Breakdown theo phương thức thanh toán
        </h3>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phương thức</TableHead>
                <TableHead className="text-center">Số GD</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byMethod.map((row) => (
                <TableRow key={row.method}>
                  <TableCell className="text-[13px]">
                    {getPaymentMethodLabel(row.method)}
                  </TableCell>
                  <TableCell className="text-center text-[13px] text-muted-foreground">
                    {row.count}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium">
                    {formatVND(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="text-[13px] font-medium">Tổng</TableCell>
                <TableCell className="text-center text-[13px] font-medium">
                  {byMethod.reduce((s, r) => s + r.count, 0)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* By category */}
      <div>
        <h3 className="mb-3 text-sm font-medium">
          Breakdown theo phân hệ doanh thu
        </h3>
        <div className="rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phân hệ</TableHead>
                <TableHead className="text-center">Số GD</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCategory.map((row) => (
                <TableRow key={row.category}>
                  <TableCell className="text-[13px]">
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </TableCell>
                  <TableCell className="text-center text-[13px] text-muted-foreground">
                    {row.count}
                  </TableCell>
                  <TableCell className="text-right text-[13px] font-medium">
                    {formatVND(row.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell className="text-[13px] font-medium">Tổng</TableCell>
                <TableCell className="text-center text-[13px] font-medium">
                  {byCategory.reduce((s, r) => s + r.count, 0)}
                </TableCell>
                <TableCell className="text-right text-[13px] font-medium">
                  {formatVND(totalRevenue)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
