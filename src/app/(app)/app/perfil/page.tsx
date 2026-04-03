'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { AppLayout } from '@/components/layout/app-layout'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { User, Mail, Building2, Save, ArrowLeft, Sparkles } from 'lucide-react'

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

  function getInitials(name?: string): string {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }

  if (loading) {
    return (
      <AppLayout companyName={companyName} user={{ name, email }}>
        <AppHeader companyName={companyName} user={{ name, email }} />
        <div className="min-h-dvh bg-[#120a21]">
          <div className="flex items-center justify-center h-[calc(100dvh-60px-64px)]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#f183ff]/30 border-t-[#f183ff] rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Carregando...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout companyName={companyName} user={{ name, email }}>
      <div className="min-h-dvh bg-[#120a21] relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader companyName={companyName} user={{ name, email }} />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto pb-20">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 relative z-10">
            {/* Header */}
            <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="p-2 rounded-xl hover:bg-white/10"
                >
                  <ArrowLeft size={20} className="text-white/70" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <User size={20} className="text-[#f183ff]" />
                  </div>
                  <h1 className="text-xl font-semibold text-white">
                    Meu Perfil
                  </h1>
                </div>
              </div>
            </div>

            {/* Profile Avatar Card */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard
                variant="elevated"
                className="p-6 bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/5 border-[#f183ff]/20"
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-[#f183ff]/30">
                    {getInitials(name)}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
                    <p className="text-white/50 text-sm">{email}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#f183ff]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <Sparkles size={18} className="text-[#f183ff]" />
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Profile Form */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <GlassCard variant="elevated" className="p-6">
                <form onSubmit={handleSave} className="space-y-5">
                  {/* Name Field */}
                  <div>
                    <label htmlFor="name" className="block text-white/80 text-sm font-semibold mb-2.5">
                      Nome
                    </label>
                    <div className="relative">
                      <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-white/80 text-sm font-semibold mb-2.5">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white/50 cursor-not-allowed transition-all"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-2 flex items-center gap-1.5">
                      <Mail size={12} />
                      O e-mail não pode ser alterado
                    </p>
                  </div>

                  {/* Company Field */}
                  <div>
                    <label htmlFor="company" className="block text-white/80 text-sm font-semibold mb-2.5">
                      Empresa
                    </label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        id="company"
                        type="text"
                        value={companyName}
                        disabled
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white/50 cursor-not-allowed transition-all"
                      />
                    </div>
                    <p className="text-xs text-white/30 mt-2 flex items-center gap-1.5">
                      <Building2 size={12} />
                      Nome da empresa vinculado ao seu cadastro
                    </p>
                  </div>

                  {/* Save Button */}
                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_25px_rgba(241,131,255,0.4)] hover:shadow-[0_0_40px_rgba(241,131,255,0.6)] transition-all duration-300 font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {/* Support Link */}
            <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <p className="text-white/30 text-sm">
                Precisa de ajuda?{' '}
                <Link href="/app/ajuda" className="text-[#f183ff] hover:text-[#f183ff]/80 font-medium transition-colors">
                  Acesse o suporte
                </Link>
              </p>
            </div>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}
