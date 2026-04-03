import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Visit, DryEyeFormData } from "@/data/mock-patients"

interface ScreeningDataProps {
  visit: Visit
  onUpdateScreeningData?: (data: DryEyeFormData) => void
}

export function ScreeningData({ visit }: ScreeningDataProps) {
  const [isEditing, setIsEditing] = useState(false)
  const step2 = visit.screeningData?.step2
  const groups = step2?.selectedGroups ?? []

  if (groups.length === 0) return null

  const isDryEye = groups.includes("dryEye")
  const isRefraction = groups.includes("refraction")
  const isMyopia = groups.includes("myopiaControl")
  const isGeneral = groups.includes("general")

  return (
    <div className="rounded-lg bg-muted/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">Dữ liệu sàng lọc</div>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Xong" : "Chỉnh sửa"}
        </Button>
      </div>

      {isDryEye && (
        <DryEyeScreeningBlock data={step2!.dryEye} isEditing={isEditing} />
      )}

      {isRefraction && (
        <RefractionScreeningBlock
          screening={visit.screeningData!}
          isEditing={isEditing}
        />
      )}

      {(isMyopia || isGeneral) && (
        <GeneralScreeningBlock
          screening={visit.screeningData!}
          isEditing={isEditing}
        />
      )}
    </div>
  )
}

function DryEyeScreeningBlock({
  data,
  isEditing,
}: {
  data: DryEyeFormData
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="OSDI-6"
        value={
          data.osdiScore !== null
            ? `${data.osdiScore} (${data.osdiSeverity})`
            : "—"
        }
        isEditing={isEditing}
      />
      <div />
      <Field
        label="TBUT OD"
        value={data.tbutOd ? `${data.tbutOd}s` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="TBUT OS"
        value={data.tbutOs ? `${data.tbutOs}s` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Schirmer OD"
        value={data.schirmerOd ? `${data.schirmerOd}mm` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Schirmer OS"
        value={data.schirmerOs ? `${data.schirmerOs}mm` : "—"}
        isEditing={isEditing}
      />
      <Field
        label="Meibomian"
        value={data.meibomian || "—"}
        isEditing={isEditing}
      />
      <Field
        label="Staining"
        value={data.staining || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function RefractionScreeningBlock({
  screening,
  isEditing,
}: {
  screening: { currentRxOd: string; currentRxOs: string }
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="Kính hiện tại OD"
        value={screening.currentRxOd || "—"}
        isEditing={isEditing}
      />
      <Field
        label="Kính hiện tại OS"
        value={screening.currentRxOs || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function GeneralScreeningBlock({
  screening,
  isEditing,
}: {
  screening: { ucvaOd: string; ucvaOs: string }
  isEditing: boolean
}) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      <Field
        label="UCVA OD"
        value={screening.ucvaOd || "—"}
        isEditing={isEditing}
      />
      <Field
        label="UCVA OS"
        value={screening.ucvaOs || "—"}
        isEditing={isEditing}
      />
    </div>
  )
}

function Field({
  label,
  value,
  isEditing,
}: {
  label: string
  value: string
  isEditing: boolean
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      {isEditing ? (
        <Input
          className="mt-1 h-8 text-sm"
          defaultValue={value === "—" ? "" : value}
        />
      ) : (
        <div className="mt-0.5 text-sm font-medium">{value}</div>
      )}
    </div>
  )
}
