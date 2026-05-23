"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle, Edit, Package, XCircle } from "lucide-react";
import { getPetPackageStatus, updatePetPackage } from "@/lib/actions/packages";
import { GlassCard } from "@/components/ui/glass-card";
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
  status?: "active" | "exhausted" | "expired";
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

  const loadPackageStatus = useCallback(async () => {
    setLoading(true);
    const result = await getPetPackageStatus(petId);
    setStatus(result);
    if (result.package) {
      setCredits(result.creditsRemaining || 0);
    }
    setLoading(false);
  }, [petId]);

  useEffect(() => {
    void Promise.resolve().then(loadPackageStatus);
  }, [loadPackageStatus]);

  const handleUpdateCredits = async () => {
    if (!status?.package) return;

    setSaving(true);
    const result = await updatePetPackage(status.package.id, {
      credits_remaining: credits,
    });

    if (!result.error) {
      await loadPackageStatus();
      setShowEditModal(false);
    }
    setSaving(false);
  };

  const handleMarkExpired = async () => {
    if (!status?.package) return;

    setSaving(true);
    const result = await updatePetPackage(status.package.id, {
      active: false,
    });

    if (!result.error) {
      await loadPackageStatus();
      setShowExpireConfirm(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <GlassCard className="p-4">
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-[#ffe0ec]" />
          <div className="flex-1">
            <div className="mb-2 h-4 w-36 rounded bg-[#ffe0ec]" />
            <div className="h-3 w-28 rounded bg-[#fff1f6]" />
          </div>
        </div>
      </GlassCard>
    );
  }

  if (!status?.hasActivePackage || !status.package) {
    return (
      <GlassCard className="border-dashed border-[rgba(232,50,123,0.34)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fff1f6]">
            <Package size={20} className="text-[#e8327b]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-[#21363a]">Nenhum pacote ativo</p>
            <p className="text-xs font-semibold text-[#68797d]">
              {petName} não possui pacote cadastrado
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  const {
    package: pkg,
    creditsRemaining = 0,
    totalCredits = 0,
    daysUntilExpiry = 0,
    status: pkgStatus = "active",
  } = status;
  const statusConfig = getStatusConfig(pkgStatus);
  const creditsPercentage = totalCredits > 0 ? (creditsRemaining / totalCredits) * 100 : 0;

  return (
    <>
      <GlassCard className="border-[rgba(232,50,123,0.34)] bg-white/90 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dffbea]">
            <Package size={22} className="text-[#18b96f]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-extrabold leading-tight text-[#18b96f]">
                {pkg.package_type.name}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-extrabold ${statusConfig.badge}`}>
                {statusConfig.icon}
                {statusConfig.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#68797d]">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#68797d]" />
                Vence em {daysUntilExpiry > 0 ? `${daysUntilExpiry} dias` : "hoje"}
              </span>
              <span>
                {creditsRemaining} de {totalCredits} créditos
              </span>
            </div>

            {totalCredits > 0 && (
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ffe0ec]">
                <div
                  className={`h-full rounded-full transition-all ${statusConfig.bar}`}
                  style={{ width: `${Math.max(creditsPercentage, 0)}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="rounded-lg p-2 text-[#68797d] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
              title="Editar créditos"
            >
              <Edit size={16} />
            </button>
            {pkgStatus === "active" && (
              <button
                type="button"
                onClick={() => setShowExpireConfirm(true)}
                className="rounded-lg p-2 text-[#68797d] transition-colors hover:bg-amber-50 hover:text-amber-600"
                title="Marcar como vencido"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </GlassCard>

      <ConfirmDialog
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onConfirm={handleUpdateCredits}
        title="Editar créditos do pacote"
        description={
          <div className="space-y-4">
            <p className="text-sm text-[#68797d]">
              Ajuste a quantidade de créditos restantes para{" "}
              <span className="font-extrabold text-[#21363a]">{petName}</span>.
            </p>
            <div>
              <label className="mb-2 block text-sm font-extrabold text-[#006c73]">
                Créditos restantes
              </label>
              <Input
                type="number"
                min={0}
                max={totalCredits}
                value={credits}
                onChange={(event) =>
                  setCredits(Math.max(0, Math.min(totalCredits, parseInt(event.target.value) || 0)))
                }
                className="w-full"
              />
              <p className="mt-1 text-xs font-semibold text-[#68797d]">
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

function getStatusConfig(status: "active" | "exhausted" | "expired") {
  if (status === "exhausted") {
    return {
      label: "Esgotado",
      icon: <XCircle size={15} />,
      badge: "border-red-200 bg-red-50 text-red-600",
      bar: "bg-red-500",
    };
  }

  if (status === "expired") {
    return {
      label: "Vencido",
      icon: <AlertCircle size={15} />,
      badge: "border-amber-200 bg-amber-50 text-amber-600",
      bar: "bg-amber-500",
    };
  }

  return {
    label: "Ativo",
    icon: <CheckCircle size={15} />,
    badge: "border-[#91e8bf] bg-[#dffbea] text-[#0b8b58]",
    bar: "bg-[#e8327b]",
  };
}
