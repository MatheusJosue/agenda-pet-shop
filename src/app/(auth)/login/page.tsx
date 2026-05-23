"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail, PawPrint } from "lucide-react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

interface LoginFormState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  error?: string;
  success?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<LoginFormState, FormData>(
    async (_prevState, formData) => {
      const result = await login(formData);
      return result.success
        ? { success: true }
        : {
            error: result.error || "Erro ao fazer login",
          };
    },
    {},
  );

  useEffect(() => {
    if (state.success) {
      router.push("/app");
    }
  }, [state.success, router]);

  return (
    <div className="min-h-dvh bg-transparent relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16px_16px,rgba(232,50,123,0.07)_1.5px,transparent_2px)] bg-[size:34px_34px]" />
        <div className="absolute left-[8%] top-24 text-5xl text-[#e8327b]/10">🐾</div>
        <div className="absolute right-[10%] bottom-20 text-5xl text-[#e8327b]/10">♥</div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-dvh p-4 sm:p-6">
        <div className="text-center mb-7 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#e8327b] flex items-center justify-center shadow-[0_10px_26px_rgba(232,50,123,0.24)]">
            <PawPrint className="text-white" size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#bf185d] mb-2">
            Bem-vindo de volta
          </h1>
          <p className="text-[#68797d] font-bold text-sm">
            Acesse sua conta para gerenciar a agenda
          </p>
        </div>

        <GlassCard variant="elevated" className="w-full max-w-md p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[#21363a] text-sm font-extrabold mb-2">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]" size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  autoComplete="email"
                  className={fieldClassName}
                />
              </div>
              {state.errors?.email && (
                <p className="mt-1.5 text-xs font-bold text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-[#21363a] text-sm font-extrabold">
                  Senha
                </label>
                <Link
                  href="/esqueci-senha"
                  className="text-xs font-extrabold text-[#bf185d] hover:text-[#e8327b] transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className={`${fieldClassName} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#006c73] hover:text-[#bf185d] transition-colors"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {state.errors?.password && (
                <p className="mt-1.5 text-xs font-bold text-red-600">{state.errors.password[0]}</p>
              )}
            </div>

            {state.error && !state.errors?.email && !state.errors?.password && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm font-bold text-red-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {state.error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="w-full rounded-xl font-extrabold"
            >
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-[#68797d] font-bold text-sm">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-[#bf185d] hover:text-[#e8327b] font-extrabold transition-colors"
              >
                Criar conta
              </Link>
            </p>
          </div>
        </GlassCard>

        <div className="mt-7 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#68797d]">
            <Link href="/privacy" className="hover:text-[#bf185d] transition-colors">
              Privacidade
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#bf185d] transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const fieldClassName =
  "w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/86 border border-[rgba(232,50,123,0.28)] text-[#21363a] placeholder-[#68797d]/70 focus:outline-none focus:ring-2 focus:ring-[#e8327b]/20 focus:border-[#e8327b] backdrop-blur-sm transition-all hover:bg-white";
