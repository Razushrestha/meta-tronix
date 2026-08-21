"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
          credentials: "include",
        });

        if (cancelled) return;

        if (res.ok) {
          setChecked(true);
        } else {
          router.replace("/admin/login");
        }
      } catch {
        if (!cancelled) router.replace("/admin/login");
      }
    }

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) return null; // or a loading spinner

  return (
    <div className="h-screen w-full overflow-hidden bg-white">{children}</div>
  );
}
