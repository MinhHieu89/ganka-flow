# Intake Red Flags & Specialized Packages Design

## Summary

Add two new sections to the intake form (managed by receptionist) and a new sidebar item in the doctor's exam view:

1. **Triệu chứng nguy hiểm** — Red flag symptom checklist on the intake form with alert banner
2. **Gói khám chuyên sâu** — Specialized examination package registration on the intake form
3. **Doctor "Khám chuyên sâu" sidebar item** — Displays registered packages with editable session forms

## Context

Red flag detection was recently removed from the screening page (commit d9e8876). The responsibility now shifts to the receptionist during intake. Additionally, the receptionist can upsell and register specialized examination packages (e.g., dry eye, myopia control) for patients.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Red flag behavior | Alert only — receptionist decides | No automatic workflow change; receptionist has context to judge |
| Red flag questions | Admin-configurable | Flexibility; mockup uses the 3 from old screening component |
| Package registration | Billing/service item only | No workflow impact; doctor just sees what was registered |
| Placement in intake | After Section VII (Nguồn giới thiệu) | Not patient data — receptionist actions at the bottom |
| Layout style | Stacked sections (no divider label) | Simple, scannable; form is short so vertical space not a concern |
| Doctor view | New sidebar item "Khám chuyên sâu" | Separate from "Khám & kết luận" for visibility; count badge shows registered packages |
| "Chuyển bác sĩ ngay" button | Visual cue / manual action | Matches alert-only decision — receptionist handles escalation offline |

## 1. Intake Form — Triệu chứng nguy hiểm

### Location
After Section VII (Nguồn giới thiệu), at the bottom of the intake form.

### Appearance
- Red accent (border-left, icon, text color)
- Header: triangle warning icon + "Triệu chứng nguy hiểm" in red/destructive color
- Checkboxes in a 2-column grid

### Mockup Questions (admin-configurable, these are defaults)
1. Đau mắt nhiều
2. Giảm thị lực đột ngột
3. Triệu chứng lệch 1 bên rõ

### Alert State
When any checkbox is checked:
- Section background becomes light red tint
- Checked items get red border + red checkbox fill
- Alert banner appears below the checkboxes:
  - Red circle icon on the left
  - "Phát hiện triệu chứng nguy hiểm!" title
  - List of active flags as subtitle
  - "→ Chuyển bác sĩ ngay" destructive button on the right

### Behavior
- Same component behavior as the old `screening-form-red-flags.tsx`
- The "Chuyển bác sĩ ngay" button is an alert/reminder — on click, shows a confirmation toast (e.g., "Đã ghi nhận — vui lòng liên hệ bác sĩ") but does not change visit workflow or status
- Red flag state is saved on the visit object
- Doctor sees flagged symptoms in their "Bệnh nhân" sidebar section as an alert banner

### Data Model
```typescript
// On Visit object
dangerousSymptoms: {
  [key: string]: boolean  // admin-configurable keys
}
// Mockup keys: eyePain, suddenVisionLoss, asymmetry
```

## 2. Intake Form — Gói khám chuyên sâu

### Location
After the Triệu chứng nguy hiểm section, at the bottom of the intake form.

### Appearance
- Teal accent (matching brand primary)
- Header: medical bag + plus icon + "Gói khám chuyên sâu" in teal
- Checkboxes in a 2-column grid

### Mockup Packages (admin-configurable)
1. Khám chuyên sâu Khô mắt
2. Khám chuyên sâu Cận thị

### Behavior
- Receptionist checks packages the patient agrees to
- This is a billing/service item — no workflow changes
- Multiple packages can be selected per visit
- Package list is admin-configurable (future)

### Data Model
```typescript
// On Visit object
specializedPackages: string[]  // e.g., ["dry-eye", "myopia-control"]
```

## 3. Doctor View — Khám chuyên sâu Sidebar Item

