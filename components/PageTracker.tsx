"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    apiFetch("/api/v1/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
