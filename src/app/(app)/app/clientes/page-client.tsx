"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getClients } from "@/lib/actions/clients";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { motion } from "framer-motion";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  ChevronRight,
  UserX,
} from "lucide-react";
import { formatPhone } from "@/lib/utils/phone";
import type { Client } from "@/lib/types/clients";

export function ClientesPageContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const [clients, setClients] = useState<Client[]>([]);
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
    async function loadClients() {
      try {
        const { data } = await getClients(search);
        setClients(data || []);
      } catch (error) {
        console.error("Error loading clients:", error);
      } finally {
        setLoading(false);
      }
    }
    loadClients();
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

        <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
          {/* Page Header - Inline */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">👥</span>
                  Clientes
                </h1>
              </div>
              <Link href="/app/clientes/novo">
                <Button variant="primary" size="sm" className="rounded-full">
                  <UserPlus size={16} className="mr-2" />
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
              placeholder="Buscar por nome, telefone ou email..."
              defaultValue={search}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm transition-all hover:bg-white/[0.07]"
            />
          </form>

          {loading ? (
            <div className="flex items-center justify-center py-12 animate-in fade-in duration-300">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : !clients || clients.length === 0 ? (
            <GlassCard
              variant="default"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <AnimatedIcon
                icon={UserX}
                variant="scale"
                size={48}
                className="text-fuchsia-400 mb-4 mx-auto"
              />
              <h2 className="text-xl font-semibold text-white mb-2">
                {search
                  ? "Nenhum cliente encontrado"
                  : "Nenhum cliente cadastrado"}
              </h2>
              <p className="text-purple-200/60 mb-6">
                {search
                  ? "Tente buscar com outro termo"
                  : "Comece adicionando seu primeiro cliente"}
              </p>
              <Link href="/app/clientes/novo">
                <Button variant="primary" size="lg" className="gap-2">
                  <UserPlus size={18} />
                  Adicionar Cliente
                </Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {clients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link href={`/app/clientes/${client.id}`}>
                    <GlassCard
                      variant="default"
                      className="p-4 hover:scale-[1.01] hover:bg-white/[0.08] transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg shadow-purple-500/25">
                          {client.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate max-w-[150px] sm:max-w-none" title={client.name}>
                            {client.name}
                          </h3>
                          {client.phone && (
                            <p className="text-sm text-purple-200/60 truncate flex items-center gap-1">
                              <Phone size={14} />
                              {formatPhone(client.phone)}
                            </p>
                          )}
                          {client.email && (
                            <p className="text-sm text-purple-200/60 truncate flex items-center gap-1">
                              <Mail size={14} />
                              {client.email}
                            </p>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight
                          size={20}
                          className="text-purple-200/40 group-hover:text-purple-200 group-hover:translate-x-1 transition-all flex-shrink-0"
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
