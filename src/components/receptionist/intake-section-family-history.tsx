import { Input } from "@/components/ui/input"
import { useMasterDataOptions } from "@/hooks/use-master-data-options"
import type { IntakeFormData } from "@/components/screening/screening-intake-form-editable"
import type { FamilyHistoryEntry } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

function FamilyHistoryGrid({
  title,
  items,
  values,
  onChange,
}: {
  title: string
  items: { key: string; label: string }[]
  values: Record<string, FamilyHistoryEntry>
  onChange: (key: string, entry: FamilyHistoryEntry) => void
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {items.map((item) => {
          const entry = values[item.key] ?? { has: false }
          return (
            <div key={item.key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={entry.has}
                  onChange={(e) =>
                    onChange(item.key, {
                      has: e.target.checked,
                      who: e.target.checked ? entry.who : undefined,
                    })
                  }
                  className="size-4 accent-[var(--color-primary)]"
                />
                {item.label}
              </label>
              {entry.has && (
                <Input
                  value={entry.who ?? ""}
                  onChange={(e) =>
                    onChange(item.key, { has: true, who: e.target.value })
                  }
                  placeholder="Ai bị? (VD: Bố, Mẹ...)"
                  className="ml-6 h-8"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function IntakeSectionFamilyHistory({ data, onChange }: Props) {
  const familyEyeConditions = useMasterDataOptions("family_eye_conditions")
  const familyMedicalConditions = useMasterDataOptions(
    "family_medical_conditions"
  )

  const familyEye = data.familyEyeHistory ?? {}
  const familyMedical = data.familyMedicalHistory ?? {}

  function updateEyeEntry(key: string, entry: FamilyHistoryEntry) {
    onChange("familyEyeHistory", { ...familyEye, [key]: entry })
  }

  function updateMedicalEntry(key: string, entry: FamilyHistoryEntry) {
    onChange("familyMedicalHistory", { ...familyMedical, [key]: entry })
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">
        Có ai trong gia đình (bố mẹ, ông bà, anh chị em ruột) bị các bệnh sau
        không?
      </p>

      <FamilyHistoryGrid
        title="Bệnh mắt"
        items={familyEyeConditions}
        values={familyEye}
        onChange={updateEyeEntry}
      />

      <FamilyHistoryGrid
        title="Bệnh toàn thân"
        items={familyMedicalConditions}
        values={familyMedical}
        onChange={updateMedicalEntry}
      />

      {/* Other */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.familyHistoryOther?.has ?? false}
            onChange={(e) =>
              onChange("familyHistoryOther", {
                has: e.target.checked,
                detail: e.target.checked
                  ? data.familyHistoryOther?.detail
                  : undefined,
                who: e.target.checked
                  ? data.familyHistoryOther?.who
                  : undefined,
              })
            }
            className="size-4 accent-[var(--color-primary)]"
          />
          Bệnh khác
        </label>
        {data.familyHistoryOther?.has && (
          <div className="ml-6 flex gap-2">
            <Input
              value={data.familyHistoryOther?.detail ?? ""}
              onChange={(e) =>
                onChange("familyHistoryOther", {
                  ...data.familyHistoryOther,
                  has: true,
                  detail: e.target.value,
                })
              }
              placeholder="Tên bệnh"
              className="h-8"
            />
            <Input
              value={data.familyHistoryOther?.who ?? ""}
              onChange={(e) =>
                onChange("familyHistoryOther", {
                  ...data.familyHistoryOther,
                  has: true,
                  who: e.target.value,
                })
              }
              placeholder="Ai bị?"
              className="h-8"
            />
          </div>
        )}
      </div>
    </div>
  )
}
