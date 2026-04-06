# Intake Form Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the patient intake form from 4 sections / ~16 fields to 8 sections matching the full ophthalmology intake document, with a printable consent view.

**Architecture:** Section-component pattern — `intake-form.tsx` is the parent orchestrator holding all state, each of the 8 .docx sections becomes its own component receiving a data slice + onChange callback. Two reusable components (`CheckboxGrid`, `ConditionalField`) handle repeated patterns. A separate `intake-print-view.tsx` renders the printable document.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Collapsible, Input, Textarea, Select, Label, Button, Dialog), native HTML checkboxes (matching existing screening pattern), Hugeicons.

---

## File Structure

```
src/data/mock-patients.ts                          # Modify: expand Patient interface, migrate mock data
src/components/receptionist/intake-form.tsx         # Modify: refactor to orchestrator with section components
src/components/receptionist/intake-checkbox-grid.tsx # Create: reusable 2-col checkbox grid
src/components/receptionist/intake-conditional-field.tsx # Create: conditional text input
src/components/receptionist/intake-section-personal.tsx  # Create: Section I
src/components/receptionist/intake-section-complaint.tsx # Create: Section II
src/components/receptionist/intake-section-eye-history.tsx # Create: Section III
src/components/receptionist/intake-section-medical-history.tsx # Create: Section IV
src/components/receptionist/intake-section-family-history.tsx # Create: Section V
src/components/receptionist/intake-section-lifestyle.tsx # Create: Section VI
src/components/receptionist/intake-section-referral.tsx # Create: Section VII
src/components/receptionist/intake-section-consent.tsx # Create: Section VIII
src/components/receptionist/intake-print-view.tsx   # Create: printable document view
src/components/receptionist/checkin-modal.tsx        # Modify: update chiefComplaint references
```

---

### Task 1: Expand Patient Interface & Migrate Mock Data

**Files:**
- Modify: `src/data/mock-patients.ts:44-70` (Patient interface)
- Modify: `src/data/mock-patients.ts:376-600` (mockPatients array)

- [ ] **Step 1: Add new types and expand Patient interface**

Add these types above the `Patient` interface, and expand the interface itself. Keep all existing fields — `chiefComplaint` stays as `string` (screening-only), old fields like `eyeHistory`, `systemicHistory`, `currentMedications` (string), `allergies` (string), `familyHistory`, `screenTime` (number), `workEnvironment`, `contactLens` (string), `lifestyleNotes`, `city` are kept for backward compat but marked deprecated with comments. New structured fields are added alongside them.

In `src/data/mock-patients.ts`, after the `PatientActiveStatus` config and before the existing `Patient` interface, add:

```typescript
export interface EmergencyContact {
  name: string
  phone: string
  relationship: string
}

export interface SymptomDetail {
  onset?: string
  severity?: "nhe" | "trung_binh" | "nang"
  frequency?: "thinh_thoang" | "thuong_xuyen" | "lien_tuc"
  dailyImpact?: "khong" | "mot_phan" | "nghiem_trong"
  factors?: string
}

export interface GlassesInfo {
  types: string[]
  duration?: string
  seesWell?: boolean
}

export interface ContactLensDetail {
  type?: string[]
  brand?: string
  duration?: string
  issues?: string[]
  issueOther?: string
}

export interface EyeSurgery {
  type: string
  typeOther?: string
  year?: string
  od: boolean
  os: boolean
}

export interface RefractionValues {
  myopia?: { od?: string; os?: string }
  hyperopia?: { od?: string; os?: string }
  astigmatism?: { od?: string; os?: string }
}

export interface DiabetesDetail {
  yearDiagnosed?: string
  hba1c?: string
}

export interface CancerDetail {
  type?: string
  onTreatment?: boolean
}

export interface MedicationEntry {
  name: string
  dose: string
  purpose: string
}

export interface AllergyEntry {
  type: "thuoc" | "thuc_pham" | "moi_truong" | "khac"
  name: string
  reaction: string
}

export interface AllergiesInfo {
  none: boolean
  items: AllergyEntry[]
}

export interface FamilyHistoryEntry {
  has: boolean
  who?: string
}

export interface SmokingInfo {
  status: "khong" | "co" | "da_bo"
  quantity?: string
  years?: string
  quitYear?: string
}

export interface AlcoholInfo {
  status: "khong" | "thinh_thoang" | "thuong_xuyen"
  frequency?: string
}

export interface DrivingInfo {
  does: boolean
  when?: "ban_ngay" | "ban_dem" | "ca_hai"
}

export interface SportsInfo {
  does: boolean
  type?: string
}
```

Then update the `Patient` interface — keep existing fields, add new ones:

```typescript
export interface Patient {
  id: string
  name: string
  gender: "Nam" | "Nữ" | "Khác"
  dob: string
  birthYear: number
  phone: string
  email?: string
  address?: string
  city?: string // deprecated — use district + cityProvince
  district?: string
  cityProvince?: string
  occupation?: string
  cccd?: string
  emergencyContact?: EmergencyContact

  // Section II: Visit reasons & symptoms
  visitReasons?: string[]
  visitReasonOther?: string
  symptomDetail?: SymptomDetail
  symptoms?: Record<string, boolean>

  // Section III: Eye history
  lastEyeExam?: { date?: string; location?: string }
  currentGlasses?: GlassesInfo
  contactLensStatus?: "co" | "khong" | "da_tung"
  contactLensDetail?: ContactLensDetail
  eyeInjury?: { has: boolean; detail?: string }
  diagnosedEyeConditions?: Record<string, boolean>
  diagnosedEyeConditionOther?: string
  refractionValues?: RefractionValues
  eyeSurgeries?: EyeSurgery[]

  // Section IV: Medical history
  primaryDoctor?: { name?: string; lastVisit?: string }
  systemicConditions?: Record<string, boolean>
  diabetesDetail?: DiabetesDetail
  cancerDetail?: CancerDetail
  systemicConditionOther?: string
  medicationsList?: MedicationEntry[]
  allergiesInfo?: AllergiesInfo
  pregnancyStatus?: "mang_thai" | "cho_con_bu" | "khong"
  pregnancyTrimester?: string

  // Section V: Family history
  familyEyeHistory?: Record<string, FamilyHistoryEntry>
  familyMedicalHistory?: Record<string, FamilyHistoryEntry>
  familyHistoryOther?: { has: boolean; detail?: string; who?: string }

  // Section VI: Lifestyle
  smokingInfo?: SmokingInfo
  alcoholInfo?: AlcoholInfo
  screenTimeComputer?: string
  screenTimePhone?: string
  outdoorTime?: string
  sunglassesUse?: string
  workNearVision?: boolean
  workDustyChemical?: boolean
  drivingInfo?: DrivingInfo
  sportsInfo?: SportsInfo
  hobbies?: string

  // Section VII: Referral
  referralSource?: string
  referralDetail?: string

  // Existing fields kept for backward compat
  chiefComplaint?: string // filled during screening only
  eyeHistory?: string // deprecated
  systemicHistory?: string // deprecated
  currentMedications?: string // deprecated
  allergies?: string // deprecated
  familyHistory?: string // deprecated
  screenTime?: number // deprecated
  workEnvironment?: string // deprecated
  contactLens?: string // deprecated
  lifestyleNotes?: string // deprecated

  createdAt: string
  lastExamDate?: string
  type: PatientType
  activeStatus: PatientActiveStatus
}
```

- [ ] **Step 2: Update mock patients with new visitReasons field**

For each mock patient that has a `chiefComplaint`, add a corresponding `visitReasons` array. The mock data doesn't need to be exhaustive — just enough for realistic display. Update the first 3 mock patients as examples:

For patient "Nguyễn Thị Lan" (GK-2026-0035), add:
```typescript
visitReasons: ["mo_mat", "giam_thi_luc"],
```

For patient "Hoàng Văn Bình" (GK-2026-0038), add:
```typescript
visitReasons: ["dau_mat_kho_chiu"],
symptoms: { kho_mat: true, moi_mat_doc: true },
```

For patient "Trần Văn Minh" (GK-2026-0042), add:
```typescript
visitReasons: ["dau_mat_kho_chiu"],
symptoms: { do_mat: true },
```

Add `visitReasons` to remaining mock patients with reasonable values based on their existing `chiefComplaint` text. Don't add to patients that have no `chiefComplaint`.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (new fields are all optional, existing code still compiles)

- [ ] **Step 4: Commit**

```bash
git add src/data/mock-patients.ts
git commit -m "feat(intake): expand Patient interface with structured intake fields"
```

---

### Task 2: Create Reusable Components (CheckboxGrid, ConditionalField)

**Files:**
- Create: `src/components/receptionist/intake-checkbox-grid.tsx`
- Create: `src/components/receptionist/intake-conditional-field.tsx`

- [ ] **Step 1: Create CheckboxGrid component**

Create `src/components/receptionist/intake-checkbox-grid.tsx`:

```tsx
import { cn } from "@/lib/utils"

interface CheckboxGridItem {
  key: string
  label: string
}

interface CheckboxGridProps {
  items: CheckboxGridItem[]
  values: Record<string, boolean>
  onChange: (key: string, checked: boolean) => void
  columns?: 2 | 3
}

export function CheckboxGrid({
  items,
  values,
  onChange,
  columns = 2,
}: CheckboxGridProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        columns === 3 ? "grid-cols-3" : "grid-cols-2"
      )}
      role="group"
    >
      {items.map((item) => (
        <label
          key={item.key}
          className={cn(
            "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50",
            values[item.key]
              ? "border-primary bg-primary/5"
              : "border-border"
          )}
        >
          <input
            type="checkbox"
            checked={values[item.key] ?? false}
            onChange={(e) => onChange(item.key, e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          {item.label}
        </label>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create ConditionalField component**

Create `src/components/receptionist/intake-conditional-field.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ConditionalFieldProps {
  show: boolean
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
}

