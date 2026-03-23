# Appointments View Tabs Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tabs to the appointments page for filtering by day/week/month with date navigation.

**Architecture:**
- New `ViewModeSelector` component renders tabs and navigation controls
- New `useAppointmentsFilter` hook calculates date ranges and fetches filtered data
- Main page integrates both to display filtered appointment lists

**Tech Stack:** React, TypeScript, Next.js 15, Supabase, CSS Modules, Framer Motion

---

## File Structure

```
src/
├── components/
│   └── agendamentos/                    # NEW
│       ├── ViewModeSelector.tsx          # Tabs + navigation UI
│       └── ViewModeSelector.module.css   # Component styles
├── hooks/                                # NEW
│   └── useAppointmentsFilter.ts          # Filter logic + API calls
└── app/(app)/app/agendamentos/
    └── page.tsx                          # MODIFY: integrate new system
```

---

## Task 1: Create Date Utility Functions

**Files:**
- Create: `src/lib/utils/date.ts`

Utility functions for date range calculations used by the filter hook.

- [ ] **Step 1: Create date utility file with range functions**

```typescript
// src/lib/utils/date.ts

export type ViewMode = 'day' | 'week' | 'month'

export interface DateRange {
  start: Date
  end: Date
}

/**
 * Get the date range for a single day
 */
export function getDayRange(date: Date): DateRange {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)

  const end = new Date(date)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get the date range for a week (Sunday to Saturday)
 */
export function getWeekRange(date: Date): DateRange {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day

  const start = new Date(d)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(d)
  end.setDate(diff + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get the date range for a month
 */
export function getMonthRange(date: Date): DateRange {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)

  return { start, end }
}

/**
 * Get date range based on view mode
 */
export function getDateRange(viewMode: ViewMode, date: Date): DateRange {
  switch (viewMode) {
    case 'day':
      return getDayRange(date)
    case 'week':
      return getWeekRange(date)
    case 'month':
      return getMonthRange(date)
  }
}

/**
 * Navigate to previous or next period
 */
export function navigateDate(date: Date, viewMode: ViewMode, direction: -1 | 1): Date {
  const newDate = new Date(date)

  switch (viewMode) {
    case 'day':
      newDate.setDate(newDate.getDate() + direction)
      break
    case 'week':
      newDate.setDate(newDate.getDate() + direction * 7)
      break
    case 'month':
      newDate.setMonth(newDate.getMonth() + direction)
      break
  }

  return newDate
}

/**
 * Format date for display based on view mode
 */
export function formatPeriodLabel(viewMode: ViewMode, date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }

  switch (viewMode) {
    case 'day':
      return date.toLocaleDateString('pt-BR', options)

    case 'week': {
      const { start, end } = getWeekRange(date)
      const startDay = start.getDate()
      const endDay = end.getDate()
      const month = start.toLocaleDateString('pt-BR', { month: 'short' })
      return `${startDay}-${endDay} ${month}`
    }

    case 'month':
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    default:
      return ''
  }
}

/**
 * Format date to ISO string (YYYY-MM-DD) for API
 */
export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/utils/date.ts
git commit -m "feat: add date utility functions for view mode calculations"
```

---

## Task 2: Create useAppointmentsFilter Hook

**Files:**
- Create: `src/hooks/useAppointmentsFilter.ts`
- Test: Manual testing in browser

Hook that calculates date ranges and fetches filtered appointments from the API.

- [ ] **Step 1: Create the hook file**

```typescript
// src/hooks/useAppointmentsFilter.ts

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getAppointments } from '@/lib/actions/appointments'
import { getDateRange, toISODate, formatPeriodLabel, type ViewMode } from '@/lib/utils/date'
import type { AppointmentWithRelations } from '@/lib/types/appointments'

interface UseAppointmentsFilterResult {
  appointments: AppointmentWithRelations[]
  loading: boolean
  error: string | null
  periodLabel: string
  refetch: () => Promise<void>
}

export function useAppointmentsFilter(
  viewMode: ViewMode,
  selectedDate: Date
): UseAppointmentsFilterResult {
  const [appointments, setAppointments] = useState<AppointmentWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { start, end } = getDateRange(viewMode, selectedDate)

      const result = await getAppointments({
        startDate: toISODate(start),
        endDate: toISODate(end)
      })

      if (result.error) {
        setError(result.error)
        setAppointments([])
      } else {
        setAppointments(result.data || [])
      }
    } catch (err) {
      setError('Erro ao carregar agendamentos')
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [viewMode, selectedDate])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  return {
    appointments,
    loading,
    error,
    periodLabel: formatPeriodLabel(viewMode, selectedDate),
    refetch: fetchAppointments
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useAppointmentsFilter.ts
git commit -m "feat: add useAppointmentsFilter hook for period-based filtering"
```

---

## Task 3: Create ViewModeSelector Component (Styles)

