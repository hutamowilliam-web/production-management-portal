# Visual Design Guide - Phase 2

## Design System Overview

### Color Palette

#### Primary Statuses
```
Pending/Awaiting    🟡 Yellow    #FCD34D → #F59E0B
In Progress/Active  🔵 Blue      #3B82F6 → #2563EB
Completed/Success   🟢 Green     #86EFAC → #22C55E
Escalated/Caution   🟠 Orange    #FB923C → #F97316
Error/Critical      🔴 Red       #EF5350 → #DC2626
Closed/Archived     ⚫ Gray      #D1D5DB → #6B7280
```

#### Tailwind Color Classes
```
Pending:   bg-yellow-100  text-yellow-800   border-yellow-300
Active:    bg-blue-100    text-blue-800     border-blue-300
Success:   bg-green-100   text-green-800    border-green-300
Escalated: bg-orange-100  text-orange-800   border-orange-300
Error:     bg-red-100     text-red-800      border-red-300
Archived:  bg-gray-100    text-gray-800     border-gray-300

Dark Mode:
Pending:   dark:bg-yellow-900/20  dark:text-yellow-400
Active:    dark:bg-blue-900/20    dark:text-blue-400
Success:   dark:bg-green-900/20   dark:text-green-400
Escalated: dark:bg-orange-900/20  dark:text-orange-400
Error:     dark:bg-red-900/20     dark:text-red-400
Archived:  dark:bg-gray-700       dark:text-gray-200
```

---

## Component Layouts

### StatusBadge Variants

**Solid Variant**:
```
┌──────────────────┐
│ ✓ Completed      │  bg-green-100 text-green-800
└──────────────────┘
```

**Outline Variant**:
```
┌──────────────────┐
│ ✓ Completed      │  border border-green-300 text-green-700
└──────────────────┘
```

**Subtle Variant**:
```
✓ Completed        text-green-700 (no background)
```

**Sizes**:
- **sm**: px-2 py-1 text-xs gap-1       (Compact)
- **md**: px-3 py-1.5 text-sm gap-1.5   (Default)
- **lg**: px-4 py-2 text-base gap-2     (Large)

---

### DataTable Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [Search Icon] Search...          [Filter Icon]  {record count}
├─────────────────────────────────────────────────────────────┤
│ ☑ │ Column1↑ │ Column2 │ Column3↓ │ Column4 │ Column5    │
├─────────────────────────────────────────────────────────────┤
│ ☐ │ Value   │ Value  │ Value   │ Value  │ Value      │
│ ☑ │ Value   │ Value  │ Value   │ Value  │ Value      │
│ ☐ │ Value   │ Value  │ Value   │ Value  │ Value      │
├─────────────────────────────────────────────────────────────┤
│ Showing 1 to 3 of 15 records    [< Prev]  Page 1 of 5  [Next >]
└─────────────────────────────────────────────────────────────┘

Filter Panel (when open):
┌─────────────────────────────────────────────────────────────┐
│ Column1:  [Filter...]  Column2:  [Filter...]              │
│ Column3:  [Filter...]  Column4:  [Filter...]              │
│ Column5:  [Filter...]  Column6:  [Filter...]              │
└─────────────────────────────────────────────────────────────┘
```

---

### StatusTimeline Vertical

```
┌─ 2024-01-15 10:00 AM
│  ✓ Submitted
│  John Doe submitted reject ticket
│
├─ 2024-01-15 11:30 AM
│  ⏳ Under Review (spinning)
│  Quality Manager reviewing
│
├─ 2024-01-15 14:00 PM
│  ⭕ Awaiting Approval
│  
└─ +2 more items
```

### StatusTimeline Horizontal

```
┌─────┬─────┬─────┬─────┐
│ ✓   │ ⏳  │ ⭕  │ ⚠️  │
└─────┴─────┴─────┴─────┘
Title Title Title Title
Sub   Sub   Sub   Sub
```

---

### PerformanceIndicator

```
┌────────────────────────────────────┐
│ Pending Items          (or ⚠️ icon) │
│ 15                                 │
│ ↑ 25% increase  Target: 10         │
└────────────────────────────────────┘

