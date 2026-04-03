import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MeasurementBlock, OdOsRow } from "./measurement-block"
import { DISEASE_GROUP_CONFIG } from "@/data/mock-patient-detail"
import type { VisitRecord } from "@/data/mock-patient-detail"

interface VisitDetailPanelProps {
  visit: VisitRecord
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
      {children}
    </div>
  )
}

function KvRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex text-[13px]">
      <span className="w-[140px] shrink-0 text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  )
}

function EyeExamCard({
  title,
  od,
  os,
  fields,
}: {
  title: string
  od: Record<string, string>
  os: Record<string, string>
  fields: { key: string; label: string }[]
}) {
  return (
    <div className="rounded-xl border border-border px-5 py-4">
      <SectionHeader>{title}</SectionHeader>
      <div className="grid grid-cols-2 gap-4">
        {/* OD column */}
        <div>
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
          <div className="space-y-1.5">
            {fields.map((f) => (
              <div key={f.key}>
                <div className="text-[11px] text-muted-foreground">
                  {f.label}
                </div>
                <div className="text-[13px]">
                  {od[f.key]}
                </div>
              </div>
            ))}
          </div>
          {od.notes && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {od.notes}
            </div>
          )}
        </div>
        {/* OS column */}
        <div>
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
          <div className="space-y-1.5">
            {fields.map((f) => (
              <div key={f.key}>
                <div className="text-[11px] text-muted-foreground">
                  {f.label}
                </div>
                <div className="text-[13px]">
                  {os[f.key]}
                </div>
              </div>
            ))}
          </div>
          {os.notes && (
            <div className="mt-2 text-xs text-muted-foreground italic">
              {os.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  const groupConfig = DISEASE_GROUP_CONFIG[visit.diseaseGroup]
  const s = visit.screening
  const hasRedFlags =
    s.redFlags.eyePain || s.redFlags.suddenVisionLoss || s.redFlags.asymmetry

  return (
    <div className="flex-1 overflow-y-auto py-4 pl-5">
      {/* 1. Header */}
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

      {/* 2. Diagnosis pills */}
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
        {visit.diagnosisNotes && (
          <div className="mt-1 w-full text-xs text-muted-foreground">
            {visit.diagnosisNotes}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* 3. Screening card */}
        <div className="rounded-xl border border-border px-5 py-4">
          <SectionHeader>Lý do khám &amp; sàng lọc</SectionHeader>
          <div className="space-y-1.5">
            <KvRow label="Lý do đến khám" value={s.chiefComplaint} />
            <KvRow
              label="Thị lực cơ bản"
              value={`OD ${s.ucva.od} · OS ${s.ucva.os}`}
            />
            {s.currentRx && (
              <KvRow
                label="Kính hiện tại"
                value={`OD ${s.currentRx.od} · OS ${s.currentRx.os}`}
              />
            )}
            <div className="flex text-[13px]">
              <span className="w-[140px] shrink-0 text-muted-foreground">
                Red flag
              </span>
              {hasRedFlags ? (
                <span className="font-medium text-[#A32D2D]">
                  {[
                    s.redFlags.eyePain && "Đau mắt",
                    s.redFlags.suddenVisionLoss && "Mất thị lực đột ngột",
                    s.redFlags.asymmetry && "Bất đối xứng",
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-emerald-600">Không có Red Flag</span>
              )}
            </div>
          </div>

          {/* Screening questions */}
          {(s.symptoms.length > 0 ||
            s.blinkImprovement ||
            s.symptomDuration ||
            s.screenTime ||
            s.contactLens ||
            s.discomfortLevel) && (
            <>
              <div className="my-3 border-t border-border" />
              <SectionHeader>Câu hỏi định hướng</SectionHeader>

              {s.symptoms.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {s.symptoms.map((sym) => (
                    <span
                      key={sym}
                      className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {s.blinkImprovement && (
                  <KvRow
                    label="Chớp mắt cải thiện"
                    value={s.blinkImprovement}
                  />
                )}
                {s.screenTime && (
                  <KvRow label="Screen time" value={s.screenTime} />
                )}
                {s.symptomDuration && (
                  <KvRow label="Thời gian t/c" value={s.symptomDuration} />
                )}
                {s.contactLens && (
                  <KvRow label="Kính áp tròng" value={s.contactLens} />
                )}
                {s.discomfortLevel && (
                  <KvRow label="Mức độ khó chịu" value={s.discomfortLevel} />
                )}
              </div>
            </>
          )}
        </div>

        {/* 4. VA & IOP */}
        <MeasurementBlock label="Thị lực & nhãn áp">
          <OdOsRow eye="OD">
            SC {visit.va.od.sc} · CC {visit.va.od.cc}
            {visit.va.od.ph && ` · PH ${visit.va.od.ph}`} · IOP{" "}
            {visit.va.od.iop}
          </OdOsRow>
          <OdOsRow eye="OS">
            SC {visit.va.os.sc} · CC {visit.va.os.cc}
            {visit.va.os.ph && ` · PH ${visit.va.os.ph}`} · IOP{" "}
            {visit.va.os.iop}
          </OdOsRow>
        </MeasurementBlock>

        {/* 5. Refraction */}
        <MeasurementBlock label="Khúc xạ">
          <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Auto-Ref
          </div>
          <OdOsRow eye="OD">
            {visit.refraction.auto.od.sph} / {visit.refraction.auto.od.cyl} x{" "}
            {visit.refraction.auto.od.axis}°
          </OdOsRow>
          <OdOsRow eye="OS">
            {visit.refraction.auto.os.sph} / {visit.refraction.auto.os.cyl} x{" "}
            {visit.refraction.auto.os.axis}°
          </OdOsRow>
          {visit.refraction.subjective && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="mb-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Chủ quan
              </div>
              <OdOsRow eye="OD">
                {visit.refraction.subjective.od.sph} /{" "}
                {visit.refraction.subjective.od.cyl} x{" "}
                {visit.refraction.subjective.od.axis}° · BCVA{" "}
                {visit.refraction.subjective.od.bcva}
                {visit.refraction.subjective.od.add &&
                  ` · Add ${visit.refraction.subjective.od.add}`}
              </OdOsRow>
              <OdOsRow eye="OS">
                {visit.refraction.subjective.os.sph} /{" "}
                {visit.refraction.subjective.os.cyl} x{" "}
                {visit.refraction.subjective.os.axis}° · BCVA{" "}
                {visit.refraction.subjective.os.bcva}
                {visit.refraction.subjective.os.add &&
                  ` · Add ${visit.refraction.subjective.os.add}`}
              </OdOsRow>
              {visit.refraction.subjective.od.pd && (
                <div className="mt-1 text-xs text-muted-foreground">
                  PD: {visit.refraction.subjective.od.pd} /{" "}
                  {visit.refraction.subjective.os.pd} mm
                </div>
              )}
            </>
          )}
        </MeasurementBlock>

        {/* 6. Dry Eye (conditional) */}
        {visit.dryEye && (
          <MeasurementBlock label="Khô mắt (Dry Eye)">
            <div>
              <b className="font-medium">OSDI-6:</b> {visit.dryEye.osdiScore}/
              {visit.dryEye.osdiMax}{" "}
              <span className="rounded bg-[#FAEEDA] px-1.5 py-px text-[10px] font-medium text-[#633806]">
                {visit.dryEye.osdiSeverity}
              </span>
            </div>
            <OdOsRow eye="OD">
              TBUT {visit.dryEye.od.tbut} · Schirmer{" "}
              {visit.dryEye.od.schirmer} · Meibomian:{" "}
              {visit.dryEye.od.meibomian}
            </OdOsRow>
            <OdOsRow eye="OS">
              TBUT {visit.dryEye.os.tbut} · Schirmer{" "}
              {visit.dryEye.os.schirmer} · Meibomian:{" "}
              {visit.dryEye.os.meibomian}
            </OdOsRow>
            {visit.dryEye.staining && (
              <div className="mt-1 text-xs text-muted-foreground">
                Nhuộm: {visit.dryEye.staining}
              </div>
            )}
          </MeasurementBlock>
        )}

        {/* 7. Slit-Lamp (conditional) */}
        {visit.slitLamp && (
          <EyeExamCard
            title="Sinh hiển vi (Slit-Lamp)"
            od={visit.slitLamp.od as unknown as Record<string, string>}
            os={visit.slitLamp.os as unknown as Record<string, string>}
            fields={[
              { key: "lids", label: "Mi mắt" },
              { key: "conjunctiva", label: "Kết mạc" },
              { key: "cornea", label: "Giác mạc" },
              { key: "anteriorChamber", label: "Tiền phòng" },
              { key: "iris", label: "Mống mắt" },
              { key: "lens", label: "Thể thủy tinh" },
            ]}
          />
        )}

        {/* 8. Fundus (conditional) */}
        {visit.fundus && (
          <EyeExamCard
            title="Đáy mắt (Fundus)"
            od={visit.fundus.od as unknown as Record<string, string>}
            os={visit.fundus.os as unknown as Record<string, string>}
            fields={[
              { key: "opticDisc", label: "Đĩa thị" },
              { key: "cdRatio", label: "C/D" },
              { key: "macula", label: "Hoàng điểm" },
              { key: "vessels", label: "Mạch máu" },
              { key: "peripheralRetina", label: "Võng mạc ngoại vi" },
            ]}
          />
        )}

        {/* 9. Requests (conditional) */}
        {visit.requests.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Kết quả cận lâm sàng</SectionHeader>
            {visit.requests.map((req, i) => (
              <div
                key={i}
                className={cn(
                  "py-2",
                  i < visit.requests.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="font-medium">{req.type}</span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-px text-[10px] font-medium",
                      req.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {req.status === "completed"
                      ? "Hoàn thành"
                      : req.status === "cancelled"
                        ? "Đã hủy"
                        : "Đang chờ"}
                  </span>
                </div>
                {req.result && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {req.result}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 10. Medications (conditional) */}
        {visit.medications.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Đơn thuốc</SectionHeader>
            {visit.medications.map((med, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-wrap items-start justify-between py-2.5",
                  i < visit.medications.length - 1 &&
                    "border-b border-border"
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
                    {med.duration}
                  </div>
                </div>
                {med.notes && (
                  <div className="mt-1 w-full text-xs text-muted-foreground">
                    {med.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 11. Optical Rx (conditional) */}
        {visit.opticalRx && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Đơn kính</SectionHeader>
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
                    <div className="text-[11px] text-muted-foreground">
                      Sph
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Cyl
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.od.axis}
                    </div>
                  </div>
                </div>
                {visit.opticalRx.od.add && (
                  <div className="mt-1.5 text-center text-xs text-muted-foreground">
                    Add: {visit.opticalRx.od.add}
                  </div>
                )}
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
                    <div className="text-[11px] text-muted-foreground">
                      Sph
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.sph}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Cyl
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.cyl}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground">
                      Axis
                    </div>
                    <div className="text-[15px] font-medium">
                      {visit.opticalRx.os.axis}
                    </div>
                  </div>
                </div>
                {visit.opticalRx.os.add && (
                  <div className="mt-1.5 text-center text-xs text-muted-foreground">
                    Add: {visit.opticalRx.os.add}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3.5 flex gap-5 border-t border-border pt-3.5 text-[13px]">
              <span>
                <span className="text-muted-foreground">PD </span>
                {visit.opticalRx.pd} mm
              </span>
              <span>
                <span className="text-muted-foreground">Loại </span>
                {visit.opticalRx.lensType}
              </span>
            </div>
          </div>
        )}

        {/* 12. Procedures (conditional) */}
        {visit.procedures.length > 0 && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Thủ thuật</SectionHeader>
            {visit.procedures.map((proc, i) => (
              <div
                key={i}
                className={cn(
                  "py-2",
                  i < visit.procedures.length - 1 &&
                    "border-b border-border"
                )}
              >
                <div className="text-[13px] font-medium">{proc.name}</div>
                {proc.notes && (
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {proc.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 13. Instructions & Follow-up */}
        {(visit.instructions || visit.followUp) && (
          <div className="rounded-xl border border-border px-5 py-4">
            <SectionHeader>Dặn dò &amp; tái khám</SectionHeader>
            {visit.instructions && (
              <div className="text-[13px]">{visit.instructions}</div>
            )}
            {visit.followUp && (
              <div
                className={cn(
                  "mt-1.5 text-[13px]",
                  visit.followUpOverdue && "font-medium text-[#A32D2D]"
                )}
              >
                Tái khám: {visit.followUp.date} ({visit.followUp.interval})
                {visit.followUpOverdue && " — quá hạn"}
              </div>
            )}
            {visit.followUp?.instructions && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {visit.followUp.instructions}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
