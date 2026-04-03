# Diagnosis Input Redesign

## Goal

Upgrade the Chẩn đoán (Diagnosis) section in the doctor exam view to support ICD-10 search with category-grouped results, Vietnamese + English names, and primary/secondary diagnosis management matching the reference UI.

## Data Model

### DiagnosisCatalogEntry (expanded)

```ts
export interface DiagnosisCatalogEntry {
  icd10: string     // e.g. "H01.001" — granular sub-codes
  nameVi: string    // "Viêm bờ mi mắt phải, không đặc hiệu"
  nameEn: string    // "Unspecified blepharitis, right eye"
  category: string  // "Blepharitis" — grouping header in dropdown
}
```

### Diagnosis interface (unchanged)

```ts
export interface Diagnosis {
  text: string        // Vietnamese name from catalog
  icd10Code?: string  // ICD-10 code
  isPrimary: boolean
}
```

### Dataset scope

~150 ophthalmology-focused ICD-10 codes across these categories:

- Blepharitis (H01.0xx)
- Chalazion / Hordeolum (H00.x)
- Conjunctivitis (H10.x)
- Keratitis (H16.x)
- Dry eye (H04.1x)
- Cataract (H25.x, H26.x)
- Glaucoma (H40.x)
- Retinal disorders (H33.x, H35.x)
- Diabetic retinopathy (E11.3x with H36)
- Macular degeneration (H35.3x)
- Refractive errors (H52.x)
- Strabismus (H49.x, H50.x)
- Lid disorders (H02.x)
- Lacrimal disorders (H04.x)
- Optic nerve disorders (H46.x, H47.x)
- Vitreous / globe disorders (H43.x, H44.x)

## Search Behavior

- **Minimum query length**: 1 character (ICD codes like "H01" need to match quickly)
- **Search fields**: Matches against `icd10`, `nameVi`, `nameEn` (case-insensitive)
- **Diacritics-insensitive**: Vietnamese search ignores diacritics (e.g. "viem" matches "Viêm")
- **Grouping**: Results grouped by `category` with a sticky-style header label
- **Exclusion**: Already-selected diagnoses are filtered out of results
- **Keyboard**: Arrow keys navigate results, Enter selects highlighted item

## Dropdown UI

```
Blepharitis                          ← category header (muted, small)
  H01.001  Viêm bờ mi mắt phải...  Unspecified blepharitis r...
  H01.002  Viêm bờ mi trái, ...    Unspecified blepharitis l...
  H01.003  Viêm bờ mi hai mắt, ... Unspecified blepharitis ...  ← highlighted row
```

Each row:
- ICD code in monospace/tabular style (left)
- Vietnamese name (middle, truncates with ellipsis)
- English name in muted text (right, truncates)
- Hover/keyboard highlight with subtle background

## Selected Diagnoses Display

```
┌─────────────────────────────────────────────────────────────────────┐
│ E11.3213  Đái tháo đường type 2 với bệnh võng mạc...  [Chính]  × │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│ E11.319   Đái tháo đường type 2 với bệnh võng mạc...  [Phụ] ↑  × │
└─────────────────────────────────────────────────────────────────────┘
```

- **ICD code**: Shown at the start of each chip, monospace
- **Vietnamese name**: Full text, truncates on smaller widths
- **"Chính" badge**: Teal/primary colored, on the primary diagnosis
- **"Phụ" badge**: Muted color, on secondary diagnoses
- **↑ promote button**: On secondary diagnoses only — promotes to primary, demotes current primary
- **× remove button**: On all diagnoses

### Promote logic

- Clicking ↑ on a secondary diagnosis makes it primary
- The previously-primary diagnosis becomes secondary
- Only one primary diagnosis at a time
- If the primary is removed, the first remaining diagnosis auto-promotes

## Search Input

- Placeholder: "Tìm mã ICD-10..."
- Below the selected diagnoses list
- Free-text entry still supported (Enter when no results match)

## Files Changed

1. **`src/data/diagnoses.ts`** — Replace with expanded catalog (~150 entries with `nameVi`, `nameEn`, `category`)
2. **`src/components/doctor/diagnosis-input.tsx`** — Rewrite to match new dropdown UI, promote button, ICD-prominent chips

## Out of Scope

- Star/favorites functionality
- Persistence of favorites
- Server-side ICD-10 search
- ICD-10 code validation
