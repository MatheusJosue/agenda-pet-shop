'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { AnimatedIcon } from '@/components/ui/animated-icon'
import { motion } from 'framer-motion'
import { Scissors, Clock, Cat, Dog, Dog as DogLarge, Plus, ChevronRight, Sparkles } from 'lucide-react'
import type { Service } from '@/lib/types/services'

const sizeLabels = {
  small: 'Pequeno',
  medium: 'Médio',
  large: 'Grande'
}

const sizeIcons = {
  small: Cat,
  medium: Dog,
  large: DogLarge
}

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import('@/lib/actions/app')
        const result = await getAppStats()
        if (result.data) {
          setCompanyName(result.data.companyName || 'Agenda Pet Shop')
          setUser(result.data.user)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    async function loadServices() {
      try {
        const { getServices } = await import('@/lib/actions/services')
        const { data } = await getServices()
        setServices(data || [])
      } catch (error) {
        console.error('Error loading services:', error)
      } finally {
        setLoading(false)
      }
    }
    loadServices()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden pb-20">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <AppHeader
        companyName={companyName}
        user={{ name: user?.user_metadata?.name, email: user?.email }}
        title="Serviços"
        subtitle={`${services?.length || 0} serviço${services?.length !== 1 ? 's' : ''}`}
        icon="✂️"
        action={
          <Link href="/app/servicos/novo">
            <Button variant="primary" size="sm" className="rounded-full gap-1">
              <Plus size={16} />
              Novo
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !services || services.length === 0 ? (
          <GlassCard variant="default" className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatedIcon icon={Sparkles} variant="spin" size={48} className="text-fuchsia-400 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Nenhum serviço cadastrado
            </h2>
            <p className="text-purple-200/60 mb-6">
              Comece adicionando seu primeiro serviço
            </p>
            <Link href="/app/servicos/novo">
              <Button variant="primary" size="md" className="gap-2">
                <Plus size={16} />
                Adicionar Serviço
              </Button>
            </Link>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {services.map((service, index) => {
              const MediumIcon = sizeIcons.medium
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link href={`/app/servicos/${service.id}`}>
                    <GlassCard
                      variant="default"
                      className="p-5 hover:scale-[1.01] hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Icon */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Scissors size={26} className="text-white" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1">
                            {service.name}
                          </h3>
                          <p className="text-sm text-purple-200/60 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Clock size={12} className="text-purple-300" />
                            </span>
                            {service.duration_minutes} min
                          </p>
                        </div>

                        {/* Prices */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                            {service.price_medium > 0
                              ? `R$ ${service.price_medium.toFixed(0)}`
                              : 'Sob consulta'}
                          </p>
                          <p className="text-xs text-purple-300/60 flex items-center justify-end gap-1">
                            <MediumIcon size={12} />
                            médio
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight size={20} className="text-purple-300/50 group-hover:translate-x-1 transition-transform flex-shrink-0 group-hover:text-purple-300" />
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
