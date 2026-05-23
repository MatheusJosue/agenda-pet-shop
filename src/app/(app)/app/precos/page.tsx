"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { ServicePricesList } from "@/components/service-prices/service-prices-list";
import { Select } from "@/components/ui/select";
import { PawPrint } from "lucide-react";

export default function PrecosPage() {
  const [filter, setFilter] = useState<"all" | "avulso" | "pacote">("all");
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const { getAppStats } = await import("@/lib/actions/app");
      const result = await getAppStats();
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
      <div className="min-h-dvh bg-transparent relative flex flex-col overflow-hidden">
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="flex-1 overflow-y-auto max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#bf185d] flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#006c73] text-white flex items-center justify-center">
                  <PawPrint size={21} />
                </span>
                Gerenciar Preços
              </h1>
              <p className="mt-2 text-sm font-bold text-[#68797d]">
                Edite os valores da tabela oficial da Agenda Pet Shop.
              </p>
            </div>

            <div className="w-full lg:w-72">
              <Select
                id="filter"
                label="Filtrar por"
                value={filter}
                onChange={(value) =>
                  setFilter(value as "all" | "avulso" | "pacote")
                }
                options={[
                  { value: "all", label: "Todos" },
                  { value: "avulso", label: "Serviços e extras" },
                  { value: "pacote", label: "Pacotes" },
                ]}
              />
            </div>
          </div>

          <ServicePricesList billingType={filter} />
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
