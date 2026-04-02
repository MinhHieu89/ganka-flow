import { Textarea } from "@/components/ui/textarea"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningFormNotesProps {
  form: ScreeningFormData
  onUpdate: <K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) => void
}

export function ScreeningFormNotes({
  form,
  onUpdate,
}: ScreeningFormNotesProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <h2 className="text-lg font-bold">Ghi chú</h2>
      </div>
      <div className="mb-5 border-t border-border" />

      <Textarea
        value={form.notes}
        onChange={(e) => onUpdate("notes", e.target.value)}
        placeholder="Ghi chú thêm nếu cần..."
        rows={3}
      />
    </section>
  )
}
