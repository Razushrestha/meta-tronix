const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  problem: string;
  features: string[];
  technologies: string[];
  iconUrl?: string;
  previewUrl?: string;
  productUrl?: string;
  featured: boolean;
};

type ApiProduct = Omit<PublicProduct, "id"> & { _id?: string; id?: string };

// Backend stores "/uploads/products/x.png"; the browser needs the full URL.
export function imageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

// Only allow http(s) links, so a bad value can't become a javascript: URL.
export function safeUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return /^https?:\/\//i.test(url) ? url : undefined;
}

export async function getActiveProducts(): Promise<PublicProduct[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/products`, {
      cache: "no-store",
    });
    if (!res.ok) return [];

    const json = await res.json();
    const list: ApiProduct[] = json.data ?? json;
    if (!Array.isArray(list)) return [];

    return list.map((p) => ({
      ...p,
      id: p._id ?? p.id ?? "",
      features: p.features ?? [],
      technologies: p.technologies ?? [],
    }));
  } catch {
    return [];
  }
}
