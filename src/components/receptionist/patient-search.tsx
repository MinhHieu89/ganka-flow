import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon } from "@hugeicons/core-free-icons"

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void
  placeholder?: string
}

export function PatientSearch({
  onSelectPatient,
  placeholder = "Tìm theo SĐT hoặc tên BN...",
}: PatientSearchProps) {
  const { searchPatients } = useReceptionist()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Patient[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length >= 2) {
      setResults(searchPatients(query))
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query, searchPatients])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
          {results.map((patient) => (
            <button
              key={patient.id}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
              onClick={() => {
                onSelectPatient(patient)
                setQuery("")
                setIsOpen(false)
              }}
            >
              <div>
                <div className="font-medium">{patient.name}</div>
                <div className="text-xs text-muted-foreground">
                  {patient.id} · {patient.phone}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-md">
          Không tìm thấy bệnh nhân
        </div>
      )}
    </div>
  )
}
