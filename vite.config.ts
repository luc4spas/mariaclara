import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import netlify from "@netlify/vite-plugin-tanstack-start";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Bridge public Supabase/site env vars to VITE_* at build time so client bundles
  // work even when Netlify only defines SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (or ANON_KEY).
  const supabaseUrl = (env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || "").trim();
  const supabaseKey = (
    env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
    env["SUPABASE_PUBLISHABLE_KEY"] ||
    env["VITE_SUPABASE_ANON_KEY"] ||
    env["SUPABASE_ANON_KEY"] ||
    ""
  ).trim();
  const siteUrl = (env["VITE_SITE_URL"] || env["SITE_URL"] || "").trim();

  if (supabaseUrl && !process.env["VITE_SUPABASE_URL"]) {
    process.env["VITE_SUPABASE_URL"] = supabaseUrl;
  }
  if (supabaseKey && !process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]) {
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] = supabaseKey;
  }
  if (siteUrl && !process.env["VITE_SITE_URL"]) {
    process.env["VITE_SITE_URL"] = siteUrl;
  }

  return {
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        server: { entry: "server" },
      }),
      netlify({
        dev: {
          edgeFunctions: { enabled: false },
        },
      }),
      viteReact(),
    ],
  };
});