### Sidebar Changes
New sidebar order for the doctor exam view:
1. Bệnh nhân
2. Khám chức năng (renamed from "Pre-Exam")
3. Cận lâm sàng (renamed from "Yêu cầu")
4. **Khám chuyên sâu** (new — with count badge)
5. Liệu trình
6. Khám & kết luận (moved to last)

### Sidebar Item
- Icon: medical bag with plus
- Label: "Khám chuyên sâu"
- Count badge: teal background, white text, shows number of registered packages (e.g., "2")
- Badge only shows when count > 0

### Content Area
- Header: "Gói đã đăng ký" label + "+ Thêm gói khám" dashed button (teal)
- Each registered package is a collapsible card:
  - Card header: teal dot + package name + "Đăng ký bởi Lễ tân" amber tag
  - Collapse/expand toggle
  - Card body: package-specific form

### Doctor Can Add Packages
- "+ Thêm gói khám" button opens a selector to add more packages
- Doctor-added packages show "Đăng ký bởi Bác sĩ" tag instead

### Dry Eye Package Form (Khám chuyên sâu Khô mắt)
Same form as the old `screening-step2-dry-eye.tsx`:
- **OSDI-6 Score**: "Chưa đánh giá" placeholder + "Làm bảng hỏi OSDI" button → opens OSDI-6 modal
  - When completed: shows score + severity badge + "6/6 câu đã trả lời"
  - "Làm lại" button to redo
- **TBUT (giây)**: OD/OS number inputs
- **Schirmer (mm)**: OD/OS number inputs
- **Meibomian**: textarea
- **Staining**: textarea

### Myopia Package Form (Khám chuyên sâu Cận thị)
- Placeholder for now — form fields TBD

### Data Model
```typescript
// On Visit object, alongside specializedPackages
specializedPackageData: {
  "dry-eye"?: {
    osdiAnswers: (number | null)[]
    osdiScore: number | null
    osdiSeverity: string | null
    tbutOd: string
    tbutOs: string
    schirmerOd: string
    schirmerOs: string
    meibomian: string
    staining: string
  }
  "myopia-control"?: {
    // TBD
  }
}
```

## 4. ExamTab Type Update

```typescript
export type ExamTab =
  | "patient"
  | "preExam"      // label: "Khám chức năng"
  | "requests"     // label: "Cận lâm sàng"
  | "specialized"  // label: "Khám chuyên sâu" (NEW)
  | "treatment"
  | "exam"         // moved to last position
```

## Files to Create/Modify

### New Files
- `src/components/intake/intake-dangerous-symptoms.tsx` — Red flag section for intake form
- `src/components/intake/intake-specialized-packages.tsx` — Package registration section
- `src/components/doctor/tab-specialized.tsx` — Doctor's specialized exam tab content
- `src/components/doctor/specialized-dry-eye-form.tsx` — Dry eye package form (reuses old screening code)
- `src/components/doctor/specialized-package-card.tsx` — Collapsible card wrapper for each package

### Modified Files
- `src/components/intake/intake-form-editable.tsx` — Add the two new sections
- `src/components/doctor/exam-sidebar.tsx` — Add "Khám chuyên sâu" item, rename "Pre-Exam" → "Khám chức năng", rename "Yêu cầu" → "Cận lâm sàng", reorder so "Khám & kết luận" is last
- `src/pages/doctor/visit.tsx` — Handle new "specialized" tab, render tab-specialized
- `src/data/mock-patients.ts` — Add `dangerousSymptoms`, `specializedPackages`, `specializedPackageData` to Visit type
- `src/contexts/receptionist-context.tsx` — Support updating dangerous symptoms and packages on visits

### Reusable from Git History
- OSDI-6 modal logic from old `screening-step2-osdi-modal.tsx`
- OSDI utility from `src/lib/osdi-utils.ts` (verify still exists)
- Dry eye form fields from old `screening-step2-dry-eye.tsx`
