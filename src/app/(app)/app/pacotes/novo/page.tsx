"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPackageType } from "@/lib/actions/packages";
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function NovoTipoPacotePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    interval_days: "7",
    credits: "4",
    price: "",
  });

  // Auto-fill credits based on interval
  useEffect(() => {
    const creditsMap: Record<string, string> = {
      "7": "4", // Semanal
      "15": "2", // Quinzenal
      "30": "1", // Mensal
    };
    setFormData((prev) => ({
      ...prev,
      credits: creditsMap[prev.interval_days] || "4",
    }));
  }, [formData.interval_days]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createPackageType({
        name: formData.name,
        interval_days: parseInt(formData.interval_days) as 7 | 15 | 30,
        credits: parseInt(formData.credits),
        price: parseFloat(formData.price),
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/app/pacotes");
      }
    } catch (err) {
      setError("Erro ao criar tipo de pacote");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <AppHeader
        companyName="Agenda Pet Shop"
        user={{}}
      />

      <div className="h-[calc(100dvh-60px-64px)] xl:min-h-[87vh] bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative flex flex-col xl:block overflow-hidden">
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
          companyName="Agenda Pet Shop"
          user={{}}
        />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto xl:overflow-auto">
          {/* Main Content */}
          <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            {/* Page Header - Inline */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Link href="/app/pacotes">
                  <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">📦</span>
                    Novo Tipo de Pacote
                  </h1>
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
          className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100"
        >
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Name */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: "150ms" }}
            >
              <label
                htmlFor="name"
                className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                  📋
                </span>
                Nome do Tipo de Pacote *
              </label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Pacote Semanal, Pacote Quinzenal..."
                required
                className="w-full"
              />
            </div>

            {/* Interval Days */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: "200ms" }}
            >
              <label
                htmlFor="interval_days"
                className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                  📅
                </span>
                Intervalo de Dias *
              </label>
              <Select
                id="interval_days"
                value={formData.interval_days}
                onChange={(value) => handleChange("interval_days", value)}
                options={[
                  { value: "7", label: "7 dias (Semanal)" },
                  { value: "15", label: "15 dias (Quinzenal)" },
                  { value: "30", label: "30 dias (Mensal)" },
                ]}
                required
                className="w-full"
              />
            </div>

            {/* Credits */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: "250ms" }}
            >
              <label
                htmlFor="credits"
                className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                  💎
                </span>
                Créditos *
              </label>
              <Input
                id="credits"
                type="number"
                min="1"
                value={formData.credits}
                onChange={(e) => handleChange("credits", e.target.value)}
                placeholder="Ex: 4"
                required
                disabled
                className="w-full opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Price */}
            <div
              className="animate-in fade-in slide-in-from-left-2 duration-300"
              style={{ animationDelay: "300ms" }}
            >
              <label
                htmlFor="price"
                className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
              >
                <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                  💰
                </span>
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200/50 font-medium">
                  R$
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-12"
                />
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
              style={{ animationDelay: "350ms" }}
            >
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => router.back()}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar Pacote"}
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
