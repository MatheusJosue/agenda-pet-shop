'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/actions/clients'
import { AppLayout } from '@/components/layout/app-layout'
import { AppHeader } from '@/components/layout/app-header'
import { BottomNavigation } from '@/components/layout/bottom-navigation'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, UserPlus, User, Phone, Mail, FileText, Sparkles } from 'lucide-react'

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await createClient(formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/app/clientes')
      }
    } catch (err) {
      setError('Erro ao criar cliente')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <div className="min-h-dvh bg-[#120a21] relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader companyName="Agenda Pet Shop" user={{}} />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Content */}
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
            {/* Page Header */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Link href="/app/clientes">
                  <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-white/10">
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <UserPlus size={24} className="text-[#f183ff]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                      Novo Cliente
                    </h1>
                    <p className="text-white/50 text-sm mt-0.5">Cadastre as informações do cliente</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Welcome Card */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard variant="elevated" className="p-6 bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 border-[#f183ff]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f183ff]/20 flex items-center justify-center flex-shrink-0 border border-[#f183ff]/20">
                    <Sparkles size={24} className="text-[#f183ff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Bem-vindo ao cadastro de clientes!
                    </h3>
                    <p className="text-xs text-white/60">
                      Preencha as informações abaixo para adicionar um novo cliente
                      ao sistema.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {error && (
              <GlassCard variant="default" className="p-4 mb-6 bg-red-500/10 border-red-500/30 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </p>
              </GlassCard>
            )}

            <GlassCard variant="elevated" className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                  <label htmlFor="name" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                      <User size={14} className="text-[#f183ff]" />
                    </span>
                    Nome *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Nome do cliente"
                    required
                    minLength={3}
                    className="w-full"
                  />
                </div>

                {/* Phone */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                  <label htmlFor="phone" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                      <Phone size={14} className="text-[#d946ef]" />
                    </span>
                    Telefone *
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(11) 98765-4321"
                    required
                    className="w-full"
                  />
                </div>

                {/* Email */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                  <label htmlFor="email" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                      <Mail size={14} className="text-[#8b5cf6]" />
                    </span>
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full"
                  />
                </div>

                {/* Notes */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                  <label htmlFor="notes" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                      <FileText size={14} className="text-[#6366f1]" />
                    </span>
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Adicione observações sobre o cliente..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '350ms' }}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                  >
                    {loading ? 'Salvando...' : 'Salvar Cliente'}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  )
}
