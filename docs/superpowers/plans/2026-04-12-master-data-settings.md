# Master Data Settings — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build admin settings pages for 16 master data lists (dropdown options used across intake, screening, and optical modules) with add/rename/reorder/disable/delete operations.

**Architecture:** A `MasterDataContext` holds all 16 lists in state (initialized from defaults). A reusable `MasterDataListEditor` component provides the CRUD UI. Settings pages are flat — one route per list, with an index page showing all lists grouped by module. Existing form components swap hardcoded option arrays for a `useMasterDataOptions(listKey)` hook.

**Tech Stack:** React 19, TypeScript, shadcn/ui (Table, Dialog, Input, Button, Switch), Hugeicons, React Router v7

---

## File Structure

### New Files
- `src/data/master-data-defaults.ts` — Types + all 16 default lists
- `src/contexts/master-data-context.tsx` — Context provider with CRUD operations
- `src/hooks/use-master-data-options.ts` — Hook returning `{ key, label }[]` for form consumption
- `src/components/settings/master-data-list-editor.tsx` — Reusable CRUD list component
- `src/pages/settings/index.tsx` — Settings index page (all lists grouped by module)
- `src/pages/settings/master-data-page.tsx` — Individual list CRUD page

### Modified Files
- `src/App.tsx` — Add MasterDataProvider + settings routes
- `src/components/app-sidebar.tsx` — Add "Cai dat" nav item
- `src/components/site-header.tsx` — Add settings page titles
- `src/components/receptionist/intake-section-complaint.tsx` — Use hook for visit_reasons, symptoms
- `src/components/receptionist/intake-section-eye-history.tsx` — Use hook for contact_lens_types, contact_lens_issues, eye_conditions, eye_surgery_types
- `src/components/receptionist/intake-section-medical-history.tsx` — Use hook for systemic_conditions
- `src/components/receptionist/intake-section-lifestyle.tsx` — Use hook for screen_time_ranges, outdoor_time_ranges
- `src/components/receptionist/intake-section-personal.tsx` — Use hook for relationships
- `src/components/receptionist/intake-section-family-history.tsx` — Use hook for family_eye_conditions, family_medical_conditions
- `src/components/optical/delivery-confirm-modal.tsx` — Use hook for delivery_carriers

---

### Task 1: Master data types and default data

**Files:**
- Create: `src/data/master-data-defaults.ts`

- [ ] **Step 1: Create the master data defaults file**

