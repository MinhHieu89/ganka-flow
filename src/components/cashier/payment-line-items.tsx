import { useMemo } from "react"
import type { PaymentLineItem, PaymentCategory } from "@/data/mock-cashier"
import { formatVND } from "@/data/mock-cashier"
import { CategoryBadge } from "@/components/cashier/category-badge"

interface PaymentLineItemsProps {
  items: PaymentLineItem[]
}

const CATEGORY_ORDER: PaymentCategory[] = [
  "exam",
  "drug",
  "optical",
  "treatment",
]

export function PaymentLineItems({ items }: PaymentLineItemsProps) {
  const groups = useMemo(() => {
    const map = new Map<PaymentCategory, PaymentLineItem[]>()
    for (const item of items) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return CATEGORY_ORDER.filter((cat) => map.has(cat)).map((cat) => ({
      category: cat,
      items: map.get(cat)!,
      subtotal: map.get(cat)!.reduce((sum, i) => sum + i.lineTotal, 0),
    }))
  }, [items])

  const CATEGORY_LABELS: Record<PaymentCategory, string> = {
    exam: "Khám",
    drug: "Thuốc",
    optical: "Kính",
    treatment: "Liệu trình",
  }

  return (
    <div>
      {groups.map((group) => (
        <div key={group.category} className="mb-4 last:mb-0">
          <div className="px-[18px] pb-2 pt-3">
            <CategoryBadge category={group.category} />
          </div>
          {group.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-[18px] py-2 text-sm"
            >
              <span>
                {item.description}
                {item.quantity > 1 && (
                  <span className="text-muted-foreground">
                    {" "}
                    x{item.quantity}
                  </span>
                )}
              </span>
              <span className="font-medium">{formatVND(item.lineTotal)}</span>
            </div>
          ))}
          <div className="mx-[18px] flex justify-between border-t border-dashed border-border pb-3 pt-2 text-xs text-muted-foreground">
            <span>Tổng phụ {CATEGORY_LABELS[group.category]}</span>
            <span>{formatVND(group.subtotal)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
