'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      <GlassCard variant="elevated" size="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-white/70">Preencha seus dados para se cadastrar</p>
        </div>

        <form action={formAction} className="space-y-5">
          <Input
            label="Nome"
            type="text"
            name="name"
            placeholder="Seu nome completo"
            required
            autoComplete="name"
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
            error={!!state.errors?.email?.length || !!state.error}
            errorMessage={state.errors?.email?.[0]}
          />

          <Input
            label="Senha"
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            error={!!state.errors?.password?.length || !!state.error}
            errorMessage={state.errors?.password?.[0]}
          />

          <Input
            label="Código de Convite"
            type="text"
            name="inviteCode"
            placeholder="123456"
            required
            maxLength={6}
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
            className="w-full"
          >
            {isPending ? 'Criando...' : 'Criar Conta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-white/70 text-sm">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Fazer login
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
