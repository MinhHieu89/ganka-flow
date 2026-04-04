# Pharmacist OTC Sales — Design Spec

**Module:** Nhà thuốc (Pharmacy) — Tab Bán OTC
**Role:** Dược sĩ (Pharmacist)
**Date:** 2026-04-04

## Overview

POS-style OTC sales screen within the existing pharmacy dashboard's "Bán OTC" tab. Pharmacist handles the entire flow: select/create customer, add products, choose payment method, checkout. No doctor or cashier involvement.

## Decisions Made

| Decision | Choice | Rationale |
|---|---|---|
| KPI cards on main screen | No — pure POS layout | Spec doesn't mention KPIs on selling screen; history view has its own metrics |
| Product list behavior | Search-first (empty until typing) | Clean, focused; pharmacist knows what they need |
| Left column layout | Two separate cards (customer + product) | Follows spec exactly; customer always visible above product search |
| OTC product catalog size | ~8-10 mock products | Covers all spec categories without bloating mock data |
| "Xem chi tiết" in history | Reuse invoice modal (read-only) | Spec says "tương tự hóa đơn"; avoids near-duplicate component |

## Components

### 1. Main Selling Screen (replaces OTC tab content)

Two-column POS layout. No KPI cards at top.

**Left column (flex: 1):**

**Customer Card:**
- Search box: "Tìm theo tên hoặc SĐT..." — searches existing customers
- Selected state: name (font-weight 500) + phone, "Đổi" link to switch
- "+ Tạo khách hàng mới" link opens create customer modal
- Customer is required before checkout

**Product Card (flex: 1, fills remaining height):**
- Search box: "Tìm thuốc OTC..."
- Empty state: "Nhập tên sản phẩm để tìm kiếm" centered text
- Search results: flat list, each row shows:
  - Name (font-weight 500)
  - Manufacturer + form factor (sub-label, secondary color)
  - Price (right-aligned)
  - Stock count (right-aligned, green if available)
- Click adds 1 unit to order (or increments if already in order)
- Out-of-stock items: name in tertiary color, stock shows red "Hết hàng", not clickable

**Right column (width ~38%, sticky):**

**Order Panel:**
- Header: "Đơn hàng" + badge "[N] sản phẩm"
- Empty state: "Chọn sản phẩm từ danh sách bên trái"
- Each item card:
  - Name (font-weight 500)
  - "Xóa" link (red, top-right)
  - −/+ quantity controls with current count between them
  - Unit price × qty breakdown + subtotal (right-aligned)
- Total line: font-size 15px, font-weight 500
- Payment method pills (4): Tiền mặt (default), Chuyển khoản, QR code, Thẻ — single select
- Primary button: "Thanh toán [formatted amount]" — full width, disabled when empty/no customer
- History link: "Xem lịch sử bán OTC hôm nay" at bottom

**Validation before checkout:**
- Customer selected
- At least 1 product in order
- Payment method selected (Tiền mặt is default, so always satisfied)
- All products have sufficient stock

### 2. Modal: Tạo khách hàng mới

Triggered by "+ Tạo khách hàng mới" link.

**Form — 2-column grid:**

| Field | Required | Placeholder |
|---|---|---|
| Họ tên | Yes (*) | "Nhập họ tên..." |
| Số điện thoại | Yes (*) | "0xxx.xxx.xxx" |
| Ngày sinh | No | "DD/MM/YYYY" |
| Giới tính | No | "Chọn..." (Nam / Nữ dropdown) |

Note below form: "Chỉ bắt buộc Họ tên + SĐT. Các trường khác có thể bổ sung sau."

**Validation:**
- Name not empty
- Phone not empty, 10 digits starting with 0
- Phone not duplicate — if exists, show message with link to existing customer

**Actions:** Hủy (secondary) | Tạo khách hàng (primary) — auto-selects into customer card on success.

### 3. Modal: Thanh toán thành công

Triggered after successful payment. Centered layout.

- Green circle checkmark icon
- Amount: 24px, font-weight 500
- "[Payment method] — [Customer name] — [Phone]"
- "DD/MM/YYYY, HH:mm — Mã đơn: OTC-YYYYMMDD-XXXX"

**Actions (3 buttons, horizontal):**
- In nhãn thuốc (secondary) — opens label print modal
- In hóa đơn (secondary) — opens invoice modal
- Đơn hàng mới (primary) — resets POS screen for new order

### 4. Modal: In hóa đơn

