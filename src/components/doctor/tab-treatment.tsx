import { Skeleton } from "@/components/ui/skeleton"

export function TabTreatment() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Liệu trình</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Sắp ra mắt
        </span>
      </div>

      {/* Course Summary Card */}
      <div className="rounded-lg border border-border p-5 space-y-4">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-3.5 w-[25%]" />
        <div className="flex gap-2.5 pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>

      {/* Session List */}
      <div className="rounded-lg border border-border p-5 space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Detail Area */}
      <div className="rounded-lg border border-border p-5 space-y-3">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-3.5 w-[60%]" />
        <Skeleton className="h-3.5 w-[45%]" />
      </div>
    </div>
  )
}
