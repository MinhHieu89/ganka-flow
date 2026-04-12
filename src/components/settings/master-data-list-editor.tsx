import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useMasterData } from "@/contexts/master-data-context"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  Add01Icon,
  Cancel01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"

interface Props {
  listKey: string
}

function generateKey(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
}

export function MasterDataListEditor({ listKey }: Props) {
  const { getList, addItem, updateItem, moveItem, toggleItem, deleteItem } =
    useMasterData()

  const [newLabel, setNewLabel] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")

  const items = getList(listKey)

  function handleAdd() {
    const trimmed = newLabel.trim()
    if (!trimmed) return
    const key = generateKey(trimmed)
    addItem(listKey, key, trimmed)
    setNewLabel("")
  }

  function startEdit(item: { id: string; label: string }) {
    setEditingId(item.id)
    setEditLabel(item.label)
  }

  function saveEdit() {
    if (editingId && editLabel.trim()) {
      updateItem(listKey, editingId, editLabel.trim())
    }
    setEditingId(null)
    setEditLabel("")
  }

  function cancelEdit() {
    setEditingId(null)
    setEditLabel("")
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd()
          }}
          placeholder="Nhập tên mục mới..."
          className="max-w-sm"
        />
        <Button onClick={handleAdd} disabled={!newLabel.trim()} size="sm">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Thêm
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Thứ tự</TableHead>
            <TableHead>Tên hiển thị</TableHead>
            <TableHead className="w-28">Trạng thái</TableHead>
            <TableHead className="w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center text-muted-foreground"
              >
                Chưa có mục nào
              </TableCell>
            </TableRow>
          )}
          {items.map((item, index) => {
            const isEditing = editingId === item.id
            return (
              <TableRow
                key={item.id}
                className={item.isActive ? "" : "opacity-50"}
              >
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === 0}
                      onClick={() => moveItem(listKey, item.id, "up")}
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={index === items.length - 1}
                      onClick={() => moveItem(listKey, item.id, "down")}
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit()
                        if (e.key === "Escape") cancelEdit()
                      }}
                      autoFocus
                      className="h-8"
                    />
                  ) : (
                    item.label
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleItem(listKey, item.id)}
                    className={
                      item.isActive
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-muted-foreground"
                    }
                  >
                    {item.isActive ? "Hoạt động" : "Ẩn"}
                  </Button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {isEditing ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={saveEdit}
                        >
                          <HugeiconsIcon
                            icon={Tick01Icon}
                            size={16}
                            className="text-emerald-600"
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={cancelEdit}
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={16}
                            className="text-muted-foreground"
                          />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEdit(item)}
                        >
                          <HugeiconsIcon icon={PencilEdit01Icon} size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => deleteItem(listKey, item.id)}
                        >
                          <HugeiconsIcon
                            icon={Delete02Icon}
                            size={16}
                            className="text-destructive"
                          />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
