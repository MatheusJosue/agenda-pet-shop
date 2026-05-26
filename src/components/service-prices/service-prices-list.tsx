"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bath,
  Check,
  Droplets,
  Edit3,
  Package,
  PawPrint,
  Scissors,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  CATALOG_SIZE_LABELS,
  CATALOG_SIZE_TO_SERVICE_SIZE,
  FLYER_FALLBACK_PRICES,
  SERVICE_ALIASES,
  findCatalogPrice,
  formatCatalogPrice,
  getServiceDisplayName,
  serviceNameMatches,
  type CatalogSize,
} from "@/lib/service-catalog";
import type { ServicePrice } from "@/lib/types/service-prices";

interface ServicePricesListProps {
  billingType: "avulso" | "pacote" | "all";
}

type EditableService = {
  title: string;
  aliases: readonly string[];
};

const MAIN_SIZES: CatalogSize[] = ["small", "medium", "large"];

const EDITABLE_SERVICES: EditableService[] = [
  { title: "Banho", aliases: SERVICE_ALIASES.bath },
  { title: "Tosa Higiênica", aliases: SERVICE_ALIASES.hygienicGroom },
  { title: "Banho + Tosa na Máquina", aliases: SERVICE_ALIASES.machineGroom },
  { title: "Banho + Tosa na Tesoura", aliases: SERVICE_ALIASES.scissorGroom },
  { title: "Corte de unhas", aliases: SERVICE_ALIASES.nailTrim },
  { title: "Hidratação", aliases: SERVICE_ALIASES.hydration },
  { title: "Desembolo de nós", aliases: SERVICE_ALIASES.detangle },
];

export function ServicePricesList({ billingType }: ServicePricesListProps) {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditableService | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadPrices = useCallback(async () => {
    setLoading(true);
    const { getServicePrices } = await import("@/lib/actions/service-prices");
    const result = await getServicePrices(billingType);
    setPrices(result.data || []);
    setLoading(false);
  }, [billingType]);

  useEffect(() => {
    loadPrices();
  }, [loadPrices]);

  const activePrices = useMemo(
    () =>
      prices.filter(
        (price) => billingType === "all" || price.billing_type === billingType,
      ),
    [billingType, prices],
  );

  function startEditing(service: EditableService) {
    const values: Record<string, string> = {};
    activePrices
      .filter((price) =>
        serviceNameMatches(price.service_name, service.aliases),
      )
      .forEach((price) => {
        values[price.id] = String(price.price);
      });
    setEditing(service);
    setEditValues(values);
    setMessage(null);
  }

  function cancelEditing() {
    setEditing(null);
    setEditValues({});
  }

  async function saveEditing() {
    if (!editing) return;
    setSaving(true);
    const { updateServicePrices } =
      await import("@/lib/actions/service-prices");
    const updates = activePrices
      .filter((price) =>
        serviceNameMatches(price.service_name, editing.aliases),
      )
      .map((price) => ({
        serviceName: price.service_name,
        billingType: price.billing_type,
        hairType: price.hair_type || undefined,
        sizeCategory: price.size_category,
        price: Number(editValues[price.id] || price.price),
      }));

    const result = await updateServicePrices(updates);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("Preços atualizados.");
      setEditing(null);
      await loadPrices();
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-[#006c73] font-bold">
          Carregando tabela de preços...
        </p>
      </GlassCard>
    );
  }

  const showServices = billingType === "all" || billingType === "avulso";
  const showPackages = billingType === "all" || billingType === "pacote";

  return (
    <div className="space-y-6">
      {message && (
        <GlassCard className="p-4">
          <p className="text-sm font-bold text-[#006c73]">{message}</p>
        </GlassCard>
      )}

      {showServices && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <PriceColumn
              title="Banho"
              icon={Bath}
              service={EDITABLE_SERVICES[0]}
              prices={activePrices}
              fallback={FLYER_FALLBACK_PRICES.bath}
              editing={editing}
              editValues={editValues}
              onEditChange={setEditValues}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEdit={saveEditing}
              saving={saving}
            />
            <PriceColumn
              title="Tosa Higiênica"
              icon={Scissors}
              service={EDITABLE_SERVICES[1]}
              prices={activePrices}
              fallback={FLYER_FALLBACK_PRICES.hygienicGroom}
              editing={editing}
              editValues={editValues}
              onEditChange={setEditValues}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEdit={saveEditing}
              saving={saving}
            />
            <ComboPriceColumn
              prices={activePrices}
              editing={editing}
              editValues={editValues}
              onEditChange={setEditValues}
              onStartEdit={startEditing}
              onCancelEdit={cancelEditing}
              onSaveEdit={saveEditing}
              saving={saving}
            />
          </div>

          <ExtrasSection
            prices={activePrices}
            editing={editing}
            editValues={editValues}
            onEditChange={setEditValues}
            onStartEdit={startEditing}
            onCancelEdit={cancelEditing}
            onSaveEdit={saveEditing}
            saving={saving}
          />
        </>
      )}

      {showPackages && <PackagesSection prices={activePrices} />}
    </div>
  );
}

