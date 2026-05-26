"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/empresas", icon: Building, label: "Empresas" },
  { href: "/admin/convites", icon: Ticket, label: "Convites" },
];

export function AdminBottomNavigation() {
  const pathname = usePathname();

  // Don't show on detail pages
  const shouldHide = pathname.match(/\/[a-f0-9-]{36}$/);
  if (shouldHide) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex xl:hidden">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mx-3 mb-2 rounded-2xl border border-[rgba(232,50,123,0.22)] bg-[#fff9fb]/94 shadow-[0_-8px_24px_rgba(33,54,58,0.08)] backdrop-blur-2xl">
          <div className="flex h-[68px] items-center justify-around px-2">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex flex-1 items-center justify-center"
                >
                  <div
                    className={cn(
                      "flex min-w-[72px] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 transition-all duration-200",
                      isActive
                        ? "bg-[#ffe0ec] text-[#bf185d]"
                        : "text-[#006c73] hover:bg-[#fff1f6] hover:text-[#bf185d]",
                    )}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 2}
                      className="transition-colors"
                    />
                    <span className="text-[10px] font-extrabold">
                      {tab.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
