"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/api";

type Period = "day" | "week" | "month" | "year";

interface Summary {
  totalVisits: number;
  uniqueVisitors: number;
  topCountries: { country: string; count: number }[];
  topPages: { path: string; count: number }[];
  trend: { date: string; count: number }[];
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "24h" },
  { value: "week", label: "7d" },
  { value: "month", label: "30d" },
  { value: "year", label: "1y" },
];

export default function VisitsChart() {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(
          `/api/v1/analytics/admin/summary?period=${period}`,
        );
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.message ?? "Failed to load analytics");
        }
        const json = await res.json();
        if (!cancelled) setData(json.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error && err.message !== "Failed to fetch"
              ? err.message
              : "Couldn't load analytics.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  // Shorten bucket labels for the x-axis
  const formatTick = (v: string) =>
    period === "day" ? v.slice(11, 16) : period === "year" ? v : v.slice(5);

  return (
    <div className="rounded-xl border border-brand-border bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Site visits</h2>
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1 text-sm ${
                period === p.value
                  ? "bg-white font-medium shadow-sm"
                  : "text-brand-muted"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading && !data ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading analytics…
        </div>
      ) : data ? (
        <div className={loading ? "opacity-60 transition-opacity" : ""}>
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-brand-muted">Total visits</p>
              <p className="text-2xl font-semibold">{data.totalVisits}</p>
            </div>
            <div>
              <p className="text-sm text-brand-muted">Unique visitors</p>
              <p className="text-2xl font-semibold">{data.uniqueVisitors}</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatTick}
                  fontSize={12}
                />
                <YAxis allowDecimals={false} fontSize={12} width={32} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Visits"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <ListBlock
              title="Top countries"
              rows={data.topCountries.map((c) => ({
                label: c.country,
                count: c.count,
              }))}
            />
            <ListBlock
              title="Top pages"
              rows={data.topPages.map((p) => ({
                label: p.path,
                count: p.count,
              }))}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ListBlock({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-brand-muted">No data yet.</p>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => (
            <li key={r.label} className="flex justify-between text-sm">
              <span className="truncate pr-2">{r.label}</span>
              <span className="text-brand-muted">{r.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
