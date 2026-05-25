"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  ChevronsLeft,
  ChevronsRight,
  HelpCircle,
  Home,
  LogOut,
  PawPrint,
  Scissors,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const STORAGE_KEY = "agenda-pet-shop:sidebar-collapsed";

const mainNavItems = [
  { href: "/app", icon: Home, label: "Iní­cio" },
  { href: "/app/agendamentos", icon: Calendar, label: "Agenda" },
  { href: "/app/clientes", icon: Users, label: "Clientes" },
  { href: "/app/servicos", icon: Scissors, label: "Serviços" },
];

const accountNavItems = [
  { href: "/app/perfil", icon: UserCircle, label: "Perfil" },
  { href: "/app/ajuda", icon: HelpCircle, label: "Ajuda" },
];

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function Sidebar({
  companyName,
  user,
}: {
  companyName: string;
  user: {
    name?: string;
    email?: string;
  };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const width = collapsed ? "w-20" : "w-64";

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <aside
      className={cn(
        "hidden xl:flex fixed inset-y-0 left-0 z-50 flex-col border-r transition-all duration-300",
        "bg-[#fff9fb]/95 backdrop-blur-2xl border-[rgba(232,50,123,0.22)] shadow-[12px_0_32px_rgba(33,54,58,0.08)]",
        width,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(232,50,123,0.18)] px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e8327b] shadow-[0_10px_24px_rgba(232,50,123,0.22)]">
            <PawPrint size={21} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block truncate text-lg font-extrabold text-[#006c73]">
                {capitalize(companyName)}
              </span>
              <span className="block truncate text-xs font-bold text-[#68797d]">
                Sistema de gestão
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-[#006c73] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      <nav
        className="flex-1 overflow-y-auto px-3 py-4"
        aria-label="NavegaÃ§Ã£o principal"
      >
        <NavSection
          items={mainNavItems}
          pathname={pathname}
          collapsed={collapsed}
        />
        <div className="my-4 border-t border-[rgba(232,50,123,0.18)]" />
        <NavSection
          items={accountNavItems}
          pathname={pathname}
          collapsed={collapsed}
        />
      </nav>

      <div className="border-t border-[rgba(232,50,123,0.18)] p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-white/72 p-2",
            collapsed && "justify-center",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006c73] text-sm font-extrabold text-white">
            {getInitials(companyName)}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[#21363a]">
                {capitalize(companyName)}
              </p>
              <p className="truncate text-xs font-semibold text-[#68797d]">
                {user.name || user.email || "Conta da empresa"}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className={cn(
              "flex items-center justify-center rounded-xl text-[#bf185d] transition-colors hover:bg-[#ffe0ec]",
              collapsed ? "h-9 w-9" : "h-8 w-8",
            )}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  items,
  pathname,
  collapsed,
}: {
  items: Array<{ href: string; icon: LucideIcon; label: string }>;
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
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
  icon: LucideIcon;
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
          "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200",
          active
            ? "border-[rgba(232,50,123,0.28)] bg-[#ffe0ec] text-[#bf185d] shadow-[0_8px_18px_rgba(232,50,123,0.10)]"
            : "border-transparent text-[#006c73] hover:border-[rgba(232,50,123,0.18)] hover:bg-white hover:text-[#bf185d]",
          collapsed ? "justify-center" : "justify-start",
        )}
      >
        <Icon size={22} strokeWidth={active ? 2.5 : 2} />
        {!collapsed && <span className="text-sm font-extrabold">{label}</span>}
      </Link>

      {collapsed && (
        <div className="invisible absolute left-full z-[60] ml-3 whitespace-nowrap rounded-lg border border-[rgba(232,50,123,0.24)] bg-white px-3 py-1.5 text-sm font-bold text-[#21363a] opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100">
          {label}
        </div>
      )}
    </div>
  );
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
