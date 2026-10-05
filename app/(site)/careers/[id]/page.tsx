import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Clock,
  CheckCircle2,
  Users,
  Banknote,
  CalendarDays,
} from "lucide-react";
import { GradientButton } from "@/components/shared/GradientButton";
import {
  getOpenCareerById,
  formatSalary,
  formatDeadline,
} from "@/lib/careers-api";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const role = await getOpenCareerById(params.id);
  if (!role) return { title: "Role not found" };
  return {
    title: role.title,
    description: role.description?.slice(0, 160),
    alternates: { canonical: `/careers/${role.id}` },
  };
}

function BulletSection({
  title,
  items,
  muted = false,
}: {
  title: string;
  items?: string[];
  muted?: boolean;
}) {
  if (!items || items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-xl font-bold text-brand-navy">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="flex gap-3 text-brand-body leading-relaxed"
          >
            <CheckCircle2
              className={`mt-0.5 h-5 w-5 shrink-0 ${
                muted ? "text-slate-400" : "text-[#0EA5E9]"
              }`}
            />
            <span className="[overflow-wrap:anywhere]">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function CareerRolePage({ params }: Props) {
  const role = await getOpenCareerById(params.id);
  if (!role) notFound();

  const salary = formatSalary(role);
  const deadline = formatDeadline(role);

  return (
    <article className="bg-white pb-20 md:pb-28">
      <div className="bg-white pt-32 pb-14 md:pt-40 md:pb-16">
        <div className="max-w-3xl mx-auto px-6">
          <Link
            href="/careers"
            className="text-sm font-medium text-[#0EA5E9] hover:text-[#06B6D4] transition-colors"
          >
            ← Back to careers
          </Link>
          <header className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-[#0EA5E9] [overflow-wrap:anywhere]">
              {role.department}
            </p>
            <h1 className="mt-3 font-display text-3xl md:text-4xl lg:text-5xl font-bold text-brand-navy leading-tight text-balance [overflow-wrap:anywhere]">
              {role.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-brand-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {role.location}
              </span>
              <span className="inline-flex items-center gap-1.5 capitalize">
                <Clock className="h-4 w-4" />
                {role.employmentType.replace("-", " ")} · {role.workplace}
              </span>
              {role.vacancies > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {role.vacancies}{" "}
                  {role.vacancies === 1 ? "vacancy" : "vacancies"}
                </span>
              )}
              {salary && (
                <span className="inline-flex items-center gap-1.5">
                  <Banknote className="h-4 w-4" />
                  {salary}
                </span>
              )}
              {deadline && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  Apply by {deadline}
                </span>
              )}
            </div>
          </header>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-10 md:pt-14">
        <section>
          <h2 className="font-display text-xl font-bold text-brand-navy">
            About the role
          </h2>
          <p className="mt-4 whitespace-pre-line text-brand-body leading-relaxed [overflow-wrap:anywhere]">
            {role.description}
          </p>
          {role.experience && (
            <p className="mt-4 text-sm text-brand-muted">
              <span className="font-semibold text-brand-navy">Experience:</span>{" "}
              {role.experience}
            </p>
          )}
        </section>

        <BulletSection title="What you'll do" items={role.responsibilities} />
        <BulletSection
          title="What we're looking for"
          items={role.requirements}
        />
        <BulletSection
          title="Nice to have"
          items={role.preferredQualifications}
          muted
        />

        <div className="mt-12 rounded-2xl border border-brand-border bg-brand-section p-8 md:p-10 text-center">
          <h3 className="font-display text-lg font-bold text-brand-navy">
            Ready to apply?
          </h3>
          <p className="mt-2 text-sm text-brand-body leading-relaxed">
            Send us your resume and a bit about what you&apos;d want to build
            with us.
          </p>
          <div className="mt-6 flex justify-center">
            <GradientButton href="/contact" variant="primary">
              Apply for this role
            </GradientButton>
          </div>
        </div>
      </div>
    </article>
  );
}
