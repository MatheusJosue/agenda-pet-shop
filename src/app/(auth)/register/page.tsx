'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff, Ticket, Shield, Headphones } from 'lucide-react'
import { register } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'

interface RegisterFormState {
  errors?: {
    name?: string[]
    email?: string[]
    password?: string[]
    inviteCode?: string[]
  }
  error?: string
  success?: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<RegisterFormState, FormData>(
    async (prevState, formData) => {
      const result = await register(formData)
      return result.success
        ? { success: true }
        : {
            error: result.error || 'Erro ao criar conta'
          }
    },
    {}
  )

  useEffect(() => {
    if (state.success) {
      router.push('/app')
    }
  }, [state.success, router])

  return (
    <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
      {/* Premium animated background layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-dvh p-4 sm:p-6">
        {/* Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            Criar sua conta
          </h1>
          <p className="text-white/50 text-sm">
            Comece sua jornada no cuidado pet de luxo hoje mesmo
          </p>
        </div>

        {/* Form Card */}
        <GlassCard variant="elevated" className="w-full max-w-md p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <form action={formAction} className="space-y-5">
            {/* Name */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
              <label htmlFor="name" className="block text-white/80 text-sm font-medium mb-2">
                Nome Completo *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Seu nome completo"
                  required
                  autoComplete="name"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
                />
              </div>
              {state.errors?.name && (
                <p className="mt-1.5 text-xs text-red-300">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
                />
              </div>
              {state.errors?.email && (
                <p className="mt-1.5 text-xs text-red-300">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('password') as HTMLInputElement
                    input.type = input.type === 'password' ? 'text' : 'password'
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  <Eye size={18} />
                </button>
              </div>
              {state.errors?.password && (
                <p className="mt-1.5 text-xs text-red-300">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Invite Code (Optional) */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
              <label htmlFor="inviteCode" className="block text-white/80 text-sm font-medium mb-2">
                Código de Convite
                <span className="text-white/40 font-normal ml-1">(opcional)</span>
              </label>
              <div className="relative">
                <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="inviteCode"
                  name="inviteCode"
                  type="text"
                  placeholder="ADMIN-SEED-2024"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
                />
              </div>
              {state.errors?.inviteCode && (
                <p className="mt-1.5 text-xs text-red-300">{state.errors.inviteCode[0]}</p>
              )}
            </div>

            {/* General Error */}
            {state.error && !state.errors?.name && !state.errors?.email && !state.errors?.password && !state.errors?.inviteCode && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm text-red-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {state.error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300 font-semibold"
            >
              {isPending ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-white/50 text-sm">
              Já possui uma conta?{' '}
              <Link
                href="/login"
                className="text-[#f183ff] hover:text-[#f183ff]/80 font-semibold transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer Features */}
        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Shield size={18} className="text-white/40" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white/70">Segurança</p>
              <p className="text-[10px] text-white/40">Dados protegidos</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Headphones size={18} className="text-white/40" />
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-white/70">Suporte 24/7</p>
              <p className="text-[10px] text-white/40">Sempre disponível</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
