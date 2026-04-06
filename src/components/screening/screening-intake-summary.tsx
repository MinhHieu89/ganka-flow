import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Note01Icon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Patient } from "@/data/mock-patients"

interface ScreeningIntakeSummaryProps {
  patient: Patient
}

const VISIT_REASON_LABELS: Record<string, string> = {
  kham_dinh_ky: "Khám định kỳ/Kiểm tra tổng quát",
  giam_thi_luc: "Giảm thị lực",
  mo_mat: "Mờ mắt",
  nhuc_dau_dau_mat: "Nhức đầu/Đau mắt",
  dau_mat_kho_chiu: "Đau mắt hoặc khó chịu",
  kho_nhin_gan: "Khó nhìn gần (đọc sách, xem điện thoại)",
  kho_nhin_xa: "Khó nhìn xa (xem bảng, lái xe)",
  kinh_ap_trong: "Muốn đeo kính áp tròng",
  tu_van_phau_thuat: "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)",
  khac: "Khác",
}

const SYMPTOM_LABELS: Record<string, string> = {
  mo_mat: "Nhìn mờ/Giảm thị lực",
  nhin_doi: "Nhìn đôi (song thị)",
  nhin_bien_dang: "Nhìn biến dạng",
  dom_bay: "Xuất hiện điểm đen/đốm bay",
  vong_sang: "Thấy vòng sáng quanh đèn",
  chop_sang: "Nhìn chớp sáng (flash)",
  mat_thi_truong: "Mất thị trường (góc nhìn)",
  mo_thay_doi_theo_gio: "Nhìn mờ thay đổi theo giờ",
  nhuc_dau: "Nhức đầu thường xuyên",
  choi_sang: "Chói sáng/Sợ ánh sáng",
  kho_mat: "Khô mắt",
  chay_nuoc_mat: "Chảy nước mắt nhiều",
  tiet_dich: "Tiết dịch/Ghèn mắt",
  ngua_mat: "Ngứa mắt",
  do_mat: "Đỏ mắt",
  sung_mi: "Sưng mi mắt",
  moi_mat_doc: "Mỏi mắt khi đọc/máy tính",
  kho_tap_trung_doc: "Khó tập trung khi đọc",
}

const SEVERITY_LABELS: Record<string, string> = {
  nhe: "Nhẹ",
  trung_binh: "Trung bình",
  nang: "Nặng",
}

const FREQUENCY_LABELS: Record<string, string> = {
  thinh_thoang: "Thỉnh thoảng",
  thuong_xuyen: "Thường xuyên",
  lien_tuc: "Liên tục",
}

const EYE_CONDITION_LABELS: Record<string, string> = {
  can_thi: "Cận thị",
  vien_thi: "Viễn thị",
  loan_thi: "Loạn thị",
  lao_thi: "Lão thị",
  glaucoma: "Glaucoma",
  duc_thuy_tinh_the: "Đục thủy tinh thể",
  thoai_hoa_diem_vang: "Thoái hóa điểm vàng",
  benh_vong_mac_dtd: "Bệnh võng mạc do ĐTĐ",
  lac_mat: "Lác mắt",
  mat_luoi: "Mắt lười",
  kho_mat_syndrome: "Khô mắt",
  viem_ket_mac: "Viêm kết mạc",
  bong_vong_mac: "Bong võng mạc",
  viem_mang_bo_dao: "Viêm màng bồ đào",
}

const SYSTEMIC_CONDITION_LABELS: Record<string, string> = {
  tang_huyet_ap: "Tăng huyết áp",
  dau_that_nguc: "Đau thắt ngực",
  benh_tim_mach: "Bệnh tim mạch",
  dot_quy: "Đột quỵ",
  dtd_type1: "Đái tháo đường Típ 1",
  dtd_type2: "Đái tháo đường Típ 2",
  benh_tuyen_giap: "Bệnh tuyến giáp",
  cholesterol_cao: "Cholesterol cao",
  da_xo_cung: "Đa xơ cứng",
  dong_kinh: "Động kinh",
  parkinson: "Bệnh Parkinson",
  migraine: "Đau nửa đầu/Migraine",
  hen_suyen: "Hen suyễn",
  copd: "COPD",
  hiv: "HIV/AIDS",
  viem_gan_bc: "Viêm gan B/C",
  lupus: "Lupus ban đỏ hệ thống",
  viem_khop_dang_thap: "Viêm khớp dạng thấp",
  ung_thu: "Ung thư",
  dang_hoa_xa_tri: "Đang điều trị hóa chất/xạ trị",
  benh_than: "Bệnh thận",
  benh_gan: "Bệnh gan",
  roi_loan_dong_mau: "Rối loạn đông máu",
  benh_ngoai_da: "Bệnh ngoài da",
  tram_cam_lo_au: "Trầm cảm/Lo âu",
}

