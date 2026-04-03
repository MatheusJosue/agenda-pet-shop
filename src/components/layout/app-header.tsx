"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
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
        {/* Glassmorphism header with bottom rounded corners */}
        <div className="relative w-full">
          <div className="mx-3 mt-2 bg-[#2b2041]/70 backdrop-blur-2xl rounded-b-3xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.05)]">
            {/* Subtle inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f183ff]/5 to-transparent rounded-b-3xl pointer-events-none" />

            {/* Header content */}
            <div className="relative flex items-center justify-between px-4 py-4 gap-3">
              {/* Left: Menu */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="p-2 text-white hover:bg-white/10 hover:text-white flex-shrink-0"
              >
                <Menu size={24} />
              </Button>

              {/* Center: Brand/Logo */}
              <div className="flex items-center justify-center min-w-0 flex-1">
                <h1 className="text-sm font-semibold text-white truncate tracking-tight">
                  {companyName}
                </h1>
              </div>

              {/* Right: Spacer for balance (no icons) */}
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
