export interface DiagnosisCatalogEntry {
  text: string
  icd10: string
}

export const diagnosisCatalog: DiagnosisCatalogEntry[] = [
  { text: "Khô mắt (Dry eye syndrome)", icd10: "H04.1" },
  { text: "Viêm bờ mi (Blepharitis)", icd10: "H01.0" },
  { text: "Viêm kết mạc dị ứng", icd10: "H10.1" },
  { text: "Cận thị (Myopia)", icd10: "H52.1" },
  { text: "Viễn thị (Hypermetropia)", icd10: "H52.0" },
  { text: "Loạn thị (Astigmatism)", icd10: "H52.2" },
  { text: "Lão thị (Presbyopia)", icd10: "H52.4" },
  { text: "Đục thủy tinh thể (Cataract)", icd10: "H25.9" },
  { text: "Tăng nhãn áp (Glaucoma)", icd10: "H40.9" },
  { text: "Thoái hóa hoàng điểm", icd10: "H35.3" },
  { text: "Bệnh võng mạc tiểu đường", icd10: "H36.0" },
  { text: "Viêm giác mạc (Keratitis)", icd10: "H16.9" },
  { text: "Chắp (Chalazion)", icd10: "H00.1" },
  { text: "Lẹo (Hordeolum)", icd10: "H00.0" },
  { text: "Xuất huyết kết mạc", icd10: "H11.3" },
]
