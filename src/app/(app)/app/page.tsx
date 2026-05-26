"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  PawPrint,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react";

type DashboardUser = {
  email?: string;
  user_metadata?: {
    name?: string;
  };
};

type TodayAppointment = {
  id: string;
  time: string;
  pet?: {
    name?: string;
    size?: "tiny" | "small" | "medium" | "large" | "giant";
  };
  service?: {
    name?: string;
  };
};

const petIcons = {
  tiny: "🐾",
  small: "🐾",
  medium: "🐶",
  large: "🐕",
  giant: "🐕",
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [todayCount, setTodayCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState<
    TodayAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import("@/lib/actions/app");
        const result = await getAppStats();

        if (result.error || !result.data) {
          router.push("/login");
          return;
        }

        setUser(result.data.user);
        setCompanyName(result.data.companyName || "Agenda Pet Shop");
        setClientsCount(result.data.clientsCount);
        setServicesCount(result.data.servicesCount);
        setTodayCount(result.data.todayCount);
        setMonthlyRevenue(result.data.monthlyRevenue);
        setTodayAppointments(result.data.todayAppointments);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-transparent">
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#e8327b]">
                    Agenda Pet Shop
                  </p>
                  <h3 className="text-3xl font-extrabold text-[#21363a] sm:text-4xl">
                    Olá, {capitalize(companyName)}
                  </h3>
                  <p className="mt-2 text-sm font-semibold text-[#68797d]">
                    {todayCount > 0
                      ? `${todayCount} agendamento${todayCount > 1 ? "s" : ""} para hoje`
                      : "Nenhum agendamento para hoje"}
                  </p>
                </div>
                <Link
                  href="/app/agendamentos/novo"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#e8327b] px-5 py-3 text-sm font-extrabold text-white shadow-[0_12px_28px_rgba(232,50,123,0.24)] transition-colors hover:bg-[#bf185d]"
                >
                  <Calendar size={18} />
                  Novo agendamento
                </Link>
              </section>

              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                  label="Hoje"
                  value={String(todayCount)}
                  icon={Calendar}
                  tone="pink"
                />
                <StatCard
                  label="Faturamento"
                  value={formatCurrency(monthlyRevenue)}
                  icon={DollarSign}
                  tone="green"
                />
                <StatCard
                  label="Clientes"
                  value={String(clientsCount)}
                  icon={Users}
                  tone="teal"
                />
                <StatCard
                  label="Serviços"
                  value={String(servicesCount)}
                  icon={Scissors}
                  tone="rose"
                />
              </section>

              <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
                <GlassCard className="overflow-hidden">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-[rgba(232,50,123,0.16)] p-5">
                    <div className="min-w-0">
                      <h3 className="whitespace-nowrap text-xl font-extrabold leading-none text-[#21363a] sm:leading-tight">
                        Agenda de hoje
                      </h3>
                      <p className="mt-1 max-w-[13rem] text-sm font-semibold leading-snug text-[#68797d] sm:max-w-none">
                        Próximos atendimentos do dia
                      </p>
                    </div>
                    <Link
                      href="/app/agendamentos"
                      className="inline-flex shrink-0 items-center justify-center gap-1 rounded-full border border-[rgba(0,108,115,0.16)] bg-white/70 px-2.5 py-2 text-sm font-extrabold leading-none text-[#006c73] transition-colors hover:border-[rgba(191,24,93,0.24)] hover:text-[#bf185d] sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
                    >
                      <span className="sm:hidden">Todos</span>
                      <span className="hidden sm:inline">Ver todos</span>
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  {todayAppointments.length > 0 ? (
                    <div className="divide-y divide-[rgba(232,50,123,0.14)]">
                      {todayAppointments.map((apt) => (
                        <Link
                          key={apt.id}
                          href={`/app/agendamentos/${apt.id}`}
                          className="flex items-center gap-3 p-4 transition-colors hover:bg-[#fff1f6] sm:gap-4"
                        >
                          <div className="w-14 shrink-0 rounded-xl bg-[#ffe0ec] px-3 py-2 text-center sm:w-16">
                            <p className="text-lg font-extrabold text-[#bf185d]">
                              {apt.time.slice(0, 2)}
                            </p>
                            <p className="text-xs font-bold text-[#68797d]">
                              {apt.time.slice(3, 5)}
                            </p>
                          </div>
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e6f7f8] text-xl">
                            {petIcons[apt.pet?.size || "medium"]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-extrabold text-[#21363a]">
                              {apt.pet?.name || "Pet"}
                            </p>
                            <p className="truncate text-sm font-semibold text-[#68797d]">
                              {apt.service?.name || "Serviço"}
                            </p>
                          </div>
                          <ChevronRight size={18} className="text-[#006c73]" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#fff1f6]">
                        <Sparkles size={28} className="text-[#e8327b]" />
                      </div>
                      <p className="font-extrabold text-[#21363a]">
                        Nada agendado para hoje
                      </p>
                      <p className="mt-1 text-sm font-semibold text-[#68797d]">
                        A agenda está livre por enquanto.
                      </p>
                    </div>
                  )}
                </GlassCard>

                <GlassCard className="p-5">
                  <h3 className="text-xl font-extrabold text-[#21363a]">
                    Ações rápidas
                  </h3>
                  <div className="mt-4 grid gap-3">
                    <QuickAction
                      href="/app/agendamentos/novo"
                      label="Novo agendamento"
                      icon={Calendar}
                    />
                    <QuickAction
                      href="/app/clientes/novo"
                      label="Novo cliente"
                      icon={Users}
                    />
                    <QuickAction
                      href="/app/pets/novo"
                      label="Novo pet"
                      icon={PawPrint}
                    />
                    <QuickAction
                      href="/app/servicos"
                      label="Tabela de serviços"
                      icon={Scissors}
                    />
                  </div>
                </GlassCard>
              </section>
            </>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded bg-[#ffe0ec]" />
        <div className="h-10 w-56 animate-pulse rounded-xl bg-[#ffe0ec]" />
        <div className="h-5 w-72 animate-pulse rounded bg-[#fff1f6]" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-5"
          >
            <div className="mb-4 h-10 w-10 animate-pulse rounded-2xl bg-[#ffe0ec]" />
            <div className="mb-2 h-7 w-20 animate-pulse rounded bg-[#ffe0ec]" />
            <div className="h-4 w-24 animate-pulse rounded bg-[#fff1f6]" />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-5">
        <div className="mb-5 h-7 w-44 animate-pulse rounded bg-[#ffe0ec]" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="h-12 w-16 animate-pulse rounded-xl bg-[#ffe0ec]" />
              <div className="h-11 w-11 animate-pulse rounded-2xl bg-[#fff1f6]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 animate-pulse rounded bg-[#ffe0ec]" />
                <div className="h-3 w-24 animate-pulse rounded bg-[#fff1f6]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone: "pink" | "green" | "teal" | "rose";
}) {
  const tones = {
    pink: "bg-[#ffe0ec] text-[#bf185d]",
    green: "bg-[#e7fff4] text-[#0b8b58]",
    teal: "bg-[#e6f7f8] text-[#006c73]",
    rose: "bg-[#fff1f6] text-[#e8327b]",
  };

  return (
    <GlassCard className="p-4 sm:p-5">
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}
      >
        <Icon size={22} />
      </div>
      <p className="truncate text-2xl font-extrabold text-[#21363a]">{value}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-wide text-[#68797d]">
        {label}
      </p>
    </GlassCard>
  );
}

function QuickAction({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/75 p-3 transition-colors hover:bg-[#fff1f6]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffe0ec] text-[#bf185d]">
        <Icon size={20} />
      </span>
      <span className="font-extrabold text-[#21363a]">{label}</span>
    </Link>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