**Files:**
- Create: `src/components/agendamentos/ViewModeSelector.module.css

CSS styles for the view mode tabs and navigation controls.

- [ ] **Step 1: Create styles file**

```css
/* src/components/agendamentos/ViewModeSelector.module.css */

.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

/* Tabs Container */
.tabsContainer {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
}

/* Tab Button */
.tab {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.tab.active {
  background: rgba(168, 85, 247, 0.2);
  border: 1px solid rgba(168, 85, 247, 0.3);
  color: white;
}

.tab:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Navigation Container */
.navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

/* Navigation Button */
.navButton {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.navButton:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(168, 85, 247, 0.3);
  color: white;
}

.navButton:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Period Label */
.periodLabel {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
  font-family: 'Outfit', sans-serif;
  text-transform: capitalize;
}

/* Responsive */
@media (max-width: 640px) {
  .periodLabel {
    font-size: 14px;
  }

  .navButton {
    width: 36px;
    height: 36px;
  }

  .tab {
    padding: 8px 12px;
    font-size: 13px;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/agendamentos/ViewModeSelector.module.css
git commit -m "feat: add ViewModeSelector component styles"
```

---

## Task 4: Create ViewModeSelector Component (Logic)

**Files:**
- Create: `src/components/agendamentos/ViewModeSelector.tsx

Component that renders tabs and navigation controls.

- [ ] **Step 1: Create component file**

```typescript
// src/components/agendamentos/ViewModeSelector.tsx

'use client'

import { cn } from '@/lib/utils'
import styles from './ViewModeSelector.module.css'
import type { ViewMode } from '@/lib/utils/date'

export interface ViewModeSelectorProps {
  viewMode: ViewMode
  selectedDate: Date
  periodLabel: string
  onViewModeChange: (mode: ViewMode) => void
  onPrevious: () => void
  onNext: () => void
  loading?: boolean
}

const viewModeLabels: Record<ViewMode, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mês'
}

export function ViewModeSelector({
  viewMode,
  selectedDate,
  periodLabel,
  onViewModeChange,
  onPrevious,
  onNext,
  loading = false
}: ViewModeSelectorProps) {
  return (
    <div className={styles.container}>
      {/* View Mode Tabs */}
      <div className={styles.tabsContainer}>
        {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            className={cn(styles.tab, viewMode === mode && styles.active)}
            onClick={() => onViewModeChange(mode)}
            disabled={loading}
          >
            {viewModeLabels[mode]}
          </button>
        ))}
      </div>

      {/* Date Navigation */}
      <div className={styles.navigation}>
        <button
          type="button"
          className={styles.navButton}
          onClick={onPrevious}
          disabled={loading}
          aria-label="Período anterior"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className={styles.periodLabel}>{periodLabel}</span>

        <button
          type="button"
          className={styles.navButton}
          onClick={onNext}
          disabled={loading}
          aria-label="Próximo período"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Export component from index (optional, for cleaner imports)**

Create `src/components/agendamentos/index.ts`:

```typescript
export { ViewModeSelector } from './ViewModeSelector'
export type { ViewModeSelectorProps } from './ViewModeSelector'
```

- [ ] **Step 3: Commit**

```bash
git add src/components/agendamentos/
git commit -m "feat: add ViewModeSelector component with tabs and navigation"
```

---

## Task 5: Integrate into Agendamentos Page

**Files:**
- Modify: `src/app/(app)/app/agendamentos/page.tsx`

Integrate the new components into the main appointments page.

- [ ] **Step 1: Read current page to understand structure**

(Already done during spec creation)

- [ ] **Step 2: Replace the page content with integrated version**

Full replacement of `src/app/(app)/app/agendamentos/page.tsx`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ViewModeSelector } from '@/components/agendamentos'
import { useAppointmentsFilter } from '@/hooks/useAppointmentsFilter'
import { navigateDate, type ViewMode } from '@/lib/utils/date'
import { motion } from 'framer-motion'
import { Cat, Dog, Dog as DogLarge, Clock, User, Scissors, ChevronRight, CalendarX, Plus } from 'lucide-react'
import type { AppointmentWithRelations } from '@/lib/types/appointments'

const statusLabels = {
  scheduled: 'Agendado',
  completed: 'Concluído',
  cancelled: 'Cancelado'
}

const statusStyles = {
  scheduled: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  completed: 'bg-green-500/20 text-green-300 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/30'
}

const sizeIcons = {
  small: Cat,
  medium: Dog,
  large: DogLarge
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { appointments, loading, error, periodLabel } = useAppointmentsFilter(viewMode, selectedDate)

  const handlePrevious = useCallback(() => {
    setSelectedDate(prev => navigateDate(prev, viewMode, -1))
  }, [viewMode])

  const handleNext = useCallback(() => {
    setSelectedDate(prev => navigateDate(prev, viewMode, 1))
  }, [viewMode])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden pb-20">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
                📅
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Agendamentos
                </h1>
                <p className="text-purple-200/60 text-sm">
                  {appointments?.length || 0} agendamento{appointments?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <Link href="/app/agendamentos/novo">
              <Button variant="primary" size="sm" className="rounded-full gap-1">
                <Plus size={16} />
                Novo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* View Mode Selector */}
        <ViewModeSelector
          viewMode={viewMode}
          selectedDate={selectedDate}
          periodLabel={periodLabel}
          onViewModeChange={handleViewModeChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          loading={loading}
        />

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <GlassCard variant="default" className="p-4 bg-red-500/20 border-red-500/50">
            <p className="text-red-200">⚠️ {error}</p>
          </GlassCard>
        ) : !appointments || appointments.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <CalendarX size={32} className="text-purple-300" />
            </div>
            <p className="text-purple-200/60">Nenhum agendamento para este período</p>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment: AppointmentWithRelations, index) => {
              const SizeIcon = sizeIcons[appointment.pet.size]
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link href={`/app/agendamentos/${appointment.id}`}>
                    <GlassCard
                      variant="default"
                      className="p-4 hover:scale-[1.01] hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Date */}
                        <div className="text-center min-w-[60px]">
                          <div className="text-2xl font-bold text-purple-300">
                            {formatDate(appointment.date).split('/')[0]}
                          </div>
                          <div className="text-xs text-purple-200/50">
                            {formatDate(appointment.date).split('/')[1]}/{formatDate(appointment.date).split('/')[2]}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <SizeIcon size={20} className="text-purple-400" />
                            <span className="font-semibold text-white truncate">{appointment.pet.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-purple-200/60">
                            <span className="flex items-center gap-1">
                              <User size={14} />
                              {appointment.client.name}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {appointment.time}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Scissors size={14} />
                              {appointment.service.name}
                            </span>
                          </div>
                        </div>

                        {/* Status & Price */}
                        <div className="text-right flex-shrink-0 flex flex-col items-end">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border mb-1 ${statusStyles[appointment.status]}`}>
                            {statusLabels[appointment.status]}
                          </span>
                          <p className="text-lg font-bold text-purple-300">
                            R$ {appointment.price.toFixed(2)}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={18} className="text-purple-300/50 group-hover:translate-x-1 group-hover:text-purple-300 transition-all" />
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/\(app\)/app/agendamentos/page.tsx
git commit -m "feat: integrate view mode tabs into appointments page"
```

---

## Task 6: Create Required Utilities

**Files:**
- Create: `src/lib/utils/index.ts` (if doesn't exist)

Ensure the `cn` utility is exported for className merging.

- [ ] **Step 1: Check if utils index exists and create/update**

```typescript
// src/lib/utils/index.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Commit if created**

```bash
git add src/lib/utils/index.ts
git commit -m "chore: add cn utility for className merging"
```

---

## Task 7: Manual Testing

**Files:**
- Test: Browser manual testing

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test each view mode**

Navigate to `http://localhost:3000/app/agendamentos`

**Test Cases:**
1. **Day View (Default)**
   - Verify today's date is shown
   - Click "→" to go to tomorrow - verify date changes
   - Click "←" to go back - verify date changes
   - Verify appointments for the day are shown

2. **Week View**
   - Click "Semana" tab
   - Verify week range label shows correctly (e.g., "22-28 mar")
   - Navigate weeks forward/backward
   - Verify appointments for the week are shown

3. **Month View**
   - Click "Mês" tab
   - Verify month label shows correctly (e.g., "março 2026")
   - Navigate months forward/backward
   - Verify appointments for the month are shown

4. **Empty State**
   - Navigate to a date/week/month with no appointments
   - Verify "Nenhum agendamento para este período" message appears

5. **Loading State**
   - Navigate between periods
   - Verify spinner appears during data fetch

6. **Tab Switching Preserves Date**
   - Select a specific date (e.g., March 15)
   - Switch to Week - should show week containing March 15
   - Switch to Month - should show March 2026
   - Switch back to Day - should still be on March 15

---

## Task 8: Final Verification

- [ ] **Step 1: Check TypeScript compilation**

```bash
npm run build
```

Expected: No TypeScript errors

- [ ] **Step 2: Verify all files created**

```bash
ls -la src/lib/utils/date.ts
ls -la src/hooks/useAppointmentsFilter.ts
ls -la src/components/agendamentos/ViewModeSelector.tsx
ls -la src/components/agendamentos/ViewModeSelector.module.css
```

- [ ] **Step 3: Check for console errors**

Open browser DevTools and verify no errors in console.

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add .
git commit -m "fix: [description of fix]"
```

---

## Summary

This plan creates:
1. **3 new files** for date utilities
2. **2 new files** for the ViewModeSelector component (tsx + css)
3. **1 new file** for the useAppointmentsFilter hook
4. **1 modified file** for the appointments page integration

Total: 5 new files, 1 modified file.

**Estimated Time:** 1-2 hours for implementation and testing.
