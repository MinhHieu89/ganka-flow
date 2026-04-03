# Visit Detail Panel Redesign

## Summary

Redesign the visit detail panel (right side of "Lịch sử khám" tab) to display the full data from a completed doctor session — data from all 3 doctor exam tabs (Pre-Exam, Yêu cầu, Khám & kết luận). The panel uses the same card-based layout style as the Overview tab, with structured hierarchy and proper OD/OS formatting.

## Decisions

- **Layout**: Keep existing split-panel (timeline left, detail right). No full-width expansion.
- **Organization**: Grouped by clinical flow (Approach A) — sections follow the exam workflow order.
- **Scroll**: Flat vertical scroll, no accordions or sub-tabs.
- **OD/OS display**: Side-by-side columns for slit-lamp and fundus (OD left, OS right).
- **Data model**: Update `VisitRecord` to carry full doctor exam data.
- **Conditional sections**: Sections with null data simply don't render.

## Updated Data Model

`VisitRecord` in `src/data/mock-patient-detail.ts` is replaced with a richer structure:

```typescript
interface VisitRecord {
  id: string
  date: string
  diseaseGroup: DiseaseGroupType
  doctorName: string
  daysAgo: number | null

  // From Pre-Exam
  screening: {
    chiefComplaint: string
    ucva: { od: string; os: string }
    currentRx: { od: string; os: string } | null
    redFlags: { eyePain: boolean; suddenVisionLoss: boolean; asymmetry: boolean }
    symptoms: string[]              // active symptom labels
    blinkImprovement: string | null
    symptomDuration: string | null  // e.g. "12 tháng"
    screenTime: string | null       // e.g. "4 giờ/ngày"
    contactLens: string | null
    discomfortLevel: string | null
  }

  // From Pre-Exam Step 2 (conditional)
  dryEye: {
    osdiScore: number
    osdiMax: number
    osdiSeverity: string
    od: { tbut: string; schirmer: string; meibomian: string }
    os: { tbut: string; schirmer: string; meibomian: string }
    staining: string | null
  } | null

  // From Exam
  diagnoses: { text: string; icdCode: string; isPrimary: boolean }[]
  diagnosisNotes: string | null
  va: {
    od: { sc: string; cc: string; ph: string; iop: string }
    os: { sc: string; cc: string; ph: string; iop: string }
  }
  refraction: {
    auto: {
      od: { sph: string; cyl: string; axis: string }
      os: { sph: string; cyl: string; axis: string }
    }
    subjective: {
      od: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
      os: { sph: string; cyl: string; axis: string; bcva: string; add: string; pd: string }
    } | null
  }
  slitLamp: {
    od: { lids: string; conjunctiva: string; cornea: string; anteriorChamber: string; iris: string; lens: string; notes: string }
    os: { lids: string; conjunctiva: string; cornea: string; anteriorChamber: string; iris: string; lens: string; notes: string }
  } | null
  fundus: {
    od: { opticDisc: string; cdRatio: string; macula: string; vessels: string; peripheralRetina: string; notes: string }
    os: { opticDisc: string; cdRatio: string; macula: string; vessels: string; peripheralRetina: string; notes: string }
  } | null

  // From Requests
  requests: {
    type: string
    status: string
    result: string | null
  }[]

  // From Conclusion
  medications: {
    name: string
    description: string
    dosage: string
    frequency: string
    eye: string
    duration: string
    notes: string | null
  }[]
  opticalRx: {
    od: { sph: string; cyl: string; axis: string; add: string }
    os: { sph: string; cyl: string; axis: string; add: string }
    pd: string
    lensType: string
  } | null
  procedures: { name: string; notes: string }[]
  instructions: string | null
  followUp: { date: string; interval: string; instructions: string } | null
  followUpOverdue: boolean
}
```

## Panel Layout (top to bottom)

### 1. Header (unchanged)

- Date bold + disease group badge + "X ngày trước"
- Doctor name line
- Action buttons row: In phiếu, Xuất PDF, Xem đầy đủ

### 2. Chẩn đoán (Diagnosis)

- Horizontal pills row: primary (blue `#E6F1FB`/`#0C447C`) and secondary (tan `#F1EFE8`/`#444441`) with ICD code
- `diagnosisNotes` as muted text below if present

### 3. Lý do khám & Sàng lọc (Chief Complaint & Screening)

- Card style: `rounded-xl border border-border px-5 py-4`
- Section header: "LÝ DO KHÁM & SÀNG LỌC" (11px uppercase)

**Top section — key-value rows:**
- Lý do đến khám: chief complaint text
- Thị lực cơ bản (UCVA): `OD 4/10 · OS 5/10`
- Kính hiện tại: `OD 9/10 · OS 10/10` (conditional)
- Red flags: green "Không có Red Flag" or red alert text

**Divider**

**Bottom section — screening questions:**
- Sub-header: "CÂU HỎI ĐỊNH HƯỚNG" (11px uppercase)
- Active symptom pills row (only symptoms that are true)
- 2-column grid of key-value pairs:
  - Chớp mắt cải thiện | Screen time
  - Thời gian triệu chứng | Kính áp tròng
  - Mức độ khó chịu

### 4. Thị lực & Nhãn áp (VA & IOP)

