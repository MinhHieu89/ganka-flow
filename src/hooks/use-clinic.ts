export interface ClinicInfo {
  name: string
  address: string
  hotline: string
  email: string
  website: string
}

const CLINIC_INFO: ClinicInfo = {
  name: "Phòng khám mắt Ganka28",
  address: "28 P. Nguyễn Gia Thiều, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
  hotline: "0912 133 690",
  email: "support@ganka28.vn",
  website: "ganka28.vn",
}

export function useClinic(): ClinicInfo {
  return CLINIC_INFO
}
