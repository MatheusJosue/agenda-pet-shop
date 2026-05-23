"use client";

import { ReactNode, useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { DesktopHeader } from "./desktop-header";

interface AppLayoutProps {
  children: ReactNode;
  companyName: string;
  user: {
    name?: string;
    email?: string;
  };
}

export function AppLayout({ children, companyName, user }: AppLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("agenda-pet-shop:sidebar-collapsed") === "true";
  });

  // Sincronizar com mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("agenda-pet-shop:sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Também checar em intervalos curtos para mudanças na mesma aba
    const interval = setInterval(handleStorageChange, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const marginClass = sidebarCollapsed ? "ml-20" : "ml-64";

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden xl:flex h-screen">
        <Sidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${marginClass}`}
        >
          <DesktopHeader
            user={user}
            sidebarCollapsed={sidebarCollapsed}
            companyName={companyName}
          />
          <main className="flex-1 overflow-auto bg-[linear-gradient(135deg,rgba(255,249,251,0.96),rgba(255,224,236,0.82))]">
            <div className="h-full">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Layout - render children directly (they contain AppHeader, etc.) */}
      <div className="xl:hidden">{children}</div>
    </>
  );
}
