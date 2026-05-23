"use client";

import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import { Calendar, HelpCircle, Home, LogOut, PawPrint, Scissors, User, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  user: {
    name?: string;
    email?: string;
  };
}

const navItems = [
  { label: "Início", href: "/app", icon: Home },
  { label: "Agenda", href: "/app/agendamentos", icon: Calendar },
  { label: "Clientes", href: "/app/clientes", icon: Users },
  { label: "Serviços", href: "/app/servicos", icon: Scissors },
  { label: "Perfil", href: "/app/perfil", icon: User },
  { label: "Ajuda", href: "/app/ajuda", icon: HelpCircle },
];

export function AppDrawer({ isOpen, onClose, companyName, user }: AppDrawerProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  function navigate(href: string) {
    router.push(href);
    onClose();
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#21363a]/35 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-[86%] max-w-sm border-r border-[rgba(232,50,123,0.24)] bg-[#fff9fb] shadow-2xl transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[rgba(232,50,123,0.18)] p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e8327b]">
                <PawPrint size={21} className="text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-extrabold text-[#006c73]">
                  {companyName}
                </h2>
                <p className="text-xs font-bold text-[#68797d]">
                  Onde seu pet se sente em casa
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-[#006c73] transition-colors hover:bg-[#ffe0ec] hover:text-[#bf185d]"
              aria-label="Fechar menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-4 py-4">
            <div className="rounded-2xl border border-[rgba(232,50,123,0.18)] bg-white/80 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#006c73] text-sm font-extrabold text-white">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-[#21363a]">
                    {user?.name || "Usuário"}
                  </p>
                  <p className="truncate text-xs font-semibold text-[#68797d]">
                    {user?.email || "usuario@email.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-2">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-sm font-extrabold transition-all",
                        active
                          ? "border-[rgba(232,50,123,0.28)] bg-[#ffe0ec] text-[#bf185d]"
                          : "border-transparent text-[#006c73] hover:border-[rgba(232,50,123,0.18)] hover:bg-white hover:text-[#bf185d]",
                      )}
                    >
                      <Icon size={19} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-[rgba(232,50,123,0.18)] p-4 pb-24">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[rgba(232,50,123,0.24)] px-4 py-3 text-sm font-extrabold text-[#bf185d] transition-colors hover:bg-[#ffe0ec]"
            >
              <LogOut size={18} />
              Sair da conta
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function getInitials(name?: string): string {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
