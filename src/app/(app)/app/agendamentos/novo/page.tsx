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
  Sparkles
} from "lucide-react";
import { ServiceSelector } from "@/components/appointments/service-selector";
import { PetPackageCard } from "@/components/appointments/pet-package-card";
import type { Client } from "@/lib/types/clients";
import type { Pet } from "@/lib/types/pets";
import { SIZE_LABELS, SIZE_EMOJIS, BILLING_TYPE_LABELS } from "@/lib/types/service-prices";

interface SelectedService {
  servicePriceId: string;
  price: number;
  serviceName: string;
  hairType: 'PC' | 'PL' | null;
  billingType: 'avulso' | 'pacote';
}

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [billingType, setBillingType] = useState<'avulso' | 'pacote'>('avulso');
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
    }
  }, [formData.petId]);

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

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

  const handleServiceToggle = (servicePriceId: string, price: number, hairType: 'PC' | 'PL' | null, serviceName: string) => {
    const exists = selectedServices.find(s => s.servicePriceId === servicePriceId);
    if (exists) {
      setSelectedServices(prev => prev.filter(s => s.servicePriceId !== servicePriceId));
    } else {
      setSelectedServices(prev => [...prev, {
        servicePriceId,
        price,
        serviceName,
        hairType,
        billingType,
      }]);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.clientId || !formData.petId || selectedServices.length === 0) {
      setError("Preencha todos os campos obrigatórios e selecione pelo menos um serviço");
      setLoading(false);
      return;
    }

    try {
      const result = await createAppointment({
        clientId: formData.clientId,
        petId: formData.petId,
        servicePriceIds: selectedServices.map(s => s.servicePriceId),
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
                <Link href="/app/agendamentos">
                  <Button variant="ghost" size="sm" className="p-2 rounded-xl hover:bg-white/10">
                    <ArrowLeft size={20} className="text-white/70" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f183ff]/20 to-[#d946ef]/20 flex items-center justify-center border border-[#f183ff]/20">
                    <Calendar size={24} className="text-[#f183ff]" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                      Novo Agendamento
                    </h1>
                    <p className="text-white/50 text-sm mt-0.5">Agende um novo serviço</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Welcome Card */}
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <GlassCard variant="elevated" className="p-6 bg-gradient-to-r from-[#f183ff]/10 to-[#d946ef]/10 border-[#f183ff]/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#f183ff]/20 flex items-center justify-center flex-shrink-0 border border-[#f183ff]/20">
                    <Sparkles size={24} className="text-[#f183ff]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      Bem-vindo ao cadastro de agendamentos!
                    </h3>
                    <p className="text-xs text-white/60">
                      Preencha as informações abaixo para criar um novo agendamento
                      no sistema.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {error && (
              <GlassCard variant="default" className="p-4 mb-6 bg-red-500/10 border-red-500/30 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-200 text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  {error}
                </p>
              </GlassCard>
            )}

            <GlassCard variant="elevated" className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Client */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '150ms' }}>
                  <Select
                    id="clientId"
                    label={
                      <span className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                          <User size={14} className="text-[#f183ff]" />
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
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '200ms' }}>
                  <Select
                    id="petId"
                    label={
                      <span className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                          <Dog size={14} className="text-[#d946ef]" />
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
                        label: `${SIZE_EMOJIS[pet.size as keyof typeof SIZE_EMOJIS]} ${pet.name} (${SIZE_LABELS[pet.size as keyof typeof SIZE_LABELS]} • ${pet.hair_type === 'PC' ? 'Pelo Curto' : 'Pelo Longo'})`,
                      })),
                    ]}
                    required
                  />
                </div>

                {/* Pet Package Info */}
                {formData.petId && (() => {
                  const selectedPet = filteredPets.find(p => p.id === formData.petId);
                  if (!selectedPet) return null;
                  return (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                      <PetPackageCard petId={selectedPet.id} petName={selectedPet.name} />
                    </div>
                  );
                })()}

                {/* Billing Type Toggle */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '250ms' }}>
                  <label className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                      <CreditCard size={14} className="text-[#8b5cf6]" />
                    </span>
                    Tipo de Cobrança *
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setBillingType('avulso');
                        setSelectedServices([]);
                      }}
                      className={`
                        relative p-3 rounded-xl text-sm font-medium transition-all duration-300
                        ${billingType === 'avulso'
                          ? 'bg-gradient-to-r from-[#f183ff] to-[#d946ef] text-white shadow-lg shadow-[#f183ff]/20'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      Avulso
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBillingType('pacote');
                        setSelectedServices([]);
                      }}
                      className={`
                        relative p-3 rounded-xl text-sm font-medium transition-all duration-300
                        ${billingType === 'pacote'
                          ? 'bg-gradient-to-r from-[#f183ff] to-[#d946ef] text-white shadow-lg shadow-[#f183ff]/20'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      Pacote
                    </button>
                  </div>
                </div>

                {/* Service Selector */}
                {formData.petId && (() => {
                  const selectedPet = filteredPets.find(p => p.id === formData.petId);
                  if (!selectedPet) return null;
                  return (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '300ms' }}>
                      <label className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                          <Scissors size={14} className="text-[#f183ff]" />
                        </span>
                        Serviços *
                      </label>
                      <ServiceSelector
                        petSize={selectedPet.size}
                        petHairType={selectedPet.hair_type}
                        billingType={billingType}
                        selectedServicePriceIds={selectedServices.map(s => s.servicePriceId)}
                        onServiceToggle={handleServiceToggle}
                        multiple
                      />
                    </div>
                  );
                })()}

                {/* Selected Services Summary */}
                {selectedServices.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '350ms' }}>
                    <label className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                        <Check size={14} className="text-[#d946ef]" />
                      </span>
                      Serviços Selecionados ({selectedServices.length})
                    </label>
                    <div className="space-y-2">
                      {selectedServices.map((service) => (
                        <div
                          key={service.servicePriceId}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.07] transition-colors"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-white">
                              {service.serviceName}
                            </div>
                            <div className="text-xs text-white/50">
                              {service.hairType ? `${service.hairType} • ` : ''}
                              {BILLING_TYPE_LABELS[service.billingType]}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#d946ef]">
                              R$ {service.price.toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleServiceToggle(
                                service.servicePriceId,
                                service.price,
                                service.hairType,
                                service.serviceName
                              )}
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
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '400ms' }}>
                  <div>
                    <label htmlFor="date" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                        <Calendar size={14} className="text-[#f183ff]" />
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
                    <label htmlFor="time" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-[#d946ef]/20 flex items-center justify-center">
                        <Clock size={14} className="text-[#d946ef]" />
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
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '450ms' }}>
                  <label htmlFor="totalPrice" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#f183ff]/20 flex items-center justify-center">
                      <DollarSign size={14} className="text-[#f183ff]" />
                    </span>
                    Preço Total *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium text-sm">
                      R$
                    </span>
                    <Input
                      id="totalPrice"
                      type="text"
                      value={totalPrice > 0 ? totalPrice.toFixed(2) : ""}
                      placeholder="0.00"
                      disabled
                      required
                      className="w-full pl-12 text-lg font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                  {selectedServices.length > 0 && (
                    <p className="mt-2 text-xs text-white/50">
                      {selectedServices.length} serviço(s) selecionado(s)
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: '500ms' }}>
                  <label htmlFor="notes" className="block text-white/80 text-sm font-semibold mb-2.5 flex items-center gap-2">
                    <span className="w-7 h-7 rounded-xl bg-[#6366f1]/20 flex items-center justify-center">
                      <FileText size={14} className="text-[#6366f1]" />
                    </span>
                    Observações
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleChange("notes", e.target.value)}
                    placeholder="Adicione observações sobre o agendamento..."
                    rows={3}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f183ff]/50 focus:border-[#f183ff]/50 backdrop-blur-sm resize-none transition-all hover:bg-white/[0.07]"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '550ms' }}>
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
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#d946ef] hover:from-[#f183ff]/90 hover:to-[#d946ef]/90 border-0 shadow-[0_0_20px_rgba(241,131,255,0.3)] hover:shadow-[0_0_30px_rgba(241,131,255,0.5)] transition-all duration-300"
                  >
                    {loading ? "Salvando..." : "Salvar Agendamento"}
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