function PriceColumn({
  title,
  icon: Icon,
  service,
  prices,
  fallback,
  editing,
  editValues,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  saving,
}: {
  title: string;
  icon: typeof Bath;
  service: EditableService;
  prices: ServicePrice[];
  fallback: Record<CatalogSize, number>;
  editing: EditableService | null;
  editValues: Record<string, string>;
  onEditChange: (values: Record<string, string>) => void;
  onStartEdit: (service: EditableService) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  saving: boolean;
}) {
  const isEditing = editing?.title === service.title;

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col items-center text-center gap-3 mb-5">
        <div className="w-16 h-16 rounded-full bg-[#006c73] !text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,108,115,0.18)]">
          <Icon size={30} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#e8327b] px-5 py-2 !text-white  shadow-[0_10px_20px_rgba(232,50,123,0.24)]">
          {title}
        </div>
      </div>

      <div className="space-y-1">
        {MAIN_SIZES.map((size) => {
          const price = findCatalogPrice(prices, service.aliases, size);
          return (
            <PriceRow
              key={size}
              label={CATALOG_SIZE_LABELS[size]}
              value={price?.price ?? fallback[size]}
              servicePrice={price}
              isEditing={isEditing}
              editValues={editValues}
              onEditChange={onEditChange}
            />
          );
        })}
      </div>

      <CardEditActions
        isEditing={isEditing}
        saving={saving}
        onStart={() => onStartEdit(service)}
        onCancel={onCancelEdit}
        onSave={onSaveEdit}
      />
    </GlassCard>
  );
}

function ComboPriceColumn(props: {
  prices: ServicePrice[];
  editing: EditableService | null;
  editValues: Record<string, string>;
  onEditChange: (values: Record<string, string>) => void;
  onStartEdit: (service: EditableService) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  saving: boolean;
}) {
  const machineEditing = props.editing?.title === EDITABLE_SERVICES[2].title;
  const scissorEditing = props.editing?.title === EDITABLE_SERVICES[3].title;

  return (
    <GlassCard className="p-5">
      <div className="flex flex-col items-center text-center gap-3 mb-5">
        <div className="w-16 h-16 rounded-full bg-[#006c73] !text-white flex items-center justify-center shadow-[0_10px_24px_rgba(0,108,115,0.18)]">
          <Droplets size={30} />
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg bg-[#e8327b] px-5 py-2 !text-white  shadow-[0_10px_20px_rgba(232,50,123,0.24)]">
          Banho + Tosa
        </div>
      </div>

      <div className="grid grid-cols-[1fr_96px_96px] gap-2 text-xs font-extrabold uppercase text-[#21363a] pb-2 border-b border-[rgba(232,50,123,0.2)]">
        <span />
        <span className="text-center">Máquina</span>
        <span className="text-center">Tesoura</span>
      </div>

      {MAIN_SIZES.map((size) => {
        const machine = findCatalogPrice(
          props.prices,
          SERVICE_ALIASES.machineGroom,
          size,
        );
        const scissor = findCatalogPrice(
          props.prices,
          SERVICE_ALIASES.scissorGroom,
          size,
        );
        return (
          <div
            key={size}
            className="grid grid-cols-[1fr_96px_96px] gap-2 items-center py-3 border-b border-dashed border-[rgba(232,50,123,0.18)]"
          >
            <span className="font-extrabold text-[#21363a] flex items-center gap-2">
              <PawPrint size={15} className="text-[#e8327b]" />
              {CATALOG_SIZE_LABELS[size]}
            </span>
            <EditablePrice
              servicePrice={machine}
              fallback={FLYER_FALLBACK_PRICES.machineGroom[size]}
              isEditing={machineEditing}
              editValues={props.editValues}
              onEditChange={props.onEditChange}
            />
            <EditablePrice
              servicePrice={scissor}
              fallback={FLYER_FALLBACK_PRICES.scissorGroom[size]}
              isEditing={scissorEditing}
              editValues={props.editValues}
              onEditChange={props.onEditChange}
            />
          </div>
        );
      })}

      {machineEditing || scissorEditing ? (
        <CardEditActions
          isEditing
          saving={props.saving}
          onStart={() => undefined}
          onCancel={props.onCancelEdit}
          onSave={props.onSaveEdit}
        />
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => props.onStartEdit(EDITABLE_SERVICES[2])}
            className="rounded-xl border border-[rgba(232,50,123,0.22)] bg-white/70 px-3 py-2 text-sm font-extrabold text-[#006c73] hover:bg-[#ffe0ec] hover:text-[#bf185d]"
          >
            Editar máquina
          </button>
          <button
            type="button"
            onClick={() => props.onStartEdit(EDITABLE_SERVICES[3])}
            className="rounded-xl border border-[rgba(232,50,123,0.22)] bg-white/70 px-3 py-2 text-sm font-extrabold text-[#006c73] hover:bg-[#ffe0ec] hover:text-[#bf185d]"
          >
            Editar tesoura
          </button>
        </div>
      )}
    </GlassCard>
  );
}

