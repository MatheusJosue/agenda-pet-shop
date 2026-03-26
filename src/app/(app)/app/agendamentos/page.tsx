"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ViewModeSelector } from "@/components/agendamentos";
import { useAppointmentsFilter } from "@/hooks/useAppointmentsFilter";
import { navigateDate, type ViewMode } from "@/lib/utils/date";
import { SIZE_ICONS } from "@/lib/types/service-prices";
import { motion } from "framer-motion";
import {
  Clock,
  User,
  Scissors,
  ChevronRight,
  CalendarX,
  Calendar,
} from "lucide-react";
import type { AppointmentWithRelations } from "@/lib/types/appointments";

const statusLabels = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusStyles = {
  scheduled: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AgendamentosPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);

  const { appointments, loading, error, periodLabel } = useAppointmentsFilter(
    viewMode,
    selectedDate,
  );

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

  const handlePrevious = useCallback(() => {
    setSelectedDate((prev) => navigateDate(prev, viewMode, -1));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setSelectedDate((prev) => navigateDate(prev, viewMode, 1));
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
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

        {/* Main Content - scrollable area */}
        <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
          {/* Page Header - Inline */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  Agendamentos
                </h1>
              </div>
              <Link href="/app/agendamentos/novo">
                <Button variant="primary" size="sm" className="rounded-full">
                  <Calendar size={16} className="mr-2" />
                  Novo
                </Button>
              </Link>
            </div>
          </div>

          {/* View Mode Selector */}
          <ViewModeSelector
            viewMode={viewMode}
            selectedDate={selectedDate}
            periodLabel={periodLabel}
            onViewModeChange={handleViewModeChange}
            onPrevious={handlePrevious}
            onNext={handleNext}
            loading={loading}
          />

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <GlassCard
              variant="default"
              className="p-4 bg-red-500/20 border-red-500/50"
            >
              <p className="text-red-200">⚠️ {error}</p>
            </GlassCard>
          ) : !appointments || appointments.length === 0 ? (
            <GlassCard
              variant="default"
              className="p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <CalendarX size={32} className="text-purple-300" />
              </div>
              <p className="text-purple-200/60">
                Nenhum agendamento para este período
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {appointments.map(
                (appointment: AppointmentWithRelations, index) => {
                  const SizeIcon = SIZE_ICONS[appointment.pet.size];
                  return (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <Link href={`/app/agendamentos/${appointment.id}`}>
                        <GlassCard
                          variant="default"
                          className="p-5 hover:scale-[1.01] hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Date */}
                            <div className="text-center min-w-[70px] sm:min-w-[70px]">
                              <div className="text-2xl font-bold text-purple-300">
                                {formatDate(appointment.date).split("/")[0]}
                              </div>
                              <div className="text-xs text-purple-200/50">
                                {formatDate(appointment.date).split("/")[1]}/
                                {formatDate(appointment.date).split("/")[2]}
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <SizeIcon
                                  size={20}
                                  className="text-purple-400 flex-shrink-0"
                                />
                                <span className="font-semibold text-white truncate max-w-[120px] sm:max-w-none" title={appointment.pet.name}>
                                  {appointment.pet.name}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-purple-200/60">
                                <span className="flex items-center gap-1 truncate max-w-[100px] sm:max-w-none" title={appointment.client.name}>
                                  <User size={14} className="flex-shrink-0" />
                                  {appointment.client.name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1 truncate max-w-[80px] sm:max-w-none" title={appointment.service_price.service_name}>
                                  <Scissors size={14} className="flex-shrink-0" />
                                  {appointment.service_price.service_name}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {appointment.time}
                                </span>
                              </div>
                            </div>

                            {/* Status & Price */}
                            <div className="text-right flex-shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-0">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[appointment.status]}`}
                              >
                                {statusLabels[appointment.status]}
                              </span>
                              <div className="flex items-center sm:flex-col gap-3 sm:gap-1">
                                <p className="text-lg font-bold text-purple-300">
                                  R$ {appointment.price.toFixed(2)}
                                </p>
                                <ChevronRight
                                  size={18}
                                  className="text-purple-300/50 group-hover:translate-x-1 group-hover:text-purple-300 transition-all sm:mt-1"
                                />
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      </Link>
                    </motion.div>
                  );
                },
              )}
            </div>
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
