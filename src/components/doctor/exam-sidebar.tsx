import { HugeiconsIcon } from "@hugeicons/react"
import {
  User01Icon,
  ClipboardIcon,
  Note01Icon,
  Stethoscope02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type ExamTab = "patient" | "preExam" | "requests" | "exam"

interface ExamSidebarProps {
  activeTab: ExamTab
  onTabChange: (tab: ExamTab) => void
  pendingRequestCount: number
}

const tabs: {
  id: ExamTab
  label: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}[] = [
  { id: "patient", label: "Bệnh nhân", icon: User01Icon },
  { id: "preExam", label: "Pre-Exam", icon: ClipboardIcon },
  { id: "requests", label: "Yêu cầu", icon: Note01Icon },
  { id: "exam", label: "Khám & kết luận", icon: Stethoscope02Icon },
]

export function ExamSidebar({
  activeTab,
  onTabChange,
  pendingRequestCount,
}: ExamSidebarProps) {
  return (
    <aside className="flex w-[175px] shrink-0 flex-col border-r border-border bg-muted/30">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative flex flex-col items-center gap-1.5 px-3 py-4 text-center text-xs transition-colors",
              "hover:bg-background/60",
              isActive
                ? "bg-background font-medium text-[#0C447C]"
                : "text-muted-foreground",
              isActive &&
                "before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-r-full before:bg-[#0C447C] before:content-['']",
            )}
          >
            <span className="relative">
              <HugeiconsIcon icon={tab.icon} size={20} strokeWidth={1.75} />
              {tab.id === "requests" && pendingRequestCount > 0 && (
                <span className="absolute -right-2 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-[#D85A30] px-1 text-[10px] font-semibold leading-[18px] text-white">
                  {pendingRequestCount}
                </span>
              )}
            </span>
            <span className="leading-tight">{tab.label}</span>
          </button>
        )
      })}
    </aside>
  )
}
