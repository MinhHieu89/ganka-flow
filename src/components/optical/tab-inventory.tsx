import { useState } from "react"
import { Package01Icon, Alert01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { OpticalKpiCards } from "@/components/optical/kpi-cards"
import { OpticalStatusFilters } from "@/components/optical/status-filters"
import { FrameTable } from "@/components/optical/frame-table"
import { LensTable } from "@/components/optical/lens-table"
import type { KpiCardConfig } from "@/components/optical/kpi-cards"
import type { FrameItem, LensItem, InventoryMetrics } from "@/data/mock-optical"

type InventorySubTab = "frames" | "lenses"
type FrameFilter = "all" | "in_stock" | "low_stock" | "out_of_stock"
type LensFilter = "all" | "Essilor" | "Hoya" | "Việt Pháp"

const kpiConfig: KpiCardConfig[] = [
  {
    key: "totalFrames",
    label: "Tổng gọng kính",
    icon: Package01Icon,
    colorClass: "",
    subtitle: "SKU",
  },
  {
    key: "totalLenses",
    label: "Tổng tròng kính",
    icon: Package01Icon,
    colorClass: "",
    subtitle: "SKU",
  },
  {
    key: "lowStockCount",
    label: "Sắp hết hàng",
    icon: Alert01Icon,
    colorClass: "text-amber-500",
    subtitle: "SKU cần bổ sung",
    highlightWhen: (v) => v > 0,
  },
]

const frameFilterOptions: { key: FrameFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "in_stock", label: "Còn hàng" },
  { key: "low_stock", label: "Sắp hết" },
  { key: "out_of_stock", label: "Hết hàng" },
]

const lensFilterOptions: { key: LensFilter; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "Essilor", label: "Essilor" },
  { key: "Hoya", label: "Hoya" },
  { key: "Việt Pháp", label: "Việt Pháp" },
]

interface TabInventoryProps {
  frames: FrameItem[]
  lenses: LensItem[]
  metrics: InventoryMetrics
}

export function TabInventory({ frames, lenses, metrics }: TabInventoryProps) {
  const [subTab, setSubTab] = useState<InventorySubTab>("frames")
  const [frameFilter, setFrameFilter] = useState<FrameFilter>("all")
  const [lensFilter, setLensFilter] = useState<LensFilter>("all")
  const [frameSearch, setFrameSearch] = useState("")
  const [lensSearch, setLensSearch] = useState("")

  const filteredFrames = frames
    .filter((f) => {
      if (frameFilter === "all") return true
      if (frameFilter === "out_of_stock") return f.stock === 0
      if (frameFilter === "low_stock")
        return f.stock > 0 && f.stock <= f.lowStockThreshold
      return f.stock > f.lowStockThreshold
    })
    .filter((f) => {
      if (!frameSearch) return true
      const q = frameSearch.toLowerCase()
      return (
        f.barcode.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.brand.toLowerCase().includes(q)
      )
    })

  const filteredLenses = lenses
    .filter((l) => {
      if (lensFilter === "all") return true
      return l.brand === lensFilter
    })
    .filter((l) => {
      if (!lensSearch) return true
      const q = lensSearch.toLowerCase()
      return (
        l.code.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.brand.toLowerCase().includes(q) ||
        l.refractiveIndex.includes(q)
      )
    })

  return (
    <div className="space-y-4">
      <OpticalKpiCards
        config={kpiConfig}
        values={metrics as unknown as Record<string, number>}
        columns={3}
      />

      {/* Sub-tab button group */}
      <div className="flex">
        <button
          onClick={() => setSubTab("frames")}
          className={cn(
            "rounded-l-lg border px-5 py-1.5 text-sm font-medium transition-colors",
            subTab === "frames"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Gọng kính
        </button>
        <button
          onClick={() => setSubTab("lenses")}
          className={cn(
            "rounded-r-lg border border-l-0 px-5 py-1.5 text-sm font-medium transition-colors",
            subTab === "lenses"
              ? "border-foreground bg-foreground text-background"
              : "border-border bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Tròng kính
        </button>
      </div>

      {subTab === "frames" ? (
        <>
          <OpticalStatusFilters
            filters={frameFilterOptions}
            activeFilter={frameFilter}
            onFilterChange={setFrameFilter}
            searchPlaceholder="Tìm theo tên, mã barcode, thương hiệu..."
            search={frameSearch}
            onSearchChange={setFrameSearch}
          />
          <FrameTable frames={filteredFrames} />
        </>
      ) : (
        <>
          <OpticalStatusFilters
            filters={lensFilterOptions}
            activeFilter={lensFilter}
            onFilterChange={setLensFilter}
            searchPlaceholder="Tìm theo tên tròng, thương hiệu, chiết suất..."
            search={lensSearch}
            onSearchChange={setLensSearch}
          />
          <LensTable lenses={filteredLenses} />
        </>
      )}
    </div>
  )
}
