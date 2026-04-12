// Settings index — shows all 16 master data lists grouped by module
import { Link } from "react-router"
import { MASTER_DATA_LISTS } from "@/data/master-data-defaults"
import { useMasterData } from "@/contexts/master-data-context"

export default function SettingsIndex() {
  const { getList } = useMasterData()

  // Group lists by module
  const grouped = MASTER_DATA_LISTS.reduce<
    Record<string, typeof MASTER_DATA_LISTS>
  >((acc, list) => {
    ;(acc[list.module] ??= []).push(list)
    return acc
  }, {})

  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Cài đặt danh mục</h1>
      <div className="space-y-8">
        {Object.entries(grouped).map(([module, lists]) => (
          <div key={module}>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {module}
            </h2>
            <div className="space-y-1">
              {lists.map((list) => {
                const items = getList(list.listKey)
                const activeCount = items.filter((i) => i.isActive).length
                return (
                  <Link
                    key={list.listKey}
                    to={`/settings/${list.listKey}`}
                    className="flex items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <span className="text-sm font-medium">{list.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {activeCount} mục
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
