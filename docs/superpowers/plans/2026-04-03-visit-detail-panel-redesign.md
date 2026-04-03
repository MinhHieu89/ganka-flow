# Visit Detail Panel Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the visit detail panel in the "Lịch sử khám" tab to display full doctor session data (Pre-Exam, Requests, Exam & Conclusion) using Overview-tab-style card layout with structured hierarchy.

**Architecture:** Update `VisitRecord` type and mock data to carry the full exam structure. Rewrite `visit-detail-panel.tsx` as a flat vertical scroll of styled card sections. Reuse existing `MeasurementBlock` and `OdOsRow` components. No changes to the page shell or tab-visits timeline.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui patterns

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/data/mock-patient-detail.ts` | Modify | Update `VisitRecord` interface + mock data |
| `src/components/patients/detail/visit-detail-panel.tsx` | Rewrite | New panel layout with 13 sections |
| `src/components/patients/detail/tab-visits.tsx` | No change | Timeline passes `VisitRecord` — interface unchanged |
| `src/components/patients/detail/measurement-block.tsx` | No change | Reused as-is for VA, refraction, dry eye cards |
| `src/components/patients/detail/tab-overview.tsx` | No change | Reference only for styling patterns |

---

### Task 1: Update VisitRecord type

**Files:**
- Modify: `src/data/mock-patient-detail.ts:97-110`

- [ ] **Step 1: Replace the VisitRecord interface**

Open `src/data/mock-patient-detail.ts`. Replace lines 97-110 (the entire `VisitRecord` interface) with:

```typescript
export interface VisitScreening {
  chiefComplaint: string
  ucva: { od: string; os: string }
  currentRx: { od: string; os: string } | null
  redFlags: {
    eyePain: boolean
    suddenVisionLoss: boolean
    asymmetry: boolean
  }
  symptoms: string[]
  blinkImprovement: string | null
  symptomDuration: string | null
  screenTime: string | null
  contactLens: string | null
  discomfortLevel: string | null
}

export interface VisitDryEye {
  osdiScore: number
  osdiMax: number
  osdiSeverity: string
  od: { tbut: string; schirmer: string; meibomian: string }
  os: { tbut: string; schirmer: string; meibomian: string }
  staining: string | null
}

export interface SlitLampEye {
  lids: string
  conjunctiva: string
  cornea: string
  anteriorChamber: string
  iris: string
  lens: string
  notes: string
}

export interface FundusEye {
  opticDisc: string
  cdRatio: string
  macula: string
  vessels: string
  peripheralRetina: string
  notes: string
}

export interface VisitRefraction {
  auto: {
    od: { sph: string; cyl: string; axis: string }
    os: { sph: string; cyl: string; axis: string }
  }
  subjective: {
    od: {
      sph: string
      cyl: string
      axis: string
      bcva: string
      add: string
      pd: string
    }
    os: {
      sph: string
      cyl: string
      axis: string
      bcva: string
      add: string
      pd: string
    }
  } | null
}

export interface VisitOpticalRx {
  od: { sph: string; cyl: string; axis: string; add: string }
  os: { sph: string; cyl: string; axis: string; add: string }
  pd: string
  lensType: string
}

export interface VisitMedication {
  name: string
  description: string
  dosage: string
  frequency: string
  eye: string
  duration: string
  notes: string | null
}

export interface VisitRequest {
  type: string
  status: string
  result: string | null
}

export interface VisitRecord {
  id: string
  date: string
  diseaseGroup: DiseaseGroupType
  doctorName: string
  daysAgo: number | null

  // Pre-Exam
  screening: VisitScreening

  // Pre-Exam Step 2 (conditional)
  dryEye: VisitDryEye | null

  // Exam
  diagnoses: { text: string; icdCode: string; isPrimary: boolean }[]
  diagnosisNotes: string | null
  va: {
    od: { sc: string; cc: string; ph: string; iop: string }
    os: { sc: string; cc: string; ph: string; iop: string }
  }
  refraction: VisitRefraction
  slitLamp: { od: SlitLampEye; os: SlitLampEye } | null
  fundus: { od: FundusEye; os: FundusEye } | null

  // Requests
  requests: VisitRequest[]

