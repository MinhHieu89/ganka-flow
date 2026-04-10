import type { IntakeFormData } from "./intake-form"
import { useClinic } from "@/hooks/use-clinic"

interface IntakePrintViewProps {
  data: IntakeFormData
  patientId?: string
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

      {/* Consent & Signature */}
      <div>
        <h2>Cam kết và chữ ký</h2>
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