Status Colors:
- Green background: current < warning
- Yellow background: warning ≤ current < critical
- Red background: critical ≤ current (+ alert icon)
```

---

## Dashboard Layout

```
╔═══════════════════════════════════════════════════════════════╗
║ Welcome back, John! Embroidery • Supervisor   Monday, Jan 15 ║
╚═══════════════════════════════════════════════════════════════╝

┌─────────────┬─────────────┬─────────────┬─────────────────────┐
│ 6 Rejects   │ 2 Returns   │ 3 Open SOP  │ 5 Open Maintenance  │
│ R45,200.00  │ R12,500.00  │ 1 escalated │ 2 urgent (72h+)     │
└─────────────┴─────────────┴─────────────┴─────────────────────┘

┌──────────────────┬──────────────────┬──────────────────────────┐
│ Pending Items    │ Escalated 48h+   │ Critical 72h+           │
│ 5 (warning ⚠️)   │ 2 (warning ⚠️)    │ 1 (critical 🔴)        │
└──────────────────┴──────────────────┴──────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Action Required: You have 1 items requiring immediate action │
└─────────────────────────────────────────────────────────────────┘

┌────────────────────────────────┬────────────────────────────────┐
│ Items Requiring Attention      │ Activity Feed                  │
│                                │                                │
│ ┌──────────────────────────┐   │ ┌──────────────────────────┐   │
│ │ Reference │ Status │ Age│   │ │ ✓ Submitted              │   │
│ ├──────────────────────────┤   │ │ John Doe - 10:00 AM      │   │
│ │ REJ-2024  │ Pending │ 2h │   │ │                          │   │
│ │ REJ-2025  │ Pending │ 5h │   │ │ ⏳ Under Review          │   │
│ │ RET-2024  │ Pending │ 1h │   │ │ Manager - 11:30 AM       │   │
│ │...        │...     │...│   │ │                          │   │
│ └──────────────────────────┘   │ │ ⭕ Awaiting Approval    │   │
│                                │ │ - 2:00 PM                │   │
│ Page 1 of 3 | 1-10 of 25 rows  │ └──────────────────────────┘   │
└────────────────────────────────┴────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Recently Created                                                 │
│                                                                 │
│ ┌────────────┬──────────┬──────────┬──────────────────────────┐ │
│ │ Reference  │ Type     │ Status   │ Submitted By             │ │
│ ├────────────┼──────────┼──────────┼──────────────────────────┤ │
│ │ REJ-2024   │ Reject   │ Pending  │ John Doe                 │ │
│ │ RET-2024   │ Return   │ Pending  │ Jane Smith               │ │
│ │ SOP-2024   │ SOP Fail │ Reviewed │ Bob Johnson              │ │
│ └────────────┴──────────┴──────────┴──────────────────────────┘ │
│                                                                 │
│ Page 1 of 1 | 1-3 of 3 rows                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Typography & Spacing

### Font Scale
```
Display:  text-4xl font-bold (H1)     - Page titles
Heading:  text-2xl font-bold (H2)     - Section headers
Subhead:  text-xl font-bold (H3)      - Subsections
Body:     text-base (regular)         - Body text
Small:    text-sm (regular)           - Secondary text
Tiny:     text-xs (regular)           - Labels/captions
```

### Spacing Scale
```
xs:  2px   → gap-1, px-1, py-1
sm:  4px   → gap-2, px-2, py-2
md:  8px   → gap-2, px-3, py-2
lg:  16px  → gap-4, px-6, py-4
xl:  24px  → gap-6, px-8, py-6
2xl: 32px  → gap-8, px-12, py-8
```

---

## Interactive States