  // Conclusion
  medications: VisitMedication[]
  opticalRx: VisitOpticalRx | null
  procedures: { name: string; notes: string }[]
  instructions: string | null
  followUp: { date: string; interval: string; instructions: string } | null
  followUpOverdue: boolean
}
```

- [ ] **Step 2: Verify typecheck fails**

Run: `npm run typecheck`

Expected: Errors in `visit-detail-panel.tsx` and `mock-patient-detail.ts` (mock data) because the old fields (`summaryPills`, `measurements`) no longer exist. This confirms the type change propagated.

- [ ] **Step 3: Commit type change**

```bash
git add src/data/mock-patient-detail.ts
git commit -m "refactor: update VisitRecord type with full doctor exam data"
```

---

### Task 2: Update mock visit data

**Files:**
- Modify: `src/data/mock-patient-detail.ts:270-379` (the `visits` array inside `MOCK_PATIENT_DETAIL`)

- [ ] **Step 1: Replace the visits array**

In `MOCK_PATIENT_DETAIL`, replace the entire `visits: [...]` array (lines 270-379) with the new structure. All 3 visit records need updating:

```typescript
  visits: [
    {
      id: "v3",
      date: "15/01/2026",
      diseaseGroup: "dryEye",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: 79,
      screening: {
        chiefComplaint: "Tái khám định kỳ, kiểm tra độ kính",
        ucva: { od: "4/10", os: "5/10" },
        currentRx: { od: "9/10", os: "10/10" },
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: ["Nhìn mờ"],
        blinkImprovement: "Không",
        symptomDuration: "12 tháng",
        screenTime: "4 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: {
        osdiScore: 18,
        osdiMax: 30,
        osdiSeverity: "Trung bình",
        od: { tbut: "7s", schirmer: "12mm", meibomian: "Tắc nhẹ" },
        os: { tbut: "8s", schirmer: "10mm", meibomian: "BT" },
        staining: null,
      },
      diagnoses: [
        { text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true },
        { text: "Hội chứng khô mắt", icdCode: "H04.1", isPrimary: false },
      ],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/40", cc: "20/25", ph: "20/20", iop: "15" },
        os: { sc: "20/30", cc: "20/20", ph: "20/20", iop: "14" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.50", cyl: "-0.75", axis: "180" },
          os: { sph: "-2.75", cyl: "-0.75", axis: "5" },
        },
        subjective: null,
      },
      slitLamp: {
        od: {
          lids: "Bình thường",
          conjunctiva: "Bình thường",
          cornea: "Bình thường",
          anteriorChamber: "Bình thường",
          iris: "Bình thường",
          lens: "Trong",
          notes: "",
        },
        os: {
          lids: "Bình thường",
          conjunctiva: "Bình thường",
          cornea: "Bình thường",
          anteriorChamber: "Bình thường",
          iris: "Bình thường",
          lens: "Trong",
          notes: "",
        },
      },
      fundus: {
        od: {
          opticDisc: "Bình thường",
          cdRatio: "0.3",
          macula: "Bình thường",
          vessels: "Bình thường",
          peripheralRetina: "Bình thường",
          notes: "",
        },
        os: {
          opticDisc: "Bình thường",
          cdRatio: "0.3",
          macula: "Bình thường",
          vessels: "Bình thường",
          peripheralRetina: "Bình thường",
          notes: "",
        },
      },
      requests: [
        {
          type: "Đo khúc xạ chủ quan",
          status: "completed",
          result: "OD -2.25 / -0.50 x 180 (BCVA 20/20) · OS -2.50 / -0.50 x 5 (BCVA 20/20)",
        },
      ],
      medications: [
        {
          name: "Refresh Tears 0.5%",
          description: "Nước mắt nhân tạo",
          dosage: "1 giọt",
          frequency: "3 lần/ngày",
          eye: "OU",
          duration: "3 tháng",
          notes: null,
        },
        {
          name: "Systane Ultra",
          description: "Gel bôi trơn mắt",
          dosage: "1 giọt",
          frequency: "Khi cần",
          eye: "OU",
          duration: "3 tháng",
          notes: null,
        },
      ],
      opticalRx: null,
      procedures: [],
      instructions: "Giảm screen time. Nhỏ nước mắt đều.",
      followUp: {
        date: "15/03/2026",
        interval: "2 tháng",
        instructions: "Tái khám đánh giá khô mắt",
      },
      followUpOverdue: true,
    },
    {
      id: "v2",
      date: "20/09/2025",
      diseaseGroup: "refraction",
      doctorName: "BS. Trần Văn Hùng",
      daysAgo: 196,
      screening: {
        chiefComplaint: "Nhìn mờ xa, muốn kiểm tra lại độ kính",
        ucva: { od: "5/10", os: "6/10" },
        currentRx: { od: "9/10", os: "10/10" },
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: ["Nhìn mờ"],
        blinkImprovement: null,
        symptomDuration: "6 tháng",
        screenTime: "5 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: null,
      diagnoses: [
        { text: "Cận thị 2 mắt", icdCode: "H52.1", isPrimary: true },
      ],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/30", cc: "20/25", ph: "", iop: "14" },
        os: { sc: "20/25", cc: "20/20", ph: "", iop: "14" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.25", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.50", cyl: "-0.75", axis: "5" },
        },
        subjective: {
          od: {
            sph: "-2.25",
            cyl: "-0.50",
            axis: "180",
            bcva: "20/20",
            add: "",
            pd: "31.5",
          },
          os: {
            sph: "-2.50",
            cyl: "-0.50",
            axis: "5",
            bcva: "20/20",
            add: "",
            pd: "31.5",
          },
        },
      },
      slitLamp: null,
      fundus: null,
      requests: [
        {
          type: "Đo khúc xạ chủ quan",
          status: "completed",
          result: "OD -2.25 / -0.50 x 180 (BCVA 20/20) · OS -2.50 / -0.50 x 5 (BCVA 20/20)",
        },
      ],
      medications: [],
      opticalRx: {
        od: { sph: "-2.25", cyl: "-0.50", axis: "180°", add: "" },
        os: { sph: "-2.50", cyl: "-0.50", axis: "5°", add: "" },
        pd: "63.0",
        lensType: "Đơn tròng",
      },
      procedures: [],
      instructions: "Đeo kính đúng số. Tái khám sau 6 tháng.",
      followUp: null,
      followUpOverdue: false,
    },
    {
      id: "v1",
      date: "10/03/2025",
      diseaseGroup: "general",
      doctorName: "BS. Nguyễn Thị Mai",
      daysAgo: null,
      screening: {
        chiefComplaint: "Khám mắt tổng quát lần đầu",
        ucva: { od: "5/10", os: "6/10" },
        currentRx: null,
        redFlags: {
          eyePain: false,
          suddenVisionLoss: false,
          asymmetry: false,
        },
        symptoms: [],
        blinkImprovement: null,
        symptomDuration: null,
        screenTime: "4 giờ/ngày",
        contactLens: "Không",
        discomfortLevel: null,
      },
      dryEye: null,
      diagnoses: [
        { text: "Cận thị", icdCode: "H52.1", isPrimary: true },
      ],
      diagnosisNotes: null,
      va: {
        od: { sc: "20/30", cc: "20/20", ph: "", iop: "14" },
        os: { sc: "20/25", cc: "20/20", ph: "", iop: "13" },
      },
      refraction: {
        auto: {
          od: { sph: "-2.00", cyl: "-0.50", axis: "180" },
          os: { sph: "-2.25", cyl: "-0.50", axis: "5" },
        },
        subjective: null,
      },
      slitLamp: null,
      fundus: null,
      requests: [],
      medications: [],
      opticalRx: null,
      procedures: [],
      instructions: null,
      followUp: null,
      followUpOverdue: false,
    },
  ],
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`

Expected: Only errors should be in `visit-detail-panel.tsx` (which still references the old `measurements` field). The mock data should compile cleanly.

- [ ] **Step 3: Commit mock data update**

```bash
git add src/data/mock-patient-detail.ts
git commit -m "feat: update mock visit data with full exam structure"
```

---

### Task 3: Rewrite visit detail panel — Header + Diagnosis + Screening sections

**Files:**
- Modify: `src/components/patients/detail/visit-detail-panel.tsx` (full rewrite, starting with top 3 sections)

- [ ] **Step 1: Rewrite the file with header, diagnosis, and screening sections**

Replace the entire contents of `src/components/patients/detail/visit-detail-panel.tsx` with:

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface VisitDetailPanelProps {
  visit: VisitRecord
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      {children}
    </div>
  )
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-[13px]">
      <span className="w-[140px] shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]
  const s = visit.screening
  const hasRedFlags =
    s.redFlags.eyePain || s.redFlags.suddenVisionLoss || s.redFlags.asymmetry

  return (
    <div className="flex-1 overflow-y-auto py-4 pl-5">
      {/* 1. Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-[17px] font-medium">
            {visit.date}
            <span
              className={cn(
                "rounded-[5px] px-2.5 py-0.5 text-[10px] font-medium",
                groupConfig.colorClass
              )}
            >
              {groupConfig.label}
            </span>
          </div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            {visit.doctorName} ·{" "}
            {visit.daysAgo !== null
              ? `${visit.daysAgo} ngày trước`
              : "Khám lần đầu"}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            In phiếu
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Xuất PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs font-medium"
          >
            Xem đầy đủ
          </Button>
        </div>
      </div>

      {/* 2. Diagnosis pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {visit.diagnoses.map((dx, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              dx.isPrimary
                ? "bg-[#E6F1FB] text-[#0C447C]"
                : "bg-[#F1EFE8] text-[#444441]"
            )}
          >
            {dx.text} · {dx.icdCode}
          </span>
        ))}
        {visit.diagnosisNotes && (
          <div className="w-full mt-1 text-xs text-muted-foreground">
            {visit.diagnosisNotes}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* 3. Screening card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <SectionHeader>Lý do khám & sàng lọc</SectionHeader>
          <div className="space-y-1.5">
            <KvRow label="Lý do đến khám" value={s.chiefComplaint} />
            <KvRow
              label="Thị lực cơ bản"
              value={`OD ${s.ucva.od} · OS ${s.ucva.os}`}
            />
            {s.currentRx && (
              <KvRow
                label="Kính hiện tại"
                value={`OD ${s.currentRx.od} · OS ${s.currentRx.os}`}
              />
            )}
            <div className="flex text-[13px]">
              <span className="w-[140px] shrink-0 text-muted-foreground">
                Red flag
              </span>
              {hasRedFlags ? (
                <span className="font-medium text-[#A32D2D]">
                  {[
                    s.redFlags.eyePain && "Đau mắt",
                    s.redFlags.suddenVisionLoss && "Mất thị lực đột ngột",
                    s.redFlags.asymmetry && "Bất đối xứng",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-emerald-600">Không có Red Flag</span>
              )}
            </div>
          </div>

          {/* Screening questions */}
          {(s.symptoms.length > 0 ||
            s.blinkImprovement ||
            s.symptomDuration ||
            s.screenTime ||
            s.contactLens ||
            s.discomfortLevel) && (
            <>
              <div className="my-3 border-t border-border" />
              <SectionHeader>Câu hỏi định hướng</SectionHeader>

              {s.symptoms.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {s.symptoms.map((sym) => (
                    <span
                      key={sym}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {s.blinkImprovement && (
                  <KvRow label="Chớp mắt cải thiện" value={s.blinkImprovement} />
                )}
                {s.screenTime && (
                  <KvRow label="Screen time" value={s.screenTime} />
                )}
                {s.symptomDuration && (
                  <KvRow label="Thời gian t/c" value={s.symptomDuration} />
                )}
                {s.contactLens && (
                  <KvRow label="Kính áp tròng" value={s.contactLens} />
                )}
                {s.discomfortLevel && (
                  <KvRow label="Mức độ khó chịu" value={s.discomfortLevel} />
                )}
              </div>
            </>
          )}
        </div>

        {/* Sections 4-13 will be added in next tasks */}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`

