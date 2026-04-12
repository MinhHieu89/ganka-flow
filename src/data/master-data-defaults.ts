// Master data types and default seed data for admin-customizable dropdown lists

export interface MasterDataItem {
  id: string
  key: string
  label: string
  sortOrder: number
  isActive: boolean
}

export interface MasterDataListConfig {
  listKey: string
  name: string
  module: string
}

/**
 * Build a MasterDataItem[] from [key, label] tuples.
 * Auto-generates ids (1-based) and sortOrder.
 */
function buildList(tuples: [string, string][]): MasterDataItem[] {
  return tuples.map(([key, label], index) => ({
    id: String(index + 1),
    key,
    label,
    sortOrder: index + 1,
    isActive: true,
  }))
}

export const MASTER_DATA_LISTS: MasterDataListConfig[] = [
  // Tiếp nhận (Reception)
  { listKey: "visit_reasons", name: "Lý do khám", module: "Tiếp nhận" },
  { listKey: "symptoms", name: "Triệu chứng hiện tại", module: "Tiếp nhận" },
  {
    listKey: "contact_lens_types",
    name: "Loại lens",
    module: "Tiếp nhận",
  },
  {
    listKey: "contact_lens_issues",
    name: "Vấn đề lens",
    module: "Tiếp nhận",
  },
  { listKey: "eye_conditions", name: "Bệnh lý mắt", module: "Tiếp nhận" },
  {
    listKey: "eye_surgery_types",
    name: "Loại phẫu thuật mắt",
    module: "Tiếp nhận",
  },
  {
    listKey: "systemic_conditions",
    name: "Bệnh lý toàn thân",
    module: "Tiếp nhận",
  },
  {
    listKey: "screen_time_ranges",
    name: "Thời gian màn hình",
    module: "Tiếp nhận",
  },
  {
    listKey: "outdoor_time_ranges",
    name: "Thời gian ngoài trời",
    module: "Tiếp nhận",
  },
  { listKey: "relationships", name: "Mối quan hệ", module: "Tiếp nhận" },
  {
    listKey: "family_eye_conditions",
    name: "Bệnh mắt gia đình",
    module: "Tiếp nhận",
  },
  {
    listKey: "family_medical_conditions",
    name: "Bệnh lý gia đình",
    module: "Tiếp nhận",
  },
  // Sàng lọc (Screening)
  {
    listKey: "red_flag_symptoms",
    name: "Dấu hiệu cờ đỏ",
    module: "Sàng lọc",
  },
  { listKey: "disease_groups", name: "Nhóm bệnh", module: "Sàng lọc" },
  // Kính mắt (Optical)
  {
    listKey: "delivery_carriers",
    name: "Đơn vị vận chuyển",
    module: "Kính mắt",
  },
  // Tròng kính (Lens)
  { listKey: "lens_types", name: "Loại tròng kính", module: "Tròng kính" },
]

