import { useState, useMemo } from "react"
import {
  mockShiftReconciliation,
  mockPaymentRequests,
} from "@/data/mock-cashier"

export function useShiftClose() {
  const reconciliation = mockShiftReconciliation

  const cashExpected =
    reconciliation.openingCash +
    reconciliation.cashCollected -
    reconciliation.cashChangeGiven

  const [cashActual, setCashActual] = useState<number | null>(null)
  const [note, setNote] = useState("")

  const difference = (cashActual ?? 0) - cashExpected

  const differenceStatus = useMemo<"match" | "over" | "short">(() => {
    if (cashActual === null) return "match"
    if (difference === 0) return "match"
    return difference > 0 ? "over" : "short"
  }, [cashActual, difference])

  const pendingCount = mockPaymentRequests.length

  const canClose = useMemo(() => {
    if (cashActual === null) return false
    if (pendingCount > 0) return false
    if (difference !== 0 && !note.trim()) return false
    return true
  }, [cashActual, pendingCount, difference, note])

  return {
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
  }
}
