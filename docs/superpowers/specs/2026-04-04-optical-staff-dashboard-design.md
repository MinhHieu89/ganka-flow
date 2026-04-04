# Optical Staff Dashboard — Design Spec

**Module:** Trung tâm kính (Optical Center)
**Route:** `/optical`
**Date:** 2026-04-04
**Functional spec:** `docs/optical-staff/optical-staff-dashboard.md`

---

## 1. Overview

Dashboard for optical staff (nhân viên kính) to manage the full eyewear workflow: from doctor prescription to patient delivery. Three main tabs: Tư vấn kính, Đơn hàng kính, Kho kính.

This is a static frontend mockup with mock data, following the same patterns as the existing Pharmacy dashboard (tab-per-file architecture).

## 2. Architecture — Option B (Tab-per-file)

```
src/
├── pages/optical/index.tsx              # Shell: header, date, tabs, badge counts
├── components/optical/
│   ├── tab-consultation.tsx             # Tab 1: KPI + filters + consultation queue
│   ├── tab-orders.tsx                   # Tab 2: KPI + filters + orders table
│   ├── tab-inventory.tsx                # Tab 3: KPI + sub-tab button group + tables
│   ├── consultation-queue.tsx           # Queue table for consultation tab
│   ├── order-table.tsx                  # Orders table
│   ├── frame-table.tsx                  # Frames inventory table
│   ├── lens-table.tsx                   # Lens inventory table
│   ├── status-filters.tsx              # Shared filter button component
│   └── kpi-cards.tsx                   # KPI card configs per tab
└── data/mock-optical.ts                # All mock data
```

## 3. Page Shell (`pages/optical/index.tsx`)

### Header
- Title: "Trung tâm kính"
- Date: `Thứ X, DD/MM/YYYY` format (current date)
- User badge: `Nhân viên kính: {tên_user}` — bg secondary, rounded

### Tabs
- Use shadcn `Tabs` with `variant="line"` (underline style, matching Pharmacy)
- 3 tabs with badge counts:
  - "Tư vấn kính" — badge: count of `waiting_consultation` + `in_consultation`
  - "Đơn hàng kính" — badge: count of `ordered` + `fabricating` + `ready_delivery`
  - "Kho kính" — no badge
- Badge style: pill, dark bg when tab active, amber bg when inactive

## 4. Tab 1: Tư vấn kính (`tab-consultation.tsx`)

### KPI Cards (4-column grid)

| Card | Value color | Highlight condition |
|---|---|---|
| Chờ tư vấn | amber (`text-amber-500`) | Amber border+bg when count > 0 |
| Đang tư vấn | blue (`text-blue-600`) | — |
| Đã tạo đơn hôm nay | emerald (`text-emerald-600`) | — |
| Đã giao hôm nay | default (`text-foreground`) | — |

### Toolbar
- Search input (280px): placeholder "Tìm theo tên, mã BN, SĐT..."
- Filter buttons: `Tất cả` (default active), `Chờ tư vấn`, `Đang tư vấn`
- Filter style: dark bg when active (`bg-foreground text-background`), matching Doctor dashboard

### Consultation Queue Table (`consultation-queue.tsx`)

| Column | Content | Notes |
|---|---|---|
| STT | Sequential number | Width 40px |
| Bệnh nhân | Name (font-weight 500) + Mã BN (12px, secondary) | ID format: `BN-YYYYMMDD-XXXX` |
| BS chỉ định | Doctor name | Prefix "BS." |
| Đơn kính BS | OD + OS on 2 lines: `SPH / CYL x AXIS` or `SPH ADD +X.XX` | 12px, mono font, secondary color |
| Trạng thái | Badge | See below |
| Thời gian chờ | Minutes since queue entry | 12px; red + bold if >= 30 min |
| Actions | Three-dot dropdown | Ghost button, vertical dots icon |

### Status Badges
- `waiting_consultation` → amber badge (`bg-amber-100 text-amber-800`)
- `in_consultation` → blue badge (`bg-blue-100 text-blue-800`)

### Row Highlighting
- `in_consultation` rows: `bg-blue-50` background
- Sorted: `in_consultation` rows on top, then by wait time descending

### Three-dot Dropdown Actions

**When status = `waiting_consultation`:**
| Action | Icon |
|---|---|
| Nhận BN | UserAdd icon |
| Xem đơn kính BS | Eye/view icon |

