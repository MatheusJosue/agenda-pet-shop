'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, PawPrint } from 'lucide-react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'

interface LoginFormState {
  errors?: {
    email?: string[]
    password?: string[]
  }
  error?: string
  success?: boolean
}

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    async (prevState, formData) => {
      const result = await login(formData)
      return result.success
        ? { success: true }
        : {
            error: result.error || 'Erro ao fazer login'
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
        {/* Logo & Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/30">
            <PawPrint className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-white/50 text-sm">
            Acesse sua conta para gerenciar seus pets
          </p>
        </div>

        {/* Form Card */}
        <GlassCard variant="elevated" className="w-full max-w-md p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <form action={formAction} className="space-y-5">
            {/* Email */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                E-mail
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

            {/* Password with Forgot Password link */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-white/80 text-sm font-medium">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs text-[#f183ff] hover:text-[#f183ff]/80 transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

            {/* General Error */}
            {state.error && !state.errors?.email && !state.errors?.password && (
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
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-white/50 text-sm">
              Não tem uma conta?{' '}
              <Link
                href="/register"
                className="text-[#f183ff] hover:text-[#f183ff]/80 font-semibold transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </GlassCard>

        {/* Footer Links */}
        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center justify-center gap-4 text-xs text-white/30">
            <Link href="/privacy" className="hover:text-white/50 transition-colors">
              Privacidade
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white/50 transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
