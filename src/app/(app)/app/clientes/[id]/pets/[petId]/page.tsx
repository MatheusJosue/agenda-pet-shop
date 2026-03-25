"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { getPetById, updatePet, deletePet } from "@/lib/actions/pets";
import { getActivePetPackage } from "@/lib/actions/packages";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { PackageCard } from "@/components/pacotes/package-card";
import { AddPackageModal } from "@/components/pacotes/add-package-modal";
import { Pencil, Trash2, Package, ArrowLeft } from "lucide-react";
import type { PetWithClient } from "@/lib/types/pets";
import type { PetPackageWithRelations } from "@/lib/types/packages";

const sizeLabels = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
};

const sizeEmojis = {
  small: "🐱",
  medium: "🐕",
  large: "🦮",
};

export default function ClientPetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const petId = params.petId as string;

  const [pet, setPet] = useState<PetWithClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePackage, setActivePackage] =
    useState<PetPackageWithRelations | null>(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    size: "medium" as "small" | "medium" | "large",
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
    loadPet();
    loadActivePackage();
  }, [petId]);

  const loadPet = async () => {
    setLoading(true);
    const result = await getPetById(petId);

    if (result.error || !result.data) {
      setError(result.error || "Pet não encontrado");
    } else {
      setPet(result.data);
      setFormData({
        name: result.data.name,
        breed: result.data.breed || "",
        size: result.data.size,
        notes: result.data.notes || "",
      });
    }
    setLoading(false);
  };

  const loadActivePackage = async () => {
    const result = await getActivePetPackage(petId);
    if (result.data && !result.error) {
      setActivePackage(result.data);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const result = await updatePet(petId, formData);

      if (result.error) {
        setError(result.error);
      } else {
        setPet(result.data || null);
        setEditing(false);
      }
    } catch (err) {
      setError("Erro ao atualizar pet");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Excluir pet?",
      text: "Esta ação não pode ser desfeita!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir!",
      cancelButtonText: "Cancelar",
      background:
        "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)",
      color: "#fff",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "rgba(255, 255, 255, 0.1)",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    setError(null);

    try {
      const deleteResult = await deletePet(petId);

      if (deleteResult.error) {
        setError(deleteResult.error);
        await Swal.fire({
          title: "Erro!",
          text: deleteResult.error,
          icon: "error",
          confirmButtonText: "OK",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)",
          color: "#fff",
          confirmButtonColor: "#ef4444",
        });
      } else {
        await Swal.fire({
          title: "Excluído!",
          text: "O pet foi excluído com sucesso.",
          icon: "success",
          confirmButtonText: "OK",
          background:
            "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)",
          color: "#fff",
          confirmButtonColor: "#a855f7",
        });
        router.push(`/app/clientes/${clientId}`);
      }
    } catch (err) {
      setError("Erro ao excluir pet");
      await Swal.fire({
        title: "Erro!",
        text: "Erro ao excluir pet",
        icon: "error",
        confirmButtonText: "OK",
        background:
          "linear-gradient(135deg, #1e1b4b 0%, #581c87 50%, #312e81 100%)",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
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
        <div className="flex flex-col h-dvh bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />
          <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            <div className="flex items-center justify-center py-12 animate-in fade-in duration-300">
              <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </main>

          <BottomNavigation />
        </div>
      </AppLayout>
    );
  }

  if (!pet || error) {
    return (
      <AppLayout
        companyName={companyName}
        user={{ name: user?.user_metadata?.name, email: user?.email }}
      >
        <div className="flex flex-col h-dvh bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            />
          </div>
          <AppHeader
            companyName={companyName}
            user={{ name: user?.user_metadata?.name, email: user?.email }}
          />
          <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            {/* Inline header for error state */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Link href={`/app/clientes/${clientId}`}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">🐾</span>
                    Pet
                  </h1>
                  <p className="text-purple-200/60 text-sm">Erro</p>
                </div>
              </div>
            </div>
            <GlassCard variant="default" className="p-8 text-center">
              <p className="text-red-400 mb-4">
                {error || "Pet não encontrado"}
              </p>
              <Link href={`/app/clientes/${clientId}`}>
                <Button variant="secondary">Voltar</Button>
              </Link>
            </GlassCard>
          </main>

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
      <div className="flex flex-col h-dvh bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="flex-1 overflow-y-auto w-full max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 relative">
          {/* Inline Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link href={`/app/clientes/${clientId}`}>
                  <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">{sizeEmojis[pet.size]}</span>
                    {pet.name}
                  </h1>
                  <p className="text-purple-200/60 text-sm">
                    {editing ? "Editando" : "Detalhes do pet"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {editing ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: pet.name,
                          breed: pet.breed || "",
                          size: pet.size,
                          notes: pet.notes || "",
                        });
                        setError(null);
                      }}
                      disabled={saving}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Salvando..." : "Salvar"}
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowPackageModal(true)}
                      disabled={saving}
                      className="p-2 rounded-lg text-purple-400/60 hover:text-purple-400 hover:bg-white/10 transition-colors disabled:opacity-50"
                      title="Gerenciar pacote"
                    >
                      <Package size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      disabled={saving}
                      className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      title="Editar pet"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={saving}
                      className="p-2 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Excluir pet"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <GlassCard
              variant="default"
              className="p-4 mb-6 bg-red-500/20 border-red-500/50 animate-in fade-in slide-in-from-top-2"
            >
              <p className="text-red-200">⚠️ {error}</p>
            </GlassCard>
          )}

          <GlassCard
            variant="default"
            className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 relative"
          >
            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                className="space-y-7"
            >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      🐾
                    </span>
                    Nome *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                    minLength={2}
                    className="w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="breed"
                    className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      🎨
                    </span>
                    Raça
                  </label>
                  <Input
                    id="breed"
                    type="text"
                    value={formData.breed}
                    onChange={(e) => handleChange("breed", e.target.value)}
                    placeholder="Ex: Poodle, Vira-lata..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      📏
                    </span>
                    Porte *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "small", label: "P", emoji: "🐱" },
                      { value: "medium", label: "M", emoji: "🐕" },
                      { value: "large", label: "G", emoji: "🦮" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => handleChange("size", size.value)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.size === size.value
                            ? "bg-purple-500/30 border-purple-500 text-white"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/30"
                        }`}
                      >
                        <div className="text-xl mb-0.5">{size.emoji}</div>
                        <div className="text-xs">{size.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      📝
                    </span>
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Adicione observações sobre o pet..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                  />
                </div>
              </form>
              ) : (
                <>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                          🐾
                        </span>
                        Nome
                      </h2>
                      <p className="text-xl font-semibold text-white">
                        {pet.name}
                      </p>
                    </div>

                    {pet.breed && (
                      <div>
                        <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                            🎨
                          </span>
                          Raça
                        </h2>
                        <p className="text-white">{pet.breed}</p>
                      </div>
                    )}

                    <div>
                      <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                          📏
                        </span>
                        Porte
                      </h2>
                      <p className="text-white">
                        {sizeEmojis[pet.size]} {sizeLabels[pet.size]}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                          👤
                        </span>
                        Dono
                      </h2>
                      <Link
                        href={`/app/clientes/${pet.client.id}`}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {pet.client.name}
                      </Link>
                    </div>

                    {pet.notes && (
                      <div>
                        <h2 className="text-purple-200/60 text-sm font-semibold mb-2 flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                            📝
                          </span>
                          Observações
                        </h2>
                        <p className="text-white whitespace-pre-wrap">
                          {pet.notes}
                        </p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-purple-200/40 text-xs">
                        Cadastrado em{" "}
                        {new Date(pet.created_at).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </>
              )}
          </GlassCard>

          {activePackage && (
            <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
              <PackageCard
                packageData={activePackage}
                onChange={() => setShowPackageModal(true)}
              />
            </div>
          )}

          {showPackageModal && pet && (
            <AddPackageModal
              petId={pet.id}
              petName={pet.name}
              isEditing={!!activePackage}
              onClose={() => {
                setShowPackageModal(false);
                loadActivePackage();
              }}
            />
          )}
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