Paper-style invoice preview. Reused for "Xem chi tiết" from history view.

**Invoice layout:**
- Header (centered): clinic name, address + phone, "HÓA ĐƠN BÁN HÀNG", order code
- Customer info (2-col grid): name, phone (masked: 0987.xxx.xxx), date, "DS. [pharmacist name]"
- Product table: STT | Sản phẩm | ĐVT | SL | Đơn giá | Thành tiền
- Total (right-aligned, 14px, weight 500) + payment method
- Footer: "Cảm ơn quý khách!" (left) + "PK Ganka28" (right)

**Actions:** Tải PDF (secondary) | In hóa đơn (primary)

### 5. Modal: In nhãn thuốc OTC

Preview labels for each product. Each label is a dashed-border card (70×35mm feel).

**Label layout:**
- Header: product name (left, weight 500) | "PK Ganka28" + date (right)
- Body: "KH: **[customer name]**" (not "BN:") | "Cách dùng: [usage instructions]"
- Footer: "DS. [pharmacist name]" (left) | "SL: [qty + unit]" (right)

**Actions:** Chọn nhãn cần in (secondary) | In tất cả nhãn (primary)

### 6. View: Lịch sử bán OTC hôm nay

Replaces tab content (not a modal). Has back navigation.

**Header:** "Lịch sử bán OTC hôm nay" + "← Quay lại bán hàng" (right-aligned)

**KPI cards (3-column grid):**
- Số đơn hôm nay — total OTC orders today
- Doanh thu OTC — total revenue, formatted X.XXX.XXXđ
- Sản phẩm đã bán — total product quantity sold

**History table (sorted newest first):**

| Column | Content |
|---|---|
| Mã đơn | OTC-YYYYMMDD-XXXX (12px, tertiary) |
| Khách hàng | Name (weight 500) + phone (sub-label) |
| Thời gian | HH:mm |
| Sản phẩm | "[N] sản phẩm" |
| Tổng tiền | Amount (weight 500) |
| Thanh toán | Payment method |
| Actions | Three-dot menu |

**Three-dot dropdown:**
- Xem chi tiết — opens invoice modal (read-only)
- In hóa đơn — opens invoice modal
- In nhãn thuốc — opens label modal

## Mock Data

### OTC Product Catalog (~8-10 items)

Products covering all spec categories:
- Artificial tears: Refresh Tears, Systane Ultra, Optive Fusion
- Supplements: Omega-3 Eye Formula, Lutein Plus
- OTC eye drops: Visine Original, Rohto Cool
- Eye care: Warm Eye Compress, Lid Wipes
- One out-of-stock item for UI demonstration

Each product: id, name, manufacturer, form factor, unit (lọ/hộp/tuýp/miếng), price, stock quantity, usage instructions (for labels).

### OTC Customers

3-4 walk-in customers (simple: name + phone, optional DOB/gender). These are separate from patient records — no medical history.

### OTC Orders (history)

3-4 sample orders for today with varied payment methods, different customers, different product combinations. Sorted by time descending.

## File Structure

```
src/
  components/pharmacy/
    otc-pos.tsx              — Main 2-column POS layout (orchestrator)
    otc-customer-card.tsx    — Customer search + selection card
    otc-product-card.tsx     — Product search + results list
    otc-order-panel.tsx      — Order panel (right column)
    otc-create-customer-modal.tsx  — Create customer modal
    otc-payment-success-modal.tsx  — Payment confirmation modal
    otc-invoice-modal.tsx    — Invoice preview + print modal
    otc-label-modal.tsx      — Label preview + print modal
    otc-history.tsx          — History view (KPI cards + table)
    otc-history-kpi-cards.tsx — History KPI cards
  data/
    mock-otc.ts              — OTC products, customers, orders, helper functions
```

The main `otc-pos.tsx` component will be rendered inside the existing `TabsContent value="otc"` in `src/pages/pharmacy/index.tsx`.

## State Management

Local state within the OTC tab (no context provider needed for mock):
- `selectedCustomer` — current customer or null
- `orderItems` — array of { product, quantity }
- `paymentMethod` — 'cash' | 'transfer' | 'qr' | 'card'
- `view` — 'pos' | 'history' (toggles between selling and history)
- `orders` — array of completed OTC orders (for history)
- Modal visibility states for each modal

## Order Code Format

`OTC-YYYYMMDD-XXXX` — auto-increment within the day. Mock data starts at 0001.