```typescript
// src/data/master-data-defaults.ts

export interface MasterDataItem {
  id: string
  key: string
  label: string
  sortOrder: number
  isActive: boolean
}

export interface MasterDataListConfig {
  listKey: string
  name: string
  module: string
}

export const MASTER_DATA_LISTS: MasterDataListConfig[] = [
  // Tiep nhan (Intake)
  { listKey: "visit_reasons", name: "Ly do kham", module: "Tiep nhan" },
  { listKey: "symptoms", name: "Trieu chung hien tai", module: "Tiep nhan" },
  { listKey: "contact_lens_types", name: "Loai lens", module: "Tiep nhan" },
  { listKey: "contact_lens_issues", name: "Van de lens", module: "Tiep nhan" },
  { listKey: "eye_conditions", name: "Benh ly mat", module: "Tiep nhan" },
  { listKey: "eye_surgery_types", name: "Loai phau thuat mat", module: "Tiep nhan" },
  { listKey: "systemic_conditions", name: "Benh ly toan than", module: "Tiep nhan" },
  { listKey: "screen_time_ranges", name: "Thoi gian man hinh", module: "Tiep nhan" },
  { listKey: "outdoor_time_ranges", name: "Thoi gian ngoai troi", module: "Tiep nhan" },
  { listKey: "relationships", name: "Moi quan he", module: "Tiep nhan" },
  { listKey: "family_eye_conditions", name: "Benh mat gia dinh", module: "Tiep nhan" },
  { listKey: "family_medical_conditions", name: "Benh ly gia dinh", module: "Tiep nhan" },
  // Sang loc (Screening)
  { listKey: "red_flag_symptoms", name: "Dau hieu co do", module: "Sang loc" },
  { listKey: "disease_groups", name: "Nhom benh", module: "Sang loc" },
  // Kinh mat (Optical)
  { listKey: "delivery_carriers", name: "Don vi van chuyen", module: "Kinh mat" },
  // Trong kinh (Lens)
  { listKey: "lens_types", name: "Loai trong kinh", module: "Trong kinh" },
]

let nextId = 1
function item(key: string, label: string, sortOrder: number): MasterDataItem {
  return { id: `md-${nextId++}`, key, label, sortOrder, isActive: true }
}

function buildList(items: [string, string][]): MasterDataItem[] {
  return items.map(([key, label], i) => item(key, label, i))
}

export const DEFAULT_MASTER_DATA: Record<string, MasterDataItem[]> = {
  visit_reasons: buildList([
    ["kham_dinh_ky", "Kham dinh ky/Kiem tra tong quat"],
    ["giam_thi_luc", "Giam thi luc"],
    ["mo_mat", "Mo mat"],
    ["nhuc_dau_dau_mat", "Nhuc dau/Dau mat"],
    ["dau_mat_kho_chiu", "Dau mat hoac kho chiu"],
    ["kho_nhin_gan", "Kho nhin gan (doc sach, xem dien thoai)"],
    ["kho_nhin_xa", "Kho nhin xa (xem bang, lai xe)"],
    ["kinh_ap_trong", "Muon deo kinh ap trong"],
    ["tu_van_phau_thuat", "Tu van phau thuat (LASIK, duc thuy tinh the...)"],
    ["khac", "Khac"],
  ]),

  symptoms: buildList([
    ["mo_mat", "Nhin mo/Giam thi luc"],
    ["nhin_doi", "Nhin doi (song thi)"],
    ["nhin_bien_dang", "Nhin bien dang"],
    ["dom_bay", "Xuat hien diem den/dom bay"],
    ["vong_sang", "Thay vong sang quanh den"],
    ["chop_sang", "Nhin chop sang (flash)"],
    ["mat_thi_truong", "Mat thi truong (goc nhin)"],
    ["mo_thay_doi_theo_gio", "Nhin mo thay doi theo gio"],
    ["nhuc_dau", "Nhuc dau thuong xuyen"],
    ["choi_sang", "Choi sang/So anh sang"],
    ["kho_mat", "Kho mat"],
    ["chay_nuoc_mat", "Chay nuoc mat nhieu"],
    ["tiet_dich", "Tiet dich/Ghen mat"],
    ["ngua_mat", "Ngua mat"],
    ["do_mat", "Do mat"],
    ["sung_mi", "Sung mi mat"],
    ["moi_mat_doc", "Moi mat khi doc/may tinh"],
    ["kho_tap_trung_doc", "Kho tap trung khi doc"],
  ]),

  contact_lens_types: buildList([
    ["mem", "Mem"],
    ["cung", "Cung (RGP)"],
    ["deo_ngay", "Deo ngay"],
    ["deo_keo_dai", "Deo keo dai"],
  ]),

  contact_lens_issues: buildList([
    ["kho_mat", "Kho mat"],
    ["kho_chiu", "Kho chiu"],
    ["nhin_mo", "Nhin mo"],
    ["khac", "Khac"],
  ]),

  eye_conditions: buildList([
    ["can_thi", "Can thi (Myopia)"],
    ["vien_thi", "Vien thi (Hyperopia)"],
    ["loan_thi", "Loan thi (Astigmatism)"],
    ["lao_thi", "Lao thi (Presbyopia)"],
    ["glaucoma", "Glaucoma (Tang nhan ap)"],
    ["duc_thuy_tinh_the", "Duc thuy tinh the (Cataract)"],
    ["thoai_hoa_diem_vang", "Thoai hoa diem vang"],
    ["benh_vong_mac_dtd", "Benh vong mac do DTD"],
    ["lac_mat", "Lac mat (Strabismus)"],
    ["mat_luoi", "Mat luoi (Amblyopia)"],
    ["kho_mat_syndrome", "Kho mat (Dry Eye)"],
    ["viem_ket_mac", "Viem ket mac thuong xuyen"],
    ["bong_vong_mac", "Bong vong mac"],
    ["viem_mang_bo_dao", "Viem mang bo dao (Uveitis)"],
    ["khac", "Khac"],
  ]),

  eye_surgery_types: buildList([
    ["lasik", "LASIK/PRK"],
    ["duc_thuy_tinh_the", "Phau thuat duc thuy tinh the"],
    ["glaucoma", "Phau thuat glaucoma"],
    ["vong_mac", "Phau thuat vong mac"],
    ["lac_mat", "Phau thuat lac mat"],
    ["khac", "Khac"],
  ]),

  systemic_conditions: buildList([
    // Tim mach
    ["tang_huyet_ap", "Tang huyet ap"],
    ["dau_that_nguc", "Dau that nguc"],
    ["benh_tim_mach", "Benh tim mach"],
    ["dot_quy", "Dot quy/Tai bien mach mau nao"],
    // Noi tiet
    ["dtd_type1", "Dai thao duong Tip 1"],
    ["dtd_type2", "Dai thao duong Tip 2"],
    ["benh_tuyen_giap", "Benh tuyen giap"],
    ["cholesterol_cao", "Cholesterol cao"],
    // Than kinh
    ["da_xo_cung", "Da xo cung (MS)"],
    ["dong_kinh", "Dong kinh"],
    ["parkinson", "Benh Parkinson"],
    ["migraine", "Dau nua dau/Migraine"],
    // Ho hap & Mien dich
    ["hen_suyen", "Hen suyen"],
    ["copd", "COPD"],
    ["hiv", "HIV/AIDS"],
    ["viem_gan_bc", "Viem gan B/C"],
    ["lupus", "Lupus ban do he thong"],
    ["viem_khop_dang_thap", "Viem khop dang thap"],
    // Ung thu
    ["ung_thu", "Ung thu"],
    ["dang_hoa_xa_tri", "Dang dieu tri hoa chat/xa tri"],
    // Khac
    ["benh_than", "Benh than"],
    ["benh_gan", "Benh gan"],
    ["roi_loan_dong_mau", "Roi loan dong mau"],
    ["benh_ngoai_da", "Benh ngoai da (vay nen, cham...)"],
    ["tram_cam_lo_au", "Tram cam/Lo au"],
  ]),

  screen_time_ranges: buildList([
    ["duoi_2h", "< 2 gio"],
    ["2_4h", "2-4 gio"],
    ["4_8h", "4-8 gio"],
    ["tren_8h", "> 8 gio"],
  ]),

  outdoor_time_ranges: buildList([
    ["duoi_30m", "< 30 phut"],
    ["30_60m", "30-60 phut"],
    ["1_2h", "1-2 gio"],
    ["tren_2h", "> 2 gio"],
  ]),

  relationships: buildList([
    ["bo_me", "Bo/Me"],
    ["vo_chong", "Vo/Chong"],
    ["con", "Con"],
    ["anh_chi_em", "Anh/Chi/Em"],
    ["khac", "Khac"],
  ]),

  family_eye_conditions: buildList([
    ["glaucoma", "Glaucoma (Tang nhan ap)"],
    ["duc_thuy_tinh_the", "Duc thuy tinh the"],
    ["thoai_hoa_diem_vang", "Thoai hoa diem vang"],
    ["benh_vong_mac", "Benh vong mac"],
    ["can_thi_nang", "Can thi nang"],
    ["mu_mau", "Mu mau"],
    ["lac_mat_luoi", "Mat lac/Mat luoi"],
    ["bong_vong_mac", "Bong vong mac"],
  ]),

  family_medical_conditions: buildList([
    ["dtd", "Dai thao duong"],
    ["tang_huyet_ap", "Tang huyet ap"],
    ["benh_tim_mach", "Benh tim mach"],
    ["dot_quy", "Dot quy"],
    ["ung_thu", "Ung thu"],
    ["benh_tu_mien", "Benh tu mien (Lupus, RA...)"],
  ]),

  red_flag_symptoms: buildList([
    ["dau_mat", "Dau mat"],
    ["mat_thi_luc_dot_ngot", "Mat thi luc dot ngot"],
    ["bat_doi_xung", "Bat doi xung giua hai mat"],
  ]),

  disease_groups: buildList([
    ["dryEye", "Kho mat"],
    ["refraction", "Khuc xa"],
    ["myopiaControl", "Kiem soat can thi"],
    ["general", "Tong quat"],
  ]),

  delivery_carriers: buildList([
    ["grab", "Grab"],
    ["ghtk", "GHTK"],
    ["ghn", "GHN"],
    ["bee_xanh_sm", "Bee / Xanh SM"],
    ["tu_giao", "Tu giao"],
  ]),

  lens_types: buildList([
    ["don_trong", "Don trong"],
    ["da_trong", "Da trong"],
    ["luy_tien", "Luy tien"],
  ]),
}
```

