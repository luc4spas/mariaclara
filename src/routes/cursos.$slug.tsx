import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { getCourse } from "@/lib/content.functions";
import { absoluteUrl, COURSE_STATUS, courseCtaHref, getSiteUrl, images } from "@/lib/site";

const courseQuery = (slug: string) =>
  queryOptions({ queryKey: ["course", slug], queryFn: () => getCourse({ data: { slug } }) });

export const Route = createFileRoute("/cursos/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(courseQuery(params.slug));
    if (!data.course) throw notFound();
    return data;
  },
  headers: () => ({
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=3600",
  }),
  head: ({ loaderData, params }) => {
    const course = loaderData?.course;
    if (!course)
      return { meta: [{ title: "Curso indisponível" }, { name: "robots", content: "noindex" }] };
    const title = `${course.title} — ${loaderData.content.name}`;
    const siteUrl = getSiteUrl();
    const ogImage = course.image_url?.startsWith("https://")
      ? course.image_url
      : absoluteUrl("/og-image.jpg");
    const canonical = siteUrl ? `${siteUrl}/cursos/${params.slug}` : undefined;

    return {
      meta: [
        { title },
        { name: "description", content: course.subtitle },
        { property: "og:title", content: title },
        { property: "og:description", content: course.subtitle },
        { property: "og:type", content: "product" },
        { property: "og:image", content: ogImage },
        ...(canonical ? [{ property: "og:url", content: canonical }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: course.subtitle },
        { name: "twitter:image", content: ogImage },
      ],
      links: canonical ? [{ rel: "canonical", href: canonical }] : [],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            name: course.title,
            description: course.description || course.subtitle,
            ...(canonical ? { url: canonical } : {}),
            provider: { "@type": "Person", name: loaderData.content.name },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center bg-warm p-6 text-center">
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 shadow-soft">
        <p className="eyebrow">Curso indisponível</p>
        <h1 className="mt-3 text-4xl">Curso não encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Este curso não está publicado no momento ou o endereço foi alterado.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft hover:bg-primary/90"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  ),
  component: CoursePage,
});

function CoursePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(courseQuery(slug));
  const c = data.content;
  const course = data.course!;
  const open = course.status === "aberto";
  const ctaHref = courseCtaHref(course, c.whatsapp);
  const ctaLabel = open
    ? course.cta_label || "Garantir minha vaga"
    : course.status === "em_breve"
      ? "Quero ser avisada(o)"
      : "Entrar na lista de espera";

  return (
    <div className="min-h-screen">
      <SiteHeader name={c.name} whatsapp={c.whatsapp} />
      <main>
        <section className="overflow-x-clip bg-warm">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-2 md:py-20">
            <div className="reveal">
              <Link
                to="/"
                hash="cursos"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" /> Todos os cursos
              </Link>
              <p className="eyebrow mt-6">{COURSE_STATUS[course.status] ?? course.status}</p>
              <h1 className="mt-4 text-4xl leading-tight md:text-6xl">{course.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {course.subtitle}
              </p>
              {course.price_text && (
                <p className="mt-6 font-display text-3xl text-foreground">{course.price_text}</p>
              )}
              <Button asChild variant="hero" size="xl" className="mt-8">
                <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                  {ctaLabel}
                </a>
              </Button>
            </div>
            <img
              src={images.course(course)}
              alt={course.title}
              width={1024}
              height={1280}
              fetchPriority="high"
              decoding="sync"
              className="aspect-[4/5] w-full rounded-[2rem] object-cover object-[50%_22%] shadow-soft ring-1 ring-border/60"
            />
          </div>
        </section>

        {course.description && (
          <section className="mx-auto max-w-3xl px-5 py-20">
            <p className="whitespace-pre-line text-xl leading-relaxed text-foreground/90">
              {course.description}
            </p>
          </section>
        )}

        {course.learnings.length > 0 && (
          <section className="bg-secondary/60">
            <div className="mx-auto max-w-6xl px-5 py-20">
              <p className="eyebrow">Conteúdo</p>
              <h2 className="mt-4 text-4xl leading-tight">O que você vai aprender</h2>
              <ul className="mt-10 grid gap-4 md:grid-cols-2">
                {course.learnings.map((l) => (
                  <li
                    key={l}
                    className="flex gap-4 rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
                  >
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-4" />
                    </span>
                    <span className="leading-relaxed">{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {course.audience.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-20">
            <p className="eyebrow">Para quem é</p>
            <h2 className="mt-4 text-4xl leading-tight">Feito para você que…</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {course.audience.map((a) => (
                <div
                  key={a.title}
                  className="rounded-3xl border border-border bg-card p-8 shadow-sm"
                >
                  <h3 className="text-2xl">{a.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{a.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 md:grid-cols-[0.8fr_1.2fr]">
          <img
            src={images.teacher}
            alt={c.name}
            width={960}
            height={1280}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-soft ring-1 ring-border/70"
          />
          <div>
            <p className="eyebrow">Sobre quem ministra</p>
            <h2 className="mt-4 text-4xl leading-tight">{c.name}</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{c.aboutText}</p>
          </div>
        </section>

        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-ink px-8 py-16 text-center text-ink-foreground shadow-soft">
            <h2 className="text-4xl leading-tight md:text-5xl">
              {open ? "Vagas limitadas para a próxima turma" : "Seja a primeira pessoa a saber"}
            </h2>
            <Button asChild variant="hero" size="xl" className="mt-8">
              <a href={ctaHref} target="_blank" rel="noopener noreferrer">
                {ctaLabel}
              </a>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter c={c} />
    </div>
  );
}
