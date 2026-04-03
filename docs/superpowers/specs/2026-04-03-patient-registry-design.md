# Patient Registry Page — Design Spec

## Overview

A master patient directory listing all patients ever registered at the clinic. Separate from the intake dashboard (which shows today's visits). Accessible via sidebar navigation.

## Route & Navigation

- **Route**: `/patients`
- **Sidebar entry**: "Bệnh nhân" — added between "Tiếp nhận" and "Lịch hẹn" in `app-sidebar.tsx`
- **Icon**: Use a people/group icon from Hugeicons (e.g., `UserMultiple02Icon` or similar)

## Page Layout

### Header Row

- **Left**: Page title "Bệnh nhân" (h1, bold) with subtitle "Danh sách bệnh nhân" (muted text)
- **Right**: Primary button "+ Đăng ký bệnh nhân" → navigates to `/intake/new`

### Filter Bar

A bordered card/container with three filters in a horizontal row:

| Filter | Component | Behavior |
|--------|-----------|----------|
| Tìm kiếm | Text input with search icon, placeholder "Tìm kiếm bệnh nhân..." | Searches by name, phone number, or patient ID. Client-side filtering on mock data |
| Trạng thái | Select dropdown | Options: "Tất cả", "Hoạt động" (default), "Ngừng hoạt động" |
| Giới tính | Select dropdown | Options: "Tất cả" (default), "Nam", "Nữ", "Khác" |

- Search input takes ~50% width, dropdowns share the remaining space
- Filters apply immediately (no submit button)

### Patient Table

| Column | Width | Content | Sortable |
|--------|-------|---------|----------|
| Mã bệnh nhân | ~140px | Patient ID in teal color (e.g., GK-2026-0029) | Yes |
| Họ và tên | flex | Patient name, bold | Yes |
| Số điện thoại | ~130px | Phone number | No |
| Loại bệnh nhân | ~150px | Badge: "Bệnh nhân khám bệnh" (blue/sky) or "Khách mua thuốc" (amber) | No |
| Giới tính | ~80px | Nam / Nữ / Khác | No |
| Dị ứng | ~80px | "---" if none; amber warning icon + count if allergies present | No |
| Trạng thái | ~100px | Badge: "Hoạt động" (green/emerald) or "Ngừng HĐ" (red) | No |
| Action | ~50px | Eye icon button → navigates to `/patients/:id` | No |

- Default sort: newest first (by patient ID descending)
- Sort indicator arrows on sortable columns (same pattern as existing `patient-table.tsx`)

### Pagination

- **Left**: "Hiển thị X / Y bệnh nhân"
- **Right**: Page size selector (10 / 20 / 50) + "Trước" / "Sau" buttons
- Same pattern as existing intake dashboard pagination

## Patient Detail Page

- **Route**: `/patients/:id`
- **Content**: Blank placeholder page for now — just show the patient ID and a "back to list" link
- Will be expanded in a future design iteration

## Data Model Changes

Add two fields to the `Patient` interface in `mock-patients.ts`:

```typescript
export type PatientType = "kham_benh" | "mua_thuoc"
export type PatientActiveStatus = "hoat_dong" | "ngung_hoat_dong"

// Add to Patient interface:
type: PatientType
activeStatus: PatientActiveStatus
```

Display config (same pattern as existing `STATUS_CONFIG`):

```typescript
export const PATIENT_TYPE_CONFIG = {
  kham_benh: { label: "Bệnh nhân khám bệnh", color: "text-sky-700 bg-sky-100" },
  mua_thuoc: { label: "Khách mua thuốc", color: "text-amber-800 bg-amber-100" },
}

export const ACTIVE_STATUS_CONFIG = {
  hoat_dong: { label: "Hoạt động", color: "text-emerald-800 bg-emerald-100" },
  ngung_hoat_dong: { label: "Ngừng HĐ", color: "text-red-800 bg-red-100" },
}
```

## Mock Data

Generate 15-20 mock patients with:

- Mix of "kham_benh" and "mua_thuoc" types (mostly kham_benh)
- Most "hoat_dong", 2-3 "ngung_hoat_dong"
- Mix of genders
- 1-2 patients with allergies (string values in existing `allergies` field)
- Vietnamese names with proper diacritics
- Realistic phone numbers (10-11 digits starting with 0)
- Reuse existing mock patients where they exist, add new ones to fill out the list

## File Structure

| File | Purpose |
|------|---------|
| `src/pages/patients/index.tsx` | Patient registry page |
| `src/pages/patients/detail.tsx` | Blank patient detail placeholder |
| `src/components/patients/patient-registry-table.tsx` | Table component |
| `src/components/patients/patient-filters.tsx` | Filter bar component |

## Design References

- Follow existing patterns from `src/pages/intake/index.tsx` (page structure, pagination)
- Follow existing patterns from `src/components/receptionist/patient-table.tsx` (table, sorting)
- Badge styling: use shadcn `Badge` or inline styled spans matching existing `STATUS_CONFIG` pattern
- All text in Vietnamese with proper diacritics
- No emoji in UI — use Hugeicons for icons
