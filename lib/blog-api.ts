import { cache } from "react";
import type { BlogPost } from "@/lib/blog";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// What the backend sends
type ApiCategory = "Tech" | "Startup" | "AI" | "Design" | "IOT";

// What the site's UI expects ("IoT", not "IOT")
type UiCategory = BlogPost["category"];

// The existing UI type, plus the extra fields the detail page needs
export type PublicBlog = BlogPost & {
  content: string;
  author: string;
  imageUrl?: string;
};

type ApiBlog = {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  content: string;
  author: string;
  category: ApiCategory;
  imageUrl?: string;
  publishedAt?: string | null;
  createdAt: string;
  readMinutes?: number;
};

const CATEGORY_MAP: Record<ApiCategory, UiCategory> = {
  Tech: "Tech",
  Startup: "Startup",
  AI: "AI",
  Design: "Design",
  IOT: "IoT",
};

const GRADIENTS: Record<ApiCategory, string> = {
  Tech: "from-sky-400 to-cyan-500",
  Startup: "from-orange-400 to-amber-500",
  AI: "from-violet-500 to-fuchsia-500",
  Design: "from-pink-400 to-rose-500",
  IOT: "from-emerald-400 to-teal-500",
};

// Backend stores "/uploads/blogs/x.jpg"; the browser needs the full URL.
export function blogImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function makeHook(content: string): string {
  const flat = content.replace(/\s+/g, " ").trim();
  return flat.length > 160 ? `${flat.slice(0, 157)}…` : flat;
}

function toBlog(b: ApiBlog): PublicBlog {
  const words = b.content.trim().split(/\s+/).length;
  return {
    slug: b.slug,
    title: b.title,
    hook: makeHook(b.content),
    category: CATEGORY_MAP[b.category] ?? "Tech",
    readMinutes: b.readMinutes || Math.max(1, Math.round(words / 200)),
    date: (b.publishedAt ?? b.createdAt).slice(0, 10),
    featured: false,
    gradient: GRADIENTS[b.category] ?? GRADIENTS.Tech,
    content: b.content,
    author: b.author,
    imageUrl: blogImageUrl(b.imageUrl),
  };
}

// List for /blog (first 100 published posts, newest first)
export const getPublishedBlogs = cache(async (): Promise<PublicBlog[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/v1/blogs?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    const list: ApiBlog[] = json.data ?? [];
    return Array.isArray(list) ? list.map(toBlog) : [];
  } catch {
    return [];
  }
});

// One post by slug. cache() means generateMetadata and the page share
// a single request.
export const getPublishedBlogBySlug = cache(
  async (slug: string): Promise<PublicBlog | null> => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/blogs/${encodeURIComponent(slug)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.data ? toBlog(json.data as ApiBlog) : null;
    } catch {
      return null;
    }
  },
);
