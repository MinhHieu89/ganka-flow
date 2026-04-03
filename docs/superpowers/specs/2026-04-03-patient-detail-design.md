# Patient Detail Page Design

> **Route:** `/patients/:patient_id`
> **Roles:** Doctor, Receptionist, Technician, Admin
> **Date:** 2026-04-03
> **Base spec:** `docs/patients/patient-detail.md`
> **HTML mockup:** `docs/patients/patient_detail_v4_polished.html`

---

## Design Decisions (vs. base spec)

This spec captures refinements made during brainstorming. The base spec (`docs/patients/patient-detail.md`) remains the source of truth for data sources, permissions, query logic, empty states, and all details not overridden here.

### Changes from base spec

| Area | Base Spec | This Design |
|------|-----------|-------------|
| Page layout | Single-page, everything scrolls | Sticky header that collapses on scroll |
| Patient header | Avatar + 3-line stacked (name, meta, pills) + text action buttons | Compact two-line with avatar: line 1 = avatar + name + ID + actions, line 2 = meta + pills |
| Stat cards | Flat cards (no border, bg fill) | Same — kept as-is |
| Tổng quan tab | 5 sections stacked vertically | Same order and layout — kept as-is |
| Lịch sử khám tab | Vertical timeline with expand/collapse cards | Master-detail: timeline list with dots on left (~240px), detail panel on right |
| Xu hướng tab | Charts stacked vertically (full width) | Responsive grid: 2 per row on 960px+, 1 per row on <768px |

---

## 1. Page Layout

- Max-width: 960px, centered
- Sticky header that **collapses on scroll**:
  - **Expanded (at top):** Full header + stat cards + tabs
  - **Collapsed (scrolled down):** Slim bar with small avatar (32px) + patient name + ID + allergy pill + compact action buttons + tabs
- Tab content area scrolls independently below the sticky header
- Collapse trigger: header collapses when user scrolls past the stat cards (roughly 200px from top). Use an IntersectionObserver on the stat cards section — when it exits the viewport, switch to collapsed state. Smooth transition (150ms) between states.

### Collapsed sticky header content

- Avatar: 32px circle with initials
- Patient name (15px, weight 500)
- Patient ID (12px, secondary)
- Allergy pill (if present — abbreviated, e.g. "Dị ứng")
- Action buttons: "Chỉnh sửa" (text), "Tạo lượt khám" (primary)
- Tab bar immediately below

---

## 2. Breadcrumb

- Text: "← Danh sách bệnh nhân"
- Click: navigate to `/patients`
- Style: font-size 13px, color secondary, hover → primary
- Positioned above the header, scrolls away (not part of sticky)

---

## 3. Patient Header (Expanded State)

### Layout: Compact Two-Line with Avatar

**Line 1 (flex row, space-between):**
- Left: Avatar (48px circle, initials, light blue bg) + Name (21px, weight 500) + Patient ID (13px, secondary)
- Right: Action buttons

**Line 2 (flex row, wrap):**
- Meta: Gender + age (DOB) · Phone — font-size 13px, secondary
- Vertical divider (1px, 14px tall)
- Alert pills

### Alert Pills

Same as base spec (allergy red, eye disease blue, OSDI amber, red flag red). Max 5 pills, "+N" overflow.

### Action Buttons

| Button | Style | Permission |
|--------|-------|------------|
| Chỉnh sửa | Outlined (border, transparent bg) | Receptionist, Admin |
| Xuất PDF | Outlined | All |
| Tạo lượt khám | Primary (green bg, white text) | Receptionist, Doctor |

### Separator

Border-bottom 0.5px after header. Padding-bottom 18px.

---

## 4. Stat Cards

4 cards in a grid row. Flat style (background fill, no border).

| Card | Value | Sub-text |
|------|-------|----------|
| Tổng lần khám | Visit count (22px) | "Lần đầu: {date}" |
| Lần khám gần nhất | Date (22px) | Doctor name |
| Chẩn đoán hiện tại | Diagnosis text (14px) | ICD code + secondary diagnosis |
| Tái khám tiếp theo | Date or "Quá hạn" (14px) | Scheduled date + days remaining/overdue |

