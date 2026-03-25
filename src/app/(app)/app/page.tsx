'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedIcon } from '@/components/ui/animated-icon'
import { Calendar, Scissors, Users, Sparkles, ChevronRight, DollarSign } from 'lucide-react'

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
      <div className="flex flex-col h-dvh bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden">
        {/* Mobile-only components */}
        <AppHeader companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }} />

        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6 relative">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Welcome Section */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
                  Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Bem-vindo'}
                  <AnimatedIcon icon={Sparkles} variant="pulse" size={20} className="text-purple-400" />
                </h2>
                <p className="text-purple-200/60 mt-1">
                  {todayCount > 0
                    ? `Você tem ${todayCount} agendamento${todayCount > 1 ? 's' : ''} hoje`
                    : 'Nenhum agendamento para hoje'}
                </p>
              </section>

              {/* Stats Cards */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                <h3 className="text-sm font-semibold text-purple-200/80 uppercase tracking-wide mb-3">
                  Visão Geral
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    label="Agendamentos Hoje"
                    value={todayCount?.toString() || '0'}
                    icon={Calendar}
                    color="purple"
                  />
                  <StatCard
                    label="Faturamento Mensal"
                    value={formatCurrency(monthlyRevenue)}
                    icon={DollarSign}
                    color="green"
                  />
                  <StatCard
                    label="Total Clientes"
                    value={clientsCount?.toString() || '0'}
                    icon={Users}
                    color="pink"
                  />
                  <StatCard
                    label="Serviços Ativos"
                    value={servicesCount?.toString() || '0'}
                    icon={Scissors}
                    color="purple"
                  />
                </div>
              </section>

              {/* Today's Schedule */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-purple-200/80 uppercase tracking-wide">
                    Agenda de Hoje
                  </h3>
                  <Link href="/app/agendamentos" className="text-sm text-purple-300 font-medium hover:text-purple-200 flex items-center gap-1 group">
                    Ver todos
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <GlassCard variant="default" className="divide-y divide-white/10">
                  {todayAppointments.length > 0 ? (
                    todayAppointments.map((apt, idx) => (
                      <Link key={apt.id} href={`/app/agendamentos/${apt.id}`} className="block hover:bg-white/[0.03] transition-colors first:rounded-t-2xl last:rounded-b-2xl">
                        <div className="p-4 flex items-center gap-3">
                          <div className="text-center min-w-[50px]">
                            <div className="text-lg font-bold text-purple-300">{apt.time.split(':')[0]}</div>
                            <div className="text-xs text-purple-200/50">{apt.time.split(':')[1]}</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm">
                            {sizeEmojis[(apt.pet?.size as 'small' | 'medium' | 'large') || 'medium']}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium text-sm truncate">{apt.pet?.name}</p>
                            <p className="text-purple-200/50 text-xs truncate">{apt.service?.name}</p>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <AnimatedIcon icon={Sparkles} variant="scale" size={40} className="text-purple-400 mx-auto mb-3" />
                      <p className="text-white font-medium">Nada agendado para hoje</p>
                      <p className="text-purple-200/60 text-sm mt-1">Aproveite o dia livre!</p>
                    </div>
                  )}
                </GlassCard>
              </section>
            </>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: 'purple' | 'pink' | 'green' }) {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/20',
    pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-pink-500/20',
    green: 'bg-green-500/20 text-green-300 border-green-500/30 shadow-green-500/20',
  }

  return (
    <div className={`p-4 rounded-2xl border backdrop-blur-sm ${colorClasses[color]} min-h-[100px]`}>
      <Icon size={20} className="mb-2" />
      <div className="text-xl font-bold text-white truncate">{value}</div>
      <div className="text-xs mt-1 text-white/70">{label}</div>
    </div>
  )
}
