'use client'

import { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, PawPrint } from 'lucide-react'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50/50 via-pink-50/30 to-purple-50/50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-purple-950/20">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white/80 dark:bg-white/8 backdrop-blur-xl border border-purple-100/50 dark:border-purple-500/20 shadow-xl shadow-purple-500/10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <PawPrint className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Bem-vindo</h1>
          <p className="text-gray-500 dark:text-gray-400">Entre na sua conta</p>
        </div>

        <form action={formAction} className="space-y-5">
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="seu@email.com"
            required
            autoComplete="email"
            leftIcon={<PawPrint size={18} className="text-slate-400 dark:text-white/50" />}
            lightMode
            error={!!state.errors?.email?.length || !!state.error}
            errorMessage={state.errors?.email?.[0]}
          />

          <PasswordInput
            label="Senha"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            lightMode
            error={!!state.errors?.password?.length || !!state.error}
            errorMessage={state.errors?.password?.[0]}
          />

          {state.error && !state.errors?.email && !state.errors?.password && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/30">
              <p className="text-sm text-red-600 dark:text-red-200">{state.error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isPending}
            className="w-full mt-6"
          >
            {isPending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  )
}
