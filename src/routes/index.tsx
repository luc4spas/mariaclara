import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { ArrowRight, Quote, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { CourseCard } from "@/components/site/CourseCard";
import { getSiteData } from "@/lib/content.functions";
import { absoluteUrl, getSiteUrl, images, waLink } from "@/lib/site";

const siteQuery = queryOptions({ queryKey: ["site"], queryFn: () => getSiteData() });

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteQuery),
  headers: () => ({
    "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
    "Netlify-CDN-Cache-Control": "public, durable, s-maxage=300, stale-while-revalidate=3600",
  }),
  head: ({ loaderData }) => {
    const c = loaderData?.content;
    const title = c?.seoTitle ?? "Maria Clara Passos — Nutricionista e Terapeuta Alimentar";
    const description =
      c?.seoDescription ?? "Nutricionista clínica especialista em dificuldades alimentares.";
    const siteUrl = getSiteUrl();
    const ogImage = c?.heroImage?.startsWith("https://")
      ? c.heroImage
      : absoluteUrl("/og-image.jpg");

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        ...(siteUrl ? [{ property: "og:url", content: `${siteUrl}/` }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
      ],
      links: siteUrl ? [{ rel: "canonical", href: `${siteUrl}/` }] : [],
      scripts: c
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Person",
                    name: c.name,
                    jobTitle: c.role,
                    description: c.aboutText,
                    ...(siteUrl ? { url: `${siteUrl}/` } : {}),
                    image: ogImage,
                    ...(c.instagram ? { sameAs: [c.instagram] } : {}),
                    knowsAbout: [
                      "Terapia alimentar",
                      "Seletividade alimentar",
                      "Autismo",
                      "Nutrição infantil",
                    ],
                  },
                  ...(c.faq.length > 0
                    ? [
                        {
                          "@type": "FAQPage",
                          mainEntity: c.faq.map((f) => ({
                            "@type": "Question",
                            name: f.q,
                            acceptedAnswer: { "@type": "Answer", text: f.a },
                          })),
                        },
                      ]
                    : []),
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(siteQuery);
  const { content: c, courses } = data;
  const firstName = c.name.split(" ")[0];

  return (
    <div className="min-h-screen">
      <SiteHeader name={c.name} whatsapp={c.whatsapp} />
      <main>
        {/* Hero */}
        <section className="overflow-x-clip bg-warm">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-24">
            <div className="reveal">
              <p className="eyebrow">{c.role}</p>
              <h1 className="mt-5 text-5xl leading-[1.03] md:text-7xl">{c.heroTitle}</h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {c.heroSubtitle}
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button asChild variant="hero" size="xl">
                  <a href="#cursos">
                    Conheça os cursos <ArrowRight />
                  </a>
                </Button>
                {c.whatsapp && (
                  <Button asChild variant="heroOutline" size="xl">
                    <a
                      href={waLink(c.whatsapp, "Olá! Gostaria de saber mais.")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar pelo WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md md:max-w-none">
              <div
                className="pointer-events-none absolute -inset-3 -z-0 rotate-2 rounded-[2.4rem] bg-accent/60 sm:-inset-4 sm:rotate-3 sm:rounded-[2.5rem]"
                aria-hidden
              />
              <img
                src={images.hero(c)}
                alt={`${c.name}, nutricionista`}
                width={960}
                height={1280}
                fetchPriority="high"
                decoding="sync"
                className="relative aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-soft ring-1 ring-border/50"
              />
              <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-border/60 bg-card/95 px-5 py-3.5 shadow-soft backdrop-blur-sm sm:right-auto md:-bottom-6 md:-left-8 md:py-4">
                <p className="font-display text-xl md:text-2xl">{c.name}</p>
                <p className="text-xs font-medium text-muted-foreground">
                  Terapia alimentar no TEA
                </p>
              </div>
            </div>
          </div>

          {c.credentials.length > 0 && (
            <div className="border-y border-border/70 bg-background/70">
              <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-3 gap-y-2.5 px-5 py-5 text-xs font-medium text-foreground/80 sm:text-sm">
                {c.credentials.map((cr) => (
                  <li
                    key={cr}
                    className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/80 px-3.5 py-1.5"
                  >
                    <Sparkles className="size-3.5 shrink-0 text-primary" aria-hidden />
                    <span>{cr}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* About */}
        <section
          id="sobre"
          className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-14 md:py-24"
        >
          <img
            src={images.about(c)}
            alt={`Retrato de ${c.name}`}
            width={960}
            height={1280}
            loading="lazy"
            decoding="async"
            className="aspect-[4/5] w-full rounded-[2rem] object-cover object-top shadow-soft ring-1 ring-border/60"
          />
          <div>
            <p className="eyebrow">Sobre mim</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">{c.aboutTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">{c.aboutText}</p>
            {c.aboutQuote && (
              <blockquote className="mt-8 border-l-2 border-primary pl-5 font-display text-2xl italic leading-snug text-foreground">
                “{c.aboutQuote}”
              </blockquote>
            )}
          </div>
        </section>

        {/* Purpose */}
        <section className="bg-sage text-sage-foreground">
          <div className="mx-auto max-w-4xl px-5 py-20 text-center md:py-24">
            <p className="eyebrow !text-sage-foreground/85">Nosso propósito</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">{c.purposeTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-sage-foreground/95">
              {c.purposeText}
            </p>
          </div>
        </section>

        {/* Courses */}
        <section id="cursos" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Formações</p>
              <h2 className="mt-4 text-4xl leading-tight md:text-5xl">Cursos para quem cuida.</h2>
            </div>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              Conteúdo prático, nascido da experiência clínica, para pais, cuidadores e
              profissionais.
            </p>
          </div>

          {courses.length === 1 && courses[0] ? (
            <div className="mt-12">
              <CourseCard course={courses[0]} whatsapp={c.whatsapp} featured />
            </div>
          ) : courses.length > 1 ? (
            <div
              className={`mt-12 grid gap-6 ${courses.length === 2 ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
            >
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} whatsapp={c.whatsapp} />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-muted-foreground">Novos cursos em breve.</p>
          )}
        </section>

        {/* Talks */}
        {c.talks.length > 0 && (
          <section id="palestras" className="scroll-mt-20 bg-secondary/60">
            <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
              <p className="eyebrow">Palestras</p>
              <h2 className="mt-4 text-4xl leading-tight md:text-5xl">
                Temas que levo para conversar.
              </h2>
              <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-border bg-border md:grid-cols-2">
                {c.talks.map((t, i) => (
                  <li
                    key={t}
                    className="flex gap-6 bg-card p-7 transition-colors hover:bg-card/85 md:p-8"
                  >
                    <span className="font-display text-3xl text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl leading-snug">{t}</h3>
                  </li>
                ))}
              </ol>
              {c.experience.length > 0 && (
                <div className="mt-10 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-foreground">Experiência:</span>
                  {c.experience.map((e) => (
                    <span
                      key={e}
                      className="rounded-full border border-border bg-card px-4 py-1.5 text-foreground/90"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              )}
              {c.whatsapp && (
                <Button asChild variant="heroOutline" size="lg" className="mt-10">
                  <a
                    href={waLink(c.whatsapp, "Olá! Gostaria de convidar você para uma palestra.")}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Convidar para uma palestra
                  </a>
                </Button>
              )}
            </div>
          </section>
        )}

        {/* Testimonials */}
        {c.testimonials.length > 0 && (
          <section className="mx-auto max-w-6xl px-5 py-20 md:py-24">
            <p className="eyebrow">Depoimentos</p>
            <h2 className="mt-4 text-4xl leading-tight md:text-5xl">Quem já passou por aqui.</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {c.testimonials.map((t) => (
                <figure
                  key={t.name + t.text}
                  className="flex flex-col rounded-3xl border border-border bg-card p-8 shadow-sm"
                >
                  <Quote className="size-6 text-primary" aria-hidden />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-foreground/90">
                    {t.text}
                  </blockquote>
                  <figcaption className="mt-6 text-sm font-semibold text-foreground">
                    {t.name}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        {c.faq.length > 0 && (
          <section id="duvidas" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-20 md:py-24">
            <p className="eyebrow text-center">Dúvidas frequentes</p>
            <h2 className="mt-4 text-center text-4xl leading-tight md:text-5xl">
              Ficou alguma pergunta?
            </h2>
            <Accordion type="single" collapsible className="mt-10">
              {c.faq.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left text-lg">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        )}

        {/* Final CTA */}
        <section className="px-5 pb-24">
          <div className="mx-auto max-w-6xl rounded-[2.5rem] bg-primary px-8 py-16 text-center text-primary-foreground shadow-soft md:py-20">
            <h2 className="text-4xl leading-tight md:text-5xl">
              Vamos tornar a refeição mais leve?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Converse com a {firstName} e descubra o melhor caminho para a sua família ou para a
              sua prática clínica.
            </p>
            {c.whatsapp && (
              <Button asChild variant="inverse" size="xl" className="mt-8">
                <a
                  href={waLink(c.whatsapp, "Olá! Quero saber mais.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Quero conversar agora
                </a>
              </Button>
            )}
          </div>
        </section>
      </main>
      <SiteFooter c={c} />
    </div>
  );
}
