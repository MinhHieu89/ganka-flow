import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  MoreVerticalIcon,
  EyeIcon,
  Edit02Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { FrameItem } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface FrameTableProps {
  frames: FrameItem[]
}

export function FrameTable({ frames }: FrameTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Barcode</TableHead>
          <TableHead>Tên gọng</TableHead>
          <TableHead>Thương hiệu</TableHead>
          <TableHead>Màu sắc</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {frames.map((f) => {
          const isLow = f.stock <= f.lowStockThreshold

          return (
            <TableRow key={f.barcode}>
              <TableCell>
                <span className="font-mono text-xs">{f.barcode}</span>
              </TableCell>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.brand}</TableCell>
              <TableCell>{f.color}</TableCell>
              <TableCell>
                <span className="tabular-nums">{formatPrice(f.price)}</span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    "font-medium",
                    isLow
                      ? "text-destructive"
                      : "text-green-600 dark:text-green-400"
                  )}
                >
                  {f.stock}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7">
                      <HugeiconsIcon
                        icon={MoreVerticalIcon}
                        className="size-4"
                        strokeWidth={2}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-48">
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={EyeIcon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Edit02Icon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <HugeiconsIcon
                        icon={Clock01Icon}
                        className="size-4"
                        strokeWidth={1.5}
                      />
                      Lịch sử xuất/nhập
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
