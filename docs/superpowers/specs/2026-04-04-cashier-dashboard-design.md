# Cashier Dashboard — Design Spec

## Overview

Cashier-facing dashboard for Ganka Flow. Central workspace for the cashier role during a shift: tracks daily revenue metrics, manages the payment queue, and reviews completed transactions. Two-tab layout with KPI cards always visible above tabs.

**Route:** `/payment`
**Source spec:** `docs/cashier/cashier-dashboard.md`
**HTML mockup references:**
- Queue tab: `.superpowers/brainstorm/15055-1775311597/content/dashboard-queue-tab.html`
- Transactions tab: `.superpowers/brainstorm/15055-1775311597/content/dashboard-transactions-tab.html`

---

## Sidebar Navigation

Add new nav item to `AppSidebar`:

| Order | Label | Icon | Route |
|-------|-------|------|-------|
| After "Trung tâm kính" | Thu ngân | `Invoice03Icon` (Hugeicons) | `/payment` |

---

## Page: Cashier Dashboard (`/payment`)

### Page Header

Two-part header with flex space-between layout.

**Left side:**
- Title: "Thu ngân" — `text-xl font-medium`
- Date: Full Vietnamese format "Thứ Bảy, 05/04/2026" — `text-[13px] text-muted-foreground`

**Right side:**
- Shift badge: Pill with green dot + shift text (e.g. "Ca chiều · 13:00–20:00") — `bg-green-50 border border-green-200 text-green-800 text-xs rounded-full px-3 py-1`
- Shift action button: Outline button, label depends on shift state

**Shift states:**

| State | Badge text | Badge style | Button |
|-------|-----------|-------------|--------|
| Chưa mở ca | "Chưa mở ca" | Warning style (amber) | "Mở ca" |
| Đang trong ca | "Ca chiều · 13:00–20:00" | Green dot + green bg | "Chốt ca" |
| Ca đã chốt | "Ca chiều · Đã chốt 20:15" | Grey dot + grey bg | — (no button) |

---

### KPI Cards (`cashier-kpi-cards.tsx`)

Grid 4 columns (`grid grid-cols-4 gap-3`). Always visible above tabs — metrics cover the whole day, not per-tab.

| # | Label | Value | Sub-text |
|---|-------|-------|----------|
| 1 | Doanh thu hôm nay | Total revenue (paid transactions) | "{n} giao dịch" |
| 2 | Tiền mặt | Cash total | "{n} giao dịch" |
| 3 | Chuyển khoản / QR | Bank transfer + QR total | "{n} giao dịch" |
| 4 | Thẻ | Card (Visa/Mastercard) total | "{n} giao dịch" |

Each card: `bg-white border rounded-[10px] p-[14px_16px]`
- Label: `text-xs text-muted-foreground`
- Value: `text-xl font-semibold` — formatted as Vietnamese currency (`18.450.000đ`)
- Sub-text: `text-[11px] text-muted-foreground`

**Rules:**
- Only counts completed payments (not pending or refunded)
- Scope: full day 00:00–23:59, all shifts
- Show `0đ` and `0 giao dịch` when no transactions
- Update real-time when a transaction completes

---

### Tab Navigation

Uses shadcn `Tabs` component. Two tabs below KPI cards:

| Tab | Label | Badge | Default |
|-----|-------|-------|---------|
| 1 | Chờ thanh toán | Red badge with pending count | **Active** |
| 2 | Giao dịch hôm nay | Neutral grey badge with count | — |

Active tab: `font-medium`, teal border-bottom (`border-primary`).

---

## Tab 1: Chờ thanh toán (Payment Queue)

### Queue Table (`cashier-queue-table.tsx`)

FIFO order — patients who have been waiting longest appear first.

| Column | Width | Content |
|--------|-------|---------|
| STT | 36px | Queue position, starting from 1 |
| Bệnh nhân | auto | **Line 1:** Full name — `font-medium text-[13px]`. **Line 2:** Patient ID (BN-YYYYMMDD-XXXX) — `text-[11px] text-muted-foreground` |
| SĐT | auto | Phone formatted as `0912 345 678` (4-3-3 spacing) — `text-xs text-muted-foreground` |
| Loại thanh toán | auto | One or more colored badges indicating payment types |
| Tạm tính | auto, right-align | Pre-discount total — `font-medium`, Vietnamese currency format |
| Chờ | auto | Wait time in minutes. Normal: `text-muted-foreground`. Alert (>= 10 min): `text-[#A32D2D] font-medium` |
| Actions | 48px | Three-dot menu button |

