'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PawPrint, Sparkles, User, Mail, Lock, Ticket } from 'lucide-react'
import { register } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { AnimatedIcon } from '@/components/ui/animated-icon'

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
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 relative overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative flex items-center justify-center min-h-screen p-4">
        <GlassCard variant="elevated" className="w-full max-w-md p-8 space-y-6">
          {/* Logo & Header */}
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <PawPrint className="text-white" size={40} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2 mb-2" style={{ fontFamily: 'var(--font-outfit), sans-serif' }}>
              Criar Conta
              <AnimatedIcon icon={Sparkles} variant="pulse" size={20} className="text-purple-400" />
            </h1>
            <p className="text-purple-200/60">Preencha seus dados para se cadastrar</p>
          </div>

          {/* Form */}
          <form action={formAction} className="space-y-4">
            <Input
              label="Nome"
              type="text"
              name="name"
              placeholder="Seu nome completo"
              required
              autoComplete="name"
              leftIcon={<User size={18} className="text-purple-400" />}
              error={!!state.errors?.name?.length || !!state.error}
              errorMessage={state.errors?.name?.[0]}
            />

            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
              leftIcon={<Mail size={18} className="text-purple-400" />}
              error={!!state.errors?.email?.length || !!state.error}
              errorMessage={state.errors?.email?.[0]}
            />

            <PasswordInput
              label="Senha"
              name="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              leftIcon={<Lock size={18} className="text-purple-400" />}
              error={!!state.errors?.password?.length || !!state.error}
              errorMessage={state.errors?.password?.[0]}
            />

            <Input
              label="Código de Convite"
              type="text"
              name="inviteCode"
              placeholder="ADMIN-SEED-2024"
              required
              leftIcon={<Ticket size={18} className="text-purple-400" />}
              error={!!state.errors?.inviteCode?.length || !!state.error}
              errorMessage={state.errors?.inviteCode?.[0]}
            />

            {state.error && !state.errors?.name && !state.errors?.email && !state.errors?.password && !state.errors?.inviteCode && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30">
                <p className="text-sm text-red-200">{state.error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="w-full mt-6"
            >
              {isPending ? 'Criando...' : 'Criar Conta'}
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-purple-200/60 text-sm">
            Já tem uma conta?{' '}
            <Link
              href="/login"
              className="text-purple-300 hover:text-purple-200 font-medium transition-colors"
            >
              Fazer login
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  )
}
