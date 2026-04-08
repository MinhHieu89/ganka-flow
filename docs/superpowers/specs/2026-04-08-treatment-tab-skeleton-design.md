# Liệu trình Tab — Skeleton Placeholder

**Date:** 2026-04-08
**Scope:** Add a "Liệu trình" (Treatment Course) skeleton tab to the doctor exam sidebar

## Overview

Add a fifth tab to the doctor examination page sidebar. The tab shows structured skeleton UI hinting at the future treatment course feature (Phase 2). This gives staff a preview of what's coming and establishes the navigation entry point.

## Changes

### 1. `src/components/doctor/exam-sidebar.tsx`

Extend the `ExamTab` union type:

```typescript
export type ExamTab = "patient" | "preExam" | "requests" | "exam" | "treatment"
```

Add to the `tabs` config array (last position):

```typescript
{ id: "treatment", label: "Liệu trình", icon: IvBagIcon }
```

Icon: `IvBagIcon` from `@hugeicons/core-free-icons` — represents medical treatment/infusion. If unavailable, fall back to `MedicalMaskIcon` or `HospitalBedIcon`.

### 2. `src/pages/doctor/exam.tsx`

Add conditional render for the treatment tab:

```tsx
{activeTab === "treatment" && <TabTreatment />}
```

Import from `@/components/doctor/tab-treatment`.

### 3. `src/components/doctor/tab-treatment.tsx` (new file)

A stateless component using the shadcn `Skeleton` component (`@/components/ui/skeleton`).

**Layout structure:**

```
┌──────────────────────────────────────────────────┐
│  Section header: "Liệu trình"                   │
│  "Sắp ra mắt" muted badge (top-right)           │
│                                                  │
│  ┌─ Course Summary Card ───────────────────────┐ │
│  │  Skeleton line (40% width) — treatment type │ │
│  │  Skeleton line (25% width) — status         │ │
│  │  3 skeleton circles inline — session dots   │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ Session List ──────────────────────────────┐ │
│  │  Skeleton row — session 1                   │ │
│  │  Skeleton row — session 2                   │ │
│  │  Skeleton row — session 3                   │ │
│  └─────────────────────────────────────────────┘ │
│                                                  │
│  ┌─ Detail Area ───────────────────────────────┐ │
│  │  Skeleton block (100% x 80px)               │ │
│  │  Skeleton line (60% width)                  │ │
│  │  Skeleton line (45% width)                  │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Styling notes:**
- Use the same padding/spacing patterns as other tab components (e.g., `TabPatient`)
- "Sắp ra mắt" badge: small muted text with `bg-muted` background and `text-muted-foreground`, rounded pill
- Skeleton elements use the existing `Skeleton` component (animate-pulse, bg-muted, rounded-md)
- Session dots: small circles (`rounded-full`, ~24px) with gaps between them
- Session rows: horizontal skeleton bars with consistent height (~40px) and vertical spacing
- No interactivity — purely visual placeholder

## Out of Scope

- Actual treatment course data, state management, or API calls
- Any business logic (session tracking, OSDI, consumables, payments)
- These will be implemented in Phase 2
