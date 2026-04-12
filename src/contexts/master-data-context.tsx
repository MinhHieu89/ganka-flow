import { createContext, useContext, useState, type ReactNode } from "react"
import {
  DEFAULT_MASTER_DATA,
  type MasterDataItem,
} from "@/data/master-data-defaults"

interface MasterDataContextType {
  getList: (listKey: string) => MasterDataItem[]
  getActiveItems: (listKey: string) => MasterDataItem[]
  addItem: (listKey: string, key: string, label: string) => void
  updateItem: (listKey: string, itemId: string, label: string) => void
  moveItem: (listKey: string, itemId: string, direction: "up" | "down") => void
  toggleItem: (listKey: string, itemId: string) => void
  deleteItem: (listKey: string, itemId: string) => void
}

const MasterDataContext = createContext<MasterDataContextType | null>(null)

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, MasterDataItem[]>>(() =>
    structuredClone(DEFAULT_MASTER_DATA)
  )

  function getList(listKey: string): MasterDataItem[] {
    return (data[listKey] ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }

  function getActiveItems(listKey: string): MasterDataItem[] {
    return getList(listKey).filter((item) => item.isActive)
  }

  function addItem(listKey: string, key: string, label: string) {
    setData((prev) => {
      const list = prev[listKey] ?? []
      const maxSort = list.reduce(
        (max, item) => Math.max(max, item.sortOrder),
        -1
      )
      const newItem: MasterDataItem = {
        id: `md-${Date.now()}`,
        key,
        label,
        sortOrder: maxSort + 1,
        isActive: true,
      }
      return { ...prev, [listKey]: [...list, newItem] }
    })
  }

  function updateItem(listKey: string, itemId: string, label: string) {
    setData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] ?? []).map((item) =>
        item.id === itemId ? { ...item, label } : item
      ),
    }))
  }

  function moveItem(listKey: string, itemId: string, direction: "up" | "down") {
    setData((prev) => {
      const list = [...(prev[listKey] ?? [])].sort(
        (a, b) => a.sortOrder - b.sortOrder
      )
      const index = list.findIndex((item) => item.id === itemId)
      if (index < 0) return prev
      const swapIndex = direction === "up" ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= list.length) return prev

      const updated = list.map((item, i) => {
        if (i === index)
          return { ...item, sortOrder: list[swapIndex].sortOrder }
        if (i === swapIndex)
          return { ...item, sortOrder: list[index].sortOrder }
        return item
      })
      return { ...prev, [listKey]: updated }
    })
  }

  function toggleItem(listKey: string, itemId: string) {
    setData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] ?? []).map((item) =>
        item.id === itemId ? { ...item, isActive: !item.isActive } : item
      ),
    }))
  }

  function deleteItem(listKey: string, itemId: string) {
    setData((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] ?? []).filter((item) => item.id !== itemId),
    }))
  }

  return (
    <MasterDataContext.Provider
      value={{
        getList,
        getActiveItems,
        addItem,
        updateItem,
        moveItem,
        toggleItem,
        deleteItem,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterData() {
  const ctx = useContext(MasterDataContext)
  if (!ctx)
    throw new Error("useMasterData must be used within MasterDataProvider")
  return ctx
}
