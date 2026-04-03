// src/components/patients/detail/tab-overview.tsx
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import type {
  PatientPersonalInfo,
  MedicalHistory,
  CurrentMedication,
  OpticalRx,
  DiagnosisRecord,
  MeasurementData,
} from "@/data/mock-patient-detail"

interface TabOverviewProps {
  personal: PatientPersonalInfo
  medicalHistory: MedicalHistory
  medications: CurrentMedication[]
  opticalRx: OpticalRx | null
  diagnosisHistory: DiagnosisRecord[]
  measurements: MeasurementData | null
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-[13px]">
      <span className="w-[110px] shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

export function TabOverview({
  personal,
  medicalHistory,
  medications,
  opticalRx,
  diagnosisHistory,
  measurements,
}: TabOverviewProps) {
  return (
    <div className="space-y-5">
      {/* Section 1: Personal info + Medical history (2-col grid) */}
      <div className="grid gap-3 md:grid-cols-2">
        {/* Personal info card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <div className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Thông tin cá nhân
          </div>
          <div className="space-y-1.5">
            <KvRow label="Họ tên" value={personal.name} />
            <KvRow
              label="Ngày sinh"
              value={`${personal.dob} (${personal.age} tuổi)`}
            />
            <KvRow label="Giới tính" value={personal.gender} />
            <KvRow label="Điện thoại" value={personal.phone} />
            <KvRow label="Địa chỉ" value={personal.address} />
            <KvRow label="Nghề nghiệp" value={personal.occupation} />
            <KvRow label="BHYT" value={personal.insurance ?? "—"} />
            <KvRow
              label="LH khẩn cấp"
              value={personal.emergencyContact ?? "—"}
            />
          </div>
        </div>

        {/* Medical history card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <div className="mb-3 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Tiền sử & dị ứng
          </div>

          <div className="mb-1.5 text-xs font-medium">Bệnh mắt</div>
          <div className="mb-1 flex flex-wrap gap-1.5">
            {medicalHistory.eyeDiseases.map((d) => (
              <span
                key={d}
                className="rounded-full bg-[#E6F1FB] px-2.5 py-0.5 text-[11px] font-medium text-[#0C447C]"
              >
                {d}
              </span>
            ))}
          </div>
          {medicalHistory.eyeNotes && (
            <div className="mb-3 text-xs text-muted-foreground">
              {medicalHistory.eyeNotes}
            </div>
          )}

          <div className="mb-1.5 text-xs font-medium">Dị ứng</div>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {medicalHistory.allergies.length > 0 ? (
              medicalHistory.allergies.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-[#FCEBEB] px-2.5 py-0.5 text-[11px] font-medium text-[#791F1F]"
                >
                  {a}
                </span>
              ))
            ) : (
              <span className="text-[13px] text-muted-foreground">
                Không có
              </span>
            )}
          </div>

          <div className="mb-1.5 text-xs font-medium">Toàn thân</div>
          <div className="text-[13px]">
            {medicalHistory.systemicHistory ?? "Không có bệnh nền"}
          </div>
        </div>
      </div>

      {/* Section 2: Current medications */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Đơn thuốc hiện tại</h3>
        {medications.length > 0 ? (
          <div className="rounded-xl border border-border px-5 py-3">
            {medications.map((med, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-start justify-between py-2.5",
                  i < medications.length - 1 && "border-b border-border"
                )}
              >
                <div>
                  <div className="text-[13px] font-medium">{med.name}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {med.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] font-medium">
                    {med.dosage} · {med.frequency}
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {med.eye}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {med.duration} · Kê {med.prescribedDate} · {med.doctor}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-5 text-center text-[13px] text-muted-foreground">
            Không có đơn thuốc hiện tại
          </div>
        )}
      </div>

      {/* Section 3: Current optical Rx */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Đơn kính hiện tại</h3>
        {opticalRx ? (
          <div className="rounded-xl border border-border px-5 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* OD */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div
                  className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#185FA5" }}
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: "#378ADD" }}
                  />
                  Mắt phải (OD)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Sph</div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.od.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Cyl</div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.od.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.od.axis}
                    </div>
                  </div>
                </div>
              </div>
              {/* OS */}
              <div className="rounded-[10px] bg-muted/50 p-3.5">
                <div
                  className="mb-2.5 flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: "#993C1D" }}
                >
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ background: "#D85A30" }}
                  />
                  Mắt trái (OS)
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Sph</div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.os.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Cyl</div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.os.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {opticalRx.os.axis}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3.5 flex gap-5 border-t border-border pt-3.5 text-[13px]">
              <span>
                <span className="text-muted-foreground">PD </span>
                {opticalRx.pd} mm
              </span>
              <span>
                <span className="text-muted-foreground">Loại </span>
                {opticalRx.lensType}
              </span>
              <span>
                <span className="text-muted-foreground">Kê </span>
                {opticalRx.prescribedDate} · {opticalRx.doctor}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-5 text-center text-[13px] text-muted-foreground">
            Không có đơn kính hiện tại
          </div>
        )}
      </div>

