# Optical Staff — Action Screens Design

**Date:** 2026-04-04
**Module:** Trung tam kinh (Optical Center)
**Spec source:** `docs/optical-staff/optical-staff-actions.md`
**Mockups:** `.superpowers/brainstorm/13894-1775293849/content/`

---

## Overview

6 action screens for the optical staff dashboard. All follow the existing shadcn/ui + teal accent design system. Vietnamese labels throughout.

**Shared patterns:**
- Primary buttons: teal `#0d9488`, 8px 16px padding, 8px border-radius
- Secondary buttons: white bg, `#e2e8f0` border
- Section labels: 12px uppercase, `#475569`, 0.05em letter-spacing
- Info rows: 2-column grid, muted labels (`#64748b`), standard values
- Footer: right-aligned, border-top separator
- Monospace: Rx values, barcodes, order IDs
- Status badges: dot + label in rounded pill (green=ordered/paid, blue=fabricating/in-progress, teal=ready, gray=delivered/future, amber=waiting)

---

## Screen 1: Xem don kinh bac si (View Doctor Rx)

**Trigger:** "Xem don kinh BS" from three-dot menu in consultation tab.
**Type:** Dialog modal, max-width 560px.

### Layout (top to bottom)

1. **Patient info** — 40px avatar circle (initials, blue bg), name (14px, weight 500), secondary line: patient ID + gender + age (12px, `#64748b`). Separated by border-bottom.

2. **Rx table** — Section label "Thong so khuc xa". 6-column table (eye label, SPH, CYL, AXIS, ADD, PD). 2 rows: OD/OS. PD cell rowspan=2, centered. Values in monospace. "—" for empty ADD.

3. **Visual acuity table** — Section label "Thi luc". 3-column table (eye label, UCVA, BCVA). Snellen format (20/XX).

4. **Prescription info** — Section label "Thong tin chi dinh". 2x2 grid: Loai kinh, Muc dich su dung, BS chi dinh (prefix "BS."), Ngay ke (DD/MM/YYYY HH:mm). Each cell: 11px muted label + 13px value.

5. **Doctor notes** — Muted bg block (`#f8fafc`), 8px border-radius, 13px text. Hidden when empty.

6. **Footer** — "Dong" (secondary) + "Tao don kinh" (primary). "Tao don kinh" only shown when patient status is `in_consultation`.

### Component

File: `src/components/optical/view-rx-modal.tsx`

Props:
```ts
interface ViewRxModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation
  onCreateOrder?: () => void // only passed when in_consultation
}
```

### Mock data additions

Extend `OpticalConsultation` with Rx detail fields:
```ts
interface RxDetail {
  od: { sph: string; cyl: string; axis: number; add?: string }
  os: { sph: string; cyl: string; axis: number; add?: string }
  pd: number
  ucvaOd: string // UCVA OD
  bcvaOd: string // BCVA OD
  ucvaOs: string
  bcvaOs: string
  lensType: string
  purpose: string
  doctor: string
  prescribedAt: string // ISO
  notes?: string
}
```

---

## Screen 2: Tao don kinh (Create Order)

**Trigger:** "Tao don kinh" from three-dot menu (in_consultation) or from View Rx footer.
**Type:** Dialog modal, max-width 640px.

### Layout (top to bottom)

1. **Header** — "Tao don kinh — {Patient name}". Close button.

2. **Rx summary** — Muted bg block, monospace, single line: `Rx: OD {SPH}/{CYL}x{AXIS} | OS {SPH}/{CYL}x{AXIS} | PD {PD}`. Always visible while scrolling.

3. **Frame search section** — Section label "Gong kinh".
   - **Empty state:** Search input with icon, placeholder "Tim gong theo ten, thuong hieu, barcode...".
   - **Dropdown:** Appears on input (debounce 300ms). Each item: name (13px, 500), description line (color + barcode mono + stock colored), price right-aligned. No items with stock=0. Max 5-6 visible items, scrollable.
   - **Selected state:** Teal border (`#0d9488`) + light teal bg (`#f0fdfa`) card. Shows name, description, price, "Doi" button (small, secondary). Click "Doi" resets to search.

