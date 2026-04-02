# Screening Dashboard (Technician Queue) — Design Spec

## Overview

A dashboard for technicians to view and manage patients waiting for pre-exam screening. Mirrors the intake page's visual language (KPI cards + data table) but scoped to the technician's workflow: picking up patients from the queue and moving them through screening.

## Routes

| Route | Purpose |
|-------|---------|
| `/screening` | Technician dashboard — patient queue |
| `/screening/:visitId` | Pre-exam page (blank placeholder for now) |

## Navigation

- Add **"Sàng lọc"** nav item to the sidebar, pointing to `/screening`
- Position after "Lịch hẹn" in the sidebar menu

## Page Layout (`/screening`)

Mirrors the intake dashboard structure:

```
┌─────────────────────────────────────────┐
│ Title: "Dashboard Sàng lọc"  [Làm mới] │
├─────────────────────────────────────────┤
│ [3 KPI Cards in Grid]                   │
├─────────────────────────────────────────┤
│ [Patient Queue Table]                   │
│ [Pagination footer]                     │
└─────────────────────────────────────────┘
```

No status filter tabs — only 2 statuses are shown (`cho_kham` and `dang_sang_loc`), so tabs would be redundant.

## KPI Cards

3 cards in a `grid-cols-3` layout, matching the intake page card style (border, rounded-lg, icon top-right, large bold number).

| Card | Label | Status filter | Color | Icon |
|------|-------|--------------|-------|------|
| 1 | Chờ sàng lọc | `cho_kham` | `text-amber-500` | Clock01Icon |
| 2 | Đang sàng lọc | `dang_sang_loc` | `text-sky-500` | Search01Icon |
| 3 | Hoàn thành hôm nay | `hoan_thanh` | `text-emerald-600` | CheckmarkCircle02Icon |

KPI cards are display-only (no click-to-filter behavior since there are no filter tabs).

## Patient Queue Table

### Data Source

Filter today's visits to only show:
- `status === "cho_kham"` (waiting for screening)
- `status === "dang_sang_loc"` (currently being screened)

### Columns

| # | Column | Field | Width | Sortable | Notes |
|---|--------|-------|-------|----------|-------|
| 1 | STT | — | `w-12` | No | Row number from pagination |
| 2 | Họ tên | `patient.name` + `patient.id` | auto | Yes | Bold name, patient ID below in muted text. Red flag icon (⚠️) next to name if flagged. |
| 3 | Năm sinh | `patient.birthYear` | `w-20` | Yes | 4-digit year |
| 4 | Giới tính | `patient.gender` | `w-20` | No | Nam/Nữ/Khác |
| 5 | Thời gian chờ | calculated from `visit.checkedInAt` | `w-24` | Yes | "Xp" format (minutes). Default sort column (descending — longest wait first). Turns `text-destructive` after 30 minutes. Shows "—" for `dang_sang_loc` patients. |
| 6 | Lý do khám | `visit.reason` | auto | No | Chief complaint. "Chưa rõ" in italic muted if missing. |
| 7 | Trạng thái | `visit.status` | `w-28` | Yes | Uses existing STATUS_CONFIG colors: `cho_kham` → amber, `dang_sang_loc` → sky |
| 8 | Thao tác | — | `w-28` | No | Action button (see below) |

### Row Styling

- Default: no background
- `dang_sang_loc` rows: subtle blue background (`bg-sky-50` / dark mode equivalent)

### Default Sort

By `Thời gian chờ` descending (longest wait first), so patients waiting the longest appear at the top.

## Red Flag Indicator

A warning icon displayed next to the patient's name in the Họ tên column.

### Logic (placeholder for v1)

Flag a patient if their chief complaint (`visit.reason` or `patient.chiefComplaint`) contains any of these keywords:
- "đau mắt" (eye pain)
- "mất thị lực" (vision loss)
- "đột ngột" (sudden)
- "chấn thương" (trauma/injury)

This is placeholder keyword matching. Future versions will use a proper red flag checklist from the screening form.

### Display

- Icon: Alert/warning icon from HugeIcons in `text-destructive` color
- Position: Inline after the patient name
- Tooltip on hover: "Cờ đỏ — cần ưu tiên" (Red flag — prioritize)

## Action Buttons

| Patient status | Button label | Button style | Behavior |
|---------------|-------------|-------------|----------|
| `cho_kham` | Bắt đầu sàng lọc | Primary (filled) | 1. Update visit status to `dang_sang_loc` → 2. Navigate to `/screening/:visitId` |
| `dang_sang_loc` | Tiếp tục | Outline | Navigate to `/screening/:visitId` |

## Blank Pre-exam Page (`/screening/:visitId`)

A placeholder page for the future pre-exam form.

### Content

- Patient name and ID displayed in the header
- Message: "Trang sàng lọc đang được phát triển" (Screening page is under development)
- "← Quay lại" back button/link to return to `/screening`

### Data

- Read `visitId` from route params
- Look up patient info from context using the visit's `patientId`
- If visit not found, show error state and link back to dashboard

## File Organization

```
src/
  pages/
    screening/
      index.tsx              — Dashboard page (route: /screening)
      visit.tsx              — Pre-exam placeholder (route: /screening/:visitId)
  components/
    screening/
      kpi-cards.tsx          — 3 KPI metric cards
      queue-table.tsx        — Patient queue table
  contexts/
    screening-context.tsx    — (optional) Screening-specific state, or reuse ReceptionistContext
```

## Context & State

Reuse the existing `ReceptionistContext` which already provides:
- `todayVisits` — filter to `cho_kham` + `dang_sang_loc`
- `getPatient(id)` — look up patient details
- `updateVisitStatus(visitId, status)` — change status to `dang_sang_loc`

No new context needed for v1. If screening-specific state grows (e.g., screening form data), create `ScreeningContext` later.

## Mock Data

Use existing mock patients and visits from `src/data/mock-patients.ts`. The current mock data already has patients with `cho_kham` and `dang_sang_loc` statuses that will appear in the technician's queue.

## Styling Consistency

All styling follows the intake page patterns:
- Same KPI card structure (border, rounded-lg, padding, icon, large number)
- Same table component (`Table`, `TableHeader`, `TableBody`, etc. from shadcn)
- Same status color system from `STATUS_CONFIG`
- Same button variants (primary filled, outline)
- Same text styles (muted-foreground for secondary text, font-bold for names)
- Vietnamese labels with proper diacritics throughout
