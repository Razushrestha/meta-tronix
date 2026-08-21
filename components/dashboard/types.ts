export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  content: string;
  author: string;
  category: "Tech" | "Startup" | "AI" | "Design" | "IOT";
  published: boolean;
  publishedAt?: string;
  readMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description?: string;
  problem: string;
  features: string[];
  technologies: string[];
  previewUrl: string;
  productUrl: string;
  featured: boolean;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  socials?: {
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export interface CareerListing {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType:
    | "full-time"
    | "part-time"
    | "contract"
    | "internship"
    | "remote";
  workplace: "onsite" | "remote" | "hybrid";
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  experience: string;
  vacancies: number;
  applicationDeadline?: string;
  status: "draft" | "open" | "closed";
  createdAt: string;
  updatedAt: string;
}
