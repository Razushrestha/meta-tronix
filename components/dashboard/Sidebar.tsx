"use client";

import { useState, useEffect, type ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Package,
  Users,
  Briefcase,
  LogOut,
  Menu,
} from "lucide-react";

export type DashboardTab =
  | "overview"
  | "blog"
  | "products"
  | "teams"
  | "careers";

const NAV_ITEMS: { key: DashboardTab; label: string; icon: ElementType }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "blog", label: "Blog", icon: Newspaper },
  { key: "products", label: "Products", icon: Package },
  { key: "teams", label: "Team", icon: Users },
  { key: "careers", label: "Careers", icon: Briefcase },
];

interface SidebarProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

export default function Sidebar({ active, onChange }: SidebarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Always start closed, and reset if restored from bfcache (back/forward nav)
  useEffect(() => {
    setMobileOpen(false);

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        setMobileOpen(false);
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  function handleLogout() {
    localStorage.removeItem("isAdmin");
    router.push("/login");
  }

  function handleNavClick(tab: DashboardTab) {
    onChange(tab);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger — fixed, opens drawer overlay */}
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label="Toggle menu"
        className="fixed left-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border bg-white shadow-sm md:hidden"
      >
        <Menu className="h-5 w-5 text-brand-navy" strokeWidth={1.75} />
      </button>

      {/* Backdrop — mobile only */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-200 md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full flex-col border-r border-brand-border bg-white transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          w-60
          md:static md:z-0 md:translate-x-0 md:transition-[width] md:duration-300
          ${collapsed ? "md:w-16" : "md:w-60"}`}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-navy text-sm font-semibold text-white">
              M
            </div>
            {!collapsed && (
              <span className="whitespace-nowrap text-sm font-semibold text-brand-navy">
                Meta-Tronix
              </span>
            )}
          </div>

          <button
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label="Toggle sidebar"
            className="hidden shrink-0 items-center justify-center rounded-lg p-1.5 text-brand-muted transition-colors hover:bg-slate-50 hover:text-brand-navy md:flex"
          >
            <Menu className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => handleNavClick(key)}
                title={collapsed ? label : undefined}
                className={`group relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-slate-50 font-medium text-brand-navy"
                    : "text-brand-muted hover:bg-slate-50 hover:text-brand-navy"
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-brand-navy" />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-brand-border bg-dot-grid px-5 py-4">
          {!collapsed && (
            <>
              <p className="text-xs text-brand-muted">Signed in as</p>
              <p className="text-sm font-medium text-brand-navy">Admin</p>
            </>
          )}
          <button
            onClick={handleLogout}
            title={collapsed ? "Log out" : undefined}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {!collapsed && "Log out"}
          </button>
        </div>
      </aside>
    </>
  );
}
