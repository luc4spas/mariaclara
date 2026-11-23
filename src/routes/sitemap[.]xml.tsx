import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const configuredOrigin = (
          process.env["SITE_URL"] ||
          process.env["VITE_SITE_URL"] ||
          import.meta.env?.["VITE_SITE_URL"]
        )?.replace(/\/+$/, "");
        const origin = configuredOrigin || new URL(request.url).origin;
        const url =
          process.env["SUPABASE_URL"] ||
          process.env["VITE_SUPABASE_URL"] ||
          import.meta.env?.["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ||
          process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
          process.env["SUPABASE_ANON_KEY"] ||
          process.env["VITE_SUPABASE_ANON_KEY"] ||
          import.meta.env?.["VITE_SUPABASE_PUBLISHABLE_KEY"];
        let data: { slug: string; updated_at: string }[] | null = null;
        if (url && key) {
          const sb = createClient(url, key, {
            auth: { persistSession: false },
            global: {
              fetch: (i, init) => {
                const h = new Headers(init?.headers);
                if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
                h.set("apikey", key);
                return fetch(i, { ...init, headers: h });
              },
            },
          });
          ({ data } = await sb.from("courses").select("slug, updated_at").eq("published", true));
        }
        const urls = [
          `<url><loc>${escapeXml(`${origin}/`)}</loc><priority>1.0</priority></url>`,
          ...(data ?? []).map(
            (c) =>
              `<url><loc>${escapeXml(`${origin}/cursos/${c.slug}`)}</loc><lastmod>${c.updated_at.slice(0, 10)}</lastmod></url>`,
          ),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
            "Netlify-CDN-Cache-Control":
              "public, durable, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