4. **Lens search section** — Section label "Trong kinh". Same pattern as frame. Dropdown items: name + refractive index + type, features line, price.

5. **Order summary** — Separator line above. Three rows:
   - Frame line: label + product name (or "chua chon" italic) + price (or "—")
   - Lens line: same pattern
   - Total line: 15px, weight 500, 2px top border. Shows sum or "—" if either missing.

6. **Notes** — Textarea, placeholder "Ghi chu them cho don kinh (tuy chon)...".

7. **Footer** — "Huy" (secondary, triggers unsaved confirmation if products selected) + "Tao don kinh" (primary, disabled until both frame and lens selected).

### Component

File: `src/components/optical/create-order-modal.tsx`

Props:
```ts
interface CreateOrderModalProps {
  open: boolean
  onClose: () => void
  consultation: OpticalConsultation
  frames: FrameItem[]
  lenses: LensItem[]
  onSubmit: (order: NewOpticalOrder) => void
}

interface NewOpticalOrder {
  consultationId: string
  frameBarcode: string
  lensCode: string
  notes?: string
}
```

### Search behavior

- Filter on name, brand, barcode (frames) or name, brand, refractive index (lenses)
- Case-insensitive, diacritics-insensitive
- Exclude items with stock=0
- Debounce 300ms
- Clear dropdown on blur or empty input

### Validation

- Both frame and lens required
- Race condition check: re-validate stock > 0 on submit

---

## Screen 3: Chi tiet don hang kinh (Order Detail)

**Trigger:** "Xem chi tiet" from three-dot menu in orders tab.
**Type:** Dialog modal, max-width 640px, body scrolls internally.

### Layout (top to bottom)

1. **Patient + status** — Flex space-between. Left: name (14px, 500) + secondary line (ID, gender, age, phone). Right: status badge pill.

2. **Rx table** — Section label "Thong so khuc xa (Rx bac si)". Same table structure as Screen 1.

3. **Products** — Section label "San pham". Info-row grid (100px label column): Gong (name + color), Barcode gong (mono), Trong (name + spec), Loai kinh (type + lens type).

4. **Payment** — Section label "Thanh toan". Frame price, lens price, total (15px, 500, 2px border-top). Payment status badge below: green "Da thanh toan" or amber "Cho thanh toan".

5. **Timeline** — Section label "Lich su trang thai". Vertical timeline, 4 steps:
   - Completed: green-filled dot, green border, bold label + datetime + staff name
   - Current: blue-filled dot, blue border, blue label + datetime + staff name
   - Future: empty dot, gray border, muted label + "—"
   - Connecting lines: 2px vertical, `#e2e8f0`, between dots

6. **Notes** — Muted bg block. Hidden when empty.

7. **Footer** — Changes by status:
   - `ordered`: "In don kinh" (secondary) + "Bat dau gia cong" (primary)
   - `fabricating`: "In don kinh" + "Hoan thanh gia cong"
   - `ready_delivery`: "In don kinh" + "Xac nhan giao kinh"
   - `delivered`: "In don kinh" only

### Component

File: `src/components/optical/order-detail-modal.tsx`

Props:
```ts
interface OrderDetailModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder
  onStartFabrication?: () => void
  onCompleteFabrication?: () => void
  onConfirmDelivery?: () => void
}
```

### Mock data additions

Extend `OpticalOrder` with:
```ts
interface OrderDetailData extends OpticalOrder {
  rx: RxDetail
  frameColor: string
  frameBarcode: string
  lensSpec: string
  lensType: string // "Don trong", "Da trong"
  glassType: string // "Kinh can", "Kinh lao"...
  framePrice: number
  lensPrice: number
  paymentStatus: "paid" | "pending"
  timeline: TimelineStep[]
  notes?: string
}

interface TimelineStep {
  status: string
  label: string
  completedAt?: string // ISO
  staffName?: string
}
```

