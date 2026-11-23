# Maria Clara Passos — Nutricionista Clínica & Terapeuta Alimentar

Landing page institucional, vitrine de cursos com páginas dedicadas e painel administrativo (`/admin`) construídos com **TanStack Start**, **React 19**, **Tailwind CSS v4** e **Supabase**, preparados para deploy SSR no **Netlify**.

## Requisitos

- Node.js 22+
- Projeto Supabase configurado (schema inicial em `drizzle/migrations/0000_migration.sql`)

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha suas credenciais:

```sh
cp .env.example .env
```

| Variável | Onde é usada | Descrição |
| :--- | :--- | :--- |
| `SUPABASE_URL` | Servidor (SSR) | URL do projeto Supabase |
| `SUPABASE_PUBLISHABLE_KEY` | Servidor (SSR) | Chave pública (`anon` / `publishable`) do Supabase |
| `VITE_SUPABASE_URL` | Cliente | URL do projeto Supabase exposta ao navegador |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cliente | Chave pública do Supabase exposta ao navegador |
| `SITE_URL` / `VITE_SITE_URL` | SSR & SEO | Domínio público em produção (canonical, Open Graph, sitemap) |

## Desenvolvimento local

```sh
npm install
npm run dev
```

## Scripts disponíveis

- `npm run dev` — servidor de desenvolvimento com HMR e emulação local do Netlify
- `npm run build` — build de produção (SSR + assets otimizados para Netlify)
- `npm run test` — executa a suíte de testes com Vitest
- `npm run lint` — verifica regras ESLint e formatação

## Deploy no Netlify

O repositório já inclui `netlify.toml` e o plugin oficial `@netlify/vite-plugin-tanstack-start`:

1. Conecte o repositório no painel do Netlify (**Add new site → Import an existing project**).
2. O Netlify detecta automaticamente `command = "npm run build"` e `publish = "dist/client"`.
3. Configure as variáveis de ambiente listadas acima em **Site configuration → Environment variables**.
4. Faça o deploy. O conteúdo da página e os cursos podem ser editados a qualquer momento em `/admin`.
