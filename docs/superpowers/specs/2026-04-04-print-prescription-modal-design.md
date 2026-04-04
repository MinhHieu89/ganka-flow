# Print Prescription Modal — Design Spec

**Module:** Nhà thuốc (Pharmacy)
**Component:** `print-prescription-modal.tsx`
**Date:** 2026-04-04

---

## Overview

Modal that previews a prescription in A5 paper format before printing. The pharmacist can preview content and either print directly or save as PDF via the browser print dialog.

Triggered from:
- Dropdown "In đơn thuốc" in prescription queue table (both Chờ phát and Đã phát)
- Footer button in dispense-modal, view-prescription-modal, and dispense-detail-modal

---

## 1. Data Changes

### 1.1 New fields on `PrescriptionOrder`

| Field | Type | Example |
|---|---|---|
| `prescriptionCode` | `string` | `"DT-20260404-0001"` |
| `patientBirthYear` | `number` | `1985` |
| `patientGender` | `"male" \| "female"` | `"male"` |
| `patientPhone` | `string` | `"0912345678"` |

All 6 existing mock prescriptions will be updated with these fields.

### 1.2 Phone masking

Inline utility: `maskPhone("0912345678")` → `"0912.xxx.xxx"`. Masks the last 6 digits for privacy on the printed prescription.

---

## 2. Component

### 2.1 Props

```ts
interface PrintPrescriptionModalProps {
  open: boolean
  onClose: () => void
  order: PrescriptionOrder
}
```

### 2.2 Modal structure

- **Sizing:** `sm:max-w-2xl` (matches view-prescription-modal)
- **Header:** "In đơn thuốc — [Tên bệnh nhân]"
- **Description:** "Xem trước đơn thuốc. Đơn sẽ in trên giấy A5." — font-size 12px, secondary color
- **Body:** A5 paper preview card (border, padding 28px 32px, scrollable)
- **Footer:** 2 buttons right-aligned

### 2.3 Footer buttons

| Button | Variant | Action |
|---|---|---|
| Tải PDF | Secondary (outline) | `window.print()` — user selects "Save as PDF" in browser dialog |
| In đơn thuốc | Primary (filled) | `window.print()` — sends to printer |

Both buttons call `window.print()`. The distinction is semantic for the user — the browser print dialog handles both cases.

---

## 3. A5 Preview Layout

All sections inside a single card with border. Print CSS (`@media print`) hides modal chrome and prints only this card.

### 3.1 Header (centered)

| Line | Content | Style |
|---|---|---|
| 1 | "PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28" | 16px, font-weight 500 |
| 2 | Clinic address + phone | 11px, tertiary |
| 3 | "ĐƠN THUỐC" | 18px, font-weight 500, letter-spacing 1px |
| 4 | "Số: DT-YYYYMMDD-XXXX" | 11px, tertiary |

Separated from content below by border-bottom 1px.

### 3.2 Patient info (2-column grid)

| Field | Content | Notes |
|---|---|---|
| Họ tên | Patient name | font-weight 500 |
| Mã BN | BN-YYYYMMDD-XXXX | |
| Năm sinh | Year only | |
| Giới tính | "Nam" / "Nữ" | |
| Ngày khám | DD/MM/YYYY | Derived from `prescribedAt` |
| SĐT | 0912.xxx.xxx | Masked |

### 3.3 Diagnosis

Secondary background, border-radius, padding 8px 12px.
Content: "Chẩn đoán: **[diagnosis] ([ICD code])**"

### 3.4 Medication table

| Column | Content | Width |
|---|---|---|
| STT | Sequential number | 30px, centered |
| Tên thuốc | Medication name (font-weight 500) | auto |
| Cách dùng | Dosage instructions | auto |
| SL | Quantity + unit | auto |

**Substitution rule:** Show the actual dispensed medication name only. No notes about original medication or substitution reason — the printed prescription is for the patient.

**Data source:**
- Pending prescriptions: use `order.medications` — if a med has `substitution`, show `substitution.name`
- Dispensed prescriptions with `dispensedItems`: use `dispensedItems[].dispensedMedication`

### 3.5 Doctor notes (conditional)

Only shown when `order.doctorNotes` exists. Secondary background, border-radius, font-size 12px.
Content: "Lời dặn: [notes]"

### 3.6 Prescription footer (2-column)

| Left | Right |
|---|---|
| "Ngày DD tháng MM năm YYYY" (12px, tertiary) | Label: "Bác sĩ kê đơn" |
| | Doctor name (font-weight 500) |

No signature box, no pharmacist column.

### 3.7 Expiry line

Centered, 11px, tertiary.
Content: "Đơn thuốc có giá trị 7 ngày kể từ ngày kê — Hết hạn: DD/MM/YYYY"

Uses `order.expiresAt` directly.

---

## 4. Integration

### 4.1 prescription-queue-table.tsx

- Add `"print"` to `OpenModal` union type: `{ type: "print"; order: PrescriptionOrder }`
- Render `PrintPrescriptionModal` when `openModal.type === "print"`
- Wire dropdown "In đơn thuốc" action for both Chờ phát and Đã phát statuses

### 4.2 dispense-modal.tsx

- "In đơn thuốc" footer button opens `PrintPrescriptionModal`
- Add local state for print modal visibility
- Modal stacking: print overlays on top of dispense (same pattern as PrintLabelsModal)

### 4.3 view-prescription-modal.tsx

- "In đơn thuốc" footer button opens `PrintPrescriptionModal`
- Same local state + stacking pattern

### 4.4 dispense-detail-modal.tsx

- "In đơn thuốc" footer button opens `PrintPrescriptionModal`
- Same local state + stacking pattern

---

## 5. Print CSS

```css
@media print {
  /* Hide everything except the A5 preview card */
  /* The card prints at natural A5-ish size */
  /* No headers, footers, or modal chrome */
}
```

Applied via a `<style>` block inside the modal component or a dedicated print stylesheet. The A5 card uses `print:` Tailwind variant where possible.

---

## 6. Clinic constants

Hardcoded for the frontend shell:

| Constant | Value |
|---|---|
| Clinic name | PHÒNG KHÁM CHUYÊN KHOA MẮT GANKA28 |
| Address | (placeholder address — to be configured later) |
| Phone | (placeholder phone — to be configured later) |

These can be extracted to a config file later when the backend provides clinic info.
