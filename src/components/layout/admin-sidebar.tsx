"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building,
  ChevronsLeft,
  ChevronsRight,
  CircleDot,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Ticket,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";

const STORAGE_KEY = "agenda-pet-shop:admin-sidebar-collapsed";
const STORAGE_EVENT = "agenda-pet-shop:admin-sidebar-collapsed-change";

const navSections = [
  {
    title: "Sistema",
    items: [
      { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/empresas", icon: Building, label: "Empresas" },
      { href: "/admin/convites", icon: Ticket, label: "Convites" },
    ],
  },
];

export function AdminSidebar({
  mobile = false,
  embedded = false,
  onNavigate,
  onClose,
}: {
  mobile?: boolean;
  embedded?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, [collapsed]);

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  const width = collapsed ? "w-20" : "w-64";
  const userData = getUserData();
  const showText = mobile || !collapsed;

  return (
    <aside
      className={cn(
        "flex-col border-r transition-all duration-300",
        "border-[rgba(232,50,123,0.22)] bg-[#fff9fb] shadow-[12px_0_32px_rgba(33,54,58,0.08)]",
        mobile && embedded
          ? "flex h-full w-full"
        : mobile
          ? "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm"
          : ["fixed inset-y-0 left-0 z-50 hidden xl:flex bg-[#fff9fb]/95 backdrop-blur-2xl", width],
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(232,50,123,0.18)] p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8327b] shadow-[0_10px_24px_rgba(232,50,123,0.22)]">
            <ShieldCheck size={21} className="text-white" />
          </div>
          {showText && (
            <div className="min-w-0">
              <span className="block truncate text-base font-extrabold text-[#006c73]">
                Admin master
              </span>
              <span className="block truncate text-xs font-bold text-[#68797d]">
                Gestao multiempresa
              </span>
            </div>
          )}
        </div>

        {!mobile && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#006c73] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
          >
            {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          </button>
        )}
        {mobile && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#006c73] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {showText && (
        <div className="px-4 py-4">
          <div className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#006c73] text-sm font-extrabold text-white">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#21363a]">
                  {userData.name}
                </p>
                <p className="truncate text-xs font-semibold text-[#68797d]">
                  {userData.email}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#dff7f4] px-3 py-2 text-xs font-extrabold text-[#006c73]">
              <CircleDot size={14} />
              Acesso global do sistema
            </div>
          </div>
        </div>
      )}

      <nav
        className="flex-1 overflow-y-auto px-3 py-2"
        aria-label="Navegacao admin"
      >
        <div className="space-y-4">
          {navSections.map((section) => (
            <NavSection
              key={section.title}
              title={section.title}
              items={section.items}
              pathname={pathname}
              collapsed={!showText}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      </nav>

      <div className="border-t border-[rgba(232,50,123,0.18)] p-4 pb-24 xl:pb-4">
        <div
          className={cn(
            "flex items-center gap-3 rounded-2xl bg-white/72 p-2",
            !showText && "justify-center",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#006c73] text-sm font-extrabold text-white">
            AD
          </div>

          {showText && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-[#21363a]">
                {userData.name}
              </p>
              <p className="truncate text-xs font-semibold text-[#68797d]">
                {userData.email}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sair"
            className={cn(
              "flex items-center justify-center rounded-xl text-[#bf185d] transition-colors hover:bg-[#ffe0ec]",
              !showText ? "h-9 w-9" : "h-9 px-3",
            )}
          >
            <LogOut size={18} />
            {showText && <span className="ml-2 text-sm font-extrabold">Sair</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavSection({
  title,
  items,
  pathname,
  collapsed,
  onNavigate,
}: {
  title: string;
  items: Array<{ href: string; icon: LucideIcon; label: string }>;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <section aria-label={title}>
      {!collapsed && (
        <h4 className="mb-1 px-3 text-[0.62rem] font-bold uppercase text-[#9aa9ac]">
          {title}
        </h4>
      )}
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item.href}>
            <NavItem
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <div className="group relative flex items-center">
      <Link
        href={href}
        onClick={onNavigate}
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

function getUserData() {
  if (typeof window !== "undefined") {
    return {
      name: localStorage.getItem("user_name") || "Admin",
      email: localStorage.getItem("user_email") || "admin@system.com",
    };
  }

  return { name: "Admin", email: "" };
}
