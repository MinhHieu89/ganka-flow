import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import {
  medicationCatalog,
  type MedicationCatalogEntry,
} from "@/data/medications"

function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
}

interface MedicationSearchProps {
  value: string
  onChange: (name: string) => void
  onSelect: (entry: MedicationCatalogEntry) => void
}

export function MedicationSearch({
  value,
  onChange,
  onSelect,
}: MedicationSearchProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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

  const results = useMemo(() => {
    if (value.length < 1) return []
    const q = removeDiacritics(value.toLowerCase())
    return medicationCatalog.filter((m) =>
      removeDiacritics(m.name.toLowerCase()).includes(q)
    )
  }, [value])

  useEffect(() => {
    setHighlightIndex(0)
  }, [value])

  useEffect(() => {
    if (!listRef.current) return
    const el = listRef.current.querySelector(`[data-index="${highlightIndex}"]`)
    if (el) {
      el.scrollIntoView({ block: "nearest" })
    }
  }, [highlightIndex])

  const selectEntry = useCallback(
    (entry: MedicationCatalogEntry) => {
      onSelect(entry)
      setShowDropdown(false)
    },
    [onSelect]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || results.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (results[highlightIndex]) {
          selectEntry(results[highlightIndex])
        }
        break
      case "Escape":
        setShowDropdown(false)
        break
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowDropdown(true)
        }}
        onFocus={() => {
          if (value.length >= 1) setShowDropdown(true)
        }}
        onKeyDown={handleKeyDown}
      />

      {showDropdown && value.length >= 1 && results.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-10 z-50 max-h-60 w-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
        >
          {results.map((entry, i) => (
            <button
              key={entry.name}
              data-index={i}
              onClick={() => selectEntry(entry)}
              className={`flex w-full flex-col px-3 py-2 text-left text-sm transition-colors ${
                i === highlightIndex ? "bg-accent" : "hover:bg-muted"
              }`}
            >
              <span>{entry.name}</span>
              <span className="text-xs text-muted-foreground">
                {entry.defaultDosage} · {entry.defaultFrequency}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
