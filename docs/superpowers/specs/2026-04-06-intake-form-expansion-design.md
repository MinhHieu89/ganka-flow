# Intake Form Expansion Design

Expand the patient intake form to match the full ophthalmology intake document (`docs/requirements/patient-intake.docx`). The form grows from 4 sections / ~16 fields to 8 sections with structured checkboxes, symptom tables, eye history, family history, lifestyle, referral source, and a printable consent view.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Scope | All 8 .docx sections in intake form | User wants full document as a single form |
| Screening overlap | Intake is source of truth; screening reads from it | No duplicate data entry |
| Consent/signature | Print view with wet signature lines | Patient signs printed document |
| Lifestyle fields | Replace current with full .docx structure | Match document exactly |
| Layout | Hybrid — single column for text, 2-col grids for checkboxes | Calm density per design system |
| Architecture | Section components with shared parent state | Manageable file sizes, clear boundaries |

## Data Model Expansion

The `Patient` interface in `src/data/mock-patients.ts` expands. Existing fields are preserved; new fields are added by section.

### Section I: Thông tin cá nhân

Existing fields stay (`name`, `gender`, `dob`, `phone`, `email`, `address`, `occupation`, `cccd`). Changes:

- `city` field is replaced by `district: string` and `cityProvince: string`
- Add `emergencyContact: { name: string; phone: string; relationship: string }`

### Section II: Lý do khám & Triệu chứng

New fields (`chiefComplaint` stays on Patient but is only filled during screening, not in this form):

```typescript
visitReasons: string[]    // new — checkbox selections from .docx
// Values: "kham_dinh_ky", "giam_thi_luc", "mo_mat", "nhuc_dau_dau_mat",
//   "dau_mat_kho_chiu", "kho_nhin_gan", "kho_nhin_xa", "kinh_ap_trong",
//   "tu_van_phau_thuat", "khac"
visitReasonOther?: string
symptomDetail?: {
  onset?: string        // free text: when symptoms started
  severity?: "nhe" | "trung_binh" | "nang"
  frequency?: "thinh_thoang" | "thuong_xuyen" | "lien_tuc"
  dailyImpact?: "khong" | "mot_phan" | "nghiem_trong"
  factors?: string      // free text: what makes it better/worse
}
symptoms: Record<string, boolean>
// Keys (18 symptoms): "mo_mat", "nhin_doi", "nhin_bien_dang", "dom_bay",
//   "vong_sang", "chop_sang", "mat_thi_truong", "mo_thay_doi_theo_gio",
//   "nhuc_dau", "choi_sang", "kho_mat", "chay_nuoc_mat", "tiet_dich",
//   "ngua_mat", "do_mat", "sung_mi", "moi_mat_doc", "kho_tap_trung_doc"
```

### Section III: Tiền sử mắt cá nhân

New fields (replace `eyeHistory` text field):

```typescript
lastEyeExam?: { date?: string; location?: string }
currentGlasses?: {
  types: string[]  // "can", "vien", "loan", "lao"
  duration?: string
  seesWell?: boolean
}
contactLensStatus?: "co" | "khong" | "da_tung"
contactLensDetail?: {
  type?: string[]    // "mem", "cung", "deo_ngay", "deo_keo_dai"
  brand?: string
  duration?: string
  issues?: string[]  // "kho_mat", "kho_chiu", "nhin_mo", "khac"
  issueOther?: string
}
eyeInjury?: { has: boolean; detail?: string }
diagnosedEyeConditions: Record<string, boolean>
// Keys: "can_thi", "vien_thi", "loan_thi", "lao_thi", "glaucoma",
//   "duc_thuy_tinh_the", "thoai_hoa_diem_vang", "benh_vong_mac_dtd",
//   "lac_mat", "mat_luoi", "kho_mat_syndrome", "viem_ket_mac",
//   "bong_vong_mac", "viem_mang_bo_dao", "khac"
diagnosedEyeConditionOther?: string
refractionValues?: {
  myopia?: { od?: string; os?: string }
  hyperopia?: { od?: string; os?: string }
  astigmatism?: { od?: string; os?: string }
}
eyeSurgeries?: Array<{
  type: string  // "lasik", "duc_thuy_tinh_the", "glaucoma", "vong_mac", "lac_mat", "khac"
  typeOther?: string
  year?: string
  od: boolean
  os: boolean
}>
```

### Section IV: Tiền sử y tế tổng quát

New fields (replace `systemicHistory`, `currentMedications`, `allergies` text fields):