**Payment type badges:**

| Badge | Background | Text color | Meaning |
|-------|-----------|------------|---------|
| Khám | `#E6F1FB` | `#0C447C` | Exam fee |
| Thuốc | `#E1F5EE` | `#085041` | Prescription / OTC drugs |
| Kính | `#EEEDFE` | `#3C3489` | Frames, lenses, combos |
| Liệu trình | `#FAEEDA` | `#633806` | IPL, LLLT, lash care |

A single patient can have multiple badges if the payment request covers multiple departments.

**Empty state:** Centered text "Không có bệnh nhân chờ thanh toán" — `text-[13px] text-muted-foreground py-12`

### Queue Row Actions (three-dot menu)

| # | Label | Icon | Description |
|---|-------|------|-------------|
| 1 | Thanh toán | Plus/rect icon | Open payment processing screen (primary action) |
| 2 | Xem chi tiết | Clock/circle icon | View line items without starting payment |
| — | separator | | |
| 3 | Trả lại hàng đợi | X mark | Return patient to previous department. Requires selecting a reason |

**"Trả lại hàng đợi" reasons (dropdown/dialog):**
- Đơn thuốc chưa đúng (return to doctor)
- Đơn kính chưa đúng (return to optical center)
- BN chưa sẵn sàng (patient not ready)
- Khác (free-text input)

---

## Tab 2: Giao dịch hôm nay (Today's Transactions)

### Transactions Table (`cashier-transactions-table.tsx`)

Sorted newest-first (DESC by completion time).

| Column | Width | Content |
|--------|-------|---------|
| STT | 36px | Transaction number for the day (ascending by time) |
| Bệnh nhân | auto | Same format as queue tab |
| SĐT | auto | Same format as queue tab |
| Loại | auto | Same payment type badges as queue tab |
| Phương thức | auto | Payment method text — `text-xs text-muted-foreground` |
| Thành tiền | auto, right-align | Actual amount collected (post-discount) — `font-medium` |
| Giờ | auto | Completion time `HH:mm` — `text-xs text-muted-foreground` |
| Trạng thái | auto | Status badge (see below) |
| Actions | 48px | Three-dot menu button |

**Payment method values:** Tiền mặt, Chuyển khoản, QR VNPay, QR MoMo, QR ZaloPay, Thẻ Visa, Thẻ Mastercard, Kết hợp

**Transaction statuses:**

| Status | Color | Meaning |
|--------|-------|---------|
| Đã thanh toán | `#0F6E56` (teal 600) | Completed, money collected |
| Đã hoàn tiền | `#A32D2D` (red 600) | Refunded (after manager approval) |
| Chờ hoàn tiền | `#854F0B` (amber 600) | Refund request pending manager approval |

### Transaction Row Actions (three-dot menu)

**For "Đã thanh toán" status:**

| # | Label | Icon | Description |
|---|-------|------|-------------|
| 1 | Xem hóa đơn | Clock/circle icon | View full invoice details |
| 2 | In lại | Printer icon | Reprint receipt |
| — | separator | | |
| 3 | Yêu cầu hoàn tiền | Plus icon | Create refund request → sent to manager for approval |

**For "Chờ hoàn tiền" status:** Replace "Yêu cầu hoàn tiền" with "Hủy yêu cầu hoàn tiền"

**For "Đã hoàn tiền" status:** Only show "Xem hóa đơn" and "In lại" (no refund action)

---

## File Structure

```
src/
  pages/
    payment/
      index.tsx              # Main dashboard page
  components/
    cashier/
      cashier-kpi-cards.tsx  # 4 metric cards
      cashier-queue-table.tsx # Payment queue table + row actions
      cashier-transactions-table.tsx # Transactions table + row actions
  data/
    mock-cashier.ts          # Mock data for development
  contexts/
    cashier-context.tsx      # Shared state (shift, filters)
```

---

## Interaction Rules

- Table rows: hover `bg-muted/50`
- Three-dot button: hover `bg-muted`
- Only one dropdown open at a time; click outside closes it
- Queue tab: real-time updates via polling (10s interval)
- Transactions tab: refreshes when tab is activated
- Wait time updates every 60 seconds

---

## Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| >= 1280px | Full layout as designed |
| 1024–1279px | Metric cards keep 4 columns, table allows horizontal scroll |
| 768–1023px | Metric cards become 2x2 grid, table horizontal scroll |
| < 768px | Metric cards stack 1 column, table horizontal scroll with sticky "Bệnh nhân" column |
