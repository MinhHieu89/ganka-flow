import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible"
import { RefractionTable } from "./screening-refraction-table"
import type { RefractionEyeRowWithAdd, SubjectiveEyeRow } from "@/data/mock-patients"

interface GlassesRxData {
  od: RefractionEyeRowWithAdd
  os: RefractionEyeRowWithAdd
  pd: string
  lensType: string
  purpose: string
  notes: string
}

interface ScreeningGlassesRxSectionProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  data: GlassesRxData
  onDataChange: (data: GlassesRxData) => void
  subjectiveOd: SubjectiveEyeRow
  subjectiveOs: SubjectiveEyeRow
}

export function ScreeningGlassesRxSection({
  enabled,
  onEnabledChange,
  data,
  onDataChange,
  subjectiveOd,
  subjectiveOs,
}: ScreeningGlassesRxSectionProps) {
  function handleToggle(checked: boolean) {
    if (checked) {
      // Pre-fill from subjective refraction (snapshot)
      onDataChange({
        ...data,
        od: {
          sph: subjectiveOd.sph,
          cyl: subjectiveOd.cyl,
          axis: subjectiveOd.axis,
          va: subjectiveOd.va,
          add: subjectiveOd.add,
        },
        os: {
          sph: subjectiveOs.sph,
          cyl: subjectiveOs.cyl,
          axis: subjectiveOs.axis,
          va: subjectiveOs.va,
          add: subjectiveOs.add,
        },
      })
    }
    onEnabledChange(checked)
  }

  function updateField<K extends keyof GlassesRxData>(
    field: K,
    value: GlassesRxData[K]
  ) {
    onDataChange({ ...data, [field]: value })
  }

  return (
    <Collapsible open={enabled} onOpenChange={handleToggle}>
      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            aria-label="Bật đơn kính"
          />
          <span className="text-sm text-muted-foreground">Đơn kính</span>
          {!enabled && (
            <span className="text-xs text-muted-foreground/60">
              Kê đơn kính từ kết quả khúc xạ
            </span>
          )}
        </div>
        <CollapsibleContent>
          <div className="space-y-3 border-t border-border px-3.5 py-3">
            <RefractionTable
              odData={data.od}
              osData={data.os}
              columns={["sph", "cyl", "axis", "va", "add"]}
              onOdChange={(field, value) =>
                updateField("od", { ...data.od, [field]: value })
              }
              onOsChange={(field, value) =>
                updateField("os", { ...data.os, [field]: value })
              }
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1 block text-xs">PD</Label>
                <Input
                  value={data.pd}
                  onChange={(e) => updateField("pd", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: 63"
                  aria-label="PD"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Loại kính</Label>
                <Input
                  value={data.lensType}
                  onChange={(e) => updateField("lensType", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: Đơn tròng"
                  aria-label="Loại kính"
                />
              </div>
              <div>
                <Label className="mb-1 block text-xs">Mục đích</Label>
                <Input
                  value={data.purpose}
                  onChange={(e) => updateField("purpose", e.target.value)}
                  className="h-8 text-xs"
                  placeholder="VD: Nhìn xa"
                  aria-label="Mục đích"
                />
              </div>
            </div>
            <div>
              <Label className="mb-1 block text-xs">Ghi chú đơn kính</Label>
              <Textarea
                value={data.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="text-xs"
                placeholder="Ghi chú thêm..."
                rows={2}
              />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
