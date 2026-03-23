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