export const DEFAULT_MASTER_DATA: Record<string, MasterDataItem[]> = {
  visit_reasons: buildList([
    ["kham_dinh_ky", "Khám định kỳ/Kiểm tra tổng quát"],
    ["giam_thi_luc", "Giảm thị lực"],
    ["mo_mat", "Mờ mắt"],
    ["nhuc_dau_dau_mat", "Nhức đầu/Đau mắt"],
    ["dau_mat_kho_chiu", "Đau mắt hoặc khó chịu"],
    ["kho_nhin_gan", "Khó nhìn gần (đọc sách, xem điện thoại)"],
    ["kho_nhin_xa", "Khó nhìn xa (xem bảng, lái xe)"],
    ["kinh_ap_trong", "Muốn đeo kính áp tròng"],
    ["tu_van_phau_thuat", "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)"],
    ["khac", "Khác"],
  ]),

  symptoms: buildList([
    ["mo_mat", "Nhìn mờ/Giảm thị lực"],
    ["nhin_doi", "Nhìn đôi (song thị)"],
    ["nhin_bien_dang", "Nhìn biến dạng"],
    ["dom_bay", "Xuất hiện điểm đen/đốm bay"],
    ["vong_sang", "Thấy vòng sáng quanh đèn"],
    ["chop_sang", "Nhìn chớp sáng (flash)"],
    ["mat_thi_truong", "Mất thị trường (góc nhìn)"],
    ["mo_thay_doi_theo_gio", "Nhìn mờ thay đổi theo giờ"],
    ["nhuc_dau", "Nhức đầu thường xuyên"],
    ["choi_sang", "Chói sáng/Sợ ánh sáng"],
    ["kho_mat", "Khô mắt"],
    ["chay_nuoc_mat", "Chảy nước mắt nhiều"],
    ["tiet_dich", "Tiết dịch/Ghèn mắt"],
    ["ngua_mat", "Ngứa mắt"],
    ["do_mat", "Đỏ mắt"],
    ["sung_mi", "Sưng mi mắt"],
    ["moi_mat_doc", "Mỏi mắt khi đọc/máy tính"],
    ["kho_tap_trung_doc", "Khó tập trung khi đọc"],
  ]),

  contact_lens_types: buildList([
    ["mem", "Mềm"],
    ["cung", "Cứng (RGP)"],
    ["deo_ngay", "Đeo ngày"],
    ["deo_keo_dai", "Đeo kéo dài"],
  ]),

  contact_lens_issues: buildList([
    ["kho_mat", "Khô mắt"],
    ["kho_chiu", "Khó chịu"],
    ["nhin_mo", "Nhìn mờ"],
    ["khac", "Khác"],
  ]),

  eye_conditions: buildList([
    ["can_thi", "Cận thị (Myopia)"],
    ["vien_thi", "Viễn thị (Hyperopia)"],
    ["loan_thi", "Loạn thị (Astigmatism)"],
    ["lao_thi", "Lão thị (Presbyopia)"],
    ["glaucoma", "Glaucoma (Tăng nhãn áp)"],
    ["duc_thuy_tinh_the", "Đục thủy tinh thể (Cataract)"],
    ["thoai_hoa_diem_vang", "Thoái hóa điểm vàng"],
    ["benh_vong_mac_dtd", "Bệnh võng mạc do ĐTĐ"],
    ["lac_mat", "Lác mắt (Strabismus)"],
    ["mat_luoi", "Mắt lười (Amblyopia)"],
    ["kho_mat_syndrome", "Khô mắt (Dry Eye)"],
    ["viem_ket_mac", "Viêm kết mạc thường xuyên"],
    ["bong_vong_mac", "Bong võng mạc"],
    ["viem_mang_bo_dao", "Viêm màng bồ đào (Uveitis)"],
    ["khac", "Khác"],
  ]),

  eye_surgery_types: buildList([
    ["lasik", "LASIK/PRK"],
    ["duc_thuy_tinh_the", "Phẫu thuật đục thủy tinh thể"],
    ["glaucoma", "Phẫu thuật glaucoma"],
    ["vong_mac", "Phẫu thuật võng mạc"],
    ["lac_mat", "Phẫu thuật lác mắt"],
    ["khac", "Khác"],
  ]),

  systemic_conditions: buildList([
    // Tim mạch
    ["tang_huyet_ap", "Tăng huyết áp"],
    ["dau_that_nguc", "Đau thắt ngực"],
    ["benh_tim_mach", "Bệnh tim mạch"],
    ["dot_quy", "Đột quỵ/Tai biến mạch máu não"],
    // Nội tiết
    ["dtd_type1", "Đái tháo đường Típ 1"],
    ["dtd_type2", "Đái tháo đường Típ 2"],
    ["benh_tuyen_giap", "Bệnh tuyến giáp"],
    ["cholesterol_cao", "Cholesterol cao"],
    // Thần kinh
    ["da_xo_cung", "Đa xơ cứng (MS)"],
    ["dong_kinh", "Động kinh"],
    ["parkinson", "Bệnh Parkinson"],
    ["migraine", "Đau nửa đầu/Migraine"],
    // Hô hấp & Miễn dịch
    ["hen_suyen", "Hen suyễn"],
    ["copd", "COPD"],
    ["hiv", "HIV/AIDS"],
    ["viem_gan_bc", "Viêm gan B/C"],
    ["lupus", "Lupus ban đỏ hệ thống"],
    ["viem_khop_dang_thap", "Viêm khớp dạng thấp"],
    // Ung thư
    ["ung_thu", "Ung thư"],
    ["dang_hoa_xa_tri", "Đang điều trị hóa chất/xạ trị"],
    // Khác
    ["benh_than", "Bệnh thận"],
    ["benh_gan", "Bệnh gan"],
    ["roi_loan_dong_mau", "Rối loạn đông máu"],
    ["benh_ngoai_da", "Bệnh ngoài da (vảy nến, chàm...)"],
    ["tram_cam_lo_au", "Trầm cảm/Lo âu"],
  ]),

  screen_time_ranges: buildList([
    ["<2h", "< 2 giờ"],
    ["2-4h", "2-4 giờ"],
    ["4-8h", "4-8 giờ"],
    [">8h", "> 8 giờ"],
  ]),

  outdoor_time_ranges: buildList([
    ["<30m", "< 30 phút"],
    ["30-60m", "30-60 phút"],
    ["1-2h", "1-2 giờ"],
    [">2h", "> 2 giờ"],
  ]),

  relationships: buildList([
    ["bo_me", "Bố/Mẹ"],
    ["vo_chong", "Vợ/Chồng"],
    ["con", "Con"],
    ["anh_chi_em", "Anh/Chị/Em"],
    ["khac", "Khác"],
  ]),

  family_eye_conditions: buildList([
    ["glaucoma", "Glaucoma (Tăng nhãn áp)"],
    ["duc_thuy_tinh_the", "Đục thủy tinh thể"],
    ["thoai_hoa_diem_vang", "Thoái hóa điểm vàng"],
    ["benh_vong_mac", "Bệnh võng mạc"],
    ["can_thi_nang", "Cận thị nặng"],
    ["mu_mau", "Mù màu"],
    ["lac_mat_luoi", "Mắt lác/Mắt lười"],
    ["bong_vong_mac", "Bong võng mạc"],
  ]),

  family_medical_conditions: buildList([
    ["dtd", "Đái tháo đường"],
    ["tang_huyet_ap", "Tăng huyết áp"],
    ["benh_tim_mach", "Bệnh tim mạch"],
    ["dot_quy", "Đột quỵ"],
    ["ung_thu", "Ung thư"],
    ["benh_tu_mien", "Bệnh tự miễn (Lupus, RA...)"],
  ]),

  red_flag_symptoms: buildList([
    ["dau_mat", "Đau mắt"],
    ["mat_thi_luc_dot_ngot", "Mất thị lực đột ngột"],
    ["bat_doi_xung", "Bất đối xứng giữa hai mắt"],
  ]),

  disease_groups: buildList([
    ["dryEye", "Khô mắt"],
    ["refraction", "Khúc xạ"],
    ["myopiaControl", "Cận thị"],
    ["general", "Tổng quát"],
  ]),

  delivery_carriers: buildList([
    ["grab", "Grab"],
    ["ghtk", "GHTK"],
    ["ghn", "GHN"],
    ["bee_xanh_sm", "Bee / Xanh SM"],
    ["tu_giao", "Tự giao"],
  ]),

  lens_types: buildList([
    ["don_trong", "Đơn tròng"],
    ["da_trong", "Đa tròng"],
    ["luy_tien", "Lũy tiến"],
  ]),
}
