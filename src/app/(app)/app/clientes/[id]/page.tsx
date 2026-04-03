"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  getClientById,
  updateClient,
  deleteClient,
} from "@/lib/actions/clients";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { WhatsAppButton } from "@/components/ui/whatsapp-button";
import { SkeletonInput, SkeletonForm } from "@/components/skeleton";
import { Pencil, Trash2, ArrowLeft, Calendar } from "lucide-react";
import { formatPhone } from "@/lib/utils/phone";
import { ClientPetsSection } from "./_components/ClientPetsSection";
import type { Client } from "@/lib/types/clients";

export default function ClienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
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
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    setLoading(true);
    const result = await getClientById(clientId);

    if (result.error || !result.data) {
      setError(result.error || "Cliente não encontrado");
    } else {
      setClient(result.data);
      setFormData({
        name: result.data.name,
        phone: formatPhone(result.data.phone),
        email: result.data.email || "",
        notes: result.data.notes || "",
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await updateClient(clientId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setClient(result.data || null);
        setEditing(false);
      }
    } catch (err) {
      setError("Erro ao atualizar cliente");
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
      const deleteResult = await deleteClient(clientId);

      if (deleteResult.error) {
        setError(deleteResult.error);
      } else {
        router.push("/app/clientes");
      }
    } catch (err) {
      setError("Erro ao excluir cliente");
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            {/* Page Header Skeleton */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2b2041]/40 animate-pulse" />
                <div className="h-7 w-32 bg-[#2b2041]/40 rounded animate-pulse" />
              </div>
            </div>

            {/* Client Profile Card Skeleton */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              <div className="rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10 overflow-hidden">
                {/* Profile Header with Gradient Background Skeleton */}
                <div className="h-32 bg-gradient-to-br from-[#f183ff]/30 via-[#d946ef]/20 to-[#8b5cf6]/30">
                  <div className="absolute top-4 right-4 w-16 h-16 bg-[#f183ff]/20 rounded-full blur-xl animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 bg-[#d946ef]/20 rounded-full blur-lg animate-pulse" />
                </div>

                {/* Client Avatar Skeleton */}
                <div className="relative px-6 -mt-16 mb-4">
                  <div className="relative w-28 h-28 mx-auto">
                    <div className="absolute inset-0 rounded-full bg-[#2b2041]/40 animate-pulse" />
                    <div className="relative w-full h-full rounded-full bg-[#120a21] border-4 border-white/10 animate-pulse" />
                  </div>
                </div>

                {/* Client Info Skeleton */}
                <div className="px-6 pb-6 text-center space-y-3">
                  <div className="h-8 w-40 bg-[#2b2041]/40 rounded animate-pulse mx-auto" />
                  <div className="h-5 w-32 bg-[#2b2041]/40 rounded animate-pulse mx-auto" />
                </div>
              </div>
            </div>

            {/* Contact Info Card Skeleton */}
            <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <div className="p-5 rounded-2xl border backdrop-blur-sm bg-[#2d1b4e]/30 border-white/10">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-[#2b2041]/40 rounded animate-pulse" />
                    <div className="h-10 w-full bg-[#2b2041]/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-[#2b2041]/40 rounded animate-pulse" />
                    <div className="h-10 w-full bg-[#2b2041]/40 rounded-xl animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-[#2b2041]/40 rounded animate-pulse" />
                    <div className="h-24 w-full bg-[#2b2041]/40 rounded-xl animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BottomNavigation />
        </div>
      </AppLayout>
    );
  }

  if (!client || error) {
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
                <Link href="/app/clientes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-xl hover:bg-white/10"
                  >
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-semibold text-white">Cliente</h1>
                  <p className="text-white/50 text-sm">Erro</p>
                </div>
              </div>
            </div>
            <GlassCard variant="elevated" className="p-8 text-center">
              <p className="text-red-300 mb-4">
                {error || "Cliente não encontrado"}
              </p>
              <Link href="/app/clientes">
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
            <Link href="/app/clientes">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded-xl hover:bg-white/10"
              >
                <ArrowLeft size={22} className="text-white/70" />
              </Button>
            </Link>

            <h1 className="text-lg font-semibold text-white tracking-wide">
              Detalhes do Cliente
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
                        name: client.name,
                        phone: formatPhone(client.phone),
                        email: client.email || "",
                        notes: client.notes || "",
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
              ) : (
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
              )}
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

          {/* Client Profile Card - Hero Section */}
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

              {/* Client Avatar */}
              <div className="relative px-6 -mt-16 mb-4">
                <div className="relative w-28 h-28 mx-auto">
                  {/* Avatar glow ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f183ff] via-[#d946ef] to-[#8b5cf6] blur-lg opacity-60 animate-pulse" />

                  {/* Avatar container */}
                  <div className="relative w-full h-full rounded-full bg-[#120a21] border-4 border-[#f183ff]/30 flex items-center justify-center text-4xl shadow-2xl">
                    👤
                  </div>

                  {/* Premium badge */}
                  <div className="absolute -bottom-1 -right-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-[#f183ff] to-[#d946ef] text-white text-xs font-bold shadow-lg">
                    VIP
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div className="px-6 pb-6 text-center">
                {editing ? (
                  <div className="space-y-3">
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      minLength={3}
                      className="w-full text-center text-xl font-semibold"
                      placeholder="Nome do cliente"
                    />
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {client.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <span className="px-3 py-1.5 rounded-full bg-[#f183ff]/20 border border-[#f183ff]/30 text-[#f183ff] text-xs font-semibold uppercase tracking-wide">
                        Cliente Premium
                      </span>
                    </div>
                  </>
                )}
              </div>
            </GlassCard>
          </div>

          {/* Contact Info Cards Grid */}
          <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {/* Phone Card */}
            {client.phone && (
              <GlassCard variant="default" className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d946ef]/20 to-[#a855f7]/20 flex items-center justify-center text-xl shadow-lg shadow-[#d946ef]/10 flex-shrink-0">
                    📱
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                      Telefone
                    </p>
                    {editing ? (
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        required
                        className="w-full text-sm"
                        placeholder="(00) 00000-0000"
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white text-sm font-medium">
                          {formatPhone(client.phone)}
                        </p>
                        <WhatsAppButton
                          phone={client.phone}
                          message={`Olá ${client.name}!`}
                          size="sm"
                          variant="ghost"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Email Card */}
            {client.email && (
              <GlassCard variant="default" className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#6366f1]/20 flex items-center justify-center text-xl shadow-lg shadow-[#8b5cf6]/10 flex-shrink-0">
                    ✉️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/50 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                      Email
                    </p>
                    {editing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full text-sm"
                        placeholder="email@exemplo.com"
                      />
                    ) : (
                      <p className="text-white text-sm font-medium truncate">
                        {client.email}
                      </p>
                    )}
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Notes Card */}
          {(client.notes || editing) && (
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
                        placeholder="Adicione observações sobre o cliente..."
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                      />
                    ) : (
                      <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
                        {client.notes || (
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

          {/* Metadata */}
          <div className="pt-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <p className="text-white/20 text-xs flex items-center justify-center gap-1.5">
              <Calendar size={12} />
              Cadastrado em{" "}
              {new Date(client.created_at).toLocaleDateString("pt-BR")}
            </p>
          </div>

          {/* Pets Section */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <ClientPetsSection clientId={clientId} />
          </div>
        </main>

        <BottomNavigation />
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmDelete}
        title="Excluir cliente?"
        description="Esta ação não pode ser desfeita! Você perderá todos os dados e históricos vinculados a este cliente, incluindo todos os pets cadastrados."
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="danger"
        icon="trash"
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
