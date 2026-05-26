"use client";

import { ReactNode, useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminDesktopHeader } from "./admin-desktop-header";
import { AdminBottomNavigation } from "./admin-bottom-navigation";
import { AdminMobileHeader } from "./admin-mobile-header";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutProps) {
  const sidebarStorageKey = "agenda-pet-shop:admin-sidebar-collapsed";
  const sidebarStorageEvent = "agenda-pet-shop:admin-sidebar-collapsed-change";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(sidebarStorageKey) === "true";
  });

  // Sincronizar com mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(sidebarStorageKey);
      if (saved !== null) {
        setSidebarCollapsed(saved === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(sidebarStorageEvent, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(sidebarStorageEvent, handleStorageChange);
    };
  }, [sidebarStorageEvent]);

  const marginClass = sidebarCollapsed ? "ml-20" : "ml-64";

  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden xl:flex h-screen">
        <AdminSidebar />
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ${marginClass}`}
        >
          <AdminDesktopHeader />
          <main className="flex-1 overflow-auto bg-[linear-gradient(135deg,rgba(255,249,251,0.96),rgba(255,224,236,0.82))]">
            <div className="h-full">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="xl:hidden min-h-screen bg-[linear-gradient(135deg,rgba(255,249,251,0.96),rgba(255,224,236,0.82))] pb-16">
        <AdminMobileHeader />
        <div className="px-4 py-6">{children}</div>
        <AdminBottomNavigation />
      </div>
    </>
  );
}
