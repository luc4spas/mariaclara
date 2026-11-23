import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COURSE_STATUS, courseCtaHref, images, type Course } from "@/lib/site";

export function CourseCard({
  course,
  whatsapp = "",
  featured = false,
}: {
  course: Course;
  whatsapp?: string;
  featured?: boolean;
}) {
  const statusLabel = COURSE_STATUS[course.status] ?? course.status;
  const isOpen = course.status === "aberto";
  const ctaHref = courseCtaHref(course, whatsapp);
  const ctaLabel = isOpen
    ? course.cta_label || "Garantir minha vaga"
    : course.status === "em_breve"
      ? "Quero ser avisada(o)"
      : "Entrar na lista de espera";

  if (featured) {
    return (
      <article className="group grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-all hover:-translate-y-0.5 md:grid-cols-[0.95fr_1.05fr]">
        <Link
          to="/cursos/$slug"
          params={{ slug: course.slug }}
          className="relative block aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[380px]"
        >
          <img
            src={images.course(course)}
            alt={course.title}
            width={1024}
            height={1280}
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-[50%_22%] transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
            {isOpen && <span className="size-2 rounded-full bg-sage" aria-hidden />}
            {statusLabel}
          </span>
        </Link>
        <div className="flex flex-col justify-center p-8 md:p-10">
          <p className="eyebrow">Curso em destaque</p>
          <h3 className="mt-3 text-3xl leading-tight md:text-4xl">
            <Link
              to="/cursos/$slug"
              params={{ slug: course.slug }}
              className="hover:text-primary transition-colors"
            >
              {course.title}
            </Link>
          </h3>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">{course.subtitle}</p>
          {course.learnings.length > 0 && (
            <ul className="mt-6 space-y-2.5 text-sm text-foreground/90">
              {course.learnings.slice(0, 3).map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-3.5" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/70 pt-6">
            {course.price_text ? (
              <p className="font-display text-2xl text-foreground">{course.price_text}</p>
            ) : (
              <span className="text-sm text-muted-foreground">Formação online completa</span>
            )}
            <div className="flex flex-wrap items-center gap-3">
              {isOpen && (
                <Button asChild variant="hero" size="lg">
                  <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                    {ctaLabel}
                  </a>
                </Button>
              )}
              <Button asChild variant={isOpen ? "heroOutline" : "hero"} size="lg">
                <Link to="/cursos/$slug" params={{ slug: course.slug }}>
                  Ver detalhes
                  <ArrowUpRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-soft">
      <Link
        to="/cursos/$slug"
        params={{ slug: course.slug }}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <img
          src={images.course(course)}
          alt={course.title}
          width={1024}
          height={1280}
          loading="lazy"
          decoding="async"
          className="size-full object-cover object-[50%_22%] transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1 text-xs font-semibold text-foreground shadow-sm backdrop-blur-sm">
          {isOpen && <span className="size-2 rounded-full bg-sage" aria-hidden />}
          {statusLabel}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-2xl leading-tight">
          <Link
            to="/cursos/$slug"
            params={{ slug: course.slug }}
            className="transition-colors hover:text-primary"
          >
            {course.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {course.subtitle}
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          {isOpen ? (
            <Button asChild variant="hero" size="sm" className="px-4">
              <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                {ctaLabel}
              </a>
            </Button>
          ) : course.price_text ? (
            <span className="font-display text-lg text-foreground">{course.price_text}</span>
          ) : (
            <span />
          )}
          <Link
            to="/cursos/$slug"
            params={{ slug: course.slug }}
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Ver detalhes
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