      {/* Section 4: Diagnosis history */}
      <div>
        <h3 className="mb-3 text-[15px] font-medium">Lịch sử chẩn đoán</h3>
        <div className="rounded-xl border border-border px-5 py-3">
          {diagnosisHistory.map((dx, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 py-2",
                i < diagnosisHistory.length - 1 && "border-b border-border"
              )}
            >
              <span
                className={cn(
                  "rounded-[5px] px-2 py-0.5 text-[10px] font-medium",
                  dx.type === "primary"
                    ? "bg-[#E6F1FB] text-[#0C447C]"
                    : "bg-[#F1EFE8] text-[#444441]"
                )}
              >
                {dx.type === "primary" ? "Chính" : "Phụ"}
              </span>
              <span className="flex-1 text-[13px]">{dx.name}</span>
              <span className="text-xs text-muted-foreground">
                {dx.icdCode}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {dx.firstSeen} → {dx.lastSeen ?? "Hiện tại"}
                {dx.visitCount > 1 && ` · ${dx.visitCount} lần`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 5: Latest measurements */}
      {measurements && (
        <div>
          <h3 className="mb-3 text-[15px] font-medium">
            Số đo gần nhất — {measurements.date}
          </h3>
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Thị lực & nhãn áp">
              <OdOsRow eye="OD">
                SC {measurements.va.od.sc} · CC {measurements.va.od.cc}
                {measurements.va.od.ph && ` · PH ${measurements.va.od.ph}`} ·
                IOP {measurements.va.od.iop}
              </OdOsRow>
              <OdOsRow eye="OS">
                SC {measurements.va.os.sc} · CC {measurements.va.os.cc}
                {measurements.va.os.ph && ` · PH ${measurements.va.os.ph}`} ·
                IOP {measurements.va.os.iop}
              </OdOsRow>
            </MeasurementBlock>

            <MeasurementBlock label="Khúc xạ (Auto-Ref)">
              <OdOsRow eye="OD">
                {measurements.refraction.od.sph} /{" "}
                {measurements.refraction.od.cyl} x{" "}
                {measurements.refraction.od.axis}
              </OdOsRow>
              <OdOsRow eye="OS">
                {measurements.refraction.os.sph} /{" "}
                {measurements.refraction.os.cyl} x{" "}
                {measurements.refraction.os.axis}
              </OdOsRow>
            </MeasurementBlock>

            {measurements.dryEye && (
              <MeasurementBlock label="Khô mắt (Dry Eye)">
                <div>
                  <b className="font-medium">OSDI-6:</b>{" "}
                  {measurements.dryEye.osdiScore}/{measurements.dryEye.osdiMax}{" "}
                  <span className="rounded bg-[#FAEEDA] px-1.5 py-px text-[10px] font-medium text-[#633806]">
                    {measurements.dryEye.osdiSeverity}
                  </span>
                </div>
                <OdOsRow eye="OD">
                  TBUT {measurements.dryEye.od.tbut} · Schirmer{" "}
                  {measurements.dryEye.od.schirmer} · Meibomian:{" "}
                  {measurements.dryEye.od.meibomian}
                </OdOsRow>
                <OdOsRow eye="OS">
                  TBUT {measurements.dryEye.os.tbut} · Schirmer{" "}
                  {measurements.dryEye.os.schirmer} · Meibomian:{" "}
                  {measurements.dryEye.os.meibomian}
                </OdOsRow>
              </MeasurementBlock>
            )}

            <MeasurementBlock label="Sinh hiển vi & đáy mắt">
              <div>Slit-lamp: {measurements.slitLamp}</div>
              <div>Fundus: {measurements.fundus}</div>
            </MeasurementBlock>
          </div>
        </div>
      )}
    </div>
  )
}
