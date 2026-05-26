"use client";

import { Eye, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function ImpersonationBanner({ companyName }: { companyName: string }) {
  const router = useRouter();

  const endImpersonation = () => {
    document.cookie = "impersonate_company_id=; path=/; max-age=0";
    router.push("/admin/empresas");
    router.refresh();
  };

  return (
    <div className="w-full border-b border-[rgba(232,50,123,0.18)] bg-[#fff9fb]/94 px-3 py-2 shadow-[0_8px_24px_rgba(33,54,58,0.08)] backdrop-blur-2xl">
      <div className="mx-auto flex h-9 w-full max-w-7xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[#fff1d6] text-amber-700">
            <Eye size={15} />
          </span>
          <span className="hidden shrink-0 font-extrabold text-amber-800 sm:inline">
            Modo de personificacao
          </span>
          <span className="min-w-0 truncate font-semibold text-[#21363a]">
            Visualizando como <strong>{companyName}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={endImpersonation}
          className="flex h-8 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ffe0ec] px-2 text-sm font-extrabold text-[#bf185d] transition-colors hover:bg-[#ffd0e2] sm:px-3"
          aria-label="Sair da personificacao"
        >
          <X size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  );
}
