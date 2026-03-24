"use client";

import { Bell, Settings } from "lucide-react";

interface DesktopHeaderProps {
  user?: {
    name?: string;
    email?: string;
  };
  sidebarCollapsed?: boolean;
  companyName: string;
}

export function DesktopHeader({ user, sidebarCollapsed, companyName = "Agenda Pet Shop" }: DesktopHeaderProps) {
  return (
    <header className="hidden xl:flex sticky top-0 z-40 w-full bg-gradient-to-br from-purple-950 via-fuchsia-950/30 to-zinc-950 backdrop-blur-md border-b border-white/10">
      <div className="flex-1 flex items-center justify-center px-6 py-3">
        <div className="flex items-center justify-between w-full max-w-12xl">
          {/* Left: Company Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-lg">🐾</span>
            </div>
            <h1 className="text-xl font-bold text-white">{companyName}</h1>
          </div>

          {/* Right: Notifications & Settings */}
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Bell size={20} />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
