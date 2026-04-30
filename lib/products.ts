export type Product = {
  id: string;
  name: string;
  tagline: string;
  problem: string;
  features: string[];
  tech: string[];
};

export const products: Product[] = [
  {
    id: "innovator",
    name: "Innovator",
    tagline: "Where builders meet momentum.",
    problem:
      "Innovation communities fragment across chats, docs, and social noise.",
    features: [
      "Project rooms with milestones, files, and threaded discussion",
      "Reputation and contribution signals that reward quality, not volume",
      "Moderation tools tuned for constructive technical discourse",
    ],
    tech: ["Next.js", "PostgreSQL", "Realtime", "AWS"],
  },
  {
    id: "linder",
    name: "Linder",
    tagline: "Dating with intention, not endless swipes.",
    problem:
      "Connection apps optimize for vanity metrics instead of meaningful matches.",
    features: [
      "Profile prompts designed to surface values and lifestyle fit",
      "Safety workflows with reporting, blocking, and human review hooks",
      "Performance-first mobile builds for flaky networks",
    ],
    tech: ["Flutter", "Node.js", "MongoDB", "Firebase"],
  },
  {
    id: "meta-crm",
    name: "Meta CRM",
    tagline: "Consulting pipelines, without spreadsheet chaos.",
    problem:
      "Consultancies lose visibility when leads, delivery, and billing live in different tools.",
    features: [
      "Lead-to-cash pipeline with role-based access for partners and analysts",
      "Client workspaces for deliverables, approvals, and invoices",
      "Executive dashboards for utilization and revenue forecasting",
    ],
    tech: ["Laravel", "MySQL", "Vue", "Docker"],
  },
  {
    id: "eventify",
    name: "Eventify",
    tagline: "Events that feel effortless on game day.",
    problem:
      "Event teams juggle registrations, payments, and on-site logistics with brittle tooling.",
    features: [
      "Branded registration sites with tiered ticketing and promo codes",
      "Check-in flows that work offline-first for crowded venues",
      "Organizer analytics for attendance, revenue, and cohort insights",
    ],
    tech: ["Next.js", "Stripe", "PostgreSQL", "Vercel"],
  },
];
