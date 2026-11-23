import heroImg from "@/assets/maria-hero.jpg";
import aboutImg from "@/assets/maria-about.jpg";
import courseImg from "@/assets/course-family.jpg";
import teacherImg from "@/assets/maria-course.jpg";

export type QA = { q: string; a: string };
export type Testimonial = { name: string; text: string };
export type AudienceItem = { title: string; text: string };

export type SiteContent = {
  name: string;
  role: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutText: string;
  aboutQuote: string;
  aboutImage: string;
  credentials: string[];
  purposeTitle: string;
  purposeText: string;
  talks: string[];
  experience: string[];
  testimonials: Testimonial[];
  faq: QA[];
  whatsapp: string;
  instagram: string;
  email: string;
  seoTitle: string;
  seoDescription: string;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string | null;
  status: string;
  cta_label: string;
  cta_url: string;
  price_text: string;
  learnings: string[];
  audience: AudienceItem[];
  published: boolean;
  sort_order: number;
};

export const COURSE_STATUS: Record<string, string> = {
  aberto: "Inscrições abertas",
  em_breve: "Em breve",
  encerrado: "Turma encerrada",
};

export const DEFAULT_CHECKOUT_URL = "https://pay.cakto.com.br/34r2d8t_1290334";

export function courseCtaHref(course: Course, whatsapp: string): string {
  const customUrl = course.cta_url?.trim();
  if (course.status === "aberto") {
    if (customUrl && !customUrl.includes("wa.me")) return customUrl;
    return DEFAULT_CHECKOUT_URL;
  }
  if (customUrl) return customUrl;
  return whatsapp ? waLink(whatsapp, `Olá! Tenho interesse no ${course.title}.`) : "#";
}

export const defaultContent: SiteContent = {
  name: "Maria Clara Passos",
  role: "Nutricionista Clínica & Terapeuta Alimentar",
  heroTitle: "Comida de verdade, cuidado com afeto.",
  heroSubtitle: "",
  heroImage: "",
  aboutTitle: "",
  aboutText: "",
  aboutQuote: "",
  aboutImage: "",
  credentials: [],
  purposeTitle: "",
  purposeText: "",
  talks: [],
  experience: [],
  testimonials: [],
  faq: [],
  whatsapp: "",
  instagram: "",
  email: "",
  seoTitle: "Maria Clara Passos — Nutricionista",
  seoDescription: "Nutricionista clínica e terapeuta alimentar.",
};

export const images = {
  hero: (c: SiteContent) => c.heroImage || heroImg,
  about: (c: SiteContent) => c.aboutImage || aboutImg,
  course: (c: Course) => c.image_url || courseImg,
  teacher: teacherImg,
};

export function getSiteUrl(): string {
  const fromVite =
    typeof import.meta !== "undefined" ? import.meta.env?.["VITE_SITE_URL"] : undefined;
  const fromEnv = typeof process !== "undefined" ? process.env["SITE_URL"] : undefined;
  const raw = (fromVite || fromEnv || "").trim();
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function waLink(phone: string, text?: string) {
  const n = phone.replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
