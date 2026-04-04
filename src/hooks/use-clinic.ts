export interface ClinicInfo {
  name: string
  address: string
  hotline: string
  website: string
}

const CLINIC_INFO: ClinicInfo = {
  name: "Phòng khám mắt Ganka28",
  address: "123 Nguyễn Văn Cừ, Q.5, TP.HCM",
  hotline: "028 1234 5678",
  website: "ganka28.vn",
}

export function useClinic(): ClinicInfo {
  return CLINIC_INFO
}
