import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons"
import { diagnosisCatalog } from "@/data/diagnoses"
import type { DiagnosisCatalogEntry } from "@/data/diagnoses"
import type { Diagnosis } from "@/data/mock-patients"

interface DiagnosisInputProps {
  diagnoses: Diagnosis[]
  onChange: (diagnoses: Diagnosis[]) => void
}

/** Strip Vietnamese diacritics for search matching */
function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

interface IndexedEntry extends DiagnosisCatalogEntry {
  flatIdx: number
}

/** Group catalog entries by category with pre-computed flat indices */
function groupByCategory(
  entries: DiagnosisCatalogEntry[]
): { category: string; items: IndexedEntry[] }[] {
  const map = new Map<string, IndexedEntry[]>()
  let idx = 0
  for (const entry of entries) {
    const indexed = { ...entry, flatIdx: idx++ }
    const group = map.get(entry.category)
    if (group) {
      group.push(indexed)
    } else {
      map.set(entry.category, [indexed])
    }
  }
  return Array.from(map, ([category, items]) => ({ category, items }))
}

export function DiagnosisInput({ diagnoses, onChange }: DiagnosisInputProps) {
  const [query, setQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Selected ICD codes for exclusion
  const selectedCodes = useMemo(
    () => new Set(diagnoses.map((d) => d.icd10Code).filter(Boolean)),
    [diagnoses]
  )

  // Filter and group results
  const { flatResults, groupedResults } = useMemo(() => {
    if (query.length < 1) return { flatResults: [], groupedResults: [] }
    const q = removeDiacritics(query.toLowerCase())
    const filtered = diagnosisCatalog.filter((d) => {
      if (selectedCodes.has(d.icd10)) return false
      return (
        d.icd10.toLowerCase().includes(q) ||
        removeDiacritics(d.nameVi.toLowerCase()).includes(q) ||
        d.nameEn.toLowerCase().includes(q)
      )
    })
    return {
      flatResults: filtered,
      groupedResults: groupByCategory(filtered),
    }
  }, [query, selectedCodes])

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${highlightIndex}"]`)
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }, [highlightIndex])

  const addFromCatalog = useCallback(
    (entry: DiagnosisCatalogEntry) => {
      const isPrimary = diagnoses.length === 0
      onChange([
        ...diagnoses,
        { text: entry.nameVi, icd10Code: entry.icd10, isPrimary },
      ])
      setQuery("")
      setShowDropdown(false)
    },
    [diagnoses, onChange]
  )

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
      updated[0] = { ...updated[0], isPrimary: true }
    }
    onChange(updated)
  }

  function promoteToPrimary(index: number) {
    const updated = diagnoses.map((d, i) => ({
      ...d,
      isPrimary: i === index,
    }))
    onChange(updated)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || flatResults.length === 0) {
      if (e.key === "Enter" && query.trim()) {
        addFreeText()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev < flatResults.length - 1 ? prev + 1 : 0
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : flatResults.length - 1
        )
        break
      case "Enter":
        e.preventDefault()
        if (flatResults[highlightIndex]) {
          addFromCatalog(flatResults[highlightIndex])
        }
        break
      case "Escape":
        setShowDropdown(false)
        break
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">Chẩn đoán</div>

      {/* Selected diagnoses */}
      {diagnoses.length > 0 && (
        <div className="space-y-2">
          {diagnoses.map((d, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 rounded-lg border border-border px-3 py-2.5"
            >
              {d.icd10Code && (
                <span className="shrink-0 font-mono text-xs font-semibold tabular-nums">
                  {d.icd10Code}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-sm">
                {d.text}
              </span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                  d.isPrimary
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {d.isPrimary ? "Chính" : "Phụ"}
              </span>
              {!d.isPrimary && (
                <button
                  onClick={() => promoteToPrimary(i)}
                  className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                  title="Đặt làm chẩn đoán chính"
                >
                  <HugeiconsIcon icon={ArrowUp01Icon} className="size-3.5" />
                </button>
              )}
              <button
                onClick={() => removeDiagnosis(i)}
                className="shrink-0 text-muted-foreground/50 transition-colors hover:text-destructive"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <Input
          placeholder="Tìm mã ICD-10..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setShowDropdown(true)
          }}
          onFocus={() => {
            if (query.length >= 1) setShowDropdown(true)
          }}
          onKeyDown={handleKeyDown}
        />

        {showDropdown && query.length >= 1 && (
          <div
            ref={listRef}
            className="absolute top-10 z-50 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
          >
            {groupedResults.length > 0 ? (
              groupedResults.map((group) => (
                <div key={group.category}>
                  <div className="sticky top-0 bg-popover px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    {group.category}
                  </div>
                  {group.items.map((entry) => (
                      <button
                        key={entry.icd10}
                        data-index={entry.flatIdx}
                        onClick={() => addFromCatalog(entry)}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${
                          entry.flatIdx === highlightIndex
                            ? "bg-accent"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="w-[5.5rem] shrink-0 font-mono text-xs font-medium tabular-nums text-foreground">
                          {entry.icd10}
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {entry.nameVi}
                        </span>
                        <span className="hidden max-w-[12rem] shrink-0 truncate text-xs text-muted-foreground sm:inline">
                          {entry.nameEn}
                        </span>
                      </button>
                  ))}
                </div>
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
