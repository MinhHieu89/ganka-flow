import type { IntakeFormData } from "./intake-form"
import { useClinic } from "@/hooks/use-clinic"

interface IntakePrintViewProps {
  data: IntakeFormData
  patientId?: string
}

const VISIT_REASON_LABELS: Record<string, string> = {
  kham_dinh_ky: "Khám định kỳ/Kiểm tra tổng quát",
  giam_thi_luc: "Giảm thị lực",
  mo_mat: "Mờ mắt",
  nhuc_dau_dau_mat: "Nhức đầu/Đau mắt",
  dau_mat_kho_chiu: "Đau mắt hoặc khó chịu",
  kho_nhin_gan: "Khó nhìn gần",
  kho_nhin_xa: "Khó nhìn xa",
  kinh_ap_trong: "Muốn đeo kính áp tròng",
  tu_van_phau_thuat: "Tư vấn phẫu thuật",
  khac: "Khác",
}

const SYMPTOM_LABELS: Record<string, string> = {
  mo_mat: "Nhìn mờ/Giảm thị lực",
  nhin_doi: "Nhìn đôi",
  nhin_bien_dang: "Nhìn biến dạng",
  dom_bay: "Đốm bay",
  vong_sang: "Vòng sáng quanh đèn",
  chop_sang: "Chớp sáng",
  mat_thi_truong: "Mất thị trường",
  mo_thay_doi_theo_gio: "Mờ thay đổi theo giờ",
  nhuc_dau: "Nhức đầu",
  choi_sang: "Chói sáng",
  kho_mat: "Khô mắt",
  chay_nuoc_mat: "Chảy nước mắt",
  tiet_dich: "Tiết dịch/Ghèn",
  ngua_mat: "Ngứa mắt",
  do_mat: "Đỏ mắt",
  sung_mi: "Sưng mi mắt",
  moi_mat_doc: "Mỏi mắt khi đọc",
  kho_tap_trung_doc: "Khó tập trung khi đọc",
}

const EYE_CONDITION_LABELS: Record<string, string> = {
  can_thi: "Cận thị (Myopia)",
  vien_thi: "Viễn thị (Hyperopia)",
  loan_thi: "Loạn thị (Astigmatism)",
  lao_thi: "Lão thị (Presbyopia)",
  glaucoma: "Glaucoma (Tăng nhãn áp)",
  duc_thuy_tinh_the: "Đục thủy tinh thể (Cataract)",
  thoai_hoa_diem_vang: "Thoái hóa điểm vàng",
  benh_vong_mac_dtd: "Bệnh võng mạc do ĐTĐ",
  lac_mat: "Lác mắt (Strabismus)",
  mat_luoi: "Mắt lười (Amblyopia)",
  kho_mat_syndrome: "Khô mắt (Dry Eye)",
  viem_ket_mac: "Viêm kết mạc thường xuyên",
  bong_vong_mac: "Bong võng mạc",
  viem_mang_bo_dao: "Viêm màng bồ đào (Uveitis)",
  khac: "Khác",
}

const GLASSES_TYPE_LABELS: Record<string, string> = {
  can: "Kính cận",
  vien: "Kính viễn",
  loan: "Kính loạn",
  lao: "Kính lão",
}

const CONTACT_LENS_STATUS_LABELS: Record<string, string> = {
  co: "Có",
  khong: "Không",
  da_tung: "Đã từng đeo nhưng hiện không dùng",
}

const CONTACT_LENS_TYPE_LABELS: Record<string, string> = {
  mem: "Mềm",
  cung: "Cứng (RGP)",
  deo_ngay: "Đeo ngày",
  deo_keo_dai: "Đeo kéo dài",
}

const SURGERY_TYPE_LABELS: Record<string, string> = {
  lasik: "LASIK/PRK",
  duc_thuy_tinh_the: "Phẫu thuật đục thủy tinh thể",
  glaucoma: "Phẫu thuật glaucoma",
  vong_mac: "Phẫu thuật võng mạc",
  lac_mat: "Phẫu thuật lác mắt",
  khac: "Khác",
}

