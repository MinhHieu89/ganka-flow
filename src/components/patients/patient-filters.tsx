import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"
import type { PatientActiveStatus } from "@/data/mock-patients"

interface PatientFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: PatientActiveStatus | "all"
  onStatusFilterChange: (value: PatientActiveStatus | "all") => void
  genderFilter: "all" | "Nam" | "Nữ" | "Khác"
  onGenderFilterChange: (value: "all" | "Nam" | "Nữ" | "Khác") => void
}

export function PatientFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  genderFilter,
  onGenderFilterChange,
}: PatientFiltersProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border p-4">
      <div className="relative flex-1">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          placeholder="Tìm kiếm bệnh nhân..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      <Select
        value={statusFilter}
        onValueChange={(v) =>
          onStatusFilterChange(v as PatientActiveStatus | "all")
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="hoat_dong">Hoạt động</SelectItem>
          <SelectItem value="ngung_hoat_dong">Ngừng hoạt động</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={genderFilter}
        onValueChange={(v) =>
          onGenderFilterChange(v as "all" | "Nam" | "Nữ" | "Khác")
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Giới tính" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="Nam">Nam</SelectItem>
          <SelectItem value="Nữ">Nữ</SelectItem>
          <SelectItem value="Khác">Khác</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
