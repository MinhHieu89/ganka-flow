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
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { LensItem } from "@/data/mock-optical"
import { formatPrice } from "@/data/mock-optical"

interface LensTableProps {
  lenses: LensItem[]
}

export function LensTable({ lenses }: LensTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Mã tròng</TableHead>
          <TableHead>Tên tròng</TableHead>
          <TableHead>Thương hiệu</TableHead>
          <TableHead>Chiết suất</TableHead>
          <TableHead>Loại</TableHead>
          <TableHead>Giá bán</TableHead>
          <TableHead>Tồn kho</TableHead>
          <TableHead className="w-[48px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {lenses.map((l) => {
          const isLow = l.stock <= l.lowStockThreshold

          return (
            <TableRow key={l.code}>
              <TableCell>
                <span className="font-mono text-xs">{l.code}</span>
              </TableCell>
              <TableCell>{l.name}</TableCell>
              <TableCell>{l.brand}</TableCell>
              <TableCell>{l.refractiveIndex}</TableCell>
              <TableCell>{l.type}</TableCell>
              <TableCell>
                <span className="tabular-nums">{formatPrice(l.price)}</span>
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
                  {l.stock}
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
