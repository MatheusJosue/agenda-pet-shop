"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { motion } from "framer-motion";
import {
  Scissors,
  Clock,
  Plus,
  ChevronRight,
  Sparkles,
  Search,
  XCircle,
} from "lucide-react";
import type { Service } from "@/lib/types/services";

export default function ServicosPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function loadServices() {
      try {
        const { getServices } = await import("@/lib/actions/services");
        const { data } = await getServices(true, search);
        setServices(data || []);
      } catch (error) {
        console.error("Error loading services:", error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [search]);

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
          {/* Page Header - Inline */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">✂️</span>
                  Serviços
                </h1>
              </div>
              <Link href="/app/servicos/novo">
                <Button variant="primary" size="sm" className="rounded-full">
                  <Scissors size={16} className="mr-2" />
                  Novo
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <form className="mb-6 relative animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50"
            />
            <input
              type="search"
              name="q"
              placeholder="Buscar por nome..."
              defaultValue={search}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
            />
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !services || services.length === 0 ? (
            <GlassCard
              variant="default"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <AnimatedIcon
                icon={search ? XCircle : Sparkles}
                variant={search ? "scale" : "spin"}
                size={48}
                className="text-fuchsia-400 mb-4 mx-auto"
              />
              <h2 className="text-xl font-semibold text-white mb-2">
                {search
                  ? "Nenhum serviço encontrado"
                  : "Nenhum serviço cadastrado"}
              </h2>
              <p className="text-purple-200/60 mb-6">
                {search
                  ? "Tente buscar com outro termo"
                  : "Comece adicionando seu primeiro serviço"}
              </p>
              <Link href="/app/servicos/novo">
                <Button variant="primary" size="md" className="gap-2">
                  <Plus size={16} />
                  Adicionar Serviço
                </Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <Link href={`/app/servicos/${service.id}`}>
                    <GlassCard
                      variant="default"
                      className="p-4 hover:scale-[1.01] hover:bg-white/10 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        {/* Icon - smaller on mobile */}
                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                          <Scissors
                            size={20}
                            className="text-white sm:hidden"
                          />
                          <Scissors
                            size={26}
                            className="text-white hidden sm:block"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Name and Price row on mobile */}
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <h3
                              className="font-semibold text-white text-base sm:text-lg truncate max-w-[140px] sm:max-w-none"
                              title={service.name}
                            >
                              {service.name}
                            </h3>
                            <div className="text-right flex-shrink-0">
                              <p className="text-base sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                {service.price > 0
                                  ? `R$ ${service.price.toFixed(0)}`
                                  : "Sob consulta"}
                              </p>
                              <p className="text-[10px] sm:text-xs text-purple-300/60 hidden sm:block">
                                por serviço
                              </p>
                            </div>
                          </div>

                          {/* Duration */}
                          <p className="text-xs sm:text-sm text-purple-200/70 flex items-center gap-1.5">
                            <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <Clock
                                size={11}
                                className="text-purple-300 sm:hidden"
                              />
                              <Clock
                                size={12}
                                className="text-purple-300 hidden sm:block"
                              />
                            </span>
                            {service.duration_minutes} min
                          </p>
                        </div>

                        {/* Arrow */}
                        <ChevronRight
                          size={18}
                          className="text-purple-300/50 group-hover:translate-x-1 transition-transform flex-shrink-0 group-hover:text-purple-300 mt-1 sm:mt-0 sm:hidden"
                        />
                        <ChevronRight
                          size={20}
                          className="text-purple-300/50 group-hover:translate-x-1 transition-transform flex-shrink-0 group-hover:text-purple-300 hidden sm:block"
                        />
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
