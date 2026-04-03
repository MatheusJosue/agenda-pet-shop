'use client'

import { cn } from '@/lib/utils'
import type { ViewMode } from '@/lib/utils/date'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

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
  periodLabel,
  onViewModeChange,
  onPrevious,
  onNext,
  loading = false
}: ViewModeSelectorProps) {
  return (
    <div className="space-y-4">
      {/* View Mode Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#120a21]/40 backdrop-blur-xl rounded-2xl border border-white/5">
        {(Object.keys(viewModeLabels) as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onViewModeChange(mode)}
            disabled={loading}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 relative',
              viewMode === mode
                ? 'bg-[#f183ff] text-black shadow-lg shadow-[#f183ff]/40'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            )}
          >
            {viewModeLabels[mode]}
          </button>
        ))}
      </div>

      {/* Date Navigation Card */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#120a21]/60 backdrop-blur-xl rounded-2xl border border-white/5">
        <button
          type="button"
          onClick={onPrevious}
          disabled={loading}
          className="p-2 rounded-xl text-white/60 hover:text-[#f183ff] hover:bg-white/10 transition-all disabled:opacity-50"
          aria-label="Período anterior"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1 flex items-center justify-center gap-2">
          <Calendar size={18} className="text-[#f183ff]/70" />
          <span className="text-white font-semibold text-sm">
            {periodLabel}
          </span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="p-2 rounded-xl text-white/60 hover:text-[#f183ff] hover:bg-white/10 transition-all disabled:opacity-50"
          aria-label="Próximo período"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
