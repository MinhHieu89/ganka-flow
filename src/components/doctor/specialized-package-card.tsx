import { useState } from "react"
import { cn } from "@/lib/utils"

interface SpecializedPackageCardProps {
  title: string
  registeredBy: "receptionist" | "doctor"
  defaultOpen?: boolean
  children: React.ReactNode
}

export function SpecializedPackageCard({
  title,
  registeredBy,
  defaultOpen = false,
  children,
}: SpecializedPackageCardProps) {
  const [open, setOpen] = useState(defaultOpen)

  const byLabel =
    registeredBy === "receptionist" ? "Đăng ký bởi Lễ tân" : "Đăng ký bởi Bác sĩ"

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors",
          open && "border-b border-border bg-teal-500/[0.03]"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="size-2 rounded-full bg-teal-600" />
          <span className="text-sm font-bold">{title}</span>
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium",
              registeredBy === "receptionist"
                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400"
            )}
          >
            {byLabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {open ? "▲ Thu gọn" : "▼ Mở rộng"}
        </span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}
