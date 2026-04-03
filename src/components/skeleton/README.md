# Ametista Pet Pro - Skeleton Loading System

A comprehensive skeleton loading system designed to match the dark glassmorphism aesthetic of the Ametista Pet Pro design system.

## Design System

### Colors

| Element | Color | Usage |
|---------|-------|-------|
| Background | `#120a21` | Ultra-dark purple/black base |
| Skeleton Base | `#2b2041/40` | Deep purple with 40% opacity |
| Shimmer Effect | `white/5` | Subtle gradient overlay |

### Effects

- **Animation**: `animate-pulse` - Smooth fade in/out
- **Backdrop**: `backdrop-blur-sm` - Glassmorphism consistency
- **Shimmer**: Custom CSS animation for subtle motion
- **Border Radius**: `rounded-2xl` (24px) for cards, `rounded-full` for circles

## File Structure

```
src/components/skeleton/
├── index.ts                    # Centralized exports
├── skeleton.tsx                # Base skeleton component
├── skeleton-metric-card.tsx    # Dashboard stat cards
├── skeleton-list-card.tsx      # Client/Pet list items
├── skeleton-table-row.tsx      # Agenda table rows
├── skeleton-header.tsx         # Headers, sidebar, nav
├── skeleton-form.tsx           # Form inputs and controls
├── SKELETON_SHOWCASE.tsx       # Usage examples
├── INTEGRATION_EXAMPLE.tsx     # Real integration examples
└── README.md                   # This file
```

## Components

### Base Components

#### `Skeleton`

The fundamental building block for all skeletons.

```tsx
import { Skeleton } from '@/components/skeleton'

<Skeleton className="h-32 w-full" />
<Skeleton variant="circle" className="w-12 h-12" />
<Skeleton variant="rounded" className="h-10 w-48" />
```

**Props:**
- `variant`: `'default'` | `'circle'` | `'rounded'`
- `className`: Additional Tailwind classes

#### `SkeletonWrapper`

Wrapper for consistent spacing and optional labels.

```tsx
<SkeletonWrapper label="Loading data...">
  <Skeleton className="h-32 w-full" />
</SkeletonWrapper>
```

### Dashboard Components

#### `SkeletonMetricCard`

Skeleton for metric/stat cards on the dashboard.

```tsx
import { SkeletonMetricCard, SkeletonMetricGrid } from '@/components/skeleton'

// Single card
<SkeletonMetricCard showTrend />

// Grid of cards
<SkeletonMetricGrid count={4} />
```

**Visual Structure:**
```
┌─────────────────────────┐
│ [●]              [■■■] │  ← Icon + Trend badge
│                         │
│ ■■■■■■■■■■■■          │  ← Value
│                         │
│ ■■■■■■■               │  ← Label
└─────────────────────────┘
```

### List Components

#### `SkeletonListCard`

Skeleton for list items (clients, pets, services).

```tsx
import { SkeletonListCard, SkeletonListStack } from '@/components/skeleton'

// Single card
<SkeletonListCard
  showAvatar
  lines={2}
  showBadge
/>

// Stack of cards
<SkeletonListStack count={5} />
```

**Visual Structure:**
```
┌─────────────────────────────────┐
│ [●]  ■■■■■■■■■■■■    [■■■■■] [→] │
│      ■■■■■■                      │
└─────────────────────────────────┘
│       └─ lines                   │
│ └avatar                          │
└─title         └badge   └action
```

**Props:**
- `showAvatar`: Show circle avatar
- `lines`: Number of text lines (1-3)
- `showBadge`: Show status badge
- `showAction`: Show action chevron

### Table Components

#### `SkeletonTableRow` & `SkeletonTable`

Skeletons for agenda tables and lists.

```tsx
import {
  SkeletonTableRow,
  SkeletonTable,
  SkeletonTableCard,
  SkeletonTableGrid
} from '@/components/skeleton'

// Single row
<SkeletonTableRow showTime showActions />

// Full table with header
<SkeletonTable rows={8} showHeader />

// Card view (alternative)
<SkeletonTableCard />

// Grid of cards
<SkeletonTableGrid count={6} />
```

**Visual Structure (Row):**
```
┌──────────────────────────────────────────────┐
│ [■■■■■]  ■■■■■■■■■■■■  [■■■■■■■■]  [●]    │
│  Time       Content        Status      Action│
└──────────────────────────────────────────────┘
```

**Visual Structure (Card):**
```
┌─────────────────────────────┐
│ [■■■■■]            [■■■■■]  │
│                             │
│ ■■■■■■■■■■■■               │
│                             │
│ ● ■■■■■■                    │
│ ● ■■■■■■■                   │
└─────────────────────────────┘
```

### Header & Navigation

#### `SkeletonHeader` / `SkeletonSidebar` / `SkeletonMobileHeader`

Skeletons for page headers and navigation.

