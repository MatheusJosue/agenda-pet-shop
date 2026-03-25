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
  Package,
  Plus,
  Sparkles,
  Pencil,
  Trash2,
  Calendar,
  Search,
  PackageX,
} from "lucide-react";
import type { PackageType } from "@/lib/types/packages";

export default function PacotesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("q") || "";
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
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
    async function loadPackageTypes() {
      try {
        const { getPackageTypes } = await import("@/lib/actions/packages");
        const { data } = await getPackageTypes(search);
        setPackageTypes(data || []);
      } catch (error) {
        console.error("Error loading package types:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPackageTypes();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    setDeleting(true);
    try {
      const { deletePackageType } = await import("@/lib/actions/packages");
      const result = await deletePackageType(id);

      if (result.error) {
        alert(result.error);
      } else {
        // Remove from list
        setPackageTypes((prev) => prev.filter((pt) => pt.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      alert("Erro ao excluir tipo de pacote");
    } finally {
      setDeleting(false);
    }
  };

  const getIntervalLabel = (days: number) => {
    switch (days) {
      case 7:
        return "Semanal";
      case 15:
        return "Quinzenal";
      case 30:
        return "Mensal";
      default:
        return `${days} dias`;
    }
  };

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
                  <span className="text-3xl">📦</span>
                  Pacotes
                </h1>
              </div>
              <Link href="/app/pacotes/novo">
                <Button variant="primary" size="sm" className="rounded-full">
                  <Package size={16} className="mr-2" />
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
          ) : !packageTypes || packageTypes.length === 0 ? (
            <GlassCard
              variant="default"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <AnimatedIcon
                icon={search ? PackageX : Sparkles}
                variant={search ? "scale" : "spin"}
                size={48}
                className="text-fuchsia-400 mb-4 mx-auto"
              />
              <h2 className="text-xl font-semibold text-white mb-2">
                {search
                  ? "Nenhum tipo de pacote encontrado"
                  : "Nenhum tipo de pacote cadastrado"}
              </h2>
              <p className="text-purple-200/60 mb-6">
                {search
                  ? "Tente buscar com outro termo"
                  : "Comece adicionando seu primeiro tipo de pacote"}
              </p>
              <Link href="/app/pacotes/novo">
                <Button variant="primary" size="md" className="gap-2">
                  <Plus size={16} />
                  Adicionar Tipo de Pacote
                </Button>
              </Link>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {packageTypes.map((pkgType, index) => (
                <motion.div
                  key={pkgType.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <GlassCard
                    variant="default"
                    className="p-4 hover:scale-[1.01] hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
                        <Package size={20} className="text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate max-w-[140px] sm:max-w-none" title={pkgType.name}>
                          {pkgType.name}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-purple-200/70">
                          <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                            R$ {pkgType.price.toFixed(0)}
                          </p>
                          <span className="text-purple-400/40">•</span>
                          <span className="flex items-center gap-1 flex-shrink-0">
                            <Calendar size={12} className="text-purple-300" />
                            {getIntervalLabel(pkgType.interval_days)}
                          </span>
                          <span className="text-purple-400/40">•</span>
                          <span className="flex-shrink-0">
                            {pkgType.credits} crédito{pkgType.credits !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link href={`/app/pacotes/${pkgType.id}/editar`}>
                          <Button
                            variant="secondary"
                            size="sm"
                            className="w-8 h-8 px-0 flex items-center justify-center"
                          >
                            <Pencil size={14} />
                          </Button>
                        </Link>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDelete(pkgType.id)}
                          disabled={deleting}
                          className={
                            deleteConfirm === pkgType.id
                              ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 w-8 h-8 px-0 flex items-center justify-center"
                              : "w-8 h-8 px-0 flex items-center justify-center"
                          }
                        >
                          {deleteConfirm === pkgType.id ? (
                            <span className="text-red-300 text-xs font-bold">!</span>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
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
