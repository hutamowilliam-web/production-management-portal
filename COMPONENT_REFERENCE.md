# Component Reference Guide - Phase 2

## Quick Reference

### StatusBadge Component

```tsx
import StatusBadge from '@/components/common/StatusBadge';

// Basic usage
<StatusBadge status="pending" />

// With customization
<StatusBadge 
  status="approved"
  size="lg"
  variant="solid"
  showIcon={true}
  className="custom-class"
  onClick={() => console.log('clicked')}
/>
```

**Props**:
- `status` (required): string - Status name (pending, approved, rejected, etc.)
- `size` (optional): 'sm' | 'md' | 'lg' - Default: 'md'
- `variant` (optional): 'solid' | 'outline' | 'subtle' - Default: 'solid'
- `showIcon` (optional): boolean - Show status icon - Default: true
- `className` (optional): string - Additional CSS classes
- `onClick` (optional): () => void - Click handler

**Supported Statuses**:
```
Internal Rejects:
- pending (Yellow) → Awaiting approval
- approved (Green) → Approved
- rejected (Red) → Rejected
- escalated (Orange) → Escalated to management
- closed (Gray) → Closed

Customer Returns:
- credited (Blue) → Customer credited
- replaced (Indigo) → Product replaced
- credit_and_replaced (Purple) → Both

Maintenance:
- open (Red) → Unassigned
- in_progress (Blue) → Being worked on
- completed (Green) → Finished

SOP Failures:
- under_investigation (Yellow) → Being investigated
- corrected (Green) → Fixed
```

---

### DataTable Component

```tsx
import DataTable from '@/components/tables/DataTable';

// Basic usage
<DataTable
  data={items}
  columns={[
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status' },
  ]}
/>

// Advanced usage with rendering
<DataTable
  data={items}
  columns={[
    { 
      key: 'name', 
      label: 'Name', 
      sortable: true,
      width: '200px'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value, row) => (
        <StatusBadge status={value} size="sm" />
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    }
  ]}
  searchable={true}
  filterable={true}
  pagination={true}
  pageSize={20}
  selectable={true}
  isLoading={loading}
  onRowClick={(row) => navigate(`/view/${row.id}`)}
/>
```

**Props**:
- `data` (required): any[] - Array of objects to display
- `columns` (required): Column[] - Column definitions
- `searchable` (optional): boolean - Enable global search - Default: true
- `filterable` (optional): boolean - Enable column filtering - Default: true
- `pagination` (optional): boolean - Enable pagination - Default: true
- `pageSize` (optional): number - Rows per page - Default: 10
- `onRowClick` (optional): (row: any) => void - Row click handler
- `isLoading` (optional): boolean - Show loading spinner - Default: false
- `selectable` (optional): boolean - Enable row selection - Default: false

**Column Definition**:
```tsx
interface Column {
  key: string;              // Object key to display
  label: string;            // Column header text
  sortable?: boolean;       // Allow sorting (default: true)
  render?: (value: any, row: any) => React.ReactNode;  // Custom rendering
  width?: string;           // Optional CSS width
}
```

**Features**:
- Click headers to sort (↑ asc / ↓ desc)
- Click filter icon to show/hide filter panel
- Type in search box to filter all columns
- Use filter inputs for column-specific filtering
- Select rows with checkboxes
- Navigate pages with prev/next buttons

---

### StatusTimeline Component

```tsx
import StatusTimeline from '@/components/common/StatusTimeline';

// Vertical timeline (default)
<StatusTimeline
  items={[
    {
      id: '1',
      date: new Date('2024-01-15T10:00:00'),
      title: 'Submitted',
      description: 'John Doe submitted reject ticket',
      status: 'completed'
    },
    {
      id: '2',
      date: new Date('2024-01-15T11:30:00'),
      title: 'Under Review',
      description: 'Quality Manager reviewing',
      status: 'in_progress'
    },
    {
      id: '3',
      date: new Date('2024-01-15T14:00:00'),
      title: 'Awaiting Approval',
      status: 'pending'
    }
  ]}
  vertical={true}
  compact={false}
  maxItems={5}
/>

// Horizontal timeline
<StatusTimeline
  items={timelineItems}
  vertical={false}
  compact={true}
  maxItems={10}
/>
```

**Props**:
- `items` (required): TimelineItem[] - Timeline events
- `vertical` (optional): boolean - Vertical layout - Default: true
- `compact` (optional): boolean - Compact spacing - Default: false
- `maxItems` (optional): number - Max items to show - Default: 5

**TimelineItem Interface**:
```tsx
interface TimelineItem {
  id: string;
  date: Date;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}
```

**Status Indicators**:
- ✅ `completed` - Green dot with CheckCircle icon
- ⏳ `in_progress` - Blue dot with animated Clock icon
- ⚠️ `error` - Red dot with AlertCircle icon
- ⭕ `pending` - Gray dot with Clock icon

---

### PerformanceIndicator Component

