# Pharmacist Dashboard — Design Spec

## Overview

Pharmacist-facing module for Ganka Flow. A tabbed dashboard with prescription queue (fully built), OTC sales tab (placeholder), and inventory tab (placeholder). Includes a dispense modal for the main workflow.

**Route:** `/pharmacy`
**Source spec:** `docs/pharmacist/pharmacist-dashboard.md`
**HTML mockup reference:** `docs/pharmacist/pharmacist_dashboard_v2.html`

---

## Sidebar Navigation

Add new nav item to `AppSidebar`:

| Order | Label | Icon | Route |
|-------|-------|------|-------|
| After "Khám bệnh" | Nhà thuốc | `MedicineBottle02Icon` (Hugeicons) | `/pharmacy` |

---

## Page: Pharmacy Dashboard (`/pharmacy`)

### Page Header (`pharmacy-header.tsx`)

- Title: "Nhà thuốc" — `text-xl font-medium`, left-aligned
- Role badge: "Dược sĩ: [Tên nhân viên]" — right-aligned, `bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-md`

### Tab Navigation

Uses shadcn `Tabs` component. Three tabs below header:

| Tab | Label | Badge | Default |
|-----|-------|-------|---------|
| 1 | Hàng đợi đơn thuốc | Red badge with pending count | **Active** |
| 2 | Bán OTC | — | — |
| 3 | Tồn kho | — | — |

Active tab: `font-medium`, teal border-bottom (`border-primary`).

---

## Tab 1: Prescription Queue

### KPI Cards (`kpi-cards.tsx`)

Grid 3 columns (`grid grid-cols-3 gap-3`), same card structure as doctor/screening KPI cards:

| Order | Label | Value color | Data |
|-------|-------|-------------|------|
| 1 | Chờ phát thuốc | `text-amber-500` | Count of pending prescriptions |
| 2 | Đã phát hôm nay | default | Count dispensed today |
| 3 | Cảnh báo tồn kho | `text-red-600` | Count of meds below min stock, clickable → switches to Tồn kho tab |

Each card: muted label (top), bold number (`text-2xl font-medium`).

### Filter Bar (`status-filters.tsx`)

Single row, space-between layout:

**Left — Search box:**
- shadcn `Input` with search icon
- Placeholder: "Tìm theo tên, mã BN, BS kê đơn..."
- Width: `w-[300px]`
- Debounce 300ms, searches across all prescriptions for the day

**Right — Filter pills:**

| Pill | Filter logic |
|------|-------------|
| Tất cả | Show all (default, active) |
| Chờ phát | Only status = "pending" |
| Đã phát | Only status = "dispensed" |

Single-select. Active pill: `bg-teal-50 text-teal-700 border-teal-200`. Inactive: `border-border text-muted-foreground`.

### Prescription Queue Table (`prescription-queue-table.tsx`)

Wrapped in `rounded-lg border border-border`. Uses shadcn `Table`.

**Columns:**