### Button States
```
Default:   bg-white border-gray-300 text-gray-700
Hover:     bg-gray-50 border-gray-400
Focus:     ring-2 ring-blue-500 ring-offset-2
Active:    bg-blue-50 text-blue-600
Disabled:  opacity-50 cursor-not-allowed
```

### Input States
```
Default:   border-gray-300 bg-white text-gray-900
Focus:     border-blue-500 ring-2 ring-blue-500/20
Error:     border-red-500 ring-2 ring-red-500/20
Disabled:  bg-gray-100 cursor-not-allowed
```

### Hover Effects
```
Tables:    hover:bg-blue-50
Cards:     hover:shadow-lg
Badges:    hover:opacity-80
Links:     hover:underline
```

---

## Dark Mode Implementation

All components use Tailwind's `dark:` modifier:

```tsx
// Example component
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  <h2 className="text-2xl font-bold">Title</h2>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
</div>
```

### Color Mapping (Light → Dark)
```
Background:  white → gray-800
Card:        white → gray-800
Text:        gray-900 → white
Secondary:   gray-600 → gray-400
Border:      gray-200 → gray-700
Hover:       gray-50 → gray-700
```

---

## Responsive Breakpoints

All components use Tailwind breakpoints:
```
Mobile:   < 640px      (default styles)
Tablet:   640px-1024px (md: modifier)
Desktop:  > 1024px     (lg: modifier)
```

### Grid Responsive
```
DataTable columns:
- Mobile: 1 column
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: full table (lg:grid-cols-4+)

Cards:
- Mobile: 1 column
- Tablet: 2 columns (md:grid-cols-2)
- Desktop: 3-4 columns (lg:grid-cols-3 xl:grid-cols-4)
```

---

## Icon Library (lucide-react)

Used icons in Phase 2 components:
- `Search` - Global search icon
- `Calendar` - Date/time indicator
- `AlertCircle` - Warning/alert status
- `CheckCircle2` - Success/completed status
- `Clock` - Pending/in-progress status
- `XCircle` - Error/rejected status
- `TrendingUp` - Positive trend (↑)
- `TrendingDown` - Negative trend (↓)
- `ChevronUp` - Sort ascending indicator
- `ChevronDown` - Sort descending indicator
- `ChevronLeft` - Previous page
- `ChevronRight` - Next page
- `Filter` - Filter toggle button

Size scale:
```
Inline:     size={14-16}  (text replacements)
Standard:   size={18-20}  (regular icons)
Large:      size={24}     (hero/header icons)
```

---

## Accessibility Guidelines

### Color Contrast
- ✅ All text meets WCAG AA standards (4.5:1 ratio minimum)
- ✅ Status colors differentiated by icon + color (not color alone)
- ✅ Dark mode colors checked for contrast

### Keyboard Navigation
- ✅ Tab order logical (left→right, top→bottom)
- ✅ Focus indicators visible (ring-2 ring-blue-500)
- ✅ All buttons keyboard accessible

### Screen Readers
- ✅ Semantic HTML (`<table>`, `<button>`, etc.)
- ✅ Form labels associated with inputs
- ✅ Image alt text on icons
- ✅ ARIA labels on icon-only buttons

---

## Usage In Pages

### Import Pattern
```tsx
import DataTable from '@/components/tables/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import StatusTimeline from '@/components/common/StatusTimeline';
import PerformanceIndicator from '@/components/common/PerformanceIndicator';
```

### Composition Pattern
```tsx
export default function Page() {
  return (
    <div className="space-y-8">
      {/* Section 1: Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <PerformanceIndicator {...} />
        <PerformanceIndicator {...} />
        <PerformanceIndicator {...} />
      </div>

      {/* Section 2: Data Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Title</h2>
        <DataTable {...} />
      </div>

      {/* Section 3: Timeline */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Activity</h2>
        <StatusTimeline {...} />
      </div>
    </div>
  );
}
```

---

This design guide maintains visual consistency across the application!
