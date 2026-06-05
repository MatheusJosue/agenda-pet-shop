"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPet } from "@/lib/actions/pets";
import { getClients } from "@/lib/actions/clients";
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ArrowLeft,
  PawPrint,
  Dog,
  Scissors,
  FileText,
  User,
  Sparkles,
} from "lucide-react";
import { HAIR_TYPE_LABELS, type HairType } from "@/lib/types/pets";

export default function NovoPetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{ user_metadata?: { name?: string }; email?: string } | null>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    breed: "",
    size: "medium" as "small" | "medium" | "large" | "giant",
    hairType: "PC" as HairType,
    notes: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    async function loadData() {
      const { getAppShell } = await import("@/lib/actions/app");
      const result = await getAppShell();
      if (result.data) {
        setCompanyName(result.data.companyName || "Agenda Pet Shop");
        setUser(result.data.user);
      }
    }
    loadData();
  }, []);

  const loadClients = async () => {
    const result = await getClients();
    if (result.data) {
      setClients(result.data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.clientId) {
      setError("Selecione o dono do pet");
      setLoading(false);
      return;
    }

    try {
      const result = await createPet(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/app/pets");
      }
    } catch (err) {
      setError("Erro ao criar pet");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }}>
      <div className="min-h-dvh bg-transparent relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#e8327b]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#bf185d]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#006c73]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader companyName={companyName} user={{ name: user?.user_metadata?.name, email: user?.email }} />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:py-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-10 lg:col-start-2 space-y-6">
            {/* Page Header */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Link href="/app/pets">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-xl hover:bg-white/10"
                  >
                    <ArrowLeft size={20} className="text-[#006c73]" />
                  </Button>
                </Link>
                <p className="text-[#68797d] text-sm font-semibold">
                  Cadastre um novo pet
                </p>
              </div>
            </div>

            {/* Hero Welcome Card */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard
                variant="elevated"
                className="p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#e8327b]/20 flex items-center justify-center flex-shrink-0 border border-[#e8327b]/20">
                    <Sparkles size={24} className="text-[#e8327b]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-[#21363a] mb-1">
                      Bem-vindo ao cadastro de pets!
                    </h3>
                    <p className="text-xs font-semibold text-[#68797d]">
                      Preencha as informações abaixo para adicionar um novo pet
                      ao sistema.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {error && (
              <GlassCard
                variant="default"
                className="p-4 mb-6 bg-red-500/10 border-red-500/30 animate-in fade-in slide-in-from-top-2"
              >
                <p className="text-red-200 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </p>
              </GlassCard>
            )}

            <GlassCard
              variant="elevated"
              className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "150ms" }}
                >
                  <Select
                    id="clientId"
                    label={
                      <span className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#e8327b]/20 flex items-center justify-center">
                          <User size={14} className="text-[#e8327b]" />
                        </span>
                        Dono *
                      </span>
                    }
                    value={formData.clientId}
                    onChange={(value) => handleChange("clientId", value)}
                    placeholder="Selecione o dono"
                    options={[
                      { value: "", label: "Selecione o dono" },
                      ...clients.map((client) => ({
                        value: client.id,
                        label: client.name,
                      })),
                    ]}
                    required
                  />
                  {clients.length === 0 && (
                    <p className="text-[#68797d] text-xs font-semibold mt-2 ml-9">
                      <Link
                        href="/app/clientes/novo"
                        className="text-[#e8327b] hover:underline"
                      >
                        Crie um cliente primeiro
                      </Link>
                    </p>
                  )}
                </div>

                {/* Name */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "200ms" }}
                >
                  <label
                    htmlFor="name"
                    className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#bf185d]/20 flex items-center justify-center">
                      <PawPrint size={14} className="text-[#bf185d]" />
                    </span>
                    Nome do Pet *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Rex, Mimi, Bob..."
                    required
                    className="w-full"
                  />
                </div>

                {/* Breed */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "250ms" }}
                >
                  <label
                    htmlFor="breed"
                    className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#006c73]/20 flex items-center justify-center">
                      <Dog size={14} className="text-[#006c73]" />
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

                {/* Size Chips */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "300ms" }}
                >
                  <label className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#e8327b]/20 flex items-center justify-center">
                      <PawPrint size={14} className="text-[#e8327b]" />
                    </span>
                    Porte *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: "small", label: "Pequeno", marker: "P", weight: "0-10kg" },
                      { value: "medium", label: "Médio", marker: "M", weight: "10-20kg" },
                      { value: "large", label: "Grande", marker: "G", weight: "20-30kg" },
                      { value: "giant", label: "Gigante", marker: "GG", weight: "30-60kg" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => handleChange("size", size.value)}
                        className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                          formData.size === size.value
                            ? "bg-[#e8327b] border-[#e8327b] text-white shadow-[0_10px_24px_rgba(232,50,123,0.22)]"
                            : "bg-white/86 border-[rgba(232,50,123,0.22)] text-[#006c73] hover:border-[#e8327b] hover:bg-[#fff1f6]"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-1 mb-0.5">
                          <PawPrint size={14} />
                          <span className="text-sm font-bold">{size.marker}</span>
                        </div>
                        <div className="text-[10px] font-medium leading-tight">
                          {size.label}
                        </div>
                        <div className="text-[10px] opacity-70 leading-tight mt-0.5">
                          {size.weight}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Type Toggle */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "325ms" }}
                >
                  <label className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#bf185d]/20 flex items-center justify-center">
                      <Scissors size={14} className="text-[#bf185d]" />
                    </span>
                    Tipo de Pelo *
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/80 border border-[rgba(232,50,123,0.18)] backdrop-blur-xl">
                    {(
                      Object.entries(HAIR_TYPE_LABELS) as [HairType, string][]
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleChange("hairType", value)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.hairType === value
                            ? "bg-gradient-to-r from-[#e8327b] to-[#bf185d] text-white shadow-lg shadow-[#e8327b]/20"
                            : "text-[#006c73] hover:text-[#bf185d] hover:bg-[#ffe0ec]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "350ms" }}
                >
                  <label
                    htmlFor="notes"
                    className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#078f96]/20 flex items-center justify-center">
                      <FileText size={14} className="text-[#078f96]" />
                    </span>
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Alergias, comportamento, preferências..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/86 border border-[rgba(232,50,123,0.22)] text-[#21363a] placeholder-[#68797d]/70 focus:outline-none focus:ring-2 focus:ring-[#e8327b]/20 focus:border-[#e8327b]/60 backdrop-blur-sm resize-none transition-all hover:bg-white"
                  />
                </div>

                {/* Actions */}
                <div
                  className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: "400ms" }}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading || clients.length === 0}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#e8327b] to-[#bf185d] hover:from-[#e8327b]/90 hover:to-[#bf185d]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                  >
                    {loading ? "Salvando..." : "Salvar Pet"}
                  </Button>
                </div>
              </form>
            </GlassCard>
              </div>
            </div>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
