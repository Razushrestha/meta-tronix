import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogBySlug } from "@/lib/blog-api";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedBlogBySlug(params.slug);
  if (!post) return { title: "Article" };
  const path = `/blog/${post.slug}`;
  const publishedTime = new Date(`${post.date}T12:00:00.000Z`).toISOString();
  const siteUrl = getSiteUrl();
  return {
    title: post.title,
    description: post.hook,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url: path,
      title: post.title,
      description: post.hook,
      publishedTime,
      modifiedTime: publishedTime,
      section: post.category,
      authors: [siteUrl],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.hook,
    },
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const post = await getPublishedBlogBySlug(params.slug);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const articleUrl = `${siteUrl}/blog/${post.slug}`;
  const publishedIso = new Date(`${post.date}T12:00:00.000Z`).toISOString();
  const ogImageUrl = `${siteUrl}/blog/${post.slug}/opengraph-image`;
  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const blogPostingLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.hook,
    image: [ogImageUrl, `${siteUrl}/metatronixlogo.png`],
    url: articleUrl,
    datePublished: publishedIso,
    dateModified: publishedIso,
    author: { "@type": "Organization", name: "Meta Tronix", url: siteUrl },
    publisher: {
      "@type": "Organization",
      name: "Meta Tronix",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/metatronixlogo.png`,
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    articleSection: post.category,
  };

  return (
    <article className="bg-white pb-20 md:pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      <div className="bg-white pt-32 pb-14 md:pt-40 md:pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/blog"
            className="text-sm font-medium text-[#0EA5E9] hover:text-[#06B6D4] transition-colors"
          >
            ← Back to blog
          </Link>
          <header className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0EA5E9]">
              {post.category}
            </p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight text-balance [overflow-wrap:anywhere]">
              {post.title}
            </h1>
            <p className="mt-6 text-sm text-brand-muted">
              {post.author} · {post.readMinutes} min read · {post.date}
            </p>
          </header>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10 md:pt-14">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={`${post.title} — article cover`}
            className="h-auto max-h-96 w-full rounded-2xl object-cover"
          />
        ) : (
          <div
            className={`h-48 rounded-2xl bg-gradient-to-br ${post.gradient}`}
            role="img"
            aria-label={`${post.title} — article cover`}
          />
        )}

        <div className="mt-10 space-y-5 text-base leading-relaxed text-brand-body">
          {paragraphs.map((p, i) => (
            <p key={i} className="whitespace-pre-line [overflow-wrap:anywhere]">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-12">
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            Discuss this topic with our team
          </Link>
        </div>
      </div>
    </article>
  );
}
