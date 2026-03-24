"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Settings } from "lucide-react";
import { useHeaderAction } from "./header-context";

interface DesktopHeaderProps {
  user?: {
    name?: string;
    email?: string;
  };
  sidebarCollapsed?: boolean;
}

function getPageTitle(pathname: string): { title: string; icon: string } {
  const routes: Record<string, { title: string; icon: string }> = {
    "/app": { title: "Início", icon: "🏠" },
    "/app/agendamentos": { title: "Agendamentos", icon: "📅" },
    "/app/agendamentos/novo": { title: "Novo Agendamento", icon: "🐾" },
    "/app/clientes": { title: "Clientes", icon: "👥" },
    "/app/clientes/novo": { title: "Novo Cliente", icon: "👤" },
    "/app/pets": { title: "Pets", icon: "🐾" },
    "/app/pets/novo": { title: "Novo Pet", icon: "🐾" },
    "/app/pacotes": { title: "Pacotes", icon: "📦" },
    "/app/pacotes/novo": { title: "Novo Tipo de Pacote", icon: "📦" },
    "/app/servicos": { title: "Serviços", icon: "✂️" },
    "/app/servicos/novo": { title: "Novo Serviço", icon: "✨" },
    "/app/perfil": { title: "Perfil", icon: "👤" },
    "/app/ajuda": { title: "Ajuda", icon: "❓" },
  };

  // Check for exact match first
  if (routes[pathname]) return routes[pathname];

  // Check for partial matches (detail pages, etc.)
  for (const [path, data] of Object.entries(routes)) {
    if (pathname.startsWith(path + "/")) return data;
  }

  return { title: "Pet Shop", icon: "🐾" };
}

export function DesktopHeader({ user }: DesktopHeaderProps) {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState(getPageTitle(pathname));
  const { action } = useHeaderAction();

  useEffect(() => {
    setPageTitle(getPageTitle(pathname));
  }, [pathname]);

  return (
    <header className="hidden xl:flex sticky top-0 z-40 w-full bg-gradient-to-br from-purple-950 via-fuchsia-950/30 to-zinc-950 backdrop-blur-md border-b border-white/10">
      <div className="flex-1 flex items-center justify-center px-6 py-3">
        <div className="flex items-center justify-between w-full max-w-12xl">
          {/* Left: Page Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-lg">{pageTitle.icon}</span>
            </div>
            <h1 className="text-xl font-bold text-white">{pageTitle.title}</h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Page Action (e.g., Add button) */}
            {action && <div className="flex-shrink-0">{action}</div>}

            {/* Notifications (placeholder) */}
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Bell size={20} />
            </button>

            {/* Settings (placeholder) */}
            <button className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
