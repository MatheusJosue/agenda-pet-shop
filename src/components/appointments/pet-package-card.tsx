"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Calendar, Edit, AlertCircle, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { getPetPackageStatus, updatePetPackage } from "@/lib/actions/packages";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface PetPackageCardProps {
  petId: string;
  petName: string;
}

interface PackageStatus {
  hasActivePackage: boolean;
  package: {
    id: string;
    package_type: {
      name: string;
      credits: number;
    };
    expires_at: string;
  } | null;
  status?: 'active' | 'exhausted' | 'expired';
  creditsRemaining?: number;
  totalCredits?: number;
  daysUntilExpiry?: number;
}

export function PetPackageCard({ petId, petName }: PetPackageCardProps) {
  const [status, setStatus] = useState<PackageStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExpireConfirm, setShowExpireConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [credits, setCredits] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackageStatus();
  }, [petId]);

  const loadPackageStatus = async () => {
    setLoading(true);
    const result = await getPetPackageStatus(petId);
    setStatus(result);
    if (result.package) {
      setCredits(result.creditsRemaining || 0);
    }
    setLoading(false);
  };

  const handleUpdateCredits = async () => {
    if (!status?.package) return;

    setSaving(true);
    setError(null);

    const result = await updatePetPackage(status.package.id, {
      credits_remaining: credits
    });

    if (result.error) {
      setError(result.error);
    } else {
      await loadPackageStatus();
      setShowEditModal(false);
    }
    setSaving(false);
  };

  const handleMarkExpired = async () => {
    if (!status?.package) return;

    setSaving(true);
    setError(null);

    const result = await updatePetPackage(status.package.id, {
      active: false
    });

    if (result.error) {
      setError(result.error);
    } else {
      await loadPackageStatus();
      setShowExpireConfirm(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <GlassCard variant="default" className="p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10" />
          <div className="flex-1">
            <div className="h-4 bg-white/10 rounded w-32 mb-2" />
            <div className="h-3 bg-white/10 rounded w-24" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!status?.hasActivePackage || !status.package) {
    return (
      <GlassCard variant="default" className="p-4 border-dashed border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
            <Package size={18} className="text-white/40" />
          </div>
          <div className="flex-1">
            <p className="text-white/60 text-sm">Nenhum pacote ativo</p>
            <p className="text-white/40 text-xs">{petName} não possui pacote cadastrado</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  const { package: pkg, creditsRemaining = 0, totalCredits = 0, daysUntilExpiry = 0, status: pkgStatus = 'active' } = status;

  const getStatusConfig = () => {
    switch (pkgStatus) {
      case 'exhausted':
        return {
          icon: <XCircle size={20} className="text-red-400" />,
          label: 'Esgotado',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-300'
        };
      case 'expired':
        return {
          icon: <AlertCircle size={20} className="text-amber-400" />,
          label: 'Vencido',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500/30',
          textColor: 'text-amber-300'
        };
      default:
        return {
          icon: <CheckCircle size={20} className="text-green-400" />,
          label: 'Ativo',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500/30',
          textColor: 'text-green-300'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const creditsPercentage = totalCredits > 0 ? (creditsRemaining / totalCredits) * 100 : 0;

  return (
    <>
      <GlassCard
        variant="elevated"
        className={`p-4 ${pkgStatus === 'active' ? 'border-[#f183ff]/30' : ''}`}
      >

        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfig.bgColor} ${statusConfig.borderColor} border`}>
            <Package size={18} className={statusConfig.textColor} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-semibold ${statusConfig.textColor}`}>
                {pkg.package_type.name}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.borderColor} ${statusConfig.textColor}`}>
                {statusConfig.icon}
                <span className="ml-1">{statusConfig.label}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                Vence em {daysUntilExpiry > 0 ? `${daysUntilExpiry} dias` : 'hoje'}
              </span>
              <span>•</span>
              <span className={creditsRemaining === 0 ? 'text-red-400' : ''}>
                {creditsRemaining} de {totalCredits} créditos
              </span>
            </div>

            {/* Credits bar */}
            {totalCredits > 0 && (
              <div className="mt-2 w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    creditsRemaining === 0
                      ? 'bg-red-500'
                      : creditsPercentage <= 25
                      ? 'bg-amber-500'
                      : 'bg-gradient-to-r from-[#f183ff] to-[#d946ef]'
                  }`}
                  style={{ width: `${Math.max(creditsPercentage, 0)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="p-2 rounded-lg text-white/60 hover:text-[#f183ff] hover:bg-white/10 transition-all"
              title="Editar créditos"
            >
              <Edit size={16} />
            </button>
            {pkgStatus === 'active' && (
              <button
                type="button"
                onClick={() => setShowExpireConfirm(true)}
                className="p-2 rounded-lg text-white/60 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                title="Marcar como vencido"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Edit Credits Modal */}
      <ConfirmDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onConfirm={handleUpdateCredits}
        title="Editar créditos do pacote"
        description={
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              Ajuste a quantidade de créditos restantes para <span className="text-white font-semibold">{petName}</span>
            </p>
            <div>
              <label className="block text-white/80 text-sm font-semibold mb-2">
                Créditos Restantes
              </label>
              <Input
                type="number"
                min={0}
                max={totalCredits}
                value={credits}
                onChange={(e) => setCredits(Math.max(0, Math.min(totalCredits, parseInt(e.target.value) || 0)))}
                className="w-full"
              />
              <p className="text-white/50 text-xs mt-1">
                Total do pacote: {totalCredits} créditos
              </p>
            </div>
          </div>
        }
        confirmText="Salvar"
        cancelText="Cancelar"
        variant="default"
        icon="edit"
        loading={saving}
      />

      {/* Expire Confirm Dialog */}
      <ConfirmDialog
        open={showExpireConfirm}
        onOpenChange={setShowExpireConfirm}
        onConfirm={handleMarkExpired}
        title="Marcar pacote como vencido?"
        description={`Isso desativará o pacote ${pkg.package_type.name} de ${petName}. O pacote não estará mais disponível para uso.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="warning"
        icon="alert"
        loading={saving}
      />
    </>
  );
}
