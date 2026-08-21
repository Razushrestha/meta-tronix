"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

type Period = "day" | "week" | "month" | "year";

interface Visit {
  createdAt: string;
  country?: string;
}

interface Bucket {
  label: string;
  count: number;
}

interface CountryCount {
  country: string;
  count: number;
}

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "day", label: "24 hours" },
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
  { value: "year", label: "12 months" },
];

function getRange(period: Period): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();

  if (period === "day") from.setDate(from.getDate() - 1);
  if (period === "week") from.setDate(from.getDate() - 7);
  if (period === "month") from.setDate(from.getDate() - 30);
  if (period === "year") from.setFullYear(from.getFullYear() - 1);

  return { from, to };
}

function bucketVisits(visits: Visit[], period: Period): Bucket[] {
  const buckets = new Map<string, number>();

  function keyFor(date: Date): string {
    if (period === "day") {
      return date.toLocaleTimeString([], { hour: "2-digit" });
    }
    if (period === "year") {
      return date.toLocaleDateString([], { month: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }

  const { from, to } = getRange(period);
  const cursor = new Date(from);

  while (cursor <= to) {
    buckets.set(keyFor(cursor), 0);
    if (period === "day") cursor.setHours(cursor.getHours() + 1);
    else if (period === "year") cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }

  for (const visit of visits) {
    const key = keyFor(new Date(visit.createdAt));
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([label, count]) => ({
    label,
    count,
  }));
}

function topCountries(visits: Visit[], limit = 5): CountryCount[] {
  const counts = new Map<string, number>();

  for (const visit of visits) {
    const country = visit.country?.trim() || "Unknown";
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function VisitsChart() {
  const [period, setPeriod] = useState<Period>("week");
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchVisits() {
      setLoading(true);
      setError("");
      try {
        const { from, to } = getRange(period);
        const params = new URLSearchParams({
          from: from.toISOString(),
          to: to.toISOString(),
        });

        const res = await fetch(
          `${API_BASE}/api/v1/analytics/admin/visits?${params}`,
          { credentials: "include" },
        );

        if (res.status === 404) {
          setVisits([]);
          return;
        }

        if (!res.ok) throw new Error("Failed to load visits");

        const data = await res.json();
        setVisits(data.data ?? data);
      } catch {
        setError("Couldn't load visit data.");
      } finally {
        setLoading(false);
      }
    }

    fetchVisits();
  }, [period]);

  const buckets = useMemo(() => bucketVisits(visits, period), [visits, period]);
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const totalVisits = visits.length;

  const countries = useMemo(() => topCountries(visits), [visits]);
  const maxCountryCount = Math.max(1, ...countries.map((c) => c.count));

  return (
    <div className="rounded-xl border border-brand-border bg-white p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-brand-navy">Site visits</p>
          <p className="text-xs text-brand-muted">
            {loading ? "Loading…" : `${totalVisits} visits in range`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Top countries — compact horizontal bars, sits beside the period toggle */}
          {!loading && countries.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
              {countries.map((c) => (
                <div
                  key={c.country}
                  className="group relative flex flex-col items-center gap-1"
                  title={`${c.country}: ${c.count}`}
                >
                  <span className="text-[10px] font-medium text-brand-muted">
                    {c.count}
                  </span>
                  <div className="h-8 w-2.5 overflow-hidden rounded-sm bg-slate-200">
                    <div
                      className="w-full rounded-sm bg-cyan-400 transition-all group-hover:bg-cyan-500"
                      style={{
                        height: `${Math.max(
                          10,
                          (c.count / maxCountryCount) * 100,
                        )}%`,
                        marginTop: "auto",
                      }}
                    />
                  </div>
                  <span className="max-w-[48px] truncate text-[10px] text-brand-muted">
                    {c.country}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-1 rounded-lg bg-slate-50 p-1">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  period === opt.value
                    ? "bg-white text-brand-navy shadow-sm"
                    : "text-brand-muted hover:text-brand-navy"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-brand-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading chart…
        </div>
      ) : buckets.length === 0 ? (
        <p className="py-16 text-center text-sm text-brand-muted">
          No visit data for this range.
        </p>
      ) : (
        <div className="flex h-40 items-end gap-1.5">
          {buckets.map((bucket) => (
            <div
              key={bucket.label}
              className="group relative flex flex-1 flex-col items-center justify-end"
            >
              <div className="pointer-events-none absolute -top-7 hidden rounded-md bg-brand-navy px-2 py-1 text-xs text-white group-hover:block">
                {bucket.count}
              </div>
              <div
                className="w-full rounded-t-sm bg-cyan-400 transition-all hover:bg-cyan-500"
                style={{
                  height: `${Math.max(4, (bucket.count / maxCount) * 100)}%`,
                }}
              />
              <span className="mt-1.5 w-full truncate text-center text-[10px] text-brand-muted">
                {bucket.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
