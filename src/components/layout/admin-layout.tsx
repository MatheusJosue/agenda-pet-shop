"use client";

import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminBottomNavigation } from "./admin-bottom-navigation";
import { AdminMobileHeader } from "./admin-mobile-header";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("agenda-pet-shop:admin-sidebar-collapsed");
    if (saved !== null) {
      setSidebarCollapsed(saved === "true");
    }
  }, []);

  // Sincronizar com mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("agenda-pet-shop:admin-sidebar-collapsed");
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
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
        <AdminSidebar />
        <div className={`flex-1 flex flex-col transition-all duration-300 ${marginClass}`}>
          <main className="flex-1 overflow-auto bg-gradient-to-br from-zinc-950 via-indigo-950/20 to-zinc-950">
            <div className="h-full px-6 py-8">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden min-h-screen bg-gradient-to-br from-zinc-950 via-indigo-950/20 to-zinc-950 pb-16">
        <AdminMobileHeader />
        <div className="px-4 py-6">{children}</div>
        <AdminBottomNavigation />
      </div>
    </>
  );
}
