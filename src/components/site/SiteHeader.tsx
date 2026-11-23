import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FALE_COMIGO_WHATSAPP, waLink } from "@/lib/site";

const NAV_ITEMS = [
  { hash: "sobre", label: "Sobre" },
  { hash: "cursos", label: "Cursos" },
  { hash: "palestras", label: "Palestras" },
  { hash: "duvidas", label: "Dúvidas" },
] as const;

export function SiteHeader({ name }: { name: string }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="font-display text-lg font-medium tracking-tight text-foreground"
        >
          {name}
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex"
          aria-label="Principal"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.hash}
              to="/"
              hash={item.hash}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="hero" size="sm" className="px-4 sm:px-5">
            <a
              href={waLink(FALE_COMIGO_WHATSAPP, "Olá Maria Clara! Vim pelo site.")}
              target="_blank"
              rel="noopener noreferrer"
            >
              Fale comigo
            </a>
          </Button>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/80 bg-card text-foreground transition-colors hover:bg-secondary md:hidden"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Menu mobile"
          className="border-t border-border/60 bg-background/95 px-5 pb-5 pt-3 backdrop-blur-md md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.hash}>
                <Link
                  to="/"
                  hash={item.hash}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
