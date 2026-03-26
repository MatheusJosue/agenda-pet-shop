"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  Scissors,
  UserCircle,
  HelpCircle,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const STORAGE_KEY = "agenda-pet-shop:sidebar-collapsed";

const mainNavItems = [
  { href: "/app", icon: Home, label: "Início" },
  { href: "/app/agendamentos", icon: Calendar, label: "Agenda" },
  { href: "/app/clientes", icon: Users, label: "Clientes" },
  { href: "/app/servicos", icon: Scissors, label: "Serviços" },
];

const baseNavItems = [
  { href: "/app/perfil", icon: UserCircle, label: "Perfil" },
  { href: "/app/ajuda", icon: HelpCircle, label: "Ajuda" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "true";
    }
    return false;
  });

  // Save to localStorage when collapsed state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  const width = collapsed ? "w-20" : "w-64";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function getInitials(name?: string): string {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // Get user data from localStorage (saved during login)
  const getUserData = () => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("user_name") || "";
      const email = localStorage.getItem("user_email") || "";
      return { name, email };
    }
    return { name: "", email: "" };
  };

  const userData = getUserData();

  return (
    <aside
      className={cn(
        "hidden xl:flex flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-br from-purple-950 via-fuchsia-950/30 to-zinc-950 backdrop-blur-md border-r border-white/10 transition-all duration-300 ease-in-out z-50",
        width,
      )}
    >
      {/* Header com Logo + Toggle */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
            <span className="text-lg">🐾</span>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-white whitespace-nowrap">
              Pet Shop
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
        aria-label="Navegação principal"
      >
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
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

        {/* Divider */}
        <div className="my-4 border-t border-white/10" />

        <ul className="space-y-1">
          {baseNavItems.map((item) => (
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/30 flex-shrink-0">
            {getInitials(userData.name)}
          </div>

          {/* User Info - only when expanded */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {userData.name || "Usuário"}
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
            ? "bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border-l-4 border-purple-400 text-white"
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
