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
  const [clients, setClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    clientId: "",
    name: "",
    breed: "",
    size: "medium" as "tiny" | "small" | "medium" | "large" | "giant",
    hairType: "PC" as HairType,
    notes: "",
  });

  useEffect(() => {
    loadClients();
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
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <div className="min-h-dvh bg-[#120a21] relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#f183ff]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#d946ef]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#8b5cf6]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader companyName="Agenda Pet Shop" user={{}} />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 relative z-10">
            {/* Page Header */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3">
                <Link href="/app/pets">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-xl hover:bg-white/10"
                  >
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <PawPrint size={24} className="text-[#f183ff]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                      Novo Pet
                    </h1>
                    <p className="text-white/50 text-sm mt-0.5">
                      Cadastre um novo pet
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Welcome Card */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard
                variant="elevated"
                className="p-6 bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 border-[#f183ff]/20"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f183ff]/20 flex items-center justify-center flex-shrink-0 border border-[#f183ff]/20">
                    <Sparkles size={24} className="text-[#f183ff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Bem-vindo ao cadastro de pets!
                    </h3>
                    <p className="text-xs text-white/60">
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
                        <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                          <User size={14} className="text-[#f183ff]" />
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
                    <p className="text-white/40 text-xs mt-2 ml-9">
                      <Link
                        href="/app/clientes/novo"
                        className="text-[#f183ff] hover:underline"
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
                    className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                      <PawPrint size={14} className="text-[#d946ef]" />
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
                    className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                      <Dog size={14} className="text-[#8b5cf6]" />
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
                  <label className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                      <span className="text-sm">📏</span>
                    </span>
                    Porte *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: "tiny", label: "Tiny", emoji: "🐭" },
                      { value: "small", label: "Pequeno", emoji: "🐱" },
                      { value: "medium", label: "Médio", emoji: "🐕" },
                      { value: "large", label: "Grande", emoji: "🦮" },
                      { value: "giant", label: "Gigante", emoji: "🦏" },
                    ].map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => handleChange("size", size.value)}
                        className={`p-2.5 rounded-xl border-2 transition-all duration-300 ${
                          formData.size === size.value
                            ? "bg-gradient-to-br from-[#f183ff]/30 to-[#d946ef]/30 border-[#f183ff] text-white shadow-[0_0_20px_rgba(241,131,255,0.4)]"
                            : "bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/10"
                        }`}
                      >
                        <div className="text-lg mb-0.5">{size.emoji}</div>
                        <div className="text-[10px] font-medium leading-tight">
                          {size.label}
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
                  <label className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                      <Scissors size={14} className="text-[#d946ef]" />
                    </span>
                    Tipo de Pelo *
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    {(
                      Object.entries(HAIR_TYPE_LABELS) as [HairType, string][]
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleChange("hairType", value)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          formData.hairType === value
                            ? "bg-gradient-to-r from-[#f183ff] to-[#d946ef] text-white shadow-lg shadow-[#f183ff]/20"
                            : "text-white/60 hover:text-white hover:bg-white/5"
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
                    className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                      <FileText size={14} className="text-[#6366f1]" />
                    </span>
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Alergias, comportamento, preferências..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
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
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                  >
                    {loading ? "Salvando..." : "Salvar Pet"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </main>
        </div>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}
