'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppHeader } from '@/components/layout/app-header'
import { AppLayout } from '@/components/layout/app-layout'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ViewModeSelector } from '@/components/agendamentos'
import { SkeletonListStack } from '@/components/skeleton'
import { useAppointmentsFilter } from '@/hooks/useAppointmentsFilter'
import { navigateDate, type ViewMode } from '@/lib/utils/date'
import { SIZE_EMOJIS, SIZE_COLORS } from '@/lib/types/service-prices'
import {
  Clock,
  User,
  Scissors,
  ChevronRight,
  CalendarX,
  Calendar,
  TrendingUp,
  CheckCircle,
  DollarSign,
  Bell,
} from 'lucide-react'
import type { AppointmentWithRelations } from '@/lib/types/appointments'

const statusConfig = {
  scheduled: {
    label: 'Agendado',
    bgColor: 'bg-[#f183ff]/20',
    textColor: 'text-[#f183ff]',
    borderColor: 'border-[#f183ff]/30'
  },
  completed: {
    label: 'Concluído',
    bgColor: 'bg-[#00ffa3]/20',
    textColor: 'text-[#00ffa3]',
    borderColor: 'border-[#00ffa3]/30'
  },
  cancelled: {
    label: 'Cancelado',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30'
  }
}

// Helper to format date divider
function formatDateDivider(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00')
  const day = date.toLocaleDateString('pt-BR', { day: '2-digit' })
  const month = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()
  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase()

  return `${day} ${month}, ${weekday}`
}

// Helper to format time
function formatTime(time: string) {
  return time.length === 5 ? `${time}:00` : time
}

