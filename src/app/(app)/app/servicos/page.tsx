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
  DollarSign,
  Package,
  Scissors,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type BillingFilter = "avulso" | "pacote" | "all";

const BILLING_FILTERS: Array<{
  value: BillingFilter;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "all", label: "Todos", icon: Scissors },
  { value: "avulso", label: "Serviços", icon: DollarSign },
  { value: "pacote", label: "Pacotes", icon: Package },
];

export default function ServicosPage() {
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const { getAppShell } = await import("@/lib/actions/app");
      const result = await getAppShell();
      if (result.data) {
        setCompanyName(result.data.companyName || "Agenda Pet Shop");
        setUser(result.data.user);
      }
    }
    loadData();
  }, []);

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="min-h-dvh bg-transparent relative overflow-hidden">
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:py-8 space-y-6 relative z-10 custom-scrollbar">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between gap-4 mb-6">
              <p className="text-[#68797d] text-sm font-bold">
                Serviços, extras e pacotes no formato Agenda Pet Shop.
              </p>
              <Link href="/app/precos">
                <Button variant="primary" size="sm">
                  Gerenciar
                </Button>
              </Link>
            </div>

            <div className="flex gap-2 p-1.5 rounded-2xl bg-white/80 border border-[rgba(232,50,123,0.24)] backdrop-blur-xl">
              {BILLING_FILTERS.map((filter) => {
                const Icon = filter.icon;
                const isActive = billingFilter === filter.value;
                return (
                  <button
                    key={filter.value}
                    onClick={() => setBillingFilter(filter.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${
                      isActive
                        ? "bg-[#e8327b] text-white shadow-lg shadow-[#e8327b]/20"
                        : "text-[#006c73] hover:text-[#bf185d] hover:bg-[#ffe0ec]"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ServicePricesList billingType={billingFilter} />

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <GlassCard variant="elevated" className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ffe0ec] flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-[#e8327b]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold text-[#21363a] text-sm mb-1">
                    Dica
                  </h3>
                  <p className="text-xs text-[#68797d] font-bold">
                    Os preços editados aqui são aplicados automaticamente no
                    fluxo de agendamento.
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
