import { useState, useMemo } from "react"
import {
  mockTransactionDetails,
  getMockRefundableItems,
  getPaymentMethodLabel,
} from "@/data/mock-cashier"
import type { TransactionDetail, RefundableItem } from "@/data/mock-cashier"

export function useRefund(transactionId: string) {
  const transaction: TransactionDetail | undefined =
    mockTransactionDetails[transactionId]

  const refundableItems: RefundableItem[] = useMemo(
    () => getMockRefundableItems(transactionId),
    [transactionId]
  )

  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  )
  const [reasonCode, setReasonCode] = useState("")
  const [refundMethod, setRefundMethod] = useState<string>(() => {
    if (!transaction) return "cash"
    return transaction.paymentMethods[0]?.method ?? "cash"
  })
  const [note, setNote] = useState("")

  const refundTotal = useMemo(
    () =>
      refundableItems
        .filter((item) => selectedItemIds.has(item.id))
        .reduce((sum, item) => sum + item.amount, 0),
    [refundableItems, selectedItemIds]
  )

  const canConfirm = useMemo(() => {
    if (selectedItemIds.size === 0) return false
    if (!reasonCode) return false
    if (!note.trim()) return false
    return true
  }, [selectedItemIds, reasonCode, note])

  const originalMethodLabel = transaction
    ? getPaymentMethodLabel(transaction.paymentMethods[0]?.method ?? "cash")
    : "Tiền mặt"

  function toggleItem(id: string) {
    const item = refundableItems.find((i) => i.id === id)
    if (!item || item.alreadyRefunded) return
    setSelectedItemIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return {
    transaction,
    refundableItems,
    selectedItemIds,
    toggleItem,
    reasonCode,
    setReasonCode,
    refundMethod,
    setRefundMethod,
    note,
    setNote,
    refundTotal,
    canConfirm,
    originalMethodLabel,
  }
}
