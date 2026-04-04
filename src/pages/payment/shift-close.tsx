import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { useShiftClose } from "@/hooks/use-shift-close"
import { ShiftMetricCards } from "@/components/cashier/shift-metric-cards"
import { ShiftBreakdownTable } from "@/components/cashier/shift-breakdown-table"
import { ShiftCashReconciliation } from "@/components/cashier/shift-cash-reconciliation"

export default function ShiftClosePage() {
  const navigate = useNavigate()
  const {
    reconciliation,
    cashExpected,
    cashActual,
    setCashActual,
    difference,
    differenceStatus,
    note,
    setNote,
    canClose,
    pendingCount,
  } = useShiftClose()

  function handleClose() {
    navigate("/payment")
  }

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/payment")}
        >
          <HugeiconsIcon
            icon={ArrowLeft01Icon}
            className="mr-1.5 size-4"
            strokeWidth={1.5}
          />
          Quay lại
        </Button>
        <h1 className="text-xl font-medium">Chốt ca</h1>
        <span className="text-[13px] text-muted-foreground">
          Ca chiều · 13:00–20:00 · Thu ngân Linh
        </span>
      </div>

      {/* Metric cards */}
      <div className="mx-auto max-w-[1280px] p-6 pb-0">
        <ShiftMetricCards reconciliation={reconciliation} />
      </div>

      {/* Two-column layout */}
      <div className="mx-auto flex max-w-[1280px] gap-6 p-6">
        {/* Left column */}
        <div className="min-w-0 flex-[6]">
          <ShiftBreakdownTable
            byMethod={reconciliation.breakdownByMethod}
            byCategory={reconciliation.breakdownByCategory}
            totalRevenue={reconciliation.totalRevenue}
          />
        </div>

        {/* Right column (sticky) */}
        <div className="sticky top-6 min-w-[320px] flex-[4] self-start">
          <ShiftCashReconciliation
            openingCash={reconciliation.openingCash}
            cashCollected={reconciliation.cashCollected}
            cashChangeGiven={reconciliation.cashChangeGiven}
            cashExpected={cashExpected}
            cashActual={cashActual}
            onCashActualChange={setCashActual}
            difference={difference}
            differenceStatus={differenceStatus}
            note={note}
            onNoteChange={setNote}
            canClose={canClose}
            pendingCount={pendingCount}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  )
}
