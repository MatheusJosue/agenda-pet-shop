"use client";

import Link from "next/link";
import {
  PawPrint,
  Sparkles,
  ArrowRight,
  Calendar,
  Users,
  Shield,
  Headphones,
  Heart,
  ChevronRight,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
      {/* Premium animated background layers */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[10%] w-3 h-3 bg-[#f183ff]/40 rounded-full blur-sm animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute top-[60%] right-[15%] w-2 h-2 bg-[#d946ef]/50 rounded-full blur-sm animate-[float_8s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[30%] left-[20%] w-4 h-4 bg-[#8b5cf6]/30 rounded-full blur-sm animate-[float_7s_ease-in-out_infinite]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl bg-[#120a21]/70">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/30 group-hover:shadow-[#f183ff]/50 transition-all duration-300">
                <PawPrint className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Agenda Pet Shop
              </span>
            </Link>

            {/* CTA Button */}
            <Link href="/login">
              <Button
                variant="primary"
                size="sm"
                className="rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300 font-semibold text-sm px-5"
              >
                Começar Agora
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pt-20">
          <div className="max-w-6xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles size={14} className="text-[#f183ff]" />
              <span className="text-sm text-white/80">
                O futuro do pet care chegou
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Gestão de Pet Shop{" "}
              <span className="inline-block bg-gradient-to-r from-[#f183ff] via-[#d946ef] to-[#8b5cf6] bg-clip-text text-transparent">
                reimaginada
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              Sistema profissional, intuitivo e moderno para o seu pet shop.
              Otimize seu fluxo de trabalho com ferramentas de alta qualidade
              projetadas para cuidadores modernos.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link href="/register">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_25px_rgba(241,131,255,0.4)] hover:shadow-[0_0_40px_rgba(241,131,255,0.6)] transition-all duration-300 font-semibold px-8"
                >
                  Começar Agora
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8"
                >
                  Fazer Login
                </Button>
              </Link>
            </div>

            {/* Hero Visual - Floating Cards */}
            <div className="mt-16 relative h-[300px] sm:h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
              {/* Central glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#f183ff]/20 rounded-full blur-[80px]" />

              {/* Floating card 1 */}
              <div className="absolute top-1/4 left-[10%] animate-[float_6s_ease-in-out_infinite]">
                <GlassCard
                  variant="elevated"
                  className="p-4 bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/10 border-[#f183ff]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                      <Calendar size={20} className="text-[#f183ff]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-white/50">Agendamentos</p>
                      <p className="text-sm font-semibold text-white">
                        24 hoje
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Floating card 2 */}
              <div className="absolute top-1/3 right-[10%] animate-[float_8s_ease-in-out_infinite_reverse]">
                <GlassCard
                  variant="elevated"
                  className="p-4 bg-gradient-to-br from-[#d946ef]/20 to-[#8b5cf6]/10 border-[#d946ef]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                      <Users size={20} className="text-[#d946ef]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-white/50">Clientes</p>
                      <p className="text-sm font-semibold text-white">
                        +150 ativos
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Floating card 3 */}
              <div className="absolute bottom-1/3 right-[20%] animate-[float_9s_ease-in-out_infinite_reverse]">
                <GlassCard
                  variant="elevated"
                  className="p-4 bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/20 border-[#f183ff]/20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-white/50">Pets</p>
                      <p className="text-sm font-semibold text-white">
                        +280 felizes
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll Indicator */}
        <div className="flex justify-center -mt-20 mb-8 animate-bounce">
          <button
            onClick={() =>
              document
                .getElementById("recursos")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-12 h-12 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 flex items-center justify-center hover:bg-[#f183ff]/20 transition-all duration-300 group"
          >
            <ChevronRight
              size={20}
              className="text-[#f183ff] rotate-90 group-hover:rotate-90 transition-transform"
            />
          </button>
        </div>

        {/* Features Section */}
        <section id="recursos" className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f183ff]/10 border border-[#f183ff]/20 mb-6">
                <Sparkles size={14} className="text-[#f183ff]" />
                <span className="text-sm text-white/80">Recursos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Tudo que você precisa
              </h2>
              <p className="text-white/50 text-base sm:text-lg max-w-xl mx-auto">
                Ferramentas profissionais para gerenciar seu pet shop com
                eficiência
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Feature 1: Agenda Inteligente */}
              <div className="group animate-in fade-in slide-in-from-bottom-4 duration-700">
                <GlassCard
                  variant="elevated"
                  className="p-8 h-full bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/5 border-[#f183ff]/20 group-hover:bg-gradient-to-br group-hover:from-[#f183ff]/15 group-hover:to-[#d946ef]/10 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar size={28} className="text-[#f183ff]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    Agenda Inteligente
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    Agende compromissos com facilidade usando nossa interface
                    intuitiva. Nunca perca um booking novamente com lembretes
                    inteligentes e disponibilidade em tempo real.
                  </p>
                  <div className="flex items-center gap-2 text-[#f183ff] text-sm font-semibold group-hover:gap-3 transition-all">
                    <span>Explorar</span>
                    <ChevronRight size={16} />
                  </div>
                </GlassCard>
              </div>

              {/* Feature 2: CRM de Clientes */}
              <div className="group animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <GlassCard
                  variant="elevated"
                  className="p-8 h-full bg-gradient-to-br from-[#8b5cf6]/10 to-[#f183ff]/5 border-[#8b5cf6]/20 group-hover:bg-gradient-to-br group-hover:from-[#8b5cf6]/15 group-hover:to-[#f183ff]/10 transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#f183ff]/20 flex items-center justify-center border border-[#8b5cf6]/20 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Users size={28} className="text-[#8b5cf6]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">
                    CRM de Clientes
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">
                    Mantenha perfis detalhados tanto dos tutores quanto de seus
                    companheiros peludos. Acompanhe preferências, histórico e
                    construa relacionamentos duradouros com cada cliente.
                  </p>
                  <div className="flex items-center gap-2 text-[#8b5cf6] text-sm font-semibold group-hover:gap-3 transition-all">
                    <span>Explorar</span>
                    <ChevronRight size={16} />
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-[#f183ff]/10 rounded-full blur-[120px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <GlassCard
              variant="elevated"
              className="p-10 sm:p-16 bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/10 border-[#f183ff]/30"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#f183ff]/20 border border-[#f183ff]/30 mb-8">
                <Heart size={14} className="text-[#f183ff]" fill="#f183ff" />
                <span className="text-sm text-white/90">
                  Comece gratuitamente
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Pronto para transformar seu pet shop?
              </h2>

              <p className="text-white/60 text-base sm:text-lg mb-10 max-w-xl mx-auto">
                Junte-se a centenas de pet shops que já estão transformando seus
                negócios com Agenda Pet Shop.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_25px_rgba(241,131,255,0.4)] hover:shadow-[0_0_40px_rgba(241,131,255,0.6)] transition-all duration-300 font-semibold px-10"
                  >
                    Começar Agora
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 sm:py-32 px-6 sm:px-8 lg:px-12 relative">
          <div className="max-w-4xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GlassCard
              variant="elevated"
              className="p-10 sm:p-16 bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/5 border-[#25D366]/20"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 mb-8">
                <Building2 size={14} className="text-[#25D366]" />
                <span className="text-sm text-white/80">Para Empresas</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                Quer levar seu pet shop para o próximo nível?
              </h2>

              <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
                Entre em contato conosco pelo WhatsApp e receba um código de
                convite exclusivo para cadastrar sua empresa.
              </p>

              <a
                href="https://wa.me/5511939485971?text=Olá! Tenho interesse em contratar o sistema Agenda Pet Shop para minha empresa. Poderia me enviar mais informações?"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#25D366]/90 hover:to-[#128C7E]/90 border-0 shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all duration-300 font-semibold px-10"
                >
                  Fale Conosco no WhatsApp
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </Button>
              </a>
            </GlassCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        {/* Footer glow effect */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-[#f183ff]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Brand Column */}
              <div className="lg:col-span-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-3 mb-6 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f183ff] to-[#d946ef] flex items-center justify-center shadow-lg shadow-[#f183ff]/30 group-hover:shadow-[#f183ff]/50 transition-all duration-300">
                    <PawPrint
                      className="text-white"
                      size={24}
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">
                      Agenda Pet Shop
                    </span>
                    <p className="text-xs text-white/40">Gestão profissional</p>
                  </div>
                </Link>
                <p className="text-white/40 text-sm leading-relaxed mb-6 max-w-md">
                  Sistema completo de gestão para pet shops modernos. Agende,
                  gerencie clientes e pets em um só lugar.
                </p>
              </div>

              {/* Product Column */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#f183ff] to-[#d946ef]"></span>
                  Produto
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/register"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Começar Agora
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/login"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#recursos"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Recursos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#d946ef] to-[#8b5cf6]"></span>
                  Legal
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/privacy"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Privacidade
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Termos de Uso
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-white/40 hover:text-[#f183ff] text-sm transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2"
                    >
                      <ChevronRight size={12} />
                      Contato
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <GlassCard
              variant="default"
              className="p-6 bg-white/[0.02] border-white/5"
            >
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#f183ff]/10 border border-[#f183ff]/20">
                    <Heart size={12} className="text-[#f183ff]" />
                    <span className="text-xs text-white/60">
                      Feito com amor
                    </span>
                  </div>
                  <p className="text-white/30 text-sm">
                    © 2026 Agenda Pet Shop. Todos os direitos reservados.
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-white/40 text-xs hover:text-[#f183ff] transition-colors cursor-pointer group">
                    <Shield
                      size={14}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Seguro</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs hover:text-[#f183ff] transition-colors cursor-pointer group">
                    <Headphones
                      size={14}
                      className="group-hover:scale-110 transition-transform"
                    />
                    <span>Suporte</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </footer>
    </div>
  );
}
