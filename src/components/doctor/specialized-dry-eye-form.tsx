import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { DryEyeFormData } from "@/data/mock-patients"
import { OsdiModal } from "./osdi-modal"
import { getOsdiSeverity } from "@/lib/osdi-utils"
import { cn } from "@/lib/utils"

interface SpecializedDryEyeFormProps {
  data: DryEyeFormData
  onUpdate: (data: DryEyeFormData) => void
}

export function SpecializedDryEyeForm({
  data,
  onUpdate,
}: SpecializedDryEyeFormProps) {
  const [osdiOpen, setOsdiOpen] = useState(false)

  function updateField<K extends keyof DryEyeFormData>(
    field: K,
    value: DryEyeFormData[K]
  ) {
    onUpdate({ ...data, [field]: value })
  }

  function handleOsdiSubmit(answers: (number | null)[], score: number) {
    const severity = getOsdiSeverity(score)
    onUpdate({
      ...data,
      osdiAnswers: answers,
      osdiScore: score,
      osdiSeverity: severity.key,
    })
  }

  const hasOsdiScore = data.osdiScore !== null

  return (
    <div className="space-y-4">
      {/* OSDI-6 Score */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          OSDI-6 Score
        </Label>
        <div className="flex items-center gap-3">
          {hasOsdiScore ? (
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-4 py-2.5">
              <span className="text-xl font-bold">{data.osdiScore}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  getOsdiSeverity(data.osdiScore!).className
                )}
              >
                {getOsdiSeverity(data.osdiScore!).label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                6/6 câu đã trả lời
              </span>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
              Chưa đánh giá
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOsdiOpen(true)}
            className={cn(
              hasOsdiScore
                ? "text-muted-foreground"
                : "border-primary text-primary"
            )}
          >
            {hasOsdiScore ? "Làm lại" : "Làm bảng hỏi OSDI"}
          </Button>
        </div>
      </div>

      {/* TBUT */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          TBUT (giây)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOd}
              onChange={(e) => updateField("tbutOd", e.target.value)}
              placeholder="VD: 5"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOs}
              onChange={(e) => updateField("tbutOs", e.target.value)}
              placeholder="VD: 5"
            />
          </div>
        </div>
      </div>

      {/* Schirmer */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          Schirmer (mm)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOd}
              onChange={(e) => updateField("schirmerOd", e.target.value)}
              placeholder="VD: 10"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOs}
              onChange={(e) => updateField("schirmerOs", e.target.value)}
              placeholder="VD: 10"
            />
          </div>
        </div>
      </div>

      {/* Meibomian */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">Meibomian</Label>
        <Textarea
          value={data.meibomian}
          onChange={(e) => updateField("meibomian", e.target.value)}
          placeholder="Mô tả tình trạng tuyến Meibomian..."
          rows={2}
        />
      </div>

      {/* Staining */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">Staining</Label>
        <Textarea
          value={data.staining}
          onChange={(e) => updateField("staining", e.target.value)}
          placeholder="Mô tả kết quả nhuộm..."
          rows={2}
        />
      </div>

      <OsdiModal
        open={osdiOpen}
        onOpenChange={setOsdiOpen}
        initialAnswers={data.osdiAnswers}
        onSubmit={handleOsdiSubmit}
      />
    </div>
  )
}
