"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ServicePricesList } from "@/components/service-prices/service-prices-list";
import { motion } from "framer-motion";
import {
  Scissors,
  Plus,
  DollarSign,
  Filter,
  Package,
  Zap
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
        console.error("Error loading data:", error);
      }
    }
    loadData();
  }, []);

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="flex flex-col h-dvh bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Mobile Header */}
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">💰</span>
                  Preços dos Serviços
                </h1>
                <p className="text-purple-200/60 text-sm mt-1">
                  Gerencie os preços de todos os serviços
                </p>
              </div>
              <Link href="/app/servicos/novo">
                <Button variant="primary" size="sm" className="rounded-full gap-2">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Novo Serviço</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
              {BILLING_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = billingFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setBillingFilter(filter.value)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${isActive
                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/30'
                        : 'text-purple-300/70 hover:text-white hover:bg-white/5'
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6"
          >
            <GlassCard variant="default" className="p-4 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 border-purple-500/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap size={18} className="text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm mb-1">
                    Dica
                  </h3>
                  <p className="text-xs text-purple-200/70">
                    Clique no ícone de editar para alterar os preços. Os preços são aplicados automaticamente nos agendamentos.
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
