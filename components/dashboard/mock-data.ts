import { BlogPost, Product, TeamMember, CareerListing } from "./types";

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "Shipping our new component library",
    author: "Ajay Tamang",
    status: "published",
    date: "2026-07-12",
  },
  {
    id: "b2",
    title: "How we structure Next.js apps at scale",
    author: "Ajay Tamang",
    status: "draft",
    date: "2026-07-28",
  },
  {
    id: "b3",
    title: "Behind the brand refresh",
    author: "Sabina Rai",
    status: "published",
    date: "2026-06-30",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Starter Plan",
    category: "Subscription",
    price: 19,
    stock: 999,
    status: "active",
  },
  {
    id: "p2",
    name: "Pro Plan",
    category: "Subscription",
    price: 49,
    stock: 999,
    status: "active",
  },
  {
    id: "p3",
    name: "On-site Workshop",
    category: "Service",
    price: 1200,
    stock: 4,
    status: "inactive",
  },
];

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "t1",
    name: "Sabina Rai",
    role: "Design Lead",
    bio: "Leads product design and creates thoughtful, user-focused digital experiences.",
    photo: "",
    socials: {
      linkedin: "https://linkedin.com/in/sabina-rai",
      github: "https://github.com/sabina-rai",
      email: "sabina@meta-tronix.com",
    },
  },
  {
    id: "t2",
    name: "Prakash Shrestha",
    role: "Backend Engineer",
    bio: "Builds reliable backend systems, APIs, and scalable application infrastructure.",
    photo: "",
    socials: {
      linkedin: "https://linkedin.com/in/prakash-shrestha",
      github: "https://github.com/prakash-shrestha",
      email: "prakash@meta-tronix.com",
    },
  },
  {
    id: "t3",
    name: "Nisha Gurung",
    role: "Marketing Associate",
    bio: "Works on brand communication, content strategy, and digital marketing initiatives.",
    photo: "",
    socials: {
      linkedin: "https://linkedin.com/in/nisha-gurung",
      github: "",
      email: "nisha@meta-tronix.com",
    },
  },
];

export const CAREER_LISTINGS: CareerListing[] = [
  {
    id: "c1",
    title: "Frontend Engineer Intern",
    department: "Engineering",
    location: "Kathmandu, NP",
    type: "internship",
    status: "open",
  },
  {
    id: "c2",
    title: "Product Designer",
    department: "Design",
    location: "Remote",
    type: "full-time",
    status: "open",
  },
  {
    id: "c3",
    title: "Content Writer",
    department: "Marketing",
    location: "Kathmandu, NP",
    type: "part-time",
    status: "closed",
  },
];
