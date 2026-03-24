'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  Mail,
  Sparkles,
  ChevronRight
} from 'lucide-react'

const helpCategories: Array<{ title: string; icon: any; items: Array<{ title: string; description: string }> }> = []

const quickActions = [
  {
    title: 'Chat de suporte',
    description: 'Fale com nossa equipe',
    icon: MessageCircle,
    action: 'chat',
    available: false
  },
  {
    title: 'Enviar email',
    description: 'suporte@agendapetshop.com',
    icon: Mail,
    action: 'mailto:suporte@agendapetshop.com',
    available: true
  }
]

export default function AjudaPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
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
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{}}>
        <AppHeader companyName={companyName} user={{}} />
        <div className="min-h-screen xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent xl:pb-0 pb-20">
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <AppHeader
        companyName={companyName}
        user={{ name: user?.user_metadata?.name, email: user?.email }}
      />
      <div className="min-h-screen xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent xl:pb-0 pb-20">

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Central de Ajuda
              <Sparkles size={20} className="text-purple-400" />
            </h1>
            <p className="text-purple-200/60 text-sm">
              Como podemos ajudar você hoje?
            </p>
          </div>
        </div>

        {/* Search */}
        <GlassCard variant="default" className="p-4">
          <div className="relative">
            <HelpCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
            <input
              type="text"
              placeholder="Buscar ajuda..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                       text-white placeholder-purple-200/40
                       focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                       transition-all"
            />
          </div>
        </GlassCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <GlassCard
              key={action.title}
              variant="default"
              className={`p-4 ${!action.available ? 'opacity-50' : ''}`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`p-3 rounded-xl ${action.available
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-gray-500/20 text-gray-400'
                  }`}>
                  <action.icon size={24} />
                </div>
                <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                <p className="text-xs text-purple-200/60">{action.description}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Help Categories */}
        {helpCategories.map((category, idx) => (
          <div key={category.title}>
            <h3 className="text-sm font-semibold text-purple-200/80 uppercase tracking-wide mb-3 flex items-center gap-2">
              <category.icon size={16} />
              {category.title}
            </h3>
            <GlassCard variant="default" className="divide-y divide-white/10">
              {category.items.map((item, itemIdx) => (
                <button
                  key={item.title}
                  className="w-full p-4 flex items-center justify-between
                           hover:bg-white/[0.03] transition-colors
                           first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                      {String.fromCharCode(65 + itemIdx)}
                    </div>
                    <div className="text-left">
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-purple-200/50 text-xs">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-purple-400" />
                </button>
              ))}
            </GlassCard>
          </div>
        ))}

        {/* Contact CTA */}
        <GlassCard variant="elevated" className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={24} className="text-purple-400" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Ainda precisa de ajuda?
          </h3>
          <p className="text-purple-200/60 text-sm mb-4">
            Nossa equipe está pronta para ajudar você
          </p>
          <Button
            className="bg-white text-purple-600 hover:bg-purple-50 font-medium"
            onClick={() => window.location.href = 'mailto:suporte@agendapetshop.com'}
          >
            <Mail size={18} className="mr-2" />
            Entrar em Contato
          </Button>
        </GlassCard>

        {/* Version Info */}
        <div className="text-center py-4">
          <p className="text-purple-200/30 text-xs">
            Versão 1.0.0 • Agenda Pet Shop
          </p>
        </div>
      </main>

      <BottomNavigation />
      </div>
    </AppLayout>
  )
}
