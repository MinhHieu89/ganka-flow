# Pre-Exam Tab: Show Refraction Results

## Summary

Rewrite the doctor's "Khám chức năng" tab to display refraction data from the redesigned screening page, replacing the old screening data (UCVA, Red Flag, Step 2 dry eye).

## Changes

### Rewrite `src/components/doctor/tab-pre-exam.tsx`

Read-only display of `visit.refractionData` (RefractionFormData). Sections:

1. **Kính cũ (Current Glasses)** — OD/OS: SPH, CYL, AXIS, VA, ADD
2. **Khúc xạ khách quan (Objective Refraction)** — OD/OS: SPH, CYL, AXIS, VA
3. **Khúc xạ chủ quan (Subjective Refraction)** — OD/OS: SPH, CYL, AXIS, VA, ADD, VA Near
4. **Liệt điều tiết (Cycloplegic)** — conditional on `cycloplegicEnabled`: agent name(s) + OD/OS: SPH, CYL, AXIS, VA
5. **Các xét nghiệm khác (Other Tests)** — Retinoscopy OD/OS, IOP OD/OS, Axial Length OD/OS
6. **Đơn kính (Glasses Rx)** — conditional on `glassesRxEnabled`: OD/OS: SPH, CYL, AXIS, VA, ADD + PD, loại kính, mục đích, ghi chú
7. **Ghi chú** — free text notes, if present

**Layout:**
- Each section is a bordered card with uppercase section label
- OD/OS tables use primary badge (OD) and sky badge (OS) — consistent with screening form and other doctor tabs
- Empty state: "Chưa có kết quả khám chức năng" centered message
- Header: "Kết quả khám chức năng" (replacing "Kết quả Pre-Exam")

### Add mock refraction data

Add `refractionData` to 1-2 mock visits in `src/data/mock-patients.ts` so the doctor view has data to display.

### Remove old code

Remove all references to old `screeningData` display (UCVA, Red Flag, Step 2/dry eye, OSDI modal) from `tab-pre-exam.tsx`. The old `ScreeningFormData` type is no longer needed in this component.

## Files

- Rewrite: `src/components/doctor/tab-pre-exam.tsx`
- Modify: `src/data/mock-patients.ts` (add mock refractionData)
