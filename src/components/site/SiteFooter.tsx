import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { SiteContent } from "@/lib/site";
import { GENERAL_WHATSAPP, waLink } from "@/lib/site";

export function SiteFooter({ c }: { c: SiteContent }) {
  return (
    <>
      <footer className="bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl">{c.name}</p>
            <p className="mt-2 text-sm text-ink-foreground/75">{c.role}</p>
          </div>
          <div className="space-y-2 text-sm text-ink-foreground/85">
            <a
              className="block transition-colors hover:text-ink-foreground"
              href={waLink(GENERAL_WHATSAPP)}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
            {c.instagram && (
              <a
                className="block transition-colors hover:text-ink-foreground"
                href={c.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {c.email && (
              <a
                className="block transition-colors hover:text-ink-foreground"
                href={`mailto:${c.email}`}
              >
                {c.email}
              </a>
            )}
          </div>
          <div className="text-sm text-ink-foreground/70 md:text-right">
            <p>
              © {new Date().getFullYear()} {c.name}
            </p>
            <Link
              to="/admin"
              className="mt-2 inline-block transition-colors hover:text-ink-foreground"
            >
              Área administrativa
            </Link>
          </div>
        </div>
      </footer>
      <a
        href={waLink(GENERAL_WHATSAPP, "Olá Maria Clara! Vim pelo site.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Conversar no WhatsApp"
        className="fixed bottom-5 right-5 z-50 inline-flex h-14 items-center gap-2.5 rounded-full bg-whatsapp px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-5"
      >
        <MessageCircle className="size-5 shrink-0" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    </>
  );
}
