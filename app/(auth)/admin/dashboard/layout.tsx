"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role?.toLowerCase() !== "admin")) {
      router.replace("/admin/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null; // or a loading spinner

  return (
    <div className="h-screen w-full overflow-hidden bg-white">{children}</div>
  );
}
