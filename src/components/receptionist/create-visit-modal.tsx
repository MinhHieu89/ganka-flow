import { useState, useRef, useEffect, useMemo } from "react"
import { useNavigate } from "react-router"
import { TODAY } from "@/lib/demo-date"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useReceptionist } from "@/contexts/receptionist-context"
import type { Patient } from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons"

interface CreateVisitModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length < 2) return parts[0]?.[0]?.toUpperCase() ?? ""
  return (
    (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  )
}

export function CreateVisitModal({ open, onOpenChange }: CreateVisitModalProps) {
  const { searchPatients, addVisit } = useReceptionist()
  const navigate = useNavigate()

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [query, setQuery] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [reason, setReason] = useState("")
  const searchRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    if (query.length >= 2) return searchPatients(query)
    return []
  }, [query, searchPatients])

  const showDropdown = isDropdownOpen && query.length >= 2

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleReset() {
    setSelectedPatient(null)
    setQuery("")
    setReason("")
    setIsDropdownOpen(false)
  }

  function handleClose(openState: boolean) {
    if (!openState) {
      handleReset()
    }
    onOpenChange(openState)
  }

  function handleSelectPatient(patient: Patient) {
    setSelectedPatient(patient)
    setQuery("")
    setIsDropdownOpen(false)
  }

  function handleConfirm() {
    if (!selectedPatient || !reason.trim()) return
    addVisit({
      patientId: selectedPatient.id,
      status: "cho_kham",
      source: "walk_in",
      reason: reason.trim(),
      date: TODAY,
      checkedInAt: new Date().toISOString(),
    })
    handleReset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tạo lượt khám mới</DialogTitle>
        </DialogHeader>

        {!selectedPatient ? (
          <>
            {/* State 1: Search */}
            <div className="space-y-3">
              <label className="block text-sm font-medium">
                Tìm bệnh nhân
              </label>
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      setIsDropdownOpen(true)
                    }}
                    placeholder="Tìm theo SĐT hoặc tên BN..."
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {showDropdown && results.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border border-border bg-popover shadow-md">
                    {results.map((patient) => (
                      <button
                        key={patient.id}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {patient.id} · {patient.birthYear} · {patient.phone}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && results.length === 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover p-3 text-sm text-muted-foreground shadow-md">
                    Không tìm thấy bệnh nhân
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="flex-row justify-between sm:justify-between">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Hủy
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  handleClose(false)
                  navigate("/intake/new")
                }}
              >
                <HugeiconsIcon icon={UserAdd01Icon} className="size-4" />
                Đăng ký bệnh nhân mới
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* State 2: Patient selected */}
            <div className="space-y-4">
              {/* Patient header */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  {getInitials(selectedPatient.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {selectedPatient.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
                    >
                      Walk-in
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPatient.id}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatient(null)
                    setReason("")
                  }}
                >
                  Đổi
                </Button>
              </div>

              {/* Patient details card */}
              <div className="rounded-lg border border-border p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Năm sinh
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {selectedPatient.birthYear}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Giới tính
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {selectedPatient.gender}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">SĐT</div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {selectedPatient.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Nghề nghiệp
                    </div>
                    <div className="mt-0.5 text-sm font-semibold">
                      {selectedPatient.occupation ?? "---"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Last exam card */}
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Lần khám gần nhất
                  </span>
                  <span className="text-sm font-semibold">
                    {selectedPatient.lastExamDate ?? "Chưa có"}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Lý do khám <span className="text-destructive">*</span>
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value.slice(0, 500))}
                  placeholder="Nhập lý do khám..."
                  rows={3}
                />
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {reason.length} / 500
                </div>
              </div>
            </div>

            <DialogFooter className="flex-row justify-end gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Hủy
              </Button>
              <Button onClick={handleConfirm} disabled={!reason.trim()}>
                Xác nhận tạo lượt khám
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
