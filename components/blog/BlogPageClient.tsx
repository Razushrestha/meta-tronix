"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { blogPosts, type BlogCategory, type BlogPost } from "@/lib/blog";
import { PageHero } from "@/components/layout/PageHero";
import { FadeInSection } from "@/components/shared/FadeInSection";
import { BlogBackground } from "@/components/shared/BlogBackground";

const tabs: BlogCategory[] = ["All", "Tech", "Startup", "AI", "Design", "IoT"];

// BlogPost plus the optional cover image that comes from the API
type BlogListItem = BlogPost & { imageUrl?: string };

type BlogPageClientProps = {
  posts: BlogListItem[];
};

// Shows the uploaded cover image, or the gradient if there is none
function Cover({ post, className }: { post: BlogListItem; className: string }) {
  const [failed, setFailed] = useState(false);

  if (post.imageUrl && !failed) {
    return (
      <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imageUrl}
          alt={post.title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return <div className={`bg-gradient-to-br ${post.gradient} ${className}`} />;
}

export function BlogPageClient({ posts }: BlogPageClientProps) {
  const list: BlogListItem[] = posts.length ? posts : blogPosts;
  const [cat, setCat] = useState<BlogCategory>("All");

  const featured = useMemo(
    () => list.find((p) => p.featured) ?? list[0],
    [list],
  );

  const filtered = useMemo(() => {
    if (cat === "All") return list.filter((p) => p.slug !== featured.slug);
    return list.filter((p) => p.category === cat && p.slug !== featured.slug);
  }, [cat, featured.slug, list]);

  return (
    <div className="bg-white pb-20 md:pb-28">
      <PageHero
        className="border-brand-border bg-mesh-light"
        innerClassName="max-w-3xl flex flex-col items-center text-center"
        backdrop={<BlogBackground />}
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">
          Insights
        </p>
        <div
          className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]"
          aria-hidden
        />
        <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-brand-navy text-balance sm:text-5xl md:text-6xl md:leading-[1.08]">
          Meta Tronix Blog
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-body text-balance md:text-lg md:leading-relaxed">
          Practical notes on shipping software, designing for conversion, and
          running engineering teams from Nepal.
        </p>
      </PageHero>

      <div className="max-w-7xl mx-auto px-6 pt-12 md:pt-16">
        <FadeInSection>
          <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-md">
            <div className="relative grid lg:grid-cols-2 gap-0">
              <Cover
                post={featured}
                className="min-h-[220px] lg:min-h-[320px]"
              />
              <div className="p-8 md:p-12 flex min-w-0 flex-col justify-center bg-white">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
                  Featured, {featured.category}
                </span>
                <h2 className="mt-3 font-display text-2xl md:text-4xl font-semibold text-slate-900 leading-tight group-hover:text-sky-800 transition-colors [overflow-wrap:anywhere]">
                  {featured.title}
                </h2>
                <p className="mt-4 text-slate-600 leading-relaxed line-clamp-3 [overflow-wrap:anywhere]">
                  {featured.hook}
                </p>
                <p className="mt-6 text-sm text-slate-500">
                  {featured.readMinutes} min read, {featured.date}
                </p>
                <Link
                  href={`/blog/${featured.slug}`}
                  className="mt-6 inline-flex text-sm font-semibold text-cyan-700 hover:text-sky-800 transition-colors"
                >
                  Read article <span aria-hidden>{">"}</span>
                </Link>
              </div>
            </div>
          </article>
        </FadeInSection>

        <div className="mt-12 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setCat(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition-colors ${
                cat === t
                  ? "border-sky-400 bg-sky-50 text-slate-900 shadow-sm"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filtered.map((post) => (
            <FadeInSection key={post.slug}>
              <article className="h-full flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-sky-300 hover:shadow-md transition-all shadow-sm">
                <Cover post={post} className="h-40 shrink-0" />
                <div className="p-6 flex min-w-0 flex-col flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                    {post.category}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 leading-snug [overflow-wrap:anywhere]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1 line-clamp-3 [overflow-wrap:anywhere]">
                    {post.hook}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {post.readMinutes} min read, {post.date}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-4 text-sm font-semibold text-cyan-700 hover:text-sky-800 inline-flex items-center gap-1"
                  >
                    Read More <span aria-hidden>{">"}</span>
                  </Link>
                </div>
              </article>
            </FadeInSection>
          ))}
        </div>
      </div>
    </div>
  );
}