const SYSTEMIC_CONDITION_GROUPS = [
  {
    label: "Tim mạch",
    items: [
      { key: "tang_huyet_ap", label: "Tăng huyết áp" },
      { key: "dau_that_nguc", label: "Đau thắt ngực" },
      { key: "benh_tim_mach", label: "Bệnh tim mạch" },
      { key: "dot_quy", label: "Đột quỵ/Tai biến mạch máu não" },
    ],
  },
  {
    label: "Nội tiết",
    items: [
      { key: "dtd_type1", label: "Đái tháo đường Típ 1" },
      { key: "dtd_type2", label: "Đái tháo đường Típ 2" },
      { key: "benh_tuyen_giap", label: "Bệnh tuyến giáp" },
      { key: "cholesterol_cao", label: "Cholesterol cao" },
    ],
  },
  {
    label: "Thần kinh",
    items: [
      { key: "da_xo_cung", label: "Đa xơ cứng (MS)" },
      { key: "dong_kinh", label: "Động kinh" },
      { key: "parkinson", label: "Bệnh Parkinson" },
      { key: "migraine", label: "Đau nửa đầu/Migraine" },
    ],
  },
  {
    label: "Hô hấp & Miễn dịch",
    items: [
      { key: "hen_suyen", label: "Hen suyễn" },
      { key: "copd", label: "COPD" },
      { key: "hiv", label: "HIV/AIDS" },
      { key: "viem_gan_bc", label: "Viêm gan B/C" },
      { key: "lupus", label: "Lupus ban đỏ hệ thống" },
      { key: "viem_khop_dang_thap", label: "Viêm khớp dạng thấp" },
    ],
  },
  {
    label: "Ung thư",
    items: [
      { key: "ung_thu", label: "Ung thư" },
      { key: "dang_hoa_xa_tri", label: "Đang điều trị hóa chất/xạ trị" },
    ],
  },
  {
    label: "Khác",
    items: [
      { key: "benh_than", label: "Bệnh thận" },
      { key: "benh_gan", label: "Bệnh gan" },
      { key: "roi_loan_dong_mau", label: "Rối loạn đông máu" },
      { key: "benh_ngoai_da", label: "Bệnh ngoài da (vảy nến, chàm...)" },
      { key: "tram_cam_lo_au", label: "Trầm cảm/Lo âu" },
    ],
  },
]

const FAMILY_EYE_CONDITIONS = [
  { key: "glaucoma", label: "Glaucoma (Tăng nhãn áp)" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể" },
  { key: "thoai_hoa_diem_vang", label: "Thoái hóa điểm vàng" },
  { key: "benh_vong_mac", label: "Bệnh võng mạc" },
  { key: "can_thi_nang", label: "Cận thị nặng" },
  { key: "mu_mau", label: "Mù màu" },
  { key: "lac_mat_luoi", label: "Mắt lác/Mắt lười" },
  { key: "bong_vong_mac", label: "Bong võng mạc" },
]

const FAMILY_MEDICAL_CONDITIONS = [
  { key: "dtd", label: "Đái tháo đường" },
  { key: "tang_huyet_ap", label: "Tăng huyết áp" },
  { key: "benh_tim_mach", label: "Bệnh tim mạch" },
  { key: "dot_quy", label: "Đột quỵ" },
  { key: "ung_thu", label: "Ung thư" },
  { key: "benh_tu_mien", label: "Bệnh tự miễn (Lupus, RA...)" },
]

const REFERRAL_LABELS: Record<string, string> = {
  ban_be: "Bạn bè/Người thân giới thiệu",
  bac_si_khac: "Bác sĩ/Phòng khám khác giới thiệu",
  internet: "Tìm kiếm trên Internet",
  quang_cao: "Quảng cáo trực tuyến",
  website: "Website của phòng khám",
  di_ngang: "Đi ngang qua phòng khám",
  bao_chi: "Báo chí/Tạp chí",
  su_kien: "Sự kiện/Hội thảo sức khỏe",
  da_kham: "Đã từng khám tại đây",
  khac: "Khác",
}

const SCREEN_TIME_LABELS: Record<string, string> = {
  "<2h": "< 2 giờ",
  "2-4h": "2-4 giờ",
  "4-8h": "4-8 giờ",
  ">8h": "> 8 giờ",
}

const OUTDOOR_TIME_LABELS: Record<string, string> = {
  "<30m": "< 30 phút",
  "30-60m": "30-60 phút",
  "1-2h": "1-2 giờ",
  ">2h": "> 2 giờ",
}

const SUNGLASSES_LABELS: Record<string, string> = {
  luon_luon: "Luôn luôn",
  thinh_thoang: "Thỉnh thoảng",
  khong_bao_gio: "Không bao giờ",
}

const DRIVING_WHEN_LABELS: Record<string, string> = {
  ban_ngay: "Ban ngày",
  ban_dem: "Ban đêm",
  ca_hai: "Cả hai",
}

const ALLERGY_TYPE_LABELS: Record<string, string> = {
  thuoc: "Thuốc",
  thuc_pham: "Thực phẩm",
  moi_truong: "Môi trường",
  khac: "Khác",
}

function Check({ checked }: { checked: boolean }) {
  return <span className="mr-1">{checked ? "\u2611" : "\u2610"}</span>
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <span>
      {label}:{" "}
      <span className="border-b border-black">
        {value || "___________________"}
      </span>
    </span>
  )
}

