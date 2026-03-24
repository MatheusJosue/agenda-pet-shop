'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { User, Mail, Building2, Save, ArrowLeft } from 'lucide-react'

export default function PerfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null)
  const [companyName, setCompanyName] = useState('Agenda Pet Shop')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

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
        setName(result.data.user?.user_metadata?.name || '')
        setEmail(result.data.user?.email || '')
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // TODO: Implement profile update action
    await new Promise(resolve => setTimeout(resolve, 1000))

    setSaving(false)
  }

  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{ name, email }}>
        <AppHeader companyName={companyName} user={{ name, email }} />
        <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent xl:overflow-auto overflow-y-auto">
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout companyName={companyName} user={{ name, email }}>
      <AppHeader companyName={companyName} user={{ name, email }} />
      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent xl:overflow-auto overflow-y-auto">

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
          <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
        </div>

        {/* Avatar Card */}
        <GlassCard variant="default" className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{name}</h2>
              <p className="text-purple-200/60 text-sm">{email}</p>
            </div>
          </div>
        </GlassCard>

        {/* Profile Form */}
        <GlassCard variant="default" className="p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Nome
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                           text-white placeholder-purple-200/40
                           focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                           transition-all"
                  placeholder="Seu nome"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                           text-white/50 cursor-not-allowed
                           transition-all"
                />
              </div>
              <p className="text-xs text-purple-200/40 mt-1">
                O email não pode ser alterado
              </p>
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-purple-200 mb-2">
                Empresa
              </label>
              <div className="relative">
                <Building2 size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  value={companyName}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4
                           text-white/50 cursor-not-allowed
                           transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full py-3 mt-4 bg-gradient-to-r from-purple-500 to-pink-500
                       hover:from-purple-600 hover:to-pink-600 text-white font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       shadow-lg shadow-purple-500/25"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} className="mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </form>
        </GlassCard>

        {/* Info Card */}
        <div className="text-center py-4">
          <p className="text-purple-200/40 text-sm">
            Precisa de ajuda? <a href="/app/ajuda" className="text-purple-400 hover:text-purple-300">Acesse o suporte</a>
          </p>
        </div>
      </main>

      <BottomNavigation />
      </div>
    </AppLayout>
  )
}
