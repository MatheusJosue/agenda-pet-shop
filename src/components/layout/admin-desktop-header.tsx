"use client";

import { ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { getAdminPageTitle } from "@/lib/page-title";

export function AdminDesktopHeader() {
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <header className="hidden xl:flex sticky top-0 z-40 w-full border-b border-[rgba(232,50,123,0.18)] bg-[#fff9fb]/88 backdrop-blur-2xl">
      <div className="flex flex-1 items-center justify-center px-6 py-3.5">
        <div className="flex w-full max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8327b] shadow-[0_10px_24px_rgba(232,50,123,0.18)]">
              <ShieldCheck size={21} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#006c73]">
                {pageTitle}
              </h1>
              <p className="text-xs font-bold text-[#68797d]">
                Visao geral do sistema
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
