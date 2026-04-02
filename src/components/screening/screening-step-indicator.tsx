interface ScreeningStepIndicatorProps {
  currentStep?: 1 | 2
}

export function ScreeningStepIndicator({
  currentStep = 1,
}: ScreeningStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          1
        </div>
        <span
          className={`text-sm ${
            currentStep >= 1
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Khám sàng lọc
        </span>
      </div>
      <div className="h-px w-10 bg-border" />
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep >= 2
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Phân loại nhóm bệnh
        </span>
      </div>
    </div>
  )
}
