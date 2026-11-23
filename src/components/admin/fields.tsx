import { useState } from "react";
import { Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function Field({ label, value, onChange, long, hint }: { label: string; value: string; onChange: (v: string) => void; long?: boolean | undefined; hint?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {long ? <Textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} /> : <Input value={value} onChange={(e) => onChange(e.target.value)} />}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ListField({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))} />
          <Button type="button" variant="ghost" size="icon" aria-label="Remover" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, ""])}>
        <Plus /> Adicionar
      </Button>
    </div>
  );
}

export function PairListField<T extends Record<string, string>>({
  label, value, onChange, keys,
}: { label: string; value: T[]; onChange: (v: T[]) => void; keys: { key: keyof T; label: string; long?: boolean }[] }) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      {value.map((item, i) => (
        <div key={i} className="space-y-2 rounded-xl border border-border p-4">
          {keys.map((k) => (
            <Field key={String(k.key)} label={k.label} long={k.long} value={item[k.key] ?? ""} onChange={(v) => onChange(value.map((it, j) => (j === i ? { ...it, [k.key]: v } : it)))} />
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            <Trash2 /> Remover
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...value, Object.fromEntries(keys.map((k) => [k.key, ""])) as T])}>
        <Plus /> Adicionar
      </Button>
    </div>
  );
}

export function ImageField({ label, value, onChange, fallback }: { label: string; value: string; onChange: (v: string) => void; fallback: string }) {
  const [busy, setBusy] = useState(false);
  async function upload(file: File) {
    setBusy(true);
    const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
    if (error) { setBusy(false); { toast.error("Não foi possível enviar a imagem."); return; } }
    const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    setBusy(false);
    if (e2 || !data) { toast.error("Erro ao gerar link da imagem."); return; }
    onChange(data.signedUrl);
    toast.success("Imagem enviada — lembre de salvar.");
  }
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-4">
        <img src={value || fallback} alt="" className="size-20 rounded-xl object-cover" />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={busy} asChild>
            <label className="cursor-pointer">
              <Upload /> {busy ? "Enviando…" : "Trocar foto"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </Button>
          {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>Usar padrão</Button>}
        </div>
      </div>
    </div>
  );
}
