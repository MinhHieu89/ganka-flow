import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { OtcCustomer } from "@/data/mock-otc"

interface OtcCreateCustomerModalProps {
  open: boolean
  onClose: () => void
  onCreated: (customer: OtcCustomer) => void
  existingCustomers: OtcCustomer[]
}

export function OtcCreateCustomerModal({
  open,
  onClose,
  onCreated,
  existingCustomers,
}: OtcCreateCustomerModalProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ tên"
    }
    if (!phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^0\d{9}$/.test(phone)) {
      newErrors.phone = "SĐT phải có 10 chữ số, bắt đầu bằng 0"
    } else if (existingCustomers.some((c) => c.phone === phone)) {
      newErrors.phone = "SĐT đã tồn tại trong hệ thống"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    const newCustomer: OtcCustomer = {
      id: `KH-${String(Date.now()).slice(-3)}`,
      name: name.trim(),
      phone,
      birthDate: birthDate || undefined,
      gender: gender ? (gender as "male" | "female") : undefined,
    }
    onCreated(newCustomer)
    resetForm()
  }

  const resetForm = () => {
    setName("")
    setPhone("")
    setBirthDate("")
    setGender("")
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Tạo khách hàng mới
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">
              Họ tên <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Nhập họ tên..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
            {errors.name && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.name}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="0xxx.xxx.xxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
            {errors.phone && (
              <p className="mt-0.5 text-[11px] text-red-500">{errors.phone}</p>
            )}
          </div>
          <div>
            <Label className="text-xs">Ngày sinh</Label>
            <Input
              placeholder="DD/MM/YYYY"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Giới tính</Label>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue placeholder="Chọn..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Nam</SelectItem>
                <SelectItem value="female">Nữ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Chỉ bắt buộc Họ tên + SĐT. Các trường khác có thể bổ sung sau.
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Hủy
          </Button>
          <Button onClick={handleSubmit}>Tạo khách hàng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
