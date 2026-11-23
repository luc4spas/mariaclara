import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-warm px-4">
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="eyebrow">Erro 404</p>
        <h1 className="mt-3 text-4xl text-foreground">Página não encontrada</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A página que você procura não existe ou foi movida para outro endereço.
        </p>
        <div className="mt-7">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm px-4">
      <div className="max-w-md rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
        <p className="eyebrow">Ops!</p>
        <h1 className="mt-3 text-3xl text-foreground">Não foi possível carregar esta página</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Ocorreu uma instabilidade temporária. Você pode tentar novamente agora ou voltar para o
          início.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-soft transition-colors hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-foreground/20 bg-transparent px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5"
          >
            Voltar ao início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Maria Clara Passos — Nutricionista e Terapeuta Alimentar" },
      {
        name: "description",
        content:
          "Nutricionista clínica especialista em dificuldades alimentares e terapia alimentar no autismo.",
      },
      { name: "author", content: "Maria Clara Passos" },
      { name: "theme-color", content: "#f7f1e8" },
      { property: "og:site_name", content: "Maria Clara Passos" },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg?v=2", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico?v=2", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2", sizes: "180x180" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const pathname = window.location.pathname;
    const hasSession =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/auth") ||
      Object.keys(window.localStorage).some((k) => k.startsWith("sb-"));

    if (!hasSession) return;

    void import("@/integrations/supabase/client").then(({ supabase }) => {
      if (!active) return;
      const { data } = supabase.auth.onAuthStateChange((event) => {
        if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
