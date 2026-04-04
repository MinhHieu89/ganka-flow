import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import type { OtcCustomer } from "@/data/mock-otc"

interface OtcCustomerCardProps {
  customers: OtcCustomer[]
  selectedCustomer: OtcCustomer | null
  onSelect: (customer: OtcCustomer) => void
  onClear: () => void
  onCreateNew: () => void
}

export function OtcCustomerCard({
  customers,
  selectedCustomer,
  onSelect,
  onClear,
  onCreateNew,
}: OtcCustomerCardProps) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q)
    )
  }, [search, customers])

  if (selectedCustomer) {
    return (
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          Khách hàng
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">{selectedCustomer.name}</div>
            <div className="text-xs text-muted-foreground">
              {selectedCustomer.phone}
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-primary hover:underline"
          >
            Đổi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="mb-1.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        Khách hàng
      </div>
      <Input
        placeholder="Tìm theo tên hoặc SĐT..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-8 text-sm"
      />
      {search.trim() && (
        <div className="mt-2 max-h-[140px] space-y-0.5 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  onSelect(c)
                  setSearch("")
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.phone}</span>
              </button>
            ))
          ) : (
            <div className="py-2 text-center text-xs text-muted-foreground">
              Không tìm thấy khách hàng
            </div>
          )}
        </div>
      )}
      <button
        onClick={onCreateNew}
        className="mt-2 text-xs text-primary hover:underline"
      >
        + Tạo khách hàng mới
      </button>
    </div>
  )
}