function ExtrasSection(props: {
  prices: ServicePrice[];
  editing: EditableService | null;
  editValues: Record<string, string>;
  onEditChange: (values: Record<string, string>) => void;
  onStartEdit: (service: EditableService) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  saving: boolean;
}) {
  const extras = [
    {
      service: EDITABLE_SERVICES[4],
      fallback: FLYER_FALLBACK_PRICES.nailTrim,
      icon: Scissors,
    },
    {
      service: EDITABLE_SERVICES[5],
      fallback: FLYER_FALLBACK_PRICES.hydration,
      icon: Sparkles,
    },
    {
      service: EDITABLE_SERVICES[6],
      fallback: FLYER_FALLBACK_PRICES.detangle,
      icon: PawPrint,
    },
  ];

  return (
    <GlassCard className="p-5">
      <div className="inline-flex rounded-lg bg-[#e8327b] px-5 py-2 !text-white  mb-4">
        Serviços Extras
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {extras.map(({ service, fallback, icon: Icon }) => {
          const price = findCatalogPrice(
            props.prices,
            service.aliases,
            "small",
          );
          const isEditing = props.editing?.title === service.title;
          return (
            <div
              key={service.title}
              className="flex items-center gap-3 rounded-xl border border-[rgba(232,50,123,0.18)] bg-white/70 p-4"
            >
              <Icon size={30} className="text-[#bf185d]" />
              <div className="flex-1">
                <p className="font-extrabold text-[#21363a]">{service.title}</p>
                <EditablePrice
                  servicePrice={price}
                  fallback={fallback}
                  isEditing={isEditing}
                  editValues={props.editValues}
                  onEditChange={props.onEditChange}
                />
              </div>
              {isEditing ? (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={props.onCancelEdit}
                    className="w-8 h-8 rounded-lg border border-[rgba(232,50,123,0.24)] text-[#bf185d] hover:bg-[#ffe0ec]"
                    aria-label="Cancelar"
                  >
                    <X size={15} className="mx-auto" />
                  </button>
                  <button
                    type="button"
                    onClick={props.onSaveEdit}
                    disabled={props.saving}
                    className="w-8 h-8 rounded-lg bg-[#e8327b] !text-white hover:bg-[#bf185d] disabled:opacity-60"
                    aria-label="Salvar"
                  >
                    <Check size={15} className="mx-auto" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => props.onStartEdit(service)}
                  className="text-[#006c73] hover:text-[#bf185d]"
                  aria-label={`Editar ${service.title}`}
                >
                  <Edit3 size={17} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function PackagesSection({ prices }: { prices: ServicePrice[] }) {
  const packagePrices = prices.filter(
    (price) => price.billing_type === "pacote",
  );

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-5">
        <Package className="text-[#e8327b]" size={26} />
        <div>
          <h2 className="text-2xl font-extrabold text-[#bf185d]">
            Pacotes - mais cuidado, mais economia
          </h2>
          <p className="text-sm font-bold text-[#68797d]">
            Valores por porte e frequência.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-3 text-[#006c73]">Porte</th>
              <th className="p-3 text-center text-[#bf185d]">Semanal</th>
              <th className="p-3 text-center text-[#bf185d]">Quinzenal</th>
              <th className="p-3 text-center text-[#bf185d]">Mensal</th>
            </tr>
          </thead>
          <tbody>
            {MAIN_SIZES.map((size) => (
              <tr
                key={size}
                className="border-t border-[rgba(232,50,123,0.18)]"
              >
                <td className="p-3">
                  <p className="font-extrabold text-[#21363a]">
                    {CATALOG_SIZE_LABELS[size]}
                  </p>
                </td>
                {[
                  [
                    "Pacote Semanal",
                    FLYER_FALLBACK_PRICES.packages[size].weekly,
                  ],
                  [
                    "Pacote Quinzenal",
                    FLYER_FALLBACK_PRICES.packages[size].fortnightly,
                  ],
                  [
                    "Pacote Mensal",
                    FLYER_FALLBACK_PRICES.packages[size].monthly,
                  ],
                ].map(([name, fallback]) => {
                  const price = packagePrices.find(
                    (item) =>
                      item.service_name === name &&
                      CATALOG_SIZE_TO_SERVICE_SIZE[size].includes(
                        item.size_category,
                      ),
                  );
                  return (
                    <td key={String(name)} className="p-3 text-center">
                      <p className="text-xl font-extrabold text-[#e8327b]">
                        {formatCatalogPrice(price?.price ?? Number(fallback))}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

function PriceRow(props: {
  label: string;
  value: number;
  servicePrice: ServicePrice | null;
  isEditing: boolean;
  editValues: Record<string, string>;
  onEditChange: (values: Record<string, string>) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-dashed border-[rgba(232,50,123,0.18)]">
      <span className="font-extrabold text-[#21363a] flex items-center gap-2">
        <PawPrint size={15} className="text-[#e8327b]" />
        {props.label}
      </span>
      <EditablePrice {...props} fallback={props.value} />
    </div>
  );
}

function EditablePrice({
  servicePrice,
  fallback,
  isEditing,
  editValues,
  onEditChange,
}: {
  servicePrice?: ServicePrice | null;
  fallback?: number;
  isEditing: boolean;
  editValues: Record<string, string>;
  onEditChange: (values: Record<string, string>) => void;
}) {
  if (isEditing && servicePrice) {
    return (
      <input
        type="number"
        min="0"
        step="0.01"
        value={editValues[servicePrice.id] ?? String(servicePrice.price)}
        onChange={(event) =>
          onEditChange({ ...editValues, [servicePrice.id]: event.target.value })
        }
        className="w-24 rounded-lg border border-[rgba(232,50,123,0.36)] bg-white px-2 py-1.5 text-center text-base font-extrabold text-[#21363a] outline-none focus:border-[#e8327b] focus:ring-2 focus:ring-[#e8327b]/15"
      />
    );
  }

  return (
    <span className="text-xl font-extrabold text-[#e8327b] text-center block">
      {formatCatalogPrice(servicePrice?.price ?? fallback)}
    </span>
  );
}

function CardEditActions({
  isEditing,
  saving,
  onStart,
  onCancel,
  onSave,
}: {
  isEditing: boolean;
  saving: boolean;
  onStart: () => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!isEditing) {
    return (
      <button
        type="button"
        onClick={onStart}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl border border-[rgba(232,50,123,0.22)] bg-white/70 px-3 py-2.5 text-sm font-extrabold text-[#006c73] hover:text-[#bf185d] hover:bg-[#ffe0ec]"
      >
        <Edit3 size={16} />
        Editar preços
      </button>
    );
  }

  return (
    <div className="mt-5 rounded-xl border border-[rgba(232,50,123,0.24)] bg-[#fff1f6] p-3">
      <p className="mb-3 text-xs font-extrabold text-[#bf185d]">
        Alterando valores deste card
      </p>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={saving}
        >
          <X size={16} />
          Cancelar
        </Button>
        <Button variant="primary" size="sm" onClick={onSave} disabled={saving}>
          <Check size={16} />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </div>
  );
}

export function getUnmappedServices(prices: ServicePrice[]) {
  const knownAliases = Object.values(SERVICE_ALIASES).flat();
  return prices
    .filter((price) => !serviceNameMatches(price.service_name, knownAliases))
    .map((price) => ({
      ...price,
      service_name: getServiceDisplayName(price.service_name),
    }));
}
