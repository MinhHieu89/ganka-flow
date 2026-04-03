export interface DiagnosisCatalogEntry {
  icd10: string
  nameVi: string
  nameEn: string
  category: string
}

export const diagnosisCatalog: DiagnosisCatalogEntry[] = [
  // ────────────────────────────────────────────────
  // Lẹo / Chắp (Chalazion / Hordeolum — H00.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H00.011",
    nameVi: "Lẹo mi trên mắt phải",
    nameEn: "Hordeolum externum, right upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.012",
    nameVi: "Lẹo mi dưới mắt phải",
    nameEn: "Hordeolum externum, right lower eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.014",
    nameVi: "Lẹo mi trên mắt trái",
    nameEn: "Hordeolum externum, left upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.015",
    nameVi: "Lẹo mi dưới mắt trái",
    nameEn: "Hordeolum externum, left lower eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.031",
    nameVi: "Lẹo trong mi trên mắt phải",
    nameEn: "Hordeolum internum, right upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.034",
    nameVi: "Lẹo trong mi trên mắt trái",
    nameEn: "Hordeolum internum, left upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.11",
    nameVi: "Chắp mi trên mắt phải",
    nameEn: "Chalazion, right upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.12",
    nameVi: "Chắp mi dưới mắt phải",
    nameEn: "Chalazion, right lower eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.14",
    nameVi: "Chắp mi trên mắt trái",
    nameEn: "Chalazion, left upper eyelid",
    category: "Lẹo / Chắp",
  },
  {
    icd10: "H00.15",
    nameVi: "Chắp mi dưới mắt trái",
    nameEn: "Chalazion, left lower eyelid",
    category: "Lẹo / Chắp",
  },

  // ────────────────────────────────────────────────
  // Viêm bờ mi (Blepharitis — H01.0xx)
  // ────────────────────────────────────────────────
  {
    icd10: "H01.001",
    nameVi: "Viêm bờ mi không đặc hiệu mắt phải, mi trên",
    nameEn: "Unspecified blepharitis, right upper eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.002",
    nameVi: "Viêm bờ mi không đặc hiệu mắt phải, mi dưới",
    nameEn: "Unspecified blepharitis, right lower eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.004",
    nameVi: "Viêm bờ mi không đặc hiệu mắt trái, mi trên",
    nameEn: "Unspecified blepharitis, left upper eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.005",
    nameVi: "Viêm bờ mi không đặc hiệu mắt trái, mi dưới",
    nameEn: "Unspecified blepharitis, left lower eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.011",
    nameVi: "Viêm bờ mi loét mắt phải, mi trên",
    nameEn: "Ulcerative blepharitis, right upper eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.014",
    nameVi: "Viêm bờ mi loét mắt trái, mi trên",
    nameEn: "Ulcerative blepharitis, left upper eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.021",
    nameVi: "Viêm bờ mi vảy nến mắt phải, mi trên",
    nameEn: "Squamous blepharitis, right upper eyelid",
    category: "Viêm bờ mi",
  },
  {
    icd10: "H01.024",
    nameVi: "Viêm bờ mi vảy nến mắt trái, mi trên",
    nameEn: "Squamous blepharitis, left upper eyelid",
    category: "Viêm bờ mi",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý mi mắt (Lid Disorders — H02.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H02.101",
    nameVi: "Sụp mi không đặc hiệu mắt phải, mi trên",
    nameEn: "Unspecified ptosis, right upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.104",
    nameVi: "Sụp mi không đặc hiệu mắt trái, mi trên",
    nameEn: "Unspecified ptosis, left upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.201",
    nameVi: "Hở mi mắt phải, mi trên",
    nameEn: "Lagophthalmos, right upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.204",
    nameVi: "Hở mi mắt trái, mi trên",
    nameEn: "Lagophthalmos, left upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.301",
    nameVi: "Quặm mi mắt phải, mi trên",
    nameEn: "Entropion, right upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.304",
    nameVi: "Quặm mi mắt trái, mi trên",
    nameEn: "Entropion, left upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.401",
    nameVi: "Lật mi mắt phải, mi trên",
    nameEn: "Ectropion, right upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.404",
    nameVi: "Lật mi mắt trái, mi trên",
    nameEn: "Ectropion, left upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.601",
    nameVi: "Xanthanthelasma mi trên mắt phải",
    nameEn: "Xanthelasma, right upper eyelid",
    category: "Bệnh lý mi mắt",
  },
  {
    icd10: "H02.604",
    nameVi: "Xanthanthelasma mi trên mắt trái",
    nameEn: "Xanthelasma, left upper eyelid",
    category: "Bệnh lý mi mắt",
  },

  // ────────────────────────────────────────────────
  // Khô mắt (Dry Eye — H04.1x)
  // ────────────────────────────────────────────────
  {
    icd10: "H04.111",
    nameVi: "Hội chứng khô mắt mắt phải",
    nameEn: "Dry eye syndrome, right eye",
    category: "Khô mắt",
  },
  {
    icd10: "H04.112",
    nameVi: "Hội chứng khô mắt mắt trái",
    nameEn: "Dry eye syndrome, left eye",
    category: "Khô mắt",
  },
  {
    icd10: "H04.113",
    nameVi: "Hội chứng khô mắt hai mắt",
    nameEn: "Dry eye syndrome, bilateral",
    category: "Khô mắt",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý lệ đạo (Lacrimal — H04.3x, H04.4x)
  // ────────────────────────────────────────────────
  {
    icd10: "H04.311",
    nameVi: "Viêm túi lệ cấp mắt phải",
    nameEn: "Acute dacryocystitis, right side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.312",
    nameVi: "Viêm túi lệ cấp mắt trái",
    nameEn: "Acute dacryocystitis, left side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.321",
    nameVi: "Viêm túi lệ mạn mắt phải",
    nameEn: "Chronic dacryocystitis, right side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.322",
    nameVi: "Viêm túi lệ mạn mắt trái",
    nameEn: "Chronic dacryocystitis, left side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.411",
    nameVi: "Tắc ống lệ mũi mắt phải",
    nameEn: "Chronic nasolacrimal duct obstruction, right side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.412",
    nameVi: "Tắc ống lệ mũi mắt trái",
    nameEn: "Chronic nasolacrimal duct obstruction, left side",
    category: "Bệnh lý lệ đạo",
  },
  {
    icd10: "H04.413",
    nameVi: "Tắc ống lệ mũi hai mắt",
    nameEn: "Chronic nasolacrimal duct obstruction, bilateral",
    category: "Bệnh lý lệ đạo",
  },

  // ────────────────────────────────────────────────
  // Viêm kết mạc (Conjunctivitis — H10.x, H11.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H10.011",
    nameVi: "Viêm kết mạc do tụ cầu mắt phải",
    nameEn: "Mucopurulent conjunctivitis, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.012",
    nameVi: "Viêm kết mạc do tụ cầu mắt trái",
    nameEn: "Mucopurulent conjunctivitis, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.013",
    nameVi: "Viêm kết mạc do tụ cầu hai mắt",
    nameEn: "Mucopurulent conjunctivitis, bilateral",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.101",
    nameVi: "Viêm kết mạc cấp dị ứng mắt phải",
    nameEn: "Acute atopic conjunctivitis, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.102",
    nameVi: "Viêm kết mạc cấp dị ứng mắt trái",
    nameEn: "Acute atopic conjunctivitis, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.103",
    nameVi: "Viêm kết mạc cấp dị ứng hai mắt",
    nameEn: "Acute atopic conjunctivitis, bilateral",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.211",
    nameVi: "Viêm kết mạc mạn mắt phải",
    nameEn: "Chronic conjunctivitis, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.212",
    nameVi: "Viêm kết mạc mạn mắt trái",
    nameEn: "Chronic conjunctivitis, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.213",
    nameVi: "Viêm kết mạc mạn hai mắt",
    nameEn: "Chronic conjunctivitis, bilateral",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.31",
    nameVi: "Viêm kết mạc mùa xuân (mắt phải)",
    nameEn: "Vernal conjunctivitis, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.32",
    nameVi: "Viêm kết mạc mùa xuân (mắt trái)",
    nameEn: "Vernal conjunctivitis, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H10.33",
    nameVi: "Viêm kết mạc mùa xuân hai mắt",
    nameEn: "Vernal conjunctivitis, bilateral",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H11.011",
    nameVi: "Mộng thịt mắt phải",
    nameEn: "Amyloid pterygium, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H11.012",
    nameVi: "Mộng thịt mắt trái",
    nameEn: "Amyloid pterygium, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H11.311",
    nameVi: "Xuất huyết kết mạc mắt phải",
    nameEn: "Conjunctival hemorrhage, right eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H11.312",
    nameVi: "Xuất huyết kết mạc mắt trái",
    nameEn: "Conjunctival hemorrhage, left eye",
    category: "Viêm kết mạc",
  },
  {
    icd10: "H11.313",
    nameVi: "Xuất huyết kết mạc hai mắt",
    nameEn: "Conjunctival hemorrhage, bilateral",
    category: "Viêm kết mạc",
  },

  // ────────────────────────────────────────────────
  // Viêm giác mạc (Keratitis — H16.x, H18.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H16.011",
    nameVi: "Loét giác mạc trung tâm mắt phải",
    nameEn: "Central corneal ulcer, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.012",
    nameVi: "Loét giác mạc trung tâm mắt trái",
    nameEn: "Central corneal ulcer, left eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.131",
    nameVi: "Viêm giác mạc bọng mắt phải",
    nameEn: "Filamentary keratitis, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.132",
    nameVi: "Viêm giác mạc bọng mắt trái",
    nameEn: "Filamentary keratitis, left eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.211",
    nameVi: "Viêm giác mạc-kết mạc phơi lộ mắt phải",
    nameEn: "Exposure keratoconjunctivitis, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.212",
    nameVi: "Viêm giác mạc-kết mạc phơi lộ mắt trái",
    nameEn: "Exposure keratoconjunctivitis, left eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.391",
    nameVi: "Viêm giác mạc do Herpes mắt phải",
    nameEn: "Other interstitial and deep keratitis, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H16.392",
    nameVi: "Viêm giác mạc do Herpes mắt trái",
    nameEn: "Other interstitial and deep keratitis, left eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H18.011",
    nameVi: "Sẹo giác mạc mắt phải",
    nameEn: "Corneal pigmentations and deposits, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H18.012",
    nameVi: "Sẹo giác mạc mắt trái",
    nameEn: "Corneal pigmentations and deposits, left eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H18.601",
    nameVi: "Phù giác mạc mắt phải",
    nameEn: "Corneal edema, right eye",
    category: "Viêm giác mạc",
  },
  {
    icd10: "H18.602",
    nameVi: "Phù giác mạc mắt trái",
    nameEn: "Corneal edema, left eye",
    category: "Viêm giác mạc",
  },

  // ────────────────────────────────────────────────
  // Đục thủy tinh thể (Cataract — H25.x, H26.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H25.011",
    nameVi: "Đục thủy tinh thể tuổi già nhân mắt phải",
    nameEn: "Age-related nuclear cataract, right eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.012",
    nameVi: "Đục thủy tinh thể tuổi già nhân mắt trái",
    nameEn: "Age-related nuclear cataract, left eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.013",
    nameVi: "Đục thủy tinh thể tuổi già nhân hai mắt",
    nameEn: "Age-related nuclear cataract, bilateral",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.031",
    nameVi: "Đục thủy tinh thể dưới bao sau mắt phải",
    nameEn: "Anterior subcapsular polar age-related cataract, right eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.032",
    nameVi: "Đục thủy tinh thể dưới bao sau mắt trái",
    nameEn: "Anterior subcapsular polar age-related cataract, left eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.811",
    nameVi: "Đục thủy tinh thể hỗn hợp mắt phải",
    nameEn: "Combined forms of age-related cataract, right eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.812",
    nameVi: "Đục thủy tinh thể hỗn hợp mắt trái",
    nameEn: "Combined forms of age-related cataract, left eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H25.813",
    nameVi: "Đục thủy tinh thể hỗn hợp hai mắt",
    nameEn: "Combined forms of age-related cataract, bilateral",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H26.001",
    nameVi: "Đục thủy tinh thể trẻ em mắt phải",
    nameEn: "Unspecified infantile and juvenile cataract, right eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H26.002",
    nameVi: "Đục thủy tinh thể trẻ em mắt trái",
    nameEn: "Unspecified infantile and juvenile cataract, left eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H26.211",
    nameVi: "Đục thủy tinh thể do thuốc mắt phải",
    nameEn: "Drug-induced cataract, right eye",
    category: "Đục thủy tinh thể",
  },
  {
    icd10: "H26.212",
    nameVi: "Đục thủy tinh thể do thuốc mắt trái",
    nameEn: "Drug-induced cataract, left eye",
    category: "Đục thủy tinh thể",
  },

  // ────────────────────────────────────────────────
  // Glaucoma (H40.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H40.011",
    nameVi: "Tăng nhãn áp nghi ngờ mắt phải",
    nameEn: "Open-angle with borderline findings, low risk, right eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.012",
    nameVi: "Tăng nhãn áp nghi ngờ mắt trái",
    nameEn: "Open-angle with borderline findings, low risk, left eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.1110",
    nameVi: "Glaucoma góc mở nguyên phát mắt phải giai đoạn 0",
    nameEn: "Primary open-angle glaucoma, right eye, stage unspecified",
    category: "Glaucoma",
  },
  {
    icd10: "H40.1120",
    nameVi: "Glaucoma góc mở nguyên phát mắt trái giai đoạn 0",
    nameEn: "Primary open-angle glaucoma, left eye, stage unspecified",
    category: "Glaucoma",
  },
  {
    icd10: "H40.1130",
    nameVi: "Glaucoma góc mở nguyên phát hai mắt giai đoạn 0",
    nameEn: "Primary open-angle glaucoma, bilateral, stage unspecified",
    category: "Glaucoma",
  },
  {
    icd10: "H40.2010",
    nameVi: "Glaucoma góc đóng nguyên phát mắt phải",
    nameEn: "Unspecified primary angle-closure glaucoma, right eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.2020",
    nameVi: "Glaucoma góc đóng nguyên phát mắt trái",
    nameEn: "Unspecified primary angle-closure glaucoma, left eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.2030",
    nameVi: "Glaucoma góc đóng nguyên phát hai mắt",
    nameEn: "Unspecified primary angle-closure glaucoma, bilateral",
    category: "Glaucoma",
  },
  {
    icd10: "H40.31",
    nameVi: "Glaucoma thứ phát sau chấn thương mắt phải",
    nameEn: "Glaucoma secondary to eye trauma, right eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.32",
    nameVi: "Glaucoma thứ phát sau chấn thương mắt trái",
    nameEn: "Glaucoma secondary to eye trauma, left eye",
    category: "Glaucoma",
  },
  {
    icd10: "H40.33",
    nameVi: "Glaucoma thứ phát sau chấn thương hai mắt",
    nameEn: "Glaucoma secondary to eye trauma, bilateral",
    category: "Glaucoma",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý dịch kính (Vitreous — H43.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H43.011",
    nameVi: "Sa dịch kính mắt phải",
    nameEn: "Vitreous prolapse, right eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.012",
    nameVi: "Sa dịch kính mắt trái",
    nameEn: "Vitreous prolapse, left eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.391",
    nameVi: "Xuất huyết dịch kính mắt phải",
    nameEn: "Other vitreous hemorrhage, right eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.392",
    nameVi: "Xuất huyết dịch kính mắt trái",
    nameEn: "Other vitreous hemorrhage, left eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.811",
    nameVi: "Đục dịch kính mắt phải",
    nameEn: "Vitreous degeneration, right eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.812",
    nameVi: "Đục dịch kính mắt trái",
    nameEn: "Vitreous degeneration, left eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.813",
    nameVi: "Đục dịch kính hai mắt",
    nameEn: "Vitreous degeneration, bilateral",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.191",
    nameVi: "Ruồi bay mắt phải",
    nameEn: "Other vitreous opacities, right eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.192",
    nameVi: "Ruồi bay mắt trái",
    nameEn: "Other vitreous opacities, left eye",
    category: "Bệnh lý dịch kính",
  },
  {
    icd10: "H43.193",
    nameVi: "Ruồi bay hai mắt",
    nameEn: "Other vitreous opacities, bilateral",
    category: "Bệnh lý dịch kính",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý võng mạc (Retinal — H33.x, H34.x, H35.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H33.001",
    nameVi: "Bong võng mạc với vỡ võng mạc mắt phải",
    nameEn: "Unspecified retinal detachment with retinal break, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H33.002",
    nameVi: "Bong võng mạc với vỡ võng mạc mắt trái",
    nameEn: "Unspecified retinal detachment with retinal break, left eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H33.011",
    nameVi: "Bong võng mạc tổng thể mắt phải",
    nameEn: "Retinal detachment with single break, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H33.012",
    nameVi: "Bong võng mạc tổng thể mắt trái",
    nameEn: "Retinal detachment with single break, left eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H33.21",
    nameVi: "Bong võng mạc co kéo mắt phải",
    nameEn: "Tractional detachment of retina, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H33.22",
    nameVi: "Bong võng mạc co kéo mắt trái",
    nameEn: "Tractional detachment of retina, left eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H34.11",
    nameVi: "Tắc động mạch trung tâm võng mạc mắt phải",
    nameEn: "Central retinal artery occlusion, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H34.12",
    nameVi: "Tắc động mạch trung tâm võng mạc mắt trái",
    nameEn: "Central retinal artery occlusion, left eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H34.81",
    nameVi: "Tắc tĩnh mạch trung tâm võng mạc mắt phải",
    nameEn: "Central retinal vein occlusion, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H34.82",
    nameVi: "Tắc tĩnh mạch trung tâm võng mạc mắt trái",
    nameEn: "Central retinal vein occlusion, left eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H35.021",
    nameVi: "Bệnh võng mạc tăng huyết áp mắt phải",
    nameEn: "Exudative retinopathy, right eye",
    category: "Bệnh lý võng mạc",
  },
  {
    icd10: "H35.022",
    nameVi: "Bệnh võng mạc tăng huyết áp mắt trái",
    nameEn: "Exudative retinopathy, left eye",
    category: "Bệnh lý võng mạc",
  },

  // ────────────────────────────────────────────────
  // Thoái hóa hoàng điểm (Macular Degeneration — H35.3x)
  // ────────────────────────────────────────────────
  {
    icd10: "H35.31",
    nameVi: "Thoái hóa hoàng điểm mắt phải",
    nameEn: "Nonexudative AMD, right eye",
    category: "Thoái hóa hoàng điểm",
  },
  {
    icd10: "H35.32",
    nameVi: "Thoái hóa hoàng điểm mắt trái",
    nameEn: "Nonexudative AMD, left eye",
    category: "Thoái hóa hoàng điểm",
  },
  {
    icd10: "H35.33",
    nameVi: "Thoái hóa hoàng điểm hai mắt",
    nameEn: "Nonexudative AMD, bilateral",
    category: "Thoái hóa hoàng điểm",
  },
  {
    icd10: "H35.341",
    nameVi: "Thoái hóa hoàng điểm ướt mắt phải",
    nameEn: "Exudative AMD, right eye",
    category: "Thoái hóa hoàng điểm",
  },
  {
    icd10: "H35.342",
    nameVi: "Thoái hóa hoàng điểm ướt mắt trái",
    nameEn: "Exudative AMD, left eye",
    category: "Thoái hóa hoàng điểm",
  },
  {
    icd10: "H35.343",
    nameVi: "Thoái hóa hoàng điểm ướt hai mắt",
    nameEn: "Exudative AMD, bilateral",
    category: "Thoái hóa hoàng điểm",
  },

  // ────────────────────────────────────────────────
  // Bệnh võng mạc đái tháo đường (Diabetic Retinopathy — E11.3x)
  // ────────────────────────────────────────────────
  {
    icd10: "E11.311",
    nameVi: "Bệnh võng mạc ĐTĐ nền mắt phải không phù hoàng điểm",
    nameEn: "T2DM with mild nonproliferative diabetic retinopathy without DME, right eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.312",
    nameVi: "Bệnh võng mạc ĐTĐ nền mắt trái không phù hoàng điểm",
    nameEn: "T2DM with mild nonproliferative diabetic retinopathy without DME, left eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.313",
    nameVi: "Bệnh võng mạc ĐTĐ nền hai mắt không phù hoàng điểm",
    nameEn: "T2DM with mild nonproliferative diabetic retinopathy without DME, bilateral",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.341",
    nameVi: "Bệnh võng mạc ĐTĐ nặng mắt phải có phù hoàng điểm",
    nameEn: "T2DM with severe nonproliferative diabetic retinopathy with DME, right eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.342",
    nameVi: "Bệnh võng mạc ĐTĐ nặng mắt trái có phù hoàng điểm",
    nameEn: "T2DM with severe nonproliferative diabetic retinopathy with DME, left eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.351",
    nameVi: "Bệnh võng mạc ĐTĐ tăng sinh mắt phải có phù hoàng điểm",
    nameEn: "T2DM with proliferative diabetic retinopathy with DME, right eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.352",
    nameVi: "Bệnh võng mạc ĐTĐ tăng sinh mắt trái có phù hoàng điểm",
    nameEn: "T2DM with proliferative diabetic retinopathy with DME, left eye",
    category: "Bệnh võng mạc đái tháo đường",
  },
  {
    icd10: "E11.353",
    nameVi: "Bệnh võng mạc ĐTĐ tăng sinh hai mắt có phù hoàng điểm",
    nameEn: "T2DM with proliferative diabetic retinopathy with DME, bilateral",
    category: "Bệnh võng mạc đái tháo đường",
  },

  // ────────────────────────────────────────────────
  // Tật khúc xạ (Refractive Errors — H52.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H52.001",
    nameVi: "Viễn thị mắt phải",
    nameEn: "Hypermetropia, right eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.002",
    nameVi: "Viễn thị mắt trái",
    nameEn: "Hypermetropia, left eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.003",
    nameVi: "Viễn thị hai mắt",
    nameEn: "Hypermetropia, bilateral",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.101",
    nameVi: "Cận thị mắt phải",
    nameEn: "Myopia, right eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.102",
    nameVi: "Cận thị mắt trái",
    nameEn: "Myopia, left eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.103",
    nameVi: "Cận thị hai mắt",
    nameEn: "Myopia, bilateral",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.201",
    nameVi: "Loạn thị đều mắt phải",
    nameEn: "Regular astigmatism, right eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.202",
    nameVi: "Loạn thị đều mắt trái",
    nameEn: "Regular astigmatism, left eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.203",
    nameVi: "Loạn thị đều hai mắt",
    nameEn: "Regular astigmatism, bilateral",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.211",
    nameVi: "Loạn thị không đều mắt phải",
    nameEn: "Irregular astigmatism, right eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.212",
    nameVi: "Loạn thị không đều mắt trái",
    nameEn: "Irregular astigmatism, left eye",
    category: "Tật khúc xạ",
  },
  {
    icd10: "H52.4",
    nameVi: "Lão thị",
    nameEn: "Presbyopia",
    category: "Tật khúc xạ",
  },

  // ────────────────────────────────────────────────
  // Lác mắt (Strabismus — H49.x, H50.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H49.01",
    nameVi: "Liệt thần kinh III mắt phải",
    nameEn: "Third nerve palsy, right eye",
    category: "Lác mắt",
  },
  {
    icd10: "H49.02",
    nameVi: "Liệt thần kinh III mắt trái",
    nameEn: "Third nerve palsy, left eye",
    category: "Lác mắt",
  },
  {
    icd10: "H49.11",
    nameVi: "Liệt thần kinh IV mắt phải",
    nameEn: "Fourth nerve palsy, right eye",
    category: "Lác mắt",
  },
  {
    icd10: "H49.12",
    nameVi: "Liệt thần kinh IV mắt trái",
    nameEn: "Fourth nerve palsy, left eye",
    category: "Lác mắt",
  },
  {
    icd10: "H49.21",
    nameVi: "Liệt thần kinh VI mắt phải",
    nameEn: "Sixth nerve palsy, right eye",
    category: "Lác mắt",
  },
  {
    icd10: "H49.22",
    nameVi: "Liệt thần kinh VI mắt trái",
    nameEn: "Sixth nerve palsy, left eye",
    category: "Lác mắt",
  },
  {
    icd10: "H50.01",
    nameVi: "Lác trong cùng thị mắt phải",
    nameEn: "Monocular esotropia, right eye",
    category: "Lác mắt",
  },
  {
    icd10: "H50.02",
    nameVi: "Lác trong cùng thị mắt trái",
    nameEn: "Monocular esotropia, left eye",
    category: "Lác mắt",
  },
  {
    icd10: "H50.11",
    nameVi: "Lác ngoài cùng thị mắt phải",
    nameEn: "Monocular exotropia, right eye",
    category: "Lác mắt",
  },
  {
    icd10: "H50.12",
    nameVi: "Lác ngoài cùng thị mắt trái",
    nameEn: "Monocular exotropia, left eye",
    category: "Lác mắt",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý thần kinh thị giác (Optic Nerve — H46.x, H47.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H46.01",
    nameVi: "Viêm thần kinh thị giác mắt phải",
    nameEn: "Optic papillitis, right eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H46.02",
    nameVi: "Viêm thần kinh thị giác mắt trái",
    nameEn: "Optic papillitis, left eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H46.03",
    nameVi: "Viêm thần kinh thị giác hai mắt",
    nameEn: "Optic papillitis, bilateral",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H46.11",
    nameVi: "Viêm thần kinh thị hậu nhãn cầu mắt phải",
    nameEn: "Retrobulbar neuritis, right eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H46.12",
    nameVi: "Viêm thần kinh thị hậu nhãn cầu mắt trái",
    nameEn: "Retrobulbar neuritis, left eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H47.011",
    nameVi: "Teo thần kinh thị giác mắt phải",
    nameEn: "Ischemic optic neuropathy, right eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H47.012",
    nameVi: "Teo thần kinh thị giác mắt trái",
    nameEn: "Ischemic optic neuropathy, left eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H47.311",
    nameVi: "Teo thị thần kinh mắt phải",
    nameEn: "Primary optic atrophy, right eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H47.312",
    nameVi: "Teo thị thần kinh mắt trái",
    nameEn: "Primary optic atrophy, left eye",
    category: "Bệnh lý thần kinh thị giác",
  },
  {
    icd10: "H47.313",
    nameVi: "Teo thị thần kinh hai mắt",
    nameEn: "Primary optic atrophy, bilateral",
    category: "Bệnh lý thần kinh thị giác",
  },

  // ────────────────────────────────────────────────
  // Bệnh lý nhãn cầu (Globe — H44.x)
  // ────────────────────────────────────────────────
  {
    icd10: "H44.001",
    nameVi: "Viêm nội nhãn nhiễm khuẩn cấp mắt phải",
    nameEn: "Purulent endophthalmitis, right eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.002",
    nameVi: "Viêm nội nhãn nhiễm khuẩn cấp mắt trái",
    nameEn: "Purulent endophthalmitis, left eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.111",
    nameVi: "Viêm nội nhãn dịch kính mắt phải",
    nameEn: "Panuveitis, right eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.112",
    nameVi: "Viêm nội nhãn dịch kính mắt trái",
    nameEn: "Panuveitis, left eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.211",
    nameVi: "Cận thị thoái hóa mắt phải",
    nameEn: "Degenerative myopia, right eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.212",
    nameVi: "Cận thị thoái hóa mắt trái",
    nameEn: "Degenerative myopia, left eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.213",
    nameVi: "Cận thị thoái hóa hai mắt",
    nameEn: "Degenerative myopia, bilateral",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.511",
    nameVi: "Nhãn áp thấp mắt phải",
    nameEn: "Absolute hypotony of right eye",
    category: "Bệnh lý nhãn cầu",
  },
  {
    icd10: "H44.512",
    nameVi: "Nhãn áp thấp mắt trái",
    nameEn: "Absolute hypotony of left eye",
    category: "Bệnh lý nhãn cầu",
  },
]