```tsx
import PerformanceIndicator from '@/components/common/PerformanceIndicator';

// Simple metric
<PerformanceIndicator
  label="Total Rejects"
  current={42}
  format="number"
/>

// Metric with target and trend
<PerformanceIndicator
  label="Cost Impact"
  current={25000}
  previous={22500}
  target={20000}
  format="currency"
  threshold={{ warning: 23000, critical: 25000 }}
  size="md"
  showTrend={true}
/>

// Performance metric with percentage
<PerformanceIndicator
  label="Completion Rate"
  current={87.5}
  previous={82.3}
  target={95}
  format="percentage"
  threshold={{ warning: 85, critical: 70 }}
/>
```

**Props**:
- `label` (required): string - Metric label/title
- `current` (required): number - Current value
- `previous` (optional): number - Previous period value (for trend)
- `target` (optional): number - Target/goal value
- `unit` (optional): string - Unit suffix (e.g., "hours", "units")
- `format` (optional): 'number' | 'currency' | 'percentage' | 'time' - Default: 'number'
- `threshold` (optional): { warning?: number; critical?: number }
- `size` (optional): 'sm' | 'md' | 'lg' - Default: 'md'
- `showTrend` (optional): boolean - Show trend indicator - Default: true

**Format Examples**:
```
format="number"     → 1234 → "1,234"
format="currency"   → 5000 → "R5,000.00"
format="percentage" → 87.5 → "87.5%"
format="time"       → 5.5 → "5h 30m"
```

**Threshold Status Colors**:
- 🟢 Green: Below warning threshold (success)
- 🟡 Yellow: Above warning, below critical (warning)
- 🔴 Red: Above critical (critical - shows alert icon)

---

## Integration Examples

### Dashboard with Tables

```tsx
import { useQuery } from '@tanstack/react-query';
import DataTable from '@/components/tables/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

export default function RejectsPage() {
  const { data: rejects = [], isLoading } = useQuery({
    queryKey: ['rejects'],
    queryFn: () => fetch('/api/rejects').then(r => r.json())
  });

  return (
    <DataTable
      data={rejects}
      columns={[
        { key: 'reference', label: 'Reference', sortable: true },
        { 
          key: 'department', 
          label: 'Department', 
          sortable: true 
        },
        {
          key: 'status',
          label: 'Status',
          render: (value) => <StatusBadge status={value} size="sm" />
        },
        {
          key: 'amount',
          label: 'Amount',
          render: (value) => `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
        },
        {
          key: 'created_at',
          label: 'Created',
          render: (value) => new Date(value).toLocaleDateString('en-ZA')
        }
      ]}
      searchable={true}
      filterable={true}
      pagination={true}
      pageSize={15}
      isLoading={isLoading}
      onRowClick={(row) => navigate(`/rejects/${row.id}`)}
    />
  );
}
```

### Dashboard with Metrics

```tsx
import PerformanceIndicator from '@/components/common/PerformanceIndicator';
import { useQuery } from '@tanstack/react-query';

export default function AnalyticsDashboard() {
  const { data: metrics } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetch('/api/analytics').then(r => r.json())
  });

  return (
    <div className="grid grid-cols-3 gap-4">
      <PerformanceIndicator
        label="Pending Rejects"
        current={metrics?.pendingRejects}
        previous={metrics?.previousPendingRejects}
        target={0}
        threshold={{ warning: 5, critical: 10 }}
      />
      <PerformanceIndicator
        label="Total Cost Impact"
        current={metrics?.totalCost}
        previous={metrics?.previousTotalCost}
        target={metrics?.budgetLimit}
        format="currency"
        threshold={{ warning: metrics?.budgetLimit * 0.8 }}
      />
      <PerformanceIndicator
        label="Approval Rate"
        current={metrics?.approvalRate}
        format="percentage"
        target={95}
        threshold={{ warning: 85, critical: 70 }}
      />
    </div>
  );
}
```

---

## Styling & Customization

### Adding Custom Styling

```tsx
// Override with className
<StatusBadge 
  status="pending"
  className="!font-bold !text-lg"
/>

// Wrap in custom container
<div className="bg-blue-50 p-4 rounded-lg">
  <DataTable {...props} />
</div>

// Dark mode specific
<div className="dark:bg-gray-900">
  <StatusTimeline {...props} />
</div>
```

### Tailwind Configuration

Components use these Tailwind classes:
- Colors: gray, blue, green, red, yellow, orange, purple, indigo
- Spacing: gap-2, gap-4, gap-6, p-2, p-4, p-6, px-6, py-4
- Typography: text-xs, text-sm, text-base, font-medium, font-bold
- Borders: border, rounded-lg, rounded-full
- Effects: shadow-md, shadow-lg, transition-colors

---

## Accessibility Features

All components include:
- ✅ Semantic HTML (`<button>`, `<table>`, etc.)
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators (ring-2)
- ✅ Color contrast WCAG AA
- ✅ Screen reader friendly

---

## Performance Tips

1. **Use React.memo for static content**:
```tsx
const MyBadge = React.memo(() => <StatusBadge status="pending" />);
```

2. **Memoize column definitions**:
```tsx
const columns = useMemo(() => [...], []);
```

3. **Paginate large datasets**:
```tsx
<DataTable pageSize={20} pagination={true} />
```

4. **Use React Query for efficient data fetching**:
```tsx
const { data } = useQuery({ queryKey: [], queryFn: ... });
```

---

This reference guide covers all Phase 2 components. Refer back here when implementing features!
