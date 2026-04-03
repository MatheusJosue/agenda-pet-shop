'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import type { LucideIcon } from 'lucide-react'
import { Calendar, Scissors, Users, Sparkles, ChevronRight, DollarSign, TrendingUp, PawPrint } from 'lucide-react'

const sizeEmojis = {
  small: '🐱',
  medium: '🐕',
  large: '🦮'
}

export default function AppPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [todayCount, setTodayCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [servicesCount, setServicesCount] = useState(0)
  const [monthlyRevenue, setMonthlyRevenue] = useState(0)
  const [todayAppointments, setTodayAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import('@/lib/actions/app')
        const result = await getAppStats()

        if (result.error || !result.data) {
          router.push('/login')
          return
        }

        setUser(result.data.user)
        setCompanyName(result.data.companyName || 'Agenda Pet Shop')
        setClientsCount(result.data.clientsCount)
        setServicesCount(result.data.servicesCount)
        setTodayCount(result.data.todayCount)
        setMonthlyRevenue(result.data.monthlyRevenue)
        setTodayAppointments(result.data.todayAppointments)
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="flex flex-col min-h-dvh relative overflow-hidden bg-[#120a21]">
        {/* Mobile-only components */}
        <AppHeader companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }} />

        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />

          {/* Moving gradient mesh */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#f183ff]/20 to-transparent rounded-full blur-[80px] animate-[float_12s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-[#d946ef]/20 to-transparent rounded-full blur-[80px] animate-[float_14s_ease-in-out_infinite]" style={{ animationDelay: '2s' }} />
          </div>

          {/* Grid overlay for depth */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 relative z-10 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              </div>
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-2" style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}>
                      Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Bem-vindo'}
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base">
                      {todayCount > 0
                        ? `Você tem ${todayCount} agendamento${todayCount > 1 ? 's' : ''} hoje`
                        : 'Nenhum agendamento para hoje'}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                      <PawPrint className="w-6 h-6 text-[#f183ff]" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Cards */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                    Visão Geral
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#f183ff]/30 to-transparent" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <StatCardV2
                    label="Agendamentos Hoje"
                    value={todayCount?.toString() || '0'}
                    icon={Calendar}
                    variant="purple"
                    trend={todayCount > 0 ? '+0%' : undefined}
                  />
                  <StatCardV2
                    label="Faturamento Mensal"
                    value={formatCurrency(monthlyRevenue)}
                    icon={DollarSign}
                    variant="green"
                    trend={undefined}
                  />
                  <StatCardV2
                    label="Total Clientes"
                    value={clientsCount?.toString() || '0'}
                    icon={Users}
                    variant="pink"
                    trend={undefined}
                  />
                  <StatCardV2
                    label="Serviços Ativos"
                    value={servicesCount?.toString() || '0'}
                    icon={Scissors}
                    variant="violet"
                    trend={undefined}
                  />
                </div>
              </section>

              {/* Today's Schedule */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                      Agenda de Hoje
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-[#f183ff]/30 to-transparent" />
                  </div>
                  <Link href="/app/agendamentos" className="text-sm text-[#f183ff] font-medium hover:text-[#f183ff]/80 flex items-center gap-1 group transition-colors">
                    Ver todos
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <GlassCard variant="elevated" className="divide-y divide-white/5 overflow-hidden">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((apt, idx) => (
                      <Link
                        key={apt.id}
                        href={`/app/agendamentos/${apt.id}`}
                        className="block hover:bg-white/[0.03] transition-all duration-300 group"
                        style={{
                          animation: 'fadeInUp 0.5s ease forwards',
                          animationDelay: `${idx * 100}ms`,
                          opacity: 0
                        }}
                      >
                        <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-4">
                          {/* Time indicator */}
                          <div className="text-center min-w-[60px] sm:min-w-[70px]">
                            <div className="text-xl sm:text-2xl font-bold text-[#f183ff]">
                              {apt.time.split(':')[0]}
                            </div>
                            <div className="text-xs text-white/40">{apt.time.split(':')[1]}</div>
                          </div>

                          {/* Pet avatar */}
                          <div className="relative">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-lg sm:text-xl border border-[#f183ff]/20 group-hover:scale-110 group-hover:border-[#f183ff]/40 transition-all duration-300">
                              {sizeEmojis[(apt.pet?.size as 'small' | 'medium' | 'large') || 'medium']}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#22c55e] border-2 border-[#1a0f2e]" />
                          </div>

                          {/* Pet info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">{apt.pet?.name}</p>
                            <p className="text-white/50 text-xs truncate">{apt.service?.name}</p>
                          </div>

                          {/* Chevron */}
                          <ChevronRight size={18} className="text-white/20 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all duration-300" />
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="relative inline-block mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/10 flex items-center justify-center border border-[#f183ff]/20">
                          <Sparkles size={28} className="text-[#f183ff]/60" />
                        </div>
                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#f183ff]/10 animate-ping" />
                      </div>
                      <p className="text-white font-semibold text-base sm:text-lg">Nada agendado para hoje</p>
                      <p className="text-white/40 text-sm mt-2">Aproveite o dia livre! ✨</p>
                    </div>
                  )}
                </GlassCard>
              </section>

              {/* Quick Actions */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pb-20 lg:pb-0">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                    Ações Rápidas
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#f183ff]/30 to-transparent" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickAction
                    href="/app/agendamentos/novo"
                    label="Novo Agendamento"
                    icon={Calendar}
                    color="purple"
                  />
                  <QuickAction
                    href="/app/clientes/novo"
                    label="Novo Cliente"
                    icon={Users}
                    color="pink"
                  />
                  <QuickAction
                    href="/app/pets/novo"
                    label="Novo Pet"
                    icon={PawPrint}
                    color="violet"
                  />
                  <QuickAction
                    href="/app/servicos"
                    label="Serviços"
                    icon={Scissors}
                    color="indigo"
                  />
                </div>
              </section>
            </>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}

interface StatCardV2Props {
  label: string
  value: string
  icon: LucideIcon
  variant: 'purple' | 'pink' | 'green' | 'violet'
  trend?: string
}

function StatCardV2({ label, value, icon: Icon, variant, trend }: StatCardV2Props) {
  const variants = {
    purple: {
      bg: 'from-[#f183ff]/10 to-[#d946ef]/10',
      border: 'border-[#f183ff]/20',
      icon: 'text-[#f183ff]',
      iconBg: 'bg-[#f183ff]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(241,131,255,0.2)]'
    },
    pink: {
      bg: 'from-[#d946ef]/10 to-[#ec4899]/10',
      border: 'border-[#d946ef]/20',
      icon: 'text-[#d946ef]',
      iconBg: 'bg-[#d946ef]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]'
    },
    green: {
      bg: 'from-[#22c55e]/10 to-[#10b981]/10',
      border: 'border-[#22c55e]/20',
      icon: 'text-[#22c55e]',
      iconBg: 'bg-[#22c55e]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]'
    },
    violet: {
      bg: 'from-[#8b5cf6]/10 to-[#6366f1]/10',
      border: 'border-[#8b5cf6]/20',
      icon: 'text-[#8b5cf6]',
      iconBg: 'bg-[#8b5cf6]/20',
      glow: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'
    }
  }

  const style = variants[variant]

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-4 sm:p-5
      bg-gradient-to-br ${style.bg}
      border ${style.border}
      backdrop-blur-xl
      transition-all duration-300
      hover:scale-[1.02] ${style.glow}
      group
    `}>
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${style.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={20} className={style.icon} />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-white mb-1 truncate tracking-tight">
          {value}
        </div>
        <div className="text-xs text-white/50 uppercase tracking-wide">
          {label}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-[#22c55e] text-xs font-medium">
            <TrendingUp size={14} />
            {trend}
          </div>
        )}
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full" />
    </div>
  )
}

interface QuickActionProps {
  href: string
  label: string
  icon: LucideIcon
  color: 'purple' | 'pink' | 'violet' | 'indigo'
}

function QuickAction({ href, label, icon: Icon, color }: QuickActionProps) {
  const colors = {
    purple: 'bg-[#f183ff]/20 border-[#f183ff]/30 text-[#f183ff] hover:bg-[#f183ff]/30 hover:border-[#f183ff]/50 hover:shadow-[0_0_20px_rgba(241,131,255,0.3)]',
    pink: 'bg-[#d946ef]/20 border-[#d946ef]/30 text-[#d946ef] hover:bg-[#d946ef]/30 hover:border-[#d946ef]/50 hover:shadow-[0_0_20px_rgba(217,70,239,0.3)]',
    violet: 'bg-[#8b5cf6]/20 border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/30 hover:border-[#8b5cf6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]',
    indigo: 'bg-[#6366f1]/20 border-[#6366f1]/30 text-[#6366f1] hover:bg-[#6366f1]/30 hover:border-[#6366f1]/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]'
  }

  return (
    <Link
      href={href}
      className={`
        flex flex-col items-center justify-center gap-2 p-4 sm:p-5
        rounded-xl border backdrop-blur-xl
        transition-all duration-300
        hover:scale-105 hover:-translate-y-1
        ${colors[color]}
      `}
    >
      <Icon size={24} className="transition-transform duration-300 group-hover:scale-110" />
      <span className="text-xs sm:text-sm font-medium text-white/90 text-center">
        {label}
      </span>
    </Link>
  )
}
