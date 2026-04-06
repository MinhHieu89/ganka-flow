import { useState } from "react"
import { format, parse, isValid } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar01Icon } from "@hugeicons/core-free-icons"

interface IntakeDatePickerProps {
  value: string // dd/mm/yyyy or empty
  onChange: (value: string) => void
  placeholder?: string
  ariaInvalid?: boolean
  fromYear?: number
  toYear?: number
}

export function IntakeDatePicker({
  value,
  onChange,
  placeholder = "Chọn ngày",
  ariaInvalid,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
}: IntakeDatePickerProps) {
  const [open, setOpen] = useState(false)

  const date = value
    ? parse(value, "dd/MM/yyyy", new Date())
    : undefined
  const validDate = date && isValid(date) ? date : undefined

  function handleSelect(selected: Date | undefined) {
    if (selected) {
      onChange(format(selected, "dd/MM/yyyy"))
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          aria-invalid={ariaInvalid}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <HugeiconsIcon
            icon={Calendar01Icon}
            className="mr-2 size-4"
            strokeWidth={1.5}
          />
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={validDate}
          onSelect={handleSelect}
          defaultMonth={validDate}
          locale={vi}
          captionLayout="dropdown"
          startMonth={new Date(fromYear, 0)}
          endMonth={new Date(toYear, 11)}
        />
      </PopoverContent>
    </Popover>
  )
}
