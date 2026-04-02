# Pre-Exam Step 2 — Disease Group Routing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Step 2 (disease group routing) to the pre-exam screening form, allowing technicians to select disease groups and fill in group-specific test data.

**Architecture:** Extend the existing `screening-form.tsx` to manage a `currentStep` state (1 or 2). Step 2 renders below the same patient header/step indicator. New components handle the summary card, group selector, group forms (Dry Eye with full fields, others as placeholders), and OSDI-6 modal. Uses `@dnd-kit` for drag-to-reorder.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Dialog, Collapsible), @dnd-kit/core + @dnd-kit/sortable, Radix UI, Hugeicons

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/data/mock-patients.ts` | Add `DryEyeFormData`, `Step2FormData` types, extend `ScreeningFormData` |
| `src/components/screening/screening-form.tsx` | Add `currentStep` state, render Step 1 or Step 2 content, modify "Tiếp tục" to transition |
| `src/components/screening/screening-step-indicator.tsx` | Add checkmark icon for completed step |
| `src/components/screening/screening-step2-summary.tsx` | Collapsible read-only Step 1 summary card |
| `src/components/screening/screening-step2-group-selector.tsx` | Toggle pills for multi-select disease groups |
| `src/components/screening/screening-step2-group-form.tsx` | Sortable wrapper card with drag handle for each group form |
| `src/components/screening/screening-step2-dry-eye.tsx` | Dry Eye form fields (OSDI button, TBUT, Schirmer, Meibomian, Staining) |
| `src/components/screening/screening-step2-osdi-modal.tsx` | OSDI-6 questionnaire modal with scoring |
| `src/components/screening/screening-step2-placeholder-group.tsx` | Placeholder form for Refraction, Myopia Control, General |

---

### Task 1: Install @dnd-kit and extend data types

**Files:**
- Modify: `package.json`
- Modify: `src/data/mock-patients.ts:50-76` (ScreeningFormData type)

- [ ] **Step 1: Install @dnd-kit packages**

Run:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Add Step 2 types to mock-patients.ts**

Add these types after the existing `ScreeningFormData` interface closing brace (after line 76):

```typescript
export type DiseaseGroup = "dryEye" | "refraction" | "myopiaControl" | "general"

export interface DryEyeFormData {
  osdiScore: number | null
  osdiAnswers: (number | null)[] // 6 answers, each 0-4 or null
  osdiSeverity: "normal" | "moderate" | "severe" | null
  tbutOd: string
  tbutOs: string
  schirmerOd: string
  schirmerOs: string
  meibomian: string
  staining: string
}

export interface Step2FormData {
  selectedGroups: DiseaseGroup[]
  groupOrder: DiseaseGroup[]
  dryEye: DryEyeFormData
}
```

- [ ] **Step 3: Add `step2` field to `ScreeningFormData`**

Add to the `ScreeningFormData` interface, after the `notes: string` field:

```typescript
  step2?: Step2FormData
```

- [ ] **Step 4: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (no type errors — `step2` is optional so existing code is unaffected)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/data/mock-patients.ts
git commit -m "feat: add Step 2 data types and install @dnd-kit"
```

---

### Task 2: Update step indicator to show checkmark for completed steps

**Files:**
- Modify: `src/components/screening/screening-step-indicator.tsx`

- [ ] **Step 1: Update the step indicator component**

Replace the entire file content:

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick01Icon } from "@hugeicons/core-free-icons"

interface ScreeningStepIndicatorProps {
  currentStep?: 1 | 2
}

