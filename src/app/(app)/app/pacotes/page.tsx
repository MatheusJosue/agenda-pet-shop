"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import type { PackageType } from "@/lib/types/packages";

export default function PacotesPage() {
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null);

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
        const { data } = await getPackageTypes();
        setPackageTypes(data || []);
      } catch (error) {
        console.error("Error loading package types:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPackageTypes();
  }, []);

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
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden xl:overflow-auto overflow-y-auto">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Page Header - Inline */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">📦</span>
                Pacotes
              </h1>
              <p className="text-purple-200/60 mt-1">
                {packageTypes?.length || 0} tipo{packageTypes?.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Link href="/app/pacotes/novo">
              <Button variant="primary" size="sm" className="rounded-full">
                <Package size={16} className="mr-2" />
                Novo
              </Button>
            </Link>
          </div>
        </div>

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
              icon={Sparkles}
              variant="spin"
              size={48}
              className="text-fuchsia-400 mb-4 mx-auto"
            />
            <h2 className="text-xl font-semibold text-white mb-2">
              Nenhum tipo de pacote cadastrado
            </h2>
            <p className="text-purple-200/60 mb-6">
              Comece adicionando seu primeiro tipo de pacote
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
                  className="p-5 hover:scale-[1.01] hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                      <Package size={26} className="text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">
                        {pkgType.name}
                      </h3>
                      <p className="text-sm text-purple-200/60 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                          <Calendar size={12} className="text-purple-300" />
                        </span>
                        {getIntervalLabel(pkgType.interval_days)}
                      </p>
                      <p className="text-xs text-purple-300/60 mt-1">
                        {pkgType.credits} crédito
                        {pkgType.credits !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                        R$ {pkgType.price.toFixed(0)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link href={`/app/pacotes/${pkgType.id}/editar`}>
                        <Button variant="secondary" size="sm" className="w-9 h-9 px-0 flex items-center justify-center">
                          <Pencil size={16} />
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(pkgType.id)}
                        disabled={deleting}
                        className={
                          deleteConfirm === pkgType.id
                            ? "bg-red-500/20 hover:bg-red-500/30 border-red-500/50 w-9 h-9 px-0 flex items-center justify-center"
                            : "w-9 h-9 px-0 flex items-center justify-center"
                        }
                      >
                        {deleteConfirm === pkgType.id ? (
                          <span className="text-red-300 text-sm font-bold">!</span>
                        ) : (
                          <Trash2 size={16} />
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
