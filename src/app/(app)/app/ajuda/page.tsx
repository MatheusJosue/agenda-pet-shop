'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { SkeletonInput } from '@/components/skeleton'
import {
  HelpCircle,
  ArrowLeft,
  MessageCircle,
  Mail,
  Sparkles,
  Search,
  Phone,
} from 'lucide-react'

const quickActions = [
  {
    title: 'Chat de Suporte',
    description: 'Fale com nossa equipe',
    icon: MessageCircle,
    action: 'chat',
    available: false,
  },
  {
    title: 'Enviar E-mail',
    description: 'suporte@agendapetshop.com',
    icon: Mail,
    action: 'mailto:suporte@agendapetshop.com',
    available: true,
  },
  {
    title: 'WhatsApp',
    description: '(11) 93948-5971',
    icon: Phone,
    action: 'https://wa.me/5511939485971',
    available: true,
  },
]

export default function AjudaPage() {
  const router = useRouter()
  const [user, setUser] = useState<{
    user_metadata?: { name?: string }
    email?: string
  } | null>(null)
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

  function handleAction(action: string) {
    if (action.startsWith('mailto:')) {
      window.location.href = action
    } else if (action.startsWith('http')) {
      window.open(action, '_blank')
    }
  }

  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{}}>
        <div className="min-h-dvh bg-[#120a21] relative flex flex-col overflow-hidden">
          {/* Premium animated background layers */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
          </div>

          <AppHeader companyName={companyName} user={{}} />

          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto pb-20">
            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
              {/* Header Skeleton */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2b2041]/40 animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#2b2041]/40 animate-pulse" />
                    <div className="h-6 w-40 bg-[#2b2041]/40 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-5 w-48 bg-[#2b2041]/40 rounded animate-pulse ml-14" />
              </div>

              {/* Search Bar Skeleton */}
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="p-4 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10">
                  <div className="h-12 w-full bg-[#2b2041]/40 rounded-xl animate-pulse" />
                </div>
              </div>

              {/* Quick Actions Skeleton */}
              <div className="grid grid-cols-2 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10"
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#2b2041]/40 animate-pulse" />
                      <div className="w-full">
                        <div className="h-5 w-24 bg-[#2b2041]/40 rounded animate-pulse mx-auto mb-1" />
                        <div className="h-4 w-32 bg-[#2b2041]/40 rounded animate-pulse mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ CTA Section Skeleton */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="p-8 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#2b2041]/40 animate-pulse mx-auto mb-5" />
                  <div className="h-7 w-48 bg-[#2b2041]/40 rounded animate-pulse mx-auto mb-3" />
                  <div className="h-5 w-full max-w-sm bg-[#2b2041]/40 rounded animate-pulse mx-auto mb-6" />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 h-12 bg-[#2b2041]/40 rounded-xl animate-pulse" />
                    <div className="flex-1 h-12 bg-[#2b2041]/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* Bottom Navigation Skeleton */}
          <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#120a21]/95 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-center justify-around h-full px-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-10 h-10 bg-[#2b2041]/40 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="min-h-dvh bg-[#120a21] relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-20">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2 rounded-xl hover:bg-white/10"
                >
                  <ArrowLeft size={20} className="text-white/70" />
                </Button>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <HelpCircle size={20} className="text-[#f183ff]" />
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-white">
                      Central de Ajuda
                    </h1>
                  </div>
                </div>
              </div>

              <p className="text-white/50 text-sm ml-14">
                Como podemos ajudar você hoje?
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard variant="elevated" className="p-1">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  />
                  <input
                    type="text"
                    placeholder="Buscar ajuda..."
                    className="w-full bg-transparent rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none transition-all"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {quickActions.map((action, index) => (
                <GlassCard
                  key={action.title}
                  variant="elevated"
                  className={`p-5 animate-in fade-in slide-in-from-bottom-4 duration-700 ${
                    !action.available ? 'opacity-50' : ''
                  }`}
                  style={{ animationDelay: `${150 + index * 50}ms` }}
                >
                  <button
                    onClick={() => action.available && handleAction(action.action)}
                    className="w-full flex flex-col items-center text-center gap-3"
                    disabled={!action.available}
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        action.available
                          ? 'bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 border border-[#f183ff]/20'
                          : 'bg-white/5 border border-white/10'
                      }`}
                    >
                      <action.icon
                        size={24}
                        className={action.available ? 'text-[#f183ff]' : 'text-white/30'}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {action.title}
                      </h3>
                      <p className="text-xs text-white/40">{action.description}</p>
                    </div>
                  </button>
                </GlassCard>
              ))}
            </div>

            {/* FAQ CTA Section */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <GlassCard
                variant="elevated"
                className="p-8 text-center bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/10 border-[#f183ff]/30"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center mx-auto mb-5 border border-[#f183ff]/20">
                  <MessageCircle size={32} className="text-[#f183ff]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  Ainda precisa de ajuda?
                </h3>
                <p className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                  Nossa equipe está pronta para ajudar você. Entre em contato pelo
                  WhatsApp ou e-mail.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://wa.me/5511939485971?text=Olá! Preciso de ajuda com o sistema Agenda Pet Shop."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#25D366]/90 hover:to-[#128C7E]/90 border-0 shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all duration-300 font-semibold"
                    >
                      <Phone size={18} className="mr-2" />
                      WhatsApp
                    </Button>
                  </a>
                  <a
                    href="mailto:suporte@agendapetshop.com"
                    className="flex-1"
                  >
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300 font-semibold"
                    >
                      <Mail size={18} className="mr-2" />
                      E-mail
                    </Button>
                  </a>
                </div>
              </GlassCard>
            </div>

            {/* Version Info */}
            <div className="text-center py-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                <Sparkles size={12} />
                <span>Versão 1.0.0 • Agenda Pet Shop</span>
              </div>
            </div>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}
