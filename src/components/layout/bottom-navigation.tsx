"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Scissors, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/app", icon: Home, label: "Início" },
  { href: "/app/agendamentos", icon: Calendar, label: "Agenda" },
  { href: "/app/clientes", icon: Users, label: "Clientes" },
  { href: "/app/servicos", icon: Scissors, label: "Serviços" },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex xl:hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-3 mb-2 rounded-2xl border border-[rgba(232,50,123,0.22)] bg-[#fff9fb]/94 shadow-[0_-8px_24px_rgba(33,54,58,0.08)] backdrop-blur-2xl">
          <div className="flex h-[68px] items-center justify-around px-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <Link key={tab.href} href={tab.href} className="flex flex-1 items-center justify-center">
                  <span
                    className={cn(
                      "flex min-w-[70px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                      isActive
                        ? "bg-[#ffe0ec] text-[#bf185d]"
                        : "text-[#006c73] hover:bg-[#fff1f6] hover:text-[#bf185d]",
                    )}
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[11px] font-extrabold">{tab.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
