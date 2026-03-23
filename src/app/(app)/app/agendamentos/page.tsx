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