```typescript
primaryDoctor?: { name?: string; lastVisit?: string }
systemicConditions: Record<string, boolean>
// Keys grouped:
// Cardiovascular: "tang_huyet_ap", "dau_that_nguc", "benh_tim_mach", "dot_quy"
// Endocrine: "dtd_type1", "dtd_type2", "benh_tuyen_giap", "cholesterol_cao"
// Neurological: "da_xo_cung", "dong_kinh", "parkinson", "migraine"
// Respiratory/Immune: "hen_suyen", "copd", "hiv", "viem_gan_bc",
//   "lupus", "viem_khop_dang_thap"
// Cancer: "ung_thu", "dang_hoa_xa_tri"
// Other: "benh_than", "benh_gan", "roi_loan_dong_mau",
//   "benh_ngoai_da", "tram_cam_lo_au"
diabetesDetail?: {
  yearDiagnosed?: string
  hba1c?: string
}
cancerDetail?: { type?: string; onTreatment?: boolean }
systemicConditionOther?: string
medications: Array<{ name: string; dose: string; purpose: string }>
allergies: {
  none: boolean
  items: Array<{ type: "thuoc" | "thuc_pham" | "moi_truong" | "khac"; name: string; reaction: string }>
}
pregnancyStatus?: "mang_thai" | "cho_con_bu" | "khong"
pregnancyTrimester?: string
```

### Section V: Tiền sử gia đình

New fields (replace `familyHistory` text field):

```typescript
familyEyeHistory: Record<string, { has: boolean; who?: string }>
// Keys: "glaucoma", "duc_thuy_tinh_the", "thoai_hoa_diem_vang",
//   "benh_vong_mac", "can_thi_nang", "mu_mau", "lac_mat_luoi", "bong_vong_mac"
familyMedicalHistory: Record<string, { has: boolean; who?: string }>
// Keys: "dtd", "tang_huyet_ap", "benh_tim_mach", "dot_quy",
//   "ung_thu", "benh_tu_mien"
familyHistoryOther?: { has: boolean; detail?: string; who?: string }
```

### Section VI: Thói quen sinh hoạt

New fields (replace `screenTime`, `workEnvironment`, `contactLens`, `lifestyleNotes`):

```typescript
smoking: { status: "khong" | "co" | "da_bo"; quantity?: string; years?: string; quitYear?: string }
alcohol: { status: "khong" | "thinh_thoang" | "thuong_xuyen"; frequency?: string }
screenTimeComputer?: "<2h" | "2-4h" | "4-8h" | ">8h"
screenTimePhone?: "<2h" | "2-4h" | "4-8h" | ">8h"
outdoorTime?: "<30m" | "30-60m" | "1-2h" | ">2h"
sunglassesUse?: "luon_luon" | "thinh_thoang" | "khong_bao_gio"
workNearVision?: boolean
workDustyChemical?: boolean
driving?: { does: boolean; when?: "ban_ngay" | "ban_dem" | "ca_hai" }
sports?: { does: boolean; type?: string }
hobbies?: string
```

### Section VII: Nguồn thông tin

New field:

```typescript
referralSource?: string
// Values: "ban_be", "bac_si_khac", "internet", "quang_cao",
//   "website", "di_ngang", "bao_chi", "su_kien", "da_kham", "khac"
referralDetail?: string  // name of referrer, doctor, or other detail
```

## Component Architecture

### File Structure

```
src/components/receptionist/
  intake-form.tsx                    # Parent orchestrator (refactored)
  intake-section-personal.tsx        # Section I
  intake-section-complaint.tsx       # Section II
  intake-section-eye-history.tsx     # Section III
  intake-section-medical-history.tsx # Section IV
  intake-section-family-history.tsx  # Section V
  intake-section-lifestyle.tsx       # Section VI
  intake-section-referral.tsx        # Section VII
  intake-section-consent.tsx         # Section VIII (print-only consent text + staff checkbox)
  intake-print-view.tsx              # Printable document matching .docx layout
  intake-checkbox-grid.tsx           # Reusable 2-col checkbox table
  intake-conditional-field.tsx       # Text input that appears when checkbox is checked
```

### Parent Orchestrator: `intake-form.tsx`

Responsibilities:
- Holds full form state as a single `useState` object (typed as `IntakeFormData`)
- Provides `updateField` and `updateNestedField` helpers passed to sections
- Validates required fields on save
- Renders 8 collapsible sections using shadcn Collapsible
- Action bar: Lưu, Lưu & Sàng lọc, In phiếu, Hủy
- Duplicate phone detection (existing behavior preserved)

### Section Component Interface

Each section component follows the same prop pattern:

```typescript
interface SectionProps {
  data: IntakeFormData        // full form state (section reads its slice)
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}
```

### Reusable Components

**`intake-checkbox-grid.tsx`** — 2-column grid of checkboxes:
```typescript
interface CheckboxGridProps {
  items: Array<{ key: string; label: string }>
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
  columns?: 2 | 3  // default 2
}
```
Used in: Sections II (symptoms), III (conditions), IV (systemic conditions), V (family history).

**`intake-conditional-field.tsx`** — text input shown when a trigger value is selected:
```typescript
interface ConditionalFieldProps {
  show: boolean
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}
```
Used in: "Khác" fields, "Ai bị?" fields, conditional details throughout.

## Layout Design

### Collapsible Sections

Each section is a collapsible card:
- Section header with Roman numeral + title (matching .docx) + expand/collapse chevron
- All sections expanded by default for new patients
- Completed sections can be collapsed manually
- Sticky action bar at bottom of form