- Card style: `rounded-[10px] bg-muted/50 p-3.5`
- Header: "THỊ LỰC & NHÃN ÁP"
- OdOsRow pattern:
  - **OD** (blue `#185FA5`): SC 20/40 · CC 20/25 · PH 20/20 · IOP 15
  - **OS** (orange `#993C1D`): SC 20/30 · CC 20/20 · PH 20/20 · IOP 14

### 5. Khúc xạ (Refraction)

- Card style: `rounded-[10px] bg-muted/50 p-3.5`
- Header: "KHÚC XẠ"
- Sub-section "Auto-Ref":
  - **OD** -2.50 / -0.75 x 180
  - **OS** -2.75 / -0.75 x 5
- If subjective refraction exists — divider, then sub-section "Chủ quan":
  - Same OD/OS format + BCVA, Add, PD values

### 6. Khô mắt (Dry Eye) — conditional

- Card style: `rounded-[10px] bg-muted/50 p-3.5`
- Only renders when `dryEye` is not null
- Header: "KHÔ MẮT (DRY EYE)"
- OSDI line: `OSDI-6: 18/30` + severity badge
- OD/OS rows: TBUT · Schirmer · Meibomian per eye
- Staining line if present

### 7. Sinh hiển vi (Slit-Lamp) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `slitLamp` is not null
- Header: "SINH HIỂN VI (SLIT-LAMP)"
- 2-column grid:
  - Left column header: "Mắt phải (OD)" with blue dot
  - Right column header: "Mắt trái (OS)" with orange dot
  - Rows in each column: Mi mắt, Kết mạc, Giác mạc, Tiền phòng, Mống mắt, Thể thủy tinh
  - Each row: label (muted) + value below
- Notes below columns if present

### 8. Đáy mắt (Fundus) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `fundus` is not null
- Header: "ĐÁY MẮT (FUNDUS)"
- Same 2-column OD/OS layout as slit-lamp
- Rows: Đĩa thị, C/D, Hoàng điểm, Mạch máu, Võng mạc ngoại vi
- Notes below if present

### 9. Kết quả CLS (Test Results) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `requests` array has items
- Header: "KẾT QUẢ CẬN LÂM SÀNG"
- Each request as a row:
  - Type name bold + status badge (completed/pending/cancelled)
  - Result text below (if completed)
  - Divider between items

### 10. Đơn thuốc (Medications) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `medications` array is non-empty
- Header: "ĐƠN THUỐC"
- Each medication as a row (same pattern as Overview tab):
  - Name bold + description muted
  - Right side: dosage · frequency · eye badge · duration
  - Notes below if present
  - Divider between items

### 11. Đơn kính (Optical Rx) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `opticalRx` is not null
- Header: "ĐƠN KÍNH"
- Same layout as Overview tab's Optical Rx card:
  - 2-column: OD (blue) / OS (orange)
  - Each: Sph, Cyl, Axis, Add in grid
  - Footer: PD, Lens type

### 12. Thủ thuật (Procedures) — conditional

- Card style: `rounded-xl border border-border px-5 py-4`
- Only renders when `procedures` array is non-empty
- Header: "THỦ THUẬT"
- Simple list: procedure name bold + notes muted

### 13. Dặn dò & Tái khám (Instructions & Follow-up)

- Card style: `rounded-xl border border-border px-5 py-4`
- Header: "DẶN DÒ & TÁI KHÁM"
- Instructions text
- Follow-up: date + interval
- Overdue indicator: red "quá hạn" text with `#A32D2D` color

## Styling Rules

- Space between cards: `space-y-4`
- Bordered cards: `rounded-xl border border-border px-5 py-4` (for sections with complex structure: screening, slit-lamp, fundus, requests, medications, optical Rx, procedures, instructions)
- Measurement cards: `rounded-[10px] bg-muted/50 p-3.5` (for VA, refraction, dry eye)
- Section headers: `text-[11px] font-medium tracking-wider text-muted-foreground uppercase`
- Sub-headers: same style as section headers
- OD color: `#185FA5` (blue)
- OS color: `#993C1D` (orange)
- Body text: `text-[13px]`
- Label text: `text-[11px] text-muted-foreground`
- Dividers: `border-b border-border` between list items

## Files to Modify

1. `src/data/mock-patient-detail.ts` — Update `VisitRecord` type + mock data
2. `src/components/patients/detail/visit-detail-panel.tsx` — Rewrite panel layout
3. `src/components/patients/detail/tab-visits.tsx` — Minor adjustments if timeline data shape changes

## Migration Notes

The old `VisitRecord` fields being removed/replaced:
- `summaryPills` — replaced by full `diagnoses` array and `screening.symptoms`
- `measurements` (flat `MeasurementData`) — replaced by separate `va`, `refraction`, `dryEye`, `slitLamp`, `fundus` fields
- `medications` type simplified name/description fields — expanded with `notes` field

The `MeasurementBlock` and `OdOsRow` reusable components from `measurement-block.tsx` continue to be used for VA, refraction, and dry eye sections.

## Out of Scope

- Full-width visit detail view (option B/C from earlier)
- Accordion or sub-tab navigation within the panel
- Backend integration
- Print/PDF layout changes
