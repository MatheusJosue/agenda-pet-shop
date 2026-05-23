'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { ArrowLeft, HelpCircle, Mail, MessageCircle, Phone, Search, Sparkles } from 'lucide-react'

const quickActions = [
  {
    title: 'WhatsApp',
    description: '(11) 93948-5971',
    icon: Phone,
    action: 'https://wa.me/5511939485971',
    available: true,
  },
  {
    title: 'E-mail',
    description: 'suporte@agendapetshop.com',
    icon: Mail,
    action: 'mailto:suporte@agendapetshop.com',
    available: true,
  },
  {
    title: 'Chat',
    description: 'Em breve',
    icon: MessageCircle,
    action: 'chat',
    available: false,
  },
]

const faqItems = [
  'Como cadastrar um novo cliente?',
  'Como adicionar pacote ao pet?',
  'Como editar preços de serviços?',
  'Como agendar usando créditos de pacote?',
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
      } catch {
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

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-transparent">
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          {loading ? (
            <HelpSkeleton />
          ) : (
            <>
              <section className="flex items-start gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mt-1 rounded-xl p-2 text-[#006c73] hover:bg-[#ffe0ec]"
                >
                  <ArrowLeft size={20} />
                </Button>
                <div>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
                    <HelpCircle size={24} />
                  </div>
                  <h1 className="text-3xl font-extrabold text-[#21363a]">Central de Ajuda</h1>
                  <p className="mt-2 text-sm font-semibold text-[#68797d]">
                    Encontre suporte para cadastros, pacotes, preços e agendamentos.
                  </p>
                </div>
              </section>

              <GlassCard className="p-2">
                <div className="relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]" />
                  <input
                    type="text"
                    placeholder="Buscar ajuda..."
                    className="w-full rounded-xl bg-white px-12 py-3 text-[#21363a] placeholder:text-[#68797d] focus:outline-none focus:ring-2 focus:ring-[#e8327b]/20"
                  />
                </div>
              </GlassCard>

              <section className="grid gap-3 sm:grid-cols-3">
                {quickActions.map((action) => (
                  <SupportCard
                    key={action.title}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    disabled={!action.available}
                    onClick={() => action.available && handleAction(action.action)}
                  />
                ))}
              </section>

              <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
                <GlassCard className="p-5">
                  <h2 className="text-xl font-extrabold text-[#21363a]">Dúvidas frequentes</h2>
                  <div className="mt-4 divide-y divide-[rgba(232,50,123,0.14)]">
                    {faqItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="flex w-full items-center justify-between py-3 text-left text-sm font-extrabold text-[#006c73] hover:text-[#bf185d]"
                      >
                        {item}
                        <Sparkles size={15} />
                      </button>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard className="p-5 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e7fff4] text-[#0b8b58]">
                    <MessageCircle size={26} />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#21363a]">Precisa falar conosco?</h2>
                  <p className="mt-2 text-sm font-semibold text-[#68797d]">
                    Chame pelo WhatsApp para resolver dúvidas operacionais.
                  </p>
                  <a
                    href="https://wa.me/5511939485971?text=Olá! Preciso de ajuda com o sistema Agenda Pet Shop."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 block"
                  >
                    <Button variant="primary" size="lg" className="w-full rounded-xl bg-[#18b96f] text-white hover:bg-[#10945a]">
                      <Phone size={18} />
                      WhatsApp
                    </Button>
                  </a>
                </GlassCard>
              </section>

              <p className="pb-4 text-center text-xs font-bold text-[#68797d]">
                Versão 1.0.0 • Agenda Pet Shop
              </p>
            </>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}

function SupportCard({
  title,
  description,
  icon: Icon,
  disabled,
  onClick,
}: {
  title: string
  description: string
  icon: ComponentType<{ size?: number; className?: string }>
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl border p-4 text-left transition-all ${
        disabled
          ? 'border-[rgba(232,50,123,0.12)] bg-white/52 opacity-60'
          : 'border-[rgba(232,50,123,0.22)] bg-white/86 hover:bg-[#fff1f6] hover:border-[#e8327b]'
      }`}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffe0ec] text-[#bf185d]">
        <Icon size={21} />
      </span>
      <span className="block font-extrabold text-[#21363a]">{title}</span>
      <span className="mt-1 block text-xs font-semibold text-[#68797d]">{description}</span>
    </button>
  )
}

function HelpSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-[#ffe0ec]" />
        <div className="h-9 w-56 animate-pulse rounded-xl bg-[#ffe0ec]" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-[#fff1f6]" />
      </div>
      <div className="h-14 animate-pulse rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-4">
            <div className="mb-3 h-11 w-11 animate-pulse rounded-2xl bg-[#ffe0ec]" />
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#ffe0ec]" />
            <div className="h-3 w-32 animate-pulse rounded bg-[#fff1f6]" />
          </div>
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80" />
    </div>
  )
}
