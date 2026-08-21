"use client";

import type { ReactNode } from "react";

interface TopbarProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export default function Topbar({ title, description, action }: TopbarProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-brand-border bg-white px-8 py-5">
      <div>
        <h1 className="text-lg font-semibold text-brand-navy">{title}</h1>
        <p className="mt-0.5 text-sm text-brand-muted">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </header>
  );
}
