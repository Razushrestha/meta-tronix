import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { PageHero } from "@/components/layout/PageHero";
import { FadeInSection } from "@/components/shared/FadeInSection";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { GradientButton } from "@/components/shared/GradientButton";
import { TeamBackground } from "@/components/shared/TeamBackground";
import { TeamMember } from "@/components/dashboard/types";

export const metadata: Metadata = {
  title: "Team",
  description:
    "Meet the engineers and designers behind Meta Tronix the team building product engineering and digital transformation work from Kathmandu, Nepal.",
  alternates: { canonical: "/team" },
};

// Always render fresh so new/edited members show up immediately.
export const dynamic = "force-dynamic";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_PHOTO = "/team/member-2.jpg"; // must exist in /public

// Shape of one team member as returned by the backend (Mongo document).
type ApiTeamMember = {
  _id?: string;
  id?: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
};

// Backend stores "/uploads/team/xxx.jpg"; the browser needs the full URL.
function toPhotoUrl(path?: string): string {
  if (!path) return FALLBACK_PHOTO;
  if (path.startsWith("http")) return path;
  return `${API_BASE}${path}`;
}

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/team`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const list: ApiTeamMember[] = json.data ?? json;
    if (!Array.isArray(list)) return [];

    return list.map(
      (m): TeamMember => ({
        id: m._id ?? m.id ?? "",
        name: m.name,
        role: m.role,
        bio: m.bio,
        photoUrl: toPhotoUrl(m.photoUrl), // already a full URL from here on
        socials: m.socials,
      }),
    );
  } catch {
    return [];
  }
}

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();

  return (
    <>
      <PageHero
        className="border-brand-border bg-mesh-light"
        innerClassName="max-w-3xl flex flex-col items-center text-center"
        backdrop={<TeamBackground />}
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#0EA5E9]">
          Our Team
        </p>
        <div
          className="mt-4 h-1 w-14 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]"
          aria-hidden
        />
        <h1 className="mt-6 font-display text-4xl font-bold leading-[1.12] text-brand-navy text-balance sm:text-5xl md:text-6xl md:leading-[1.08]">
          The People Behind Meta Tronix
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-brand-body text-balance md:text-lg md:leading-relaxed">
          A small, senior-led team of engineers and designers who ship
          production software not just prototypes.
        </p>
      </PageHero>

      {/* Team cards */}
      <FadeInSection className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading
            eyebrow="Meet the team"
            title="Engineers Who Own the Outcome"
            subtitle="Every person below is directly involved in the products we ship no hidden bench of subcontractors."
          />

          {teamMembers.length === 0 ? (
            <p className="py-12 text-center text-brand-body">
              Our team profiles are coming soon.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-brand-border bg-white p-6 shadow-soft hover:shadow-soft-md transition-shadow"
                >
                  <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-brand-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold text-brand-navy [overflow-wrap:anywhere]">
                    {member.name}
                  </h3>
                  <p className="text-sm font-semibold text-[#0EA5E9] [overflow-wrap:anywhere]">
                    {member.role}
                  </p>
                  <p className="mt-3 text-sm text-brand-body leading-relaxed [overflow-wrap:anywhere] line-clamp-4">
                    {member.bio}
                  </p>

                  {(member.socials?.linkedin ||
                    member.socials?.github ||
                    member.socials?.email) && (
                    <div className="mt-5 flex gap-3">
                      {member.socials?.linkedin && (
                        <a
                          href={member.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on LinkedIn`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-slate-500 hover:text-[#0EA5E9] hover:border-[#0EA5E9]/40 transition-colors"
                        >
                          <FaLinkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.socials?.github && (
                        <a
                          href={member.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${member.name} on GitHub`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-slate-500 hover:text-[#0EA5E9] hover:border-[#0EA5E9]/40 transition-colors"
                        >
                          <FaGithub className="h-4 w-4" />
                        </a>
                      )}
                      {member.socials?.email && (
                        <a
                          href={`mailto:${member.socials.email}`}
                          aria-label={`Email ${member.name}`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-brand-border text-slate-500 hover:text-[#0EA5E9] hover:border-[#0EA5E9]/40 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </FadeInSection>

      {/* Join the team CTA */}
      <FadeInSection className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0EA5E9]">
            We&apos;re growing
          </p>
          <h2 className="mt-3 font-display text-2xl md:text-3xl font-bold text-brand-navy text-balance">
            Want to build with us?
          </h2>
          <p className="mt-3 text-brand-body leading-relaxed max-w-xl mx-auto">
            We work with a small number of engineers and designers who care
            about craft as much as we do. Reach out if that sounds like you.
          </p>
          <div className="mt-8 flex justify-center">
            <GradientButton href="/contact" variant="primary">
              Get in touch
            </GradientButton>
          </div>
        </div>
      </FadeInSection>
    </>
  );
}
