import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { FadeInSection } from "@/components/shared/FadeInSection";
import { getProductsPageHeroMerged } from "@/lib/sanity/content";
import { TechBackground } from "@/components/shared/TechBackground";
import { getActiveProducts, imageUrl, safeUrl } from "@/lib/products-api";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Explore products engineered by Meta Tronix: platforms for innovation, connection, consultancy, and events.",
  alternates: { canonical: "/products" },
};

// Always render fresh so new/edited products show up immediately.
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const [hero, products] = await Promise.all([
    getProductsPageHeroMerged(),
    getActiveProducts(),
  ]);

  return (
    <div className="bg-white pb-20 md:pb-28">
      <PageHero
        className="border-brand-border bg-mesh-light"
        innerClassName="max-w-3xl flex flex-col items-center text-center"
        backdrop={<TechBackground />}
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">
          {hero.heroKicker}
        </p>
        <div
          className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]"
          aria-hidden
        />
        <h1 className="mt-6 w-full text-center font-display text-4xl font-bold leading-[1.12] text-brand-navy text-balance sm:text-5xl md:text-6xl md:leading-[1.08]">
          {hero.heroTitle}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-base leading-relaxed text-brand-body text-balance md:text-lg md:leading-relaxed">
          {hero.heroLead}
        </p>
      </PageHero>

      <div className="max-w-3xl mx-auto px-6 pt-16 md:pt-24 text-center">
        <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold text-brand-navy text-balance">
          Real builds, real problems solved
        </h2>
        <p className="mt-3 text-brand-body text-sm md:text-base leading-relaxed text-balance">
          No filler slides every product below shipped to solve a specific
          problem, backed by the stack that made it possible.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-14 md:pt-20">
        {products.length === 0 ? (
          <p className="py-12 text-center text-brand-body">
            Our products are coming soon.
          </p>
        ) : (
          <div className="space-y-20 md:space-y-24">
            {products.map((p) => {
              const icon = imageUrl(p.iconUrl);
              const preview = imageUrl(p.previewUrl);
              const link = safeUrl(p.productUrl);

              return (
                <FadeInSection key={p.id} id={p.slug}>
                  <article className="rounded-3xl border border-brand-border bg-white overflow-hidden shadow-soft-md">
                    <div className="border-b border-brand-border border-l-4 border-l-[#0EA5E9] bg-brand-section px-6 py-8 md:px-10 md:py-10">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-brand-border bg-white font-display text-xl font-bold text-[#0EA5E9] shadow-soft">
                          {icon ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={icon}
                              alt={`${p.name} icon`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            p.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">
                            Product
                          </p>
                          <h2 className="mt-1 font-display text-3xl md:text-4xl font-bold text-brand-navy [overflow-wrap:anywhere]">
                            {p.name}
                          </h2>
                          <p className="text-brand-body text-sm md:text-base mt-2 max-w-xl leading-relaxed [overflow-wrap:anywhere]">
                            {p.tagline}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 md:p-10 grid lg:grid-cols-2 gap-10">
                      <div className="min-w-0">
                        {p.description && (
                          <p className="mb-8 whitespace-pre-line text-slate-700 leading-relaxed [overflow-wrap:anywhere]">
                            {p.description}
                          </p>
                        )}
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
                          Problem it solves
                        </h3>
                        <p className="mt-2 text-slate-700 leading-relaxed [overflow-wrap:anywhere]">
                          {p.problem}
                        </p>

                        {p.features.length > 0 && (
                          <>
                            <h3 className="mt-8 text-sm font-semibold uppercase tracking-wider text-cyan-700">
                              Key features
                            </h3>
                            <ul className="mt-3 space-y-3">
                              {p.features.map((f, i) => (
                                <li
                                  key={`${f}-${i}`}
                                  className="flex gap-3 text-slate-700 text-sm md:text-base"
                                >
                                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                                    <Check className="h-3 w-3" />
                                  </span>
                                  <span className="[overflow-wrap:anywhere]">
                                    {f}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-col justify-between gap-8">
                        {p.technologies.length > 0 && (
                          <div>
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-700">
                              Tech used
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {p.technologies.map((t, i) => (
                                <span
                                  key={`${t}-${i}`}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {preview && (
                          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={preview}
                              alt={`${p.name} preview`}
                              className="h-auto w-full"
                            />
                          </div>
                        )}

                        <div className="mt-4 w-full">
                          {link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3 font-semibold text-white transition hover:opacity-90"
                            >
                              Visit Product
                            </a>
                          ) : (
                            <div className="flex h-11 w-full items-center justify-center rounded-xl border border-brand-border bg-brand-section text-sm font-medium text-slate-500">
                              Coming Soon
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeInSection>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
