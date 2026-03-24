"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Ticket,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const STORAGE_KEY = "agenda-pet-shop:admin-sidebar-collapsed";

const adminNavItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/empresas", icon: Building, label: "Empresas" },
  { href: "/admin/convites", icon: Ticket, label: "Convites" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed(!collapsed);
  const width = collapsed ? "w-20" : "w-64";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  // Get user data from localStorage
  const getUserData = () => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name") || "Admin";
      const email = localStorage.getItem("user_email") || "admin@system.com";
      return { name, email };
    }
    return { name: "Admin", email: "" };
  };

  const userData = getUserData();

  return (
    <aside
      className={cn(
        "hidden xl:flex flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-br from-indigo-950 via-purple-950/50 to-zinc-950 backdrop-blur-md border-r border-white/10 transition-all duration-300 ease-in-out z-50",
        width,
      )}
    >
      {/* Header com Logo + Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <LayoutDashboard size={22} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              Admin Panel
            </span>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-purple-200/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="Navegação admin"
      >
        <ul className="space-y-1">
          {adminNavItems.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href}
                collapsed={collapsed}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section - Bottom */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-indigo-500/30 flex-shrink-0">
            AD
          </div>

          {/* User Info - only when expanded */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userData.name}
              </p>
              <p className="text-xs text-purple-200/60 truncate">{userData.email}</p>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            aria-label="Sair"
            className={cn(
              "flex items-center justify-center rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors",
              collapsed ? "w-9 h-9" : "w-8 h-8",
            )}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <div className="group relative flex items-center">
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative",
          active
            ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-l-4 border-indigo-400 text-white"
            : "text-purple-200/60 hover:text-white hover:bg-white/10",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
      </Link>

      {/* Tooltip - only when collapsed */}
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900/95 backdrop-blur-xl text-white text-sm rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] shadow-lg border border-white/10 pointer-events-none">
          {label}
          {/* Arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-zinc-900" />
        </div>
      )}
    </div>
  );
}
