import type { PaymentCategory } from "@/data/mock-cashier"

const CATEGORY_CONFIG: Record<
  PaymentCategory,
  { label: string; bg: string; text: string }
> = {
  exam: { label: "Khám", bg: "#E6F1FB", text: "#0C447C" },
  drug: { label: "Thuốc", bg: "#E1F5EE", text: "#085041" },
  optical: { label: "Kính", bg: "#EEEDFE", text: "#3C3489" },
  treatment: { label: "Liệu trình", bg: "#FAEEDA", text: "#633806" },
}

export function CategoryBadge({ category }: { category: PaymentCategory }) {
  const config = CATEGORY_CONFIG[category]
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-[11px] font-medium"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
