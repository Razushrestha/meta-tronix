"use client";

import { useEffect, useState } from "react";
import { Newspaper, Package, Users, Briefcase, Loader2 } from "lucide-react";
import Sidebar, { DashboardTab } from "./Sidebar";
import Topbar from "./Topbar";
import StatCard from "./StatCard";
import VisitsChart from "./VisitsChart";
import BlogSection from "./sections/BlogSection";
import ProductsSection from "./sections/ProductsSection";
import TeamsSection from "./sections/TeamsSection";
import CareersSection from "./sections/CareersSection";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const TAB_META: Record<DashboardTab, { title: string; description: string }> = {
  overview: {
    title: "Overview",
    description: "A snapshot of what's happening across the site.",
  },
  blog: { title: "Blog", description: "Write, edit, and publish articles." },
  products: { title: "Products", description: "Manage your product catalog." },
  teams: { title: "Team", description: "Manage team member profiles." },
  careers: { title: "Careers", description: "Manage open roles and listings." },
};

interface OverviewCounts {
  totalBlogs: number;
  totalTeamMembers: number;
  totalProducts: number;
  totalCareers: number;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<DashboardTab>("overview");
  const [counts, setCounts] = useState<OverviewCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const meta = TAB_META[tab];

  useEffect(() => {
    if (tab !== "overview") return;

    let cancelled = false;

    async function fetchOverview() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/v1/analytics/admin/overview`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to load overview");

        const data = await res.json();
        if (!cancelled) setCounts(data.data ?? data);
      } catch {
        if (!cancelled) setError("Couldn't load overview stats.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOverview();

    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <div className="flex h-full w-full overflow-hidden bg-dot-grid">
      <Sidebar active={tab} onChange={setTab} />

      <div className="flex min-w-0 flex-1 flex-col pt-16 md:pt-0">
        <Topbar title={meta.title} description={meta.description} />

        <main className="flex-1 overflow-y-auto px-8 py-6">
          {tab === "overview" && (
            <div className="space-y-6">
              {error && (
                <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </p>
              )}

              {loading ? (
                <div className="flex items-center justify-center gap-2 rounded-xl border border-brand-border bg-white py-16 text-sm text-brand-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading overview…
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Blog posts"
                    value={counts?.totalBlogs ?? 0}
                    icon={Newspaper}
                    hint="Published & drafts"
                  />
                  <StatCard
                    label="Products"
                    value={counts?.totalProducts ?? 0}
                    icon={Package}
                    hint="Active catalog"
                  />
                  <StatCard
                    label="Team members"
                    value={counts?.totalTeamMembers ?? 0}
                    icon={Users}
                    hint="Across departments"
                  />
                  <StatCard
                    label="Open roles"
                    value={counts?.totalCareers ?? 0}
                    icon={Briefcase}
                    hint="All career listings"
                  />
                </div>
              )}

              <VisitsChart />
            </div>
          )}

          {tab === "blog" && <BlogSection />}
          {tab === "products" && <ProductsSection />}
          {tab === "teams" && <TeamsSection />}
          {tab === "careers" && <CareersSection />}
        </main>
      </div>
    </div>
  );
}
