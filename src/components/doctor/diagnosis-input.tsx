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
        d.text.toLowerCase().includes(q) || d.icd10.toLowerCase().includes(q)
    )
  }, [query])

  function addFromCatalog(entry: { text: string; icd10: string }) {
    const isPrimary = diagnoses.length === 0
    onChange([
      ...diagnoses,
      { text: entry.text, icd10Code: entry.icd10, isPrimary },
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
      {diagnoses.map((d, i) => (
        <div
          key={i}
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
        >
          <span className="text-xs font-medium text-muted-foreground">
            {d.isPrimary ? "Chính" : "Phụ"}
          </span>
          <span className="flex-1 text-sm">{d.text}</span>
          {d.icd10Code && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
              {d.icd10Code}
            </span>
          )}
          <button
            onClick={() => removeDiagnosis(i)}
            className="text-muted-foreground hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
          </button>
        </div>
      ))}

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
        <div className="mt-1 text-xs text-muted-foreground">
          ICD-10 sẽ tự động gắn khi chọn từ danh sách
        </div>

        {showDropdown && query.length >= 2 && (
          <div className="absolute top-10 z-50 w-full rounded-md border border-border bg-popover shadow-md">
            {results.length > 0 ? (
              results.map((entry) => (
                <button
                  key={entry.icd10}
                  onClick={() => addFromCatalog(entry)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span>{entry.text}</span>
                  <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {entry.icd10}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-3 py-2">
                <div className="text-sm text-muted-foreground">
                  Không tìm thấy.{" "}
                  <Button
                    variant="link"
                    size="xs"
                    className="h-auto p-0"
                    onClick={addFreeText}
                  >
                    Thêm "{query}" dạng tự do
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
