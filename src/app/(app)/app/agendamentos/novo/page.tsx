"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "@/lib/actions/appointments";
import { getClients } from "@/lib/actions/clients";
import { getValidPetPackage } from "@/lib/actions/packages";
import { getPets } from "@/lib/actions/pets";
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  ArrowLeft,
  Check,
  X,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  User,
  Dog,
  Scissors,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { ServiceSelector } from "@/components/appointments/service-selector";
import { PetPackageCard } from "@/components/appointments/pet-package-card";
import type { Client } from "@/lib/types/clients";
import type { Pet } from "@/lib/types/pets";
import type { PetPackageWithRelations } from "@/lib/types/packages";
import {
  SIZE_LABELS,
  SIZE_EMOJIS,
  BILLING_TYPE_LABELS,
} from "@/lib/types/service-prices";

interface SelectedService {
  servicePriceId: string;
  price: number;
  serviceName: string;
  hairType: "PC" | "PL" | null;
  billingType: "avulso" | "pacote";
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>(
    [],
  );
  const [billingType, setBillingType] = useState<"avulso" | "pacote">("avulso");
  const [activePackage, setActivePackage] =
    useState<PetPackageWithRelations | null>(null);
  const [manualTotalPrice, setManualTotalPrice] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    clientId: "",
    petId: "",
    date: "",
    time: "",
    notes: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    async function loadData() {
      const { getAppStats } = await import("@/lib/actions/app");
      const result = await getAppStats();
      if (result.data) {
        setCompanyName(result.data.companyName || "Agenda Pet Shop");
        setUser(result.data.user);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: prev.date || getTodayInputValue(),
      time: prev.time || getRoundedCurrentTimeInputValue(),
    }));
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      loadPets(formData.clientId);
    } else {
      setFilteredPets([]);
      setFormData((prev) => ({ ...prev, petId: "" }));
      setSelectedServices([]);
    }
  }, [formData.clientId]);

  useEffect(() => {
    if (!formData.petId) {
      setSelectedServices([]);
      setActivePackage(null);
      setManualTotalPrice(null);
      return;
    }

    getValidPetPackage(formData.petId).then((result) => {
      setActivePackage(result.data || null);
    });
  }, [formData.petId]);

  const servicesTotalPrice = selectedServices.reduce(
    (sum, s) => sum + s.price,
    0,
  );
  const totalPrice =
    manualTotalPrice !== null
      ? Math.max(0, Number(manualTotalPrice) || 0)
      : servicesTotalPrice;

  const loadClients = async () => {
    const result = await getClients();
    if (result.data) setClients(result.data);
  };

  const loadPets = async (clientId: string) => {
    const result = await getPets(clientId);
    if (result.data) {
      setFilteredPets(result.data);
    }
  };

  const handleServiceToggle = (
    servicePriceId: string,
    price: number,
    hairType: "PC" | "PL" | null,
    serviceName: string,
  ) => {
    const exists = selectedServices.find(
      (s) => s.servicePriceId === servicePriceId,
    );
    if (exists) {
      setSelectedServices((prev) =>
        prev.filter((s) => s.servicePriceId !== servicePriceId),
      );
    } else {
      setSelectedServices((prev) => [
        ...prev,
        {
          servicePriceId,
          price,
          serviceName,
          hairType,
          billingType,
        },
      ]);
    }
    setManualTotalPrice(null);
  };

  const handleServicePriceChange = (servicePriceId: string, value: string) => {
    const price = Math.max(0, Number(value) || 0);
    setManualTotalPrice(null);
    setSelectedServices((prev) =>
      prev.map((service) =>
        service.servicePriceId === servicePriceId
          ? { ...service, price }
          : service,
      ),
    );
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (
      !formData.clientId ||
      !formData.petId ||
      selectedServices.length === 0
    ) {
      setError(
        "Preencha todos os campos obrigatórios e selecione pelo menos um serviço",
      );
      setLoading(false);
      return;
    }

    if (billingType === "pacote" && !activePackage) {
      setError("Este pet não possui pacote ativo para usar nesta cobrança");
      setLoading(false);
      return;
    }

    try {
      const result = await createAppointment({
        clientId: formData.clientId,
        petId: formData.petId,
        servicePriceIds: selectedServices.map((s) => s.servicePriceId),
        servicePrices: selectedServices.map((s) => ({
          servicePriceId: s.servicePriceId,
          price: billingType === "pacote" ? 0 : s.price,
        })),
        totalPrice: billingType === "pacote" ? 0 : totalPrice,
        date: formData.date,
        time: formData.time,
        petPackageId: billingType === "pacote" ? activePackage?.id : undefined,
        notes: formData.notes?.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/app/agendamentos");
      }
    } catch {
      setError("Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="min-h-dvh bg-transparent relative flex flex-col overflow-hidden">
        {/* Premium animated background layers */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-[#e8327b]/10 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-[#bf185d]/10 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#006c73]/5 rounded-full blur-[100px] animate-[pulse-glow_6s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(241,131,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(241,131,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
        </div>

        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-36 sm:pb-8 lg:py-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-10 lg:col-start-2 space-y-6">
                {/* Page Header */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-3">
                    <Link href="/app/agendamentos">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 rounded-xl hover:bg-white/10"
                      >
                        <ArrowLeft size={20} className="text-[#006c73]" />
                      </Button>
                    </Link>
                    <p className="text-[#68797d] text-sm font-semibold">
                      Agende um novo serviço
                    </p>
                  </div>
                </div>

                {/* Hero Welcome Card */}
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  <GlassCard variant="elevated" className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#e8327b]/20 flex items-center justify-center flex-shrink-0 border border-[#e8327b]/20">
                        <Sparkles size={24} className="text-[#e8327b]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-[#21363a] mb-1">
                          Bem-vindo ao cadastro de agendamentos!
                        </h3>
                        <p className="text-xs font-semibold text-[#68797d]">
                          Preencha as informações abaixo para criar um novo
                          agendamento no sistema.
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
                            Cliente *
                          </span>
                        }
                        value={formData.clientId}
                        onChange={(value) => handleChange("clientId", value)}
                        placeholder="Selecione o cliente"
                        options={[
                          { value: "", label: "Selecione o cliente" },
                          ...clients.map((client) => ({
                            value: client.id,
                            label: client.name,
                          })),
                        ]}
                        required
                      />
                    </div>

                    {/* Pet */}
                    <div
                      className="animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "200ms" }}
                    >
                      <Select
                        id="petId"
                        label={
                          <span className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-[#bf185d]/20 flex items-center justify-center">
                              <Dog size={14} className="text-[#bf185d]" />
                            </span>
                            Pet *
                          </span>
                        }
                        value={formData.petId}
                        onChange={(value) => handleChange("petId", value)}
                        placeholder="Selecione o pet"
                        disabled={!formData.clientId}
                        options={[
                          { value: "", label: "Selecione o pet" },
                          ...filteredPets.map((pet) => ({
                            value: pet.id,
                            label: `${SIZE_EMOJIS[pet.size as keyof typeof SIZE_EMOJIS]} ${pet.name} (${SIZE_LABELS[pet.size as keyof typeof SIZE_LABELS]} • ${pet.hair_type === "PC" ? "Pelo Curto" : "Pelo Longo"})`,
                          })),
                        ]}
                        required
                      />
                    </div>

                    {/* Pet Package Info */}
                    {formData.petId &&
                      (() => {
                        const selectedPet = filteredPets.find(
                          (p) => p.id === formData.petId,
                        );
                        if (!selectedPet) return null;
                        return (
                          <div
                            className="animate-in fade-in slide-in-from-left-2 duration-300"
                            style={{ animationDelay: "250ms" }}
                          >
                            <PetPackageCard
                              petId={selectedPet.id}
                              petName={selectedPet.name}
                            />
                          </div>
                        );
                      })()}

                    {/* Billing Type Toggle */}
                    <div
                      className="animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "250ms" }}
                    >
                      <label className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#006c73]/20 flex items-center justify-center">
                          <CreditCard size={14} className="text-[#006c73]" />
                        </span>
                        Tipo de Cobrança *
                      </label>
                      <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/80 border border-[rgba(232,50,123,0.18)] backdrop-blur-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setBillingType("avulso");
                            setSelectedServices([]);
                            setManualTotalPrice(null);
                          }}
                          className={`
                        relative p-3 rounded-xl text-sm font-medium transition-all duration-300
                        ${
                          billingType === "avulso"
                            ? "bg-gradient-to-r from-[#e8327b] to-[#bf185d] text-white shadow-lg shadow-[#e8327b]/20"
                            : "text-[#006c73] hover:text-[#bf185d] hover:bg-[#ffe0ec]"
                        }
                      `}
                        >
                          Avulso
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setBillingType("pacote");
                            setSelectedServices([]);
                            setManualTotalPrice(null);
                          }}
                          className={`
                        relative p-3 rounded-xl text-sm font-medium transition-all duration-300
                        ${
                          billingType === "pacote"
                            ? "bg-gradient-to-r from-[#e8327b] to-[#bf185d] text-white shadow-lg shadow-[#e8327b]/20"
                            : "text-[#006c73] hover:text-[#bf185d] hover:bg-[#ffe0ec]"
                        }
                      `}
                        >
                          Pacote
                        </button>
                      </div>
                    </div>

                    {/* Service Selector */}
                    {formData.petId &&
                      (() => {
                        const selectedPet = filteredPets.find(
                          (p) => p.id === formData.petId,
                        );
                        if (!selectedPet) return null;
                        return (
                          <div
                            className="animate-in fade-in slide-in-from-left-2 duration-300"
                            style={{ animationDelay: "300ms" }}
                          >
                            <label className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2">
                              <span className="w-7 h-7 rounded-xl bg-[#e8327b]/20 flex items-center justify-center">
                                <Scissors
                                  size={14}
                                  className="text-[#e8327b]"
                                />
                              </span>
                              Serviços *
                            </label>
                            <ServiceSelector
                              petSize={selectedPet.size}
                              petHairType={selectedPet.hair_type}
                              billingType={billingType}
                              selectedServicePriceIds={selectedServices.map(
                                (s) => s.servicePriceId,
                              )}
                              onServiceToggle={handleServiceToggle}
                              multiple
                            />
                          </div>
                        );
                      })()}

                    {/* Selected Services Summary */}
                    {selectedServices.length > 0 && (
                      <div
                        className="animate-in fade-in slide-in-from-left-2 duration-300"
                        style={{ animationDelay: "350ms" }}
                      >
                        <label className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2">
                          <span className="w-7 h-7 rounded-xl bg-[#bf185d]/20 flex items-center justify-center">
                            <Check size={14} className="text-[#bf185d]" />
                          </span>
                          Serviços Selecionados ({selectedServices.length})
                        </label>
                        <div className="space-y-2">
                          {selectedServices.map((service) => (
                            <div
                              key={service.servicePriceId}
                              className="flex items-center justify-between p-3 rounded-xl bg-white/80 border border-[rgba(232,50,123,0.18)] hover:bg-[#fff1f6] transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-bold text-[#21363a]">
                                  {service.serviceName}
                                </div>
                                <div className="text-xs font-semibold text-[#68797d]">
                                  {service.hairType
                                    ? `${service.hairType} • `
                                    : ""}
                                  {BILLING_TYPE_LABELS[service.billingType]}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <label className="relative block w-28">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#68797d]">
                                    R$
                                  </span>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={service.price}
                                    onChange={(event) =>
                                      handleServicePriceChange(
                                        service.servicePriceId,
                                        event.target.value,
                                      )
                                    }
                                    className="w-full rounded-lg border border-[rgba(232,50,123,0.28)] bg-white px-3 py-2 pl-8 text-right text-sm font-extrabold text-[#21363a] outline-none focus:border-[#e8327b] focus:ring-2 focus:ring-[#e8327b]/15"
                                    aria-label={`Preço de ${service.serviceName}`}
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleServiceToggle(
                                      service.servicePriceId,
                                      service.price,
                                      service.hairType,
                                      service.serviceName,
                                    )
                                  }
                                  className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-colors"
                                >
                                  <X size={16} className="text-red-300" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Date & Time */}
                    <div
                      className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "400ms" }}
                    >
                      <div>
                        <label
                          htmlFor="date"
                          className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                        >
                          <span className="w-7 h-7 rounded-xl bg-[#e8327b]/20 flex items-center justify-center">
                            <Calendar size={14} className="text-[#e8327b]" />
                          </span>
                          Data *
                        </label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleChange("date", e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="time"
                          className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                        >
                          <span className="w-7 h-7 rounded-xl bg-[#bf185d]/20 flex items-center justify-center">
                            <Clock size={14} className="text-[#bf185d]" />
                          </span>
                          Horário *
                        </label>
                        <Input
                          id="time"
                          type="time"
                          value={formData.time}
                          onChange={(e) => handleChange("time", e.target.value)}
                          required
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Total Price */}
                    <div
                      className="animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "450ms" }}
                    >
                      <label
                        htmlFor="totalPrice"
                        className="block text-[#21363a] text-sm font-bold mb-2.5 flex items-center gap-2"
                      >
                        <span className="w-7 h-7 rounded-xl bg-[#e8327b]/20 flex items-center justify-center">
                          <DollarSign size={14} className="text-[#e8327b]" />
                        </span>
                        Preço Total *
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#68797d] font-bold text-sm">
                          R$
                        </span>
                        <Input
                          id="totalPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            manualTotalPrice ??
                            (totalPrice > 0 ? totalPrice.toFixed(2) : "")
                          }
                          onChange={(event) =>
                            setManualTotalPrice(event.target.value)
                          }
                          placeholder="0.00"
                          required
                          className="w-full pl-12 text-lg font-semibold"
                        />
                      </div>
                      {selectedServices.length > 0 && (
                        <p className="mt-2 text-xs font-semibold text-[#68797d]">
                          {selectedServices.length} serviço(s) selecionado(s)
                        </p>
                      )}
                    </div>

                    {/* Notes */}
                    <div
                      className="animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "500ms" }}
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
                        placeholder="Adicione observações sobre o agendamento..."
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl bg-white/86 border border-[rgba(232,50,123,0.22)] text-[#21363a] placeholder-[#68797d]/70 focus:outline-none focus:ring-2 focus:ring-[#e8327b]/20 focus:border-[#e8327b]/60 backdrop-blur-sm resize-none transition-all hover:bg-white"
                      />
                    </div>

                    {/* Actions */}
                    <div
                      className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                      style={{ animationDelay: "550ms" }}
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
                        disabled={loading || selectedServices.length === 0}
                        className="flex-1 rounded-xl bg-gradient-to-r from-[#e8327b] to-[#bf185d] hover:from-[#e8327b]/90 hover:to-[#bf185d]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                      >
                        {loading ? "Salvando..." : "Salvar Agendamento"}
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

function getTodayInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRoundedCurrentTimeInputValue() {
  const date = new Date();
  const minutes = date.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;

  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1, 0, 0, 0);
  } else {
    date.setMinutes(roundedMinutes, 0, 0);
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const nextMinutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${nextMinutes}`;
}