**IMPORTANT:** The labels above are shown WITHOUT Vietnamese diacritics for plan readability. The actual implementation MUST use proper Vietnamese diacritics matching the existing component labels. Copy the exact Vietnamese strings from the existing source files:
- `visit_reasons` and `symptoms` from `src/components/receptionist/intake-section-complaint.tsx`
- `contact_lens_types`, `contact_lens_issues`, `eye_conditions`, `eye_surgery_types` from `src/components/receptionist/intake-section-eye-history.tsx`
- `systemic_conditions` from `src/components/receptionist/intake-section-medical-history.tsx`
- `screen_time_ranges`, `outdoor_time_ranges` from `src/components/receptionist/intake-section-lifestyle.tsx`
- `relationships` from `src/components/receptionist/intake-section-personal.tsx`
- `family_eye_conditions`, `family_medical_conditions` from `src/components/receptionist/intake-section-family-history.tsx`
- `red_flag_symptoms` from `src/lib/red-flags.ts` (currently keyword-based, convert to structured list)
- `disease_groups` from `src/components/doctor/queue-table.tsx` (DISEASE_GROUP_LABELS)
- `delivery_carriers` from `src/components/optical/delivery-confirm-modal.tsx`
- `lens_types` from `src/data/mock-patients.ts` (LENS_TYPE_OPTIONS)

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS (no errors — file is self-contained)

