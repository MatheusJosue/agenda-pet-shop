"use client";

import { useRouter } from "next/navigation";
import { Menu, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { logout } from "@/lib/actions/auth";

export function AdminMobileHeader() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <>
      {/* Header */}
      <header className="xl:hidden sticky top-0 z-40 bg-gradient-to-br from-indigo-950 via-purple-950/50 to-zinc-950 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-purple-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <LayoutDashboard size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-white">Admin Panel</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 xl:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={cn(
          "fixed left-0 top-0 bottom-0 z-50 xl:hidden transition-transform duration-300",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <AdminSidebar />
      </div>
    </>
  );
}

import { cn } from "@/lib/utils";
