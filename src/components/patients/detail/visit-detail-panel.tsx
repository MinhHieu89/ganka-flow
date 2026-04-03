// src/components/patients/detail/visit-detail-panel.tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface VisitDetailPanelProps {
  visit: VisitRecord
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]
  const m = visit.measurements

  return (
    <div className="flex-1 overflow-y-auto py-4 pl-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 text-[17px] font-medium">
            {visit.date}
            <span
              className={cn(
                "rounded-[5px] px-2.5 py-0.5 text-[10px] font-medium",
                groupConfig.colorClass
              )}
            >
              {groupConfig.label}
            </span>
          </div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            {visit.doctorName} ·{" "}
            {visit.daysAgo !== null
              ? `${visit.daysAgo} ngày trước`
              : "Khám lần đầu"}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            In phiếu
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Xuất PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs font-medium"
          >
            Xem đầy đủ
          </Button>
        </div>
      </div>

      {/* Diagnosis pills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {visit.diagnoses.map((dx, i) => (
          <span
            key={i}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              dx.isPrimary
                ? "bg-[#E6F1FB] text-[#0C447C]"
                : "bg-[#F1EFE8] text-[#444441]"
            )}
          >
            {dx.text} · {dx.icdCode}
          </span>
        ))}
      </div>

      {/* Measurement blocks */}
      <div className="space-y-2.5">
        <div className="grid gap-2.5 md:grid-cols-2">
          <MeasurementBlock label="Thị lực & nhãn áp">
            <OdOsRow eye="OD">
              SC {m.va.od.sc} · CC {m.va.od.cc}
              {m.va.od.ph && ` · PH ${m.va.od.ph}`} · IOP {m.va.od.iop}
            </OdOsRow>
            <OdOsRow eye="OS">
              SC {m.va.os.sc} · CC {m.va.os.cc}
              {m.va.os.ph && ` · PH ${m.va.os.ph}`} · IOP {m.va.os.iop}
            </OdOsRow>
          </MeasurementBlock>

          <MeasurementBlock label="Khúc xạ">
            <OdOsRow eye="OD">
              {m.refraction.od.sph} / {m.refraction.od.cyl} x{" "}
              {m.refraction.od.axis}°
            </OdOsRow>
            <OdOsRow eye="OS">
              {m.refraction.os.sph} / {m.refraction.os.cyl} x{" "}
              {m.refraction.os.axis}°
            </OdOsRow>
          </MeasurementBlock>
        </div>

        {m.dryEye && (
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Khô mắt">
              <div>
                OSDI-6: {m.dryEye.osdiScore}/{m.dryEye.osdiMax} (
                {m.dryEye.osdiSeverity})
              </div>
              <OdOsRow eye="OD">
                TBUT {m.dryEye.od.tbut} · Schirmer {m.dryEye.od.schirmer} ·
                Meibomian: {m.dryEye.od.meibomian}
              </OdOsRow>
              <OdOsRow eye="OS">
                TBUT {m.dryEye.os.tbut} · Schirmer {m.dryEye.os.schirmer} ·
                Meibomian: {m.dryEye.os.meibomian}
              </OdOsRow>
            </MeasurementBlock>

            {(m.slitLamp || m.fundus) && (
              <MeasurementBlock label="Khám lâm sàng">
                {m.slitLamp && <div>Slit-lamp: {m.slitLamp}</div>}
                {m.fundus && <div>Fundus: {m.fundus}</div>}
              </MeasurementBlock>
            )}
          </div>
        )}

        {!m.dryEye && (m.slitLamp || m.fundus) && (
          <div className="grid gap-2.5 md:grid-cols-2">
            <MeasurementBlock label="Khám lâm sàng">
              {m.slitLamp && <div>Slit-lamp: {m.slitLamp}</div>}
              {m.fundus && <div>Fundus: {m.fundus}</div>}
            </MeasurementBlock>
            <div /> {/* empty grid cell */}
          </div>
        )}

        <div className="grid gap-2.5 md:grid-cols-2">
          <MeasurementBlock label="Đơn thuốc">
            {visit.medications.length > 0 ? (
              visit.medications.map((med, i) => (
                <div key={i}>
                  {med.name} — {med.dosage} {med.frequency} — {med.eye} —{" "}
                  {med.duration}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground">Không có đơn thuốc</div>
            )}
          </MeasurementBlock>

          <MeasurementBlock label="Dặn dò & tái khám">
            {visit.instructions && <div>{visit.instructions}</div>}
            {visit.followUp && (
              <div
                className={cn(
                  "font-medium",
                  visit.followUpOverdue && "text-[#A32D2D]"
                )}
              >
                Tái khám: {visit.followUp}
                {visit.followUpOverdue && " (quá hạn)"}
              </div>
            )}
            {!visit.instructions && !visit.followUp && (
              <div className="text-muted-foreground">Không có</div>
            )}
          </MeasurementBlock>
        </div>
      </div>
    </div>
  )
}