// Helper to format price
function formatPrice(price: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [companyName, setCompanyName] = useState('Luminous Pets')
  const [user, setUser] = useState<{
    user_metadata?: { name?: string }
    email?: string
  } | null>(null)

  const { appointments, loading, error, periodLabel } = useAppointmentsFilter(
    viewMode,
    selectedDate
  )

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import('@/lib/actions/app')
        const result = await getAppStats()
        if (result.data) {
          setCompanyName(result.data.companyName || 'Luminous Pets')
          setUser(result.data.user)
        }
      } catch (error) {
        // Silenced error for initial load
      }
    }
    loadData()
  }, [])

  const handlePrevious = useCallback(() => {
    setSelectedDate((prev) => navigateDate(prev, viewMode, -1))
  }, [viewMode])

  const handleNext = useCallback(() => {
    setSelectedDate((prev) => navigateDate(prev, viewMode, 1))
  }, [viewMode])

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode)
  }, [])

  // Group appointments by date
  const groupedAppointments = useMemo(() => {
    const groups: Record<string, AppointmentWithRelations[]> = {}

    appointments?.forEach((appointment) => {
      if (!groups[appointment.date]) {
        groups[appointment.date] = []
      }
      groups[appointment.date].push(appointment)
    })

    return groups
  }, [appointments])

  // Calculate weekly stats
  const weeklyStats = useMemo(() => {
    const completed = appointments?.filter((a) => a.status === 'completed').length || 0
    const revenue = appointments?.reduce((sum, a) => {
      if (a.status === 'completed') {
        return sum + (a.total_price || a.price)
      }
      return sum
    }, 0) || 0

    return {
      total: appointments?.length || 0,
      completed,
      revenue,
      pending: (appointments?.filter((a) => a.status === 'scheduled').length || 0)
    }
  }, [appointments])

  // Get service names from appointment
  const getServiceNames = (appointment: AppointmentWithRelations) => {
    if (appointment.appointment_services && appointment.appointment_services.length > 0) {
      return appointment.appointment_services
        .map((as) => as.service_price.service_name)
        .join(', ')
    }
    return appointment.service_price?.service_name || 'Serviço'
  }

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        {/* Mobile Header */}
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10 max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Agendamentos
              </h1>
              <p className="text-white/40 text-sm mt-1">
                Gerencie sua agenda de banho e tosa
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="relative p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f183ff] animate-pulse" />
              </button>
              <Link href="/app/agendamentos/novo">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-2xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-lg shadow-[#f183ff]/30"
                >
                  <Calendar size={16} className="mr-2" />
                  Novo
                </Button>
              </Link>
            </div>
          </div>

          {/* View Mode Selector */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <ViewModeSelector
              viewMode={viewMode}
              selectedDate={selectedDate}
              periodLabel={periodLabel}
              onViewModeChange={handleViewModeChange}
              onPrevious={handlePrevious}
              onNext={handleNext}
              loading={loading}
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="animate-in fade-in">
              <SkeletonListStack count={6} />
            </div>
          ) : error ? (
            <GlassCard
              variant="default"
              className="p-6 bg-red-500/10 border-red-500/30 animate-in fade-in"
            >
              <p className="text-red-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {error}
              </p>
            </GlassCard>
          ) : !appointments || appointments.length === 0 ? (
            <GlassCard
              variant="elevated"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center shadow-lg shadow-[#f183ff]/10">
                <CalendarX size={40} className="text-[#f183ff]/70" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Nenhum agendamento
              </h3>
              <p className="text-white/40 text-sm">
                Não há agendamentos para este período
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-6">
              {/* Appointments grouped by date */}
              {Object.entries(groupedAppointments).map(([date, dayAppointments], groupIndex) => (
                <div key={date} className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                  {/* Date Divider */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    <span className="text-white/30 text-xs font-semibold tracking-widest whitespace-nowrap">
                      {formatDateDivider(date)}
                    </span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  </div>

                  {/* Appointment Cards */}
                  {dayAppointments.map((appointment) => {
                    const status = statusConfig[appointment.status]
                    const serviceNames = getServiceNames(appointment)

                    return (
                      <Link key={appointment.id} href={`/app/agendamentos/${appointment.id}`}>
                        <GlassCard
                          variant="elevated"
                          className="p-4 hover:bg-white/5 transition-all cursor-pointer group border-white/5"
                        >
                          <div className="flex items-center gap-4">
                            {/* Pet Avatar */}
                            <div className="relative flex-shrink-0">
                              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-2xl border border-[#f183ff]/20 shadow-lg shadow-[#f183ff]/10">
                                {SIZE_EMOJIS[appointment.pet.size]}
                              </div>

                              {/* Status Badge */}
                              <div className={`absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${status.bgColor} ${status.textColor} ${status.borderColor} shadow-lg`}>
                                {status.label}
                              </div>
                            </div>

                            {/* Pet Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-bold text-base mb-0.5 truncate">
                                {appointment.pet.name}
                              </h3>
                              <p className="text-white/50 text-sm truncate flex items-center gap-1.5">
                                <User size={12} />
                                {appointment.client.name}
                              </p>
                              <p className="text-white/40 text-xs mt-1 truncate flex items-center gap-1.5">
                                <Scissors size={11} />
                                {serviceNames}
                              </p>
                            </div>

                            {/* Time & Price */}
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-1 mb-1">
                                <Clock size={14} className="text-[#f183ff]/70" />
                                <span className="text-white font-semibold text-sm">
                                  {formatTime(appointment.time)}
                                </span>
                              </div>
                              <p className="text-[#f183ff] font-bold text-lg">
                                {formatPrice(appointment.total_price || appointment.price)}
                              </p>
                            </div>

                            {/* Chevron */}
                            <ChevronRight
                              size={20}
                              className="text-white/20 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all"
                            />
                          </div>
                        </GlassCard>
                      </Link>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Weekly Summary Card */}
          {appointments && appointments.length > 0 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <GlassCard variant="elevated" className="overflow-hidden">
                {/* Header with gradient */}
                <div className="relative p-5 bg-gradient-to-br from-[#f183ff]/10 via-[#d946ef]/5 to-[#8b5cf6]/10">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f183ff] via-[#d946ef] to-[#8b5cf6]" />

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00ffa3]/20 to-[#00ffa3]/10 flex items-center justify-center shadow-lg shadow-[#00ffa3]/10">
                      <TrendingUp size={24} className="text-[#00ffa3]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">
                        Resumo da {viewMode === 'week' ? 'Semana' : viewMode === 'month' ? 'Mês' : 'Data'}
                      </p>
                      <p className="text-white font-semibold">
                        Você tem <span className="text-[#f183ff]">{weeklyStats.pending}</span> agendamentos{weeklyStats.pending !== 1 ? 's' : ''} pendente{weeklyStats.pending !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="p-4 grid grid-cols-2 gap-3">
                  {/* Completed */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-[#00ffa3]/70" />
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Concluídos
                      </p>
                    </div>
                    <p className="text-white font-bold text-2xl">
                      {weeklyStats.completed}
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={16} className="text-[#f183ff]/70" />
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Receita
                      </p>
                    </div>
                    <p className="text-white font-bold text-xl">
                      {weeklyStats.revenue >= 1000
                        ? `R$ ${(weeklyStats.revenue / 1000).toFixed(1)}k`
                        : `R$ ${weeklyStats.revenue.toFixed(0)}`
                      }
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </main>

        {/* Floating Action Button */}
        <Link
          href="/app/agendamentos/novo"
          className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/40 hover:scale-110 active:scale-95 transition-all"
        >
          <span className="text-white text-3xl font-light leading-none">+</span>
        </Link>

        <BottomNavigation />
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </AppLayout>
  )
}