const FAMILY_EYE_LABELS: Record<string, string> = {
  glaucoma: "Glaucoma",
  duc_thuy_tinh_the: "Đục thủy tinh thể",
  thoai_hoa_diem_vang: "Thoái hóa điểm vàng",
  benh_vong_mac: "Bệnh võng mạc",
  can_thi_nang: "Cận thị nặng",
  mu_mau: "Mù màu",
  lac_mat_luoi: "Mắt lác/Mắt lười",
  bong_vong_mac: "Bong võng mạc",
}

const FAMILY_MEDICAL_LABELS: Record<string, string> = {
  dtd: "Đái tháo đường",
  tang_huyet_ap: "Tăng huyết áp",
  benh_tim_mach: "Bệnh tim mạch",
  dot_quy: "Đột quỵ",
  ung_thu: "Ung thư",
  benh_tu_mien: "Bệnh tự miễn",
}

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

const CONTACT_LENS_STATUS_LABELS: Record<string, string> = {
  co: "Có",
  khong: "Không",
  da_tung: "Đã từng đeo nhưng hiện không dùng",
}

const SMOKING_LABELS: Record<string, string> = {
  khong: "Không hút",
  co: "Có hút",
  da_bo: "Đã bỏ",
}

const ALCOHOL_LABELS: Record<string, string> = {
  khong: "Không",
  thinh_thoang: "Thỉnh thoảng",
  thuong_xuyen: "Thường xuyên",
}

const GLASSES_TYPE_LABELS: Record<string, string> = {
  can: "Kính cận",
  vien: "Kính viễn",
  loan: "Kính loạn",
  lao: "Kính lão",
}

const SURGERY_TYPE_LABELS: Record<string, string> = {
  lasik: "LASIK/PRK",
  duc_thuy_tinh_the: "Phẫu thuật đục thủy tinh thể",
  glaucoma: "Phẫu thuật glaucoma",
  vong_mac: "Phẫu thuật võng mạc",
  lac_mat: "Phẫu thuật lác mắt",
  khac: "Khác",
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  )
}

function getCheckedKeys(
  record: Record<string, boolean> | undefined
): string[] {
  if (!record) return []
  return Object.entries(record)
    .filter(([, v]) => v)
    .map(([k]) => k)
}

