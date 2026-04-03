"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ServicePricesList } from "@/components/service-prices/service-prices-list";
import {
  Scissors,
  Plus,
  DollarSign,
  Package,
  Sparkles
} from "lucide-react";

type BillingFilter = 'avulso' | 'pacote' | 'all';

const BILLING_FILTERS: Array<{ value: BillingFilter; label: string; icon: any }> = [
  { value: 'all', label: 'Todos', icon: Scissors },
  { value: 'avulso', label: 'Avulso', icon: DollarSign },
  { value: 'pacote', label: 'Pacotes', icon: Package },
];

export default function ServicosPage() {
  const [billingFilter, setBillingFilter] = useState<BillingFilter>('all');
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { getAppStats } = await import("@/lib/actions/app");
        const result = await getAppStats();
        if (result.data) {
          setCompanyName(result.data.companyName || "Agenda Pet Shop");
          setUser(result.data.user);
        }
      } catch (error) {
        // Silently fail - use defaults
      }
    }
    loadData();
  }, []);

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        {/* Mobile Header */}
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 relative z-10 custom-scrollbar">
          {/* Page Header */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/30 to-[#d946ef]/30 flex items-center justify-center border border-[#f183ff]/20">
                    <Sparkles size={20} className="text-[#f183ff]" />
                  </div>
                  Preços dos Serviços
                </h1>
                <p className="text-white/50 text-sm mt-2">
                  Gerencie os preços de todos os serviços
                </p>
              </div>
              <Link href="/app/servicos/novo">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)]"
                >
                  <Plus size={16} className="mr-2" />
                  <span className="hidden sm:inline">Novo Serviço</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </Link>
            </div>

            {/* Filter Tabs - Toggle Style */}
            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              {BILLING_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = billingFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setBillingFilter(filter.value)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-r from-[#f183ff] to-[#d946ef] text-white shadow-lg shadow-[#f183ff]/20'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon size={16} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Prices List */}
          <ServicePricesList billingType={billingFilter} />

          {/* Info Card */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <GlassCard variant="elevated" className="p-4 bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 border-[#f183ff]/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f183ff]/20 flex items-center justify-center flex-shrink-0 border border-[#f183ff]/20">
                  <Sparkles size={18} className="text-[#f183ff]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Dica Pro 💡
                  </h3>
                  <p className="text-xs text-white/60">
                    Clique no ícone de editar para alterar os preços. Os preços são aplicados automaticamente nos agendamentos.
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
