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
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { SkeletonListStack } from "@/components/skeleton";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  UserPlus,
  Phone,
  Mail,
  ChevronRight,
  Users,
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
      <div className="flex flex-col min-h-dvh relative overflow-hidden bg-[#120a21]">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 relative z-10 custom-scrollbar">
          {/* Page Header */}
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                  <Users className="w-6 h-6 text-[#f183ff]" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Clientes
                  </h1>
                  <p className="text-white/50 text-sm mt-0.5">
                    {clients.length} cliente{clients.length !== 1 ? 's' : ''} cadastrado{clients.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Link href="/app/clientes/novo">
                <Button
                  variant="primary"
                  size="sm"
                  className="gap-2 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Novo Cliente</span>
                </Button>
              </Link>
            </div>
          </section>

          {/* Search */}
          <form className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <div className="relative">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
              />
              <input
                type="search"
                name="q"
                placeholder="Buscar por nome, telefone ou email..."
                defaultValue={search}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-xl transition-all hover:bg-white/[0.07] hover:border-white/20"
              />
            </div>
          </form>

          {loading ? (
            <SkeletonListStack count={8} />
          ) : !clients || clients.length === 0 ? (
            <GlassCard
              variant="elevated"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
            >
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f183ff]/10 to-[#d946ef]/10 flex items-center justify-center border border-[#f183ff]/20">
                  <Users size={40} className="text-[#f183ff]/60" />
                </div>
                <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-[#f183ff]/10 animate-ping" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {search
                  ? "Nenhum cliente encontrado"
                  : "Nenhum cliente cadastrado"}
              </h2>
              <p className="text-white/50 mb-6">
                {search
                  ? "Tente buscar com outro termo"
                  : "Comece adicionando seu primeiro cliente"}
              </p>
              <Link href="/app/clientes/novo">
                <Button
                  variant="primary"
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                >
                  <UserPlus size={18} />
                  Adicionar Cliente
                </Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              {clients.map((client, index) => (
                <Link
                  key={client.id}
                  href={`/app/clientes/${client.id}`}
                  className="block animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
                >
                  <GlassCard
                    variant="elevated"
                    className="p-4 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f183ff]/30 to-[#d946ef]/30 flex items-center justify-center text-white text-xl font-bold border border-[#f183ff]/20 group-hover:scale-110 group-hover:border-[#f183ff]/40 transition-all duration-300 shadow-lg shadow-[#f183ff]/10">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#22c55e] border-2 border-[#1a0f2e]" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base truncate group-hover:text-[#f183ff] transition-colors">
                          {client.name}
                        </h3>
                        {client.phone && (
                          <p className="text-sm text-white/50 truncate flex items-center gap-1.5 mt-0.5">
                            <Phone size={14} className="text-[#f183ff]/60" />
                            {formatPhone(client.phone)}
                          </p>
                        )}
                        {client.email && (
                          <p className="text-sm text-white/50 truncate flex items-center gap-1.5">
                            <Mail size={14} className="text-[#d946ef]/60" />
                            {client.email}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="flex items-center gap-2 flex-shrink-0"
                        onClick={(e) => e.preventDefault()}
                      >
                        {client.phone && (
                          <WhatsAppButton
                            phone={client.phone}
                            message={`Olá ${client.name}!`}
                            size="sm"
                            variant="ghost"
                          />
                        )}
                        <ChevronRight
                          size={20}
                          className="text-white/20 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all duration-300"
                        />
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
