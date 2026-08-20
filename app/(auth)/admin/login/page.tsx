"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Fill in both fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Couldn't reach the server. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dot-grid bg-mesh-light px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500">
            <span className="h-2 w-2 rounded-full bg-white" />
          </span>
          <span className="text-lg font-semibold text-brand-navy">
            Meta Tronix
          </span>
        </Link>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-brand-border bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_rgba(15,23,42,0.06)]"
        >
          <h1 className="mb-1 text-xl font-semibold text-brand-navy">
            Admin Login
          </h1>
          <p className="mb-6 text-sm text-brand-muted">
            Sign in to access your dashboard
          </p>

          {error && (
            <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <label className="mb-1 block text-sm font-medium text-brand-body">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@metatronix.com"
            disabled={loading}
            className="mb-4 w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm text-brand-navy outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50"
          />

          <label className="mb-1 block text-sm font-medium text-brand-body">
            Password
          </label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="••••••••"
            disabled={loading}
            className="mb-6 w-full rounded-lg border border-brand-border px-3 py-2.5 text-sm text-brand-navy outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brand-muted">
          <Link href="/" className="text-cyan-600 hover:underline">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}