**When status = `in_consultation`:**
| Action | Icon |
|---|---|
| Tạo đơn kính | File-plus icon |
| Xem đơn kính BS | Eye/view icon |
| *(separator)* | |
| Trả lại hàng đợi | Undo/return icon |

Action button style: `Button variant="ghost" size="icon" className="size-7"` with `MoreVerticalIcon` (matching Pharmacy/Receptionist).

## 5. Tab 2: Đơn hàng kính (`tab-orders.tsx`)

### KPI Cards (4-column grid)

| Card | Value color | Highlight condition |
|---|---|---|
| Đã đặt | green (`text-green-600`) | — |
| Đang gia công | blue (`text-blue-600`) | Amber border+bg when count > 0 |
| Sẵn sàng giao | teal (`text-teal-600`) | — |
| Đã giao hôm nay | default (`text-foreground`) | — |

### Toolbar
- Search: placeholder "Tìm theo mã đơn, tên BN..."
- Filter buttons: `Tất cả`, `Đã đặt`, `Đang gia công`, `Sẵn sàng giao`, `Đã giao`

### Orders Table (`order-table.tsx`)

| Column | Content | Notes |
|---|---|---|
| Mã đơn | `DK-YYYYMMDD-XXX` | Mono font, 12px |
| Bệnh nhân | Name + Mã BN | Same as Tab 1 |
| Loại kính | Kính cận / Kính lão / Kính đa tròng / Kính mát có độ | — |
| Gọng | Model name + Color (12px, secondary) | 2 lines |
| Tròng | Name + Chiết suất/Loại (12px, secondary) | 2 lines |
| Ngày đặt | DD/MM format | — |
| Trạng thái | Badge | See below |
| Actions | Three-dot dropdown | Ghost button |

### Status Badges
- `ordered` → green badge (`bg-green-100 text-green-800`)
- `fabricating` → blue badge (`bg-blue-100 text-blue-800`)
- `ready_delivery` → teal badge (`bg-teal-100 text-teal-800`)
- `delivered` → gray badge (`bg-secondary text-secondary-foreground`)

### Row Styling
- `delivered` rows: `opacity-55`, sorted to bottom
- Default sort: oldest orders first (prioritize processing)

### Three-dot Dropdown Actions

**Status = `ordered`:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| Bắt đầu gia công | Settings/gear icon |
| In đơn kính | Printer icon |

**Status = `fabricating`:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| Hoàn thành gia công | Checkmark icon |
| In đơn kính | Printer icon |

**Status = `ready_delivery`:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| Xác nhận giao kính | Circle-check icon |
| In đơn kính | Printer icon |
| *(separator)* | |
| Liên hệ BN | Phone icon |

**Status = `delivered`:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| In đơn kính | Printer icon |

## 6. Tab 3: Kho kính (`tab-inventory.tsx`)

### KPI Cards (3-column grid)

| Card | Value color | Highlight condition |
|---|---|---|
| Tổng gọng kính | default | — |
| Tổng tròng kính | default | — |
| Sắp hết hàng | amber (`text-amber-500`) | Amber border+bg when count > 0 |

Subtitle for first two: "SKU". Third: "SKU cần bổ sung".

### Sub-tab Button Group
- Two buttons: "Gọng kính" (default active), "Tròng kính"
- Style: border group, first button rounded-l, last rounded-r
- Active: `bg-foreground text-background` (dark bg, white text)
- Inactive: white bg, gray border, hover `bg-muted`

### Sub-tab: Gọng kính (`frame-table.tsx`)

**Toolbar:**
- Search: "Tìm theo tên, mã barcode, thương hiệu..."
- Filters: `Tất cả`, `Còn hàng`, `Sắp hết`, `Hết hàng`

**Table columns:**

| Column | Content | Notes |
|---|---|---|
| Barcode | `GK-FR-XXXXX` | Mono font, 12px |
| Tên gọng | Model name | — |
| Thương hiệu | Brand | — |
| Màu sắc | Color | — |
| Giá bán | Formatted with commas | tabular-nums |
| Tồn kho | Count | Green if > threshold, red+bold if <= threshold or 0 |
| Actions | Three-dot dropdown | Ghost button |

**Actions:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| Chỉnh sửa | Edit/pencil icon |
| Lịch sử xuất/nhập | History/clock icon |

