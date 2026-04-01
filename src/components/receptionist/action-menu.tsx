import { useNavigate } from "react-router"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { type Visit } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalIcon } from "@hugeicons/core-free-icons"

interface ActionMenuProps {
  visit: Visit
  onCheckIn: () => void
  onCancel: () => void
}

export function ActionMenu({ visit, onCheckIn, onCancel }: ActionMenuProps) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm">
          <HugeiconsIcon
            icon={MoreVerticalIcon}
            className="size-4 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {visit.status === "chua_den" && (
          <DropdownMenuItem onClick={onCheckIn}>Check-in</DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => navigate(`/intake/${visit.patientId}/edit`)}
        >
          Xem hồ sơ
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate(`/intake/${visit.patientId}/edit`)}
        >
          Sửa thông tin
        </DropdownMenuItem>
        {visit.status !== "hoan_thanh" && visit.status !== "da_huy" && (
          <DropdownMenuItem
            onClick={onCancel}
            className="text-destructive focus:text-destructive"
          >
            Hủy lượt khám
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
