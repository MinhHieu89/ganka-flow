import { useState, useMemo, useCallback } from "react"
import type {
  PaymentPatientInfo,
  PaymentLineItem,
  PaymentDiscount,
  PaymentMethodEntry,
  CompletedPayment,
  PaymentMethod,
} from "@/data/mock-cashier"
import {
  mockPaymentPatients,
  mockPaymentLineItems,
} from "@/data/mock-cashier"

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function generateTransactionId(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")
  return `GD-${yyyy}${mm}${dd}-${seq}`
}

function calcDiscountAmount(
  subtotal: number,
  type: "percent" | "fixed",
  value: number
): number {
  if (type === "percent") {
    return Math.floor((subtotal * value) / 100 / 1000) * 1000
  }
  return Math.min(value, subtotal)
}

export function usePaymentProcessing(paymentRequestId: string) {
  const patient: PaymentPatientInfo = mockPaymentPatients[paymentRequestId] ?? {
    name: "Không tìm thấy",
    code: "",
    gender: "",
    age: 0,
    phone: "",
  }

  const items: PaymentLineItem[] =
    mockPaymentLineItems[paymentRequestId] ?? []

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.lineTotal, 0),
    [items]
  )

  const [discount, setDiscount] = useState<PaymentDiscount | null>(null)

  const discountAmount = discount?.amount ?? 0
  const total = subtotal - discountAmount

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodEntry[]>(
    () => [
      {
        id: generateId(),
        method: "cash" as PaymentMethod,
        amount: subtotal,
      },
    ]
  )

  const methodsTotal = useMemo(
    () => paymentMethods.reduce((sum, m) => sum + m.amount, 0),
    [paymentMethods]
  )

  const amountMismatch = methodsTotal !== total

  const canConfirm = useMemo(() => {
    if (paymentMethods.length === 0) return false
    if (amountMismatch) return false
    for (const m of paymentMethods) {
      if (m.method === "cash") {
        if (m.cashReceived === undefined || m.cashReceived < m.amount) {
          return false
        }
      }
    }
    return true
  }, [paymentMethods, amountMismatch])

  const isDirty = useMemo(() => {
    return discount !== null || paymentMethods.length > 1
  }, [discount, paymentMethods])

  const addDiscount = useCallback(
    (type: "percent" | "fixed", value: number, reason: string) => {
      const amount = calcDiscountAmount(subtotal, type, value)
      setDiscount({ type, value, reason, appliedBy: "Thu ngân Linh", amount })
      setPaymentMethods((prev) => {
        if (prev.length === 1) {
          return [{ ...prev[0], amount: subtotal - amount }]
        }
        return prev
      })
    },
    [subtotal]
  )

  const removeDiscount = useCallback(() => {
    setDiscount(null)
    setPaymentMethods((prev) => {
      if (prev.length === 1) {
        return [{ ...prev[0], amount: subtotal }]
      }
      return prev
    })
  }, [subtotal])

  const addPaymentMethod = useCallback(() => {
    setPaymentMethods((prev) => {
      if (prev.length >= 3) return prev
      const usedAmount = prev.reduce((sum, m) => sum + m.amount, 0)
      const remaining = Math.max(0, total - usedAmount)
      return [
        ...prev,
        {
          id: generateId(),
          method: "transfer" as PaymentMethod,
          amount: remaining,
        },
      ]
    })
  }, [total])

  const removePaymentMethod = useCallback((id: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const updatePaymentMethod = useCallback(
    (id: string, updates: { method?: PaymentMethod; amount?: number }) => {
      setPaymentMethods((prev) =>
        prev.map((m) => {
          if (m.id !== id) return m
          const updated = { ...m, ...updates }
          if (updates.method && updates.method !== "cash") {
            delete updated.cashReceived
            delete updated.cashChange
          }
          return updated
        })
      )
    },
    []
  )

  const updateCashReceived = useCallback((id: string, cashReceived: number) => {
    setPaymentMethods((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        return {
          ...m,
          cashReceived,
          cashChange: cashReceived - m.amount,
        }
      })
    )
  }, [])

  const confirmPayment = useCallback((): CompletedPayment => {
    return {
      id: generateTransactionId(),
      paymentRequestId,
      patient,
      items,
      discount,
      paymentMethods,
      subtotal,
      discountAmount,
      total,
      cashierName: "Thu ngân Linh",
      completedAt: new Date().toISOString(),
    }
  }, [
    paymentRequestId,
    patient,
    items,
    discount,
    paymentMethods,
    subtotal,
    discountAmount,
    total,
  ])

  return {
    patient,
    items,
    subtotal,
    discount,
    discountAmount,
    total,
    paymentMethods,
    methodsTotal,
    amountMismatch,
    canConfirm,
    isDirty,
    addDiscount,
    removeDiscount,
    addPaymentMethod,
    removePaymentMethod,
    updatePaymentMethod,
    updateCashReceived,
    confirmPayment,
  }
}
