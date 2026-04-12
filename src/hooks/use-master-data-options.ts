import { useMasterData } from "@/contexts/master-data-context"

export function useMasterDataOptions(listKey: string) {
  const { getActiveItems } = useMasterData()
  return getActiveItems(listKey)
}