---

## Screen 4: Xac nhan giao kinh (Delivery Confirmation)

**Trigger:** "Xac nhan giao kinh" from three-dot menu (ready_delivery) or order detail footer.
**Type:** Dialog modal, max-width 560px.

### Layout (top to bottom)

1. **Order info** — Name (14px, 500) + secondary line (order ID + frame name + lens name). Border-bottom separator.

2. **Delivery method** — Section label "Hinh thuc giao". Vertical radio group, 2 options as cards:
   - "Nhan tai phong kham" (default selected)
   - "Giao hang (ship)"
   - Selected: teal border (1.5px `#0d9488`) + light teal bg (`#f0fdfa`) + filled radio circle
   - Unselected: gray border (`#e2e8f0`) + empty radio circle

3. **Shipping fields** (conditional, shown when "Giao hang" selected):
   - Address text input (required)
   - Carrier select dropdown: Grab, GHTK, GHN, Bee / Xanh SM, Tu giao (required)

4. **Common fields:**
   - Receiver name input (required, pre-filled with patient name)
   - Delivery notes textarea (optional)

5. **Footer** — "Huy" + "Xac nhan giao kinh" (primary)

### Component

File: `src/components/optical/delivery-confirm-modal.tsx`

Props:
```ts
interface DeliveryConfirmModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder
  onConfirm: (data: DeliveryData) => void
}

interface DeliveryData {
  method: "pickup" | "shipping"
  receiver: string
  address?: string
  carrier?: string
  notes?: string
}
```

### Validation

- Shipping mode: address and carrier required
- Receiver always required

---

## Screen 5: Chuyen trang thai (Status Transition)

**Trigger:** "Bat dau gia cong" (ordered) or "Hoan thanh gia cong" (fabricating) from three-dot menu or order detail footer.
**Type:** Dialog modal, max-width 420px, centered content.

### Layout (top to bottom, centered)

1. **Icon** — 48px circle, blue bg (`#dbeafe`), checkmark SVG in blue.

2. **Order info** — Order code (14px, code in 500 weight) + secondary line (patient + frame + lens).

3. **Transition block** — Muted bg (`#f8fafc`), 8px border-radius. Contains:
   - Old status badge → arrow → New status badge (centered flex)
   - Description text below: "Trang thai se chuyen tu '{old}' sang '{new}'"
   - Valid transitions: ordered→fabricating, fabricating→ready_delivery

4. **Notes** — Textarea with label "Ghi chu (tuy chon)", optional.

5. **Footer** — "Huy" + "Xac nhan" (primary)

### Component

File: `src/components/optical/status-transition-modal.tsx`

Props:
```ts
interface StatusTransitionModalProps {
  open: boolean
  onClose: () => void
  order: OpticalOrder
  targetStatus: "fabricating" | "ready_delivery"
  onConfirm: (notes?: string) => void
}
```

---

## Screen 6: Chi tiet kho (Inventory Detail Drawer)

**Trigger:** "Xem chi tiet" from three-dot menu in inventory tab (frames or lenses).
**Type:** Sheet/Drawer, slides from right, max-width 480px, overlay click to close.

### View Mode Layout

1. **Image placeholder** — 140px height, dashed border, muted bg, centered text "Hinh anh gong kinh" / "Hinh anh trong kinh". V1 placeholder only.

2. **Main info** — Product name (16px, 500), description (color + material for frames, type + refractive index for lenses), barcode/code in monospace.

3. **Specs grid** — Section label "Thong so". 2-column grid of cards (muted bg, 8px border-radius). Each card: 11px muted label + 13px 500 value.
   - Frames: brand, color, material, size (lens-bridge-temple), gender, origin
   - Lenses: brand, refractive index, type, coating, design, origin

4. **Price & stock** — Section label "Gia & ton kho". Info-row grid (110px labels):
   - Cost price, selling price (500 weight), gross margin (green, amount + percentage), stock (green if > threshold, red if <=), warning threshold
   - Margin formula: `(sell - cost) / sell * 100`, rounded to integer