- [ ] **Step 3: Commit**

```bash
git add src/data/master-data-defaults.ts
git commit -m "feat(settings): add master data types and default lists"
```

---

### Task 2: Master data context and options hook

**Files:**
- Create: `src/contexts/master-data-context.tsx`
- Create: `src/hooks/use-master-data-options.ts`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create the master data context**

```tsx
// src/contexts/master-data-context.tsx
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
  const [data, setData] = useState<Record<string, MasterDataItem[]>>(
    () => structuredClone(DEFAULT_MASTER_DATA)
  )

  function getList(listKey: string): MasterDataItem[] {
    return (data[listKey] ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder)
  }

  function getActiveItems(listKey: string): MasterDataItem[] {
    return getList(listKey).filter((item) => item.isActive)
  }

  function addItem(listKey: string, key: string, label: string) {
    setData((prev) => {
      const list = prev[listKey] ?? []
      const maxSort = list.reduce((max, item) => Math.max(max, item.sortOrder), -1)
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
        if (i === index) return { ...item, sortOrder: list[swapIndex].sortOrder }
        if (i === swapIndex) return { ...item, sortOrder: list[index].sortOrder }
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
      value={{ getList, getActiveItems, addItem, updateItem, moveItem, toggleItem, deleteItem }}
    >
      {children}
    </MasterDataContext.Provider>
  )
}

export function useMasterData() {
  const ctx = useContext(MasterDataContext)
  if (!ctx) throw new Error("useMasterData must be used within MasterDataProvider")
  return ctx
}
```

- [ ] **Step 2: Create the options hook**

```tsx
// src/hooks/use-master-data-options.ts
import { useMasterData } from "@/contexts/master-data-context"

export function useMasterDataOptions(listKey: string) {
  const { getActiveItems } = useMasterData()
  return getActiveItems(listKey)
}
```

This hook returns `MasterDataItem[]` (which has `key` and `label` fields). Form components use `item.key` as the value and `item.label` as the display text.

- [ ] **Step 3: Add MasterDataProvider to App.tsx**

In `src/App.tsx`, add the import and wrap the providers:

Add import at top:
```typescript
import { MasterDataProvider } from "@/contexts/master-data-context"
```

Wrap existing providers — add `<MasterDataProvider>` as the outermost provider inside `<TooltipProvider>`:

