import type { Metadata } from "next";
import { BlogPageClient } from "@/components/blog/BlogPageClient";
import { getPublishedBlogs } from "@/lib/blog-api";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles on product engineering, startups, design, AI, and IoT from the Meta Tronix team.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogs();
  return <BlogPageClient posts={posts} />;
}