export function IntakePrintView({ data, patientId }: IntakePrintViewProps) {
  const clinic = useClinic()
  const today = new Date().toLocaleDateString("vi-VN")
  const conditions = data.systemicConditions ?? {}
  const hasDiabetes = conditions["dtd_type1"] || conditions["dtd_type2"]
  const hasCancer = conditions["ung_thu"]
  const familyEye = data.familyEyeHistory ?? {}
  const familyMedical = data.familyMedicalHistory ?? {}
  const smoking = data.smokingInfo ?? { status: "khong" as const }
  const alcohol = data.alcoholInfo ?? { status: "khong" as const }
  const driving = data.drivingInfo ?? { does: false }
  const sports = data.sportsInfo ?? { does: false }

  return (
    <div className="print-view space-y-6 text-sm leading-relaxed">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-view, .print-view * { visibility: visible; }
          .print-view { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm; }
          @page { size: A4; margin: 15mm; }
        }
        .print-view { font-family: 'Times New Roman', serif; color: black; }
        .print-view h1 { font-size: 18px; font-weight: bold; text-align: center; }
        .print-view h2 { font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; text-transform: uppercase; }
        .print-view .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
        .print-view .check-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 16px; }
        .print-view table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        .print-view table th, .print-view table td { border: 1px solid black; padding: 4px 8px; text-align: left; font-size: 12px; }
        .print-view table th { background: #f0f0f0; font-weight: bold; }
        .print-view .sub-label { font-size: 11px; color: #444; font-style: italic; margin-top: 8px; margin-bottom: 4px; }
        .print-view .family-row { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <p className="font-bold">{clinic.name.toUpperCase()}</p>
        <h1>PHIẾU THÔNG TIN BỆNH NHÂN KHÁM MẮT TỔNG QUÁT</h1>
        <p>Ngày khám: {today}</p>
      </div>

      {/* Section I - Personal Information */}
      <div>
        <h2>I. Thông tin cá nhân</h2>
        <p>
          <Field label="Họ và tên" value={data.name} /> Giới tính:{" "}
          <Check checked={data.gender === "Nam"} />
          Nam <Check checked={data.gender === "Nữ"} />
          Nữ <Check checked={data.gender === "Khác"} />
          Khác
        </p>
        <p>
          <Field label="Ngày sinh" value={data.dob} />{" "}
          <Field label="CMND/CCCD" value={data.cccd} />
        </p>
        <p>
          <Field label="Địa chỉ" value={data.address} />
        </p>
        <p>
          <Field label="Quận/Huyện" value={data.district} />{" "}
          <Field label="Thành phố/Tỉnh" value={data.cityProvince} />
        </p>
        <p>
          <Field label="Số điện thoại" value={data.phone} />{" "}
          <Field label="Email" value={data.email} />
        </p>
        <p>
          <Field label="Nghề nghiệp" value={data.occupation} />
        </p>
        <p>
          <Field
            label="Người liên hệ khẩn cấp"
            value={data.emergencyContactName}
          />{" "}
          <Field label="SĐT" value={data.emergencyContactPhone} />{" "}
          <Field label="Quan hệ" value={data.emergencyContactRelationship} />
        </p>
      </div>

      {/* Section II - Visit Reasons & Symptoms */}
      <div>
        <h2>II. Lý do khám và triệu chứng</h2>
        <p className="font-medium">1. Lý do chính đến khám hôm nay:</p>
        <div className="check-grid">
          {Object.entries(VISIT_REASON_LABELS).map(([key, label]) => (
            <span key={key}>
              <Check checked={data.visitReasons.includes(key)} />
              {label}
            </span>
          ))}
        </div>
        {data.visitReasonOther && <p>Khác: {data.visitReasonOther}</p>}

        {data.symptomDetail?.onset && (
          <>
            <p className="mt-2 font-medium">2. Mô tả chi tiết triệu chứng:</p>
            <p>
              <Field
                label="Bắt đầu từ khi nào"
                value={data.symptomDetail.onset}
              />
            </p>
            <p>
              Mức độ: <Check checked={data.symptomDetail.severity === "nhe"} />
              Nhẹ{" "}
              <Check checked={data.symptomDetail.severity === "trung_binh"} />
              Trung bình{" "}
              <Check checked={data.symptomDetail.severity === "nang"} />
              Nặng
            </p>
            {data.symptomDetail.factors && (
              <p>Yếu tố ảnh hưởng: {data.symptomDetail.factors}</p>
            )}
          </>
        )}

        <p className="mt-2 font-medium">
          3. Bạn có gặp các triệu chứng sau không?
        </p>
        <div className="check-grid">
          {Object.entries(SYMPTOM_LABELS).map(([key, label]) => (
            <span key={key}>
              <Check checked={data.symptoms?.[key] ?? false} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Section III - Eye History */}
      <div>
        <h2>III. Tiền sử mắt cá nhân</h2>
        <p>
          <Field label="Lần khám mắt gần nhất" value={data.lastEyeExam?.date} />{" "}
          <Field label="Nơi khám" value={data.lastEyeExam?.location} />
        </p>

        <p className="mt-2 font-medium">Kính đang sử dụng:</p>
        {(data.currentGlasses?.types ?? []).length > 0 ? (
          <>
            <p>
              Loại kính:{" "}
              {data.currentGlasses.types
                .map((t) => GLASSES_TYPE_LABELS[t] ?? t)
                .join(", ")}
            </p>
            {data.currentGlasses.duration && (
              <p>Đeo từ: {data.currentGlasses.duration}</p>
            )}
          </>
        ) : (
          <p>Không đeo kính</p>
        )}

        <p className="mt-2">
          Kính áp tròng:{" "}
          {CONTACT_LENS_STATUS_LABELS[data.contactLensStatus] ||
            "___________________"}
        </p>
        {(data.contactLensStatus === "co" ||
          data.contactLensStatus === "da_tung") &&
          data.contactLensDetail && (
            <p>
              {data.contactLensDetail.type &&
                data.contactLensDetail.type.length > 0 && (
                  <>
                    Loại:{" "}
                    {data.contactLensDetail.type
                      .map((t: string) => CONTACT_LENS_TYPE_LABELS[t] ?? t)
                      .join(", ")}
                    .{" "}
                  </>
                )}
              {data.contactLensDetail.brand && (
                <>Thương hiệu: {data.contactLensDetail.brand}. </>
              )}
              {data.contactLensDetail.duration && (
                <>Đeo được: {data.contactLensDetail.duration}. </>
              )}
            </p>
          )}

        <p className="mt-2">
          Chấn thương mắt: <Check checked={data.eyeInjury?.has ?? false} />
          Có <Check checked={!(data.eyeInjury?.has ?? false)} />
          Không
          {data.eyeInjury?.has && data.eyeInjury?.detail && (
            <> - Chi tiết: {data.eyeInjury.detail}</>
          )}
        </p>

        <p className="mt-2 font-medium">Các bệnh mắt đã được chẩn đoán:</p>
        <div className="check-grid">
          {Object.entries(EYE_CONDITION_LABELS).map(([key, label]) => (
            <span key={key}>
              <Check
                checked={(data.diagnosedEyeConditions ?? {})[key] ?? false}
              />
              {label}
            </span>
          ))}
        </div>
        {data.diagnosedEyeConditionOther && (
          <p>Khác: {data.diagnosedEyeConditionOther}</p>
        )}

        {data.refractionValues &&
          (data.refractionValues.myopia ||
            data.refractionValues.hyperopia ||
            data.refractionValues.astigmatism) && (
            <>
              <p className="mt-2 font-medium">Số đo khúc xạ:</p>
              {data.refractionValues.myopia && (
                <p>
                  Cận thị - OD: {data.refractionValues.myopia.od || "___"} OS:{" "}
                  {data.refractionValues.myopia.os || "___"}
                </p>
              )}
              {data.refractionValues.hyperopia && (
                <p>
                  Viễn thị - OD: {data.refractionValues.hyperopia.od || "___"}{" "}
                  OS: {data.refractionValues.hyperopia.os || "___"}
                </p>
              )}
              {data.refractionValues.astigmatism && (
                <p>
                  Loạn thị - OD:{" "}
                  {data.refractionValues.astigmatism.od || "___"} OS:{" "}
                  {data.refractionValues.astigmatism.os || "___"}
                </p>
              )}
            </>
          )}

        {(data.eyeSurgeries ?? []).length > 0 && (
          <>
            <p className="mt-2 font-medium">Phẫu thuật mắt đã thực hiện:</p>
            <table>
              <thead>
                <tr>
                  <th>Loại phẫu thuật</th>
                  <th>Năm</th>
                  <th>Mắt</th>
                </tr>
              </thead>
              <tbody>
                {data.eyeSurgeries.map((s, i) => (
                  <tr key={i}>
                    <td>{SURGERY_TYPE_LABELS[s.type] ?? s.type}</td>
                    <td>{s.year || "-"}</td>
                    <td>
                      {[s.od && "OD (Phải)", s.os && "OS (Trái)"]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Section IV - Medical History */}
      <div>
        <h2>IV. Tiền sử y tế tổng quát</h2>
        <p>
          <Field
            label="Bác sĩ gia đình/Bác sĩ điều trị chính"
            value={data.primaryDoctor?.name}
          />{" "}
          <Field
            label="Lần khám gần nhất"
            value={data.primaryDoctor?.lastVisit}
          />
        </p>

        <p className="mt-2 font-medium">Bạn có bị các bệnh sau không?</p>
        {SYSTEMIC_CONDITION_GROUPS.map((group) => (
          <div key={group.label} className="mt-1">
            <p className="sub-label">{group.label}:</p>
            <div className="check-grid">
              {group.items.map((item) => (
                <span key={item.key}>
                  <Check checked={conditions[item.key] ?? false} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        ))}

        {data.systemicConditionOther && (
          <p className="mt-1">Khác: {data.systemicConditionOther}</p>
        )}

        {hasDiabetes && data.diabetesDetail && (
          <p className="mt-1">
            <Field
              label="Đái tháo đường - Năm chẩn đoán"
              value={data.diabetesDetail.yearDiagnosed}
            />{" "}
            <Field label="HbA1c gần nhất" value={data.diabetesDetail.hba1c} />
          </p>
        )}

        {hasCancer && data.cancerDetail && (
          <p className="mt-1">
            <Field label="Loại ung thư" value={data.cancerDetail.type} /> Đang
            điều trị:{" "}
            {data.cancerDetail.onTreatment === true
              ? "Có"
              : data.cancerDetail.onTreatment === false
                ? "Không"
                : "___"}
          </p>
        )}

        <p className="mt-2 font-medium">Thuốc đang sử dụng:</p>
        {(data.medicationsList ?? []).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Tên thuốc</th>
                <th>Liều dùng</th>
                <th>Mục đích</th>
              </tr>
            </thead>
            <tbody>
              {data.medicationsList.map((med, i) => (
                <tr key={i}>
                  <td>{med.name || "-"}</td>
                  <td>{med.dose || "-"}</td>
                  <td>{med.purpose || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Không sử dụng thuốc</p>
        )}

        <p className="mt-2 font-medium">Dị ứng:</p>
        {data.allergiesInfo?.none ? (
          <p>Không có dị ứng</p>
        ) : (data.allergiesInfo?.items ?? []).length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Loại</th>
                <th>Tên</th>
                <th>Phản ứng</th>
              </tr>
            </thead>
            <tbody>
              {data.allergiesInfo.items.map((a, i) => (
                <tr key={i}>
                  <td>{ALLERGY_TYPE_LABELS[a.type] ?? a.type}</td>
                  <td>{a.name || "-"}</td>
                  <td>{a.reaction || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>___________________</p>
        )}

        {data.gender === "Nữ" && (
          <p className="mt-2">
            Thai kỳ: <Check checked={data.pregnancyStatus === "co"} />
            Có <Check checked={data.pregnancyStatus === "khong"} />
            Không <Check checked={data.pregnancyStatus === "khong_chac"} />
            Không chắc
            {data.pregnancyStatus === "co" && data.pregnancyTrimester && (
              <> - Tam cá nguyệt: {data.pregnancyTrimester}</>
            )}
          </p>
        )}
      </div>

      {/* Section V - Family History */}
      <div>
        <h2>V. Tiền sử gia đình</h2>
        <p className="mb-1">Có ai trong gia đình bị các bệnh sau không?</p>

        <p className="sub-label">Bệnh mắt:</p>
        <div className="family-row">
          {FAMILY_EYE_CONDITIONS.map((item) => {
            const entry = familyEye[item.key]
            return (
              <span key={item.key}>
                <Check checked={entry?.has ?? false} />
                {item.label}
                {entry?.has && entry?.who && <> ({entry.who})</>}
              </span>
            )
          })}
        </div>

        <p className="sub-label mt-2">Bệnh toàn thân:</p>
        <div className="family-row">
          {FAMILY_MEDICAL_CONDITIONS.map((item) => {
            const entry = familyMedical[item.key]
            return (
              <span key={item.key}>
                <Check checked={entry?.has ?? false} />
                {item.label}
                {entry?.has && entry?.who && <> ({entry.who})</>}
              </span>
            )
          })}
        </div>

        {data.familyHistoryOther?.has && (
          <p className="mt-1">
            Bệnh khác: {data.familyHistoryOther.detail ?? "___"}
            {data.familyHistoryOther.who && (
              <> (Ai bị: {data.familyHistoryOther.who})</>
            )}
          </p>
        )}
      </div>

      {/* Section VI - Lifestyle */}
      <div>
        <h2>VI. Thói quen sinh hoạt</h2>

        <p>
          Hút thuốc: <Check checked={smoking.status === "khong"} />
          Không <Check checked={smoking.status === "co"} />
          Có <Check checked={smoking.status === "da_bo"} />
          Đã bỏ
          {smoking.status === "co" && (
            <>
              {smoking.quantity && <> - Số điếu/ngày: {smoking.quantity}</>}
              {smoking.years && <> - Số năm: {smoking.years}</>}
            </>
          )}
          {smoking.status === "da_bo" && smoking.quitYear && (
            <> - Bỏ từ năm: {smoking.quitYear}</>
          )}
        </p>

        <p>
          Uống rượu/bia: <Check checked={alcohol.status === "khong"} />
          Không <Check checked={alcohol.status === "thinh_thoang"} />
          Thỉnh thoảng <Check checked={alcohol.status === "thuong_xuyen"} />
          Thường xuyên
          {alcohol.status === "thuong_xuyen" && alcohol.frequency && (
            <> - {alcohol.frequency} lần/tuần</>
          )}
        </p>

        <p>
          Thời gian máy tính/laptop mỗi ngày:{" "}
          {SCREEN_TIME_LABELS[data.screenTimeComputer] || "___________________"}
        </p>
        <p>
          Thời gian điện thoại/tablet mỗi ngày:{" "}
          {SCREEN_TIME_LABELS[data.screenTimePhone] || "___________________"}
        </p>
        <p>
          Thời gian hoạt động ngoài trời:{" "}
          {OUTDOOR_TIME_LABELS[data.outdoorTime] || "___________________"}
        </p>
        <p>
          Đeo kính râm khi ra ngoài:{" "}
          {SUNGLASSES_LABELS[data.sunglassesUse] || "___________________"}
        </p>

        <p>
          <Check checked={data.workNearVision ?? false} />
          Công việc yêu cầu nhìn gần nhiều (đọc, máy tính)
        </p>
        <p>
          <Check checked={data.workDustyChemical ?? false} />
          Công việc trong môi trường bụi bặm, hóa chất
        </p>

        <p>
          Lái xe thường xuyên: <Check checked={driving.does} />
          Có <Check checked={!driving.does} />
          Không
          {driving.does && driving.when && (
            <> - {DRIVING_WHEN_LABELS[driving.when] ?? driving.when}</>
          )}
        </p>

        <p>
          Chơi thể thao: <Check checked={sports.does} />
          Có <Check checked={!sports.does} />
          Không
          {sports.does && sports.type && <> - Môn: {sports.type}</>}
        </p>

        {data.hobbies && <p>Sở thích đặc biệt: {data.hobbies}</p>}
      </div>

      {/* Section VII - Referral Source */}
      <div>
        <h2>VII. Nguồn thông tin</h2>
        <p>Bạn biết đến phòng khám của chúng tôi qua đâu?</p>
        <div className="check-grid">
          {Object.entries(REFERRAL_LABELS).map(([key, label]) => (
            <span key={key}>
              <Check checked={data.referralSource === key} />
              {label}
            </span>
          ))}
        </div>
        {data.referralDetail && (
          <p className="mt-1">Chi tiết: {data.referralDetail}</p>
        )}
      </div>

      {/* Section VIII - Consent & Signature */}
      <div>
        <h2>VIII. Cam kết và chữ ký</h2>
        <p>
          Tôi xác nhận rằng tất cả thông tin trên là chính xác và đầy đủ theo
          hiểu biết của tôi. Tôi hiểu rằng việc cung cấp thông tin không chính
          xác có thể ảnh hưởng đến chẩn đoán và điều trị của tôi.
        </p>
        <p>
          Tôi đồng ý cho phép phòng khám sử dụng thông tin này cho mục đích
          khám, điều trị và lưu trữ hồ sơ y tế.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p>Chữ ký bệnh nhân: _________________________</p>
            <p>Ngày: ____/____/________</p>
          </div>
          <div>
            <p>Chữ ký người giám hộ (nếu có): _________________________</p>
            <p>Quan hệ: ___________ Ngày: ____/____/________</p>
          </div>
        </div>
      </div>

      {/* Staff-only section */}
      <div className="mt-8 border-t border-black pt-4">
        <p className="font-bold">PHẦN DÀNH CHO Y TẾ (Không điền)</p>
        <p>
          <Field label="Bác sĩ khám" />{" "}
          <Field label="Ngày khám" value={today} />
        </p>
        <p>
          <Field label="Ghi chú sơ bộ" />
        </p>
        <p>
          <Field label="Mã bệnh nhân" value={patientId} />
        </p>
      </div>
    </div>
  )
}