- Background: `background-secondary` (f5f5f5 in light mode)
- Border-radius: 10px
- Padding: 14px 16px
- Gap: 12px
- "Quá hạn" uses red text (#A32D2D)

### Responsive

- 960px+: 4 columns
- 768-959px: 2x2 grid
- <768px: 1 column stack

---

## 5. Tabs

3 horizontal tabs below stat cards:

| Tab | Default |
|-----|---------|
| Tổng quan | Active on page load |
| Lịch sử khám | Lazy-loaded on click |
| Xu hướng | Lazy-loaded on click |

- Active tab: primary color text, 2px bottom border
- Inactive: secondary color text, no border
- Tabs are part of the sticky header

---

## 6. Tab: Tổng quan

**Same as base spec.** 5 sections in order:

1. **Thông tin cá nhân + Tiền sử** — 2-column grid, bordered cards
2. **Đơn thuốc hiện tại** — prescription rows with name, dose, frequency, eye badge
3. **Đơn kính hiện tại** — OD/OS grid with Sph/Cyl/Axis metric cards
4. **Lịch sử chẩn đoán** — rows with type badge, name, ICD, time range
5. **Số đo gần nhất** — 2x2 grid of measurement blocks (flat bg)

All styling, data sources, and formatting as defined in `docs/patients/patient-detail.md` sections 6.1–6.5.

---

## 7. Tab: Lịch sử khám (Master-Detail)

### Layout

Split panel within the 960px container:

- **Left panel (~240px):** Timeline list with vertical line and dots
- **Right panel (flex: 1):** Selected visit detail

### Left Panel — Timeline List

- Vertical line: 1px, border-tertiary color, running full height
- Each visit entry:
  - Dot: 11-13px circle on the timeline line
  - Date (13px, weight 500) + disease group badge (tiny, 8-9px)
  - Doctor name (11px, secondary)
- Selected visit: blue highlight background (#F0F7FF), blue left accent, blue dot fill
- Unselected visits: white dot, no background
- Most recent visit selected by default
- "Tải thêm" button at bottom if >5 visits

### Right Panel — Visit Detail

**Header:**
- Date (17px, weight 500) + disease group badge
- Doctor name + "X ngày trước" (13px, secondary)
- Action buttons: In phiếu, Xuất PDF, Xem đầy đủ (right-aligned)

**Diagnosis pills:** Below header, flex row

**Measurement blocks:** 2-column grid, flat background (f5f5f5), border-radius 8-10px:

| Row | Left Block | Right Block |
|-----|-----------|-------------|
| 1 | Thị lực & nhãn áp | Khúc xạ |
| 2 | Khô mắt (if Dry Eye visit) | Sinh hiển vi & đáy mắt |
| 3 | Đơn thuốc | Dặn dò & tái khám |

Row 2 adapts based on visit type (same logic as base spec section 7.2).

**OD/OS formatting:** OD bold blue (#185FA5), OS bold orange (#993C1D) — consistent throughout.

### Responsive (<768px)

- Master-detail collapses to single-column: show timeline list, clicking a visit navigates to a full-width detail view with a back button

### Special Cases

Same as base spec section 7.4 (red flag visits, in-progress visits).

---

## 8. Tab: Xu hướng

### Layout

Responsive grid of chart cards:

- 960px+: 2 charts per row
- 768-959px: 2 charts per row (smaller)
- <768px: 1 chart per row, full width

### Charts

Same 6 charts as base spec section 8.2, same display conditions:

1. Thị lực SC — always shown
2. Nhãn áp (IOP) — always shown, threshold line at 21 mmHg
3. Khúc xạ (Sphere) — always shown
4. TBUT — only if patient has Dry Eye visits, threshold at 5s
5. Schirmer — only if patient has Dry Eye visits, threshold at 5mm
6. OSDI Score — only if patient has OSDI records, threshold at 9

### Chart Styling

Same as base spec section 8.3:
- OD: solid line, #378ADD
- OS: dashed line, #D85A30
- Threshold: dashed red line (#E24B4A), opacity 0.4
- Current data point: hollow dot (white fill, colored stroke)
- Tooltip on hover: date, OD value, OS value

### Data Source

Same as base spec section 8.4. Lazy-loaded when tab is clicked.

---

## 9. Responsive Summary

| Breakpoint | Layout Changes |
|------------|----------------|
| 960px+ | Full layout as described above |
| 768-959px | Stat cards 2x2. Tổng quan 2-col grids → kept. Visit history master-detail → kept (narrower). Charts 2 per row |
| <768px | Stat cards 1-col stack. Tổng quan grids → 1-col stack. Visit history → single column (list then detail). Charts 1 per row. Measurement blocks → 1-col stack |

---

## 10. Data Sources, Permissions, Empty States

All unchanged from base spec (`docs/patients/patient-detail.md` sections 9–12). This design document only overrides visual/layout decisions.
