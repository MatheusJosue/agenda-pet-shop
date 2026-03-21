'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface LoginFormState {
  errors?: {
    email?: string[]
    password?: string[]
  }
  error?: string
  success?: boolean
}

export default function LoginPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-pink-800/20 to-purple-900/20">
      <GlassCard variant="elevated" size="lg" className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo</h1>
          <p className="text-white/70">Entre na sua conta</p>
        </div>

        <form action={formAction} className="space-y-6">
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
            autoComplete="current-password"
            error={!!state.errors?.password?.length || !!state.error}
            errorMessage={state.errors?.password?.[0]}
          />

          {state.error && !state.errors?.email && !state.errors?.password && (
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
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-white/70 text-sm">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </GlassCard>
    </div>
  )
}