### Sub-tab: Tròng kính (`lens-table.tsx`)

**Toolbar:**
- Search: "Tìm theo tên tròng, thương hiệu, chiết suất..."
- Filters: `Tất cả`, then brand filters from master data (Essilor, Hoya, Việt Pháp)

**Table columns:**

| Column | Content | Notes |
|---|---|---|
| Mã tròng | `GK-LN-XXX` | Mono font, 12px |
| Tên tròng | Product name | — |
| Thương hiệu | Brand | — |
| Chiết suất | 1.50 / 1.56 / 1.60 / 1.67 / 1.74 | — |
| Loại | Đơn tròng / Đa tròng | — |
| Giá bán | Formatted with commas | tabular-nums |
| Tồn kho | Count | Same color rules as frames |
| Actions | Three-dot dropdown | Ghost button |

**Actions:**
| Action | Icon |
|---|---|
| Xem chi tiết | Eye icon |
| Chỉnh sửa | Edit/pencil icon |

## 7. Mock Data (`data/mock-optical.ts`)

### Types

```typescript
type ConsultationStatus = "waiting_consultation" | "in_consultation"
type OrderStatus = "ordered" | "fabricating" | "ready_delivery" | "delivered"
type StockStatus = "in_stock" | "low_stock" | "out_of_stock"

interface OpticalConsultation {
  id: string
  patientName: string
  patientId: string       // BN-YYYYMMDD-XXXX
  doctor: string
  rxOd: string            // e.g. "-2.50 / -0.75 x 180"
  rxOs: string            // e.g. "-3.00 / -1.00 x 175"
  status: ConsultationStatus
  assignedStaff?: string
  queuedAt: string        // ISO datetime
}

interface OpticalOrder {
  id: string              // DK-YYYYMMDD-XXX
  patientName: string
  patientId: string
  lensType: string        // Kính cận, Kính lão, etc.
  frameName: string
  frameColor: string
  lensName: string
  lensSpec: string        // e.g. "Chiết suất 1.60"
  orderDate: string       // ISO date
  status: OrderStatus
  deliveredAt?: string
  phone?: string
}

interface FrameItem {
  barcode: string         // GK-FR-XXXXX
  name: string
  brand: string
  color: string
  price: number
  stock: number
  lowStockThreshold: number  // default 3
}

interface LensItem {
  code: string            // GK-LN-XXX
  name: string
  brand: string
  refractiveIndex: string // "1.56", "1.60", etc.
  type: string            // "Đơn tròng" | "Đa tròng"
  price: number
  stock: number
  lowStockThreshold: number
}
```

### Mock data counts
- 5 consultations (3 waiting, 2 in_consultation)
- 12 orders (3 ordered, 3 fabricating, 2 ready_delivery, 4 delivered)
- 7+ frame SKUs (mix of Rayban, Oakley, Việt Pháp; some low/out of stock)
- 8+ lens SKUs (Essilor, Hoya, Việt Pháp; some low stock)

## 8. Routing & Sidebar Integration

### Route
Add to `App.tsx`:
```tsx
<Route path="/optical" element={<OpticalDashboard />} />
```

### Sidebar nav item
Add to `app-sidebar.tsx` nav items:
```tsx
{ title: "Trung tâm kính", url: "/optical", icon: EyeIcon }
```
Position: after "Nhà thuốc" (Pharmacy).

## 9. Shared Patterns

All components follow existing codebase conventions:
- `cn()` for class merging
- `HugeiconsIcon` for all icons
- `Button variant="ghost" size="icon"` for three-dot menu triggers
- `DropdownMenu` / `DropdownMenuItem` / `DropdownMenuSeparator` from shadcn
- Debounced search (300ms)
- Filter buttons: single-select, dark bg when active
- KPI cards: `rounded-lg border` with icon, colored value, subtitle
- Price formatting: `Intl.NumberFormat('vi-VN')` or manual comma formatting
- Stock colors: green (`text-green-600`) for normal, red (`text-destructive font-medium`) for low/out

## 10. Out of Scope

These are referenced in the functional spec but not included in this mockup:
- Optical order creation form (`optical-order-form.md`)
- Order detail drawer/page (`optical-order-detail.md`)
- Inventory detail drawer (`optical-inventory-detail.md`)
- Inventory import form
- Warranty management
- Zalo notification integration
- Cashier payment integration