export function ConditionalField({
  show,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: ConditionalFieldProps) {
  if (!show) return null

  return (
    <div className="mt-2">
      <Label className="text-sm">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="mt-1"
      />
    </div>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/receptionist/intake-checkbox-grid.tsx src/components/receptionist/intake-conditional-field.tsx
git commit -m "feat(intake): add CheckboxGrid and ConditionalField reusable components"
```

---

### Task 3: Create Section I — Personal Info

**Files:**
- Create: `src/components/receptionist/intake-section-personal.tsx`

- [ ] **Step 1: Create the personal info section component**

This component extracts the existing Section 1 from `intake-form.tsx`, adding the new `district`, `cityProvince`, and `emergencyContact` fields. It receives the full form data and an onChange callback.

Create `src/components/receptionist/intake-section-personal.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
  renderFieldError: (field: string) => React.ReactNode
  duplicateWarning?: React.ReactNode
}

const RELATIONSHIP_OPTIONS = [
  { value: "bo_me", label: "Bố/Mẹ" },
  { value: "vo_chong", label: "Vợ/Chồng" },
  { value: "con", label: "Con" },
  { value: "anh_chi_em", label: "Anh/Chị/Em" },
  { value: "khac", label: "Khác" },
]

export function IntakeSectionPersonal({
  data,
  errors,
  onChange,
  renderFieldError,
  duplicateWarning,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Row 1: Name + Gender */}
      <div className="grid grid-cols-[2.5fr_1fr] gap-6">
        <div>
          <Label>
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Nhập họ và tên đầy đủ"
            maxLength={100}
            aria-invalid={!!errors.name}
          />
          {renderFieldError("name")}
        </div>
        <div>
          <Label>
            Giới tính <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.gender}
            onValueChange={(v) => onChange("gender", v)}
          >
            <SelectTrigger aria-invalid={!!errors.gender}>
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Nam">Nam</SelectItem>
              <SelectItem value="Nữ">Nữ</SelectItem>
              <SelectItem value="Khác">Khác</SelectItem>
            </SelectContent>
          </Select>
          {renderFieldError("gender")}
        </div>
      </div>

      {/* Row 2: DOB + Phone + Email */}
      <div className="grid grid-cols-3 gap-6">
        <div>
          <Label>
            Ngày sinh <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.dob}
            onChange={(e) => onChange("dob", e.target.value)}
            placeholder="dd/mm/yyyy"
            aria-invalid={!!errors.dob}
          />
          {renderFieldError("dob")}
        </div>
        <div>
          <Label>
            Số điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            aria-invalid={!!errors.phone}
          />
          {renderFieldError("phone")}
        </div>
        <div>
          <Label>Email</Label>
          <Input
            value={data.email}
            onChange={(e) => onChange("email", e.target.value)}
            type="email"
            aria-invalid={!!errors.email}
          />
          {renderFieldError("email")}
        </div>
      </div>

      {/* Duplicate warning */}
      {duplicateWarning}

      {/* Row 3: CCCD */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Số CMND/CCCD</Label>
          <Input
            value={data.cccd}
            onChange={(e) => onChange("cccd", e.target.value)}
          />
        </div>
        <div>
          <Label>Nghề nghiệp</Label>
          <Input
            value={data.occupation}
            onChange={(e) => onChange("occupation", e.target.value)}
            placeholder="VD: Nhân viên văn phòng"
            maxLength={100}
          />
        </div>
      </div>

      {/* Row 4: Address */}
      <div>
        <Label>Địa chỉ</Label>
        <Input
          value={data.address}
          onChange={(e) => onChange("address", e.target.value)}
          maxLength={200}
        />
      </div>

      {/* Row 5: District + City/Province */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Quận/Huyện</Label>
          <Input
            value={data.district}
            onChange={(e) => onChange("district", e.target.value)}
          />
        </div>
        <div>
          <Label>Thành phố/Tỉnh</Label>
          <Input
            value={data.cityProvince}
            onChange={(e) => onChange("cityProvince", e.target.value)}
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-muted-foreground">
          Người liên hệ khẩn cấp
        </Label>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <Label>Họ tên</Label>
            <Input
              value={data.emergencyContactName}
              onChange={(e) => onChange("emergencyContactName", e.target.value)}
            />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input
              value={data.emergencyContactPhone}
              onChange={(e) => onChange("emergencyContactPhone", e.target.value)}
            />
          </div>
          <div>
            <Label>Quan hệ</Label>
            <Select
              value={data.emergencyContactRelationship}
              onValueChange={(v) =>
                onChange("emergencyContactRelationship", v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn..." />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: May fail because `IntakeFormData` doesn't exist yet. That's OK — it will be defined when we refactor `intake-form.tsx` in Task 10. Continue to next task.

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/intake-section-personal.tsx
git commit -m "feat(intake): add Section I personal info component"
```

---

### Task 4: Create Section II — Complaint & Symptoms

**Files:**
- Create: `src/components/receptionist/intake-section-complaint.tsx`

- [ ] **Step 1: Create the complaint section component**

Create `src/components/receptionist/intake-section-complaint.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
  renderFieldError: (field: string) => React.ReactNode
}

const VISIT_REASON_OPTIONS = [
  { key: "kham_dinh_ky", label: "Khám định kỳ/Kiểm tra tổng quát" },
  { key: "giam_thi_luc", label: "Giảm thị lực" },
  { key: "mo_mat", label: "Mờ mắt" },
  { key: "nhuc_dau_dau_mat", label: "Nhức đầu/Đau mắt" },
  { key: "dau_mat_kho_chiu", label: "Đau mắt hoặc khó chịu" },
  { key: "kho_nhin_gan", label: "Khó nhìn gần (đọc sách, xem điện thoại)" },
  { key: "kho_nhin_xa", label: "Khó nhìn xa (xem bảng, lái xe)" },
  { key: "kinh_ap_trong", label: "Muốn đeo kính áp tròng" },
  { key: "tu_van_phau_thuat", label: "Tư vấn phẫu thuật (LASIK, đục thủy tinh thể...)" },
  { key: "khac", label: "Khác" },
]

const SYMPTOM_OPTIONS = [
  { key: "mo_mat", label: "Nhìn mờ/Giảm thị lực" },
  { key: "nhin_doi", label: "Nhìn đôi (song thị)" },
  { key: "nhin_bien_dang", label: "Nhìn biến dạng" },
  { key: "dom_bay", label: "Xuất hiện điểm đen/đốm bay" },
  { key: "vong_sang", label: "Thấy vòng sáng quanh đèn" },
  { key: "chop_sang", label: "Nhìn chớp sáng (flash)" },
  { key: "mat_thi_truong", label: "Mất thị trường (góc nhìn)" },
  { key: "mo_thay_doi_theo_gio", label: "Nhìn mờ thay đổi theo giờ" },
  { key: "nhuc_dau", label: "Nhức đầu thường xuyên" },
  { key: "choi_sang", label: "Chói sáng/Sợ ánh sáng" },
  { key: "kho_mat", label: "Khô mắt" },
  { key: "chay_nuoc_mat", label: "Chảy nước mắt nhiều" },
  { key: "tiet_dich", label: "Tiết dịch/Ghèn mắt" },
  { key: "ngua_mat", label: "Ngứa mắt" },
  { key: "do_mat", label: "Đỏ mắt" },
  { key: "sung_mi", label: "Sưng mi mắt" },
  { key: "moi_mat_doc", label: "Mỏi mắt khi đọc/máy tính" },
  { key: "kho_tap_trung_doc", label: "Khó tập trung khi đọc" },
]

const SEVERITY_OPTIONS = [
  { value: "nhe", label: "Nhẹ" },
  { value: "trung_binh", label: "Trung bình" },
  { value: "nang", label: "Nặng" },
]

const FREQUENCY_OPTIONS = [
  { value: "thinh_thoang", label: "Thỉnh thoảng" },
  { value: "thuong_xuyen", label: "Thường xuyên" },
  { value: "lien_tuc", label: "Liên tục" },
]

const IMPACT_OPTIONS = [
  { value: "khong", label: "Không" },
  { value: "mot_phan", label: "Một phần" },
  { value: "nghiem_trong", label: "Nghiêm trọng" },
]

export function IntakeSectionComplaint({
  data,
  errors,
  onChange,
  renderFieldError,
}: Props) {
  const visitReasonsMap = Object.fromEntries(
    (data.visitReasons ?? []).map((r) => [r, true])
  )
  const hasAnySymptom = Object.values(data.symptoms ?? {}).some(Boolean)

  function toggleVisitReason(key: string, checked: boolean) {
    const current = data.visitReasons ?? []
    const next = checked
      ? [...current, key]
      : current.filter((r) => r !== key)
    onChange("visitReasons", next)
  }

  function updateSymptom(key: string, checked: boolean) {
    onChange("symptoms", { ...(data.symptoms ?? {}), [key]: checked })
  }

  function updateSymptomDetail(field: string, value: string) {
    onChange("symptomDetail", { ...(data.symptomDetail ?? {}), [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* Visit Reasons */}
      <div>
        <Label>
          Lý do chính đến khám hôm nay{" "}
          <span className="text-destructive">*</span>
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2" role="group">
          {VISIT_REASON_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                visitReasonsMap[opt.key]
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={!!visitReasonsMap[opt.key]}
                onChange={(e) => toggleVisitReason(opt.key, e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {renderFieldError("visitReasons")}
        <ConditionalField
          show={visitReasonsMap["khac"] ?? false}
          label="Mô tả lý do khác"
          value={data.visitReasonOther ?? ""}
          onChange={(v) => onChange("visitReasonOther", v)}
          placeholder="Nhập lý do..."
        />
      </div>

      {/* Symptom Detail */}
      <div>
        <Label className="mb-2 block">Mô tả chi tiết triệu chứng (nếu có)</Label>
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-muted-foreground">
              Bắt đầu từ khi nào?
            </Label>
            <Input
              value={data.symptomDetail?.onset ?? ""}
              onChange={(e) => updateSymptomDetail("onset", e.target.value)}
              placeholder="VD: 2 tuần trước, từ tháng 1..."
            />
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">Mức độ</Label>
              <div className="mt-1 flex gap-3">
                {SEVERITY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="severity"
                      checked={data.symptomDetail?.severity === opt.value}
                      onChange={() => updateSymptomDetail("severity", opt.value)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Tần suất</Label>
              <div className="mt-1 flex gap-3">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="frequency"
                      checked={data.symptomDetail?.frequency === opt.value}
                      onChange={() => updateSymptomDetail("frequency", opt.value)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Ảnh hưởng đến sinh hoạt
              </Label>
              <div className="mt-1 flex gap-3">
                {IMPACT_OPTIONS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm">
                    <input
                      type="radio"
                      name="dailyImpact"
                      checked={data.symptomDetail?.dailyImpact === opt.value}
                      onChange={() => updateSymptomDetail("dailyImpact", opt.value)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">
              Các yếu tố làm tình trạng tốt hơn hoặc xấu đi
            </Label>
            <Input
              value={data.symptomDetail?.factors ?? ""}
              onChange={(e) => updateSymptomDetail("factors", e.target.value)}
              placeholder="VD: Tốt hơn khi nghỉ ngơi, xấu đi khi dùng máy tính..."
            />
          </div>
        </div>
      </div>

      {/* Symptom Checklist */}
      <div>
        <Label className="mb-2 block">
          Bạn có gặp các triệu chứng sau không?
        </Label>
        <CheckboxGrid
          items={SYMPTOM_OPTIONS}
          values={data.symptoms ?? {}}
          onChange={updateSymptom}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-section-complaint.tsx
git commit -m "feat(intake): add Section II complaint & symptoms component"
```

---

### Task 5: Create Section III — Eye History

**Files:**
- Create: `src/components/receptionist/intake-section-eye-history.tsx`

- [ ] **Step 1: Create the eye history section component**

Create `src/components/receptionist/intake-section-eye-history.tsx`:

```tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"
import type { EyeSurgery } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const GLASSES_TYPE_OPTIONS = [
  { key: "can", label: "Kính cận" },
  { key: "vien", label: "Kính viễn" },
  { key: "loan", label: "Kính loạn" },
  { key: "lao", label: "Kính lão" },
]

const CONTACT_LENS_STATUS_OPTIONS = [
  { value: "co", label: "Có" },
  { value: "khong", label: "Không" },
  { value: "da_tung", label: "Đã từng đeo nhưng hiện không dùng" },
]

const CONTACT_LENS_TYPE_OPTIONS = [
  { key: "mem", label: "Mềm" },
  { key: "cung", label: "Cứng (RGP)" },
  { key: "deo_ngay", label: "Đeo ngày" },
  { key: "deo_keo_dai", label: "Đeo kéo dài" },
]

const CONTACT_LENS_ISSUE_OPTIONS = [
  { key: "kho_mat", label: "Khô mắt" },
  { key: "kho_chiu", label: "Khó chịu" },
  { key: "nhin_mo", label: "Nhìn mờ" },
  { key: "khac", label: "Khác" },
]

const EYE_CONDITION_OPTIONS = [
  { key: "can_thi", label: "Cận thị (Myopia)" },
  { key: "vien_thi", label: "Viễn thị (Hyperopia)" },
  { key: "loan_thi", label: "Loạn thị (Astigmatism)" },
  { key: "lao_thi", label: "Lão thị (Presbyopia)" },
  { key: "glaucoma", label: "Glaucoma (Tăng nhãn áp)" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể (Cataract)" },
  { key: "thoai_hoa_diem_vang", label: "Thoái hóa điểm vàng" },
  { key: "benh_vong_mac_dtd", label: "Bệnh võng mạc do ĐTĐ" },
  { key: "lac_mat", label: "Lác mắt (Strabismus)" },
  { key: "mat_luoi", label: "Mắt lười (Amblyopia)" },
  { key: "kho_mat_syndrome", label: "Khô mắt (Dry Eye)" },
  { key: "viem_ket_mac", label: "Viêm kết mạc thường xuyên" },
  { key: "bong_vong_mac", label: "Bong võng mạc" },
  { key: "viem_mang_bo_dao", label: "Viêm màng bồ đào (Uveitis)" },
  { key: "khac", label: "Khác" },
]

const SURGERY_TYPE_OPTIONS = [
  { value: "lasik", label: "LASIK/PRK" },
  { value: "duc_thuy_tinh_the", label: "Phẫu thuật đục thủy tinh thể" },
  { value: "glaucoma", label: "Phẫu thuật glaucoma" },
  { value: "vong_mac", label: "Phẫu thuật võng mạc" },
  { value: "lac_mat", label: "Phẫu thuật lác mắt" },
  { value: "khac", label: "Khác" },
]

const REFRACTION_CONDITIONS = ["can_thi", "vien_thi", "loan_thi"]

const emptySurgery: EyeSurgery = {
  type: "",
  year: "",
  od: false,
  os: false,
}

export function IntakeSectionEyeHistory({ data, errors, onChange }: Props) {
  const conditions = data.diagnosedEyeConditions ?? {}
  const hasGlasses = (data.currentGlasses?.types ?? []).length > 0
  const showLensDetail =
    data.contactLensStatus === "co" || data.contactLensStatus === "da_tung"
  const hasEyeInjury = data.eyeInjury?.has ?? false
  const hasSurgery = (data.eyeSurgeries ?? []).length > 0

  function toggleGlassesType(key: string, checked: boolean) {
    const current = data.currentGlasses?.types ?? []
    const next = checked
      ? [...current, key]
      : current.filter((t) => t !== key)
    onChange("currentGlasses", { ...(data.currentGlasses ?? { types: [] }), types: next })
  }

  function updateGlasses(field: string, value: unknown) {
    onChange("currentGlasses", { ...(data.currentGlasses ?? { types: [] }), [field]: value })
  }

  function updateLensDetail(field: string, value: unknown) {
    onChange("contactLensDetail", { ...(data.contactLensDetail ?? {}), [field]: value })
  }

  function toggleLensType(key: string, checked: boolean) {
    const current = data.contactLensDetail?.type ?? []
    const next = checked ? [...current, key] : current.filter((t) => t !== key)
    updateLensDetail("type", next)
  }

  function toggleLensIssue(key: string, checked: boolean) {
    const current = data.contactLensDetail?.issues ?? []
    const next = checked ? [...current, key] : current.filter((i) => i !== key)
    updateLensDetail("issues", next)
  }

  function updateCondition(key: string, checked: boolean) {
    onChange("diagnosedEyeConditions", { ...conditions, [key]: checked })
  }

  function updateRefraction(
    condition: string,
    eye: "od" | "os",
    value: string
  ) {
    const rv = data.refractionValues ?? {}
    const condKey = condition === "can_thi" ? "myopia" : condition === "vien_thi" ? "hyperopia" : "astigmatism"
    onChange("refractionValues", {
      ...rv,
      [condKey]: { ...(rv[condKey] ?? {}), [eye]: value },
    })
  }

  function addSurgery() {
    onChange("eyeSurgeries", [...(data.eyeSurgeries ?? []), { ...emptySurgery }])
  }

  function updateSurgery(index: number, field: string, value: unknown) {
    const surgeries = [...(data.eyeSurgeries ?? [])]
    surgeries[index] = { ...surgeries[index], [field]: value }
    onChange("eyeSurgeries", surgeries)
  }

  function removeSurgery(index: number) {
    const surgeries = (data.eyeSurgeries ?? []).filter((_, i) => i !== index)
    onChange("eyeSurgeries", surgeries)
  }

  return (
    <div className="space-y-5">
      {/* Last exam */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Lần khám mắt gần nhất</Label>
          <Input
            value={data.lastEyeExam?.date ?? ""}
            onChange={(e) =>
              onChange("lastEyeExam", {
                ...(data.lastEyeExam ?? {}),
                date: e.target.value,
              })
            }
            placeholder="dd/mm/yyyy"
          />
        </div>
        <div>
          <Label>Tại đâu?</Label>
          <Input
            value={data.lastEyeExam?.location ?? ""}
            onChange={(e) =>
              onChange("lastEyeExam", {
                ...(data.lastEyeExam ?? {}),
                location: e.target.value,
              })
            }
          />
        </div>
      </div>

      {/* Current glasses */}
      <div>
        <Label className="mb-2 block">Hiện có đeo kính không?</Label>
        <div className="grid grid-cols-2 gap-2">
          {GLASSES_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.key}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
                (data.currentGlasses?.types ?? []).includes(opt.key)
                  ? "border-primary bg-primary/5"
                  : "border-border"
              }`}
            >
              <input
                type="checkbox"
                checked={(data.currentGlasses?.types ?? []).includes(opt.key)}
                onChange={(e) => toggleGlassesType(opt.key, e.target.checked)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {hasGlasses && (
          <div className="mt-3 grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">
                Kính đã dùng bao lâu?
              </Label>
              <Input
                value={data.currentGlasses?.duration ?? ""}
                onChange={(e) => updateGlasses("duration", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Có thấy rõ với kính hiện tại không?
              </Label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="seesWell"
                    checked={data.currentGlasses?.seesWell === true}
                    onChange={() => updateGlasses("seesWell", true)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Có
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="seesWell"
                    checked={data.currentGlasses?.seesWell === false}
                    onChange={() => updateGlasses("seesWell", false)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Không
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contact lens */}
      <div>
        <Label className="mb-2 block">Có đeo kính áp tròng không?</Label>
        <div className="flex gap-3">
          {CONTACT_LENS_STATUS_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="contactLensStatus"
                checked={data.contactLensStatus === opt.value}
                onChange={() => onChange("contactLensStatus", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {showLensDetail && (
          <div className="mt-3 space-y-3 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">Loại</Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {CONTACT_LENS_TYPE_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                      (data.contactLensDetail?.type ?? []).includes(opt.key)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(data.contactLensDetail?.type ?? []).includes(opt.key)}
                      onChange={(e) => toggleLensType(opt.key, e.target.checked)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-sm text-muted-foreground">Thương hiệu</Label>
                <Input
                  value={data.contactLensDetail?.brand ?? ""}
                  onChange={(e) => updateLensDetail("brand", e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Đeo được bao lâu?</Label>
                <Input
                  value={data.contactLensDetail?.duration ?? ""}
                  onChange={(e) => updateLensDetail("duration", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Có gặp vấn đề gì không?
              </Label>
              <div className="mt-1 grid grid-cols-2 gap-2">
                {CONTACT_LENS_ISSUE_OPTIONS.map((opt) => (
                  <label
                    key={opt.key}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50 ${
                      (data.contactLensDetail?.issues ?? []).includes(opt.key)
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={(data.contactLensDetail?.issues ?? []).includes(opt.key)}
                      onChange={(e) => toggleLensIssue(opt.key, e.target.checked)}
                      className="size-4 accent-[var(--color-primary)]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
              <ConditionalField
                show={(data.contactLensDetail?.issues ?? []).includes("khac")}
                label="Mô tả vấn đề khác"
                value={data.contactLensDetail?.issueOther ?? ""}
                onChange={(v) => updateLensDetail("issueOther", v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Eye injury */}
      <div>
        <Label className="mb-2 block">
          Có từng bị chấn thương mắt hoặc nhiễm trùng mắt không?
        </Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="eyeInjury"
              checked={hasEyeInjury}
              onChange={() => onChange("eyeInjury", { has: true, detail: data.eyeInjury?.detail })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Có
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="eyeInjury"
              checked={data.eyeInjury?.has === false}
              onChange={() => onChange("eyeInjury", { has: false })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Không
          </label>
        </div>
        <ConditionalField
          show={hasEyeInjury}
          label="Mô tả"
          value={data.eyeInjury?.detail ?? ""}
          onChange={(v) => onChange("eyeInjury", { has: true, detail: v })}
        />
      </div>

      {/* Diagnosed conditions */}
      <div>
        <Label className="mb-2 block">
          Có từng được chẩn đoán hoặc điều trị các bệnh mắt sau không?
        </Label>
        <CheckboxGrid
          items={EYE_CONDITION_OPTIONS}
          values={conditions}
          onChange={updateCondition}
        />
        <ConditionalField
          show={conditions["khac"] ?? false}
          label="Bệnh khác"
          value={data.diagnosedEyeConditionOther ?? ""}
          onChange={(v) => onChange("diagnosedEyeConditionOther", v)}
        />
        {/* Refraction values for applicable conditions */}
        {REFRACTION_CONDITIONS.some((c) => conditions[c]) && (
          <div className="mt-3 space-y-2 rounded-lg border border-border p-4">
            <Label className="text-sm font-medium">Số đo khúc xạ</Label>
            {REFRACTION_CONDITIONS.filter((c) => conditions[c]).map((c) => {
              const label = c === "can_thi" ? "Cận thị" : c === "vien_thi" ? "Viễn thị" : "Loạn thị"
              const condKey = c === "can_thi" ? "myopia" : c === "vien_thi" ? "hyperopia" : "astigmatism"
              return (
                <div key={c} className="grid grid-cols-[120px_1fr_1fr] items-center gap-4">
                  <span className="text-sm">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">OD</span>
                    <Input
                      value={data.refractionValues?.[condKey]?.od ?? ""}
                      onChange={(e) => updateRefraction(c, "od", e.target.value)}
                      placeholder="VD: -3.50"
                      className="h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">OS</span>
                    <Input
                      value={data.refractionValues?.[condKey]?.os ?? ""}
                      onChange={(e) => updateRefraction(c, "os", e.target.value)}
                      placeholder="VD: -3.25"
                      className="h-8"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Eye surgeries */}
      <div>
        <Label className="mb-2 block">Có từng phẫu thuật mắt không?</Label>
        {!hasSurgery ? (
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="hasSurgery"
                checked={false}
                onChange={() => addSurgery()}
                className="size-4 accent-[var(--color-primary)]"
              />
              Có
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="hasSurgery"
                checked={true}
                readOnly
                className="size-4 accent-[var(--color-primary)]"
              />
              Không
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            {(data.eyeSurgeries ?? []).map((surgery, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_80px_60px_60px_40px] items-end gap-3 rounded-lg border border-border p-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">Loại phẫu thuật</Label>
                  <select
                    value={surgery.type}
                    onChange={(e) => updateSurgery(i, "type", e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    <option value="">Chọn...</option>
                    {SURGERY_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {surgery.type === "khac" && (
                    <Input
                      value={surgery.typeOther ?? ""}
                      onChange={(e) => updateSurgery(i, "typeOther", e.target.value)}
                      placeholder="Loại khác..."
                      className="mt-1 h-8"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Năm</Label>
                  <Input
                    value={surgery.year ?? ""}
                    onChange={(e) => updateSurgery(i, "year", e.target.value)}
                    className="mt-1 h-8"
                    placeholder="2020"
                  />
                </div>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={surgery.od}
                    onChange={(e) => updateSurgery(i, "od", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  OD
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={surgery.os}
                    onChange={(e) => updateSurgery(i, "os", e.target.checked)}
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  OS
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSurgery(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSurgery}>
              + Thêm phẫu thuật
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-section-eye-history.tsx
git commit -m "feat(intake): add Section III eye history component"
```

---

### Task 6: Create Section IV — Medical History

**Files:**
- Create: `src/components/receptionist/intake-section-medical-history.tsx`

- [ ] **Step 1: Create the medical history section component**

Create `src/components/receptionist/intake-section-medical-history.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckboxGrid } from "./intake-checkbox-grid"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"
import type { MedicationEntry, AllergyEntry } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const SYSTEMIC_CONDITION_GROUPS = [
  {
    label: "Tim mạch",
    items: [
      { key: "tang_huyet_ap", label: "Tăng huyết áp" },
      { key: "dau_that_nguc", label: "Đau thắt ngực" },
      { key: "benh_tim_mach", label: "Bệnh tim mạch" },
      { key: "dot_quy", label: "Đột quỵ/Tai biến mạch máu não" },
    ],
  },
  {
    label: "Nội tiết",
    items: [
      { key: "dtd_type1", label: "Đái tháo đường Típ 1" },
      { key: "dtd_type2", label: "Đái tháo đường Típ 2" },
      { key: "benh_tuyen_giap", label: "Bệnh tuyến giáp" },
      { key: "cholesterol_cao", label: "Cholesterol cao" },
    ],
  },
  {
    label: "Thần kinh",
    items: [
      { key: "da_xo_cung", label: "Đa xơ cứng (MS)" },
      { key: "dong_kinh", label: "Động kinh" },
      { key: "parkinson", label: "Bệnh Parkinson" },
      { key: "migraine", label: "Đau nửa đầu/Migraine" },
    ],
  },
  {
    label: "Hô hấp & Miễn dịch",
    items: [
      { key: "hen_suyen", label: "Hen suyễn" },
      { key: "copd", label: "COPD" },
      { key: "hiv", label: "HIV/AIDS" },
      { key: "viem_gan_bc", label: "Viêm gan B/C" },
      { key: "lupus", label: "Lupus ban đỏ hệ thống" },
      { key: "viem_khop_dang_thap", label: "Viêm khớp dạng thấp" },
    ],
  },
  {
    label: "Ung thư",
    items: [
      { key: "ung_thu", label: "Ung thư" },
      { key: "dang_hoa_xa_tri", label: "Đang điều trị hóa chất/xạ trị" },
    ],
  },
  {
    label: "Khác",
    items: [
      { key: "benh_than", label: "Bệnh thận" },
      { key: "benh_gan", label: "Bệnh gan" },
      { key: "roi_loan_dong_mau", label: "Rối loạn đông máu" },
      { key: "benh_ngoai_da", label: "Bệnh ngoài da (vảy nến, chàm...)" },
      { key: "tram_cam_lo_au", label: "Trầm cảm/Lo âu" },
    ],
  },
]

const ALLERGY_TYPE_OPTIONS = [
  { value: "thuoc", label: "Thuốc" },
  { value: "thuc_pham", label: "Thực phẩm" },
  { value: "moi_truong", label: "Môi trường" },
  { value: "khac", label: "Khác" },
]

const emptyMedication: MedicationEntry = { name: "", dose: "", purpose: "" }
const emptyAllergy: AllergyEntry = {
  type: "thuoc",
  name: "",
  reaction: "",
}

export function IntakeSectionMedicalHistory({
  data,
  errors,
  onChange,
}: Props) {
  const conditions = data.systemicConditions ?? {}
  const hasDiabetes = conditions["dtd_type1"] || conditions["dtd_type2"]
  const hasCancer = conditions["ung_thu"]
  const medications = data.medicationsList ?? []
  const allergiesInfo = data.allergiesInfo ?? { none: false, items: [] }
  const isFemale = data.gender === "Nữ"

  function updateCondition(key: string, checked: boolean) {
    onChange("systemicConditions", { ...conditions, [key]: checked })
  }

  function addMedication() {
    onChange("medicationsList", [...medications, { ...emptyMedication }])
  }

  function updateMedication(index: number, field: string, value: string) {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    onChange("medicationsList", updated)
  }

  function removeMedication(index: number) {
    onChange("medicationsList", medications.filter((_, i) => i !== index))
  }

  function toggleAllergyNone(none: boolean) {
    onChange("allergiesInfo", { none, items: none ? [] : allergiesInfo.items })
  }

  function addAllergy() {
    onChange("allergiesInfo", {
      ...allergiesInfo,
      none: false,
      items: [...allergiesInfo.items, { ...emptyAllergy }],
    })
  }

  function updateAllergy(index: number, field: string, value: string) {
    const items = [...allergiesInfo.items]
    items[index] = { ...items[index], [field]: value } as AllergyEntry
    onChange("allergiesInfo", { ...allergiesInfo, items })
  }

  function removeAllergy(index: number) {
    onChange("allergiesInfo", {
      ...allergiesInfo,
      items: allergiesInfo.items.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-5">
      {/* Primary doctor */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label>Bác sĩ gia đình/Bác sĩ điều trị chính</Label>
          <Input
            value={data.primaryDoctor?.name ?? ""}
            onChange={(e) =>
              onChange("primaryDoctor", {
                ...(data.primaryDoctor ?? {}),
                name: e.target.value,
              })
            }
          />
        </div>
        <div>
          <Label>Lần khám gần nhất</Label>
          <Input
            value={data.primaryDoctor?.lastVisit ?? ""}
            onChange={(e) =>
              onChange("primaryDoctor", {
                ...(data.primaryDoctor ?? {}),
                lastVisit: e.target.value,
              })
            }
            placeholder="dd/mm/yyyy"
          />
        </div>
      </div>

      {/* Systemic conditions by group */}
      <div>
        <Label className="mb-2 block">Bạn có bị các bệnh sau không?</Label>
        <div className="space-y-4">
          {SYSTEMIC_CONDITION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </p>
              <CheckboxGrid
                items={group.items}
                values={conditions}
                onChange={updateCondition}
              />
            </div>
          ))}
        </div>

        {/* Diabetes detail */}
        {hasDiabetes && (
          <div className="mt-3 grid grid-cols-2 gap-6 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Năm chẩn đoán
              </Label>
              <Input
                value={data.diabetesDetail?.yearDiagnosed ?? ""}
                onChange={(e) =>
                  onChange("diabetesDetail", {
                    ...(data.diabetesDetail ?? {}),
                    yearDiagnosed: e.target.value,
                  })
                }
                placeholder="VD: 2018"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                HbA1c gần nhất
              </Label>
              <Input
                value={data.diabetesDetail?.hba1c ?? ""}
                onChange={(e) =>
                  onChange("diabetesDetail", {
                    ...(data.diabetesDetail ?? {}),
                    hba1c: e.target.value,
                  })
                }
                placeholder="VD: 7.2%"
              />
            </div>
          </div>
        )}

        {/* Cancer detail */}
        {hasCancer && (
          <div className="mt-3 grid grid-cols-2 gap-6 rounded-lg border border-border p-4">
            <div>
              <Label className="text-sm text-muted-foreground">
                Loại ung thư
              </Label>
              <Input
                value={data.cancerDetail?.type ?? ""}
                onChange={(e) =>
                  onChange("cancerDetail", {
                    ...(data.cancerDetail ?? {}),
                    type: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Đang điều trị?
              </Label>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="cancerOnTreatment"
                    checked={data.cancerDetail?.onTreatment === true}
                    onChange={() =>
                      onChange("cancerDetail", {
                        ...(data.cancerDetail ?? {}),
                        onTreatment: true,
                      })
                    }
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Có
                </label>
                <label className="flex items-center gap-1.5 text-sm">
                  <input
                    type="radio"
                    name="cancerOnTreatment"
                    checked={data.cancerDetail?.onTreatment === false}
                    onChange={() =>
                      onChange("cancerDetail", {
                        ...(data.cancerDetail ?? {}),
                        onTreatment: false,
                      })
                    }
                    className="size-4 accent-[var(--color-primary)]"
                  />
                  Không
                </label>
              </div>
            </div>
          </div>
        )}

        <ConditionalField
          show={!SYSTEMIC_CONDITION_GROUPS.flatMap((g) =>
            g.items.map((i) => i.key)
          ).every((k) => !conditions[k])}
          label=""
          value=""
          onChange={() => {}}
        />
      </div>

      {/* Other systemic condition */}
      <div>
        <Label>Bệnh khác</Label>
        <Input
          value={data.systemicConditionOther ?? ""}
          onChange={(e) => onChange("systemicConditionOther", e.target.value)}
          placeholder="Mô tả bệnh khác nếu có..."
        />
      </div>

      {/* Medications */}
      <div>
        <Label className="mb-2 block">
          Thuốc đang sử dụng (bao gồm thuốc kê đơn, vitamin, thực phẩm chức
          năng)
        </Label>
        {medications.length === 0 ? (
          <Button variant="outline" size="sm" onClick={addMedication}>
            + Thêm thuốc
          </Button>
        ) : (
          <div className="space-y-2">
            {medications.map((med, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_100px_1fr_40px] items-end gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tên thuốc
                  </Label>
                  <Input
                    value={med.name}
                    onChange={(e) => updateMedication(i, "name", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Liều</Label>
                  <Input
                    value={med.dose}
                    onChange={(e) => updateMedication(i, "dose", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Mục đích
                  </Label>
                  <Input
                    value={med.purpose}
                    onChange={(e) =>
                      updateMedication(i, "purpose", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMedication(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addMedication}>
              + Thêm thuốc
            </Button>
          </div>
        )}
      </div>

      {/* Allergies */}
      <div>
        <Label className="mb-2 block">Dị ứng</Label>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={allergiesInfo.none}
            onChange={(e) => toggleAllergyNone(e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Không có dị ứng nào
        </label>
        {!allergiesInfo.none && (
          <div className="space-y-2">
            {allergiesInfo.items.map((item, i) => (
              <div
                key={i}
                className="grid grid-cols-[120px_1fr_1fr_40px] items-end gap-3"
              >
                <div>
                  <Label className="text-xs text-muted-foreground">Loại</Label>
                  <Select
                    value={item.type}
                    onValueChange={(v) => updateAllergy(i, "type", v)}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLERGY_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Tên chất gây dị ứng
                  </Label>
                  <Input
                    value={item.name}
                    onChange={(e) => updateAllergy(i, "name", e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">
                    Phản ứng
                  </Label>
                  <Input
                    value={item.reaction}
                    onChange={(e) =>
                      updateAllergy(i, "reaction", e.target.value)
                    }
                    className="h-8"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAllergy(i)}
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addAllergy}>
              + Thêm dị ứng
            </Button>
          </div>
        )}
      </div>

      {/* Pregnancy — female only */}
      {isFemale && (
        <div>
          <Label className="mb-2 block">Phụ nữ</Label>
          <div className="flex gap-4">
            {(
              [
                { value: "mang_thai", label: "Đang mang thai" },
                { value: "cho_con_bu", label: "Đang cho con bú" },
                { value: "khong", label: "Không" },
              ] as const
            ).map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-1.5 text-sm"
              >
                <input
                  type="radio"
                  name="pregnancyStatus"
                  checked={data.pregnancyStatus === opt.value}
                  onChange={() => onChange("pregnancyStatus", opt.value)}
                  className="size-4 accent-[var(--color-primary)]"
                />
                {opt.label}
              </label>
            ))}
          </div>
          <ConditionalField
            show={data.pregnancyStatus === "mang_thai"}
            label="Thai kỳ thứ"
            value={data.pregnancyTrimester ?? ""}
            onChange={(v) => onChange("pregnancyTrimester", v)}
            placeholder="VD: 2"
          />
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-section-medical-history.tsx
git commit -m "feat(intake): add Section IV medical history component"
```

---

### Task 7: Create Section V — Family History

**Files:**
- Create: `src/components/receptionist/intake-section-family-history.tsx`

- [ ] **Step 1: Create the family history section component**

Create `src/components/receptionist/intake-section-family-history.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { IntakeFormData } from "./intake-form"
import type { FamilyHistoryEntry } from "@/data/mock-patients"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const FAMILY_EYE_CONDITIONS = [
  { key: "glaucoma", label: "Glaucoma (Tăng nhãn áp)" },
  { key: "duc_thuy_tinh_the", label: "Đục thủy tinh thể" },
  { key: "thoai_hoa_diem_vang", label: "Thoái hóa điểm vàng" },
  { key: "benh_vong_mac", label: "Bệnh võng mạc" },
  { key: "can_thi_nang", label: "Cận thị nặng" },
  { key: "mu_mau", label: "Mù màu" },
  { key: "lac_mat_luoi", label: "Mắt lác/Mắt lười" },
  { key: "bong_vong_mac", label: "Bong võng mạc" },
]

const FAMILY_MEDICAL_CONDITIONS = [
  { key: "dtd", label: "Đái tháo đường" },
  { key: "tang_huyet_ap", label: "Tăng huyết áp" },
  { key: "benh_tim_mach", label: "Bệnh tim mạch" },
  { key: "dot_quy", label: "Đột quỵ" },
  { key: "ung_thu", label: "Ung thư" },
  { key: "benh_tu_mien", label: "Bệnh tự miễn (Lupus, RA...)" },
]

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
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => {
          const entry = values[item.key] ?? { has: false }
          return (
            <div
              key={item.key}
              className="grid grid-cols-[1fr_1fr] items-center gap-4"
            >
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
                  className="h-8"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function IntakeSectionFamilyHistory({
  data,
  errors,
  onChange,
}: Props) {
  const familyEye = data.familyEyeHistory ?? {}
  const familyMedical = data.familyMedicalHistory ?? {}

  function updateEyeEntry(key: string, entry: FamilyHistoryEntry) {
    onChange("familyEyeHistory", { ...familyEye, [key]: entry })
  }

  function updateMedicalEntry(key: string, entry: FamilyHistoryEntry) {
    onChange("familyMedicalHistory", { ...familyMedical, [key]: entry })
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Có ai trong gia đình (bố mẹ, ông bà, anh chị em ruột) bị các bệnh sau
        không?
      </p>

      <FamilyHistoryGrid
        title="Bệnh mắt"
        items={FAMILY_EYE_CONDITIONS}
        values={familyEye}
        onChange={updateEyeEntry}
      />

      <FamilyHistoryGrid
        title="Bệnh toàn thân"
        items={FAMILY_MEDICAL_CONDITIONS}
        values={familyMedical}
        onChange={updateMedicalEntry}
      />

      {/* Other */}
      <div className="grid grid-cols-[1fr_1fr] items-center gap-4">
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
          <div className="flex gap-2">
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-section-family-history.tsx
git commit -m "feat(intake): add Section V family history component"
```

---

### Task 8: Create Section VI — Lifestyle

**Files:**
- Create: `src/components/receptionist/intake-section-lifestyle.tsx`

- [ ] **Step 1: Create the lifestyle section component**

Create `src/components/receptionist/intake-section-lifestyle.tsx`:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const SCREEN_TIME_OPTIONS = [
  { value: "<2h", label: "< 2 giờ" },
  { value: "2-4h", label: "2-4 giờ" },
  { value: "4-8h", label: "4-8 giờ" },
  { value: ">8h", label: "> 8 giờ" },
]

const OUTDOOR_TIME_OPTIONS = [
  { value: "<30m", label: "< 30 phút" },
  { value: "30-60m", label: "30-60 phút" },
  { value: "1-2h", label: "1-2 giờ" },
  { value: ">2h", label: "> 2 giờ" },
]

const SUNGLASSES_OPTIONS = [
  { value: "luon_luon", label: "Luôn luôn" },
  { value: "thinh_thoang", label: "Thỉnh thoảng" },
  { value: "khong_bao_gio", label: "Không bao giờ" },
]

const DRIVING_WHEN_OPTIONS = [
  { value: "ban_ngay", label: "Ban ngày" },
  { value: "ban_dem", label: "Ban đêm" },
  { value: "ca_hai", label: "Cả hai" },
]

function RadioRow({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: { value: string; label: string }[]
  value: string | undefined
  onChange: (value: string) => void
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt.value} className="flex items-center gap-1.5 text-sm">
          <input
            type="radio"
            name={name}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="size-4 accent-[var(--color-primary)]"
          />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

export function IntakeSectionLifestyle({ data, errors, onChange }: Props) {
  const smoking = data.smokingInfo ?? { status: "khong" as const }
  const alcohol = data.alcoholInfo ?? { status: "khong" as const }
  const driving = data.drivingInfo ?? { does: false }
  const sports = data.sportsInfo ?? { does: false }

  function updateSmoking(field: string, value: string) {
    onChange("smokingInfo", { ...smoking, [field]: value })
  }

  function updateAlcohol(field: string, value: string) {
    onChange("alcoholInfo", { ...alcohol, [field]: value })
  }

  return (
    <div className="space-y-5">
      {/* Smoking */}
      <div>
        <Label className="mb-1 block">Hút thuốc</Label>
        <div className="flex gap-4">
          {(
            [
              { value: "khong", label: "Không" },
              { value: "co", label: "Có" },
              { value: "da_bo", label: "Đã bỏ" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="smoking"
                checked={smoking.status === opt.value}
                onChange={() => updateSmoking("status", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {smoking.status === "co" && (
          <div className="mt-2 grid grid-cols-2 gap-6">
            <div>
              <Label className="text-sm text-muted-foreground">
                Số điếu/ngày
              </Label>
              <Input
                value={smoking.quantity ?? ""}
                onChange={(e) => updateSmoking("quantity", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Hút được bao nhiêu năm?
              </Label>
              <Input
                value={smoking.years ?? ""}
                onChange={(e) => updateSmoking("years", e.target.value)}
              />
            </div>
          </div>
        )}
        {smoking.status === "da_bo" && (
          <div className="mt-2">
            <Label className="text-sm text-muted-foreground">
              Bỏ từ năm nào?
            </Label>
            <Input
              value={smoking.quitYear ?? ""}
              onChange={(e) => updateSmoking("quitYear", e.target.value)}
              placeholder="VD: 2020"
              className="max-w-[200px]"
            />
          </div>
        )}
      </div>

      {/* Alcohol */}
      <div>
        <Label className="mb-1 block">Uống rượu/bia</Label>
        <div className="flex gap-4">
          {(
            [
              { value: "khong", label: "Không" },
              { value: "thinh_thoang", label: "Thỉnh thoảng" },
              { value: "thuong_xuyen", label: "Thường xuyên" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-1.5 text-sm"
            >
              <input
                type="radio"
                name="alcohol"
                checked={alcohol.status === opt.value}
                onChange={() => updateAlcohol("status", opt.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              {opt.label}
            </label>
          ))}
        </div>
        <ConditionalField
          show={alcohol.status === "thuong_xuyen"}
          label="Bao nhiêu lần/tuần?"
          value={alcohol.frequency ?? ""}
          onChange={(v) => updateAlcohol("frequency", v)}
        />
      </div>

      {/* Screen time */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">Thời gian máy tính/laptop mỗi ngày</Label>
          <RadioRow
            name="screenTimeComputer"
            options={SCREEN_TIME_OPTIONS}
            value={data.screenTimeComputer}
            onChange={(v) => onChange("screenTimeComputer", v)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Thời gian điện thoại/tablet mỗi ngày</Label>
          <RadioRow
            name="screenTimePhone"
            options={SCREEN_TIME_OPTIONS}
            value={data.screenTimePhone}
            onChange={(v) => onChange("screenTimePhone", v)}
          />
        </div>
      </div>

      {/* Outdoor time + Sunglasses */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">Thời gian hoạt động ngoài trời mỗi ngày</Label>
          <RadioRow
            name="outdoorTime"
            options={OUTDOOR_TIME_OPTIONS}
            value={data.outdoorTime}
            onChange={(v) => onChange("outdoorTime", v)}
          />
        </div>
        <div>
          <Label className="mb-1 block">Có đeo kính râm khi ra ngoài trời không?</Label>
          <RadioRow
            name="sunglassesUse"
            options={SUNGLASSES_OPTIONS}
            value={data.sunglassesUse}
            onChange={(v) => onChange("sunglassesUse", v)}
          />
        </div>
      </div>

      {/* Work conditions */}
      <div className="grid grid-cols-2 gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.workNearVision ?? false}
            onChange={(e) => onChange("workNearVision", e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Công việc yêu cầu nhìn gần nhiều (đọc, máy tính)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={data.workDustyChemical ?? false}
            onChange={(e) => onChange("workDustyChemical", e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Công việc trong môi trường bụi bặm, hóa chất
        </label>
      </div>

      {/* Driving */}
      <div>
        <Label className="mb-1 block">Lái xe thường xuyên</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="driving"
              checked={driving.does}
              onChange={() => onChange("drivingInfo", { does: true })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Có
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input
              type="radio"
              name="driving"
              checked={!driving.does}
              onChange={() => onChange("drivingInfo", { does: false })}
              className="size-4 accent-[var(--color-primary)]"
            />
            Không
          </label>
        </div>
        {driving.does && (
          <div className="mt-2">
            <RadioRow
              name="drivingWhen"
              options={DRIVING_WHEN_OPTIONS}
              value={driving.when}
              onChange={(v) =>
                onChange("drivingInfo", { does: true, when: v })
              }
            />
          </div>
        )}
      </div>

      {/* Sports + Hobbies */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <Label className="mb-1 block">Chơi thể thao</Label>
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="sports"
                checked={sports.does}
                onChange={() =>
                  onChange("sportsInfo", { does: true, type: sports.type })
                }
                className="size-4 accent-[var(--color-primary)]"
              />
              Có
            </label>
            <label className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name="sports"
                checked={!sports.does}
                onChange={() => onChange("sportsInfo", { does: false })}
                className="size-4 accent-[var(--color-primary)]"
              />
              Không
            </label>
          </div>
          <ConditionalField
            show={sports.does}
            label="Môn thể thao"
            value={sports.type ?? ""}
            onChange={(v) =>
              onChange("sportsInfo", { does: true, type: v })
            }
          />
        </div>
        <div>
          <Label>Sở thích đặc biệt (vẽ, may vá, thủ công...)</Label>
          <Input
            value={data.hobbies ?? ""}
            onChange={(e) => onChange("hobbies", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/receptionist/intake-section-lifestyle.tsx
git commit -m "feat(intake): add Section VI lifestyle component"
```

---

### Task 9: Create Section VII (Referral) & Section VIII (Consent)

**Files:**
- Create: `src/components/receptionist/intake-section-referral.tsx`
- Create: `src/components/receptionist/intake-section-consent.tsx`

- [ ] **Step 1: Create the referral section component**

Create `src/components/receptionist/intake-section-referral.tsx`:

```tsx
import { ConditionalField } from "./intake-conditional-field"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

const REFERRAL_OPTIONS = [
  { value: "ban_be", label: "Bạn bè/Người thân giới thiệu" },
  { value: "bac_si_khac", label: "Bác sĩ/Phòng khám khác giới thiệu" },
  { value: "internet", label: "Tìm kiếm trên Internet (Google, Facebook, Zalo...)" },
  { value: "quang_cao", label: "Quảng cáo trực tuyến (Facebook Ads, Google Ads...)" },
  { value: "website", label: "Website của phòng khám" },
  { value: "di_ngang", label: "Đi ngang qua phòng khám" },
  { value: "bao_chi", label: "Báo chí/Tạp chí" },
  { value: "su_kien", label: "Sự kiện/Hội thảo sức khỏe" },
  { value: "da_kham", label: "Đã từng khám tại đây" },
  { value: "khac", label: "Khác" },
]

const NEEDS_DETAIL = ["ban_be", "bac_si_khac", "khac"]

export function IntakeSectionReferral({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Bạn biết đến phòng khám của chúng tôi qua đâu?
      </p>
      <div className="grid grid-cols-2 gap-2">
        {REFERRAL_OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 ${
              data.referralSource === opt.value
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <input
              type="radio"
              name="referralSource"
              checked={data.referralSource === opt.value}
              onChange={() => onChange("referralSource", opt.value)}
              className="size-4 accent-[var(--color-primary)]"
            />
            {opt.label}
          </label>
        ))}
      </div>
      <ConditionalField
        show={NEEDS_DETAIL.includes(data.referralSource ?? "")}
        label={
          data.referralSource === "ban_be"
            ? "Tên người giới thiệu"
            : data.referralSource === "bac_si_khac"
              ? "Tên bác sĩ/phòng khám"
              : "Chi tiết"
        }
        value={data.referralDetail ?? ""}
        onChange={(v) => onChange("referralDetail", v)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create the consent section component**

Create `src/components/receptionist/intake-section-consent.tsx`:

```tsx
import { Label } from "@/components/ui/label"
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  errors: Record<string, string>
  onChange: (field: string, value: unknown) => void
}

export function IntakeSectionConsent({ data, errors, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        <p>
          Tôi xác nhận rằng tất cả thông tin trên là chính xác và đầy đủ theo
          hiểu biết của tôi. Tôi hiểu rằng việc cung cấp thông tin không chính
          xác có thể ảnh hưởng đến chẩn đoán và điều trị của tôi.
        </p>
        <p className="mt-2">
          Tôi đồng ý cho phép phòng khám sử dụng thông tin này cho mục đích
          khám, điều trị và lưu trữ hồ sơ y tế.
        </p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={data.consentConfirmed ?? false}
          onChange={(e) => onChange("consentConfirmed", e.target.checked)}
          className="size-4 accent-[var(--color-primary)]"
        />
        <span>
          Bệnh nhân đã đồng ý cung cấp thông tin
        </span>
      </label>
      <p className="text-xs text-muted-foreground italic">
        Chữ ký sẽ được thu thập trên bản in.
      </p>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/intake-section-referral.tsx src/components/receptionist/intake-section-consent.tsx
git commit -m "feat(intake): add Section VII referral and Section VIII consent components"
```

---

### Task 10: Refactor intake-form.tsx as Orchestrator

**Files:**
- Modify: `src/components/receptionist/intake-form.tsx`

This is the core task — rewrite the parent form to use all section components, define `IntakeFormData`, handle collapsible sections, and wire up validation/save.

- [ ] **Step 1: Rewrite intake-form.tsx**

Replace the entire contents of `src/components/receptionist/intake-form.tsx` with:

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  SymptomDetail,
  GlassesInfo,
  ContactLensDetail,
  EyeSurgery,
  RefractionValues,
  DiabetesDetail,
  CancerDetail,
  MedicationEntry,
  AllergiesInfo,
  FamilyHistoryEntry,
  SmokingInfo,
  AlcoholInfo,
  DrivingInfo,
  SportsInfo,
} from "@/data/mock-patients"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserAdd01Icon,
  Clock01Icon,
  PlusSignCircleIcon,
  TimeQuarterPassIcon,
  UserGroupIcon,
  HeartCheckIcon,
  Activity01Icon,
  Megaphone01Icon,
  Agreement02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons"
import { IntakeSectionPersonal } from "./intake-section-personal"
import { IntakeSectionComplaint } from "./intake-section-complaint"
import { IntakeSectionEyeHistory } from "./intake-section-eye-history"
import { IntakeSectionMedicalHistory } from "./intake-section-medical-history"
import { IntakeSectionFamilyHistory } from "./intake-section-family-history"
import { IntakeSectionLifestyle } from "./intake-section-lifestyle"
import { IntakeSectionReferral } from "./intake-section-referral"
import { IntakeSectionConsent } from "./intake-section-consent"
import { IntakePrintView } from "./intake-print-view"

export interface IntakeFormData {
  // Section I
  name: string
  gender: string
  dob: string
  phone: string
  email: string
  address: string
  district: string
  cityProvince: string
  occupation: string
  cccd: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  // Section II
  visitReasons: string[]
  visitReasonOther: string
  symptomDetail: SymptomDetail
  symptoms: Record<string, boolean>
  // Section III
  lastEyeExam: { date?: string; location?: string }
  currentGlasses: GlassesInfo
  contactLensStatus: string
  contactLensDetail: ContactLensDetail
  eyeInjury: { has: boolean; detail?: string }
  diagnosedEyeConditions: Record<string, boolean>
  diagnosedEyeConditionOther: string
  refractionValues: RefractionValues
  eyeSurgeries: EyeSurgery[]
  // Section IV
  primaryDoctor: { name?: string; lastVisit?: string }
  systemicConditions: Record<string, boolean>
  diabetesDetail: DiabetesDetail
  cancerDetail: CancerDetail
  systemicConditionOther: string
  medicationsList: MedicationEntry[]
  allergiesInfo: AllergiesInfo
  pregnancyStatus: string
  pregnancyTrimester: string
  // Section V
  familyEyeHistory: Record<string, FamilyHistoryEntry>
  familyMedicalHistory: Record<string, FamilyHistoryEntry>
  familyHistoryOther: { has: boolean; detail?: string; who?: string }
  // Section VI
  smokingInfo: SmokingInfo
  alcoholInfo: AlcoholInfo
  screenTimeComputer: string
  screenTimePhone: string
  outdoorTime: string
  sunglassesUse: string
  workNearVision: boolean
  workDustyChemical: boolean
  drivingInfo: DrivingInfo
  sportsInfo: SportsInfo
  hobbies: string
  // Section VII
  referralSource: string
  referralDetail: string
  // Section VIII
  consentConfirmed: boolean
}

function buildInitialForm(patient?: Patient): IntakeFormData {
  return {
    name: patient?.name ?? "",
    gender: patient?.gender ?? "",
    dob: patient?.dob ?? "",
    phone: patient?.phone ?? "",
    email: patient?.email ?? "",
    address: patient?.address ?? "",
    district: patient?.district ?? "",
    cityProvince: patient?.cityProvince ?? patient?.city ?? "",
    occupation: patient?.occupation ?? "",
    cccd: patient?.cccd ?? "",
    emergencyContactName: patient?.emergencyContact?.name ?? "",
    emergencyContactPhone: patient?.emergencyContact?.phone ?? "",
    emergencyContactRelationship: patient?.emergencyContact?.relationship ?? "",
    visitReasons: patient?.visitReasons ?? [],
    visitReasonOther: patient?.visitReasonOther ?? "",
    symptomDetail: patient?.symptomDetail ?? {},
    symptoms: patient?.symptoms ?? {},
    lastEyeExam: patient?.lastEyeExam ?? {},
    currentGlasses: patient?.currentGlasses ?? { types: [] },
    contactLensStatus: patient?.contactLensStatus ?? "",
    contactLensDetail: patient?.contactLensDetail ?? {},
    eyeInjury: patient?.eyeInjury ?? { has: false },
    diagnosedEyeConditions: patient?.diagnosedEyeConditions ?? {},
    diagnosedEyeConditionOther: patient?.diagnosedEyeConditionOther ?? "",
    refractionValues: patient?.refractionValues ?? {},
    eyeSurgeries: patient?.eyeSurgeries ?? [],
    primaryDoctor: patient?.primaryDoctor ?? {},
    systemicConditions: patient?.systemicConditions ?? {},
    diabetesDetail: patient?.diabetesDetail ?? {},
    cancerDetail: patient?.cancerDetail ?? {},
    systemicConditionOther: patient?.systemicConditionOther ?? "",
    medicationsList: patient?.medicationsList ?? [],
    allergiesInfo: patient?.allergiesInfo ?? { none: false, items: [] },
    pregnancyStatus: patient?.pregnancyStatus ?? "",
    pregnancyTrimester: patient?.pregnancyTrimester ?? "",
    familyEyeHistory: patient?.familyEyeHistory ?? {},
    familyMedicalHistory: patient?.familyMedicalHistory ?? {},
    familyHistoryOther: patient?.familyHistoryOther ?? { has: false },
    smokingInfo: patient?.smokingInfo ?? { status: "khong" },
    alcoholInfo: patient?.alcoholInfo ?? { status: "khong" },
    screenTimeComputer: patient?.screenTimeComputer ?? "",
    screenTimePhone: patient?.screenTimePhone ?? "",
    outdoorTime: patient?.outdoorTime ?? "",
    sunglassesUse: patient?.sunglassesUse ?? "",
    workNearVision: patient?.workNearVision ?? false,
    workDustyChemical: patient?.workDustyChemical ?? false,
    drivingInfo: patient?.drivingInfo ?? { does: false },
    sportsInfo: patient?.sportsInfo ?? { does: false },
    hobbies: patient?.hobbies ?? "",
    referralSource: patient?.referralSource ?? "",
    referralDetail: patient?.referralDetail ?? "",
    consentConfirmed: false,
  }
}

interface IntakeFormProps {
  patient?: Patient
}

const SECTIONS = [
  { id: "personal", num: "I", title: "Thông tin cá nhân", icon: UserAdd01Icon },
  { id: "complaint", num: "II", title: "Lý do khám và triệu chứng", icon: Clock01Icon },
  { id: "eyeHistory", num: "III", title: "Tiền sử mắt cá nhân", icon: PlusSignCircleIcon },
  { id: "medicalHistory", num: "IV", title: "Tiền sử y tế tổng quát", icon: HeartCheckIcon },
  { id: "familyHistory", num: "V", title: "Tiền sử gia đình về mắt và sức khỏe", icon: UserGroupIcon },
  { id: "lifestyle", num: "VI", title: "Thói quen sinh hoạt và công việc", icon: Activity01Icon },
  { id: "referral", num: "VII", title: "Nguồn thông tin về phòng khám", icon: Megaphone01Icon },
  { id: "consent", num: "VIII", title: "Cam kết", icon: Agreement02Icon },
]

export function IntakeForm({ patient }: IntakeFormProps) {
  const navigate = useNavigate()
  const { addPatient, updatePatient, searchPatients } = useReceptionist()

  const [form, setForm] = useState<IntakeFormData>(() =>
    buildInitialForm(patient)
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    () => Object.fromEntries(SECTIONS.map((s) => [s.id, true]))
  )
  const [showPrint, setShowPrint] = useState(false)

  const duplicatePatient =
    form.phone.length >= 10 && !patient
      ? searchPatients(form.phone).find((p) => p.phone === form.phone)
      : undefined

  function updateField(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Trường này không được bỏ trống"
    if (!form.gender) errs.gender = "Trường này không được bỏ trống"
    if (!form.dob) errs.dob = "Trường này không được bỏ trống"
    if (!form.phone) {
      errs.phone = "Trường này không được bỏ trống"
    } else if (!/^0\d{9,10}$/.test(form.phone)) {
      errs.phone = "SĐT phải có 10–11 số và bắt đầu bằng 0"
    }
    if (form.visitReasons.length === 0)
      errs.visitReasons = "Chọn ít nhất một lý do khám"
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Email không đúng định dạng"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave(goToScreening = false) {
    if (!validate()) return

    const data: Omit<Patient, "id" | "createdAt"> & Partial<Pick<Patient, "id" | "createdAt">> = {
      name: form.name.trim(),
      gender: form.gender as Patient["gender"],
      dob: form.dob,
      birthYear: parseInt(form.dob.split("/")[2] ?? "0", 10),
      phone: form.phone,
      email: form.email || undefined,
      address: form.address || undefined,
      district: form.district || undefined,
      cityProvince: form.cityProvince || undefined,
      occupation: form.occupation || undefined,
      cccd: form.cccd || undefined,
      emergencyContact:
        form.emergencyContactName
          ? {
              name: form.emergencyContactName,
              phone: form.emergencyContactPhone,
              relationship: form.emergencyContactRelationship,
            }
          : undefined,
      visitReasons: form.visitReasons,
      visitReasonOther: form.visitReasonOther || undefined,
      symptomDetail: Object.keys(form.symptomDetail).length > 0 ? form.symptomDetail : undefined,
      symptoms: Object.keys(form.symptoms).length > 0 ? form.symptoms : undefined,
      lastEyeExam: form.lastEyeExam?.date || form.lastEyeExam?.location ? form.lastEyeExam : undefined,
      currentGlasses: (form.currentGlasses?.types ?? []).length > 0 ? form.currentGlasses : undefined,
      contactLensStatus: (form.contactLensStatus as Patient["contactLensStatus"]) || undefined,
      contactLensDetail: form.contactLensStatus === "co" || form.contactLensStatus === "da_tung" ? form.contactLensDetail : undefined,
      eyeInjury: form.eyeInjury?.has ? form.eyeInjury : undefined,
      diagnosedEyeConditions: Object.values(form.diagnosedEyeConditions).some(Boolean) ? form.diagnosedEyeConditions : undefined,
      diagnosedEyeConditionOther: form.diagnosedEyeConditionOther || undefined,
      refractionValues: Object.keys(form.refractionValues).length > 0 ? form.refractionValues : undefined,
      eyeSurgeries: form.eyeSurgeries.length > 0 ? form.eyeSurgeries : undefined,
      primaryDoctor: form.primaryDoctor?.name || form.primaryDoctor?.lastVisit ? form.primaryDoctor : undefined,
      systemicConditions: Object.values(form.systemicConditions).some(Boolean) ? form.systemicConditions : undefined,
      diabetesDetail: form.diabetesDetail?.yearDiagnosed || form.diabetesDetail?.hba1c ? form.diabetesDetail : undefined,
      cancerDetail: form.cancerDetail?.type ? form.cancerDetail : undefined,
      systemicConditionOther: form.systemicConditionOther || undefined,
      medicationsList: form.medicationsList.length > 0 ? form.medicationsList : undefined,
      allergiesInfo: form.allergiesInfo.none || form.allergiesInfo.items.length > 0 ? form.allergiesInfo : undefined,
      pregnancyStatus: (form.pregnancyStatus as Patient["pregnancyStatus"]) || undefined,
      pregnancyTrimester: form.pregnancyTrimester || undefined,
      familyEyeHistory: Object.values(form.familyEyeHistory).some((e) => e.has) ? form.familyEyeHistory : undefined,
      familyMedicalHistory: Object.values(form.familyMedicalHistory).some((e) => e.has) ? form.familyMedicalHistory : undefined,
      familyHistoryOther: form.familyHistoryOther?.has ? form.familyHistoryOther : undefined,
      smokingInfo: form.smokingInfo,
      alcoholInfo: form.alcoholInfo,
      screenTimeComputer: form.screenTimeComputer || undefined,
      screenTimePhone: form.screenTimePhone || undefined,
      outdoorTime: form.outdoorTime || undefined,
      sunglassesUse: form.sunglassesUse || undefined,
      workNearVision: form.workNearVision || undefined,
      workDustyChemical: form.workDustyChemical || undefined,
      drivingInfo: form.drivingInfo?.does ? form.drivingInfo : undefined,
      sportsInfo: form.sportsInfo?.does ? form.sportsInfo : undefined,
      hobbies: form.hobbies || undefined,
      referralSource: form.referralSource || undefined,
      referralDetail: form.referralDetail || undefined,
      type: "kham_benh" as const,
      activeStatus: "hoat_dong" as const,
    }

    if (patient) {
      updatePatient(patient.id, data)
    } else {
      addPatient(data as Omit<Patient, "id" | "createdAt">)
    }

    if (goToScreening) {
      navigate("/screening")
    } else {
      navigate("/intake")
    }
  }

  function renderFieldError(field: string) {
    return errors[field] ? (
      <p className="mt-1 text-xs text-destructive">{errors[field]}</p>
    ) : null
  }

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const duplicateWarning = duplicatePatient ? (
    <div className="flex items-center justify-between rounded-md border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
      <span>
        SĐT <strong>{form.phone}</strong> đã tồn tại — BN:{" "}
        <strong>{duplicatePatient.name}</strong> ({duplicatePatient.birthYear})
      </span>
      <button
        className="font-semibold text-primary hover:underline"
        onClick={() => navigate(`/intake/${duplicatePatient!.id}/edit`)}
      >
        Mở hồ sơ cũ
      </button>
    </div>
  ) : null

  const sectionComponents: Record<string, React.ReactNode> = {
    personal: (
      <IntakeSectionPersonal
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
        duplicateWarning={duplicateWarning}
      />
    ),
    complaint: (
      <IntakeSectionComplaint
        data={form}
        errors={errors}
        onChange={updateField}
        renderFieldError={renderFieldError}
      />
    ),
    eyeHistory: (
      <IntakeSectionEyeHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    medicalHistory: (
      <IntakeSectionMedicalHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    familyHistory: (
      <IntakeSectionFamilyHistory
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    lifestyle: (
      <IntakeSectionLifestyle
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    referral: (
      <IntakeSectionReferral
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
    consent: (
      <IntakeSectionConsent
        data={form}
        errors={errors}
        onChange={updateField}
      />
    ),
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-6">
      {SECTIONS.map((section) => (
        <Collapsible
          key={section.id}
          open={openSections[section.id]}
          onOpenChange={() => toggleSection(section.id)}
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border bg-background px-5 py-3 text-left hover:bg-muted/50">
            <div className="flex items-center gap-2">
              <HugeiconsIcon
                icon={section.icon}
                className="size-5"
                strokeWidth={1.5}
              />
              <h2 className="text-lg font-bold">
                {section.num}. {section.title}
              </h2>
            </div>
            <HugeiconsIcon
              icon={openSections[section.id] ? ArrowUp01Icon : ArrowDown01Icon}
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-5 pt-4 pb-2">
            {sectionComponents[section.id]}
          </CollapsibleContent>
        </Collapsible>
      ))}

      {/* Footer actions */}
      <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background pt-4 pb-2">
        <Button variant="outline" onClick={() => navigate("/intake")}>
          Hủy
        </Button>
        <div className="flex gap-2">
          <Dialog open={showPrint} onOpenChange={setShowPrint}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <HugeiconsIcon
                  icon={PrinterIcon}
                  className="mr-1.5 size-4"
                  strokeWidth={1.5}
                />
                In phiếu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <IntakePrintView data={form} patientId={patient?.id} />
              <div className="flex justify-end gap-2 border-t pt-4 print:hidden">
                <Button variant="outline" onClick={() => setShowPrint(false)}>
                  Đóng
                </Button>
                <Button onClick={() => window.print()}>
                  <HugeiconsIcon
                    icon={PrinterIcon}
                    className="mr-1.5 size-4"
                    strokeWidth={1.5}
                  />
                  In
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => handleSave(false)}>
            Lưu
          </Button>
          <Button onClick={() => handleSave(true)}>
            Lưu & Sàng lọc →
          </Button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: May have some icon import issues — fix any missing icons by checking `@hugeicons/core-free-icons` exports. Replace any unavailable icons with existing ones (e.g., `PlusSignCircleIcon` for medical, `TimeQuarterPassIcon` for lifestyle).

- [ ] **Step 3: Run dev server and visually verify**

Run: `npm run dev`
Navigate to `http://localhost:3000/intake/new` and verify:
- All 8 collapsible sections render
- Sections expand/collapse
- Fields are interactive
- Required field validation works on save

- [ ] **Step 4: Commit**

```bash
git add src/components/receptionist/intake-form.tsx
git commit -m "feat(intake): refactor intake-form.tsx as orchestrator with 8 section components"
```

---

### Task 11: Create Print View

**Files:**
- Create: `src/components/receptionist/intake-print-view.tsx`

- [ ] **Step 1: Create the print view component**

Create `src/components/receptionist/intake-print-view.tsx`. This renders a print-optimized version of the form data, matching the .docx paper layout. Uses `@media print` CSS to hide non-print elements.

```tsx
import type { IntakeFormData } from "./intake-form"

interface Props {
  data: IntakeFormData
  patientId?: string
}

const VISIT_REASON_LABELS: Record<string, string> = {
  kham_dinh_ky: "Khám định kỳ/Kiểm tra tổng quát",
  giam_thi_luc: "Giảm thị lực",
  mo_mat: "Mờ mắt",
  nhuc_dau_dau_mat: "Nhức đầu/Đau mắt",
  dau_mat_kho_chiu: "Đau mắt hoặc khó chịu",
  kho_nhin_gan: "Khó nhìn gần",
  kho_nhin_xa: "Khó nhìn xa",
  kinh_ap_trong: "Muốn đeo kính áp tròng",
  tu_van_phau_thuat: "Tư vấn phẫu thuật",
  khac: "Khác",
}

const SYMPTOM_LABELS: Record<string, string> = {
  mo_mat: "Nhìn mờ/Giảm thị lực",
  nhin_doi: "Nhìn đôi",
  nhin_bien_dang: "Nhìn biến dạng",
  dom_bay: "Đốm bay",
  vong_sang: "Vòng sáng quanh đèn",
  chop_sang: "Chớp sáng",
  mat_thi_truong: "Mất thị trường",
  mo_thay_doi_theo_gio: "Mờ thay đổi theo giờ",
  nhuc_dau: "Nhức đầu",
  choi_sang: "Chói sáng",
  kho_mat: "Khô mắt",
  chay_nuoc_mat: "Chảy nước mắt",
  tiet_dich: "Tiết dịch/Ghèn",
  ngua_mat: "Ngứa mắt",
  do_mat: "Đỏ mắt",
  sung_mi: "Sưng mi mắt",
  moi_mat_doc: "Mỏi mắt khi đọc",
  kho_tap_trung_doc: "Khó tập trung khi đọc",
}

function Check({ checked }: { checked: boolean }) {
  return <span className="mr-1">{checked ? "☑" : "☐"}</span>
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <span>
      {label}: <span className="border-b border-black">{value || "___________________"}</span>
    </span>
  )
}

export function IntakePrintView({ data, patientId }: Props) {
  const today = new Date().toLocaleDateString("vi-VN")

  return (
    <div className="print-view space-y-6 text-sm leading-relaxed">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-view, .print-view * { visibility: visible; }
          .print-view { position: absolute; left: 0; top: 0; width: 100%; padding: 20mm; }
          @page { size: A4; margin: 15mm; }
        }
        .print-view { font-family: 'Times New Roman', serif; color: black; }
        .print-view h1 { font-size: 18px; font-weight: bold; text-align: center; }
        .print-view h2 { font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
        .print-view .check-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; }
      `}</style>

      {/* Header */}
      <div className="text-center">
        <p className="font-bold">PHÒNG KHÁM MẮT GANKA28</p>
        <h1>PHIẾU THÔNG TIN BỆNH NHÂN KHÁM MẮT TỔNG QUÁT</h1>
        <p>Ngày khám: {today}</p>
      </div>

      {/* Section I */}
      <div>
        <h2>I. THÔNG TIN CÁ NHÂN</h2>
        <p><Field label="Họ và tên" value={data.name} /> Giới tính: <Check checked={data.gender === "Nam"} />Nam <Check checked={data.gender === "Nữ"} />Nữ <Check checked={data.gender === "Khác"} />Khác</p>
        <p><Field label="Ngày sinh" value={data.dob} /> <Field label="CMND/CCCD" value={data.cccd} /></p>
        <p><Field label="Địa chỉ" value={data.address} /></p>
        <p><Field label="Quận/Huyện" value={data.district} /> <Field label="Thành phố/Tỉnh" value={data.cityProvince} /></p>
        <p><Field label="Số điện thoại" value={data.phone} /> <Field label="Email" value={data.email} /></p>
        <p><Field label="Nghề nghiệp" value={data.occupation} /></p>
        <p><Field label="Người liên hệ khẩn cấp" value={data.emergencyContactName} /> <Field label="SĐT" value={data.emergencyContactPhone} /></p>
      </div>

      {/* Section II */}
      <div>
        <h2>II. LÝ DO KHÁM VÀ TRIỆU CHỨNG</h2>
        <p className="font-medium">1. Lý do chính đến khám hôm nay:</p>
        <div className="check-grid">
          {Object.entries(VISIT_REASON_LABELS).map(([key, label]) => (
            <span key={key}><Check checked={data.visitReasons.includes(key)} />{label}</span>
          ))}
        </div>
        {data.visitReasonOther && <p>Khác: {data.visitReasonOther}</p>}

        {data.symptomDetail?.onset && (
          <>
            <p className="mt-2 font-medium">2. Mô tả chi tiết triệu chứng:</p>
            <p><Field label="Bắt đầu từ khi nào" value={data.symptomDetail.onset} /></p>
            <p>Mức độ: <Check checked={data.symptomDetail.severity === "nhe"} />Nhẹ <Check checked={data.symptomDetail.severity === "trung_binh"} />Trung bình <Check checked={data.symptomDetail.severity === "nang"} />Nặng</p>
          </>
        )}

        <p className="mt-2 font-medium">3. Bạn có gặp các triệu chứng sau không?</p>
        <div className="check-grid">
          {Object.entries(SYMPTOM_LABELS).map(([key, label]) => (
            <span key={key}><Check checked={data.symptoms?.[key] ?? false} />{label}</span>
          ))}
        </div>
      </div>

      {/* Section VIII — Consent */}
      <div>
        <h2>VIII. CAM KẾT VÀ CHỮ KÝ</h2>
        <p>
          Tôi xác nhận rằng tất cả thông tin trên là chính xác và đầy đủ theo
          hiểu biết của tôi. Tôi hiểu rằng việc cung cấp thông tin không chính
          xác có thể ảnh hưởng đến chẩn đoán và điều trị của tôi.
        </p>
        <p>
          Tôi đồng ý cho phép phòng khám sử dụng thông tin này cho mục đích
          khám, điều trị và lưu trữ hồ sơ y tế.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p>Chữ ký bệnh nhân: _________________________</p>
            <p>Ngày: ____/____/________</p>
          </div>
          <div>
            <p>Chữ ký người giám hộ (nếu có): _________________________</p>
            <p>Quan hệ: ___________ Ngày: ____/____/________</p>
          </div>
        </div>
      </div>

      {/* Staff section */}
      <div className="mt-8 border-t border-black pt-4">
        <p className="font-bold">PHẦN DÀNH CHO Y TẾ (Không điền)</p>
        <p><Field label="Bác sĩ khám" /> <Field label="Ngày khám" value={today} /></p>
        <p><Field label="Ghi chú sơ bộ" /></p>
        <p><Field label="Mã bệnh nhân" value={patientId} /></p>
      </div>
    </div>
  )
}
```

Note: This print view covers Sections I, II, and VIII in detail. Sections III-VII follow the same pattern (checkbox grids with Check component). For initial implementation, the print view focuses on the most critical sections. The remaining sections can be filled in following the exact same pattern — iterating over condition/lifestyle options with the `Check` component.

- [ ] **Step 2: Run dev server and test print**

Run: `npm run dev`
Navigate to `http://localhost:3000/intake/new`, fill some fields, click "In phiếu", verify the dialog shows the print view, click "In" and verify the browser print dialog shows a clean A4 layout.

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/intake-print-view.tsx
git commit -m "feat(intake): add printable intake form view"
```

---

### Task 12: Update checkin-modal.tsx References

**Files:**
- Modify: `src/components/receptionist/checkin-modal.tsx:30,52`

- [ ] **Step 1: Update chiefComplaint references**

The checkin modal currently reads `patient.chiefComplaint` to show the visit reason. Update it to also check `patient.visitReasons`.

In `src/components/receptionist/checkin-modal.tsx`, find the line that reads:

```typescript
patient.dob && patient.gender && (visit.reason || patient.chiefComplaint)
```

Replace with:

```typescript
patient.dob && patient.gender && (visit.reason || (patient.visitReasons && patient.visitReasons.length > 0) || patient.chiefComplaint)
```

Find the line that reads:

```typescript
value: visit.reason || patient.chiefComplaint,
```

Replace with:

```typescript
value: visit.reason || (patient.visitReasons && patient.visitReasons.length > 0 ? patient.visitReasons.join(", ") : patient.chiefComplaint),
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/receptionist/checkin-modal.tsx
git commit -m "fix(intake): update checkin modal to read visitReasons"
```

---

### Task 13: Final Typecheck, Lint & Visual Verification

**Files:** None (verification only)

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: PASS — fix any remaining type errors.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: PASS or only pre-existing warnings. Fix any new lint errors.

- [ ] **Step 3: Run format**

Run: `npm run format`

- [ ] **Step 4: Run dev server and full visual check**

Run: `npm run dev`
Navigate through:
1. `/intake/new` — verify all 8 sections, collapsible behavior, field interactions
2. Fill out form data, test conditional fields (smoking, glasses, surgeries, allergies)
3. Click "In phiếu" — verify print dialog
4. Save a new patient, verify redirect to `/intake`
5. Click into the saved patient to edit — verify data populates all sections
6. `/intake` dashboard — verify patient list still works

- [ ] **Step 5: Commit any fixes**

```bash
git add -A
git commit -m "fix(intake): address typecheck and lint issues from intake form expansion"
```
