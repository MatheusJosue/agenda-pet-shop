"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  ArrowLeft,
  Check,
  X,
  Phone,
  ChevronRight,
  Scissors,
} from "lucide-react";
import {
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} from "@/lib/actions/appointments";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PetPackageCard } from "@/components/appointments/pet-package-card";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { formatPhone } from "@/lib/utils/phone";
import type { AppointmentWithRelations } from "@/lib/types/appointments";
import {
  SIZE_EMOJIS,
  SIZE_LABELS,
  SIZE_COLORS,
} from "@/lib/types/service-prices";

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const statusStyles: Record<string, string> = {
  scheduled:
    "bg-gradient-to-r from-[#f183ff]/20 to-[#d946ef]/20 border-[#f183ff]/30 text-[#f183ff]",
  completed:
    "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300",
  cancelled:
    "bg-gradient-to-r from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300",
};

const statusIcons: Record<string, string> = {
  scheduled: "📅",
  completed: "✅",
  cancelled: "❌",
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AgendamentoDetailPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [appointment, setAppointment] =
    useState<AppointmentWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    notes: "",
  });

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
    loadAppointment();
  }, [appointmentId]);

  const loadAppointment = async () => {
    setLoading(true);
    const result = await getAppointmentById(appointmentId);

    if (result.error || !result.data) {
      setError(result.error || "Agendamento não encontrado");
    } else {
      setAppointment(result.data);
      setFormData({
        date: result.data.date,
        time: result.data.time,
        notes: result.data.notes || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await updateAppointment(appointmentId, {
        date: formData.date,
        time: formData.time,
        notes: formData.notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        await loadAppointment();
        setEditing(false);
      }
    } catch (err) {
      setError("Erro ao atualizar agendamento");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
    status: "scheduled" | "completed" | "cancelled",
  ) => {
    setSaving(true);
    setError(null);

    try {
      const result = await updateAppointmentStatus(appointmentId, status);

      if (result.error) {
        setError(result.error);
      } else {
        await loadAppointment();
      }
    } catch (err) {
      setError("Erro ao atualizar status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await deleteAppointment(appointmentId);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/app/agendamentos");
      }
    } catch (err) {
      setError("Erro ao excluir agendamento");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <AppLayout
        companyName={companyName}
        user={{ name: user?.user_metadata?.name, email: user?.email }}
      >
        <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          </div>

          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />

          <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
            <div className="flex items-center justify-center py-20">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#f183ff]/20 border-t-[#f183ff] rounded-full animate-spin" />
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-[#d946ef]/40 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1.5s",
                  }}
                />
              </div>
            </div>
          </div>

          <BottomNavigation />
        </div>
      </AppLayout>
    );
  }

  if (!appointment || error) {
    return (
      <AppLayout
        companyName={companyName}
        user={{ name: user?.user_metadata?.name, email: user?.email }}
      >
        <div className="min-h-dvh bg-[#120a21] relative overflow-hidden">
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          </div>

          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />

          <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative z-10">
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Link href="/app/agendamentos">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-xl hover:bg-white/10"
                  >
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    Agendamento
                  </h1>
                  <p className="text-white/50 text-sm">Erro</p>
                </div>
              </div>
            </div>
            <GlassCard variant="elevated" className="p-8 text-center">
              <p className="text-red-300 mb-4">
                {error || "Agendamento não encontrado"}
              </p>
              <Link href="/app/agendamentos">
                <Button variant="secondary" className="rounded-xl">
                  Voltar
                </Button>
              </Link>
            </GlassCard>
          </div>

          <BottomNavigation />
        </div>
      </AppLayout>
    );
  }

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

        {/* Header App Bar */}
        <div className="sticky top-0 z-50 px-4 py-4 bg-[#120a21]/80 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <Link href="/app/agendamentos">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-xl hover:bg-white/10"
              >
                <ArrowLeft size={22} className="text-white/70" />
              </Button>
            </Link>

            <h1 className="text-lg font-semibold text-white tracking-wide">
              Detalhes do Agendamento
            </h1>

            <div className="flex gap-1">
              {editing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        date: appointment.date,
                        time: appointment.time,
                        notes: appointment.notes || "",
                      });
                      setError(null);
                    }}
                    disabled={saving}
                    className="rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-xl bg-[#f183ff] hover:bg-[#f183ff]/90 text-white border-0 shadow-lg shadow-[#f183ff]/30"
                  >
                    {saving ? "Salvando..." : "Salvar"}
                  </Button>
                </>
              ) : appointment.status === "scheduled" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    disabled={saving}
                    className="p-2 rounded-xl text-white/60 hover:text-[#f183ff] hover:bg-white/10 transition-all disabled:opacity-50"
                  >
                    <Pencil size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="p-2 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8 py-6 space-y-4 relative z-10 max-w-7xl mx-auto">
          {error && (
            <GlassCard
              variant="default"
              className="p-4 bg-red-500/10 border-red-500/30 animate-in fade-in slide-in-from-top-2"
            >
              <p className="text-red-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {error}
              </p>
            </GlassCard>
          )}

          {/* Appointment Profile Card - Hero Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <GlassCard variant="elevated" className="overflow-hidden">
              {/* Profile Header with Gradient Background */}
              <div className="relative h-32 bg-gradient-to-br from-[#f183ff]/30 via-[#d946ef]/20 to-[#8b5cf6]/30">
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-[#f183ff]/20 rounded-full blur-xl animate-pulse" />
                <div
                  className="absolute bottom-4 left-4 w-12 h-12 bg-[#d946ef]/20 rounded-full blur-lg animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
              </div>

              {/* Appointment Icon */}
              <div className="relative px-6 -mt-16 mb-4">
                <div className="relative w-28 h-28 mx-auto">
                  {/* Icon glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f183ff] via-[#d946ef] to-[#8b5cf6] blur-lg opacity-60 animate-pulse" />

                  {/* Icon container */}
                  <div className="relative w-full h-full rounded-full bg-[#120a21] border-4 border-[#f183ff]/30 flex items-center justify-center text-5xl shadow-2xl">
                    📅
                  </div>

                  {/* Status badge */}
                  <div
                    className={`absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-lg ${statusStyles[appointment.status]}`}
                  >
                    {statusIcons[appointment.status]}
                  </div>
                </div>
              </div>

              {/* Appointment Info */}
              <div className="px-6 pb-6 text-center">
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      min={getMinDate()}
                      required
                      className="w-full text-center"
                    />
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      required
                      className="w-full text-center"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-1">
                      {formatDate(appointment.date)}
                    </h2>
                    <p className="text-2xl text-white/70 font-medium mb-3">
                      {appointment.time}
                    </p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide ${statusStyles[appointment.status]}`}
                      >
                        {statusLabels[appointment.status]}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Pet Card */}
            <GlassCard variant="default" className="p-4">
              <Link
                href={`/app/pets/${appointment.pet.id}`}
                className="flex items-center gap-4 group"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-xl shadow-lg shadow-[#f183ff]/10 flex-shrink-0">
                  {SIZE_EMOJIS[appointment.pet.size]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                    Pet
                  </p>
                  <p className="text-white text-sm font-medium truncate group-hover:text-[#f183ff] transition-colors">
                    {appointment.pet.name}
                  </p>
                  <span
                    className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${SIZE_COLORS[appointment.pet.size]}`}
                  >
                    {SIZE_LABELS[appointment.pet.size]}
                  </span>
                </div>
                <ChevronRight
                  size={18}
                  className="text-white/30 group-hover:text-[#f183ff] group-hover:translate-x-1 transition-all flex-shrink-0"
                />
              </Link>
            </GlassCard>

            {/* Client Card */}
            <GlassCard variant="default" className="p-4">
              <Link
                href={`/app/clientes/${appointment.client.id}`}
                className="flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center text-xl shadow-lg shadow-[#8b5cf6]/10 flex-shrink-0">
                  👤
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                    Cliente
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {appointment.client.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone size={12} className="text-white/40" />
                    <span className="text-white/50 text-xs">
                      {formatPhone(appointment.client.phone)}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-white/30 flex-shrink-0"
                />
              </Link>
            </GlassCard>

            {/* Service Card */}
            <GlassCard variant="default" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-xl shadow-lg shadow-amber-500/10 flex-shrink-0">
                  <Scissors size={20} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                    Serviço
                  </p>
                  <p className="text-white text-sm font-medium truncate">
                    {appointment.service_price?.service_name || "Serviço"}
                  </p>
                  <p className="text-white/50 text-xs mt-0.5">
                    {appointment.service_price?.billing_type === "pacote"
                      ? "📦 Pacote"
                      : "💳 Avulso"}
                  </p>
                </div>
              </div>
            </GlassCard>

            {/* Price Card */}
            <GlassCard variant="default" className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-xl shadow-lg shadow-green-500/10 flex-shrink-0">
                  💰
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                    Valor
                  </p>
                  <p className="text-white text-lg font-bold">
                    R$ {appointment.price.toFixed(2)}
                  </p>
                  {appointment.used_credit && (
                    <p className="text-white/50 text-xs mt-0.5">
                      Crédito utilizado
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Notes Card */}
          {(appointment.notes || editing) && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              <GlassCard variant="default" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center text-lg shadow-lg shadow-[#f183ff]/10 flex-shrink-0 mt-0.5">
                    📝
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-2">
                      Observações
                    </p>
                    {editing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleChange("notes", e.target.value)}
                        placeholder="Adicione observações sobre o agendamento..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                      />
                    ) : (
                      <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                        {appointment.notes || (
                          <span className="text-white/30 italic">
                            Nenhuma observação
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {/* Pet Package Info */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <PetPackageCard
              petId={appointment.pet.id}
              petName={appointment.pet.name}
            />
          </div>

          {/* Action Buttons */}
          {appointment.status === "scheduled" && !editing && (
            <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleStatusChange("completed")}
                disabled={saving}
                className="rounded-2xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-lg shadow-[#f183ff]/30 py-5 text-base font-semibold"
              >
                <Check size={20} className="mr-2" />
                Concluir
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowCancelConfirm(true)}
                disabled={saving}
                className="rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 py-5 text-base font-semibold"
              >
                <X size={20} className="mr-2" />
                Cancelar
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <p className="text-white/20 text-xs">
              Criado em{" "}
              {new Date(appointment.created_at).toLocaleDateString("pt-BR")} às{" "}
              {new Date(appointment.created_at).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </main>

        <BottomNavigation />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Excluir agendamento?"
        description="Esta ação não pode ser desfeita! Você perderá todos os dados e históricos vinculados a este agendamento."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        icon="trash"
        loading={saving}
      />

      <ConfirmDialog
        open={showCancelConfirm}
        onOpenChange={setShowCancelConfirm}
        onConfirm={() => {
          handleStatusChange("cancelled");
          setShowCancelConfirm(false);
        }}
        title="Cancelar agendamento?"
        description="Esta ação mudará o status do agendamento para cancelado. Você poderá reativá-lo se necessário."
        confirmText="Cancelar"
        cancelText="Voltar"
        variant="warning"
        icon="alert"
        loading={saving}
      />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
      `}</style>
    </AppLayout>
  );
}
