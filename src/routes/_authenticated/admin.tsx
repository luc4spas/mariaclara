import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, ImageField, ListField, PairListField } from "@/components/admin/fields";
import {
  COURSE_STATUS,
  DEFAULT_CHECKOUT_URL,
  defaultContent,
  images,
  slugify,
  type Course,
  type SiteContent,
} from "@/lib/site";
import heroImg from "@/assets/maria-hero.jpg";
import aboutImg from "@/assets/maria-about.jpg";
import courseImg from "@/assets/course-family.jpg";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [{ title: "Painel — Administração do site" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const role = useQuery({
    queryKey: ["is-admin", user.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      return !!data;
    },
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <p className="font-display text-lg">Painel do site</p>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/" target="_blank">
                <ExternalLink /> Ver site
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut /> Sair
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">
        {role.isLoading ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : !role.data ? (
          <div className="rounded-2xl bg-card p-8">
            <h1 className="text-2xl">Acesso restrito</h1>
            <p className="mt-2 text-muted-foreground">
              Sua conta ({user.email}) não tem permissão de administração.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="content">
            <TabsList>
              <TabsTrigger value="content">Conteúdo da página</TabsTrigger>
              <TabsTrigger value="courses">Cursos</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="mt-6">
              <ContentEditor />
            </TabsContent>
            <TabsContent value="courses" className="mt-6">
              <CoursesEditor />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl bg-card p-6">
      <h2 className="text-xl">{title}</h2>
      {children}
    </section>
  );
}

function ContentEditor() {
  const qc = useQueryClient();
  const [c, setC] = useState<SiteContent | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    supabase
      .from("site_content")
      .select("data")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setC({ ...defaultContent, ...((data?.data as Partial<SiteContent>) ?? {}) });
      });
  }, []);
  if (!c) return <p className="text-muted-foreground">Carregando…</p>;
  const set =
    <K extends keyof SiteContent>(k: K) =>
    (v: SiteContent[K]) =>
      setC({ ...c, [k]: v });

  async function save() {
    setSaving(true);
    const { error } = await supabase
      .from("site_content")
      .upsert({ id: 1, data: c as never, updated_at: new Date().toISOString() });
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar.");
      return;
    }
    qc.invalidateQueries({ queryKey: ["site"] });
    toast.success("Página atualizada!");
  }

  return (
    <div className="space-y-6 pb-24">
      <Card title="Topo da página">
        <Field label="Nome" value={c.name} onChange={set("name")} />
        <Field label="Profissão / chamada curta" value={c.role} onChange={set("role")} />
        <Field label="Título principal" value={c.heroTitle} onChange={set("heroTitle")} />
        <Field label="Texto de apoio" long value={c.heroSubtitle} onChange={set("heroSubtitle")} />
        <ImageField
          label="Foto principal"
          value={c.heroImage}
          onChange={set("heroImage")}
          fallback={heroImg}
        />
        <ListField
          label="Credenciais (faixa abaixo do topo)"
          value={c.credentials}
          onChange={set("credentials")}
        />
      </Card>
      <Card title="Sobre mim">
        <Field label="Título" value={c.aboutTitle} onChange={set("aboutTitle")} />
        <Field label="Texto" long value={c.aboutText} onChange={set("aboutText")} />
        <Field label="Frase em destaque" long value={c.aboutQuote} onChange={set("aboutQuote")} />
        <ImageField
          label="Foto"
          value={c.aboutImage}
          onChange={set("aboutImage")}
          fallback={aboutImg}
        />
      </Card>
      <Card title="Propósito">
        <Field label="Título" value={c.purposeTitle} onChange={set("purposeTitle")} />
        <Field label="Texto" long value={c.purposeText} onChange={set("purposeText")} />
      </Card>
      <Card title="Palestras e experiência">
        <ListField label="Temas de palestras" value={c.talks} onChange={set("talks")} />
        <ListField label="Experiências" value={c.experience} onChange={set("experience")} />
      </Card>
      <Card title="Depoimentos">
        <PairListField
          label=""
          value={c.testimonials}
          onChange={set("testimonials")}
          keys={[
            { key: "name", label: "Nome" },
            { key: "text", label: "Depoimento", long: true },
          ]}
        />
      </Card>
      <Card title="Dúvidas frequentes">
        <PairListField
          label=""
          value={c.faq}
          onChange={set("faq")}
          keys={[
            { key: "q", label: "Pergunta" },
            { key: "a", label: "Resposta", long: true },
          ]}
        />
      </Card>
      <Card title="Contato">
        <Field
          label="WhatsApp (com DDD e país)"
          value={c.whatsapp}
          onChange={set("whatsapp")}
          hint="Ex.: 5522992413828"
        />
        <Field label="Instagram (link)" value={c.instagram} onChange={set("instagram")} />
        <Field label="E-mail" value={c.email} onChange={set("email")} />
      </Card>
      <Card title="Google e redes sociais">
        <Field
          label="Título no Google"
          value={c.seoTitle}
          onChange={set("seoTitle")}
          hint={`${c.seoTitle.length}/60 caracteres`}
        />
        <Field
          label="Descrição no Google"
          long
          value={c.seoDescription}
          onChange={set("seoDescription")}
          hint={`${c.seoDescription.length}/160 caracteres`}
        />
      </Card>
      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-background/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-5xl justify-end">
          <Button variant="hero" onClick={save} disabled={saving}>
            {saving ? "Salvando…" : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}

const emptyCourse: Omit<Course, "id"> = {
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  image_url: "",
  status: "em_breve",
  cta_label: "Garantir minha vaga",
  cta_url: DEFAULT_CHECKOUT_URL,
  price_text: "",
  learnings: [],
  audience: [],
  published: false,
  sort_order: 0,
};

function CoursesEditor() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("*").order("sort_order");
      return (data ?? []) as unknown as Course[];
    },
  });
  const [editing, setEditing] = useState<(Omit<Course, "id"> & { id?: string }) | null>(null);

  async function save() {
    if (!editing) return;
    if (!editing.title) {
      toast.error("Informe o nome do curso.");
      return;
    }
    const row = {
      ...editing,
      slug: editing.slug || slugify(editing.title),
      updated_at: new Date().toISOString(),
    };
    const { error } = editing.id
      ? await supabase
          .from("courses")
          .update(row as never)
          .eq("id", editing.id)
      : await supabase.from("courses").insert(row as never);
    if (error) {
      toast.error(
        error.code === "23505" ? "Já existe um curso com esse endereço." : "Erro ao salvar.",
      );
      return;
    }
    toast.success("Curso salvo!");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  }

  async function remove(id: string) {
    if (!confirm("Excluir este curso?")) return;
    await supabase.from("courses").delete().eq("id", id);
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin-courses"] });
  }

  if (editing) {
    const set =
      <K extends keyof Course>(k: K) =>
      (v: Course[K]) =>
        setEditing({ ...editing, [k]: v });
    return (
      <div className="space-y-6">
        <Card title={editing.id ? "Editar curso" : "Novo curso"}>
          <Field label="Nome do curso" value={editing.title} onChange={set("title")} />
          <Field
            label="Endereço da página"
            value={editing.slug}
            onChange={(v) => set("slug")(slugify(v))}
            hint={`/cursos/${editing.slug || slugify(editing.title) || "..."}`}
          />
          <Field
            label="Frase de apresentação"
            long
            value={editing.subtitle}
            onChange={set("subtitle")}
          />
          <Field
            label="Descrição completa"
            long
            value={editing.description}
            onChange={set("description")}
          />
          <ImageField
            label="Imagem"
            value={editing.image_url ?? ""}
            onChange={set("image_url")}
            fallback={courseImg}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Situação</Label>
              <Select value={editing.status} onValueChange={set("status")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COURSE_STATUS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Field
              label="Preço (texto livre)"
              value={editing.price_text}
              onChange={set("price_text")}
              hint="Ex.: 12x de R$ 49,90"
            />
            <Field label="Texto do botão" value={editing.cta_label} onChange={set("cta_label")} />
            <Field
              label="Link do botão"
              value={editing.cta_url}
              onChange={set("cta_url")}
              hint="Página de pagamento ou WhatsApp. Vazio = WhatsApp."
            />
            <Field
              label="Ordem de exibição"
              value={String(editing.sort_order)}
              onChange={(v) => set("sort_order")(Number(v) || 0)}
            />
            <div className="flex items-center gap-3 pt-6">
              <Switch checked={editing.published} onCheckedChange={set("published")} id="pub" />
              <Label htmlFor="pub">Visível no site</Label>
            </div>
          </div>
          <ListField
            label="O que você vai aprender"
            value={editing.learnings}
            onChange={set("learnings")}
          />
          <PairListField
            label="Para quem é"
            value={editing.audience}
            onChange={set("audience")}
            keys={[
              { key: "title", label: "Público" },
              { key: "text", label: "Descrição" },
            ]}
          />
        </Card>
        <div className="flex flex-wrap justify-between gap-2">
          {editing.id ? (
            <Button variant="destructive" onClick={() => remove(editing.id!)}>
              Excluir
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button variant="hero" onClick={save}>
              Salvar curso
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="hero" onClick={() => setEditing({ ...emptyCourse })}>
        <Plus /> Novo curso
      </Button>
      {(list.data ?? []).map((course) => (
        <button
          key={course.id}
          onClick={() => setEditing(course)}
          className="flex w-full items-center gap-4 rounded-2xl bg-card p-4 text-left hover:shadow-soft"
        >
          <img src={images.course(course)} alt="" className="size-16 rounded-xl object-cover" />
          <div className="flex-1">
            <p className="font-semibold">{course.title}</p>
            <p className="text-sm text-muted-foreground">
              {COURSE_STATUS[course.status]} · {course.published ? "Visível" : "Oculto"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
