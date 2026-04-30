import type { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { getBlogPostDetailMerged, getBlogSlugs } from "@/lib/sanity/content";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPostDetailMerged(params.slug);
  if (!post) return { title: "Article" };
  return {
    title: post.title,
    description: post.hook,
  };
}

export default async function BlogArticlePage({ params }: Props) {
  const post = await getBlogPostDetailMerged(params.slug);
  if (!post) notFound();

  const hasBody = Array.isArray(post.body) && post.body.length > 0;

  return (
    <article className="bg-white pb-20 md:pb-28">
      <PageHero innerClassName="max-w-3xl">
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
          <h1 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight text-balance">
            {post.title}
          </h1>
          <p className="mt-4 text-lg text-brand-body leading-relaxed">{post.hook}</p>
          <p className="mt-6 text-sm text-brand-muted">
            {post.readMinutes} min read, {post.date}
          </p>
        </header>
      </PageHero>

      <div className="max-w-3xl mx-auto px-6 pt-10 md:pt-14">
        <div
          className={`h-48 rounded-2xl bg-gradient-to-br ${post.gradient}`}
        />
        <div className="mt-10 space-y-5 text-base leading-relaxed text-brand-body">
          {hasBody ?
            <PortableText
              value={post.body!}
              components={{
                block: {
                  normal: ({ children }) => (
                    <p className="mb-4 leading-relaxed">{children}</p>
                  ),
                },
                marks: {
                  strong: ({ children }) => (
                    <strong className="font-semibold text-brand-navy">{children}</strong>
                  ),
                  em: ({ children }) => <em>{children}</em>,
                  link: ({ value, children }) => (
                    <a
                      href={value?.href}
                      className="text-[#0EA5E9] underline underline-offset-2 hover:text-cyan-600"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                },
                list: {
                  bullet: ({ children }) => (
                    <ul className="list-disc pl-5 mb-4 space-y-1">{children}</ul>
                  ),
                  number: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-4 space-y-1">{children}</ol>
                  ),
                },
                listItem: {
                  bullet: ({ children }) => <li>{children}</li>,
                  number: ({ children }) => <li>{children}</li>,
                },
              }}
            />
          : <>
              <p>
                This is a static preview article for the Meta Tronix marketing site.
                Connect Sanity and publish body content from the studio to replace
                this placeholder.
              </p>
              <p>
                In production, this page would expand on the hook above with
                sections, diagrams, and calls-to-action tuned for your funnel. The
                layout matches the clean light theme used across the site.
              </p>
              <p>
                Use the Blog post document in Sanity to author rich text and set
                featured posts on the blog index.
              </p>
            </>
          }
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
