import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { formatVnd } from "@/data/mock-otc"
import type { OtcProduct } from "@/data/mock-otc"

interface OtcProductCardProps {
  products: OtcProduct[]
  onAddToOrder: (product: OtcProduct) => void
}

export function OtcProductCard({
  products,
  onAddToOrder,
}: OtcProductCardProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.manufacturer.toLowerCase().includes(q)
    )
  }, [search, products])

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Sản phẩm OTC
      </div>
      <Input
        placeholder="Tìm thuốc OTC..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-sm"
      />

      <div className="mt-2 flex-1 overflow-y-auto">
        {!search.trim() ? (
          <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
            Nhập tên sản phẩm để tìm kiếm
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
            Không tìm thấy sản phẩm
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((p) => {
              const outOfStock = p.stockQuantity === 0
              return (
                <button
                  key={p.id}
                  disabled={outOfStock}
                  onClick={() => onAddToOrder(p)}
                  className={`flex w-full items-center rounded-md px-2 py-2 text-left ${
                    outOfStock
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-teal-50 dark:hover:bg-teal-950/30"
                  }`}
                >
                  <div className="flex-1">
                    <div
                      className={`text-sm font-medium ${outOfStock ? "text-muted-foreground" : ""}`}
                    >
                      {p.name}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.manufacturer} — {p.formFactor}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-medium ${outOfStock ? "text-muted-foreground" : ""}`}
                    >
                      {formatVnd(p.price)}
                    </div>
                    <div
                      className={`text-[11px] ${
                        outOfStock
                          ? "text-red-500"
                          : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {outOfStock ? "Hết hàng" : `Còn ${p.stockQuantity}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
