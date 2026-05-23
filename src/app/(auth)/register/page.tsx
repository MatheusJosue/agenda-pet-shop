"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Headphones, Lock, Mail, Shield, Ticket, User } from "lucide-react";
import { register } from "@/lib/actions/auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

interface RegisterFormState {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    inviteCode?: string[];
  };
  error?: string;
  success?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, isPending] = useActionState<RegisterFormState, FormData>(
    async (_prevState, formData) => {
      const result = await register(formData);
      return result.success
        ? { success: true }
        : {
            error: result.error || "Erro ao criar conta",
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#bf185d] mb-2">
            Criar sua conta
          </h1>
          <p className="text-[#68797d] font-bold text-sm">
            Comece sua jornada no cuidado pet hoje mesmo
          </p>
        </div>

        <GlassCard variant="elevated" className="w-full max-w-md p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <form action={formAction} className="space-y-5">
            <RegisterField
              id="name"
              name="name"
              type="text"
              label="Nome Completo *"
              placeholder="Seu nome completo"
              autoComplete="name"
              icon={<User size={18} />}
              required
              error={state.errors?.name?.[0]}
            />

            <RegisterField
              id="email"
              name="email"
              type="email"
              label="E-mail *"
              placeholder="seu@email.com"
              autoComplete="email"
              icon={<Mail size={18} />}
              required
              error={state.errors?.email?.[0]}
            />

            <div>
              <label htmlFor="password" className="block text-[#21363a] text-sm font-extrabold mb-2">
                Senha *
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]" size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                  className={fieldClassName}
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

            <RegisterField
              id="inviteCode"
              name="inviteCode"
              type="text"
              label="Código de Convite"
              optionalLabel="(opcional)"
              placeholder="ADMIN-SEED-2024"
              icon={<Ticket size={18} />}
              error={state.errors?.inviteCode?.[0]}
            />

            {state.error && !state.errors?.name && !state.errors?.email && !state.errors?.password && !state.errors?.inviteCode && (
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
              {isPending ? "Criando conta..." : "Criar Conta"}
            </Button>
          </form>

          <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
            <p className="text-[#68797d] font-bold text-sm">
              Já possui uma conta?{" "}
              <Link
                href="/login"
                className="text-[#bf185d] hover:text-[#e8327b] font-extrabold transition-colors"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </GlassCard>

        <div className="mt-7 grid grid-cols-2 gap-4 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <FooterFeature icon={<Shield size={18} />} title="Segurança" description="Dados protegidos" />
          <FooterFeature icon={<Headphones size={18} />} title="Suporte" description="Sempre disponível" />
        </div>
      </div>
    </div>
  );
}

const fieldClassName =
  "w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/86 border border-[rgba(232,50,123,0.28)] text-[#21363a] placeholder-[#68797d]/70 focus:outline-none focus:ring-2 focus:ring-[#e8327b]/20 focus:border-[#e8327b] backdrop-blur-sm transition-all hover:bg-white";

function RegisterField({
  id,
  name,
  type,
  label,
  optionalLabel,
  placeholder,
  autoComplete,
  icon,
  required,
  error,
}: {
  id: string;
  name: string;
  type: string;
  label: string;
  optionalLabel?: string;
  placeholder: string;
  autoComplete?: string;
  icon: React.ReactNode;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[#21363a] text-sm font-extrabold mb-2">
        {label}
        {optionalLabel && <span className="text-[#68797d] font-bold ml-1">{optionalLabel}</span>}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#006c73]">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={fieldClassName}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-bold text-red-600">{error}</p>}
    </div>
  );
}

function FooterFeature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/80 border border-[rgba(232,50,123,0.22)] flex items-center justify-center text-[#006c73]">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs font-extrabold text-[#21363a]">{title}</p>
        <p className="text-[10px] font-bold text-[#68797d]">{description}</p>
      </div>
    </div>
  );
}
