"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bath, Check, Droplets, PawPrint, Scissors, Sparkles, type LucideIcon } from "lucide-react";
import {
  SERVICE_ALIASES,
  findExactPetService,
  formatCatalogPrice,
  getServiceDisplayName,
} from "@/lib/service-catalog";
import { BILLING_TYPE_LABELS } from "@/lib/types/service-prices";
import type { BillingType, ServicePrice, SizeCategory } from "@/lib/types/service-prices";
import type { HairType } from "@/lib/types/pets";

interface ServiceSelectorProps {
  petSize: SizeCategory;
  petHairType: HairType;
  billingType: BillingType;
  selectedServicePriceId?: string;
  onServiceSelect?: (servicePriceId: string, price: number, hairType: "PC" | "PL" | null) => void;
  multiple?: boolean;
  selectedServicePriceIds?: string[];
  onServiceToggle?: (servicePriceId: string, price: number, hairType: "PC" | "PL" | null, serviceName: string) => void;
}

const PRIMARY_GROUPS = [
  { title: "Banho", subtitle: "Limpeza e cuidado", aliases: SERVICE_ALIASES.bath, icon: Bath },
  { title: "Tosa Higiênica", subtitle: "Higiene essencial", aliases: SERVICE_ALIASES.hygienicGroom, icon: Scissors },
  { title: "Banho + Tosa na Máquina", subtitle: "Tosa completa", aliases: SERVICE_ALIASES.machineGroom, icon: Droplets },
  { title: "Banho + Tosa na Tesoura", subtitle: "Acabamento completo", aliases: SERVICE_ALIASES.scissorGroom, icon: Scissors },
] as const;

const EXTRA_GROUPS = [
  { title: "Corte de unhas", subtitle: "Serviço extra", aliases: SERVICE_ALIASES.nailTrim, icon: Scissors },
  { title: "Hidratação", subtitle: "Serviço extra", aliases: SERVICE_ALIASES.hydration, icon: Sparkles },
  { title: "Desembolo de nós", subtitle: "A partir de R$ 20", aliases: SERVICE_ALIASES.detangle, icon: PawPrint },
] as const;

export function ServiceSelector({
  petSize,
  petHairType,
  billingType,
  selectedServicePriceId,
  onServiceSelect,
  multiple = false,
  selectedServicePriceIds = [],
  onServiceToggle,
}: ServiceSelectorProps) {
  const [services, setServices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { getServicePrices } = await import("@/lib/actions/service-prices");
    const result = await getServicePrices(billingType);
    if (result.error) {
      setError(result.error);
    } else {
      setServices(result.data || []);
    }
    setLoading(false);
  }, [billingType]);

  useEffect(() => {
    void Promise.resolve().then(loadServices);
  }, [loadServices]);

  const primaryOptions = useMemo(
    () => PRIMARY_GROUPS.map((group) => ({
      ...group,
      price: findExactPetService(services, group.aliases, petSize, petHairType),
    })),
    [petHairType, petSize, services],
  );

  const extraOptions = useMemo(
    () => EXTRA_GROUPS.map((group) => ({
      ...group,
      price: findExactPetService(services, group.aliases, petSize, petHairType),
    })),
    [petHairType, petSize, services],
  );

  if (loading) {
    return (
      <div className="rounded-xl border border-[rgba(232,50,123,0.22)] bg-white/80 p-4 text-center text-sm font-bold text-[#006c73]">
        Carregando serviços...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-600">
        {error}
      </div>
    );
  }

  function select(price: ServicePrice, displayName: string) {
    if (multiple && onServiceToggle) {
      onServiceToggle(price.id, price.price, price.hair_type, displayName);
      return;
    }
    onServiceSelect?.(price.id, price.price, price.hair_type);
  }

  return (
    <div className="space-y-4">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-extrabold text-[#006c73]">
            Serviços ({BILLING_TYPE_LABELS[billingType]})
          </p>
          <p className="text-xs font-bold text-[#68797d]">
            Pelo {petHairType === "PC" ? "curto" : "longo"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {primaryOptions.map((option) => (
            <ServiceOption
              key={option.title}
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
              price={option.price}
              selected={Boolean(option.price && (multiple ? selectedServicePriceIds.includes(option.price.id) : selectedServicePriceId === option.price.id))}
              onSelect={() => option.price && select(option.price, option.title)}
            />
          ))}
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-extrabold text-[#bf185d]">Serviços extras</p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {extraOptions.map((option) => (
            <ServiceOption
              key={option.title}
              title={option.title}
              subtitle={option.subtitle}
              icon={option.icon}
              price={option.price}
              compact
              selected={Boolean(option.price && (multiple ? selectedServicePriceIds.includes(option.price.id) : selectedServicePriceId === option.price.id))}
              onSelect={() => option.price && select(option.price, option.title)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function ServiceOption({
  title,
  subtitle,
  icon: Icon,
  price,
  selected,
  compact = false,
  onSelect,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  price: ServicePrice | null;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const disabled = !price;
  const displayPrice = formatCatalogPrice(price?.price);
  const serviceName = price ? getServiceDisplayName(price.service_name) : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={`group relative min-h-[88px] rounded-xl border p-3 text-left transition-all ${
        selected
          ? "border-[#e8327b] bg-[#fff1f6] shadow-[0_8px_20px_rgba(232,50,123,0.12)]"
          : "border-[rgba(232,50,123,0.2)] bg-white/90 hover:border-[#e8327b] hover:bg-white hover:shadow-[0_8px_18px_rgba(232,50,123,0.08)]"
      } ${disabled ? "cursor-not-allowed opacity-55" : ""}`}
    >
      <div className={`flex ${compact ? "items-center" : "items-start"} gap-2.5`}>
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
            selected
              ? "bg-[#e8327b] !text-white"
              : "bg-[#e6f7f8] text-[#006c73] group-hover:bg-[#006c73] group-hover:!text-white"
          }`}
        >
          <Icon size={18} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-2">
            <span className="min-w-0">
              <span className="block text-sm font-extrabold leading-tight text-[#21363a]">
                {title}
              </span>
              <span className="mt-0.5 block text-[11px] font-bold leading-tight text-[#68797d]">
                {price ? subtitle : "Não cadastrado"}
              </span>
            </span>

            <span className="shrink-0 rounded-full bg-[#ffe0ec] px-2 py-1 text-xs font-extrabold text-[#bf185d]">
              {displayPrice}
            </span>
          </span>

          {price && serviceName !== title && (
            <span className="mt-2 block truncate text-[10px] font-bold text-[#68797d]">
              Cadastro: {price.service_name}
            </span>
          )}
        </span>
      </div>

      {selected && (
        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e8327b] !text-white shadow-[0_6px_14px_rgba(232,50,123,0.25)]">
          <Check size={14} />
        </span>
      )}
    </button>
  );
}