export function ScreeningStepIndicator({
  currentStep = 1,
}: ScreeningStepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {currentStep > 1 ? (
            <HugeiconsIcon icon={Tick01Icon} className="size-3.5" />
          ) : (
            1
          )}
        </div>
        <span
          className={`text-sm ${
            currentStep >= 1
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Khám sàng lọc
        </span>
      </div>
      <div
        className={`h-px w-10 ${currentStep > 1 ? "bg-primary" : "bg-border"}`}
      />
      <div className="flex items-center gap-1.5">
        <div
          className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
            currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          2
        </div>
        <span
          className={`text-sm ${
            currentStep >= 2
              ? "font-semibold text-primary"
              : "text-muted-foreground"
          }`}
        >
          Phân loại nhóm bệnh
        </span>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the icon exists**

Run: `npm run typecheck`
Expected: PASS. If `Tick01Icon` doesn't exist, search hugeicons for an alternative check/tick icon and replace.

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step-indicator.tsx
git commit -m "feat: show checkmark on completed step in indicator"
```

---

### Task 3: Create Step 1 summary card

**Files:**
- Create: `src/components/screening/screening-step2-summary.tsx`

- [ ] **Step 1: Create the summary component**

Create `src/components/screening/screening-step2-summary.tsx`:

```tsx
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ClipboardIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { ScreeningFormData } from "@/data/mock-patients"

interface ScreeningStep2SummaryProps {
  form: ScreeningFormData
}

const SYMPTOM_LABELS: Record<string, string> = {
  dryEyes: "Khô mắt",
  gritty: "Cộm/rát mắt",
  blurry: "Nhìn mờ",
  tearing: "Chảy nước mắt",
  itchy: "Ngứa mắt",
  headache: "Nhức đầu",
}

const SEVERITY_LABELS: Record<string, string> = {
  mild: "Nhẹ",
  moderate: "Trung bình",
  severe: "Nặng",
}

const BLINK_LABELS: Record<string, string> = {
  yes: "Có",
  no: "Không",
  unclear: "Không rõ",
}

const DURATION_UNIT_LABELS: Record<string, string> = {
  ngày: "ngày",
  tuần: "tuần",
  tháng: "tháng",
  năm: "năm",
}

export function ScreeningStep2Summary({
  form,
}: ScreeningStep2SummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasRedFlags =
    form.redFlags.eyePain ||
    form.redFlags.suddenVisionLoss ||
    form.redFlags.asymmetry

  const checkedSymptoms = Object.entries(form.symptoms)
    .filter(([, v]) => v)
    .map(([k]) => SYMPTOM_LABELS[k])

  return (
    <section className="rounded-lg border border-border bg-background">
      {/* Header — always visible, toggles expand */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <HugeiconsIcon
            icon={ClipboardIcon}
            className="size-4"
            strokeWidth={1.5}
          />
          <span className="text-sm font-semibold">
            Tóm tắt sàng lọc (Bước 1)
          </span>
        </div>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
          strokeWidth={1.5}
        />
      </button>

      {/* Collapsed summary — always visible */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-3 text-sm text-muted-foreground">
        <span>
          <span className="font-medium text-foreground">Lý do:</span>{" "}
          {form.chiefComplaint || "—"}
        </span>
        <span>
          <span className="font-medium text-foreground">UCVA:</span>{" "}
          <span className="rounded bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
            OD
          </span>{" "}
          {form.ucvaOd || "—"}{" "}
          <span className="rounded bg-sky-500 px-1.5 py-0.5 text-xs font-bold text-white">
            OS
          </span>{" "}
          {form.ucvaOs || "—"}
        </span>
        {hasRedFlags ? (
          <span className="font-medium text-amber-600">
            ⚠ Red Flag
          </span>
        ) : (
          <span className="text-emerald-600">✓ Không có Red Flag</span>
        )}
      </div>

      {/* Symptom tags — always visible */}
      {(checkedSymptoms.length > 0 || form.discomfortLevel) && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {checkedSymptoms.map((s) => (
            <span
              key={s}
              className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {s}
            </span>
          ))}
          {form.discomfortLevel && (
            <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              Mức độ: {SEVERITY_LABELS[form.discomfortLevel]}
            </span>
          )}
        </div>
      )}

      {/* Expanded details */}
      {isOpen && (
        <div className="space-y-2 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {/* Red flags detail */}
          {hasRedFlags && (
            <div className="text-amber-600">
              <span className="font-medium">Red Flags:</span>{" "}
              {form.redFlags.eyePain && "Đau mắt nhiều"}
              {form.redFlags.suddenVisionLoss && ", Giảm thị lực đột ngột"}
              {form.redFlags.asymmetry && ", Triệu chứng lệch 1 bên"}
            </div>
          )}

          {/* Current Rx */}
          {(form.currentRxOd || form.currentRxOs) && (
            <div>
              <span className="font-medium text-foreground">Kính hiện tại:</span>{" "}
              OD {form.currentRxOd || "—"} · OS {form.currentRxOs || "—"}
            </div>
          )}

          {/* Screening questions */}
          {form.blinkImprovement && (
            <div>
              <span className="font-medium text-foreground">Chớp mắt cải thiện:</span>{" "}
              {BLINK_LABELS[form.blinkImprovement]}
            </div>
          )}
          {form.symptomDuration > 0 && (
            <div>
              <span className="font-medium text-foreground">Thời gian triệu chứng:</span>{" "}
              {form.symptomDuration} {DURATION_UNIT_LABELS[form.symptomDurationUnit]}
            </div>
          )}
          {form.screenTime && (
            <div>
              <span className="font-medium text-foreground">Màn hình:</span>{" "}
              {form.screenTime} giờ/ngày
            </div>
          )}
          {form.contactLens && (
            <div>
              <span className="font-medium text-foreground">Kính áp tròng:</span>{" "}
              {form.contactLens === "yes" ? "Có" : "Không"}
            </div>
          )}
          {form.notes && (
            <div>
              <span className="font-medium text-foreground">Ghi chú:</span>{" "}
              {form.notes}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-summary.tsx
git commit -m "feat: add Step 1 summary card for Step 2 view"
```

---

### Task 4: Create disease group selector (toggle pills)

**Files:**
- Create: `src/components/screening/screening-step2-group-selector.tsx`

- [ ] **Step 1: Create the group selector component**

Create `src/components/screening/screening-step2-group-selector.tsx`:

```tsx
import { HugeiconsIcon } from "@hugeicons/react"
import { Tag01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { DiseaseGroup } from "@/data/mock-patients"

interface ScreeningStep2GroupSelectorProps {
  selectedGroups: DiseaseGroup[]
  onToggle: (group: DiseaseGroup) => void
}

const DISEASE_GROUPS: {
  key: DiseaseGroup
  icon: string
  label: string
  testCount: number
}[] = [
  { key: "dryEye", icon: "👁️", label: "Khô mắt", testCount: 5 },
  { key: "refraction", icon: "🔍", label: "Khúc xạ", testCount: 3 },
  { key: "myopiaControl", icon: "📏", label: "Cận thị", testCount: 4 },
  { key: "general", icon: "🏥", label: "Tổng quát", testCount: 4 },
]

export { DISEASE_GROUPS }

export function ScreeningStep2GroupSelector({
  selectedGroups,
  onToggle,
}: ScreeningStep2GroupSelectorProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <HugeiconsIcon
          icon={Tag01Icon}
          className="size-4"
          strokeWidth={1.5}
        />
        <span className="text-sm font-semibold">Chọn nhóm bệnh</span>
        <span className="text-xs text-muted-foreground">
          (chọn 1 hoặc nhiều)
        </span>
      </div>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Chọn nhóm bệnh"
      >
        {DISEASE_GROUPS.map((group) => {
          const isSelected = selectedGroups.includes(group.key)
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onToggle(group.key)}
              aria-pressed={isSelected}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors",
                isSelected
                  ? "border-2 border-primary bg-primary/5 font-medium text-primary"
                  : "border border-border text-muted-foreground hover:bg-muted/50"
              )}
            >
              <span>{group.icon}</span>
              {group.label}
              {isSelected && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                  ✓
                </span>
              )}
            </button>
          )
        })}
      </div>
      {selectedGroups.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Chọn ít nhất 1 nhóm bệnh để tiếp tục
        </p>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-group-selector.tsx
git commit -m "feat: add disease group toggle pill selector"
```

---

### Task 5: Create OSDI-6 questionnaire modal

**Files:**
- Create: `src/components/screening/screening-step2-osdi-modal.tsx`

- [ ] **Step 1: Create the OSDI modal component**

Create `src/components/screening/screening-step2-osdi-modal.tsx`:

```tsx
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OsdiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAnswers: (number | null)[]
  onSubmit: (answers: (number | null)[], score: number) => void
}

const ANSWER_OPTIONS = [
  { label: "Không bao giờ", value: 0 },
  { label: "Thỉnh thoảng", value: 1 },
  { label: "Thường xuyên", value: 2 },
  { label: "Hầu hết thời gian", value: 3 },
  { label: "Liên tục", value: 4 },
]

const QUESTION_GROUPS = [
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, bạn có gặp phải bất kỳ triệu chứng nào của mắt dưới đây không:",
    questions: [
      "Chói mắt",
      "Nhìn mờ giữa các lần chớp mắt liên tục",
    ],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, các vấn đề về mắt có ảnh hưởng đến bạn chủ yếu trong việc thực hiện hoạt động nào sau đây:",
    questions: [
      "Lái xe hoặc ngồi trên xe vào ban đêm",
      "Xem tivi / thực hiện các hoạt động trên máy tính / đọc sách",
    ],
  },
  {
    title:
      "Trong một ngày điển hình trong 1 tuần qua, mắt bạn có cảm thấy khó chịu trong bất kỳ tình huống nào dưới đây không:",
    questions: [
      "Ở những nơi có gió thổi nhiều / khô bụi",
      "Ở những nơi có độ ẩm thấp hoặc có điều hòa",
    ],
  },
]

function getOsdiSeverity(score: number): {
  label: string
  key: "normal" | "moderate" | "severe"
  className: string
} {
  if (score <= 3)
    return {
      label: "Bình thường (0-3)",
      key: "normal",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }
  if (score <= 8)
    return {
      label: "Trung bình (4-8)",
      key: "moderate",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
    }
  return {
    label: "Nặng (≥9)",
    key: "severe",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  }
}

export { getOsdiSeverity }

export function ScreeningStep2OsdiModal({
  open,
  onOpenChange,
  initialAnswers,
  onSubmit,
}: OsdiModalProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => [...initialAnswers]
  )

  // Reset answers when modal opens
  function handleOpenChange(isOpen: boolean) {
    if (isOpen) {
      setAnswers([...initialAnswers])
    }
    onOpenChange(isOpen)
  }

  function setAnswer(questionIndex: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[questionIndex] = value
      return next
    })
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const totalScore = answers.reduce<number>(
    (sum, a) => sum + (a ?? 0),
    0
  )
  const severity = getOsdiSeverity(totalScore)

  function handleSubmit() {
    onSubmit(answers, totalScore)
    onOpenChange(false)
  }

  let questionIndex = 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="px-5 pt-5 pb-3">
          <DialogTitle>📝 Bảng hỏi OSDI-6</DialogTitle>
        </DialogHeader>

        <div className="max-h-[420px] overflow-y-auto px-5">
          {QUESTION_GROUPS.map((group, gi) => (
            <div key={gi}>
              <p className="border-b border-border py-3 text-sm font-medium text-muted-foreground">
                {group.title}
              </p>
              {group.questions.map((question) => {
                const qi = questionIndex++
                return (
                  <div
                    key={qi}
                    className="border-b border-border/50 py-3 last:border-b-0"
                  >
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-primary">
                        {qi + 1}.
                      </span>{" "}
                      {question}
                    </p>
                    <div
                      className="flex flex-wrap gap-1.5"
                      role="radiogroup"
                      aria-label={question}
                    >
                      {ANSWER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setAnswer(qi, opt.value)}
                          aria-checked={answers[qi] === opt.value}
                          role="radio"
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs transition-colors",
                            answers[qi] === opt.value
                              ? "border-2 border-primary bg-primary/5 font-semibold text-primary"
                              : "border border-border text-muted-foreground hover:bg-muted/50"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Scoring reference */}
        <div className="bg-muted/50 px-5 py-2 text-xs text-muted-foreground">
          <strong>Thang điểm tham chiếu:</strong> Không bao giờ = 0 ·
          Thỉnh thoảng = 1 · Thường xuyên = 2 · Hầu hết thời gian = 3 ·
          Liên tục = 4
        </div>

        <DialogFooter className="flex-row items-center justify-between border-t border-border px-5 py-3">
          <div className="text-sm text-muted-foreground" aria-live="polite">
            Tổng:{" "}
            <span className="text-lg font-bold text-foreground">
              {totalScore}
            </span>
            /24
            {answeredCount > 0 && (
              <span
                className={cn(
                  "ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium",
                  severity.className
                )}
              >
                {severity.label}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit}>Ghi nhận điểm</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-osdi-modal.tsx
git commit -m "feat: add OSDI-6 questionnaire modal with scoring"
```

---

### Task 6: Create Dry Eye form component

**Files:**
- Create: `src/components/screening/screening-step2-dry-eye.tsx`

- [ ] **Step 1: Create the Dry Eye form**

Create `src/components/screening/screening-step2-dry-eye.tsx`:

```tsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { DryEyeFormData } from "@/data/mock-patients"
import {
  ScreeningStep2OsdiModal,
  getOsdiSeverity,
} from "./screening-step2-osdi-modal"
import { cn } from "@/lib/utils"

interface ScreeningStep2DryEyeProps {
  data: DryEyeFormData
  onUpdate: (data: DryEyeFormData) => void
}

export function ScreeningStep2DryEye({
  data,
  onUpdate,
}: ScreeningStep2DryEyeProps) {
  const [osdiOpen, setOsdiOpen] = useState(false)

  function updateField<K extends keyof DryEyeFormData>(
    field: K,
    value: DryEyeFormData[K]
  ) {
    onUpdate({ ...data, [field]: value })
  }

  function handleOsdiSubmit(answers: (number | null)[], score: number) {
    const severity = getOsdiSeverity(score)
    onUpdate({
      ...data,
      osdiAnswers: answers,
      osdiScore: score,
      osdiSeverity: severity.key,
    })
  }

  const hasOsdiScore = data.osdiScore !== null

  return (
    <div className="space-y-4">
      {/* OSDI-6 Score */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          OSDI-6 Score
        </Label>
        <div className="flex items-center gap-3">
          {hasOsdiScore ? (
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-border px-4 py-2.5">
              <span className="text-xl font-bold">{data.osdiScore}</span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  getOsdiSeverity(data.osdiScore!).className
                )}
              >
                {getOsdiSeverity(data.osdiScore!).label}
              </span>
              <span className="ml-auto text-xs text-muted-foreground">
                6/6 câu đã trả lời
              </span>
            </div>
          ) : (
            <div className="flex-1 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground">
              Chưa đánh giá
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => setOsdiOpen(true)}
            className={cn(
              hasOsdiScore
                ? "text-muted-foreground"
                : "border-primary text-primary"
            )}
          >
            {hasOsdiScore ? "✏️ Làm lại" : "📝 Làm bảng hỏi OSDI"}
          </Button>
        </div>
      </div>

      {/* TBUT (OD/OS) */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          TBUT (giây)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOd}
              onChange={(e) => updateField("tbutOd", e.target.value)}
              placeholder="VD: 5"
              aria-label="TBUT mắt phải (OD)"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.tbutOs}
              onChange={(e) => updateField("tbutOs", e.target.value)}
              placeholder="VD: 5"
              aria-label="TBUT mắt trái (OS)"
            />
          </div>
        </div>
      </div>

      {/* Schirmer (OD/OS) */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          Schirmer (mm)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              OD
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOd}
              onChange={(e) => updateField("schirmerOd", e.target.value)}
              placeholder="VD: 10"
              aria-label="Schirmer mắt phải (OD)"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-sky-500 px-2.5 py-1 text-xs font-bold text-white">
              OS
            </span>
            <Input
              type="number"
              min={0}
              value={data.schirmerOs}
              onChange={(e) => updateField("schirmerOs", e.target.value)}
              placeholder="VD: 10"
              aria-label="Schirmer mắt trái (OS)"
            />
          </div>
        </div>
      </div>

      {/* Meibomian */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          Meibomian
        </Label>
        <Textarea
          value={data.meibomian}
          onChange={(e) => updateField("meibomian", e.target.value)}
          placeholder="Mô tả tình trạng tuyến Meibomian..."
          rows={2}
        />
      </div>

      {/* Staining */}
      <div>
        <Label className="mb-1.5 block text-xs font-semibold">
          Staining
        </Label>
        <Textarea
          value={data.staining}
          onChange={(e) => updateField("staining", e.target.value)}
          placeholder="Mô tả kết quả nhuộm..."
          rows={2}
        />
      </div>

      <ScreeningStep2OsdiModal
        open={osdiOpen}
        onOpenChange={setOsdiOpen}
        initialAnswers={data.osdiAnswers}
        onSubmit={handleOsdiSubmit}
      />
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-dry-eye.tsx
git commit -m "feat: add Dry Eye form with OSDI-6 integration"
```

---

### Task 7: Create placeholder group form component

**Files:**
- Create: `src/components/screening/screening-step2-placeholder-group.tsx`

- [ ] **Step 1: Create the placeholder component**

Create `src/components/screening/screening-step2-placeholder-group.tsx`:

```tsx
import type { DiseaseGroup } from "@/data/mock-patients"

interface ScreeningStep2PlaceholderGroupProps {
  group: DiseaseGroup
}

const GROUP_TESTS: Record<DiseaseGroup, string[]> = {
  dryEye: [], // not used — Dry Eye has its own form
  refraction: ["Full refraction", "Current glasses", "VA"],
  myopiaControl: ["Axial length", "Progression", "Lifestyle", "Risk scoring"],
  general: ["VA", "IOP", "Slit-lamp", "Fundus"],
}

export function ScreeningStep2PlaceholderGroup({
  group,
}: ScreeningStep2PlaceholderGroupProps) {
  const tests = GROUP_TESTS[group]
  const cols = tests.length === 3 ? "grid-cols-3" : "grid-cols-2"

  return (
    <div className={`grid ${cols} gap-3`}>
      {tests.map((test) => (
        <div
          key={test}
          className="rounded-lg border border-dashed border-border bg-muted/50 p-6 text-center dark:bg-muted/30"
        >
          <p className="text-sm font-medium text-foreground">{test}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Chi tiết sẽ được thiết kế sau
          </p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-placeholder-group.tsx
git commit -m "feat: add placeholder form for non-Dry-Eye groups"
```

---

### Task 8: Create sortable group form wrapper

**Files:**
- Create: `src/components/screening/screening-step2-group-form.tsx`

- [ ] **Step 1: Create the sortable group form wrapper**

Create `src/components/screening/screening-step2-group-form.tsx`:

```tsx
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { DiseaseGroup, DryEyeFormData } from "@/data/mock-patients"
import { DISEASE_GROUPS } from "./screening-step2-group-selector"
import { ScreeningStep2DryEye } from "./screening-step2-dry-eye"
import { ScreeningStep2PlaceholderGroup } from "./screening-step2-placeholder-group"

interface ScreeningStep2GroupFormProps {
  group: DiseaseGroup
  dryEyeData: DryEyeFormData
  onDryEyeUpdate: (data: DryEyeFormData) => void
}

export function ScreeningStep2GroupForm({
  group,
  dryEyeData,
  onDryEyeUpdate,
}: ScreeningStep2GroupFormProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: group })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const groupInfo = DISEASE_GROUPS.find((g) => g.key === group)!

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-border bg-background"
    >
      {/* Card header */}
      <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label="Kéo để sắp xếp"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
        <span className="text-lg">{groupInfo.icon}</span>
        <span className="text-sm font-semibold">{groupInfo.label}</span>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
          {groupInfo.testCount} tests
        </span>
      </div>

      {/* Card body */}
      <div className="p-4">
        {group === "dryEye" ? (
          <ScreeningStep2DryEye
            data={dryEyeData}
            onUpdate={onDryEyeUpdate}
          />
        ) : (
          <ScreeningStep2PlaceholderGroup group={group} />
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/screening/screening-step2-group-form.tsx
git commit -m "feat: add sortable group form wrapper with drag handle"
```

---

### Task 9: Wire Step 2 into screening-form.tsx

**Files:**
- Modify: `src/components/screening/screening-form.tsx`

This is the main integration task. The existing form becomes "Step 1" and we add Step 2 rendering.

- [ ] **Step 1: Replace screening-form.tsx with step-aware version**

Replace the entire file content of `src/components/screening/screening-form.tsx`:

```tsx
import { useState } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { useReceptionist } from "@/contexts/receptionist-context"
import type {
  Patient,
  Visit,
  ScreeningFormData,
  DiseaseGroup,
  DryEyeFormData,
  Step2FormData,
} from "@/data/mock-patients"
import { ScreeningFormHeader } from "./screening-form-header"
import { ScreeningStepIndicator } from "./screening-step-indicator"
import { ScreeningFormInitial } from "./screening-form-initial"
import { ScreeningFormRedFlags } from "./screening-form-red-flags"
import { ScreeningFormQuestions } from "./screening-form-questions"
import { ScreeningFormNotes } from "./screening-form-notes"
import { ScreeningStep2Summary } from "./screening-step2-summary"
import { ScreeningStep2GroupSelector } from "./screening-step2-group-selector"
import { ScreeningStep2GroupForm } from "./screening-step2-group-form"

interface ScreeningFormProps {
  patient: Patient
  visit: Visit
}

const INITIAL_FORM: ScreeningFormData = {
  chiefComplaint: "",
  ucvaOd: "",
  ucvaOs: "",
  currentRxOd: "",
  currentRxOs: "",
  redFlags: {
    eyePain: false,
    suddenVisionLoss: false,
    asymmetry: false,
  },
  symptoms: {
    dryEyes: false,
    gritty: false,
    blurry: false,
    tearing: false,
    itchy: false,
    headache: false,
  },
  blinkImprovement: null,
  symptomDuration: 0,
  symptomDurationUnit: "ngày",
  screenTime: "",
  contactLens: null,
  discomfortLevel: null,
  notes: "",
}

const INITIAL_DRY_EYE: DryEyeFormData = {
  osdiScore: null,
  osdiAnswers: [null, null, null, null, null, null],
  osdiSeverity: null,
  tbutOd: "",
  tbutOs: "",
  schirmerOd: "",
  schirmerOs: "",
  meibomian: "",
  staining: "",
}

const INITIAL_STEP2: Step2FormData = {
  selectedGroups: [],
  groupOrder: [],
  dryEye: INITIAL_DRY_EYE,
}

export function ScreeningForm({ patient, visit }: ScreeningFormProps) {
  const navigate = useNavigate()
  const { saveScreeningData, updateVisitStatus } = useReceptionist()

  const [form, setForm] = useState<ScreeningFormData>(
    visit.screeningData ?? INITIAL_FORM
  )
  const [step2, setStep2] = useState<Step2FormData>(
    visit.screeningData?.step2 ?? INITIAL_STEP2
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDirty, setIsDirty] = useState(false)

  // Determine initial step: if step2 data exists, start on step 2
  const [currentStep, setCurrentStep] = useState<1 | 2>(
    visit.screeningData?.step2 ? 2 : 1
  )

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function updateField<K extends keyof ScreeningFormData>(
    field: K,
    value: ScreeningFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field as string]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!form.chiefComplaint.trim())
      errs.chiefComplaint = "Vui lòng nhập lý do đến khám"
    if (!form.ucvaOd.trim()) errs.ucvaOd = "Vui lòng nhập thị lực mắt phải"
    if (!form.ucvaOs.trim()) errs.ucvaOs = "Vui lòng nhập thị lực mắt trái"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function getFullData(): ScreeningFormData {
    return { ...form, step2 }
  }

  // --- Step 1 handlers ---

  function handleCancel() {
    if (isDirty) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?"
      )
      if (!confirmed) return
    }
    navigate("/screening")
  }

  function handleSaveDraft() {
    saveScreeningData(visit.id, getFullData())
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleContinueToStep2() {
    if (!validate()) return
    saveScreeningData(visit.id, getFullData())
    setCurrentStep(2)
  }

  function handleFastTrack() {
    saveScreeningData(visit.id, getFullData())
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.warning("Đã chuyển bệnh nhân đến bác sĩ (Red Flag)")
  }

  // --- Step 2 handlers ---

  function handleBackToStep1() {
    setCurrentStep(1)
  }

  function handleStep2SaveDraft() {
    saveScreeningData(visit.id, getFullData())
    setIsDirty(false)
    navigate("/screening")
    toast.success("Đã lưu nháp")
  }

  function handleComplete() {
    saveScreeningData(visit.id, getFullData())
    updateVisitStatus(visit.id, "dang_kham")
    navigate("/screening")
    toast.success("Hoàn thành sàng lọc — chờ bác sĩ khám")
  }

  function toggleGroup(group: DiseaseGroup) {
    setStep2((prev) => {
      const isSelected = prev.selectedGroups.includes(group)
      if (isSelected) {
        return {
          ...prev,
          selectedGroups: prev.selectedGroups.filter((g) => g !== group),
          groupOrder: prev.groupOrder.filter((g) => g !== group),
        }
      }
      return {
        ...prev,
        selectedGroups: [...prev.selectedGroups, group],
        groupOrder: [...prev.groupOrder, group],
      }
    })
    setIsDirty(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setStep2((prev) => {
        const oldIndex = prev.groupOrder.indexOf(active.id as DiseaseGroup)
        const newIndex = prev.groupOrder.indexOf(over.id as DiseaseGroup)
        return {
          ...prev,
          groupOrder: arrayMove(prev.groupOrder, oldIndex, newIndex),
        }
      })
      setIsDirty(true)
    }
  }

  function handleDryEyeUpdate(data: DryEyeFormData) {
    setStep2((prev) => ({ ...prev, dryEye: data }))
    setIsDirty(true)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <ScreeningFormHeader patient={patient} visit={visit} />
      <ScreeningStepIndicator currentStep={currentStep} />

      {currentStep === 1 ? (
        <>
          <ScreeningFormInitial
            form={form}
            errors={errors}
            onUpdate={updateField}
          />
          <ScreeningFormRedFlags
            form={form}
            onUpdate={updateField}
            onFastTrack={handleFastTrack}
          />
          <ScreeningFormQuestions form={form} onUpdate={updateField} />
          <ScreeningFormNotes form={form} onUpdate={updateField} />

          {/* Step 1 Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleSaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleContinueToStep2}>Tiếp tục →</Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <ScreeningStep2Summary form={form} />
          <ScreeningStep2GroupSelector
            selectedGroups={step2.selectedGroups}
            onToggle={toggleGroup}
          />

          {/* Sortable group forms */}
          {step2.groupOrder.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={step2.groupOrder}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {step2.groupOrder.map((group) => (
                    <ScreeningStep2GroupForm
                      key={group}
                      group={group}
                      dryEyeData={step2.dryEye}
                      onDryEyeUpdate={handleDryEyeUpdate}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* Step 2 Footer */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="outline" onClick={handleBackToStep1}>
              ← Quay lại
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleStep2SaveDraft}>
                Lưu nháp
              </Button>
              <Button onClick={handleComplete}>Hoàn thành →</Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Run dev server and test manually**

Run: `npm run dev`

Test:
1. Navigate to `/screening`, click "Bắt đầu sàng lọc" on a patient
2. Fill Step 1 fields (chief complaint, UCVA), click "Tiếp tục →"
3. Verify step indicator shows checkmark on step 1, step 2 is active
4. Verify Step 1 summary card shows with correct data
5. Select "Khô mắt" pill → Dry Eye form appears
6. Select "Khúc xạ" pill → Refraction placeholder appears below
7. Click "📝 Làm bảng hỏi OSDI" → modal opens, fill answers, submit
8. Verify OSDI score displays in Dry Eye form
9. Drag to reorder groups
10. Click "← Quay lại" → returns to Step 1 with data preserved
11. Click "Tiếp tục →" again → Step 2 data still there
12. Click "Lưu nháp" → navigates to dashboard with toast
13. Click "Tiếp tục" on same patient → restores both steps
14. Click "Hoàn thành →" → navigates to dashboard, visit status changes

- [ ] **Step 4: Commit**

```bash
git add src/components/screening/screening-form.tsx
git commit -m "feat: wire Step 2 into screening form with step navigation"
```

---

### Task 10: Format and final check

**Files:**
- All modified/created files

- [ ] **Step 1: Run formatter**

Run: `npm run format`

- [ ] **Step 2: Run linter**

Run: `npm run lint`
Fix any issues reported.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS with zero errors

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 5: Commit any formatting changes**

```bash
git add -A
git commit -m "chore: format Step 2 screening components"
```