export function ScreeningIntakeSummary({
  patient,
}: ScreeningIntakeSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Visit reasons summary
  const visitReasonLabels = (patient.visitReasons ?? []).map(
    (r) => VISIT_REASON_LABELS[r] ?? r
  )
  const collapsedSummary =
    visitReasonLabels.length > 0
      ? visitReasonLabels.join(", ")
      : "Chưa có thông tin tiếp nhận"

  // Symptoms
  const checkedSymptoms = getCheckedKeys(patient.symptoms)

  // Eye conditions
  const checkedEyeConditions = getCheckedKeys(patient.diagnosedEyeConditions)

  // Systemic conditions
  const checkedSystemic = getCheckedKeys(patient.systemicConditions)

  // Family eye history
  const familyEyeEntries = Object.entries(patient.familyEyeHistory ?? {})
    .filter(([, v]) => v.has)
    .map(([k, v]) => ({
      label: FAMILY_EYE_LABELS[k] ?? k,
      who: v.who,
    }))

  // Family medical history
  const familyMedicalEntries = Object.entries(
    patient.familyMedicalHistory ?? {}
  )
    .filter(([, v]) => v.has)
    .map(([k, v]) => ({
      label: FAMILY_MEDICAL_LABELS[k] ?? k,
      who: v.who,
    }))

  const hasFamilyHistory =
    familyEyeEntries.length > 0 ||
    familyMedicalEntries.length > 0 ||
    patient.familyHistoryOther?.has

  // Eye history checks
  const hasEyeHistory =
    patient.lastEyeExam?.date ||
    patient.lastEyeExam?.location ||
    (patient.currentGlasses?.types?.length ?? 0) > 0 ||
    patient.contactLensStatus ||
    checkedEyeConditions.length > 0 ||
    (patient.eyeSurgeries?.length ?? 0) > 0 ||
    patient.eyeInjury?.has

  // Medical history checks
  const hasMedicalHistory =
    checkedSystemic.length > 0 ||
    (patient.medicationsList?.length ?? 0) > 0 ||
    (patient.allergiesInfo && !patient.allergiesInfo.none) ||
    patient.pregnancyStatus

  // Lifestyle checks
  const hasLifestyle =
    patient.smokingInfo ||
    patient.alcoholInfo ||
    patient.screenTimeComputer ||
    patient.screenTimePhone ||
    patient.outdoorTime ||
    patient.sunglassesUse ||
    patient.workNearVision ||
    patient.workDustyChemical ||
    patient.drivingInfo?.does ||
    patient.sportsInfo?.does ||
    patient.hobbies

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-muted/30">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3"
          >
            <HugeiconsIcon
              icon={Note01Icon}
              className="size-4 shrink-0 text-muted-foreground"
              strokeWidth={1.5}
            />
            <span className="text-sm font-semibold">Phiếu tiếp nhận</span>
            <span className="flex-1 truncate text-left text-sm text-muted-foreground">
              {collapsedSummary}
            </span>
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
              strokeWidth={1.5}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="space-y-4 border-t border-border px-4 py-3 text-sm">
            {/* Ly do kham */}
            {visitReasonLabels.length > 0 && (
              <div className="space-y-1">
                <SectionHeading>Lý do khám</SectionHeading>
                <p className="text-muted-foreground">
                  {visitReasonLabels.join(", ")}
                  {patient.visitReasonOther
                    ? ` — ${patient.visitReasonOther}`
                    : ""}
                </p>
              </div>
            )}

            {/* Trieu chung */}
            {checkedSymptoms.length > 0 && (
              <div className="space-y-1">
                <SectionHeading>Triệu chứng</SectionHeading>
                <p className="text-muted-foreground">
                  {checkedSymptoms
                    .map((k) => SYMPTOM_LABELS[k] ?? k)
                    .join(", ")}
                </p>
                {patient.symptomDetail && (
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    {patient.symptomDetail.onset && (
                      <span>Bắt đầu: {patient.symptomDetail.onset}</span>
                    )}
                    {patient.symptomDetail.severity && (
                      <span>
                        Mức độ:{" "}
                        {SEVERITY_LABELS[patient.symptomDetail.severity]}
                      </span>
                    )}
                    {patient.symptomDetail.frequency && (
                      <span>
                        Tần suất:{" "}
                        {FREQUENCY_LABELS[patient.symptomDetail.frequency]}
                      </span>
                    )}
                    {patient.symptomDetail.factors && (
                      <span>Yếu tố: {patient.symptomDetail.factors}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tien su mat */}
            {hasEyeHistory && (
              <div className="space-y-1">
                <SectionHeading>Tiền sử mắt</SectionHeading>
                <div className="space-y-0.5 text-muted-foreground">
                  {(patient.lastEyeExam?.date ||
                    patient.lastEyeExam?.location) && (
                    <p>
                      Khám lần cuối:{" "}
                      {[
                        patient.lastEyeExam.date,
                        patient.lastEyeExam.location,
                      ]
                        .filter(Boolean)
                        .join(" tại ")}
                    </p>
                  )}
                  {(patient.currentGlasses?.types?.length ?? 0) > 0 && (
                    <p>
                      Kính đang dùng:{" "}
                      {patient.currentGlasses!.types
                        .map((t) => GLASSES_TYPE_LABELS[t] ?? t)
                        .join(", ")}
                      {patient.currentGlasses!.duration
                        ? ` (${patient.currentGlasses!.duration})`
                        : ""}
                    </p>
                  )}
                  {patient.contactLensStatus && (
                    <p>
                      Kính áp tròng:{" "}
                      {CONTACT_LENS_STATUS_LABELS[patient.contactLensStatus]}
                    </p>
                  )}
                  {checkedEyeConditions.length > 0 && (
                    <p>
                      Chẩn đoán:{" "}
                      {checkedEyeConditions
                        .map((k) => EYE_CONDITION_LABELS[k] ?? k)
                        .join(", ")}
                      {patient.diagnosedEyeConditionOther
                        ? `, ${patient.diagnosedEyeConditionOther}`
                        : ""}
                    </p>
                  )}
                  {patient.eyeInjury?.has && patient.eyeInjury.detail && (
                    <p>Chấn thương mắt: {patient.eyeInjury.detail}</p>
                  )}
                  {(patient.eyeSurgeries?.length ?? 0) > 0 && (
                    <p>
                      Phẫu thuật:{" "}
                      {patient.eyeSurgeries!.map((s, i) => {
                        const typeName =
                          SURGERY_TYPE_LABELS[s.type] ??
                          s.typeOther ??
                          s.type
                        const eyes = [s.od && "OD", s.os && "OS"]
                          .filter(Boolean)
                          .join("/")
                        return (
                          <span key={i}>
                            {i > 0 ? ", " : ""}
                            {typeName}
                            {eyes ? ` (${eyes})` : ""}
                            {s.year ? ` ${s.year}` : ""}
                          </span>
                        )
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tien su y te */}
            {hasMedicalHistory && (
              <div className="space-y-1">
                <SectionHeading>Tiền sử y tế</SectionHeading>
                <div className="space-y-0.5 text-muted-foreground">
                  {checkedSystemic.length > 0 && (
                    <p>
                      Bệnh lý:{" "}
                      {checkedSystemic
                        .map((k) => SYSTEMIC_CONDITION_LABELS[k] ?? k)
                        .join(", ")}
                      {patient.systemicConditionOther
                        ? `, ${patient.systemicConditionOther}`
                        : ""}
                    </p>
                  )}
                  {(patient.medicationsList?.length ?? 0) > 0 && (
                    <p>
                      Thuốc đang dùng:{" "}
                      {patient.medicationsList!.map((m) => m.name).join(", ")}
                    </p>
                  )}
                  {patient.allergiesInfo &&
                    !patient.allergiesInfo.none &&
                    patient.allergiesInfo.items.length > 0 && (
                      <p>
                        Dị ứng:{" "}
                        {patient.allergiesInfo.items
                          .map((a) => `${a.name} (${a.reaction})`)
                          .join(", ")}
                      </p>
                    )}
                  {patient.pregnancyStatus &&
                    patient.pregnancyStatus !== "khong" && (
                      <p>
                        Thai kỳ:{" "}
                        {patient.pregnancyStatus === "mang_thai"
                          ? `Đang mang thai${patient.pregnancyTrimester ? ` (${patient.pregnancyTrimester})` : ""}`
                          : "Đang cho con bú"}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Tien su gia dinh */}
            {hasFamilyHistory && (
              <div className="space-y-1">
                <SectionHeading>Tiền sử gia đình</SectionHeading>
                <div className="space-y-0.5 text-muted-foreground">
                  {familyEyeEntries.length > 0 && (
                    <p>
                      Mắt:{" "}
                      {familyEyeEntries
                        .map((e) => `${e.label}${e.who ? ` (${e.who})` : ""}`)
                        .join(", ")}
                    </p>
                  )}
                  {familyMedicalEntries.length > 0 && (
                    <p>
                      Y tế:{" "}
                      {familyMedicalEntries
                        .map((e) => `${e.label}${e.who ? ` (${e.who})` : ""}`)
                        .join(", ")}
                    </p>
                  )}
                  {patient.familyHistoryOther?.has &&
                    patient.familyHistoryOther.detail && (
                      <p>
                        Khác: {patient.familyHistoryOther.detail}
                        {patient.familyHistoryOther.who
                          ? ` (${patient.familyHistoryOther.who})`
                          : ""}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Loi song */}
            {hasLifestyle && (
              <div className="space-y-1">
                <SectionHeading>Lối sống</SectionHeading>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-muted-foreground">
                  {patient.smokingInfo &&
                    patient.smokingInfo.status !== "khong" && (
                      <span>
                        Hút thuốc: {SMOKING_LABELS[patient.smokingInfo.status]}
                        {patient.smokingInfo.quantity
                          ? ` (${patient.smokingInfo.quantity})`
                          : ""}
                      </span>
                    )}
                  {patient.alcoholInfo &&
                    patient.alcoholInfo.status !== "khong" && (
                      <span>
                        Rượu bia:{" "}
                        {ALCOHOL_LABELS[patient.alcoholInfo.status]}
                      </span>
                    )}
                  {patient.screenTimeComputer && (
                    <span>Máy tính: {patient.screenTimeComputer}</span>
                  )}
                  {patient.screenTimePhone && (
                    <span>Điện thoại: {patient.screenTimePhone}</span>
                  )}
                  {patient.outdoorTime && (
                    <span>Ngoài trời: {patient.outdoorTime}</span>
                  )}
                  {patient.sunglassesUse && (
                    <span>Kính râm: {patient.sunglassesUse}</span>
                  )}
                  {patient.workNearVision && <span>Làm việc nhìn gần</span>}
                  {patient.workDustyChemical && (
                    <span>Tiếp xúc bụi/hóa chất</span>
                  )}
                  {patient.drivingInfo?.does && <span>Lái xe</span>}
                  {patient.sportsInfo?.does && (
                    <span>
                      Thể thao
                      {patient.sportsInfo.type
                        ? `: ${patient.sportsInfo.type}`
                        : ""}
                    </span>
                  )}
                  {patient.hobbies && (
                    <span>Sở thích: {patient.hobbies}</span>
                  )}
                </div>
              </div>
            )}

            {/* Nguon thong tin */}
            {patient.referralSource && (
              <div className="space-y-1">
                <SectionHeading>Nguồn thông tin</SectionHeading>
                <p className="text-muted-foreground">
                  {REFERRAL_LABELS[patient.referralSource] ??
                    patient.referralSource}
                  {patient.referralDetail
                    ? ` — ${patient.referralDetail}`
                    : ""}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
