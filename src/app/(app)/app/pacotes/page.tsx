"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/layout/app-header";
import { AppLayout } from "@/components/layout/app-layout";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import {
  CATALOG_SIZE_HINTS,
  CATALOG_SIZE_LABELS,
  FLYER_FALLBACK_PRICES,
  formatCatalogPrice,
  type CatalogSize,
} from "@/lib/service-catalog";
import type { PackageType } from "@/lib/types/packages";
import { Calendar, PawPrint, Plus } from "lucide-react";

const SIZES: CatalogSize[] = ["small", "medium", "large"];

const FREQUENCIES = [
  {
    key: "weekly",
    label: "Semanal",
    interval: 7,
    subtitle: "1 banho por semana",
  },
  {
    key: "fortnightly",
    label: "Quinzenal",
    interval: 15,
    subtitle: "1 banho a cada 15 dias",
  },
  {
    key: "monthly",
    label: "Mensal",
    interval: 30,
    subtitle: "1 banho por mês",
  },
] as const;

export default function PacotesPage() {
  const [packageTypes, setPackageTypes] = useState<PackageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("Agenda Pet Shop");
  const [user, setUser] = useState<{
    user_metadata?: { name?: string };
    email?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      const [{ getAppStats }, { getPackageTypes }] = await Promise.all([
        import("@/lib/actions/app"),
        import("@/lib/actions/packages"),
      ]);
      const [stats, packages] = await Promise.all([
        getAppStats(),
        getPackageTypes(""),
      ]);
      if (stats.data) {
        setCompanyName(stats.data.companyName || "Agenda Pet Shop");
        setUser(stats.data.user);
      }
      setPackageTypes(packages.data || []);
      setLoading(false);
    }
    loadData();
  }, []);

  const packagesBySize = useMemo(() => {
    return Object.fromEntries(
      SIZES.map((size) => [
        size,
        FREQUENCIES.map((frequency) => ({
          frequency,
          packageType:
            packageTypes.find(
              (pkg) =>
                getCatalogSizeFromName(pkg.name) === size &&
                pkg.interval_days === frequency.interval,
            ) ||
            packageTypes.find(
              (pkg) =>
                pkg.interval_days === frequency.interval &&
                getCatalogSizeFromName(pkg.name) === null,
            ),
        })),
      ]),
    ) as Record<
      CatalogSize,
      Array<{
        frequency: (typeof FREQUENCIES)[number];
        packageType?: PackageType;
      }>
    >;
  }, [packageTypes]);

  return (
    <AppLayout
      companyName={companyName}
      user={{ name: user?.user_metadata?.name, email: user?.email }}
    >
      <div className="flex flex-col min-h-dvh bg-transparent relative overflow-hidden">
        <AppHeader
          companyName={companyName}
          user={{ name: user?.user_metadata?.name, email: user?.email }}
        />

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold text-[#68797d]">
              Mais cuidado, mais economia.
            </p>
            <Link href="/app/pacotes/novo">
              <Button variant="primary" size="sm">
                <Plus size={16} />
                Novo
              </Button>
            </Link>
          </div>

          <GlassCard className="p-5">
            <div className="inline-flex rounded-lg bg-[#e8327b] px-5 py-2 text-white font-extrabold uppercase mb-5">
              Pacotes - mais cuidado, mais economia
            </div>

            {loading ? (
              <div className="p-10 text-center text-sm font-bold text-[#006c73]">
                Carregando pacotes...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="text-left">
                      <th className="p-3 text-[#006c73]">Porte</th>
                      {FREQUENCIES.map((frequency) => (
                        <th key={frequency.key} className="p-3 text-center">
                          <span className="inline-flex rounded-lg bg-[#e8327b] px-4 py-2 text-white font-extrabold">
                            {frequency.label}
                          </span>
                          <p className="mt-2 text-xs font-bold text-[#68797d]">
                            {frequency.subtitle}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SIZES.map((size) => (
                      <tr
                        key={size}
                        className="border-t border-[rgba(232,50,123,0.18)]"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="w-10 h-10 rounded-full bg-[#ffe0ec] text-[#e8327b] flex items-center justify-center">
                              <PawPrint size={20} />
                            </span>
                            <div>
                              <p className="font-extrabold text-[#21363a]">
                                {CATALOG_SIZE_LABELS[size]}
                              </p>
                              <p className="text-xs font-bold text-[#68797d]">
                                {CATALOG_SIZE_HINTS[size]}
                              </p>
                            </div>
                          </div>
                        </td>
                        {packagesBySize[size].map(
                          ({ frequency, packageType }) => (
                            <td key={frequency.key} className="p-3 text-center">
                              <p className="text-2xl font-extrabold text-[#e8327b]">
                                {formatCatalogPrice(
                                  packageType?.price ??
                                    FLYER_FALLBACK_PRICES.packages[size][
                                      frequency.key
                                    ],
                                )}
                              </p>
                              <p className="mt-1 text-xs font-bold text-[#68797d]">
                                {packageType?.credits ??
                                  (frequency.interval === 7
                                    ? 4
                                    : frequency.interval === 15
                                      ? 2
                                      : 1)}{" "}
                                crédito(s)
                              </p>
                              {packageType && (
                                <Link
                                  href={`/app/pacotes/${packageType.id}/editar`}
                                  className="mt-2 inline-flex text-xs font-extrabold text-[#006c73] hover:text-[#bf185d]"
                                >
                                  Editar
                                </Link>
                              )}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-start gap-3">
              <Calendar size={22} className="text-[#e8327b]" />
              <p className="text-sm font-bold text-[#68797d]">
                Ao criar um pacote para um pet, os créditos são usados nos
                agendamentos marcados como “Pacote”.
              </p>
            </div>
          </GlassCard>
        </main>

        <BottomNavigation />
      </div>
    </AppLayout>
  );
}

function getCatalogSizeFromName(name: string): CatalogSize | null {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("pequeno")) return "small";
  if (normalized.includes("medio")) return "medium";
  if (normalized.includes("grande")) return "large";
  return null;
}
