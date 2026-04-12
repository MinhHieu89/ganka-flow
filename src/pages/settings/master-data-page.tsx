import { useParams, Link } from "react-router"
import { MASTER_DATA_LISTS } from "@/data/master-data-defaults"
import { MasterDataListEditor } from "@/components/settings/master-data-list-editor"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default function MasterDataPage() {
  const { listKey } = useParams<{ listKey: string }>()
  const config = MASTER_DATA_LISTS.find((l) => l.listKey === listKey)

  if (!config || !listKey) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Không tìm thấy danh mục.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl p-6">
      <div className="mb-6">
        <Link
          to="/settings"
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          Cài đặt
        </Link>
        <h1 className="text-2xl font-semibold">{config.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{config.module}</p>
      </div>
      <MasterDataListEditor listKey={listKey} />
    </div>
  )
}