5. **Stock history** — Section label "Lich su xuat/nhap gan day". 4-column table (date DD/MM, type colored, quantity signed, note/order ID). Max 5 rows.

6. **Footer** — Sticky bottom. "Dong" (secondary) + "Chinh sua" (primary).

### Edit Mode Layout

Triggered by "Chinh sua" button. Same drawer, content changes:

1. **Image placeholder** — Same as view mode.

2. **Main info** — Read-only: name, brand subtitle ("Thuong hieu va ten khong the chinh sua"), barcode.

3. **Editable fields** — Section label "Chinh sua". Standard form inputs:
   - Selling price (number, required, > 0)
   - Color (frames) or Coating (lenses) — text
   - Material (frames) or Design (lenses) — text
   - Origin — text
   - Warning threshold (number, required, >= 0)

4. **Footer** — "Huy" (back to view, no save) + "Luu thay doi" (primary, validate then save).

### Component

File: `src/components/optical/inventory-detail-drawer.tsx`

Props:
```ts
interface InventoryDetailDrawerProps {
  open: boolean
  onClose: () => void
  item: FrameItem | LensItem
  type: "frame" | "lens"
  onSave: (updates: InventoryUpdates) => void
}

interface InventoryUpdates {
  sellingPrice: number
  color?: string        // frames
  material?: string     // frames
  coating?: string      // lenses
  design?: string       // lenses
  origin?: string
  lowStockThreshold: number
}
```

### Mock data additions

Extend frame/lens items with detail fields:
```ts
interface FrameDetail extends FrameItem {
  material: string
  size: string         // "53-17-140"
  gender: string       // "Unisex" / "Nam" / "Nu"
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
}

interface LensDetail extends LensItem {
  coating: string
  design: string       // "Aspherical (AS)"
  origin: string
  costPrice: number
  stockHistory: StockHistoryEntry[]
}

interface StockHistoryEntry {
  date: string         // ISO
  type: "in" | "out"
  quantity: number
  note: string         // reason or order ID
}
```

---

## Shared Behaviors

### Modal behavior
- Overlay: `rgba(0,0,0,0.35)`, click to close (unless unsaved changes)
- Escape key closes
- Body scrolls internally, page does not scroll

### Unsaved changes confirmation
When user has modified form data and attempts to close (Escape, overlay click, cancel button):
- Show confirmation: "Ban co chac muon dong? Du lieu chua luu se bi mat."
- Two buttons: "Tiep tuc chinh sua" (secondary) + "Dong khong luu" (primary)
- Applies to: Create Order (if products selected), Delivery Confirm (if fields changed), Inventory Edit (if values changed)

### Loading state
- Primary button: disabled + text "Dang xu ly..."
- Success: close modal + toast notification
- Error: show error in modal, re-enable button

### Toast notifications (sonner)
- Position: top-right, auto-dismiss 3s
- Messages per action:
  - Create order: "Da tao don kinh thanh cong"
  - Start fabrication: "Da chuyen trang thai sang Dang gia cong"
  - Complete fabrication: "Da chuyen trang thai sang San sang giao"
  - Confirm delivery: "Da xac nhan giao kinh thanh cong"
  - Save inventory edit: "Da luu thay doi"

### Currency format
- Vietnamese thousands separator (dot): `2.800.000`
- No currency symbol
- Use existing `formatPrice()` from `mock-optical.ts`

---

## File Structure

```
src/components/optical/
  view-rx-modal.tsx          # Screen 1
  create-order-modal.tsx     # Screen 2
  order-detail-modal.tsx     # Screen 3
  delivery-confirm-modal.tsx # Screen 4
  status-transition-modal.tsx # Screen 5
  inventory-detail-drawer.tsx # Screen 6
```

No new UI primitives needed. Uses existing: Dialog, Button, Input, Textarea, Select, Badge, Sheet (for drawer), Sonner (for toasts).
