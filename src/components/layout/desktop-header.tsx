"use client";

import { PawPrint } from "lucide-react";

interface DesktopHeaderProps {
  user?: {
    name?: string;
    email?: string;
  };
  sidebarCollapsed?: boolean;
  companyName: string;
}

export function DesktopHeader({
  companyName = "Agenda Pet Shop",
}: DesktopHeaderProps) {
  return (
    <header className="hidden xl:flex sticky top-0 z-40 w-full bg-[#fff9fb]/88 backdrop-blur-2xl border-b border-[rgba(232,50,123,0.18)]">
      <div className="flex-1 flex items-center justify-center px-6 py-3.5">
        <div className="flex items-center justify-between w-full max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#e8327b] flex items-center justify-center shadow-[0_10px_24px_rgba(232,50,123,0.18)]">
              <PawPrint size={21} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase text-[#e8327b]">
                Agenda Pet Shop
              </p>
              <h1 className="text-xl font-extrabold text-[#006c73]">
                {companyName}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
