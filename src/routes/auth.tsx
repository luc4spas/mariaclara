import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Área administrativa" },
      { name: "description", content: "Acesso à área administrativa do site." },
      { property: "og:title", content: "Área administrativa" },
      { property: "og:description", content: "Acesso restrito." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { toast.error("E-mail ou senha incorretos."); return; }
      navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Conta criada! Confirme pelo link enviado ao seu e-mail.");
      setMode("in");
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-warm px-5">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-3xl bg-card p-8 shadow-soft">
        <div>
          <p className="eyebrow">Área administrativa</p>
          <h1 className="mt-2 text-3xl">{mode === "in" ? "Entrar" : "Criar acesso"}</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Senha</Label>
          <Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="hero" className="w-full" disabled={loading}>
          {loading ? "Aguarde…" : mode === "in" ? "Entrar" : "Criar conta"}
        </Button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-foreground" onClick={() => setMode(mode === "in" ? "up" : "in")}>
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </button>
      </form>
    </div>
  );
}