Expected: PASS — no errors.

- [ ] **Step 3: Verify dev server renders**

Run: `npm run dev`

Open the patient detail page, click "Lịch sử khám" tab, select a visit. Verify the header, diagnosis pills, and screening card render correctly with mock data.

- [ ] **Step 4: Commit**

```bash
git add src/components/patients/detail/visit-detail-panel.tsx
git commit -m "feat: rewrite visit detail panel — header, diagnosis, screening sections"
```

---

### Task 4: Add measurement sections (VA, Refraction, Dry Eye)

**Files:**
- Modify: `src/components/patients/detail/visit-detail-panel.tsx`

- [ ] **Step 1: Add VA, Refraction, and Dry Eye sections**

In `visit-detail-panel.tsx`, find the comment `{/* Sections 4-13 will be added in next tasks */}` and replace it with:

```tsx
        {/* 4. VA & IOP */}
        <MeasurementBlock label="Thị lực & nhãn áp">
          <OdOsRow eye="OD">
            SC {visit.va.od.sc} · CC {visit.va.od.cc}
            {visit.va.od.ph && ` · PH ${visit.va.od.ph}`} · IOP{" "}
            {visit.va.od.iop}
          </OdOsRow>
          <OdOsRow eye="OS">
            SC {visit.va.os.sc} · CC {visit.va.os.cc}
            {visit.va.os.ph && ` · PH ${visit.va.os.ph}`} · IOP{" "}
            {visit.va.os.iop}
          </OdOsRow>
        </MeasurementBlock>

        {/* 5. Refraction */}
        <MeasurementBlock label="Khúc xạ">
          <div className="mb-1 text-[10px] font-medium text-muted-foreground">
            Auto-Ref
          </div>
          <OdOsRow eye="OD">
            {visit.refraction.auto.od.sph} / {visit.refraction.auto.od.cyl} x{" "}
            {visit.refraction.auto.od.axis}°
          </OdOsRow>
          <OdOsRow eye="OS">
            {visit.refraction.auto.os.sph} / {visit.refraction.auto.os.cyl} x{" "}
            {visit.refraction.auto.os.axis}°
          </OdOsRow>
          {visit.refraction.subjective && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="mb-1 text-[10px] font-medium text-muted-foreground">
                Chủ quan
              </div>
              <OdOsRow eye="OD">
                {visit.refraction.subjective.od.sph} /{" "}
                {visit.refraction.subjective.od.cyl} x{" "}
                {visit.refraction.subjective.od.axis}° · BCVA{" "}
                {visit.refraction.subjective.od.bcva}
                {visit.refraction.subjective.od.add &&
                  ` · Add ${visit.refraction.subjective.od.add}`}
              </OdOsRow>
              <OdOsRow eye="OS">
                {visit.refraction.subjective.os.sph} /{" "}
                {visit.refraction.subjective.os.cyl} x{" "}
                {visit.refraction.subjective.os.axis}° · BCVA{" "}
                {visit.refraction.subjective.os.bcva}
                {visit.refraction.subjective.os.add &&
                  ` · Add ${visit.refraction.subjective.os.add}`}
              </OdOsRow>
              {visit.refraction.subjective.od.pd && (
                <div className="mt-1 text-xs text-muted-foreground">
                  PD: {visit.refraction.subjective.od.pd} /{" "}
                  {visit.refraction.subjective.os.pd} mm
                </div>
              )}
            </>
          )}
        </MeasurementBlock>

        {/* 6. Dry Eye (conditional) */}
        {visit.dryEye && (
          <MeasurementBlock label="Khô mắt (Dry Eye)">
            <div>
              <b className="font-medium">OSDI-6:</b> {visit.dryEye.osdiScore}/
              {visit.dryEye.osdiMax}{" "}
              <span className="rounded bg-[#FAEEDA] px-1.5 py-px text-[10px] font-medium text-[#633806]">
                {visit.dryEye.osdiSeverity}
              </span>
            </div>
            <OdOsRow eye="OD">
              TBUT {visit.dryEye.od.tbut} · Schirmer {visit.dryEye.od.schirmer}{" "}
              · Meibomian: {visit.dryEye.od.meibomian}
            </OdOsRow>
            <OdOsRow eye="OS">
              TBUT {visit.dryEye.os.tbut} · Schirmer {visit.dryEye.os.schirmer}{" "}
              · Meibomian: {visit.dryEye.os.meibomian}
            </OdOsRow>
            {visit.dryEye.staining && (
              <div className="mt-1 text-xs text-muted-foreground">
                Nhuộm: {visit.dryEye.staining}
              </div>
            )}
          </MeasurementBlock>
        )}

        {/* Sections 7-13 will be added in next tasks */}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Verify in browser**

Check visit v3 (Dry Eye visit) shows all 3 measurement blocks. Check visit v2 (Refraction) shows VA + refraction with subjective sub-section but no dry eye block.

- [ ] **Step 4: Commit**

```bash
git add src/components/patients/detail/visit-detail-panel.tsx
git commit -m "feat: add VA, refraction, dry eye sections to visit detail panel"
```

---

### Task 5: Add slit-lamp and fundus sections

**Files:**
- Modify: `src/components/patients/detail/visit-detail-panel.tsx`

- [ ] **Step 1: Add EyeExamCard helper and slit-lamp/fundus sections**

In `visit-detail-panel.tsx`, add the `EyeExamCard` helper component after the `KvRow` function (before `VisitDetailPanel`):

```tsx
function EyeExamCard({
  title,
  od,
  os,
  fields,
}: {
  title: string
  od: Record<string, string>
  os: Record<string, string>
  fields: { key: string; label: string }[]
}) {
  return (
    <div className="rounded-xl border border-border px-5 py-4">
      <SectionHeader>{title}</SectionHeader>
      <div className="grid grid-cols-2 gap-4">
        {/* OD column */}
        <div>
          <div
            className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#185FA5" }}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: "#378ADD" }}
            />
            Mắt phải (OD)
          </div>
          <div className="space-y-1.5">
            {fields.map((f) => (
              <div key={f.key}>
                <div className="text-[10px] text-muted-foreground">
                  {f.label}
                </div>
                <div className="text-[13px]">{od[f.key]}</div>
              </div>
            ))}
          </div>
          {od.notes && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {od.notes}
            </div>
          )}
        </div>
        {/* OS column */}
        <div>
          <div
            className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "#993C1D" }}
          >
            <span
              className="inline-block size-2 rounded-full"
              style={{ background: "#D85A30" }}
            />
            Mắt trái (OS)
          </div>
          <div className="space-y-1.5">
            {fields.map((f) => (
              <div key={f.key}>
                <div className="text-[10px] text-muted-foreground">
                  {f.label}
                </div>
                <div className="text-[13px]">{os[f.key]}</div>
              </div>
            ))}
          </div>
          {os.notes && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {os.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add slit-lamp and fundus sections in the render**

Find the comment `{/* Sections 7-13 will be added in next tasks */}` and replace with:

```tsx
        {/* 7. Slit-Lamp (conditional) */}
        {visit.slitLamp && (
          <EyeExamCard
            title="Sinh hiển vi (Slit-Lamp)"
            od={visit.slitLamp.od}
            os={visit.slitLamp.os}
            fields={[
              { key: "lids", label: "Mi mắt" },
              { key: "conjunctiva", label: "Kết mạc" },
              { key: "cornea", label: "Giác mạc" },
              { key: "anteriorChamber", label: "Tiền phòng" },
              { key: "iris", label: "Mống mắt" },
              { key: "lens", label: "Thể thủy tinh" },
            ]}
          />
        )}

        {/* 8. Fundus (conditional) */}
        {visit.fundus && (
          <EyeExamCard
            title="Đáy mắt (Fundus)"
            od={visit.fundus.od}
            os={visit.fundus.os}
            fields={[
              { key: "opticDisc", label: "Đĩa thị" },
              { key: "cdRatio", label: "C/D" },
              { key: "macula", label: "Hoàng điểm" },
              { key: "vessels", label: "Mạch máu" },
              { key: "peripheralRetina", label: "Võng mạc ngoại vi" },
            ]}
          />
        )}

        {/* Sections 9-13 will be added in next task */}
```

- [ ] **Step 3: Verify typecheck passes**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 4: Verify in browser**

Check visit v3 (which has slit-lamp and fundus data) shows both cards with OD/OS side-by-side columns. Check visit v2 (no slit-lamp/fundus) does not show these sections.

- [ ] **Step 5: Commit**

```bash
git add src/components/patients/detail/visit-detail-panel.tsx
git commit -m "feat: add slit-lamp and fundus exam sections to visit detail panel"
```

---

### Task 6: Add requests, medications, optical Rx, procedures, follow-up sections

**Files:**
- Modify: `src/components/patients/detail/visit-detail-panel.tsx`

- [ ] **Step 1: Add remaining sections**

Find the comment `{/* Sections 9-13 will be added in next task */}` and replace with:

```tsx
        {/* 9. Requests (conditional) */}
        {visit.requests.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Kết quả cận lâm sàng</SectionHeader>
            {visit.requests.map((req, i) => (
              <div
                key={i}
                className={cn(
                  "py-2",
                  i < visit.requests.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-medium">{req.type}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-px text-[10px] font-medium",
                      req.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {req.status === "completed"
                      ? "Hoàn thành"
                      : req.status === "cancelled"
                        ? "Đã hủy"
                        : "Đang chờ"}
                  </span>
                </div>
                {req.result && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {req.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 10. Medications (conditional) */}
        {visit.medications.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Đơn thuốc</SectionHeader>
            {visit.medications.map((med, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start justify-between py-2.5",
                  i < visit.medications.length - 1 && "border-b border-border"
                )}
              >
                <div>
                  <div className="text-[13px] font-medium">{med.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {med.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-medium">
                    {med.dosage} · {med.frequency}
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {med.eye}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {med.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 11. Optical Rx (conditional) */}
        {visit.opticalRx && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Đơn kính</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              {/* OD */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div
                  className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#185FA5" }}
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: "#378ADD" }}
                  />
                  Mắt phải (OD)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Sph</div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Cyl</div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.axis}
                    </div>
                  </div>
                </div>
                {visit.opticalRx.od.add && (
                  <div className="mt-1.5 text-center text-xs text-muted-foreground">
                    Add: {visit.opticalRx.od.add}
                  </div>
                )}
              </div>
              {/* OS */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div
                  className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#993C1D" }}
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: "#D85A30" }}
                  />
                  Mắt trái (OS)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Sph</div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Cyl</div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.axis}
                    </div>
                  </div>
                </div>
                {visit.opticalRx.os.add && (
                  <div className="mt-1.5 text-center text-xs text-muted-foreground">
                    Add: {visit.opticalRx.os.add}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3.5 flex gap-5 border-t border-border pt-3.5 text-[13px]">
              <span>
                <span className="text-muted-foreground">PD </span>
                {visit.opticalRx.pd} mm
              </span>
              <span>
                <span className="text-muted-foreground">Loại </span>
                {visit.opticalRx.lensType}
              </span>
            </div>
          </div>
        )}

        {/* 12. Procedures (conditional) */}
        {visit.procedures.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Thủ thuật</SectionHeader>
            {visit.procedures.map((proc, i) => (
              <div
                key={i}
                className={cn(
                  "py-2",
                  i < visit.procedures.length - 1 && "border-b border-border"
                )}
              >
                <div className="text-[13px] font-medium">{proc.name}</div>
                {proc.notes && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {proc.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 13. Instructions & Follow-up */}
        {(visit.instructions || visit.followUp) && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Dặn dò & tái khám</SectionHeader>
            {visit.instructions && (
              <div className="text-[13px]">{visit.instructions}</div>
            )}
            {visit.followUp && (
              <div
                className={cn(
                  "mt-1.5 text-[13px]",
                  visit.followUpOverdue && "font-medium text-[#A32D2D]"
                )}
              >
                Tái khám: {visit.followUp.date} ({visit.followUp.interval})
                {visit.followUpOverdue && " — quá hạn"}
              </div>
            )}
            {visit.followUp?.instructions && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {visit.followUp.instructions}
              </div>
            )}
          </div>
        )}
```

- [ ] **Step 2: Verify typecheck passes**

Run: `npm run typecheck`

Expected: PASS

- [ ] **Step 3: Verify all 3 visits in browser**

- **Visit v3** (Dry Eye): Should show all 13 sections — screening, VA, refraction, dry eye, slit-lamp, fundus, requests, medications, instructions & follow-up (with red "quá hạn"). No optical Rx, no procedures.
- **Visit v2** (Refraction): Should show screening, VA, refraction (with subjective sub-section), requests, optical Rx card, instructions. No dry eye, slit-lamp, fundus, medications, procedures.
- **Visit v1** (General): Should show screening, VA, refraction (auto only). No other sections (minimal first visit).

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Fix any lint errors if present.

- [ ] **Step 5: Commit**

```bash
git add src/components/patients/detail/visit-detail-panel.tsx
git commit -m "feat: add requests, medications, optical Rx, procedures, follow-up sections"
```

---

### Task 7: Final verification and cleanup

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run full build**

Run: `npm run build`

Expected: PASS — clean build with no errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS — no lint errors.

- [ ] **Step 3: Visual review in browser**

Run `npm run dev` and check:
1. Timeline on left still works — clicking visits switches the detail panel
2. Visit v3 shows the full 13-section layout with proper card styling
3. Visit v2 shows refraction-focused view with optical Rx and subjective refraction
4. Visit v1 shows minimal first visit with just screening + basic measurements
5. Scrolling works smoothly in the detail panel
6. All Vietnamese labels have proper diacritics
7. OD/OS colors are correct (OD blue, OS orange)
8. No emoji anywhere in the UI

- [ ] **Step 4: Commit any final fixes**

If any fixes were needed from the visual review:

```bash
git add -u
git commit -m "fix: polish visit detail panel styling"
```
