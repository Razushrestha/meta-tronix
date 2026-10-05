"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const allowed = !!user && user.role?.toLowerCase() === "admin";

  useEffect(() => {
    if (!loading && !allowed) {
      router.replace("/admin/login");
    }
  }, [loading, allowed, router]);

  if (loading || !allowed) {
    return (
      <div className="flex h-screen w-full items-center justify-center gap-2 bg-white text-sm text-brand-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {loading ? "Checking session…" : "Redirecting…"}
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-white">{children}</div>
  );
}
