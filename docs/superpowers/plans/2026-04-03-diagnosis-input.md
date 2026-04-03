# Diagnosis Input Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Chẩn đoán section with a comprehensive ophthalmology ICD-10 catalog (~150 codes), category-grouped search dropdown with Vietnamese + English names, and primary/secondary diagnosis management with promote functionality.

**Architecture:** Two-file change. Expand `src/data/diagnoses.ts` with the new `DiagnosisCatalogEntry` interface and ~150 ICD-10 entries. Rewrite `src/components/doctor/diagnosis-input.tsx` with category-grouped dropdown, diacritics-insensitive search, keyboard navigation, promote-to-primary button, and ICD-code-prominent selected chips.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui Input, HugeIcons (Cancel01Icon, ArrowUp01Icon)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/data/diagnoses.ts` | Rewrite | ICD-10 catalog data — interface + ~150 entries with `icd10`, `nameVi`, `nameEn`, `category` |
| `src/components/doctor/diagnosis-input.tsx` | Rewrite | Diagnosis search UI — grouped dropdown, selected chips with promote/remove, keyboard nav |

---

### Task 1: Expand ICD-10 Catalog Data

**Files:**
- Rewrite: `src/data/diagnoses.ts`

- [ ] **Step 1: Replace the catalog file with new interface and ophthalmology data**

Replace the entire contents of `src/data/diagnoses.ts` with the expanded catalog. The new interface adds `nameVi`, `nameEn`, `category` fields. Entries are organized by ophthalmic category with granular sub-codes.

```ts
export interface DiagnosisCatalogEntry {
  icd10: string
  nameVi: string
  nameEn: string
  category: string
}