| Column | Width | Content |
|--------|-------|---------|
| Bệnh nhân | flex | Name (`font-medium`) + patient ID below (`text-xs text-muted-foreground`). Allergy icon (&#9888; amber) inline after name if applicable |
| BS kê đơn | auto | Doctor name |
| Thời gian | auto | Time of prescription + elapsed time below (`text-xs text-muted-foreground`) |
| Số thuốc | auto | Pill badge (e.g. "4 thuốc") — `bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full` |
| Trạng thái | auto | Status badge |
| Actions | `w-10` | Three-dot dropdown menu |

**Row highlights:**
- Allergy patient: `bg-amber-50 dark:bg-amber-950/20` subtle tint

**Status badges:**

| Status | Label | Style |
|--------|-------|-------|
| pending | Chờ phát | Dot `bg-amber-500` + text `text-amber-800` on `bg-amber-100` |
| dispensed | Đã phát | Dot `bg-emerald-500` + text `text-emerald-800` on `bg-emerald-100` |

**Sorting:**
- "Chờ phát" first, ascending by time (FIFO — oldest on top)
- "Đã phát" after, descending by time (most recent on top)

**Elapsed time display:**
- < 60 min: "X phút trước"
- 60–120 min: "1hXX phút trước"
- > 120 min: "Xh trước"
- "Đã phát" rows: show only timestamp, no elapsed

### Three-dot Dropdown (shadcn `DropdownMenu`)

**When status = "Chờ phát":**

| Action | Style | Behavior |
|--------|-------|----------|
| Phát thuốc | Primary text (`text-primary font-medium`) | Opens dispense modal |
| Xem đơn thuốc | Normal | Opens read-only prescription view |
| — | Separator | — |
| In đơn thuốc | Normal | Print prescription |

**When status = "Đã phát":**

| Action | Style | Behavior |
|--------|-------|----------|
| Xem đơn thuốc | Normal | View original prescription |
| Xem chi tiết phát thuốc | Normal | View dispensed details (incl. substitutions) |
| — | Separator | — |
| In đơn thuốc | Normal | Print prescription |
| In nhãn thuốc | Normal | Print labels per medication |

---

## Modal: Dispense Prescription (`dispense-modal.tsx`)

Opens from "Phát thuốc" action. Uses shadcn `Dialog` (or custom modal for width control). Width: `max-w-[680px]`.

### Modal Header

- Title: "Phát thuốc — [Tên bệnh nhân]" — `text-base font-medium`
- Close button (×) top-right

### Allergy Banner (conditional)

Only shown when patient has allergy history.

- `bg-red-50 border border-red-200 rounded-lg p-3`
- Icon &#9888; + text in `text-red-700 text-xs`
- Content: "Dị ứng: **[thành phần]** — Hệ thống sẽ cảnh báo nếu đơn thuốc chứa thành phần này"
- If a medication in the prescription contains the allergen → that row is blocked until substituted

### Prescription Info

Grid 2 columns (`grid grid-cols-2 gap-3`):

| Field | Content | Notes |
|-------|---------|-------|
| Mã bệnh nhân | BN-YYYYMMDD-XXXX | |
| BS kê đơn | Doctor name | |
| Chẩn đoán | Diagnosis + ICD code if available | |
| Hạn đơn thuốc | DD/MM/YYYY (còn X ngày) | Red text if ≤ 2 days remaining. Block dispensing if expired |

Labels: `text-xs text-muted-foreground`. Values: `text-sm font-medium`.

### Doctor Notes (conditional)

Shown only if doctor added notes. `bg-muted rounded-lg p-3 text-xs text-muted-foreground`. Bold label "Ghi chú BS:".

### Medication Table

Section label: "Danh sách thuốc trong đơn" — `text-xs font-medium text-muted-foreground mb-2`.

**Columns (no Tồn kho column):**

| Column | Width | Content |
|--------|-------|---------|
| Tên thuốc | 35% | Med name (`font-medium`) + group sub-label (`text-xs text-muted-foreground`) |
| Liều dùng | auto | Dosage instructions (`text-xs text-muted-foreground`) |
| Số lượng | auto | Quantity + unit |
| Thao tác | 80px | Substitute/edit button when needed |

**Stock status — inline indicators only for out-of-stock:**

| Condition | Display |
|-----------|---------|
| Sufficient stock | No indicator — clean row |
| Out of stock (qty = 0 or < needed) | Red badge below med name: "&#10007; Hết hàng" (`text-red-700 bg-red-100 text-xs px-2 py-0.5 rounded`). Row background: `bg-red-50`. "Thay thế" button appears in Thao tác column |

Low stock is **not** surfaced in the dispense modal — it belongs on the inventory tab.

**Substituted medication display:**
- Original med: struck through (`line-through text-muted-foreground`)
- Replacement below: `font-medium text-primary` with "→" prefix
- Sub-label: "Thay thế tương đương" in `text-xs text-primary`
- Thao tác column: "Sửa" button (`text-primary border text-xs`)

**Substitution flow (`substitute-medication-dialog.tsx`):**
1. Pharmacist clicks "Thay thế" on out-of-stock row
2. shadcn `Dialog` opens with search input, pre-filtered to same medication group
3. Results show: med name, group, stock quantity — only in-stock meds selectable
4. Select replacement → dialog closes → row updates with substitution display
5. Substitution reason textarea appears (if not already visible) and becomes required

### Substitution Reason (conditional)

Only shown when ≥ 1 medication is substituted.

- Section label: "Lý do thay thế thuốc"
- shadcn `Textarea`, pre-filled with default text (editable)
- Required — blocks confirm if empty

### Modal Footer

3 buttons, right-aligned (`flex justify-end gap-2`):

| Button | Style | Action |
|--------|-------|--------|
| In nhãn thuốc | `variant="outline"` | Print labels per medication |
| In đơn thuốc | `variant="outline"` | Print prescription (incl. substitutions) |
| Xác nhận phát thuốc | `variant="default"` (teal primary) | Validate + confirm dispensing |

**Validation before confirm:**
- Prescription not expired (≤ 7 days)
- All medications have sufficient stock (or have been substituted)
- If substitutions exist → reason field is not empty
- If allergen detected → medication must be substituted first

**After confirm:**
- Status → "Đã phát"
- Deduct stock for each dispensed medication
- Record: timestamp, pharmacist, medication details (incl. substitutions)
- Table row updates status
- Modal closes, return to queue

---

## Tab 2: Bán OTC (Placeholder)

Centered placeholder text: "Sẽ thiết kế chi tiết ở bước tiếp theo" — `text-muted-foreground text-sm`, vertically centered in `min-h-[200px]`.

---

## Tab 3: Tồn kho (Placeholder)

Same placeholder pattern as Tab 2.

---

## Data Layer

### Types (`src/lib/mock-data/pharmacy.ts`)

```typescript
type PrescriptionStatus = "pending" | "dispensed"

interface PrescriptionMedication {
  id: string
  name: string
  group: string           // e.g. "Nước mắt nhân tạo"
  dosage: string          // e.g. "4 lần/ngày, mỗi lần 1 giọt, cả 2 mắt"
  quantity: number
  unit: string            // e.g. "lọ", "tuýp", "hộp"
  stockQuantity: number
  isOutOfStock: boolean
  substitution?: {
    name: string
    group: string
    stockQuantity: number
    unit: string
  }
}

interface PrescriptionOrder {
  id: string
  patientName: string
  patientId: string       // e.g. "BN-20260403-0012"
  doctorName: string
  diagnosis: string
  icdCode?: string
  prescribedAt: Date
  dispensedAt?: Date
  expiresAt: Date
  status: PrescriptionStatus
  medications: PrescriptionMedication[]
  doctorNotes?: string
  allergies?: string[]    // allergen names
  substitutionReason?: string
}

interface PharmacyMetrics {
  pendingCount: number
  dispensedToday: number
  lowStockAlerts: number
}
```

### Mock Data

~6 prescription orders matching the HTML mockup data:
- 5 pending (including 1 with allergy: Trần Văn Minh)
- 1 dispensed (Đỗ Thị Thanh)
- Medication catalog subset for substitution search dialog

---

## Component File Summary

| File | Description |
|------|-------------|
| `src/pages/pharmacy.tsx` | Page component with header + tabs |
| `src/components/pharmacy/pharmacy-header.tsx` | Title + role badge |
| `src/components/pharmacy/kpi-cards.tsx` | 3 metric cards |
| `src/components/pharmacy/status-filters.tsx` | Search + filter pills |
| `src/components/pharmacy/prescription-queue-table.tsx` | Main queue table with dropdown actions |
| `src/components/pharmacy/dispense-modal.tsx` | Full dispense workflow modal |
| `src/components/pharmacy/view-prescription-modal.tsx` | Read-only prescription view |
| `src/components/pharmacy/substitute-medication-dialog.tsx` | Search & select replacement medication |
| `src/lib/mock-data/pharmacy.ts` | Types + mock data |

---

## Design Deviations from Original Spec

| Original Spec | This Design | Reason |
|---------------|-------------|--------|
| Purple accent (#534AB7) | Teal/blue-green (`primary`) | Consistent with project design system |
| Route `/dashboard` | Route `/pharmacy` | Consistent with module-based routing pattern |
| Tồn kho column in med table | Inline out-of-stock indicator only | Cleaner — only surfaces when action needed |
| Low stock warning in modal | Removed | Low stock belongs on inventory tab, not dispense flow |
