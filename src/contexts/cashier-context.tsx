import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react"
import {
  mockPaymentRequests,
  mockTransactions,
  mockTransactionDetails,
  getCashierMetrics,
  type PaymentRequest,
  type Transaction,
  type TransactionDetail,
  type CashierMetrics,
  type CompletedPayment,
  type PaymentMethod,
} from "@/data/mock-cashier"

interface CashierContextType {
  paymentRequests: PaymentRequest[]
  transactions: Transaction[]
  metrics: CashierMetrics
  completePayment: (payment: CompletedPayment) => void
  getTransactionDetail: (transactionId: string) => TransactionDetail | undefined
}

const CashierContext = createContext<CashierContextType | null>(null)

function resolvePaymentMethod(payment: CompletedPayment): PaymentMethod {
  if (payment.paymentMethods.length > 1) return "combined"
  return payment.paymentMethods[0].method
}

export function CashierProvider({ children }: { children: ReactNode }) {
  const [paymentRequests, setPaymentRequests] =
    useState<PaymentRequest[]>(mockPaymentRequests)
  const [transactions, setTransactions] =
    useState<Transaction[]>(mockTransactions)
  const [extraDetails, setExtraDetails] = useState<
    Record<string, TransactionDetail>
  >({})

  const metrics = useMemo(
    () => getCashierMetrics(transactions),
    [transactions]
  )

  const completePayment = useCallback((payment: CompletedPayment) => {
    // Remove from queue
    setPaymentRequests((prev) =>
      prev.filter((r) => r.id !== payment.paymentRequestId)
    )

    // Add to transactions
    const newTx: Transaction = {
      id: payment.id,
      stt: 0, // will be set below
      patientName: payment.patient.name,
      patientId: payment.patient.code,
      patientPhone: payment.patient.phone,
      categories: [
        ...new Set(payment.items.map((item) => item.category)),
      ],
      paymentMethod: resolvePaymentMethod(payment),
      amount: payment.total,
      completedAt: payment.completedAt,
      status: "paid",
      visitId: payment.paymentRequestId,
    }

    setTransactions((prev) => {
      const maxStt = prev.reduce((max, t) => Math.max(max, t.stt), 0)
      return [{ ...newTx, stt: maxStt + 1 }, ...prev]
    })

    // Store detail for invoice viewing
    const detail: TransactionDetail = {
      id: payment.id,
      patient: payment.patient,
      items: payment.items,
      discount: payment.discount,
      paymentMethods: payment.paymentMethods,
      subtotal: payment.subtotal,
      discountAmount: payment.discountAmount,
      total: payment.total,
      cashierName: payment.cashierName,
      completedAt: payment.completedAt,
      status: "paid",
    }
    setExtraDetails((prev) => ({ ...prev, [payment.id]: detail }))
  }, [])

  const getTransactionDetail = useCallback(
    (transactionId: string): TransactionDetail | undefined => {
      return (
        extraDetails[transactionId] ??
        mockTransactionDetails[transactionId]
      )
    },
    [extraDetails]
  )

  const value = useMemo<CashierContextType>(
    () => ({
      paymentRequests,
      transactions,
      metrics,
      completePayment,
      getTransactionDetail,
    }),
    [paymentRequests, transactions, metrics, completePayment, getTransactionDetail]
  )

  return (
    <CashierContext.Provider value={value}>{children}</CashierContext.Provider>
  )
}

export function useCashier(): CashierContextType {
  const ctx = useContext(CashierContext)
  if (!ctx) {
    throw new Error("useCashier must be used within a CashierProvider")
  }
  return ctx
}
