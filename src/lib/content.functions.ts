import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { defaultContent, type Course, type SiteContent } from "./site";

function publicClient() {
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
  if (!url || !key) {
    throw new Error(
      "Missing Supabase environment variables: SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

export const getSiteData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [{ data: content }, { data: courses }] = await Promise.all([
    sb.from("site_content").select("data").eq("id", 1).maybeSingle(),
    sb.from("courses").select("*").eq("published", true).order("sort_order"),
  ]);
  return {
    content: { ...defaultContent, ...((content?.data as Partial<SiteContent>) ?? {}) },
    courses: (courses ?? []) as unknown as Course[],
  };
});

export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: content }, { data: course }] = await Promise.all([
      sb.from("site_content").select("data").eq("id", 1).maybeSingle(),
      sb.from("courses").select("*").eq("slug", data.slug).eq("published", true).maybeSingle(),
    ]);
    return {
      content: { ...defaultContent, ...((content?.data as Partial<SiteContent>) ?? {}) },
      course: (course ?? null) as unknown as Course | null,
    };
  });