### Field Layout Rules

- **Text inputs** (name, address, phone, email): single column, full width
- **Short field pairs** (gender + DOB, phone + email, district + city): 2-column grid
- **Checkbox groups** (symptoms, conditions): 2-column grid using `CheckboxGrid`
- **Symptom detail** (severity, frequency, impact): 3-column radio group row
- **Surgery/medication tables**: repeatable rows with add/remove buttons
- **Family history**: 2-column checkbox grid with inline "Ai bị?" text input per row
- **Radio groups** (smoking, alcohol, screen time): horizontal inline options

### Responsive Behavior

- Desktop (≥1024px): 2-column grids for checkboxes, paired text fields
- Tablet (768-1023px): same layout, slightly tighter spacing
- Mobile (<768px): all fields stack to single column

## Conditional Field Logic

| Trigger | Fields Shown |
|---|---|
| Visit reason "Khác" checked | `visitReasonOther` text input |
| Any symptom checked in Section II | Symptom detail sub-form (onset, severity, frequency, impact, factors) |
| Any glasses type checked | Duration + "seesWell?" fields |
| Contact lens = "Có" or "Đã từng" | Lens detail sub-form |
| Eye injury = "Có" | Injury detail text input |
| Condition "Khác" checked | Other condition text input |
| Eye surgery = "Có" | Surgery table (addable rows) |
| Diabetes type 1 or 2 checked | Year diagnosed + HbA1c fields |
| Cancer checked | Cancer type + on-treatment fields |
| Allergies "Có" checked | Allergy item rows (addable) |
| Gender = "Nữ" | Pregnancy status question |
| Pregnancy = "Mang thai" | Trimester field |
| Smoking = "Có" | Quantity + years fields |
| Smoking = "Đã bỏ" | Quit year field |
| Alcohol = "Thường xuyên" | Frequency field |
| Driving = "Có" | When (day/night/both) |
| Sports = "Có" | Sport type field |
| Family history item checked | "Ai bị?" text input for that row |

## Print View

`intake-print-view.tsx` renders a print-optimized version of the completed form.

### Trigger

"In phiếu" button in the action bar opens a Dialog containing the print view, with a print button that calls `window.print()`.

### Layout

- Matches the .docx paper layout as closely as possible
- Clinic header with logo, name, title "PHIẾU THÔNG TIN BỆNH NHÂN KHÁM MẮT TỔNG QUÁT"
- All 8 sections with Roman numeral headings
- Checked items rendered as ☑, unchecked as ☐
- Text answers rendered inline where blanks would be on paper
- Empty/unanswered fields show blank lines (like the paper form)
- Section VIII: full consent text + blank signature lines + date lines
- Staff-only section at bottom: doctor name, exam date, patient code, notes

### Print CSS

- `@media print` hides dialog chrome, action buttons, sidebar
- A4 page size, appropriate margins
- Page breaks between major sections if needed
- Monochrome-friendly (no color dependencies)

## Screening Form Integration

The screening form (`screening-form-initial.tsx`) currently captures:
- Chief complaint (text)
- Symptoms (checkboxes: dry eyes, gritty, blurry, tearing, itchy, headache)
- Symptom duration, screen time, contact lens use

After this change:
- Screening reads `chiefComplaint`, `visitReasons`, `symptoms`, `symptomDetail`, and `contactLensStatus` from the patient's intake data
- Screening displays these as read-only summary at the top
- Screening removes its own duplicate fields
- Screening keeps clinical-only fields: UCVA, red flags, blink improvement, discomfort level

This integration is a follow-up task — the intake form expansion comes first.

## Backward Compatibility

`chiefComplaint` remains on `Patient` as a string but is no longer part of the intake form — it is filled during screening only. The intake form's current `chiefComplaint` field is replaced by `visitReasons` (checkbox selections). The existing intake form validation that required `chiefComplaint` is removed; `visitReasons` takes its place as required.

Fields being removed from `Patient`: `eyeHistory`, `systemicHistory`, `currentMedications` (string), `allergies` (string), `familyHistory` (string), `screenTime`, `workEnvironment`, `contactLens` (string), `lifestyleNotes`, `city`. These are replaced by their structured equivalents defined above.

## Validation

**Required fields** (block save):
- `name` — non-empty
- `gender` — selected
- `dob` — valid date
- `phone` — 10-11 digits starting with 0
- `visitReasons` — at least one selected
- `email` — valid format if provided (optional field)

**All other fields are optional.** Staff fills what the patient provides.

Error display: red text below field with `aria-invalid` attribute (existing pattern).

## Actions

| Button | Behavior |
|---|---|
| Lưu | Validate required fields → save patient → navigate to `/intake` |
| Lưu & Sàng lọc | Validate → save → navigate to screening |
| In phiếu | Open print dialog (no validation needed — prints current state) |
| Hủy | Navigate to `/intake` (confirm if form has changes) |
