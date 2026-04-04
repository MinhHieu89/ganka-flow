import { useState } from "react"
import { OtcCustomerCard } from "./otc-customer-card"
import { OtcProductCard } from "./otc-product-card"
import { OtcOrderPanel } from "./otc-order-panel"
import { OtcCreateCustomerModal } from "./otc-create-customer-modal"
import { OtcPaymentSuccessModal } from "./otc-payment-success-modal"
import { OtcInvoiceModal } from "./otc-invoice-modal"
import { OtcLabelModal } from "./otc-label-modal"
import { OtcHistory } from "./otc-history"
import {
  otcProducts,
  otcCustomers,
  mockOtcOrders,
  generateOtcOrderId,
  PHARMACIST_NAME,
} from "@/data/mock-otc"
import type {
  OtcCustomer,
  OtcOrderItem,
  OtcPaymentMethod,
  OtcOrder,
  OtcProduct,
} from "@/data/mock-otc"

type OtcView = "pos" | "history"

export function OtcPos() {
  // View state
  const [view, setView] = useState<OtcView>("pos")

  // Customer state
  const [customers, setCustomers] = useState<OtcCustomer[]>(otcCustomers)
  const [selectedCustomer, setSelectedCustomer] =
    useState<OtcCustomer | null>(null)
  const [showCreateCustomer, setShowCreateCustomer] = useState(false)

  // Order state
  const [orderItems, setOrderItems] = useState<OtcOrderItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<OtcPaymentMethod>("cash")

  // Orders history
  const [orders, setOrders] = useState<OtcOrder[]>(mockOtcOrders)

  // Modal state
  const [lastOrder, setLastOrder] = useState<OtcOrder | null>(null)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showInvoice, setShowInvoice] = useState(false)
  const [showLabels, setShowLabels] = useState(false)

  // ─── Handlers ────────────────────────────────────────────────────────

  const handleAddToOrder = (product: OtcProduct) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stockQuantity) return prev
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setOrderItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  const handleRemoveItem = (productId: string) => {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  const handleCheckout = () => {
    if (!selectedCustomer || orderItems.length === 0) return

    const totalAmount = orderItems.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    )

    const newOrder: OtcOrder = {
      id: generateOtcOrderId(orders.length + 1),
      customer: selectedCustomer,
      items: [...orderItems],
      paymentMethod,
      totalAmount,
      soldBy: PHARMACIST_NAME,
      soldAt: new Date().toISOString(),
    }

    setOrders((prev) => [...prev, newOrder])
    setLastOrder(newOrder)
    setShowPaymentSuccess(true)
  }

  const handleNewOrder = () => {
    setSelectedCustomer(null)
    setOrderItems([])
    setPaymentMethod("cash")
    setShowPaymentSuccess(false)
    setShowInvoice(false)
    setShowLabels(false)
    setLastOrder(null)
  }

  const handleCustomerCreated = (customer: OtcCustomer) => {
    setCustomers((prev) => [...prev, customer])
    setSelectedCustomer(customer)
    setShowCreateCustomer(false)
  }

  // ─── Render ──────────────────────────────────────────────────────────

  if (view === "history") {
    return <OtcHistory orders={orders} onBack={() => setView("pos")} />
  }

  return (
    <>
      <div className="flex gap-4 pt-2" style={{ height: "calc(100vh - 180px)" }}>
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-3">
          <OtcCustomerCard
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelect={setSelectedCustomer}
            onClear={() => setSelectedCustomer(null)}
            onCreateNew={() => setShowCreateCustomer(true)}
          />
          <OtcProductCard
            products={otcProducts}
            onAddToOrder={handleAddToOrder}
          />
        </div>

        {/* Right column */}
        <OtcOrderPanel
          items={orderItems}
          paymentMethod={paymentMethod}
          selectedCustomer={selectedCustomer}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onPaymentMethodChange={setPaymentMethod}
          onCheckout={handleCheckout}
          onViewHistory={() => setView("history")}
        />
      </div>

      {/* Modals */}
      <OtcCreateCustomerModal
        open={showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onCreated={handleCustomerCreated}
        existingCustomers={customers}
      />
      <OtcPaymentSuccessModal
        order={lastOrder}
        open={showPaymentSuccess}
        onClose={() => setShowPaymentSuccess(false)}
        onPrintLabels={() => {
          setShowPaymentSuccess(false)
          setShowLabels(true)
        }}
        onPrintInvoice={() => {
          setShowPaymentSuccess(false)
          setShowInvoice(true)
        }}
        onNewOrder={handleNewOrder}
      />
      <OtcInvoiceModal
        order={lastOrder}
        open={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
      <OtcLabelModal
        order={lastOrder}
        open={showLabels}
        onClose={() => setShowLabels(false)}
      />
    </>
  )
}
