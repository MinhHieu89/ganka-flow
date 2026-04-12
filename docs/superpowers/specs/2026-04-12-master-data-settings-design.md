# Master Data Settings — Design Spec

## Overview

Admin-manageable master data lists used as dropdown/select options across the application. Each list gets its own flat settings page under Cai dat (Settings). Admin can add, rename, reorder, and disable items in each list.

## Scope

- **In scope**: Dynamic option lists that a clinic admin may want to customize
- **Out of scope**: Fixed enums (gender, severity, frequency, allergy types, smoking status, payment methods, etc.), medication catalog (separate module), diagnosis/ICD-10 catalog (separate module), doctor list (derived from user table filtered by role)

## CRUD Operations

Every master data list supports the same operations:

| Operation | Description |
|-----------|-------------|
| **Add** | Create a new item with a label (Vietnamese) and a system key |
| **Rename** | Change the display label; system key stays stable |
| **Reorder** | Drag-and-drop to change display order |
| **Disable** | Soft-disable — hidden from new forms, preserved in historical records |
| **Delete** | Only allowed if item has never been used in any record; otherwise must disable |

## Master Data Catalog (16 lists)

### Tiep nhan (Intake Form) — 12 lists

| # | Key | Name (VI) | Default items |
|---|-----|-----------|---------------|
| 1 | `visit_reasons` | Ly do kham | Kham dinh ky, Giam thi luc, Mo mat, Nhuc dau/dau mat, Dau mat/kho chiu, Kho nhin gan, Kho nhin xa, Kinh ap trong, Tu van phau thuat, Khac |
| 2 | `symptoms` | Trieu chung hien tai | Mo mat, Nhin doi, Nhin bien dang, Dom bay, Vong sang, Chop sang, Mat thi truong, Mo thay doi theo gio, Nhuc dau, Choi sang, Kho mat, Chay nuoc mat, Tiet dich, Ngua mat, Do mat, Sung mi, Moi mat doc, Kho tap trung doc |
| 3 | `contact_lens_types` | Loai lens | Mem, Cung, Deo ngay, Deo keo dai |
| 4 | `contact_lens_issues` | Van de lens | Kho mat, Kho chiu, Nhin mo, Khac |
| 5 | `eye_conditions` | Benh ly mat | Can thi, Vien thi, Loan thi, Lao thi, Glaucoma, Duc thuy tinh the, Thoai hoa diem vang, Benh vong mac DTD, Lac mat, Mat luoi, Kho mat syndrome, Viem ket mac, Bong vong mac, Viem mang bo dao, Khac |
| 6 | `eye_surgery_types` | Loai phau thuat mat | LASIK, Duc thuy tinh the, Glaucoma, Vong mac, Lac mat, Khac |
| 7 | `systemic_conditions` | Benh ly toan than | ~25 items in 6 groups (Tim mach, Noi tiet, Than kinh, Ho hap & Mien dich, Ung thu, Khac) |
| 8 | `screen_time_ranges` | Thoi gian man hinh | <2h, 2-4h, 4-8h, >8h |
| 9 | `outdoor_time_ranges` | Thoi gian ngoai troi | <30m, 30-60m, 1-2h, >2h |
| 10 | `relationships` | Moi quan he | Bo me, Vo chong, Con, Anh chi em, Khac |
| 11 | `family_eye_conditions` | Benh mat gia dinh | Glaucoma, Duc thuy tinh the, Thoai hoa diem vang, Benh vong mac, Can thi nang, Mu mau, Lac mat/luoi, Bong vong mac |
| 12 | `family_medical_conditions` | Benh ly gia dinh | DTD, Tang huyet ap, Benh tim mach, Dot quy, Ung thu, Benh tu mien |

### Sang loc (Screening) — 2 lists

| # | Key | Name (VI) | Default items |
|---|-----|-----------|---------------|
| 13 | `red_flag_symptoms` | Dau hieu co do | Eye pain, Sudden vision loss, Asymmetry between eyes |
| 14 | `disease_groups` | Nhom benh | Dry Eye, Refraction, Myopia Control, General |

### Kinh mat (Optical) — 1 list

| # | Key | Name (VI) | Default items |
|---|-----|-----------|---------------|
| 15 | `delivery_carriers` | Don vi van chuyen | Grab, GHTK, GHN, Bee/Xanh SM, Tu giao |

### Trong kinh (Lens) — 1 list

| # | Key | Name (VI) | Default items |
|---|-----|-----------|---------------|
| 16 | `lens_types` | Loai trong kinh | Don trong, Da trong, Luy tien |

## Data Model

Each master data list follows a uniform structure:

```typescript
interface MasterDataItem {
  id: string           // UUID, stable across renames
  key: string          // System key (snake_case), immutable after creation
  label: string        // Display label in Vietnamese
  sortOrder: number    // Display order (0-based)
  isActive: boolean    // false = soft-disabled
  listKey: string      // Which list this belongs to (e.g. "visit_reasons")
  createdAt: string
  updatedAt: string
}
```

## Fixed Enums (NOT in settings)

These remain hardcoded as TypeScript enums — they are universal/standard and not clinic-specific:

- Gender: Nam, Nu, Khac
- Symptom severity: Nhe, Trung binh, Nang
- Symptom frequency: Thinh thoang, Thuong xuyen, Lien tuc
- Impact level: Khong, Mot phan, Nghiem trong
- Glasses types: Can, Vien, Loan, Lao
- Contact lens status: Co, Khong, Da tung
- Allergy types: Thuoc, Thuc pham, Moi truong, Khac
- Sunglasses usage: Luon luon, Thinh thoang, Khong bao gio
- Driving time: Ban ngay, Ban dem, Ca hai
- Smoking status: Khong, Co, Da bo
- Payment methods: Cash, Transfer, QR VNPay/MoMo/ZaloPay, Card Visa/MC

## UI Pattern

Each settings page uses the same reusable component:

- Page header: list name + description
- Table/list showing all items with columns: drag handle, label, status (active/disabled), actions (edit/disable/delete)
- "Add item" button at top
- Inline editing for rename
- Drag-and-drop for reorder
- Disable toggle (with confirmation if item is in use)
- Delete only enabled for unused items

## Navigation

Settings > Master data section with flat list of all 16 pages in sidebar/menu. Grouped visually by module (Tiep nhan, Sang loc, Kinh mat, Trong kinh) using section headers but each list is its own page.

## Seeding

On first setup, all 16 lists are pre-populated with the default items listed above. Admin can then customize from there.
