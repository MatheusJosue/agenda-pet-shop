"use client";

import { useState } from "react";
import { Menu, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppDrawer } from "./app-drawer";

interface AppHeaderProps {
  companyName: string;
  user: {
    name?: string;
    email?: string;
  };
}

export function AppHeader({ companyName, user }: AppHeaderProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="flex xl:hidden sticky top-0 z-30 w-full">
        <div className="w-full px-3 pt-2">
          <div className="bg-[#fff9fb]/94 backdrop-blur-2xl rounded-2xl border border-[rgba(232,50,123,0.22)] shadow-[0_8px_24px_rgba(33,54,58,0.08)]">
            <div className="flex items-center justify-between px-3 py-2.5 gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 flex-shrink-0 text-[#006c73] hover:bg-[#ffe0ec]"
                aria-label="Abrir menu"
              >
                <Menu size={24} />
              </Button>

              <div className="flex items-center justify-center gap-2 min-w-0 flex-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ffe0ec]">
                  <PawPrint size={17} className="text-[#e8327b] flex-shrink-0" />
                </span>
                <h1 className="text-base font-extrabold text-[#21363a] truncate">
                  {companyName}
                </h1>
              </div>

              <div className="w-9 flex-shrink-0" />
            </div>
          </div>
        </div>
      </header>

      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        companyName={companyName}
        user={user}
      />
    </>
  );
}
