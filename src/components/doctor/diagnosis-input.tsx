import { useState, useRef, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { diagnosisCatalog } from "@/data/diagnoses"
import type { Diagnosis } from "@/data/mock-patients"

interface DiagnosisInputProps {
  diagnoses: Diagnosis[]
  onChange: (diagnoses: Diagnosis[]) => void
}

export function DiagnosisInput({ diagnoses, onChange }: DiagnosisInputProps) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const results = useMemo(() => {
    if (query.length < 2) return []
    const q = query.toLowerCase()
    return diagnosisCatalog.filter(
      (d) =>
        d.nameVi.toLowerCase().includes(q) ||
        d.nameEn.toLowerCase().includes(q) ||
        d.icd10.toLowerCase().includes(q)
    )
  }, [query])

  function addFromCatalog(entry: {
    nameVi: string
    nameEn: string
    icd10: string
  }) {
    const isPrimary = diagnoses.length === 0
    onChange([
      ...diagnoses,
      { text: entry.nameVi, icd10Code: entry.icd10, isPrimary },
    ])
    setQuery("")
    setShowDropdown(false)
  }

  function addFreeText() {
    if (!query.trim()) return
    const isPrimary = diagnoses.length === 0
    onChange([...diagnoses, { text: query.trim(), isPrimary }])
    setQuery("")
    setShowDropdown(false)
  }

  function removeDiagnosis(index: number) {
    const updated = diagnoses.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((d) => d.isPrimary)) {
      updated[0].isPrimary = true
    }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Chẩn đoán</div>

      {/* Existing diagnoses */}
      {diagnoses.length > 0 && (
        <div className="space-y-2">
          {diagnoses.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
            >
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  d.isPrimary
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {d.isPrimary ? "Chính" : "Phụ"}
              </span>
              <span className="flex-1 text-sm">{d.text}</span>
              {d.icd10Code && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  {d.icd10Code}
                </span>
              )}
              <button
                onClick={() => removeDiagnosis(i)}
                className="shrink-0 text-muted-foreground/50 transition-colors hover:text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={ref} className="relative">
        <Input
          placeholder="Tìm chẩn đoán hoặc nhập tự do..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && results.length === 0 && query.trim()) {
              addFreeText()
            }
          }}
        />
        {diagnoses.length === 0 && (
          <div className="mt-1 text-[11px] text-muted-foreground">
            ICD-10 tự động gắn khi chọn từ danh sách
          </div>
        )}

        {showDropdown && query.length >= 2 && (
          <div className="absolute top-10 z-50 max-h-60 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
            {results.length > 0 ? (
              results.map((entry) => (
                <button
                  key={entry.icd10}
                  onClick={() => addFromCatalog(entry)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span>{entry.nameVi}</span>
                  <span className="ml-3 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                    {entry.icd10}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2.5">
                <div className="text-sm text-muted-foreground">
                  Không tìm thấy.{" "}
                  <Button
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    onClick={addFreeText}
                  >
                    Thêm &ldquo;{query}&rdquo; dạng tự do
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
