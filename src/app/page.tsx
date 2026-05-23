"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronRight,
  Headphones,
  Heart,
  PawPrint,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";

const features = [
  {
    title: "Agenda Inteligente",
    description:
      "Organize banhos, tosas, retornos e horários com uma rotina visual simples para a equipe.",
    icon: Calendar,
  },
  {
    title: "Clientes e Pets",
    description:
      "Guarde histórico, preferências, porte, tipo de pelo e informações importantes de cada pet.",
    icon: Users,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-transparent relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16px_16px,rgba(232,50,123,0.07)_1.5px,transparent_2px)] bg-[size:34px_34px]" />
        <div className="absolute left-[8%] top-28 text-5xl text-[#e8327b]/10">🐾</div>
        <div className="absolute right-[10%] top-44 text-5xl text-[#e8327b]/10">♥</div>
      </div>

      <header className="sticky top-0 z-50 border-b border-[rgba(232,50,123,0.22)] backdrop-blur-2xl bg-white/86">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#e8327b] flex items-center justify-center shadow-[0_10px_22px_rgba(232,50,123,0.22)]">
                <PawPrint className="text-white" size={20} strokeWidth={2.5} />
              </div>
              <div className="leading-tight">
                <span className="block text-base sm:text-lg font-extrabold text-[#21363a]">
                  Agenda Pet Shop
                </span>
                <span className="hidden sm:block text-xs font-bold text-[#006c73]">
                  Gestão para banho e tosa
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link href="/login" className="hidden sm:inline-flex">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-extrabold"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl font-extrabold px-4 sm:px-5"
                >
                  Começar
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        <section className="px-4 sm:px-6 lg:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/82 border border-[rgba(232,50,123,0.24)] mb-5">
                <Sparkles size={14} className="text-[#e8327b]" />
                <span className="text-sm font-extrabold text-[#006c73]">
                  Sistema para pet shops modernos
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#21363a] leading-tight">
                Gestão de agenda com o carinho que seu pet shop merece.
              </h1>

              <p className="text-base sm:text-lg text-[#68797d] font-bold max-w-2xl mt-5 leading-relaxed">
                Agende serviços, acompanhe clientes, pets, pacotes e preços em
                uma experiência clara, rápida e pensada para banho e tosa.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <Link href="/register">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-xl font-extrabold px-8">
                    Começar Agora
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-extrabold px-8 bg-white">
                    Fazer Login
                  </Button>
                </Link>
              </div>
            </div>

            <GlassCard variant="elevated" className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs font-extrabold uppercase text-[#e8327b]">
                    Hoje
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#006c73]">
                    Agenda do dia
                  </h2>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#ffe0ec] text-[#e8327b] flex items-center justify-center">
                  <Calendar size={24} />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  ["09:00", "Banho", "Mel - pequeno"],
                  ["11:30", "Banho + Tosa", "Thor - médio"],
                  ["15:00", "Hidratação", "Luna - grande"],
                ].map(([time, service, pet]) => (
                  <div
                    key={`${time}-${pet}`}
                    className="flex items-center gap-3 rounded-xl bg-white/74 border border-[rgba(232,50,123,0.18)] p-3"
                  >
                    <span className="w-14 text-center text-sm font-extrabold text-[#bf185d]">
                      {time}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-[#006c73] text-white flex items-center justify-center">
                      <PawPrint size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-[#21363a]">{service}</p>
                      <p className="text-xs font-bold text-[#68797d]">{pet}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        <section id="recursos" className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/82 border border-[rgba(232,50,123,0.24)] mb-4">
                <Sparkles size={14} className="text-[#e8327b]" />
                <span className="text-sm font-extrabold text-[#006c73]">Recursos</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#bf185d]">
                Tudo para operar com menos atrito
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <GlassCard key={feature.title} variant="elevated" className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#ffe0ec] text-[#e8327b] flex items-center justify-center mb-4">
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-extrabold text-[#21363a] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm font-bold text-[#68797d] leading-relaxed">
                      {feature.description}
                    </p>
                    <Link
                      href="/register"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#006c73] hover:text-[#bf185d]"
                    >
                      Explorar
                      <ChevronRight size={16} />
                    </Link>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <GlassCard variant="elevated" className="p-7 sm:p-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffe0ec] border border-[rgba(232,50,123,0.22)] mb-5">
                <Heart size={14} className="text-[#e8327b]" fill="#e8327b" />
                <span className="text-sm font-extrabold text-[#bf185d]">
                  Comece gratuitamente
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21363a]">
                Pronto para transformar seu pet shop?
              </h2>

              <p className="text-[#68797d] text-base font-bold mt-4 mb-7 max-w-xl mx-auto">
                Uma agenda mais organizada melhora o atendimento, reduz ruído e
                deixa a rotina da equipe mais previsível.
              </p>

              <Link href="/register">
                <Button variant="primary" size="lg" className="rounded-xl font-extrabold px-10">
                  Começar Agora
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </GlassCard>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="max-w-4xl mx-auto">
            <GlassCard variant="elevated" className="p-7 sm:p-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#e9fff4] border border-[#18b96f]/20 mb-5">
                <Building2 size={14} className="text-[#087a4b]" />
                <span className="text-sm font-extrabold text-[#087a4b]">Para Empresas</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#21363a]">
                Quer levar seu pet shop para o próximo nível?
              </h2>

              <p className="text-[#68797d] text-base font-bold mt-4 mb-7 max-w-xl mx-auto">
                Fale conosco para receber orientação e cadastrar sua empresa.
              </p>

              <a
                href="https://wa.me/5511939485971?text=Olá! Tenho interesse em contratar o sistema Agenda Pet Shop para minha empresa. Poderia me enviar mais informações?"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="rounded-xl font-extrabold px-8 bg-[#006c73] hover:bg-[#078f96]"
                >
                  Fale Conosco
                  <ArrowRight size={18} />
                </Button>
              </a>
            </GlassCard>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-[rgba(232,50,123,0.22)] bg-white/62 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-8 mb-8">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#e8327b] flex items-center justify-center">
                  <PawPrint className="text-white" size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="block text-xl font-extrabold text-[#21363a]">
                    Agenda Pet Shop
                  </span>
                  <p className="text-xs font-bold text-[#006c73]">Gestão profissional</p>
                </div>
              </Link>
              <p className="text-sm font-bold text-[#68797d] leading-relaxed max-w-md">
                Sistema completo para organizar agenda, clientes, pets, pacotes
                e serviços em um só lugar.
              </p>
            </div>

            <FooterColumn
              title="Produto"
              links={[
                ["Começar Agora", "/register"],
                ["Login", "/login"],
                ["Recursos", "#recursos"],
              ]}
            />

            <FooterColumn
              title="Legal"
              links={[
                ["Privacidade", "/privacy"],
                ["Termos de Uso", "/terms"],
                ["Contato", "/contact"],
              ]}
            />
          </div>

          <GlassCard className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-bold text-[#21363a]">
                © 2026 Agenda Pet Shop. Todos os direitos reservados.
              </p>
              <div className="flex items-center gap-5">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#006c73]">
                  <Shield size={15} />
                  Seguro
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[#006c73]">
                  <Headphones size={15} />
                  Suporte
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </footer>
    </div>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <h4 className="text-[#21363a] font-extrabold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-[#e8327b]" />
        {title}
      </h4>
      <ul className="space-y-2">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link
              href={href}
              className="text-sm font-bold text-[#68797d] hover:text-[#bf185d] transition-colors inline-flex items-center gap-2"
            >
              <ChevronRight size={13} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
