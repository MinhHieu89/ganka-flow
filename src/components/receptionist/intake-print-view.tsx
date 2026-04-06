import type { IntakeFormData } from "./intake-form"

interface IntakePrintViewProps {
  data: IntakeFormData
  patientId?: string
}

// TODO: Task 11 — implement full printable intake view
export function IntakePrintView({ data, patientId }: IntakePrintViewProps) {
  return (
    <div className="p-6 text-sm">
      <h1 className="mb-4 text-center text-lg font-bold">
        Phiếu tiếp nhận bệnh nhân
      </h1>
      <p className="text-muted-foreground">
        Bản xem trước đang được phát triển.
      </p>
      <p className="mt-2">
        <strong>Họ tên:</strong> {data.name}
      </p>
      {patientId && (
        <p>
          <strong>Mã BN:</strong> {patientId}
        </p>
      )}
    </div>
  )
}