```tsx
<TooltipProvider>
  <MasterDataProvider>
    <ReceptionistProvider>
      <DoctorProvider>
        <CashierProvider>
          <Routes>
            {/* ... existing routes ... */}
          </Routes>
        </CashierProvider>
      </DoctorProvider>
    </ReceptionistProvider>
  </MasterDataProvider>
</TooltipProvider>
```

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/contexts/master-data-context.tsx src/hooks/use-master-data-options.ts src/App.tsx
git commit -m "feat(settings): add master data context and options hook"
```

---

### Task 3: Master data list editor component

**Files:**
- Create: `src/components/settings/master-data-list-editor.tsx`

- [ ] **Step 1: Create the CRUD list editor component**

```tsx
// src/components/settings/master-data-list-editor.tsx
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
import type { MasterDataItem } from "@/data/master-data-defaults"
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

export function MasterDataListEditor({ listKey }: Props) {
  const { getList, addItem, updateItem, moveItem, toggleItem, deleteItem } =
    useMasterData()

  const items = getList(listKey)

  const [newLabel, setNewLabel] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")

  function handleAdd() {
    const label = newLabel.trim()
    if (!label) return
    const key = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
    addItem(listKey, key, label)
    setNewLabel("")
  }

  function startEdit(item: MasterDataItem) {
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
      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          placeholder="Nhap ten muc moi..."
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="max-w-sm"
        />
        <Button onClick={handleAdd} disabled={!newLabel.trim()} size="sm">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Them
        </Button>
      </div>

      {/* Items table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Thu tu</TableHead>
              <TableHead>Ten hien thi</TableHead>
              <TableHead className="w-24 text-center">Trang thai</TableHead>
              <TableHead className="w-32 text-right">Thao tac</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Chua co muc nao
                </TableCell>
              </TableRow>
            )}
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                className={!item.isActive ? "opacity-50" : undefined}
              >
                {/* Reorder */}
                <TableCell>
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveItem(listKey, item.id, "up")}
                      disabled={index === 0}
                    >
                      <HugeiconsIcon icon={ArrowUp01Icon} size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => moveItem(listKey, item.id, "down")}
                      disabled={index === items.length - 1}
                    >
                      <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                    </Button>
                  </div>
                </TableCell>

                {/* Label (inline edit) */}
                <TableCell>
                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit()
                          if (e.key === "Escape") cancelEdit()
                        }}
                        className="h-8 max-w-xs"
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={saveEdit}
                      >
                        <HugeiconsIcon icon={Tick01Icon} size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={cancelEdit}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={14} />
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm">{item.label}</span>
                  )}
                </TableCell>

                {/* Active toggle */}
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      item.isActive
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-muted-foreground"
                    }
                    onClick={() => toggleItem(listKey, item.id)}
                  >
                    {item.isActive ? "Hoat dong" : "An"}
                  </Button>
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => startEdit(item)}
                      disabled={editingId !== null}
                    >
                      <HugeiconsIcon icon={PencilEdit01Icon} size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteItem(listKey, item.id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
```

**IMPORTANT:** All Vietnamese strings in the component (placeholder text, column headers, status labels, empty state) must use proper diacritics. The plan shows them without diacritics for readability. Use:
- "Nhap ten muc moi..." -> "Nhap ten muc moi..." with diacritics
- "Thu tu" -> "Thu tu" with diacritics
- "Ten hien thi" -> "Ten hien thi" with diacritics
- "Trang thai" -> "Trang thai" with diacritics
- "Thao tac" -> "Thao tac" with diacritics
- "Chua co muc nao" -> "Chua co muc nao" with diacritics
- "Hoat dong" -> "Hoat dong" with diacritics
- "An" -> "An" with diacritics
- "Them" -> "Them" with diacritics

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS. If any Hugeicons imports fail, check available icons with `grep -r "ArrowUp01Icon" node_modules/@hugeicons/` and use the correct icon names.

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/master-data-list-editor.tsx
git commit -m "feat(settings): add reusable master data list editor component"
```

---

### Task 4: Settings pages, routing, and navigation

**Files:**
- Create: `src/pages/settings/index.tsx`
- Create: `src/pages/settings/master-data-page.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/app-sidebar.tsx`
- Modify: `src/components/site-header.tsx`

- [ ] **Step 1: Create settings index page**

```tsx
// src/pages/settings/index.tsx
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
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-semibold mb-6">Cai dat danh muc</h1>
      <div className="space-y-8">
        {Object.entries(grouped).map(([module, lists]) => (
          <div key={module}>
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
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
                    className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium">{list.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {activeCount} muc
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
```

**IMPORTANT:** Vietnamese diacritics required for all labels. "Cai dat danh muc" -> proper diacritics. "muc" -> proper diacritics.

- [ ] **Step 2: Create individual master data page**

```tsx
// src/pages/settings/master-data-page.tsx
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
        <p className="text-muted-foreground">Khong tim thay danh muc.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          Cai dat
        </Link>
        <h1 className="text-2xl font-semibold">{config.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {config.module}
        </p>
      </div>
      <MasterDataListEditor listKey={listKey} />
    </div>
  )
}
```

**IMPORTANT:** Vietnamese diacritics for "Khong tim thay danh muc", "Cai dat".

- [ ] **Step 3: Add settings routes to App.tsx**

Add imports at the top of `src/App.tsx`:
```typescript
import SettingsIndex from "@/pages/settings/index"
import MasterDataPage from "@/pages/settings/master-data-page"
```

Add these routes inside the staff-facing `<Routes>`, after the payment routes (before the closing `</Routes>`):

```tsx
<Route path="/settings" element={<SettingsIndex />} />
<Route
  path="/settings/:listKey"
  element={<MasterDataPage />}
/>
```

- [ ] **Step 4: Add settings nav item to sidebar**

In `src/components/app-sidebar.tsx`:

Add icon import:
```typescript
import { Settings02Icon } from "@hugeicons/core-free-icons"
```

Add to the `navItems` array (at the end):
```typescript
{ title: "Cai dat", url: "/settings", icon: Settings02Icon },
```

**IMPORTANT:** Use proper Vietnamese diacritics for "Cai dat" -> "Cai dat" with diacritics.

- [ ] **Step 5: Add settings page titles to site-header**

In `src/components/site-header.tsx`, add to the `pageTitles` object:

```typescript
"/settings": "Cai dat",
```

**IMPORTANT:** Use proper Vietnamese diacritics.

- [ ] **Step 6: Typecheck and visual verification**

Run: `npm run typecheck`
Expected: PASS

Run: `npm run dev`
Verify:
1. "Cai dat" appears in sidebar at bottom
2. Clicking it shows the settings index with 16 lists grouped by module
3. Clicking any list navigates to `/settings/<listKey>` showing the CRUD editor
4. Add, rename, reorder, toggle, delete all work
5. Back link returns to settings index

- [ ] **Step 7: Commit**

```bash
git add src/pages/settings/index.tsx src/pages/settings/master-data-page.tsx src/App.tsx src/components/app-sidebar.tsx src/components/site-header.tsx
git commit -m "feat(settings): add settings pages with routing and navigation"
```

---

### Task 5: Wire intake form components to master data context

**Files:**
- Modify: `src/components/receptionist/intake-section-complaint.tsx`
- Modify: `src/components/receptionist/intake-section-eye-history.tsx`
- Modify: `src/components/receptionist/intake-section-medical-history.tsx`
- Modify: `src/components/receptionist/intake-section-lifestyle.tsx`
- Modify: `src/components/receptionist/intake-section-personal.tsx`
- Modify: `src/components/receptionist/intake-section-family-history.tsx`

The pattern for each file is the same:
1. Add import: `import { useMasterDataOptions } from "@/hooks/use-master-data-options"`
2. Inside the component function, call the hook for each list the component uses
3. Remove the corresponding hardcoded constant
4. Update JSX to use the hook result variable (same `key`/`label` shape, so mapping code stays the same)

**Note on option formats:** The existing components use two formats:
- `{ key: string, label: string }` — used by CheckboxGrid (visit_reasons, symptoms, eye_conditions, etc.)
- `{ value: string, label: string }` — used by Select/radio (severity, frequency, etc.)

The hook returns `MasterDataItem[]` which has a `key` field. For components using `{ value, label }`, map with `.map(i => ({ value: i.key, label: i.label }))`.

- [ ] **Step 1: Wire intake-section-complaint.tsx**

In `src/components/receptionist/intake-section-complaint.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove the `VISIT_REASON_OPTIONS` and `SYMPTOM_OPTIONS` constants (lines 14-49).

Inside the `IntakeSectionComplaint` component function, add:
```typescript
const visitReasonOptions = useMasterDataOptions("visit_reasons")
const symptomOptions = useMasterDataOptions("symptoms")
```

Replace all references to `VISIT_REASON_OPTIONS` with `visitReasonOptions` and `SYMPTOM_OPTIONS` with `symptomOptions` in the JSX.

Keep `SEVERITY_OPTIONS`, `FREQUENCY_OPTIONS`, and `IMPACT_OPTIONS` as hardcoded constants (they are enums).

- [ ] **Step 2: Wire intake-section-eye-history.tsx**

In `src/components/receptionist/intake-section-eye-history.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove constants: `CONTACT_LENS_TYPE_OPTIONS`, `CONTACT_LENS_ISSUE_OPTIONS`, `EYE_CONDITION_OPTIONS`, `SURGERY_TYPE_OPTIONS` (lines 29-68).

Keep `GLASSES_TYPE_OPTIONS` (enum) and `CONTACT_LENS_STATUS_OPTIONS` (enum).

Inside the `IntakeSectionEyeHistory` component function, add:
```typescript
const contactLensTypeOptions = useMasterDataOptions("contact_lens_types")
const contactLensIssueOptions = useMasterDataOptions("contact_lens_issues")
const eyeConditionOptions = useMasterDataOptions("eye_conditions")
const surgerTypeOptions = useMasterDataOptions("eye_surgery_types").map((i) => ({
  value: i.key,
  label: i.label,
}))
```

Replace references in JSX. For `SURGERY_TYPE_OPTIONS` (uses `value` format), use the mapped version.

- [ ] **Step 3: Wire intake-section-medical-history.tsx**

In `src/components/receptionist/intake-section-medical-history.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove the `SYSTEMIC_CONDITION_GROUPS` constant (lines 23-79).

Keep `ALLERGY_TYPE_OPTIONS` (enum).

Inside the component, add:
```typescript
const systemicConditions = useMasterDataOptions("systemic_conditions")
```

The current component renders conditions in groups using `SYSTEMIC_CONDITION_GROUPS`. Since master data is now a flat list, update the rendering to show a flat checkbox grid instead of grouped sections. Replace the grouped `.map()` with a single `CheckboxGrid` using `systemicConditions`.

If preserving the grouped display is important, create a local mapping from condition keys to group names and group the flat list in the component. But the simpler approach (flat grid) is recommended since the data itself is now flat.

- [ ] **Step 4: Wire intake-section-lifestyle.tsx**

In `src/components/receptionist/intake-section-lifestyle.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove constants: `SCREEN_TIME_OPTIONS`, `OUTDOOR_TIME_OPTIONS` (lines 12-24).

Keep `SUNGLASSES_OPTIONS` and `DRIVING_WHEN_OPTIONS` (enums).

Inside the component, add:
```typescript
const screenTimeOptions = useMasterDataOptions("screen_time_ranges").map((i) => ({
  value: i.key,
  label: i.label,
}))
const outdoorTimeOptions = useMasterDataOptions("outdoor_time_ranges").map((i) => ({
  value: i.key,
  label: i.label,
}))
```

Replace references in JSX.

**Data migration note:** The existing hardcoded options use values like `"<2h"`, `"2-4h"`. The new master data uses keys like `"duoi_2h"`, `"2_4h"`. Any existing patient data using the old keys will not match. Since this is a frontend mockup with no persistent data, this is acceptable. In a real backend, a data migration would be needed.

- [ ] **Step 5: Wire intake-section-personal.tsx**

In `src/components/receptionist/intake-section-personal.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove the `RELATIONSHIP_OPTIONS` constant (lines 21-27).

Inside the component, add:
```typescript
const relationshipOptions = useMasterDataOptions("relationships").map((i) => ({
  value: i.key,
  label: i.label,
}))
```

Replace `RELATIONSHIP_OPTIONS` with `relationshipOptions` in the JSX.

- [ ] **Step 6: Wire intake-section-family-history.tsx**

In `src/components/receptionist/intake-section-family-history.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove constants: `FAMILY_EYE_CONDITIONS`, `FAMILY_MEDICAL_CONDITIONS` (lines 11-29).

Inside the component, add:
```typescript
const familyEyeConditions = useMasterDataOptions("family_eye_conditions")
const familyMedicalConditions = useMasterDataOptions("family_medical_conditions")
```

Replace references in JSX. These already use `{ key, label }` format matching `MasterDataItem`.

- [ ] **Step 7: Typecheck and verify**

Run: `npm run typecheck`
Expected: PASS

Run: `npm run dev`
Navigate to intake form. Verify all dropdowns and checkbox grids render correctly with the same options as before.

- [ ] **Step 8: Commit**

```bash
git add src/components/receptionist/intake-section-complaint.tsx src/components/receptionist/intake-section-eye-history.tsx src/components/receptionist/intake-section-medical-history.tsx src/components/receptionist/intake-section-lifestyle.tsx src/components/receptionist/intake-section-personal.tsx src/components/receptionist/intake-section-family-history.tsx
git commit -m "feat(settings): wire intake form components to master data context"
```

---

### Task 6: Wire screening and optical components

**Files:**
- Modify: `src/components/optical/delivery-confirm-modal.tsx`

Note: `red_flag_symptoms` (in `src/lib/red-flags.ts`) uses keyword matching against free text, not a selectable list. The current implementation (`hasRedFlag`) checks if the reason/complaint text contains keywords like "dau mat", "mat thi luc". This is different from a dropdown select — leave it as-is for now. The master data list for red flags can be used if the screening form adds a red flag checkbox selector in the future.

Note: `disease_groups` are deeply integrated into the screening flow's type system (`DiseaseGroup` type, `Step2FormData`). Wiring them to master data would require changing the type system. Leave as-is for now — the settings page exists for when the admin wants to reference/manage the list, but the screening form continues to use the typed enum.

Note: `lens_types` in `src/data/mock-patients.ts` is exported as `LENS_TYPE_OPTIONS = ["Don trong", "Da trong", "Luy tien"] as const` and used as plain strings in `tab-exam.tsx`. Changing this to use master data keys would require updating how lens types are stored in exam data. Leave as-is for now.

- [ ] **Step 1: Wire delivery-confirm-modal.tsx**

In `src/components/optical/delivery-confirm-modal.tsx`:

Add import:
```typescript
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
```

Remove the `carrierOptions` constant (lines 75-81).

Inside the `DeliveryConfirmModal` component function, add:
```typescript
const carrierOptions = useMasterDataOptions("delivery_carriers")
```

Update the JSX where `carrierOptions` is mapped. Current code (line 222):
```tsx
{carrierOptions.map((opt) => (
  <SelectItem key={opt} value={opt}>
    {opt}
```

Change to:
```tsx
{carrierOptions.map((opt) => (
  <SelectItem key={opt.key} value={opt.label}>
    {opt.label}
```

Note: Using `opt.label` as the value to maintain backward compatibility with the delivery data model that stores carrier name as a string.

- [ ] **Step 2: Typecheck and verify**

Run: `npm run typecheck`
Expected: PASS

Run: `npm run dev`
Navigate to Optical > open a delivery modal. Verify carrier dropdown shows correctly.

- [ ] **Step 3: Commit**

```bash
git add src/components/optical/delivery-confirm-modal.tsx
git commit -m "feat(settings): wire optical delivery carriers to master data context"
```

---

### Task 7: Final verification

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`
Expected: PASS with zero errors

- [ ] **Step 2: Lint**

Run: `npm run lint`
Fix any lint errors if present.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: PASS — successful production build

- [ ] **Step 4: End-to-end visual verification**

Run: `npm run dev` and verify:
1. Settings page accessible via sidebar "Cai dat" link
2. Index shows 16 lists grouped into 4 modules
3. Each list page shows correct default items
4. Add a new item — appears in list
5. Rename an item — label updates
6. Reorder with up/down — sort changes
7. Toggle disable — item shows as "An" with reduced opacity
8. Delete an item — removed from list
9. Navigate to intake form — dropdowns show items from master data context
10. Go to settings, add an item to "Ly do kham", go back to intake — new option appears
11. Disable an item in settings — it disappears from intake dropdowns

- [ ] **Step 5: Final commit (if lint/format changes)**

```bash
git add -A
git commit -m "chore: lint and format fixes for master data settings"
```
