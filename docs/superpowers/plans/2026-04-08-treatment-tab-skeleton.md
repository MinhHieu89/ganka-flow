# Liệu trình Skeleton Tab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Liệu trình" skeleton placeholder tab to the doctor exam sidebar, showing structured shimmer UI that hints at the future treatment course feature.

**Architecture:** Extend the existing `ExamTab` union type and tab config array with a new `"treatment"` entry. Create a new stateless `TabTreatment` component using the shadcn `Skeleton` component. Wire it into the exam page's conditional rendering.

**Tech Stack:** React, TypeScript, Tailwind CSS, shadcn/ui Skeleton, Hugeicons

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/components/doctor/exam-sidebar.tsx` | Modify | Extend `ExamTab` type, add tab config entry |
| `src/components/doctor/tab-treatment.tsx` | Create | Skeleton placeholder UI |
| `src/pages/doctor/exam.tsx` | Modify | Import and render `TabTreatment` |

---

### Task 1: Create the TabTreatment skeleton component

**Files:**
- Create: `src/components/doctor/tab-treatment.tsx`

- [ ] **Step 1: Create `tab-treatment.tsx` with the full skeleton layout**

```tsx
import { Skeleton } from "@/components/ui/skeleton"

export function TabTreatment() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">Liệu trình</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
          Sắp ra mắt
        </span>
      </div>

      {/* Course Summary Card */}
      <div className="rounded-lg border border-border p-5 space-y-4">
        <Skeleton className="h-4 w-[40%]" />
        <Skeleton className="h-3.5 w-[25%]" />
        <div className="flex gap-2.5 pt-1">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
      </div>

      {/* Session List */}
      <div className="rounded-lg border border-border p-5 space-y-3">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      {/* Detail Area */}
      <div className="rounded-lg border border-border p-5 space-y-3">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-3.5 w-[60%]" />
        <Skeleton className="h-3.5 w-[45%]" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify the file was created correctly**

Run: `npx tsc --noEmit 2>&1 | grep tab-treatment || echo "No type errors for tab-treatment"`

Expected: No errors related to `tab-treatment.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/components/doctor/tab-treatment.tsx
git commit -m "feat(doctor): add TabTreatment skeleton placeholder component"
```

---

### Task 2: Add the treatment tab to the sidebar and wire it into the exam page

**Files:**
- Modify: `src/components/doctor/exam-sidebar.tsx:1-27`
- Modify: `src/pages/doctor/exam.tsx:1-11,130-133`

- [ ] **Step 1: Extend `ExamTab` type and add tab config in `exam-sidebar.tsx`**

In `src/components/doctor/exam-sidebar.tsx`:

Add `IvBagIcon` to the import from `@hugeicons/core-free-icons`:

```typescript
import {
  User02Icon,
  ClipboardIcon,
  Note01Icon,
  Stethoscope02Icon,
  IvBagIcon,
} from "@hugeicons/core-free-icons"
```

Update the `ExamTab` type:

```typescript
export type ExamTab = "patient" | "preExam" | "requests" | "exam" | "treatment"
```

Add the treatment entry to the end of the `tabs` array:

```typescript
const tabs: {
  id: ExamTab
  label: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
}[] = [
  { id: "patient", label: "Bệnh nhân", icon: User02Icon },
  { id: "preExam", label: "Pre-Exam", icon: ClipboardIcon },
  { id: "requests", label: "Yêu cầu", icon: Note01Icon },
  { id: "exam", label: "Khám & kết luận", icon: Stethoscope02Icon },
  { id: "treatment", label: "Liệu trình", icon: IvBagIcon },
]
```

- [ ] **Step 2: Import `TabTreatment` and add conditional render in `exam.tsx`**

In `src/pages/doctor/exam.tsx`:

Add the import alongside the other tab imports:

```typescript
import { TabTreatment } from "@/components/doctor/tab-treatment"
```

Add the treatment tab render after the exam tab block (after line 132):

```tsx
{activeTab === "treatment" && <TabTreatment />}
```

The full render block should now read:

```tsx
{activeTab === "patient" && (
  <TabPatient patient={patient} visit={visit} />
)}
{activeTab === "preExam" && (
  <TabPreExam patient={patient} visit={visit} />
)}
{activeTab === "requests" && (
  <TabRequests
    requests={examData.requests}
    onAddRequest={handleAddRequest}
  />
)}
{activeTab === "exam" && (
  <TabExam examData={examData} onChange={setExamData} />
)}
{activeTab === "treatment" && <TabTreatment />}
```

- [ ] **Step 3: Type-check the full project**

Run: `npm run typecheck`

Expected: No errors.

- [ ] **Step 4: Build check**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/components/doctor/exam-sidebar.tsx src/pages/doctor/exam.tsx
git commit -m "feat(doctor): wire Liệu trình skeleton tab into sidebar and exam page"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start dev server and verify**

Run: `npm run dev`

Open the doctor exam page, click the "Liệu trình" tab in the sidebar. Verify:
- Tab appears as the last item in the sidebar with the IV bag icon
- Clicking it shows the skeleton layout with:
  - "Liệu trình" header and "Sắp ra mắt" badge
  - Course summary card with skeleton lines and 3 circles
  - Session list with 3 skeleton rows
  - Detail area with skeleton block and lines
- All other tabs still work correctly
- Active tab styling (blue text, left border indicator) applies to treatment tab

- [ ] **Step 2: Final commit if any visual tweaks needed**

Only if adjustments are made during visual verification.