export const diagnosisCatalog: DiagnosisCatalogEntry[] = [
  // --- Chalazion / Hordeolum (H00) ---
  { icd10: "H00.01", nameVi: "Lẹo mắt phải", nameEn: "Hordeolum, right eye", category: "Lẹo / Chắp" },
  { icd10: "H00.02", nameVi: "Lẹo mắt trái", nameEn: "Hordeolum, left eye", category: "Lẹo / Chắp" },
  { icd10: "H00.03", nameVi: "Lẹo hai mắt", nameEn: "Hordeolum, bilateral", category: "Lẹo / Chắp" },
  { icd10: "H00.11", nameVi: "Chắp mắt phải", nameEn: "Chalazion, right eye", category: "Lẹo / Chắp" },
  { icd10: "H00.12", nameVi: "Chắp mắt trái", nameEn: "Chalazion, left eye", category: "Lẹo / Chắp" },
  { icd10: "H00.13", nameVi: "Chắp hai mắt", nameEn: "Chalazion, bilateral", category: "Lẹo / Chắp" },

  // --- Blepharitis (H01.0) ---
  { icd10: "H01.001", nameVi: "Viêm bờ mi mắt phải, không đặc hiệu", nameEn: "Unspecified blepharitis, right eye", category: "Blepharitis" },
  { icd10: "H01.002", nameVi: "Viêm bờ mi mắt trái, không đặc hiệu", nameEn: "Unspecified blepharitis, left eye", category: "Blepharitis" },
  { icd10: "H01.003", nameVi: "Viêm bờ mi hai mắt, không đặc hiệu", nameEn: "Unspecified blepharitis, bilateral", category: "Blepharitis" },
  { icd10: "H01.011", nameVi: "Viêm bờ mi loét mắt phải", nameEn: "Ulcerative blepharitis, right eye", category: "Blepharitis" },
  { icd10: "H01.012", nameVi: "Viêm bờ mi loét mắt trái", nameEn: "Ulcerative blepharitis, left eye", category: "Blepharitis" },
  { icd10: "H01.013", nameVi: "Viêm bờ mi loét hai mắt", nameEn: "Ulcerative blepharitis, bilateral", category: "Blepharitis" },
  { icd10: "H01.021", nameVi: "Viêm bờ mi vảy mắt phải", nameEn: "Squamous blepharitis, right eye", category: "Blepharitis" },
  { icd10: "H01.022", nameVi: "Viêm bờ mi vảy mắt trái", nameEn: "Squamous blepharitis, left eye", category: "Blepharitis" },
  { icd10: "H01.023", nameVi: "Viêm bờ mi vảy hai mắt", nameEn: "Squamous blepharitis, bilateral", category: "Blepharitis" },

  // --- Lid Disorders (H02) ---
  { icd10: "H02.001", nameVi: "Lật mi trong mắt phải", nameEn: "Entropion, right eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.002", nameVi: "Lật mi trong mắt trái", nameEn: "Entropion, left eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.003", nameVi: "Lật mi trong hai mắt", nameEn: "Entropion, bilateral", category: "Bệnh lý mi mắt" },
  { icd10: "H02.101", nameVi: "Lật mi ngoài mắt phải", nameEn: "Ectropion, right eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.102", nameVi: "Lật mi ngoài mắt trái", nameEn: "Ectropion, left eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.103", nameVi: "Lật mi ngoài hai mắt", nameEn: "Ectropion, bilateral", category: "Bệnh lý mi mắt" },
  { icd10: "H02.401", nameVi: "Sụp mi mắt phải", nameEn: "Ptosis, right eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.402", nameVi: "Sụp mi mắt trái", nameEn: "Ptosis, left eye", category: "Bệnh lý mi mắt" },
  { icd10: "H02.403", nameVi: "Sụp mi hai mắt", nameEn: "Ptosis, bilateral", category: "Bệnh lý mi mắt" },

  // --- Lacrimal Disorders (H04) ---
  { icd10: "H04.101", nameVi: "Khô mắt mắt phải", nameEn: "Dry eye syndrome, right eye", category: "Khô mắt" },
  { icd10: "H04.102", nameVi: "Khô mắt mắt trái", nameEn: "Dry eye syndrome, left eye", category: "Khô mắt" },
  { icd10: "H04.103", nameVi: "Khô mắt hai mắt", nameEn: "Dry eye syndrome, bilateral", category: "Khô mắt" },
  { icd10: "H04.111", nameVi: "Khô mắt do thiếu nước mắt, mắt phải", nameEn: "Dry eye, aqueous tear deficiency, right eye", category: "Khô mắt" },
  { icd10: "H04.112", nameVi: "Khô mắt do thiếu nước mắt, mắt trái", nameEn: "Dry eye, aqueous tear deficiency, left eye", category: "Khô mắt" },
  { icd10: "H04.113", nameVi: "Khô mắt do thiếu nước mắt, hai mắt", nameEn: "Dry eye, aqueous tear deficiency, bilateral", category: "Khô mắt" },
  { icd10: "H04.121", nameVi: "Khô mắt do bay hơi, mắt phải", nameEn: "Dry eye, evaporative, right eye", category: "Khô mắt" },
  { icd10: "H04.122", nameVi: "Khô mắt do bay hơi, mắt trái", nameEn: "Dry eye, evaporative, left eye", category: "Khô mắt" },
  { icd10: "H04.123", nameVi: "Khô mắt do bay hơi, hai mắt", nameEn: "Dry eye, evaporative, bilateral", category: "Khô mắt" },
  { icd10: "H04.301", nameVi: "Viêm túi lệ cấp mắt phải", nameEn: "Acute dacryocystitis, right eye", category: "Bệnh lý lệ đạo" },
  { icd10: "H04.302", nameVi: "Viêm túi lệ cấp mắt trái", nameEn: "Acute dacryocystitis, left eye", category: "Bệnh lý lệ đạo" },
  { icd10: "H04.411", nameVi: "Tắc lệ đạo mạn tính mắt phải", nameEn: "Chronic lacrimal obstruction, right eye", category: "Bệnh lý lệ đạo" },
  { icd10: "H04.412", nameVi: "Tắc lệ đạo mạn tính mắt trái", nameEn: "Chronic lacrimal obstruction, left eye", category: "Bệnh lý lệ đạo" },

  // --- Conjunctivitis (H10) ---
  { icd10: "H10.011", nameVi: "Viêm kết mạc nhầy mủ mắt phải", nameEn: "Mucopurulent conjunctivitis, right eye", category: "Viêm kết mạc" },
  { icd10: "H10.012", nameVi: "Viêm kết mạc nhầy mủ mắt trái", nameEn: "Mucopurulent conjunctivitis, left eye", category: "Viêm kết mạc" },
  { icd10: "H10.013", nameVi: "Viêm kết mạc nhầy mủ hai mắt", nameEn: "Mucopurulent conjunctivitis, bilateral", category: "Viêm kết mạc" },
  { icd10: "H10.10", nameVi: "Viêm kết mạc dị ứng cấp", nameEn: "Acute allergic conjunctivitis", category: "Viêm kết mạc" },
  { icd10: "H10.11", nameVi: "Viêm kết mạc dị ứng cấp mắt phải", nameEn: "Acute allergic conjunctivitis, right eye", category: "Viêm kết mạc" },
  { icd10: "H10.12", nameVi: "Viêm kết mạc dị ứng cấp mắt trái", nameEn: "Acute allergic conjunctivitis, left eye", category: "Viêm kết mạc" },
  { icd10: "H10.13", nameVi: "Viêm kết mạc dị ứng cấp hai mắt", nameEn: "Acute allergic conjunctivitis, bilateral", category: "Viêm kết mạc" },
  { icd10: "H10.401", nameVi: "Viêm kết mạc mạn tính mắt phải", nameEn: "Chronic conjunctivitis, right eye", category: "Viêm kết mạc" },
  { icd10: "H10.402", nameVi: "Viêm kết mạc mạn tính mắt trái", nameEn: "Chronic conjunctivitis, left eye", category: "Viêm kết mạc" },
  { icd10: "H10.403", nameVi: "Viêm kết mạc mạn tính hai mắt", nameEn: "Chronic conjunctivitis, bilateral", category: "Viêm kết mạc" },
  { icd10: "H10.501", nameVi: "Viêm kết mạc bọng mắt phải", nameEn: "Blepharoconjunctivitis, right eye", category: "Viêm kết mạc" },
  { icd10: "H10.502", nameVi: "Viêm kết mạc bọng mắt trái", nameEn: "Blepharoconjunctivitis, left eye", category: "Viêm kết mạc" },
  { icd10: "H11.301", nameVi: "Xuất huyết kết mạc mắt phải", nameEn: "Subconjunctival hemorrhage, right eye", category: "Viêm kết mạc" },
  { icd10: "H11.302", nameVi: "Xuất huyết kết mạc mắt trái", nameEn: "Subconjunctival hemorrhage, left eye", category: "Viêm kết mạc" },
  { icd10: "H11.303", nameVi: "Xuất huyết kết mạc hai mắt", nameEn: "Subconjunctival hemorrhage, bilateral", category: "Viêm kết mạc" },
  { icd10: "H11.051", nameVi: "Mộng thịt mắt phải", nameEn: "Pterygium, right eye", category: "Viêm kết mạc" },
  { icd10: "H11.052", nameVi: "Mộng thịt mắt trái", nameEn: "Pterygium, left eye", category: "Viêm kết mạc" },
  { icd10: "H11.053", nameVi: "Mộng thịt hai mắt", nameEn: "Pterygium, bilateral", category: "Viêm kết mạc" },

  // --- Keratitis (H16) ---
  { icd10: "H16.001", nameVi: "Loét giác mạc mắt phải", nameEn: "Corneal ulcer, right eye", category: "Viêm giác mạc" },
  { icd10: "H16.002", nameVi: "Loét giác mạc mắt trái", nameEn: "Corneal ulcer, left eye", category: "Viêm giác mạc" },
  { icd10: "H16.003", nameVi: "Loét giác mạc hai mắt", nameEn: "Corneal ulcer, bilateral", category: "Viêm giác mạc" },
  { icd10: "H16.101", nameVi: "Viêm giác mạc nông mắt phải", nameEn: "Superficial keratitis, right eye", category: "Viêm giác mạc" },
  { icd10: "H16.102", nameVi: "Viêm giác mạc nông mắt trái", nameEn: "Superficial keratitis, left eye", category: "Viêm giác mạc" },
  { icd10: "H16.103", nameVi: "Viêm giác mạc nông hai mắt", nameEn: "Superficial keratitis, bilateral", category: "Viêm giác mạc" },
  { icd10: "H16.301", nameVi: "Viêm giác mạc mô kẽ mắt phải", nameEn: "Interstitial keratitis, right eye", category: "Viêm giác mạc" },
  { icd10: "H16.302", nameVi: "Viêm giác mạc mô kẽ mắt trái", nameEn: "Interstitial keratitis, left eye", category: "Viêm giác mạc" },
  { icd10: "H16.303", nameVi: "Viêm giác mạc mô kẽ hai mắt", nameEn: "Interstitial keratitis, bilateral", category: "Viêm giác mạc" },
  { icd10: "H18.601", nameVi: "Giác mạc hình chóp mắt phải", nameEn: "Keratoconus, right eye", category: "Viêm giác mạc" },
  { icd10: "H18.602", nameVi: "Giác mạc hình chóp mắt trái", nameEn: "Keratoconus, left eye", category: "Viêm giác mạc" },
  { icd10: "H18.603", nameVi: "Giác mạc hình chóp hai mắt", nameEn: "Keratoconus, bilateral", category: "Viêm giác mạc" },

  // --- Cataract (H25, H26) ---
  { icd10: "H25.011", nameVi: "Đục thủy tinh thể tuổi già vỏ mắt phải", nameEn: "Age-related cortical cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.012", nameVi: "Đục thủy tinh thể tuổi già vỏ mắt trái", nameEn: "Age-related cortical cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.013", nameVi: "Đục thủy tinh thể tuổi già vỏ hai mắt", nameEn: "Age-related cortical cataract, bilateral", category: "Đục thủy tinh thể" },
  { icd10: "H25.11", nameVi: "Đục thủy tinh thể nhân mắt phải", nameEn: "Age-related nuclear cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.12", nameVi: "Đục thủy tinh thể nhân mắt trái", nameEn: "Age-related nuclear cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.13", nameVi: "Đục thủy tinh thể nhân hai mắt", nameEn: "Age-related nuclear cataract, bilateral", category: "Đục thủy tinh thể" },
  { icd10: "H25.21", nameVi: "Đục thủy tinh thể chín mắt phải", nameEn: "Age-related mature cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.22", nameVi: "Đục thủy tinh thể chín mắt trái", nameEn: "Age-related mature cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.23", nameVi: "Đục thủy tinh thể chín hai mắt", nameEn: "Age-related mature cataract, bilateral", category: "Đục thủy tinh thể" },
  { icd10: "H25.811", nameVi: "Đục thủy tinh thể tuổi già hỗn hợp mắt phải", nameEn: "Combined age-related cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.812", nameVi: "Đục thủy tinh thể tuổi già hỗn hợp mắt trái", nameEn: "Combined age-related cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H25.813", nameVi: "Đục thủy tinh thể tuổi già hỗn hợp hai mắt", nameEn: "Combined age-related cataract, bilateral", category: "Đục thủy tinh thể" },
  { icd10: "H26.001", nameVi: "Đục thủy tinh thể trẻ em mắt phải", nameEn: "Infantile cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H26.002", nameVi: "Đục thủy tinh thể trẻ em mắt trái", nameEn: "Infantile cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H26.003", nameVi: "Đục thủy tinh thể trẻ em hai mắt", nameEn: "Infantile cataract, bilateral", category: "Đục thủy tinh thể" },
  { icd10: "H26.101", nameVi: "Đục thủy tinh thể chấn thương mắt phải", nameEn: "Traumatic cataract, right eye", category: "Đục thủy tinh thể" },
  { icd10: "H26.102", nameVi: "Đục thủy tinh thể chấn thương mắt trái", nameEn: "Traumatic cataract, left eye", category: "Đục thủy tinh thể" },
  { icd10: "H26.103", nameVi: "Đục thủy tinh thể chấn thương hai mắt", nameEn: "Traumatic cataract, bilateral", category: "Đục thủy tinh thể" },

  // --- Glaucoma (H40) ---
  { icd10: "H40.011", nameVi: "Nghi ngờ glaucoma góc mở mắt phải", nameEn: "Open-angle glaucoma suspect, right eye", category: "Glaucoma" },
  { icd10: "H40.012", nameVi: "Nghi ngờ glaucoma góc mở mắt trái", nameEn: "Open-angle glaucoma suspect, left eye", category: "Glaucoma" },
  { icd10: "H40.013", nameVi: "Nghi ngờ glaucoma góc mở hai mắt", nameEn: "Open-angle glaucoma suspect, bilateral", category: "Glaucoma" },
  { icd10: "H40.10", nameVi: "Glaucoma góc mở nguyên phát, chưa xác định giai đoạn", nameEn: "Primary open-angle glaucoma, unspecified stage", category: "Glaucoma" },
  { icd10: "H40.111", nameVi: "Glaucoma góc mở nguyên phát mắt phải, nhẹ", nameEn: "Primary open-angle glaucoma, right eye, mild", category: "Glaucoma" },
  { icd10: "H40.112", nameVi: "Glaucoma góc mở nguyên phát mắt trái, nhẹ", nameEn: "Primary open-angle glaucoma, left eye, mild", category: "Glaucoma" },
  { icd10: "H40.113", nameVi: "Glaucoma góc mở nguyên phát hai mắt, nhẹ", nameEn: "Primary open-angle glaucoma, bilateral, mild", category: "Glaucoma" },
  { icd10: "H40.121", nameVi: "Glaucoma góc mở nguyên phát mắt phải, trung bình", nameEn: "Primary open-angle glaucoma, right eye, moderate", category: "Glaucoma" },
  { icd10: "H40.122", nameVi: "Glaucoma góc mở nguyên phát mắt trái, trung bình", nameEn: "Primary open-angle glaucoma, left eye, moderate", category: "Glaucoma" },
  { icd10: "H40.20", nameVi: "Glaucoma góc đóng nguyên phát, chưa xác định", nameEn: "Primary angle-closure glaucoma, unspecified", category: "Glaucoma" },
  { icd10: "H40.211", nameVi: "Glaucoma góc đóng cấp mắt phải", nameEn: "Acute angle-closure glaucoma, right eye", category: "Glaucoma" },
  { icd10: "H40.212", nameVi: "Glaucoma góc đóng cấp mắt trái", nameEn: "Acute angle-closure glaucoma, left eye", category: "Glaucoma" },
  { icd10: "H40.213", nameVi: "Glaucoma góc đóng cấp hai mắt", nameEn: "Acute angle-closure glaucoma, bilateral", category: "Glaucoma" },
  { icd10: "H40.31", nameVi: "Glaucoma thứ phát sau chấn thương mắt phải", nameEn: "Secondary glaucoma due to trauma, right eye", category: "Glaucoma" },
  { icd10: "H40.32", nameVi: "Glaucoma thứ phát sau chấn thương mắt trái", nameEn: "Secondary glaucoma due to trauma, left eye", category: "Glaucoma" },

  // --- Vitreous Disorders (H43) ---
  { icd10: "H43.10", nameVi: "Xuất huyết dịch kính, chưa xác định mắt", nameEn: "Vitreous hemorrhage, unspecified eye", category: "Bệnh lý dịch kính" },
  { icd10: "H43.11", nameVi: "Xuất huyết dịch kính mắt phải", nameEn: "Vitreous hemorrhage, right eye", category: "Bệnh lý dịch kính" },
  { icd10: "H43.12", nameVi: "Xuất huyết dịch kính mắt trái", nameEn: "Vitreous hemorrhage, left eye", category: "Bệnh lý dịch kính" },
  { icd10: "H43.13", nameVi: "Xuất huyết dịch kính hai mắt", nameEn: "Vitreous hemorrhage, bilateral", category: "Bệnh lý dịch kính" },
  { icd10: "H43.811", nameVi: "Bong dịch kính sau mắt phải", nameEn: "Posterior vitreous detachment, right eye", category: "Bệnh lý dịch kính" },
  { icd10: "H43.812", nameVi: "Bong dịch kính sau mắt trái", nameEn: "Posterior vitreous detachment, left eye", category: "Bệnh lý dịch kính" },
  { icd10: "H43.813", nameVi: "Bong dịch kính sau hai mắt", nameEn: "Posterior vitreous detachment, bilateral", category: "Bệnh lý dịch kính" },

  // --- Retinal Disorders (H33, H35) ---
  { icd10: "H33.001", nameVi: "Bong võng mạc kèm rách, mắt phải", nameEn: "Retinal detachment with break, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H33.002", nameVi: "Bong võng mạc kèm rách, mắt trái", nameEn: "Retinal detachment with break, left eye", category: "Bệnh lý võng mạc" },
  { icd10: "H33.003", nameVi: "Bong võng mạc kèm rách, hai mắt", nameEn: "Retinal detachment with break, bilateral", category: "Bệnh lý võng mạc" },
  { icd10: "H33.40", nameVi: "Thoái hóa võng mạc lưới", nameEn: "Lattice degeneration of retina", category: "Bệnh lý võng mạc" },
  { icd10: "H33.41", nameVi: "Thoái hóa võng mạc lưới mắt phải", nameEn: "Lattice degeneration of retina, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H33.42", nameVi: "Thoái hóa võng mạc lưới mắt trái", nameEn: "Lattice degeneration of retina, left eye", category: "Bệnh lý võng mạc" },
  { icd10: "H35.011", nameVi: "Bệnh võng mạc tăng huyết áp mắt phải", nameEn: "Hypertensive retinopathy, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H35.012", nameVi: "Bệnh võng mạc tăng huyết áp mắt trái", nameEn: "Hypertensive retinopathy, left eye", category: "Bệnh lý võng mạc" },
  { icd10: "H35.81", nameVi: "Xuất huyết võng mạc mắt phải", nameEn: "Retinal hemorrhage, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H35.82", nameVi: "Xuất huyết võng mạc mắt trái", nameEn: "Retinal hemorrhage, left eye", category: "Bệnh lý võng mạc" },
  { icd10: "H34.11", nameVi: "Tắc động mạch trung tâm võng mạc mắt phải", nameEn: "Central retinal artery occlusion, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H34.12", nameVi: "Tắc động mạch trung tâm võng mạc mắt trái", nameEn: "Central retinal artery occlusion, left eye", category: "Bệnh lý võng mạc" },
  { icd10: "H34.811", nameVi: "Tắc tĩnh mạch trung tâm võng mạc mắt phải", nameEn: "Central retinal vein occlusion, right eye", category: "Bệnh lý võng mạc" },
  { icd10: "H34.812", nameVi: "Tắc tĩnh mạch trung tâm võng mạc mắt trái", nameEn: "Central retinal vein occlusion, left eye", category: "Bệnh lý võng mạc" },

  // --- Macular Degeneration (H35.3) ---
  { icd10: "H35.3010", nameVi: "Thoái hóa hoàng điểm khô tuổi già, chưa xác định", nameEn: "Age-related dry macular degeneration, unspecified", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3111", nameVi: "Thoái hóa hoàng điểm khô giai đoạn sớm mắt phải", nameEn: "Early age-related dry macular degeneration, right eye", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3112", nameVi: "Thoái hóa hoàng điểm khô giai đoạn sớm mắt trái", nameEn: "Early age-related dry macular degeneration, left eye", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3113", nameVi: "Thoái hóa hoàng điểm khô giai đoạn sớm hai mắt", nameEn: "Early age-related dry macular degeneration, bilateral", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3211", nameVi: "Thoái hóa hoàng điểm ướt mắt phải", nameEn: "Exudative age-related macular degeneration, right eye", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3212", nameVi: "Thoái hóa hoàng điểm ướt mắt trái", nameEn: "Exudative age-related macular degeneration, left eye", category: "Thoái hóa hoàng điểm" },
  { icd10: "H35.3213", nameVi: "Thoái hóa hoàng điểm ướt hai mắt", nameEn: "Exudative age-related macular degeneration, bilateral", category: "Thoái hóa hoàng điểm" },

  // --- Diabetic Retinopathy (E11.3x) ---
  { icd10: "E11.3211", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh nhẹ có phù hoàng điểm, mắt phải", nameEn: "Type 2 DM with mild NPDR with macular edema, right eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3212", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh nhẹ có phù hoàng điểm, mắt trái", nameEn: "Type 2 DM with mild NPDR with macular edema, left eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3213", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh nhẹ có phù hoàng điểm, hai mắt", nameEn: "Type 2 DM with mild NPDR with macular edema, bilateral", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3291", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh nhẹ không phù hoàng điểm, mắt phải", nameEn: "Type 2 DM with mild NPDR without macular edema, right eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3311", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh trung bình có phù hoàng điểm, mắt phải", nameEn: "Type 2 DM with moderate NPDR with macular edema, right eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3312", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh trung bình có phù hoàng điểm, mắt trái", nameEn: "Type 2 DM with moderate NPDR with macular edema, left eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3313", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh trung bình có phù hoàng điểm, hai mắt", nameEn: "Type 2 DM with moderate NPDR with macular edema, bilateral", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3411", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không tăng sinh nặng có phù hoàng điểm, mắt phải", nameEn: "Type 2 DM with severe NPDR with macular edema, right eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3511", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ tăng sinh có phù hoàng điểm, mắt phải", nameEn: "Type 2 DM with PDR with macular edema, right eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3512", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ tăng sinh có phù hoàng điểm, mắt trái", nameEn: "Type 2 DM with PDR with macular edema, left eye", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.3513", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ tăng sinh có phù hoàng điểm, hai mắt", nameEn: "Type 2 DM with PDR with macular edema, bilateral", category: "Bệnh võng mạc đái tháo đường" },
  { icd10: "E11.319", nameVi: "ĐTĐ type 2 với bệnh võng mạc ĐTĐ không xác định, không phù hoàng điểm", nameEn: "Type 2 DM with unspecified DR without macular edema", category: "Bệnh võng mạc đái tháo đường" },

  // --- Refractive Errors (H52) ---
  { icd10: "H52.01", nameVi: "Viễn thị mắt phải", nameEn: "Hypermetropia, right eye", category: "Tật khúc xạ" },
  { icd10: "H52.02", nameVi: "Viễn thị mắt trái", nameEn: "Hypermetropia, left eye", category: "Tật khúc xạ" },
  { icd10: "H52.03", nameVi: "Viễn thị hai mắt", nameEn: "Hypermetropia, bilateral", category: "Tật khúc xạ" },
  { icd10: "H52.11", nameVi: "Cận thị mắt phải", nameEn: "Myopia, right eye", category: "Tật khúc xạ" },
  { icd10: "H52.12", nameVi: "Cận thị mắt trái", nameEn: "Myopia, left eye", category: "Tật khúc xạ" },
  { icd10: "H52.13", nameVi: "Cận thị hai mắt", nameEn: "Myopia, bilateral", category: "Tật khúc xạ" },
  { icd10: "H52.201", nameVi: "Loạn thị không đều mắt phải", nameEn: "Irregular astigmatism, right eye", category: "Tật khúc xạ" },
  { icd10: "H52.211", nameVi: "Loạn thị đều mắt phải", nameEn: "Regular astigmatism, right eye", category: "Tật khúc xạ" },
  { icd10: "H52.212", nameVi: "Loạn thị đều mắt trái", nameEn: "Regular astigmatism, left eye", category: "Tật khúc xạ" },
  { icd10: "H52.213", nameVi: "Loạn thị đều hai mắt", nameEn: "Regular astigmatism, bilateral", category: "Tật khúc xạ" },
  { icd10: "H52.4", nameVi: "Lão thị", nameEn: "Presbyopia", category: "Tật khúc xạ" },

  // --- Strabismus (H49, H50) ---
  { icd10: "H49.01", nameVi: "Liệt dây thần kinh III mắt phải", nameEn: "Third nerve palsy, right eye", category: "Lác mắt" },
  { icd10: "H49.02", nameVi: "Liệt dây thần kinh III mắt trái", nameEn: "Third nerve palsy, left eye", category: "Lác mắt" },
  { icd10: "H49.11", nameVi: "Liệt dây thần kinh IV mắt phải", nameEn: "Fourth nerve palsy, right eye", category: "Lác mắt" },
  { icd10: "H49.12", nameVi: "Liệt dây thần kinh IV mắt trái", nameEn: "Fourth nerve palsy, left eye", category: "Lác mắt" },
  { icd10: "H49.21", nameVi: "Liệt dây thần kinh VI mắt phải", nameEn: "Sixth nerve palsy, right eye", category: "Lác mắt" },
  { icd10: "H49.22", nameVi: "Liệt dây thần kinh VI mắt trái", nameEn: "Sixth nerve palsy, left eye", category: "Lác mắt" },
  { icd10: "H50.011", nameVi: "Lác trong mắt phải", nameEn: "Esotropia, right eye", category: "Lác mắt" },
  { icd10: "H50.012", nameVi: "Lác trong mắt trái", nameEn: "Esotropia, left eye", category: "Lác mắt" },
  { icd10: "H50.111", nameVi: "Lác ngoài mắt phải", nameEn: "Exotropia, right eye", category: "Lác mắt" },
  { icd10: "H50.112", nameVi: "Lác ngoài mắt trái", nameEn: "Exotropia, left eye", category: "Lác mắt" },

  // --- Optic Nerve Disorders (H46, H47) ---
  { icd10: "H46.01", nameVi: "Viêm thần kinh thị giác mắt phải", nameEn: "Optic neuritis, right eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H46.02", nameVi: "Viêm thần kinh thị giác mắt trái", nameEn: "Optic neuritis, left eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H46.03", nameVi: "Viêm thần kinh thị giác hai mắt", nameEn: "Optic neuritis, bilateral", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.011", nameVi: "Phù gai thị mắt phải", nameEn: "Papilledema, right eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.012", nameVi: "Phù gai thị mắt trái", nameEn: "Papilledema, left eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.013", nameVi: "Phù gai thị hai mắt", nameEn: "Papilledema, bilateral", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.211", nameVi: "Teo thần kinh thị giác mắt phải", nameEn: "Optic atrophy, right eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.212", nameVi: "Teo thần kinh thị giác mắt trái", nameEn: "Optic atrophy, left eye", category: "Bệnh lý thần kinh thị giác" },
  { icd10: "H47.213", nameVi: "Teo thần kinh thị giác hai mắt", nameEn: "Optic atrophy, bilateral", category: "Bệnh lý thần kinh thị giác" },

  // --- Globe Disorders (H44) ---
  { icd10: "H44.001", nameVi: "Viêm mủ nội nhãn mắt phải", nameEn: "Endophthalmitis, right eye", category: "Bệnh lý nhãn cầu" },
  { icd10: "H44.002", nameVi: "Viêm mủ nội nhãn mắt trái", nameEn: "Endophthalmitis, left eye", category: "Bệnh lý nhãn cầu" },
  { icd10: "H44.003", nameVi: "Viêm mủ nội nhãn hai mắt", nameEn: "Endophthalmitis, bilateral", category: "Bệnh lý nhãn cầu" },
  { icd10: "H44.111", nameVi: "Viêm toàn nhãn mắt phải", nameEn: "Panophthalmitis, right eye", category: "Bệnh lý nhãn cầu" },
  { icd10: "H44.112", nameVi: "Viêm toàn nhãn mắt trái", nameEn: "Panophthalmitis, left eye", category: "Bệnh lý nhãn cầu" },
]
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to `src/data/diagnoses.ts`

- [ ] **Step 3: Commit**

```bash
git add src/data/diagnoses.ts
git commit -m "feat: expand ICD-10 catalog with ~150 ophthalmology codes"
```

---

### Task 2: Rewrite DiagnosisInput Component

**Files:**
- Rewrite: `src/components/doctor/diagnosis-input.tsx`

This task rewrites the entire component to match the reference UI: diacritics-insensitive search, category-grouped dropdown with keyboard navigation, ICD-code-prominent selected chips, and promote-to-primary button.

- [ ] **Step 1: Replace diagnosis-input.tsx with the new implementation**

```tsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { diagnosisCatalog } from "@/data/diagnoses"
import type { DiagnosisCatalogEntry } from "@/data/diagnoses"
import type { Diagnosis } from "@/data/mock-patients"

interface DiagnosisInputProps {
  diagnoses: Diagnosis[]
  onChange: (diagnoses: Diagnosis[]) => void
}

/** Strip Vietnamese diacritics for search matching */
function removeDiacritics(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
}

/** Group catalog entries by category, preserving insertion order */
function groupByCategory(
  entries: DiagnosisCatalogEntry[]
): { category: string; items: DiagnosisCatalogEntry[] }[] {
  const map = new Map<string, DiagnosisCatalogEntry[]>()
  for (const entry of entries) {
    const group = map.get(entry.category)
    if (group) {
      group.push(entry)
    } else {
      map.set(entry.category, [entry])
    }
  }
  return Array.from(map, ([category, items]) => ({ category, items }))
}

export function DiagnosisInput({ diagnoses, onChange }: DiagnosisInputProps) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Selected ICD codes for exclusion
  const selectedCodes = useMemo(
    () => new Set(diagnoses.map((d) => d.icd10Code).filter(Boolean)),
    [diagnoses]
  )

  // Filter and group results
  const { flatResults, groupedResults } = useMemo(() => {
    if (query.length < 1) return { flatResults: [], groupedResults: [] }
    const q = removeDiacritics(query.toLowerCase())
    const filtered = diagnosisCatalog.filter((d) => {
      if (selectedCodes.has(d.icd10)) return false
      return (
        d.icd10.toLowerCase().includes(q) ||
        removeDiacritics(d.nameVi.toLowerCase()).includes(q) ||
        d.nameEn.toLowerCase().includes(q)
      )
    })
    return {
      flatResults: filtered,
      groupedResults: groupByCategory(filtered),
    }
  }, [query, selectedCodes])

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0)
  }, [flatResults.length])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${highlightIndex}"]`)
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }, [highlightIndex])

  const addFromCatalog = useCallback(
    (entry: DiagnosisCatalogEntry) => {
      const isPrimary = diagnoses.length === 0
      onChange([
        ...diagnoses,
        { text: entry.nameVi, icd10Code: entry.icd10, isPrimary },
      ])
      setQuery("")
      setShowDropdown(false)
    },
    [diagnoses, onChange]
  )

  function addFreeText() {
    if (!query.trim()) return
    const isPrimary = diagnoses.length === 0
    onChange([...diagnoses, { text: query.trim(), isPrimary }])
    setQuery("")
    setShowDropdown(false)
  }

  function removeDiagnosis(index: number) {
    const updated = diagnoses.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((d) => d.isPrimary)) {
      updated[0] = { ...updated[0], isPrimary: true }
    }
    onChange(updated)
  }

  function promoteToPrimary(index: number) {
    const updated = diagnoses.map((d, i) => ({
      ...d,
      isPrimary: i === index,
    }))
    onChange(updated)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || flatResults.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        addFreeText()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (flatResults[highlightIndex]) {
          addFromCatalog(flatResults[highlightIndex])
        }
        break
      case "Escape":
        setShowDropdown(false)
        break
    }
  }

  // Build a flat index so we can map grouped rendering to flatResults index
  let flatIndex = 0

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Chẩn đoán</div>

      {/* Selected diagnoses */}
      {diagnoses.length > 0 && (
        <div className="space-y-2">
          {diagnoses.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
            >
              {d.icd10Code && (
                <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                  {d.icd10Code}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm">
                {d.text}
              </span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  d.isPrimary
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {d.isPrimary ? "Chính" : "Phụ"}
              </span>
              {!d.isPrimary && (
                <button
                  onClick={() => promoteToPrimary(i)}
                  className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                  title="Đặt làm chẩn đoán chính"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" />
                </button>
              )}
              <button
                onClick={() => removeDiagnosis(i)}
                className="shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <Input
          placeholder="Tìm mã ICD-10..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => {
            if (query.length >= 1) setShowDropdown(true)
          }}
          onKeyDown={handleKeyDown}
        />

        {showDropdown && query.length >= 1 && (
          <div
            ref={listRef}
            className="absolute top-10 z-50 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
          >
            {groupedResults.length > 0 ? (
              groupedResults.map((group) => (
                <div key={group.category}>
                  <div className="sticky top-0 bg-popover px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {group.category}
                  </div>
                  {group.items.map((entry) => {
                    const idx = flatIndex++
                    return (
                      <button
                        key={entry.icd10}
                        data-index={idx}
                        onClick={() => addFromCatalog(entry)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                          idx === highlightIndex
                            ? "bg-accent"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="w-[5.5rem] shrink-0 font-mono text-xs font-medium tabular-nums text-foreground">
                          {entry.icd10}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {entry.nameVi}
                        </span>
                        <span className="hidden shrink-0 truncate text-xs text-muted-foreground sm:inline max-w-[12rem]">
                          {entry.nameEn}
                        </span>
                      </button>
                    )
                  })}
                </div>
              ))
            ) : (
              <div className="px-3 py-2.5">
                <div className="text-sm text-muted-foreground">
                  Không tìm thấy.{" "}
                  <Button
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    onClick={addFreeText}
                  >
                    Thêm &ldquo;{query}&rdquo; dạng tự do
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reset flatIndex for next render */}
      {(() => {
        flatIndex = 0
        return null
      })()}
    </div>
  )
}
```

**Important note about `flatIndex`:** The `flatIndex` variable is used as a render-time counter to map grouped items to their flat position for keyboard navigation. It is declared before the JSX return and incremented as each item renders. The reset IIFE at the end ensures it is zero for the next render cycle. An alternative would be pre-computing a `flatIndexMap`, but this inline approach is simpler for the number of items involved.

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Manual verification in browser**

Run: `npm run dev`

Test cases:
1. Type "viem" in search → should show Blepharitis, Conjunctivitis, Keratitis groups with matches
2. Type "H01" → should show Blepharitis entries
3. Type "cataract" → should match English names
4. Click an entry → appears in selected list with ICD code at left, "Chính" badge on first
5. Add second entry → shows "Phụ" badge with ↑ promote button
6. Click ↑ on secondary → becomes primary, old primary becomes secondary
7. Click × on primary → first remaining auto-promotes
8. Arrow keys navigate dropdown, Enter selects, Escape closes
9. Type unmatched text, Enter → free-text diagnosis added

- [ ] **Step 4: Commit**

```bash
git add src/components/doctor/diagnosis-input.tsx
git commit -m "feat: rewrite diagnosis input with grouped ICD-10 search and promote"
```

---

## Summary

| Task | Description | Files |
|------|------------|-------|
| 1 | Expand ICD-10 catalog (~150 ophthalmology codes) | `src/data/diagnoses.ts` |
| 2 | Rewrite DiagnosisInput component (grouped dropdown, promote, keyboard nav) | `src/components/doctor/diagnosis-input.tsx` |
