import type { CareerListing } from "@/components/dashboard/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalize = (c: CareerListing & { _id?: string }): CareerListing => ({
  ...c,
  id: c.id ?? c._id ?? "",
});

// A role is public only if it's "open" and its deadline hasn't passed.
function isOpen(c: CareerListing): boolean {
  if (c.status !== "open") return false;
  if (!c.applicationDeadline) return true;
  const endOfDeadlineDay =
    new Date(c.applicationDeadline).getTime() + 24 * 60 * 60 * 1000;
  return endOfDeadlineDay > Date.now();
}

export async function getOpenCareers(): Promise<CareerListing[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/careers/open`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list = json.data ?? json;
    return Array.isArray(list) ? list.map(normalize).filter(isOpen) : [];
  } catch {
    return [];
  }
}

export async function getOpenCareerById(
  id: string,
): Promise<CareerListing | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) return null; // not a valid Mongo id
  try {
    const res = await fetch(`${API_BASE}/api/v1/careers/open/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const career = normalize(json.data ?? json);
    return isOpen(career) ? career : null;
  } catch {
    return null;
  }
}

export function formatSalary(c: CareerListing): string | null {
  if (!c.salary || (!c.salary.min && !c.salary.max)) return null;
  const fmt = (n: number) => n.toLocaleString("en-US");
  return `${c.salary.currency} ${fmt(c.salary.min)} – ${fmt(c.salary.max)}`;
}

export function formatDeadline(c: CareerListing): string | null {
  if (!c.applicationDeadline) return null;
  return new Date(c.applicationDeadline).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
