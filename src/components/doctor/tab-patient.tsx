import { Button } from "@/components/ui/button"
import type { Patient, Visit, PreviousVisit } from "@/data/mock-patients"

interface TabPatientProps {
  patient: Patient
  visit: Visit
}

function parseVietnameseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/").map(Number)
  return new Date(year, month - 1, day)
}

function daysAgo(dateStr: string): string {
  const date = parseVietnameseDate(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return "Hôm nay"
  if (diffDays === 1) return "1 ngày trước"
  return `${diffDays} ngày trước`
}

function AdminInfoSection({ patient }: { patient: Patient }) {
  const age = new Date().getFullYear() - patient.birthYear

  const rows: { label: string; value: string | undefined }[] = [
    { label: "Họ tên", value: patient.name },
    {
      label: "Ngày sinh",
      value: patient.dob ? `${patient.dob} (${age} tuổi)` : undefined,
    },
    { label: "Giới tính", value: patient.gender },
    { label: "CCCD", value: patient.cccd },
    { label: "Điện thoại", value: patient.phone },
    { label: "Email", value: patient.email },
    { label: "Địa chỉ", value: patient.address },
    { label: "Nghề nghiệp", value: patient.occupation },
  ]

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-medium">Thông tin hành chính</h2>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
          Chỉnh sửa
        </Button>
      </div>
      <div className="rounded-lg border border-border bg-card px-5 py-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex gap-3">
              <span className="w-24 shrink-0 text-sm text-muted-foreground">
                {label}
              </span>
              <span className="text-sm">{value ?? "—"}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function DiagnosisBadge({ isPrimary }: { isPrimary: boolean }) {
  if (isPrimary) {
    return (
      <span
        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold"
        style={{ backgroundColor: "#E6F1FB", color: "#0C447C" }}
      >
        Chính
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
      Phụ
    </span>
  )
}

function FullVisitCard({ pv }: { pv: PreviousVisit }) {
  const primaryDx = pv.diagnoses.find((d) => d.isPrimary)
  const secondaryDxs = pv.diagnoses.filter((d) => !d.isPrimary)

  return (
    <div className="rounded-lg border border-border bg-background">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{pv.date}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{pv.doctorName}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">
            {daysAgo(pv.date)}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          Xem chi tiết
        </Button>
      </div>

      <div className="p-3">
        {/* 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Chẩn đoán */}
          <div className="rounded-md bg-muted/40 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Chẩn đoán
            </div>
            <div className="flex flex-col gap-1">
              {primaryDx && (
                <div className="flex items-start gap-1.5">
                  <DiagnosisBadge isPrimary={true} />
                  <span className="text-xs leading-snug">
                    {primaryDx.text}
                    {primaryDx.icd10Code && (
                      <span className="ml-1 text-muted-foreground">
                        ({primaryDx.icd10Code})
                      </span>
                    )}
                  </span>
                </div>
              )}
              {secondaryDxs.map((dx, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <DiagnosisBadge isPrimary={false} />
                  <span className="text-xs leading-snug">
                    {dx.text}
                    {dx.icd10Code && (
                      <span className="ml-1 text-muted-foreground">
                        ({dx.icd10Code})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Thuốc đã kê */}
          <div className="rounded-md bg-muted/40 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Thuốc đã kê
            </div>
            {pv.medications.length > 0 ? (
              <div className="flex flex-col gap-1">
                {pv.medications.map((med, i) => (
                  <div key={i} className="text-xs leading-snug">
                    <span className="font-medium">{med.name}</span>
                    {(med.frequency || med.eye) && (
                      <span className="text-muted-foreground">
                        {med.frequency ? ` · ${med.frequency}` : ""}
                        {med.eye ? ` · ${med.eye}` : ""}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )}
          </div>

          {/* Thị lực */}
          <div className="rounded-md bg-muted/40 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Thị lực
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground"></th>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground">
                    SC
                  </th>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground">
                    CC
                  </th>
                  <th className="pb-0.5 text-left font-normal text-muted-foreground">
                    IOP
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-2 font-medium text-muted-foreground">OD</td>
                  <td className="pr-2 tabular-nums">{pv.va.scOd || "—"}</td>
                  <td className="pr-2 tabular-nums">{pv.va.ccOd || "—"}</td>
                  <td className="tabular-nums">{pv.va.iopOd || "—"}</td>
                </tr>
                <tr>
                  <td className="pr-2 font-medium text-muted-foreground">OS</td>
                  <td className="pr-2 tabular-nums">{pv.va.scOs || "—"}</td>
                  <td className="pr-2 tabular-nums">{pv.va.ccOs || "—"}</td>
                  <td className="tabular-nums">{pv.va.iopOs || "—"}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Khúc xạ */}
          <div className="rounded-md bg-muted/40 p-2.5">
            <div className="mb-1.5 text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Khúc xạ
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground"></th>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground">
                    Sph
                  </th>
                  <th className="pr-2 pb-0.5 text-left font-normal text-muted-foreground">
                    Cyl
                  </th>
                  <th className="pb-0.5 text-left font-normal text-muted-foreground">
                    Axis
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pr-2 font-medium text-muted-foreground">OD</td>
                  <td className="pr-2 tabular-nums">
                    {pv.refraction.sphOd || "—"}
                  </td>
                  <td className="pr-2 tabular-nums">
                    {pv.refraction.cylOd || "—"}
                  </td>
                  <td className="tabular-nums">
                    {pv.refraction.axisOd || "—"}
                  </td>
                </tr>
                <tr>
                  <td className="pr-2 font-medium text-muted-foreground">OS</td>
                  <td className="pr-2 tabular-nums">
                    {pv.refraction.sphOs || "—"}
                  </td>
                  <td className="pr-2 tabular-nums">
                    {pv.refraction.cylOs || "—"}
                  </td>
                  <td className="tabular-nums">
                    {pv.refraction.axisOs || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dặn dò */}
        {pv.instructions && (
          <div className="mt-3 rounded-md bg-muted/50 px-3 py-2">
            <span className="text-[10px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
              Dặn dò
            </span>
            <p className="mt-1 text-xs text-muted-foreground">
              {pv.instructions}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function CollapsedVisitCard({ pv }: { pv: PreviousVisit }) {
  const primaryDx = pv.diagnoses.find((d) => d.isPrimary)

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{pv.date}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{pv.doctorName}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {daysAgo(pv.date)}
        </span>
      </div>
      <div className="flex items-center gap-3 border-t border-border/50 px-3 py-2">
        {primaryDx && (
          <div className="flex min-w-0 flex-1 items-start gap-1.5">
            <DiagnosisBadge isPrimary={true} />
            <span className="truncate text-xs">
              {primaryDx.text}
              {primaryDx.icd10Code && (
                <span className="ml-1 text-muted-foreground">
                  ({primaryDx.icd10Code})
                </span>
              )}
            </span>
          </div>
        )}
        <div className="shrink-0 text-xs text-muted-foreground">
          SC: {pv.va.scOd || "—"} / {pv.va.scOs || "—"}
        </div>
      </div>
    </div>
  )
}

function InfoCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="mb-3.5 text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase">
        {title}
      </div>
      {children}
    </div>
  )
}

function RedPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: "#FCEBEB", color: "#791F1F" }}
    >
      {children}
    </span>
  )
}

function MedicalHistorySection({ patient }: { patient: Patient }) {
  const hasHistory =
    !!patient.eyeHistory ||
    !!patient.systemicHistory ||
    !!patient.allergies ||
    !!patient.currentMedications ||
    !!patient.familyHistory

  return (
    <section>
      <InfoCard title="Tiền sử">
        {!hasHistory ? (
          <p className="text-sm text-muted-foreground">Không có tiền sử</p>
        ) : (
          <div className="space-y-4">
            {patient.eyeHistory && (
              <div>
                <div className="mb-1 text-sm font-medium">Bệnh mắt</div>
                <div className="text-sm">{patient.eyeHistory}</div>
              </div>
            )}
            {patient.systemicHistory && (
              <div>
                <div className="mb-1 text-sm font-medium">Toàn thân</div>
                <div className="text-sm">{patient.systemicHistory}</div>
              </div>
            )}
            {patient.allergies && (
              <div>
                <div className="mb-1.5 text-sm font-medium">Dị ứng</div>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.split(",").map((a) => (
                    <RedPill key={a.trim()}>{a.trim()}</RedPill>
                  ))}
                </div>
              </div>
            )}
            {patient.currentMedications && (
              <div>
                <div className="mb-1 text-sm font-medium">Thuốc đang dùng</div>
                <div className="text-sm">{patient.currentMedications}</div>
              </div>
            )}
            {patient.familyHistory && (
              <div>
                <div className="mb-1 text-sm font-medium">Gia đình</div>
                <div className="text-sm">{patient.familyHistory}</div>
              </div>
            )}
          </div>
        )}
      </InfoCard>
    </section>
  )
}

function NotesSection({ notes }: { notes: string }) {
  return (
    <section>
      <InfoCard title="Ghi chú">
        <p className="text-sm">{notes}</p>
      </InfoCard>
    </section>
  )
}

function VisitHistorySection({ visit }: { visit: Visit }) {
  const previousVisits = visit.previousVisits
  if (!previousVisits || previousVisits.length === 0) return null

  const MAX_SHOWN = 3
  const shown = previousVisits.slice(0, MAX_SHOWN)
  const hasMore = previousVisits.length > MAX_SHOWN

  return (
    <section>
      <div className="mb-3">
        <h2 className="text-base font-medium">Lần khám gần nhất</h2>
      </div>
      <div className="flex flex-col gap-3">
        {shown.map((pv, i) =>
          i === 0 ? (
            <FullVisitCard key={i} pv={pv} />
          ) : (
            <CollapsedVisitCard key={i} pv={pv} />
          )
        )}
      </div>
      {hasMore && (
        <div className="mt-3 flex justify-center">
          <Button variant="ghost" size="sm" className="h-7 text-xs">
            Xem toàn bộ lịch sử khám
          </Button>
        </div>
      )}
    </section>
  )
}

export function TabPatient({ patient, visit }: TabPatientProps) {
  return (
    <div className="flex flex-col gap-8">
      <AdminInfoSection patient={patient} />
      <MedicalHistorySection patient={patient} />
      {visit.screeningData?.notes && (
        <NotesSection notes={visit.screeningData.notes} />
      )}
      <VisitHistorySection visit={visit} />
    </div>
  )
}
