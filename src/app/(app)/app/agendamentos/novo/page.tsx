"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createAppointment } from "@/lib/actions/appointments";
import { getClients } from "@/lib/actions/clients";
import { getPets } from "@/lib/actions/pets";
import { AppLayout } from "@/components/layout/app-layout";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { ServiceSelector } from "@/components/appointments/service-selector";
import type { Client } from "@/lib/types/clients";
import type { Pet } from "@/lib/types/pets";
import { SIZE_LABELS, SIZE_EMOJIS, BILLING_TYPE_LABELS } from "@/lib/types/service-prices";

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [selectedService, setSelectedService] = useState<{
    servicePriceId: string;
    price: number;
    serviceName: string;
    hairType: 'PC' | 'PL' | null;
    billingType: 'avulso' | 'pacote';
  } | null>(null);
  const [billingType, setBillingType] = useState<'avulso' | 'pacote'>('avulso');
  const [formData, setFormData] = useState({
    clientId: "",
    petId: "",
    date: "",
    time: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      loadPets(formData.clientId);
    } else {
      setFilteredPets([]);
      setFormData((prev) => ({ ...prev, petId: "" }));
      setSelectedService(null);
    }
  }, [formData.clientId]);

  useEffect(() => {
    // Update price when service is selected
    if (selectedService) {
      setFormData((prev) => ({ ...prev, price: selectedService.price.toFixed(2) }));
    } else {
      setFormData((prev) => ({ ...prev, price: "" }));
    }
  }, [selectedService]);

  useEffect(() => {
    // Clear selected service when pet changes
    if (!formData.petId) {
      setSelectedService(null);
    }
  }, [formData.petId]);

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

  const handleServiceSelect = (servicePriceId: string, price: number, hairType: 'PC' | 'PL' | null, serviceName: string) => {
    setSelectedService({
      servicePriceId,
      price,
      serviceName,
      hairType,
      billingType,
    });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.clientId || !formData.petId || !selectedService) {
      setError("Preencha todos os campos obrigatórios");
      setLoading(false);
      return;
    }

    try {
      const result = await createAppointment({
        clientId: formData.clientId,
        petId: formData.petId,
        servicePriceId: selectedService.servicePriceId,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/app/agendamentos");
      }
    } catch (err) {
      setError("Erro ao criar agendamento");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout companyName="Agenda Pet Shop" user={{}}>
      <AppHeader companyName="Agenda Pet Shop" user={{}} />

      <div className="h-[calc(100dvh-60px-64px)] xl:h-auto bg-gradient-to-br from-purple-950 via-fuchsia-950/50 to-indigo-950 xl:bg-transparent relative flex flex-col xl:block overflow-hidden xl:overflow-visible">
        {/* Animated background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl" />
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Content */}
          <main className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
            {/* Page Header - Inline */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <Link href="/app/agendamentos">
                  <Button variant="ghost" size="sm" className="p-2">
                    <ArrowLeft size={20} />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                    <span className="text-3xl">📅</span>
                    Novo Agendamento
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
                {/* Client */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "150ms" }}
                >
                  <Select
                    id="clientId"
                    label={
                      <span className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                          👤
                        </span>
                        Cliente
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
                        <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                          🐕
                        </span>
                        Pet
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
                        label: `${SIZE_EMOJIS[pet.size as keyof typeof SIZE_EMOJIS]} ${pet.name} (${SIZE_LABELS[pet.size as keyof typeof SIZE_LABELS]} • ${pet.hair_type === 'PC' ? 'Pelo Curto' : 'Pelo Longo'})`,
                      })),
                    ]}
                    required
                  />
                </div>

                {/* Billing Type Selector */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "250ms" }}
                >
                  <label className="block text-purple-100/90 text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      💳
                    </span>
                    Tipo de Cobrança *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingType('avulso');
                        setSelectedService(null);
                      }}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${billingType === 'avulso'
                          ? 'bg-purple-500/30 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="font-medium">Avulso</div>
                      <div className="text-xs opacity-70 mt-1">Pagamento individual</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingType('pacote');
                        setSelectedService(null);
                      }}
                      className={`
                        relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                        ${billingType === 'pacote'
                          ? 'bg-purple-500/30 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-purple-100/70 hover:bg-white/10 hover:border-white/20'
                        }
                      `}
                    >
                      <div className="font-medium">Pacote</div>
                      <div className="text-xs opacity-70 mt-1">Usar créditos</div>
                    </button>
                  </div>
                </div>

                {/* Service Selector */}
                {formData.petId && (() => {
                  const selectedPet = filteredPets.find(p => p.id === formData.petId);
                  if (!selectedPet) return null;
                  return (
                    <div
                      className="animate-in fade-in slide-in-from-left-2 duration-300"
                      style={{ animationDelay: "300ms" }}
                    >
                      <ServiceSelector
                        petSize={selectedPet.size}
                        petHairType={selectedPet.hair_type}
                        billingType={billingType}
                        selectedServicePriceId={selectedService?.servicePriceId}
                        onServiceSelect={(servicePriceId, price, hairType) => {
                          handleServiceSelect(
                            servicePriceId,
                            price,
                            hairType,
                            `${selectedPet.name} - ${BILLING_TYPE_LABELS[billingType]}`
                          );
                        }}
                      />
                    </div>
                  );
                })()}

                {/* Date & Time */}
                <div
                  className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "350ms" }}
                >
                  <div>
                    <label
                      htmlFor="date"
                      className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                        📅
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
                      className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                        🕐
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

                {/* Price - Disabled, auto-calculated */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "400ms" }}
                >
                  <label
                    htmlFor="price"
                    className="block text-purple-100/90 text-sm font-semibold mb-2.5 flex items-center gap-2"
                  >
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs">
                      💰
                    </span>
                    Preço Total *
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
                      disabled
                      required
                      className="w-full pl-12 disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    {selectedService && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-purple-300/70">
                        {selectedService.hairType ? `Tipo: ${selectedService.hairType}` : 'Padrão'}
                      </span>
                    )}
                  </div>
                  {!formData.price && (
                    <p className="mt-2 text-xs text-purple-200/50">
                      O preço será calculado automaticamente com base no
                      serviço selecionado e porte do pet
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div
                  className="animate-in fade-in slide-in-from-left-2 duration-300"
                  style={{ animationDelay: "450ms" }}
                >
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
                    placeholder="Adicione observações sobre o agendamento..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-purple-200/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                  />
                </div>

                {/* Actions */}
                <div
                  className="flex gap-4 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: "500ms" }}
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
                    {loading ? "Salvando..." : "Criar Agendamento"}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </main>
        </div>

        <div className="xl:hidden">
          <BottomNavigation />
        </div>
      </div>
    </AppLayout>
  );
}