```tsx
import {
  SkeletonHeader,
  SkeletonSidebar,
  SkeletonMobileHeader,
  SkeletonBottomNav
} from '@/components/skeleton'

// Desktop header
<SkeletonHeader showLogo showUser />

// Sidebar navigation
<SkeletonSidebar itemCount={6} />

// Mobile header
<SkeletonMobileHeader showActions actionCount={2} />

// Bottom navigation (mobile)
<SkeletonBottomNav />
```

### Form Components

#### Form Input Skeletons

Skeletons for form inputs, textareas, and controls.

```tsx
import {
  SkeletonInput,
  SkeletonTextarea,
  SkeletonForm,
  SkeletonFormActions
} from '@/components/skeleton'

// Input field
<SkeletonInput label />

// Textarea
<SkeletonTextarea label rows={4} />

// Complete form
<SkeletonForm
  sections={[
    { fieldCount: 4, showTitle: true },
    { fieldCount: 2, showTitle: false }
  ]}
  showActions
/>
```

## Integration Guide

### Step 1: Import Components

```tsx
import { SkeletonMetricGrid, SkeletonTable } from '@/components/skeleton'
```

### Step 2: Add Loading State

```tsx
const [loading, setLoading] = useState(true)

useEffect(() => {
  async function loadData() {
    setLoading(true)
    await fetchData()
    setLoading(false)
  }
  loadData()
}, [])
```

### Step 3: Render Skeleton During Load

```tsx
if (loading) {
  return <SkeletonTable rows={5} />
}

return <ActualContent data={data} />
```

### Complete Example: Agendamentos Page

```tsx
"use client"

import { useState, useEffect } from 'react'
import { SkeletonTable, SkeletonMobileHeader } from '@/components/skeleton'
import { AppLayout } from '@/components/layout/app-layout'

export default function AgendamentosPage() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAppointments()
  }, [])

  async function loadAppointments() {
    setLoading(true)
    try {
      const result = await getAppointments()
      setAppointments(result.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <SkeletonMobileHeader showActions actionCount={1} />
        <div className="p-4">
          <SkeletonTable rows={8} showHeader />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Actual content */}
    </AppLayout>
  )
}
```

## Best Practices

### DO ✅

- Match skeleton structure to actual content layout
- Use appropriate skeleton types for each UI pattern
- Maintain consistent spacing and sizing
- Include all visual elements (badges, actions, icons)
- Use grid components for multiple items

### DON'T ❌

- Mix skeleton types arbitrarily
- Use incorrect border radius
- Skip important UI elements in skeletons
- Make skeletons too different from actual content
- Forget to handle error states separately

## Responsive Design

All skeletons are responsive by default:

```tsx
// Metric grid - responsive columns
<SkeletonMetricGrid count={4} />
// → 1 col (mobile), 2 col (sm), 4 col (lg)

// Table grid - responsive cards
<SkeletonTableGrid count={6} />
// → 1 col (mobile), 2 col (sm), 3 col (lg)
```

## Accessibility

- Skeletons use `animate-pulse` which respects `prefers-reduced-motion`
- Loading states are temporary and replaced with actual content
- Consider adding `aria-busy="true"` to loading containers

## Customization

### Custom Colors

Override default colors via className:

```tsx
<Skeleton className="bg-[custom-color]/40" />
```

### Custom Sizes

Use Tailwind sizing classes:

```tsx
<Skeleton className="h-20 w-32" />
<Skeleton className="w-full h-48" />
```

### Custom Animation

Disable or modify animation:

```tsx
<Skeleton className="animate-none" />
<Skeleton className="duration-700" />
```

## Troubleshooting

### Skeleton not showing

- Verify import path: `@/components/skeleton`
- Check if loading state is properly set
- Ensure parent has proper height/dimensions

### Animation not smooth

- Check if `shimmer` keyframe exists in globals.css
- Verify backdrop-blur is supported
- Test performance on target devices

### Layout mismatch

- Compare skeleton HTML structure with actual component
- Check spacing and padding values
- Verify responsive breakpoints

## Files Reference

| File | Exports |
|------|---------|
| `skeleton.tsx` | `Skeleton`, `SkeletonWrapper` |
| `skeleton-metric-card.tsx` | `SkeletonMetricCard`, `SkeletonMetricGrid` |
| `skeleton-list-card.tsx` | `SkeletonListCard`, `SkeletonListStack` |
| `skeleton-table-row.tsx` | `SkeletonTableRow`, `SkeletonTable`, `SkeletonTableCard`, `SkeletonTableGrid` |
| `skeleton-header.tsx` | `SkeletonHeader`, `SkeletonSidebar`, `SkeletonBottomNav`, `SkeletonMobileHeader` |
| `skeleton-form.tsx` | `SkeletonInput`, `SkeletonTextarea`, `SkeletonForm`, etc. |
| `index.ts` | All exports (centralized) |

## License

Part of the Ametista Pet Pro project.
