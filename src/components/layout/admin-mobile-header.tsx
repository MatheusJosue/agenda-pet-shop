"use client";

import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAdminPageTitle } from "@/lib/page-title";
import { AdminSidebar } from "./admin-sidebar";
import { cn } from "@/lib/utils";

export function AdminMobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = getAdminPageTitle(pathname);

  return (
    <>
      <header className="flex xl:hidden sticky top-0 z-30 w-full">
        <div className="w-full px-3 pt-2">
          <div className="rounded-2xl border border-[rgba(232,50,123,0.22)] bg-[#fff9fb]/94 shadow-[0_8px_24px_rgba(33,54,58,0.08)] backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3 px-3 py-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDrawerOpen(true)}
                className="flex-shrink-0 p-2 text-[#006c73] hover:bg-[#ffe0ec]"
                aria-label="Abrir menu"
              >
                <Menu size={24} />
              </Button>

              <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe0ec]">
                  <ShieldCheck size={17} className="text-[#e8327b]" />
                </span>
                <h3 className="min-w-0 truncate text-xs font-extrabold text-[#21363a] sm:text-sm">
                  {pageTitle}
                </h3>
              </div>

              <div className="w-9 flex-shrink-0" />
            </div>
          </div>
        </div>
      </header>

      {drawerOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#21363a]/35 backdrop-blur-sm animate-in fade-in duration-300 xl:hidden"
          aria-label="Fechar menu"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[86%] max-w-sm transition-transform duration-300 ease-out xl:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <AdminSidebar
          mobile
          embedded
          onClose={() => setDrawerOpen(false)}
          onNavigate={() => setDrawerOpen(false)}
        />
      </div>
    </>
  );
}
