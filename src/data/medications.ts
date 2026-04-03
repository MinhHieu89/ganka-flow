export interface MedicationCatalogEntry {
  name: string
  defaultDosage: string
  defaultFrequency: string
}

export const medicationCatalog: MedicationCatalogEntry[] = [
  // Nước mắt nhân tạo
  { name: "Refresh Tears 0.5%", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Systane Ultra", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Systane Complete", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Optive Plus", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Hylo-Comod 0.1%", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Artelac Splash", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Cationorm", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Tears Naturale Free", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },

  // Kháng sinh nhỏ mắt
  { name: "Tobramycin 0.3%", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Tobrex (Tobramycin 0.3%)", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Vigamox (Moxifloxacin 0.5%)", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Cravit (Levofloxacin 0.5%)", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Ofloxacin 0.3%", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Ciprofloxacin 0.3%", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Chloramphenicol 0.4%", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },

  // Kháng viêm Steroid
  { name: "Pred Forte (Prednisolone 1%)", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Fluorometholone 0.1%", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Dexamethasone 0.1%", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Lotemax (Loteprednol 0.5%)", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },

  // Kháng viêm NSAID
  { name: "Nevanac (Nepafenac 0.1%)", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },
  { name: "Acular (Ketorolac 0.5%)", defaultDosage: "1 giọt", defaultFrequency: "4 lần/ngày" },
  { name: "Indocollyre (Indomethacin 0.1%)", defaultDosage: "1 giọt", defaultFrequency: "3 lần/ngày" },

  // Kháng dị ứng
  { name: "Pataday (Olopatadine 0.2%)", defaultDosage: "1 giọt", defaultFrequency: "1 lần/ngày" },
  { name: "Olopatadine 0.1%", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },
  { name: "Zaditen (Ketotifen 0.025%)", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },

  // Hạ nhãn áp
  { name: "Timolol 0.5%", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },
  { name: "Xalatan (Latanoprost 0.005%)", defaultDosage: "1 giọt", defaultFrequency: "1 lần/ngày" },
  { name: "Lumigan (Bimatoprost 0.01%)", defaultDosage: "1 giọt", defaultFrequency: "1 lần/ngày" },
  { name: "Travatan (Travoprost 0.004%)", defaultDosage: "1 giọt", defaultFrequency: "1 lần/ngày" },
  { name: "Azopt (Brinzolamide 1%)", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },
  { name: "Combigan (Brimonidine + Timolol)", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },
  { name: "Cosopt (Dorzolamide + Timolol)", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },

  // Giãn đồng tử / Liệt thể mi
  { name: "Atropine 1%", defaultDosage: "1 giọt", defaultFrequency: "2 lần/ngày" },
  { name: "Atropine 0.01%", defaultDosage: "1 giọt", defaultFrequency: "1 lần/ngày" },
  { name: "Tropicamide 1%", defaultDosage: "1 giọt", defaultFrequency: "Theo chỉ định" },
  { name: "Cyclopentolate 1%", defaultDosage: "1 giọt", defaultFrequency: "Theo chỉ định" },

  // Mỡ tra mắt
  { name: "Tobramycin mỡ 0.3%", defaultDosage: "Tra mắt", defaultFrequency: "2 lần/ngày" },
  { name: "Erythromycin mỡ 0.5%", defaultDosage: "Tra mắt", defaultFrequency: "2 lần/ngày" },
  { name: "Dexamethasone mỡ", defaultDosage: "Tra mắt", defaultFrequency: "2 lần/ngày" },

  // Thuốc uống
  { name: "Acetazolamide 250mg", defaultDosage: "1 viên", defaultFrequency: "2 lần/ngày" },
  { name: "Prednisolone 5mg", defaultDosage: "Theo cân nặng", defaultFrequency: "1 lần/ngày" },
  { name: "Ciprofloxacin 500mg", defaultDosage: "1 viên", defaultFrequency: "2 lần/ngày" },

  // Vitamin / Bổ sung
  { name: "Ocuvite Lutein", defaultDosage: "1 viên", defaultFrequency: "1 lần/ngày" },
  { name: "PreserVision AREDS 2", defaultDosage: "2 viên", defaultFrequency: "1 lần/ngày" },
]
