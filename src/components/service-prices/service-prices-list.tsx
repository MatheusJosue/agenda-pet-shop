"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Scissors, Package, Edit3, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SIZE_LABELS,
  HAIR_TYPE_LABELS,
  BILLING_TYPE_LABELS,
  type ServicePrice,
  type SizeCategory,
  type HairType,
  type BillingType
} from "@/lib/types/service-prices";

interface ServiceGroup {
  serviceName: string;
  prices: ServicePrice[];
}

interface ServicePricesListProps {
  billingType: 'avulso' | 'pacote' | 'all';
  onBillingTypeChange?: (type: 'avulso' | 'pacote' | 'all') => void;
}

export function ServicePricesList({ billingType, onBillingTypeChange }: ServicePricesListProps) {
  const [prices, setPrices] = useState<ServicePrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPrices();
  }, [billingType]);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const { getServicePrices } = await import("@/lib/actions/service-prices");
      const { data } = await getServicePrices(billingType);
      setPrices(data);
    } catch (err) {
      console.error("Error loading prices:", err);
      setError("Erro ao carregar preços");
    } finally {
      setLoading(false);
    }
  };

  // Group prices by service name
  const groupedPrices = prices.reduce((acc, price) => {
    if (!acc[price.service_name]) {
      acc[price.service_name] = [];
    }
    acc[price.service_name].push(price);
    return acc;
  }, {} as Record<string, ServicePrice[]>);

  const serviceGroups: ServiceGroup[] = Object.entries(groupedPrices).map(([serviceName, prices]) => ({
    serviceName,
    prices
  }));

  const startEditing = (serviceName: string) => {
    setEditingService(serviceName);
    const values: Record<string, string> = {};
    groupedPrices[serviceName].forEach((price) => {
      values[price.id] = price.price.toString();
    });
    setEditValues(values);
    setError(null);
    setSuccess(null);
  };

  const cancelEditing = () => {
    setEditingService(null);
    setEditValues({});
    setError(null);
  };

  const savePrices = async (serviceName: string) => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { updateServicePrices } = await import("@/lib/actions/service-prices");

      const updates = groupedPrices[serviceName].map((price) => ({
        serviceName: price.service_name,
        billingType: price.billing_type,
        hairType: price.hair_type || undefined,
        sizeCategory: price.size_category,
        price: parseFloat(editValues[price.id] || price.price.toString())
      }));

      const result = await updateServicePrices(updates);

      if (result.error) {
        setError(result.error);
      } else {
        await loadPrices();
        setEditingService(null);
        setSuccess("Preços atualizados com sucesso!");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError("Erro ao salvar preços");
    } finally {
      setSaving(false);
    }
  };

  const getHairTypeLabel = (hairType: HairType | null) => {
    if (!hairType) return null;
    return HAIR_TYPE_LABELS[hairType];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <GlassCard variant="default" className="p-4 bg-red-500/20 border-red-500/50">
          <p className="text-red-200 text-sm">⚠️ {error}</p>
        </GlassCard>
      )}

      {success && (
        <GlassCard variant="default" className="p-4 bg-green-500/20 border-green-500/50">
          <p className="text-green-200 text-sm">✓ {success}</p>
        </GlassCard>
      )}

      {serviceGroups.length === 0 ? (
        <GlassCard variant="default" className="p-12 text-center">
          <p className="text-purple-200/60">Nenhum preço cadastrado</p>
        </GlassCard>
      ) : (
        serviceGroups.map((group) => (
          <ServicePriceCard
            key={group.serviceName}
            group={group}
            isEditing={editingService === group.serviceName}
            editValues={editValues}
            onEditChange={(id, value) => setEditValues(prev => ({ ...prev, [id]: value }))}
            onStartEdit={() => startEditing(group.serviceName)}
            onCancelEdit={cancelEditing}
            onSave={() => savePrices(group.serviceName)}
            saving={saving}
          />
        ))
      )}
    </div>
  );
}

interface ServicePriceCardProps {
  group: ServiceGroup;
  isEditing: boolean;
  editValues: Record<string, string>;
  onEditChange: (id: string, value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  saving: boolean;
}

function ServicePriceCard({
  group,
  isEditing,
  editValues,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSave,
  saving
}: ServicePriceCardProps) {
  const [expanded, setExpanded] = useState(true);

  // Group by billing type
  const byBillingType = group.prices.reduce((acc, price) => {
    if (!acc[price.billing_type]) {
      acc[price.billing_type] = [];
    }
    acc[price.billing_type].push(price);
    return acc;
  }, {} as Record<BillingType, ServicePrice[]>);

  // Check if service has hair type distinction
  const hasHairTypes = group.prices.some(p => p.hair_type);

  return (
    <GlassCard
      variant="default"
      className="overflow-hidden hover:scale-[1.005] hover:bg-white/5 transition-all duration-300"
    >
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
            <Scissors size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{group.serviceName}</h3>
            <p className="text-xs text-purple-300/60">
              {group.prices.length} variação(ões)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? null : (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white/10"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit();
              }}
            >
              <Edit3 size={16} className="text-purple-300" />
            </Button>
          )}
          {expanded ? (
            <ChevronUp size={18} className="text-purple-300/50" />
          ) : (
            <ChevronDown size={18} className="text-purple-300/50" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {Object.entries(byBillingType).map(([billingType, prices]) => (
                <div key={billingType} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={14} className="text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">
                      {BILLING_TYPE_LABELS[billingType as BillingType]}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {prices
                      .sort((a, b) => {
                        // First sort by hair type: null (no distinction) first, then PC, then PL
                        const getHairTypeOrder = (hairType: HairType | null) => {
                          if (!hairType) return 0;
                          return hairType === 'PC' ? 1 : 2;
                        };
                        const aHairType = getHairTypeOrder(a.hair_type);
                        const bHairType = getHairTypeOrder(b.hair_type);

                        if (aHairType !== bHairType) {
                          return aHairType - bHairType;
                        }

                        // Then sort by size
                        const sizeOrder = ['tiny', 'small', 'medium', 'large', 'giant'];
                        return sizeOrder.indexOf(a.size_category) - sizeOrder.indexOf(b.size_category);
                      })
                      .map((price) => {
                        const key = `${price.id}-${price.hair_type || 'null'}`;
                        return (
                          <div
                            key={price.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium text-white">
                                  {SIZE_LABELS[price.size_category]}
                                </span>
                                {price.hair_type && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200">
                                    {getHairTypeLabel(price.hair_type)}
                                  </span>
                                )}
                              </div>
                              {isEditing ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-purple-300/50">R$</span>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={editValues[price.id] || price.price.toString()}
                                    onChange={(e) => onEditChange(price.id, e.target.value)}
                                    className="h-7 text-sm px-2 py-1"
                                  />
                                </div>
                              ) : (
                                <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
                                  R$ {price.price.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="px-4 pb-4 flex gap-2 justify-end border-t border-white/10 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCancelEdit}
                  disabled={saving}
                >
                  <X size={16} className="mr-2" />
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Check size={16} className="mr-2" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function getHairTypeLabel(hairType: HairType | null) {
  if (!hairType) return null;
  return HAIR_TYPE_LABELS[hairType];
}
